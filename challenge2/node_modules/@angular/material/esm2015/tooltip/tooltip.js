import { AriaDescriber, FocusMonitor } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { ESCAPE, hasModifierKey } from '@angular/cdk/keycodes';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Overlay, } from '@angular/cdk/overlay';
import { Platform, normalizePassiveListenerOptions } from '@angular/cdk/platform';
import { ComponentPortal } from '@angular/cdk/portal';
import { ScrollDispatcher } from '@angular/cdk/scrolling';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Directive, ElementRef, Inject, InjectionToken, Input, NgZone, Optional, ViewContainerRef, ViewEncapsulation, } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { matTooltipAnimations } from './tooltip-animations';
/** Time in ms to throttle repositioning after scroll events. */
export const SCROLL_THROTTLE_MS = 20;
/**
 * CSS class that will be attached to the overlay panel.
 * @deprecated
 * @breaking-change 13.0.0 remove this variable
 */
export const TOOLTIP_PANEL_CLASS = 'mat-tooltip-panel';
const PANEL_CLASS = 'tooltip-panel';
/** Options used to bind passive event listeners. */
const passiveListenerOptions = normalizePassiveListenerOptions({ passive: true });
/**
 * Time between the user putting the pointer on a tooltip
 * trigger and the long press event being fired.
 */
const LONGPRESS_DELAY = 500;
/**
 * Creates an error to be thrown if the user supplied an invalid tooltip position.
 * @docs-private
 */
export function getMatTooltipInvalidPositionError(position) {
    return Error(`Tooltip position "${position}" is invalid.`);
}
/** Injection token that determines the scroll handling while a tooltip is visible. */
export const MAT_TOOLTIP_SCROLL_STRATEGY = new InjectionToken('mat-tooltip-scroll-strategy');
/** @docs-private */
export function MAT_TOOLTIP_SCROLL_STRATEGY_FACTORY(overlay) {
    return () => overlay.scrollStrategies.reposition({ scrollThrottle: SCROLL_THROTTLE_MS });
}
/** @docs-private */
export const MAT_TOOLTIP_SCROLL_STRATEGY_FACTORY_PROVIDER = {
    provide: MAT_TOOLTIP_SCROLL_STRATEGY,
    deps: [Overlay],
    useFactory: MAT_TOOLTIP_SCROLL_STRATEGY_FACTORY,
};
/** Injection token to be used to override the default options for `matTooltip`. */
export const MAT_TOOLTIP_DEFAULT_OPTIONS = new InjectionToken('mat-tooltip-default-options', {
    providedIn: 'root',
    factory: MAT_TOOLTIP_DEFAULT_OPTIONS_FACTORY
});
/** @docs-private */
export function MAT_TOOLTIP_DEFAULT_OPTIONS_FACTORY() {
    return {
        showDelay: 0,
        hideDelay: 0,
        touchendHideDelay: 1500,
    };
}
export class _MatTooltipBase {
    constructor(_overlay, _elementRef, _scrollDispatcher, _viewContainerRef, _ngZone, _platform, _ariaDescriber, _focusMonitor, scrollStrategy, _dir, _defaultOptions, _document) {
        this._overlay = _overlay;
        this._elementRef = _elementRef;
        this._scrollDispatcher = _scrollDispatcher;
        this._viewContainerRef = _viewContainerRef;
        this._ngZone = _ngZone;
        this._platform = _platform;
        this._ariaDescriber = _ariaDescriber;
        this._focusMonitor = _focusMonitor;
        this._dir = _dir;
        this._defaultOptions = _defaultOptions;
        this._position = 'below';
        this._disabled = false;
        this._viewInitialized = false;
        this._pointerExitEventsInitialized = false;
        this._viewportMargin = 8;
        this._cssClassPrefix = 'mat';
        /** The default delay in ms before showing the tooltip after show is called */
        this.showDelay = this._defaultOptions.showDelay;
        /** The default delay in ms before hiding the tooltip after hide is called */
        this.hideDelay = this._defaultOptions.hideDelay;
        /**
         * How touch gestures should be handled by the tooltip. On touch devices the tooltip directive
         * uses a long press gesture to show and hide, however it can conflict with the native browser
         * gestures. To work around the conflict, Angular Material disables native gestures on the
         * trigger, but that might not be desirable on particular elements (e.g. inputs and draggable
         * elements). The different values for this option configure the touch event handling as follows:
         * - `auto` - Enables touch gestures for all elements, but tries to avoid conflicts with native
         *   browser gestures on particular elements. In particular, it allows text selection on inputs
         *   and textareas, and preserves the native browser dragging on elements marked as `draggable`.
         * - `on` - Enables touch gestures for all elements and disables native
         *   browser gestures with no exceptions.
         * - `off` - Disables touch gestures. Note that this will prevent the tooltip from
         *   showing on touch devices.
         */
        this.touchGestures = 'auto';
        this._message = '';
        /** Manually-bound passive event listeners. */
        this._passiveListeners = [];
        /** Emits when the component is destroyed. */
        this._destroyed = new Subject();
        /**
         * Handles the keydown events on the host element.
         * Needs to be an arrow function so that we can use it in addEventListener.
         */
        this._handleKeydown = (event) => {
            if (this._isTooltipVisible() && event.keyCode === ESCAPE && !hasModifierKey(event)) {
                event.preventDefault();
                event.stopPropagation();
                this._ngZone.run(() => this.hide(0));
            }
        };
        this._scrollStrategy = scrollStrategy;
        this._document = _document;
        if (_defaultOptions) {
            if (_defaultOptions.position) {
                this.position = _defaultOptions.position;
            }
            if (_defaultOptions.touchGestures) {
                this.touchGestures = _defaultOptions.touchGestures;
            }
        }
        _dir.change.pipe(takeUntil(this._destroyed)).subscribe(() => {
            if (this._overlayRef) {
                this._updatePosition(this._overlayRef);
            }
        });
        _ngZone.runOutsideAngular(() => {
            _elementRef.nativeElement.addEventListener('keydown', this._handleKeydown);
        });
    }
    /** Allows the user to define the position of the tooltip relative to the parent element */
    get position() { return this._position; }
    set position(value) {
        var _a;
        if (value !== this._position) {
            this._position = value;
            if (this._overlayRef) {
                this._updatePosition(this._overlayRef);
                (_a = this._tooltipInstance) === null || _a === void 0 ? void 0 : _a.show(0);
                this._overlayRef.updatePosition();
            }
        }
    }
    /** Disables the display of the tooltip. */
    get disabled() { return this._disabled; }
    set disabled(value) {
        this._disabled = coerceBooleanProperty(value);
        // If tooltip is disabled, hide immediately.
        if (this._disabled) {
            this.hide(0);
        }
        else {
            this._setupPointerEnterEventsIfNeeded();
        }
    }
    /** The message to be displayed in the tooltip */
    get message() { return this._message; }
    set message(value) {
        this._ariaDescriber.removeDescription(this._elementRef.nativeElement, this._message, 'tooltip');
        // If the message is not a string (e.g. number), convert it to a string and trim it.
        // Must convert with `String(value)`, not `${value}`, otherwise Closure Compiler optimises
        // away the string-conversion: https://github.com/angular/components/issues/20684
        this._message = value != null ? String(value).trim() : '';
        if (!this._message && this._isTooltipVisible()) {
            this.hide(0);
        }
        else {
            this._setupPointerEnterEventsIfNeeded();
            this._updateTooltipMessage();
            this._ngZone.runOutsideAngular(() => {
                // The `AriaDescriber` has some functionality that avoids adding a description if it's the
                // same as the `aria-label` of an element, however we can't know whether the tooltip trigger
                // has a data-bound `aria-label` or when it'll be set for the first time. We can avoid the
                // issue by deferring the description by a tick so Angular has time to set the `aria-label`.
                Promise.resolve().then(() => {
                    this._ariaDescriber.describe(this._elementRef.nativeElement, this.message, 'tooltip');
                });
            });
        }
    }
    /** Classes to be passed to the tooltip. Supports the same syntax as `ngClass`. */
    get tooltipClass() { return this._tooltipClass; }
    set tooltipClass(value) {
        this._tooltipClass = value;
        if (this._tooltipInstance) {
            this._setTooltipClass(this._tooltipClass);
        }
    }
    ngAfterViewInit() {
        // This needs to happen after view init so the initial values for all inputs have been set.
        this._viewInitialized = true;
        this._setupPointerEnterEventsIfNeeded();
        this._focusMonitor.monitor(this._elementRef)
            .pipe(takeUntil(this._destroyed))
            .subscribe(origin => {
            // Note that the focus monitor runs outside the Angular zone.
            if (!origin) {
                this._ngZone.run(() => this.hide(0));
            }
            else if (origin === 'keyboard') {
                this._ngZone.run(() => this.show());
            }
        });
    }
    /**
     * Dispose the tooltip when destroyed.
     */
    ngOnDestroy() {
        const nativeElement = this._elementRef.nativeElement;
        clearTimeout(this._touchstartTimeout);
        if (this._overlayRef) {
            this._overlayRef.dispose();
            this._tooltipInstance = null;
        }
        // Clean up the event listeners set in the constructor
        nativeElement.removeEventListener('keydown', this._handleKeydown);
        this._passiveListeners.forEach(([event, listener]) => {
            nativeElement.removeEventListener(event, listener, passiveListenerOptions);
        });
        this._passiveListeners.length = 0;
        this._destroyed.next();
        this._destroyed.complete();
        this._ariaDescriber.removeDescription(nativeElement, this.message, 'tooltip');
        this._focusMonitor.stopMonitoring(nativeElement);
    }
    /** Shows the tooltip after the delay in ms, defaults to tooltip-delay-show or 0ms if no input */
    show(delay = this.showDelay) {
        if (this.disabled || !this.message || (this._isTooltipVisible() &&
            !this._tooltipInstance._showTimeoutId && !this._tooltipInstance._hideTimeoutId)) {
            return;
        }
        const overlayRef = this._createOverlay();
        this._detach();
        this._portal = this._portal ||
            new ComponentPortal(this._tooltipComponent, this._viewContainerRef);
        this._tooltipInstance = overlayRef.attach(this._portal).instance;
        this._tooltipInstance.afterHidden()
            .pipe(takeUntil(this._destroyed))
            .subscribe(() => this._detach());
        this._setTooltipClass(this._tooltipClass);
        this._updateTooltipMessage();
        this._tooltipInstance.show(delay);
    }
    /** Hides the tooltip after the delay in ms, defaults to tooltip-delay-hide or 0ms if no input */
    hide(delay = this.hideDelay) {
        if (this._tooltipInstance) {
            this._tooltipInstance.hide(delay);
        }
    }
    /** Shows/hides the tooltip */
    toggle() {
        this._isTooltipVisible() ? this.hide() : this.show();
    }
    /** Returns true if the tooltip is currently visible to the user */
    _isTooltipVisible() {
        return !!this._tooltipInstance && this._tooltipInstance.isVisible();
    }
    /** Create the overlay config and position strategy */
    _createOverlay() {
        if (this._overlayRef) {
            return this._overlayRef;
        }
        const scrollableAncestors = this._scrollDispatcher.getAncestorScrollContainers(this._elementRef);
        // Create connected position strategy that listens for scroll events to reposition.
        const strategy = this._overlay.position()
            .flexibleConnectedTo(this._elementRef)
            .withTransformOriginOn(`.${this._cssClassPrefix}-tooltip`)
            .withFlexibleDimensions(false)
            .withViewportMargin(this._viewportMargin)
            .withScrollableContainers(scrollableAncestors);
        strategy.positionChanges.pipe(takeUntil(this._destroyed)).subscribe(change => {
            this._updateCurrentPositionClass(change.connectionPair);
            if (this._tooltipInstance) {
                if (change.scrollableViewProperties.isOverlayClipped && this._tooltipInstance.isVisible()) {
                    // After position changes occur and the overlay is clipped by
                    // a parent scrollable then close the tooltip.
                    this._ngZone.run(() => this.hide(0));
                }
            }
        });
        this._overlayRef = this._overlay.create({
            direction: this._dir,
            positionStrategy: strategy,
            panelClass: `${this._cssClassPrefix}-${PANEL_CLASS}`,
            scrollStrategy: this._scrollStrategy()
        });
        this._updatePosition(this._overlayRef);
        this._overlayRef.detachments()
            .pipe(takeUntil(this._destroyed))
            .subscribe(() => this._detach());
        return this._overlayRef;
    }
    /** Detaches the currently-attached tooltip. */
    _detach() {
        if (this._overlayRef && this._overlayRef.hasAttached()) {
            this._overlayRef.detach();
        }
        this._tooltipInstance = null;
    }
    /** Updates the position of the current tooltip. */
    _updatePosition(overlayRef) {
        const position = overlayRef.getConfig().positionStrategy;
        const origin = this._getOrigin();
        const overlay = this._getOverlayPosition();
        position.withPositions([
            this._addOffset(Object.assign(Object.assign({}, origin.main), overlay.main)),
            this._addOffset(Object.assign(Object.assign({}, origin.fallback), overlay.fallback))
        ]);
    }
    /** Adds the configured offset to a position. Used as a hook for child classes. */
    _addOffset(position) {
        return position;
    }
    /**
     * Returns the origin position and a fallback position based on the user's position preference.
     * The fallback position is the inverse of the origin (e.g. `'below' -> 'above'`).
     */
    _getOrigin() {
        const isLtr = !this._dir || this._dir.value == 'ltr';
        const position = this.position;
        let originPosition;
        if (position == 'above' || position == 'below') {
            originPosition = { originX: 'center', originY: position == 'above' ? 'top' : 'bottom' };
        }
        else if (position == 'before' ||
            (position == 'left' && isLtr) ||
            (position == 'right' && !isLtr)) {
            originPosition = { originX: 'start', originY: 'center' };
        }
        else if (position == 'after' ||
            (position == 'right' && isLtr) ||
            (position == 'left' && !isLtr)) {
            originPosition = { originX: 'end', originY: 'center' };
        }
        else if (typeof ngDevMode === 'undefined' || ngDevMode) {
            throw getMatTooltipInvalidPositionError(position);
        }
        const { x, y } = this._invertPosition(originPosition.originX, originPosition.originY);
        return {
            main: originPosition,
            fallback: { originX: x, originY: y }
        };
    }
    /** Returns the overlay position and a fallback position based on the user's preference */
    _getOverlayPosition() {
        const isLtr = !this._dir || this._dir.value == 'ltr';
        const position = this.position;
        let overlayPosition;
        if (position == 'above') {
            overlayPosition = { overlayX: 'center', overlayY: 'bottom' };
        }
        else if (position == 'below') {
            overlayPosition = { overlayX: 'center', overlayY: 'top' };
        }
        else if (position == 'before' ||
            (position == 'left' && isLtr) ||
            (position == 'right' && !isLtr)) {
            overlayPosition = { overlayX: 'end', overlayY: 'center' };
        }
        else if (position == 'after' ||
            (position == 'right' && isLtr) ||
            (position == 'left' && !isLtr)) {
            overlayPosition = { overlayX: 'start', overlayY: 'center' };
        }
        else if (typeof ngDevMode === 'undefined' || ngDevMode) {
            throw getMatTooltipInvalidPositionError(position);
        }
        const { x, y } = this._invertPosition(overlayPosition.overlayX, overlayPosition.overlayY);
        return {
            main: overlayPosition,
            fallback: { overlayX: x, overlayY: y }
        };
    }
    /** Updates the tooltip message and repositions the overlay according to the new message length */
    _updateTooltipMessage() {
        // Must wait for the message to be painted to the tooltip so that the overlay can properly
        // calculate the correct positioning based on the size of the text.
        if (this._tooltipInstance) {
            this._tooltipInstance.message = this.message;
            this._tooltipInstance._markForCheck();
            this._ngZone.onMicrotaskEmpty.pipe(take(1), takeUntil(this._destroyed)).subscribe(() => {
                if (this._tooltipInstance) {
                    this._overlayRef.updatePosition();
                }
            });
        }
    }
    /** Updates the tooltip class */
    _setTooltipClass(tooltipClass) {
        if (this._tooltipInstance) {
            this._tooltipInstance.tooltipClass = tooltipClass;
            this._tooltipInstance._markForCheck();
        }
    }
    /** Inverts an overlay position. */
    _invertPosition(x, y) {
        if (this.position === 'above' || this.position === 'below') {
            if (y === 'top') {
                y = 'bottom';
            }
            else if (y === 'bottom') {
                y = 'top';
            }
        }
        else {
            if (x === 'end') {
                x = 'start';
            }
            else if (x === 'start') {
                x = 'end';
            }
        }
        return { x, y };
    }
    /** Updates the class on the overlay panel based on the current position of the tooltip. */
    _updateCurrentPositionClass(connectionPair) {
        const { overlayY, originX, originY } = connectionPair;
        let newPosition;
        // If the overlay is in the middle along the Y axis,
        // it means that it's either before or after.
        if (overlayY === 'center') {
            // Note that since this information is used for styling, we want to
            // resolve `start` and `end` to their real values, otherwise consumers
            // would have to remember to do it themselves on each consumption.
            if (this._dir && this._dir.value === 'rtl') {
                newPosition = originX === 'end' ? 'left' : 'right';
            }
            else {
                newPosition = originX === 'start' ? 'left' : 'right';
            }
        }
        else {
            newPosition = overlayY === 'bottom' && originY === 'top' ? 'above' : 'below';
        }
        if (newPosition !== this._currentPosition) {
            const overlayRef = this._overlayRef;
            if (overlayRef) {
                const classPrefix = `${this._cssClassPrefix}-${PANEL_CLASS}-`;
                overlayRef.removePanelClass(classPrefix + this._currentPosition);
                overlayRef.addPanelClass(classPrefix + newPosition);
            }
            this._currentPosition = newPosition;
        }
    }
    /** Binds the pointer events to the tooltip trigger. */
    _setupPointerEnterEventsIfNeeded() {
        // Optimization: Defer hooking up events if there's no message or the tooltip is disabled.
        if (this._disabled || !this.message || !this._viewInitialized ||
            this._passiveListeners.length) {
            return;
        }
        // The mouse events shouldn't be bound on mobile devices, because they can prevent the
        // first tap from firing its click event or can cause the tooltip to open for clicks.
        if (this._platformSupportsMouseEvents()) {
            this._passiveListeners
                .push(['mouseenter', () => {
                    this._setupPointerExitEventsIfNeeded();
                    this.show();
                }]);
        }
        else if (this.touchGestures !== 'off') {
            this._disableNativeGesturesIfNecessary();
            this._passiveListeners
                .push(['touchstart', () => {
                    // Note that it's important that we don't `preventDefault` here,
                    // because it can prevent click events from firing on the element.
                    this._setupPointerExitEventsIfNeeded();
                    clearTimeout(this._touchstartTimeout);
                    this._touchstartTimeout = setTimeout(() => this.show(), LONGPRESS_DELAY);
                }]);
        }
        this._addListeners(this._passiveListeners);
    }
    _setupPointerExitEventsIfNeeded() {
        if (this._pointerExitEventsInitialized) {
            return;
        }
        this._pointerExitEventsInitialized = true;
        const exitListeners = [];
        if (this._platformSupportsMouseEvents()) {
            exitListeners.push(['mouseleave', () => this.hide()], ['wheel', event => this._wheelListener(event)]);
        }
        else if (this.touchGestures !== 'off') {
            this._disableNativeGesturesIfNecessary();
            const touchendListener = () => {
                clearTimeout(this._touchstartTimeout);
                this.hide(this._defaultOptions.touchendHideDelay);
            };
            exitListeners.push(['touchend', touchendListener], ['touchcancel', touchendListener]);
        }
        this._addListeners(exitListeners);
        this._passiveListeners.push(...exitListeners);
    }
    _addListeners(listeners) {
        listeners.forEach(([event, listener]) => {
            this._elementRef.nativeElement.addEventListener(event, listener, passiveListenerOptions);
        });
    }
    _platformSupportsMouseEvents() {
        return !this._platform.IOS && !this._platform.ANDROID;
    }
    /** Listener for the `wheel` event on the element. */
    _wheelListener(event) {
        if (this._isTooltipVisible()) {
            const elementUnderPointer = this._document.elementFromPoint(event.clientX, event.clientY);
            const element = this._elementRef.nativeElement;
            // On non-touch devices we depend on the `mouseleave` event to close the tooltip, but it
            // won't fire if the user scrolls away using the wheel without moving their cursor. We
            // work around it by finding the element under the user's cursor and closing the tooltip
            // if it's not the trigger.
            if (elementUnderPointer !== element && !element.contains(elementUnderPointer)) {
                this.hide();
            }
        }
    }
    /** Disables the native browser gestures, based on how the tooltip has been configured. */
    _disableNativeGesturesIfNecessary() {
        const gestures = this.touchGestures;
        if (gestures !== 'off') {
            const element = this._elementRef.nativeElement;
            const style = element.style;
            // If gestures are set to `auto`, we don't disable text selection on inputs and
            // textareas, because it prevents the user from typing into them on iOS Safari.
            if (gestures === 'on' || (element.nodeName !== 'INPUT' && element.nodeName !== 'TEXTAREA')) {
                style.userSelect = style.msUserSelect = style.webkitUserSelect =
                    style.MozUserSelect = 'none';
            }
            // If we have `auto` gestures and the element uses native HTML dragging,
            // we don't set `-webkit-user-drag` because it prevents the native behavior.
            if (gestures === 'on' || !element.draggable) {
                style.webkitUserDrag = 'none';
            }
            style.touchAction = 'none';
            style.webkitTapHighlightColor = 'transparent';
        }
    }
}
_MatTooltipBase.decorators = [
    { type: Directive }
];
_MatTooltipBase.ctorParameters = () => [
    { type: Overlay },
    { type: ElementRef },
    { type: ScrollDispatcher },
    { type: ViewContainerRef },
    { type: NgZone },
    { type: Platform },
    { type: AriaDescriber },
    { type: FocusMonitor },
    { type: undefined },
    { type: Directionality },
    { type: undefined },
    { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] }] }
];
_MatTooltipBase.propDecorators = {
    position: [{ type: Input, args: ['matTooltipPosition',] }],
    disabled: [{ type: Input, args: ['matTooltipDisabled',] }],
    showDelay: [{ type: Input, args: ['matTooltipShowDelay',] }],
    hideDelay: [{ type: Input, args: ['matTooltipHideDelay',] }],
    touchGestures: [{ type: Input, args: ['matTooltipTouchGestures',] }],
    message: [{ type: Input, args: ['matTooltip',] }],
    tooltipClass: [{ type: Input, args: ['matTooltipClass',] }]
};
/**
 * Directive that attaches a material design tooltip to the host element. Animates the showing and
 * hiding of a tooltip provided position (defaults to below the element).
 *
 * https://material.io/design/components/tooltips.html
 */
