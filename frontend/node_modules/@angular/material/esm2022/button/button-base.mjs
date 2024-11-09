/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { FocusMonitor } from '@angular/cdk/a11y';
import { Platform } from '@angular/cdk/platform';
import { booleanAttribute, Directive, ElementRef, inject, InjectionToken, Input, NgZone, numberAttribute, } from '@angular/core';
import { MatRippleLoader } from '@angular/material/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/platform";
/** Injection token that can be used to provide the default options the button component. */
export const MAT_BUTTON_CONFIG = new InjectionToken('MAT_BUTTON_CONFIG');
/** Shared host configuration for all buttons */
export const MAT_BUTTON_HOST = {
    '[attr.disabled]': '_getDisabledAttribute()',
    '[attr.aria-disabled]': '_getAriaDisabled()',
    '[class.mat-mdc-button-disabled]': 'disabled',
    '[class.mat-mdc-button-disabled-interactive]': 'disabledInteractive',
    '[class._mat-animation-noopable]': '_animationMode === "NoopAnimations"',
    // MDC automatically applies the primary theme color to the button, but we want to support
    // an unthemed version. If color is undefined, apply a CSS class that makes it easy to
    // select and style this "theme".
    '[class.mat-unthemed]': '!color',
    // Add a class that applies to all buttons. This makes it easier to target if somebody
    // wants to target all Material buttons.
    '[class.mat-mdc-button-base]': 'true',
    '[class]': 'color ? "mat-" + color : ""',
};
/** List of classes to add to buttons instances based on host attribute selector. */
const HOST_SELECTOR_MDC_CLASS_PAIR = [
    {
        attribute: 'mat-button',
        mdcClasses: ['mdc-button', 'mat-mdc-button'],
    },
    {
        attribute: 'mat-flat-button',
        mdcClasses: ['mdc-button', 'mdc-button--unelevated', 'mat-mdc-unelevated-button'],
    },
    {
        attribute: 'mat-raised-button',
        mdcClasses: ['mdc-button', 'mdc-button--raised', 'mat-mdc-raised-button'],
    },
    {
        attribute: 'mat-stroked-button',
        mdcClasses: ['mdc-button', 'mdc-button--outlined', 'mat-mdc-outlined-button'],
    },
    {
        attribute: 'mat-fab',
        mdcClasses: ['mdc-fab', 'mat-mdc-fab'],
    },
    {
        attribute: 'mat-mini-fab',
        mdcClasses: ['mdc-fab', 'mdc-fab--mini', 'mat-mdc-mini-fab'],
    },
    {
        attribute: 'mat-icon-button',
        mdcClasses: ['mdc-icon-button', 'mat-mdc-icon-button'],
    },
];
/** Base class for all buttons.  */
export class MatButtonBase {
    /**
     * Reference to the MatRipple instance of the button.
     * @deprecated Considered an implementation detail. To be removed.
     * @breaking-change 17.0.0
     */
    get ripple() {
        return this._rippleLoader?.getRipple(this._elementRef.nativeElement);
    }
    set ripple(v) {
        this._rippleLoader?.attachRipple(this._elementRef.nativeElement, v);
    }
    /** Whether the ripple effect is disabled or not. */
    get disableRipple() {
        return this._disableRipple;
    }
    set disableRipple(value) {
        this._disableRipple = value;
        this._updateRippleDisabled();
    }
    /** Whether the button is disabled. */
    get disabled() {
        return this._disabled;
    }
    set disabled(value) {
        this._disabled = value;
        this._updateRippleDisabled();
    }
    constructor(_elementRef, _platform, _ngZone, _animationMode) {
        this._elementRef = _elementRef;
        this._platform = _platform;
        this._ngZone = _ngZone;
        this._animationMode = _animationMode;
        this._focusMonitor = inject(FocusMonitor);
        /**
         * Handles the lazy creation of the MatButton ripple.
         * Used to improve initial load time of large applications.
         */
        this._rippleLoader = inject(MatRippleLoader);
        /** Whether this button is a FAB. Used to apply the correct class on the ripple. */
        this._isFab = false;
        this._disableRipple = false;
        this._disabled = false;
        const config = inject(MAT_BUTTON_CONFIG, { optional: true });
        const element = _elementRef.nativeElement;
        const classList = element.classList;
        this.disabledInteractive = config?.disabledInteractive ?? false;
        this._rippleLoader?.configureRipple(element, { className: 'mat-mdc-button-ripple' });
        // For each of the variant selectors that is present in the button's host
        // attributes, add the correct corresponding MDC classes.
        for (const { attribute, mdcClasses } of HOST_SELECTOR_MDC_CLASS_PAIR) {
            if (element.hasAttribute(attribute)) {
                classList.add(...mdcClasses);
            }
        }
    }
    ngAfterViewInit() {
        this._focusMonitor.monitor(this._elementRef, true);
    }
    ngOnDestroy() {
        this._focusMonitor.stopMonitoring(this._elementRef);
        this._rippleLoader?.destroyRipple(this._elementRef.nativeElement);
    }
    /** Focuses the button. */
    focus(origin = 'program', options) {
        if (origin) {
            this._focusMonitor.focusVia(this._elementRef.nativeElement, origin, options);
        }
        else {
            this._elementRef.nativeElement.focus(options);
        }
    }
    _getAriaDisabled() {
        if (this.ariaDisabled != null) {
            return this.ariaDisabled;
        }
        return this.disabled && this.disabledInteractive ? true : null;
    }
    _getDisabledAttribute() {
        return this.disabledInteractive || !this.disabled ? null : true;
    }
    _updateRippleDisabled() {
        this._rippleLoader?.setDisabled(this._elementRef.nativeElement, this.disableRipple || this.disabled);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.2.0", ngImport: i0, type: MatButtonBase, deps: "invalid", target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "17.2.0", type: MatButtonBase, inputs: { color: "color", disableRipple: ["disableRipple", "disableRipple", booleanAttribute], disabled: ["disabled", "disabled", booleanAttribute], ariaDisabled: ["aria-disabled", "ariaDisabled", booleanAttribute], disabledInteractive: ["disabledInteractive", "disabledInteractive", booleanAttribute] }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.2.0", ngImport: i0, type: MatButtonBase, decorators: [{
            type: Directive
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i1.Platform }, { type: i0.NgZone }, { type: undefined }], propDecorators: { color: [{
                type: Input
            }], disableRipple: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], disabled: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], ariaDisabled: [{
                type: Input,
                args: [{ transform: booleanAttribute, alias: 'aria-disabled' }]
            }], disabledInteractive: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }] } });
