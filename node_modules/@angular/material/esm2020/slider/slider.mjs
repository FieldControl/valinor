/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directionality } from '@angular/cdk/bidi';
import { coerceBooleanProperty, coerceNumberProperty, } from '@angular/cdk/coercion';
import { Platform } from '@angular/cdk/platform';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChild, ContentChildren, ElementRef, Inject, Input, NgZone, Optional, QueryList, ViewChild, ViewChildren, ViewEncapsulation, } from '@angular/core';
import { MAT_RIPPLE_GLOBAL_OPTIONS, mixinColor, mixinDisableRipple, } from '@angular/material/core';
import { ANIMATION_MODULE_TYPE } from '@angular/platform-browser/animations';
import { take } from 'rxjs/operators';
import { MAT_SLIDER_RANGE_THUMB, MAT_SLIDER_THUMB, MAT_SLIDER, MAT_SLIDER_VISUAL_THUMB, } from './slider-interface';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/platform";
import * as i2 from "@angular/cdk/bidi";
import * as i3 from "@angular/common";
import * as i4 from "./slider-thumb";
// TODO(wagnermaciel): maybe handle the following edge case:
// 1. start dragging discrete slider
// 2. tab to disable checkbox
// 3. without ending drag, disable the slider
// Boilerplate for applying mixins to MatSlider.
const _MatSliderMixinBase = mixinColor(mixinDisableRipple(class {
    constructor(_elementRef) {
        this._elementRef = _elementRef;
    }
}), 'primary');
/**
 * Allows users to select from a range of values by moving the slider thumb. It is similar in
 * behavior to the native `<input type="range">` element.
 */