export class MatTooltip extends _MatTooltipBase {
    constructor(overlay, elementRef, scrollDispatcher, viewContainerRef, ngZone, platform, ariaDescriber, focusMonitor, scrollStrategy, dir, defaultOptions, _document) {
        super(overlay, elementRef, scrollDispatcher, viewContainerRef, ngZone, platform, ariaDescriber, focusMonitor, scrollStrategy, dir, defaultOptions, _document);
        this._tooltipComponent = TooltipComponent;
    }
}
MatTooltip.decorators = [
    { type: Directive, args: [{
                selector: '[matTooltip]',
                exportAs: 'matTooltip',
                host: {
                    'class': 'mat-tooltip-trigger'
                }
            },] }
];
MatTooltip.ctorParameters = () => [
    { type: Overlay },
    { type: ElementRef },
    { type: ScrollDispatcher },
    { type: ViewContainerRef },
    { type: NgZone },
    { type: Platform },
    { type: AriaDescriber },
    { type: FocusMonitor },
    { type: undefined, decorators: [{ type: Inject, args: [MAT_TOOLTIP_SCROLL_STRATEGY,] }] },
    { type: Directionality, decorators: [{ type: Optional }] },
    { type: undefined, decorators: [{ type: Optional }, { type: Inject, args: [MAT_TOOLTIP_DEFAULT_OPTIONS,] }] },
    { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] }] }
];
export class _TooltipComponentBase {
    constructor(_changeDetectorRef) {
        this._changeDetectorRef = _changeDetectorRef;
        /** Property watched by the animation framework to show or hide the tooltip */
        this._visibility = 'initial';
        /** Whether interactions on the page should close the tooltip */
        this._closeOnInteraction = false;
        /** Subject for notifying that the tooltip has been hidden from the view */
        this._onHide = new Subject();
    }
    /**
     * Shows the tooltip with an animation originating from the provided origin
     * @param delay Amount of milliseconds to the delay showing the tooltip.
     */
    show(delay) {
        // Cancel the delayed hide if it is scheduled
        clearTimeout(this._hideTimeoutId);
        // Body interactions should cancel the tooltip if there is a delay in showing.
        this._closeOnInteraction = true;
        this._showTimeoutId = setTimeout(() => {
            this._visibility = 'visible';
            this._showTimeoutId = undefined;
            // Mark for check so if any parent component has set the
            // ChangeDetectionStrategy to OnPush it will be checked anyways
            this._markForCheck();
        }, delay);
    }
    /**
     * Begins the animation to hide the tooltip after the provided delay in ms.
     * @param delay Amount of milliseconds to delay showing the tooltip.
     */
    hide(delay) {
        // Cancel the delayed show if it is scheduled
        clearTimeout(this._showTimeoutId);
        this._hideTimeoutId = setTimeout(() => {
            this._visibility = 'hidden';
            this._hideTimeoutId = undefined;
            // Mark for check so if any parent component has set the
            // ChangeDetectionStrategy to OnPush it will be checked anyways
            this._markForCheck();
        }, delay);
    }
    /** Returns an observable that notifies when the tooltip has been hidden from view. */
    afterHidden() {
        return this._onHide;
    }
    /** Whether the tooltip is being displayed. */
    isVisible() {
        return this._visibility === 'visible';
    }
    ngOnDestroy() {
        clearTimeout(this._showTimeoutId);
        clearTimeout(this._hideTimeoutId);
        this._onHide.complete();
    }
    _animationStart() {
        this._closeOnInteraction = false;
    }
    _animationDone(event) {
        const toState = event.toState;
        if (toState === 'hidden' && !this.isVisible()) {
            this._onHide.next();
        }
        if (toState === 'visible' || toState === 'hidden') {
            this._closeOnInteraction = true;
        }
    }
    /**
     * Interactions on the HTML body should close the tooltip immediately as defined in the
     * material design spec.
     * https://material.io/design/components/tooltips.html#behavior
     */
    _handleBodyInteraction() {
        if (this._closeOnInteraction) {
            this.hide(0);
        }
    }
    /**
     * Marks that the tooltip needs to be checked in the next change detection run.
     * Mainly used for rendering the initial text before positioning a tooltip, which
     * can be problematic in components with OnPush change detection.
     */
    _markForCheck() {
        this._changeDetectorRef.markForCheck();
    }
}
_TooltipComponentBase.decorators = [
    { type: Directive }
];
_TooltipComponentBase.ctorParameters = () => [
    { type: ChangeDetectorRef }
];
/**
 * Internal component that wraps the tooltip's content.
 * @docs-private
 */
