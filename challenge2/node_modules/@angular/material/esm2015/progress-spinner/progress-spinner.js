/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { coerceNumberProperty } from '@angular/cdk/coercion';
import { Platform, _getShadowRoot } from '@angular/cdk/platform';
import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, Inject, InjectionToken, Input, Optional, ViewEncapsulation, } from '@angular/core';
import { mixinColor } from '@angular/material/core';
import { ANIMATION_MODULE_TYPE } from '@angular/platform-browser/animations';
/**
 * Base reference size of the spinner.
 * @docs-private
 */
const BASE_SIZE = 100;
/**
 * Base reference stroke width of the spinner.
 * @docs-private
 */
const BASE_STROKE_WIDTH = 10;
// Boilerplate for applying mixins to MatProgressSpinner.
/** @docs-private */
class MatProgressSpinnerBase {
    constructor(_elementRef) {
        this._elementRef = _elementRef;
    }
}
const _MatProgressSpinnerMixinBase = mixinColor(MatProgressSpinnerBase, 'primary');
/** Injection token to be used to override the default options for `mat-progress-spinner`. */
export const MAT_PROGRESS_SPINNER_DEFAULT_OPTIONS = new InjectionToken('mat-progress-spinner-default-options', {
    providedIn: 'root',
    factory: MAT_PROGRESS_SPINNER_DEFAULT_OPTIONS_FACTORY,
});
/** @docs-private */
export function MAT_PROGRESS_SPINNER_DEFAULT_OPTIONS_FACTORY() {
    return { diameter: BASE_SIZE };
}
// .0001 percentage difference is necessary in order to avoid unwanted animation frames
// for example because the animation duration is 4 seconds, .1% accounts to 4ms
// which are enough to see the flicker described in
// https://github.com/angular/components/issues/8984
const INDETERMINATE_ANIMATION_TEMPLATE = `
 @keyframes mat-progress-spinner-stroke-rotate-DIAMETER {
    0%      { stroke-dashoffset: START_VALUE;  transform: rotate(0); }
    12.5%   { stroke-dashoffset: END_VALUE;    transform: rotate(0); }
    12.5001%  { stroke-dashoffset: END_VALUE;    transform: rotateX(180deg) rotate(72.5deg); }
    25%     { stroke-dashoffset: START_VALUE;  transform: rotateX(180deg) rotate(72.5deg); }

    25.0001%   { stroke-dashoffset: START_VALUE;  transform: rotate(270deg); }
    37.5%   { stroke-dashoffset: END_VALUE;    transform: rotate(270deg); }
    37.5001%  { stroke-dashoffset: END_VALUE;    transform: rotateX(180deg) rotate(161.5deg); }
    50%     { stroke-dashoffset: START_VALUE;  transform: rotateX(180deg) rotate(161.5deg); }

    50.0001%  { stroke-dashoffset: START_VALUE;  transform: rotate(180deg); }
    62.5%   { stroke-dashoffset: END_VALUE;    transform: rotate(180deg); }
    62.5001%  { stroke-dashoffset: END_VALUE;    transform: rotateX(180deg) rotate(251.5deg); }
    75%     { stroke-dashoffset: START_VALUE;  transform: rotateX(180deg) rotate(251.5deg); }

    75.0001%  { stroke-dashoffset: START_VALUE;  transform: rotate(90deg); }
    87.5%   { stroke-dashoffset: END_VALUE;    transform: rotate(90deg); }
    87.5001%  { stroke-dashoffset: END_VALUE;    transform: rotateX(180deg) rotate(341.5deg); }
    100%    { stroke-dashoffset: START_VALUE;  transform: rotateX(180deg) rotate(341.5deg); }
  }
`;
/**
 * `<mat-progress-spinner>` component.
 */
export class MatProgressSpinner extends _MatProgressSpinnerMixinBase {
    constructor(_elementRef, platform, _document, animationMode, defaults) {
        super(_elementRef);
        this._elementRef = _elementRef;
        this._document = _document;
        this._diameter = BASE_SIZE;
        this._value = 0;
        this._fallbackAnimation = false;
        /** Mode of the progress circle */
        this.mode = 'determinate';
        const trackedDiameters = MatProgressSpinner._diameters;
        this._spinnerAnimationLabel = this._getSpinnerAnimationLabel();
        // The base size is already inserted via the component's structural styles. We still
        // need to track it so we don't end up adding the same styles again.
        if (!trackedDiameters.has(_document.head)) {
            trackedDiameters.set(_document.head, new Set([BASE_SIZE]));
        }
        this._fallbackAnimation = platform.EDGE || platform.TRIDENT;
        this._noopAnimations = animationMode === 'NoopAnimations' &&
            (!!defaults && !defaults._forceAnimations);
        if (defaults) {
            if (defaults.diameter) {
                this.diameter = defaults.diameter;
            }
            if (defaults.strokeWidth) {
                this.strokeWidth = defaults.strokeWidth;
            }
        }
    }
    /** The diameter of the progress spinner (will set width and height of svg). */
    get diameter() { return this._diameter; }
    set diameter(size) {
        this._diameter = coerceNumberProperty(size);
        this._spinnerAnimationLabel = this._getSpinnerAnimationLabel();
        // If this is set before `ngOnInit`, the style root may not have been resolved yet.
        if (!this._fallbackAnimation && this._styleRoot) {
            this._attachStyleNode();
        }
    }
    /** Stroke width of the progress spinner. */
    get strokeWidth() {
        return this._strokeWidth || this.diameter / 10;
    }
    set strokeWidth(value) {
        this._strokeWidth = coerceNumberProperty(value);
    }
    /** Value of the progress circle. */
    get value() {
        return this.mode === 'determinate' ? this._value : 0;
    }
    set value(newValue) {
        this._value = Math.max(0, Math.min(100, coerceNumberProperty(newValue)));
    }
    ngOnInit() {
        const element = this._elementRef.nativeElement;
        // Note that we need to look up the root node in ngOnInit, rather than the constructor, because
        // Angular seems to create the element outside the shadow root and then moves it inside, if the
        // node is inside an `ngIf` and a ShadowDom-encapsulated component.
        this._styleRoot = _getShadowRoot(element) || this._document.head;
        this._attachStyleNode();
        // On IE and Edge, we can't animate the `stroke-dashoffset`
        // reliably so we fall back to a non-spec animation.
        const animationClass = `mat-progress-spinner-indeterminate${this._fallbackAnimation ? '-fallback' : ''}-animation`;
        element.classList.add(animationClass);
    }
    /** The radius of the spinner, adjusted for stroke width. */
    _getCircleRadius() {
        return (this.diameter - BASE_STROKE_WIDTH) / 2;
    }
    /** The view box of the spinner's svg element. */
    _getViewBox() {
        const viewBox = this._getCircleRadius() * 2 + this.strokeWidth;
        return `0 0 ${viewBox} ${viewBox}`;
    }
    /** The stroke circumference of the svg circle. */
    _getStrokeCircumference() {
        return 2 * Math.PI * this._getCircleRadius();
    }
    /** The dash offset of the svg circle. */
    _getStrokeDashOffset() {
        if (this.mode === 'determinate') {
            return this._getStrokeCircumference() * (100 - this._value) / 100;
        }
        // In fallback mode set the circle to 80% and rotate it with CSS.
        if (this._fallbackAnimation && this.mode === 'indeterminate') {
            return this._getStrokeCircumference() * 0.2;
        }
        return null;
    }
    /** Stroke width of the circle in percent. */
    _getCircleStrokeWidth() {
        return this.strokeWidth / this.diameter * 100;
    }
    /** Dynamically generates a style tag containing the correct animation for this diameter. */
    _attachStyleNode() {
        const styleRoot = this._styleRoot;
        const currentDiameter = this._diameter;
        const diameters = MatProgressSpinner._diameters;
        let diametersForElement = diameters.get(styleRoot);
        if (!diametersForElement || !diametersForElement.has(currentDiameter)) {
            const styleTag = this._document.createElement('style');
            styleTag.setAttribute('mat-spinner-animation', this._spinnerAnimationLabel);
            styleTag.textContent = this._getAnimationText();
            styleRoot.appendChild(styleTag);
            if (!diametersForElement) {
                diametersForElement = new Set();
                diameters.set(styleRoot, diametersForElement);
            }
            diametersForElement.add(currentDiameter);
        }
    }
    /** Generates animation styles adjusted for the spinner's diameter. */
    _getAnimationText() {
        const strokeCircumference = this._getStrokeCircumference();
        return INDETERMINATE_ANIMATION_TEMPLATE
            // Animation should begin at 5% and end at 80%
            .replace(/START_VALUE/g, `${0.95 * strokeCircumference}`)
            .replace(/END_VALUE/g, `${0.2 * strokeCircumference}`)
            .replace(/DIAMETER/g, `${this._spinnerAnimationLabel}`);
    }
    /** Returns the circle diameter formatted for use with the animation-name CSS property. */
    _getSpinnerAnimationLabel() {
        // The string of a float point number will include a period ‘.’ character,
        // which is not valid for a CSS animation-name.
        return this.diameter.toString().replace('.', '_');
    }
}
/**
 * Tracks diameters of existing instances to de-dupe generated styles (default d = 100).
 * We need to keep track of which elements the diameters were attached to, because for
 * elements in the Shadow DOM the style tags are attached to the shadow root, rather
 * than the document head.
 */