export class MatSlider extends _MatSliderMixinBase {
    /** Whether the slider is disabled. */
    get disabled() {
        return this._disabled;
    }
    set disabled(v) {
        this._disabled = coerceBooleanProperty(v);
        const endInput = this._getInput(2 /* _MatThumb.END */);
        const startInput = this._getInput(1 /* _MatThumb.START */);
        if (endInput) {
            endInput.disabled = this._disabled;
        }
        if (startInput) {
            startInput.disabled = this._disabled;
        }
    }
    /** Whether the slider displays a numeric value label upon pressing the thumb. */
    get discrete() {
        return this._discrete;
    }
    set discrete(v) {
        this._discrete = coerceBooleanProperty(v);
        this._updateValueIndicatorUIs();
    }
    /** Whether the slider displays tick marks along the slider track. */
    get showTickMarks() {
        return this._showTickMarks;
    }
    set showTickMarks(v) {
        this._showTickMarks = coerceBooleanProperty(v);
    }
    /** The minimum value that the slider can have. */
    get min() {
        return this._min;
    }
    set min(v) {
        const min = coerceNumberProperty(v, this._min);
        if (this._min !== min) {
            this._updateMin(min);
        }
    }
    _updateMin(min) {
        const prevMin = this._min;
        this._min = min;
        this._isRange ? this._updateMinRange({ old: prevMin, new: min }) : this._updateMinNonRange(min);
        this._onMinMaxOrStepChange();
    }
    _updateMinRange(min) {
        const endInput = this._getInput(2 /* _MatThumb.END */);
        const startInput = this._getInput(1 /* _MatThumb.START */);
        const oldEndValue = endInput.value;
        const oldStartValue = startInput.value;
        startInput.min = min.new;
        endInput.min = Math.max(min.new, startInput.value);
        startInput.max = Math.min(endInput.max, endInput.value);
        startInput._updateWidthInactive();
        endInput._updateWidthInactive();
        min.new < min.old
            ? this._onTranslateXChangeBySideEffect(endInput, startInput)
            : this._onTranslateXChangeBySideEffect(startInput, endInput);
        if (oldEndValue !== endInput.value) {
            this._onValueChange(endInput);
        }
        if (oldStartValue !== startInput.value) {
            this._onValueChange(startInput);
        }
    }
    _updateMinNonRange(min) {
        const input = this._getInput(2 /* _MatThumb.END */);
        if (input) {
            const oldValue = input.value;
            input.min = min;
            input._updateThumbUIByValue();
            this._updateTrackUI(input);
            if (oldValue !== input.value) {
                this._onValueChange(input);
            }
        }
    }
    /** The maximum value that the slider can have. */
    get max() {
        return this._max;
    }
    set max(v) {
        const max = coerceNumberProperty(v, this._max);
        if (this._max !== max) {
            this._updateMax(max);
        }
    }
    _updateMax(max) {
        const prevMax = this._max;
        this._max = max;
        this._isRange ? this._updateMaxRange({ old: prevMax, new: max }) : this._updateMaxNonRange(max);
        this._onMinMaxOrStepChange();
    }
    _updateMaxRange(max) {
        const endInput = this._getInput(2 /* _MatThumb.END */);
        const startInput = this._getInput(1 /* _MatThumb.START */);
        const oldEndValue = endInput.value;
        const oldStartValue = startInput.value;
        endInput.max = max.new;
        startInput.max = Math.min(max.new, endInput.value);
        endInput.min = startInput.value;
        endInput._updateWidthInactive();
        startInput._updateWidthInactive();
        max.new > max.old
            ? this._onTranslateXChangeBySideEffect(startInput, endInput)
            : this._onTranslateXChangeBySideEffect(endInput, startInput);
        if (oldEndValue !== endInput.value) {
            this._onValueChange(endInput);
        }
        if (oldStartValue !== startInput.value) {
            this._onValueChange(startInput);
        }
    }
    _updateMaxNonRange(max) {
        const input = this._getInput(2 /* _MatThumb.END */);
        if (input) {
            const oldValue = input.value;
            input.max = max;
            input._updateThumbUIByValue();
            this._updateTrackUI(input);
            if (oldValue !== input.value) {
                this._onValueChange(input);
            }
        }
    }
    /** The values at which the thumb will snap. */
    get step() {
        return this._step;
    }
    set step(v) {
        const step = coerceNumberProperty(v, this._step);
        if (this._step !== step) {
            this._updateStep(step);
        }
    }
    _updateStep(step) {
        this._step = step;
        this._isRange ? this._updateStepRange() : this._updateStepNonRange();
        this._onMinMaxOrStepChange();
    }
    _updateStepRange() {
        const endInput = this._getInput(2 /* _MatThumb.END */);
        const startInput = this._getInput(1 /* _MatThumb.START */);
        const oldEndValue = endInput.value;
        const oldStartValue = startInput.value;
        const prevStartValue = startInput.value;
        endInput.min = this._min;
        startInput.max = this._max;
        endInput.step = this._step;
        startInput.step = this._step;
        if (this._platform.SAFARI) {
            endInput.value = endInput.value;
            startInput.value = startInput.value;
        }
        endInput.min = Math.max(this._min, startInput.value);
        startInput.max = Math.min(this._max, endInput.value);
        startInput._updateWidthInactive();
        endInput._updateWidthInactive();
        endInput.value < prevStartValue
            ? this._onTranslateXChangeBySideEffect(startInput, endInput)
            : this._onTranslateXChangeBySideEffect(endInput, startInput);
        if (oldEndValue !== endInput.value) {
            this._onValueChange(endInput);
        }
        if (oldStartValue !== startInput.value) {
            this._onValueChange(startInput);
        }
    }
    _updateStepNonRange() {
        const input = this._getInput(2 /* _MatThumb.END */);
        if (input) {
            const oldValue = input.value;
            input.step = this._step;
            if (this._platform.SAFARI) {
                input.value = input.value;
            }
            input._updateThumbUIByValue();
            if (oldValue !== input.value) {
                this._onValueChange(input);
            }
        }
    }
    constructor(_ngZone, _cdr, _platform, elementRef, _dir, _globalRippleOptions, animationMode) {
        super(elementRef);
        this._ngZone = _ngZone;
        this._cdr = _cdr;
        this._platform = _platform;
        this._dir = _dir;
        this._globalRippleOptions = _globalRippleOptions;
        this._disabled = false;
        this._discrete = false;
        this._showTickMarks = false;
        this._min = 0;
        this._max = 100;
        this._step = 0;
        /**
         * Function that will be used to format the value before it is displayed
         * in the thumb label. Can be used to format very large number in order
         * for them to fit into the slider thumb.
         */
        this.displayWith = (value) => `${value}`;
        this._rippleRadius = 24;
        // The value indicator tooltip text for the visual slider thumb(s).
        /** @docs-private */
        this.startValueIndicatorText = '';
        /** @docs-private */
        this.endValueIndicatorText = '';
        this._isRange = false;
        /** Whether the slider is rtl. */
        this._isRtl = false;
        this._hasViewInitialized = false;
        /**
         * The width of the tick mark track.
         * The tick mark track width is different from full track width
         */
        this._tickMarkTrackWidth = 0;
        this._hasAnimation = false;
        this._resizeTimer = null;
        /** The radius of the native slider's knob. AFAIK there is no way to avoid hardcoding this. */
        this._knobRadius = 8;
        /** Whether or not the slider thumbs overlap. */
        this._thumbsOverlap = false;
        this._noopAnimations = animationMode === 'NoopAnimations';
        this._dirChangeSubscription = this._dir.change.subscribe(() => this._onDirChange());
        this._isRtl = this._dir.value === 'rtl';
    }
    ngAfterViewInit() {
        if (this._platform.isBrowser) {
            this._updateDimensions();
        }
        const eInput = this._getInput(2 /* _MatThumb.END */);
        const sInput = this._getInput(1 /* _MatThumb.START */);
        this._isRange = !!eInput && !!sInput;
        this._cdr.detectChanges();
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
            _validateInputs(this._isRange, this._getInput(2 /* _MatThumb.END */), this._getInput(1 /* _MatThumb.START */));
        }
        const thumb = this._getThumb(2 /* _MatThumb.END */);
        this._rippleRadius = thumb._ripple.radius;
        this._inputPadding = this._rippleRadius - this._knobRadius;
        this._inputOffset = this._knobRadius;
        this._isRange
            ? this._initUIRange(eInput, sInput)
            : this._initUINonRange(eInput);
        this._updateTrackUI(eInput);
        this._updateTickMarkUI();
        this._updateTickMarkTrackUI();
        this._observeHostResize();
        this._cdr.detectChanges();
    }
    _initUINonRange(eInput) {
        eInput.initProps();
        eInput.initUI();
        this._updateValueIndicatorUI(eInput);
        this._hasViewInitialized = true;
        eInput._updateThumbUIByValue();
    }
    _initUIRange(eInput, sInput) {
        eInput.initProps();
        eInput.initUI();
        sInput.initProps();
        sInput.initUI();
        eInput._updateMinMax();
        sInput._updateMinMax();
        eInput._updateStaticStyles();
        sInput._updateStaticStyles();
        this._updateValueIndicatorUIs();
        this._hasViewInitialized = true;
        eInput._updateThumbUIByValue();
        sInput._updateThumbUIByValue();
    }
    ngOnDestroy() {
        this._dirChangeSubscription.unsubscribe();
        this._resizeObserver?.disconnect();
        this._resizeObserver = null;
    }
    /** Handles updating the slider ui after a dir change. */
    _onDirChange() {
        this._isRtl = this._dir.value === 'rtl';
        this._isRange ? this._onDirChangeRange() : this._onDirChangeNonRange();
        this._updateTickMarkUI();
    }
    _onDirChangeRange() {
        const endInput = this._getInput(2 /* _MatThumb.END */);
        const startInput = this._getInput(1 /* _MatThumb.START */);
        endInput._setIsLeftThumb();
        startInput._setIsLeftThumb();
        endInput.translateX = endInput._calcTranslateXByValue();
        startInput.translateX = startInput._calcTranslateXByValue();
        endInput._updateStaticStyles();
        startInput._updateStaticStyles();
        endInput._updateWidthInactive();
        startInput._updateWidthInactive();
        endInput._updateThumbUIByValue();
        startInput._updateThumbUIByValue();
    }
    _onDirChangeNonRange() {
        const input = this._getInput(2 /* _MatThumb.END */);
        input._updateThumbUIByValue();
    }
    /** Starts observing and updating the slider if the host changes its size. */
    _observeHostResize() {
        if (typeof ResizeObserver === 'undefined' || !ResizeObserver) {
            return;
        }
        this._ngZone.runOutsideAngular(() => {
            this._resizeObserver = new ResizeObserver(() => {
                if (this._isActive()) {
                    return;
                }
                if (this._resizeTimer) {
                    clearTimeout(this._resizeTimer);
                }
                this._onResize();
            });
            this._resizeObserver.observe(this._elementRef.nativeElement);
        });
    }
    /** Whether any of the thumbs are currently active. */
    _isActive() {
        return this._getThumb(1 /* _MatThumb.START */)._isActive || this._getThumb(2 /* _MatThumb.END */)._isActive;
    }
    _getValue(thumbPosition = 2 /* _MatThumb.END */) {
        const input = this._getInput(thumbPosition);
        if (!input) {
            return this.min;
        }
        return input.value;
    }
    _skipUpdate() {
        return !!(this._getInput(1 /* _MatThumb.START */)?._skipUIUpdate || this._getInput(2 /* _MatThumb.END */)?._skipUIUpdate);
    }
    /** Stores the slider dimensions. */
    _updateDimensions() {
        this._cachedWidth = this._elementRef.nativeElement.offsetWidth;
        this._cachedLeft = this._elementRef.nativeElement.getBoundingClientRect().left;
    }
    /** Sets the styles for the active portion of the track. */
    _setTrackActiveStyles(styles) {
        const trackStyle = this._trackActive.nativeElement.style;
        const animationOriginChanged = styles.left !== trackStyle.left && styles.right !== trackStyle.right;
        trackStyle.left = styles.left;
        trackStyle.right = styles.right;
        trackStyle.transformOrigin = styles.transformOrigin;
        if (animationOriginChanged) {
            this._elementRef.nativeElement.classList.add('mat-mdc-slider-disable-track-animation');
            this._ngZone.onStable.pipe(take(1)).subscribe(() => {
                this._elementRef.nativeElement.classList.remove('mat-mdc-slider-disable-track-animation');
                trackStyle.transform = styles.transform;
            });
        }
        else {
            trackStyle.transform = styles.transform;
        }
    }
    /** Returns the translateX positioning for a tick mark based on it's index. */
    _calcTickMarkTransform(index) {
        // TODO(wagnermaciel): See if we can avoid doing this and just using flex to position these.
        const translateX = index * (this._tickMarkTrackWidth / (this._tickMarks.length - 1));
        return `translateX(${translateX}px`;
    }
    // Handlers for updating the slider ui.
    _onTranslateXChange(source) {
        if (!this._hasViewInitialized) {
            return;
        }
        this._updateThumbUI(source);
        this._updateTrackUI(source);
        this._updateOverlappingThumbUI(source);
    }
    _onTranslateXChangeBySideEffect(input1, input2) {
        if (!this._hasViewInitialized) {
            return;
        }
        input1._updateThumbUIByValue();
        input2._updateThumbUIByValue();
    }
    _onValueChange(source) {
        if (!this._hasViewInitialized) {
            return;
        }
        this._updateValueIndicatorUI(source);
        this._updateTickMarkUI();
        this._cdr.detectChanges();
    }
    _onMinMaxOrStepChange() {
        if (!this._hasViewInitialized) {
            return;
        }
        this._updateTickMarkUI();
        this._updateTickMarkTrackUI();
        this._cdr.markForCheck();
    }
    _onResize() {
        if (!this._hasViewInitialized) {
            return;
        }
        this._updateDimensions();
        if (this._isRange) {
            const eInput = this._getInput(2 /* _MatThumb.END */);
            const sInput = this._getInput(1 /* _MatThumb.START */);
            eInput._updateThumbUIByValue();
            sInput._updateThumbUIByValue();
            eInput._updateStaticStyles();
            sInput._updateStaticStyles();
            eInput._updateMinMax();
            sInput._updateMinMax();
            eInput._updateWidthInactive();
            sInput._updateWidthInactive();
        }
        else {
            const eInput = this._getInput(2 /* _MatThumb.END */);
            if (eInput) {
                eInput._updateThumbUIByValue();
            }
        }
        this._updateTickMarkUI();
        this._updateTickMarkTrackUI();
        this._cdr.detectChanges();
    }
    /** Returns true if the slider knobs are overlapping one another. */
    _areThumbsOverlapping() {
        const startInput = this._getInput(1 /* _MatThumb.START */);
        const endInput = this._getInput(2 /* _MatThumb.END */);
        if (!startInput || !endInput) {
            return false;
        }
        return endInput.translateX - startInput.translateX < 20;
    }
    /**
     * Updates the class names of overlapping slider thumbs so
     * that the current active thumb is styled to be on "top".
     */
    _updateOverlappingThumbClassNames(source) {
        const sibling = source.getSibling();
        const sourceThumb = this._getThumb(source.thumbPosition);
        const siblingThumb = this._getThumb(sibling.thumbPosition);
        siblingThumb._hostElement.classList.remove('mdc-slider__thumb--top');
        sourceThumb._hostElement.classList.toggle('mdc-slider__thumb--top', this._thumbsOverlap);
    }
    /** Updates the UI of slider thumbs when they begin or stop overlapping. */
    _updateOverlappingThumbUI(source) {
        if (!this._isRange || this._skipUpdate()) {
            return;
        }
        if (this._thumbsOverlap !== this._areThumbsOverlapping()) {
            this._thumbsOverlap = !this._thumbsOverlap;
            this._updateOverlappingThumbClassNames(source);
        }
    }
    // _MatThumb styles update conditions
    //
    // 1. TranslateX, resize, or dir change
    //    - Reason: The thumb styles need to be updated according to the new translateX.
    // 2. Min, max, or step
    //    - Reason: The value may have silently changed.
    /** Updates the translateX of the given thumb. */
    _updateThumbUI(source) {
        if (this._skipUpdate()) {
            return;
        }
        const thumb = this._getThumb(source.thumbPosition === 2 /* _MatThumb.END */ ? 2 /* _MatThumb.END */ : 1 /* _MatThumb.START */);
        thumb._hostElement.style.transform = `translateX(${source.translateX}px)`;
    }
    // Value indicator text update conditions
    //
    // 1. Value
    //    - Reason: The value displayed needs to be updated.
    // 2. Min, max, or step
    //    - Reason: The value may have silently changed.
    /** Updates the value indicator tooltip ui for the given thumb. */
    _updateValueIndicatorUI(source) {
        if (this._skipUpdate()) {
            return;
        }
        const valuetext = this.displayWith(source.value);
        this._hasViewInitialized
            ? (source._valuetext = valuetext)
            : source._hostElement.setAttribute('aria-valuetext', valuetext);
        if (this.discrete) {
            source.thumbPosition === 1 /* _MatThumb.START */
                ? (this.startValueIndicatorText = valuetext)
                : (this.endValueIndicatorText = valuetext);
            const visualThumb = this._getThumb(source.thumbPosition);
            valuetext.length < 3
                ? visualThumb._hostElement.classList.add('mdc-slider__thumb--short-value')
                : visualThumb._hostElement.classList.remove('mdc-slider__thumb--short-value');
        }
    }
    /** Updates all value indicator UIs in the slider. */
    _updateValueIndicatorUIs() {
        const eInput = this._getInput(2 /* _MatThumb.END */);
        const sInput = this._getInput(1 /* _MatThumb.START */);
        if (eInput) {
            this._updateValueIndicatorUI(eInput);
        }
        if (sInput) {
            this._updateValueIndicatorUI(sInput);
        }
    }
    // Update Tick Mark Track Width
    //
    // 1. Min, max, or step
    //    - Reason: The maximum reachable value may have changed.
    //    - Side note: The maximum reachable value is different from the maximum value set by the
    //      user. For example, a slider with [min: 5, max: 100, step: 10] would have a maximum
    //      reachable value of 95.
    // 2. Resize
    //    - Reason: The position for the maximum reachable value needs to be recalculated.
    /** Updates the width of the tick mark track. */
    _updateTickMarkTrackUI() {
        if (!this.showTickMarks || this._skipUpdate()) {
            return;
        }
        const step = this._step && this._step > 0 ? this._step : 1;
        const maxValue = Math.floor(this.max / step) * step;
        const percentage = (maxValue - this.min) / (this.max - this.min);
        this._tickMarkTrackWidth = this._cachedWidth * percentage - 6;
    }
    // Track active update conditions
    //
    // 1. TranslateX
    //    - Reason: The track active should line up with the new thumb position.
    // 2. Min or max
    //    - Reason #1: The 'active' percentage needs to be recalculated.
    //    - Reason #2: The value may have silently changed.
    // 3. Step
    //    - Reason: The value may have silently changed causing the thumb(s) to shift.
    // 4. Dir change
    //    - Reason: The track active will need to be updated according to the new thumb position(s).
    // 5. Resize
    //    - Reason: The total width the 'active' tracks translateX is based on has changed.
    /** Updates the scale on the active portion of the track. */
    _updateTrackUI(source) {
        if (this._skipUpdate()) {
            return;
        }
        this._isRange
            ? this._updateTrackUIRange(source)
            : this._updateTrackUINonRange(source);
    }
    _updateTrackUIRange(source) {
        const sibling = source.getSibling();
        if (!sibling || !this._cachedWidth) {
            return;
        }
        const activePercentage = Math.abs(sibling.translateX - source.translateX) / this._cachedWidth;
        if (source._isLeftThumb && this._cachedWidth) {
            this._setTrackActiveStyles({
                left: 'auto',
                right: `${this._cachedWidth - sibling.translateX}px`,
                transformOrigin: 'right',
                transform: `scaleX(${activePercentage})`,
            });
        }
        else {
            this._setTrackActiveStyles({
                left: `${sibling.translateX}px`,
                right: 'auto',
                transformOrigin: 'left',
                transform: `scaleX(${activePercentage})`,
            });
        }
    }
    _updateTrackUINonRange(source) {
        this._isRtl
            ? this._setTrackActiveStyles({
                left: 'auto',
                right: '0px',
                transformOrigin: 'right',
                transform: `scaleX(${1 - source.fillPercentage})`,
            })
            : this._setTrackActiveStyles({
                left: '0px',
                right: 'auto',
                transformOrigin: 'left',
                transform: `scaleX(${source.fillPercentage})`,
            });
    }
    // Tick mark update conditions
    //
    // 1. Value
    //    - Reason: a tick mark which was once active might now be inactive or vice versa.
    // 2. Min, max, or step
    //    - Reason #1: the number of tick marks may have changed.
    //    - Reason #2: The value may have silently changed.
    /** Updates the dots along the slider track. */
    _updateTickMarkUI() {
        if (!this.showTickMarks ||
            this.step === undefined ||
            this.min === undefined ||
            this.max === undefined) {
            return;
        }
        const step = this.step > 0 ? this.step : 1;
        this._isRange ? this._updateTickMarkUIRange(step) : this._updateTickMarkUINonRange(step);
        if (this._isRtl) {
            this._tickMarks.reverse();
        }
    }
    _updateTickMarkUINonRange(step) {
        const value = this._getValue();
        let numActive = Math.max(Math.round((value - this.min) / step), 0);
        let numInactive = Math.max(Math.round((this.max - value) / step), 0);
        this._isRtl ? numActive++ : numInactive++;
        this._tickMarks = Array(numActive)
            .fill(0 /* _MatTickMark.ACTIVE */)
            .concat(Array(numInactive).fill(1 /* _MatTickMark.INACTIVE */));
    }
    _updateTickMarkUIRange(step) {
        const endValue = this._getValue();
        const startValue = this._getValue(1 /* _MatThumb.START */);
        const numInactiveBeforeStartThumb = Math.max(Math.floor((startValue - this.min) / step), 0);
        const numActive = Math.max(Math.floor((endValue - startValue) / step) + 1, 0);
        const numInactiveAfterEndThumb = Math.max(Math.floor((this.max - endValue) / step), 0);
        this._tickMarks = Array(numInactiveBeforeStartThumb)
            .fill(1 /* _MatTickMark.INACTIVE */)
            .concat(Array(numActive).fill(0 /* _MatTickMark.ACTIVE */), Array(numInactiveAfterEndThumb).fill(1 /* _MatTickMark.INACTIVE */));
    }
    /** Gets the slider thumb input of the given thumb position. */
    _getInput(thumbPosition) {
        if (thumbPosition === 2 /* _MatThumb.END */ && this._input) {
            return this._input;
        }
        if (this._inputs?.length) {
            return thumbPosition === 1 /* _MatThumb.START */ ? this._inputs.first : this._inputs.last;
        }
        return;
    }
    /** Gets the slider thumb HTML input element of the given thumb position. */
    _getThumb(thumbPosition) {
        return thumbPosition === 2 /* _MatThumb.END */ ? this._thumbs?.last : this._thumbs?.first;
    }
    _setTransition(withAnimation) {
        this._hasAnimation = withAnimation && !this._noopAnimations;
        this._elementRef.nativeElement.classList.toggle('mat-mdc-slider-with-animation', this._hasAnimation);
    }
}
MatSlider.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: MatSlider, deps: [{ token: i0.NgZone }, { token: i0.ChangeDetectorRef }, { token: i1.Platform }, { token: i0.ElementRef }, { token: i2.Directionality, optional: true }, { token: MAT_RIPPLE_GLOBAL_OPTIONS, optional: true }, { token: ANIMATION_MODULE_TYPE, optional: true }], target: i0.ɵɵFactoryTarget.Component });
MatSlider.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "15.2.0-rc.0", type: MatSlider, selector: "mat-slider", inputs: { color: "color", disableRipple: "disableRipple", disabled: "disabled", discrete: "discrete", showTickMarks: "showTickMarks", min: "min", max: "max", step: "step", displayWith: "displayWith" }, host: { properties: { "class.mdc-slider--range": "_isRange", "class.mdc-slider--disabled": "disabled", "class.mdc-slider--discrete": "discrete", "class.mdc-slider--tick-marks": "showTickMarks", "class._mat-animation-noopable": "_noopAnimations" }, classAttribute: "mat-mdc-slider mdc-slider" }, providers: [{ provide: MAT_SLIDER, useExisting: MatSlider }], queries: [{ propertyName: "_input", first: true, predicate: MAT_SLIDER_THUMB, descendants: true }, { propertyName: "_inputs", predicate: MAT_SLIDER_RANGE_THUMB }], viewQueries: [{ propertyName: "_trackActive", first: true, predicate: ["trackActive"], descendants: true }, { propertyName: "_thumbs", predicate: MAT_SLIDER_VISUAL_THUMB, descendants: true }], exportAs: ["matSlider"], usesInheritance: true, ngImport: i0, template: "<!-- Inputs -->\n<ng-content></ng-content>\n\n<!-- Track -->\n<div class=\"mdc-slider__track\">\n  <div class=\"mdc-slider__track--inactive\"></div>\n  <div class=\"mdc-slider__track--active\">\n    <div #trackActive class=\"mdc-slider__track--active_fill\"></div>\n  </div>\n  <div *ngIf=\"showTickMarks\" class=\"mdc-slider__tick-marks\" #tickMarkContainer>\n    <ng-container *ngIf=\"_cachedWidth\">\n        <div\n          *ngFor=\"let tickMark of _tickMarks; let i = index\"\n          [class]=\"tickMark === 0 ? 'mdc-slider__tick-mark--active' : 'mdc-slider__tick-mark--inactive'\"\n          [style.transform]=\"_calcTickMarkTransform(i)\"></div>\n    </ng-container>\n  </div>\n</div>\n\n<!-- Thumbs -->\n<mat-slider-visual-thumb\n  *ngIf=\"_isRange\"\n  [discrete]=\"discrete\"\n  [thumbPosition]=\"1\"\n  [valueIndicatorText]=\"startValueIndicatorText\">\n</mat-slider-visual-thumb>\n\n<mat-slider-visual-thumb\n  [discrete]=\"discrete\"\n  [thumbPosition]=\"2\"\n  [valueIndicatorText]=\"endValueIndicatorText\">\n</mat-slider-visual-thumb>\n", styles: [".mdc-slider{cursor:pointer;height:48px;margin:0 24px;position:relative;touch-action:pan-y}.mdc-slider .mdc-slider__track{position:absolute;top:50%;transform:translateY(-50%);width:100%}.mdc-slider .mdc-slider__track--active,.mdc-slider .mdc-slider__track--inactive{display:flex;height:100%;position:absolute;width:100%}.mdc-slider .mdc-slider__track--active{overflow:hidden}.mdc-slider .mdc-slider__track--active_fill{border-top-style:solid;box-sizing:border-box;height:100%;width:100%;position:relative;-webkit-transform-origin:left;transform-origin:left}[dir=rtl] .mdc-slider .mdc-slider__track--active_fill,.mdc-slider .mdc-slider__track--active_fill[dir=rtl]{-webkit-transform-origin:right;transform-origin:right}.mdc-slider .mdc-slider__track--inactive{left:0;top:0}.mdc-slider .mdc-slider__track--inactive::before{position:absolute;box-sizing:border-box;width:100%;height:100%;top:0;left:0;border:1px solid rgba(0,0,0,0);border-radius:inherit;content:\"\";pointer-events:none}@media screen and (forced-colors: active){.mdc-slider .mdc-slider__track--inactive::before{border-color:CanvasText}}.mdc-slider .mdc-slider__value-indicator-container{bottom:44px;left:var(--slider-value-indicator-container-left, 50%);pointer-events:none;position:absolute;right:var(--slider-value-indicator-container-right);transform:var(--slider-value-indicator-container-transform, translateX(-50%))}.mdc-slider .mdc-slider__value-indicator{transition:transform 100ms 0ms cubic-bezier(0.4, 0, 1, 1);align-items:center;border-radius:4px;display:flex;height:32px;padding:0 12px;transform:scale(0);transform-origin:bottom}.mdc-slider .mdc-slider__value-indicator::before{border-left:6px solid rgba(0,0,0,0);border-right:6px solid rgba(0,0,0,0);border-top:6px solid;bottom:-5px;content:\"\";height:0;left:var(--slider-value-indicator-caret-left, 50%);position:absolute;right:var(--slider-value-indicator-caret-right);transform:var(--slider-value-indicator-caret-transform, translateX(-50%));width:0}.mdc-slider .mdc-slider__value-indicator::after{position:absolute;box-sizing:border-box;width:100%;height:100%;top:0;left:0;border:1px solid rgba(0,0,0,0);border-radius:inherit;content:\"\";pointer-events:none}@media screen and (forced-colors: active){.mdc-slider .mdc-slider__value-indicator::after{border-color:CanvasText}}.mdc-slider .mdc-slider__thumb--with-indicator .mdc-slider__value-indicator-container{pointer-events:auto}.mdc-slider .mdc-slider__thumb--with-indicator .mdc-slider__value-indicator{transition:transform 100ms 0ms cubic-bezier(0, 0, 0.2, 1);transform:scale(1)}@media(prefers-reduced-motion){.mdc-slider .mdc-slider__value-indicator,.mdc-slider .mdc-slider__thumb--with-indicator .mdc-slider__value-indicator{transition:none}}.mdc-slider .mdc-slider__thumb{display:flex;left:-24px;outline:none;position:absolute;user-select:none;height:48px;width:48px}.mdc-slider .mdc-slider__thumb--top{z-index:1}.mdc-slider .mdc-slider__thumb--top .mdc-slider__thumb-knob,.mdc-slider .mdc-slider__thumb--top.mdc-slider__thumb:hover .mdc-slider__thumb-knob,.mdc-slider .mdc-slider__thumb--top.mdc-slider__thumb--focused .mdc-slider__thumb-knob{border-style:solid;border-width:1px;box-sizing:content-box}.mdc-slider .mdc-slider__thumb-knob{box-sizing:border-box;left:50%;position:absolute;top:50%;transform:translate(-50%, -50%)}.mdc-slider .mdc-slider__tick-marks{align-items:center;box-sizing:border-box;display:flex;height:100%;justify-content:space-between;padding:0 1px;position:absolute;width:100%}.mdc-slider--discrete .mdc-slider__thumb,.mdc-slider--discrete .mdc-slider__track--active_fill{transition:transform 80ms ease}@media(prefers-reduced-motion){.mdc-slider--discrete .mdc-slider__thumb,.mdc-slider--discrete .mdc-slider__track--active_fill{transition:none}}.mdc-slider--disabled{cursor:auto}.mdc-slider--disabled .mdc-slider__thumb{pointer-events:none}.mdc-slider__input{cursor:pointer;left:0;margin:0;height:100%;opacity:0;pointer-events:none;position:absolute;top:0;width:100%}.mat-mdc-slider{display:inline-block;box-sizing:border-box;outline:none;vertical-align:middle;margin-left:8px;margin-right:8px;width:auto;min-width:112px;-webkit-tap-highlight-color:rgba(0,0,0,0)}.mat-mdc-slider .mdc-slider__thumb-knob{background-color:var(--mdc-slider-handle-color, var(--mdc-theme-primary, #6200ee));border-color:var(--mdc-slider-handle-color, var(--mdc-theme-primary, #6200ee))}.mat-mdc-slider .mdc-slider__thumb--top .mdc-slider__thumb-knob,.mat-mdc-slider .mdc-slider__thumb--top.mdc-slider__thumb:hover .mdc-slider__thumb-knob,.mat-mdc-slider .mdc-slider__thumb--top.mdc-slider__thumb--focused .mdc-slider__thumb-knob{border-color:#fff}.mat-mdc-slider.mdc-slider--disabled .mdc-slider__thumb-knob{background-color:var(--mdc-slider-disabled-handle-color, var(--mdc-theme-on-surface, #000));border-color:var(--mdc-slider-disabled-handle-color, var(--mdc-theme-on-surface, #000))}.mat-mdc-slider.mdc-slider--disabled .mdc-slider__thumb--top .mdc-slider__thumb-knob,.mat-mdc-slider.mdc-slider--disabled .mdc-slider__thumb--top.mdc-slider__thumb:hover .mdc-slider__thumb-knob,.mat-mdc-slider.mdc-slider--disabled .mdc-slider__thumb--top.mdc-slider__thumb--focused .mdc-slider__thumb-knob{border-color:#fff}.mat-mdc-slider .mdc-slider__thumb::before,.mat-mdc-slider .mdc-slider__thumb::after{background-color:var(--mdc-slider-handle-color, var(--mdc-theme-primary, #6200ee))}.mat-mdc-slider .mdc-slider__thumb:hover::before,.mat-mdc-slider .mdc-slider__thumb.mdc-ripple-surface--hover::before{opacity:var(--mdc-ripple-hover-opacity, 0.04)}.mat-mdc-slider .mdc-slider__thumb.mdc-ripple-upgraded--background-focused::before,.mat-mdc-slider .mdc-slider__thumb:not(.mdc-ripple-upgraded):focus::before{transition-duration:75ms;opacity:var(--mdc-ripple-focus-opacity, 0.12)}.mat-mdc-slider .mdc-slider__thumb:not(.mdc-ripple-upgraded)::after{transition:opacity 150ms linear}.mat-mdc-slider .mdc-slider__thumb:not(.mdc-ripple-upgraded):active::after{transition-duration:75ms;opacity:var(--mdc-ripple-press-opacity, 0.12)}.mat-mdc-slider .mdc-slider__thumb.mdc-ripple-upgraded{--mdc-ripple-fg-opacity:var(--mdc-ripple-press-opacity, 0.12)}.mat-mdc-slider .mdc-slider__track--active_fill{border-color:var(--mdc-slider-active-track-color, var(--mdc-theme-primary, #6200ee))}.mat-mdc-slider.mdc-slider--disabled .mdc-slider__track--active_fill{border-color:var(--mdc-slider-disabled-active-track-color, var(--mdc-theme-on-surface, #000))}.mat-mdc-slider .mdc-slider__track--inactive{background-color:var(--mdc-slider-inactive-track-color, var(--mdc-theme-primary, #6200ee));opacity:.24}.mat-mdc-slider.mdc-slider--disabled .mdc-slider__track--inactive{background-color:var(--mdc-slider-disabled-inactive-track-color, var(--mdc-theme-on-surface, #000));opacity:.24}.mat-mdc-slider .mdc-slider__tick-mark--active{background-color:var(--mdc-slider-with-tick-marks-active-container-color, var(--mdc-theme-on-primary, #fff));opacity:var(--mdc-slider-with-tick-marks-active-container-opacity, 0.6)}.mat-mdc-slider.mdc-slider--disabled .mdc-slider__tick-mark--active{background-color:var(--mdc-slider-with-tick-marks-active-container-color, var(--mdc-theme-on-primary, #fff));opacity:var(--mdc-slider-with-tick-marks-active-container-opacity, 0.6)}.mat-mdc-slider .mdc-slider__tick-mark--inactive{background-color:var(--mdc-slider-with-tick-marks-inactive-container-color, var(--mdc-theme-primary, #6200ee));opacity:var(--mdc-slider-with-tick-marks-inactive-container-opacity, 0.6)}.mat-mdc-slider.mdc-slider--disabled .mdc-slider__tick-mark--inactive{background-color:var(--mdc-slider-with-tick-marks-disabled-container-color, var(--mdc-theme-on-surface, #000));opacity:var(--mdc-slider-with-tick-marks-inactive-container-opacity, 0.6)}.mat-mdc-slider .mdc-slider__value-indicator{background-color:var(--mdc-slider-label-container-color, #666666);opacity:1}.mat-mdc-slider .mdc-slider__value-indicator::before{border-top-color:var(--mdc-slider-label-container-color, #666666)}.mat-mdc-slider .mdc-slider__value-indicator{color:var(--mdc-slider-label-label-text-color, var(--mdc-theme-on-primary, #fff))}.mat-mdc-slider .mdc-slider__track{height:var(--mdc-slider-inactive-track-height, 4px)}.mat-mdc-slider .mdc-slider__track--active{height:var(--mdc-slider-active-track-height, 6px);top:calc((var(--mdc-slider-inactive-track-height, 4px) - var(--mdc-slider-active-track-height, 6px)) / 2)}.mat-mdc-slider .mdc-slider__track--active_fill{border-top-width:var(--mdc-slider-active-track-height, 6px)}.mat-mdc-slider .mdc-slider__track--inactive{height:var(--mdc-slider-inactive-track-height, 4px)}.mat-mdc-slider .mdc-slider__tick-mark--active,.mat-mdc-slider .mdc-slider__tick-mark--inactive{height:var(--mdc-slider-with-tick-marks-container-size, 2px);width:var(--mdc-slider-with-tick-marks-container-size, 2px)}.mat-mdc-slider.mdc-slider--disabled{opacity:0.38}.mat-mdc-slider .mdc-slider__value-indicator-text{letter-spacing:var(--mdc-slider-label-label-text-tracking, 0.0071428571em);font-size:var(--mdc-slider-label-label-text-size, 0.875rem);font-family:var(--mdc-slider-label-label-text-font, Roboto, sans-serif);font-weight:var(--mdc-slider-label-label-text-weight, 500);line-height:var(--mdc-slider-label-label-text-line-height, 1.375rem)}.mat-mdc-slider .mdc-slider__track--active{border-radius:var(--mdc-slider-active-track-shape, 9999px)}.mat-mdc-slider .mdc-slider__track--inactive{border-radius:var(--mdc-slider-inactive-track-shape, 9999px)}.mat-mdc-slider .mdc-slider__thumb-knob{border-radius:var(--mdc-slider-handle-shape, 50%);width:var(--mdc-slider-handle-width, 20px);height:var(--mdc-slider-handle-height, 20px);border-style:solid;border-width:calc(var(--mdc-slider-handle-height, 20px) / 2) calc(var(--mdc-slider-handle-width, 20px) / 2)}.mat-mdc-slider .mdc-slider__tick-mark--active,.mat-mdc-slider .mdc-slider__tick-mark--inactive{border-radius:var(--mdc-slider-with-tick-marks-container-shape, 50%)}.mat-mdc-slider .mdc-slider__thumb-knob{box-shadow:var(--mdc-slider-handle-elevation, 0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 1px 3px 0px rgba(0, 0, 0, 0.12))}.mat-mdc-slider .mdc-slider__thumb:hover .mdc-slider__thumb-knob{background-color:var(--mdc-slider-hover-handle-color, var(--mdc-theme-primary, #6200ee));border-color:var(--mdc-slider-hover-handle-color, var(--mdc-theme-primary, #6200ee))}.mat-mdc-slider .mdc-slider__thumb:hover .mdc-slider__thumb--top .mdc-slider__thumb-knob,.mat-mdc-slider .mdc-slider__thumb:hover .mdc-slider__thumb--top.mdc-slider__thumb:hover .mdc-slider__thumb-knob,.mat-mdc-slider .mdc-slider__thumb:hover .mdc-slider__thumb--top.mdc-slider__thumb--focused .mdc-slider__thumb-knob{border-color:#fff}.mat-mdc-slider .mdc-slider__thumb--focused .mdc-slider__thumb-knob{background-color:var(--mdc-slider-focus-handle-color, var(--mdc-theme-primary, #6200ee));border-color:var(--mdc-slider-focus-handle-color, var(--mdc-theme-primary, #6200ee))}.mat-mdc-slider .mdc-slider__thumb--focused .mdc-slider__thumb--top .mdc-slider__thumb-knob,.mat-mdc-slider .mdc-slider__thumb--focused .mdc-slider__thumb--top.mdc-slider__thumb:hover .mdc-slider__thumb-knob,.mat-mdc-slider .mdc-slider__thumb--focused .mdc-slider__thumb--top.mdc-slider__thumb--focused .mdc-slider__thumb-knob{border-color:#fff}.mat-mdc-slider .mdc-slider__thumb:not(:disabled):active .mdc-slider__thumb--top .mdc-slider__thumb-knob,.mat-mdc-slider .mdc-slider__thumb:not(:disabled):active .mdc-slider__thumb--top.mdc-slider__thumb:hover .mdc-slider__thumb-knob,.mat-mdc-slider .mdc-slider__thumb:not(:disabled):active .mdc-slider__thumb--top.mdc-slider__thumb--focused .mdc-slider__thumb-knob{border-color:#fff}.mat-mdc-slider .mdc-slider__thumb--top .mdc-slider__thumb-knob,.mat-mdc-slider .mdc-slider__thumb--top.mdc-slider__thumb:hover .mdc-slider__thumb-knob,.mat-mdc-slider .mdc-slider__thumb--top.mdc-slider__thumb--focused .mdc-slider__thumb-knob{border-color:var(--mdc-slider-with-overlap-handle-outline-color, #fff);border-width:var(--mdc-slider-with-overlap-handle-outline-width, 1px)}.mat-mdc-slider .mdc-slider__input{box-sizing:content-box;pointer-events:auto}.mat-mdc-slider .mdc-slider__input.mat-mdc-slider-input-no-pointer-events{pointer-events:none}.mat-mdc-slider .mdc-slider__input.mat-slider__right-input{left:auto;right:0}.mat-mdc-slider .mdc-slider__thumb,.mat-mdc-slider .mdc-slider__track--active_fill{transition-duration:0ms}.mat-mdc-slider.mat-mdc-slider-with-animation .mdc-slider__thumb,.mat-mdc-slider.mat-mdc-slider-with-animation .mdc-slider__track--active_fill{transition-duration:80ms}.mat-mdc-slider.mat-mdc-slider-with-animation.mat-mdc-slider-disable-track-animation .mdc-slider__track--active_fill{transition-duration:0ms}.mat-mdc-slider.mdc-slider--discrete .mdc-slider__thumb,.mat-mdc-slider.mdc-slider--discrete .mdc-slider__track--active_fill{transition-duration:0ms}.mat-mdc-slider.mat-mdc-slider-with-animation .mdc-slider__thumb,.mat-mdc-slider.mat-mdc-slider-with-animation .mdc-slider__track--active_fill{transition-duration:80ms}.mat-mdc-slider.mat-mdc-slider-with-animation.mat-mdc-slider-disable-track-animation .mdc-slider__track--active_fill{transition-duration:0ms}.mat-mdc-slider .mdc-slider__track,.mat-mdc-slider .mdc-slider__thumb{pointer-events:none}.mat-mdc-slider .mdc-slider__value-indicator{opacity:var(--mat-mdc-slider-value-indicator-opacity, 1)}.mat-mdc-slider .mat-ripple .mat-ripple-element{background-color:var(--mat-mdc-slider-ripple-color, transparent)}.mat-mdc-slider .mat-ripple .mat-mdc-slider-hover-ripple{background-color:var(--mat-mdc-slider-hover-ripple-color, transparent)}.mat-mdc-slider .mat-ripple .mat-mdc-slider-focus-ripple,.mat-mdc-slider .mat-ripple .mat-mdc-slider-active-ripple{background-color:var(--mat-mdc-slider-focus-ripple-color, transparent)}.mat-mdc-slider._mat-animation-noopable.mdc-slider--discrete .mdc-slider__thumb,.mat-mdc-slider._mat-animation-noopable.mdc-slider--discrete .mdc-slider__track--active_fill,.mat-mdc-slider._mat-animation-noopable .mdc-slider__value-indicator{transition:none}.mat-mdc-slider .mat-mdc-focus-indicator::before{border-radius:50%}.mdc-slider__thumb--focused .mat-mdc-focus-indicator::before{content:\"\"}"], dependencies: [{ kind: "directive", type: i3.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { kind: "directive", type: i3.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "component", type: i4.MatSliderVisualThumb, selector: "mat-slider-visual-thumb", inputs: ["discrete", "thumbPosition", "valueIndicatorText"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: MatSlider, decorators: [{
            type: Component,
            args: [{ selector: 'mat-slider', host: {
                        'class': 'mat-mdc-slider mdc-slider',
                        '[class.mdc-slider--range]': '_isRange',
                        '[class.mdc-slider--disabled]': 'disabled',
                        '[class.mdc-slider--discrete]': 'discrete',
                        '[class.mdc-slider--tick-marks]': 'showTickMarks',
                        '[class._mat-animation-noopable]': '_noopAnimations',
                    }, exportAs: 'matSlider', changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation.None, inputs: ['color', 'disableRipple'], providers: [{ provide: MAT_SLIDER, useExisting: MatSlider }], template: "<!-- Inputs -->\n<ng-content></ng-content>\n\n<!-- Track -->\n<div class=\"mdc-slider__track\">\n  <div class=\"mdc-slider__track--inactive\"></div>\n  <div class=\"mdc-slider__track--active\">\n    <div #trackActive class=\"mdc-slider__track--active_fill\"></div>\n  </div>\n  <div *ngIf=\"showTickMarks\" class=\"mdc-slider__tick-marks\" #tickMarkContainer>\n    <ng-container *ngIf=\"_cachedWidth\">\n        <div\n          *ngFor=\"let tickMark of _tickMarks; let i = index\"\n          [class]=\"tickMark === 0 ? 'mdc-slider__tick-mark--active' : 'mdc-slider__tick-mark--inactive'\"\n          [style.transform]=\"_calcTickMarkTransform(i)\"></div>\n    </ng-container>\n  </div>\n</div>\n\n<!-- Thumbs -->\n<mat-slider-visual-thumb\n  *ngIf=\"_isRange\"\n  [discrete]=\"discrete\"\n  [thumbPosition]=\"1\"\n  [valueIndicatorText]=\"startValueIndicatorText\">\n</mat-slider-visual-thumb>\n\n<mat-slider-visual-thumb\n  [discrete]=\"discrete\"\n  [thumbPosition]=\"2\"\n  [valueIndicatorText]=\"endValueIndicatorText\">\n</mat-slider-visual-thumb>\n", styles: [".mdc-slider{cursor:pointer;height:48px;margin:0 24px;position:relative;touch-action:pan-y}.mdc-slider .mdc-slider__track{position:absolute;top:50%;transform:translateY(-50%);width:100%}.mdc-slider .mdc-slider__track--active,.mdc-slider .mdc-slider__track--inactive{display:flex;height:100%;position:absolute;width:100%}.mdc-slider .mdc-slider__track--active{overflow:hidden}.mdc-slider .mdc-slider__track--active_fill{border-top-style:solid;box-sizing:border-box;height:100%;width:100%;position:relative;-webkit-transform-origin:left;transform-origin:left}[dir=rtl] .mdc-slider .mdc-slider__track--active_fill,.mdc-slider .mdc-slider__track--active_fill[dir=rtl]{-webkit-transform-origin:right;transform-origin:right}.mdc-slider .mdc-slider__track--inactive{left:0;top:0}.mdc-slider .mdc-slider__track--inactive::before{position:absolute;box-sizing:border-box;width:100%;height:100%;top:0;left:0;border:1px solid rgba(0,0,0,0);border-radius:inherit;content:\"\";pointer-events:none}@media screen and (forced-colors: active){.mdc-slider .mdc-slider__track--inactive::before{border-color:CanvasText}}.mdc-slider .mdc-slider__value-indicator-container{bottom:44px;left:var(--slider-value-indicator-container-left, 50%);pointer-events:none;position:absolute;right:var(--slider-value-indicator-container-right);transform:var(--slider-value-indicator-container-transform, translateX(-50%))}.mdc-slider .mdc-slider__value-indicator{transition:transform 100ms 0ms cubic-bezier(0.4, 0, 1, 1);align-items:center;border-radius:4px;display:flex;height:32px;padding:0 12px;transform:scale(0);transform-origin:bottom}.mdc-slider .mdc-slider__value-indicator::before{border-left:6px solid rgba(0,0,0,0);border-right:6px solid rgba(0,0,0,0);border-top:6px solid;bottom:-5px;content:\"\";height:0;left:var(--slider-value-indicator-caret-left, 50%);position:absolute;right:var(--slider-value-indicator-caret-right);transform:var(--slider-value-indicator-caret-transform, translateX(-50%));width:0}.mdc-slider .mdc-slider__value-indicator::after{position:absolute;box-sizing:border-box;width:100%;height:100%;top:0;left:0;border:1px solid rgba(0,0,0,0);border-radius:inherit;content:\"\";pointer-events:none}@media screen and (forced-colors: active){.mdc-slider .mdc-slider__value-indicator::after{border-color:CanvasText}}.mdc-slider .mdc-slider__thumb--with-indicator .mdc-slider__value-indicator-container{pointer-events:auto}.mdc-slider .mdc-slider__thumb--with-indicator .mdc-slider__value-indicator{transition:transform 100ms 0ms cubic-bezier(0, 0, 0.2, 1);transform:scale(1)}@media(prefers-reduced-motion){.mdc-slider .mdc-slider__value-indicator,.mdc-slider .mdc-slider__thumb--with-indicator .mdc-slider__value-indicator{transition:none}}.mdc-slider .mdc-slider__thumb{display:flex;left:-24px;outline:none;position:absolute;user-select:none;height:48px;width:48px}.mdc-slider .mdc-slider__thumb--top{z-index:1}.mdc-slider .mdc-slider__thumb--top .mdc-slider__thumb-knob,.mdc-slider .mdc-slider__thumb--top.mdc-slider__thumb:hover .mdc-slider__thumb-knob,.mdc-slider .mdc-slider__thumb--top.mdc-slider__thumb--focused .mdc-slider__thumb-knob{border-style:solid;border-width:1px;box-sizing:content-box}.mdc-slider .mdc-slider__thumb-knob{box-sizing:border-box;left:50%;position:absolute;top:50%;transform:translate(-50%, -50%)}.mdc-slider .mdc-slider__tick-marks{align-items:center;box-sizing:border-box;display:flex;height:100%;justify-content:space-between;padding:0 1px;position:absolute;width:100%}.mdc-slider--discrete .mdc-slider__thumb,.mdc-slider--discrete .mdc-slider__track--active_fill{transition:transform 80ms ease}@media(prefers-reduced-motion){.mdc-slider--discrete .mdc-slider__thumb,.mdc-slider--discrete .mdc-slider__track--active_fill{transition:none}}.mdc-slider--disabled{cursor:auto}.mdc-slider--disabled .mdc-slider__thumb{pointer-events:none}.mdc-slider__input{cursor:pointer;left:0;margin:0;height:100%;opacity:0;pointer-events:none;position:absolute;top:0;width:100%}.mat-mdc-slider{display:inline-block;box-sizing:border-box;outline:none;vertical-align:middle;margin-left:8px;margin-right:8px;width:auto;min-width:112px;-webkit-tap-highlight-color:rgba(0,0,0,0)}.mat-mdc-slider .mdc-slider__thumb-knob{background-color:var(--mdc-slider-handle-color, var(--mdc-theme-primary, #6200ee));border-color:var(--mdc-slider-handle-color, var(--mdc-theme-primary, #6200ee))}.mat-mdc-slider .mdc-slider__thumb--top .mdc-slider__thumb-knob,.mat-mdc-slider .mdc-slider__thumb--top.mdc-slider__thumb:hover .mdc-slider__thumb-knob,.mat-mdc-slider .mdc-slider__thumb--top.mdc-slider__thumb--focused .mdc-slider__thumb-knob{border-color:#fff}.mat-mdc-slider.mdc-slider--disabled .mdc-slider__thumb-knob{background-color:var(--mdc-slider-disabled-handle-color, var(--mdc-theme-on-surface, #000));border-color:var(--mdc-slider-disabled-handle-color, var(--mdc-theme-on-surface, #000))}.mat-mdc-slider.mdc-slider--disabled .mdc-slider__thumb--top .mdc-slider__thumb-knob,.mat-mdc-slider.mdc-slider--disabled .mdc-slider__thumb--top.mdc-slider__thumb:hover .mdc-slider__thumb-knob,.mat-mdc-slider.mdc-slider--disabled .mdc-slider__thumb--top.mdc-slider__thumb--focused .mdc-slider__thumb-knob{border-color:#fff}.mat-mdc-slider .mdc-slider__thumb::before,.mat-mdc-slider .mdc-slider__thumb::after{background-color:var(--mdc-slider-handle-color, var(--mdc-theme-primary, #6200ee))}.mat-mdc-slider .mdc-slider__thumb:hover::before,.mat-mdc-slider .mdc-slider__thumb.mdc-ripple-surface--hover::before{opacity:var(--mdc-ripple-hover-opacity, 0.04)}.mat-mdc-slider .mdc-slider__thumb.mdc-ripple-upgraded--background-focused::before,.mat-mdc-slider .mdc-slider__thumb:not(.mdc-ripple-upgraded):focus::before{transition-duration:75ms;opacity:var(--mdc-ripple-focus-opacity, 0.12)}.mat-mdc-slider .mdc-slider__thumb:not(.mdc-ripple-upgraded)::after{transition:opacity 150ms linear}.mat-mdc-slider .mdc-slider__thumb:not(.mdc-ripple-upgraded):active::after{transition-duration:75ms;opacity:var(--mdc-ripple-press-opacity, 0.12)}.mat-mdc-slider .mdc-slider__thumb.mdc-ripple-upgraded{--mdc-ripple-fg-opacity:var(--mdc-ripple-press-opacity, 0.12)}.mat-mdc-slider .mdc-slider__track--active_fill{border-color:var(--mdc-slider-active-track-color, var(--mdc-theme-primary, #6200ee))}.mat-mdc-slider.mdc-slider--disabled .mdc-slider__track--active_fill{border-color:var(--mdc-slider-disabled-active-track-color, var(--mdc-theme-on-surface, #000))}.mat-mdc-slider .mdc-slider__track--inactive{background-color:var(--mdc-slider-inactive-track-color, var(--mdc-theme-primary, #6200ee));opacity:.24}.mat-mdc-slider.mdc-slider--disabled .mdc-slider__track--inactive{background-color:var(--mdc-slider-disabled-inactive-track-color, var(--mdc-theme-on-surface, #000));opacity:.24}.mat-mdc-slider .mdc-slider__tick-mark--active{background-color:var(--mdc-slider-with-tick-marks-active-container-color, var(--mdc-theme-on-primary, #fff));opacity:var(--mdc-slider-with-tick-marks-active-container-opacity, 0.6)}.mat-mdc-slider.mdc-slider--disabled .mdc-slider__tick-mark--active{background-color:var(--mdc-slider-with-tick-marks-active-container-color, var(--mdc-theme-on-primary, #fff));opacity:var(--mdc-slider-with-tick-marks-active-container-opacity, 0.6)}.mat-mdc-slider .mdc-slider__tick-mark--inactive{background-color:var(--mdc-slider-with-tick-marks-inactive-container-color, var(--mdc-theme-primary, #6200ee));opacity:var(--mdc-slider-with-tick-marks-inactive-container-opacity, 0.6)}.mat-mdc-slider.mdc-slider--disabled .mdc-slider__tick-mark--inactive{background-color:var(--mdc-slider-with-tick-marks-disabled-container-color, var(--mdc-theme-on-surface, #000));opacity:var(--mdc-slider-with-tick-marks-inactive-container-opacity, 0.6)}.mat-mdc-slider .mdc-slider__value-indicator{background-color:var(--mdc-slider-label-container-color, #666666);opacity:1}.mat-mdc-slider .mdc-slider__value-indicator::before{border-top-color:var(--mdc-slider-label-container-color, #666666)}.mat-mdc-slider .mdc-slider__value-indicator{color:var(--mdc-slider-label-label-text-color, var(--mdc-theme-on-primary, #fff))}.mat-mdc-slider .mdc-slider__track{height:var(--mdc-slider-inactive-track-height, 4px)}.mat-mdc-slider .mdc-slider__track--active{height:var(--mdc-slider-active-track-height, 6px);top:calc((var(--mdc-slider-inactive-track-height, 4px) - var(--mdc-slider-active-track-height, 6px)) / 2)}.mat-mdc-slider .mdc-slider__track--active_fill{border-top-width:var(--mdc-slider-active-track-height, 6px)}.mat-mdc-slider .mdc-slider__track--inactive{height:var(--mdc-slider-inactive-track-height, 4px)}.mat-mdc-slider .mdc-slider__tick-mark--active,.mat-mdc-slider .mdc-slider__tick-mark--inactive{height:var(--mdc-slider-with-tick-marks-container-size, 2px);width:var(--mdc-slider-with-tick-marks-container-size, 2px)}.mat-mdc-slider.mdc-slider--disabled{opacity:0.38}.mat-mdc-slider .mdc-slider__value-indicator-text{letter-spacing:var(--mdc-slider-label-label-text-tracking, 0.0071428571em);font-size:var(--mdc-slider-label-label-text-size, 0.875rem);font-family:var(--mdc-slider-label-label-text-font, Roboto, sans-serif);font-weight:var(--mdc-slider-label-label-text-weight, 500);line-height:var(--mdc-slider-label-label-text-line-height, 1.375rem)}.mat-mdc-slider .mdc-slider__track--active{border-radius:var(--mdc-slider-active-track-shape, 9999px)}.mat-mdc-slider .mdc-slider__track--inactive{border-radius:var(--mdc-slider-inactive-track-shape, 9999px)}.mat-mdc-slider .mdc-slider__thumb-knob{border-radius:var(--mdc-slider-handle-shape, 50%);width:var(--mdc-slider-handle-width, 20px);height:var(--mdc-slider-handle-height, 20px);border-style:solid;border-width:calc(var(--mdc-slider-handle-height, 20px) / 2) calc(var(--mdc-slider-handle-width, 20px) / 2)}.mat-mdc-slider .mdc-slider__tick-mark--active,.mat-mdc-slider .mdc-slider__tick-mark--inactive{border-radius:var(--mdc-slider-with-tick-marks-container-shape, 50%)}.mat-mdc-slider .mdc-slider__thumb-knob{box-shadow:var(--mdc-slider-handle-elevation, 0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 1px 3px 0px rgba(0, 0, 0, 0.12))}.mat-mdc-slider .mdc-slider__thumb:hover .mdc-slider__thumb-knob{background-color:var(--mdc-slider-hover-handle-color, var(--mdc-theme-primary, #6200ee));border-color:var(--mdc-slider-hover-handle-color, var(--mdc-theme-primary, #6200ee))}.mat-mdc-slider .mdc-slider__thumb:hover .mdc-slider__thumb--top .mdc-slider__thumb-knob,.mat-mdc-slider .mdc-slider__thumb:hover .mdc-slider__thumb--top.mdc-slider__thumb:hover .mdc-slider__thumb-knob,.mat-mdc-slider .mdc-slider__thumb:hover .mdc-slider__thumb--top.mdc-slider__thumb--focused .mdc-slider__thumb-knob{border-color:#fff}.mat-mdc-slider .mdc-slider__thumb--focused .mdc-slider__thumb-knob{background-color:var(--mdc-slider-focus-handle-color, var(--mdc-theme-primary, #6200ee));border-color:var(--mdc-slider-focus-handle-color, var(--mdc-theme-primary, #6200ee))}.mat-mdc-slider .mdc-slider__thumb--focused .mdc-slider__thumb--top .mdc-slider__thumb-knob,.mat-mdc-slider .mdc-slider__thumb--focused .mdc-slider__thumb--top.mdc-slider__thumb:hover .mdc-slider__thumb-knob,.mat-mdc-slider .mdc-slider__thumb--focused .mdc-slider__thumb--top.mdc-slider__thumb--focused .mdc-slider__thumb-knob{border-color:#fff}.mat-mdc-slider .mdc-slider__thumb:not(:disabled):active .mdc-slider__thumb--top .mdc-slider__thumb-knob,.mat-mdc-slider .mdc-slider__thumb:not(:disabled):active .mdc-slider__thumb--top.mdc-slider__thumb:hover .mdc-slider__thumb-knob,.mat-mdc-slider .mdc-slider__thumb:not(:disabled):active .mdc-slider__thumb--top.mdc-slider__thumb--focused .mdc-slider__thumb-knob{border-color:#fff}.mat-mdc-slider .mdc-slider__thumb--top .mdc-slider__thumb-knob,.mat-mdc-slider .mdc-slider__thumb--top.mdc-slider__thumb:hover .mdc-slider__thumb-knob,.mat-mdc-slider .mdc-slider__thumb--top.mdc-slider__thumb--focused .mdc-slider__thumb-knob{border-color:var(--mdc-slider-with-overlap-handle-outline-color, #fff);border-width:var(--mdc-slider-with-overlap-handle-outline-width, 1px)}.mat-mdc-slider .mdc-slider__input{box-sizing:content-box;pointer-events:auto}.mat-mdc-slider .mdc-slider__input.mat-mdc-slider-input-no-pointer-events{pointer-events:none}.mat-mdc-slider .mdc-slider__input.mat-slider__right-input{left:auto;right:0}.mat-mdc-slider .mdc-slider__thumb,.mat-mdc-slider .mdc-slider__track--active_fill{transition-duration:0ms}.mat-mdc-slider.mat-mdc-slider-with-animation .mdc-slider__thumb,.mat-mdc-slider.mat-mdc-slider-with-animation .mdc-slider__track--active_fill{transition-duration:80ms}.mat-mdc-slider.mat-mdc-slider-with-animation.mat-mdc-slider-disable-track-animation .mdc-slider__track--active_fill{transition-duration:0ms}.mat-mdc-slider.mdc-slider--discrete .mdc-slider__thumb,.mat-mdc-slider.mdc-slider--discrete .mdc-slider__track--active_fill{transition-duration:0ms}.mat-mdc-slider.mat-mdc-slider-with-animation .mdc-slider__thumb,.mat-mdc-slider.mat-mdc-slider-with-animation .mdc-slider__track--active_fill{transition-duration:80ms}.mat-mdc-slider.mat-mdc-slider-with-animation.mat-mdc-slider-disable-track-animation .mdc-slider__track--active_fill{transition-duration:0ms}.mat-mdc-slider .mdc-slider__track,.mat-mdc-slider .mdc-slider__thumb{pointer-events:none}.mat-mdc-slider .mdc-slider__value-indicator{opacity:var(--mat-mdc-slider-value-indicator-opacity, 1)}.mat-mdc-slider .mat-ripple .mat-ripple-element{background-color:var(--mat-mdc-slider-ripple-color, transparent)}.mat-mdc-slider .mat-ripple .mat-mdc-slider-hover-ripple{background-color:var(--mat-mdc-slider-hover-ripple-color, transparent)}.mat-mdc-slider .mat-ripple .mat-mdc-slider-focus-ripple,.mat-mdc-slider .mat-ripple .mat-mdc-slider-active-ripple{background-color:var(--mat-mdc-slider-focus-ripple-color, transparent)}.mat-mdc-slider._mat-animation-noopable.mdc-slider--discrete .mdc-slider__thumb,.mat-mdc-slider._mat-animation-noopable.mdc-slider--discrete .mdc-slider__track--active_fill,.mat-mdc-slider._mat-animation-noopable .mdc-slider__value-indicator{transition:none}.mat-mdc-slider .mat-mdc-focus-indicator::before{border-radius:50%}.mdc-slider__thumb--focused .mat-mdc-focus-indicator::before{content:\"\"}"] }]
        }], ctorParameters: function () { return [{ type: i0.NgZone }, { type: i0.ChangeDetectorRef }, { type: i1.Platform }, { type: i0.ElementRef }, { type: i2.Directionality, decorators: [{
                    type: Optional
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [MAT_RIPPLE_GLOBAL_OPTIONS]
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [ANIMATION_MODULE_TYPE]
                }] }]; }, propDecorators: { _trackActive: [{
                type: ViewChild,
                args: ['trackActive']
            }], _thumbs: [{
                type: ViewChildren,
                args: [MAT_SLIDER_VISUAL_THUMB]
            }], _input: [{
                type: ContentChild,
                args: [MAT_SLIDER_THUMB]
            }], _inputs: [{
                type: ContentChildren,
                args: [MAT_SLIDER_RANGE_THUMB, { descendants: false }]
            }], disabled: [{
                type: Input
            }], discrete: [{
                type: Input
            }], showTickMarks: [{
                type: Input
            }], min: [{
                type: Input
            }], max: [{
                type: Input
            }], step: [{
                type: Input
            }], displayWith: [{
                type: Input
            }] } });
/** Ensures that there is not an invalid configuration for the slider thumb inputs. */
function _validateInputs(isRange, endInputElement, startInputElement) {
    const startValid = !isRange || startInputElement?._hostElement.hasAttribute('matSliderStartThumb');
    const endValid = endInputElement._hostElement.hasAttribute(isRange ? 'matSliderEndThumb' : 'matSliderThumb');
    if (!startValid || !endValid) {
        _throwInvalidInputConfigurationError();
    }
}
function _throwInvalidInputConfigurationError() {
    throw Error(`Invalid slider thumb input configuration!

   Valid configurations are as follows:

     <mat-slider>
       <input matSliderThumb>
     </mat-slider>

     or

     <mat-slider>
       <input matSliderStartThumb>
       <input matSliderEndThumb>
     </mat-slider>
   `);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2xpZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL3NsaWRlci9zbGlkZXIudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvc2xpZGVyL3NsaWRlci5odG1sIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNqRCxPQUFPLEVBRUwscUJBQXFCLEVBQ3JCLG9CQUFvQixHQUVyQixNQUFNLHVCQUF1QixDQUFDO0FBQy9CLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUMvQyxPQUFPLEVBRUwsdUJBQXVCLEVBQ3ZCLGlCQUFpQixFQUNqQixTQUFTLEVBQ1QsWUFBWSxFQUNaLGVBQWUsRUFDZixVQUFVLEVBQ1YsTUFBTSxFQUNOLEtBQUssRUFDTCxNQUFNLEVBRU4sUUFBUSxFQUNSLFNBQVMsRUFDVCxTQUFTLEVBQ1QsWUFBWSxFQUNaLGlCQUFpQixHQUNsQixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBRUwseUJBQXlCLEVBQ3pCLFVBQVUsRUFDVixrQkFBa0IsR0FFbkIsTUFBTSx3QkFBd0IsQ0FBQztBQUNoQyxPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSxzQ0FBc0MsQ0FBQztBQUUzRSxPQUFPLEVBQUMsSUFBSSxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDcEMsT0FBTyxFQU9MLHNCQUFzQixFQUN0QixnQkFBZ0IsRUFDaEIsVUFBVSxFQUNWLHVCQUF1QixHQUN4QixNQUFNLG9CQUFvQixDQUFDOzs7Ozs7QUFFNUIsNERBQTREO0FBQzVELG9DQUFvQztBQUNwQyw2QkFBNkI7QUFDN0IsNkNBQTZDO0FBRTdDLGdEQUFnRDtBQUNoRCxNQUFNLG1CQUFtQixHQUFHLFVBQVUsQ0FDcEMsa0JBQWtCLENBQ2hCO0lBQ0UsWUFBbUIsV0FBb0M7UUFB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QUMzQyxNQUFNLEtBQUssQ0FBQzs7Ozs7Ozs7Ozs7Ozs7SUFjVixDQUFDLENBQUM7QUFDTixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGlyZWN0aW9uYWxpdHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9iaWRpJztcbmltcG9ydCB7XG4gIEJvb2xlYW5JbnB1dCxcbiAgY29lcmNlQm9vbGVhblByb3BlcnR5LFxuICBjb2VyY2VOdW1iZXJQcm9wZXJ0eSxcbiAgTnVtYmVySW5wdXQsXG59IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5pbXBvcnQge1BsYXRmb3JtfSBmcm9tICdAYW5ndWxhci9jZGsvcGxhdGZvcm0nO1xuaW1wb3J0IHtcbiAgQWZ0ZXJWaWV3SW5pdCxcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIENoYW5nZURldGVjdG9yUmVmLFxuICBDb21wb25lbnQsXG4gIENvbnRlbnRDaGlsZCxcbiAgQ29udGVudENoaWxkcmVuLFxuICBFbGVtZW50UmVmLFxuICBJbmplY3QsXG4gIElucHV0LFxuICBOZ1pvbmUsXG4gIE9uRGVzdHJveSxcbiAgT3B0aW9uYWwsXG4gIFF1ZXJ5TGlzdCxcbiAgVmlld0NoaWxkLFxuICBWaWV3Q2hpbGRyZW4sXG4gIFZpZXdFbmNhcHN1bGF0aW9uLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7XG4gIENhbkRpc2FibGVSaXBwbGUsXG4gIE1BVF9SSVBQTEVfR0xPQkFMX09QVElPTlMsXG4gIG1peGluQ29sb3IsXG4gIG1peGluRGlzYWJsZVJpcHBsZSxcbiAgUmlwcGxlR2xvYmFsT3B0aW9ucyxcbn0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvY29yZSc7XG5pbXBvcnQge0FOSU1BVElPTl9NT0RVTEVfVFlQRX0gZnJvbSAnQGFuZ3VsYXIvcGxhdGZvcm0tYnJvd3Nlci9hbmltYXRpb25zJztcbmltcG9ydCB7U3Vic2NyaXB0aW9ufSBmcm9tICdyeGpzJztcbmltcG9ydCB7dGFrZX0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHtcbiAgX01hdFRodW1iLFxuICBfTWF0VGlja01hcmssXG4gIF9NYXRTbGlkZXIsXG4gIF9NYXRTbGlkZXJSYW5nZVRodW1iLFxuICBfTWF0U2xpZGVyVGh1bWIsXG4gIF9NYXRTbGlkZXJWaXN1YWxUaHVtYixcbiAgTUFUX1NMSURFUl9SQU5HRV9USFVNQixcbiAgTUFUX1NMSURFUl9USFVNQixcbiAgTUFUX1NMSURFUixcbiAgTUFUX1NMSURFUl9WSVNVQUxfVEhVTUIsXG59IGZyb20gJy4vc2xpZGVyLWludGVyZmFjZSc7XG5cbi8vIFRPRE8od2FnbmVybWFjaWVsKTogbWF5YmUgaGFuZGxlIHRoZSBmb2xsb3dpbmcgZWRnZSBjYXNlOlxuLy8gMS4gc3RhcnQgZHJhZ2dpbmcgZGlzY3JldGUgc2xpZGVyXG4vLyAyLiB0YWIgdG8gZGlzYWJsZSBjaGVja2JveFxuLy8gMy4gd2l0aG91dCBlbmRpbmcgZHJhZywgZGlzYWJsZSB0aGUgc2xpZGVyXG5cbi8vIEJvaWxlcnBsYXRlIGZvciBhcHBseWluZyBtaXhpbnMgdG8gTWF0U2xpZGVyLlxuY29uc3QgX01hdFNsaWRlck1peGluQmFzZSA9IG1peGluQ29sb3IoXG4gIG1peGluRGlzYWJsZVJpcHBsZShcbiAgICBjbGFzcyB7XG4gICAgICBjb25zdHJ1Y3RvcihwdWJsaWMgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+KSB7fVxuICAgIH0sXG4gICksXG4gICdwcmltYXJ5Jyxcbik7XG5cbi8qKlxuICogQWxsb3dzIHVzZXJzIHRvIHNlbGVjdCBmcm9tIGEgcmFuZ2Ugb2YgdmFsdWVzIGJ5IG1vdmluZyB0aGUgc2xpZGVyIHRodW1iLiBJdCBpcyBzaW1pbGFyIGluXG4gKiBiZWhhdmlvciB0byB0aGUgbmF0aXZlIGA8aW5wdXQgdHlwZT1cInJhbmdlXCI+YCBlbGVtZW50LlxuICovXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdtYXQtc2xpZGVyJyxcbiAgdGVtcGxhdGVVcmw6ICdzbGlkZXIuaHRtbCcsXG4gIHN0eWxlVXJsczogWydzbGlkZXIuY3NzJ10sXG4gIGhvc3Q6IHtcbiAgICAnY2xhc3MnOiAnbWF0LW1kYy1zbGlkZXIgbWRjLXNsaWRlcicsXG4gICAgJ1tjbGFzcy5tZGMtc2xpZGVyLS1yYW5nZV0nOiAnX2lzUmFuZ2UnLFxuICAgICdbY2xhc3MubWRjLXNsaWRlci0tZGlzYWJsZWRdJzogJ2Rpc2FibGVkJyxcbiAgICAnW2NsYXNzLm1kYy1zbGlkZXItLWRpc2NyZXRlXSc6ICdkaXNjcmV0ZScsXG4gICAgJ1tjbGFzcy5tZGMtc2xpZGVyLS10aWNrLW1hcmtzXSc6ICdzaG93VGlja01hcmtzJyxcbiAgICAnW2NsYXNzLl9tYXQtYW5pbWF0aW9uLW5vb3BhYmxlXSc6ICdfbm9vcEFuaW1hdGlvbnMnLFxuICB9LFxuICBleHBvcnRBczogJ21hdFNsaWRlcicsXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxuICBpbnB1dHM6IFsnY29sb3InLCAnZGlzYWJsZVJpcHBsZSddLFxuICBwcm92aWRlcnM6IFt7cHJvdmlkZTogTUFUX1NMSURFUiwgdXNlRXhpc3Rpbmc6IE1hdFNsaWRlcn1dLFxufSlcbmV4cG9ydCBjbGFzcyBNYXRTbGlkZXJcbiAgZXh0ZW5kcyBfTWF0U2xpZGVyTWl4aW5CYXNlXG4gIGltcGxlbWVudHMgQWZ0ZXJWaWV3SW5pdCwgQ2FuRGlzYWJsZVJpcHBsZSwgT25EZXN0cm95LCBfTWF0U2xpZGVyXG57XG4gIC8qKiBUaGUgYWN0aXZlIHBvcnRpb24gb2YgdGhlIHNsaWRlciB0cmFjay4gKi9cbiAgQFZpZXdDaGlsZCgndHJhY2tBY3RpdmUnKSBfdHJhY2tBY3RpdmU6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+O1xuXG4gIC8qKiBUaGUgc2xpZGVyIHRodW1iKHMpLiAqL1xuICBAVmlld0NoaWxkcmVuKE1BVF9TTElERVJfVklTVUFMX1RIVU1CKSBfdGh1bWJzOiBRdWVyeUxpc3Q8X01hdFNsaWRlclZpc3VhbFRodW1iPjtcblxuICAvKiogVGhlIHNsaWRlcnMgaGlkZGVuIHJhbmdlIGlucHV0KHMpLiAqL1xuICBAQ29udGVudENoaWxkKE1BVF9TTElERVJfVEhVTUIpIF9pbnB1dDogX01hdFNsaWRlclRodW1iO1xuXG4gIC8qKiBUaGUgc2xpZGVycyBoaWRkZW4gcmFuZ2UgaW5wdXQocykuICovXG4gIEBDb250ZW50Q2hpbGRyZW4oTUFUX1NMSURFUl9SQU5HRV9USFVNQiwge2Rlc2NlbmRhbnRzOiBmYWxzZX0pXG4gIF9pbnB1dHM6IFF1ZXJ5TGlzdDxfTWF0U2xpZGVyUmFuZ2VUaHVtYj47XG5cbiAgLyoqIFdoZXRoZXIgdGhlIHNsaWRlciBpcyBkaXNhYmxlZC4gKi9cbiAgQElucHV0KClcbiAgZ2V0IGRpc2FibGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9kaXNhYmxlZDtcbiAgfVxuICBzZXQgZGlzYWJsZWQodjogQm9vbGVhbklucHV0KSB7XG4gICAgdGhpcy5fZGlzYWJsZWQgPSBjb2VyY2VCb29sZWFuUHJvcGVydHkodik7XG4gICAgY29uc3QgZW5kSW5wdXQgPSB0aGlzLl9nZXRJbnB1dChfTWF0VGh1bWIuRU5EKTtcbiAgICBjb25zdCBzdGFydElucHV0ID0gdGhpcy5fZ2V0SW5wdXQoX01hdFRodW1iLlNUQVJUKTtcblxuICAgIGlmIChlbmRJbnB1dCkge1xuICAgICAgZW5kSW5wdXQuZGlzYWJsZWQgPSB0aGlzLl9kaXNhYmxlZDtcbiAgICB9XG4gICAgaWYgKHN0YXJ0SW5wdXQpIHtcbiAgICAgIHN0YXJ0SW5wdXQuZGlzYWJsZWQgPSB0aGlzLl9kaXNhYmxlZDtcbiAgICB9XG4gIH1cbiAgcHJpdmF0ZSBfZGlzYWJsZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAvKiogV2hldGhlciB0aGUgc2xpZGVyIGRpc3BsYXlzIGEgbnVtZXJpYyB2YWx1ZSBsYWJlbCB1cG9uIHByZXNzaW5nIHRoZSB0aHVtYi4gKi9cbiAgQElucHV0KClcbiAgZ2V0IGRpc2NyZXRlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9kaXNjcmV0ZTtcbiAgfVxuICBzZXQgZGlzY3JldGUodjogQm9vbGVhbklucHV0KSB7XG4gICAgdGhpcy5fZGlzY3JldGUgPSBjb2VyY2VCb29sZWFuUHJvcGVydHkodik7XG4gICAgdGhpcy5fdXBkYXRlVmFsdWVJbmRpY2F0b3JVSXMoKTtcbiAgfVxuICBwcml2YXRlIF9kaXNjcmV0ZTogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBzbGlkZXIgZGlzcGxheXMgdGljayBtYXJrcyBhbG9uZyB0aGUgc2xpZGVyIHRyYWNrLiAqL1xuICBASW5wdXQoKVxuICBnZXQgc2hvd1RpY2tNYXJrcygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fc2hvd1RpY2tNYXJrcztcbiAgfVxuICBzZXQgc2hvd1RpY2tNYXJrcyh2OiBCb29sZWFuSW5wdXQpIHtcbiAgICB0aGlzLl9zaG93VGlja01hcmtzID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHYpO1xuICB9XG4gIHByaXZhdGUgX3Nob3dUaWNrTWFya3M6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAvKiogVGhlIG1pbmltdW0gdmFsdWUgdGhhdCB0aGUgc2xpZGVyIGNhbiBoYXZlLiAqL1xuICBASW5wdXQoKVxuICBnZXQgbWluKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX21pbjtcbiAgfVxuICBzZXQgbWluKHY6IE51bWJlcklucHV0KSB7XG4gICAgY29uc3QgbWluID0gY29lcmNlTnVtYmVyUHJvcGVydHkodiwgdGhpcy5fbWluKTtcbiAgICBpZiAodGhpcy5fbWluICE9PSBtaW4pIHtcbiAgICAgIHRoaXMuX3VwZGF0ZU1pbihtaW4pO1xuICAgIH1cbiAgfVxuICBwcml2YXRlIF9taW46IG51bWJlciA9IDA7XG5cbiAgcHJpdmF0ZSBfdXBkYXRlTWluKG1pbjogbnVtYmVyKTogdm9pZCB7XG4gICAgY29uc3QgcHJldk1pbiA9IHRoaXMuX21pbjtcbiAgICB0aGlzLl9taW4gPSBtaW47XG4gICAgdGhpcy5faXNSYW5nZSA/IHRoaXMuX3VwZGF0ZU1pblJhbmdlKHtvbGQ6IHByZXZNaW4sIG5ldzogbWlufSkgOiB0aGlzLl91cGRhdGVNaW5Ob25SYW5nZShtaW4pO1xuICAgIHRoaXMuX29uTWluTWF4T3JTdGVwQ2hhbmdlKCk7XG4gIH1cblxuICBwcml2YXRlIF91cGRhdGVNaW5SYW5nZShtaW46IHtvbGQ6IG51bWJlcjsgbmV3OiBudW1iZXJ9KTogdm9pZCB7XG4gICAgY29uc3QgZW5kSW5wdXQgPSB0aGlzLl9nZXRJbnB1dChfTWF0VGh1bWIuRU5EKSBhcyBfTWF0U2xpZGVyUmFuZ2VUaHVtYjtcbiAgICBjb25zdCBzdGFydElucHV0ID0gdGhpcy5fZ2V0SW5wdXQoX01hdFRodW1iLlNUQVJUKSBhcyBfTWF0U2xpZGVyUmFuZ2VUaHVtYjtcblxuICAgIGNvbnN0IG9sZEVuZFZhbHVlID0gZW5kSW5wdXQudmFsdWU7XG4gICAgY29uc3Qgb2xkU3RhcnRWYWx1ZSA9IHN0YXJ0SW5wdXQudmFsdWU7XG5cbiAgICBzdGFydElucHV0Lm1pbiA9IG1pbi5uZXc7XG4gICAgZW5kSW5wdXQubWluID0gTWF0aC5tYXgobWluLm5ldywgc3RhcnRJbnB1dC52YWx1ZSk7XG4gICAgc3RhcnRJbnB1dC5tYXggPSBNYXRoLm1pbihlbmRJbnB1dC5tYXgsIGVuZElucHV0LnZhbHVlKTtcblxuICAgIHN0YXJ0SW5wdXQuX3VwZGF0ZVdpZHRoSW5hY3RpdmUoKTtcbiAgICBlbmRJbnB1dC5fdXBkYXRlV2lkdGhJbmFjdGl2ZSgpO1xuXG4gICAgbWluLm5ldyA8IG1pbi5vbGRcbiAgICAgID8gdGhpcy5fb25UcmFuc2xhdGVYQ2hhbmdlQnlTaWRlRWZmZWN0KGVuZElucHV0LCBzdGFydElucHV0KVxuICAgICAgOiB0aGlzLl9vblRyYW5zbGF0ZVhDaGFuZ2VCeVNpZGVFZmZlY3Qoc3RhcnRJbnB1dCwgZW5kSW5wdXQpO1xuXG4gICAgaWYgKG9sZEVuZFZhbHVlICE9PSBlbmRJbnB1dC52YWx1ZSkge1xuICAgICAgdGhpcy5fb25WYWx1ZUNoYW5nZShlbmRJbnB1dCk7XG4gICAgfVxuXG4gICAgaWYgKG9sZFN0YXJ0VmFsdWUgIT09IHN0YXJ0SW5wdXQudmFsdWUpIHtcbiAgICAgIHRoaXMuX29uVmFsdWVDaGFuZ2Uoc3RhcnRJbnB1dCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfdXBkYXRlTWluTm9uUmFuZ2UobWluOiBudW1iZXIpOiB2b2lkIHtcbiAgICBjb25zdCBpbnB1dCA9IHRoaXMuX2dldElucHV0KF9NYXRUaHVtYi5FTkQpO1xuICAgIGlmIChpbnB1dCkge1xuICAgICAgY29uc3Qgb2xkVmFsdWUgPSBpbnB1dC52YWx1ZTtcblxuICAgICAgaW5wdXQubWluID0gbWluO1xuICAgICAgaW5wdXQuX3VwZGF0ZVRodW1iVUlCeVZhbHVlKCk7XG4gICAgICB0aGlzLl91cGRhdGVUcmFja1VJKGlucHV0KTtcblxuICAgICAgaWYgKG9sZFZhbHVlICE9PSBpbnB1dC52YWx1ZSkge1xuICAgICAgICB0aGlzLl9vblZhbHVlQ2hhbmdlKGlucHV0KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKiogVGhlIG1heGltdW0gdmFsdWUgdGhhdCB0aGUgc2xpZGVyIGNhbiBoYXZlLiAqL1xuICBASW5wdXQoKVxuICBnZXQgbWF4KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX21heDtcbiAgfVxuICBzZXQgbWF4KHY6IE51bWJlcklucHV0KSB7XG4gICAgY29uc3QgbWF4ID0gY29lcmNlTnVtYmVyUHJvcGVydHkodiwgdGhpcy5fbWF4KTtcbiAgICBpZiAodGhpcy5fbWF4ICE9PSBtYXgpIHtcbiAgICAgIHRoaXMuX3VwZGF0ZU1heChtYXgpO1xuICAgIH1cbiAgfVxuICBwcml2YXRlIF9tYXg6IG51bWJlciA9IDEwMDtcblxuICBwcml2YXRlIF91cGRhdGVNYXgobWF4OiBudW1iZXIpOiB2b2lkIHtcbiAgICBjb25zdCBwcmV2TWF4ID0gdGhpcy5fbWF4O1xuICAgIHRoaXMuX21heCA9IG1heDtcbiAgICB0aGlzLl9pc1JhbmdlID8gdGhpcy5fdXBkYXRlTWF4UmFuZ2Uoe29sZDogcHJldk1heCwgbmV3OiBtYXh9KSA6IHRoaXMuX3VwZGF0ZU1heE5vblJhbmdlKG1heCk7XG4gICAgdGhpcy5fb25NaW5NYXhPclN0ZXBDaGFuZ2UoKTtcbiAgfVxuXG4gIHByaXZhdGUgX3VwZGF0ZU1heFJhbmdlKG1heDoge29sZDogbnVtYmVyOyBuZXc6IG51bWJlcn0pOiB2b2lkIHtcbiAgICBjb25zdCBlbmRJbnB1dCA9IHRoaXMuX2dldElucHV0KF9NYXRUaHVtYi5FTkQpIGFzIF9NYXRTbGlkZXJSYW5nZVRodW1iO1xuICAgIGNvbnN0IHN0YXJ0SW5wdXQgPSB0aGlzLl9nZXRJbnB1dChfTWF0VGh1bWIuU1RBUlQpIGFzIF9NYXRTbGlkZXJSYW5nZVRodW1iO1xuXG4gICAgY29uc3Qgb2xkRW5kVmFsdWUgPSBlbmRJbnB1dC52YWx1ZTtcbiAgICBjb25zdCBvbGRTdGFydFZhbHVlID0gc3RhcnRJbnB1dC52YWx1ZTtcblxuICAgIGVuZElucHV0Lm1heCA9IG1heC5uZXc7XG4gICAgc3RhcnRJbnB1dC5tYXggPSBNYXRoLm1pbihtYXgubmV3LCBlbmRJbnB1dC52YWx1ZSk7XG4gICAgZW5kSW5wdXQubWluID0gc3RhcnRJbnB1dC52YWx1ZTtcblxuICAgIGVuZElucHV0Ll91cGRhdGVXaWR0aEluYWN0aXZlKCk7XG4gICAgc3RhcnRJbnB1dC5fdXBkYXRlV2lkdGhJbmFjdGl2ZSgpO1xuXG4gICAgbWF4Lm5ldyA+IG1heC5vbGRcbiAgICAgID8gdGhpcy5fb25UcmFuc2xhdGVYQ2hhbmdlQnlTaWRlRWZmZWN0KHN0YXJ0SW5wdXQsIGVuZElucHV0KVxuICAgICAgOiB0aGlzLl9vblRyYW5zbGF0ZVhDaGFuZ2VCeVNpZGVFZmZlY3QoZW5kSW5wdXQsIHN0YXJ0SW5wdXQpO1xuXG4gICAgaWYgKG9sZEVuZFZhbHVlICE9PSBlbmRJbnB1dC52YWx1ZSkge1xuICAgICAgdGhpcy5fb25WYWx1ZUNoYW5nZShlbmRJbnB1dCk7XG4gICAgfVxuXG4gICAgaWYgKG9sZFN0YXJ0VmFsdWUgIT09IHN0YXJ0SW5wdXQudmFsdWUpIHtcbiAgICAgIHRoaXMuX29uVmFsdWVDaGFuZ2Uoc3RhcnRJbnB1dCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfdXBkYXRlTWF4Tm9uUmFuZ2UobWF4OiBudW1iZXIpOiB2b2lkIHtcbiAgICBjb25zdCBpbnB1dCA9IHRoaXMuX2dldElucHV0KF9NYXRUaHVtYi5FTkQpO1xuICAgIGlmIChpbnB1dCkge1xuICAgICAgY29uc3Qgb2xkVmFsdWUgPSBpbnB1dC52YWx1ZTtcblxuICAgICAgaW5wdXQubWF4ID0gbWF4O1xuICAgICAgaW5wdXQuX3VwZGF0ZVRodW1iVUlCeVZhbHVlKCk7XG4gICAgICB0aGlzLl91cGRhdGVUcmFja1VJKGlucHV0KTtcblxuICAgICAgaWYgKG9sZFZhbHVlICE9PSBpbnB1dC52YWx1ZSkge1xuICAgICAgICB0aGlzLl9vblZhbHVlQ2hhbmdlKGlucHV0KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKiogVGhlIHZhbHVlcyBhdCB3aGljaCB0aGUgdGh1bWIgd2lsbCBzbmFwLiAqL1xuICBASW5wdXQoKVxuICBnZXQgc3RlcCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9zdGVwO1xuICB9XG4gIHNldCBzdGVwKHY6IE51bWJlcklucHV0KSB7XG4gICAgY29uc3Qgc3RlcCA9IGNvZXJjZU51bWJlclByb3BlcnR5KHYsIHRoaXMuX3N0ZXApO1xuICAgIGlmICh0aGlzLl9zdGVwICE9PSBzdGVwKSB7XG4gICAgICB0aGlzLl91cGRhdGVTdGVwKHN0ZXApO1xuICAgIH1cbiAgfVxuICBwcml2YXRlIF9zdGVwOiBudW1iZXIgPSAwO1xuXG4gIHByaXZhdGUgX3VwZGF0ZVN0ZXAoc3RlcDogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5fc3RlcCA9IHN0ZXA7XG4gICAgdGhpcy5faXNSYW5nZSA/IHRoaXMuX3VwZGF0ZVN0ZXBSYW5nZSgpIDogdGhpcy5fdXBkYXRlU3RlcE5vblJhbmdlKCk7XG4gICAgdGhpcy5fb25NaW5NYXhPclN0ZXBDaGFuZ2UoKTtcbiAgfVxuXG4gIHByaXZhdGUgX3VwZGF0ZVN0ZXBSYW5nZSgpOiB2b2lkIHtcbiAgICBjb25zdCBlbmRJbnB1dCA9IHRoaXMuX2dldElucHV0KF9NYXRUaHVtYi5FTkQpIGFzIF9NYXRTbGlkZXJSYW5nZVRodW1iO1xuICAgIGNvbnN0IHN0YXJ0SW5wdXQgPSB0aGlzLl9nZXRJbnB1dChfTWF0VGh1bWIuU1RBUlQpIGFzIF9NYXRTbGlkZXJSYW5nZVRodW1iO1xuXG4gICAgY29uc3Qgb2xkRW5kVmFsdWUgPSBlbmRJbnB1dC52YWx1ZTtcbiAgICBjb25zdCBvbGRTdGFydFZhbHVlID0gc3RhcnRJbnB1dC52YWx1ZTtcblxuICAgIGNvbnN0IHByZXZTdGFydFZhbHVlID0gc3RhcnRJbnB1dC52YWx1ZTtcblxuICAgIGVuZElucHV0Lm1pbiA9IHRoaXMuX21pbjtcbiAgICBzdGFydElucHV0Lm1heCA9IHRoaXMuX21heDtcblxuICAgIGVuZElucHV0LnN0ZXAgPSB0aGlzLl9zdGVwO1xuICAgIHN0YXJ0SW5wdXQuc3RlcCA9IHRoaXMuX3N0ZXA7XG5cbiAgICBpZiAodGhpcy5fcGxhdGZvcm0uU0FGQVJJKSB7XG4gICAgICBlbmRJbnB1dC52YWx1ZSA9IGVuZElucHV0LnZhbHVlO1xuICAgICAgc3RhcnRJbnB1dC52YWx1ZSA9IHN0YXJ0SW5wdXQudmFsdWU7XG4gICAgfVxuXG4gICAgZW5kSW5wdXQubWluID0gTWF0aC5tYXgodGhpcy5fbWluLCBzdGFydElucHV0LnZhbHVlKTtcbiAgICBzdGFydElucHV0Lm1heCA9IE1hdGgubWluKHRoaXMuX21heCwgZW5kSW5wdXQudmFsdWUpO1xuXG4gICAgc3RhcnRJbnB1dC5fdXBkYXRlV2lkdGhJbmFjdGl2ZSgpO1xuICAgIGVuZElucHV0Ll91cGRhdGVXaWR0aEluYWN0aXZlKCk7XG5cbiAgICBlbmRJbnB1dC52YWx1ZSA8IHByZXZTdGFydFZhbHVlXG4gICAgICA/IHRoaXMuX29uVHJhbnNsYXRlWENoYW5nZUJ5U2lkZUVmZmVjdChzdGFydElucHV0LCBlbmRJbnB1dClcbiAgICAgIDogdGhpcy5fb25UcmFuc2xhdGVYQ2hhbmdlQnlTaWRlRWZmZWN0KGVuZElucHV0LCBzdGFydElucHV0KTtcblxuICAgIGlmIChvbGRFbmRWYWx1ZSAhPT0gZW5kSW5wdXQudmFsdWUpIHtcbiAgICAgIHRoaXMuX29uVmFsdWVDaGFuZ2UoZW5kSW5wdXQpO1xuICAgIH1cblxuICAgIGlmIChvbGRTdGFydFZhbHVlICE9PSBzdGFydElucHV0LnZhbHVlKSB7XG4gICAgICB0aGlzLl9vblZhbHVlQ2hhbmdlKHN0YXJ0SW5wdXQpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3VwZGF0ZVN0ZXBOb25SYW5nZSgpOiB2b2lkIHtcbiAgICBjb25zdCBpbnB1dCA9IHRoaXMuX2dldElucHV0KF9NYXRUaHVtYi5FTkQpO1xuICAgIGlmIChpbnB1dCkge1xuICAgICAgY29uc3Qgb2xkVmFsdWUgPSBpbnB1dC52YWx1ZTtcblxuICAgICAgaW5wdXQuc3RlcCA9IHRoaXMuX3N0ZXA7XG4gICAgICBpZiAodGhpcy5fcGxhdGZvcm0uU0FGQVJJKSB7XG4gICAgICAgIGlucHV0LnZhbHVlID0gaW5wdXQudmFsdWU7XG4gICAgICB9XG5cbiAgICAgIGlucHV0Ll91cGRhdGVUaHVtYlVJQnlWYWx1ZSgpO1xuXG4gICAgICBpZiAob2xkVmFsdWUgIT09IGlucHV0LnZhbHVlKSB7XG4gICAgICAgIHRoaXMuX29uVmFsdWVDaGFuZ2UoaW5wdXQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBGdW5jdGlvbiB0aGF0IHdpbGwgYmUgdXNlZCB0byBmb3JtYXQgdGhlIHZhbHVlIGJlZm9yZSBpdCBpcyBkaXNwbGF5ZWRcbiAgICogaW4gdGhlIHRodW1iIGxhYmVsLiBDYW4gYmUgdXNlZCB0byBmb3JtYXQgdmVyeSBsYXJnZSBudW1iZXIgaW4gb3JkZXJcbiAgICogZm9yIHRoZW0gdG8gZml0IGludG8gdGhlIHNsaWRlciB0aHVtYi5cbiAgICovXG4gIEBJbnB1dCgpIGRpc3BsYXlXaXRoOiAodmFsdWU6IG51bWJlcikgPT4gc3RyaW5nID0gKHZhbHVlOiBudW1iZXIpID0+IGAke3ZhbHVlfWA7XG5cbiAgLyoqIFVzZWQgdG8ga2VlcCB0cmFjayBvZiAmIHJlbmRlciB0aGUgYWN0aXZlICYgaW5hY3RpdmUgdGljayBtYXJrcyBvbiB0aGUgc2xpZGVyIHRyYWNrLiAqL1xuICBfdGlja01hcmtzOiBfTWF0VGlja01hcmtbXTtcblxuICAvKiogV2hldGhlciBhbmltYXRpb25zIGhhdmUgYmVlbiBkaXNhYmxlZC4gKi9cbiAgX25vb3BBbmltYXRpb25zOiBib29sZWFuO1xuXG4gIC8qKiBTdWJzY3JpcHRpb24gdG8gY2hhbmdlcyB0byB0aGUgZGlyZWN0aW9uYWxpdHkgKExUUiAvIFJUTCkgY29udGV4dCBmb3IgdGhlIGFwcGxpY2F0aW9uLiAqL1xuICBwcml2YXRlIF9kaXJDaGFuZ2VTdWJzY3JpcHRpb246IFN1YnNjcmlwdGlvbjtcblxuICAvKiogT2JzZXJ2ZXIgdXNlZCB0byBtb25pdG9yIHNpemUgY2hhbmdlcyBpbiB0aGUgc2xpZGVyLiAqL1xuICBwcml2YXRlIF9yZXNpemVPYnNlcnZlcjogUmVzaXplT2JzZXJ2ZXIgfCBudWxsO1xuXG4gIC8vIFN0b3JlZCBkaW1lbnNpb25zIHRvIGF2b2lkIGNhbGxpbmcgZ2V0Qm91bmRpbmdDbGllbnRSZWN0IHJlZHVuZGFudGx5LlxuXG4gIF9jYWNoZWRXaWR0aDogbnVtYmVyO1xuICBfY2FjaGVkTGVmdDogbnVtYmVyO1xuXG4gIF9yaXBwbGVSYWRpdXM6IG51bWJlciA9IDI0O1xuXG4gIC8vIFRoZSB2YWx1ZSBpbmRpY2F0b3IgdG9vbHRpcCB0ZXh0IGZvciB0aGUgdmlzdWFsIHNsaWRlciB0aHVtYihzKS5cblxuICAvKiogQGRvY3MtcHJpdmF0ZSAqL1xuICBwcm90ZWN0ZWQgc3RhcnRWYWx1ZUluZGljYXRvclRleHQ6IHN0cmluZyA9ICcnO1xuXG4gIC8qKiBAZG9jcy1wcml2YXRlICovXG4gIHByb3RlY3RlZCBlbmRWYWx1ZUluZGljYXRvclRleHQ6IHN0cmluZyA9ICcnO1xuXG4gIC8vIFVzZWQgdG8gY29udHJvbCB0aGUgdHJhbnNsYXRlWCBvZiB0aGUgdmlzdWFsIHNsaWRlciB0aHVtYihzKS5cblxuICBfZW5kVGh1bWJUcmFuc2Zvcm06IHN0cmluZztcbiAgX3N0YXJ0VGh1bWJUcmFuc2Zvcm06IHN0cmluZztcblxuICBfaXNSYW5nZTogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBzbGlkZXIgaXMgcnRsLiAqL1xuICBfaXNSdGw6IGJvb2xlYW4gPSBmYWxzZTtcblxuICBwcml2YXRlIF9oYXNWaWV3SW5pdGlhbGl6ZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAvKipcbiAgICogVGhlIHdpZHRoIG9mIHRoZSB0aWNrIG1hcmsgdHJhY2suXG4gICAqIFRoZSB0aWNrIG1hcmsgdHJhY2sgd2lkdGggaXMgZGlmZmVyZW50IGZyb20gZnVsbCB0cmFjayB3aWR0aFxuICAgKi9cbiAgX3RpY2tNYXJrVHJhY2tXaWR0aDogbnVtYmVyID0gMDtcblxuICBfaGFzQW5pbWF0aW9uOiBib29sZWFuID0gZmFsc2U7XG5cbiAgcHJpdmF0ZSBfcmVzaXplVGltZXI6IG51bGwgfCBSZXR1cm5UeXBlPHR5cGVvZiBzZXRUaW1lb3V0PiA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcmVhZG9ubHkgX25nWm9uZTogTmdab25lLFxuICAgIHJlYWRvbmx5IF9jZHI6IENoYW5nZURldGVjdG9yUmVmLFxuICAgIHJlYWRvbmx5IF9wbGF0Zm9ybTogUGxhdGZvcm0sXG4gICAgZWxlbWVudFJlZjogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4sXG4gICAgQE9wdGlvbmFsKCkgcmVhZG9ubHkgX2RpcjogRGlyZWN0aW9uYWxpdHksXG4gICAgQE9wdGlvbmFsKClcbiAgICBASW5qZWN0KE1BVF9SSVBQTEVfR0xPQkFMX09QVElPTlMpXG4gICAgcmVhZG9ubHkgX2dsb2JhbFJpcHBsZU9wdGlvbnM/OiBSaXBwbGVHbG9iYWxPcHRpb25zLFxuICAgIEBPcHRpb25hbCgpIEBJbmplY3QoQU5JTUFUSU9OX01PRFVMRV9UWVBFKSBhbmltYXRpb25Nb2RlPzogc3RyaW5nLFxuICApIHtcbiAgICBzdXBlcihlbGVtZW50UmVmKTtcbiAgICB0aGlzLl9ub29wQW5pbWF0aW9ucyA9IGFuaW1hdGlvbk1vZGUgPT09ICdOb29wQW5pbWF0aW9ucyc7XG4gICAgdGhpcy5fZGlyQ2hhbmdlU3Vic2NyaXB0aW9uID0gdGhpcy5fZGlyLmNoYW5nZS5zdWJzY3JpYmUoKCkgPT4gdGhpcy5fb25EaXJDaGFuZ2UoKSk7XG4gICAgdGhpcy5faXNSdGwgPSB0aGlzLl9kaXIudmFsdWUgPT09ICdydGwnO1xuICB9XG5cbiAgLyoqIFRoZSByYWRpdXMgb2YgdGhlIG5hdGl2ZSBzbGlkZXIncyBrbm9iLiBBRkFJSyB0aGVyZSBpcyBubyB3YXkgdG8gYXZvaWQgaGFyZGNvZGluZyB0aGlzLiAqL1xuICBfa25vYlJhZGl1czogbnVtYmVyID0gODtcblxuICBfaW5wdXRQYWRkaW5nOiBudW1iZXI7XG4gIF9pbnB1dE9mZnNldDogbnVtYmVyO1xuXG4gIG5nQWZ0ZXJWaWV3SW5pdCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fcGxhdGZvcm0uaXNCcm93c2VyKSB7XG4gICAgICB0aGlzLl91cGRhdGVEaW1lbnNpb25zKCk7XG4gICAgfVxuXG4gICAgY29uc3QgZUlucHV0ID0gdGhpcy5fZ2V0SW5wdXQoX01hdFRodW1iLkVORCk7XG4gICAgY29uc3Qgc0lucHV0ID0gdGhpcy5fZ2V0SW5wdXQoX01hdFRodW1iLlNUQVJUKTtcbiAgICB0aGlzLl9pc1JhbmdlID0gISFlSW5wdXQgJiYgISFzSW5wdXQ7XG4gICAgdGhpcy5fY2RyLmRldGVjdENoYW5nZXMoKTtcblxuICAgIGlmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpIHtcbiAgICAgIF92YWxpZGF0ZUlucHV0cyhcbiAgICAgICAgdGhpcy5faXNSYW5nZSxcbiAgICAgICAgdGhpcy5fZ2V0SW5wdXQoX01hdFRodW1iLkVORCkhLFxuICAgICAgICB0aGlzLl9nZXRJbnB1dChfTWF0VGh1bWIuU1RBUlQpLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICBjb25zdCB0aHVtYiA9IHRoaXMuX2dldFRodW1iKF9NYXRUaHVtYi5FTkQpO1xuICAgIHRoaXMuX3JpcHBsZVJhZGl1cyA9IHRodW1iLl9yaXBwbGUucmFkaXVzO1xuICAgIHRoaXMuX2lucHV0UGFkZGluZyA9IHRoaXMuX3JpcHBsZVJhZGl1cyAtIHRoaXMuX2tub2JSYWRpdXM7XG4gICAgdGhpcy5faW5wdXRPZmZzZXQgPSB0aGlzLl9rbm9iUmFkaXVzO1xuXG4gICAgdGhpcy5faXNSYW5nZVxuICAgICAgPyB0aGlzLl9pbml0VUlSYW5nZShlSW5wdXQgYXMgX01hdFNsaWRlclJhbmdlVGh1bWIsIHNJbnB1dCBhcyBfTWF0U2xpZGVyUmFuZ2VUaHVtYilcbiAgICAgIDogdGhpcy5faW5pdFVJTm9uUmFuZ2UoZUlucHV0ISk7XG5cbiAgICB0aGlzLl91cGRhdGVUcmFja1VJKGVJbnB1dCEpO1xuICAgIHRoaXMuX3VwZGF0ZVRpY2tNYXJrVUkoKTtcbiAgICB0aGlzLl91cGRhdGVUaWNrTWFya1RyYWNrVUkoKTtcblxuICAgIHRoaXMuX29ic2VydmVIb3N0UmVzaXplKCk7XG4gICAgdGhpcy5fY2RyLmRldGVjdENoYW5nZXMoKTtcbiAgfVxuXG4gIHByaXZhdGUgX2luaXRVSU5vblJhbmdlKGVJbnB1dDogX01hdFNsaWRlclRodW1iKTogdm9pZCB7XG4gICAgZUlucHV0LmluaXRQcm9wcygpO1xuICAgIGVJbnB1dC5pbml0VUkoKTtcblxuICAgIHRoaXMuX3VwZGF0ZVZhbHVlSW5kaWNhdG9yVUkoZUlucHV0KTtcblxuICAgIHRoaXMuX2hhc1ZpZXdJbml0aWFsaXplZCA9IHRydWU7XG4gICAgZUlucHV0Ll91cGRhdGVUaHVtYlVJQnlWYWx1ZSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBfaW5pdFVJUmFuZ2UoZUlucHV0OiBfTWF0U2xpZGVyUmFuZ2VUaHVtYiwgc0lucHV0OiBfTWF0U2xpZGVyUmFuZ2VUaHVtYik6IHZvaWQge1xuICAgIGVJbnB1dC5pbml0UHJvcHMoKTtcbiAgICBlSW5wdXQuaW5pdFVJKCk7XG5cbiAgICBzSW5wdXQuaW5pdFByb3BzKCk7XG4gICAgc0lucHV0LmluaXRVSSgpO1xuXG4gICAgZUlucHV0Ll91cGRhdGVNaW5NYXgoKTtcbiAgICBzSW5wdXQuX3VwZGF0ZU1pbk1heCgpO1xuXG4gICAgZUlucHV0Ll91cGRhdGVTdGF0aWNTdHlsZXMoKTtcbiAgICBzSW5wdXQuX3VwZGF0ZVN0YXRpY1N0eWxlcygpO1xuXG4gICAgdGhpcy5fdXBkYXRlVmFsdWVJbmRpY2F0b3JVSXMoKTtcblxuICAgIHRoaXMuX2hhc1ZpZXdJbml0aWFsaXplZCA9IHRydWU7XG5cbiAgICBlSW5wdXQuX3VwZGF0ZVRodW1iVUlCeVZhbHVlKCk7XG4gICAgc0lucHV0Ll91cGRhdGVUaHVtYlVJQnlWYWx1ZSgpO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5fZGlyQ2hhbmdlU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgdGhpcy5fcmVzaXplT2JzZXJ2ZXI/LmRpc2Nvbm5lY3QoKTtcbiAgICB0aGlzLl9yZXNpemVPYnNlcnZlciA9IG51bGw7XG4gIH1cblxuICAvKiogSGFuZGxlcyB1cGRhdGluZyB0aGUgc2xpZGVyIHVpIGFmdGVyIGEgZGlyIGNoYW5nZS4gKi9cbiAgcHJpdmF0ZSBfb25EaXJDaGFuZ2UoKTogdm9pZCB7XG4gICAgdGhpcy5faXNSdGwgPSB0aGlzLl9kaXIudmFsdWUgPT09ICdydGwnO1xuICAgIHRoaXMuX2lzUmFuZ2UgPyB0aGlzLl9vbkRpckNoYW5nZVJhbmdlKCkgOiB0aGlzLl9vbkRpckNoYW5nZU5vblJhbmdlKCk7XG4gICAgdGhpcy5fdXBkYXRlVGlja01hcmtVSSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBfb25EaXJDaGFuZ2VSYW5nZSgpOiB2b2lkIHtcbiAgICBjb25zdCBlbmRJbnB1dCA9IHRoaXMuX2dldElucHV0KF9NYXRUaHVtYi5FTkQpIGFzIF9NYXRTbGlkZXJSYW5nZVRodW1iO1xuICAgIGNvbnN0IHN0YXJ0SW5wdXQgPSB0aGlzLl9nZXRJbnB1dChfTWF0VGh1bWIuU1RBUlQpIGFzIF9NYXRTbGlkZXJSYW5nZVRodW1iO1xuXG4gICAgZW5kSW5wdXQuX3NldElzTGVmdFRodW1iKCk7XG4gICAgc3RhcnRJbnB1dC5fc2V0SXNMZWZ0VGh1bWIoKTtcblxuICAgIGVuZElucHV0LnRyYW5zbGF0ZVggPSBlbmRJbnB1dC5fY2FsY1RyYW5zbGF0ZVhCeVZhbHVlKCk7XG4gICAgc3RhcnRJbnB1dC50cmFuc2xhdGVYID0gc3RhcnRJbnB1dC5fY2FsY1RyYW5zbGF0ZVhCeVZhbHVlKCk7XG5cbiAgICBlbmRJbnB1dC5fdXBkYXRlU3RhdGljU3R5bGVzKCk7XG4gICAgc3RhcnRJbnB1dC5fdXBkYXRlU3RhdGljU3R5bGVzKCk7XG5cbiAgICBlbmRJbnB1dC5fdXBkYXRlV2lkdGhJbmFjdGl2ZSgpO1xuICAgIHN0YXJ0SW5wdXQuX3VwZGF0ZVdpZHRoSW5hY3RpdmUoKTtcblxuICAgIGVuZElucHV0Ll91cGRhdGVUaHVtYlVJQnlWYWx1ZSgpO1xuICAgIHN0YXJ0SW5wdXQuX3VwZGF0ZVRodW1iVUlCeVZhbHVlKCk7XG4gIH1cblxuICBwcml2YXRlIF9vbkRpckNoYW5nZU5vblJhbmdlKCk6IHZvaWQge1xuICAgIGNvbnN0IGlucHV0ID0gdGhpcy5fZ2V0SW5wdXQoX01hdFRodW1iLkVORCkhO1xuICAgIGlucHV0Ll91cGRhdGVUaHVtYlVJQnlWYWx1ZSgpO1xuICB9XG5cbiAgLyoqIFN0YXJ0cyBvYnNlcnZpbmcgYW5kIHVwZGF0aW5nIHRoZSBzbGlkZXIgaWYgdGhlIGhvc3QgY2hhbmdlcyBpdHMgc2l6ZS4gKi9cbiAgcHJpdmF0ZSBfb2JzZXJ2ZUhvc3RSZXNpemUoKSB7XG4gICAgaWYgKHR5cGVvZiBSZXNpemVPYnNlcnZlciA9PT0gJ3VuZGVmaW5lZCcgfHwgIVJlc2l6ZU9ic2VydmVyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgIHRoaXMuX3Jlc2l6ZU9ic2VydmVyID0gbmV3IFJlc2l6ZU9ic2VydmVyKCgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuX2lzQWN0aXZlKCkpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuX3Jlc2l6ZVRpbWVyKSB7XG4gICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3Jlc2l6ZVRpbWVyKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9vblJlc2l6ZSgpO1xuICAgICAgfSk7XG4gICAgICB0aGlzLl9yZXNpemVPYnNlcnZlci5vYnNlcnZlKHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudCk7XG4gICAgfSk7XG4gIH1cblxuICAvKiogV2hldGhlciBhbnkgb2YgdGhlIHRodW1icyBhcmUgY3VycmVudGx5IGFjdGl2ZS4gKi9cbiAgcHJpdmF0ZSBfaXNBY3RpdmUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2dldFRodW1iKF9NYXRUaHVtYi5TVEFSVCkuX2lzQWN0aXZlIHx8IHRoaXMuX2dldFRodW1iKF9NYXRUaHVtYi5FTkQpLl9pc0FjdGl2ZTtcbiAgfVxuXG4gIHByaXZhdGUgX2dldFZhbHVlKHRodW1iUG9zaXRpb246IF9NYXRUaHVtYiA9IF9NYXRUaHVtYi5FTkQpOiBudW1iZXIge1xuICAgIGNvbnN0IGlucHV0ID0gdGhpcy5fZ2V0SW5wdXQodGh1bWJQb3NpdGlvbik7XG4gICAgaWYgKCFpbnB1dCkge1xuICAgICAgcmV0dXJuIHRoaXMubWluO1xuICAgIH1cbiAgICByZXR1cm4gaW5wdXQudmFsdWU7XG4gIH1cblxuICBwcml2YXRlIF9za2lwVXBkYXRlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhIShcbiAgICAgIHRoaXMuX2dldElucHV0KF9NYXRUaHVtYi5TVEFSVCk/Ll9za2lwVUlVcGRhdGUgfHwgdGhpcy5fZ2V0SW5wdXQoX01hdFRodW1iLkVORCk/Ll9za2lwVUlVcGRhdGVcbiAgICApO1xuICB9XG5cbiAgLyoqIFN0b3JlcyB0aGUgc2xpZGVyIGRpbWVuc2lvbnMuICovXG4gIF91cGRhdGVEaW1lbnNpb25zKCk6IHZvaWQge1xuICAgIHRoaXMuX2NhY2hlZFdpZHRoID0gdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50Lm9mZnNldFdpZHRoO1xuICAgIHRoaXMuX2NhY2hlZExlZnQgPSB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdDtcbiAgfVxuXG4gIC8qKiBTZXRzIHRoZSBzdHlsZXMgZm9yIHRoZSBhY3RpdmUgcG9ydGlvbiBvZiB0aGUgdHJhY2suICovXG4gIF9zZXRUcmFja0FjdGl2ZVN0eWxlcyhzdHlsZXM6IHtcbiAgICBsZWZ0OiBzdHJpbmc7XG4gICAgcmlnaHQ6IHN0cmluZztcbiAgICB0cmFuc2Zvcm06IHN0cmluZztcbiAgICB0cmFuc2Zvcm1PcmlnaW46IHN0cmluZztcbiAgfSk6IHZvaWQge1xuICAgIGNvbnN0IHRyYWNrU3R5bGUgPSB0aGlzLl90cmFja0FjdGl2ZS5uYXRpdmVFbGVtZW50LnN0eWxlO1xuICAgIGNvbnN0IGFuaW1hdGlvbk9yaWdpbkNoYW5nZWQgPVxuICAgICAgc3R5bGVzLmxlZnQgIT09IHRyYWNrU3R5bGUubGVmdCAmJiBzdHlsZXMucmlnaHQgIT09IHRyYWNrU3R5bGUucmlnaHQ7XG5cbiAgICB0cmFja1N0eWxlLmxlZnQgPSBzdHlsZXMubGVmdDtcbiAgICB0cmFja1N0eWxlLnJpZ2h0ID0gc3R5bGVzLnJpZ2h0O1xuICAgIHRyYWNrU3R5bGUudHJhbnNmb3JtT3JpZ2luID0gc3R5bGVzLnRyYW5zZm9ybU9yaWdpbjtcblxuICAgIGlmIChhbmltYXRpb25PcmlnaW5DaGFuZ2VkKSB7XG4gICAgICB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnbWF0LW1kYy1zbGlkZXItZGlzYWJsZS10cmFjay1hbmltYXRpb24nKTtcbiAgICAgIHRoaXMuX25nWm9uZS5vblN0YWJsZS5waXBlKHRha2UoMSkpLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdtYXQtbWRjLXNsaWRlci1kaXNhYmxlLXRyYWNrLWFuaW1hdGlvbicpO1xuICAgICAgICB0cmFja1N0eWxlLnRyYW5zZm9ybSA9IHN0eWxlcy50cmFuc2Zvcm07XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdHJhY2tTdHlsZS50cmFuc2Zvcm0gPSBzdHlsZXMudHJhbnNmb3JtO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBSZXR1cm5zIHRoZSB0cmFuc2xhdGVYIHBvc2l0aW9uaW5nIGZvciBhIHRpY2sgbWFyayBiYXNlZCBvbiBpdCdzIGluZGV4LiAqL1xuICBfY2FsY1RpY2tNYXJrVHJhbnNmb3JtKGluZGV4OiBudW1iZXIpOiBzdHJpbmcge1xuICAgIC8vIFRPRE8od2FnbmVybWFjaWVsKTogU2VlIGlmIHdlIGNhbiBhdm9pZCBkb2luZyB0aGlzIGFuZCBqdXN0IHVzaW5nIGZsZXggdG8gcG9zaXRpb24gdGhlc2UuXG4gICAgY29uc3QgdHJhbnNsYXRlWCA9IGluZGV4ICogKHRoaXMuX3RpY2tNYXJrVHJhY2tXaWR0aCAvICh0aGlzLl90aWNrTWFya3MubGVuZ3RoIC0gMSkpO1xuICAgIHJldHVybiBgdHJhbnNsYXRlWCgke3RyYW5zbGF0ZVh9cHhgO1xuICB9XG5cbiAgLy8gSGFuZGxlcnMgZm9yIHVwZGF0aW5nIHRoZSBzbGlkZXIgdWkuXG5cbiAgX29uVHJhbnNsYXRlWENoYW5nZShzb3VyY2U6IF9NYXRTbGlkZXJUaHVtYik6IHZvaWQge1xuICAgIGlmICghdGhpcy5faGFzVmlld0luaXRpYWxpemVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fdXBkYXRlVGh1bWJVSShzb3VyY2UpO1xuICAgIHRoaXMuX3VwZGF0ZVRyYWNrVUkoc291cmNlKTtcbiAgICB0aGlzLl91cGRhdGVPdmVybGFwcGluZ1RodW1iVUkoc291cmNlIGFzIF9NYXRTbGlkZXJSYW5nZVRodW1iKTtcbiAgfVxuXG4gIF9vblRyYW5zbGF0ZVhDaGFuZ2VCeVNpZGVFZmZlY3QoXG4gICAgaW5wdXQxOiBfTWF0U2xpZGVyUmFuZ2VUaHVtYixcbiAgICBpbnB1dDI6IF9NYXRTbGlkZXJSYW5nZVRodW1iLFxuICApOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX2hhc1ZpZXdJbml0aWFsaXplZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlucHV0MS5fdXBkYXRlVGh1bWJVSUJ5VmFsdWUoKTtcbiAgICBpbnB1dDIuX3VwZGF0ZVRodW1iVUlCeVZhbHVlKCk7XG4gIH1cblxuICBfb25WYWx1ZUNoYW5nZShzb3VyY2U6IF9NYXRTbGlkZXJUaHVtYik6IHZvaWQge1xuICAgIGlmICghdGhpcy5faGFzVmlld0luaXRpYWxpemVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fdXBkYXRlVmFsdWVJbmRpY2F0b3JVSShzb3VyY2UpO1xuICAgIHRoaXMuX3VwZGF0ZVRpY2tNYXJrVUkoKTtcbiAgICB0aGlzLl9jZHIuZGV0ZWN0Q2hhbmdlcygpO1xuICB9XG5cbiAgX29uTWluTWF4T3JTdGVwQ2hhbmdlKCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5faGFzVmlld0luaXRpYWxpemVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fdXBkYXRlVGlja01hcmtVSSgpO1xuICAgIHRoaXMuX3VwZGF0ZVRpY2tNYXJrVHJhY2tVSSgpO1xuICAgIHRoaXMuX2Nkci5tYXJrRm9yQ2hlY2soKTtcbiAgfVxuXG4gIF9vblJlc2l6ZSgpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX2hhc1ZpZXdJbml0aWFsaXplZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX3VwZGF0ZURpbWVuc2lvbnMoKTtcbiAgICBpZiAodGhpcy5faXNSYW5nZSkge1xuICAgICAgY29uc3QgZUlucHV0ID0gdGhpcy5fZ2V0SW5wdXQoX01hdFRodW1iLkVORCkgYXMgX01hdFNsaWRlclJhbmdlVGh1bWI7XG4gICAgICBjb25zdCBzSW5wdXQgPSB0aGlzLl9nZXRJbnB1dChfTWF0VGh1bWIuU1RBUlQpIGFzIF9NYXRTbGlkZXJSYW5nZVRodW1iO1xuXG4gICAgICBlSW5wdXQuX3VwZGF0ZVRodW1iVUlCeVZhbHVlKCk7XG4gICAgICBzSW5wdXQuX3VwZGF0ZVRodW1iVUlCeVZhbHVlKCk7XG5cbiAgICAgIGVJbnB1dC5fdXBkYXRlU3RhdGljU3R5bGVzKCk7XG4gICAgICBzSW5wdXQuX3VwZGF0ZVN0YXRpY1N0eWxlcygpO1xuXG4gICAgICBlSW5wdXQuX3VwZGF0ZU1pbk1heCgpO1xuICAgICAgc0lucHV0Ll91cGRhdGVNaW5NYXgoKTtcblxuICAgICAgZUlucHV0Ll91cGRhdGVXaWR0aEluYWN0aXZlKCk7XG4gICAgICBzSW5wdXQuX3VwZGF0ZVdpZHRoSW5hY3RpdmUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgZUlucHV0ID0gdGhpcy5fZ2V0SW5wdXQoX01hdFRodW1iLkVORCk7XG4gICAgICBpZiAoZUlucHV0KSB7XG4gICAgICAgIGVJbnB1dC5fdXBkYXRlVGh1bWJVSUJ5VmFsdWUoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLl91cGRhdGVUaWNrTWFya1VJKCk7XG4gICAgdGhpcy5fdXBkYXRlVGlja01hcmtUcmFja1VJKCk7XG4gICAgdGhpcy5fY2RyLmRldGVjdENoYW5nZXMoKTtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIG9yIG5vdCB0aGUgc2xpZGVyIHRodW1icyBvdmVybGFwLiAqL1xuICBwcml2YXRlIF90aHVtYnNPdmVybGFwOiBib29sZWFuID0gZmFsc2U7XG5cbiAgLyoqIFJldHVybnMgdHJ1ZSBpZiB0aGUgc2xpZGVyIGtub2JzIGFyZSBvdmVybGFwcGluZyBvbmUgYW5vdGhlci4gKi9cbiAgcHJpdmF0ZSBfYXJlVGh1bWJzT3ZlcmxhcHBpbmcoKTogYm9vbGVhbiB7XG4gICAgY29uc3Qgc3RhcnRJbnB1dCA9IHRoaXMuX2dldElucHV0KF9NYXRUaHVtYi5TVEFSVCk7XG4gICAgY29uc3QgZW5kSW5wdXQgPSB0aGlzLl9nZXRJbnB1dChfTWF0VGh1bWIuRU5EKTtcbiAgICBpZiAoIXN0YXJ0SW5wdXQgfHwgIWVuZElucHV0KSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBlbmRJbnB1dC50cmFuc2xhdGVYIC0gc3RhcnRJbnB1dC50cmFuc2xhdGVYIDwgMjA7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyB0aGUgY2xhc3MgbmFtZXMgb2Ygb3ZlcmxhcHBpbmcgc2xpZGVyIHRodW1icyBzb1xuICAgKiB0aGF0IHRoZSBjdXJyZW50IGFjdGl2ZSB0aHVtYiBpcyBzdHlsZWQgdG8gYmUgb24gXCJ0b3BcIi5cbiAgICovXG4gIHByaXZhdGUgX3VwZGF0ZU92ZXJsYXBwaW5nVGh1bWJDbGFzc05hbWVzKHNvdXJjZTogX01hdFNsaWRlclJhbmdlVGh1bWIpOiB2b2lkIHtcbiAgICBjb25zdCBzaWJsaW5nID0gc291cmNlLmdldFNpYmxpbmcoKSE7XG4gICAgY29uc3Qgc291cmNlVGh1bWIgPSB0aGlzLl9nZXRUaHVtYihzb3VyY2UudGh1bWJQb3NpdGlvbik7XG4gICAgY29uc3Qgc2libGluZ1RodW1iID0gdGhpcy5fZ2V0VGh1bWIoc2libGluZy50aHVtYlBvc2l0aW9uKTtcbiAgICBzaWJsaW5nVGh1bWIuX2hvc3RFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ21kYy1zbGlkZXJfX3RodW1iLS10b3AnKTtcbiAgICBzb3VyY2VUaHVtYi5faG9zdEVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZSgnbWRjLXNsaWRlcl9fdGh1bWItLXRvcCcsIHRoaXMuX3RodW1ic092ZXJsYXApO1xuICB9XG5cbiAgLyoqIFVwZGF0ZXMgdGhlIFVJIG9mIHNsaWRlciB0aHVtYnMgd2hlbiB0aGV5IGJlZ2luIG9yIHN0b3Agb3ZlcmxhcHBpbmcuICovXG4gIHByaXZhdGUgX3VwZGF0ZU92ZXJsYXBwaW5nVGh1bWJVSShzb3VyY2U6IF9NYXRTbGlkZXJSYW5nZVRodW1iKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLl9pc1JhbmdlIHx8IHRoaXMuX3NraXBVcGRhdGUoKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAodGhpcy5fdGh1bWJzT3ZlcmxhcCAhPT0gdGhpcy5fYXJlVGh1bWJzT3ZlcmxhcHBpbmcoKSkge1xuICAgICAgdGhpcy5fdGh1bWJzT3ZlcmxhcCA9ICF0aGlzLl90aHVtYnNPdmVybGFwO1xuICAgICAgdGhpcy5fdXBkYXRlT3ZlcmxhcHBpbmdUaHVtYkNsYXNzTmFtZXMoc291cmNlKTtcbiAgICB9XG4gIH1cblxuICAvLyBfTWF0VGh1bWIgc3R5bGVzIHVwZGF0ZSBjb25kaXRpb25zXG4gIC8vXG4gIC8vIDEuIFRyYW5zbGF0ZVgsIHJlc2l6ZSwgb3IgZGlyIGNoYW5nZVxuICAvLyAgICAtIFJlYXNvbjogVGhlIHRodW1iIHN0eWxlcyBuZWVkIHRvIGJlIHVwZGF0ZWQgYWNjb3JkaW5nIHRvIHRoZSBuZXcgdHJhbnNsYXRlWC5cbiAgLy8gMi4gTWluLCBtYXgsIG9yIHN0ZXBcbiAgLy8gICAgLSBSZWFzb246IFRoZSB2YWx1ZSBtYXkgaGF2ZSBzaWxlbnRseSBjaGFuZ2VkLlxuXG4gIC8qKiBVcGRhdGVzIHRoZSB0cmFuc2xhdGVYIG9mIHRoZSBnaXZlbiB0aHVtYi4gKi9cbiAgX3VwZGF0ZVRodW1iVUkoc291cmNlOiBfTWF0U2xpZGVyVGh1bWIpIHtcbiAgICBpZiAodGhpcy5fc2tpcFVwZGF0ZSgpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHRodW1iID0gdGhpcy5fZ2V0VGh1bWIoXG4gICAgICBzb3VyY2UudGh1bWJQb3NpdGlvbiA9PT0gX01hdFRodW1iLkVORCA/IF9NYXRUaHVtYi5FTkQgOiBfTWF0VGh1bWIuU1RBUlQsXG4gICAgKSE7XG4gICAgdGh1bWIuX2hvc3RFbGVtZW50LnN0eWxlLnRyYW5zZm9ybSA9IGB0cmFuc2xhdGVYKCR7c291cmNlLnRyYW5zbGF0ZVh9cHgpYDtcbiAgfVxuXG4gIC8vIFZhbHVlIGluZGljYXRvciB0ZXh0IHVwZGF0ZSBjb25kaXRpb25zXG4gIC8vXG4gIC8vIDEuIFZhbHVlXG4gIC8vICAgIC0gUmVhc29uOiBUaGUgdmFsdWUgZGlzcGxheWVkIG5lZWRzIHRvIGJlIHVwZGF0ZWQuXG4gIC8vIDIuIE1pbiwgbWF4LCBvciBzdGVwXG4gIC8vICAgIC0gUmVhc29uOiBUaGUgdmFsdWUgbWF5IGhhdmUgc2lsZW50bHkgY2hhbmdlZC5cblxuICAvKiogVXBkYXRlcyB0aGUgdmFsdWUgaW5kaWNhdG9yIHRvb2x0aXAgdWkgZm9yIHRoZSBnaXZlbiB0aHVtYi4gKi9cbiAgX3VwZGF0ZVZhbHVlSW5kaWNhdG9yVUkoc291cmNlOiBfTWF0U2xpZGVyVGh1bWIpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fc2tpcFVwZGF0ZSgpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgdmFsdWV0ZXh0ID0gdGhpcy5kaXNwbGF5V2l0aChzb3VyY2UudmFsdWUpO1xuXG4gICAgdGhpcy5faGFzVmlld0luaXRpYWxpemVkXG4gICAgICA/IChzb3VyY2UuX3ZhbHVldGV4dCA9IHZhbHVldGV4dClcbiAgICAgIDogc291cmNlLl9ob3N0RWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2FyaWEtdmFsdWV0ZXh0JywgdmFsdWV0ZXh0KTtcblxuICAgIGlmICh0aGlzLmRpc2NyZXRlKSB7XG4gICAgICBzb3VyY2UudGh1bWJQb3NpdGlvbiA9PT0gX01hdFRodW1iLlNUQVJUXG4gICAgICAgID8gKHRoaXMuc3RhcnRWYWx1ZUluZGljYXRvclRleHQgPSB2YWx1ZXRleHQpXG4gICAgICAgIDogKHRoaXMuZW5kVmFsdWVJbmRpY2F0b3JUZXh0ID0gdmFsdWV0ZXh0KTtcblxuICAgICAgY29uc3QgdmlzdWFsVGh1bWIgPSB0aGlzLl9nZXRUaHVtYihzb3VyY2UudGh1bWJQb3NpdGlvbik7XG4gICAgICB2YWx1ZXRleHQubGVuZ3RoIDwgM1xuICAgICAgICA/IHZpc3VhbFRodW1iLl9ob3N0RWxlbWVudC5jbGFzc0xpc3QuYWRkKCdtZGMtc2xpZGVyX190aHVtYi0tc2hvcnQtdmFsdWUnKVxuICAgICAgICA6IHZpc3VhbFRodW1iLl9ob3N0RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdtZGMtc2xpZGVyX190aHVtYi0tc2hvcnQtdmFsdWUnKTtcbiAgICB9XG4gIH1cblxuICAvKiogVXBkYXRlcyBhbGwgdmFsdWUgaW5kaWNhdG9yIFVJcyBpbiB0aGUgc2xpZGVyLiAqL1xuICBwcml2YXRlIF91cGRhdGVWYWx1ZUluZGljYXRvclVJcygpOiB2b2lkIHtcbiAgICBjb25zdCBlSW5wdXQgPSB0aGlzLl9nZXRJbnB1dChfTWF0VGh1bWIuRU5EKTtcbiAgICBjb25zdCBzSW5wdXQgPSB0aGlzLl9nZXRJbnB1dChfTWF0VGh1bWIuU1RBUlQpO1xuXG4gICAgaWYgKGVJbnB1dCkge1xuICAgICAgdGhpcy5fdXBkYXRlVmFsdWVJbmRpY2F0b3JVSShlSW5wdXQpO1xuICAgIH1cbiAgICBpZiAoc0lucHV0KSB7XG4gICAgICB0aGlzLl91cGRhdGVWYWx1ZUluZGljYXRvclVJKHNJbnB1dCk7XG4gICAgfVxuICB9XG5cbiAgLy8gVXBkYXRlIFRpY2sgTWFyayBUcmFjayBXaWR0aFxuICAvL1xuICAvLyAxLiBNaW4sIG1heCwgb3Igc3RlcFxuICAvLyAgICAtIFJlYXNvbjogVGhlIG1heGltdW0gcmVhY2hhYmxlIHZhbHVlIG1heSBoYXZlIGNoYW5nZWQuXG4gIC8vICAgIC0gU2lkZSBub3RlOiBUaGUgbWF4aW11bSByZWFjaGFibGUgdmFsdWUgaXMgZGlmZmVyZW50IGZyb20gdGhlIG1heGltdW0gdmFsdWUgc2V0IGJ5IHRoZVxuICAvLyAgICAgIHVzZXIuIEZvciBleGFtcGxlLCBhIHNsaWRlciB3aXRoIFttaW46IDUsIG1heDogMTAwLCBzdGVwOiAxMF0gd291bGQgaGF2ZSBhIG1heGltdW1cbiAgLy8gICAgICByZWFjaGFibGUgdmFsdWUgb2YgOTUuXG4gIC8vIDIuIFJlc2l6ZVxuICAvLyAgICAtIFJlYXNvbjogVGhlIHBvc2l0aW9uIGZvciB0aGUgbWF4aW11bSByZWFjaGFibGUgdmFsdWUgbmVlZHMgdG8gYmUgcmVjYWxjdWxhdGVkLlxuXG4gIC8qKiBVcGRhdGVzIHRoZSB3aWR0aCBvZiB0aGUgdGljayBtYXJrIHRyYWNrLiAqL1xuICBwcml2YXRlIF91cGRhdGVUaWNrTWFya1RyYWNrVUkoKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLnNob3dUaWNrTWFya3MgfHwgdGhpcy5fc2tpcFVwZGF0ZSgpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgc3RlcCA9IHRoaXMuX3N0ZXAgJiYgdGhpcy5fc3RlcCA+IDAgPyB0aGlzLl9zdGVwIDogMTtcbiAgICBjb25zdCBtYXhWYWx1ZSA9IE1hdGguZmxvb3IodGhpcy5tYXggLyBzdGVwKSAqIHN0ZXA7XG4gICAgY29uc3QgcGVyY2VudGFnZSA9IChtYXhWYWx1ZSAtIHRoaXMubWluKSAvICh0aGlzLm1heCAtIHRoaXMubWluKTtcbiAgICB0aGlzLl90aWNrTWFya1RyYWNrV2lkdGggPSB0aGlzLl9jYWNoZWRXaWR0aCAqIHBlcmNlbnRhZ2UgLSA2O1xuICB9XG5cbiAgLy8gVHJhY2sgYWN0aXZlIHVwZGF0ZSBjb25kaXRpb25zXG4gIC8vXG4gIC8vIDEuIFRyYW5zbGF0ZVhcbiAgLy8gICAgLSBSZWFzb246IFRoZSB0cmFjayBhY3RpdmUgc2hvdWxkIGxpbmUgdXAgd2l0aCB0aGUgbmV3IHRodW1iIHBvc2l0aW9uLlxuICAvLyAyLiBNaW4gb3IgbWF4XG4gIC8vICAgIC0gUmVhc29uICMxOiBUaGUgJ2FjdGl2ZScgcGVyY2VudGFnZSBuZWVkcyB0byBiZSByZWNhbGN1bGF0ZWQuXG4gIC8vICAgIC0gUmVhc29uICMyOiBUaGUgdmFsdWUgbWF5IGhhdmUgc2lsZW50bHkgY2hhbmdlZC5cbiAgLy8gMy4gU3RlcFxuICAvLyAgICAtIFJlYXNvbjogVGhlIHZhbHVlIG1heSBoYXZlIHNpbGVudGx5IGNoYW5nZWQgY2F1c2luZyB0aGUgdGh1bWIocykgdG8gc2hpZnQuXG4gIC8vIDQuIERpciBjaGFuZ2VcbiAgLy8gICAgLSBSZWFzb246IFRoZSB0cmFjayBhY3RpdmUgd2lsbCBuZWVkIHRvIGJlIHVwZGF0ZWQgYWNjb3JkaW5nIHRvIHRoZSBuZXcgdGh1bWIgcG9zaXRpb24ocykuXG4gIC8vIDUuIFJlc2l6ZVxuICAvLyAgICAtIFJlYXNvbjogVGhlIHRvdGFsIHdpZHRoIHRoZSAnYWN0aXZlJyB0cmFja3MgdHJhbnNsYXRlWCBpcyBiYXNlZCBvbiBoYXMgY2hhbmdlZC5cblxuICAvKiogVXBkYXRlcyB0aGUgc2NhbGUgb24gdGhlIGFjdGl2ZSBwb3J0aW9uIG9mIHRoZSB0cmFjay4gKi9cbiAgX3VwZGF0ZVRyYWNrVUkoc291cmNlOiBfTWF0U2xpZGVyVGh1bWIpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fc2tpcFVwZGF0ZSgpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5faXNSYW5nZVxuICAgICAgPyB0aGlzLl91cGRhdGVUcmFja1VJUmFuZ2Uoc291cmNlIGFzIF9NYXRTbGlkZXJSYW5nZVRodW1iKVxuICAgICAgOiB0aGlzLl91cGRhdGVUcmFja1VJTm9uUmFuZ2Uoc291cmNlIGFzIF9NYXRTbGlkZXJUaHVtYik7XG4gIH1cblxuICBwcml2YXRlIF91cGRhdGVUcmFja1VJUmFuZ2Uoc291cmNlOiBfTWF0U2xpZGVyUmFuZ2VUaHVtYik6IHZvaWQge1xuICAgIGNvbnN0IHNpYmxpbmcgPSBzb3VyY2UuZ2V0U2libGluZygpO1xuICAgIGlmICghc2libGluZyB8fCAhdGhpcy5fY2FjaGVkV2lkdGgpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBhY3RpdmVQZXJjZW50YWdlID0gTWF0aC5hYnMoc2libGluZy50cmFuc2xhdGVYIC0gc291cmNlLnRyYW5zbGF0ZVgpIC8gdGhpcy5fY2FjaGVkV2lkdGg7XG5cbiAgICBpZiAoc291cmNlLl9pc0xlZnRUaHVtYiAmJiB0aGlzLl9jYWNoZWRXaWR0aCkge1xuICAgICAgdGhpcy5fc2V0VHJhY2tBY3RpdmVTdHlsZXMoe1xuICAgICAgICBsZWZ0OiAnYXV0bycsXG4gICAgICAgIHJpZ2h0OiBgJHt0aGlzLl9jYWNoZWRXaWR0aCAtIHNpYmxpbmcudHJhbnNsYXRlWH1weGAsXG4gICAgICAgIHRyYW5zZm9ybU9yaWdpbjogJ3JpZ2h0JyxcbiAgICAgICAgdHJhbnNmb3JtOiBgc2NhbGVYKCR7YWN0aXZlUGVyY2VudGFnZX0pYCxcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9zZXRUcmFja0FjdGl2ZVN0eWxlcyh7XG4gICAgICAgIGxlZnQ6IGAke3NpYmxpbmcudHJhbnNsYXRlWH1weGAsXG4gICAgICAgIHJpZ2h0OiAnYXV0bycsXG4gICAgICAgIHRyYW5zZm9ybU9yaWdpbjogJ2xlZnQnLFxuICAgICAgICB0cmFuc2Zvcm06IGBzY2FsZVgoJHthY3RpdmVQZXJjZW50YWdlfSlgLFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfdXBkYXRlVHJhY2tVSU5vblJhbmdlKHNvdXJjZTogX01hdFNsaWRlclRodW1iKTogdm9pZCB7XG4gICAgdGhpcy5faXNSdGxcbiAgICAgID8gdGhpcy5fc2V0VHJhY2tBY3RpdmVTdHlsZXMoe1xuICAgICAgICAgIGxlZnQ6ICdhdXRvJyxcbiAgICAgICAgICByaWdodDogJzBweCcsXG4gICAgICAgICAgdHJhbnNmb3JtT3JpZ2luOiAncmlnaHQnLFxuICAgICAgICAgIHRyYW5zZm9ybTogYHNjYWxlWCgkezEgLSBzb3VyY2UuZmlsbFBlcmNlbnRhZ2V9KWAsXG4gICAgICAgIH0pXG4gICAgICA6IHRoaXMuX3NldFRyYWNrQWN0aXZlU3R5bGVzKHtcbiAgICAgICAgICBsZWZ0OiAnMHB4JyxcbiAgICAgICAgICByaWdodDogJ2F1dG8nLFxuICAgICAgICAgIHRyYW5zZm9ybU9yaWdpbjogJ2xlZnQnLFxuICAgICAgICAgIHRyYW5zZm9ybTogYHNjYWxlWCgke3NvdXJjZS5maWxsUGVyY2VudGFnZX0pYCxcbiAgICAgICAgfSk7XG4gIH1cblxuICAvLyBUaWNrIG1hcmsgdXBkYXRlIGNvbmRpdGlvbnNcbiAgLy9cbiAgLy8gMS4gVmFsdWVcbiAgLy8gICAgLSBSZWFzb246IGEgdGljayBtYXJrIHdoaWNoIHdhcyBvbmNlIGFjdGl2ZSBtaWdodCBub3cgYmUgaW5hY3RpdmUgb3IgdmljZSB2ZXJzYS5cbiAgLy8gMi4gTWluLCBtYXgsIG9yIHN0ZXBcbiAgLy8gICAgLSBSZWFzb24gIzE6IHRoZSBudW1iZXIgb2YgdGljayBtYXJrcyBtYXkgaGF2ZSBjaGFuZ2VkLlxuICAvLyAgICAtIFJlYXNvbiAjMjogVGhlIHZhbHVlIG1heSBoYXZlIHNpbGVudGx5IGNoYW5nZWQuXG5cbiAgLyoqIFVwZGF0ZXMgdGhlIGRvdHMgYWxvbmcgdGhlIHNsaWRlciB0cmFjay4gKi9cbiAgX3VwZGF0ZVRpY2tNYXJrVUkoKTogdm9pZCB7XG4gICAgaWYgKFxuICAgICAgIXRoaXMuc2hvd1RpY2tNYXJrcyB8fFxuICAgICAgdGhpcy5zdGVwID09PSB1bmRlZmluZWQgfHxcbiAgICAgIHRoaXMubWluID09PSB1bmRlZmluZWQgfHxcbiAgICAgIHRoaXMubWF4ID09PSB1bmRlZmluZWRcbiAgICApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3Qgc3RlcCA9IHRoaXMuc3RlcCA+IDAgPyB0aGlzLnN0ZXAgOiAxO1xuICAgIHRoaXMuX2lzUmFuZ2UgPyB0aGlzLl91cGRhdGVUaWNrTWFya1VJUmFuZ2Uoc3RlcCkgOiB0aGlzLl91cGRhdGVUaWNrTWFya1VJTm9uUmFuZ2Uoc3RlcCk7XG5cbiAgICBpZiAodGhpcy5faXNSdGwpIHtcbiAgICAgIHRoaXMuX3RpY2tNYXJrcy5yZXZlcnNlKCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfdXBkYXRlVGlja01hcmtVSU5vblJhbmdlKHN0ZXA6IG51bWJlcik6IHZvaWQge1xuICAgIGNvbnN0IHZhbHVlID0gdGhpcy5fZ2V0VmFsdWUoKTtcbiAgICBsZXQgbnVtQWN0aXZlID0gTWF0aC5tYXgoTWF0aC5yb3VuZCgodmFsdWUgLSB0aGlzLm1pbikgLyBzdGVwKSwgMCk7XG4gICAgbGV0IG51bUluYWN0aXZlID0gTWF0aC5tYXgoTWF0aC5yb3VuZCgodGhpcy5tYXggLSB2YWx1ZSkgLyBzdGVwKSwgMCk7XG4gICAgdGhpcy5faXNSdGwgPyBudW1BY3RpdmUrKyA6IG51bUluYWN0aXZlKys7XG5cbiAgICB0aGlzLl90aWNrTWFya3MgPSBBcnJheShudW1BY3RpdmUpXG4gICAgICAuZmlsbChfTWF0VGlja01hcmsuQUNUSVZFKVxuICAgICAgLmNvbmNhdChBcnJheShudW1JbmFjdGl2ZSkuZmlsbChfTWF0VGlja01hcmsuSU5BQ1RJVkUpKTtcbiAgfVxuXG4gIHByaXZhdGUgX3VwZGF0ZVRpY2tNYXJrVUlSYW5nZShzdGVwOiBudW1iZXIpOiB2b2lkIHtcbiAgICBjb25zdCBlbmRWYWx1ZSA9IHRoaXMuX2dldFZhbHVlKCk7XG4gICAgY29uc3Qgc3RhcnRWYWx1ZSA9IHRoaXMuX2dldFZhbHVlKF9NYXRUaHVtYi5TVEFSVCk7XG4gICAgY29uc3QgbnVtSW5hY3RpdmVCZWZvcmVTdGFydFRodW1iID0gTWF0aC5tYXgoTWF0aC5mbG9vcigoc3RhcnRWYWx1ZSAtIHRoaXMubWluKSAvIHN0ZXApLCAwKTtcbiAgICBjb25zdCBudW1BY3RpdmUgPSBNYXRoLm1heChNYXRoLmZsb29yKChlbmRWYWx1ZSAtIHN0YXJ0VmFsdWUpIC8gc3RlcCkgKyAxLCAwKTtcbiAgICBjb25zdCBudW1JbmFjdGl2ZUFmdGVyRW5kVGh1bWIgPSBNYXRoLm1heChNYXRoLmZsb29yKCh0aGlzLm1heCAtIGVuZFZhbHVlKSAvIHN0ZXApLCAwKTtcbiAgICB0aGlzLl90aWNrTWFya3MgPSBBcnJheShudW1JbmFjdGl2ZUJlZm9yZVN0YXJ0VGh1bWIpXG4gICAgICAuZmlsbChfTWF0VGlja01hcmsuSU5BQ1RJVkUpXG4gICAgICAuY29uY2F0KFxuICAgICAgICBBcnJheShudW1BY3RpdmUpLmZpbGwoX01hdFRpY2tNYXJrLkFDVElWRSksXG4gICAgICAgIEFycmF5KG51bUluYWN0aXZlQWZ0ZXJFbmRUaHVtYikuZmlsbChfTWF0VGlja01hcmsuSU5BQ1RJVkUpLFxuICAgICAgKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBzbGlkZXIgdGh1bWIgaW5wdXQgb2YgdGhlIGdpdmVuIHRodW1iIHBvc2l0aW9uLiAqL1xuICBfZ2V0SW5wdXQodGh1bWJQb3NpdGlvbjogX01hdFRodW1iKTogX01hdFNsaWRlclRodW1iIHwgX01hdFNsaWRlclJhbmdlVGh1bWIgfCB1bmRlZmluZWQge1xuICAgIGlmICh0aHVtYlBvc2l0aW9uID09PSBfTWF0VGh1bWIuRU5EICYmIHRoaXMuX2lucHV0KSB7XG4gICAgICByZXR1cm4gdGhpcy5faW5wdXQ7XG4gICAgfVxuICAgIGlmICh0aGlzLl9pbnB1dHM/Lmxlbmd0aCkge1xuICAgICAgcmV0dXJuIHRodW1iUG9zaXRpb24gPT09IF9NYXRUaHVtYi5TVEFSVCA/IHRoaXMuX2lucHV0cy5maXJzdCA6IHRoaXMuX2lucHV0cy5sYXN0O1xuICAgIH1cbiAgICByZXR1cm47XG4gIH1cblxuICAvKiogR2V0cyB0aGUgc2xpZGVyIHRodW1iIEhUTUwgaW5wdXQgZWxlbWVudCBvZiB0aGUgZ2l2ZW4gdGh1bWIgcG9zaXRpb24uICovXG4gIF9nZXRUaHVtYih0aHVtYlBvc2l0aW9uOiBfTWF0VGh1bWIpOiBfTWF0U2xpZGVyVmlzdWFsVGh1bWIge1xuICAgIHJldHVybiB0aHVtYlBvc2l0aW9uID09PSBfTWF0VGh1bWIuRU5EID8gdGhpcy5fdGh1bWJzPy5sYXN0ISA6IHRoaXMuX3RodW1icz8uZmlyc3QhO1xuICB9XG5cbiAgX3NldFRyYW5zaXRpb24od2l0aEFuaW1hdGlvbjogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuX2hhc0FuaW1hdGlvbiA9IHdpdGhBbmltYXRpb24gJiYgIXRoaXMuX25vb3BBbmltYXRpb25zO1xuICAgIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKFxuICAgICAgJ21hdC1tZGMtc2xpZGVyLXdpdGgtYW5pbWF0aW9uJyxcbiAgICAgIHRoaXMuX2hhc0FuaW1hdGlvbixcbiAgICApO1xuICB9XG59XG5cbi8qKiBFbnN1cmVzIHRoYXQgdGhlcmUgaXMgbm90IGFuIGludmFsaWQgY29uZmlndXJhdGlvbiBmb3IgdGhlIHNsaWRlciB0aHVtYiBpbnB1dHMuICovXG5mdW5jdGlvbiBfdmFsaWRhdGVJbnB1dHMoXG4gIGlzUmFuZ2U6IGJvb2xlYW4sXG4gIGVuZElucHV0RWxlbWVudDogX01hdFNsaWRlclRodW1iIHwgX01hdFNsaWRlclJhbmdlVGh1bWIsXG4gIHN0YXJ0SW5wdXRFbGVtZW50PzogX01hdFNsaWRlclRodW1iLFxuKTogdm9pZCB7XG4gIGNvbnN0IHN0YXJ0VmFsaWQgPVxuICAgICFpc1JhbmdlIHx8IHN0YXJ0SW5wdXRFbGVtZW50Py5faG9zdEVsZW1lbnQuaGFzQXR0cmlidXRlKCdtYXRTbGlkZXJTdGFydFRodW1iJyk7XG4gIGNvbnN0IGVuZFZhbGlkID0gZW5kSW5wdXRFbGVtZW50Ll9ob3N0RWxlbWVudC5oYXNBdHRyaWJ1dGUoXG4gICAgaXNSYW5nZSA/ICdtYXRTbGlkZXJFbmRUaHVtYicgOiAnbWF0U2xpZGVyVGh1bWInLFxuICApO1xuXG4gIGlmICghc3RhcnRWYWxpZCB8fCAhZW5kVmFsaWQpIHtcbiAgICBfdGhyb3dJbnZhbGlkSW5wdXRDb25maWd1cmF0aW9uRXJyb3IoKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBfdGhyb3dJbnZhbGlkSW5wdXRDb25maWd1cmF0aW9uRXJyb3IoKTogdm9pZCB7XG4gIHRocm93IEVycm9yKGBJbnZhbGlkIHNsaWRlciB0aHVtYiBpbnB1dCBjb25maWd1cmF0aW9uIVxuXG4gICBWYWxpZCBjb25maWd1cmF0aW9ucyBhcmUgYXMgZm9sbG93czpcblxuICAgICA8bWF0LXNsaWRlcj5cbiAgICAgICA8aW5wdXQgbWF0U2xpZGVyVGh1bWI+XG4gICAgIDwvbWF0LXNsaWRlcj5cblxuICAgICBvclxuXG4gICAgIDxtYXQtc2xpZGVyPlxuICAgICAgIDxpbnB1dCBtYXRTbGlkZXJTdGFydFRodW1iPlxuICAgICAgIDxpbnB1dCBtYXRTbGlkZXJFbmRUaHVtYj5cbiAgICAgPC9tYXQtc2xpZGVyPlxuICAgYCk7XG59XG4iLCI8IS0tIElucHV0cyAtLT5cbjxuZy1jb250ZW50PjwvbmctY29udGVudD5cblxuPCEtLSBUcmFjayAtLT5cbjxkaXYgY2xhc3M9XCJtZGMtc2xpZGVyX190cmFja1wiPlxuICA8ZGl2IGNsYXNzPVwibWRjLXNsaWRlcl9fdHJhY2stLWluYWN0aXZlXCI+PC9kaXY+XG4gIDxkaXYgY2xhc3M9XCJtZGMtc2xpZGVyX190cmFjay0tYWN0aXZlXCI+XG4gICAgPGRpdiAjdHJhY2tBY3RpdmUgY2xhc3M9XCJtZGMtc2xpZGVyX190cmFjay0tYWN0aXZlX2ZpbGxcIj48L2Rpdj5cbiAgPC9kaXY+XG4gIDxkaXYgKm5nSWY9XCJzaG93VGlja01hcmtzXCIgY2xhc3M9XCJtZGMtc2xpZGVyX190aWNrLW1hcmtzXCIgI3RpY2tNYXJrQ29udGFpbmVyPlxuICAgIDxuZy1jb250YWluZXIgKm5nSWY9XCJfY2FjaGVkV2lkdGhcIj5cbiAgICAgICAgPGRpdlxuICAgICAgICAgICpuZ0Zvcj1cImxldCB0aWNrTWFyayBvZiBfdGlja01hcmtzOyBsZXQgaSA9IGluZGV4XCJcbiAgICAgICAgICBbY2xhc3NdPVwidGlja01hcmsgPT09IDAgPyAnbWRjLXNsaWRlcl9fdGljay1tYXJrLS1hY3RpdmUnIDogJ21kYy1zbGlkZXJfX3RpY2stbWFyay0taW5hY3RpdmUnXCJcbiAgICAgICAgICBbc3R5bGUudHJhbnNmb3JtXT1cIl9jYWxjVGlja01hcmtUcmFuc2Zvcm0oaSlcIj48L2Rpdj5cbiAgICA8L25nLWNvbnRhaW5lcj5cbiAgPC9kaXY+XG48L2Rpdj5cblxuPCEtLSBUaHVtYnMgLS0+XG48bWF0LXNsaWRlci12aXN1YWwtdGh1bWJcbiAgKm5nSWY9XCJfaXNSYW5nZVwiXG4gIFtkaXNjcmV0ZV09XCJkaXNjcmV0ZVwiXG4gIFt0aHVtYlBvc2l0aW9uXT1cIjFcIlxuICBbdmFsdWVJbmRpY2F0b3JUZXh0XT1cInN0YXJ0VmFsdWVJbmRpY2F0b3JUZXh0XCI+XG48L21hdC1zbGlkZXItdmlzdWFsLXRodW1iPlxuXG48bWF0LXNsaWRlci12aXN1YWwtdGh1bWJcbiAgW2Rpc2NyZXRlXT1cImRpc2NyZXRlXCJcbiAgW3RodW1iUG9zaXRpb25dPVwiMlwiXG4gIFt2YWx1ZUluZGljYXRvclRleHRdPVwiZW5kVmFsdWVJbmRpY2F0b3JUZXh0XCI+XG48L21hdC1zbGlkZXItdmlzdWFsLXRodW1iPlxuIl19