/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Platform } from '@angular/cdk/platform';
import { Directive, ElementRef, Inject, InjectionToken, Input, NgZone, Optional, } from '@angular/core';
import { RippleRenderer } from './ripple-renderer';
import { ANIMATION_MODULE_TYPE } from '@angular/platform-browser/animations';
/** Injection token that can be used to specify the global ripple options. */
export const MAT_RIPPLE_GLOBAL_OPTIONS = new InjectionToken('mat-ripple-global-options');
export class MatRipple {
    constructor(_elementRef, ngZone, platform, globalOptions, _animationMode) {
        this._elementRef = _elementRef;
        this._animationMode = _animationMode;
        /**
         * If set, the radius in pixels of foreground ripples when fully expanded. If unset, the radius
         * will be the distance from the center of the ripple to the furthest corner of the host element's
         * bounding rectangle.
         */
        this.radius = 0;
        this._disabled = false;
        /** Whether ripple directive is initialized and the input bindings are set. */
        this._isInitialized = false;
        this._globalOptions = globalOptions || {};
        this._rippleRenderer = new RippleRenderer(this, ngZone, _elementRef, platform);
    }
    /**
     * Whether click events will not trigger the ripple. Ripples can be still launched manually
     * by using the `launch()` method.
     */
    get disabled() { return this._disabled; }
    set disabled(value) {
        if (value) {
            this.fadeOutAllNonPersistent();
        }
        this._disabled = value;
        this._setupTriggerEventsIfEnabled();
    }
    /**
     * The element that triggers the ripple when click events are received.
     * Defaults to the directive's host element.
     */
    get trigger() { return this._trigger || this._elementRef.nativeElement; }
    set trigger(trigger) {
        this._trigger = trigger;
        this._setupTriggerEventsIfEnabled();
    }
    ngOnInit() {
        this._isInitialized = true;
        this._setupTriggerEventsIfEnabled();
    }
    ngOnDestroy() {
        this._rippleRenderer._removeTriggerEvents();
    }
    /** Fades out all currently showing ripple elements. */
    fadeOutAll() {
        this._rippleRenderer.fadeOutAll();
    }
    /** Fades out all currently showing non-persistent ripple elements. */
    fadeOutAllNonPersistent() {
        this._rippleRenderer.fadeOutAllNonPersistent();
    }
    /**
     * Ripple configuration from the directive's input values.
     * @docs-private Implemented as part of RippleTarget
     */
    get rippleConfig() {
        return {
            centered: this.centered,
            radius: this.radius,
            color: this.color,
            animation: Object.assign(Object.assign(Object.assign({}, this._globalOptions.animation), (this._animationMode === 'NoopAnimations' ? { enterDuration: 0, exitDuration: 0 } : {})), this.animation),
            terminateOnPointerUp: this._globalOptions.terminateOnPointerUp,
        };
    }
    /**
     * Whether ripples on pointer-down are disabled or not.
     * @docs-private Implemented as part of RippleTarget
     */
    get rippleDisabled() {
        return this.disabled || !!this._globalOptions.disabled;
    }
    /** Sets up the trigger event listeners if ripples are enabled. */
    _setupTriggerEventsIfEnabled() {
        if (!this.disabled && this._isInitialized) {
            this._rippleRenderer.setupTriggerEvents(this.trigger);
        }
    }
    /** Launches a manual ripple at the specified coordinated or just by the ripple config. */
    launch(configOrX, y = 0, config) {
        if (typeof configOrX === 'number') {
            return this._rippleRenderer.fadeInRipple(configOrX, y, Object.assign(Object.assign({}, this.rippleConfig), config));
        }
        else {
            return this._rippleRenderer.fadeInRipple(0, 0, Object.assign(Object.assign({}, this.rippleConfig), configOrX));
        }
    }
}
MatRipple.decorators = [
    { type: Directive, args: [{
                selector: '[mat-ripple], [matRipple]',
                exportAs: 'matRipple',
                host: {
                    'class': 'mat-ripple',
                    '[class.mat-ripple-unbounded]': 'unbounded'
                }
            },] }
];
MatRipple.ctorParameters = () => [
    { type: ElementRef },
    { type: NgZone },
    { type: Platform },
    { type: undefined, decorators: [{ type: Optional }, { type: Inject, args: [MAT_RIPPLE_GLOBAL_OPTIONS,] }] },
    { type: String, decorators: [{ type: Optional }, { type: Inject, args: [ANIMATION_MODULE_TYPE,] }] }
];
MatRipple.propDecorators = {
    color: [{ type: Input, args: ['matRippleColor',] }],
    unbounded: [{ type: Input, args: ['matRippleUnbounded',] }],
    centered: [{ type: Input, args: ['matRippleCentered',] }],
    radius: [{ type: Input, args: ['matRippleRadius',] }],
    animation: [{ type: Input, args: ['matRippleAnimation',] }],
    disabled: [{ type: Input, args: ['matRippleDisabled',] }],
    trigger: [{ type: Input, args: ['matRippleTrigger',] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmlwcGxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL2NvcmUvcmlwcGxlL3JpcHBsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDL0MsT0FBTyxFQUNMLFNBQVMsRUFDVCxVQUFVLEVBQ1YsTUFBTSxFQUNOLGNBQWMsRUFDZCxLQUFLLEVBQ0wsTUFBTSxFQUdOLFFBQVEsR0FDVCxNQUFNLGVBQWUsQ0FBQztBQUV2QixPQUFPLEVBQUMsY0FBYyxFQUFlLE1BQU0sbUJBQW1CLENBQUM7QUFDL0QsT0FBTyxFQUFDLHFCQUFxQixFQUFDLE1BQU0sc0NBQXNDLENBQUM7QUF3QjNFLDZFQUE2RTtBQUM3RSxNQUFNLENBQUMsTUFBTSx5QkFBeUIsR0FDbEMsSUFBSSxjQUFjLENBQXNCLDJCQUEyQixDQUFDLENBQUM7QUFVekUsTUFBTSxPQUFPLFNBQVM7SUFnRXBCLFlBQW9CLFdBQW9DLEVBQzVDLE1BQWMsRUFDZCxRQUFrQixFQUM2QixhQUFtQyxFQUMvQixjQUF1QjtRQUpsRSxnQkFBVyxHQUFYLFdBQVcsQ0FBeUI7UUFJTyxtQkFBYyxHQUFkLGNBQWMsQ0FBUztRQXREdEY7Ozs7V0FJRztRQUN1QixXQUFNLEdBQVcsQ0FBQyxDQUFDO1FBc0JyQyxjQUFTLEdBQVksS0FBSyxDQUFDO1FBb0JuQyw4RUFBOEU7UUFDdEUsbUJBQWMsR0FBWSxLQUFLLENBQUM7UUFRdEMsSUFBSSxDQUFDLGNBQWMsR0FBRyxhQUFhLElBQUksRUFBRSxDQUFDO1FBQzFDLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxjQUFjLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDakYsQ0FBQztJQTVDRDs7O09BR0c7SUFDSCxJQUNJLFFBQVEsS0FBSyxPQUFPLElB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QkFDNUM7YUFDRjs7O1lBOUNDLFVBQVU7WUFJVixNQUFNO1lBUEEsUUFBUTs0Q0FxSEQsUUFBUSxZQUFJLE1BQU0sU0FBQyx5QkFBeUI7eUNBQzVDLFFBQVEsWUFBSSxNQUFNLFNBQUMscUJBQXFCOzs7b0JBakVwRCxLQUFLLFNBQUMsZ0JBQWdCO3dCQUd0QixLQUFLLFNBQUMsb0JBQW9CO3VCQU0xQixLQUFLLFNBQUMsbUJBQW1CO3FCQU96QixLQUFLLFNBQUMsaUJBQWlCO3dCQU92QixLQUFLLFNBQUMsb0JBQW9CO3VCQU0xQixLQUFLLFNBQUMsbUJBQW1CO3NCQWV6QixLQUFLLFNBQUMsa0JBQWtCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7UGxhdGZvcm19IGZyb20gJ0Bhbmd1bGFyL2Nkay9wbGF0Zm9ybSc7XG5pbXBvcnQge1xuICBEaXJlY3RpdmUsXG4gIEVsZW1lbnRSZWYsXG4gIEluamVjdCxcbiAgSW5qZWN0aW9uVG9rZW4sXG4gIElucHV0LFxuICBOZ1pvbmUsXG4gIE9uRGVzdHJveSxcbiAgT25Jbml0LFxuICBPcHRpb25hbCxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge1JpcHBsZUFuaW1hdGlvbkNvbmZpZywgUmlwcGxlQ29uZmlnLCBSaXBwbGVSZWZ9IGZyb20gJy4vcmlwcGxlLXJlZic7XG5pbXBvcnQge1JpcHBsZVJlbmRlcmVyLCBSaXBwbGVUYXJnZXR9IGZyb20gJy4vcmlwcGxlLXJlbmRlcmVyJztcbmltcG9ydCB7QU5JTUFUSU9OX01PRFVMRV9UWVBFfSBmcm9tICdAYW5ndWxhci9wbGF0Zm9ybS1icm93c2VyL2FuaW1hdGlvbnMnO1xuXG4vKiogQ29uZmlndXJhYmxlIG9wdGlvbnMgZm9yIGBtYXRSaXBwbGVgLiAqL1xuZXhwb3J0IGludGVyZmFjZSBSaXBwbGVHbG9iYWxPcHRpb25zIHtcbiAgLyoqXG4gICAqIFdoZXRoZXIgcmlwcGxlcyBzaG91bGQgYmUgZGlzYWJsZWQuIFJpcHBsZXMgY2FuIGJlIHN0aWxsIGxhdW5jaGVkIG1hbnVhbGx5IGJ5IHVzaW5nXG4gICAqIHRoZSBgbGF1bmNoKClgIG1ldGhvZC4gVGhlcmVmb3JlIGZvY3VzIGluZGljYXRvcnMgd2lsbCBzdGlsbCBzaG93IHVwLlxuICAgKi9cbiAgZGlzYWJsZWQ/OiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBEZWZhdWx0IGNvbmZpZ3VyYXRpb24gZm9yIHRoZSBhbmltYXRpb24gZHVyYXRpb24gb2YgdGhlIHJpcHBsZXMuIFRoZXJlIGFyZSB0d28gcGhhc2VzIHdpdGhcbiAgICogZGlmZmVyZW50IGR1cmF0aW9ucyBmb3IgdGhlIHJpcHBsZXM6IGBlbnRlcmAgYW5kIGBsZWF2ZWAuIFRoZSBkdXJhdGlvbnMgd2lsbCBiZSBvdmVyd3JpdHRlblxuICAgKiBieSB0aGUgdmFsdWUgb2YgYG1hdFJpcHBsZUFuaW1hdGlvbmAgb3IgaWYgdGhlIGBOb29wQW5pbWF0aW9uc01vZHVsZWAgaXMgaW5jbHVkZWQuXG4gICAqL1xuICBhbmltYXRpb24/OiBSaXBwbGVBbmltYXRpb25Db25maWc7XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgcmlwcGxlcyBzaG91bGQgc3RhcnQgZmFkaW5nIG91dCBpbW1lZGlhdGVseSBhZnRlciB0aGUgbW91c2Ugb3IgdG91Y2ggaXMgcmVsZWFzZWQuIEJ5XG4gICAqIGRlZmF1bHQsIHJpcHBsZXMgd2lsbCB3YWl0IGZvciB0aGUgZW50ZXIgYW5pbWF0aW9uIHRvIGNvbXBsZXRlIGFuZCBmb3IgbW91c2Ugb3IgdG91Y2ggcmVsZWFzZS5cbiAgICovXG4gIHRlcm1pbmF0ZU9uUG9pbnRlclVwPzogYm9vbGVhbjtcbn1cblxuLyoqIEluamVjdGlvbiB0b2tlbiB0aGF0IGNhbiBiZSB1c2VkIHRvIHNwZWNpZnkgdGhlIGdsb2JhbCByaXBwbGUgb3B0aW9ucy4gKi9cbmV4cG9ydCBjb25zdCBNQVRfUklQUExFX0dMT0JBTF9PUFRJT05TID1cbiAgICBuZXcgSW5qZWN0aW9uVG9rZW48UmlwcGxlR2xvYmFsT3B0aW9ucz4oJ21hdC1yaXBwbGUtZ2xvYmFsLW9wdGlvbnMnKTtcblxuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW21hdC1yaXBwbGVdLCBbbWF0UmlwcGxlXScsXG4gIGV4cG9ydEFzOiAnbWF0UmlwcGxlJyxcbiAgaG9zdDoge1xuICAgICdjbGFzcyc6ICdtYXQtcmlwcGxlJyxcbiAgICAnW2NsYXNzLm1hdC1yaXBwbGUtdW5ib3VuZGVkXSc6ICd1bmJvdW5kZWQnXG4gIH1cbn0pXG5leHBvcnQgY2xhc3MgTWF0UmlwcGxlIGltcGxlbWVudHMgT25Jbml0LCBPbkRlc3Ryb3ksIFJpcHBsZVRhcmdldCB7XG5cbiAgLyoqIEN1c3RvbSBjb2xvciBmb3IgYWxsIHJpcHBsZXMuICovXG4gIEBJbnB1dCgnbWF0UmlwcGxlQ29sb3InKSBjb2xvcjogc3RyaW5nO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSByaXBwbGVzIHNob3VsZCBiZSB2aXNpYmxlIG91dHNpZGUgdGhlIGNvbXBvbmVudCdzIGJvdW5kcy4gKi9cbiAgQElucHV0KCdtYXRSaXBwbGVVbmJvdW5kZWQnKSB1bmJvdW5kZWQ6IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIHJpcHBsZSBhbHdheXMgb3JpZ2luYXRlcyBmcm9tIHRoZSBjZW50ZXIgb2YgdGhlIGhvc3QgZWxlbWVudCdzIGJvdW5kcywgcmF0aGVyXG4gICAqIHRoYW4gb3JpZ2luYXRpbmcgZnJvbSB0aGUgbG9jYXRpb24gb2YgdGhlIGNsaWNrIGV2ZW50LlxuICAgKi9cbiAgQElucHV0KCdtYXRSaXBwbGVDZW50ZXJlZCcpIGNlbnRlcmVkOiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBJZiBzZXQsIHRoZSByYWRpdXMgaW4gcGl4ZWxzIG9mIGZvcmVncm91bmQgcmlwcGxlcyB3aGVuIGZ1bGx5IGV4cGFuZGVkLiBJZiB1bnNldCwgdGhlIHJhZGl1c1xuICAgKiB3aWxsIGJlIHRoZSBkaXN0YW5jZSBmcm9tIHRoZSBjZW50ZXIgb2YgdGhlIHJpcHBsZSB0byB0aGUgZnVydGhlc3QgY29ybmVyIG9mIHRoZSBob3N0IGVsZW1lbnQnc1xuICAgKiBib3VuZGluZyByZWN0YW5nbGUuXG4gICAqL1xuICBASW5wdXQoJ21hdFJpcHBsZVJhZGl1cycpIHJhZGl1czogbnVtYmVyID0gMDtcblxuICAvKipcbiAgICogQ29uZmlndXJhdGlvbiBmb3IgdGhlIHJpcHBsZSBhbmltYXRpb24uIEFsbG93cyBtb2RpZnlpbmcgdGhlIGVudGVyIGFuZCBleGl0IGFuaW1hdGlvblxuICAgKiBkdXJhdGlvbiBvZiB0aGUgcmlwcGxlcy4gVGhlIGFuaW1hdGlvbiBkdXJhdGlvbnMgd2lsbCBiZSBvdmVyd3JpdHRlbiBpZiB0aGVcbiAgICogYE5vb3BBbmltYXRpb25zTW9kdWxlYCBpcyBiZWluZyB1c2VkLlxuICAgKi9cbiAgQElucHV0KCdtYXRSaXBwbGVBbmltYXRpb24nKSBhbmltYXRpb246IFJpcHBsZUFuaW1hdGlvbkNvbmZpZztcblxuICAvKipcbiAgICogV2hldGhlciBjbGljayBldmVudHMgd2lsbCBub3QgdHJpZ2dlciB0aGUgcmlwcGxlLiBSaXBwbGVzIGNhbiBiZSBzdGlsbCBsYXVuY2hlZCBtYW51YWxseVxuICAgKiBieSB1c2luZyB0aGUgYGxhdW5jaCgpYCBtZXRob2QuXG4gICAqL1xuICBASW5wdXQoJ21hdFJpcHBsZURpc2FibGVkJylcbiAgZ2V0IGRpc2FibGVkKCkgeyByZXR1cm4gdGhpcy5fZGlzYWJsZWQ7IH1cbiAgc2V0IGRpc2FibGVkKHZhbHVlOiBib29sZWFuKSB7XG4gICAgaWYgKHZhbHVlKSB7XG4gICAgICB0aGlzLmZhZGVPdXRBbGxOb25QZXJzaXN0ZW50KCk7XG4gICAgfVxuICAgIHRoaXMuX2Rpc2FibGVkID0gdmFsdWU7XG4gICAgdGhpcy5fc2V0dXBUcmlnZ2VyRXZlbnRzSWZFbmFibGVkKCk7XG4gIH1cbiAgcHJpdmF0ZSBfZGlzYWJsZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAvKipcbiAgICogVGhlIGVsZW1lbnQgdGhhdCB0cmlnZ2VycyB0aGUgcmlwcGxlIHdoZW4gY2xpY2sgZXZlbnRzIGFyZSByZWNlaXZlZC5cbiAgICogRGVmYXVsdHMgdG8gdGhlIGRpcmVjdGl2ZSdzIGhvc3QgZWxlbWVudC5cbiAgICovXG4gIEBJbnB1dCgnbWF0UmlwcGxlVHJpZ2dlcicpXG4gIGdldCB0cmlnZ2VyKCkgeyByZXR1cm4gdGhpcy5fdHJpZ2dlciB8fCB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQ7IH1cbiAgc2V0IHRyaWdnZXIodHJpZ2dlcjogSFRNTEVsZW1lbnQpIHtcbiAgICB0aGlzLl90cmlnZ2VyID0gdHJpZ2dlcjtcbiAgICB0aGlzLl9zZXR1cFRyaWdnZXJFdmVudHNJZkVuYWJsZWQoKTtcbiAgfVxuICBwcml2YXRlIF90cmlnZ2VyOiBIVE1MRWxlbWVudDtcblxuICAvKiogUmVuZGVyZXIgZm9yIHRoZSByaXBwbGUgRE9NIG1hbmlwdWxhdGlvbnMuICovXG4gIHByaXZhdGUgX3JpcHBsZVJlbmRlcmVyOiBSaXBwbGVSZW5kZXJlcjtcblxuICAvKiogT3B0aW9ucyB0aGF0IGFyZSBzZXQgZ2xvYmFsbHkgZm9yIGFsbCByaXBwbGVzLiAqL1xuICBwcml2YXRlIF9nbG9iYWxPcHRpb25zOiBSaXBwbGVHbG9iYWxPcHRpb25zO1xuXG4gIC8qKiBXaGV0aGVyIHJpcHBsZSBkaXJlY3RpdmUgaXMgaW5pdGlhbGl6ZWQgYW5kIHRoZSBpbnB1dCBiaW5kaW5ncyBhcmUgc2V0LiAqL1xuICBwcml2YXRlIF9pc0luaXRpYWxpemVkOiBib29sZWFuID0gZmFsc2U7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfZWxlbWVudFJlZjogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4sXG4gICAgICAgICAgICAgIG5nWm9uZTogTmdab25lLFxuICAgICAgICAgICAgICBwbGF0Zm9ybTogUGxhdGZvcm0sXG4gICAgICAgICAgICAgIEBPcHRpb25hbCgpIEBJbmplY3QoTUFUX1JJUFBMRV9HTE9CQUxfT1BUSU9OUykgZ2xvYmFsT3B0aW9ucz86IFJpcHBsZUdsb2JhbE9wdGlvbnMsXG4gICAgICAgICAgICAgIEBPcHRpb25hbCgpIEBJbmplY3QoQU5JTUFUSU9OX01PRFVMRV9UWVBFKSBwcml2YXRlIF9hbmltYXRpb25Nb2RlPzogc3RyaW5nKSB7XG5cbiAgICB0aGlzLl9nbG9iYWxPcHRpb25zID0gZ2xvYmFsT3B0aW9ucyB8fCB7fTtcbiAgICB0aGlzLl9yaXBwbGVSZW5kZXJlciA9IG5ldyBSaXBwbGVSZW5kZXJlcih0aGlzLCBuZ1pvbmUsIF9lbGVtZW50UmVmLCBwbGF0Zm9ybSk7XG4gIH1cblxuICBuZ09uSW5pdCgpIHtcbiAgICB0aGlzLl9pc0luaXRpYWxpemVkID0gdHJ1ZTtcbiAgICB0aGlzLl9zZXR1cFRyaWdnZXJFdmVudHNJZkVuYWJsZWQoKTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuX3JpcHBsZVJlbmRlcmVyLl9yZW1vdmVUcmlnZ2VyRXZlbnRzKCk7XG4gIH1cblxuICAvKiogRmFkZXMgb3V0IGFsbCBjdXJyZW50bHkgc2hvd2luZyByaXBwbGUgZWxlbWVudHMuICovXG4gIGZhZGVPdXRBbGwoKSB7XG4gICAgdGhpcy5fcmlwcGxlUmVuZGVyZXIuZmFkZU91dEFsbCgpO1xuICB9XG5cbiAgLyoqIEZhZGVzIG91dCBhbGwgY3VycmVudGx5IHNob3dpbmcgbm9uLXBlcnNpc3RlbnQgcmlwcGxlIGVsZW1lbnRzLiAqL1xuICBmYWRlT3V0QWxsTm9uUGVyc2lzdGVudCgpIHtcbiAgICB0aGlzLl9yaXBwbGVSZW5kZXJlci5mYWRlT3V0QWxsTm9uUGVyc2lzdGVudCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJpcHBsZSBjb25maWd1cmF0aW9uIGZyb20gdGhlIGRpcmVjdGl2ZSdzIGlucHV0IHZhbHVlcy5cbiAgICogQGRvY3MtcHJpdmF0ZSBJbXBsZW1lbnRlZCBhcyBwYXJ0IG9mIFJpcHBsZVRhcmdldFxuICAgKi9cbiAgZ2V0IHJpcHBsZUNvbmZpZygpOiBSaXBwbGVDb25maWcge1xuICAgIHJldHVybiB7XG4gICAgICBjZW50ZXJlZDogdGhpcy5jZW50ZXJlZCxcbiAgICAgIHJhZGl1czogdGhpcy5yYWRpdXMsXG4gICAgICBjb2xvcjogdGhpcy5jb2xvcixcbiAgICAgIGFuaW1hdGlvbjoge1xuICAgICAgICAuLi50aGlzLl9nbG9iYWxPcHRpb25zLmFuaW1hdGlvbixcbiAgICAgICAgLi4uKHRoaXMuX2FuaW1hdGlvbk1vZGUgPT09ICdOb29wQW5pbWF0aW9ucycgPyB7ZW50ZXJEdXJhdGlvbjogMCwgZXhpdER1cmF0aW9uOiAwfSA6IHt9KSxcbiAgICAgICAgLi4udGhpcy5hbmltYXRpb25cbiAgICAgIH0sXG4gICAgICB0ZXJtaW5hdGVPblBvaW50ZXJVcDogdGhpcy5fZ2xvYmFsT3B0aW9ucy50ZXJtaW5hdGVPblBvaW50ZXJVcCxcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgcmlwcGxlcyBvbiBwb2ludGVyLWRvd24gYXJlIGRpc2FibGVkIG9yIG5vdC5cbiAgICogQGRvY3MtcHJpdmF0ZSBJbXBsZW1lbnRlZCBhcyBwYXJ0IG9mIFJpcHBsZVRhcmdldFxuICAgKi9cbiAgZ2V0IHJpcHBsZURpc2FibGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmRpc2FibGVkIHx8ICEhdGhpcy5fZ2xvYmFsT3B0aW9ucy5kaXNhYmxlZDtcbiAgfVxuXG4gIC8qKiBTZXRzIHVwIHRoZSB0cmlnZ2VyIGV2ZW50IGxpc3RlbmVycyBpZiByaXBwbGVzIGFyZSBlbmFibGVkLiAqL1xuICBwcml2YXRlIF9zZXR1cFRyaWdnZXJFdmVudHNJZkVuYWJsZWQoKSB7XG4gICAgaWYgKCF0aGlzLmRpc2FibGVkICYmIHRoaXMuX2lzSW5pdGlhbGl6ZWQpIHtcbiAgICAgIHRoaXMuX3JpcHBsZVJlbmRlcmVyLnNldHVwVHJpZ2dlckV2ZW50cyh0aGlzLnRyaWdnZXIpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBMYXVuY2hlcyBhIG1hbnVhbCByaXBwbGUgdXNpbmcgdGhlIHNwZWNpZmllZCByaXBwbGUgY29uZmlndXJhdGlvbi5cbiAgICogQHBhcmFtIGNvbmZpZyBDb25maWd1cmF0aW9uIGZvciB0aGUgbWFudWFsIHJpcHBsZS5cbiAgICovXG4gIGxhdW5jaChjb25maWc6IFJpcHBsZUNvbmZpZyk6IFJpcHBsZVJlZjtcblxuICAvKipcbiAgICogTGF1bmNoZXMgYSBtYW51YWwgcmlwcGxlIGF0IHRoZSBzcGVjaWZpZWQgY29vcmRpbmF0ZXMgd2l0aGluIHRoZSBlbGVtZW50LlxuICAgKiBAcGFyYW0geCBDb29yZGluYXRlIHdpdGhpbiB0aGUgZWxlbWVudCwgYWxvbmcgdGhlIFggYXhpcyBhdCB3aGljaCB0byBmYWRlLWluIHRoZSByaXBwbGUuXG4gICAqIEBwYXJhbSB5IENvb3JkaW5hdGUgd2l0aGluIHRoZSBlbGVtZW50LCBhbG9uZyB0aGUgWSBheGlzIGF0IHdoaWNoIHRvIGZhZGUtaW4gdGhlIHJpcHBsZS5cbiAgICogQHBhcmFtIGNvbmZpZyBPcHRpb25hbCByaXBwbGUgY29uZmlndXJhdGlvbiBmb3IgdGhlIG1hbnVhbCByaXBwbGUuXG4gICAqL1xuICBsYXVuY2goeDogbnVtYmVyLCB5OiBudW1iZXIsIGNvbmZpZz86IFJpcHBsZUNvbmZpZyk6IFJpcHBsZVJlZjtcblxuICAvKiogTGF1bmNoZXMgYSBtYW51YWwgcmlwcGxlIGF0IHRoZSBzcGVjaWZpZWQgY29vcmRpbmF0ZWQgb3IganVzdCBieSB0aGUgcmlwcGxlIGNvbmZpZy4gKi9cbiAgbGF1bmNoKGNvbmZpZ09yWDogbnVtYmVyIHwgUmlwcGxlQ29uZmlnLCB5OiBudW1iZXIgPSAwLCBjb25maWc/OiBSaXBwbGVDb25maWcpOiBSaXBwbGVSZWYge1xuICAgIGlmICh0eXBlb2YgY29uZmlnT3JYID09PSAnbnVtYmVyJykge1xuICAgICAgcmV0dXJuIHRoaXMuX3JpcHBsZVJlbmRlcmVyLmZhZGVJblJpcHBsZShjb25maWdPclgsIHksIHsuLi50aGlzLnJpcHBsZUNvbmZpZywgLi4uY29uZmlnfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLl9yaXBwbGVSZW5kZXJlci5mYWRlSW5SaXBwbGUoMCwgMCwgey4uLnRoaXMucmlwcGxlQ29uZmlnLCAuLi5jb25maWdPclh9KTtcbiAgICB9XG4gIH1cbn1cblxuIl19