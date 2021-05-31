/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { FocusMonitor } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { coerceBooleanProperty, coerceNumberProperty } from '@angular/cdk/coercion';
import { DOWN_ARROW, END, HOME, LEFT_ARROW, PAGE_DOWN, PAGE_UP, RIGHT_ARROW, UP_ARROW, hasModifierKey, } from '@angular/cdk/keycodes';
import { Attribute, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, forwardRef, Inject, Input, Optional, Output, ViewChild, ViewEncapsulation, NgZone, } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { mixinColor, mixinDisabled, mixinTabIndex, } from '@angular/material/core';
import { ANIMATION_MODULE_TYPE } from '@angular/platform-browser/animations';
import { normalizePassiveListenerOptions } from '@angular/cdk/platform';
import { DOCUMENT } from '@angular/common';
import { Subscription } from 'rxjs';
const activeEventOptions = normalizePassiveListenerOptions({ passive: false });
/**
 * Visually, a 30px separation between tick marks looks best. This is very subjective but it is
 * the default separation we chose.
 */
const MIN_AUTO_TICK_SEPARATION = 30;
/** The thumb gap size for a disabled slider. */
const DISABLED_THUMB_GAP = 7;
/** The thumb gap size for a non-active slider at its minimum value. */
const MIN_VALUE_NONACTIVE_THUMB_GAP = 7;
/** The thumb gap size for an active slider at its minimum value. */
const MIN_VALUE_ACTIVE_THUMB_GAP = 10;
/**
 * Provider Expression that allows mat-slider to register as a ControlValueAccessor.
 * This allows it to support [(ngModel)] and [formControl].
 * @docs-private
 */
export const MAT_SLIDER_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => MatSlider),
    multi: true
};
/** A simple change event emitted by the MatSlider component. */
export class MatSliderChange {
}
// Boilerplate for applying mixins to MatSlider.
/** @docs-private */
class MatSliderBase {
    constructor(_elementRef) {
        this._elementRef = _elementRef;
    }
}
const _MatSliderMixinBase = mixinTabIndex(mixinColor(mixinDisabled(MatSliderBase), 'accent'));
/**
 * Allows users to select from a range of values by moving the slider thumb. It is similar in
 * behavior to the native `<input type="range">` element.
 */