MatProgressSpinner._diameters = new WeakMap();
MatProgressSpinner.decorators = [
    { type: Component, args: [{
                selector: 'mat-progress-spinner',
                exportAs: 'matProgressSpinner',
                host: {
                    'role': 'progressbar',
                    'class': 'mat-progress-spinner',
                    // set tab index to -1 so screen readers will read the aria-label
                    // Note: there is a known issue with JAWS that does not read progressbar aria labels on FireFox
                    'tabindex': '-1',
                    '[class._mat-animation-noopable]': `_noopAnimations`,
                    '[style.width.px]': 'diameter',
                    '[style.height.px]': 'diameter',
                    '[attr.aria-valuemin]': 'mode === "determinate" ? 0 : null',
                    '[attr.aria-valuemax]': 'mode === "determinate" ? 100 : null',
                    '[attr.aria-valuenow]': 'mode === "determinate" ? value : null',
                    '[attr.mode]': 'mode',
                },
                inputs: ['color'],
                template: "<!--\n  preserveAspectRatio of xMidYMid meet as the center of the viewport is the circle's\n  center. The center of the circle will remain at the center of the mat-progress-spinner\n  element containing the SVG. `focusable=\"false\"` prevents IE from allowing the user to\n  tab into the SVG element.\n-->\n<!--\n  All children need to be hidden for screen readers in order to support ChromeVox.\n  More context in the issue: https://github.com/angular/components/issues/22165.\n-->\n<svg\n  [style.width.px]=\"diameter\"\n  [style.height.px]=\"diameter\"\n  [attr.viewBox]=\"_getViewBox()\"\n  preserveAspectRatio=\"xMidYMid meet\"\n  focusable=\"false\"\n  [ngSwitch]=\"mode === 'indeterminate'\"\n  aria-hidden=\"true\">\n\n  <!--\n    Technically we can reuse the same `circle` element, however Safari has an issue that breaks\n    the SVG rendering in determinate mode, after switching between indeterminate and determinate.\n    Using a different element avoids the issue. An alternative to this is adding `display: none`\n    for a split second and then removing it when switching between modes, but it's hard to know\n    for how long to hide the element and it can cause the UI to blink.\n  -->\n  <circle\n    *ngSwitchCase=\"true\"\n    cx=\"50%\"\n    cy=\"50%\"\n    [attr.r]=\"_getCircleRadius()\"\n    [style.animation-name]=\"'mat-progress-spinner-stroke-rotate-' + _spinnerAnimationLabel\"\n    [style.stroke-dashoffset.px]=\"_getStrokeDashOffset()\"\n    [style.stroke-dasharray.px]=\"_getStrokeCircumference()\"\n    [style.stroke-width.%]=\"_getCircleStrokeWidth()\"></circle>\n\n  <circle\n    *ngSwitchCase=\"false\"\n    cx=\"50%\"\n    cy=\"50%\"\n    [attr.r]=\"_getCircleRadius()\"\n    [style.stroke-dashoffset.px]=\"_getStrokeDashOffset()\"\n    [style.stroke-dasharray.px]=\"_getStrokeCircumference()\"\n    [style.stroke-width.%]=\"_getCircleStrokeWidth()\"></circle>\n</svg>\n",
                changeDetection: ChangeDetectionStrategy.OnPush,
                encapsulation: ViewEncapsulation.None,
                styles: [".mat-progress-spinner{display:block;position:relative;overflow:hidden}.mat-progress-spinner svg{position:absolute;transform:rotate(-90deg);top:0;left:0;transform-origin:center;overflow:visible}.mat-progress-spinner circle{fill:transparent;transform-origin:center;transition:stroke-dashoffset 225ms linear}._mat-animation-noopable.mat-progress-spinner circle{transition:none;animation:none}.cdk-high-contrast-active .mat-progress-spinner circle{stroke:currentColor;stroke:CanvasText}.mat-progress-spinner.mat-progress-spinner-indeterminate-animation[mode=indeterminate] svg{animation:mat-progress-spinner-linear-rotate 2000ms linear infinite}._mat-animation-noopable.mat-progress-spinner.mat-progress-spinner-indeterminate-animation[mode=indeterminate] svg{transition:none;animation:none}.mat-progress-spinner.mat-progress-spinner-indeterminate-animation[mode=indeterminate] circle{transition-property:stroke;animation-duration:4000ms;animation-timing-function:cubic-bezier(0.35, 0, 0.25, 1);animation-iteration-count:infinite}._mat-animation-noopable.mat-progress-spinner.mat-progress-spinner-indeterminate-animation[mode=indeterminate] circle{transition:none;animation:none}.mat-progress-spinner.mat-progress-spinner-indeterminate-fallback-animation[mode=indeterminate] svg{animation:mat-progress-spinner-stroke-rotate-fallback 10000ms cubic-bezier(0.87, 0.03, 0.33, 1) infinite}._mat-animation-noopable.mat-progress-spinner.mat-progress-spinner-indeterminate-fallback-animation[mode=indeterminate] svg{transition:none;animation:none}.mat-progress-spinner.mat-progress-spinner-indeterminate-fallback-animation[mode=indeterminate] circle{transition-property:stroke}._mat-animation-noopable.mat-progress-spinner.mat-progress-spinner-indeterminate-fallback-animation[mode=indeterminate] circle{transition:none;animation:none}@keyframes mat-progress-spinner-linear-rotate{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}@keyframes mat-progress-spinner-stroke-rotate-100{0%{stroke-dashoffset:268.606171575px;transform:rotate(0)}12.5%{stroke-dashoffset:56.5486677px;transform:rotate(0)}12.5001%{stroke-dashoffset:56.5486677px;transform:rotateX(180deg) rotate(72.5deg)}25%{stroke-dashoffset:268.606171575px;transform:rotateX(180deg) rotate(72.5deg)}25.0001%{stroke-dashoffset:268.606171575px;transform:rotate(270deg)}37.5%{stroke-dashoffset:56.5486677px;transform:rotate(270deg)}37.5001%{stroke-dashoffset:56.5486677px;transform:rotateX(180deg) rotate(161.5deg)}50%{stroke-dashoffset:268.606171575px;transform:rotateX(180deg) rotate(161.5deg)}50.0001%{stroke-dashoffset:268.606171575px;transform:rotate(180deg)}62.5%{stroke-dashoffset:56.5486677px;transform:rotate(180deg)}62.5001%{stroke-dashoffset:56.5486677px;transform:rotateX(180deg) rotate(251.5deg)}75%{stroke-dashoffset:268.606171575px;transform:rotateX(180deg) rotate(251.5deg)}75.0001%{stroke-dashoffset:268.606171575px;transform:rotate(90deg)}87.5%{stroke-dashoffset:56.5486677px;transform:rotate(90deg)}87.5001%{stroke-dashoffset:56.5486677px;transform:rotateX(180deg) rotate(341.5deg)}100%{stroke-dashoffset:268.606171575px;transform:rotateX(180deg) rotate(341.5deg)}}@keyframes mat-progress-spinner-stroke-rotate-fallback{0%{transform:rotate(0deg)}25%{transform:rotate(1170deg)}50%{transform:rotate(2340deg)}75%{transform:rotate(3510deg)}100%{transform:rotate(4680deg)}}\n"]
            },] }
];
MatProgressSpinner.ctorParameters = () => [
    { type: ElementRef },
    { type: Platform },
    { type: undefined, decorators: [{ type: Optional }, { type: Inject, args: [DOCUMENT,] }] },
    { type: String, decorators: [{ type: Optional }, { type: Inject, args: [ANIMATION_MODULE_TYPE,] }] },
    { type: undefined, decorators: [{ type: Inject, args: [MAT_PROGRESS_SPINNER_DEFAULT_OPTIONS,] }] }
];
MatProgressSpinner.propDecorators = {
    diameter: [{ type: Input }],
    strokeWidth: [{ type: Input }],
    mode: [{ type: Input }],
    value: [{ type: Input }]
};
/**
 * `<mat-spinner>` component.
 *
 * This is a component definition to be used as a convenience reference to create an
 * indeterminate `<mat-progress-spinner>` instance.
 */
