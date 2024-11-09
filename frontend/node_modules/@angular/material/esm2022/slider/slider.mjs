/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directionality } from '@angular/cdk/bidi';
import { Platform } from '@angular/cdk/platform';
import { booleanAttribute, ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChild, ContentChildren, ElementRef, inject, Inject, Input, NgZone, numberAttribute, Optional, QueryList, ViewChild, ViewChildren, ViewEncapsulation, ANIMATION_MODULE_TYPE, } from '@angular/core';
import { MAT_RIPPLE_GLOBAL_OPTIONS } from '@angular/material/core';
import { _MatThumb, _MatTickMark, MAT_SLIDER_RANGE_THUMB, MAT_SLIDER_THUMB, MAT_SLIDER, MAT_SLIDER_VISUAL_THUMB, } from './slider-interface';
import { MatSliderVisualThumb } from './slider-thumb';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/bidi";
// TODO(wagnermaciel): maybe handle the following edge case:
// 1. start dragging discrete slider
// 2. tab to disable checkbox
// 3. without ending drag, disable the slider
/**
 * Allows users to select from a range of values by moving the slider thumb. It is similar in
 * behavior to the native `<input type="range">` element.
 */
export class MatSlider {
    /** Whether the slider is disabled. */
    get disabled() {
        return this._disabled;
    }
    set disabled(v) {
        this._disabled = v;
        const endInput = this._getInput(_MatThumb.END);
        const startInput = this._getInput(_MatThumb.START);
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
        this._discrete = v;
        this._updateValueIndicatorUIs();
    }
    /** The minimum value that the slider can have. */
    get min() {
        return this._min;
    }
    set min(v) {
        const min = isNaN(v) ? this._min : v;
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
        const endInput = this._getInput(_MatThumb.END);
        const startInput = this._getInput(_MatThumb.START);
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
        const input = this._getInput(_MatThumb.END);
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
        const max = isNaN(v) ? this._max : v;
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
        const endInput = this._getInput(_MatThumb.END);
        const startInput = this._getInput(_MatThumb.START);
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
        const input = this._getInput(_MatThumb.END);
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
        const step = isNaN(v) ? this._step : v;
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
        const endInput = this._getInput(_MatThumb.END);
        const startInput = this._getInput(_MatThumb.START);
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
        const input = this._getInput(_MatThumb.END);
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
    constructor(_ngZone, _cdr, _elementRef, _dir, _globalRippleOptions, animationMode) {
        this._ngZone = _ngZone;
        this._cdr = _cdr;
        this._elementRef = _elementRef;
        this._dir = _dir;
        this._globalRippleOptions = _globalRippleOptions;
        this._disabled = false;
        this._discrete = false;
        /** Whether the slider displays tick marks along the slider track. */
        this.showTickMarks = false;
        this._min = 0;
        /** Whether ripples are disabled in the slider. */
        this.disableRipple = false;
        this._max = 100;
        this._step = 1;
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
        this._platform = inject(Platform);
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
        const eInput = this._getInput(_MatThumb.END);
        const sInput = this._getInput(_MatThumb.START);
        this._isRange = !!eInput && !!sInput;
        this._cdr.detectChanges();
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
            _validateInputs(this._isRange, this._getInput(_MatThumb.END), this._getInput(_MatThumb.START));
        }
        const thumb = this._getThumb(_MatThumb.END);
        this._rippleRadius = thumb._ripple.radius;
        this._inputPadding = this._rippleRadius - this._knobRadius;
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
        const endInput = this._getInput(_MatThumb.END);
        const startInput = this._getInput(_MatThumb.START);
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
        const input = this._getInput(_MatThumb.END);
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
        return this._getThumb(_MatThumb.START)._isActive || this._getThumb(_MatThumb.END)._isActive;
    }
    _getValue(thumbPosition = _MatThumb.END) {
        const input = this._getInput(thumbPosition);
        if (!input) {
            return this.min;
        }
        return input.value;
    }
    _skipUpdate() {
        return !!(this._getInput(_MatThumb.START)?._skipUIUpdate || this._getInput(_MatThumb.END)?._skipUIUpdate);
    }
    /** Stores the slider dimensions. */
    _updateDimensions() {
        this._cachedWidth = this._elementRef.nativeElement.offsetWidth;
        this._cachedLeft = this._elementRef.nativeElement.getBoundingClientRect().left;
    }
    /** Sets the styles for the active portion of the track. */
    _setTrackActiveStyles(styles) {
        const trackStyle = this._trackActive.nativeElement.style;
        trackStyle.left = styles.left;
        trackStyle.right = styles.right;
        trackStyle.transformOrigin = styles.transformOrigin;
        trackStyle.transform = styles.transform;
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
            const eInput = this._getInput(_MatThumb.END);
            const sInput = this._getInput(_MatThumb.START);
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
            const eInput = this._getInput(_MatThumb.END);
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
        const startInput = this._getInput(_MatThumb.START);
        const endInput = this._getInput(_MatThumb.END);
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
        const thumb = this._getThumb(source.thumbPosition === _MatThumb.END ? _MatThumb.END : _MatThumb.START);
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
            source.thumbPosition === _MatThumb.START
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
        const eInput = this._getInput(_MatThumb.END);
        const sInput = this._getInput(_MatThumb.START);
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
        let numActive = Math.max(Math.floor((value - this.min) / step), 0);
        let numInactive = Math.max(Math.floor((this.max - value) / step), 0);
        this._isRtl ? numActive++ : numInactive++;
        this._tickMarks = Array(numActive)
            .fill(_MatTickMark.ACTIVE)
            .concat(Array(numInactive).fill(_MatTickMark.INACTIVE));
    }
    _updateTickMarkUIRange(step) {
        const endValue = this._getValue();
        const startValue = this._getValue(_MatThumb.START);
        const numInactiveBeforeStartThumb = Math.max(Math.floor((startValue - this.min) / step), 0);
        const numActive = Math.max(Math.floor((endValue - startValue) / step) + 1, 0);
        const numInactiveAfterEndThumb = Math.max(Math.floor((this.max - endValue) / step), 0);
        this._tickMarks = Array(numInactiveBeforeStartThumb)
            .fill(_MatTickMark.INACTIVE)
            .concat(Array(numActive).fill(_MatTickMark.ACTIVE), Array(numInactiveAfterEndThumb).fill(_MatTickMark.INACTIVE));
    }
    /** Gets the slider thumb input of the given thumb position. */
    _getInput(thumbPosition) {
        if (thumbPosition === _MatThumb.END && this._input) {
            return this._input;
        }
        if (this._inputs?.length) {
            return thumbPosition === _MatThumb.START ? this._inputs.first : this._inputs.last;
        }
        return;
    }
    /** Gets the slider thumb HTML input element of the given thumb position. */
    _getThumb(thumbPosition) {
        return thumbPosition === _MatThumb.END ? this._thumbs?.last : this._thumbs?.first;
    }
    _setTransition(withAnimation) {
        this._hasAnimation = !this._platform.IOS && withAnimation && !this._noopAnimations;
        this._elementRef.nativeElement.classList.toggle('mat-mdc-slider-with-animation', this._hasAnimation);
    }
    /** Whether the given pointer event occurred within the bounds of the slider pointer's DOM Rect. */
    _isCursorOnSliderThumb(event, rect) {
        const radius = rect.width / 2;
        const centerX = rect.x + radius;
        const centerY = rect.y + radius;
        const dx = event.clientX - centerX;
        const dy = event.clientY - centerY;
        return Math.pow(dx, 2) + Math.pow(dy, 2) < Math.pow(radius, 2);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.2.0", ngImport: i0, type: MatSlider, deps: [{ token: i0.NgZone }, { token: i0.ChangeDetectorRef }, { token: i0.ElementRef }, { token: i1.Directionality, optional: true }, { token: MAT_RIPPLE_GLOBAL_OPTIONS, optional: true }, { token: ANIMATION_MODULE_TYPE, optional: true }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "17.2.0", type: MatSlider, isStandalone: true, selector: "mat-slider", inputs: { disabled: ["disabled", "disabled", booleanAttribute], discrete: ["discrete", "discrete", booleanAttribute], showTickMarks: ["showTickMarks", "showTickMarks", booleanAttribute], min: ["min", "min", numberAttribute], color: "color", disableRipple: ["disableRipple", "disableRipple", booleanAttribute], max: ["max", "max", numberAttribute], step: ["step", "step", numberAttribute], displayWith: "displayWith" }, host: { properties: { "class": "\"mat-\" + (color || \"primary\")", "class.mdc-slider--range": "_isRange", "class.mdc-slider--disabled": "disabled", "class.mdc-slider--discrete": "discrete", "class.mdc-slider--tick-marks": "showTickMarks", "class._mat-animation-noopable": "_noopAnimations" }, classAttribute: "mat-mdc-slider mdc-slider" }, providers: [{ provide: MAT_SLIDER, useExisting: MatSlider }], queries: [{ propertyName: "_input", first: true, predicate: MAT_SLIDER_THUMB, descendants: true }, { propertyName: "_inputs", predicate: MAT_SLIDER_RANGE_THUMB }], viewQueries: [{ propertyName: "_trackActive", first: true, predicate: ["trackActive"], descendants: true }, { propertyName: "_thumbs", predicate: MAT_SLIDER_VISUAL_THUMB, descendants: true }], exportAs: ["matSlider"], ngImport: i0, template: "<!-- Inputs -->\n<ng-content></ng-content>\n\n<!-- Track -->\n<div class=\"mdc-slider__track\">\n  <div class=\"mdc-slider__track--inactive\"></div>\n  <div class=\"mdc-slider__track--active\">\n    <div #trackActive class=\"mdc-slider__track--active_fill\"></div>\n  </div>\n  @if (showTickMarks) {\n    <div class=\"mdc-slider__tick-marks\" #tickMarkContainer>\n      @if (_cachedWidth) {\n        @for (tickMark of _tickMarks; track tickMark; let i = $index) {\n          <div\n            [class]=\"tickMark === 0 ? 'mdc-slider__tick-mark--active' : 'mdc-slider__tick-mark--inactive'\"\n            [style.transform]=\"_calcTickMarkTransform(i)\"></div>\n        }\n      }\n    </div>\n  }\n</div>\n\n<!-- Thumbs -->\n@if (_isRange) {\n  <mat-slider-visual-thumb\n    [discrete]=\"discrete\"\n    [thumbPosition]=\"1\"\n    [valueIndicatorText]=\"startValueIndicatorText\">\n  </mat-slider-visual-thumb>\n}\n\n<mat-slider-visual-thumb\n  [discrete]=\"discrete\"\n  [thumbPosition]=\"2\"\n  [valueIndicatorText]=\"endValueIndicatorText\">\n</mat-slider-visual-thumb>\n", styles: [".mdc-slider{cursor:pointer;height:48px;margin:0 24px;position:relative;touch-action:pan-y}.mdc-slider .mdc-slider__track{position:absolute;top:50%;transform:translateY(-50%);width:100%}.mdc-slider .mdc-slider__track--active,.mdc-slider .mdc-slider__track--inactive{display:flex;height:100%;position:absolute;width:100%}.mdc-slider .mdc-slider__track--active{overflow:hidden}.mdc-slider .mdc-slider__track--active_fill{border-top-style:solid;box-sizing:border-box;height:100%;width:100%;position:relative;-webkit-transform-origin:left;transform-origin:left}[dir=rtl] .mdc-slider .mdc-slider__track--active_fill,.mdc-slider .mdc-slider__track--active_fill[dir=rtl]{-webkit-transform-origin:right;transform-origin:right}.mdc-slider .mdc-slider__track--inactive{left:0;top:0}.mdc-slider .mdc-slider__track--inactive::before{position:absolute;box-sizing:border-box;width:100%;height:100%;top:0;left:0;border:1px solid rgba(0,0,0,0);border-radius:inherit;content:\"\";pointer-events:none}@media screen and (forced-colors: active){.mdc-slider .mdc-slider__track--inactive::before{border-color:CanvasText}}.mdc-slider .mdc-slider__value-indicator-container{bottom:44px;left:50%;left:var(--slider-value-indicator-container-left, 50%);pointer-events:none;position:absolute;right:var(--slider-value-indicator-container-right);transform:translateX(-50%);transform:var(--slider-value-indicator-container-transform, translateX(-50%))}.mdc-slider .mdc-slider__value-indicator{transition:transform 100ms 0ms cubic-bezier(0.4, 0, 1, 1);align-items:center;border-radius:4px;display:flex;height:32px;padding:0 12px;transform:scale(0);transform-origin:bottom}.mdc-slider .mdc-slider__value-indicator::before{border-left:6px solid rgba(0,0,0,0);border-right:6px solid rgba(0,0,0,0);border-top:6px solid;bottom:-5px;content:\"\";height:0;left:50%;left:var(--slider-value-indicator-caret-left, 50%);position:absolute;right:var(--slider-value-indicator-caret-right);transform:translateX(-50%);transform:var(--slider-value-indicator-caret-transform, translateX(-50%));width:0}.mdc-slider .mdc-slider__value-indicator::after{position:absolute;box-sizing:border-box;width:100%;height:100%;top:0;left:0;border:1px solid rgba(0,0,0,0);border-radius:inherit;content:\"\";pointer-events:none}@media screen and (forced-colors: active){.mdc-slider .mdc-slider__value-indicator::after{border-color:CanvasText}}.mdc-slider .mdc-slider__thumb--with-indicator .mdc-slider__value-indicator-container{pointer-events:auto}.mdc-slider .mdc-slider__thumb--with-indicator .mdc-slider__value-indicator{transition:transform 100ms 0ms cubic-bezier(0, 0, 0.2, 1);transform:scale(1)}@media(prefers-reduced-motion){.mdc-slider .mdc-slider__value-indicator,.mdc-slider .mdc-slider__thumb--with-indicator .mdc-slider__value-indicator{transition:none}}.mdc-slider .mdc-slider__thumb{display:flex;left:-24px;outline:none;position:absolute;user-select:none;height:48px;width:48px}.mdc-slider .mdc-slider__thumb--top{z-index:1}.mdc-slider .mdc-slider__thumb--top .mdc-slider__thumb-knob,.mdc-slider .mdc-slider__thumb--top.mdc-slider__thumb:hover .mdc-slider__thumb-knob,.mdc-slider .mdc-slider__thumb--top.mdc-slider__thumb--focused .mdc-slider__thumb-knob{border-style:solid;border-width:1px;box-sizing:content-box}.mdc-slider .mdc-slider__thumb-knob{box-sizing:border-box;left:50%;position:absolute;top:50%;transform:translate(-50%, -50%)}.mdc-slider .mdc-slider__tick-marks{align-items:center;box-sizing:border-box;display:flex;height:100%;justify-content:space-between;padding:0 1px;position:absolute;width:100%}.mdc-slider--discrete .mdc-slider__thumb,.mdc-slider--discrete .mdc-slider__track--active_fill{transition:transform 80ms ease}@media(prefers-reduced-motion){.mdc-slider--discrete .mdc-slider__thumb,.mdc-slider--discrete .mdc-slider__track--active_fill{transition:none}}.mdc-slider--disabled{cursor:auto}.mdc-slider--disabled .mdc-slider__thumb{pointer-events:none}.mdc-slider__input{cursor:pointer;left:2px;margin:0;height:44px;opacity:0;pointer-events:none;position:absolute;top:2px;width:44px}.mat-mdc-slider{display:inline-block;box-sizing:border-box;outline:none;vertical-align:middle;margin-left:8px;margin-right:8px;width:auto;min-width:112px;-webkit-tap-highlight-color:rgba(0,0,0,0)}.mat-mdc-slider .mdc-slider__thumb-knob{background-color:var(--mdc-slider-handle-color);border-color:var(--mdc-slider-handle-color)}.mat-mdc-slider .mdc-slider__thumb--top .mdc-slider__thumb-knob,.mat-mdc-slider .mdc-slider__thumb--top.mdc-slider__thumb:hover .mdc-slider__thumb-knob,.mat-mdc-slider .mdc-slider__thumb--top.mdc-slider__thumb--focused .mdc-slider__thumb-knob{border-color:#fff}.mat-mdc-slider.mdc-slider--disabled .mdc-slider__thumb-knob{background-color:var(--mdc-slider-disabled-handle-color);border-color:var(--mdc-slider-disabled-handle-color)}.mat-mdc-slider.mdc-slider--disabled .mdc-slider__thumb--top .mdc-slider__thumb-knob,.mat-mdc-slider.mdc-slider--disabled .mdc-slider__thumb--top.mdc-slider__thumb:hover .mdc-slider__thumb-knob,.mat-mdc-slider.mdc-slider--disabled .mdc-slider__thumb--top.mdc-slider__thumb--focused .mdc-slider__thumb-knob{border-color:#fff}.mat-mdc-slider .mdc-slider__thumb::before,.mat-mdc-slider .mdc-slider__thumb::after{background-color:var(--mdc-slider-handle-color)}.mat-mdc-slider .mdc-slider__thumb:hover::before,.mat-mdc-slider .mdc-slider__thumb.mdc-ripple-surface--hover::before{opacity:var(--mdc-ripple-hover-opacity)}.mat-mdc-slider .mdc-slider__thumb.mdc-ripple-upgraded--background-focused::before,.mat-mdc-slider .mdc-slider__thumb:not(.mdc-ripple-upgraded):focus::before{transition-duration:75ms;opacity:var(--mdc-ripple-focus-opacity)}.mat-mdc-slider .mdc-slider__thumb:not(.mdc-ripple-upgraded)::after{transition:opacity 150ms linear}.mat-mdc-slider .mdc-slider__thumb:not(.mdc-ripple-upgraded):active::after{transition-duration:75ms;opacity:var(--mdc-ripple-press-opacity)}.mat-mdc-slider .mdc-slider__thumb.mdc-ripple-upgraded{--mdc-ripple-fg-opacity:var(--mdc-ripple-press-opacity)}.mat-mdc-slider .mdc-slider__track--active_fill{border-color:var(--mdc-slider-active-track-color)}.mat-mdc-slider.mdc-slider--disabled .mdc-slider__track--active_fill{border-color:var(--mdc-slider-disabled-active-track-color)}.mat-mdc-slider .mdc-slider__track--inactive{background-color:var(--mdc-slider-inactive-track-color);opacity:.24}.mat-mdc-slider.mdc-slider--disabled .mdc-slider__track--inactive{background-color:var(--mdc-slider-disabled-inactive-track-color);opacity:.24}.mat-mdc-slider .mdc-slider__tick-mark--active{background-color:var(--mdc-slider-with-tick-marks-active-container-color);opacity:var(--mdc-slider-with-tick-marks-active-container-opacity)}.mat-mdc-slider.mdc-slider--disabled .mdc-slider__tick-mark--active{background-color:var(--mdc-slider-with-tick-marks-active-container-color);opacity:var(--mdc-slider-with-tick-marks-active-container-opacity)}.mat-mdc-slider .mdc-slider__tick-mark--inactive{background-color:var(--mdc-slider-with-tick-marks-inactive-container-color);opacity:var(--mdc-slider-with-tick-marks-inactive-container-opacity)}.mat-mdc-slider.mdc-slider--disabled .mdc-slider__tick-mark--inactive{background-color:var(--mdc-slider-with-tick-marks-disabled-container-color);opacity:var(--mdc-slider-with-tick-marks-inactive-container-opacity)}.mat-mdc-slider .mdc-slider__value-indicator{background-color:var(--mdc-slider-label-container-color);opacity:1}.mat-mdc-slider .mdc-slider__value-indicator::before{border-top-color:var(--mdc-slider-label-container-color)}.mat-mdc-slider .mdc-slider__value-indicator{color:var(--mdc-slider-label-label-text-color)}.mat-mdc-slider .mdc-slider__track{height:var(--mdc-slider-inactive-track-height)}.mat-mdc-slider .mdc-slider__track--active{height:var(--mdc-slider-active-track-height);top:calc((var(--mdc-slider-inactive-track-height) - var(--mdc-slider-active-track-height)) / 2)}.mat-mdc-slider .mdc-slider__track--active_fill{border-top-width:var(--mdc-slider-active-track-height)}.mat-mdc-slider .mdc-slider__track--inactive{height:var(--mdc-slider-inactive-track-height)}.mat-mdc-slider .mdc-slider__tick-mark--active,.mat-mdc-slider .mdc-slider__tick-mark--inactive{height:var(--mdc-slider-with-tick-marks-container-size);width:var(--mdc-slider-with-tick-marks-container-size)}.mat-mdc-slider.mdc-slider--disabled{opacity:0.38}.mat-mdc-slider .mdc-slider__value-indicator-text{letter-spacing:var(--mdc-slider-label-label-text-tracking);font-size:var(--mdc-slider-label-label-text-size);font-family:var(--mdc-slider-label-label-text-font);font-weight:var(--mdc-slider-label-label-text-weight);line-height:var(--mdc-slider-label-label-text-line-height)}.mat-mdc-slider .mdc-slider__track--active{border-radius:var(--mdc-slider-active-track-shape)}.mat-mdc-slider .mdc-slider__track--inactive{border-radius:var(--mdc-slider-inactive-track-shape)}.mat-mdc-slider .mdc-slider__thumb-knob{border-radius:var(--mdc-slider-handle-shape);width:var(--mdc-slider-handle-width);height:var(--mdc-slider-handle-height);border-style:solid;border-width:calc(var(--mdc-slider-handle-height) / 2) calc(var(--mdc-slider-handle-width) / 2)}.mat-mdc-slider .mdc-slider__tick-mark--active,.mat-mdc-slider .mdc-slider__tick-mark--inactive{border-radius:var(--mdc-slider-with-tick-marks-container-shape)}.mat-mdc-slider .mdc-slider__thumb:hover .mdc-slider__thumb-knob{background-color:var(--mdc-slider-hover-handle-color);border-color:var(--mdc-slider-hover-handle-color)}.mat-mdc-slider .mdc-slider__thumb:hover .mdc-slider__thumb--top .mdc-slider__thumb-knob,.mat-mdc-slider .mdc-slider__thumb:hover .mdc-slider__thumb--top.mdc-slider__thumb:hover .mdc-slider__thumb-knob,.mat-mdc-slider .mdc-slider__thumb:hover .mdc-slider__thumb--top.mdc-slider__thumb--focused .mdc-slider__thumb-knob{border-color:#fff}.mat-mdc-slider .mdc-slider__thumb--focused .mdc-slider__thumb-knob{background-color:var(--mdc-slider-focus-handle-color);border-color:var(--mdc-slider-focus-handle-color)}.mat-mdc-slider .mdc-slider__thumb--focused .mdc-slider__thumb--top .mdc-slider__thumb-knob,.mat-mdc-slider .mdc-slider__thumb--focused .mdc-slider__thumb--top.mdc-slider__thumb:hover .mdc-slider__thumb-knob,.mat-mdc-slider .mdc-slider__thumb--focused .mdc-slider__thumb--top.mdc-slider__thumb--focused .mdc-slider__thumb-knob{border-color:#fff}.mat-mdc-slider .mdc-slider__thumb:not(:disabled):active .mdc-slider__thumb--top .mdc-slider__thumb-knob,.mat-mdc-slider .mdc-slider__thumb:not(:disabled):active .mdc-slider__thumb--top.mdc-slider__thumb:hover .mdc-slider__thumb-knob,.mat-mdc-slider .mdc-slider__thumb:not(:disabled):active .mdc-slider__thumb--top.mdc-slider__thumb--focused .mdc-slider__thumb-knob{border-color:#fff}.mat-mdc-slider .mdc-slider__thumb--top .mdc-slider__thumb-knob,.mat-mdc-slider .mdc-slider__thumb--top.mdc-slider__thumb:hover .mdc-slider__thumb-knob,.mat-mdc-slider .mdc-slider__thumb--top.mdc-slider__thumb--focused .mdc-slider__thumb-knob{border-color:var(--mdc-slider-with-overlap-handle-outline-color);border-width:var(--mdc-slider-with-overlap-handle-outline-width)}.mat-mdc-slider .mdc-slider__thumb-knob{box-shadow:var(--mdc-slider-handle-elevation)}.mat-mdc-slider .mdc-slider__input{box-sizing:content-box;pointer-events:auto}.mat-mdc-slider .mdc-slider__input.mat-mdc-slider-input-no-pointer-events{pointer-events:none}.mat-mdc-slider .mdc-slider__input.mat-slider__right-input{left:auto;right:0}.mat-mdc-slider .mdc-slider__thumb,.mat-mdc-slider .mdc-slider__track--active_fill{transition-duration:0ms}.mat-mdc-slider.mat-mdc-slider-with-animation .mdc-slider__thumb,.mat-mdc-slider.mat-mdc-slider-with-animation .mdc-slider__track--active_fill{transition-duration:80ms}.mat-mdc-slider.mdc-slider--discrete .mdc-slider__thumb,.mat-mdc-slider.mdc-slider--discrete .mdc-slider__track--active_fill{transition-duration:0ms}.mat-mdc-slider.mat-mdc-slider-with-animation .mdc-slider__thumb,.mat-mdc-slider.mat-mdc-slider-with-animation .mdc-slider__track--active_fill{transition-duration:80ms}.mat-mdc-slider .mdc-slider__track,.mat-mdc-slider .mdc-slider__thumb{pointer-events:none}.mat-mdc-slider .mdc-slider__value-indicator-container{transform:var(--mat-slider-value-indicator-container-transform)}.mat-mdc-slider .mdc-slider__value-indicator{width:var(--mat-slider-value-indicator-width);height:var(--mat-slider-value-indicator-height);padding:var(--mat-slider-value-indicator-padding);opacity:var(--mat-slider-value-indicator-opacity);border-radius:var(--mat-slider-value-indicator-border-radius)}.mat-mdc-slider .mdc-slider__value-indicator::before{display:var(--mat-slider-value-indicator-caret-display)}.mat-mdc-slider .mdc-slider__value-indicator-text{width:var(--mat-slider-value-indicator-width);transform:var(--mat-slider-value-indicator-text-transform)}.mat-mdc-slider .mat-ripple .mat-ripple-element{background-color:var(--mat-slider-ripple-color)}.mat-mdc-slider .mat-ripple .mat-mdc-slider-hover-ripple{background-color:var(--mat-slider-hover-state-layer-color)}.mat-mdc-slider .mat-ripple .mat-mdc-slider-focus-ripple,.mat-mdc-slider .mat-ripple .mat-mdc-slider-active-ripple{background-color:var(--mat-slider-focus-state-layer-color)}.mat-mdc-slider._mat-animation-noopable.mdc-slider--discrete .mdc-slider__thumb,.mat-mdc-slider._mat-animation-noopable.mdc-slider--discrete .mdc-slider__track--active_fill,.mat-mdc-slider._mat-animation-noopable .mdc-slider__value-indicator{transition:none}.mat-mdc-slider .mat-mdc-focus-indicator::before{border-radius:50%}.mat-mdc-slider .mdc-slider__value-indicator{word-break:normal}.mat-mdc-slider .mdc-slider__value-indicator-text{text-align:center}.mdc-slider__thumb--focused .mat-mdc-focus-indicator::before{content:\"\"}"], dependencies: [{ kind: "component", type: MatSliderVisualThumb, selector: "mat-slider-visual-thumb", inputs: ["discrete", "thumbPosition", "valueIndicatorText"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.2.0", ngImport: i0, type: MatSlider, decorators: [{
            type: Component,
            args: [{ selector: 'mat-slider', host: {
                        'class': 'mat-mdc-slider mdc-slider',
                        '[class]': '"mat-" + (color || "primary")',
                        '[class.mdc-slider--range]': '_isRange',
                        '[class.mdc-slider--disabled]': 'disabled',
                        '[class.mdc-slider--discrete]': 'discrete',
                        '[class.mdc-slider--tick-marks]': 'showTickMarks',
                        '[class._mat-animation-noopable]': '_noopAnimations',
                    }, exportAs: 'matSlider', changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation.None, providers: [{ provide: MAT_SLIDER, useExisting: MatSlider }], standalone: true, imports: [MatSliderVisualThumb], template: "<!-- Inputs -->\n<ng-content></ng-content>\n\n<!-- Track -->\n<div class=\"mdc-slider__track\">\n  <div class=\"mdc-slider__track--inactive\"></div>\n  <div class=\"mdc-slider__track--active\">\n    <div #trackActive class=\"mdc-slider__track--active_fill\"></div>\n  </div>\n  @if (showTickMarks) {\n    <div class=\"mdc-slider__tick-marks\" #tickMarkContainer>\n      @if (_cachedWidth) {\n        @for (tickMark of _tickMarks; track tickMark; let i = $index) {\n          <div\n            [class]=\"tickMark === 0 ? 'mdc-slider__tick-mark--active' : 'mdc-slider__tick-mark--inactive'\"\n            [style.transform]=\"_calcTickMarkTransform(i)\"></div>\n        }\n      }\n    </div>\n  }\n</div>\n\n<!-- Thumbs -->\n@if (_isRange) {\n  <mat-slider-visual-thumb\n    [discrete]=\"discrete\"\n    [thumbPosition]=\"1\"\n    [valueIndicatorText]=\"startValueIndicatorText\">\n  </mat-slider-visual-thumb>\n}\n\n<mat-slider-visual-thumb\n  [discrete]=\"discrete\"\n  [thumbPosition]=\"2\"\n  [valueIndicatorText]=\"endValueIndicatorText\">\n</mat-slider-visual-thumb>\n", styles: [".mdc-slider{cursor:pointer;height:48px;margin:0 24px;position:relative;touch-action:pan-y}.mdc-slider .mdc-slider__track{position:absolute;top:50%;transform:translateY(-50%);width:100%}.mdc-slider .mdc-slider__track--active,.mdc-slider .mdc-slider__track--inactive{display:flex;height:100%;position:absolute;width:100%}.mdc-slider .mdc-slider__track--active{overflow:hidden}.mdc-slider .mdc-slider__track--active_fill{border-top-style:solid;box-sizing:border-box;height:100%;width:100%;position:relative;-webkit-transform-origin:left;transform-origin:left}[dir=rtl] .mdc-slider .mdc-slider__track--active_fill,.mdc-slider .mdc-slider__track--active_fill[dir=rtl]{-webkit-transform-origin:right;transform-origin:right}.mdc-slider .mdc-slider__track--inactive{left:0;top:0}.mdc-slider .mdc-slider__track--inactive::before{position:absolute;box-sizing:border-box;width:100%;height:100%;top:0;left:0;border:1px solid rgba(0,0,0,0);border-radius:inherit;content:\"\";pointer-events:none}@media screen and (forced-colors: active){.mdc-slider .mdc-slider__track--inactive::before{border-color:CanvasText}}.mdc-slider .mdc-slider__value-indicator-container{bottom:44px;left:50%;left:var(--slider-value-indicator-container-left, 50%);pointer-events:none;position:absolute;right:var(--slider-value-indicator-container-right);transform:translateX(-50%);transform:var(--slider-value-indicator-container-transform, translateX(-50%))}.mdc-slider .mdc-slider__value-indicator{transition:transform 100ms 0ms cubic-bezier(0.4, 0, 1, 1);align-items:center;border-radius:4px;display:flex;height:32px;padding:0 12px;transform:scale(0);transform-origin:bottom}.mdc-slider .mdc-slider__value-indicator::before{border-left:6px solid rgba(0,0,0,0);border-right:6px solid rgba(0,0,0,0);border-top:6px solid;bottom:-5px;content:\"\";height:0;left:50%;left:var(--slider-value-indicator-caret-left, 50%);position:absolute;right:var(--slider-value-indicator-caret-right);transform:translateX(-50%);transform:var(--slider-value-indicator-caret-transform, translateX(-50%));width:0}.mdc-slider .mdc-slider__value-indicator::after{position:absolute;box-sizing:border-box;width:100%;height:100%;top:0;left:0;border:1px solid rgba(0,0,0,0);border-radius:inherit;content:\"\";pointer-events:none}@media screen and (forced-colors: active){.mdc-slider .mdc-slider__value-indicator::after{border-color:CanvasText}}.mdc-slider .mdc-slider__thumb--with-indicator .mdc-slider__value-indicator-container{pointer-events:auto}.mdc-slider .mdc-slider__thumb--with-indicator .mdc-slider__value-indicator{transition:transform 100ms 0ms cubic-bezier(0, 0, 0.2, 1);transform:scale(1)}@media(prefers-reduced-motion){.mdc-slider .mdc-slider__value-indicator,.mdc-slider .mdc-slider__thumb--with-indicator .mdc-slider__value-indicator{transition:none}}.mdc-slider .mdc-slider__thumb{display:flex;left:-24px;outline:none;position:absolute;user-select:none;height:48px;width:48px}.mdc-slider .mdc-slider__thumb--top{z-index:1}.mdc-slider .mdc-slider__thumb--top .mdc-slider__thumb-knob,.mdc-slider .mdc-slider__thumb--top.mdc-slider__thumb:hover .mdc-slider__thumb-knob,.mdc-slider .mdc-slider__thumb--top.mdc-slider__thumb--focused .mdc-slider__thumb-knob{border-style:solid;border-width:1px;box-sizing:content-box}.mdc-slider .mdc-slider__thumb-knob{box-sizing:border-box;left:50%;position:absolute;top:50%;transform:translate(-50%, -50%)}.mdc-slider .mdc-slider__tick-marks{align-items:center;box-sizing:border-box;display:flex;height:100%;justify-content:space-between;padding:0 1px;position:absolute;width:100%}.mdc-slider--discrete .mdc-slider__thumb,.mdc-slider--discrete .mdc-slider__track--active_fill{transition:transform 80ms ease}@media(prefers-reduced-motion){.mdc-slider--discrete .mdc-slider__thumb,.mdc-slider--discrete .mdc-slider__track--active_fill{transition:none}}.mdc-slider--disabled{cursor:auto}.mdc-slider--disabled .mdc-slider__thumb{pointer-events:none}.mdc-slider__input{cursor:pointer;left:2px;margin:0;height:44px;opacity:0;pointer-events:none;position:absolute;top:2px;width:44px}.mat-mdc-slider{display:inline-block;box-sizing:border-box;outline:none;vertical-align:middle;margin-left:8px;margin-right:8px;width:auto;min-width:112px;-webkit-tap-highlight-color:rgba(0,0,0,0)}.mat-mdc-slider .mdc-slider__thumb-knob{background-color:var(--mdc-slider-handle-color);border-color:var(--mdc-slider-handle-color)}.mat-mdc-slider .mdc-slider__thumb--top .mdc-slider__thumb-knob,.mat-mdc-slider .mdc-slider__thumb--top.mdc-slider__thumb:hover .mdc-slider__thumb-knob,.mat-mdc-slider .mdc-slider__thumb--top.mdc-slider__thumb--focused .mdc-slider__thumb-knob{border-color:#fff}.mat-mdc-slider.mdc-slider--disabled .mdc-slider__thumb-knob{background-color:var(--mdc-slider-disabled-handle-color);border-color:var(--mdc-slider-disabled-handle-color)}.mat-mdc-slider.mdc-slider--disabled .mdc-slider__thumb--top .mdc-slider__thumb-knob,.mat-mdc-slider.mdc-slider--disabled .mdc-slider__thumb--top.mdc-slider__thumb:hover .mdc-slider__thumb-knob,.mat-mdc-slider.mdc-slider--disabled .mdc-slider__thumb--top.mdc-slider__thumb--focused .mdc-slider__thumb-knob{border-color:#fff}.mat-mdc-slider .mdc-slider__thumb::before,.mat-mdc-slider .mdc-slider__thumb::after{background-color:var(--mdc-slider-handle-color)}.mat-mdc-slider .mdc-slider__thumb:hover::before,.mat-mdc-slider .mdc-slider__thumb.mdc-ripple-surface--hover::before{opacity:var(--mdc-ripple-hover-opacity)}.mat-mdc-slider .mdc-slider__thumb.mdc-ripple-upgraded--background-focused::before,.mat-mdc-slider .mdc-slider__thumb:not(.mdc-ripple-upgraded):focus::before{transition-duration:75ms;opacity:var(--mdc-ripple-focus-opacity)}.mat-mdc-slider .mdc-slider__thumb:not(.mdc-ripple-upgraded)::after{transition:opacity 150ms linear}.mat-mdc-slider .mdc-slider__thumb:not(.mdc-ripple-upgraded):active::after{transition-duration:75ms;opacity:var(--mdc-ripple-press-opacity)}.mat-mdc-slider .mdc-slider__thumb.mdc-ripple-upgraded{--mdc-ripple-fg-opacity:var(--mdc-ripple-press-opacity)}.mat-mdc-slider .mdc-slider__track--active_fill{border-color:var(--mdc-slider-active-track-color)}.mat-mdc-slider.mdc-slider--disabled .mdc-slider__track--active_fill{border-color:var(--mdc-slider-disabled-active-track-color)}.mat-mdc-slider .mdc-slider__track--inactive{background-color:var(--mdc-slider-inactive-track-color);opacity:.24}.mat-mdc-slider.mdc-slider--disabled .mdc-slider__track--inactive{background-color:var(--mdc-slider-disabled-inactive-track-color);opacity:.24}.mat-mdc-slider .mdc-slider__tick-mark--active{background-color:var(--mdc-slider-with-tick-marks-active-container-color);opacity:var(--mdc-slider-with-tick-marks-active-container-opacity)}.mat-mdc-slider.mdc-slider--disabled .mdc-slider__tick-mark--active{background-color:var(--mdc-slider-with-tick-marks-active-container-color);opacity:var(--mdc-slider-with-tick-marks-active-container-opacity)}.mat-mdc-slider .mdc-slider__tick-mark--inactive{background-color:var(--mdc-slider-with-tick-marks-inactive-container-color);opacity:var(--mdc-slider-with-tick-marks-inactive-container-opacity)}.mat-mdc-slider.mdc-slider--disabled .mdc-slider__tick-mark--inactive{background-color:var(--mdc-slider-with-tick-marks-disabled-container-color);opacity:var(--mdc-slider-with-tick-marks-inactive-container-opacity)}.mat-mdc-slider .mdc-slider__value-indicator{background-color:var(--mdc-slider-label-container-color);opacity:1}.mat-mdc-slider .mdc-slider__value-indicator::before{border-top-color:var(--mdc-slider-label-container-color)}.mat-mdc-slider .mdc-slider__value-indicator{color:var(--mdc-slider-label-label-text-color)}.mat-mdc-slider .mdc-slider__track{height:var(--mdc-slider-inactive-track-height)}.mat-mdc-slider .mdc-slider__track--active{height:var(--mdc-slider-active-track-height);top:calc((var(--mdc-slider-inactive-track-height) - var(--mdc-slider-active-track-height)) / 2)}.mat-mdc-slider .mdc-slider__track--active_fill{border-top-width:var(--mdc-slider-active-track-height)}.mat-mdc-slider .mdc-slider__track--inactive{height:var(--mdc-slider-inactive-track-height)}.mat-mdc-slider .mdc-slider__tick-mark--active,.mat-mdc-slider .mdc-slider__tick-mark--inactive{height:var(--mdc-slider-with-tick-marks-container-size);width:var(--mdc-slider-with-tick-marks-container-size)}.mat-mdc-slider.mdc-slider--disabled{opacity:0.38}.mat-mdc-slider .mdc-slider__value-indicator-text{letter-spacing:var(--mdc-slider-label-label-text-tracking);font-size:var(--mdc-slider-label-label-text-size);font-family:var(--mdc-slider-label-label-text-font);font-weight:var(--mdc-slider-label-label-text-weight);line-height:var(--mdc-slider-label-label-text-line-height)}.mat-mdc-slider .mdc-slider__track--active{border-radius:var(--mdc-slider-active-track-shape)}.mat-mdc-slider .mdc-slider__track--inactive{border-radius:var(--mdc-slider-inactive-track-shape)}.mat-mdc-slider .mdc-slider__thumb-knob{border-radius:var(--mdc-slider-handle-shape);width:var(--mdc-slider-handle-width);height:var(--mdc-slider-handle-height);border-style:solid;border-width:calc(var(--mdc-slider-handle-height) / 2) calc(var(--mdc-slider-handle-width) / 2)}.mat-mdc-slider .mdc-slider__tick-mark--active,.mat-mdc-slider .mdc-slider__tick-mark--inactive{border-radius:var(--mdc-slider-with-tick-marks-container-shape)}.mat-mdc-slider .mdc-slider__thumb:hover .mdc-slider__thumb-knob{background-color:var(--mdc-slider-hover-handle-color);border-color:var(--mdc-slider-hover-handle-color)}.mat-mdc-slider .mdc-slider__thumb:hover .mdc-slider__thumb--top .mdc-slider__thumb-knob,.mat-mdc-slider .mdc-slider__thumb:hover .mdc-slider__thumb--top.mdc-slider__thumb:hover .mdc-slider__thumb-knob,.mat-mdc-slider .mdc-slider__thumb:hover .mdc-slider__thumb--top.mdc-slider__thumb--focused .mdc-slider__thumb-knob{border-color:#fff}.mat-mdc-slider .mdc-slider__thumb--focused .mdc-slider__thumb-knob{background-color:var(--mdc-slider-focus-handle-color);border-color:var(--mdc-slider-focus-handle-color)}.mat-mdc-slider .mdc-slider__thumb--focused .mdc-slider__thumb--top .mdc-slider__thumb-knob,.mat-mdc-slider .mdc-slider__thumb--focused .mdc-slider__thumb--top.mdc-slider__thumb:hover .mdc-slider__thumb-knob,.mat-mdc-slider .mdc-slider__thumb--focused .mdc-slider__thumb--top.mdc-slider__thumb--focused .mdc-slider__thumb-knob{border-color:#fff}.mat-mdc-slider .mdc-slider__thumb:not(:disabled):active .mdc-slider__thumb--top .mdc-slider__thumb-knob,.mat-mdc-slider .mdc-slider__thumb:not(:disabled):active .mdc-slider__thumb--top.mdc-slider__thumb:hover .mdc-slider__thumb-knob,.mat-mdc-slider .mdc-slider__thumb:not(:disabled):active .mdc-slider__thumb--top.mdc-slider__thumb--focused .mdc-slider__thumb-knob{border-color:#fff}.mat-mdc-slider .mdc-slider__thumb--top .mdc-slider__thumb-knob,.mat-mdc-slider .mdc-slider__thumb--top.mdc-slider__thumb:hover .mdc-slider__thumb-knob,.mat-mdc-slider .mdc-slider__thumb--top.mdc-slider__thumb--focused .mdc-slider__thumb-knob{border-color:var(--mdc-slider-with-overlap-handle-outline-color);border-width:var(--mdc-slider-with-overlap-handle-outline-width)}.mat-mdc-slider .mdc-slider__thumb-knob{box-shadow:var(--mdc-slider-handle-elevation)}.mat-mdc-slider .mdc-slider__input{box-sizing:content-box;pointer-events:auto}.mat-mdc-slider .mdc-slider__input.mat-mdc-slider-input-no-pointer-events{pointer-events:none}.mat-mdc-slider .mdc-slider__input.mat-slider__right-input{left:auto;right:0}.mat-mdc-slider .mdc-slider__thumb,.mat-mdc-slider .mdc-slider__track--active_fill{transition-duration:0ms}.mat-mdc-slider.mat-mdc-slider-with-animation .mdc-slider__thumb,.mat-mdc-slider.mat-mdc-slider-with-animation .mdc-slider__track--active_fill{transition-duration:80ms}.mat-mdc-slider.mdc-slider--discrete .mdc-slider__thumb,.mat-mdc-slider.mdc-slider--discrete .mdc-slider__track--active_fill{transition-duration:0ms}.mat-mdc-slider.mat-mdc-slider-with-animation .mdc-slider__thumb,.mat-mdc-slider.mat-mdc-slider-with-animation .mdc-slider__track--active_fill{transition-duration:80ms}.mat-mdc-slider .mdc-slider__track,.mat-mdc-slider .mdc-slider__thumb{pointer-events:none}.mat-mdc-slider .mdc-slider__value-indicator-container{transform:var(--mat-slider-value-indicator-container-transform)}.mat-mdc-slider .mdc-slider__value-indicator{width:var(--mat-slider-value-indicator-width);height:var(--mat-slider-value-indicator-height);padding:var(--mat-slider-value-indicator-padding);opacity:var(--mat-slider-value-indicator-opacity);border-radius:var(--mat-slider-value-indicator-border-radius)}.mat-mdc-slider .mdc-slider__value-indicator::before{display:var(--mat-slider-value-indicator-caret-display)}.mat-mdc-slider .mdc-slider__value-indicator-text{width:var(--mat-slider-value-indicator-width);transform:var(--mat-slider-value-indicator-text-transform)}.mat-mdc-slider .mat-ripple .mat-ripple-element{background-color:var(--mat-slider-ripple-color)}.mat-mdc-slider .mat-ripple .mat-mdc-slider-hover-ripple{background-color:var(--mat-slider-hover-state-layer-color)}.mat-mdc-slider .mat-ripple .mat-mdc-slider-focus-ripple,.mat-mdc-slider .mat-ripple .mat-mdc-slider-active-ripple{background-color:var(--mat-slider-focus-state-layer-color)}.mat-mdc-slider._mat-animation-noopable.mdc-slider--discrete .mdc-slider__thumb,.mat-mdc-slider._mat-animation-noopable.mdc-slider--discrete .mdc-slider__track--active_fill,.mat-mdc-slider._mat-animation-noopable .mdc-slider__value-indicator{transition:none}.mat-mdc-slider .mat-mdc-focus-indicator::before{border-radius:50%}.mat-mdc-slider .mdc-slider__value-indicator{word-break:normal}.mat-mdc-slider .mdc-slider__value-indicator-text{text-align:center}.mdc-slider__thumb--focused .mat-mdc-focus-indicator::before{content:\"\"}"] }]
        }], ctorParameters: () => [{ type: i0.NgZone }, { type: i0.ChangeDetectorRef }, { type: i0.ElementRef }, { type: i1.Directionality, decorators: [{
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
                }] }], propDecorators: { _trackActive: [{
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
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], discrete: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], showTickMarks: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], min: [{
                type: Input,
                args: [{ transform: numberAttribute }]
            }], color: [{
                type: Input
            }], disableRipple: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], max: [{
                type: Input,
                args: [{ transform: numberAttribute }]
            }], step: [{
                type: Input,
                args: [{ transform: numberAttribute }]
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2xpZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL3NsaWRlci9zbGlkZXIudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvc2xpZGVyL3NsaWRlci5odG1sIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNqRCxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDL0MsT0FBTyxFQUVMLGdCQUFnQixFQUNoQix1QkFBdUIsRUFDdkIsaUJBQWlCLEVBQ2pCLFNBQVMsRUFDVCxZQUFZLEVBQ1osZUFBZSxFQUNmLFVBQVUsRUFDVixNQUFNLEVBQ04sTUFBTSxFQUNOLEtBQUssRUFDTCxNQUFNLEVBQ04sZUFBZSxFQUVmLFFBQVEsRUFDUixTQUFTLEVBQ1QsU0FBUyxFQUNULFlBQVksRUFDWixpQkFBaUIsRUFDakIscUJBQXFCLEdBQ3RCLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBQyx5QkFBeUIsRUFBb0MsTUFBTSx3QkFBd0IsQ0FBQztBQUVwRyxPQUFPLEVBQ0wsU0FBUyxFQUNULFlBQVksRUFLWixzQkFBc0IsRUFDdEIsZ0JBQWdCLEVBQ2hCLFVBQVUsRUFDVix1QkFBdUIsR0FDeEIsTUFBTSxvQkFBb0IsQ0FBQztBQUM1QixPQUFPLEVBQUMsb0JBQW9CLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQzs7O0FBRXBELDREQUE0RDtBQUM1RCxvQ0FBb0M7QUFDcEMsNkJBQTZCO0FBQzdCLDZDQUE2QztBQUU3Qzs7O0dBR0c7QUFxQkgsTUFBTSxPQUFPLFNBQVM7SUFjcEIsc0NBQXNDO0lBQ3RDLElBQ0ksUUFBUTtRQUNWLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUN4QixDQUFDO0lBQ0QsSUFBSSxRQUFRLENBQUMsQ0FBVTtRQUNyQixJQUFJLENB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QUFFLGdCQUFnQixFQUFDO2dCQXNEaEMsR0FBRztzQkFETixLQUFLO3VCQUFDLEVBQUMsU0FBUyxFQUFFLGVBQWUsRUFBQztnQkErRC9CLElBQUk7c0JBRFAsS0FBSzt1QkFBQyxFQUFDLFNBQVMsRUFBRSxlQUFlLEVBQUM7Z0JBZ0YxQixXQUFXO3NCQUFuQixLQUFLOztBQWlsQlIsc0ZBQXNGO0FBQ3RGLFNBQVMsZUFBZSxDQUN0QixPQUFnQixFQUNoQixlQUF1RCxFQUN2RCxpQkFBbUM7SUFFbkMsTUFBTSxVQUFVLEdBQ2QsQ0FBQyxPQUFPLElBQUksaUJBQWlCLEVBQUUsWUFBWSxDQUFDLFlBQVksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0lBQ2xGLE1BQU0sUUFBUSxHQUFHLGVBQWUsQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUN4RCxPQUFPLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FDakQsQ0FBQztJQUVGLElBQUksQ0FBQyxVQUFVLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUM3QixvQ0FBb0MsRUFBRSxDQUFDO0lBQ3pDLENBQUM7QUFDSCxDQUFDO0FBRUQsU0FBUyxvQ0FBb0M7SUFDM0MsTUFBTSxLQUFLLENBQUM7Ozs7Ozs7Ozs7Ozs7O0lBY1YsQ0FBQyxDQUFDO0FBQ04sQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RpcmVjdGlvbmFsaXR5fSBmcm9tICdAYW5ndWxhci9jZGsvYmlkaSc7XG5pbXBvcnQge1BsYXRmb3JtfSBmcm9tICdAYW5ndWxhci9jZGsvcGxhdGZvcm0nO1xuaW1wb3J0IHtcbiAgQWZ0ZXJWaWV3SW5pdCxcbiAgYm9vbGVhbkF0dHJpYnV0ZSxcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIENoYW5nZURldGVjdG9yUmVmLFxuICBDb21wb25lbnQsXG4gIENvbnRlbnRDaGlsZCxcbiAgQ29udGVudENoaWxkcmVuLFxuICBFbGVtZW50UmVmLFxuICBpbmplY3QsXG4gIEluamVjdCxcbiAgSW5wdXQsXG4gIE5nWm9uZSxcbiAgbnVtYmVyQXR0cmlidXRlLFxuICBPbkRlc3Ryb3ksXG4gIE9wdGlvbmFsLFxuICBRdWVyeUxpc3QsXG4gIFZpZXdDaGlsZCxcbiAgVmlld0NoaWxkcmVuLFxuICBWaWV3RW5jYXBzdWxhdGlvbixcbiAgQU5JTUFUSU9OX01PRFVMRV9UWVBFLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7TUFUX1JJUFBMRV9HTE9CQUxfT1BUSU9OUywgUmlwcGxlR2xvYmFsT3B0aW9ucywgVGhlbWVQYWxldHRlfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9jb3JlJztcbmltcG9ydCB7U3Vic2NyaXB0aW9ufSBmcm9tICdyeGpzJztcbmltcG9ydCB7XG4gIF9NYXRUaHVtYixcbiAgX01hdFRpY2tNYXJrLFxuICBfTWF0U2xpZGVyLFxuICBfTWF0U2xpZGVyUmFuZ2VUaHVtYixcbiAgX01hdFNsaWRlclRodW1iLFxuICBfTWF0U2xpZGVyVmlzdWFsVGh1bWIsXG4gIE1BVF9TTElERVJfUkFOR0VfVEhVTUIsXG4gIE1BVF9TTElERVJfVEhVTUIsXG4gIE1BVF9TTElERVIsXG4gIE1BVF9TTElERVJfVklTVUFMX1RIVU1CLFxufSBmcm9tICcuL3NsaWRlci1pbnRlcmZhY2UnO1xuaW1wb3J0IHtNYXRTbGlkZXJWaXN1YWxUaHVtYn0gZnJvbSAnLi9zbGlkZXItdGh1bWInO1xuXG4vLyBUT0RPKHdhZ25lcm1hY2llbCk6IG1heWJlIGhhbmRsZSB0aGUgZm9sbG93aW5nIGVkZ2UgY2FzZTpcbi8vIDEuIHN0YXJ0IGRyYWdnaW5nIGRpc2NyZXRlIHNsaWRlclxuLy8gMi4gdGFiIHRvIGRpc2FibGUgY2hlY2tib3hcbi8vIDMuIHdpdGhvdXQgZW5kaW5nIGRyYWcsIGRpc2FibGUgdGhlIHNsaWRlclxuXG4vKipcbiAqIEFsbG93cyB1c2VycyB0byBzZWxlY3QgZnJvbSBhIHJhbmdlIG9mIHZhbHVlcyBieSBtb3ZpbmcgdGhlIHNsaWRlciB0aHVtYi4gSXQgaXMgc2ltaWxhciBpblxuICogYmVoYXZpb3IgdG8gdGhlIG5hdGl2ZSBgPGlucHV0IHR5cGU9XCJyYW5nZVwiPmAgZWxlbWVudC5cbiAqL1xuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbWF0LXNsaWRlcicsXG4gIHRlbXBsYXRlVXJsOiAnc2xpZGVyLmh0bWwnLFxuICBzdHlsZVVybDogJ3NsaWRlci5jc3MnLFxuICBob3N0OiB7XG4gICAgJ2NsYXNzJzogJ21hdC1tZGMtc2xpZGVyIG1kYy1zbGlkZXInLFxuICAgICdbY2xhc3NdJzogJ1wibWF0LVwiICsgKGNvbG9yIHx8IFwicHJpbWFyeVwiKScsXG4gICAgJ1tjbGFzcy5tZGMtc2xpZGVyLS1yYW5nZV0nOiAnX2lzUmFuZ2UnLFxuICAgICdbY2xhc3MubWRjLXNsaWRlci0tZGlzYWJsZWRdJzogJ2Rpc2FibGVkJyxcbiAgICAnW2NsYXNzLm1kYy1zbGlkZXItLWRpc2NyZXRlXSc6ICdkaXNjcmV0ZScsXG4gICAgJ1tjbGFzcy5tZGMtc2xpZGVyLS10aWNrLW1hcmtzXSc6ICdzaG93VGlja01hcmtzJyxcbiAgICAnW2NsYXNzLl9tYXQtYW5pbWF0aW9uLW5vb3BhYmxlXSc6ICdfbm9vcEFuaW1hdGlvbnMnLFxuICB9LFxuICBleHBvcnRBczogJ21hdFNsaWRlcicsXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxuICBwcm92aWRlcnM6IFt7cHJvdmlkZTogTUFUX1NMSURFUiwgdXNlRXhpc3Rpbmc6IE1hdFNsaWRlcn1dLFxuICBzdGFuZGFsb25lOiB0cnVlLFxuICBpbXBvcnRzOiBbTWF0U2xpZGVyVmlzdWFsVGh1bWJdLFxufSlcbmV4cG9ydCBjbGFzcyBNYXRTbGlkZXIgaW1wbGVtZW50cyBBZnRlclZpZXdJbml0LCBPbkRlc3Ryb3ksIF9NYXRTbGlkZXIge1xuICAvKiogVGhlIGFjdGl2ZSBwb3J0aW9uIG9mIHRoZSBzbGlkZXIgdHJhY2suICovXG4gIEBWaWV3Q2hpbGQoJ3RyYWNrQWN0aXZlJykgX3RyYWNrQWN0aXZlOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PjtcblxuICAvKiogVGhlIHNsaWRlciB0aHVtYihzKS4gKi9cbiAgQFZpZXdDaGlsZHJlbihNQVRfU0xJREVSX1ZJU1VBTF9USFVNQikgX3RodW1iczogUXVlcnlMaXN0PF9NYXRTbGlkZXJWaXN1YWxUaHVtYj47XG5cbiAgLyoqIFRoZSBzbGlkZXJzIGhpZGRlbiByYW5nZSBpbnB1dChzKS4gKi9cbiAgQENvbnRlbnRDaGlsZChNQVRfU0xJREVSX1RIVU1CKSBfaW5wdXQ6IF9NYXRTbGlkZXJUaHVtYjtcblxuICAvKiogVGhlIHNsaWRlcnMgaGlkZGVuIHJhbmdlIGlucHV0KHMpLiAqL1xuICBAQ29udGVudENoaWxkcmVuKE1BVF9TTElERVJfUkFOR0VfVEhVTUIsIHtkZXNjZW5kYW50czogZmFsc2V9KVxuICBfaW5wdXRzOiBRdWVyeUxpc3Q8X01hdFNsaWRlclJhbmdlVGh1bWI+O1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBzbGlkZXIgaXMgZGlzYWJsZWQuICovXG4gIEBJbnB1dCh7dHJhbnNmb3JtOiBib29sZWFuQXR0cmlidXRlfSlcbiAgZ2V0IGRpc2FibGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9kaXNhYmxlZDtcbiAgfVxuICBzZXQgZGlzYWJsZWQodjogYm9vbGVhbikge1xuICAgIHRoaXMuX2Rpc2FibGVkID0gdjtcbiAgICBjb25zdCBlbmRJbnB1dCA9IHRoaXMuX2dldElucHV0KF9NYXRUaHVtYi5FTkQpO1xuICAgIGNvbnN0IHN0YXJ0SW5wdXQgPSB0aGlzLl9nZXRJbnB1dChfTWF0VGh1bWIuU1RBUlQpO1xuXG4gICAgaWYgKGVuZElucHV0KSB7XG4gICAgICBlbmRJbnB1dC5kaXNhYmxlZCA9IHRoaXMuX2Rpc2FibGVkO1xuICAgIH1cbiAgICBpZiAoc3RhcnRJbnB1dCkge1xuICAgICAgc3RhcnRJbnB1dC5kaXNhYmxlZCA9IHRoaXMuX2Rpc2FibGVkO1xuICAgIH1cbiAgfVxuICBwcml2YXRlIF9kaXNhYmxlZDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBzbGlkZXIgZGlzcGxheXMgYSBudW1lcmljIHZhbHVlIGxhYmVsIHVwb24gcHJlc3NpbmcgdGhlIHRodW1iLiAqL1xuICBASW5wdXQoe3RyYW5zZm9ybTogYm9vbGVhbkF0dHJpYnV0ZX0pXG4gIGdldCBkaXNjcmV0ZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fZGlzY3JldGU7XG4gIH1cbiAgc2V0IGRpc2NyZXRlKHY6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl9kaXNjcmV0ZSA9IHY7XG4gICAgdGhpcy5fdXBkYXRlVmFsdWVJbmRpY2F0b3JVSXMoKTtcbiAgfVxuICBwcml2YXRlIF9kaXNjcmV0ZTogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBzbGlkZXIgZGlzcGxheXMgdGljayBtYXJrcyBhbG9uZyB0aGUgc2xpZGVyIHRyYWNrLiAqL1xuICBASW5wdXQoe3RyYW5zZm9ybTogYm9vbGVhbkF0dHJpYnV0ZX0pXG4gIHNob3dUaWNrTWFya3M6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAvKiogVGhlIG1pbmltdW0gdmFsdWUgdGhhdCB0aGUgc2xpZGVyIGNhbiBoYXZlLiAqL1xuICBASW5wdXQoe3RyYW5zZm9ybTogbnVtYmVyQXR0cmlidXRlfSlcbiAgZ2V0IG1pbigpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9taW47XG4gIH1cbiAgc2V0IG1pbih2OiBudW1iZXIpIHtcbiAgICBjb25zdCBtaW4gPSBpc05hTih2KSA/IHRoaXMuX21pbiA6IHY7XG4gICAgaWYgKHRoaXMuX21pbiAhPT0gbWluKSB7XG4gICAgICB0aGlzLl91cGRhdGVNaW4obWluKTtcbiAgICB9XG4gIH1cbiAgcHJpdmF0ZSBfbWluOiBudW1iZXIgPSAwO1xuXG4gIC8qKiBQYWxldHRlIGNvbG9yIG9mIHRoZSBzbGlkZXIuICovXG4gIEBJbnB1dCgpXG4gIGNvbG9yOiBUaGVtZVBhbGV0dGU7XG5cbiAgLyoqIFdoZXRoZXIgcmlwcGxlcyBhcmUgZGlzYWJsZWQgaW4gdGhlIHNsaWRlci4gKi9cbiAgQElucHV0KHt0cmFuc2Zvcm06IGJvb2xlYW5BdHRyaWJ1dGV9KVxuICBkaXNhYmxlUmlwcGxlOiBib29sZWFuID0gZmFsc2U7XG5cbiAgcHJpdmF0ZSBfdXBkYXRlTWluKG1pbjogbnVtYmVyKTogdm9pZCB7XG4gICAgY29uc3QgcHJldk1pbiA9IHRoaXMuX21pbjtcbiAgICB0aGlzLl9taW4gPSBtaW47XG4gICAgdGhpcy5faXNSYW5nZSA/IHRoaXMuX3VwZGF0ZU1pblJhbmdlKHtvbGQ6IHByZXZNaW4sIG5ldzogbWlufSkgOiB0aGlzLl91cGRhdGVNaW5Ob25SYW5nZShtaW4pO1xuICAgIHRoaXMuX29uTWluTWF4T3JTdGVwQ2hhbmdlKCk7XG4gIH1cblxuICBwcml2YXRlIF91cGRhdGVNaW5SYW5nZShtaW46IHtvbGQ6IG51bWJlcjsgbmV3OiBudW1iZXJ9KTogdm9pZCB7XG4gICAgY29uc3QgZW5kSW5wdXQgPSB0aGlzLl9nZXRJbnB1dChfTWF0VGh1bWIuRU5EKSBhcyBfTWF0U2xpZGVyUmFuZ2VUaHVtYjtcbiAgICBjb25zdCBzdGFydElucHV0ID0gdGhpcy5fZ2V0SW5wdXQoX01hdFRodW1iLlNUQVJUKSBhcyBfTWF0U2xpZGVyUmFuZ2VUaHVtYjtcblxuICAgIGNvbnN0IG9sZEVuZFZhbHVlID0gZW5kSW5wdXQudmFsdWU7XG4gICAgY29uc3Qgb2xkU3RhcnRWYWx1ZSA9IHN0YXJ0SW5wdXQudmFsdWU7XG5cbiAgICBzdGFydElucHV0Lm1pbiA9IG1pbi5uZXc7XG4gICAgZW5kSW5wdXQubWluID0gTWF0aC5tYXgobWluLm5ldywgc3RhcnRJbnB1dC52YWx1ZSk7XG4gICAgc3RhcnRJbnB1dC5tYXggPSBNYXRoLm1pbihlbmRJbnB1dC5tYXgsIGVuZElucHV0LnZhbHVlKTtcblxuICAgIHN0YXJ0SW5wdXQuX3VwZGF0ZVdpZHRoSW5hY3RpdmUoKTtcbiAgICBlbmRJbnB1dC5fdXBkYXRlV2lkdGhJbmFjdGl2ZSgpO1xuXG4gICAgbWluLm5ldyA8IG1pbi5vbGRcbiAgICAgID8gdGhpcy5fb25UcmFuc2xhdGVYQ2hhbmdlQnlTaWRlRWZmZWN0KGVuZElucHV0LCBzdGFydElucHV0KVxuICAgICAgOiB0aGlzLl9vblRyYW5zbGF0ZVhDaGFuZ2VCeVNpZGVFZmZlY3Qoc3RhcnRJbnB1dCwgZW5kSW5wdXQpO1xuXG4gICAgaWYgKG9sZEVuZFZhbHVlICE9PSBlbmRJbnB1dC52YWx1ZSkge1xuICAgICAgdGhpcy5fb25WYWx1ZUNoYW5nZShlbmRJbnB1dCk7XG4gICAgfVxuXG4gICAgaWYgKG9sZFN0YXJ0VmFsdWUgIT09IHN0YXJ0SW5wdXQudmFsdWUpIHtcbiAgICAgIHRoaXMuX29uVmFsdWVDaGFuZ2Uoc3RhcnRJbnB1dCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfdXBkYXRlTWluTm9uUmFuZ2UobWluOiBudW1iZXIpOiB2b2lkIHtcbiAgICBjb25zdCBpbnB1dCA9IHRoaXMuX2dldElucHV0KF9NYXRUaHVtYi5FTkQpO1xuICAgIGlmIChpbnB1dCkge1xuICAgICAgY29uc3Qgb2xkVmFsdWUgPSBpbnB1dC52YWx1ZTtcblxuICAgICAgaW5wdXQubWluID0gbWluO1xuICAgICAgaW5wdXQuX3VwZGF0ZVRodW1iVUlCeVZhbHVlKCk7XG4gICAgICB0aGlzLl91cGRhdGVUcmFja1VJKGlucHV0KTtcblxuICAgICAgaWYgKG9sZFZhbHVlICE9PSBpbnB1dC52YWx1ZSkge1xuICAgICAgICB0aGlzLl9vblZhbHVlQ2hhbmdlKGlucHV0KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKiogVGhlIG1heGltdW0gdmFsdWUgdGhhdCB0aGUgc2xpZGVyIGNhbiBoYXZlLiAqL1xuICBASW5wdXQoe3RyYW5zZm9ybTogbnVtYmVyQXR0cmlidXRlfSlcbiAgZ2V0IG1heCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9tYXg7XG4gIH1cbiAgc2V0IG1heCh2OiBudW1iZXIpIHtcbiAgICBjb25zdCBtYXggPSBpc05hTih2KSA/IHRoaXMuX21heCA6IHY7XG4gICAgaWYgKHRoaXMuX21heCAhPT0gbWF4KSB7XG4gICAgICB0aGlzLl91cGRhdGVNYXgobWF4KTtcbiAgICB9XG4gIH1cbiAgcHJpdmF0ZSBfbWF4OiBudW1iZXIgPSAxMDA7XG5cbiAgcHJpdmF0ZSBfdXBkYXRlTWF4KG1heDogbnVtYmVyKTogdm9pZCB7XG4gICAgY29uc3QgcHJldk1heCA9IHRoaXMuX21heDtcbiAgICB0aGlzLl9tYXggPSBtYXg7XG4gICAgdGhpcy5faXNSYW5nZSA/IHRoaXMuX3VwZGF0ZU1heFJhbmdlKHtvbGQ6IHByZXZNYXgsIG5ldzogbWF4fSkgOiB0aGlzLl91cGRhdGVNYXhOb25SYW5nZShtYXgpO1xuICAgIHRoaXMuX29uTWluTWF4T3JTdGVwQ2hhbmdlKCk7XG4gIH1cblxuICBwcml2YXRlIF91cGRhdGVNYXhSYW5nZShtYXg6IHtvbGQ6IG51bWJlcjsgbmV3OiBudW1iZXJ9KTogdm9pZCB7XG4gICAgY29uc3QgZW5kSW5wdXQgPSB0aGlzLl9nZXRJbnB1dChfTWF0VGh1bWIuRU5EKSBhcyBfTWF0U2xpZGVyUmFuZ2VUaHVtYjtcbiAgICBjb25zdCBzdGFydElucHV0ID0gdGhpcy5fZ2V0SW5wdXQoX01hdFRodW1iLlNUQVJUKSBhcyBfTWF0U2xpZGVyUmFuZ2VUaHVtYjtcblxuICAgIGNvbnN0IG9sZEVuZFZhbHVlID0gZW5kSW5wdXQudmFsdWU7XG4gICAgY29uc3Qgb2xkU3RhcnRWYWx1ZSA9IHN0YXJ0SW5wdXQudmFsdWU7XG5cbiAgICBlbmRJbnB1dC5tYXggPSBtYXgubmV3O1xuICAgIHN0YXJ0SW5wdXQubWF4ID0gTWF0aC5taW4obWF4Lm5ldywgZW5kSW5wdXQudmFsdWUpO1xuICAgIGVuZElucHV0Lm1pbiA9IHN0YXJ0SW5wdXQudmFsdWU7XG5cbiAgICBlbmRJbnB1dC5fdXBkYXRlV2lkdGhJbmFjdGl2ZSgpO1xuICAgIHN0YXJ0SW5wdXQuX3VwZGF0ZVdpZHRoSW5hY3RpdmUoKTtcblxuICAgIG1heC5uZXcgPiBtYXgub2xkXG4gICAgICA/IHRoaXMuX29uVHJhbnNsYXRlWENoYW5nZUJ5U2lkZUVmZmVjdChzdGFydElucHV0LCBlbmRJbnB1dClcbiAgICAgIDogdGhpcy5fb25UcmFuc2xhdGVYQ2hhbmdlQnlTaWRlRWZmZWN0KGVuZElucHV0LCBzdGFydElucHV0KTtcblxuICAgIGlmIChvbGRFbmRWYWx1ZSAhPT0gZW5kSW5wdXQudmFsdWUpIHtcbiAgICAgIHRoaXMuX29uVmFsdWVDaGFuZ2UoZW5kSW5wdXQpO1xuICAgIH1cblxuICAgIGlmIChvbGRTdGFydFZhbHVlICE9PSBzdGFydElucHV0LnZhbHVlKSB7XG4gICAgICB0aGlzLl9vblZhbHVlQ2hhbmdlKHN0YXJ0SW5wdXQpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3VwZGF0ZU1heE5vblJhbmdlKG1heDogbnVtYmVyKTogdm9pZCB7XG4gICAgY29uc3QgaW5wdXQgPSB0aGlzLl9nZXRJbnB1dChfTWF0VGh1bWIuRU5EKTtcbiAgICBpZiAoaW5wdXQpIHtcbiAgICAgIGNvbnN0IG9sZFZhbHVlID0gaW5wdXQudmFsdWU7XG5cbiAgICAgIGlucHV0Lm1heCA9IG1heDtcbiAgICAgIGlucHV0Ll91cGRhdGVUaHVtYlVJQnlWYWx1ZSgpO1xuICAgICAgdGhpcy5fdXBkYXRlVHJhY2tVSShpbnB1dCk7XG5cbiAgICAgIGlmIChvbGRWYWx1ZSAhPT0gaW5wdXQudmFsdWUpIHtcbiAgICAgICAgdGhpcy5fb25WYWx1ZUNoYW5nZShpbnB1dCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqIFRoZSB2YWx1ZXMgYXQgd2hpY2ggdGhlIHRodW1iIHdpbGwgc25hcC4gKi9cbiAgQElucHV0KHt0cmFuc2Zvcm06IG51bWJlckF0dHJpYnV0ZX0pXG4gIGdldCBzdGVwKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX3N0ZXA7XG4gIH1cbiAgc2V0IHN0ZXAodjogbnVtYmVyKSB7XG4gICAgY29uc3Qgc3RlcCA9IGlzTmFOKHYpID8gdGhpcy5fc3RlcCA6IHY7XG4gICAgaWYgKHRoaXMuX3N0ZXAgIT09IHN0ZXApIHtcbiAgICAgIHRoaXMuX3VwZGF0ZVN0ZXAoc3RlcCk7XG4gICAgfVxuICB9XG4gIHByaXZhdGUgX3N0ZXA6IG51bWJlciA9IDE7XG5cbiAgcHJpdmF0ZSBfdXBkYXRlU3RlcChzdGVwOiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLl9zdGVwID0gc3RlcDtcbiAgICB0aGlzLl9pc1JhbmdlID8gdGhpcy5fdXBkYXRlU3RlcFJhbmdlKCkgOiB0aGlzLl91cGRhdGVTdGVwTm9uUmFuZ2UoKTtcbiAgICB0aGlzLl9vbk1pbk1heE9yU3RlcENoYW5nZSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBfdXBkYXRlU3RlcFJhbmdlKCk6IHZvaWQge1xuICAgIGNvbnN0IGVuZElucHV0ID0gdGhpcy5fZ2V0SW5wdXQoX01hdFRodW1iLkVORCkgYXMgX01hdFNsaWRlclJhbmdlVGh1bWI7XG4gICAgY29uc3Qgc3RhcnRJbnB1dCA9IHRoaXMuX2dldElucHV0KF9NYXRUaHVtYi5TVEFSVCkgYXMgX01hdFNsaWRlclJhbmdlVGh1bWI7XG5cbiAgICBjb25zdCBvbGRFbmRWYWx1ZSA9IGVuZElucHV0LnZhbHVlO1xuICAgIGNvbnN0IG9sZFN0YXJ0VmFsdWUgPSBzdGFydElucHV0LnZhbHVlO1xuXG4gICAgY29uc3QgcHJldlN0YXJ0VmFsdWUgPSBzdGFydElucHV0LnZhbHVlO1xuXG4gICAgZW5kSW5wdXQubWluID0gdGhpcy5fbWluO1xuICAgIHN0YXJ0SW5wdXQubWF4ID0gdGhpcy5fbWF4O1xuXG4gICAgZW5kSW5wdXQuc3RlcCA9IHRoaXMuX3N0ZXA7XG4gICAgc3RhcnRJbnB1dC5zdGVwID0gdGhpcy5fc3RlcDtcblxuICAgIGlmICh0aGlzLl9wbGF0Zm9ybS5TQUZBUkkpIHtcbiAgICAgIGVuZElucHV0LnZhbHVlID0gZW5kSW5wdXQudmFsdWU7XG4gICAgICBzdGFydElucHV0LnZhbHVlID0gc3RhcnRJbnB1dC52YWx1ZTtcbiAgICB9XG5cbiAgICBlbmRJbnB1dC5taW4gPSBNYXRoLm1heCh0aGlzLl9taW4sIHN0YXJ0SW5wdXQudmFsdWUpO1xuICAgIHN0YXJ0SW5wdXQubWF4ID0gTWF0aC5taW4odGhpcy5fbWF4LCBlbmRJbnB1dC52YWx1ZSk7XG5cbiAgICBzdGFydElucHV0Ll91cGRhdGVXaWR0aEluYWN0aXZlKCk7XG4gICAgZW5kSW5wdXQuX3VwZGF0ZVdpZHRoSW5hY3RpdmUoKTtcblxuICAgIGVuZElucHV0LnZhbHVlIDwgcHJldlN0YXJ0VmFsdWVcbiAgICAgID8gdGhpcy5fb25UcmFuc2xhdGVYQ2hhbmdlQnlTaWRlRWZmZWN0KHN0YXJ0SW5wdXQsIGVuZElucHV0KVxuICAgICAgOiB0aGlzLl9vblRyYW5zbGF0ZVhDaGFuZ2VCeVNpZGVFZmZlY3QoZW5kSW5wdXQsIHN0YXJ0SW5wdXQpO1xuXG4gICAgaWYgKG9sZEVuZFZhbHVlICE9PSBlbmRJbnB1dC52YWx1ZSkge1xuICAgICAgdGhpcy5fb25WYWx1ZUNoYW5nZShlbmRJbnB1dCk7XG4gICAgfVxuXG4gICAgaWYgKG9sZFN0YXJ0VmFsdWUgIT09IHN0YXJ0SW5wdXQudmFsdWUpIHtcbiAgICAgIHRoaXMuX29uVmFsdWVDaGFuZ2Uoc3RhcnRJbnB1dCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfdXBkYXRlU3RlcE5vblJhbmdlKCk6IHZvaWQge1xuICAgIGNvbnN0IGlucHV0ID0gdGhpcy5fZ2V0SW5wdXQoX01hdFRodW1iLkVORCk7XG4gICAgaWYgKGlucHV0KSB7XG4gICAgICBjb25zdCBvbGRWYWx1ZSA9IGlucHV0LnZhbHVlO1xuXG4gICAgICBpbnB1dC5zdGVwID0gdGhpcy5fc3RlcDtcbiAgICAgIGlmICh0aGlzLl9wbGF0Zm9ybS5TQUZBUkkpIHtcbiAgICAgICAgaW5wdXQudmFsdWUgPSBpbnB1dC52YWx1ZTtcbiAgICAgIH1cblxuICAgICAgaW5wdXQuX3VwZGF0ZVRodW1iVUlCeVZhbHVlKCk7XG5cbiAgICAgIGlmIChvbGRWYWx1ZSAhPT0gaW5wdXQudmFsdWUpIHtcbiAgICAgICAgdGhpcy5fb25WYWx1ZUNoYW5nZShpbnB1dCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEZ1bmN0aW9uIHRoYXQgd2lsbCBiZSB1c2VkIHRvIGZvcm1hdCB0aGUgdmFsdWUgYmVmb3JlIGl0IGlzIGRpc3BsYXllZFxuICAgKiBpbiB0aGUgdGh1bWIgbGFiZWwuIENhbiBiZSB1c2VkIHRvIGZvcm1hdCB2ZXJ5IGxhcmdlIG51bWJlciBpbiBvcmRlclxuICAgKiBmb3IgdGhlbSB0byBmaXQgaW50byB0aGUgc2xpZGVyIHRodW1iLlxuICAgKi9cbiAgQElucHV0KCkgZGlzcGxheVdpdGg6ICh2YWx1ZTogbnVtYmVyKSA9PiBzdHJpbmcgPSAodmFsdWU6IG51bWJlcikgPT4gYCR7dmFsdWV9YDtcblxuICAvKiogVXNlZCB0byBrZWVwIHRyYWNrIG9mICYgcmVuZGVyIHRoZSBhY3RpdmUgJiBpbmFjdGl2ZSB0aWNrIG1hcmtzIG9uIHRoZSBzbGlkZXIgdHJhY2suICovXG4gIF90aWNrTWFya3M6IF9NYXRUaWNrTWFya1tdO1xuXG4gIC8qKiBXaGV0aGVyIGFuaW1hdGlvbnMgaGF2ZSBiZWVuIGRpc2FibGVkLiAqL1xuICBfbm9vcEFuaW1hdGlvbnM6IGJvb2xlYW47XG5cbiAgLyoqIFN1YnNjcmlwdGlvbiB0byBjaGFuZ2VzIHRvIHRoZSBkaXJlY3Rpb25hbGl0eSAoTFRSIC8gUlRMKSBjb250ZXh0IGZvciB0aGUgYXBwbGljYXRpb24uICovXG4gIHByaXZhdGUgX2RpckNoYW5nZVN1YnNjcmlwdGlvbjogU3Vic2NyaXB0aW9uO1xuXG4gIC8qKiBPYnNlcnZlciB1c2VkIHRvIG1vbml0b3Igc2l6ZSBjaGFuZ2VzIGluIHRoZSBzbGlkZXIuICovXG4gIHByaXZhdGUgX3Jlc2l6ZU9ic2VydmVyOiBSZXNpemVPYnNlcnZlciB8IG51bGw7XG5cbiAgLy8gU3RvcmVkIGRpbWVuc2lvbnMgdG8gYXZvaWQgY2FsbGluZyBnZXRCb3VuZGluZ0NsaWVudFJlY3QgcmVkdW5kYW50bHkuXG5cbiAgX2NhY2hlZFdpZHRoOiBudW1iZXI7XG4gIF9jYWNoZWRMZWZ0OiBudW1iZXI7XG5cbiAgX3JpcHBsZVJhZGl1czogbnVtYmVyID0gMjQ7XG5cbiAgLy8gVGhlIHZhbHVlIGluZGljYXRvciB0b29sdGlwIHRleHQgZm9yIHRoZSB2aXN1YWwgc2xpZGVyIHRodW1iKHMpLlxuXG4gIC8qKiBAZG9jcy1wcml2YXRlICovXG4gIHByb3RlY3RlZCBzdGFydFZhbHVlSW5kaWNhdG9yVGV4dDogc3RyaW5nID0gJyc7XG5cbiAgLyoqIEBkb2NzLXByaXZhdGUgKi9cbiAgcHJvdGVjdGVkIGVuZFZhbHVlSW5kaWNhdG9yVGV4dDogc3RyaW5nID0gJyc7XG5cbiAgLy8gVXNlZCB0byBjb250cm9sIHRoZSB0cmFuc2xhdGVYIG9mIHRoZSB2aXN1YWwgc2xpZGVyIHRodW1iKHMpLlxuXG4gIF9lbmRUaHVtYlRyYW5zZm9ybTogc3RyaW5nO1xuICBfc3RhcnRUaHVtYlRyYW5zZm9ybTogc3RyaW5nO1xuXG4gIF9pc1JhbmdlOiBib29sZWFuID0gZmFsc2U7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIHNsaWRlciBpcyBydGwuICovXG4gIF9pc1J0bDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIHByaXZhdGUgX2hhc1ZpZXdJbml0aWFsaXplZDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBUaGUgd2lkdGggb2YgdGhlIHRpY2sgbWFyayB0cmFjay5cbiAgICogVGhlIHRpY2sgbWFyayB0cmFjayB3aWR0aCBpcyBkaWZmZXJlbnQgZnJvbSBmdWxsIHRyYWNrIHdpZHRoXG4gICAqL1xuICBfdGlja01hcmtUcmFja1dpZHRoOiBudW1iZXIgPSAwO1xuXG4gIF9oYXNBbmltYXRpb246IGJvb2xlYW4gPSBmYWxzZTtcblxuICBwcml2YXRlIF9yZXNpemVUaW1lcjogbnVsbCB8IFJldHVyblR5cGU8dHlwZW9mIHNldFRpbWVvdXQ+ID0gbnVsbDtcblxuICBwcml2YXRlIF9wbGF0Zm9ybSA9IGluamVjdChQbGF0Zm9ybSk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcmVhZG9ubHkgX25nWm9uZTogTmdab25lLFxuICAgIHJlYWRvbmx5IF9jZHI6IENoYW5nZURldGVjdG9yUmVmLFxuICAgIHJlYWRvbmx5IF9lbGVtZW50UmVmOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PixcbiAgICBAT3B0aW9uYWwoKSByZWFkb25seSBfZGlyOiBEaXJlY3Rpb25hbGl0eSxcbiAgICBAT3B0aW9uYWwoKVxuICAgIEBJbmplY3QoTUFUX1JJUFBMRV9HTE9CQUxfT1BUSU9OUylcbiAgICByZWFkb25seSBfZ2xvYmFsUmlwcGxlT3B0aW9ucz86IFJpcHBsZUdsb2JhbE9wdGlvbnMsXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChBTklNQVRJT05fTU9EVUxFX1RZUEUpIGFuaW1hdGlvbk1vZGU/OiBzdHJpbmcsXG4gICkge1xuICAgIHRoaXMuX25vb3BBbmltYXRpb25zID0gYW5pbWF0aW9uTW9kZSA9PT0gJ05vb3BBbmltYXRpb25zJztcbiAgICB0aGlzLl9kaXJDaGFuZ2VTdWJzY3JpcHRpb24gPSB0aGlzLl9kaXIuY2hhbmdlLnN1YnNjcmliZSgoKSA9PiB0aGlzLl9vbkRpckNoYW5nZSgpKTtcbiAgICB0aGlzLl9pc1J0bCA9IHRoaXMuX2Rpci52YWx1ZSA9PT0gJ3J0bCc7XG4gIH1cblxuICAvKiogVGhlIHJhZGl1cyBvZiB0aGUgbmF0aXZlIHNsaWRlcidzIGtub2IuIEFGQUlLIHRoZXJlIGlzIG5vIHdheSB0byBhdm9pZCBoYXJkY29kaW5nIHRoaXMuICovXG4gIF9rbm9iUmFkaXVzOiBudW1iZXIgPSA4O1xuXG4gIF9pbnB1dFBhZGRpbmc6IG51bWJlcjtcblxuICBuZ0FmdGVyVmlld0luaXQoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3BsYXRmb3JtLmlzQnJvd3Nlcikge1xuICAgICAgdGhpcy5fdXBkYXRlRGltZW5zaW9ucygpO1xuICAgIH1cblxuICAgIGNvbnN0IGVJbnB1dCA9IHRoaXMuX2dldElucHV0KF9NYXRUaHVtYi5FTkQpO1xuICAgIGNvbnN0IHNJbnB1dCA9IHRoaXMuX2dldElucHV0KF9NYXRUaHVtYi5TVEFSVCk7XG4gICAgdGhpcy5faXNSYW5nZSA9ICEhZUlucHV0ICYmICEhc0lucHV0O1xuICAgIHRoaXMuX2Nkci5kZXRlY3RDaGFuZ2VzKCk7XG5cbiAgICBpZiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSB7XG4gICAgICBfdmFsaWRhdGVJbnB1dHMoXG4gICAgICAgIHRoaXMuX2lzUmFuZ2UsXG4gICAgICAgIHRoaXMuX2dldElucHV0KF9NYXRUaHVtYi5FTkQpISxcbiAgICAgICAgdGhpcy5fZ2V0SW5wdXQoX01hdFRodW1iLlNUQVJUKSxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgY29uc3QgdGh1bWIgPSB0aGlzLl9nZXRUaHVtYihfTWF0VGh1bWIuRU5EKTtcbiAgICB0aGlzLl9yaXBwbGVSYWRpdXMgPSB0aHVtYi5fcmlwcGxlLnJhZGl1cztcbiAgICB0aGlzLl9pbnB1dFBhZGRpbmcgPSB0aGlzLl9yaXBwbGVSYWRpdXMgLSB0aGlzLl9rbm9iUmFkaXVzO1xuXG4gICAgdGhpcy5faXNSYW5nZVxuICAgICAgPyB0aGlzLl9pbml0VUlSYW5nZShlSW5wdXQgYXMgX01hdFNsaWRlclJhbmdlVGh1bWIsIHNJbnB1dCBhcyBfTWF0U2xpZGVyUmFuZ2VUaHVtYilcbiAgICAgIDogdGhpcy5faW5pdFVJTm9uUmFuZ2UoZUlucHV0ISk7XG5cbiAgICB0aGlzLl91cGRhdGVUcmFja1VJKGVJbnB1dCEpO1xuICAgIHRoaXMuX3VwZGF0ZVRpY2tNYXJrVUkoKTtcbiAgICB0aGlzLl91cGRhdGVUaWNrTWFya1RyYWNrVUkoKTtcblxuICAgIHRoaXMuX29ic2VydmVIb3N0UmVzaXplKCk7XG4gICAgdGhpcy5fY2RyLmRldGVjdENoYW5nZXMoKTtcbiAgfVxuXG4gIHByaXZhdGUgX2luaXRVSU5vblJhbmdlKGVJbnB1dDogX01hdFNsaWRlclRodW1iKTogdm9pZCB7XG4gICAgZUlucHV0LmluaXRQcm9wcygpO1xuICAgIGVJbnB1dC5pbml0VUkoKTtcblxuICAgIHRoaXMuX3VwZGF0ZVZhbHVlSW5kaWNhdG9yVUkoZUlucHV0KTtcblxuICAgIHRoaXMuX2hhc1ZpZXdJbml0aWFsaXplZCA9IHRydWU7XG4gICAgZUlucHV0Ll91cGRhdGVUaHVtYlVJQnlWYWx1ZSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBfaW5pdFVJUmFuZ2UoZUlucHV0OiBfTWF0U2xpZGVyUmFuZ2VUaHVtYiwgc0lucHV0OiBfTWF0U2xpZGVyUmFuZ2VUaHVtYik6IHZvaWQge1xuICAgIGVJbnB1dC5pbml0UHJvcHMoKTtcbiAgICBlSW5wdXQuaW5pdFVJKCk7XG5cbiAgICBzSW5wdXQuaW5pdFByb3BzKCk7XG4gICAgc0lucHV0LmluaXRVSSgpO1xuXG4gICAgZUlucHV0Ll91cGRhdGVNaW5NYXgoKTtcbiAgICBzSW5wdXQuX3VwZGF0ZU1pbk1heCgpO1xuXG4gICAgZUlucHV0Ll91cGRhdGVTdGF0aWNTdHlsZXMoKTtcbiAgICBzSW5wdXQuX3VwZGF0ZVN0YXRpY1N0eWxlcygpO1xuXG4gICAgdGhpcy5fdXBkYXRlVmFsdWVJbmRpY2F0b3JVSXMoKTtcblxuICAgIHRoaXMuX2hhc1ZpZXdJbml0aWFsaXplZCA9IHRydWU7XG5cbiAgICBlSW5wdXQuX3VwZGF0ZVRodW1iVUlCeVZhbHVlKCk7XG4gICAgc0lucHV0Ll91cGRhdGVUaHVtYlVJQnlWYWx1ZSgpO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5fZGlyQ2hhbmdlU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgdGhpcy5fcmVzaXplT2JzZXJ2ZXI/LmRpc2Nvbm5lY3QoKTtcbiAgICB0aGlzLl9yZXNpemVPYnNlcnZlciA9IG51bGw7XG4gIH1cblxuICAvKiogSGFuZGxlcyB1cGRhdGluZyB0aGUgc2xpZGVyIHVpIGFmdGVyIGEgZGlyIGNoYW5nZS4gKi9cbiAgcHJpdmF0ZSBfb25EaXJDaGFuZ2UoKTogdm9pZCB7XG4gICAgdGhpcy5faXNSdGwgPSB0aGlzLl9kaXIudmFsdWUgPT09ICdydGwnO1xuICAgIHRoaXMuX2lzUmFuZ2UgPyB0aGlzLl9vbkRpckNoYW5nZVJhbmdlKCkgOiB0aGlzLl9vbkRpckNoYW5nZU5vblJhbmdlKCk7XG4gICAgdGhpcy5fdXBkYXRlVGlja01hcmtVSSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBfb25EaXJDaGFuZ2VSYW5nZSgpOiB2b2lkIHtcbiAgICBjb25zdCBlbmRJbnB1dCA9IHRoaXMuX2dldElucHV0KF9NYXRUaHVtYi5FTkQpIGFzIF9NYXRTbGlkZXJSYW5nZVRodW1iO1xuICAgIGNvbnN0IHN0YXJ0SW5wdXQgPSB0aGlzLl9nZXRJbnB1dChfTWF0VGh1bWIuU1RBUlQpIGFzIF9NYXRTbGlkZXJSYW5nZVRodW1iO1xuXG4gICAgZW5kSW5wdXQuX3NldElzTGVmdFRodW1iKCk7XG4gICAgc3RhcnRJbnB1dC5fc2V0SXNMZWZ0VGh1bWIoKTtcblxuICAgIGVuZElucHV0LnRyYW5zbGF0ZVggPSBlbmRJbnB1dC5fY2FsY1RyYW5zbGF0ZVhCeVZhbHVlKCk7XG4gICAgc3RhcnRJbnB1dC50cmFuc2xhdGVYID0gc3RhcnRJbnB1dC5fY2FsY1RyYW5zbGF0ZVhCeVZhbHVlKCk7XG5cbiAgICBlbmRJbnB1dC5fdXBkYXRlU3RhdGljU3R5bGVzKCk7XG4gICAgc3RhcnRJbnB1dC5fdXBkYXRlU3RhdGljU3R5bGVzKCk7XG5cbiAgICBlbmRJbnB1dC5fdXBkYXRlV2lkdGhJbmFjdGl2ZSgpO1xuICAgIHN0YXJ0SW5wdXQuX3VwZGF0ZVdpZHRoSW5hY3RpdmUoKTtcblxuICAgIGVuZElucHV0Ll91cGRhdGVUaHVtYlVJQnlWYWx1ZSgpO1xuICAgIHN0YXJ0SW5wdXQuX3VwZGF0ZVRodW1iVUlCeVZhbHVlKCk7XG4gIH1cblxuICBwcml2YXRlIF9vbkRpckNoYW5nZU5vblJhbmdlKCk6IHZvaWQge1xuICAgIGNvbnN0IGlucHV0ID0gdGhpcy5fZ2V0SW5wdXQoX01hdFRodW1iLkVORCkhO1xuICAgIGlucHV0Ll91cGRhdGVUaHVtYlVJQnlWYWx1ZSgpO1xuICB9XG5cbiAgLyoqIFN0YXJ0cyBvYnNlcnZpbmcgYW5kIHVwZGF0aW5nIHRoZSBzbGlkZXIgaWYgdGhlIGhvc3QgY2hhbmdlcyBpdHMgc2l6ZS4gKi9cbiAgcHJpdmF0ZSBfb2JzZXJ2ZUhvc3RSZXNpemUoKSB7XG4gICAgaWYgKHR5cGVvZiBSZXNpemVPYnNlcnZlciA9PT0gJ3VuZGVmaW5lZCcgfHwgIVJlc2l6ZU9ic2VydmVyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgIHRoaXMuX3Jlc2l6ZU9ic2VydmVyID0gbmV3IFJlc2l6ZU9ic2VydmVyKCgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuX2lzQWN0aXZlKCkpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuX3Jlc2l6ZVRpbWVyKSB7XG4gICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3Jlc2l6ZVRpbWVyKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9vblJlc2l6ZSgpO1xuICAgICAgfSk7XG4gICAgICB0aGlzLl9yZXNpemVPYnNlcnZlci5vYnNlcnZlKHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudCk7XG4gICAgfSk7XG4gIH1cblxuICAvKiogV2hldGhlciBhbnkgb2YgdGhlIHRodW1icyBhcmUgY3VycmVudGx5IGFjdGl2ZS4gKi9cbiAgcHJpdmF0ZSBfaXNBY3RpdmUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2dldFRodW1iKF9NYXRUaHVtYi5TVEFSVCkuX2lzQWN0aXZlIHx8IHRoaXMuX2dldFRodW1iKF9NYXRUaHVtYi5FTkQpLl9pc0FjdGl2ZTtcbiAgfVxuXG4gIHByaXZhdGUgX2dldFZhbHVlKHRodW1iUG9zaXRpb246IF9NYXRUaHVtYiA9IF9NYXRUaHVtYi5FTkQpOiBudW1iZXIge1xuICAgIGNvbnN0IGlucHV0ID0gdGhpcy5fZ2V0SW5wdXQodGh1bWJQb3NpdGlvbik7XG4gICAgaWYgKCFpbnB1dCkge1xuICAgICAgcmV0dXJuIHRoaXMubWluO1xuICAgIH1cbiAgICByZXR1cm4gaW5wdXQudmFsdWU7XG4gIH1cblxuICBwcml2YXRlIF9za2lwVXBkYXRlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhIShcbiAgICAgIHRoaXMuX2dldElucHV0KF9NYXRUaHVtYi5TVEFSVCk/Ll9za2lwVUlVcGRhdGUgfHwgdGhpcy5fZ2V0SW5wdXQoX01hdFRodW1iLkVORCk/Ll9za2lwVUlVcGRhdGVcbiAgICApO1xuICB9XG5cbiAgLyoqIFN0b3JlcyB0aGUgc2xpZGVyIGRpbWVuc2lvbnMuICovXG4gIF91cGRhdGVEaW1lbnNpb25zKCk6IHZvaWQge1xuICAgIHRoaXMuX2NhY2hlZFdpZHRoID0gdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50Lm9mZnNldFdpZHRoO1xuICAgIHRoaXMuX2NhY2hlZExlZnQgPSB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdDtcbiAgfVxuXG4gIC8qKiBTZXRzIHRoZSBzdHlsZXMgZm9yIHRoZSBhY3RpdmUgcG9ydGlvbiBvZiB0aGUgdHJhY2suICovXG4gIF9zZXRUcmFja0FjdGl2ZVN0eWxlcyhzdHlsZXM6IHtcbiAgICBsZWZ0OiBzdHJpbmc7XG4gICAgcmlnaHQ6IHN0cmluZztcbiAgICB0cmFuc2Zvcm06IHN0cmluZztcbiAgICB0cmFuc2Zvcm1PcmlnaW46IHN0cmluZztcbiAgfSk6IHZvaWQge1xuICAgIGNvbnN0IHRyYWNrU3R5bGUgPSB0aGlzLl90cmFja0FjdGl2ZS5uYXRpdmVFbGVtZW50LnN0eWxlO1xuXG4gICAgdHJhY2tTdHlsZS5sZWZ0ID0gc3R5bGVzLmxlZnQ7XG4gICAgdHJhY2tTdHlsZS5yaWdodCA9IHN0eWxlcy5yaWdodDtcbiAgICB0cmFja1N0eWxlLnRyYW5zZm9ybU9yaWdpbiA9IHN0eWxlcy50cmFuc2Zvcm1PcmlnaW47XG4gICAgdHJhY2tTdHlsZS50cmFuc2Zvcm0gPSBzdHlsZXMudHJhbnNmb3JtO1xuICB9XG5cbiAgLyoqIFJldHVybnMgdGhlIHRyYW5zbGF0ZVggcG9zaXRpb25pbmcgZm9yIGEgdGljayBtYXJrIGJhc2VkIG9uIGl0J3MgaW5kZXguICovXG4gIF9jYWxjVGlja01hcmtUcmFuc2Zvcm0oaW5kZXg6IG51bWJlcik6IHN0cmluZyB7XG4gICAgLy8gVE9ETyh3YWduZXJtYWNpZWwpOiBTZWUgaWYgd2UgY2FuIGF2b2lkIGRvaW5nIHRoaXMgYW5kIGp1c3QgdXNpbmcgZmxleCB0byBwb3NpdGlvbiB0aGVzZS5cbiAgICBjb25zdCB0cmFuc2xhdGVYID0gaW5kZXggKiAodGhpcy5fdGlja01hcmtUcmFja1dpZHRoIC8gKHRoaXMuX3RpY2tNYXJrcy5sZW5ndGggLSAxKSk7XG4gICAgcmV0dXJuIGB0cmFuc2xhdGVYKCR7dHJhbnNsYXRlWH1weGA7XG4gIH1cblxuICAvLyBIYW5kbGVycyBmb3IgdXBkYXRpbmcgdGhlIHNsaWRlciB1aS5cblxuICBfb25UcmFuc2xhdGVYQ2hhbmdlKHNvdXJjZTogX01hdFNsaWRlclRodW1iKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLl9oYXNWaWV3SW5pdGlhbGl6ZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl91cGRhdGVUaHVtYlVJKHNvdXJjZSk7XG4gICAgdGhpcy5fdXBkYXRlVHJhY2tVSShzb3VyY2UpO1xuICAgIHRoaXMuX3VwZGF0ZU92ZXJsYXBwaW5nVGh1bWJVSShzb3VyY2UgYXMgX01hdFNsaWRlclJhbmdlVGh1bWIpO1xuICB9XG5cbiAgX29uVHJhbnNsYXRlWENoYW5nZUJ5U2lkZUVmZmVjdChcbiAgICBpbnB1dDE6IF9NYXRTbGlkZXJSYW5nZVRodW1iLFxuICAgIGlucHV0MjogX01hdFNsaWRlclJhbmdlVGh1bWIsXG4gICk6IHZvaWQge1xuICAgIGlmICghdGhpcy5faGFzVmlld0luaXRpYWxpemVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaW5wdXQxLl91cGRhdGVUaHVtYlVJQnlWYWx1ZSgpO1xuICAgIGlucHV0Mi5fdXBkYXRlVGh1bWJVSUJ5VmFsdWUoKTtcbiAgfVxuXG4gIF9vblZhbHVlQ2hhbmdlKHNvdXJjZTogX01hdFNsaWRlclRodW1iKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLl9oYXNWaWV3SW5pdGlhbGl6ZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl91cGRhdGVWYWx1ZUluZGljYXRvclVJKHNvdXJjZSk7XG4gICAgdGhpcy5fdXBkYXRlVGlja01hcmtVSSgpO1xuICAgIHRoaXMuX2Nkci5kZXRlY3RDaGFuZ2VzKCk7XG4gIH1cblxuICBfb25NaW5NYXhPclN0ZXBDaGFuZ2UoKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLl9oYXNWaWV3SW5pdGlhbGl6ZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl91cGRhdGVUaWNrTWFya1VJKCk7XG4gICAgdGhpcy5fdXBkYXRlVGlja01hcmtUcmFja1VJKCk7XG4gICAgdGhpcy5fY2RyLm1hcmtGb3JDaGVjaygpO1xuICB9XG5cbiAgX29uUmVzaXplKCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5faGFzVmlld0luaXRpYWxpemVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fdXBkYXRlRGltZW5zaW9ucygpO1xuICAgIGlmICh0aGlzLl9pc1JhbmdlKSB7XG4gICAgICBjb25zdCBlSW5wdXQgPSB0aGlzLl9nZXRJbnB1dChfTWF0VGh1bWIuRU5EKSBhcyBfTWF0U2xpZGVyUmFuZ2VUaHVtYjtcbiAgICAgIGNvbnN0IHNJbnB1dCA9IHRoaXMuX2dldElucHV0KF9NYXRUaHVtYi5TVEFSVCkgYXMgX01hdFNsaWRlclJhbmdlVGh1bWI7XG5cbiAgICAgIGVJbnB1dC5fdXBkYXRlVGh1bWJVSUJ5VmFsdWUoKTtcbiAgICAgIHNJbnB1dC5fdXBkYXRlVGh1bWJVSUJ5VmFsdWUoKTtcblxuICAgICAgZUlucHV0Ll91cGRhdGVTdGF0aWNTdHlsZXMoKTtcbiAgICAgIHNJbnB1dC5fdXBkYXRlU3RhdGljU3R5bGVzKCk7XG5cbiAgICAgIGVJbnB1dC5fdXBkYXRlTWluTWF4KCk7XG4gICAgICBzSW5wdXQuX3VwZGF0ZU1pbk1heCgpO1xuXG4gICAgICBlSW5wdXQuX3VwZGF0ZVdpZHRoSW5hY3RpdmUoKTtcbiAgICAgIHNJbnB1dC5fdXBkYXRlV2lkdGhJbmFjdGl2ZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBlSW5wdXQgPSB0aGlzLl9nZXRJbnB1dChfTWF0VGh1bWIuRU5EKTtcbiAgICAgIGlmIChlSW5wdXQpIHtcbiAgICAgICAgZUlucHV0Ll91cGRhdGVUaHVtYlVJQnlWYWx1ZSgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuX3VwZGF0ZVRpY2tNYXJrVUkoKTtcbiAgICB0aGlzLl91cGRhdGVUaWNrTWFya1RyYWNrVUkoKTtcbiAgICB0aGlzLl9jZHIuZGV0ZWN0Q2hhbmdlcygpO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgb3Igbm90IHRoZSBzbGlkZXIgdGh1bWJzIG92ZXJsYXAuICovXG4gIHByaXZhdGUgX3RodW1ic092ZXJsYXA6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAvKiogUmV0dXJucyB0cnVlIGlmIHRoZSBzbGlkZXIga25vYnMgYXJlIG92ZXJsYXBwaW5nIG9uZSBhbm90aGVyLiAqL1xuICBwcml2YXRlIF9hcmVUaHVtYnNPdmVybGFwcGluZygpOiBib29sZWFuIHtcbiAgICBjb25zdCBzdGFydElucHV0ID0gdGhpcy5fZ2V0SW5wdXQoX01hdFRodW1iLlNUQVJUKTtcbiAgICBjb25zdCBlbmRJbnB1dCA9IHRoaXMuX2dldElucHV0KF9NYXRUaHVtYi5FTkQpO1xuICAgIGlmICghc3RhcnRJbnB1dCB8fCAhZW5kSW5wdXQpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIGVuZElucHV0LnRyYW5zbGF0ZVggLSBzdGFydElucHV0LnRyYW5zbGF0ZVggPCAyMDtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoZSBjbGFzcyBuYW1lcyBvZiBvdmVybGFwcGluZyBzbGlkZXIgdGh1bWJzIHNvXG4gICAqIHRoYXQgdGhlIGN1cnJlbnQgYWN0aXZlIHRodW1iIGlzIHN0eWxlZCB0byBiZSBvbiBcInRvcFwiLlxuICAgKi9cbiAgcHJpdmF0ZSBfdXBkYXRlT3ZlcmxhcHBpbmdUaHVtYkNsYXNzTmFtZXMoc291cmNlOiBfTWF0U2xpZGVyUmFuZ2VUaHVtYik6IHZvaWQge1xuICAgIGNvbnN0IHNpYmxpbmcgPSBzb3VyY2UuZ2V0U2libGluZygpITtcbiAgICBjb25zdCBzb3VyY2VUaHVtYiA9IHRoaXMuX2dldFRodW1iKHNvdXJjZS50aHVtYlBvc2l0aW9uKTtcbiAgICBjb25zdCBzaWJsaW5nVGh1bWIgPSB0aGlzLl9nZXRUaHVtYihzaWJsaW5nLnRodW1iUG9zaXRpb24pO1xuICAgIHNpYmxpbmdUaHVtYi5faG9zdEVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnbWRjLXNsaWRlcl9fdGh1bWItLXRvcCcpO1xuICAgIHNvdXJjZVRodW1iLl9ob3N0RWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKCdtZGMtc2xpZGVyX190aHVtYi0tdG9wJywgdGhpcy5fdGh1bWJzT3ZlcmxhcCk7XG4gIH1cblxuICAvKiogVXBkYXRlcyB0aGUgVUkgb2Ygc2xpZGVyIHRodW1icyB3aGVuIHRoZXkgYmVnaW4gb3Igc3RvcCBvdmVybGFwcGluZy4gKi9cbiAgcHJpdmF0ZSBfdXBkYXRlT3ZlcmxhcHBpbmdUaHVtYlVJKHNvdXJjZTogX01hdFNsaWRlclJhbmdlVGh1bWIpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX2lzUmFuZ2UgfHwgdGhpcy5fc2tpcFVwZGF0ZSgpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh0aGlzLl90aHVtYnNPdmVybGFwICE9PSB0aGlzLl9hcmVUaHVtYnNPdmVybGFwcGluZygpKSB7XG4gICAgICB0aGlzLl90aHVtYnNPdmVybGFwID0gIXRoaXMuX3RodW1ic092ZXJsYXA7XG4gICAgICB0aGlzLl91cGRhdGVPdmVybGFwcGluZ1RodW1iQ2xhc3NOYW1lcyhzb3VyY2UpO1xuICAgIH1cbiAgfVxuXG4gIC8vIF9NYXRUaHVtYiBzdHlsZXMgdXBkYXRlIGNvbmRpdGlvbnNcbiAgLy9cbiAgLy8gMS4gVHJhbnNsYXRlWCwgcmVzaXplLCBvciBkaXIgY2hhbmdlXG4gIC8vICAgIC0gUmVhc29uOiBUaGUgdGh1bWIgc3R5bGVzIG5lZWQgdG8gYmUgdXBkYXRlZCBhY2NvcmRpbmcgdG8gdGhlIG5ldyB0cmFuc2xhdGVYLlxuICAvLyAyLiBNaW4sIG1heCwgb3Igc3RlcFxuICAvLyAgICAtIFJlYXNvbjogVGhlIHZhbHVlIG1heSBoYXZlIHNpbGVudGx5IGNoYW5nZWQuXG5cbiAgLyoqIFVwZGF0ZXMgdGhlIHRyYW5zbGF0ZVggb2YgdGhlIGdpdmVuIHRodW1iLiAqL1xuICBfdXBkYXRlVGh1bWJVSShzb3VyY2U6IF9NYXRTbGlkZXJUaHVtYikge1xuICAgIGlmICh0aGlzLl9za2lwVXBkYXRlKCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgdGh1bWIgPSB0aGlzLl9nZXRUaHVtYihcbiAgICAgIHNvdXJjZS50aHVtYlBvc2l0aW9uID09PSBfTWF0VGh1bWIuRU5EID8gX01hdFRodW1iLkVORCA6IF9NYXRUaHVtYi5TVEFSVCxcbiAgICApITtcbiAgICB0aHVtYi5faG9zdEVsZW1lbnQuc3R5bGUudHJhbnNmb3JtID0gYHRyYW5zbGF0ZVgoJHtzb3VyY2UudHJhbnNsYXRlWH1weClgO1xuICB9XG5cbiAgLy8gVmFsdWUgaW5kaWNhdG9yIHRleHQgdXBkYXRlIGNvbmRpdGlvbnNcbiAgLy9cbiAgLy8gMS4gVmFsdWVcbiAgLy8gICAgLSBSZWFzb246IFRoZSB2YWx1ZSBkaXNwbGF5ZWQgbmVlZHMgdG8gYmUgdXBkYXRlZC5cbiAgLy8gMi4gTWluLCBtYXgsIG9yIHN0ZXBcbiAgLy8gICAgLSBSZWFzb246IFRoZSB2YWx1ZSBtYXkgaGF2ZSBzaWxlbnRseSBjaGFuZ2VkLlxuXG4gIC8qKiBVcGRhdGVzIHRoZSB2YWx1ZSBpbmRpY2F0b3IgdG9vbHRpcCB1aSBmb3IgdGhlIGdpdmVuIHRodW1iLiAqL1xuICBfdXBkYXRlVmFsdWVJbmRpY2F0b3JVSShzb3VyY2U6IF9NYXRTbGlkZXJUaHVtYik6IHZvaWQge1xuICAgIGlmICh0aGlzLl9za2lwVXBkYXRlKCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB2YWx1ZXRleHQgPSB0aGlzLmRpc3BsYXlXaXRoKHNvdXJjZS52YWx1ZSk7XG5cbiAgICB0aGlzLl9oYXNWaWV3SW5pdGlhbGl6ZWRcbiAgICAgID8gKHNvdXJjZS5fdmFsdWV0ZXh0ID0gdmFsdWV0ZXh0KVxuICAgICAgOiBzb3VyY2UuX2hvc3RFbGVtZW50LnNldEF0dHJpYnV0ZSgnYXJpYS12YWx1ZXRleHQnLCB2YWx1ZXRleHQpO1xuXG4gICAgaWYgKHRoaXMuZGlzY3JldGUpIHtcbiAgICAgIHNvdXJjZS50aHVtYlBvc2l0aW9uID09PSBfTWF0VGh1bWIuU1RBUlRcbiAgICAgICAgPyAodGhpcy5zdGFydFZhbHVlSW5kaWNhdG9yVGV4dCA9IHZhbHVldGV4dClcbiAgICAgICAgOiAodGhpcy5lbmRWYWx1ZUluZGljYXRvclRleHQgPSB2YWx1ZXRleHQpO1xuXG4gICAgICBjb25zdCB2aXN1YWxUaHVtYiA9IHRoaXMuX2dldFRodW1iKHNvdXJjZS50aHVtYlBvc2l0aW9uKTtcbiAgICAgIHZhbHVldGV4dC5sZW5ndGggPCAzXG4gICAgICAgID8gdmlzdWFsVGh1bWIuX2hvc3RFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ21kYy1zbGlkZXJfX3RodW1iLS1zaG9ydC12YWx1ZScpXG4gICAgICAgIDogdmlzdWFsVGh1bWIuX2hvc3RFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ21kYy1zbGlkZXJfX3RodW1iLS1zaG9ydC12YWx1ZScpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBVcGRhdGVzIGFsbCB2YWx1ZSBpbmRpY2F0b3IgVUlzIGluIHRoZSBzbGlkZXIuICovXG4gIHByaXZhdGUgX3VwZGF0ZVZhbHVlSW5kaWNhdG9yVUlzKCk6IHZvaWQge1xuICAgIGNvbnN0IGVJbnB1dCA9IHRoaXMuX2dldElucHV0KF9NYXRUaHVtYi5FTkQpO1xuICAgIGNvbnN0IHNJbnB1dCA9IHRoaXMuX2dldElucHV0KF9NYXRUaHVtYi5TVEFSVCk7XG5cbiAgICBpZiAoZUlucHV0KSB7XG4gICAgICB0aGlzLl91cGRhdGVWYWx1ZUluZGljYXRvclVJKGVJbnB1dCk7XG4gICAgfVxuICAgIGlmIChzSW5wdXQpIHtcbiAgICAgIHRoaXMuX3VwZGF0ZVZhbHVlSW5kaWNhdG9yVUkoc0lucHV0KTtcbiAgICB9XG4gIH1cblxuICAvLyBVcGRhdGUgVGljayBNYXJrIFRyYWNrIFdpZHRoXG4gIC8vXG4gIC8vIDEuIE1pbiwgbWF4LCBvciBzdGVwXG4gIC8vICAgIC0gUmVhc29uOiBUaGUgbWF4aW11bSByZWFjaGFibGUgdmFsdWUgbWF5IGhhdmUgY2hhbmdlZC5cbiAgLy8gICAgLSBTaWRlIG5vdGU6IFRoZSBtYXhpbXVtIHJlYWNoYWJsZSB2YWx1ZSBpcyBkaWZmZXJlbnQgZnJvbSB0aGUgbWF4aW11bSB2YWx1ZSBzZXQgYnkgdGhlXG4gIC8vICAgICAgdXNlci4gRm9yIGV4YW1wbGUsIGEgc2xpZGVyIHdpdGggW21pbjogNSwgbWF4OiAxMDAsIHN0ZXA6IDEwXSB3b3VsZCBoYXZlIGEgbWF4aW11bVxuICAvLyAgICAgIHJlYWNoYWJsZSB2YWx1ZSBvZiA5NS5cbiAgLy8gMi4gUmVzaXplXG4gIC8vICAgIC0gUmVhc29uOiBUaGUgcG9zaXRpb24gZm9yIHRoZSBtYXhpbXVtIHJlYWNoYWJsZSB2YWx1ZSBuZWVkcyB0byBiZSByZWNhbGN1bGF0ZWQuXG5cbiAgLyoqIFVwZGF0ZXMgdGhlIHdpZHRoIG9mIHRoZSB0aWNrIG1hcmsgdHJhY2suICovXG4gIHByaXZhdGUgX3VwZGF0ZVRpY2tNYXJrVHJhY2tVSSgpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuc2hvd1RpY2tNYXJrcyB8fCB0aGlzLl9za2lwVXBkYXRlKCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBzdGVwID0gdGhpcy5fc3RlcCAmJiB0aGlzLl9zdGVwID4gMCA/IHRoaXMuX3N0ZXAgOiAxO1xuICAgIGNvbnN0IG1heFZhbHVlID0gTWF0aC5mbG9vcih0aGlzLm1heCAvIHN0ZXApICogc3RlcDtcbiAgICBjb25zdCBwZXJjZW50YWdlID0gKG1heFZhbHVlIC0gdGhpcy5taW4pIC8gKHRoaXMubWF4IC0gdGhpcy5taW4pO1xuICAgIHRoaXMuX3RpY2tNYXJrVHJhY2tXaWR0aCA9IHRoaXMuX2NhY2hlZFdpZHRoICogcGVyY2VudGFnZSAtIDY7XG4gIH1cblxuICAvLyBUcmFjayBhY3RpdmUgdXBkYXRlIGNvbmRpdGlvbnNcbiAgLy9cbiAgLy8gMS4gVHJhbnNsYXRlWFxuICAvLyAgICAtIFJlYXNvbjogVGhlIHRyYWNrIGFjdGl2ZSBzaG91bGQgbGluZSB1cCB3aXRoIHRoZSBuZXcgdGh1bWIgcG9zaXRpb24uXG4gIC8vIDIuIE1pbiBvciBtYXhcbiAgLy8gICAgLSBSZWFzb24gIzE6IFRoZSAnYWN0aXZlJyBwZXJjZW50YWdlIG5lZWRzIHRvIGJlIHJlY2FsY3VsYXRlZC5cbiAgLy8gICAgLSBSZWFzb24gIzI6IFRoZSB2YWx1ZSBtYXkgaGF2ZSBzaWxlbnRseSBjaGFuZ2VkLlxuICAvLyAzLiBTdGVwXG4gIC8vICAgIC0gUmVhc29uOiBUaGUgdmFsdWUgbWF5IGhhdmUgc2lsZW50bHkgY2hhbmdlZCBjYXVzaW5nIHRoZSB0aHVtYihzKSB0byBzaGlmdC5cbiAgLy8gNC4gRGlyIGNoYW5nZVxuICAvLyAgICAtIFJlYXNvbjogVGhlIHRyYWNrIGFjdGl2ZSB3aWxsIG5lZWQgdG8gYmUgdXBkYXRlZCBhY2NvcmRpbmcgdG8gdGhlIG5ldyB0aHVtYiBwb3NpdGlvbihzKS5cbiAgLy8gNS4gUmVzaXplXG4gIC8vICAgIC0gUmVhc29uOiBUaGUgdG90YWwgd2lkdGggdGhlICdhY3RpdmUnIHRyYWNrcyB0cmFuc2xhdGVYIGlzIGJhc2VkIG9uIGhhcyBjaGFuZ2VkLlxuXG4gIC8qKiBVcGRhdGVzIHRoZSBzY2FsZSBvbiB0aGUgYWN0aXZlIHBvcnRpb24gb2YgdGhlIHRyYWNrLiAqL1xuICBfdXBkYXRlVHJhY2tVSShzb3VyY2U6IF9NYXRTbGlkZXJUaHVtYik6IHZvaWQge1xuICAgIGlmICh0aGlzLl9za2lwVXBkYXRlKCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9pc1JhbmdlXG4gICAgICA/IHRoaXMuX3VwZGF0ZVRyYWNrVUlSYW5nZShzb3VyY2UgYXMgX01hdFNsaWRlclJhbmdlVGh1bWIpXG4gICAgICA6IHRoaXMuX3VwZGF0ZVRyYWNrVUlOb25SYW5nZShzb3VyY2UgYXMgX01hdFNsaWRlclRodW1iKTtcbiAgfVxuXG4gIHByaXZhdGUgX3VwZGF0ZVRyYWNrVUlSYW5nZShzb3VyY2U6IF9NYXRTbGlkZXJSYW5nZVRodW1iKTogdm9pZCB7XG4gICAgY29uc3Qgc2libGluZyA9IHNvdXJjZS5nZXRTaWJsaW5nKCk7XG4gICAgaWYgKCFzaWJsaW5nIHx8ICF0aGlzLl9jYWNoZWRXaWR0aCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGFjdGl2ZVBlcmNlbnRhZ2UgPSBNYXRoLmFicyhzaWJsaW5nLnRyYW5zbGF0ZVggLSBzb3VyY2UudHJhbnNsYXRlWCkgLyB0aGlzLl9jYWNoZWRXaWR0aDtcblxuICAgIGlmIChzb3VyY2UuX2lzTGVmdFRodW1iICYmIHRoaXMuX2NhY2hlZFdpZHRoKSB7XG4gICAgICB0aGlzLl9zZXRUcmFja0FjdGl2ZVN0eWxlcyh7XG4gICAgICAgIGxlZnQ6ICdhdXRvJyxcbiAgICAgICAgcmlnaHQ6IGAke3RoaXMuX2NhY2hlZFdpZHRoIC0gc2libGluZy50cmFuc2xhdGVYfXB4YCxcbiAgICAgICAgdHJhbnNmb3JtT3JpZ2luOiAncmlnaHQnLFxuICAgICAgICB0cmFuc2Zvcm06IGBzY2FsZVgoJHthY3RpdmVQZXJjZW50YWdlfSlgLFxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3NldFRyYWNrQWN0aXZlU3R5bGVzKHtcbiAgICAgICAgbGVmdDogYCR7c2libGluZy50cmFuc2xhdGVYfXB4YCxcbiAgICAgICAgcmlnaHQ6ICdhdXRvJyxcbiAgICAgICAgdHJhbnNmb3JtT3JpZ2luOiAnbGVmdCcsXG4gICAgICAgIHRyYW5zZm9ybTogYHNjYWxlWCgke2FjdGl2ZVBlcmNlbnRhZ2V9KWAsXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF91cGRhdGVUcmFja1VJTm9uUmFuZ2Uoc291cmNlOiBfTWF0U2xpZGVyVGh1bWIpOiB2b2lkIHtcbiAgICB0aGlzLl9pc1J0bFxuICAgICAgPyB0aGlzLl9zZXRUcmFja0FjdGl2ZVN0eWxlcyh7XG4gICAgICAgICAgbGVmdDogJ2F1dG8nLFxuICAgICAgICAgIHJpZ2h0OiAnMHB4JyxcbiAgICAgICAgICB0cmFuc2Zvcm1PcmlnaW46ICdyaWdodCcsXG4gICAgICAgICAgdHJhbnNmb3JtOiBgc2NhbGVYKCR7MSAtIHNvdXJjZS5maWxsUGVyY2VudGFnZX0pYCxcbiAgICAgICAgfSlcbiAgICAgIDogdGhpcy5fc2V0VHJhY2tBY3RpdmVTdHlsZXMoe1xuICAgICAgICAgIGxlZnQ6ICcwcHgnLFxuICAgICAgICAgIHJpZ2h0OiAnYXV0bycsXG4gICAgICAgICAgdHJhbnNmb3JtT3JpZ2luOiAnbGVmdCcsXG4gICAgICAgICAgdHJhbnNmb3JtOiBgc2NhbGVYKCR7c291cmNlLmZpbGxQZXJjZW50YWdlfSlgLFxuICAgICAgICB9KTtcbiAgfVxuXG4gIC8vIFRpY2sgbWFyayB1cGRhdGUgY29uZGl0aW9uc1xuICAvL1xuICAvLyAxLiBWYWx1ZVxuICAvLyAgICAtIFJlYXNvbjogYSB0aWNrIG1hcmsgd2hpY2ggd2FzIG9uY2UgYWN0aXZlIG1pZ2h0IG5vdyBiZSBpbmFjdGl2ZSBvciB2aWNlIHZlcnNhLlxuICAvLyAyLiBNaW4sIG1heCwgb3Igc3RlcFxuICAvLyAgICAtIFJlYXNvbiAjMTogdGhlIG51bWJlciBvZiB0aWNrIG1hcmtzIG1heSBoYXZlIGNoYW5nZWQuXG4gIC8vICAgIC0gUmVhc29uICMyOiBUaGUgdmFsdWUgbWF5IGhhdmUgc2lsZW50bHkgY2hhbmdlZC5cblxuICAvKiogVXBkYXRlcyB0aGUgZG90cyBhbG9uZyB0aGUgc2xpZGVyIHRyYWNrLiAqL1xuICBfdXBkYXRlVGlja01hcmtVSSgpOiB2b2lkIHtcbiAgICBpZiAoXG4gICAgICAhdGhpcy5zaG93VGlja01hcmtzIHx8XG4gICAgICB0aGlzLnN0ZXAgPT09IHVuZGVmaW5lZCB8fFxuICAgICAgdGhpcy5taW4gPT09IHVuZGVmaW5lZCB8fFxuICAgICAgdGhpcy5tYXggPT09IHVuZGVmaW5lZFxuICAgICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBzdGVwID0gdGhpcy5zdGVwID4gMCA/IHRoaXMuc3RlcCA6IDE7XG4gICAgdGhpcy5faXNSYW5nZSA/IHRoaXMuX3VwZGF0ZVRpY2tNYXJrVUlSYW5nZShzdGVwKSA6IHRoaXMuX3VwZGF0ZVRpY2tNYXJrVUlOb25SYW5nZShzdGVwKTtcblxuICAgIGlmICh0aGlzLl9pc1J0bCkge1xuICAgICAgdGhpcy5fdGlja01hcmtzLnJldmVyc2UoKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF91cGRhdGVUaWNrTWFya1VJTm9uUmFuZ2Uoc3RlcDogbnVtYmVyKTogdm9pZCB7XG4gICAgY29uc3QgdmFsdWUgPSB0aGlzLl9nZXRWYWx1ZSgpO1xuICAgIGxldCBudW1BY3RpdmUgPSBNYXRoLm1heChNYXRoLmZsb29yKCh2YWx1ZSAtIHRoaXMubWluKSAvIHN0ZXApLCAwKTtcbiAgICBsZXQgbnVtSW5hY3RpdmUgPSBNYXRoLm1heChNYXRoLmZsb29yKCh0aGlzLm1heCAtIHZhbHVlKSAvIHN0ZXApLCAwKTtcbiAgICB0aGlzLl9pc1J0bCA/IG51bUFjdGl2ZSsrIDogbnVtSW5hY3RpdmUrKztcblxuICAgIHRoaXMuX3RpY2tNYXJrcyA9IEFycmF5KG51bUFjdGl2ZSlcbiAgICAgIC5maWxsKF9NYXRUaWNrTWFyay5BQ1RJVkUpXG4gICAgICAuY29uY2F0KEFycmF5KG51bUluYWN0aXZlKS5maWxsKF9NYXRUaWNrTWFyay5JTkFDVElWRSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBfdXBkYXRlVGlja01hcmtVSVJhbmdlKHN0ZXA6IG51bWJlcik6IHZvaWQge1xuICAgIGNvbnN0IGVuZFZhbHVlID0gdGhpcy5fZ2V0VmFsdWUoKTtcbiAgICBjb25zdCBzdGFydFZhbHVlID0gdGhpcy5fZ2V0VmFsdWUoX01hdFRodW1iLlNUQVJUKTtcblxuICAgIGNvbnN0IG51bUluYWN0aXZlQmVmb3JlU3RhcnRUaHVtYiA9IE1hdGgubWF4KE1hdGguZmxvb3IoKHN0YXJ0VmFsdWUgLSB0aGlzLm1pbikgLyBzdGVwKSwgMCk7XG4gICAgY29uc3QgbnVtQWN0aXZlID0gTWF0aC5tYXgoTWF0aC5mbG9vcigoZW5kVmFsdWUgLSBzdGFydFZhbHVlKSAvIHN0ZXApICsgMSwgMCk7XG4gICAgY29uc3QgbnVtSW5hY3RpdmVBZnRlckVuZFRodW1iID0gTWF0aC5tYXgoTWF0aC5mbG9vcigodGhpcy5tYXggLSBlbmRWYWx1ZSkgLyBzdGVwKSwgMCk7XG4gICAgdGhpcy5fdGlja01hcmtzID0gQXJyYXkobnVtSW5hY3RpdmVCZWZvcmVTdGFydFRodW1iKVxuICAgICAgLmZpbGwoX01hdFRpY2tNYXJrLklOQUNUSVZFKVxuICAgICAgLmNvbmNhdChcbiAgICAgICAgQXJyYXkobnVtQWN0aXZlKS5maWxsKF9NYXRUaWNrTWFyay5BQ1RJVkUpLFxuICAgICAgICBBcnJheShudW1JbmFjdGl2ZUFmdGVyRW5kVGh1bWIpLmZpbGwoX01hdFRpY2tNYXJrLklOQUNUSVZFKSxcbiAgICAgICk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgc2xpZGVyIHRodW1iIGlucHV0IG9mIHRoZSBnaXZlbiB0aHVtYiBwb3NpdGlvbi4gKi9cbiAgX2dldElucHV0KHRodW1iUG9zaXRpb246IF9NYXRUaHVtYik6IF9NYXRTbGlkZXJUaHVtYiB8IF9NYXRTbGlkZXJSYW5nZVRodW1iIHwgdW5kZWZpbmVkIHtcbiAgICBpZiAodGh1bWJQb3NpdGlvbiA9PT0gX01hdFRodW1iLkVORCAmJiB0aGlzLl9pbnB1dCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2lucHV0O1xuICAgIH1cbiAgICBpZiAodGhpcy5faW5wdXRzPy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiB0aHVtYlBvc2l0aW9uID09PSBfTWF0VGh1bWIuU1RBUlQgPyB0aGlzLl9pbnB1dHMuZmlyc3QgOiB0aGlzLl9pbnB1dHMubGFzdDtcbiAgICB9XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIHNsaWRlciB0aHVtYiBIVE1MIGlucHV0IGVsZW1lbnQgb2YgdGhlIGdpdmVuIHRodW1iIHBvc2l0aW9uLiAqL1xuICBfZ2V0VGh1bWIodGh1bWJQb3NpdGlvbjogX01hdFRodW1iKTogX01hdFNsaWRlclZpc3VhbFRodW1iIHtcbiAgICByZXR1cm4gdGh1bWJQb3NpdGlvbiA9PT0gX01hdFRodW1iLkVORCA/IHRoaXMuX3RodW1icz8ubGFzdCEgOiB0aGlzLl90aHVtYnM/LmZpcnN0ITtcbiAgfVxuXG4gIF9zZXRUcmFuc2l0aW9uKHdpdGhBbmltYXRpb246IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLl9oYXNBbmltYXRpb24gPSAhdGhpcy5fcGxhdGZvcm0uSU9TICYmIHdpdGhBbmltYXRpb24gJiYgIXRoaXMuX25vb3BBbmltYXRpb25zO1xuICAgIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKFxuICAgICAgJ21hdC1tZGMtc2xpZGVyLXdpdGgtYW5pbWF0aW9uJyxcbiAgICAgIHRoaXMuX2hhc0FuaW1hdGlvbixcbiAgICApO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGdpdmVuIHBvaW50ZXIgZXZlbnQgb2NjdXJyZWQgd2l0aGluIHRoZSBib3VuZHMgb2YgdGhlIHNsaWRlciBwb2ludGVyJ3MgRE9NIFJlY3QuICovXG4gIF9pc0N1cnNvck9uU2xpZGVyVGh1bWIoZXZlbnQ6IFBvaW50ZXJFdmVudCwgcmVjdDogRE9NUmVjdCkge1xuICAgIGNvbnN0IHJhZGl1cyA9IHJlY3Qud2lkdGggLyAyO1xuICAgIGNvbnN0IGNlbnRlclggPSByZWN0LnggKyByYWRpdXM7XG4gICAgY29uc3QgY2VudGVyWSA9IHJlY3QueSArIHJhZGl1cztcbiAgICBjb25zdCBkeCA9IGV2ZW50LmNsaWVudFggLSBjZW50ZXJYO1xuICAgIGNvbnN0IGR5ID0gZXZlbnQuY2xpZW50WSAtIGNlbnRlclk7XG4gICAgcmV0dXJuIE1hdGgucG93KGR4LCAyKSArIE1hdGgucG93KGR5LCAyKSA8IE1hdGgucG93KHJhZGl1cywgMik7XG4gIH1cbn1cblxuLyoqIEVuc3VyZXMgdGhhdCB0aGVyZSBpcyBub3QgYW4gaW52YWxpZCBjb25maWd1cmF0aW9uIGZvciB0aGUgc2xpZGVyIHRodW1iIGlucHV0cy4gKi9cbmZ1bmN0aW9uIF92YWxpZGF0ZUlucHV0cyhcbiAgaXNSYW5nZTogYm9vbGVhbixcbiAgZW5kSW5wdXRFbGVtZW50OiBfTWF0U2xpZGVyVGh1bWIgfCBfTWF0U2xpZGVyUmFuZ2VUaHVtYixcbiAgc3RhcnRJbnB1dEVsZW1lbnQ/OiBfTWF0U2xpZGVyVGh1bWIsXG4pOiB2b2lkIHtcbiAgY29uc3Qgc3RhcnRWYWxpZCA9XG4gICAgIWlzUmFuZ2UgfHwgc3RhcnRJbnB1dEVsZW1lbnQ/Ll9ob3N0RWxlbWVudC5oYXNBdHRyaWJ1dGUoJ21hdFNsaWRlclN0YXJ0VGh1bWInKTtcbiAgY29uc3QgZW5kVmFsaWQgPSBlbmRJbnB1dEVsZW1lbnQuX2hvc3RFbGVtZW50Lmhhc0F0dHJpYnV0ZShcbiAgICBpc1JhbmdlID8gJ21hdFNsaWRlckVuZFRodW1iJyA6ICdtYXRTbGlkZXJUaHVtYicsXG4gICk7XG5cbiAgaWYgKCFzdGFydFZhbGlkIHx8ICFlbmRWYWxpZCkge1xuICAgIF90aHJvd0ludmFsaWRJbnB1dENvbmZpZ3VyYXRpb25FcnJvcigpO1xuICB9XG59XG5cbmZ1bmN0aW9uIF90aHJvd0ludmFsaWRJbnB1dENvbmZpZ3VyYXRpb25FcnJvcigpOiB2b2lkIHtcbiAgdGhyb3cgRXJyb3IoYEludmFsaWQgc2xpZGVyIHRodW1iIGlucHV0IGNvbmZpZ3VyYXRpb24hXG5cbiAgIFZhbGlkIGNvbmZpZ3VyYXRpb25zIGFyZSBhcyBmb2xsb3dzOlxuXG4gICAgIDxtYXQtc2xpZGVyPlxuICAgICAgIDxpbnB1dCBtYXRTbGlkZXJUaHVtYj5cbiAgICAgPC9tYXQtc2xpZGVyPlxuXG4gICAgIG9yXG5cbiAgICAgPG1hdC1zbGlkZXI+XG4gICAgICAgPGlucHV0IG1hdFNsaWRlclN0YXJ0VGh1bWI+XG4gICAgICAgPGlucHV0IG1hdFNsaWRlckVuZFRodW1iPlxuICAgICA8L21hdC1zbGlkZXI+XG4gICBgKTtcbn1cbiIsIjwhLS0gSW5wdXRzIC0tPlxuPG5nLWNvbnRlbnQ+PC9uZy1jb250ZW50PlxuXG48IS0tIFRyYWNrIC0tPlxuPGRpdiBjbGFzcz1cIm1kYy1zbGlkZXJfX3RyYWNrXCI+XG4gIDxkaXYgY2xhc3M9XCJtZGMtc2xpZGVyX190cmFjay0taW5hY3RpdmVcIj48L2Rpdj5cbiAgPGRpdiBjbGFzcz1cIm1kYy1zbGlkZXJfX3RyYWNrLS1hY3RpdmVcIj5cbiAgICA8ZGl2ICN0cmFja0FjdGl2ZSBjbGFzcz1cIm1kYy1zbGlkZXJfX3RyYWNrLS1hY3RpdmVfZmlsbFwiPjwvZGl2PlxuICA8L2Rpdj5cbiAgQGlmIChzaG93VGlja01hcmtzKSB7XG4gICAgPGRpdiBjbGFzcz1cIm1kYy1zbGlkZXJfX3RpY2stbWFya3NcIiAjdGlja01hcmtDb250YWluZXI+XG4gICAgICBAaWYgKF9jYWNoZWRXaWR0aCkge1xuICAgICAgICBAZm9yICh0aWNrTWFyayBvZiBfdGlja01hcmtzOyB0cmFjayB0aWNrTWFyazsgbGV0IGkgPSAkaW5kZXgpIHtcbiAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICBbY2xhc3NdPVwidGlja01hcmsgPT09IDAgPyAnbWRjLXNsaWRlcl9fdGljay1tYXJrLS1hY3RpdmUnIDogJ21kYy1zbGlkZXJfX3RpY2stbWFyay0taW5hY3RpdmUnXCJcbiAgICAgICAgICAgIFtzdHlsZS50cmFuc2Zvcm1dPVwiX2NhbGNUaWNrTWFya1RyYW5zZm9ybShpKVwiPjwvZGl2PlxuICAgICAgICB9XG4gICAgICB9XG4gICAgPC9kaXY+XG4gIH1cbjwvZGl2PlxuXG48IS0tIFRodW1icyAtLT5cbkBpZiAoX2lzUmFuZ2UpIHtcbiAgPG1hdC1zbGlkZXItdmlzdWFsLXRodW1iXG4gICAgW2Rpc2NyZXRlXT1cImRpc2NyZXRlXCJcbiAgICBbdGh1bWJQb3NpdGlvbl09XCIxXCJcbiAgICBbdmFsdWVJbmRpY2F0b3JUZXh0XT1cInN0YXJ0VmFsdWVJbmRpY2F0b3JUZXh0XCI+XG4gIDwvbWF0LXNsaWRlci12aXN1YWwtdGh1bWI+XG59XG5cbjxtYXQtc2xpZGVyLXZpc3VhbC10aHVtYlxuICBbZGlzY3JldGVdPVwiZGlzY3JldGVcIlxuICBbdGh1bWJQb3NpdGlvbl09XCIyXCJcbiAgW3ZhbHVlSW5kaWNhdG9yVGV4dF09XCJlbmRWYWx1ZUluZGljYXRvclRleHRcIj5cbjwvbWF0LXNsaWRlci12aXN1YWwtdGh1bWI+XG4iXX0=