export class MatSlider extends _MatSliderMixinBase {
    constructor(elementRef, _focusMonitor, _changeDetectorRef, _dir, tabIndex, _ngZone, _document, _animationMode) {
        super(elementRef);
        this._focusMonitor = _focusMonitor;
        this._changeDetectorRef = _changeDetectorRef;
        this._dir = _dir;
        this._ngZone = _ngZone;
        this._animationMode = _animationMode;
        this._invert = false;
        this._max = 100;
        this._min = 0;
        this._step = 1;
        this._thumbLabel = false;
        this._tickInterval = 0;
        this._value = null;
        this._vertical = false;
        /** Event emitted when the slider value has changed. */
        this.change = new EventEmitter();
        /** Event emitted when the slider thumb moves. */
        this.input = new EventEmitter();
        /**
         * Emits when the raw value of the slider changes. This is here primarily
         * to facilitate the two-way binding for the `value` input.
         * @docs-private
         */
        this.valueChange = new EventEmitter();
        /** onTouch function registered via registerOnTouch (ControlValueAccessor). */
        this.onTouched = () => { };
        this._percent = 0;
        /**
         * Whether or not the thumb is sliding.
         * Used to determine if there should be a transition for the thumb and fill track.
         */
        this._isSliding = false;
        /**
         * Whether or not the slider is active (clicked or sliding).
         * Used to shrink and grow the thumb as according to the Material Design spec.
         */
        this._isActive = false;
        /** The size of a tick interval as a percentage of the size of the track. */
        this._tickIntervalPercent = 0;
        /** The dimensions of the slider. */
        this._sliderDimensions = null;
        this._controlValueAccessorChangeFn = () => { };
        /** Subscription to the Directionality change EventEmitter. */
        this._dirChangeSubscription = Subscription.EMPTY;
        /** Called when the user has put their pointer down on the slider. */
        this._pointerDown = (event) => {
            // Don't do anything if the slider is disabled or the
            // user is using anything other than the main mouse button.
            if (this.disabled || this._isSliding || (!isTouchEvent(event) && event.button !== 0)) {
                return;
            }
            this._ngZone.run(() => {
                const oldValue = this.value;
                const pointerPosition = getPointerPositionOnPage(event);
                this._isSliding = true;
                this._lastPointerEvent = event;
                event.preventDefault();
                this._focusHostElement();
                this._onMouseenter(); // Simulate mouseenter in case this is a mobile device.
                this._bindGlobalEvents(event);
                this._focusHostElement();
                this._updateValueFromPosition(pointerPosition);
                this._valueOnSlideStart = oldValue;
                // Emit a change and input event if the value changed.
                if (oldValue != this.value) {
                    this._emitInputEvent();
                }
            });
        };
        /**
         * Called when the user has moved their pointer after
         * starting to drag. Bound on the document level.
         */
        this._pointerMove = (event) => {
            if (this._isSliding) {
                // Prevent the slide from selecting anything else.
                event.preventDefault();
                const oldValue = this.value;
                this._lastPointerEvent = event;
                this._updateValueFromPosition(getPointerPositionOnPage(event));
                // Native range elements always emit `input` events when the value changed while sliding.
                if (oldValue != this.value) {
                    this._emitInputEvent();
                }
            }
        };
        /** Called when the user has lifted their pointer. Bound on the document level. */
        this._pointerUp = (event) => {
            if (this._isSliding) {
                event.preventDefault();
                this._removeGlobalEvents();
                this._isSliding = false;
                if (this._valueOnSlideStart != this.value && !this.disabled) {
                    this._emitChangeEvent();
                }
                this._valueOnSlideStart = this._lastPointerEvent = null;
            }
        };
        /** Called when the window has lost focus. */
        this._windowBlur = () => {
            // If the window is blurred while dragging we need to stop dragging because the
            // browser won't dispatch the `mouseup` and `touchend` events anymore.
            if (this._lastPointerEvent) {
                this._pointerUp(this._lastPointerEvent);
            }
        };
        this._document = _document;
        this.tabIndex = parseInt(tabIndex) || 0;
        _ngZone.runOutsideAngular(() => {
            const element = elementRef.nativeElement;
            element.addEventListener('mousedown', this._pointerDown, activeEventOptions);
            element.addEventListener('touchstart', this._pointerDown, activeEventOptions);
        });
    }
    /** Whether the slider is inverted. */
    get invert() { return this._invert; }
    set invert(value) {
        this._invert = coerceBooleanProperty(value);
    }
    /** The maximum value that the slider can have. */
    get max() { return this._max; }
    set max(v) {
        this._max = coerceNumberProperty(v, this._max);
        this._percent = this._calculatePercentage(this._value);
        // Since this also modifies the percentage, we need to let the change detection know.
        this._changeDetectorRef.markForCheck();
    }
    /** The minimum value that the slider can have. */
    get min() { return this._min; }
    set min(v) {
        this._min = coerceNumberProperty(v, this._min);
        // If the value wasn't explicitly set by the user, set it to the min.
        if (this._value === null) {
            this.value = this._min;
        }
        this._percent = this._calculatePercentage(this._value);
        // Since this also modifies the percentage, we need to let the change detection know.
        this._changeDetectorRef.markForCheck();
    }
    /** The values at which the thumb will snap. */
    get step() { return this._step; }
    set step(v) {
        this._step = coerceNumberProperty(v, this._step);
        if (this._step % 1 !== 0) {
            this._roundToDecimal = this._step.toString().split('.').pop().length;
        }
        // Since this could modify the label, we need to notify the change detection.
        this._changeDetectorRef.markForCheck();
    }
    /** Whether or not to show the thumb label. */
    get thumbLabel() { return this._thumbLabel; }
    set thumbLabel(value) { this._thumbLabel = coerceBooleanProperty(value); }
    /**
     * How often to show ticks. Relative to the step so that a tick always appears on a step.
     * Ex: Tick interval of 4 with a step of 3 will draw a tick every 4 steps (every 12 values).
     */
    get tickInterval() { return this._tickInterval; }
    set tickInterval(value) {
        if (value === 'auto') {
            this._tickInterval = 'auto';
        }
        else if (typeof value === 'number' || typeof value === 'string') {
            this._tickInterval = coerceNumberProperty(value, this._tickInterval);
        }
        else {
            this._tickInterval = 0;
        }
    }
    /** Value of the slider. */
    get value() {
        // If the value needs to be read and it is still uninitialized, initialize it to the min.
        if (this._value === null) {
            this.value = this._min;
        }
        return this._value;
    }
    set value(v) {
        if (v !== this._value) {
            let value = coerceNumberProperty(v);
            // While incrementing by a decimal we can end up with values like 33.300000000000004.
            // Truncate it to ensure that it matches the label and to make it easier to work with.
            if (this._roundToDecimal && value !== this.min && value !== this.max) {
                value = parseFloat(value.toFixed(this._roundToDecimal));
            }
            this._value = value;
            this._percent = this._calculatePercentage(this._value);
            // Since this also modifies the percentage, we need to let the change detection know.
            this._changeDetectorRef.markForCheck();
        }
    }
    /** Whether the slider is vertical. */
    get vertical() { return this._vertical; }
    set vertical(value) {
        this._vertical = coerceBooleanProperty(value);
    }
    /** The value to be used for display purposes. */
    get displayValue() {
        if (this.displayWith) {
            // Value is never null but since setters and getters cannot have
            // different types, the value getter is also typed to return null.
            return this.displayWith(this.value);
        }
        // Note that this could be improved further by rounding something like 0.999 to 1 or
        // 0.899 to 0.9, however it is very performance sensitive, because it gets called on
        // every change detection cycle.
        if (this._roundToDecimal && this.value && this.value % 1 !== 0) {
            return this.value.toFixed(this._roundToDecimal);
        }
        return this.value || 0;
    }
    /** set focus to the host element */
    focus(options) {
        this._focusHostElement(options);
    }
    /** blur the host element */
    blur() {
        this._blurHostElement();
    }
    /** The percentage of the slider that coincides with the value. */
    get percent() { return this._clamp(this._percent); }
    /**
     * Whether the axis of the slider is inverted.
     * (i.e. whether moving the thumb in the positive x or y direction decreases the slider's value).
     */
    _shouldInvertAxis() {
        // Standard non-inverted mode for a vertical slider should be dragging the thumb from bottom to
        // top. However from a y-axis standpoint this is inverted.
        return this.vertical ? !this.invert : this.invert;
    }
    /** Whether the slider is at its minimum value. */
    _isMinValue() {
        return this.percent === 0;
    }
    /**
     * The amount of space to leave between the slider thumb and the track fill & track background
     * elements.
     */
    _getThumbGap() {
        if (this.disabled) {
            return DISABLED_THUMB_GAP;
        }
        if (this._isMinValue() && !this.thumbLabel) {
            return this._isActive ? MIN_VALUE_ACTIVE_THUMB_GAP : MIN_VALUE_NONACTIVE_THUMB_GAP;
        }
        return 0;
    }
    /** CSS styles for the track background element. */
    _getTrackBackgroundStyles() {
        const axis = this.vertical ? 'Y' : 'X';
        const scale = this.vertical ? `1, ${1 - this.percent}, 1` : `${1 - this.percent}, 1, 1`;
        const sign = this._shouldInvertMouseCoords() ? '-' : '';
        return {
            // scale3d avoids some rendering issues in Chrome. See #12071.
            transform: `translate${axis}(${sign}${this._getThumbGap()}px) scale3d(${scale})`
        };
    }
    /** CSS styles for the track fill element. */
    _getTrackFillStyles() {
        const percent = this.percent;
        const axis = this.vertical ? 'Y' : 'X';
        const scale = this.vertical ? `1, ${percent}, 1` : `${percent}, 1, 1`;
        const sign = this._shouldInvertMouseCoords() ? '' : '-';
        return {
            // scale3d avoids some rendering issues in Chrome. See #12071.
            transform: `translate${axis}(${sign}${this._getThumbGap()}px) scale3d(${scale})`,
            // iOS Safari has a bug where it won't re-render elements which start of as `scale(0)` until
            // something forces a style recalculation on it. Since we'll end up with `scale(0)` when
            // the value of the slider is 0, we can easily get into this situation. We force a
            // recalculation by changing the element's `display` when it goes from 0 to any other value.
            display: percent === 0 ? 'none' : ''
        };
    }
    /** CSS styles for the ticks container element. */
    _getTicksContainerStyles() {
        let axis = this.vertical ? 'Y' : 'X';
        // For a horizontal slider in RTL languages we push the ticks container off the left edge
        // instead of the right edge to avoid causing a horizontal scrollbar to appear.
        let sign = !this.vertical && this._getDirection() == 'rtl' ? '' : '-';
        let offset = this._tickIntervalPercent / 2 * 100;
        return {
            'transform': `translate${axis}(${sign}${offset}%)`
        };
    }
    /** CSS styles for the ticks element. */
    _getTicksStyles() {
        let tickSize = this._tickIntervalPercent * 100;
        let backgroundSize = this.vertical ? `2px ${tickSize}%` : `${tickSize}% 2px`;
        let axis = this.vertical ? 'Y' : 'X';
        // Depending on the direction we pushed the ticks container, push the ticks the opposite
        // direction to re-center them but clip off the end edge. In RTL languages we need to flip the
        // ticks 180 degrees so we're really cutting off the end edge abd not the start.
        let sign = !this.vertical && this._getDirection() == 'rtl' ? '-' : '';
        let rotate = !this.vertical && this._getDirection() == 'rtl' ? ' rotate(180deg)' : '';
        let styles = {
            'backgroundSize': backgroundSize,
            // Without translateZ ticks sometimes jitter as the slider moves on Chrome & Firefox.
            'transform': `translateZ(0) translate${axis}(${sign}${tickSize / 2}%)${rotate}`
        };
        if (this._isMinValue() && this._getThumbGap()) {
            const shouldInvertAxis = this._shouldInvertAxis();
            let side;
            if (this.vertical) {
                side = shouldInvertAxis ? 'Bottom' : 'Top';
            }
            else {
                side = shouldInvertAxis ? 'Right' : 'Left';
            }
            styles[`padding${side}`] = `${this._getThumbGap()}px`;
        }
        return styles;
    }
    _getThumbContainerStyles() {
        const shouldInvertAxis = this._shouldInvertAxis();
        let axis = this.vertical ? 'Y' : 'X';
        // For a horizontal slider in RTL languages we push the thumb container off the left edge
        // instead of the right edge to avoid causing a horizontal scrollbar to appear.
        let invertOffset = (this._getDirection() == 'rtl' && !this.vertical) ? !shouldInvertAxis : shouldInvertAxis;
        let offset = (invertOffset ? this.percent : 1 - this.percent) * 100;
        return {
            'transform': `translate${axis}(-${offset}%)`
        };
    }
    /**
     * Whether mouse events should be converted to a slider position by calculating their distance
     * from the right or bottom edge of the slider as opposed to the top or left.
     */
    _shouldInvertMouseCoords() {
        const shouldInvertAxis = this._shouldInvertAxis();
        return (this._getDirection() == 'rtl' && !this.vertical) ? !shouldInvertAxis : shouldInvertAxis;
    }
    /** The language direction for this slider element. */
    _getDirection() {
        return (this._dir && this._dir.value == 'rtl') ? 'rtl' : 'ltr';
    }
    ngAfterViewInit() {
        this._focusMonitor
            .monitor(this._elementRef, true)
            .subscribe((origin) => {
            this._isActive = !!origin && origin !== 'keyboard';
            this._changeDetectorRef.detectChanges();
        });
        if (this._dir) {
            this._dirChangeSubscription = this._dir.change.subscribe(() => {
                this._changeDetectorRef.markForCheck();
            });
        }
    }
    ngOnDestroy() {
        const element = this._elementRef.nativeElement;
        element.removeEventListener('mousedown', this._pointerDown, activeEventOptions);
        element.removeEventListener('touchstart', this._pointerDown, activeEventOptions);
        this._lastPointerEvent = null;
        this._removeGlobalEvents();
        this._focusMonitor.stopMonitoring(this._elementRef);
        this._dirChangeSubscription.unsubscribe();
    }
    _onMouseenter() {
        if (this.disabled) {
            return;
        }
        // We save the dimensions of the slider here so we can use them to update the spacing of the
        // ticks and determine where on the slider click and slide events happen.
        this._sliderDimensions = this._getSliderDimensions();
        this._updateTickIntervalPercent();
    }
    _onFocus() {
        // We save the dimensions of the slider here so we can use them to update the spacing of the
        // ticks and determine where on the slider click and slide events happen.
        this._sliderDimensions = this._getSliderDimensions();
        this._updateTickIntervalPercent();
    }
    _onBlur() {
        this.onTouched();
    }
    _onKeydown(event) {
        if (this.disabled || hasModifierKey(event)) {
            return;
        }
        const oldValue = this.value;
        switch (event.keyCode) {
            case PAGE_UP:
                this._increment(10);
                break;
            case PAGE_DOWN:
                this._increment(-10);
                break;
            case END:
                this.value = this.max;
                break;
            case HOME:
                this.value = this.min;
                break;
            case LEFT_ARROW:
                // NOTE: For a sighted user it would make more sense that when they press an arrow key on an
                // inverted slider the thumb moves in that direction. However for a blind user, nothing
                // about the slider indicates that it is inverted. They will expect left to be decrement,
                // regardless of how it appears on the screen. For speakers ofRTL languages, they probably
                // expect left to mean increment. Therefore we flip the meaning of the side arrow keys for
                // RTL. For inverted sliders we prefer a good a11y experience to having it "look right" for
                // sighted users, therefore we do not swap the meaning.
                this._increment(this._getDirection() == 'rtl' ? 1 : -1);
                break;
            case UP_ARROW:
                this._increment(1);
                break;
            case RIGHT_ARROW:
                // See comment on LEFT_ARROW about the conditions under which we flip the meaning.
                this._increment(this._getDirection() == 'rtl' ? -1 : 1);
                break;
            case DOWN_ARROW:
                this._increment(-1);
                break;
            default:
                // Return if the key is not one that we explicitly handle to avoid calling preventDefault on
                // it.
                return;
        }
        if (oldValue != this.value) {
            this._emitInputEvent();
            this._emitChangeEvent();
        }
        this._isSliding = true;
        event.preventDefault();
    }
    _onKeyup() {
        this._isSliding = false;
    }
    /** Use defaultView of injected document if available or fallback to global window reference */
    _getWindow() {
        return this._document.defaultView || window;
    }
    /**
     * Binds our global move and end events. They're bound at the document level and only while
     * dragging so that the user doesn't have to keep their pointer exactly over the slider
     * as they're swiping across the screen.
     */
    _bindGlobalEvents(triggerEvent) {
        // Note that we bind the events to the `document`, because it allows us to capture
        // drag cancel events where the user's pointer is outside the browser window.
        const document = this._document;
        const isTouch = isTouchEvent(triggerEvent);
        const moveEventName = isTouch ? 'touchmove' : 'mousemove';
        const endEventName = isTouch ? 'touchend' : 'mouseup';
        document.addEventListener(moveEventName, this._pointerMove, activeEventOptions);
        document.addEventListener(endEventName, this._pointerUp, activeEventOptions);
        if (isTouch) {
            document.addEventListener('touchcancel', this._pointerUp, activeEventOptions);
        }
        const window = this._getWindow();
        if (typeof window !== 'undefined' && window) {
            window.addEventListener('blur', this._windowBlur);
        }
    }
    /** Removes any global event listeners that we may have added. */
    _removeGlobalEvents() {
        const document = this._document;
        document.removeEventListener('mousemove', this._pointerMove, activeEventOptions);
        document.removeEventListener('mouseup', this._pointerUp, activeEventOptions);
        document.removeEventListener('touchmove', this._pointerMove, activeEventOptions);
        document.removeEventListener('touchend', this._pointerUp, activeEventOptions);
        document.removeEventListener('touchcancel', this._pointerUp, activeEventOptions);
        const window = this._getWindow();
        if (typeof window !== 'undefined' && window) {
            window.removeEventListener('blur', this._windowBlur);
        }
    }
    /** Increments the slider by the given number of steps (negative number decrements). */
    _increment(numSteps) {
        this.value = this._clamp((this.value || 0) + this.step * numSteps, this.min, this.max);
    }
    /** Calculate the new value from the new physical location. The value will always be snapped. */
    _updateValueFromPosition(pos) {
        if (!this._sliderDimensions) {
            return;
        }
        let offset = this.vertical ? this._sliderDimensions.top : this._sliderDimensions.left;
        let size = this.vertical ? this._sliderDimensions.height : this._sliderDimensions.width;
        let posComponent = this.vertical ? pos.y : pos.x;
        // The exact value is calculated from the event and used to find the closest snap value.
        let percent = this._clamp((posComponent - offset) / size);
        if (this._shouldInvertMouseCoords()) {
            percent = 1 - percent;
        }
        // Since the steps may not divide cleanly into the max value, if the user
        // slid to 0 or 100 percent, we jump to the min/max value. This approach
        // is slightly more intuitive than using `Math.ceil` below, because it
        // follows the user's pointer closer.
        if (percent === 0) {
            this.value = this.min;
        }
        else if (percent === 1) {
            this.value = this.max;
        }
        else {
            const exactValue = this._calculateValue(percent);
            // This calculation finds the closest step by finding the closest
            // whole number divisible by the step relative to the min.
            const closestValue = Math.round((exactValue - this.min) / this.step) * this.step + this.min;
            // The value needs to snap to the min and max.
            this.value = this._clamp(closestValue, this.min, this.max);
        }
    }
    /** Emits a change event if the current value is different from the last emitted value. */
    _emitChangeEvent() {
        this._controlValueAccessorChangeFn(this.value);
        this.valueChange.emit(this.value);
        this.change.emit(this._createChangeEvent());
    }
    /** Emits an input event when the current value is different from the last emitted value. */
    _emitInputEvent() {
        this.input.emit(this._createChangeEvent());
    }
    /** Updates the amount of space between ticks as a percentage of the width of the slider. */
    _updateTickIntervalPercent() {
        if (!this.tickInterval || !this._sliderDimensions) {
            return;
        }
        if (this.tickInterval == 'auto') {
            let trackSize = this.vertical ? this._sliderDimensions.height : this._sliderDimensions.width;
            let pixelsPerStep = trackSize * this.step / (this.max - this.min);
            let stepsPerTick = Math.ceil(MIN_AUTO_TICK_SEPARATION / pixelsPerStep);
            let pixelsPerTick = stepsPerTick * this.step;
            this._tickIntervalPercent = pixelsPerTick / trackSize;
        }
        else {
            this._tickIntervalPercent = this.tickInterval * this.step / (this.max - this.min);
        }
    }
    /** Creates a slider change object from the specified value. */
    _createChangeEvent(value = this.value) {
        let event = new MatSliderChange();
        event.source = this;
        event.value = value;
        return event;
    }
    /** Calculates the percentage of the slider that a value is. */
    _calculatePercentage(value) {
        return ((value || 0) - this.min) / (this.max - this.min);
    }
    /** Calculates the value a percentage of the slider corresponds to. */
    _calculateValue(percentage) {
        return this.min + percentage * (this.max - this.min);
    }
    /** Return a number between two numbers. */
    _clamp(value, min = 0, max = 1) {
        return Math.max(min, Math.min(value, max));
    }
    /**
     * Get the bounding client rect of the slider track element.
     * The track is used rather than the native element to ignore the extra space that the thumb can
     * take up.
     */
    _getSliderDimensions() {
        return this._sliderWrapper ? this._sliderWrapper.nativeElement.getBoundingClientRect() : null;
    }
    /**
     * Focuses the native element.
     * Currently only used to allow a blur event to fire but will be used with keyboard input later.
     */
    _focusHostElement(options) {
        this._elementRef.nativeElement.focus(options);
    }
    /** Blurs the native element. */
    _blurHostElement() {
        this._elementRef.nativeElement.blur();
    }
    /**
     * Sets the model value. Implemented as part of ControlValueAccessor.
     * @param value
     */
    writeValue(value) {
        this.value = value;
    }
    /**
     * Registers a callback to be triggered when the value has changed.
     * Implemented as part of ControlValueAccessor.
     * @param fn Callback to be registered.
     */
    registerOnChange(fn) {
        this._controlValueAccessorChangeFn = fn;
    }
    /**
     * Registers a callback to be triggered when the component is touched.
     * Implemented as part of ControlValueAccessor.
     * @param fn Callback to be registered.
     */
    registerOnTouched(fn) {
        this.onTouched = fn;
    }
    /**
     * Sets whether the component should be disabled.
     * Implemented as part of ControlValueAccessor.
     * @param isDisabled
     */
    setDisabledState(isDisabled) {
        this.disabled = isDisabled;
    }
}
MatSlider.decorators = [
    { type: Component, args: [{
                selector: 'mat-slider',
                exportAs: 'matSlider',
                providers: [MAT_SLIDER_VALUE_ACCESSOR],
                host: {
                    '(focus)': '_onFocus()',
                    '(blur)': '_onBlur()',
                    '(keydown)': '_onKeydown($event)',
                    '(keyup)': '_onKeyup()',
                    '(mouseenter)': '_onMouseenter()',
                    // On Safari starting to slide temporarily triggers text selection mode which
                    // show the wrong cursor. We prevent it by stopping the `selectstart` event.
                    '(selectstart)': '$event.preventDefault()',
                    'class': 'mat-slider mat-focus-indicator',
                    'role': 'slider',
                    '[tabIndex]': 'tabIndex',
                    '[attr.aria-disabled]': 'disabled',
                    '[attr.aria-valuemax]': 'max',
                    '[attr.aria-valuemin]': 'min',
                    '[attr.aria-valuenow]': 'value',
                    // NVDA and Jaws appear to announce the `aria-valuenow` by calculating its percentage based
                    // on its value between `aria-valuemin` and `aria-valuemax`. Due to how decimals are handled,
                    // it can cause the slider to read out a very long value like 0.20000068 if the current value
                    // is 0.2 with a min of 0 and max of 1. We work around the issue by setting `aria-valuetext`
                    // to the same value that we set on the slider's thumb which will be truncated.
                    '[attr.aria-valuetext]': 'valueText == null ? displayValue : valueText',
                    '[attr.aria-orientation]': 'vertical ? "vertical" : "horizontal"',
                    '[class.mat-slider-disabled]': 'disabled',
                    '[class.mat-slider-has-ticks]': 'tickInterval',
                    '[class.mat-slider-horizontal]': '!vertical',
                    '[class.mat-slider-axis-inverted]': '_shouldInvertAxis()',
                    // Class binding which is only used by the test harness as there is no other
                    // way for the harness to detect if mouse coordinates need to be inverted.
                    '[class.mat-slider-invert-mouse-coords]': '_shouldInvertMouseCoords()',
                    '[class.mat-slider-sliding]': '_isSliding',
                    '[class.mat-slider-thumb-label-showing]': 'thumbLabel',
                    '[class.mat-slider-vertical]': 'vertical',
                    '[class.mat-slider-min-value]': '_isMinValue()',
                    '[class.mat-slider-hide-last-tick]': 'disabled || _isMinValue() && _getThumbGap() && _shouldInvertAxis()',
                    '[class._mat-animation-noopable]': '_animationMode === "NoopAnimations"',
                },
                template: "<div class=\"mat-slider-wrapper\" #sliderWrapper>\n  <div class=\"mat-slider-track-wrapper\">\n    <div class=\"mat-slider-track-background\" [ngStyle]=\"_getTrackBackgroundStyles()\"></div>\n    <div class=\"mat-slider-track-fill\" [ngStyle]=\"_getTrackFillStyles()\"></div>\n  </div>\n  <div class=\"mat-slider-ticks-container\" [ngStyle]=\"_getTicksContainerStyles()\">\n    <div class=\"mat-slider-ticks\" [ngStyle]=\"_getTicksStyles()\"></div>\n  </div>\n  <div class=\"mat-slider-thumb-container\" [ngStyle]=\"_getThumbContainerStyles()\">\n    <div class=\"mat-slider-focus-ring\"></div>\n    <div class=\"mat-slider-thumb\"></div>\n    <div class=\"mat-slider-thumb-label\">\n      <span class=\"mat-slider-thumb-label-text\">{{displayValue}}</span>\n    </div>\n  </div>\n</div>\n",
                inputs: ['disabled', 'color', 'tabIndex'],
                encapsulation: ViewEncapsulation.None,
                changeDetection: ChangeDetectionStrategy.OnPush,
                styles: [".mat-slider{display:inline-block;position:relative;box-sizing:border-box;padding:8px;outline:none;vertical-align:middle}.mat-slider:not(.mat-slider-disabled):active,.mat-slider.mat-slider-sliding:not(.mat-slider-disabled){cursor:-webkit-grabbing;cursor:grabbing}.mat-slider-wrapper{position:absolute;-webkit-print-color-adjust:exact;color-adjust:exact}.mat-slider-track-wrapper{position:absolute;top:0;left:0;overflow:hidden}.mat-slider-track-fill{position:absolute;transform-origin:0 0;transition:transform 400ms cubic-bezier(0.25, 0.8, 0.25, 1),background-color 400ms cubic-bezier(0.25, 0.8, 0.25, 1)}.mat-slider-track-background{position:absolute;transform-origin:100% 100%;transition:transform 400ms cubic-bezier(0.25, 0.8, 0.25, 1),background-color 400ms cubic-bezier(0.25, 0.8, 0.25, 1)}.mat-slider-ticks-container{position:absolute;left:0;top:0;overflow:hidden}.mat-slider-ticks{background-repeat:repeat;background-clip:content-box;box-sizing:border-box;opacity:0;transition:opacity 400ms cubic-bezier(0.25, 0.8, 0.25, 1)}.mat-slider-thumb-container{position:absolute;z-index:1;transition:transform 400ms cubic-bezier(0.25, 0.8, 0.25, 1)}.mat-slider-focus-ring{position:absolute;width:30px;height:30px;border-radius:50%;transform:scale(0);opacity:0;transition:transform 400ms cubic-bezier(0.25, 0.8, 0.25, 1),background-color 400ms cubic-bezier(0.25, 0.8, 0.25, 1),opacity 400ms cubic-bezier(0.25, 0.8, 0.25, 1)}.mat-slider.cdk-keyboard-focused .mat-slider-focus-ring,.mat-slider.cdk-program-focused .mat-slider-focus-ring{transform:scale(1);opacity:1}.mat-slider:not(.mat-slider-disabled):not(.mat-slider-sliding) .mat-slider-thumb-label,.mat-slider:not(.mat-slider-disabled):not(.mat-slider-sliding) .mat-slider-thumb{cursor:-webkit-grab;cursor:grab}.mat-slider-thumb{position:absolute;right:-10px;bottom:-10px;box-sizing:border-box;width:20px;height:20px;border:3px solid transparent;border-radius:50%;transform:scale(0.7);transition:transform 400ms cubic-bezier(0.25, 0.8, 0.25, 1),background-color 400ms cubic-bezier(0.25, 0.8, 0.25, 1),border-color 400ms cubic-bezier(0.25, 0.8, 0.25, 1)}.mat-slider-thumb-label{display:none;align-items:center;justify-content:center;position:absolute;width:28px;height:28px;border-radius:50%;transition:transform 400ms cubic-bezier(0.25, 0.8, 0.25, 1),border-radius 400ms cubic-bezier(0.25, 0.8, 0.25, 1),background-color 400ms cubic-bezier(0.25, 0.8, 0.25, 1)}.cdk-high-contrast-active .mat-slider-thumb-label{outline:solid 1px}.mat-slider-thumb-label-text{z-index:1;opacity:0;transition:opacity 400ms cubic-bezier(0.25, 0.8, 0.25, 1)}.mat-slider-sliding .mat-slider-track-fill,.mat-slider-sliding .mat-slider-track-background,.mat-slider-sliding .mat-slider-thumb-container{transition-duration:0ms}.mat-slider-has-ticks .mat-slider-wrapper::after{content:\"\";position:absolute;border-width:0;border-style:solid;opacity:0;transition:opacity 400ms cubic-bezier(0.25, 0.8, 0.25, 1)}.mat-slider-has-ticks.cdk-focused:not(.mat-slider-hide-last-tick) .mat-slider-wrapper::after,.mat-slider-has-ticks:hover:not(.mat-slider-hide-last-tick) .mat-slider-wrapper::after{opacity:1}.mat-slider-has-ticks.cdk-focused:not(.mat-slider-disabled) .mat-slider-ticks,.mat-slider-has-ticks:hover:not(.mat-slider-disabled) .mat-slider-ticks{opacity:1}.mat-slider-thumb-label-showing .mat-slider-focus-ring{display:none}.mat-slider-thumb-label-showing .mat-slider-thumb-label{display:flex}.mat-slider-axis-inverted .mat-slider-track-fill{transform-origin:100% 100%}.mat-slider-axis-inverted .mat-slider-track-background{transform-origin:0 0}.mat-slider:not(.mat-slider-disabled).cdk-focused.mat-slider-thumb-label-showing .mat-slider-thumb{transform:scale(0)}.mat-slider:not(.mat-slider-disabled).cdk-focused .mat-slider-thumb-label{border-radius:50% 50% 0}.mat-slider:not(.mat-slider-disabled).cdk-focused .mat-slider-thumb-label-text{opacity:1}.mat-slider:not(.mat-slider-disabled).cdk-mouse-focused .mat-slider-thumb,.mat-slider:not(.mat-slider-disabled).cdk-touch-focused .mat-slider-thumb,.mat-slider:not(.mat-slider-disabled).cdk-program-focused .mat-slider-thumb{border-width:2px;transform:scale(1)}.mat-slider-disabled .mat-slider-focus-ring{transform:scale(0);opacity:0}.mat-slider-disabled .mat-slider-thumb{border-width:4px;transform:scale(0.5)}.mat-slider-disabled .mat-slider-thumb-label{display:none}.mat-slider-horizontal{height:48px;min-width:128px}.mat-slider-horizontal .mat-slider-wrapper{height:2px;top:23px;left:8px;right:8px}.mat-slider-horizontal .mat-slider-wrapper::after{height:2px;border-left-width:2px;right:0;top:0}.mat-slider-horizontal .mat-slider-track-wrapper{height:2px;width:100%}.mat-slider-horizontal .mat-slider-track-fill{height:2px;width:100%;transform:scaleX(0)}.mat-slider-horizontal .mat-slider-track-background{height:2px;width:100%;transform:scaleX(1)}.mat-slider-horizontal .mat-slider-ticks-container{height:2px;width:100%}.cdk-high-contrast-active .mat-slider-horizontal .mat-slider-ticks-container{height:0;outline:solid 2px;top:1px}.mat-slider-horizontal .mat-slider-ticks{height:2px;width:100%}.mat-slider-horizontal .mat-slider-thumb-container{width:100%;height:0;top:50%}.mat-slider-horizontal .mat-slider-focus-ring{top:-15px;right:-15px}.mat-slider-horizontal .mat-slider-thumb-label{right:-14px;top:-40px;transform:translateY(26px) scale(0.01) rotate(45deg)}.mat-slider-horizontal .mat-slider-thumb-label-text{transform:rotate(-45deg)}.mat-slider-horizontal.cdk-focused .mat-slider-thumb-label{transform:rotate(45deg)}.cdk-high-contrast-active .mat-slider-horizontal.cdk-focused .mat-slider-thumb-label,.cdk-high-contrast-active .mat-slider-horizontal.cdk-focused .mat-slider-thumb-label-text{transform:none}.mat-slider-vertical{width:48px;min-height:128px}.mat-slider-vertical .mat-slider-wrapper{width:2px;top:8px;bottom:8px;left:23px}.mat-slider-vertical .mat-slider-wrapper::after{width:2px;border-top-width:2px;bottom:0;left:0}.mat-slider-vertical .mat-slider-track-wrapper{height:100%;width:2px}.mat-slider-vertical .mat-slider-track-fill{height:100%;width:2px;transform:scaleY(0)}.mat-slider-vertical .mat-slider-track-background{height:100%;width:2px;transform:scaleY(1)}.mat-slider-vertical .mat-slider-ticks-container{width:2px;height:100%}.cdk-high-contrast-active .mat-slider-vertical .mat-slider-ticks-container{width:0;outline:solid 2px;left:1px}.mat-slider-vertical .mat-slider-focus-ring{bottom:-15px;left:-15px}.mat-slider-vertical .mat-slider-ticks{width:2px;height:100%}.mat-slider-vertical .mat-slider-thumb-container{height:100%;width:0;left:50%}.mat-slider-vertical .mat-slider-thumb{-webkit-backface-visibility:hidden;backface-visibility:hidden}.mat-slider-vertical .mat-slider-thumb-label{bottom:-14px;left:-40px;transform:translateX(26px) scale(0.01) rotate(-45deg)}.mat-slider-vertical .mat-slider-thumb-label-text{transform:rotate(45deg)}.mat-slider-vertical.cdk-focused .mat-slider-thumb-label{transform:rotate(-45deg)}[dir=rtl] .mat-slider-wrapper::after{left:0;right:auto}[dir=rtl] .mat-slider-horizontal .mat-slider-track-fill{transform-origin:100% 100%}[dir=rtl] .mat-slider-horizontal .mat-slider-track-background{transform-origin:0 0}[dir=rtl] .mat-slider-horizontal.mat-slider-axis-inverted .mat-slider-track-fill{transform-origin:0 0}[dir=rtl] .mat-slider-horizontal.mat-slider-axis-inverted .mat-slider-track-background{transform-origin:100% 100%}.mat-slider._mat-animation-noopable .mat-slider-track-fill,.mat-slider._mat-animation-noopable .mat-slider-track-background,.mat-slider._mat-animation-noopable .mat-slider-ticks,.mat-slider._mat-animation-noopable .mat-slider-thumb-container,.mat-slider._mat-animation-noopable .mat-slider-focus-ring,.mat-slider._mat-animation-noopable .mat-slider-thumb,.mat-slider._mat-animation-noopable .mat-slider-thumb-label,.mat-slider._mat-animation-noopable .mat-slider-thumb-label-text,.mat-slider._mat-animation-noopable .mat-slider-has-ticks .mat-slider-wrapper::after{transition:none}\n"]
            },] }
];
MatSlider.ctorParameters = () => [
    { type: ElementRef },
    { type: FocusMonitor },
    { type: ChangeDetectorRef },
    { type: Directionality, decorators: [{ type: Optional }] },
    { type: String, decorators: [{ type: Attribute, args: ['tabindex',] }] },
    { type: NgZone },
    { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] }] },
    { type: String, decorators: [{ type: Optional }, { type: Inject, args: [ANIMATION_MODULE_TYPE,] }] }
];
MatSlider.propDecorators = {
    invert: [{ type: Input }],
    max: [{ type: Input }],
    min: [{ type: Input }],
    step: [{ type: Input }],
    thumbLabel: [{ type: Input }],
    tickInterval: [{ type: Input }],
    value: [{ type: Input }],
    displayWith: [{ type: Input }],
    valueText: [{ type: Input }],
    vertical: [{ type: Input }],
    change: [{ type: Output }],
    input: [{ type: Output }],
    valueChange: [{ type: Output }],
    _sliderWrapper: [{ type: ViewChild, args: ['sliderWrapper',] }]
};
/** Returns whether an event is a touch event. */
function isTouchEvent(event) {
    // This function is called for every pixel that the user has dragged so we need it to be
    // as fast as possible. Since we only bind mouse events and touch events, we can assume
    // that if the event's name starts with `t`, it's a touch event.
    return event.type[0] === 't';
}
/** Gets the coordinates of a touch or mouse event relative to the viewport. */
function getPointerPositionOnPage(event) {
    // `touches` will be empty for start/end events so we have to fall back to `changedTouches`.
    const point = isTouchEvent(event) ? (event.touches[0] || event.changedTouches[0]) : event;
    return { x: point.clientX, y: point.clientY };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2xpZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL3NsaWRlci9zbGlkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFlBQVksRUFBYyxNQUFNLG1CQUFtQixDQUFDO0FBQzVELE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNqRCxPQUFPLEVBRUwscUJBQXFCLEVBQ3JCLG9CQUFvQixFQUVyQixNQUFNLHVCQUF1QixDQUFDO0FBQy9CLE9BQU8sRUFDTCxVQUFVLEVBQ1YsR0FBRyxFQUNILElBQUksRUFDSixVQUFVLEVBQ1YsU0FBUyxFQUNULE9BQU8sRUFDUCxXQUFXLEVBQ1gsUUFBUSxFQUNSLGNBQWMsR0FDZixNQUFNLHVCQUF1QixDQUFDO0FBQy9CLE9BQU8sRUFDTCxTQUFTLEVBQ1QsdUJBQXVCLEVBQ3ZCLGlCQUFpQixFQUNqQixTQUFTLEVBQ1QsVUFBVSxFQUNWLFlBQVksRUFDWixVQUFVLEVBQ1YsTUFBTSxFQUNOLEtBQUssRUFFTCxRQUFRLEVBQ1IsTUFBTSxFQUNOLFNBQVMsRUFDVCxpQkFBaUIsRUFDakIsTUFBTSxHQUVQLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBdUIsaUJBQWlCLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUN2RSxPQUFPLEVBT0wsVUFBVSxFQUNWLGFBQWEsRUFDYixhQUFhLEdBQ2QsTUFBTSx3QkFBd0IsQ0FBQztBQUNoQyxPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSxzQ0FBc0MsQ0FBQztBQUMzRSxPQUFPLEVBQUMsK0JBQStCLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUN0RSxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDekMsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUVsQyxNQUFNLGtCQUFrQixHQUFH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QUFLO3dCQUdMLEtBQUs7dUJBR0wsS0FBSztxQkFRTCxNQUFNO29CQUdOLE1BQU07MEJBT04sTUFBTTs2QkF3TE4sU0FBUyxTQUFDLGVBQWU7O0FBNmE1QixpREFBaUQ7QUFDakQsU0FBUyxZQUFZLENBQUMsS0FBOEI7SUFDbEQsd0ZBQXdGO0lBQ3hGLHVGQUF1RjtJQUN2RixnRUFBZ0U7SUFDaEUsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQztBQUMvQixDQUFDO0FBRUQsK0VBQStFO0FBQy9FLFNBQVMsd0JBQXdCLENBQUMsS0FBOEI7SUFDOUQsNEZBQTRGO0lBQzVGLE1BQU0sS0FBSyxHQUFHLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0lBQzFGLE9BQU8sRUFBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLE9BQU8sRUFBQyxDQUFDO0FBQzlDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtGb2N1c01vbml0b3IsIEZvY3VzT3JpZ2lufSBmcm9tICdAYW5ndWxhci9jZGsvYTExeSc7XG5pbXBvcnQge0RpcmVjdGlvbmFsaXR5fSBmcm9tICdAYW5ndWxhci9jZGsvYmlkaSc7XG5pbXBvcnQge1xuICBCb29sZWFuSW5wdXQsXG4gIGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSxcbiAgY29lcmNlTnVtYmVyUHJvcGVydHksXG4gIE51bWJlcklucHV0XG59IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5pbXBvcnQge1xuICBET1dOX0FSUk9XLFxuICBFTkQsXG4gIEhPTUUsXG4gIExFRlRfQVJST1csXG4gIFBBR0VfRE9XTixcbiAgUEFHRV9VUCxcbiAgUklHSFRfQVJST1csXG4gIFVQX0FSUk9XLFxuICBoYXNNb2RpZmllcktleSxcbn0gZnJvbSAnQGFuZ3VsYXIvY2RrL2tleWNvZGVzJztcbmltcG9ydCB7XG4gIEF0dHJpYnV0ZSxcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIENoYW5nZURldGVjdG9yUmVmLFxuICBDb21wb25lbnQsXG4gIEVsZW1lbnRSZWYsXG4gIEV2ZW50RW1pdHRlcixcbiAgZm9yd2FyZFJlZixcbiAgSW5qZWN0LFxuICBJbnB1dCxcbiAgT25EZXN0cm95LFxuICBPcHRpb25hbCxcbiAgT3V0cHV0LFxuICBWaWV3Q2hpbGQsXG4gIFZpZXdFbmNhcHN1bGF0aW9uLFxuICBOZ1pvbmUsXG4gIEFmdGVyVmlld0luaXQsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtDb250cm9sVmFsdWVBY2Nlc3NvciwgTkdfVkFMVUVfQUNDRVNTT1J9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcbmltcG9ydCB7XG4gIENhbkNvbG9yLFxuICBDYW5Db2xvckN0b3IsXG4gIENhbkRpc2FibGUsXG4gIENhbkRpc2FibGVDdG9yLFxuICBIYXNUYWJJbmRleCxcbiAgSGFzVGFiSW5kZXhDdG9yLFxuICBtaXhpbkNvbG9yLFxuICBtaXhpbkRpc2FibGVkLFxuICBtaXhpblRhYkluZGV4LFxufSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9jb3JlJztcbmltcG9ydCB7QU5JTUFUSU9OX01PRFVMRV9UWVBFfSBmcm9tICdAYW5ndWxhci9wbGF0Zm9ybS1icm93c2VyL2FuaW1hdGlvbnMnO1xuaW1wb3J0IHtub3JtYWxpemVQYXNzaXZlTGlzdGVuZXJPcHRpb25zfSBmcm9tICdAYW5ndWxhci9jZGsvcGxhdGZvcm0nO1xuaW1wb3J0IHtET0NVTUVOVH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7U3Vic2NyaXB0aW9ufSBmcm9tICdyeGpzJztcblxuY29uc3QgYWN0aXZlRXZlbnRPcHRpb25zID0gbm9ybWFsaXplUGFzc2l2ZUxpc3RlbmVyT3B0aW9ucyh7cGFzc2l2ZTogZmFsc2V9KTtcblxuLyoqXG4gKiBWaXN1YWxseSwgYSAzMHB4IHNlcGFyYXRpb24gYmV0d2VlbiB0aWNrIG1hcmtzIGxvb2tzIGJlc3QuIFRoaXMgaXMgdmVyeSBzdWJqZWN0aXZlIGJ1dCBpdCBpc1xuICogdGhlIGRlZmF1bHQgc2VwYXJhdGlvbiB3ZSBjaG9zZS5cbiAqL1xuY29uc3QgTUlOX0FVVE9fVElDS19TRVBBUkFUSU9OID0gMzA7XG5cbi8qKiBUaGUgdGh1bWIgZ2FwIHNpemUgZm9yIGEgZGlzYWJsZWQgc2xpZGVyLiAqL1xuY29uc3QgRElTQUJMRURfVEhVTUJfR0FQID0gNztcblxuLyoqIFRoZSB0aHVtYiBnYXAgc2l6ZSBmb3IgYSBub24tYWN0aXZlIHNsaWRlciBhdCBpdHMgbWluaW11bSB2YWx1ZS4gKi9cbmNvbnN0IE1JTl9WQUxVRV9OT05BQ1RJVkVfVEhVTUJfR0FQID0gNztcblxuLyoqIFRoZSB0aHVtYiBnYXAgc2l6ZSBmb3IgYW4gYWN0aXZlIHNsaWRlciBhdCBpdHMgbWluaW11bSB2YWx1ZS4gKi9cbmNvbnN0IE1JTl9WQUxVRV9BQ1RJVkVfVEhVTUJfR0FQID0gMTA7XG5cbi8qKlxuICogUHJvdmlkZXIgRXhwcmVzc2lvbiB0aGF0IGFsbG93cyBtYXQtc2xpZGVyIHRvIHJlZ2lzdGVyIGFzIGEgQ29udHJvbFZhbHVlQWNjZXNzb3IuXG4gKiBUaGlzIGFsbG93cyBpdCB0byBzdXBwb3J0IFsobmdNb2RlbCldIGFuZCBbZm9ybUNvbnRyb2xdLlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5leHBvcnQgY29uc3QgTUFUX1NMSURFUl9WQUxVRV9BQ0NFU1NPUjogYW55ID0ge1xuICBwcm92aWRlOiBOR19WQUxVRV9BQ0NFU1NPUixcbiAgdXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoKCkgPT4gTWF0U2xpZGVyKSxcbiAgbXVsdGk6IHRydWVcbn07XG5cbi8qKiBBIHNpbXBsZSBjaGFuZ2UgZXZlbnQgZW1pdHRlZCBieSB0aGUgTWF0U2xpZGVyIGNvbXBvbmVudC4gKi9cbmV4cG9ydCBjbGFzcyBNYXRTbGlkZXJDaGFuZ2Uge1xuICAvKiogVGhlIE1hdFNsaWRlciB0aGF0IGNoYW5nZWQuICovXG4gIHNvdXJjZTogTWF0U2xpZGVyO1xuXG4gIC8qKiBUaGUgbmV3IHZhbHVlIG9mIHRoZSBzb3VyY2Ugc2xpZGVyLiAqL1xuICB2YWx1ZTogbnVtYmVyIHwgbnVsbDtcbn1cblxuLy8gQm9pbGVycGxhdGUgZm9yIGFwcGx5aW5nIG1peGlucyB0byBNYXRTbGlkZXIuXG4vKiogQGRvY3MtcHJpdmF0ZSAqL1xuY2xhc3MgTWF0U2xpZGVyQmFzZSB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBfZWxlbWVudFJlZjogRWxlbWVudFJlZikge31cbn1cbmNvbnN0IF9NYXRTbGlkZXJNaXhpbkJhc2U6XG4gICAgSGFzVGFiSW5kZXhDdG9yICZcbiAgICBDYW5Db2xvckN0b3IgJlxuICAgIENhbkRpc2FibGVDdG9yICZcbiAgICB0eXBlb2YgTWF0U2xpZGVyQmFzZSA9XG4gICAgICAgIG1peGluVGFiSW5kZXgobWl4aW5Db2xvcihtaXhpbkRpc2FibGVkKE1hdFNsaWRlckJhc2UpLCAnYWNjZW50JykpO1xuXG4vKipcbiAqIEFsbG93cyB1c2VycyB0byBzZWxlY3QgZnJvbSBhIHJhbmdlIG9mIHZhbHVlcyBieSBtb3ZpbmcgdGhlIHNsaWRlciB0aHVtYi4gSXQgaXMgc2ltaWxhciBpblxuICogYmVoYXZpb3IgdG8gdGhlIG5hdGl2ZSBgPGlucHV0IHR5cGU9XCJyYW5nZVwiPmAgZWxlbWVudC5cbiAqL1xuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbWF0LXNsaWRlcicsXG4gIGV4cG9ydEFzOiAnbWF0U2xpZGVyJyxcbiAgcHJvdmlkZXJzOiBbTUFUX1NMSURFUl9WQUxVRV9BQ0NFU1NPUl0sXG4gIGhvc3Q6IHtcbiAgICAnKGZvY3VzKSc6ICdfb25Gb2N1cygpJyxcbiAgICAnKGJsdXIpJzogJ19vbkJsdXIoKScsXG4gICAgJyhrZXlkb3duKSc6ICdfb25LZXlkb3duKCRldmVudCknLFxuICAgICcoa2V5dXApJzogJ19vbktleXVwKCknLFxuICAgICcobW91c2VlbnRlciknOiAnX29uTW91c2VlbnRlcigpJyxcblxuICAgIC8vIE9uIFNhZmFyaSBzdGFydGluZyB0byBzbGlkZSB0ZW1wb3JhcmlseSB0cmlnZ2VycyB0ZXh0IHNlbGVjdGlvbiBtb2RlIHdoaWNoXG4gICAgLy8gc2hvdyB0aGUgd3JvbmcgY3Vyc29yLiBXZSBwcmV2ZW50IGl0IGJ5IHN0b3BwaW5nIHRoZSBgc2VsZWN0c3RhcnRgIGV2ZW50LlxuICAgICcoc2VsZWN0c3RhcnQpJzogJyRldmVudC5wcmV2ZW50RGVmYXVsdCgpJyxcbiAgICAnY2xhc3MnOiAnbWF0LXNsaWRlciBtYXQtZm9jdXMtaW5kaWNhdG9yJyxcbiAgICAncm9sZSc6ICdzbGlkZXInLFxuICAgICdbdGFiSW5kZXhdJzogJ3RhYkluZGV4JyxcbiAgICAnW2F0dHIuYXJpYS1kaXNhYmxlZF0nOiAnZGlzYWJsZWQnLFxuICAgICdbYXR0ci5hcmlhLXZhbHVlbWF4XSc6ICdtYXgnLFxuICAgICdbYXR0ci5hcmlhLXZhbHVlbWluXSc6ICdtaW4nLFxuICAgICdbYXR0ci5hcmlhLXZhbHVlbm93XSc6ICd2YWx1ZScsXG5cbiAgICAvLyBOVkRBIGFuZCBKYXdzIGFwcGVhciB0byBhbm5vdW5jZSB0aGUgYGFyaWEtdmFsdWVub3dgIGJ5IGNhbGN1bGF0aW5nIGl0cyBwZXJjZW50YWdlIGJhc2VkXG4gICAgLy8gb24gaXRzIHZhbHVlIGJldHdlZW4gYGFyaWEtdmFsdWVtaW5gIGFuZCBgYXJpYS12YWx1ZW1heGAuIER1ZSB0byBob3cgZGVjaW1hbHMgYXJlIGhhbmRsZWQsXG4gICAgLy8gaXQgY2FuIGNhdXNlIHRoZSBzbGlkZXIgdG8gcmVhZCBvdXQgYSB2ZXJ5IGxvbmcgdmFsdWUgbGlrZSAwLjIwMDAwMDY4IGlmIHRoZSBjdXJyZW50IHZhbHVlXG4gICAgLy8gaXMgMC4yIHdpdGggYSBtaW4gb2YgMCBhbmQgbWF4IG9mIDEuIFdlIHdvcmsgYXJvdW5kIHRoZSBpc3N1ZSBieSBzZXR0aW5nIGBhcmlhLXZhbHVldGV4dGBcbiAgICAvLyB0byB0aGUgc2FtZSB2YWx1ZSB0aGF0IHdlIHNldCBvbiB0aGUgc2xpZGVyJ3MgdGh1bWIgd2hpY2ggd2lsbCBiZSB0cnVuY2F0ZWQuXG4gICAgJ1thdHRyLmFyaWEtdmFsdWV0ZXh0XSc6ICd2YWx1ZVRleHQgPT0gbnVsbCA/IGRpc3BsYXlWYWx1ZSA6IHZhbHVlVGV4dCcsXG4gICAgJ1thdHRyLmFyaWEtb3JpZW50YXRpb25dJzogJ3ZlcnRpY2FsID8gXCJ2ZXJ0aWNhbFwiIDogXCJob3Jpem9udGFsXCInLFxuICAgICdbY2xhc3MubWF0LXNsaWRlci1kaXNhYmxlZF0nOiAnZGlzYWJsZWQnLFxuICAgICdbY2xhc3MubWF0LXNsaWRlci1oYXMtdGlja3NdJzogJ3RpY2tJbnRlcnZhbCcsXG4gICAgJ1tjbGFzcy5tYXQtc2xpZGVyLWhvcml6b250YWxdJzogJyF2ZXJ0aWNhbCcsXG4gICAgJ1tjbGFzcy5tYXQtc2xpZGVyLWF4aXMtaW52ZXJ0ZWRdJzogJ19zaG91bGRJbnZlcnRBeGlzKCknLFxuICAgIC8vIENsYXNzIGJpbmRpbmcgd2hpY2ggaXMgb25seSB1c2VkIGJ5IHRoZSB0ZXN0IGhhcm5lc3MgYXMgdGhlcmUgaXMgbm8gb3RoZXJcbiAgICAvLyB3YXkgZm9yIHRoZSBoYXJuZXNzIHRvIGRldGVjdCBpZiBtb3VzZSBjb29yZGluYXRlcyBuZWVkIHRvIGJlIGludmVydGVkLlxuICAgICdbY2xhc3MubWF0LXNsaWRlci1pbnZlcnQtbW91c2UtY29vcmRzXSc6ICdfc2hvdWxkSW52ZXJ0TW91c2VDb29yZHMoKScsXG4gICAgJ1tjbGFzcy5tYXQtc2xpZGVyLXNsaWRpbmddJzogJ19pc1NsaWRpbmcnLFxuICAgICdbY2xhc3MubWF0LXNsaWRlci10aHVtYi1sYWJlbC1zaG93aW5nXSc6ICd0aHVtYkxhYmVsJyxcbiAgICAnW2NsYXNzLm1hdC1zbGlkZXItdmVydGljYWxdJzogJ3ZlcnRpY2FsJyxcbiAgICAnW2NsYXNzLm1hdC1zbGlkZXItbWluLXZhbHVlXSc6ICdfaXNNaW5WYWx1ZSgpJyxcbiAgICAnW2NsYXNzLm1hdC1zbGlkZXItaGlkZS1sYXN0LXRpY2tdJzpcbiAgICAgICAgJ2Rpc2FibGVkIHx8IF9pc01pblZhbHVlKCkgJiYgX2dldFRodW1iR2FwKCkgJiYgX3Nob3VsZEludmVydEF4aXMoKScsXG4gICAgJ1tjbGFzcy5fbWF0LWFuaW1hdGlvbi1ub29wYWJsZV0nOiAnX2FuaW1hdGlvbk1vZGUgPT09IFwiTm9vcEFuaW1hdGlvbnNcIicsXG4gIH0sXG4gIHRlbXBsYXRlVXJsOiAnc2xpZGVyLmh0bWwnLFxuICBzdHlsZVVybHM6IFsnc2xpZGVyLmNzcyddLFxuICBpbnB1dHM6IFsnZGlzYWJsZWQnLCAnY29sb3InLCAndGFiSW5kZXgnXSxcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXG59KVxuZXhwb3J0IGNsYXNzIE1hdFNsaWRlciBleHRlbmRzIF9NYXRTbGlkZXJNaXhpbkJhc2VcbiAgICBpbXBsZW1lbnRzIENvbnRyb2xWYWx1ZUFjY2Vzc29yLCBPbkRlc3Ryb3ksIENhbkRpc2FibGUsIENhbkNvbG9yLCBBZnRlclZpZXdJbml0LCBIYXNUYWJJbmRleCB7XG4gIC8qKiBXaGV0aGVyIHRoZSBzbGlkZXIgaXMgaW52ZXJ0ZWQuICovXG4gIEBJbnB1dCgpXG4gIGdldCBpbnZlcnQoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLl9pbnZlcnQ7IH1cbiAgc2V0IGludmVydCh2YWx1ZTogYm9vbGVhbikge1xuICAgIHRoaXMuX2ludmVydCA9IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSh2YWx1ZSk7XG4gIH1cbiAgcHJpdmF0ZSBfaW52ZXJ0ID0gZmFsc2U7XG5cbiAgLyoqIFRoZSBtYXhpbXVtIHZhbHVlIHRoYXQgdGhlIHNsaWRlciBjYW4gaGF2ZS4gKi9cbiAgQElucHV0KClcbiAgZ2V0IG1heCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5fbWF4OyB9XG4gIHNldCBtYXgodjogbnVtYmVyKSB7XG4gICAgdGhpcy5fbWF4ID0gY29lcmNlTnVtYmVyUHJvcGVydHkodiwgdGhpcy5fbWF4KTtcbiAgICB0aGlzLl9wZXJjZW50ID0gdGhpcy5fY2FsY3VsYXRlUGVyY2VudGFnZSh0aGlzLl92YWx1ZSk7XG5cbiAgICAvLyBTaW5jZSB0aGlzIGFsc28gbW9kaWZpZXMgdGhlIHBlcmNlbnRhZ2UsIHdlIG5lZWQgdG8gbGV0IHRoZSBjaGFuZ2UgZGV0ZWN0aW9uIGtub3cuXG4gICAgdGhpcy5fY2hhbmdlRGV0ZWN0b3JSZWYubWFya0ZvckNoZWNrKCk7XG4gIH1cbiAgcHJpdmF0ZSBfbWF4OiBudW1iZXIgPSAxMDA7XG5cbiAgLyoqIFRoZSBtaW5pbXVtIHZhbHVlIHRoYXQgdGhlIHNsaWRlciBjYW4gaGF2ZS4gKi9cbiAgQElucHV0KClcbiAgZ2V0IG1pbigpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5fbWluOyB9XG4gIHNldCBtaW4odjogbnVtYmVyKSB7XG4gICAgdGhpcy5fbWluID0gY29lcmNlTnVtYmVyUHJvcGVydHkodiwgdGhpcy5fbWluKTtcblxuICAgIC8vIElmIHRoZSB2YWx1ZSB3YXNuJ3QgZXhwbGljaXRseSBzZXQgYnkgdGhlIHVzZXIsIHNldCBpdCB0byB0aGUgbWluLlxuICAgIGlmICh0aGlzLl92YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgdGhpcy52YWx1ZSA9IHRoaXMuX21pbjtcbiAgICB9XG4gICAgdGhpcy5fcGVyY2VudCA9IHRoaXMuX2NhbGN1bGF0ZVBlcmNlbnRhZ2UodGhpcy5fdmFsdWUpO1xuXG4gICAgLy8gU2luY2UgdGhpcyBhbHNvIG1vZGlmaWVzIHRoZSBwZXJjZW50YWdlLCB3ZSBuZWVkIHRvIGxldCB0aGUgY2hhbmdlIGRldGVjdGlvbiBrbm93LlxuICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpO1xuICB9XG4gIHByaXZhdGUgX21pbjogbnVtYmVyID0gMDtcblxuICAvKiogVGhlIHZhbHVlcyBhdCB3aGljaCB0aGUgdGh1bWIgd2lsbCBzbmFwLiAqL1xuICBASW5wdXQoKVxuICBnZXQgc3RlcCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5fc3RlcDsgfVxuICBzZXQgc3RlcCh2OiBudW1iZXIpIHtcbiAgICB0aGlzLl9zdGVwID0gY29lcmNlTnVtYmVyUHJvcGVydHkodiwgdGhpcy5fc3RlcCk7XG5cbiAgICBpZiAodGhpcy5fc3RlcCAlIDEgIT09IDApIHtcbiAgICAgIHRoaXMuX3JvdW5kVG9EZWNpbWFsID0gdGhpcy5fc3RlcC50b1N0cmluZygpLnNwbGl0KCcuJykucG9wKCkhLmxlbmd0aDtcbiAgICB9XG5cbiAgICAvLyBTaW5jZSB0aGlzIGNvdWxkIG1vZGlmeSB0aGUgbGFiZWwsIHdlIG5lZWQgdG8gbm90aWZ5IHRoZSBjaGFuZ2UgZGV0ZWN0aW9uLlxuICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpO1xuICB9XG4gIHByaXZhdGUgX3N0ZXA6IG51bWJlciA9IDE7XG5cbiAgLyoqIFdoZXRoZXIgb3Igbm90IHRvIHNob3cgdGhlIHRodW1iIGxhYmVsLiAqL1xuICBASW5wdXQoKVxuICBnZXQgdGh1bWJMYWJlbCgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuX3RodW1iTGFiZWw7IH1cbiAgc2V0IHRodW1iTGFiZWwodmFsdWU6IGJvb2xlYW4pIHsgdGhpcy5fdGh1bWJMYWJlbCA9IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSh2YWx1ZSk7IH1cbiAgcHJpdmF0ZSBfdGh1bWJMYWJlbDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBIb3cgb2Z0ZW4gdG8gc2hvdyB0aWNrcy4gUmVsYXRpdmUgdG8gdGhlIHN0ZXAgc28gdGhhdCBhIHRpY2sgYWx3YXlzIGFwcGVhcnMgb24gYSBzdGVwLlxuICAgKiBFeDogVGljayBpbnRlcnZhbCBvZiA0IHdpdGggYSBzdGVwIG9mIDMgd2lsbCBkcmF3IGEgdGljayBldmVyeSA0IHN0ZXBzIChldmVyeSAxMiB2YWx1ZXMpLlxuICAgKi9cbiAgQElucHV0KClcbiAgZ2V0IHRpY2tJbnRlcnZhbCgpIHsgcmV0dXJuIHRoaXMuX3RpY2tJbnRlcnZhbDsgfVxuICBzZXQgdGlja0ludGVydmFsKHZhbHVlOiAnYXV0bycgfCBudW1iZXIpIHtcbiAgICBpZiAodmFsdWUgPT09ICdhdXRvJykge1xuICAgICAgdGhpcy5fdGlja0ludGVydmFsID0gJ2F1dG8nO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyB8fCB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICB0aGlzLl90aWNrSW50ZXJ2YWwgPSBjb2VyY2VOdW1iZXJQcm9wZXJ0eSh2YWx1ZSwgdGhpcy5fdGlja0ludGVydmFsIGFzIG51bWJlcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3RpY2tJbnRlcnZhbCA9IDA7XG4gICAgfVxuICB9XG4gIHByaXZhdGUgX3RpY2tJbnRlcnZhbDogJ2F1dG8nIHwgbnVtYmVyID0gMDtcblxuICAvKiogVmFsdWUgb2YgdGhlIHNsaWRlci4gKi9cbiAgQElucHV0KClcbiAgZ2V0IHZhbHVlKCk6IG51bWJlciB8IG51bGwge1xuICAgIC8vIElmIHRoZSB2YWx1ZSBuZWVkcyB0byBiZSByZWFkIGFuZCBpdCBpcyBzdGlsbCB1bmluaXRpYWxpemVkLCBpbml0aWFsaXplIGl0IHRvIHRoZSBtaW4uXG4gICAgaWYgKHRoaXMuX3ZhbHVlID09PSBudWxsKSB7XG4gICAgICB0aGlzLnZhbHVlID0gdGhpcy5fbWluO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fdmFsdWU7XG4gIH1cbiAgc2V0IHZhbHVlKHY6IG51bWJlciB8IG51bGwpIHtcbiAgICBpZiAodiAhPT0gdGhpcy5fdmFsdWUpIHtcbiAgICAgIGxldCB2YWx1ZSA9IGNvZXJjZU51bWJlclByb3BlcnR5KHYpO1xuXG4gICAgICAvLyBXaGlsZSBpbmNyZW1lbnRpbmcgYnkgYSBkZWNpbWFsIHdlIGNhbiBlbmQgdXAgd2l0aCB2YWx1ZXMgbGlrZSAzMy4zMDAwMDAwMDAwMDAwMDQuXG4gICAgICAvLyBUcnVuY2F0ZSBpdCB0byBlbnN1cmUgdGhhdCBpdCBtYXRjaGVzIHRoZSBsYWJlbCBhbmQgdG8gbWFrZSBpdCBlYXNpZXIgdG8gd29yayB3aXRoLlxuICAgICAgaWYgKHRoaXMuX3JvdW5kVG9EZWNpbWFsICYmIHZhbHVlICE9PSB0aGlzLm1pbiAmJiB2YWx1ZSAhPT0gdGhpcy5tYXgpIHtcbiAgICAgICAgdmFsdWUgPSBwYXJzZUZsb2F0KHZhbHVlLnRvRml4ZWQodGhpcy5fcm91bmRUb0RlY2ltYWwpKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fdmFsdWUgPSB2YWx1ZTtcbiAgICAgIHRoaXMuX3BlcmNlbnQgPSB0aGlzLl9jYWxjdWxhdGVQZXJjZW50YWdlKHRoaXMuX3ZhbHVlKTtcblxuICAgICAgLy8gU2luY2UgdGhpcyBhbHNvIG1vZGlmaWVzIHRoZSBwZXJjZW50YWdlLCB3ZSBuZWVkIHRvIGxldCB0aGUgY2hhbmdlIGRldGVjdGlvbiBrbm93LlxuICAgICAgdGhpcy5fY2hhbmdlRGV0ZWN0b3JSZWYubWFya0ZvckNoZWNrKCk7XG4gICAgfVxuICB9XG4gIHByaXZhdGUgX3ZhbHVlOiBudW1iZXIgfCBudWxsID0gbnVsbDtcblxuICAvKipcbiAgICogRnVuY3Rpb24gdGhhdCB3aWxsIGJlIHVzZWQgdG8gZm9ybWF0IHRoZSB2YWx1ZSBiZWZvcmUgaXQgaXMgZGlzcGxheWVkXG4gICAqIGluIHRoZSB0aHVtYiBsYWJlbC4gQ2FuIGJlIHVzZWQgdG8gZm9ybWF0IHZlcnkgbGFyZ2UgbnVtYmVyIGluIG9yZGVyXG4gICAqIGZvciB0aGVtIHRvIGZpdCBpbnRvIHRoZSBzbGlkZXIgdGh1bWIuXG4gICAqL1xuICBASW5wdXQoKSBkaXNwbGF5V2l0aDogKHZhbHVlOiBudW1iZXIpID0+IHN0cmluZyB8IG51bWJlcjtcblxuICAvKiogVGV4dCBjb3JyZXNwb25kaW5nIHRvIHRoZSBzbGlkZXIncyB2YWx1ZS4gVXNlZCBwcmltYXJpbHkgZm9yIGltcHJvdmVkIGFjY2Vzc2liaWxpdHkuICovXG4gIEBJbnB1dCgpIHZhbHVlVGV4dDogc3RyaW5nO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBzbGlkZXIgaXMgdmVydGljYWwuICovXG4gIEBJbnB1dCgpXG4gIGdldCB2ZXJ0aWNhbCgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuX3ZlcnRpY2FsOyB9XG4gIHNldCB2ZXJ0aWNhbCh2YWx1ZTogYm9vbGVhbikge1xuICAgIHRoaXMuX3ZlcnRpY2FsID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHZhbHVlKTtcbiAgfVxuICBwcml2YXRlIF92ZXJ0aWNhbCA9IGZhbHNlO1xuXG4gIC8qKiBFdmVudCBlbWl0dGVkIHdoZW4gdGhlIHNsaWRlciB2YWx1ZSBoYXMgY2hhbmdlZC4gKi9cbiAgQE91dHB1dCgpIHJlYWRvbmx5IGNoYW5nZTogRXZlbnRFbWl0dGVyPE1hdFNsaWRlckNoYW5nZT4gPSBuZXcgRXZlbnRFbWl0dGVyPE1hdFNsaWRlckNoYW5nZT4oKTtcblxuICAvKiogRXZlbnQgZW1pdHRlZCB3aGVuIHRoZSBzbGlkZXIgdGh1bWIgbW92ZXMuICovXG4gIEBPdXRwdXQoKSByZWFkb25seSBpbnB1dDogRXZlbnRFbWl0dGVyPE1hdFNsaWRlckNoYW5nZT4gPSBuZXcgRXZlbnRFbWl0dGVyPE1hdFNsaWRlckNoYW5nZT4oKTtcblxuICAvKipcbiAgICogRW1pdHMgd2hlbiB0aGUgcmF3IHZhbHVlIG9mIHRoZSBzbGlkZXIgY2hhbmdlcy4gVGhpcyBpcyBoZXJlIHByaW1hcmlseVxuICAgKiB0byBmYWNpbGl0YXRlIHRoZSB0d28td2F5IGJpbmRpbmcgZm9yIHRoZSBgdmFsdWVgIGlucHV0LlxuICAgKiBAZG9jcy1wcml2YXRlXG4gICAqL1xuICBAT3V0cHV0KCkgcmVhZG9ubHkgdmFsdWVDaGFuZ2U6IEV2ZW50RW1pdHRlcjxudW1iZXIgfCBudWxsPiA9IG5ldyBFdmVudEVtaXR0ZXI8bnVtYmVyIHwgbnVsbD4oKTtcblxuICAvKiogVGhlIHZhbHVlIHRvIGJlIHVzZWQgZm9yIGRpc3BsYXkgcHVycG9zZXMuICovXG4gIGdldCBkaXNwbGF5VmFsdWUoKTogc3RyaW5nIHwgbnVtYmVyIHtcbiAgICBpZiAodGhpcy5kaXNwbGF5V2l0aCkge1xuICAgICAgLy8gVmFsdWUgaXMgbmV2ZXIgbnVsbCBidXQgc2luY2Ugc2V0dGVycyBhbmQgZ2V0dGVycyBjYW5ub3QgaGF2ZVxuICAgICAgLy8gZGlmZmVyZW50IHR5cGVzLCB0aGUgdmFsdWUgZ2V0dGVyIGlzIGFsc28gdHlwZWQgdG8gcmV0dXJuIG51bGwuXG4gICAgICByZXR1cm4gdGhpcy5kaXNwbGF5V2l0aCh0aGlzLnZhbHVlISk7XG4gICAgfVxuXG4gICAgLy8gTm90ZSB0aGF0IHRoaXMgY291bGQgYmUgaW1wcm92ZWQgZnVydGhlciBieSByb3VuZGluZyBzb21ldGhpbmcgbGlrZSAwLjk5OSB0byAxIG9yXG4gICAgLy8gMC44OTkgdG8gMC45LCBob3dldmVyIGl0IGlzIHZlcnkgcGVyZm9ybWFuY2Ugc2Vuc2l0aXZlLCBiZWNhdXNlIGl0IGdldHMgY2FsbGVkIG9uXG4gICAgLy8gZXZlcnkgY2hhbmdlIGRldGVjdGlvbiBjeWNsZS5cbiAgICBpZiAodGhpcy5fcm91bmRUb0RlY2ltYWwgJiYgdGhpcy52YWx1ZSAmJiB0aGlzLnZhbHVlICUgMSAhPT0gMCkge1xuICAgICAgcmV0dXJuIHRoaXMudmFsdWUudG9GaXhlZCh0aGlzLl9yb3VuZFRvRGVjaW1hbCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMudmFsdWUgfHwgMDtcbiAgfVxuXG4gIC8qKiBzZXQgZm9jdXMgdG8gdGhlIGhvc3QgZWxlbWVudCAqL1xuICBmb2N1cyhvcHRpb25zPzogRm9jdXNPcHRpb25zKSB7XG4gICAgdGhpcy5fZm9jdXNIb3N0RWxlbWVudChvcHRpb25zKTtcbiAgfVxuXG4gIC8qKiBibHVyIHRoZSBob3N0IGVsZW1lbnQgKi9cbiAgYmx1cigpIHtcbiAgICB0aGlzLl9ibHVySG9zdEVsZW1lbnQoKTtcbiAgfVxuXG4gIC8qKiBvblRvdWNoIGZ1bmN0aW9uIHJlZ2lzdGVyZWQgdmlhIHJlZ2lzdGVyT25Ub3VjaCAoQ29udHJvbFZhbHVlQWNjZXNzb3IpLiAqL1xuICBvblRvdWNoZWQ6ICgpID0+IGFueSA9ICgpID0+IHt9O1xuXG4gIC8qKiBUaGUgcGVyY2VudGFnZSBvZiB0aGUgc2xpZGVyIHRoYXQgY29pbmNpZGVzIHdpdGggdGhlIHZhbHVlLiAqL1xuICBnZXQgcGVyY2VudCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5fY2xhbXAodGhpcy5fcGVyY2VudCk7IH1cbiAgcHJpdmF0ZSBfcGVyY2VudDogbnVtYmVyID0gMDtcblxuICAvKipcbiAgICogV2hldGhlciBvciBub3QgdGhlIHRodW1iIGlzIHNsaWRpbmcuXG4gICAqIFVzZWQgdG8gZGV0ZXJtaW5lIGlmIHRoZXJlIHNob3VsZCBiZSBhIHRyYW5zaXRpb24gZm9yIHRoZSB0aHVtYiBhbmQgZmlsbCB0cmFjay5cbiAgICovXG4gIF9pc1NsaWRpbmc6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAvKipcbiAgICogV2hldGhlciBvciBub3QgdGhlIHNsaWRlciBpcyBhY3RpdmUgKGNsaWNrZWQgb3Igc2xpZGluZykuXG4gICAqIFVzZWQgdG8gc2hyaW5rIGFuZCBncm93IHRoZSB0aHVtYiBhcyBhY2NvcmRpbmcgdG8gdGhlIE1hdGVyaWFsIERlc2lnbiBzcGVjLlxuICAgKi9cbiAgX2lzQWN0aXZlOiBib29sZWFuID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIGF4aXMgb2YgdGhlIHNsaWRlciBpcyBpbnZlcnRlZC5cbiAgICogKGkuZS4gd2hldGhlciBtb3ZpbmcgdGhlIHRodW1iIGluIHRoZSBwb3NpdGl2ZSB4IG9yIHkgZGlyZWN0aW9uIGRlY3JlYXNlcyB0aGUgc2xpZGVyJ3MgdmFsdWUpLlxuICAgKi9cbiAgX3Nob3VsZEludmVydEF4aXMoKSB7XG4gICAgLy8gU3RhbmRhcmQgbm9uLWludmVydGVkIG1vZGUgZm9yIGEgdmVydGljYWwgc2xpZGVyIHNob3VsZCBiZSBkcmFnZ2luZyB0aGUgdGh1bWIgZnJvbSBib3R0b20gdG9cbiAgICAvLyB0b3AuIEhvd2V2ZXIgZnJvbSBhIHktYXhpcyBzdGFuZHBvaW50IHRoaXMgaXMgaW52ZXJ0ZWQuXG4gICAgcmV0dXJuIHRoaXMudmVydGljYWwgPyAhdGhpcy5pbnZlcnQgOiB0aGlzLmludmVydDtcbiAgfVxuXG5cbiAgLyoqIFdoZXRoZXIgdGhlIHNsaWRlciBpcyBhdCBpdHMgbWluaW11bSB2YWx1ZS4gKi9cbiAgX2lzTWluVmFsdWUoKSB7XG4gICAgcmV0dXJuIHRoaXMucGVyY2VudCA9PT0gMDtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgYW1vdW50IG9mIHNwYWNlIHRvIGxlYXZlIGJldHdlZW4gdGhlIHNsaWRlciB0aHVtYiBhbmQgdGhlIHRyYWNrIGZpbGwgJiB0cmFjayBiYWNrZ3JvdW5kXG4gICAqIGVsZW1lbnRzLlxuICAgKi9cbiAgX2dldFRodW1iR2FwKCkge1xuICAgIGlmICh0aGlzLmRpc2FibGVkKSB7XG4gICAgICByZXR1cm4gRElTQUJMRURfVEhVTUJfR0FQO1xuICAgIH1cbiAgICBpZiAodGhpcy5faXNNaW5WYWx1ZSgpICYmICF0aGlzLnRodW1iTGFiZWwpIHtcbiAgICAgIHJldHVybiB0aGlzLl9pc0FjdGl2ZSA/IE1JTl9WQUxVRV9BQ1RJVkVfVEhVTUJfR0FQIDogTUlOX1ZBTFVFX05PTkFDVElWRV9USFVNQl9HQVA7XG4gICAgfVxuICAgIHJldHVybiAwO1xuICB9XG5cbiAgLyoqIENTUyBzdHlsZXMgZm9yIHRoZSB0cmFjayBiYWNrZ3JvdW5kIGVsZW1lbnQuICovXG4gIF9nZXRUcmFja0JhY2tncm91bmRTdHlsZXMoKTogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfSB7XG4gICAgY29uc3QgYXhpcyA9IHRoaXMudmVydGljYWwgPyAnWScgOiAnWCc7XG4gICAgY29uc3Qgc2NhbGUgPSB0aGlzLnZlcnRpY2FsID8gYDEsICR7MSAtIHRoaXMucGVyY2VudH0sIDFgIDogYCR7MSAtIHRoaXMucGVyY2VudH0sIDEsIDFgO1xuICAgIGNvbnN0IHNpZ24gPSB0aGlzLl9zaG91bGRJbnZlcnRNb3VzZUNvb3JkcygpID8gJy0nIDogJyc7XG5cbiAgICByZXR1cm4ge1xuICAgICAgLy8gc2NhbGUzZCBhdm9pZHMgc29tZSByZW5kZXJpbmcgaXNzdWVzIGluIENocm9tZS4gU2VlICMxMjA3MS5cbiAgICAgIHRyYW5zZm9ybTogYHRyYW5zbGF0ZSR7YXhpc30oJHtzaWdufSR7dGhpcy5fZ2V0VGh1bWJHYXAoKX1weCkgc2NhbGUzZCgke3NjYWxlfSlgXG4gICAgfTtcbiAgfVxuXG4gIC8qKiBDU1Mgc3R5bGVzIGZvciB0aGUgdHJhY2sgZmlsbCBlbGVtZW50LiAqL1xuICBfZ2V0VHJhY2tGaWxsU3R5bGVzKCk6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0ge1xuICAgIGNvbnN0IHBlcmNlbnQgPSB0aGlzLnBlcmNlbnQ7XG4gICAgY29uc3QgYXhpcyA9IHRoaXMudmVydGljYWwgPyAnWScgOiAnWCc7XG4gICAgY29uc3Qgc2NhbGUgPSB0aGlzLnZlcnRpY2FsID8gYDEsICR7cGVyY2VudH0sIDFgIDogYCR7cGVyY2VudH0sIDEsIDFgO1xuICAgIGNvbnN0IHNpZ24gPSB0aGlzLl9zaG91bGRJbnZlcnRNb3VzZUNvb3JkcygpID8gJycgOiAnLSc7XG5cbiAgICByZXR1cm4ge1xuICAgICAgLy8gc2NhbGUzZCBhdm9pZHMgc29tZSByZW5kZXJpbmcgaXNzdWVzIGluIENocm9tZS4gU2VlICMxMjA3MS5cbiAgICAgIHRyYW5zZm9ybTogYHRyYW5zbGF0ZSR7YXhpc30oJHtzaWdufSR7dGhpcy5fZ2V0VGh1bWJHYXAoKX1weCkgc2NhbGUzZCgke3NjYWxlfSlgLFxuICAgICAgLy8gaU9TIFNhZmFyaSBoYXMgYSBidWcgd2hlcmUgaXQgd29uJ3QgcmUtcmVuZGVyIGVsZW1lbnRzIHdoaWNoIHN0YXJ0IG9mIGFzIGBzY2FsZSgwKWAgdW50aWxcbiAgICAgIC8vIHNvbWV0aGluZyBmb3JjZXMgYSBzdHlsZSByZWNhbGN1bGF0aW9uIG9uIGl0LiBTaW5jZSB3ZSdsbCBlbmQgdXAgd2l0aCBgc2NhbGUoMClgIHdoZW5cbiAgICAgIC8vIHRoZSB2YWx1ZSBvZiB0aGUgc2xpZGVyIGlzIDAsIHdlIGNhbiBlYXNpbHkgZ2V0IGludG8gdGhpcyBzaXR1YXRpb24uIFdlIGZvcmNlIGFcbiAgICAgIC8vIHJlY2FsY3VsYXRpb24gYnkgY2hhbmdpbmcgdGhlIGVsZW1lbnQncyBgZGlzcGxheWAgd2hlbiBpdCBnb2VzIGZyb20gMCB0byBhbnkgb3RoZXIgdmFsdWUuXG4gICAgICBkaXNwbGF5OiBwZXJjZW50ID09PSAwID8gJ25vbmUnIDogJydcbiAgICB9O1xuICB9XG5cbiAgLyoqIENTUyBzdHlsZXMgZm9yIHRoZSB0aWNrcyBjb250YWluZXIgZWxlbWVudC4gKi9cbiAgX2dldFRpY2tzQ29udGFpbmVyU3R5bGVzKCk6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0ge1xuICAgIGxldCBheGlzID0gdGhpcy52ZXJ0aWNhbCA/ICdZJyA6ICdYJztcbiAgICAvLyBGb3IgYSBob3Jpem9udGFsIHNsaWRlciBpbiBSVEwgbGFuZ3VhZ2VzIHdlIHB1c2ggdGhlIHRpY2tzIGNvbnRhaW5lciBvZmYgdGhlIGxlZnQgZWRnZVxuICAgIC8vIGluc3RlYWQgb2YgdGhlIHJpZ2h0IGVkZ2UgdG8gYXZvaWQgY2F1c2luZyBhIGhvcml6b250YWwgc2Nyb2xsYmFyIHRvIGFwcGVhci5cbiAgICBsZXQgc2lnbiA9ICF0aGlzLnZlcnRpY2FsICYmIHRoaXMuX2dldERpcmVjdGlvbigpID09ICdydGwnID8gJycgOiAnLSc7XG4gICAgbGV0IG9mZnNldCA9IHRoaXMuX3RpY2tJbnRlcnZhbFBlcmNlbnQgLyAyICogMTAwO1xuICAgIHJldHVybiB7XG4gICAgICAndHJhbnNmb3JtJzogYHRyYW5zbGF0ZSR7YXhpc30oJHtzaWdufSR7b2Zmc2V0fSUpYFxuICAgIH07XG4gIH1cblxuICAvKiogQ1NTIHN0eWxlcyBmb3IgdGhlIHRpY2tzIGVsZW1lbnQuICovXG4gIF9nZXRUaWNrc1N0eWxlcygpOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9IHtcbiAgICBsZXQgdGlja1NpemUgPSB0aGlzLl90aWNrSW50ZXJ2YWxQZXJjZW50ICogMTAwO1xuICAgIGxldCBiYWNrZ3JvdW5kU2l6ZSA9IHRoaXMudmVydGljYWwgPyBgMnB4ICR7dGlja1NpemV9JWAgOiBgJHt0aWNrU2l6ZX0lIDJweGA7XG4gICAgbGV0IGF4aXMgPSB0aGlzLnZlcnRpY2FsID8gJ1knIDogJ1gnO1xuICAgIC8vIERlcGVuZGluZyBvbiB0aGUgZGlyZWN0aW9uIHdlIHB1c2hlZCB0aGUgdGlja3MgY29udGFpbmVyLCBwdXNoIHRoZSB0aWNrcyB0aGUgb3Bwb3NpdGVcbiAgICAvLyBkaXJlY3Rpb24gdG8gcmUtY2VudGVyIHRoZW0gYnV0IGNsaXAgb2ZmIHRoZSBlbmQgZWRnZS4gSW4gUlRMIGxhbmd1YWdlcyB3ZSBuZWVkIHRvIGZsaXAgdGhlXG4gICAgLy8gdGlja3MgMTgwIGRlZ3JlZXMgc28gd2UncmUgcmVhbGx5IGN1dHRpbmcgb2ZmIHRoZSBlbmQgZWRnZSBhYmQgbm90IHRoZSBzdGFydC5cbiAgICBsZXQgc2lnbiA9ICF0aGlzLnZlcnRpY2FsICYmIHRoaXMuX2dldERpcmVjdGlvbigpID09ICdydGwnID8gJy0nIDogJyc7XG4gICAgbGV0IHJvdGF0ZSA9ICF0aGlzLnZlcnRpY2FsICYmIHRoaXMuX2dldERpcmVjdGlvbigpID09ICdydGwnID8gJyByb3RhdGUoMTgwZGVnKScgOiAnJztcbiAgICBsZXQgc3R5bGVzOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9ID0ge1xuICAgICAgJ2JhY2tncm91bmRTaXplJzogYmFja2dyb3VuZFNpemUsXG4gICAgICAvLyBXaXRob3V0IHRyYW5zbGF0ZVogdGlja3Mgc29tZXRpbWVzIGppdHRlciBhcyB0aGUgc2xpZGVyIG1vdmVzIG9uIENocm9tZSAmIEZpcmVmb3guXG4gICAgICAndHJhbnNmb3JtJzogYHRyYW5zbGF0ZVooMCkgdHJhbnNsYXRlJHtheGlzfSgke3NpZ259JHt0aWNrU2l6ZSAvIDJ9JSkke3JvdGF0ZX1gXG4gICAgfTtcblxuICAgIGlmICh0aGlzLl9pc01pblZhbHVlKCkgJiYgdGhpcy5fZ2V0VGh1bWJHYXAoKSkge1xuICAgICAgY29uc3Qgc2hvdWxkSW52ZXJ0QXhpcyA9IHRoaXMuX3Nob3VsZEludmVydEF4aXMoKTtcbiAgICAgIGxldCBzaWRlOiBzdHJpbmc7XG5cbiAgICAgIGlmICh0aGlzLnZlcnRpY2FsKSB7XG4gICAgICAgIHNpZGUgPSBzaG91bGRJbnZlcnRBeGlzID8gJ0JvdHRvbScgOiAnVG9wJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNpZGUgPSBzaG91bGRJbnZlcnRBeGlzID8gJ1JpZ2h0JyA6ICdMZWZ0JztcbiAgICAgIH1cblxuICAgICAgc3R5bGVzW2BwYWRkaW5nJHtzaWRlfWBdID0gYCR7dGhpcy5fZ2V0VGh1bWJHYXAoKX1weGA7XG4gICAgfVxuXG4gICAgcmV0dXJuIHN0eWxlcztcbiAgfVxuXG4gIF9nZXRUaHVtYkNvbnRhaW5lclN0eWxlcygpOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9IHtcbiAgICBjb25zdCBzaG91bGRJbnZlcnRBeGlzID0gdGhpcy5fc2hvdWxkSW52ZXJ0QXhpcygpO1xuICAgIGxldCBheGlzID0gdGhpcy52ZXJ0aWNhbCA/ICdZJyA6ICdYJztcbiAgICAvLyBGb3IgYSBob3Jpem9udGFsIHNsaWRlciBpbiBSVEwgbGFuZ3VhZ2VzIHdlIHB1c2ggdGhlIHRodW1iIGNvbnRhaW5lciBvZmYgdGhlIGxlZnQgZWRnZVxuICAgIC8vIGluc3RlYWQgb2YgdGhlIHJpZ2h0IGVkZ2UgdG8gYXZvaWQgY2F1c2luZyBhIGhvcml6b250YWwgc2Nyb2xsYmFyIHRvIGFwcGVhci5cbiAgICBsZXQgaW52ZXJ0T2Zmc2V0ID1cbiAgICAgICAgKHRoaXMuX2dldERpcmVjdGlvbigpID09ICdydGwnICYmICF0aGlzLnZlcnRpY2FsKSA/ICFzaG91bGRJbnZlcnRBeGlzIDogc2hvdWxkSW52ZXJ0QXhpcztcbiAgICBsZXQgb2Zmc2V0ID0gKGludmVydE9mZnNldCA/IHRoaXMucGVyY2VudCA6IDEgLSB0aGlzLnBlcmNlbnQpICogMTAwO1xuICAgIHJldHVybiB7XG4gICAgICAndHJhbnNmb3JtJzogYHRyYW5zbGF0ZSR7YXhpc30oLSR7b2Zmc2V0fSUpYFxuICAgIH07XG4gIH1cblxuICAvKiogVGhlIHNpemUgb2YgYSB0aWNrIGludGVydmFsIGFzIGEgcGVyY2VudGFnZSBvZiB0aGUgc2l6ZSBvZiB0aGUgdHJhY2suICovXG4gIHByaXZhdGUgX3RpY2tJbnRlcnZhbFBlcmNlbnQ6IG51bWJlciA9IDA7XG5cbiAgLyoqIFRoZSBkaW1lbnNpb25zIG9mIHRoZSBzbGlkZXIuICovXG4gIHByaXZhdGUgX3NsaWRlckRpbWVuc2lvbnM6IENsaWVudFJlY3QgfCBudWxsID0gbnVsbDtcblxuICBwcml2YXRlIF9jb250cm9sVmFsdWVBY2Nlc3NvckNoYW5nZUZuOiAodmFsdWU6IGFueSkgPT4gdm9pZCA9ICgpID0+IHt9O1xuXG4gIC8qKiBEZWNpbWFsIHBsYWNlcyB0byByb3VuZCB0bywgYmFzZWQgb24gdGhlIHN0ZXAgYW1vdW50LiAqL1xuICBwcml2YXRlIF9yb3VuZFRvRGVjaW1hbDogbnVtYmVyO1xuXG4gIC8qKiBTdWJzY3JpcHRpb24gdG8gdGhlIERpcmVjdGlvbmFsaXR5IGNoYW5nZSBFdmVudEVtaXR0ZXIuICovXG4gIHByaXZhdGUgX2RpckNoYW5nZVN1YnNjcmlwdGlvbiA9IFN1YnNjcmlwdGlvbi5FTVBUWTtcblxuICAvKiogVGhlIHZhbHVlIG9mIHRoZSBzbGlkZXIgd2hlbiB0aGUgc2xpZGUgc3RhcnQgZXZlbnQgZmlyZXMuICovXG4gIHByaXZhdGUgX3ZhbHVlT25TbGlkZVN0YXJ0OiBudW1iZXIgfCBudWxsO1xuXG4gIC8qKiBSZWZlcmVuY2UgdG8gdGhlIGlubmVyIHNsaWRlciB3cmFwcGVyIGVsZW1lbnQuICovXG4gIEBWaWV3Q2hpbGQoJ3NsaWRlcldyYXBwZXInKSBwcml2YXRlIF9zbGlkZXJXcmFwcGVyOiBFbGVtZW50UmVmO1xuXG4gIC8qKlxuICAgKiBXaGV0aGVyIG1vdXNlIGV2ZW50cyBzaG91bGQgYmUgY29udmVydGVkIHRvIGEgc2xpZGVyIHBvc2l0aW9uIGJ5IGNhbGN1bGF0aW5nIHRoZWlyIGRpc3RhbmNlXG4gICAqIGZyb20gdGhlIHJpZ2h0IG9yIGJvdHRvbSBlZGdlIG9mIHRoZSBzbGlkZXIgYXMgb3Bwb3NlZCB0byB0aGUgdG9wIG9yIGxlZnQuXG4gICAqL1xuICBfc2hvdWxkSW52ZXJ0TW91c2VDb29yZHMoKSB7XG4gICAgY29uc3Qgc2hvdWxkSW52ZXJ0QXhpcyA9IHRoaXMuX3Nob3VsZEludmVydEF4aXMoKTtcbiAgICByZXR1cm4gKHRoaXMuX2dldERpcmVjdGlvbigpID09ICdydGwnICYmICF0aGlzLnZlcnRpY2FsKSA/ICFzaG91bGRJbnZlcnRBeGlzIDogc2hvdWxkSW52ZXJ0QXhpcztcbiAgfVxuXG4gIC8qKiBUaGUgbGFuZ3VhZ2UgZGlyZWN0aW9uIGZvciB0aGlzIHNsaWRlciBlbGVtZW50LiAqL1xuICBwcml2YXRlIF9nZXREaXJlY3Rpb24oKSB7XG4gICAgcmV0dXJuICh0aGlzLl9kaXIgJiYgdGhpcy5fZGlyLnZhbHVlID09ICdydGwnKSA/ICdydGwnIDogJ2x0cic7XG4gIH1cblxuICAvKiogS2VlcHMgdHJhY2sgb2YgdGhlIGxhc3QgcG9pbnRlciBldmVudCB0aGF0IHdhcyBjYXB0dXJlZCBieSB0aGUgc2xpZGVyLiAqL1xuICBwcml2YXRlIF9sYXN0UG9pbnRlckV2ZW50OiBNb3VzZUV2ZW50IHwgVG91Y2hFdmVudCB8IG51bGw7XG5cbiAgLyoqIFVzZWQgdG8gc3Vic2NyaWJlIHRvIGdsb2JhbCBtb3ZlIGFuZCBlbmQgZXZlbnRzICovXG4gIHByb3RlY3RlZCBfZG9jdW1lbnQ6IERvY3VtZW50O1xuXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnRSZWY6IEVsZW1lbnRSZWYsXG4gICAgICAgICAgICAgIHByaXZhdGUgX2ZvY3VzTW9uaXRvcjogRm9jdXNNb25pdG9yLFxuICAgICAgICAgICAgICBwcml2YXRlIF9jaGFuZ2VEZXRlY3RvclJlZjogQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gICAgICAgICAgICAgIEBPcHRpb25hbCgpIHByaXZhdGUgX2RpcjogRGlyZWN0aW9uYWxpdHksXG4gICAgICAgICAgICAgIEBBdHRyaWJ1dGUoJ3RhYmluZGV4JykgdGFiSW5kZXg6IHN0cmluZyxcbiAgICAgICAgICAgICAgcHJpdmF0ZSBfbmdab25lOiBOZ1pvbmUsXG4gICAgICAgICAgICAgIEBJbmplY3QoRE9DVU1FTlQpIF9kb2N1bWVudDogYW55LFxuICAgICAgICAgICAgICBAT3B0aW9uYWwoKSBASW5qZWN0KEFOSU1BVElPTl9NT0RVTEVfVFlQRSkgcHVibGljIF9hbmltYXRpb25Nb2RlPzogc3RyaW5nKSB7XG4gICAgc3VwZXIoZWxlbWVudFJlZik7XG4gICAgdGhpcy5fZG9jdW1lbnQgPSBfZG9jdW1lbnQ7XG4gICAgdGhpcy50YWJJbmRleCA9IHBhcnNlSW50KHRhYkluZGV4KSB8fCAwO1xuXG4gICAgX25nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50O1xuICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLl9wb2ludGVyRG93biwgYWN0aXZlRXZlbnRPcHRpb25zKTtcbiAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHRoaXMuX3BvaW50ZXJEb3duLCBhY3RpdmVFdmVudE9wdGlvbnMpO1xuICAgIH0pO1xuICB9XG5cbiAgbmdBZnRlclZpZXdJbml0KCkge1xuICAgIHRoaXMuX2ZvY3VzTW9uaXRvclxuICAgICAgICAubW9uaXRvcih0aGlzLl9lbGVtZW50UmVmLCB0cnVlKVxuICAgICAgICAuc3Vic2NyaWJlKChvcmlnaW46IEZvY3VzT3JpZ2luKSA9PiB7XG4gICAgICAgICAgdGhpcy5faXNBY3RpdmUgPSAhIW9yaWdpbiAmJiBvcmlnaW4gIT09ICdrZXlib2FyZCc7XG4gICAgICAgICAgdGhpcy5fY2hhbmdlRGV0ZWN0b3JSZWYuZGV0ZWN0Q2hhbmdlcygpO1xuICAgICAgICB9KTtcbiAgICBpZiAodGhpcy5fZGlyKSB7XG4gICAgICB0aGlzLl9kaXJDaGFuZ2VTdWJzY3JpcHRpb24gPSB0aGlzLl9kaXIuY2hhbmdlLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgY29uc3QgZWxlbWVudCA9IHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudDtcbiAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMuX3BvaW50ZXJEb3duLCBhY3RpdmVFdmVudE9wdGlvbnMpO1xuICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHRoaXMuX3BvaW50ZXJEb3duLCBhY3RpdmVFdmVudE9wdGlvbnMpO1xuICAgIHRoaXMuX2xhc3RQb2ludGVyRXZlbnQgPSBudWxsO1xuICAgIHRoaXMuX3JlbW92ZUdsb2JhbEV2ZW50cygpO1xuICAgIHRoaXMuX2ZvY3VzTW9uaXRvci5zdG9wTW9uaXRvcmluZyh0aGlzLl9lbGVtZW50UmVmKTtcbiAgICB0aGlzLl9kaXJDaGFuZ2VTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgfVxuXG4gIF9vbk1vdXNlZW50ZXIoKSB7XG4gICAgaWYgKHRoaXMuZGlzYWJsZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBXZSBzYXZlIHRoZSBkaW1lbnNpb25zIG9mIHRoZSBzbGlkZXIgaGVyZSBzbyB3ZSBjYW4gdXNlIHRoZW0gdG8gdXBkYXRlIHRoZSBzcGFjaW5nIG9mIHRoZVxuICAgIC8vIHRpY2tzIGFuZCBkZXRlcm1pbmUgd2hlcmUgb24gdGhlIHNsaWRlciBjbGljayBhbmQgc2xpZGUgZXZlbnRzIGhhcHBlbi5cbiAgICB0aGlzLl9zbGlkZXJEaW1lbnNpb25zID0gdGhpcy5fZ2V0U2xpZGVyRGltZW5zaW9ucygpO1xuICAgIHRoaXMuX3VwZGF0ZVRpY2tJbnRlcnZhbFBlcmNlbnQoKTtcbiAgfVxuXG4gIF9vbkZvY3VzKCkge1xuICAgIC8vIFdlIHNhdmUgdGhlIGRpbWVuc2lvbnMgb2YgdGhlIHNsaWRlciBoZXJlIHNvIHdlIGNhbiB1c2UgdGhlbSB0byB1cGRhdGUgdGhlIHNwYWNpbmcgb2YgdGhlXG4gICAgLy8gdGlja3MgYW5kIGRldGVybWluZSB3aGVyZSBvbiB0aGUgc2xpZGVyIGNsaWNrIGFuZCBzbGlkZSBldmVudHMgaGFwcGVuLlxuICAgIHRoaXMuX3NsaWRlckRpbWVuc2lvbnMgPSB0aGlzLl9nZXRTbGlkZXJEaW1lbnNpb25zKCk7XG4gICAgdGhpcy5fdXBkYXRlVGlja0ludGVydmFsUGVyY2VudCgpO1xuICB9XG5cbiAgX29uQmx1cigpIHtcbiAgICB0aGlzLm9uVG91Y2hlZCgpO1xuICB9XG5cbiAgX29uS2V5ZG93bihldmVudDogS2V5Ym9hcmRFdmVudCkge1xuICAgIGlmICh0aGlzLmRpc2FibGVkIHx8IGhhc01vZGlmaWVyS2V5KGV2ZW50KSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IG9sZFZhbHVlID0gdGhpcy52YWx1ZTtcblxuICAgIHN3aXRjaCAoZXZlbnQua2V5Q29kZSkge1xuICAgICAgY2FzZSBQQUdFX1VQOlxuICAgICAgICB0aGlzLl9pbmNyZW1lbnQoMTApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgUEFHRV9ET1dOOlxuICAgICAgICB0aGlzLl9pbmNyZW1lbnQoLTEwKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEVORDpcbiAgICAgICAgdGhpcy52YWx1ZSA9IHRoaXMubWF4O1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgSE9NRTpcbiAgICAgICAgdGhpcy52YWx1ZSA9IHRoaXMubWluO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgTEVGVF9BUlJPVzpcbiAgICAgICAgLy8gTk9URTogRm9yIGEgc2lnaHRlZCB1c2VyIGl0IHdvdWxkIG1ha2UgbW9yZSBzZW5zZSB0aGF0IHdoZW4gdGhleSBwcmVzcyBhbiBhcnJvdyBrZXkgb24gYW5cbiAgICAgICAgLy8gaW52ZXJ0ZWQgc2xpZGVyIHRoZSB0aHVtYiBtb3ZlcyBpbiB0aGF0IGRpcmVjdGlvbi4gSG93ZXZlciBmb3IgYSBibGluZCB1c2VyLCBub3RoaW5nXG4gICAgICAgIC8vIGFib3V0IHRoZSBzbGlkZXIgaW5kaWNhdGVzIHRoYXQgaXQgaXMgaW52ZXJ0ZWQuIFRoZXkgd2lsbCBleHBlY3QgbGVmdCB0byBiZSBkZWNyZW1lbnQsXG4gICAgICAgIC8vIHJlZ2FyZGxlc3Mgb2YgaG93IGl0IGFwcGVhcnMgb24gdGhlIHNjcmVlbi4gRm9yIHNwZWFrZXJzIG9mUlRMIGxhbmd1YWdlcywgdGhleSBwcm9iYWJseVxuICAgICAgICAvLyBleHBlY3QgbGVmdCB0byBtZWFuIGluY3JlbWVudC4gVGhlcmVmb3JlIHdlIGZsaXAgdGhlIG1lYW5pbmcgb2YgdGhlIHNpZGUgYXJyb3cga2V5cyBmb3JcbiAgICAgICAgLy8gUlRMLiBGb3IgaW52ZXJ0ZWQgc2xpZGVycyB3ZSBwcmVmZXIgYSBnb29kIGExMXkgZXhwZXJpZW5jZSB0byBoYXZpbmcgaXQgXCJsb29rIHJpZ2h0XCIgZm9yXG4gICAgICAgIC8vIHNpZ2h0ZWQgdXNlcnMsIHRoZXJlZm9yZSB3ZSBkbyBub3Qgc3dhcCB0aGUgbWVhbmluZy5cbiAgICAgICAgdGhpcy5faW5jcmVtZW50KHRoaXMuX2dldERpcmVjdGlvbigpID09ICdydGwnID8gMSA6IC0xKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFVQX0FSUk9XOlxuICAgICAgICB0aGlzLl9pbmNyZW1lbnQoMSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBSSUdIVF9BUlJPVzpcbiAgICAgICAgLy8gU2VlIGNvbW1lbnQgb24gTEVGVF9BUlJPVyBhYm91dCB0aGUgY29uZGl0aW9ucyB1bmRlciB3aGljaCB3ZSBmbGlwIHRoZSBtZWFuaW5nLlxuICAgICAgICB0aGlzLl9pbmNyZW1lbnQodGhpcy5fZ2V0RGlyZWN0aW9uKCkgPT0gJ3J0bCcgPyAtMSA6IDEpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgRE9XTl9BUlJPVzpcbiAgICAgICAgdGhpcy5faW5jcmVtZW50KC0xKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICAvLyBSZXR1cm4gaWYgdGhlIGtleSBpcyBub3Qgb25lIHRoYXQgd2UgZXhwbGljaXRseSBoYW5kbGUgdG8gYXZvaWQgY2FsbGluZyBwcmV2ZW50RGVmYXVsdCBvblxuICAgICAgICAvLyBpdC5cbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChvbGRWYWx1ZSAhPSB0aGlzLnZhbHVlKSB7XG4gICAgICB0aGlzLl9lbWl0SW5wdXRFdmVudCgpO1xuICAgICAgdGhpcy5fZW1pdENoYW5nZUV2ZW50KCk7XG4gICAgfVxuXG4gICAgdGhpcy5faXNTbGlkaW5nID0gdHJ1ZTtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICB9XG5cbiAgX29uS2V5dXAoKSB7XG4gICAgdGhpcy5faXNTbGlkaW5nID0gZmFsc2U7XG4gIH1cblxuICAvKiogQ2FsbGVkIHdoZW4gdGhlIHVzZXIgaGFzIHB1dCB0aGVpciBwb2ludGVyIGRvd24gb24gdGhlIHNsaWRlci4gKi9cbiAgcHJpdmF0ZSBfcG9pbnRlckRvd24gPSAoZXZlbnQ6IFRvdWNoRXZlbnQgfCBNb3VzZUV2ZW50KSA9PiB7XG4gICAgLy8gRG9uJ3QgZG8gYW55dGhpbmcgaWYgdGhlIHNsaWRlciBpcyBkaXNhYmxlZCBvciB0aGVcbiAgICAvLyB1c2VyIGlzIHVzaW5nIGFueXRoaW5nIG90aGVyIHRoYW4gdGhlIG1haW4gbW91c2UgYnV0dG9uLlxuICAgIGlmICh0aGlzLmRpc2FibGVkIHx8IHRoaXMuX2lzU2xpZGluZyB8fCAoIWlzVG91Y2hFdmVudChldmVudCkgJiYgZXZlbnQuYnV0dG9uICE9PSAwKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX25nWm9uZS5ydW4oKCkgPT4ge1xuICAgICAgY29uc3Qgb2xkVmFsdWUgPSB0aGlzLnZhbHVlO1xuICAgICAgY29uc3QgcG9pbnRlclBvc2l0aW9uID0gZ2V0UG9pbnRlclBvc2l0aW9uT25QYWdlKGV2ZW50KTtcbiAgICAgIHRoaXMuX2lzU2xpZGluZyA9IHRydWU7XG4gICAgICB0aGlzLl9sYXN0UG9pbnRlckV2ZW50ID0gZXZlbnQ7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgdGhpcy5fZm9jdXNIb3N0RWxlbWVudCgpO1xuICAgICAgdGhpcy5fb25Nb3VzZWVudGVyKCk7IC8vIFNpbXVsYXRlIG1vdXNlZW50ZXIgaW4gY2FzZSB0aGlzIGlzIGEgbW9iaWxlIGRldmljZS5cbiAgICAgIHRoaXMuX2JpbmRHbG9iYWxFdmVudHMoZXZlbnQpO1xuICAgICAgdGhpcy5fZm9jdXNIb3N0RWxlbWVudCgpO1xuICAgICAgdGhpcy5fdXBkYXRlVmFsdWVGcm9tUG9zaXRpb24ocG9pbnRlclBvc2l0aW9uKTtcbiAgICAgIHRoaXMuX3ZhbHVlT25TbGlkZVN0YXJ0ID0gb2xkVmFsdWU7XG5cbiAgICAgIC8vIEVtaXQgYSBjaGFuZ2UgYW5kIGlucHV0IGV2ZW50IGlmIHRoZSB2YWx1ZSBjaGFuZ2VkLlxuICAgICAgaWYgKG9sZFZhbHVlICE9IHRoaXMudmFsdWUpIHtcbiAgICAgICAgdGhpcy5fZW1pdElucHV0RXZlbnQoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiB0aGUgdXNlciBoYXMgbW92ZWQgdGhlaXIgcG9pbnRlciBhZnRlclxuICAgKiBzdGFydGluZyB0byBkcmFnLiBCb3VuZCBvbiB0aGUgZG9jdW1lbnQgbGV2ZWwuXG4gICAqL1xuICBwcml2YXRlIF9wb2ludGVyTW92ZSA9IChldmVudDogVG91Y2hFdmVudCB8IE1vdXNlRXZlbnQpID0+IHtcbiAgICBpZiAodGhpcy5faXNTbGlkaW5nKSB7XG4gICAgICAvLyBQcmV2ZW50IHRoZSBzbGlkZSBmcm9tIHNlbGVjdGluZyBhbnl0aGluZyBlbHNlLlxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGNvbnN0IG9sZFZhbHVlID0gdGhpcy52YWx1ZTtcbiAgICAgIHRoaXMuX2xhc3RQb2ludGVyRXZlbnQgPSBldmVudDtcbiAgICAgIHRoaXMuX3VwZGF0ZVZhbHVlRnJvbVBvc2l0aW9uKGdldFBvaW50ZXJQb3NpdGlvbk9uUGFnZShldmVudCkpO1xuXG4gICAgICAvLyBOYXRpdmUgcmFuZ2UgZWxlbWVudHMgYWx3YXlzIGVtaXQgYGlucHV0YCBldmVudHMgd2hlbiB0aGUgdmFsdWUgY2hhbmdlZCB3aGlsZSBzbGlkaW5nLlxuICAgICAgaWYgKG9sZFZhbHVlICE9IHRoaXMudmFsdWUpIHtcbiAgICAgICAgdGhpcy5fZW1pdElucHV0RXZlbnQoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKiogQ2FsbGVkIHdoZW4gdGhlIHVzZXIgaGFzIGxpZnRlZCB0aGVpciBwb2ludGVyLiBCb3VuZCBvbiB0aGUgZG9jdW1lbnQgbGV2ZWwuICovXG4gIHByaXZhdGUgX3BvaW50ZXJVcCA9IChldmVudDogVG91Y2hFdmVudCB8IE1vdXNlRXZlbnQpID0+IHtcbiAgICBpZiAodGhpcy5faXNTbGlkaW5nKSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgdGhpcy5fcmVtb3ZlR2xvYmFsRXZlbnRzKCk7XG4gICAgICB0aGlzLl9pc1NsaWRpbmcgPSBmYWxzZTtcblxuICAgICAgaWYgKHRoaXMuX3ZhbHVlT25TbGlkZVN0YXJ0ICE9IHRoaXMudmFsdWUgJiYgIXRoaXMuZGlzYWJsZWQpIHtcbiAgICAgICAgdGhpcy5fZW1pdENoYW5nZUV2ZW50KCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX3ZhbHVlT25TbGlkZVN0YXJ0ID0gdGhpcy5fbGFzdFBvaW50ZXJFdmVudCA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgLyoqIENhbGxlZCB3aGVuIHRoZSB3aW5kb3cgaGFzIGxvc3QgZm9jdXMuICovXG4gIHByaXZhdGUgX3dpbmRvd0JsdXIgPSAoKSA9PiB7XG4gICAgLy8gSWYgdGhlIHdpbmRvdyBpcyBibHVycmVkIHdoaWxlIGRyYWdnaW5nIHdlIG5lZWQgdG8gc3RvcCBkcmFnZ2luZyBiZWNhdXNlIHRoZVxuICAgIC8vIGJyb3dzZXIgd29uJ3QgZGlzcGF0Y2ggdGhlIGBtb3VzZXVwYCBhbmQgYHRvdWNoZW5kYCBldmVudHMgYW55bW9yZS5cbiAgICBpZiAodGhpcy5fbGFzdFBvaW50ZXJFdmVudCkge1xuICAgICAgdGhpcy5fcG9pbnRlclVwKHRoaXMuX2xhc3RQb2ludGVyRXZlbnQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBVc2UgZGVmYXVsdFZpZXcgb2YgaW5qZWN0ZWQgZG9jdW1lbnQgaWYgYXZhaWxhYmxlIG9yIGZhbGxiYWNrIHRvIGdsb2JhbCB3aW5kb3cgcmVmZXJlbmNlICovXG4gIHByaXZhdGUgX2dldFdpbmRvdygpOiBXaW5kb3cge1xuICAgIHJldHVybiB0aGlzLl9kb2N1bWVudC5kZWZhdWx0VmlldyB8fCB3aW5kb3c7XG4gIH1cblxuICAvKipcbiAgICogQmluZHMgb3VyIGdsb2JhbCBtb3ZlIGFuZCBlbmQgZXZlbnRzLiBUaGV5J3JlIGJvdW5kIGF0IHRoZSBkb2N1bWVudCBsZXZlbCBhbmQgb25seSB3aGlsZVxuICAgKiBkcmFnZ2luZyBzbyB0aGF0IHRoZSB1c2VyIGRvZXNuJ3QgaGF2ZSB0byBrZWVwIHRoZWlyIHBvaW50ZXIgZXhhY3RseSBvdmVyIHRoZSBzbGlkZXJcbiAgICogYXMgdGhleSdyZSBzd2lwaW5nIGFjcm9zcyB0aGUgc2NyZWVuLlxuICAgKi9cbiAgcHJpdmF0ZSBfYmluZEdsb2JhbEV2ZW50cyh0cmlnZ2VyRXZlbnQ6IFRvdWNoRXZlbnQgfCBNb3VzZUV2ZW50KSB7XG4gICAgLy8gTm90ZSB0aGF0IHdlIGJpbmQgdGhlIGV2ZW50cyB0byB0aGUgYGRvY3VtZW50YCwgYmVjYXVzZSBpdCBhbGxvd3MgdXMgdG8gY2FwdHVyZVxuICAgIC8vIGRyYWcgY2FuY2VsIGV2ZW50cyB3aGVyZSB0aGUgdXNlcidzIHBvaW50ZXIgaXMgb3V0c2lkZSB0aGUgYnJvd3NlciB3aW5kb3cuXG4gICAgY29uc3QgZG9jdW1lbnQgPSB0aGlzLl9kb2N1bWVudDtcbiAgICBjb25zdCBpc1RvdWNoID0gaXNUb3VjaEV2ZW50KHRyaWdnZXJFdmVudCk7XG4gICAgY29uc3QgbW92ZUV2ZW50TmFtZSA9IGlzVG91Y2ggPyAndG91Y2htb3ZlJyA6ICdtb3VzZW1vdmUnO1xuICAgIGNvbnN0IGVuZEV2ZW50TmFtZSA9IGlzVG91Y2ggPyAndG91Y2hlbmQnIDogJ21vdXNldXAnO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIobW92ZUV2ZW50TmFtZSwgdGhpcy5fcG9pbnRlck1vdmUsIGFjdGl2ZUV2ZW50T3B0aW9ucyk7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihlbmRFdmVudE5hbWUsIHRoaXMuX3BvaW50ZXJVcCwgYWN0aXZlRXZlbnRPcHRpb25zKTtcblxuICAgIGlmIChpc1RvdWNoKSB7XG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGNhbmNlbCcsIHRoaXMuX3BvaW50ZXJVcCwgYWN0aXZlRXZlbnRPcHRpb25zKTtcbiAgICB9XG5cbiAgICBjb25zdCB3aW5kb3cgPSB0aGlzLl9nZXRXaW5kb3coKTtcblxuICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cpIHtcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdibHVyJywgdGhpcy5fd2luZG93Qmx1cik7XG4gICAgfVxuICB9XG5cbiAgLyoqIFJlbW92ZXMgYW55IGdsb2JhbCBldmVudCBsaXN0ZW5lcnMgdGhhdCB3ZSBtYXkgaGF2ZSBhZGRlZC4gKi9cbiAgcHJpdmF0ZSBfcmVtb3ZlR2xvYmFsRXZlbnRzKCkge1xuICAgIGNvbnN0IGRvY3VtZW50ID0gdGhpcy5fZG9jdW1lbnQ7XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5fcG9pbnRlck1vdmUsIGFjdGl2ZUV2ZW50T3B0aW9ucyk7XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMuX3BvaW50ZXJVcCwgYWN0aXZlRXZlbnRPcHRpb25zKTtcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCB0aGlzLl9wb2ludGVyTW92ZSwgYWN0aXZlRXZlbnRPcHRpb25zKTtcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRoaXMuX3BvaW50ZXJVcCwgYWN0aXZlRXZlbnRPcHRpb25zKTtcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaGNhbmNlbCcsIHRoaXMuX3BvaW50ZXJVcCwgYWN0aXZlRXZlbnRPcHRpb25zKTtcblxuICAgIGNvbnN0IHdpbmRvdyA9IHRoaXMuX2dldFdpbmRvdygpO1xuXG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdykge1xuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2JsdXInLCB0aGlzLl93aW5kb3dCbHVyKTtcbiAgICB9XG4gIH1cblxuICAvKiogSW5jcmVtZW50cyB0aGUgc2xpZGVyIGJ5IHRoZSBnaXZlbiBudW1iZXIgb2Ygc3RlcHMgKG5lZ2F0aXZlIG51bWJlciBkZWNyZW1lbnRzKS4gKi9cbiAgcHJpdmF0ZSBfaW5jcmVtZW50KG51bVN0ZXBzOiBudW1iZXIpIHtcbiAgICB0aGlzLnZhbHVlID0gdGhpcy5fY2xhbXAoKHRoaXMudmFsdWUgfHwgMCkgKyB0aGlzLnN0ZXAgKiBudW1TdGVwcywgdGhpcy5taW4sIHRoaXMubWF4KTtcbiAgfVxuXG4gIC8qKiBDYWxjdWxhdGUgdGhlIG5ldyB2YWx1ZSBmcm9tIHRoZSBuZXcgcGh5c2ljYWwgbG9jYXRpb24uIFRoZSB2YWx1ZSB3aWxsIGFsd2F5cyBiZSBzbmFwcGVkLiAqL1xuICBwcml2YXRlIF91cGRhdGVWYWx1ZUZyb21Qb3NpdGlvbihwb3M6IHt4OiBudW1iZXIsIHk6IG51bWJlcn0pIHtcbiAgICBpZiAoIXRoaXMuX3NsaWRlckRpbWVuc2lvbnMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgb2Zmc2V0ID0gdGhpcy52ZXJ0aWNhbCA/IHRoaXMuX3NsaWRlckRpbWVuc2lvbnMudG9wIDogdGhpcy5fc2xpZGVyRGltZW5zaW9ucy5sZWZ0O1xuICAgIGxldCBzaXplID0gdGhpcy52ZXJ0aWNhbCA/IHRoaXMuX3NsaWRlckRpbWVuc2lvbnMuaGVpZ2h0IDogdGhpcy5fc2xpZGVyRGltZW5zaW9ucy53aWR0aDtcbiAgICBsZXQgcG9zQ29tcG9uZW50ID0gdGhpcy52ZXJ0aWNhbCA/IHBvcy55IDogcG9zLng7XG5cbiAgICAvLyBUaGUgZXhhY3QgdmFsdWUgaXMgY2FsY3VsYXRlZCBmcm9tIHRoZSBldmVudCBhbmQgdXNlZCB0byBmaW5kIHRoZSBjbG9zZXN0IHNuYXAgdmFsdWUuXG4gICAgbGV0IHBlcmNlbnQgPSB0aGlzLl9jbGFtcCgocG9zQ29tcG9uZW50IC0gb2Zmc2V0KSAvIHNpemUpO1xuXG4gICAgaWYgKHRoaXMuX3Nob3VsZEludmVydE1vdXNlQ29vcmRzKCkpIHtcbiAgICAgIHBlcmNlbnQgPSAxIC0gcGVyY2VudDtcbiAgICB9XG5cbiAgICAvLyBTaW5jZSB0aGUgc3RlcHMgbWF5IG5vdCBkaXZpZGUgY2xlYW5seSBpbnRvIHRoZSBtYXggdmFsdWUsIGlmIHRoZSB1c2VyXG4gICAgLy8gc2xpZCB0byAwIG9yIDEwMCBwZXJjZW50LCB3ZSBqdW1wIHRvIHRoZSBtaW4vbWF4IHZhbHVlLiBUaGlzIGFwcHJvYWNoXG4gICAgLy8gaXMgc2xpZ2h0bHkgbW9yZSBpbnR1aXRpdmUgdGhhbiB1c2luZyBgTWF0aC5jZWlsYCBiZWxvdywgYmVjYXVzZSBpdFxuICAgIC8vIGZvbGxvd3MgdGhlIHVzZXIncyBwb2ludGVyIGNsb3Nlci5cbiAgICBpZiAocGVyY2VudCA9PT0gMCkge1xuICAgICAgdGhpcy52YWx1ZSA9IHRoaXMubWluO1xuICAgIH0gZWxzZSBpZiAocGVyY2VudCA9PT0gMSkge1xuICAgICAgdGhpcy52YWx1ZSA9IHRoaXMubWF4O1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBleGFjdFZhbHVlID0gdGhpcy5fY2FsY3VsYXRlVmFsdWUocGVyY2VudCk7XG5cbiAgICAgIC8vIFRoaXMgY2FsY3VsYXRpb24gZmluZHMgdGhlIGNsb3Nlc3Qgc3RlcCBieSBmaW5kaW5nIHRoZSBjbG9zZXN0XG4gICAgICAvLyB3aG9sZSBudW1iZXIgZGl2aXNpYmxlIGJ5IHRoZSBzdGVwIHJlbGF0aXZlIHRvIHRoZSBtaW4uXG4gICAgICBjb25zdCBjbG9zZXN0VmFsdWUgPSBNYXRoLnJvdW5kKChleGFjdFZhbHVlIC0gdGhpcy5taW4pIC8gdGhpcy5zdGVwKSAqIHRoaXMuc3RlcCArIHRoaXMubWluO1xuXG4gICAgICAvLyBUaGUgdmFsdWUgbmVlZHMgdG8gc25hcCB0byB0aGUgbWluIGFuZCBtYXguXG4gICAgICB0aGlzLnZhbHVlID0gdGhpcy5fY2xhbXAoY2xvc2VzdFZhbHVlLCB0aGlzLm1pbiwgdGhpcy5tYXgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBFbWl0cyBhIGNoYW5nZSBldmVudCBpZiB0aGUgY3VycmVudCB2YWx1ZSBpcyBkaWZmZXJlbnQgZnJvbSB0aGUgbGFzdCBlbWl0dGVkIHZhbHVlLiAqL1xuICBwcml2YXRlIF9lbWl0Q2hhbmdlRXZlbnQoKSB7XG4gICAgdGhpcy5fY29udHJvbFZhbHVlQWNjZXNzb3JDaGFuZ2VGbih0aGlzLnZhbHVlKTtcbiAgICB0aGlzLnZhbHVlQ2hhbmdlLmVtaXQodGhpcy52YWx1ZSk7XG4gICAgdGhpcy5jaGFuZ2UuZW1pdCh0aGlzLl9jcmVhdGVDaGFuZ2VFdmVudCgpKTtcbiAgfVxuXG4gIC8qKiBFbWl0cyBhbiBpbnB1dCBldmVudCB3aGVuIHRoZSBjdXJyZW50IHZhbHVlIGlzIGRpZmZlcmVudCBmcm9tIHRoZSBsYXN0IGVtaXR0ZWQgdmFsdWUuICovXG4gIHByaXZhdGUgX2VtaXRJbnB1dEV2ZW50KCkge1xuICAgIHRoaXMuaW5wdXQuZW1pdCh0aGlzLl9jcmVhdGVDaGFuZ2VFdmVudCgpKTtcbiAgfVxuXG4gIC8qKiBVcGRhdGVzIHRoZSBhbW91bnQgb2Ygc3BhY2UgYmV0d2VlbiB0aWNrcyBhcyBhIHBlcmNlbnRhZ2Ugb2YgdGhlIHdpZHRoIG9mIHRoZSBzbGlkZXIuICovXG4gIHByaXZhdGUgX3VwZGF0ZVRpY2tJbnRlcnZhbFBlcmNlbnQoKSB7XG4gICAgaWYgKCF0aGlzLnRpY2tJbnRlcnZhbCB8fCAhdGhpcy5fc2xpZGVyRGltZW5zaW9ucykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnRpY2tJbnRlcnZhbCA9PSAnYXV0bycpIHtcbiAgICAgIGxldCB0cmFja1NpemUgPSB0aGlzLnZlcnRpY2FsID8gdGhpcy5fc2xpZGVyRGltZW5zaW9ucy5oZWlnaHQgOiB0aGlzLl9zbGlkZXJEaW1lbnNpb25zLndpZHRoO1xuICAgICAgbGV0IHBpeGVsc1BlclN0ZXAgPSB0cmFja1NpemUgKiB0aGlzLnN0ZXAgLyAodGhpcy5tYXggLSB0aGlzLm1pbik7XG4gICAgICBsZXQgc3RlcHNQZXJUaWNrID0gTWF0aC5jZWlsKE1JTl9BVVRPX1RJQ0tfU0VQQVJBVElPTiAvIHBpeGVsc1BlclN0ZXApO1xuICAgICAgbGV0IHBpeGVsc1BlclRpY2sgPSBzdGVwc1BlclRpY2sgKiB0aGlzLnN0ZXA7XG4gICAgICB0aGlzLl90aWNrSW50ZXJ2YWxQZXJjZW50ID0gcGl4ZWxzUGVyVGljayAvIHRyYWNrU2l6ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fdGlja0ludGVydmFsUGVyY2VudCA9IHRoaXMudGlja0ludGVydmFsICogdGhpcy5zdGVwIC8gKHRoaXMubWF4IC0gdGhpcy5taW4pO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBDcmVhdGVzIGEgc2xpZGVyIGNoYW5nZSBvYmplY3QgZnJvbSB0aGUgc3BlY2lmaWVkIHZhbHVlLiAqL1xuICBwcml2YXRlIF9jcmVhdGVDaGFuZ2VFdmVudCh2YWx1ZSA9IHRoaXMudmFsdWUpOiBNYXRTbGlkZXJDaGFuZ2Uge1xuICAgIGxldCBldmVudCA9IG5ldyBNYXRTbGlkZXJDaGFuZ2UoKTtcblxuICAgIGV2ZW50LnNvdXJjZSA9IHRoaXM7XG4gICAgZXZlbnQudmFsdWUgPSB2YWx1ZTtcblxuICAgIHJldHVybiBldmVudDtcbiAgfVxuXG4gIC8qKiBDYWxjdWxhdGVzIHRoZSBwZXJjZW50YWdlIG9mIHRoZSBzbGlkZXIgdGhhdCBhIHZhbHVlIGlzLiAqL1xuICBwcml2YXRlIF9jYWxjdWxhdGVQZXJjZW50YWdlKHZhbHVlOiBudW1iZXIgfCBudWxsKSB7XG4gICAgcmV0dXJuICgodmFsdWUgfHwgMCkgLSB0aGlzLm1pbikgLyAodGhpcy5tYXggLSB0aGlzLm1pbik7XG4gIH1cblxuICAvKiogQ2FsY3VsYXRlcyB0aGUgdmFsdWUgYSBwZXJjZW50YWdlIG9mIHRoZSBzbGlkZXIgY29ycmVzcG9uZHMgdG8uICovXG4gIHByaXZhdGUgX2NhbGN1bGF0ZVZhbHVlKHBlcmNlbnRhZ2U6IG51bWJlcikge1xuICAgIHJldHVybiB0aGlzLm1pbiArIHBlcmNlbnRhZ2UgKiAodGhpcy5tYXggLSB0aGlzLm1pbik7XG4gIH1cblxuICAvKiogUmV0dXJuIGEgbnVtYmVyIGJldHdlZW4gdHdvIG51bWJlcnMuICovXG4gIHByaXZhdGUgX2NsYW1wKHZhbHVlOiBudW1iZXIsIG1pbiA9IDAsIG1heCA9IDEpIHtcbiAgICByZXR1cm4gTWF0aC5tYXgobWluLCBNYXRoLm1pbih2YWx1ZSwgbWF4KSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBib3VuZGluZyBjbGllbnQgcmVjdCBvZiB0aGUgc2xpZGVyIHRyYWNrIGVsZW1lbnQuXG4gICAqIFRoZSB0cmFjayBpcyB1c2VkIHJhdGhlciB0aGFuIHRoZSBuYXRpdmUgZWxlbWVudCB0byBpZ25vcmUgdGhlIGV4dHJhIHNwYWNlIHRoYXQgdGhlIHRodW1iIGNhblxuICAgKiB0YWtlIHVwLlxuICAgKi9cbiAgcHJpdmF0ZSBfZ2V0U2xpZGVyRGltZW5zaW9ucygpIHtcbiAgICByZXR1cm4gdGhpcy5fc2xpZGVyV3JhcHBlciA/IHRoaXMuX3NsaWRlcldyYXBwZXIubmF0aXZlRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSA6IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogRm9jdXNlcyB0aGUgbmF0aXZlIGVsZW1lbnQuXG4gICAqIEN1cnJlbnRseSBvbmx5IHVzZWQgdG8gYWxsb3cgYSBibHVyIGV2ZW50IHRvIGZpcmUgYnV0IHdpbGwgYmUgdXNlZCB3aXRoIGtleWJvYXJkIGlucHV0IGxhdGVyLlxuICAgKi9cbiAgcHJpdmF0ZSBfZm9jdXNIb3N0RWxlbWVudChvcHRpb25zPzogRm9jdXNPcHRpb25zKSB7XG4gICAgdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmZvY3VzKG9wdGlvbnMpO1xuICB9XG5cbiAgLyoqIEJsdXJzIHRoZSBuYXRpdmUgZWxlbWVudC4gKi9cbiAgcHJpdmF0ZSBfYmx1ckhvc3RFbGVtZW50KCkge1xuICAgIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5ibHVyKCk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgbW9kZWwgdmFsdWUuIEltcGxlbWVudGVkIGFzIHBhcnQgb2YgQ29udHJvbFZhbHVlQWNjZXNzb3IuXG4gICAqIEBwYXJhbSB2YWx1ZVxuICAgKi9cbiAgd3JpdGVWYWx1ZSh2YWx1ZTogYW55KSB7XG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVycyBhIGNhbGxiYWNrIHRvIGJlIHRyaWdnZXJlZCB3aGVuIHRoZSB2YWx1ZSBoYXMgY2hhbmdlZC5cbiAgICogSW1wbGVtZW50ZWQgYXMgcGFydCBvZiBDb250cm9sVmFsdWVBY2Nlc3Nvci5cbiAgICogQHBhcmFtIGZuIENhbGxiYWNrIHRvIGJlIHJlZ2lzdGVyZWQuXG4gICAqL1xuICByZWdpc3Rlck9uQ2hhbmdlKGZuOiAodmFsdWU6IGFueSkgPT4gdm9pZCkge1xuICAgIHRoaXMuX2NvbnRyb2xWYWx1ZUFjY2Vzc29yQ2hhbmdlRm4gPSBmbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlcnMgYSBjYWxsYmFjayB0byBiZSB0cmlnZ2VyZWQgd2hlbiB0aGUgY29tcG9uZW50IGlzIHRvdWNoZWQuXG4gICAqIEltcGxlbWVudGVkIGFzIHBhcnQgb2YgQ29udHJvbFZhbHVlQWNjZXNzb3IuXG4gICAqIEBwYXJhbSBmbiBDYWxsYmFjayB0byBiZSByZWdpc3RlcmVkLlxuICAgKi9cbiAgcmVnaXN0ZXJPblRvdWNoZWQoZm46IGFueSkge1xuICAgIHRoaXMub25Ub3VjaGVkID0gZm47XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB3aGV0aGVyIHRoZSBjb21wb25lbnQgc2hvdWxkIGJlIGRpc2FibGVkLlxuICAgKiBJbXBsZW1lbnRlZCBhcyBwYXJ0IG9mIENvbnRyb2xWYWx1ZUFjY2Vzc29yLlxuICAgKiBAcGFyYW0gaXNEaXNhYmxlZFxuICAgKi9cbiAgc2V0RGlzYWJsZWRTdGF0ZShpc0Rpc2FibGVkOiBib29sZWFuKSB7XG4gICAgdGhpcy5kaXNhYmxlZCA9IGlzRGlzYWJsZWQ7XG4gIH1cblxuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfaW52ZXJ0OiBCb29sZWFuSW5wdXQ7XG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9tYXg6IE51bWJlcklucHV0O1xuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfbWluOiBOdW1iZXJJbnB1dDtcbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N0ZXA6IE51bWJlcklucHV0O1xuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfdGh1bWJMYWJlbDogQm9vbGVhbklucHV0O1xuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfdGlja0ludGVydmFsOiBOdW1iZXJJbnB1dDtcbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3ZhbHVlOiBOdW1iZXJJbnB1dDtcbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3ZlcnRpY2FsOiBCb29sZWFuSW5wdXQ7XG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9kaXNhYmxlZDogQm9vbGVhbklucHV0O1xuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfdGFiSW5kZXg6IE51bWJlcklucHV0O1xufVxuXG4vKiogUmV0dXJucyB3aGV0aGVyIGFuIGV2ZW50IGlzIGEgdG91Y2ggZXZlbnQuICovXG5mdW5jdGlvbiBpc1RvdWNoRXZlbnQoZXZlbnQ6IE1vdXNlRXZlbnQgfCBUb3VjaEV2ZW50KTogZXZlbnQgaXMgVG91Y2hFdmVudCB7XG4gIC8vIFRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkIGZvciBldmVyeSBwaXhlbCB0aGF0IHRoZSB1c2VyIGhhcyBkcmFnZ2VkIHNvIHdlIG5lZWQgaXQgdG8gYmVcbiAgLy8gYXMgZmFzdCBhcyBwb3NzaWJsZS4gU2luY2Ugd2Ugb25seSBiaW5kIG1vdXNlIGV2ZW50cyBhbmQgdG91Y2ggZXZlbnRzLCB3ZSBjYW4gYXNzdW1lXG4gIC8vIHRoYXQgaWYgdGhlIGV2ZW50J3MgbmFtZSBzdGFydHMgd2l0aCBgdGAsIGl0J3MgYSB0b3VjaCBldmVudC5cbiAgcmV0dXJuIGV2ZW50LnR5cGVbMF0gPT09ICd0Jztcbn1cblxuLyoqIEdldHMgdGhlIGNvb3JkaW5hdGVzIG9mIGEgdG91Y2ggb3IgbW91c2UgZXZlbnQgcmVsYXRpdmUgdG8gdGhlIHZpZXdwb3J0LiAqL1xuZnVuY3Rpb24gZ2V0UG9pbnRlclBvc2l0aW9uT25QYWdlKGV2ZW50OiBNb3VzZUV2ZW50IHwgVG91Y2hFdmVudCkge1xuICAvLyBgdG91Y2hlc2Agd2lsbCBiZSBlbXB0eSBmb3Igc3RhcnQvZW5kIGV2ZW50cyBzbyB3ZSBoYXZlIHRvIGZhbGwgYmFjayB0byBgY2hhbmdlZFRvdWNoZXNgLlxuICBjb25zdCBwb2ludCA9IGlzVG91Y2hFdmVudChldmVudCkgPyAoZXZlbnQudG91Y2hlc1swXSB8fCBldmVudC5jaGFuZ2VkVG91Y2hlc1swXSkgOiBldmVudDtcbiAgcmV0dXJuIHt4OiBwb2ludC5jbGllbnRYLCB5OiBwb2ludC5jbGllbnRZfTtcbn1cbiJdfQ==