export class TooltipComponent extends _TooltipComponentBase {
    constructor(changeDetectorRef, _breakpointObserver) {
        super(changeDetectorRef);
        this._breakpointObserver = _breakpointObserver;
        /** Stream that emits whether the user has a handset-sized display.  */
        this._isHandset = this._breakpointObserver.observe(Breakpoints.Handset);
    }
}
TooltipComponent.decorators = [
    { type: Component, args: [{
                selector: 'mat-tooltip-component',
                template: "<div class=\"mat-tooltip\"\n     [ngClass]=\"tooltipClass\"\n     [class.mat-tooltip-handset]=\"(_isHandset | async)?.matches\"\n     [@state]=\"_visibility\"\n     (@state.start)=\"_animationStart()\"\n     (@state.done)=\"_animationDone($event)\">{{message}}</div>\n",
                encapsulation: ViewEncapsulation.None,
                changeDetection: ChangeDetectionStrategy.OnPush,
                animations: [matTooltipAnimations.tooltipState],
                host: {
                    // Forces the element to have a layout in IE and Edge. This fixes issues where the element
                    // won't be rendered if the animations are disabled or there is no web animations polyfill.
                    '[style.zoom]': '_visibility === "visible" ? 1 : null',
                    '(body:click)': 'this._handleBodyInteraction()',
                    '(body:auxclick)': 'this._handleBodyInteraction()',
                    'aria-hidden': 'true',
                },
                styles: [".mat-tooltip-panel{pointer-events:none !important}.mat-tooltip{color:#fff;border-radius:4px;margin:14px;max-width:250px;padding-left:8px;padding-right:8px;overflow:hidden;text-overflow:ellipsis}.cdk-high-contrast-active .mat-tooltip{outline:solid 1px}.mat-tooltip-handset{margin:24px;padding-left:16px;padding-right:16px}\n"]
            },] }
];
TooltipComponent.ctorParameters = () => [
    { type: ChangeDetectorRef },
    { type: BreakpointObserver }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9vbHRpcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC90b29sdGlwL3Rvb2x0aXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBUUEsT0FBTyxFQUFDLGFBQWEsRUFBRSxZQUFZLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUM5RCxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDakQsT0FBTyxFQUFlLHFCQUFxQixFQUFjLE1BQU0sdUJBQXVCLENBQUM7QUFDdkYsT0FBTyxFQUFDLE1BQU0sRUFBRSxjQUFjLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUM3RCxPQUFPLEVBQUMsa0JBQWtCLEVBQUUsV0FBVyxFQUFrQixNQUFNLHFCQUFxQixDQUFDO0FBQ3JGLE9BQU8sRUFLTCxPQUFPLEdBTVIsTUFBTSxzQkFBc0IsQ0FBQztBQUM5QixPQUFPLEVBQUMsUUFBUSxFQUFFLCtCQUErQixFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDaEYsT0FBTyxFQUFDLGVBQWUsRUFBZ0IsTUFBTSxxQkFBcUIsQ0FBQztBQUNuRSxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUN4RCxPQUFPLEVBQ0wsdUJBQXVCLEVBQ3ZCLGlCQUFpQixFQUNqQixTQUFTLEVBQ1QsU0FBUyxFQUNULFVBQVUsRUFDVixNQUFNLEVBQ04sY0FBYyxFQUNkLEtBQUssRUFDTCxNQUFNLEVBRU4sUUFBUSxFQUNSLGdCQUFnQixFQUNoQixpQkFBaUIsR0FFbEIsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQ3pDLE9BQU8sRUFBYSxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDekMsT0FBTyxFQUFDLElBQUksRUFBRSxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUUvQyxPQUFPLEVBQUMsb0JBQW9CLEVBQUMs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QW1CLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQU1oRyxDQUFDOzs7WUF4QkYsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSx1QkFBdUI7Z0JBQ2pDLHdSQUEyQjtnQkFFM0IsYUFBYSxFQUFFLGlCQUFpQixDQUFDLElBQUk7Z0JBQ3JDLGVBQWUsRUFBRSx1QkFBdUIsQ0FBQyxNQUFNO2dCQUMvQyxVQUFVLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQyxZQUFZLENBQUM7Z0JBQy9DLElBQUksRUFBRTtvQkFDSiwwRkFBMEY7b0JBQzFGLDJGQUEyRjtvQkFDM0YsY0FBYyxFQUFFLHNDQUFzQztvQkFDdEQsY0FBYyxFQUFFLCtCQUErQjtvQkFDL0MsaUJBQWlCLEVBQUUsK0JBQStCO29CQUNsRCxhQUFhLEVBQUUsTUFBTTtpQkFDdEI7O2FBQ0Y7OztZQTUxQkMsaUJBQWlCO1lBbEJYLGtCQUFrQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtBbmltYXRpb25FdmVudH0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XG5pbXBvcnQge0FyaWFEZXNjcmliZXIsIEZvY3VzTW9uaXRvcn0gZnJvbSAnQGFuZ3VsYXIvY2RrL2ExMXknO1xuaW1wb3J0IHtEaXJlY3Rpb25hbGl0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuaW1wb3J0IHtCb29sZWFuSW5wdXQsIGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSwgTnVtYmVySW5wdXR9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5pbXBvcnQge0VTQ0FQRSwgaGFzTW9kaWZpZXJLZXl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9rZXljb2Rlcyc7XG5pbXBvcnQge0JyZWFrcG9pbnRPYnNlcnZlciwgQnJlYWtwb2ludHMsIEJyZWFrcG9pbnRTdGF0ZX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2xheW91dCc7XG5pbXBvcnQge1xuICBDb25uZWN0ZWRQb3NpdGlvbixcbiAgRmxleGlibGVDb25uZWN0ZWRQb3NpdGlvblN0cmF0ZWd5LFxuICBIb3Jpem9udGFsQ29ubmVjdGlvblBvcyxcbiAgT3JpZ2luQ29ubmVjdGlvblBvc2l0aW9uLFxuICBPdmVybGF5LFxuICBPdmVybGF5Q29ubmVjdGlvblBvc2l0aW9uLFxuICBPdmVybGF5UmVmLFxuICBTY3JvbGxTdHJhdGVneSxcbiAgVmVydGljYWxDb25uZWN0aW9uUG9zLFxuICBDb25uZWN0aW9uUG9zaXRpb25QYWlyLFxufSBmcm9tICdAYW5ndWxhci9jZGsvb3ZlcmxheSc7XG5pbXBvcnQge1BsYXRmb3JtLCBub3JtYWxpemVQYXNzaXZlTGlzdGVuZXJPcHRpb25zfSBmcm9tICdAYW5ndWxhci9jZGsvcGxhdGZvcm0nO1xuaW1wb3J0IHtDb21wb25lbnRQb3J0YWwsIENvbXBvbmVudFR5cGV9IGZyb20gJ0Bhbmd1bGFyL2Nkay9wb3J0YWwnO1xuaW1wb3J0IHtTY3JvbGxEaXNwYXRjaGVyfSBmcm9tICdAYW5ndWxhci9jZGsvc2Nyb2xsaW5nJztcbmltcG9ydCB7XG4gIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxuICBDaGFuZ2VEZXRlY3RvclJlZixcbiAgQ29tcG9uZW50LFxuICBEaXJlY3RpdmUsXG4gIEVsZW1lbnRSZWYsXG4gIEluamVjdCxcbiAgSW5qZWN0aW9uVG9rZW4sXG4gIElucHV0LFxuICBOZ1pvbmUsXG4gIE9uRGVzdHJveSxcbiAgT3B0aW9uYWwsXG4gIFZpZXdDb250YWluZXJSZWYsXG4gIFZpZXdFbmNhcHN1bGF0aW9uLFxuICBBZnRlclZpZXdJbml0LFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7RE9DVU1FTlR9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge09ic2VydmFibGUsIFN1YmplY3R9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHt0YWtlLCB0YWtlVW50aWx9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuaW1wb3J0IHttYXRUb29sdGlwQW5pbWF0aW9uc30gZnJvbSAnLi90b29sdGlwLWFuaW1hdGlvbnMnO1xuXG5cbi8qKiBQb3NzaWJsZSBwb3NpdGlvbnMgZm9yIGEgdG9vbHRpcC4gKi9cbmV4cG9ydCB0eXBlIFRvb2x0aXBQb3NpdGlvbiA9ICdsZWZ0JyB8ICdyaWdodCcgfCAnYWJvdmUnIHwgJ2JlbG93JyB8ICdiZWZvcmUnIHwgJ2FmdGVyJztcblxuLyoqXG4gKiBPcHRpb25zIGZvciBob3cgdGhlIHRvb2x0aXAgdHJpZ2dlciBzaG91bGQgaGFuZGxlIHRvdWNoIGdlc3R1cmVzLlxuICogU2VlIGBNYXRUb29sdGlwLnRvdWNoR2VzdHVyZXNgIGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICovXG5leHBvcnQgdHlwZSBUb29sdGlwVG91Y2hHZXN0dXJlcyA9ICdhdXRvJyB8ICdvbicgfCAnb2ZmJztcblxuLyoqIFBvc3NpYmxlIHZpc2liaWxpdHkgc3RhdGVzIG9mIGEgdG9vbHRpcC4gKi9cbmV4cG9ydCB0eXBlIFRvb2x0aXBWaXNpYmlsaXR5ID0gJ2luaXRpYWwnIHwgJ3Zpc2libGUnIHwgJ2hpZGRlbic7XG5cbi8qKiBUaW1lIGluIG1zIHRvIHRocm90dGxlIHJlcG9zaXRpb25pbmcgYWZ0ZXIgc2Nyb2xsIGV2ZW50cy4gKi9cbmV4cG9ydCBjb25zdCBTQ1JPTExfVEhST1RUTEVfTVMgPSAyMDtcblxuLyoqXG4gKiBDU1MgY2xhc3MgdGhhdCB3aWxsIGJlIGF0dGFjaGVkIHRvIHRoZSBvdmVybGF5IHBhbmVsLlxuICogQGRlcHJlY2F0ZWRcbiAqIEBicmVha2luZy1jaGFuZ2UgMTMuMC4wIHJlbW92ZSB0aGlzIHZhcmlhYmxlXG4gKi9cbmV4cG9ydCBjb25zdCBUT09MVElQX1BBTkVMX0NMQVNTID0gJ21hdC10b29sdGlwLXBhbmVsJztcblxuY29uc3QgUEFORUxfQ0xBU1MgPSAndG9vbHRpcC1wYW5lbCc7XG5cbi8qKiBPcHRpb25zIHVzZWQgdG8gYmluZCBwYXNzaXZlIGV2ZW50IGxpc3RlbmVycy4gKi9cbmNvbnN0IHBhc3NpdmVMaXN0ZW5lck9wdGlvbnMgPSBub3JtYWxpemVQYXNzaXZlTGlzdGVuZXJPcHRpb25zKHtwYXNzaXZlOiB0cnVlfSk7XG5cbi8qKlxuICogVGltZSBiZXR3ZWVuIHRoZSB1c2VyIHB1dHRpbmcgdGhlIHBvaW50ZXIgb24gYSB0b29sdGlwXG4gKiB0cmlnZ2VyIGFuZCB0aGUgbG9uZyBwcmVzcyBldmVudCBiZWluZyBmaXJlZC5cbiAqL1xuY29uc3QgTE9OR1BSRVNTX0RFTEFZID0gNTAwO1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gZXJyb3IgdG8gYmUgdGhyb3duIGlmIHRoZSB1c2VyIHN1cHBsaWVkIGFuIGludmFsaWQgdG9vbHRpcCBwb3NpdGlvbi5cbiAqIEBkb2NzLXByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldE1hdFRvb2x0aXBJbnZhbGlkUG9zaXRpb25FcnJvcihwb3NpdGlvbjogc3RyaW5nKSB7XG4gIHJldHVybiBFcnJvcihgVG9vbHRpcCBwb3NpdGlvbiBcIiR7cG9zaXRpb259XCIgaXMgaW52YWxpZC5gKTtcbn1cblxuLyoqIEluamVjdGlvbiB0b2tlbiB0aGF0IGRldGVybWluZXMgdGhlIHNjcm9sbCBoYW5kbGluZyB3aGlsZSBhIHRvb2x0aXAgaXMgdmlzaWJsZS4gKi9cbmV4cG9ydCBjb25zdCBNQVRfVE9PTFRJUF9TQ1JPTExfU1RSQVRFR1kgPVxuICAgIG5ldyBJbmplY3Rpb25Ub2tlbjwoKSA9PiBTY3JvbGxTdHJhdGVneT4oJ21hdC10b29sdGlwLXNjcm9sbC1zdHJhdGVneScpO1xuXG4vKiogQGRvY3MtcHJpdmF0ZSAqL1xuZXhwb3J0IGZ1bmN0aW9uIE1BVF9UT09MVElQX1NDUk9MTF9TVFJBVEVHWV9GQUNUT1JZKG92ZXJsYXk6IE92ZXJsYXkpOiAoKSA9PiBTY3JvbGxTdHJhdGVneSB7XG4gIHJldHVybiAoKSA9PiBvdmVybGF5LnNjcm9sbFN0cmF0ZWdpZXMucmVwb3NpdGlvbih7c2Nyb2xsVGhyb3R0bGU6IFNDUk9MTF9USFJPVFRMRV9NU30pO1xufVxuXG4vKiogQGRvY3MtcHJpdmF0ZSAqL1xuZXhwb3J0IGNvbnN0IE1BVF9UT09MVElQX1NDUk9MTF9TVFJBVEVHWV9GQUNUT1JZX1BST1ZJREVSID0ge1xuICBwcm92aWRlOiBNQVRfVE9PTFRJUF9TQ1JPTExfU1RSQVRFR1ksXG4gIGRlcHM6IFtPdmVybGF5XSxcbiAgdXNlRmFjdG9yeTogTUFUX1RPT0xUSVBfU0NST0xMX1NUUkFURUdZX0ZBQ1RPUlksXG59O1xuXG4vKiogRGVmYXVsdCBgbWF0VG9vbHRpcGAgb3B0aW9ucyB0aGF0IGNhbiBiZSBvdmVycmlkZGVuLiAqL1xuZXhwb3J0IGludGVyZmFjZSBNYXRUb29sdGlwRGVmYXVsdE9wdGlvbnMge1xuICBzaG93RGVsYXk6IG51bWJlcjtcbiAgaGlkZURlbGF5OiBudW1iZXI7XG4gIHRvdWNoZW5kSGlkZURlbGF5OiBudW1iZXI7XG4gIHRvdWNoR2VzdHVyZXM/OiBUb29sdGlwVG91Y2hHZXN0dXJlcztcbiAgcG9zaXRpb24/OiBUb29sdGlwUG9zaXRpb247XG59XG5cbi8qKiBJbmplY3Rpb24gdG9rZW4gdG8gYmUgdXNlZCB0byBvdmVycmlkZSB0aGUgZGVmYXVsdCBvcHRpb25zIGZvciBgbWF0VG9vbHRpcGAuICovXG5leHBvcnQgY29uc3QgTUFUX1RPT0xUSVBfREVGQVVMVF9PUFRJT05TID1cbiAgICBuZXcgSW5qZWN0aW9uVG9rZW48TWF0VG9vbHRpcERlZmF1bHRPcHRpb25zPignbWF0LXRvb2x0aXAtZGVmYXVsdC1vcHRpb25zJywge1xuICAgICAgcHJvdmlkZWRJbjogJ3Jvb3QnLFxuICAgICAgZmFjdG9yeTogTUFUX1RPT0xUSVBfREVGQVVMVF9PUFRJT05TX0ZBQ1RPUllcbiAgICB9KTtcblxuLyoqIEBkb2NzLXByaXZhdGUgKi9cbmV4cG9ydCBmdW5jdGlvbiBNQVRfVE9PTFRJUF9ERUZBVUxUX09QVElPTlNfRkFDVE9SWSgpOiBNYXRUb29sdGlwRGVmYXVsdE9wdGlvbnMge1xuICByZXR1cm4ge1xuICAgIHNob3dEZWxheTogMCxcbiAgICBoaWRlRGVsYXk6IDAsXG4gICAgdG91Y2hlbmRIaWRlRGVsYXk6IDE1MDAsXG4gIH07XG59XG5cblxuQERpcmVjdGl2ZSgpXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgX01hdFRvb2x0aXBCYXNlPFQgZXh0ZW5kcyBfVG9vbHRpcENvbXBvbmVudEJhc2U+IGltcGxlbWVudHMgT25EZXN0cm95LFxuICBBZnRlclZpZXdJbml0IHtcbiAgX292ZXJsYXlSZWY6IE92ZXJsYXlSZWYgfCBudWxsO1xuICBfdG9vbHRpcEluc3RhbmNlOiBUIHwgbnVsbDtcblxuICBwcml2YXRlIF9wb3J0YWw6IENvbXBvbmVudFBvcnRhbDxUPjtcbiAgcHJpdmF0ZSBfcG9zaXRpb246IFRvb2x0aXBQb3NpdGlvbiA9ICdiZWxvdyc7XG4gIHByaXZhdGUgX2Rpc2FibGVkOiBib29sZWFuID0gZmFsc2U7XG4gIHByaXZhdGUgX3Rvb2x0aXBDbGFzczogc3RyaW5nfHN0cmluZ1tdfFNldDxzdHJpbmc+fHtba2V5OiBzdHJpbmddOiBhbnl9O1xuICBwcml2YXRlIF9zY3JvbGxTdHJhdGVneTogKCkgPT4gU2Nyb2xsU3RyYXRlZ3k7XG4gIHByaXZhdGUgX3ZpZXdJbml0aWFsaXplZCA9IGZhbHNlO1xuICBwcml2YXRlIF9wb2ludGVyRXhpdEV2ZW50c0luaXRpYWxpemVkID0gZmFsc2U7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCByZWFkb25seSBfdG9vbHRpcENvbXBvbmVudDogQ29tcG9uZW50VHlwZTxUPjtcbiAgcHJvdGVjdGVkIF92aWV3cG9ydE1hcmdpbiA9IDg7XG4gIHByaXZhdGUgX2N1cnJlbnRQb3NpdGlvbjogVG9vbHRpcFBvc2l0aW9uO1xuICBwcm90ZWN0ZWQgcmVhZG9ubHkgX2Nzc0NsYXNzUHJlZml4OiBzdHJpbmcgPSAnbWF0JztcblxuICAvKiogQWxsb3dzIHRoZSB1c2VyIHRvIGRlZmluZSB0aGUgcG9zaXRpb24gb2YgdGhlIHRvb2x0aXAgcmVsYXRpdmUgdG8gdGhlIHBhcmVudCBlbGVtZW50ICovXG4gIEBJbnB1dCgnbWF0VG9vbHRpcFBvc2l0aW9uJylcbiAgZ2V0IHBvc2l0aW9uKCk6IFRvb2x0aXBQb3NpdGlvbiB7IHJldHVybiB0aGlzLl9wb3NpdGlvbjsgfVxuICBzZXQgcG9zaXRpb24odmFsdWU6IFRvb2x0aXBQb3NpdGlvbikge1xuICAgIGlmICh2YWx1ZSAhPT0gdGhpcy5fcG9zaXRpb24pIHtcbiAgICAgIHRoaXMuX3Bvc2l0aW9uID0gdmFsdWU7XG5cbiAgICAgIGlmICh0aGlzLl9vdmVybGF5UmVmKSB7XG4gICAgICAgIHRoaXMuX3VwZGF0ZVBvc2l0aW9uKHRoaXMuX292ZXJsYXlSZWYpO1xuICAgICAgICB0aGlzLl90b29sdGlwSW5zdGFuY2U/LnNob3coMCk7XG4gICAgICAgIHRoaXMuX292ZXJsYXlSZWYudXBkYXRlUG9zaXRpb24oKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKiogRGlzYWJsZXMgdGhlIGRpc3BsYXkgb2YgdGhlIHRvb2x0aXAuICovXG4gIEBJbnB1dCgnbWF0VG9vbHRpcERpc2FibGVkJylcbiAgZ2V0IGRpc2FibGVkKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5fZGlzYWJsZWQ7IH1cbiAgc2V0IGRpc2FibGVkKHZhbHVlKSB7XG4gICAgdGhpcy5fZGlzYWJsZWQgPSBjb2VyY2VCb29sZWFuUHJvcGVydHkodmFsdWUpO1xuXG4gICAgLy8gSWYgdG9vbHRpcCBpcyBkaXNhYmxlZCwgaGlkZSBpbW1lZGlhdGVseS5cbiAgICBpZiAodGhpcy5fZGlzYWJsZWQpIHtcbiAgICAgIHRoaXMuaGlkZSgwKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fc2V0dXBQb2ludGVyRW50ZXJFdmVudHNJZk5lZWRlZCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBUaGUgZGVmYXVsdCBkZWxheSBpbiBtcyBiZWZvcmUgc2hvd2luZyB0aGUgdG9vbHRpcCBhZnRlciBzaG93IGlzIGNhbGxlZCAqL1xuICBASW5wdXQoJ21hdFRvb2x0aXBTaG93RGVsYXknKSBzaG93RGVsYXk6IG51bWJlciA9IHRoaXMuX2RlZmF1bHRPcHRpb25zLnNob3dEZWxheTtcblxuICAvKiogVGhlIGRlZmF1bHQgZGVsYXkgaW4gbXMgYmVmb3JlIGhpZGluZyB0aGUgdG9vbHRpcCBhZnRlciBoaWRlIGlzIGNhbGxlZCAqL1xuICBASW5wdXQoJ21hdFRvb2x0aXBIaWRlRGVsYXknKSBoaWRlRGVsYXk6IG51bWJlciA9IHRoaXMuX2RlZmF1bHRPcHRpb25zLmhpZGVEZWxheTtcblxuICAvKipcbiAgICogSG93IHRvdWNoIGdlc3R1cmVzIHNob3VsZCBiZSBoYW5kbGVkIGJ5IHRoZSB0b29sdGlwLiBPbiB0b3VjaCBkZXZpY2VzIHRoZSB0b29sdGlwIGRpcmVjdGl2ZVxuICAgKiB1c2VzIGEgbG9uZyBwcmVzcyBnZXN0dXJlIHRvIHNob3cgYW5kIGhpZGUsIGhvd2V2ZXIgaXQgY2FuIGNvbmZsaWN0IHdpdGggdGhlIG5hdGl2ZSBicm93c2VyXG4gICAqIGdlc3R1cmVzLiBUbyB3b3JrIGFyb3VuZCB0aGUgY29uZmxpY3QsIEFuZ3VsYXIgTWF0ZXJpYWwgZGlzYWJsZXMgbmF0aXZlIGdlc3R1cmVzIG9uIHRoZVxuICAgKiB0cmlnZ2VyLCBidXQgdGhhdCBtaWdodCBub3QgYmUgZGVzaXJhYmxlIG9uIHBhcnRpY3VsYXIgZWxlbWVudHMgKGUuZy4gaW5wdXRzIGFuZCBkcmFnZ2FibGVcbiAgICogZWxlbWVudHMpLiBUaGUgZGlmZmVyZW50IHZhbHVlcyBmb3IgdGhpcyBvcHRpb24gY29uZmlndXJlIHRoZSB0b3VjaCBldmVudCBoYW5kbGluZyBhcyBmb2xsb3dzOlxuICAgKiAtIGBhdXRvYCAtIEVuYWJsZXMgdG91Y2ggZ2VzdHVyZXMgZm9yIGFsbCBlbGVtZW50cywgYnV0IHRyaWVzIHRvIGF2b2lkIGNvbmZsaWN0cyB3aXRoIG5hdGl2ZVxuICAgKiAgIGJyb3dzZXIgZ2VzdHVyZXMgb24gcGFydGljdWxhciBlbGVtZW50cy4gSW4gcGFydGljdWxhciwgaXQgYWxsb3dzIHRleHQgc2VsZWN0aW9uIG9uIGlucHV0c1xuICAgKiAgIGFuZCB0ZXh0YXJlYXMsIGFuZCBwcmVzZXJ2ZXMgdGhlIG5hdGl2ZSBicm93c2VyIGRyYWdnaW5nIG9uIGVsZW1lbnRzIG1hcmtlZCBhcyBgZHJhZ2dhYmxlYC5cbiAgICogLSBgb25gIC0gRW5hYmxlcyB0b3VjaCBnZXN0dXJlcyBmb3IgYWxsIGVsZW1lbnRzIGFuZCBkaXNhYmxlcyBuYXRpdmVcbiAgICogICBicm93c2VyIGdlc3R1cmVzIHdpdGggbm8gZXhjZXB0aW9ucy5cbiAgICogLSBgb2ZmYCAtIERpc2FibGVzIHRvdWNoIGdlc3R1cmVzLiBOb3RlIHRoYXQgdGhpcyB3aWxsIHByZXZlbnQgdGhlIHRvb2x0aXAgZnJvbVxuICAgKiAgIHNob3dpbmcgb24gdG91Y2ggZGV2aWNlcy5cbiAgICovXG4gIEBJbnB1dCgnbWF0VG9vbHRpcFRvdWNoR2VzdHVyZXMnKSB0b3VjaEdlc3R1cmVzOiBUb29sdGlwVG91Y2hHZXN0dXJlcyA9ICdhdXRvJztcblxuICAvKiogVGhlIG1lc3NhZ2UgdG8gYmUgZGlzcGxheWVkIGluIHRoZSB0b29sdGlwICovXG4gIEBJbnB1dCgnbWF0VG9vbHRpcCcpXG4gIGdldCBtZXNzYWdlKCkgeyByZXR1cm4gdGhpcy5fbWVzc2FnZTsgfVxuICBzZXQgbWVzc2FnZSh2YWx1ZTogc3RyaW5nKSB7XG4gICAgdGhpcy5fYXJpYURlc2NyaWJlci5yZW1vdmVEZXNjcmlwdGlvbih0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQsIHRoaXMuX21lc3NhZ2UsICd0b29sdGlwJyk7XG5cbiAgICAvLyBJZiB0aGUgbWVzc2FnZSBpcyBub3QgYSBzdHJpbmcgKGUuZy4gbnVtYmVyKSwgY29udmVydCBpdCB0byBhIHN0cmluZyBhbmQgdHJpbSBpdC5cbiAgICAvLyBNdXN0IGNvbnZlcnQgd2l0aCBgU3RyaW5nKHZhbHVlKWAsIG5vdCBgJHt2YWx1ZX1gLCBvdGhlcndpc2UgQ2xvc3VyZSBDb21waWxlciBvcHRpbWlzZXNcbiAgICAvLyBhd2F5IHRoZSBzdHJpbmctY29udmVyc2lvbjogaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvY29tcG9uZW50cy9pc3N1ZXMvMjA2ODRcbiAgICB0aGlzLl9tZXNzYWdlID0gdmFsdWUgIT0gbnVsbCA/IFN0cmluZyh2YWx1ZSkudHJpbSgpIDogJyc7XG5cbiAgICBpZiAoIXRoaXMuX21lc3NhZ2UgJiYgdGhpcy5faXNUb29sdGlwVmlzaWJsZSgpKSB7XG4gICAgICB0aGlzLmhpZGUoMCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3NldHVwUG9pbnRlckVudGVyRXZlbnRzSWZOZWVkZWQoKTtcbiAgICAgIHRoaXMuX3VwZGF0ZVRvb2x0aXBNZXNzYWdlKCk7XG4gICAgICB0aGlzLl9uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgICAvLyBUaGUgYEFyaWFEZXNjcmliZXJgIGhhcyBzb21lIGZ1bmN0aW9uYWxpdHkgdGhhdCBhdm9pZHMgYWRkaW5nIGEgZGVzY3JpcHRpb24gaWYgaXQncyB0aGVcbiAgICAgICAgLy8gc2FtZSBhcyB0aGUgYGFyaWEtbGFiZWxgIG9mIGFuIGVsZW1lbnQsIGhvd2V2ZXIgd2UgY2FuJ3Qga25vdyB3aGV0aGVyIHRoZSB0b29sdGlwIHRyaWdnZXJcbiAgICAgICAgLy8gaGFzIGEgZGF0YS1ib3VuZCBgYXJpYS1sYWJlbGAgb3Igd2hlbiBpdCdsbCBiZSBzZXQgZm9yIHRoZSBmaXJzdCB0aW1lLiBXZSBjYW4gYXZvaWQgdGhlXG4gICAgICAgIC8vIGlzc3VlIGJ5IGRlZmVycmluZyB0aGUgZGVzY3JpcHRpb24gYnkgYSB0aWNrIHNvIEFuZ3VsYXIgaGFzIHRpbWUgdG8gc2V0IHRoZSBgYXJpYS1sYWJlbGAuXG4gICAgICAgIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIHRoaXMuX2FyaWFEZXNjcmliZXIuZGVzY3JpYmUodGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LCB0aGlzLm1lc3NhZ2UsICd0b29sdGlwJyk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG4gIHByaXZhdGUgX21lc3NhZ2UgPSAnJztcblxuICAvKiogQ2xhc3NlcyB0byBiZSBwYXNzZWQgdG8gdGhlIHRvb2x0aXAuIFN1cHBvcnRzIHRoZSBzYW1lIHN5bnRheCBhcyBgbmdDbGFzc2AuICovXG4gIEBJbnB1dCgnbWF0VG9vbHRpcENsYXNzJylcbiAgZ2V0IHRvb2x0aXBDbGFzcygpIHsgcmV0dXJuIHRoaXMuX3Rvb2x0aXBDbGFzczsgfVxuICBzZXQgdG9vbHRpcENsYXNzKHZhbHVlOiBzdHJpbmd8c3RyaW5nW118U2V0PHN0cmluZz58e1trZXk6IHN0cmluZ106IGFueX0pIHtcbiAgICB0aGlzLl90b29sdGlwQ2xhc3MgPSB2YWx1ZTtcbiAgICBpZiAodGhpcy5fdG9vbHRpcEluc3RhbmNlKSB7XG4gICAgICB0aGlzLl9zZXRUb29sdGlwQ2xhc3ModGhpcy5fdG9vbHRpcENsYXNzKTtcbiAgICB9XG4gIH1cblxuICAvKiogTWFudWFsbHktYm91bmQgcGFzc2l2ZSBldmVudCBsaXN0ZW5lcnMuICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX3Bhc3NpdmVMaXN0ZW5lcnM6XG4gICAgICAocmVhZG9ubHkgW3N0cmluZywgRXZlbnRMaXN0ZW5lck9yRXZlbnRMaXN0ZW5lck9iamVjdF0pW10gPSBbXTtcblxuICAvKiogUmVmZXJlbmNlIHRvIHRoZSBjdXJyZW50IGRvY3VtZW50LiAqL1xuICBwcml2YXRlIF9kb2N1bWVudDogRG9jdW1lbnQ7XG5cbiAgLyoqIFRpbWVyIHN0YXJ0ZWQgYXQgdGhlIGxhc3QgYHRvdWNoc3RhcnRgIGV2ZW50LiAqL1xuICBwcml2YXRlIF90b3VjaHN0YXJ0VGltZW91dDogbnVtYmVyO1xuXG4gIC8qKiBFbWl0cyB3aGVuIHRoZSBjb21wb25lbnQgaXMgZGVzdHJveWVkLiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9kZXN0cm95ZWQgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgX292ZXJsYXk6IE92ZXJsYXksXG4gICAgcHJpdmF0ZSBfZWxlbWVudFJlZjogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4sXG4gICAgcHJpdmF0ZSBfc2Nyb2xsRGlzcGF0Y2hlcjogU2Nyb2xsRGlzcGF0Y2hlcixcbiAgICBwcml2YXRlIF92aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmLFxuICAgIHByaXZhdGUgX25nWm9uZTogTmdab25lLFxuICAgIHByaXZhdGUgX3BsYXRmb3JtOiBQbGF0Zm9ybSxcbiAgICBwcml2YXRlIF9hcmlhRGVzY3JpYmVyOiBBcmlhRGVzY3JpYmVyLFxuICAgIHByaXZhdGUgX2ZvY3VzTW9uaXRvcjogRm9jdXNNb25pdG9yLFxuICAgIHNjcm9sbFN0cmF0ZWd5OiBhbnksXG4gICAgcHJvdGVjdGVkIF9kaXI6IERpcmVjdGlvbmFsaXR5LFxuICAgIHByaXZhdGUgX2RlZmF1bHRPcHRpb25zOiBNYXRUb29sdGlwRGVmYXVsdE9wdGlvbnMsXG4gICAgQEluamVjdChET0NVTUVOVCkgX2RvY3VtZW50OiBhbnkpIHtcblxuICAgIHRoaXMuX3Njcm9sbFN0cmF0ZWd5ID0gc2Nyb2xsU3RyYXRlZ3k7XG4gICAgdGhpcy5fZG9jdW1lbnQgPSBfZG9jdW1lbnQ7XG5cbiAgICBpZiAoX2RlZmF1bHRPcHRpb25zKSB7XG4gICAgICBpZiAoX2RlZmF1bHRPcHRpb25zLnBvc2l0aW9uKSB7XG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBfZGVmYXVsdE9wdGlvbnMucG9zaXRpb247XG4gICAgICB9XG5cbiAgICAgIGlmIChfZGVmYXVsdE9wdGlvbnMudG91Y2hHZXN0dXJlcykge1xuICAgICAgICB0aGlzLnRvdWNoR2VzdHVyZXMgPSBfZGVmYXVsdE9wdGlvbnMudG91Y2hHZXN0dXJlcztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBfZGlyLmNoYW5nZS5waXBlKHRha2VVbnRpbCh0aGlzLl9kZXN0cm95ZWQpKS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuX292ZXJsYXlSZWYpIHtcbiAgICAgICAgdGhpcy5fdXBkYXRlUG9zaXRpb24odGhpcy5fb3ZlcmxheVJlZik7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBfbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgIF9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuX2hhbmRsZUtleWRvd24pO1xuICAgIH0pO1xuICB9XG5cbiAgbmdBZnRlclZpZXdJbml0KCkge1xuICAgIC8vIFRoaXMgbmVlZHMgdG8gaGFwcGVuIGFmdGVyIHZpZXcgaW5pdCBzbyB0aGUgaW5pdGlhbCB2YWx1ZXMgZm9yIGFsbCBpbnB1dHMgaGF2ZSBiZWVuIHNldC5cbiAgICB0aGlzLl92aWV3SW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgIHRoaXMuX3NldHVwUG9pbnRlckVudGVyRXZlbnRzSWZOZWVkZWQoKTtcblxuICAgIHRoaXMuX2ZvY3VzTW9uaXRvci5tb25pdG9yKHRoaXMuX2VsZW1lbnRSZWYpXG4gICAgICAucGlwZSh0YWtlVW50aWwodGhpcy5fZGVzdHJveWVkKSlcbiAgICAgIC5zdWJzY3JpYmUob3JpZ2luID0+IHtcbiAgICAgICAgLy8gTm90ZSB0aGF0IHRoZSBmb2N1cyBtb25pdG9yIHJ1bnMgb3V0c2lkZSB0aGUgQW5ndWxhciB6b25lLlxuICAgICAgICBpZiAoIW9yaWdpbikge1xuICAgICAgICAgIHRoaXMuX25nWm9uZS5ydW4oKCkgPT4gdGhpcy5oaWRlKDApKTtcbiAgICAgICAgfSBlbHNlIGlmIChvcmlnaW4gPT09ICdrZXlib2FyZCcpIHtcbiAgICAgICAgICB0aGlzLl9uZ1pvbmUucnVuKCgpID0+IHRoaXMuc2hvdygpKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIERpc3Bvc2UgdGhlIHRvb2x0aXAgd2hlbiBkZXN0cm95ZWQuXG4gICAqL1xuICBuZ09uRGVzdHJveSgpIHtcbiAgICBjb25zdCBuYXRpdmVFbGVtZW50ID0gdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50O1xuXG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuX3RvdWNoc3RhcnRUaW1lb3V0KTtcblxuICAgIGlmICh0aGlzLl9vdmVybGF5UmVmKSB7XG4gICAgICB0aGlzLl9vdmVybGF5UmVmLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX3Rvb2x0aXBJbnN0YW5jZSA9IG51bGw7XG4gICAgfVxuXG4gICAgLy8gQ2xlYW4gdXAgdGhlIGV2ZW50IGxpc3RlbmVycyBzZXQgaW4gdGhlIGNvbnN0cnVjdG9yXG4gICAgbmF0aXZlRWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5faGFuZGxlS2V5ZG93bik7XG4gICAgdGhpcy5fcGFzc2l2ZUxpc3RlbmVycy5mb3JFYWNoKChbZXZlbnQsIGxpc3RlbmVyXSkgPT4ge1xuICAgICAgbmF0aXZlRWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50LCBsaXN0ZW5lciwgcGFzc2l2ZUxpc3RlbmVyT3B0aW9ucyk7XG4gICAgfSk7XG4gICAgdGhpcy5fcGFzc2l2ZUxpc3RlbmVycy5sZW5ndGggPSAwO1xuXG4gICAgdGhpcy5fZGVzdHJveWVkLm5leHQoKTtcbiAgICB0aGlzLl9kZXN0cm95ZWQuY29tcGxldGUoKTtcblxuICAgIHRoaXMuX2FyaWFEZXNjcmliZXIucmVtb3ZlRGVzY3JpcHRpb24obmF0aXZlRWxlbWVudCwgdGhpcy5tZXNzYWdlLCAndG9vbHRpcCcpO1xuICAgIHRoaXMuX2ZvY3VzTW9uaXRvci5zdG9wTW9uaXRvcmluZyhuYXRpdmVFbGVtZW50KTtcbiAgfVxuXG4gIC8qKiBTaG93cyB0aGUgdG9vbHRpcCBhZnRlciB0aGUgZGVsYXkgaW4gbXMsIGRlZmF1bHRzIHRvIHRvb2x0aXAtZGVsYXktc2hvdyBvciAwbXMgaWYgbm8gaW5wdXQgKi9cbiAgc2hvdyhkZWxheTogbnVtYmVyID0gdGhpcy5zaG93RGVsYXkpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5kaXNhYmxlZCB8fCAhdGhpcy5tZXNzYWdlIHx8ICh0aGlzLl9pc1Rvb2x0aXBWaXNpYmxlKCkgJiZcbiAgICAgICF0aGlzLl90b29sdGlwSW5zdGFuY2UhLl9zaG93VGltZW91dElkICYmICF0aGlzLl90b29sdGlwSW5zdGFuY2UhLl9oaWRlVGltZW91dElkKSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgb3ZlcmxheVJlZiA9IHRoaXMuX2NyZWF0ZU92ZXJsYXkoKTtcbiAgICB0aGlzLl9kZXRhY2goKTtcbiAgICB0aGlzLl9wb3J0YWwgPSB0aGlzLl9wb3J0YWwgfHxcbiAgICAgICBuZXcgQ29tcG9uZW50UG9ydGFsKHRoaXMuX3Rvb2x0aXBDb21wb25lbnQsIHRoaXMuX3ZpZXdDb250YWluZXJSZWYpO1xuICAgIHRoaXMuX3Rvb2x0aXBJbnN0YW5jZSA9IG92ZXJsYXlSZWYuYXR0YWNoKHRoaXMuX3BvcnRhbCkuaW5zdGFuY2U7XG4gICAgdGhpcy5fdG9vbHRpcEluc3RhbmNlLmFmdGVySGlkZGVuKClcbiAgICAgIC5waXBlKHRha2VVbnRpbCh0aGlzLl9kZXN0cm95ZWQpKVxuICAgICAgLnN1YnNjcmliZSgoKSA9PiB0aGlzLl9kZXRhY2goKSk7XG4gICAgdGhpcy5fc2V0VG9vbHRpcENsYXNzKHRoaXMuX3Rvb2x0aXBDbGFzcyk7XG4gICAgdGhpcy5fdXBkYXRlVG9vbHRpcE1lc3NhZ2UoKTtcbiAgICB0aGlzLl90b29sdGlwSW5zdGFuY2UhLnNob3coZGVsYXkpO1xuICB9XG5cbiAgLyoqIEhpZGVzIHRoZSB0b29sdGlwIGFmdGVyIHRoZSBkZWxheSBpbiBtcywgZGVmYXVsdHMgdG8gdG9vbHRpcC1kZWxheS1oaWRlIG9yIDBtcyBpZiBubyBpbnB1dCAqL1xuICBoaWRlKGRlbGF5OiBudW1iZXIgPSB0aGlzLmhpZGVEZWxheSk6IHZvaWQge1xuICAgIGlmICh0aGlzLl90b29sdGlwSW5zdGFuY2UpIHtcbiAgICAgIHRoaXMuX3Rvb2x0aXBJbnN0YW5jZS5oaWRlKGRlbGF5KTtcbiAgICB9XG4gIH1cblxuICAvKiogU2hvd3MvaGlkZXMgdGhlIHRvb2x0aXAgKi9cbiAgdG9nZ2xlKCk6IHZvaWQge1xuICAgIHRoaXMuX2lzVG9vbHRpcFZpc2libGUoKSA/IHRoaXMuaGlkZSgpIDogdGhpcy5zaG93KCk7XG4gIH1cblxuICAvKiogUmV0dXJucyB0cnVlIGlmIHRoZSB0b29sdGlwIGlzIGN1cnJlbnRseSB2aXNpYmxlIHRvIHRoZSB1c2VyICovXG4gIF9pc1Rvb2x0aXBWaXNpYmxlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhIXRoaXMuX3Rvb2x0aXBJbnN0YW5jZSAmJiB0aGlzLl90b29sdGlwSW5zdGFuY2UuaXNWaXNpYmxlKCk7XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyB0aGUga2V5ZG93biBldmVudHMgb24gdGhlIGhvc3QgZWxlbWVudC5cbiAgICogTmVlZHMgdG8gYmUgYW4gYXJyb3cgZnVuY3Rpb24gc28gdGhhdCB3ZSBjYW4gdXNlIGl0IGluIGFkZEV2ZW50TGlzdGVuZXIuXG4gICAqL1xuICBwcml2YXRlIF9oYW5kbGVLZXlkb3duID0gKGV2ZW50OiBLZXlib2FyZEV2ZW50KSA9PiB7XG4gICAgaWYgKHRoaXMuX2lzVG9vbHRpcFZpc2libGUoKSAmJiBldmVudC5rZXlDb2RlID09PSBFU0NBUEUgJiYgIWhhc01vZGlmaWVyS2V5KGV2ZW50KSkge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgdGhpcy5fbmdab25lLnJ1bigoKSA9PiB0aGlzLmhpZGUoMCkpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBDcmVhdGUgdGhlIG92ZXJsYXkgY29uZmlnIGFuZCBwb3NpdGlvbiBzdHJhdGVneSAqL1xuICBwcml2YXRlIF9jcmVhdGVPdmVybGF5KCk6IE92ZXJsYXlSZWYge1xuICAgIGlmICh0aGlzLl9vdmVybGF5UmVmKSB7XG4gICAgICByZXR1cm4gdGhpcy5fb3ZlcmxheVJlZjtcbiAgICB9XG5cbiAgICBjb25zdCBzY3JvbGxhYmxlQW5jZXN0b3JzID1cbiAgICAgICAgdGhpcy5fc2Nyb2xsRGlzcGF0Y2hlci5nZXRBbmNlc3RvclNjcm9sbENvbnRhaW5lcnModGhpcy5fZWxlbWVudFJlZik7XG5cbiAgICAvLyBDcmVhdGUgY29ubmVjdGVkIHBvc2l0aW9uIHN0cmF0ZWd5IHRoYXQgbGlzdGVucyBmb3Igc2Nyb2xsIGV2ZW50cyB0byByZXBvc2l0aW9uLlxuICAgIGNvbnN0IHN0cmF0ZWd5ID0gdGhpcy5fb3ZlcmxheS5wb3NpdGlvbigpXG4gICAgICAgICAgICAgICAgICAgICAgICAgLmZsZXhpYmxlQ29ubmVjdGVkVG8odGhpcy5fZWxlbWVudFJlZilcbiAgICAgICAgICAgICAgICAgICAgICAgICAud2l0aFRyYW5zZm9ybU9yaWdpbk9uKGAuJHt0aGlzLl9jc3NDbGFzc1ByZWZpeH0tdG9vbHRpcGApXG4gICAgICAgICAgICAgICAgICAgICAgICAgLndpdGhGbGV4aWJsZURpbWVuc2lvbnMoZmFsc2UpXG4gICAgICAgICAgICAgICAgICAgICAgICAgLndpdGhWaWV3cG9ydE1hcmdpbih0aGlzLl92aWV3cG9ydE1hcmdpbilcbiAgICAgICAgICAgICAgICAgICAgICAgICAud2l0aFNjcm9sbGFibGVDb250YWluZXJzKHNjcm9sbGFibGVBbmNlc3RvcnMpO1xuXG4gICAgc3RyYXRlZ3kucG9zaXRpb25DaGFuZ2VzLnBpcGUodGFrZVVudGlsKHRoaXMuX2Rlc3Ryb3llZCkpLnN1YnNjcmliZShjaGFuZ2UgPT4ge1xuICAgICAgdGhpcy5fdXBkYXRlQ3VycmVudFBvc2l0aW9uQ2xhc3MoY2hhbmdlLmNvbm5lY3Rpb25QYWlyKTtcblxuICAgICAgaWYgKHRoaXMuX3Rvb2x0aXBJbnN0YW5jZSkge1xuICAgICAgICBpZiAoY2hhbmdlLnNjcm9sbGFibGVWaWV3UHJvcGVydGllcy5pc092ZXJsYXlDbGlwcGVkICYmIHRoaXMuX3Rvb2x0aXBJbnN0YW5jZS5pc1Zpc2libGUoKSkge1xuICAgICAgICAgIC8vIEFmdGVyIHBvc2l0aW9uIGNoYW5nZXMgb2NjdXIgYW5kIHRoZSBvdmVybGF5IGlzIGNsaXBwZWQgYnlcbiAgICAgICAgICAvLyBhIHBhcmVudCBzY3JvbGxhYmxlIHRoZW4gY2xvc2UgdGhlIHRvb2x0aXAuXG4gICAgICAgICAgdGhpcy5fbmdab25lLnJ1bigoKSA9PiB0aGlzLmhpZGUoMCkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLl9vdmVybGF5UmVmID0gdGhpcy5fb3ZlcmxheS5jcmVhdGUoe1xuICAgICAgZGlyZWN0aW9uOiB0aGlzLl9kaXIsXG4gICAgICBwb3NpdGlvblN0cmF0ZWd5OiBzdHJhdGVneSxcbiAgICAgIHBhbmVsQ2xhc3M6IGAke3RoaXMuX2Nzc0NsYXNzUHJlZml4fS0ke1BBTkVMX0NMQVNTfWAsXG4gICAgICBzY3JvbGxTdHJhdGVneTogdGhpcy5fc2Nyb2xsU3RyYXRlZ3koKVxuICAgIH0pO1xuXG4gICAgdGhpcy5fdXBkYXRlUG9zaXRpb24odGhpcy5fb3ZlcmxheVJlZik7XG5cbiAgICB0aGlzLl9vdmVybGF5UmVmLmRldGFjaG1lbnRzKClcbiAgICAgIC5waXBlKHRha2VVbnRpbCh0aGlzLl9kZXN0cm95ZWQpKVxuICAgICAgLnN1YnNjcmliZSgoKSA9PiB0aGlzLl9kZXRhY2goKSk7XG5cbiAgICByZXR1cm4gdGhpcy5fb3ZlcmxheVJlZjtcbiAgfVxuXG4gIC8qKiBEZXRhY2hlcyB0aGUgY3VycmVudGx5LWF0dGFjaGVkIHRvb2x0aXAuICovXG4gIHByaXZhdGUgX2RldGFjaCgpIHtcbiAgICBpZiAodGhpcy5fb3ZlcmxheVJlZiAmJiB0aGlzLl9vdmVybGF5UmVmLmhhc0F0dGFjaGVkKCkpIHtcbiAgICAgIHRoaXMuX292ZXJsYXlSZWYuZGV0YWNoKCk7XG4gICAgfVxuXG4gICAgdGhpcy5fdG9vbHRpcEluc3RhbmNlID0gbnVsbDtcbiAgfVxuXG4gIC8qKiBVcGRhdGVzIHRoZSBwb3NpdGlvbiBvZiB0aGUgY3VycmVudCB0b29sdGlwLiAqL1xuICBwcml2YXRlIF91cGRhdGVQb3NpdGlvbihvdmVybGF5UmVmOiBPdmVybGF5UmVmKSB7XG4gICAgY29uc3QgcG9zaXRpb24gPSBvdmVybGF5UmVmLmdldENvbmZpZygpLnBvc2l0aW9uU3RyYXRlZ3kgYXMgRmxleGlibGVDb25uZWN0ZWRQb3NpdGlvblN0cmF0ZWd5O1xuICAgIGNvbnN0IG9yaWdpbiA9IHRoaXMuX2dldE9yaWdpbigpO1xuICAgIGNvbnN0IG92ZXJsYXkgPSB0aGlzLl9nZXRPdmVybGF5UG9zaXRpb24oKTtcblxuICAgIHBvc2l0aW9uLndpdGhQb3NpdGlvbnMoW1xuICAgICAgdGhpcy5fYWRkT2Zmc2V0KHsuLi5vcmlnaW4ubWFpbiwgLi4ub3ZlcmxheS5tYWlufSksXG4gICAgICB0aGlzLl9hZGRPZmZzZXQoey4uLm9yaWdpbi5mYWxsYmFjaywgLi4ub3ZlcmxheS5mYWxsYmFja30pXG4gICAgXSk7XG4gIH1cblxuICAvKiogQWRkcyB0aGUgY29uZmlndXJlZCBvZmZzZXQgdG8gYSBwb3NpdGlvbi4gVXNlZCBhcyBhIGhvb2sgZm9yIGNoaWxkIGNsYXNzZXMuICovXG4gIHByb3RlY3RlZCBfYWRkT2Zmc2V0KHBvc2l0aW9uOiBDb25uZWN0ZWRQb3NpdGlvbik6IENvbm5lY3RlZFBvc2l0aW9uIHtcbiAgICByZXR1cm4gcG9zaXRpb247XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgb3JpZ2luIHBvc2l0aW9uIGFuZCBhIGZhbGxiYWNrIHBvc2l0aW9uIGJhc2VkIG9uIHRoZSB1c2VyJ3MgcG9zaXRpb24gcHJlZmVyZW5jZS5cbiAgICogVGhlIGZhbGxiYWNrIHBvc2l0aW9uIGlzIHRoZSBpbnZlcnNlIG9mIHRoZSBvcmlnaW4gKGUuZy4gYCdiZWxvdycgLT4gJ2Fib3ZlJ2ApLlxuICAgKi9cbiAgX2dldE9yaWdpbigpOiB7bWFpbjogT3JpZ2luQ29ubmVjdGlvblBvc2l0aW9uLCBmYWxsYmFjazogT3JpZ2luQ29ubmVjdGlvblBvc2l0aW9ufSB7XG4gICAgY29uc3QgaXNMdHIgPSAhdGhpcy5fZGlyIHx8IHRoaXMuX2Rpci52YWx1ZSA9PSAnbHRyJztcbiAgICBjb25zdCBwb3NpdGlvbiA9IHRoaXMucG9zaXRpb247XG4gICAgbGV0IG9yaWdpblBvc2l0aW9uOiBPcmlnaW5Db25uZWN0aW9uUG9zaXRpb247XG5cbiAgICBpZiAocG9zaXRpb24gPT0gJ2Fib3ZlJyB8fCBwb3NpdGlvbiA9PSAnYmVsb3cnKSB7XG4gICAgICBvcmlnaW5Qb3NpdGlvbiA9IHtvcmlnaW5YOiAnY2VudGVyJywgb3JpZ2luWTogcG9zaXRpb24gPT0gJ2Fib3ZlJyA/ICd0b3AnIDogJ2JvdHRvbSd9O1xuICAgIH0gZWxzZSBpZiAoXG4gICAgICBwb3NpdGlvbiA9PSAnYmVmb3JlJyB8fFxuICAgICAgKHBvc2l0aW9uID09ICdsZWZ0JyAmJiBpc0x0cikgfHxcbiAgICAgIChwb3NpdGlvbiA9PSAncmlnaHQnICYmICFpc0x0cikpIHtcbiAgICAgIG9yaWdpblBvc2l0aW9uID0ge29yaWdpblg6ICdzdGFydCcsIG9yaWdpblk6ICdjZW50ZXInfTtcbiAgICB9IGVsc2UgaWYgKFxuICAgICAgcG9zaXRpb24gPT0gJ2FmdGVyJyB8fFxuICAgICAgKHBvc2l0aW9uID09ICdyaWdodCcgJiYgaXNMdHIpIHx8XG4gICAgICAocG9zaXRpb24gPT0gJ2xlZnQnICYmICFpc0x0cikpIHtcbiAgICAgIG9yaWdpblBvc2l0aW9uID0ge29yaWdpblg6ICdlbmQnLCBvcmlnaW5ZOiAnY2VudGVyJ307XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpIHtcbiAgICAgIHRocm93IGdldE1hdFRvb2x0aXBJbnZhbGlkUG9zaXRpb25FcnJvcihwb3NpdGlvbik7XG4gICAgfVxuXG4gICAgY29uc3Qge3gsIHl9ID0gdGhpcy5faW52ZXJ0UG9zaXRpb24ob3JpZ2luUG9zaXRpb24hLm9yaWdpblgsIG9yaWdpblBvc2l0aW9uIS5vcmlnaW5ZKTtcblxuICAgIHJldHVybiB7XG4gICAgICBtYWluOiBvcmlnaW5Qb3NpdGlvbiEsXG4gICAgICBmYWxsYmFjazoge29yaWdpblg6IHgsIG9yaWdpblk6IHl9XG4gICAgfTtcbiAgfVxuXG4gIC8qKiBSZXR1cm5zIHRoZSBvdmVybGF5IHBvc2l0aW9uIGFuZCBhIGZhbGxiYWNrIHBvc2l0aW9uIGJhc2VkIG9uIHRoZSB1c2VyJ3MgcHJlZmVyZW5jZSAqL1xuICBfZ2V0T3ZlcmxheVBvc2l0aW9uKCk6IHttYWluOiBPdmVybGF5Q29ubmVjdGlvblBvc2l0aW9uLCBmYWxsYmFjazogT3ZlcmxheUNvbm5lY3Rpb25Qb3NpdGlvbn0ge1xuICAgIGNvbnN0IGlzTHRyID0gIXRoaXMuX2RpciB8fCB0aGlzLl9kaXIudmFsdWUgPT0gJ2x0cic7XG4gICAgY29uc3QgcG9zaXRpb24gPSB0aGlzLnBvc2l0aW9uO1xuICAgIGxldCBvdmVybGF5UG9zaXRpb246IE92ZXJsYXlDb25uZWN0aW9uUG9zaXRpb247XG5cbiAgICBpZiAocG9zaXRpb24gPT0gJ2Fib3ZlJykge1xuICAgICAgb3ZlcmxheVBvc2l0aW9uID0ge292ZXJsYXlYOiAnY2VudGVyJywgb3ZlcmxheVk6ICdib3R0b20nfTtcbiAgICB9IGVsc2UgaWYgKHBvc2l0aW9uID09ICdiZWxvdycpIHtcbiAgICAgIG92ZXJsYXlQb3NpdGlvbiA9IHtvdmVybGF5WDogJ2NlbnRlcicsIG92ZXJsYXlZOiAndG9wJ307XG4gICAgfSBlbHNlIGlmIChcbiAgICAgIHBvc2l0aW9uID09ICdiZWZvcmUnIHx8XG4gICAgICAocG9zaXRpb24gPT0gJ2xlZnQnICYmIGlzTHRyKSB8fFxuICAgICAgKHBvc2l0aW9uID09ICdyaWdodCcgJiYgIWlzTHRyKSkge1xuICAgICAgb3ZlcmxheVBvc2l0aW9uID0ge292ZXJsYXlYOiAnZW5kJywgb3ZlcmxheVk6ICdjZW50ZXInfTtcbiAgICB9IGVsc2UgaWYgKFxuICAgICAgcG9zaXRpb24gPT0gJ2FmdGVyJyB8fFxuICAgICAgKHBvc2l0aW9uID09ICdyaWdodCcgJiYgaXNMdHIpIHx8XG4gICAgICAocG9zaXRpb24gPT0gJ2xlZnQnICYmICFpc0x0cikpIHtcbiAgICAgIG92ZXJsYXlQb3NpdGlvbiA9IHtvdmVybGF5WDogJ3N0YXJ0Jywgb3ZlcmxheVk6ICdjZW50ZXInfTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkge1xuICAgICAgdGhyb3cgZ2V0TWF0VG9vbHRpcEludmFsaWRQb3NpdGlvbkVycm9yKHBvc2l0aW9uKTtcbiAgICB9XG5cbiAgICBjb25zdCB7eCwgeX0gPSB0aGlzLl9pbnZlcnRQb3NpdGlvbihvdmVybGF5UG9zaXRpb24hLm92ZXJsYXlYLCBvdmVybGF5UG9zaXRpb24hLm92ZXJsYXlZKTtcblxuICAgIHJldHVybiB7XG4gICAgICBtYWluOiBvdmVybGF5UG9zaXRpb24hLFxuICAgICAgZmFsbGJhY2s6IHtvdmVybGF5WDogeCwgb3ZlcmxheVk6IHl9XG4gICAgfTtcbiAgfVxuXG4gIC8qKiBVcGRhdGVzIHRoZSB0b29sdGlwIG1lc3NhZ2UgYW5kIHJlcG9zaXRpb25zIHRoZSBvdmVybGF5IGFjY29yZGluZyB0byB0aGUgbmV3IG1lc3NhZ2UgbGVuZ3RoICovXG4gIHByaXZhdGUgX3VwZGF0ZVRvb2x0aXBNZXNzYWdlKCkge1xuICAgIC8vIE11c3Qgd2FpdCBmb3IgdGhlIG1lc3NhZ2UgdG8gYmUgcGFpbnRlZCB0byB0aGUgdG9vbHRpcCBzbyB0aGF0IHRoZSBvdmVybGF5IGNhbiBwcm9wZXJseVxuICAgIC8vIGNhbGN1bGF0ZSB0aGUgY29ycmVjdCBwb3NpdGlvbmluZyBiYXNlZCBvbiB0aGUgc2l6ZSBvZiB0aGUgdGV4dC5cbiAgICBpZiAodGhpcy5fdG9vbHRpcEluc3RhbmNlKSB7XG4gICAgICB0aGlzLl90b29sdGlwSW5zdGFuY2UubWVzc2FnZSA9IHRoaXMubWVzc2FnZTtcbiAgICAgIHRoaXMuX3Rvb2x0aXBJbnN0YW5jZS5fbWFya0ZvckNoZWNrKCk7XG5cbiAgICAgIHRoaXMuX25nWm9uZS5vbk1pY3JvdGFza0VtcHR5LnBpcGUoXG4gICAgICAgIHRha2UoMSksXG4gICAgICAgIHRha2VVbnRpbCh0aGlzLl9kZXN0cm95ZWQpXG4gICAgICApLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLl90b29sdGlwSW5zdGFuY2UpIHtcbiAgICAgICAgICB0aGlzLl9vdmVybGF5UmVmIS51cGRhdGVQb3NpdGlvbigpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKiogVXBkYXRlcyB0aGUgdG9vbHRpcCBjbGFzcyAqL1xuICBwcml2YXRlIF9zZXRUb29sdGlwQ2xhc3ModG9vbHRpcENsYXNzOiBzdHJpbmd8c3RyaW5nW118U2V0PHN0cmluZz58e1trZXk6IHN0cmluZ106IGFueX0pIHtcbiAgICBpZiAodGhpcy5fdG9vbHRpcEluc3RhbmNlKSB7XG4gICAgICB0aGlzLl90b29sdGlwSW5zdGFuY2UudG9vbHRpcENsYXNzID0gdG9vbHRpcENsYXNzO1xuICAgICAgdGhpcy5fdG9vbHRpcEluc3RhbmNlLl9tYXJrRm9yQ2hlY2soKTtcbiAgICB9XG4gIH1cblxuICAvKiogSW52ZXJ0cyBhbiBvdmVybGF5IHBvc2l0aW9uLiAqL1xuICBwcml2YXRlIF9pbnZlcnRQb3NpdGlvbih4OiBIb3Jpem9udGFsQ29ubmVjdGlvblBvcywgeTogVmVydGljYWxDb25uZWN0aW9uUG9zKSB7XG4gICAgaWYgKHRoaXMucG9zaXRpb24gPT09ICdhYm92ZScgfHwgdGhpcy5wb3NpdGlvbiA9PT0gJ2JlbG93Jykge1xuICAgICAgaWYgKHkgPT09ICd0b3AnKSB7XG4gICAgICAgIHkgPSAnYm90dG9tJztcbiAgICAgIH0gZWxzZSBpZiAoeSA9PT0gJ2JvdHRvbScpIHtcbiAgICAgICAgeSA9ICd0b3AnO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoeCA9PT0gJ2VuZCcpIHtcbiAgICAgICAgeCA9ICdzdGFydCc7XG4gICAgICB9IGVsc2UgaWYgKHggPT09ICdzdGFydCcpIHtcbiAgICAgICAgeCA9ICdlbmQnO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB7eCwgeX07XG4gIH1cblxuICAvKiogVXBkYXRlcyB0aGUgY2xhc3Mgb24gdGhlIG92ZXJsYXkgcGFuZWwgYmFzZWQgb24gdGhlIGN1cnJlbnQgcG9zaXRpb24gb2YgdGhlIHRvb2x0aXAuICovXG4gIHByaXZhdGUgX3VwZGF0ZUN1cnJlbnRQb3NpdGlvbkNsYXNzKGNvbm5lY3Rpb25QYWlyOiBDb25uZWN0aW9uUG9zaXRpb25QYWlyKTogdm9pZCB7XG4gICAgY29uc3Qge292ZXJsYXlZLCBvcmlnaW5YLCBvcmlnaW5ZfSA9IGNvbm5lY3Rpb25QYWlyO1xuICAgIGxldCBuZXdQb3NpdGlvbjogVG9vbHRpcFBvc2l0aW9uO1xuXG4gICAgLy8gSWYgdGhlIG92ZXJsYXkgaXMgaW4gdGhlIG1pZGRsZSBhbG9uZyB0aGUgWSBheGlzLFxuICAgIC8vIGl0IG1lYW5zIHRoYXQgaXQncyBlaXRoZXIgYmVmb3JlIG9yIGFmdGVyLlxuICAgIGlmIChvdmVybGF5WSA9PT0gJ2NlbnRlcicpIHtcbiAgICAgIC8vIE5vdGUgdGhhdCBzaW5jZSB0aGlzIGluZm9ybWF0aW9uIGlzIHVzZWQgZm9yIHN0eWxpbmcsIHdlIHdhbnQgdG9cbiAgICAgIC8vIHJlc29sdmUgYHN0YXJ0YCBhbmQgYGVuZGAgdG8gdGhlaXIgcmVhbCB2YWx1ZXMsIG90aGVyd2lzZSBjb25zdW1lcnNcbiAgICAgIC8vIHdvdWxkIGhhdmUgdG8gcmVtZW1iZXIgdG8gZG8gaXQgdGhlbXNlbHZlcyBvbiBlYWNoIGNvbnN1bXB0aW9uLlxuICAgICAgaWYgKHRoaXMuX2RpciAmJiB0aGlzLl9kaXIudmFsdWUgPT09ICdydGwnKSB7XG4gICAgICAgIG5ld1Bvc2l0aW9uID0gb3JpZ2luWCA9PT0gJ2VuZCcgPyAnbGVmdCcgOiAncmlnaHQnO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmV3UG9zaXRpb24gPSBvcmlnaW5YID09PSAnc3RhcnQnID8gJ2xlZnQnIDogJ3JpZ2h0JztcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgbmV3UG9zaXRpb24gPSBvdmVybGF5WSA9PT0gJ2JvdHRvbScgJiYgb3JpZ2luWSA9PT0gJ3RvcCcgPyAnYWJvdmUnIDogJ2JlbG93JztcbiAgICB9XG5cbiAgICBpZiAobmV3UG9zaXRpb24gIT09IHRoaXMuX2N1cnJlbnRQb3NpdGlvbikge1xuICAgICAgY29uc3Qgb3ZlcmxheVJlZiA9IHRoaXMuX292ZXJsYXlSZWY7XG5cbiAgICAgIGlmIChvdmVybGF5UmVmKSB7XG4gICAgICAgIGNvbnN0IGNsYXNzUHJlZml4ID0gYCR7dGhpcy5fY3NzQ2xhc3NQcmVmaXh9LSR7UEFORUxfQ0xBU1N9LWA7XG4gICAgICAgIG92ZXJsYXlSZWYucmVtb3ZlUGFuZWxDbGFzcyhjbGFzc1ByZWZpeCArIHRoaXMuX2N1cnJlbnRQb3NpdGlvbik7XG4gICAgICAgIG92ZXJsYXlSZWYuYWRkUGFuZWxDbGFzcyhjbGFzc1ByZWZpeCArIG5ld1Bvc2l0aW9uKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fY3VycmVudFBvc2l0aW9uID0gbmV3UG9zaXRpb247XG4gICAgfVxuICB9XG5cbiAgLyoqIEJpbmRzIHRoZSBwb2ludGVyIGV2ZW50cyB0byB0aGUgdG9vbHRpcCB0cmlnZ2VyLiAqL1xuICBwcml2YXRlIF9zZXR1cFBvaW50ZXJFbnRlckV2ZW50c0lmTmVlZGVkKCkge1xuICAgIC8vIE9wdGltaXphdGlvbjogRGVmZXIgaG9va2luZyB1cCBldmVudHMgaWYgdGhlcmUncyBubyBtZXNzYWdlIG9yIHRoZSB0b29sdGlwIGlzIGRpc2FibGVkLlxuICAgIGlmICh0aGlzLl9kaXNhYmxlZCB8fCAhdGhpcy5tZXNzYWdlIHx8ICF0aGlzLl92aWV3SW5pdGlhbGl6ZWQgfHxcbiAgICAgICAgdGhpcy5fcGFzc2l2ZUxpc3RlbmVycy5sZW5ndGgpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBUaGUgbW91c2UgZXZlbnRzIHNob3VsZG4ndCBiZSBib3VuZCBvbiBtb2JpbGUgZGV2aWNlcywgYmVjYXVzZSB0aGV5IGNhbiBwcmV2ZW50IHRoZVxuICAgIC8vIGZpcnN0IHRhcCBmcm9tIGZpcmluZyBpdHMgY2xpY2sgZXZlbnQgb3IgY2FuIGNhdXNlIHRoZSB0b29sdGlwIHRvIG9wZW4gZm9yIGNsaWNrcy5cbiAgICBpZiAodGhpcy5fcGxhdGZvcm1TdXBwb3J0c01vdXNlRXZlbnRzKCkpIHtcbiAgICAgIHRoaXMuX3Bhc3NpdmVMaXN0ZW5lcnNcbiAgICAgICAgICAucHVzaChbJ21vdXNlZW50ZXInLCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLl9zZXR1cFBvaW50ZXJFeGl0RXZlbnRzSWZOZWVkZWQoKTtcbiAgICAgICAgICAgIHRoaXMuc2hvdygpO1xuICAgICAgICAgIH1dKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMudG91Y2hHZXN0dXJlcyAhPT0gJ29mZicpIHtcbiAgICAgIHRoaXMuX2Rpc2FibGVOYXRpdmVHZXN0dXJlc0lmTmVjZXNzYXJ5KCk7XG5cbiAgICAgIHRoaXMuX3Bhc3NpdmVMaXN0ZW5lcnNcbiAgICAgICAgICAucHVzaChbJ3RvdWNoc3RhcnQnLCAoKSA9PiB7XG4gICAgICAgICAgICAvLyBOb3RlIHRoYXQgaXQncyBpbXBvcnRhbnQgdGhhdCB3ZSBkb24ndCBgcHJldmVudERlZmF1bHRgIGhlcmUsXG4gICAgICAgICAgICAvLyBiZWNhdXNlIGl0IGNhbiBwcmV2ZW50IGNsaWNrIGV2ZW50cyBmcm9tIGZpcmluZyBvbiB0aGUgZWxlbWVudC5cbiAgICAgICAgICAgIHRoaXMuX3NldHVwUG9pbnRlckV4aXRFdmVudHNJZk5lZWRlZCgpO1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3RvdWNoc3RhcnRUaW1lb3V0KTtcbiAgICAgICAgICAgIHRoaXMuX3RvdWNoc3RhcnRUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB0aGlzLnNob3coKSwgTE9OR1BSRVNTX0RFTEFZKTtcbiAgICAgICAgICB9XSk7XG4gICAgfVxuXG4gICAgdGhpcy5fYWRkTGlzdGVuZXJzKHRoaXMuX3Bhc3NpdmVMaXN0ZW5lcnMpO1xuICB9XG5cbiAgcHJpdmF0ZSBfc2V0dXBQb2ludGVyRXhpdEV2ZW50c0lmTmVlZGVkKCkge1xuICAgIGlmICh0aGlzLl9wb2ludGVyRXhpdEV2ZW50c0luaXRpYWxpemVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX3BvaW50ZXJFeGl0RXZlbnRzSW5pdGlhbGl6ZWQgPSB0cnVlO1xuXG4gICAgY29uc3QgZXhpdExpc3RlbmVyczogKHJlYWRvbmx5IFtzdHJpbmcsIEV2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3RdKVtdID0gW107XG4gICAgaWYgKHRoaXMuX3BsYXRmb3JtU3VwcG9ydHNNb3VzZUV2ZW50cygpKSB7XG4gICAgICBleGl0TGlzdGVuZXJzLnB1c2goXG4gICAgICAgIFsnbW91c2VsZWF2ZScsICgpID0+IHRoaXMuaGlkZSgpXSxcbiAgICAgICAgWyd3aGVlbCcsIGV2ZW50ID0+IHRoaXMuX3doZWVsTGlzdGVuZXIoZXZlbnQgYXMgV2hlZWxFdmVudCldXG4gICAgICApO1xuICAgIH0gZWxzZSBpZiAodGhpcy50b3VjaEdlc3R1cmVzICE9PSAnb2ZmJykge1xuICAgICAgdGhpcy5fZGlzYWJsZU5hdGl2ZUdlc3R1cmVzSWZOZWNlc3NhcnkoKTtcbiAgICAgIGNvbnN0IHRvdWNoZW5kTGlzdGVuZXIgPSAoKSA9PiB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl90b3VjaHN0YXJ0VGltZW91dCk7XG4gICAgICAgIHRoaXMuaGlkZSh0aGlzLl9kZWZhdWx0T3B0aW9ucy50b3VjaGVuZEhpZGVEZWxheSk7XG4gICAgICB9O1xuXG4gICAgICBleGl0TGlzdGVuZXJzLnB1c2goXG4gICAgICAgIFsndG91Y2hlbmQnLCB0b3VjaGVuZExpc3RlbmVyXSxcbiAgICAgICAgWyd0b3VjaGNhbmNlbCcsIHRvdWNoZW5kTGlzdGVuZXJdLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICB0aGlzLl9hZGRMaXN0ZW5lcnMoZXhpdExpc3RlbmVycyk7XG4gICAgdGhpcy5fcGFzc2l2ZUxpc3RlbmVycy5wdXNoKC4uLmV4aXRMaXN0ZW5lcnMpO1xuICB9XG5cbiAgcHJpdmF0ZSBfYWRkTGlzdGVuZXJzKFxuICAgICAgbGlzdGVuZXJzOiAocmVhZG9ubHkgW3N0cmluZywgRXZlbnRMaXN0ZW5lck9yRXZlbnRMaXN0ZW5lck9iamVjdF0pW10pIHtcbiAgICBsaXN0ZW5lcnMuZm9yRWFjaCgoW2V2ZW50LCBsaXN0ZW5lcl0pID0+IHtcbiAgICAgIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBsaXN0ZW5lciwgcGFzc2l2ZUxpc3RlbmVyT3B0aW9ucyk7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIF9wbGF0Zm9ybVN1cHBvcnRzTW91c2VFdmVudHMoKSB7XG4gICAgcmV0dXJuICF0aGlzLl9wbGF0Zm9ybS5JT1MgJiYgIXRoaXMuX3BsYXRmb3JtLkFORFJPSUQ7XG4gIH1cblxuICAvKiogTGlzdGVuZXIgZm9yIHRoZSBgd2hlZWxgIGV2ZW50IG9uIHRoZSBlbGVtZW50LiAqL1xuICBwcml2YXRlIF93aGVlbExpc3RlbmVyKGV2ZW50OiBXaGVlbEV2ZW50KSB7XG4gICAgaWYgKHRoaXMuX2lzVG9vbHRpcFZpc2libGUoKSkge1xuICAgICAgY29uc3QgZWxlbWVudFVuZGVyUG9pbnRlciA9IHRoaXMuX2RvY3VtZW50LmVsZW1lbnRGcm9tUG9pbnQoZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WSk7XG4gICAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50O1xuXG4gICAgICAvLyBPbiBub24tdG91Y2ggZGV2aWNlcyB3ZSBkZXBlbmQgb24gdGhlIGBtb3VzZWxlYXZlYCBldmVudCB0byBjbG9zZSB0aGUgdG9vbHRpcCwgYnV0IGl0XG4gICAgICAvLyB3b24ndCBmaXJlIGlmIHRoZSB1c2VyIHNjcm9sbHMgYXdheSB1c2luZyB0aGUgd2hlZWwgd2l0aG91dCBtb3ZpbmcgdGhlaXIgY3Vyc29yLiBXZVxuICAgICAgLy8gd29yayBhcm91bmQgaXQgYnkgZmluZGluZyB0aGUgZWxlbWVudCB1bmRlciB0aGUgdXNlcidzIGN1cnNvciBhbmQgY2xvc2luZyB0aGUgdG9vbHRpcFxuICAgICAgLy8gaWYgaXQncyBub3QgdGhlIHRyaWdnZXIuXG4gICAgICBpZiAoZWxlbWVudFVuZGVyUG9pbnRlciAhPT0gZWxlbWVudCAmJiAhZWxlbWVudC5jb250YWlucyhlbGVtZW50VW5kZXJQb2ludGVyKSkge1xuICAgICAgICB0aGlzLmhpZGUoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKiogRGlzYWJsZXMgdGhlIG5hdGl2ZSBicm93c2VyIGdlc3R1cmVzLCBiYXNlZCBvbiBob3cgdGhlIHRvb2x0aXAgaGFzIGJlZW4gY29uZmlndXJlZC4gKi9cbiAgcHJpdmF0ZSBfZGlzYWJsZU5hdGl2ZUdlc3R1cmVzSWZOZWNlc3NhcnkoKSB7XG4gICAgY29uc3QgZ2VzdHVyZXMgPSB0aGlzLnRvdWNoR2VzdHVyZXM7XG5cbiAgICBpZiAoZ2VzdHVyZXMgIT09ICdvZmYnKSB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50O1xuICAgICAgY29uc3Qgc3R5bGUgPSBlbGVtZW50LnN0eWxlO1xuXG4gICAgICAvLyBJZiBnZXN0dXJlcyBhcmUgc2V0IHRvIGBhdXRvYCwgd2UgZG9uJ3QgZGlzYWJsZSB0ZXh0IHNlbGVjdGlvbiBvbiBpbnB1dHMgYW5kXG4gICAgICAvLyB0ZXh0YXJlYXMsIGJlY2F1c2UgaXQgcHJldmVudHMgdGhlIHVzZXIgZnJvbSB0eXBpbmcgaW50byB0aGVtIG9uIGlPUyBTYWZhcmkuXG4gICAgICBpZiAoZ2VzdHVyZXMgPT09ICdvbicgfHwgKGVsZW1lbnQubm9kZU5hbWUgIT09ICdJTlBVVCcgJiYgZWxlbWVudC5ub2RlTmFtZSAhPT0gJ1RFWFRBUkVBJykpIHtcbiAgICAgICAgc3R5bGUudXNlclNlbGVjdCA9IChzdHlsZSBhcyBhbnkpLm1zVXNlclNlbGVjdCA9IHN0eWxlLndlYmtpdFVzZXJTZWxlY3QgPVxuICAgICAgICAgICAgKHN0eWxlIGFzIGFueSkuTW96VXNlclNlbGVjdCA9ICdub25lJztcbiAgICAgIH1cblxuICAgICAgLy8gSWYgd2UgaGF2ZSBgYXV0b2AgZ2VzdHVyZXMgYW5kIHRoZSBlbGVtZW50IHVzZXMgbmF0aXZlIEhUTUwgZHJhZ2dpbmcsXG4gICAgICAvLyB3ZSBkb24ndCBzZXQgYC13ZWJraXQtdXNlci1kcmFnYCBiZWNhdXNlIGl0IHByZXZlbnRzIHRoZSBuYXRpdmUgYmVoYXZpb3IuXG4gICAgICBpZiAoZ2VzdHVyZXMgPT09ICdvbicgfHwgIWVsZW1lbnQuZHJhZ2dhYmxlKSB7XG4gICAgICAgIChzdHlsZSBhcyBhbnkpLndlYmtpdFVzZXJEcmFnID0gJ25vbmUnO1xuICAgICAgfVxuXG4gICAgICBzdHlsZS50b3VjaEFjdGlvbiA9ICdub25lJztcbiAgICAgIHN0eWxlLndlYmtpdFRhcEhpZ2hsaWdodENvbG9yID0gJ3RyYW5zcGFyZW50JztcbiAgICB9XG4gIH1cblxuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZGlzYWJsZWQ6IEJvb2xlYW5JbnB1dDtcbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2hpZGVEZWxheTogTnVtYmVySW5wdXQ7XG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zaG93RGVsYXk6IE51bWJlcklucHV0O1xufVxuXG4vKipcbiAqIERpcmVjdGl2ZSB0aGF0IGF0dGFjaGVzIGEgbWF0ZXJpYWwgZGVzaWduIHRvb2x0aXAgdG8gdGhlIGhvc3QgZWxlbWVudC4gQW5pbWF0ZXMgdGhlIHNob3dpbmcgYW5kXG4gKiBoaWRpbmcgb2YgYSB0b29sdGlwIHByb3ZpZGVkIHBvc2l0aW9uIChkZWZhdWx0cyB0byBiZWxvdyB0aGUgZWxlbWVudCkuXG4gKlxuICogaHR0cHM6Ly9tYXRlcmlhbC5pby9kZXNpZ24vY29tcG9uZW50cy90b29sdGlwcy5odG1sXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1ttYXRUb29sdGlwXScsXG4gIGV4cG9ydEFzOiAnbWF0VG9vbHRpcCcsXG4gIGhvc3Q6IHtcbiAgICAnY2xhc3MnOiAnbWF0LXRvb2x0aXAtdHJpZ2dlcidcbiAgfVxufSlcbmV4cG9ydCBjbGFzcyBNYXRUb29sdGlwIGV4dGVuZHMgX01hdFRvb2x0aXBCYXNlPFRvb2x0aXBDb21wb25lbnQ+IHtcbiAgcHJvdGVjdGVkIHJlYWRvbmx5IF90b29sdGlwQ29tcG9uZW50ID0gVG9vbHRpcENvbXBvbmVudDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBvdmVybGF5OiBPdmVybGF5LFxuICAgIGVsZW1lbnRSZWY6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+LFxuICAgIHNjcm9sbERpc3BhdGNoZXI6IFNjcm9sbERpc3BhdGNoZXIsXG4gICAgdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZixcbiAgICBuZ1pvbmU6IE5nWm9uZSxcbiAgICBwbGF0Zm9ybTogUGxhdGZvcm0sXG4gICAgYXJpYURlc2NyaWJlcjogQXJpYURlc2NyaWJlcixcbiAgICBmb2N1c01vbml0b3I6IEZvY3VzTW9uaXRvcixcbiAgICBASW5qZWN0KE1BVF9UT09MVElQX1NDUk9MTF9TVFJBVEVHWSkgc2Nyb2xsU3RyYXRlZ3k6IGFueSxcbiAgICBAT3B0aW9uYWwoKSBkaXI6IERpcmVjdGlvbmFsaXR5LFxuICAgIEBPcHRpb25hbCgpIEBJbmplY3QoTUFUX1RPT0xUSVBfREVGQVVMVF9PUFRJT05TKSBkZWZhdWx0T3B0aW9uczogTWF0VG9vbHRpcERlZmF1bHRPcHRpb25zLFxuICAgIEBJbmplY3QoRE9DVU1FTlQpIF9kb2N1bWVudDogYW55KSB7XG5cbiAgICBzdXBlcihvdmVybGF5LCBlbGVtZW50UmVmLCBzY3JvbGxEaXNwYXRjaGVyLCB2aWV3Q29udGFpbmVyUmVmLCBuZ1pvbmUsIHBsYXRmb3JtLCBhcmlhRGVzY3JpYmVyLFxuICAgICAgZm9jdXNNb25pdG9yLCBzY3JvbGxTdHJhdGVneSwgZGlyLCBkZWZhdWx0T3B0aW9ucywgX2RvY3VtZW50KTtcbiAgfVxufVxuXG5ARGlyZWN0aXZlKClcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBfVG9vbHRpcENvbXBvbmVudEJhc2UgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuICAvKiogTWVzc2FnZSB0byBkaXNwbGF5IGluIHRoZSB0b29sdGlwICovXG4gIG1lc3NhZ2U6IHN0cmluZztcblxuICAvKiogQ2xhc3NlcyB0byBiZSBhZGRlZCB0byB0aGUgdG9vbHRpcC4gU3VwcG9ydHMgdGhlIHNhbWUgc3ludGF4IGFzIGBuZ0NsYXNzYC4gKi9cbiAgdG9vbHRpcENsYXNzOiBzdHJpbmd8c3RyaW5nW118U2V0PHN0cmluZz58e1trZXk6IHN0cmluZ106IGFueX07XG5cbiAgLyoqIFRoZSB0aW1lb3V0IElEIG9mIGFueSBjdXJyZW50IHRpbWVyIHNldCB0byBzaG93IHRoZSB0b29sdGlwICovXG4gIF9zaG93VGltZW91dElkOiBudW1iZXIgfCB1bmRlZmluZWQ7XG5cbiAgLyoqIFRoZSB0aW1lb3V0IElEIG9mIGFueSBjdXJyZW50IHRpbWVyIHNldCB0byBoaWRlIHRoZSB0b29sdGlwICovXG4gIF9oaWRlVGltZW91dElkOiBudW1iZXIgfCB1bmRlZmluZWQ7XG5cbiAgLyoqIFByb3BlcnR5IHdhdGNoZWQgYnkgdGhlIGFuaW1hdGlvbiBmcmFtZXdvcmsgdG8gc2hvdyBvciBoaWRlIHRoZSB0b29sdGlwICovXG4gIF92aXNpYmlsaXR5OiBUb29sdGlwVmlzaWJpbGl0eSA9ICdpbml0aWFsJztcblxuICAvKiogV2hldGhlciBpbnRlcmFjdGlvbnMgb24gdGhlIHBhZ2Ugc2hvdWxkIGNsb3NlIHRoZSB0b29sdGlwICovXG4gIHByaXZhdGUgX2Nsb3NlT25JbnRlcmFjdGlvbjogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIC8qKiBTdWJqZWN0IGZvciBub3RpZnlpbmcgdGhhdCB0aGUgdG9vbHRpcCBoYXMgYmVlbiBoaWRkZW4gZnJvbSB0aGUgdmlldyAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9vbkhpZGU6IFN1YmplY3Q8dm9pZD4gPSBuZXcgU3ViamVjdCgpO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX2NoYW5nZURldGVjdG9yUmVmOiBDaGFuZ2VEZXRlY3RvclJlZikge31cblxuICAvKipcbiAgICogU2hvd3MgdGhlIHRvb2x0aXAgd2l0aCBhbiBhbmltYXRpb24gb3JpZ2luYXRpbmcgZnJvbSB0aGUgcHJvdmlkZWQgb3JpZ2luXG4gICAqIEBwYXJhbSBkZWxheSBBbW91bnQgb2YgbWlsbGlzZWNvbmRzIHRvIHRoZSBkZWxheSBzaG93aW5nIHRoZSB0b29sdGlwLlxuICAgKi9cbiAgc2hvdyhkZWxheTogbnVtYmVyKTogdm9pZCB7XG4gICAgLy8gQ2FuY2VsIHRoZSBkZWxheWVkIGhpZGUgaWYgaXQgaXMgc2NoZWR1bGVkXG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuX2hpZGVUaW1lb3V0SWQpO1xuXG4gICAgLy8gQm9keSBpbnRlcmFjdGlvbnMgc2hvdWxkIGNhbmNlbCB0aGUgdG9vbHRpcCBpZiB0aGVyZSBpcyBhIGRlbGF5IGluIHNob3dpbmcuXG4gICAgdGhpcy5fY2xvc2VPbkludGVyYWN0aW9uID0gdHJ1ZTtcbiAgICB0aGlzLl9zaG93VGltZW91dElkID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0aGlzLl92aXNpYmlsaXR5ID0gJ3Zpc2libGUnO1xuICAgICAgdGhpcy5fc2hvd1RpbWVvdXRJZCA9IHVuZGVmaW5lZDtcblxuICAgICAgLy8gTWFyayBmb3IgY2hlY2sgc28gaWYgYW55IHBhcmVudCBjb21wb25lbnQgaGFzIHNldCB0aGVcbiAgICAgIC8vIENoYW5nZURldGVjdGlvblN0cmF0ZWd5IHRvIE9uUHVzaCBpdCB3aWxsIGJlIGNoZWNrZWQgYW55d2F5c1xuICAgICAgdGhpcy5fbWFya0ZvckNoZWNrKCk7XG4gICAgfSwgZGVsYXkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEJlZ2lucyB0aGUgYW5pbWF0aW9uIHRvIGhpZGUgdGhlIHRvb2x0aXAgYWZ0ZXIgdGhlIHByb3ZpZGVkIGRlbGF5IGluIG1zLlxuICAgKiBAcGFyYW0gZGVsYXkgQW1vdW50IG9mIG1pbGxpc2Vjb25kcyB0byBkZWxheSBzaG93aW5nIHRoZSB0b29sdGlwLlxuICAgKi9cbiAgaGlkZShkZWxheTogbnVtYmVyKTogdm9pZCB7XG4gICAgLy8gQ2FuY2VsIHRoZSBkZWxheWVkIHNob3cgaWYgaXQgaXMgc2NoZWR1bGVkXG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuX3Nob3dUaW1lb3V0SWQpO1xuXG4gICAgdGhpcy5faGlkZVRpbWVvdXRJZCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy5fdmlzaWJpbGl0eSA9ICdoaWRkZW4nO1xuICAgICAgdGhpcy5faGlkZVRpbWVvdXRJZCA9IHVuZGVmaW5lZDtcblxuICAgICAgLy8gTWFyayBmb3IgY2hlY2sgc28gaWYgYW55IHBhcmVudCBjb21wb25lbnQgaGFzIHNldCB0aGVcbiAgICAgIC8vIENoYW5nZURldGVjdGlvblN0cmF0ZWd5IHRvIE9uUHVzaCBpdCB3aWxsIGJlIGNoZWNrZWQgYW55d2F5c1xuICAgICAgdGhpcy5fbWFya0ZvckNoZWNrKCk7XG4gICAgfSwgZGVsYXkpO1xuICB9XG5cbiAgLyoqIFJldHVybnMgYW4gb2JzZXJ2YWJsZSB0aGF0IG5vdGlmaWVzIHdoZW4gdGhlIHRvb2x0aXAgaGFzIGJlZW4gaGlkZGVuIGZyb20gdmlldy4gKi9cbiAgYWZ0ZXJIaWRkZW4oKTogT2JzZXJ2YWJsZTx2b2lkPiB7XG4gICAgcmV0dXJuIHRoaXMuX29uSGlkZTtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSB0b29sdGlwIGlzIGJlaW5nIGRpc3BsYXllZC4gKi9cbiAgaXNWaXNpYmxlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl92aXNpYmlsaXR5ID09PSAndmlzaWJsZSc7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICBjbGVhclRpbWVvdXQodGhpcy5fc2hvd1RpbWVvdXRJZCk7XG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuX2hpZGVUaW1lb3V0SWQpO1xuICAgIHRoaXMuX29uSGlkZS5jb21wbGV0ZSgpO1xuICB9XG5cbiAgX2FuaW1hdGlvblN0YXJ0KCkge1xuICAgIHRoaXMuX2Nsb3NlT25JbnRlcmFjdGlvbiA9IGZhbHNlO1xuICB9XG5cbiAgX2FuaW1hdGlvbkRvbmUoZXZlbnQ6IEFuaW1hdGlvbkV2ZW50KTogdm9pZCB7XG4gICAgY29uc3QgdG9TdGF0ZSA9IGV2ZW50LnRvU3RhdGUgYXMgVG9vbHRpcFZpc2liaWxpdHk7XG5cbiAgICBpZiAodG9TdGF0ZSA9PT0gJ2hpZGRlbicgJiYgIXRoaXMuaXNWaXNpYmxlKCkpIHtcbiAgICAgIHRoaXMuX29uSGlkZS5uZXh0KCk7XG4gICAgfVxuXG4gICAgaWYgKHRvU3RhdGUgPT09ICd2aXNpYmxlJyB8fCB0b1N0YXRlID09PSAnaGlkZGVuJykge1xuICAgICAgdGhpcy5fY2xvc2VPbkludGVyYWN0aW9uID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogSW50ZXJhY3Rpb25zIG9uIHRoZSBIVE1MIGJvZHkgc2hvdWxkIGNsb3NlIHRoZSB0b29sdGlwIGltbWVkaWF0ZWx5IGFzIGRlZmluZWQgaW4gdGhlXG4gICAqIG1hdGVyaWFsIGRlc2lnbiBzcGVjLlxuICAgKiBodHRwczovL21hdGVyaWFsLmlvL2Rlc2lnbi9jb21wb25lbnRzL3Rvb2x0aXBzLmh0bWwjYmVoYXZpb3JcbiAgICovXG4gIF9oYW5kbGVCb2R5SW50ZXJhY3Rpb24oKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2Nsb3NlT25JbnRlcmFjdGlvbikge1xuICAgICAgdGhpcy5oaWRlKDApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBNYXJrcyB0aGF0IHRoZSB0b29sdGlwIG5lZWRzIHRvIGJlIGNoZWNrZWQgaW4gdGhlIG5leHQgY2hhbmdlIGRldGVjdGlvbiBydW4uXG4gICAqIE1haW5seSB1c2VkIGZvciByZW5kZXJpbmcgdGhlIGluaXRpYWwgdGV4dCBiZWZvcmUgcG9zaXRpb25pbmcgYSB0b29sdGlwLCB3aGljaFxuICAgKiBjYW4gYmUgcHJvYmxlbWF0aWMgaW4gY29tcG9uZW50cyB3aXRoIE9uUHVzaCBjaGFuZ2UgZGV0ZWN0aW9uLlxuICAgKi9cbiAgX21hcmtGb3JDaGVjaygpOiB2b2lkIHtcbiAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZi5tYXJrRm9yQ2hlY2soKTtcbiAgfVxufVxuXG4vKipcbiAqIEludGVybmFsIGNvbXBvbmVudCB0aGF0IHdyYXBzIHRoZSB0b29sdGlwJ3MgY29udGVudC5cbiAqIEBkb2NzLXByaXZhdGVcbiAqL1xuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbWF0LXRvb2x0aXAtY29tcG9uZW50JyxcbiAgdGVtcGxhdGVVcmw6ICd0b29sdGlwLmh0bWwnLFxuICBzdHlsZVVybHM6IFsndG9vbHRpcC5jc3MnXSxcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXG4gIGFuaW1hdGlvbnM6IFttYXRUb29sdGlwQW5pbWF0aW9ucy50b29sdGlwU3RhdGVdLFxuICBob3N0OiB7XG4gICAgLy8gRm9yY2VzIHRoZSBlbGVtZW50IHRvIGhhdmUgYSBsYXlvdXQgaW4gSUUgYW5kIEVkZ2UuIFRoaXMgZml4ZXMgaXNzdWVzIHdoZXJlIHRoZSBlbGVtZW50XG4gICAgLy8gd29uJ3QgYmUgcmVuZGVyZWQgaWYgdGhlIGFuaW1hdGlvbnMgYXJlIGRpc2FibGVkIG9yIHRoZXJlIGlzIG5vIHdlYiBhbmltYXRpb25zIHBvbHlmaWxsLlxuICAgICdbc3R5bGUuem9vbV0nOiAnX3Zpc2liaWxpdHkgPT09IFwidmlzaWJsZVwiID8gMSA6IG51bGwnLFxuICAgICcoYm9keTpjbGljayknOiAndGhpcy5faGFuZGxlQm9keUludGVyYWN0aW9uKCknLFxuICAgICcoYm9keTphdXhjbGljayknOiAndGhpcy5faGFuZGxlQm9keUludGVyYWN0aW9uKCknLFxuICAgICdhcmlhLWhpZGRlbic6ICd0cnVlJyxcbiAgfVxufSlcbmV4cG9ydCBjbGFzcyBUb29sdGlwQ29tcG9uZW50IGV4dGVuZHMgX1Rvb2x0aXBDb21wb25lbnRCYXNlIHtcbiAgLyoqIFN0cmVhbSB0aGF0IGVtaXRzIHdoZXRoZXIgdGhlIHVzZXIgaGFzIGEgaGFuZHNldC1zaXplZCBkaXNwbGF5LiAgKi9cbiAgX2lzSGFuZHNldDogT2JzZXJ2YWJsZTxCcmVha3BvaW50U3RhdGU+ID0gdGhpcy5fYnJlYWtwb2ludE9ic2VydmVyLm9ic2VydmUoQnJlYWtwb2ludHMuSGFuZHNldCk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgY2hhbmdlRGV0ZWN0b3JSZWY6IENoYW5nZURldGVjdG9yUmVmLFxuICAgIHByaXZhdGUgX2JyZWFrcG9pbnRPYnNlcnZlcjogQnJlYWtwb2ludE9ic2VydmVyKSB7XG4gICAgc3VwZXIoY2hhbmdlRGV0ZWN0b3JSZWYpO1xuICB9XG59XG4iXX0=