export class MatSpinner extends MatProgressSpinner {
    constructor(elementRef, platform, document, animationMode, defaults) {
        super(elementRef, platform, document, animationMode, defaults);
        this.mode = 'indeterminate';
    }
}
MatSpinner.decorators = [
    { type: Component, args: [{
                selector: 'mat-spinner',
                host: {
                    'role': 'progressbar',
                    'mode': 'indeterminate',
                    'class': 'mat-spinner mat-progress-spinner',
                    '[class._mat-animation-noopable]': `_noopAnimations`,
                    '[style.width.px]': 'diameter',
                    '[style.height.px]': 'diameter',
                },
                inputs: ['color'],
                template: "<!--\n  preserveAspectRatio of xMidYMid meet as the center of the viewport is the circle's\n  center. The center of the circle will remain at the center of the mat-progress-spinner\n  element containing the SVG. `focusable=\"false\"` prevents IE from allowing the user to\n  tab into the SVG element.\n-->\n<!--\n  All children need to be hidden for screen readers in order to support ChromeVox.\n  More context in the issue: https://github.com/angular/components/issues/22165.\n-->\n<svg\n  [style.width.px]=\"diameter\"\n  [style.height.px]=\"diameter\"\n  [attr.viewBox]=\"_getViewBox()\"\n  preserveAspectRatio=\"xMidYMid meet\"\n  focusable=\"false\"\n  [ngSwitch]=\"mode === 'indeterminate'\"\n  aria-hidden=\"true\">\n\n  <!--\n    Technically we can reuse the same `circle` element, however Safari has an issue that breaks\n    the SVG rendering in determinate mode, after switching between indeterminate and determinate.\n    Using a different element avoids the issue. An alternative to this is adding `display: none`\n    for a split second and then removing it when switching between modes, but it's hard to know\n    for how long to hide the element and it can cause the UI to blink.\n  -->\n  <circle\n    *ngSwitchCase=\"true\"\n    cx=\"50%\"\n    cy=\"50%\"\n    [attr.r]=\"_getCircleRadius()\"\n    [style.animation-name]=\"'mat-progress-spinner-stroke-rotate-' + _spinnerAnimationLabel\"\n    [style.stroke-dashoffset.px]=\"_getStrokeDashOffset()\"\n    [style.stroke-dasharray.px]=\"_getStrokeCircumference()\"\n    [style.stroke-width.%]=\"_getCircleStrokeWidth()\"></circle>\n\n  <circle\n    *ngSwitchCase=\"false\"\n    cx=\"50%\"\n    cy=\"50%\"\n    [attr.r]=\"_getCircleRadius()\"\n    [style.stroke-dashoffset.px]=\"_getStrokeDashOffset()\"\n    [style.stroke-dasharray.px]=\"_getStrokeCircumference()\"\n    [style.stroke-width.%]=\"_getCircleStrokeWidth()\"></circle>\n</svg>\n",
                changeDetection: ChangeDetectionStrategy.OnPush,
                encapsulation: ViewEncapsulation.None,
                styles: [".mat-progress-spinner{display:block;position:relative;overflow:hidden}.mat-progress-spinner svg{position:absolute;transform:rotate(-90deg);top:0;left:0;transform-origin:center;overflow:visible}.mat-progress-spinner circle{fill:transparent;transform-origin:center;transition:stroke-dashoffset 225ms linear}._mat-animation-noopable.mat-progress-spinner circle{transition:none;animation:none}.cdk-high-contrast-active .mat-progress-spinner circle{stroke:currentColor;stroke:CanvasText}.mat-progress-spinner.mat-progress-spinner-indeterminate-animation[mode=indeterminate] svg{animation:mat-progress-spinner-linear-rotate 2000ms linear infinite}._mat-animation-noopable.mat-progress-spinner.mat-progress-spinner-indeterminate-animation[mode=indeterminate] svg{transition:none;animation:none}.mat-progress-spinner.mat-progress-spinner-indeterminate-animation[mode=indeterminate] circle{transition-property:stroke;animation-duration:4000ms;animation-timing-function:cubic-bezier(0.35, 0, 0.25, 1);animation-iteration-count:infinite}._mat-animation-noopable.mat-progress-spinner.mat-progress-spinner-indeterminate-animation[mode=indeterminate] circle{transition:none;animation:none}.mat-progress-spinner.mat-progress-spinner-indeterminate-fallback-animation[mode=indeterminate] svg{animation:mat-progress-spinner-stroke-rotate-fallback 10000ms cubic-bezier(0.87, 0.03, 0.33, 1) infinite}._mat-animation-noopable.mat-progress-spinner.mat-progress-spinner-indeterminate-fallback-animation[mode=indeterminate] svg{transition:none;animation:none}.mat-progress-spinner.mat-progress-spinner-indeterminate-fallback-animation[mode=indeterminate] circle{transition-property:stroke}._mat-animation-noopable.mat-progress-spinner.mat-progress-spinner-indeterminate-fallback-animation[mode=indeterminate] circle{transition:none;animation:none}@keyframes mat-progress-spinner-linear-rotate{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}@keyframes mat-progress-spinner-stroke-rotate-100{0%{stroke-dashoffset:268.606171575px;transform:rotate(0)}12.5%{stroke-dashoffset:56.5486677px;transform:rotate(0)}12.5001%{stroke-dashoffset:56.5486677px;transform:rotateX(180deg) rotate(72.5deg)}25%{stroke-dashoffset:268.606171575px;transform:rotateX(180deg) rotate(72.5deg)}25.0001%{stroke-dashoffset:268.606171575px;transform:rotate(270deg)}37.5%{stroke-dashoffset:56.5486677px;transform:rotate(270deg)}37.5001%{stroke-dashoffset:56.5486677px;transform:rotateX(180deg) rotate(161.5deg)}50%{stroke-dashoffset:268.606171575px;transform:rotateX(180deg) rotate(161.5deg)}50.0001%{stroke-dashoffset:268.606171575px;transform:rotate(180deg)}62.5%{stroke-dashoffset:56.5486677px;transform:rotate(180deg)}62.5001%{stroke-dashoffset:56.5486677px;transform:rotateX(180deg) rotate(251.5deg)}75%{stroke-dashoffset:268.606171575px;transform:rotateX(180deg) rotate(251.5deg)}75.0001%{stroke-dashoffset:268.606171575px;transform:rotate(90deg)}87.5%{stroke-dashoffset:56.5486677px;transform:rotate(90deg)}87.5001%{stroke-dashoffset:56.5486677px;transform:rotateX(180deg) rotate(341.5deg)}100%{stroke-dashoffset:268.606171575px;transform:rotateX(180deg) rotate(341.5deg)}}@keyframes mat-progress-spinner-stroke-rotate-fallback{0%{transform:rotate(0deg)}25%{transform:rotate(1170deg)}50%{transform:rotate(2340deg)}75%{transform:rotate(3510deg)}100%{transform:rotate(4680deg)}}\n"]
            },] }
];
MatSpinner.ctorParameters = () => [
    { type: ElementRef },
    { type: Platform },
    { type: undefined, decorators: [{ type: Optional }, { type: Inject, args: [DOCUMENT,] }] },
    { type: String, decorators: [{ type: Optional }, { type: Inject, args: [ANIMATION_MODULE_TYPE,] }] },
    { type: undefined, decorators: [{ type: Inject, args: [MAT_PROGRESS_SPINNER_DEFAULT_OPTIONS,] }] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZ3Jlc3Mtc3Bpbm5lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9wcm9ncmVzcy1zcGlubmVyL3Byb2dyZXNzLXNwaW5uZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLG9CQUFvQixFQUFjLE1BQU0sdUJBQXVCLENBQUM7QUFDeEUsT0FBTyxFQUFDLFFBQVEsRUFBRSxjQUFjLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUMvRCxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDekMsT0FBTyxFQUNMLHVCQUF1QixFQUN2QixTQUFTLEVBQ1QsVUFBVSxFQUNWLE1BQU0sRUFDTixjQUFjLEVBQ2QsS0FBSyxFQUNMLFFBQVEsRUFDUixpQkFBaUIsR0FFbEIsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUF5QixVQUFVLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUMxRSxPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSxzQ0FBc0MsQ0FBQztBQU0zRTs7O0dBR0c7QUFDSCxNQUFNLFNBQVMsR0FBRyxHQUFHLENBQUM7QUFFdEI7OztHQUdHO0FBQ0gsTUFBTSxpQkFBaUIsR0FBRyxFQUFFLENBQUM7QUFFN0IseURBQXlEO0FBQ3pELG9CQUFvQjtBQUNwQixNQUFNLHNCQUFzQjtJQUMxQixZQUFtQixXQUF1QjtRQUF2QixnQkFBVyxHQUFYLFdBQVcsQ0FBWTtJQUFHLENBQUM7Q0FDL0M7QUFDRCxNQUFNLDRCQUE0QixHQUM5QixVQUFVLENBQUMsc0JBQXNCLEVBQUUsU0FBUyxDQUFDLENBQUM7QUFlbEQsNkZBQTZGO0FBQzdGLE1BQU0sQ0FBQyxNQUFNLG9DQUFvQyxHQUM3QyxJQUFJLGNBQWMsQ0FBbUMsc0NBQXNDLEVBQUU7SUFDM0YsVUFBVSxFQUFFLE1BQU07SUFDbEIsT0FBTyxFQUFFLDRDQUE0QztDQUN0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aUJBQ2hDO2dCQUNELE1BQU0sRUFBRSxDQUFDLE9BQU8sQ0FBQztnQkFDakIsKzNEQUFvQztnQkFFcEMsZUFBZSxFQUFFLHVCQUF1QixDQUFDLE1BQU07Z0JBQy9DLGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxJQUFJOzthQUN0Qzs7O1lBdFVDLFVBQVU7WUFMSixRQUFROzRDQThVRCxRQUFRLFlBQUksTUFBTSxTQUFDLFFBQVE7eUNBQzNCLFFBQVEsWUFBSSxNQUFNLFNBQUMscUJBQXFCOzRDQUN4QyxNQUFNLFNBQUMsb0NBQW9DIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Y29lcmNlTnVtYmVyUHJvcGVydHksIE51bWJlcklucHV0fSBmcm9tICdAYW5ndWxhci9jZGsvY29lcmNpb24nO1xuaW1wb3J0IHtQbGF0Zm9ybSwgX2dldFNoYWRvd1Jvb3R9IGZyb20gJ0Bhbmd1bGFyL2Nkay9wbGF0Zm9ybSc7XG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIENvbXBvbmVudCxcbiAgRWxlbWVudFJlZixcbiAgSW5qZWN0LFxuICBJbmplY3Rpb25Ub2tlbixcbiAgSW5wdXQsXG4gIE9wdGlvbmFsLFxuICBWaWV3RW5jYXBzdWxhdGlvbixcbiAgT25Jbml0LFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Q2FuQ29sb3IsIENhbkNvbG9yQ3RvciwgbWl4aW5Db2xvcn0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvY29yZSc7XG5pbXBvcnQge0FOSU1BVElPTl9NT0RVTEVfVFlQRX0gZnJvbSAnQGFuZ3VsYXIvcGxhdGZvcm0tYnJvd3Nlci9hbmltYXRpb25zJztcblxuXG4vKiogUG9zc2libGUgbW9kZSBmb3IgYSBwcm9ncmVzcyBzcGlubmVyLiAqL1xuZXhwb3J0IHR5cGUgUHJvZ3Jlc3NTcGlubmVyTW9kZSA9ICdkZXRlcm1pbmF0ZScgfCAnaW5kZXRlcm1pbmF0ZSc7XG5cbi8qKlxuICogQmFzZSByZWZlcmVuY2Ugc2l6ZSBvZiB0aGUgc3Bpbm5lci5cbiAqIEBkb2NzLXByaXZhdGVcbiAqL1xuY29uc3QgQkFTRV9TSVpFID0gMTAwO1xuXG4vKipcbiAqIEJhc2UgcmVmZXJlbmNlIHN0cm9rZSB3aWR0aCBvZiB0aGUgc3Bpbm5lci5cbiAqIEBkb2NzLXByaXZhdGVcbiAqL1xuY29uc3QgQkFTRV9TVFJPS0VfV0lEVEggPSAxMDtcblxuLy8gQm9pbGVycGxhdGUgZm9yIGFwcGx5aW5nIG1peGlucyB0byBNYXRQcm9ncmVzc1NwaW5uZXIuXG4vKiogQGRvY3MtcHJpdmF0ZSAqL1xuY2xhc3MgTWF0UHJvZ3Jlc3NTcGlubmVyQmFzZSB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBfZWxlbWVudFJlZjogRWxlbWVudFJlZikge31cbn1cbmNvbnN0IF9NYXRQcm9ncmVzc1NwaW5uZXJNaXhpbkJhc2U6IENhbkNvbG9yQ3RvciAmIHR5cGVvZiBNYXRQcm9ncmVzc1NwaW5uZXJCYXNlID1cbiAgICBtaXhpbkNvbG9yKE1hdFByb2dyZXNzU3Bpbm5lckJhc2UsICdwcmltYXJ5Jyk7XG5cbi8qKiBEZWZhdWx0IGBtYXQtcHJvZ3Jlc3Mtc3Bpbm5lcmAgb3B0aW9ucyB0aGF0IGNhbiBiZSBvdmVycmlkZGVuLiAqL1xuZXhwb3J0IGludGVyZmFjZSBNYXRQcm9ncmVzc1NwaW5uZXJEZWZhdWx0T3B0aW9ucyB7XG4gIC8qKiBEaWFtZXRlciBvZiB0aGUgc3Bpbm5lci4gKi9cbiAgZGlhbWV0ZXI/OiBudW1iZXI7XG4gIC8qKiBXaWR0aCBvZiB0aGUgc3Bpbm5lcidzIHN0cm9rZS4gKi9cbiAgc3Ryb2tlV2lkdGg/OiBudW1iZXI7XG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSBhbmltYXRpb25zIHNob3VsZCBiZSBmb3JjZSB0byBiZSBlbmFibGVkLCBpZ25vcmluZyBpZiB0aGUgY3VycmVudCBlbnZpcm9ubWVudCBpc1xuICAgKiB1c2luZyBOb29wQW5pbWF0aW9uc01vZHVsZS5cbiAgICovXG4gIF9mb3JjZUFuaW1hdGlvbnM/OiBib29sZWFuO1xufVxuXG4vKiogSW5qZWN0aW9uIHRva2VuIHRvIGJlIHVzZWQgdG8gb3ZlcnJpZGUgdGhlIGRlZmF1bHQgb3B0aW9ucyBmb3IgYG1hdC1wcm9ncmVzcy1zcGlubmVyYC4gKi9cbmV4cG9ydCBjb25zdCBNQVRfUFJPR1JFU1NfU1BJTk5FUl9ERUZBVUxUX09QVElPTlMgPVxuICAgIG5ldyBJbmplY3Rpb25Ub2tlbjxNYXRQcm9ncmVzc1NwaW5uZXJEZWZhdWx0T3B0aW9ucz4oJ21hdC1wcm9ncmVzcy1zcGlubmVyLWRlZmF1bHQtb3B0aW9ucycsIHtcbiAgICAgIHByb3ZpZGVkSW46ICdyb290JyxcbiAgICAgIGZhY3Rvcnk6IE1BVF9QUk9HUkVTU19TUElOTkVSX0RFRkFVTFRfT1BUSU9OU19GQUNUT1JZLFxuICAgIH0pO1xuXG4vKiogQGRvY3MtcHJpdmF0ZSAqL1xuZXhwb3J0IGZ1bmN0aW9uIE1BVF9QUk9HUkVTU19TUElOTkVSX0RFRkFVTFRfT1BUSU9OU19GQUNUT1JZKCk6IE1hdFByb2dyZXNzU3Bpbm5lckRlZmF1bHRPcHRpb25zIHtcbiAgcmV0dXJuIHtkaWFtZXRlcjogQkFTRV9TSVpFfTtcbn1cblxuLy8gLjAwMDEgcGVyY2VudGFnZSBkaWZmZXJlbmNlIGlzIG5lY2Vzc2FyeSBpbiBvcmRlciB0byBhdm9pZCB1bndhbnRlZCBhbmltYXRpb24gZnJhbWVzXG4vLyBmb3IgZXhhbXBsZSBiZWNhdXNlIHRoZSBhbmltYXRpb24gZHVyYXRpb24gaXMgNCBzZWNvbmRzLCAuMSUgYWNjb3VudHMgdG8gNG1zXG4vLyB3aGljaCBhcmUgZW5vdWdoIHRvIHNlZSB0aGUgZmxpY2tlciBkZXNjcmliZWQgaW5cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2NvbXBvbmVudHMvaXNzdWVzLzg5ODRcbmNvbnN0IElOREVURVJNSU5BVEVfQU5JTUFUSU9OX1RFTVBMQVRFID0gYFxuIEBrZXlmcmFtZXMgbWF0LXByb2dyZXNzLXNwaW5uZXItc3Ryb2tlLXJvdGF0ZS1ESUFNRVRFUiB7XG4gICAgMCUgICAgICB7IHN0cm9rZS1kYXNob2Zmc2V0OiBTVEFSVF9WQUxVRTsgIHRyYW5zZm9ybTogcm90YXRlKDApOyB9XG4gICAgMTIuNSUgICB7IHN0cm9rZS1kYXNob2Zmc2V0OiBFTkRfVkFMVUU7ICAgIHRyYW5zZm9ybTogcm90YXRlKDApOyB9XG4gICAgMTIuNTAwMSUgIHsgc3Ryb2tlLWRhc2hvZmZzZXQ6IEVORF9WQUxVRTsgICAgdHJhbnNmb3JtOiByb3RhdGVYKDE4MGRlZykgcm90YXRlKDcyLjVkZWcpOyB9XG4gICAgMjUlICAgICB7IHN0cm9rZS1kYXNob2Zmc2V0OiBTVEFSVF9WQUxVRTsgIHRyYW5zZm9ybTogcm90YXRlWCgxODBkZWcpIHJvdGF0ZSg3Mi41ZGVnKTsgfVxuXG4gICAgMjUuMDAwMSUgICB7IHN0cm9rZS1kYXNob2Zmc2V0OiBTVEFSVF9WQUxVRTsgIHRyYW5zZm9ybTogcm90YXRlKDI3MGRlZyk7IH1cbiAgICAzNy41JSAgIHsgc3Ryb2tlLWRhc2hvZmZzZXQ6IEVORF9WQUxVRTsgICAgdHJhbnNmb3JtOiByb3RhdGUoMjcwZGVnKTsgfVxuICAgIDM3LjUwMDElICB7IHN0cm9rZS1kYXNob2Zmc2V0OiBFTkRfVkFMVUU7ICAgIHRyYW5zZm9ybTogcm90YXRlWCgxODBkZWcpIHJvdGF0ZSgxNjEuNWRlZyk7IH1cbiAgICA1MCUgICAgIHsgc3Ryb2tlLWRhc2hvZmZzZXQ6IFNUQVJUX1ZBTFVFOyAgdHJhbnNmb3JtOiByb3RhdGVYKDE4MGRlZykgcm90YXRlKDE2MS41ZGVnKTsgfVxuXG4gICAgNTAuMDAwMSUgIHsgc3Ryb2tlLWRhc2hvZmZzZXQ6IFNUQVJUX1ZBTFVFOyAgdHJhbnNmb3JtOiByb3RhdGUoMTgwZGVnKTsgfVxuICAgIDYyLjUlICAgeyBzdHJva2UtZGFzaG9mZnNldDogRU5EX1ZBTFVFOyAgICB0cmFuc2Zvcm06IHJvdGF0ZSgxODBkZWcpOyB9XG4gICAgNjIuNTAwMSUgIHsgc3Ryb2tlLWRhc2hvZmZzZXQ6IEVORF9WQUxVRTsgICAgdHJhbnNmb3JtOiByb3RhdGVYKDE4MGRlZykgcm90YXRlKDI1MS41ZGVnKTsgfVxuICAgIDc1JSAgICAgeyBzdHJva2UtZGFzaG9mZnNldDogU1RBUlRfVkFMVUU7ICB0cmFuc2Zvcm06IHJvdGF0ZVgoMTgwZGVnKSByb3RhdGUoMjUxLjVkZWcpOyB9XG5cbiAgICA3NS4wMDAxJSAgeyBzdHJva2UtZGFzaG9mZnNldDogU1RBUlRfVkFMVUU7ICB0cmFuc2Zvcm06IHJvdGF0ZSg5MGRlZyk7IH1cbiAgICA4Ny41JSAgIHsgc3Ryb2tlLWRhc2hvZmZzZXQ6IEVORF9WQUxVRTsgICAgdHJhbnNmb3JtOiByb3RhdGUoOTBkZWcpOyB9XG4gICAgODcuNTAwMSUgIHsgc3Ryb2tlLWRhc2hvZmZzZXQ6IEVORF9WQUxVRTsgICAgdHJhbnNmb3JtOiByb3RhdGVYKDE4MGRlZykgcm90YXRlKDM0MS41ZGVnKTsgfVxuICAgIDEwMCUgICAgeyBzdHJva2UtZGFzaG9mZnNldDogU1RBUlRfVkFMVUU7ICB0cmFuc2Zvcm06IHJvdGF0ZVgoMTgwZGVnKSByb3RhdGUoMzQxLjVkZWcpOyB9XG4gIH1cbmA7XG5cbi8qKlxuICogYDxtYXQtcHJvZ3Jlc3Mtc3Bpbm5lcj5gIGNvbXBvbmVudC5cbiAqL1xuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbWF0LXByb2dyZXNzLXNwaW5uZXInLFxuICBleHBvcnRBczogJ21hdFByb2dyZXNzU3Bpbm5lcicsXG4gIGhvc3Q6IHtcbiAgICAncm9sZSc6ICdwcm9ncmVzc2JhcicsXG4gICAgJ2NsYXNzJzogJ21hdC1wcm9ncmVzcy1zcGlubmVyJyxcbiAgICAvLyBzZXQgdGFiIGluZGV4IHRvIC0xIHNvIHNjcmVlbiByZWFkZXJzIHdpbGwgcmVhZCB0aGUgYXJpYS1sYWJlbFxuICAgIC8vIE5vdGU6IHRoZXJlIGlzIGEga25vd24gaXNzdWUgd2l0aCBKQVdTIHRoYXQgZG9lcyBub3QgcmVhZCBwcm9ncmVzc2JhciBhcmlhIGxhYmVscyBvbiBGaXJlRm94XG4gICAgJ3RhYmluZGV4JzogJy0xJyxcbiAgICAnW2NsYXNzLl9tYXQtYW5pbWF0aW9uLW5vb3BhYmxlXSc6IGBfbm9vcEFuaW1hdGlvbnNgLFxuICAgICdbc3R5bGUud2lkdGgucHhdJzogJ2RpYW1ldGVyJyxcbiAgICAnW3N0eWxlLmhlaWdodC5weF0nOiAnZGlhbWV0ZXInLFxuICAgICdbYXR0ci5hcmlhLXZhbHVlbWluXSc6ICdtb2RlID09PSBcImRldGVybWluYXRlXCIgPyAwIDogbnVsbCcsXG4gICAgJ1thdHRyLmFyaWEtdmFsdWVtYXhdJzogJ21vZGUgPT09IFwiZGV0ZXJtaW5hdGVcIiA/IDEwMCA6IG51bGwnLFxuICAgICdbYXR0ci5hcmlhLXZhbHVlbm93XSc6ICdtb2RlID09PSBcImRldGVybWluYXRlXCIgPyB2YWx1ZSA6IG51bGwnLFxuICAgICdbYXR0ci5tb2RlXSc6ICdtb2RlJyxcbiAgfSxcbiAgaW5wdXRzOiBbJ2NvbG9yJ10sXG4gIHRlbXBsYXRlVXJsOiAncHJvZ3Jlc3Mtc3Bpbm5lci5odG1sJyxcbiAgc3R5bGVVcmxzOiBbJ3Byb2dyZXNzLXNwaW5uZXIuY3NzJ10sXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxufSlcbmV4cG9ydCBjbGFzcyBNYXRQcm9ncmVzc1NwaW5uZXIgZXh0ZW5kcyBfTWF0UHJvZ3Jlc3NTcGlubmVyTWl4aW5CYXNlIGltcGxlbWVudHMgT25Jbml0LCBDYW5Db2xvciB7XG4gIHByaXZhdGUgX2RpYW1ldGVyID0gQkFTRV9TSVpFO1xuICBwcml2YXRlIF92YWx1ZSA9IDA7XG4gIHByaXZhdGUgX3N0cm9rZVdpZHRoOiBudW1iZXI7XG4gIHByaXZhdGUgX2ZhbGxiYWNrQW5pbWF0aW9uID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIEVsZW1lbnQgdG8gd2hpY2ggd2Ugc2hvdWxkIGFkZCB0aGUgZ2VuZXJhdGVkIHN0eWxlIHRhZ3MgZm9yIHRoZSBpbmRldGVybWluYXRlIGFuaW1hdGlvbi5cbiAgICogRm9yIG1vc3QgZWxlbWVudHMgdGhpcyBpcyB0aGUgZG9jdW1lbnQsIGJ1dCBmb3IgdGhlIG9uZXMgaW4gdGhlIFNoYWRvdyBET00gd2UgbmVlZCB0b1xuICAgKiB1c2UgdGhlIHNoYWRvdyByb290LlxuICAgKi9cbiAgcHJpdmF0ZSBfc3R5bGVSb290OiBOb2RlO1xuXG4gIC8qKlxuICAgKiBUcmFja3MgZGlhbWV0ZXJzIG9mIGV4aXN0aW5nIGluc3RhbmNlcyB0byBkZS1kdXBlIGdlbmVyYXRlZCBzdHlsZXMgKGRlZmF1bHQgZCA9IDEwMCkuXG4gICAqIFdlIG5lZWQgdG8ga2VlcCB0cmFjayBvZiB3aGljaCBlbGVtZW50cyB0aGUgZGlhbWV0ZXJzIHdlcmUgYXR0YWNoZWQgdG8sIGJlY2F1c2UgZm9yXG4gICAqIGVsZW1lbnRzIGluIHRoZSBTaGFkb3cgRE9NIHRoZSBzdHlsZSB0YWdzIGFyZSBhdHRhY2hlZCB0byB0aGUgc2hhZG93IHJvb3QsIHJhdGhlclxuICAgKiB0aGFuIHRoZSBkb2N1bWVudCBoZWFkLlxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgX2RpYW1ldGVycyA9IG5ldyBXZWFrTWFwPE5vZGUsIFNldDxudW1iZXI+PigpO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBfbWF0LWFuaW1hdGlvbi1ub29wYWJsZSBjbGFzcyBzaG91bGQgYmUgYXBwbGllZCwgZGlzYWJsaW5nIGFuaW1hdGlvbnMuICAqL1xuICBfbm9vcEFuaW1hdGlvbnM6IGJvb2xlYW47XG5cbiAgLyoqIEEgc3RyaW5nIHRoYXQgaXMgdXNlZCBmb3Igc2V0dGluZyB0aGUgc3Bpbm5lciBhbmltYXRpb24tbmFtZSBDU1MgcHJvcGVydHkgKi9cbiAgX3NwaW5uZXJBbmltYXRpb25MYWJlbDogc3RyaW5nO1xuXG4gIC8qKiBUaGUgZGlhbWV0ZXIgb2YgdGhlIHByb2dyZXNzIHNwaW5uZXIgKHdpbGwgc2V0IHdpZHRoIGFuZCBoZWlnaHQgb2Ygc3ZnKS4gKi9cbiAgQElucHV0KClcbiAgZ2V0IGRpYW1ldGVyKCk6IG51bWJlciB7IHJldHVybiB0aGlzLl9kaWFtZXRlcjsgfVxuICBzZXQgZGlhbWV0ZXIoc2l6ZTogbnVtYmVyKSB7XG4gICAgdGhpcy5fZGlhbWV0ZXIgPSBjb2VyY2VOdW1iZXJQcm9wZXJ0eShzaXplKTtcbiAgICB0aGlzLl9zcGlubmVyQW5pbWF0aW9uTGFiZWwgPSB0aGlzLl9nZXRTcGlubmVyQW5pbWF0aW9uTGFiZWwoKTtcblxuICAgIC8vIElmIHRoaXMgaXMgc2V0IGJlZm9yZSBgbmdPbkluaXRgLCB0aGUgc3R5bGUgcm9vdCBtYXkgbm90IGhhdmUgYmVlbiByZXNvbHZlZCB5ZXQuXG4gICAgaWYgKCF0aGlzLl9mYWxsYmFja0FuaW1hdGlvbiAmJiB0aGlzLl9zdHlsZVJvb3QpIHtcbiAgICAgIHRoaXMuX2F0dGFjaFN0eWxlTm9kZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBTdHJva2Ugd2lkdGggb2YgdGhlIHByb2dyZXNzIHNwaW5uZXIuICovXG4gIEBJbnB1dCgpXG4gIGdldCBzdHJva2VXaWR0aCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9zdHJva2VXaWR0aCB8fCB0aGlzLmRpYW1ldGVyIC8gMTA7XG4gIH1cbiAgc2V0IHN0cm9rZVdpZHRoKHZhbHVlOiBudW1iZXIpIHtcbiAgICB0aGlzLl9zdHJva2VXaWR0aCA9IGNvZXJjZU51bWJlclByb3BlcnR5KHZhbHVlKTtcbiAgfVxuXG4gIC8qKiBNb2RlIG9mIHRoZSBwcm9ncmVzcyBjaXJjbGUgKi9cbiAgQElucHV0KCkgbW9kZTogUHJvZ3Jlc3NTcGlubmVyTW9kZSA9ICdkZXRlcm1pbmF0ZSc7XG5cbiAgLyoqIFZhbHVlIG9mIHRoZSBwcm9ncmVzcyBjaXJjbGUuICovXG4gIEBJbnB1dCgpXG4gIGdldCB2YWx1ZSgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLm1vZGUgPT09ICdkZXRlcm1pbmF0ZScgPyB0aGlzLl92YWx1ZSA6IDA7XG4gIH1cbiAgc2V0IHZhbHVlKG5ld1ZhbHVlOiBudW1iZXIpIHtcbiAgICB0aGlzLl92YWx1ZSA9IE1hdGgubWF4KDAsIE1hdGgubWluKDEwMCwgY29lcmNlTnVtYmVyUHJvcGVydHkobmV3VmFsdWUpKSk7XG4gIH1cblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+LFxuICAgICAgICAgICAgICBwbGF0Zm9ybTogUGxhdGZvcm0sXG4gICAgICAgICAgICAgIEBPcHRpb25hbCgpIEBJbmplY3QoRE9DVU1FTlQpIHByaXZhdGUgX2RvY3VtZW50OiBhbnksXG4gICAgICAgICAgICAgIEBPcHRpb25hbCgpIEBJbmplY3QoQU5JTUFUSU9OX01PRFVMRV9UWVBFKSBhbmltYXRpb25Nb2RlOiBzdHJpbmcsXG4gICAgICAgICAgICAgIEBJbmplY3QoTUFUX1BST0dSRVNTX1NQSU5ORVJfREVGQVVMVF9PUFRJT05TKVxuICAgICAgICAgICAgICAgICAgZGVmYXVsdHM/OiBNYXRQcm9ncmVzc1NwaW5uZXJEZWZhdWx0T3B0aW9ucykge1xuXG4gICAgc3VwZXIoX2VsZW1lbnRSZWYpO1xuXG4gICAgY29uc3QgdHJhY2tlZERpYW1ldGVycyA9IE1hdFByb2dyZXNzU3Bpbm5lci5fZGlhbWV0ZXJzO1xuICAgIHRoaXMuX3NwaW5uZXJBbmltYXRpb25MYWJlbCA9IHRoaXMuX2dldFNwaW5uZXJBbmltYXRpb25MYWJlbCgpO1xuXG4gICAgLy8gVGhlIGJhc2Ugc2l6ZSBpcyBhbHJlYWR5IGluc2VydGVkIHZpYSB0aGUgY29tcG9uZW50J3Mgc3RydWN0dXJhbCBzdHlsZXMuIFdlIHN0aWxsXG4gICAgLy8gbmVlZCB0byB0cmFjayBpdCBzbyB3ZSBkb24ndCBlbmQgdXAgYWRkaW5nIHRoZSBzYW1lIHN0eWxlcyBhZ2Fpbi5cbiAgICBpZiAoIXRyYWNrZWREaWFtZXRlcnMuaGFzKF9kb2N1bWVudC5oZWFkKSkge1xuICAgICAgdHJhY2tlZERpYW1ldGVycy5zZXQoX2RvY3VtZW50LmhlYWQsIG5ldyBTZXQ8bnVtYmVyPihbQkFTRV9TSVpFXSkpO1xuICAgIH1cblxuICAgIHRoaXMuX2ZhbGxiYWNrQW5pbWF0aW9uID0gcGxhdGZvcm0uRURHRSB8fCBwbGF0Zm9ybS5UUklERU5UO1xuICAgIHRoaXMuX25vb3BBbmltYXRpb25zID0gYW5pbWF0aW9uTW9kZSA9PT0gJ05vb3BBbmltYXRpb25zJyAmJlxuICAgICAgICAoISFkZWZhdWx0cyAmJiAhZGVmYXVsdHMuX2ZvcmNlQW5pbWF0aW9ucyk7XG5cbiAgICBpZiAoZGVmYXVsdHMpIHtcbiAgICAgIGlmIChkZWZhdWx0cy5kaWFtZXRlcikge1xuICAgICAgICB0aGlzLmRpYW1ldGVyID0gZGVmYXVsdHMuZGlhbWV0ZXI7XG4gICAgICB9XG5cbiAgICAgIGlmIChkZWZhdWx0cy5zdHJva2VXaWR0aCkge1xuICAgICAgICB0aGlzLnN0cm9rZVdpZHRoID0gZGVmYXVsdHMuc3Ryb2tlV2lkdGg7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgY29uc3QgZWxlbWVudCA9IHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudDtcblxuICAgIC8vIE5vdGUgdGhhdCB3ZSBuZWVkIHRvIGxvb2sgdXAgdGhlIHJvb3Qgbm9kZSBpbiBuZ09uSW5pdCwgcmF0aGVyIHRoYW4gdGhlIGNvbnN0cnVjdG9yLCBiZWNhdXNlXG4gICAgLy8gQW5ndWxhciBzZWVtcyB0byBjcmVhdGUgdGhlIGVsZW1lbnQgb3V0c2lkZSB0aGUgc2hhZG93IHJvb3QgYW5kIHRoZW4gbW92ZXMgaXQgaW5zaWRlLCBpZiB0aGVcbiAgICAvLyBub2RlIGlzIGluc2lkZSBhbiBgbmdJZmAgYW5kIGEgU2hhZG93RG9tLWVuY2Fwc3VsYXRlZCBjb21wb25lbnQuXG4gICAgdGhpcy5fc3R5bGVSb290ID0gX2dldFNoYWRvd1Jvb3QoZWxlbWVudCkgfHwgdGhpcy5fZG9jdW1lbnQuaGVhZDtcbiAgICB0aGlzLl9hdHRhY2hTdHlsZU5vZGUoKTtcblxuICAgIC8vIE9uIElFIGFuZCBFZGdlLCB3ZSBjYW4ndCBhbmltYXRlIHRoZSBgc3Ryb2tlLWRhc2hvZmZzZXRgXG4gICAgLy8gcmVsaWFibHkgc28gd2UgZmFsbCBiYWNrIHRvIGEgbm9uLXNwZWMgYW5pbWF0aW9uLlxuICAgIGNvbnN0IGFuaW1hdGlvbkNsYXNzID1cbiAgICAgIGBtYXQtcHJvZ3Jlc3Mtc3Bpbm5lci1pbmRldGVybWluYXRlJHt0aGlzLl9mYWxsYmFja0FuaW1hdGlvbiA/ICctZmFsbGJhY2snIDogJyd9LWFuaW1hdGlvbmA7XG5cbiAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoYW5pbWF0aW9uQ2xhc3MpO1xuICB9XG5cbiAgLyoqIFRoZSByYWRpdXMgb2YgdGhlIHNwaW5uZXIsIGFkanVzdGVkIGZvciBzdHJva2Ugd2lkdGguICovXG4gIF9nZXRDaXJjbGVSYWRpdXMoKSB7XG4gICAgcmV0dXJuICh0aGlzLmRpYW1ldGVyIC0gQkFTRV9TVFJPS0VfV0lEVEgpIC8gMjtcbiAgfVxuXG4gIC8qKiBUaGUgdmlldyBib3ggb2YgdGhlIHNwaW5uZXIncyBzdmcgZWxlbWVudC4gKi9cbiAgX2dldFZpZXdCb3goKSB7XG4gICAgY29uc3Qgdmlld0JveCA9IHRoaXMuX2dldENpcmNsZVJhZGl1cygpICogMiArIHRoaXMuc3Ryb2tlV2lkdGg7XG4gICAgcmV0dXJuIGAwIDAgJHt2aWV3Qm94fSAke3ZpZXdCb3h9YDtcbiAgfVxuXG4gIC8qKiBUaGUgc3Ryb2tlIGNpcmN1bWZlcmVuY2Ugb2YgdGhlIHN2ZyBjaXJjbGUuICovXG4gIF9nZXRTdHJva2VDaXJjdW1mZXJlbmNlKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIDIgKiBNYXRoLlBJICogdGhpcy5fZ2V0Q2lyY2xlUmFkaXVzKCk7XG4gIH1cblxuICAvKiogVGhlIGRhc2ggb2Zmc2V0IG9mIHRoZSBzdmcgY2lyY2xlLiAqL1xuICBfZ2V0U3Ryb2tlRGFzaE9mZnNldCgpIHtcbiAgICBpZiAodGhpcy5tb2RlID09PSAnZGV0ZXJtaW5hdGUnKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZ2V0U3Ryb2tlQ2lyY3VtZmVyZW5jZSgpICogKDEwMCAtIHRoaXMuX3ZhbHVlKSAvIDEwMDtcbiAgICB9XG5cbiAgICAvLyBJbiBmYWxsYmFjayBtb2RlIHNldCB0aGUgY2lyY2xlIHRvIDgwJSBhbmQgcm90YXRlIGl0IHdpdGggQ1NTLlxuICAgIGlmICh0aGlzLl9mYWxsYmFja0FuaW1hdGlvbiAmJiB0aGlzLm1vZGUgPT09ICdpbmRldGVybWluYXRlJykge1xuICAgICAgcmV0dXJuIHRoaXMuX2dldFN0cm9rZUNpcmN1bWZlcmVuY2UoKSAqIDAuMjtcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKiBTdHJva2Ugd2lkdGggb2YgdGhlIGNpcmNsZSBpbiBwZXJjZW50LiAqL1xuICBfZ2V0Q2lyY2xlU3Ryb2tlV2lkdGgoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3Ryb2tlV2lkdGggLyB0aGlzLmRpYW1ldGVyICogMTAwO1xuICB9XG5cbiAgLyoqIER5bmFtaWNhbGx5IGdlbmVyYXRlcyBhIHN0eWxlIHRhZyBjb250YWluaW5nIHRoZSBjb3JyZWN0IGFuaW1hdGlvbiBmb3IgdGhpcyBkaWFtZXRlci4gKi9cbiAgcHJpdmF0ZSBfYXR0YWNoU3R5bGVOb2RlKCk6IHZvaWQge1xuICAgIGNvbnN0IHN0eWxlUm9vdCA9IHRoaXMuX3N0eWxlUm9vdDtcbiAgICBjb25zdCBjdXJyZW50RGlhbWV0ZXIgPSB0aGlzLl9kaWFtZXRlcjtcbiAgICBjb25zdCBkaWFtZXRlcnMgPSBNYXRQcm9ncmVzc1NwaW5uZXIuX2RpYW1ldGVycztcbiAgICBsZXQgZGlhbWV0ZXJzRm9yRWxlbWVudCA9IGRpYW1ldGVycy5nZXQoc3R5bGVSb290KTtcblxuICAgIGlmICghZGlhbWV0ZXJzRm9yRWxlbWVudCB8fCAhZGlhbWV0ZXJzRm9yRWxlbWVudC5oYXMoY3VycmVudERpYW1ldGVyKSkge1xuICAgICAgY29uc3Qgc3R5bGVUYWc6IEhUTUxTdHlsZUVsZW1lbnQgPSB0aGlzLl9kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICAgICAgc3R5bGVUYWcuc2V0QXR0cmlidXRlKCdtYXQtc3Bpbm5lci1hbmltYXRpb24nLCB0aGlzLl9zcGlubmVyQW5pbWF0aW9uTGFiZWwpO1xuICAgICAgc3R5bGVUYWcudGV4dENvbnRlbnQgPSB0aGlzLl9nZXRBbmltYXRpb25UZXh0KCk7XG4gICAgICBzdHlsZVJvb3QuYXBwZW5kQ2hpbGQoc3R5bGVUYWcpO1xuXG4gICAgICBpZiAoIWRpYW1ldGVyc0ZvckVsZW1lbnQpIHtcbiAgICAgICAgZGlhbWV0ZXJzRm9yRWxlbWVudCA9IG5ldyBTZXQ8bnVtYmVyPigpO1xuICAgICAgICBkaWFtZXRlcnMuc2V0KHN0eWxlUm9vdCwgZGlhbWV0ZXJzRm9yRWxlbWVudCk7XG4gICAgICB9XG5cbiAgICAgIGRpYW1ldGVyc0ZvckVsZW1lbnQuYWRkKGN1cnJlbnREaWFtZXRlcik7XG4gICAgfVxuICB9XG5cbiAgLyoqIEdlbmVyYXRlcyBhbmltYXRpb24gc3R5bGVzIGFkanVzdGVkIGZvciB0aGUgc3Bpbm5lcidzIGRpYW1ldGVyLiAqL1xuICBwcml2YXRlIF9nZXRBbmltYXRpb25UZXh0KCk6IHN0cmluZyB7XG4gICAgY29uc3Qgc3Ryb2tlQ2lyY3VtZmVyZW5jZSA9IHRoaXMuX2dldFN0cm9rZUNpcmN1bWZlcmVuY2UoKTtcbiAgICByZXR1cm4gSU5ERVRFUk1JTkFURV9BTklNQVRJT05fVEVNUExBVEVcbiAgICAgICAgLy8gQW5pbWF0aW9uIHNob3VsZCBiZWdpbiBhdCA1JSBhbmQgZW5kIGF0IDgwJVxuICAgICAgICAucmVwbGFjZSgvU1RBUlRfVkFMVUUvZywgYCR7MC45NSAqIHN0cm9rZUNpcmN1bWZlcmVuY2V9YClcbiAgICAgICAgLnJlcGxhY2UoL0VORF9WQUxVRS9nLCBgJHswLjIgKiBzdHJva2VDaXJjdW1mZXJlbmNlfWApXG4gICAgICAgIC5yZXBsYWNlKC9ESUFNRVRFUi9nLCBgJHt0aGlzLl9zcGlubmVyQW5pbWF0aW9uTGFiZWx9YCk7XG4gIH1cblxuICAvKiogUmV0dXJucyB0aGUgY2lyY2xlIGRpYW1ldGVyIGZvcm1hdHRlZCBmb3IgdXNlIHdpdGggdGhlIGFuaW1hdGlvbi1uYW1lIENTUyBwcm9wZXJ0eS4gKi9cbiAgcHJpdmF0ZSBfZ2V0U3Bpbm5lckFuaW1hdGlvbkxhYmVsKCk6IHN0cmluZyB7XG4gICAgLy8gVGhlIHN0cmluZyBvZiBhIGZsb2F0IHBvaW50IG51bWJlciB3aWxsIGluY2x1ZGUgYSBwZXJpb2Qg4oCYLuKAmSBjaGFyYWN0ZXIsXG4gICAgLy8gd2hpY2ggaXMgbm90IHZhbGlkIGZvciBhIENTUyBhbmltYXRpb24tbmFtZS5cbiAgICByZXR1cm4gdGhpcy5kaWFtZXRlci50b1N0cmluZygpLnJlcGxhY2UoJy4nLCAnXycpO1xuICB9XG5cbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2RpYW1ldGVyOiBOdW1iZXJJbnB1dDtcbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N0cm9rZVdpZHRoOiBOdW1iZXJJbnB1dDtcbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3ZhbHVlOiBOdW1iZXJJbnB1dDtcbn1cblxuXG4vKipcbiAqIGA8bWF0LXNwaW5uZXI+YCBjb21wb25lbnQuXG4gKlxuICogVGhpcyBpcyBhIGNvbXBvbmVudCBkZWZpbml0aW9uIHRvIGJlIHVzZWQgYXMgYSBjb252ZW5pZW5jZSByZWZlcmVuY2UgdG8gY3JlYXRlIGFuXG4gKiBpbmRldGVybWluYXRlIGA8bWF0LXByb2dyZXNzLXNwaW5uZXI+YCBpbnN0YW5jZS5cbiAqL1xuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbWF0LXNwaW5uZXInLFxuICBob3N0OiB7XG4gICAgJ3JvbGUnOiAncHJvZ3Jlc3NiYXInLFxuICAgICdtb2RlJzogJ2luZGV0ZXJtaW5hdGUnLFxuICAgICdjbGFzcyc6ICdtYXQtc3Bpbm5lciBtYXQtcHJvZ3Jlc3Mtc3Bpbm5lcicsXG4gICAgJ1tjbGFzcy5fbWF0LWFuaW1hdGlvbi1ub29wYWJsZV0nOiBgX25vb3BBbmltYXRpb25zYCxcbiAgICAnW3N0eWxlLndpZHRoLnB4XSc6ICdkaWFtZXRlcicsXG4gICAgJ1tzdHlsZS5oZWlnaHQucHhdJzogJ2RpYW1ldGVyJyxcbiAgfSxcbiAgaW5wdXRzOiBbJ2NvbG9yJ10sXG4gIHRlbXBsYXRlVXJsOiAncHJvZ3Jlc3Mtc3Bpbm5lci5odG1sJyxcbiAgc3R5bGVVcmxzOiBbJ3Byb2dyZXNzLXNwaW5uZXIuY3NzJ10sXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxufSlcbmV4cG9ydCBjbGFzcyBNYXRTcGlubmVyIGV4dGVuZHMgTWF0UHJvZ3Jlc3NTcGlubmVyIHtcbiAgY29uc3RydWN0b3IoZWxlbWVudFJlZjogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4sIHBsYXRmb3JtOiBQbGF0Zm9ybSxcbiAgICAgICAgICAgICAgQE9wdGlvbmFsKCkgQEluamVjdChET0NVTUVOVCkgZG9jdW1lbnQ6IGFueSxcbiAgICAgICAgICAgICAgQE9wdGlvbmFsKCkgQEluamVjdChBTklNQVRJT05fTU9EVUxFX1RZUEUpIGFuaW1hdGlvbk1vZGU6IHN0cmluZyxcbiAgICAgICAgICAgICAgQEluamVjdChNQVRfUFJPR1JFU1NfU1BJTk5FUl9ERUZBVUxUX09QVElPTlMpXG4gICAgICAgICAgICAgICAgICBkZWZhdWx0cz86IE1hdFByb2dyZXNzU3Bpbm5lckRlZmF1bHRPcHRpb25zKSB7XG4gICAgc3VwZXIoZWxlbWVudFJlZiwgcGxhdGZvcm0sIGRvY3VtZW50LCBhbmltYXRpb25Nb2RlLCBkZWZhdWx0cyk7XG4gICAgdGhpcy5tb2RlID0gJ2luZGV0ZXJtaW5hdGUnO1xuICB9XG59XG4iXX0=