/** Shared host configuration for buttons using the `<a>` tag. */
export const MAT_ANCHOR_HOST = {
    '[attr.disabled]': '_getDisabledAttribute()',
    '[class.mat-mdc-button-disabled]': 'disabled',
    '[class.mat-mdc-button-disabled-interactive]': 'disabledInteractive',
    '[class._mat-animation-noopable]': '_animationMode === "NoopAnimations"',
    // Note that we ignore the user-specified tabindex when it's disabled for
    // consistency with the `mat-button` applied on native buttons where even
    // though they have an index, they're not tabbable.
    '[attr.tabindex]': 'disabled && !disabledInteractive ? -1 : tabIndex',
    '[attr.aria-disabled]': '_getDisabledAttribute()',
    // MDC automatically applies the primary theme color to the button, but we want to support
    // an unthemed version. If color is undefined, apply a CSS class that makes it easy to
    // select and style this "theme".
    '[class.mat-unthemed]': '!color',
    // Add a class that applies to all buttons. This makes it easier to target if somebody
    // wants to target all Material buttons.
    '[class.mat-mdc-button-base]': 'true',
    '[class]': 'color ? "mat-" + color : ""',
};
/**
 * Anchor button base.
 */
export class MatAnchorBase extends MatButtonBase {
    constructor(elementRef, platform, ngZone, animationMode) {
        super(elementRef, platform, ngZone, animationMode);
        this._haltDisabledEvents = (event) => {
            // A disabled button shouldn't apply any actions
            if (this.disabled) {
                event.preventDefault();
                event.stopImmediatePropagation();
            }
        };
    }
    ngOnInit() {
        this._ngZone.runOutsideAngular(() => {
            this._elementRef.nativeElement.addEventListener('click', this._haltDisabledEvents);
        });
    }
    ngOnDestroy() {
        super.ngOnDestroy();
        this._elementRef.nativeElement.removeEventListener('click', this._haltDisabledEvents);
    }
    _getAriaDisabled() {
        return this.ariaDisabled == null ? this.disabled : this.ariaDisabled;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.2.0", ngImport: i0, type: MatAnchorBase, deps: "invalid", target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "17.2.0", type: MatAnchorBase, inputs: { tabIndex: ["tabIndex", "tabIndex", (value) => {
                    return value == null ? undefined : numberAttribute(value);
                }] }, usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.2.0", ngImport: i0, type: MatAnchorBase, decorators: [{
            type: Directive
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i1.Platform }, { type: i0.NgZone }, { type: undefined }], propDecorators: { tabIndex: [{
                type: Input,
                args: [{
                        transform: (value) => {
                            return value == null ? undefined : numberAttribute(value);
                        },
                    }]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnV0dG9uLWJhc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvYnV0dG9uL2J1dHRvbi1iYXNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxZQUFZLEVBQWMsTUFBTSxtQkFBbUIsQ0FBQztBQUM1RCxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDL0MsT0FBTyxFQUVMLGdCQUFnQixFQUNoQixTQUFTLEVBQ1QsVUFBVSxFQUNWLE1BQU0sRUFDTixjQUFjLEVBQ2QsS0FBSyxFQUNMLE1BQU0sRUFDTixlQUFlLEdBR2hCLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBWSxlQUFlLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQzs7O0FBUWxFLDRGQUE0RjtBQUM1RixNQUFNLENBQUMsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLGNBQWMsQ0FBa0IsbUJBQW1CLENBQUMsQ0FBQztBQUUxRixnREFBZ0Q7QUFDaEQsTUFBTSxDQUFDLE1BQU0sZUFBZSxHQUFHO0lBQzdCLGlCQUFpQixFQUFFLHlCQUF5QjtJQUM1QyxzQkFBc0IsRUFBRSxvQkFBb0I7SUFDNUMsaUNBQWlDLEVBQUUsVUFBVTtJQUM3Qyw2Q0FBNkMsRUFBRSxxQkFBcUI7SUFDcEUsaUNBQWlDLEVBQUUscUNBQXFDO0lBQ3hFLDBGQUEwRjtJQUMxRixzRkFBc0Y7SUFDdEYsaUNBQWlDO0lBQ2pDLHNCQUFzQixFQUFFLFFBQVE7SUFDaEMsc0ZBQXNGO0lBQ3RGLHdDQUF3QztJQUN4Qyw2QkFBNkIsRUFBRSxNQUFNO0lBQ3JDLFNBQVMsRUFBRSw2QkFBNkI7Q0FDekMsQ0FBQztBQUVGLG9GQUFvRjtBQUNwRixNQUFNLDRCQUE0QixHQUFnRDtJQUNoRjtRQUNFLFNBQVMsRUFBRSxZQUFZO1FBQ3ZCLFVBQVUsRUFBRSxDQUFDLFlBQVksRUFBRSxnQkFBZ0IsQ0FBQztL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LGFBQWE7a0dBQWIsYUFBYSwrQ0FFWCxDQUFDLEtBQWMsRUFBRSxFQUFFO29CQUM1QixPQUFPLEtBQUssSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUM1RCxDQUFDOzsyRkFKUSxhQUFhO2tCQUR6QixTQUFTO2dKQU9SLFFBQVE7c0JBTFAsS0FBSzt1QkFBQzt3QkFDTCxTQUFTLEVBQUUsQ0FBQyxLQUFjLEVBQUUsRUFBRTs0QkFDNUIsT0FBTyxLQUFLLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQzt3QkFDNUQsQ0FBQztxQkFDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0ZvY3VzTW9uaXRvciwgRm9jdXNPcmlnaW59IGZyb20gJ0Bhbmd1bGFyL2Nkay9hMTF5JztcbmltcG9ydCB7UGxhdGZvcm19IGZyb20gJ0Bhbmd1bGFyL2Nkay9wbGF0Zm9ybSc7XG5pbXBvcnQge1xuICBBZnRlclZpZXdJbml0LFxuICBib29sZWFuQXR0cmlidXRlLFxuICBEaXJlY3RpdmUsXG4gIEVsZW1lbnRSZWYsXG4gIGluamVjdCxcbiAgSW5qZWN0aW9uVG9rZW4sXG4gIElucHV0LFxuICBOZ1pvbmUsXG4gIG51bWJlckF0dHJpYnV0ZSxcbiAgT25EZXN0cm95LFxuICBPbkluaXQsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtNYXRSaXBwbGUsIE1hdFJpcHBsZUxvYWRlcn0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvY29yZSc7XG5cbi8qKiBPYmplY3QgdGhhdCBjYW4gYmUgdXNlZCB0byBjb25maWd1cmUgdGhlIGRlZmF1bHQgb3B0aW9ucyBmb3IgdGhlIGJ1dHRvbiBjb21wb25lbnQuICovXG5leHBvcnQgaW50ZXJmYWNlIE1hdEJ1dHRvbkNvbmZpZyB7XG4gIC8qKiBXaGV0aGVyIGRpc2FibGVkIGJ1dHRvbnMgc2hvdWxkIGJlIGludGVyYWN0aXZlLiAqL1xuICBkaXNhYmxlZEludGVyYWN0aXZlPzogYm9vbGVhbjtcbn1cblxuLyoqIEluamVjdGlvbiB0b2tlbiB0aGF0IGNhbiBiZSB1c2VkIHRvIHByb3ZpZGUgdGhlIGRlZmF1bHQgb3B0aW9ucyB0aGUgYnV0dG9uIGNvbXBvbmVudC4gKi9cbmV4cG9ydCBjb25zdCBNQVRfQlVUVE9OX0NPTkZJRyA9IG5ldyBJbmplY3Rpb25Ub2tlbjxNYXRCdXR0b25Db25maWc+KCdNQVRfQlVUVE9OX0NPTkZJRycpO1xuXG4vKiogU2hhcmVkIGhvc3QgY29uZmlndXJhdGlvbiBmb3IgYWxsIGJ1dHRvbnMgKi9cbmV4cG9ydCBjb25zdCBNQVRfQlVUVE9OX0hPU1QgPSB7XG4gICdbYXR0ci5kaXNhYmxlZF0nOiAnX2dldERpc2FibGVkQXR0cmlidXRlKCknLFxuICAnW2F0dHIuYXJpYS1kaXNhYmxlZF0nOiAnX2dldEFyaWFEaXNhYmxlZCgpJyxcbiAgJ1tjbGFzcy5tYXQtbWRjLWJ1dHRvbi1kaXNhYmxlZF0nOiAnZGlzYWJsZWQnLFxuICAnW2NsYXNzLm1hdC1tZGMtYnV0dG9uLWRpc2FibGVkLWludGVyYWN0aXZlXSc6ICdkaXNhYmxlZEludGVyYWN0aXZlJyxcbiAgJ1tjbGFzcy5fbWF0LWFuaW1hdGlvbi1ub29wYWJsZV0nOiAnX2FuaW1hdGlvbk1vZGUgPT09IFwiTm9vcEFuaW1hdGlvbnNcIicsXG4gIC8vIE1EQyBhdXRvbWF0aWNhbGx5IGFwcGxpZXMgdGhlIHByaW1hcnkgdGhlbWUgY29sb3IgdG8gdGhlIGJ1dHRvbiwgYnV0IHdlIHdhbnQgdG8gc3VwcG9ydFxuICAvLyBhbiB1bnRoZW1lZCB2ZXJzaW9uLiBJZiBjb2xvciBpcyB1bmRlZmluZWQsIGFwcGx5IGEgQ1NTIGNsYXNzIHRoYXQgbWFrZXMgaXQgZWFzeSB0b1xuICAvLyBzZWxlY3QgYW5kIHN0eWxlIHRoaXMgXCJ0aGVtZVwiLlxuICAnW2NsYXNzLm1hdC11bnRoZW1lZF0nOiAnIWNvbG9yJyxcbiAgLy8gQWRkIGEgY2xhc3MgdGhhdCBhcHBsaWVzIHRvIGFsbCBidXR0b25zLiBUaGlzIG1ha2VzIGl0IGVhc2llciB0byB0YXJnZXQgaWYgc29tZWJvZHlcbiAgLy8gd2FudHMgdG8gdGFyZ2V0IGFsbCBNYXRlcmlhbCBidXR0b25zLlxuICAnW2NsYXNzLm1hdC1tZGMtYnV0dG9uLWJhc2VdJzogJ3RydWUnLFxuICAnW2NsYXNzXSc6ICdjb2xvciA/IFwibWF0LVwiICsgY29sb3IgOiBcIlwiJyxcbn07XG5cbi8qKiBMaXN0IG9mIGNsYXNzZXMgdG8gYWRkIHRvIGJ1dHRvbnMgaW5zdGFuY2VzIGJhc2VkIG9uIGhvc3QgYXR0cmlidXRlIHNlbGVjdG9yLiAqL1xuY29uc3QgSE9TVF9TRUxFQ1RPUl9NRENfQ0xBU1NfUEFJUjoge2F0dHJpYnV0ZTogc3RyaW5nOyBtZGNDbGFzc2VzOiBzdHJpbmdbXX1bXSA9IFtcbiAge1xuICAgIGF0dHJpYnV0ZTogJ21hdC1idXR0b24nLFxuICAgIG1kY0NsYXNzZXM6IFsnbWRjLWJ1dHRvbicsICdtYXQtbWRjLWJ1dHRvbiddLFxuICB9LFxuICB7XG4gICAgYXR0cmlidXRlOiAnbWF0LWZsYXQtYnV0dG9uJyxcbiAgICBtZGNDbGFzc2VzOiBbJ21kYy1idXR0b24nLCAnbWRjLWJ1dHRvbi0tdW5lbGV2YXRlZCcsICdtYXQtbWRjLXVuZWxldmF0ZWQtYnV0dG9uJ10sXG4gIH0sXG4gIHtcbiAgICBhdHRyaWJ1dGU6ICdtYXQtcmFpc2VkLWJ1dHRvbicsXG4gICAgbWRjQ2xhc3NlczogWydtZGMtYnV0dG9uJywgJ21kYy1idXR0b24tLXJhaXNlZCcsICdtYXQtbWRjLXJhaXNlZC1idXR0b24nXSxcbiAgfSxcbiAge1xuICAgIGF0dHJpYnV0ZTogJ21hdC1zdHJva2VkLWJ1dHRvbicsXG4gICAgbWRjQ2xhc3NlczogWydtZGMtYnV0dG9uJywgJ21kYy1idXR0b24tLW91dGxpbmVkJywgJ21hdC1tZGMtb3V0bGluZWQtYnV0dG9uJ10sXG4gIH0sXG4gIHtcbiAgICBhdHRyaWJ1dGU6ICdtYXQtZmFiJyxcbiAgICBtZGNDbGFzc2VzOiBbJ21kYy1mYWInLCAnbWF0LW1kYy1mYWInXSxcbiAgfSxcbiAge1xuICAgIGF0dHJpYnV0ZTogJ21hdC1taW5pLWZhYicsXG4gICAgbWRjQ2xhc3NlczogWydtZGMtZmFiJywgJ21kYy1mYWItLW1pbmknLCAnbWF0LW1kYy1taW5pLWZhYiddLFxuICB9LFxuICB7XG4gICAgYXR0cmlidXRlOiAnbWF0LWljb24tYnV0dG9uJyxcbiAgICBtZGNDbGFzc2VzOiBbJ21kYy1pY29uLWJ1dHRvbicsICdtYXQtbWRjLWljb24tYnV0dG9uJ10sXG4gIH0sXG5dO1xuXG4vKiogQmFzZSBjbGFzcyBmb3IgYWxsIGJ1dHRvbnMuICAqL1xuQERpcmVjdGl2ZSgpXG5leHBvcnQgY2xhc3MgTWF0QnV0dG9uQmFzZSBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQsIE9uRGVzdHJveSB7XG4gIHByaXZhdGUgcmVhZG9ubHkgX2ZvY3VzTW9uaXRvciA9IGluamVjdChGb2N1c01vbml0b3IpO1xuXG4gIC8qKlxuICAgKiBIYW5kbGVzIHRoZSBsYXp5IGNyZWF0aW9uIG9mIHRoZSBNYXRCdXR0b24gcmlwcGxlLlxuICAgKiBVc2VkIHRvIGltcHJvdmUgaW5pdGlhbCBsb2FkIHRpbWUgb2YgbGFyZ2UgYXBwbGljYXRpb25zLlxuICAgKi9cbiAgX3JpcHBsZUxvYWRlcjogTWF0UmlwcGxlTG9hZGVyID0gaW5qZWN0KE1hdFJpcHBsZUxvYWRlcik7XG5cbiAgLyoqIFdoZXRoZXIgdGhpcyBidXR0b24gaXMgYSBGQUIuIFVzZWQgdG8gYXBwbHkgdGhlIGNvcnJlY3QgY2xhc3Mgb24gdGhlIHJpcHBsZS4gKi9cbiAgX2lzRmFiID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIFJlZmVyZW5jZSB0byB0aGUgTWF0UmlwcGxlIGluc3RhbmNlIG9mIHRoZSBidXR0b24uXG4gICAqIEBkZXByZWNhdGVkIENvbnNpZGVyZWQgYW4gaW1wbGVtZW50YXRpb24gZGV0YWlsLiBUbyBiZSByZW1vdmVkLlxuICAgKiBAYnJlYWtpbmctY2hhbmdlIDE3LjAuMFxuICAgKi9cbiAgZ2V0IHJpcHBsZSgpOiBNYXRSaXBwbGUge1xuICAgIHJldHVybiB0aGlzLl9yaXBwbGVMb2FkZXI/LmdldFJpcHBsZSh0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQpITtcbiAgfVxuICBzZXQgcmlwcGxlKHY6IE1hdFJpcHBsZSkge1xuICAgIHRoaXMuX3JpcHBsZUxvYWRlcj8uYXR0YWNoUmlwcGxlKHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudCwgdik7XG4gIH1cblxuICAvKiogVGhlbWUgY29sb3IgcGFsZXR0ZSBvZiB0aGUgYnV0dG9uICovXG4gIEBJbnB1dCgpIGNvbG9yPzogc3RyaW5nIHwgbnVsbDtcblxuICAvKiogV2hldGhlciB0aGUgcmlwcGxlIGVmZmVjdCBpcyBkaXNhYmxlZCBvciBub3QuICovXG4gIEBJbnB1dCh7dHJhbnNmb3JtOiBib29sZWFuQXR0cmlidXRlfSlcbiAgZ2V0IGRpc2FibGVSaXBwbGUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2Rpc2FibGVSaXBwbGU7XG4gIH1cbiAgc2V0IGRpc2FibGVSaXBwbGUodmFsdWU6IGFueSkge1xuICAgIHRoaXMuX2Rpc2FibGVSaXBwbGUgPSB2YWx1ZTtcbiAgICB0aGlzLl91cGRhdGVSaXBwbGVEaXNhYmxlZCgpO1xuICB9XG4gIHByaXZhdGUgX2Rpc2FibGVSaXBwbGU6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAvKiogV2hldGhlciB0aGUgYnV0dG9uIGlzIGRpc2FibGVkLiAqL1xuICBASW5wdXQoe3RyYW5zZm9ybTogYm9vbGVhbkF0dHJpYnV0ZX0pXG4gIGdldCBkaXNhYmxlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fZGlzYWJsZWQ7XG4gIH1cbiAgc2V0IGRpc2FibGVkKHZhbHVlOiBhbnkpIHtcbiAgICB0aGlzLl9kaXNhYmxlZCA9IHZhbHVlO1xuICAgIHRoaXMuX3VwZGF0ZVJpcHBsZURpc2FibGVkKCk7XG4gIH1cbiAgcHJpdmF0ZSBfZGlzYWJsZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAvKiogYGFyaWEtZGlzYWJsZWRgIHZhbHVlIG9mIHRoZSBidXR0b24uICovXG4gIEBJbnB1dCh7dHJhbnNmb3JtOiBib29sZWFuQXR0cmlidXRlLCBhbGlhczogJ2FyaWEtZGlzYWJsZWQnfSlcbiAgYXJpYURpc2FibGVkOiBib29sZWFuIHwgdW5kZWZpbmVkO1xuXG4gIC8qKlxuICAgKiBOYXRpdmVseSBkaXNhYmxlZCBidXR0b25zIHByZXZlbnQgZm9jdXMgYW5kIGFueSBwb2ludGVyIGV2ZW50cyBmcm9tIHJlYWNoaW5nIHRoZSBidXR0b24uXG4gICAqIEluIHNvbWUgc2NlbmFyaW9zIHRoaXMgbWlnaHQgbm90IGJlIGRlc2lyYWJsZSwgYmVjYXVzZSBpdCBjYW4gcHJldmVudCB1c2VycyBmcm9tIGZpbmRpbmcgb3V0XG4gICAqIHdoeSB0aGUgYnV0dG9uIGlzIGRpc2FibGVkIChlLmcuIHZpYSB0b29sdGlwKS5cbiAgICpcbiAgICogRW5hYmxpbmcgdGhpcyBpbnB1dCB3aWxsIGNoYW5nZSB0aGUgYnV0dG9uIHNvIHRoYXQgaXQgaXMgc3R5bGVkIHRvIGJlIGRpc2FibGVkIGFuZCB3aWxsIGJlXG4gICAqIG1hcmtlZCBhcyBgYXJpYS1kaXNhYmxlZGAsIGJ1dCBpdCB3aWxsIGFsbG93IHRoZSBidXR0b24gdG8gcmVjZWl2ZSBldmVudHMgYW5kIGZvY3VzLlxuICAgKlxuICAgKiBOb3RlIHRoYXQgYnkgZW5hYmxpbmcgdGhpcywgeW91IG5lZWQgdG8gc2V0IHRoZSBgdGFiaW5kZXhgIHlvdXJzZWxmIGlmIHRoZSBidXR0b24gaXNuJ3RcbiAgICogbWVhbnQgdG8gYmUgdGFiYmFibGUgYW5kIHlvdSBoYXZlIHRvIHByZXZlbnQgdGhlIGJ1dHRvbiBhY3Rpb24gKGUuZy4gZm9ybSBzdWJtaXNzaW9ucykuXG4gICAqL1xuICBASW5wdXQoe3RyYW5zZm9ybTogYm9vbGVhbkF0dHJpYnV0ZX0pXG4gIGRpc2FibGVkSW50ZXJhY3RpdmU6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIF9lbGVtZW50UmVmOiBFbGVtZW50UmVmLFxuICAgIHB1YmxpYyBfcGxhdGZvcm06IFBsYXRmb3JtLFxuICAgIHB1YmxpYyBfbmdab25lOiBOZ1pvbmUsXG4gICAgcHVibGljIF9hbmltYXRpb25Nb2RlPzogc3RyaW5nLFxuICApIHtcbiAgICBjb25zdCBjb25maWcgPSBpbmplY3QoTUFUX0JVVFRPTl9DT05GSUcsIHtvcHRpb25hbDogdHJ1ZX0pO1xuICAgIGNvbnN0IGVsZW1lbnQgPSBfZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50O1xuICAgIGNvbnN0IGNsYXNzTGlzdCA9IChlbGVtZW50IGFzIEhUTUxFbGVtZW50KS5jbGFzc0xpc3Q7XG5cbiAgICB0aGlzLmRpc2FibGVkSW50ZXJhY3RpdmUgPSBjb25maWc/LmRpc2FibGVkSW50ZXJhY3RpdmUgPz8gZmFsc2U7XG4gICAgdGhpcy5fcmlwcGxlTG9hZGVyPy5jb25maWd1cmVSaXBwbGUoZWxlbWVudCwge2NsYXNzTmFtZTogJ21hdC1tZGMtYnV0dG9uLXJpcHBsZSd9KTtcblxuICAgIC8vIEZvciBlYWNoIG9mIHRoZSB2YXJpYW50IHNlbGVjdG9ycyB0aGF0IGlzIHByZXNlbnQgaW4gdGhlIGJ1dHRvbidzIGhvc3RcbiAgICAvLyBhdHRyaWJ1dGVzLCBhZGQgdGhlIGNvcnJlY3QgY29ycmVzcG9uZGluZyBNREMgY2xhc3Nlcy5cbiAgICBmb3IgKGNvbnN0IHthdHRyaWJ1dGUsIG1kY0NsYXNzZXN9IG9mIEhPU1RfU0VMRUNUT1JfTURDX0NMQVNTX1BBSVIpIHtcbiAgICAgIGlmIChlbGVtZW50Lmhhc0F0dHJpYnV0ZShhdHRyaWJ1dGUpKSB7XG4gICAgICAgIGNsYXNzTGlzdC5hZGQoLi4ubWRjQ2xhc3Nlcyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgbmdBZnRlclZpZXdJbml0KCkge1xuICAgIHRoaXMuX2ZvY3VzTW9uaXRvci5tb25pdG9yKHRoaXMuX2VsZW1lbnRSZWYsIHRydWUpO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5fZm9jdXNNb25pdG9yLnN0b3BNb25pdG9yaW5nKHRoaXMuX2VsZW1lbnRSZWYpO1xuICAgIHRoaXMuX3JpcHBsZUxvYWRlcj8uZGVzdHJveVJpcHBsZSh0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQpO1xuICB9XG5cbiAgLyoqIEZvY3VzZXMgdGhlIGJ1dHRvbi4gKi9cbiAgZm9jdXMob3JpZ2luOiBGb2N1c09yaWdpbiA9ICdwcm9ncmFtJywgb3B0aW9ucz86IEZvY3VzT3B0aW9ucyk6IHZvaWQge1xuICAgIGlmIChvcmlnaW4pIHtcbiAgICAgIHRoaXMuX2ZvY3VzTW9uaXRvci5mb2N1c1ZpYSh0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQsIG9yaWdpbiwgb3B0aW9ucyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5mb2N1cyhvcHRpb25zKTtcbiAgICB9XG4gIH1cblxuICBwcm90ZWN0ZWQgX2dldEFyaWFEaXNhYmxlZCgpIHtcbiAgICBpZiAodGhpcy5hcmlhRGlzYWJsZWQgIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRoaXMuYXJpYURpc2FibGVkO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmRpc2FibGVkICYmIHRoaXMuZGlzYWJsZWRJbnRlcmFjdGl2ZSA/IHRydWUgOiBudWxsO1xuICB9XG5cbiAgcHJvdGVjdGVkIF9nZXREaXNhYmxlZEF0dHJpYnV0ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5kaXNhYmxlZEludGVyYWN0aXZlIHx8ICF0aGlzLmRpc2FibGVkID8gbnVsbCA6IHRydWU7XG4gIH1cblxuICBwcml2YXRlIF91cGRhdGVSaXBwbGVEaXNhYmxlZCgpOiB2b2lkIHtcbiAgICB0aGlzLl9yaXBwbGVMb2FkZXI/LnNldERpc2FibGVkKFxuICAgICAgdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LFxuICAgICAgdGhpcy5kaXNhYmxlUmlwcGxlIHx8IHRoaXMuZGlzYWJsZWQsXG4gICAgKTtcbiAgfVxufVxuXG4vKiogU2hhcmVkIGhvc3QgY29uZmlndXJhdGlvbiBmb3IgYnV0dG9ucyB1c2luZyB0aGUgYDxhPmAgdGFnLiAqL1xuZXhwb3J0IGNvbnN0IE1BVF9BTkNIT1JfSE9TVCA9IHtcbiAgJ1thdHRyLmRpc2FibGVkXSc6ICdfZ2V0RGlzYWJsZWRBdHRyaWJ1dGUoKScsXG4gICdbY2xhc3MubWF0LW1kYy1idXR0b24tZGlzYWJsZWRdJzogJ2Rpc2FibGVkJyxcbiAgJ1tjbGFzcy5tYXQtbWRjLWJ1dHRvbi1kaXNhYmxlZC1pbnRlcmFjdGl2ZV0nOiAnZGlzYWJsZWRJbnRlcmFjdGl2ZScsXG4gICdbY2xhc3MuX21hdC1hbmltYXRpb24tbm9vcGFibGVdJzogJ19hbmltYXRpb25Nb2RlID09PSBcIk5vb3BBbmltYXRpb25zXCInLFxuXG4gIC8vIE5vdGUgdGhhdCB3ZSBpZ25vcmUgdGhlIHVzZXItc3BlY2lmaWVkIHRhYmluZGV4IHdoZW4gaXQncyBkaXNhYmxlZCBmb3JcbiAgLy8gY29uc2lzdGVuY3kgd2l0aCB0aGUgYG1hdC1idXR0b25gIGFwcGxpZWQgb24gbmF0aXZlIGJ1dHRvbnMgd2hlcmUgZXZlblxuICAvLyB0aG91Z2ggdGhleSBoYXZlIGFuIGluZGV4LCB0aGV5J3JlIG5vdCB0YWJiYWJsZS5cbiAgJ1thdHRyLnRhYmluZGV4XSc6ICdkaXNhYmxlZCAmJiAhZGlzYWJsZWRJbnRlcmFjdGl2ZSA/IC0xIDogdGFiSW5kZXgnLFxuICAnW2F0dHIuYXJpYS1kaXNhYmxlZF0nOiAnX2dldERpc2FibGVkQXR0cmlidXRlKCknLFxuICAvLyBNREMgYXV0b21hdGljYWxseSBhcHBsaWVzIHRoZSBwcmltYXJ5IHRoZW1lIGNvbG9yIHRvIHRoZSBidXR0b24sIGJ1dCB3ZSB3YW50IHRvIHN1cHBvcnRcbiAgLy8gYW4gdW50aGVtZWQgdmVyc2lvbi4gSWYgY29sb3IgaXMgdW5kZWZpbmVkLCBhcHBseSBhIENTUyBjbGFzcyB0aGF0IG1ha2VzIGl0IGVhc3kgdG9cbiAgLy8gc2VsZWN0IGFuZCBzdHlsZSB0aGlzIFwidGhlbWVcIi5cbiAgJ1tjbGFzcy5tYXQtdW50aGVtZWRdJzogJyFjb2xvcicsXG4gIC8vIEFkZCBhIGNsYXNzIHRoYXQgYXBwbGllcyB0byBhbGwgYnV0dG9ucy4gVGhpcyBtYWtlcyBpdCBlYXNpZXIgdG8gdGFyZ2V0IGlmIHNvbWVib2R5XG4gIC8vIHdhbnRzIHRvIHRhcmdldCBhbGwgTWF0ZXJpYWwgYnV0dG9ucy5cbiAgJ1tjbGFzcy5tYXQtbWRjLWJ1dHRvbi1iYXNlXSc6ICd0cnVlJyxcbiAgJ1tjbGFzc10nOiAnY29sb3IgPyBcIm1hdC1cIiArIGNvbG9yIDogXCJcIicsXG59O1xuXG4vKipcbiAqIEFuY2hvciBidXR0b24gYmFzZS5cbiAqL1xuQERpcmVjdGl2ZSgpXG5leHBvcnQgY2xhc3MgTWF0QW5jaG9yQmFzZSBleHRlbmRzIE1hdEJ1dHRvbkJhc2UgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XG4gIEBJbnB1dCh7XG4gICAgdHJhbnNmb3JtOiAodmFsdWU6IHVua25vd24pID0+IHtcbiAgICAgIHJldHVybiB2YWx1ZSA9PSBudWxsID8gdW5kZWZpbmVkIDogbnVtYmVyQXR0cmlidXRlKHZhbHVlKTtcbiAgICB9LFxuICB9KVxuICB0YWJJbmRleDogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnRSZWY6IEVsZW1lbnRSZWYsIHBsYXRmb3JtOiBQbGF0Zm9ybSwgbmdab25lOiBOZ1pvbmUsIGFuaW1hdGlvbk1vZGU/OiBzdHJpbmcpIHtcbiAgICBzdXBlcihlbGVtZW50UmVmLCBwbGF0Zm9ybSwgbmdab25lLCBhbmltYXRpb25Nb2RlKTtcbiAgfVxuXG4gIG5nT25Jbml0KCk6IHZvaWQge1xuICAgIHRoaXMuX25nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9oYWx0RGlzYWJsZWRFdmVudHMpO1xuICAgIH0pO1xuICB9XG5cbiAgb3ZlcnJpZGUgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgc3VwZXIubmdPbkRlc3Ryb3koKTtcbiAgICB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9oYWx0RGlzYWJsZWRFdmVudHMpO1xuICB9XG5cbiAgX2hhbHREaXNhYmxlZEV2ZW50cyA9IChldmVudDogRXZlbnQpOiB2b2lkID0+IHtcbiAgICAvLyBBIGRpc2FibGVkIGJ1dHRvbiBzaG91bGRuJ3QgYXBwbHkgYW55IGFjdGlvbnNcbiAgICBpZiAodGhpcy5kaXNhYmxlZCkge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgIH1cbiAgfTtcblxuICBwcm90ZWN0ZWQgb3ZlcnJpZGUgX2dldEFyaWFEaXNhYmxlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5hcmlhRGlzYWJsZWQgPT0gbnVsbCA/IHRoaXMuZGlzYWJsZWQgOiB0aGlzLmFyaWFEaXNhYmxlZDtcbiAgfVxufVxuIl19