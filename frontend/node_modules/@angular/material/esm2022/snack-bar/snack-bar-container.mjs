/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, inject, NgZone, ViewChild, ViewEncapsulation, } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { matSnackBarAnimations } from './snack-bar-animations';
import { BasePortalOutlet, CdkPortalOutlet, } from '@angular/cdk/portal';
import { Subject } from 'rxjs';
import { Platform } from '@angular/cdk/platform';
import { MatSnackBarConfig } from './snack-bar-config';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/platform";
import * as i2 from "./snack-bar-config";
let uniqueId = 0;
/**
 * Internal component that wraps user-provided snack bar content.
 * @docs-private
 */
export class MatSnackBarContainer extends BasePortalOutlet {
    constructor(_ngZone, _elementRef, _changeDetectorRef, _platform, 
    /** The snack bar configuration. */
    snackBarConfig) {
        super();
        this._ngZone = _ngZone;
        this._elementRef = _elementRef;
        this._changeDetectorRef = _changeDetectorRef;
        this._platform = _platform;
        this.snackBarConfig = snackBarConfig;
        this._document = inject(DOCUMENT);
        this._trackedModals = new Set();
        /** The number of milliseconds to wait before announcing the snack bar's content. */
        this._announceDelay = 150;
        /** Whether the component has been destroyed. */
        this._destroyed = false;
        /** Subject for notifying that the snack bar has announced to screen readers. */
        this._onAnnounce = new Subject();
        /** Subject for notifying that the snack bar has exited from view. */
        this._onExit = new Subject();
        /** Subject for notifying that the snack bar has finished entering the view. */
        this._onEnter = new Subject();
        /** The state of the snack bar animations. */
        this._animationState = 'void';
        /** Unique ID of the aria-live element. */
        this._liveElementId = `mat-snack-bar-container-live-${uniqueId++}`;
        /**
         * Attaches a DOM portal to the snack bar container.
         * @deprecated To be turned into a method.
         * @breaking-change 10.0.0
         */
        this.attachDomPortal = (portal) => {
            this._assertNotAttached();
            const result = this._portalOutlet.attachDomPortal(portal);
            this._afterPortalAttached();
            return result;
        };
        // Use aria-live rather than a live role like 'alert' or 'status'
        // because NVDA and JAWS have show inconsistent behavior with live roles.
        if (snackBarConfig.politeness === 'assertive' && !snackBarConfig.announcementMessage) {
            this._live = 'assertive';
        }
        else if (snackBarConfig.politeness === 'off') {
            this._live = 'off';
        }
        else {
            this._live = 'polite';
        }
        // Only set role for Firefox. Set role based on aria-live because setting role="alert" implies
        // aria-live="assertive" which may cause issues if aria-live is set to "polite" above.
        if (this._platform.FIREFOX) {
            if (this._live === 'polite') {
                this._role = 'status';
            }
            if (this._live === 'assertive') {
                this._role = 'alert';
            }
        }
    }
    /** Attach a component portal as content to this snack bar container. */
    attachComponentPortal(portal) {
        this._assertNotAttached();
        const result = this._portalOutlet.attachComponentPortal(portal);
        this._afterPortalAttached();
        return result;
    }
    /** Attach a template portal as content to this snack bar container. */
    attachTemplatePortal(portal) {
        this._assertNotAttached();
        const result = this._portalOutlet.attachTemplatePortal(portal);
        this._afterPortalAttached();
        return result;
    }
    /** Handle end of animations, updating the state of the snackbar. */
    onAnimationEnd(event) {
        const { fromState, toState } = event;
        if ((toState === 'void' && fromState !== 'void') || toState === 'hidden') {
            this._completeExit();
        }
        if (toState === 'visible') {
            // Note: we shouldn't use `this` inside the zone callback,
            // because it can cause a memory leak.
            const onEnter = this._onEnter;
            this._ngZone.run(() => {
                onEnter.next();
                onEnter.complete();
            });
        }
    }
    /** Begin animation of snack bar entrance into view. */
    enter() {
        if (!this._destroyed) {
            this._animationState = 'visible';
            // _animationState lives in host bindings and `detectChanges` does not refresh host bindings
            // so we have to call `markForCheck` to ensure the host view is refreshed eventually.
            this._changeDetectorRef.markForCheck();
            this._changeDetectorRef.detectChanges();
            this._screenReaderAnnounce();
        }
    }
    /** Begin animation of the snack bar exiting from view. */
    exit() {
        // It's common for snack bars to be opened by random outside calls like HTTP requests or
        // errors. Run inside the NgZone to ensure that it functions correctly.
        this._ngZone.run(() => {
            // Note: this one transitions to `hidden`, rather than `void`, in order to handle the case
            // where multiple snack bars are opened in quick succession (e.g. two consecutive calls to
            // `MatSnackBar.open`).
            this._animationState = 'hidden';
            this._changeDetectorRef.markForCheck();
            // Mark this element with an 'exit' attribute to indicate that the snackbar has
            // been dismissed and will soon be removed from the DOM. This is used by the snackbar
            // test harness.
            this._elementRef.nativeElement.setAttribute('mat-exit', '');
            // If the snack bar hasn't been announced by the time it exits it wouldn't have been open
            // long enough to visually read it either, so clear the timeout for announcing.
            clearTimeout(this._announceTimeoutId);
        });
        return this._onExit;
    }
    /** Makes sure the exit callbacks have been invoked when the element is destroyed. */
    ngOnDestroy() {
        this._destroyed = true;
        this._clearFromModals();
        this._completeExit();
    }
    /**
     * Removes the element in a microtask. Helps prevent errors where we end up
     * removing an element which is in the middle of an animation.
     */
    _completeExit() {
        queueMicrotask(() => {
            this._onExit.next();
            this._onExit.complete();
        });
    }
    /**
     * Called after the portal contents have been attached. Can be
     * used to modify the DOM once it's guaranteed to be in place.
     */
    _afterPortalAttached() {
        const element = this._elementRef.nativeElement;
        const panelClasses = this.snackBarConfig.panelClass;
        if (panelClasses) {
            if (Array.isArray(panelClasses)) {
                // Note that we can't use a spread here, because IE doesn't support multiple arguments.
                panelClasses.forEach(cssClass => element.classList.add(cssClass));
            }
            else {
                element.classList.add(panelClasses);
            }
        }
        this._exposeToModals();
        // Check to see if the attached component or template uses the MDC template structure,
        // specifically the MDC label. If not, the container should apply the MDC label class to this
        // component's label container, which will apply MDC's label styles to the attached view.
        const label = this._label.nativeElement;
        const labelClass = 'mdc-snackbar__label';
        label.classList.toggle(labelClass, !label.querySelector(`.${labelClass}`));
    }
    /**
     * Some browsers won't expose the accessibility node of the live element if there is an
     * `aria-modal` and the live element is outside of it. This method works around the issue by
     * pointing the `aria-owns` of all modals to the live element.
     */
    _exposeToModals() {
        // TODO(http://github.com/angular/components/issues/26853): consider de-duplicating this with the
        // `LiveAnnouncer` and any other usages.
        //
        // Note that the selector here is limited to CDK overlays at the moment in order to reduce the
        // section of the DOM we need to look through. This should cover all the cases we support, but
        // the selector can be expanded if it turns out to be too narrow.
        const id = this._liveElementId;
        const modals = this._document.querySelectorAll('body > .cdk-overlay-container [aria-modal="true"]');
        for (let i = 0; i < modals.length; i++) {
            const modal = modals[i];
            const ariaOwns = modal.getAttribute('aria-owns');
            this._trackedModals.add(modal);
            if (!ariaOwns) {
                modal.setAttribute('aria-owns', id);
            }
            else if (ariaOwns.indexOf(id) === -1) {
                modal.setAttribute('aria-owns', ariaOwns + ' ' + id);
            }
        }
    }
    /** Clears the references to the live element from any modals it was added to. */
    _clearFromModals() {
        this._trackedModals.forEach(modal => {
            const ariaOwns = modal.getAttribute('aria-owns');
            if (ariaOwns) {
                const newValue = ariaOwns.replace(this._liveElementId, '').trim();
                if (newValue.length > 0) {
                    modal.setAttribute('aria-owns', newValue);
                }
                else {
                    modal.removeAttribute('aria-owns');
                }
            }
        });
        this._trackedModals.clear();
    }
    /** Asserts that no content is already attached to the container. */
    _assertNotAttached() {
        if (this._portalOutlet.hasAttached() && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throw Error('Attempting to attach snack bar content after content is already attached');
        }
    }
    /**
     * Starts a timeout to move the snack bar content to the live region so screen readers will
     * announce it.
     */
    _screenReaderAnnounce() {
        if (!this._announceTimeoutId) {
            this._ngZone.runOutsideAngular(() => {
                this._announceTimeoutId = setTimeout(() => {
                    const inertElement = this._elementRef.nativeElement.querySelector('[aria-hidden]');
                    const liveElement = this._elementRef.nativeElement.querySelector('[aria-live]');
                    if (inertElement && liveElement) {
                        // If an element in the snack bar content is focused before being moved
                        // track it and restore focus after moving to the live region.
                        let focusedElement = null;
                        if (this._platform.isBrowser &&
                            document.activeElement instanceof HTMLElement &&
                            inertElement.contains(document.activeElement)) {
                            focusedElement = document.activeElement;
                        }
                        inertElement.removeAttribute('aria-hidden');
                        liveElement.appendChild(inertElement);
                        focusedElement?.focus();
                        this._onAnnounce.next();
                        this._onAnnounce.complete();
                    }
                }, this._announceDelay);
            });
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.2.0", ngImport: i0, type: MatSnackBarContainer, deps: [{ token: i0.NgZone }, { token: i0.ElementRef }, { token: i0.ChangeDetectorRef }, { token: i1.Platform }, { token: i2.MatSnackBarConfig }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "17.2.0", type: MatSnackBarContainer, isStandalone: true, selector: "mat-snack-bar-container", host: { listeners: { "@state.done": "onAnimationEnd($event)" }, properties: { "@state": "_animationState" }, classAttribute: "mdc-snackbar mat-mdc-snack-bar-container mdc-snackbar--open" }, viewQueries: [{ propertyName: "_portalOutlet", first: true, predicate: CdkPortalOutlet, descendants: true, static: true }, { propertyName: "_label", first: true, predicate: ["label"], descendants: true, static: true }], usesInheritance: true, ngImport: i0, template: "<div class=\"mdc-snackbar__surface\">\n  <!--\n    This outer label wrapper will have the class `mdc-snackbar__label` applied if\n    the attached template/component does not contain it.\n  -->\n  <div class=\"mat-mdc-snack-bar-label\" #label>\n    <!-- Initialy holds the snack bar content, will be empty after announcing to screen readers. -->\n    <div aria-hidden=\"true\">\n      <ng-template cdkPortalOutlet />\n    </div>\n\n    <!-- Will receive the snack bar content from the non-live div, move will happen a short delay after opening -->\n    <div [attr.aria-live]=\"_live\" [attr.role]=\"_role\" [attr.id]=\"_liveElementId\"></div>\n  </div>\n</div>\n", styles: [".mdc-snackbar{display:none;position:fixed;right:0;bottom:0;left:0;align-items:center;justify-content:center;box-sizing:border-box;pointer-events:none;-webkit-tap-highlight-color:rgba(0,0,0,0)}.mdc-snackbar--opening,.mdc-snackbar--open,.mdc-snackbar--closing{display:flex}.mdc-snackbar--open .mdc-snackbar__label,.mdc-snackbar--open .mdc-snackbar__actions{visibility:visible}.mdc-snackbar__surface{padding-left:0;padding-right:8px;display:flex;align-items:center;justify-content:flex-start;box-sizing:border-box;transform:scale(0.8);opacity:0}.mdc-snackbar__surface::before{position:absolute;box-sizing:border-box;width:100%;height:100%;top:0;left:0;border:1px solid rgba(0,0,0,0);border-radius:inherit;content:\"\";pointer-events:none}@media screen and (forced-colors: active){.mdc-snackbar__surface::before{border-color:CanvasText}}[dir=rtl] .mdc-snackbar__surface,.mdc-snackbar__surface[dir=rtl]{padding-left:8px;padding-right:0}.mdc-snackbar--open .mdc-snackbar__surface{transform:scale(1);opacity:1;pointer-events:auto}.mdc-snackbar--closing .mdc-snackbar__surface{transform:scale(1)}.mdc-snackbar__label{padding-left:16px;padding-right:8px;width:100%;flex-grow:1;box-sizing:border-box;margin:0;visibility:hidden;padding-top:14px;padding-bottom:14px}[dir=rtl] .mdc-snackbar__label,.mdc-snackbar__label[dir=rtl]{padding-left:8px;padding-right:16px}.mdc-snackbar__label::before{display:inline;content:attr(data-mdc-snackbar-label-text)}.mdc-snackbar__actions{display:flex;flex-shrink:0;align-items:center;box-sizing:border-box;visibility:hidden}.mdc-snackbar__action+.mdc-snackbar__dismiss{margin-left:8px;margin-right:0}[dir=rtl] .mdc-snackbar__action+.mdc-snackbar__dismiss,.mdc-snackbar__action+.mdc-snackbar__dismiss[dir=rtl]{margin-left:0;margin-right:8px}.mat-mdc-snack-bar-container{margin:8px;position:static}.mat-mdc-snack-bar-container .mdc-snackbar__surface{min-width:344px}@media(max-width: 480px),(max-width: 344px){.mat-mdc-snack-bar-container .mdc-snackbar__surface{min-width:100%}}@media(max-width: 480px),(max-width: 344px){.mat-mdc-snack-bar-container{width:100vw}}.mat-mdc-snack-bar-container .mdc-snackbar__surface{max-width:672px}.mat-mdc-snack-bar-container .mdc-snackbar__surface{box-shadow:0px 3px 5px -1px rgba(0, 0, 0, 0.2), 0px 6px 10px 0px rgba(0, 0, 0, 0.14), 0px 1px 18px 0px rgba(0, 0, 0, 0.12)}.mat-mdc-snack-bar-container .mdc-snackbar__surface{background-color:var(--mdc-snackbar-container-color)}.mat-mdc-snack-bar-container .mdc-snackbar__surface{border-radius:var(--mdc-snackbar-container-shape)}.mat-mdc-snack-bar-container .mdc-snackbar__label{color:var(--mdc-snackbar-supporting-text-color)}.mat-mdc-snack-bar-container .mdc-snackbar__label{font-size:var(--mdc-snackbar-supporting-text-size);font-family:var(--mdc-snackbar-supporting-text-font);font-weight:var(--mdc-snackbar-supporting-text-weight);line-height:var(--mdc-snackbar-supporting-text-line-height)}.mat-mdc-snack-bar-container .mat-mdc-button.mat-mdc-snack-bar-action:not(:disabled){color:var(--mat-snack-bar-button-color);--mat-text-button-state-layer-color:currentColor;--mat-text-button-ripple-color:currentColor}.mat-mdc-snack-bar-container .mat-mdc-button.mat-mdc-snack-bar-action:not(:disabled) .mat-ripple-element{opacity:.1}.mat-mdc-snack-bar-container .mdc-snackbar__label::before{display:none}.mat-mdc-snack-bar-handset,.mat-mdc-snack-bar-container,.mat-mdc-snack-bar-label{flex:1 1 auto}.mat-mdc-snack-bar-handset .mdc-snackbar__surface{width:100%}"], dependencies: [{ kind: "directive", type: CdkPortalOutlet, selector: "[cdkPortalOutlet]", inputs: ["cdkPortalOutlet"], outputs: ["attached"], exportAs: ["cdkPortalOutlet"] }], animations: [matSnackBarAnimations.snackBarState], changeDetection: i0.ChangeDetectionStrategy.Default, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.2.0", ngImport: i0, type: MatSnackBarContainer, decorators: [{
            type: Component,
            args: [{ selector: 'mat-snack-bar-container', changeDetection: ChangeDetectionStrategy.Default, encapsulation: ViewEncapsulation.None, animations: [matSnackBarAnimations.snackBarState], standalone: true, imports: [CdkPortalOutlet], host: {
                        'class': 'mdc-snackbar mat-mdc-snack-bar-container mdc-snackbar--open',
                        '[@state]': '_animationState',
                        '(@state.done)': 'onAnimationEnd($event)',
                    }, template: "<div class=\"mdc-snackbar__surface\">\n  <!--\n    This outer label wrapper will have the class `mdc-snackbar__label` applied if\n    the attached template/component does not contain it.\n  -->\n  <div class=\"mat-mdc-snack-bar-label\" #label>\n    <!-- Initialy holds the snack bar content, will be empty after announcing to screen readers. -->\n    <div aria-hidden=\"true\">\n      <ng-template cdkPortalOutlet />\n    </div>\n\n    <!-- Will receive the snack bar content from the non-live div, move will happen a short delay after opening -->\n    <div [attr.aria-live]=\"_live\" [attr.role]=\"_role\" [attr.id]=\"_liveElementId\"></div>\n  </div>\n</div>\n", styles: [".mdc-snackbar{display:none;position:fixed;right:0;bottom:0;left:0;align-items:center;justify-content:center;box-sizing:border-box;pointer-events:none;-webkit-tap-highlight-color:rgba(0,0,0,0)}.mdc-snackbar--opening,.mdc-snackbar--open,.mdc-snackbar--closing{display:flex}.mdc-snackbar--open .mdc-snackbar__label,.mdc-snackbar--open .mdc-snackbar__actions{visibility:visible}.mdc-snackbar__surface{padding-left:0;padding-right:8px;display:flex;align-items:center;justify-content:flex-start;box-sizing:border-box;transform:scale(0.8);opacity:0}.mdc-snackbar__surface::before{position:absolute;box-sizing:border-box;width:100%;height:100%;top:0;left:0;border:1px solid rgba(0,0,0,0);border-radius:inherit;content:\"\";pointer-events:none}@media screen and (forced-colors: active){.mdc-snackbar__surface::before{border-color:CanvasText}}[dir=rtl] .mdc-snackbar__surface,.mdc-snackbar__surface[dir=rtl]{padding-left:8px;padding-right:0}.mdc-snackbar--open .mdc-snackbar__surface{transform:scale(1);opacity:1;pointer-events:auto}.mdc-snackbar--closing .mdc-snackbar__surface{transform:scale(1)}.mdc-snackbar__label{padding-left:16px;padding-right:8px;width:100%;flex-grow:1;box-sizing:border-box;margin:0;visibility:hidden;padding-top:14px;padding-bottom:14px}[dir=rtl] .mdc-snackbar__label,.mdc-snackbar__label[dir=rtl]{padding-left:8px;padding-right:16px}.mdc-snackbar__label::before{display:inline;content:attr(data-mdc-snackbar-label-text)}.mdc-snackbar__actions{display:flex;flex-shrink:0;align-items:center;box-sizing:border-box;visibility:hidden}.mdc-snackbar__action+.mdc-snackbar__dismiss{margin-left:8px;margin-right:0}[dir=rtl] .mdc-snackbar__action+.mdc-snackbar__dismiss,.mdc-snackbar__action+.mdc-snackbar__dismiss[dir=rtl]{margin-left:0;margin-right:8px}.mat-mdc-snack-bar-container{margin:8px;position:static}.mat-mdc-snack-bar-container .mdc-snackbar__surface{min-width:344px}@media(max-width: 480px),(max-width: 344px){.mat-mdc-snack-bar-container .mdc-snackbar__surface{min-width:100%}}@media(max-width: 480px),(max-width: 344px){.mat-mdc-snack-bar-container{width:100vw}}.mat-mdc-snack-bar-container .mdc-snackbar__surface{max-width:672px}.mat-mdc-snack-bar-container .mdc-snackbar__surface{box-shadow:0px 3px 5px -1px rgba(0, 0, 0, 0.2), 0px 6px 10px 0px rgba(0, 0, 0, 0.14), 0px 1px 18px 0px rgba(0, 0, 0, 0.12)}.mat-mdc-snack-bar-container .mdc-snackbar__surface{background-color:var(--mdc-snackbar-container-color)}.mat-mdc-snack-bar-container .mdc-snackbar__surface{border-radius:var(--mdc-snackbar-container-shape)}.mat-mdc-snack-bar-container .mdc-snackbar__label{color:var(--mdc-snackbar-supporting-text-color)}.mat-mdc-snack-bar-container .mdc-snackbar__label{font-size:var(--mdc-snackbar-supporting-text-size);font-family:var(--mdc-snackbar-supporting-text-font);font-weight:var(--mdc-snackbar-supporting-text-weight);line-height:var(--mdc-snackbar-supporting-text-line-height)}.mat-mdc-snack-bar-container .mat-mdc-button.mat-mdc-snack-bar-action:not(:disabled){color:var(--mat-snack-bar-button-color);--mat-text-button-state-layer-color:currentColor;--mat-text-button-ripple-color:currentColor}.mat-mdc-snack-bar-container .mat-mdc-button.mat-mdc-snack-bar-action:not(:disabled) .mat-ripple-element{opacity:.1}.mat-mdc-snack-bar-container .mdc-snackbar__label::before{display:none}.mat-mdc-snack-bar-handset,.mat-mdc-snack-bar-container,.mat-mdc-snack-bar-label{flex:1 1 auto}.mat-mdc-snack-bar-handset .mdc-snackbar__surface{width:100%}"] }]
        }], ctorParameters: () => [{ type: i0.NgZone }, { type: i0.ElementRef }, { type: i0.ChangeDetectorRef }, { type: i1.Platform }, { type: i2.MatSnackBarConfig }], propDecorators: { _portalOutlet: [{
                type: ViewChild,
                args: [CdkPortalOutlet, { static: true }]
            }], _label: [{
                type: ViewChild,
                args: ['label', { static: true }]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic25hY2stYmFyLWNvbnRhaW5lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9zbmFjay1iYXIvc25hY2stYmFyLWNvbnRhaW5lci50cyIsIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9zbmFjay1iYXIvc25hY2stYmFyLWNvbnRhaW5lci5odG1sIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFDTCx1QkFBdUIsRUFDdkIsaUJBQWlCLEVBQ2pCLFNBQVMsRUFFVCxVQUFVLEVBRVYsTUFBTSxFQUNOLE1BQU0sRUFFTixTQUFTLEVBQ1QsaUJBQWlCLEdBQ2xCLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUN6QyxPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUM3RCxPQUFPLEVBQ0wsZ0JBQWdCLEVBQ2hCLGVBQWUsR0FJaEIsTUFBTSxxQkFBcUIsQ0FBQztBQUM3QixPQUFPLEVBQWEsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBRXpDLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUUvQyxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQzs7OztBQUVyRCxJQUFJLFFBQVEsR0FBRyxDQUFDLENBQUM7QUFFakI7OztHQUdHO0FBb0JILE1BQU0sT0FBTyxvQkFBcUIsU0FBUSxnQkFBZ0I7SUErQ3hELFlBQ1UsT0FBZSxFQUNmLFdBQW9DLEVBQ3BDLGtCQUFxQyxFQUNyQyxTQUFtQjtJQUMzQixtQ0FBbUM7SUFDNUIsY0FBaUM7UUFFeEMsS0FBSyxFQUFFLENBQUM7UUFQQSxZQUFPLEdBQVAsT0FBTyxDQUFRO1FBQ2YsZ0JBQVcsR0FBWCxXQUFXLENBQXlCO1FBQ3BDLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FB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Q0FBQyxhQUFhLENBQUMsY0FDckMsSUFBSSxXQUNQLENBQUMsZUFBZSxDQUFDLFFBQ3BCO3dCQUNKLE9BQU8sRUFBRSw2REFBNkQ7d0JBQ3RFLFVBQVUsRUFBRSxpQkFBaUI7d0JBQzdCLGVBQWUsRUFBRSx3QkFBd0I7cUJBQzFDOzJMQWdCMkMsYUFBYTtzQkFBeEQsU0FBUzt1QkFBQyxlQUFlLEVBQUUsRUFBQyxNQUFNLEVBQUUsSUFBSSxFQUFDO2dCQXNCTixNQUFNO3NCQUF6QyxTQUFTO3VCQUFDLE9BQU8sRUFBRSxFQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIENoYW5nZURldGVjdG9yUmVmLFxuICBDb21wb25lbnQsXG4gIENvbXBvbmVudFJlZixcbiAgRWxlbWVudFJlZixcbiAgRW1iZWRkZWRWaWV3UmVmLFxuICBpbmplY3QsXG4gIE5nWm9uZSxcbiAgT25EZXN0cm95LFxuICBWaWV3Q2hpbGQsXG4gIFZpZXdFbmNhcHN1bGF0aW9uLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7RE9DVU1FTlR9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge21hdFNuYWNrQmFyQW5pbWF0aW9uc30gZnJvbSAnLi9zbmFjay1iYXItYW5pbWF0aW9ucyc7XG5pbXBvcnQge1xuICBCYXNlUG9ydGFsT3V0bGV0LFxuICBDZGtQb3J0YWxPdXRsZXQsXG4gIENvbXBvbmVudFBvcnRhbCxcbiAgRG9tUG9ydGFsLFxuICBUZW1wbGF0ZVBvcnRhbCxcbn0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BvcnRhbCc7XG5pbXBvcnQge09ic2VydmFibGUsIFN1YmplY3R9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtBcmlhTGl2ZVBvbGl0ZW5lc3N9IGZyb20gJ0Bhbmd1bGFyL2Nkay9hMTF5JztcbmltcG9ydCB7UGxhdGZvcm19IGZyb20gJ0Bhbmd1bGFyL2Nkay9wbGF0Zm9ybSc7XG5pbXBvcnQge0FuaW1hdGlvbkV2ZW50fSBmcm9tICdAYW5ndWxhci9hbmltYXRpb25zJztcbmltcG9ydCB7TWF0U25hY2tCYXJDb25maWd9IGZyb20gJy4vc25hY2stYmFyLWNvbmZpZyc7XG5cbmxldCB1bmlxdWVJZCA9IDA7XG5cbi8qKlxuICogSW50ZXJuYWwgY29tcG9uZW50IHRoYXQgd3JhcHMgdXNlci1wcm92aWRlZCBzbmFjayBiYXIgY29udGVudC5cbiAqIEBkb2NzLXByaXZhdGVcbiAqL1xuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbWF0LXNuYWNrLWJhci1jb250YWluZXInLFxuICB0ZW1wbGF0ZVVybDogJ3NuYWNrLWJhci1jb250YWluZXIuaHRtbCcsXG4gIHN0eWxlVXJsOiAnc25hY2stYmFyLWNvbnRhaW5lci5jc3MnLFxuICAvLyBJbiBJdnkgZW1iZWRkZWQgdmlld3Mgd2lsbCBiZSBjaGFuZ2UgZGV0ZWN0ZWQgZnJvbSB0aGVpciBkZWNsYXJhdGlvbiBwbGFjZSwgcmF0aGVyIHRoYW5cbiAgLy8gd2hlcmUgdGhleSB3ZXJlIHN0YW1wZWQgb3V0LiBUaGlzIG1lYW5zIHRoYXQgd2UgY2FuJ3QgaGF2ZSB0aGUgc25hY2sgYmFyIGNvbnRhaW5lciBiZSBPblB1c2gsXG4gIC8vIGJlY2F1c2UgaXQgbWlnaHQgY2F1c2Ugc25hY2sgYmFycyB0aGF0IHdlcmUgb3BlbmVkIGZyb20gYSB0ZW1wbGF0ZSBub3QgdG8gYmUgb3V0IG9mIGRhdGUuXG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTp2YWxpZGF0ZS1kZWNvcmF0b3JzXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuRGVmYXVsdCxcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcbiAgYW5pbWF0aW9uczogW21hdFNuYWNrQmFyQW5pbWF0aW9ucy5zbmFja0JhclN0YXRlXSxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbiAgaW1wb3J0czogW0Nka1BvcnRhbE91dGxldF0sXG4gIGhvc3Q6IHtcbiAgICAnY2xhc3MnOiAnbWRjLXNuYWNrYmFyIG1hdC1tZGMtc25hY2stYmFyLWNvbnRhaW5lciBtZGMtc25hY2tiYXItLW9wZW4nLFxuICAgICdbQHN0YXRlXSc6ICdfYW5pbWF0aW9uU3RhdGUnLFxuICAgICcoQHN0YXRlLmRvbmUpJzogJ29uQW5pbWF0aW9uRW5kKCRldmVudCknLFxuICB9LFxufSlcbmV4cG9ydCBjbGFzcyBNYXRTbmFja0JhckNvbnRhaW5lciBleHRlbmRzIEJhc2VQb3J0YWxPdXRsZXQgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuICBwcml2YXRlIF9kb2N1bWVudCA9IGluamVjdChET0NVTUVOVCk7XG4gIHByaXZhdGUgX3RyYWNrZWRNb2RhbHMgPSBuZXcgU2V0PEVsZW1lbnQ+KCk7XG5cbiAgLyoqIFRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIHRvIHdhaXQgYmVmb3JlIGFubm91bmNpbmcgdGhlIHNuYWNrIGJhcidzIGNvbnRlbnQuICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX2Fubm91bmNlRGVsYXk6IG51bWJlciA9IDE1MDtcblxuICAvKiogVGhlIHRpbWVvdXQgZm9yIGFubm91bmNpbmcgdGhlIHNuYWNrIGJhcidzIGNvbnRlbnQuICovXG4gIHByaXZhdGUgX2Fubm91bmNlVGltZW91dElkOiBudW1iZXI7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGNvbXBvbmVudCBoYXMgYmVlbiBkZXN0cm95ZWQuICovXG4gIHByaXZhdGUgX2Rlc3Ryb3llZCA9IGZhbHNlO1xuXG4gIC8qKiBUaGUgcG9ydGFsIG91dGxldCBpbnNpZGUgb2YgdGhpcyBjb250YWluZXIgaW50byB3aGljaCB0aGUgc25hY2sgYmFyIGNvbnRlbnQgd2lsbCBiZSBsb2FkZWQuICovXG4gIEBWaWV3Q2hpbGQoQ2RrUG9ydGFsT3V0bGV0LCB7c3RhdGljOiB0cnVlfSkgX3BvcnRhbE91dGxldDogQ2RrUG9ydGFsT3V0bGV0O1xuXG4gIC8qKiBTdWJqZWN0IGZvciBub3RpZnlpbmcgdGhhdCB0aGUgc25hY2sgYmFyIGhhcyBhbm5vdW5jZWQgdG8gc2NyZWVuIHJlYWRlcnMuICovXG4gIHJlYWRvbmx5IF9vbkFubm91bmNlOiBTdWJqZWN0PHZvaWQ+ID0gbmV3IFN1YmplY3QoKTtcblxuICAvKiogU3ViamVjdCBmb3Igbm90aWZ5aW5nIHRoYXQgdGhlIHNuYWNrIGJhciBoYXMgZXhpdGVkIGZyb20gdmlldy4gKi9cbiAgcmVhZG9ubHkgX29uRXhpdDogU3ViamVjdDx2b2lkPiA9IG5ldyBTdWJqZWN0KCk7XG5cbiAgLyoqIFN1YmplY3QgZm9yIG5vdGlmeWluZyB0aGF0IHRoZSBzbmFjayBiYXIgaGFzIGZpbmlzaGVkIGVudGVyaW5nIHRoZSB2aWV3LiAqL1xuICByZWFkb25seSBfb25FbnRlcjogU3ViamVjdDx2b2lkPiA9IG5ldyBTdWJqZWN0KCk7XG5cbiAgLyoqIFRoZSBzdGF0ZSBvZiB0aGUgc25hY2sgYmFyIGFuaW1hdGlvbnMuICovXG4gIF9hbmltYXRpb25TdGF0ZSA9ICd2b2lkJztcblxuICAvKiogYXJpYS1saXZlIHZhbHVlIGZvciB0aGUgbGl2ZSByZWdpb24uICovXG4gIF9saXZlOiBBcmlhTGl2ZVBvbGl0ZW5lc3M7XG5cbiAgLyoqXG4gICAqIEVsZW1lbnQgdGhhdCB3aWxsIGhhdmUgdGhlIGBtZGMtc25hY2tiYXJfX2xhYmVsYCBjbGFzcyBhcHBsaWVkIGlmIHRoZSBhdHRhY2hlZCBjb21wb25lbnRcbiAgICogb3IgdGVtcGxhdGUgZG9lcyBub3QgaGF2ZSBpdC4gVGhpcyBlbnN1cmVzIHRoYXQgdGhlIGFwcHJvcHJpYXRlIHN0cnVjdHVyZSwgdHlwb2dyYXBoeSwgYW5kXG4gICAqIGNvbG9yIGlzIGFwcGxpZWQgdG8gdGhlIGF0dGFjaGVkIHZpZXcuXG4gICAqL1xuICBAVmlld0NoaWxkKCdsYWJlbCcsIHtzdGF0aWM6IHRydWV9KSBfbGFiZWw6IEVsZW1lbnRSZWY7XG5cbiAgLyoqXG4gICAqIFJvbGUgb2YgdGhlIGxpdmUgcmVnaW9uLiBUaGlzIGlzIG9ubHkgZm9yIEZpcmVmb3ggYXMgdGhlcmUgaXMgYSBrbm93biBpc3N1ZSB3aGVyZSBGaXJlZm94ICtcbiAgICogSkFXUyBkb2VzIG5vdCByZWFkIG91dCBhcmlhLWxpdmUgbWVzc2FnZS5cbiAgICovXG4gIF9yb2xlPzogJ3N0YXR1cycgfCAnYWxlcnQnO1xuXG4gIC8qKiBVbmlxdWUgSUQgb2YgdGhlIGFyaWEtbGl2ZSBlbGVtZW50LiAqL1xuICByZWFkb25seSBfbGl2ZUVsZW1lbnRJZCA9IGBtYXQtc25hY2stYmFyLWNvbnRhaW5lci1saXZlLSR7dW5pcXVlSWQrK31gO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgX25nWm9uZTogTmdab25lLFxuICAgIHByaXZhdGUgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+LFxuICAgIHByaXZhdGUgX2NoYW5nZURldGVjdG9yUmVmOiBDaGFuZ2VEZXRlY3RvclJlZixcbiAgICBwcml2YXRlIF9wbGF0Zm9ybTogUGxhdGZvcm0sXG4gICAgLyoqIFRoZSBzbmFjayBiYXIgY29uZmlndXJhdGlvbi4gKi9cbiAgICBwdWJsaWMgc25hY2tCYXJDb25maWc6IE1hdFNuYWNrQmFyQ29uZmlnLFxuICApIHtcbiAgICBzdXBlcigpO1xuXG4gICAgLy8gVXNlIGFyaWEtbGl2ZSByYXRoZXIgdGhhbiBhIGxpdmUgcm9sZSBsaWtlICdhbGVydCcgb3IgJ3N0YXR1cydcbiAgICAvLyBiZWNhdXNlIE5WREEgYW5kIEpBV1MgaGF2ZSBzaG93IGluY29uc2lzdGVudCBiZWhhdmlvciB3aXRoIGxpdmUgcm9sZXMuXG4gICAgaWYgKHNuYWNrQmFyQ29uZmlnLnBvbGl0ZW5lc3MgPT09ICdhc3NlcnRpdmUnICYmICFzbmFja0JhckNvbmZpZy5hbm5vdW5jZW1lbnRNZXNzYWdlKSB7XG4gICAgICB0aGlzLl9saXZlID0gJ2Fzc2VydGl2ZSc7XG4gICAgfSBlbHNlIGlmIChzbmFja0JhckNvbmZpZy5wb2xpdGVuZXNzID09PSAnb2ZmJykge1xuICAgICAgdGhpcy5fbGl2ZSA9ICdvZmYnO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9saXZlID0gJ3BvbGl0ZSc7XG4gICAgfVxuXG4gICAgLy8gT25seSBzZXQgcm9sZSBmb3IgRmlyZWZveC4gU2V0IHJvbGUgYmFzZWQgb24gYXJpYS1saXZlIGJlY2F1c2Ugc2V0dGluZyByb2xlPVwiYWxlcnRcIiBpbXBsaWVzXG4gICAgLy8gYXJpYS1saXZlPVwiYXNzZXJ0aXZlXCIgd2hpY2ggbWF5IGNhdXNlIGlzc3VlcyBpZiBhcmlhLWxpdmUgaXMgc2V0IHRvIFwicG9saXRlXCIgYWJvdmUuXG4gICAgaWYgKHRoaXMuX3BsYXRmb3JtLkZJUkVGT1gpIHtcbiAgICAgIGlmICh0aGlzLl9saXZlID09PSAncG9saXRlJykge1xuICAgICAgICB0aGlzLl9yb2xlID0gJ3N0YXR1cyc7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5fbGl2ZSA9PT0gJ2Fzc2VydGl2ZScpIHtcbiAgICAgICAgdGhpcy5fcm9sZSA9ICdhbGVydCc7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqIEF0dGFjaCBhIGNvbXBvbmVudCBwb3J0YWwgYXMgY29udGVudCB0byB0aGlzIHNuYWNrIGJhciBjb250YWluZXIuICovXG4gIGF0dGFjaENvbXBvbmVudFBvcnRhbDxUPihwb3J0YWw6IENvbXBvbmVudFBvcnRhbDxUPik6IENvbXBvbmVudFJlZjxUPiB7XG4gICAgdGhpcy5fYXNzZXJ0Tm90QXR0YWNoZWQoKTtcbiAgICBjb25zdCByZXN1bHQgPSB0aGlzLl9wb3J0YWxPdXRsZXQuYXR0YWNoQ29tcG9uZW50UG9ydGFsKHBvcnRhbCk7XG4gICAgdGhpcy5fYWZ0ZXJQb3J0YWxBdHRhY2hlZCgpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKiogQXR0YWNoIGEgdGVtcGxhdGUgcG9ydGFsIGFzIGNvbnRlbnQgdG8gdGhpcyBzbmFjayBiYXIgY29udGFpbmVyLiAqL1xuICBhdHRhY2hUZW1wbGF0ZVBvcnRhbDxDPihwb3J0YWw6IFRlbXBsYXRlUG9ydGFsPEM+KTogRW1iZWRkZWRWaWV3UmVmPEM+IHtcbiAgICB0aGlzLl9hc3NlcnROb3RBdHRhY2hlZCgpO1xuICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuX3BvcnRhbE91dGxldC5hdHRhY2hUZW1wbGF0ZVBvcnRhbChwb3J0YWwpO1xuICAgIHRoaXMuX2FmdGVyUG9ydGFsQXR0YWNoZWQoKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyoqXG4gICAqIEF0dGFjaGVzIGEgRE9NIHBvcnRhbCB0byB0aGUgc25hY2sgYmFyIGNvbnRhaW5lci5cbiAgICogQGRlcHJlY2F0ZWQgVG8gYmUgdHVybmVkIGludG8gYSBtZXRob2QuXG4gICAqIEBicmVha2luZy1jaGFuZ2UgMTAuMC4wXG4gICAqL1xuICBvdmVycmlkZSBhdHRhY2hEb21Qb3J0YWwgPSAocG9ydGFsOiBEb21Qb3J0YWwpID0+IHtcbiAgICB0aGlzLl9hc3NlcnROb3RBdHRhY2hlZCgpO1xuICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuX3BvcnRhbE91dGxldC5hdHRhY2hEb21Qb3J0YWwocG9ydGFsKTtcbiAgICB0aGlzLl9hZnRlclBvcnRhbEF0dGFjaGVkKCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvKiogSGFuZGxlIGVuZCBvZiBhbmltYXRpb25zLCB1cGRhdGluZyB0aGUgc3RhdGUgb2YgdGhlIHNuYWNrYmFyLiAqL1xuICBvbkFuaW1hdGlvbkVuZChldmVudDogQW5pbWF0aW9uRXZlbnQpIHtcbiAgICBjb25zdCB7ZnJvbVN0YXRlLCB0b1N0YXRlfSA9IGV2ZW50O1xuXG4gICAgaWYgKCh0b1N0YXRlID09PSAndm9pZCcgJiYgZnJvbVN0YXRlICE9PSAndm9pZCcpIHx8IHRvU3RhdGUgPT09ICdoaWRkZW4nKSB7XG4gICAgICB0aGlzLl9jb21wbGV0ZUV4aXQoKTtcbiAgICB9XG5cbiAgICBpZiAodG9TdGF0ZSA9PT0gJ3Zpc2libGUnKSB7XG4gICAgICAvLyBOb3RlOiB3ZSBzaG91bGRuJ3QgdXNlIGB0aGlzYCBpbnNpZGUgdGhlIHpvbmUgY2FsbGJhY2ssXG4gICAgICAvLyBiZWNhdXNlIGl0IGNhbiBjYXVzZSBhIG1lbW9yeSBsZWFrLlxuICAgICAgY29uc3Qgb25FbnRlciA9IHRoaXMuX29uRW50ZXI7XG5cbiAgICAgIHRoaXMuX25nWm9uZS5ydW4oKCkgPT4ge1xuICAgICAgICBvbkVudGVyLm5leHQoKTtcbiAgICAgICAgb25FbnRlci5jb21wbGV0ZSgpO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEJlZ2luIGFuaW1hdGlvbiBvZiBzbmFjayBiYXIgZW50cmFuY2UgaW50byB2aWV3LiAqL1xuICBlbnRlcigpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX2Rlc3Ryb3llZCkge1xuICAgICAgdGhpcy5fYW5pbWF0aW9uU3RhdGUgPSAndmlzaWJsZSc7XG4gICAgICAvLyBfYW5pbWF0aW9uU3RhdGUgbGl2ZXMgaW4gaG9zdCBiaW5kaW5ncyBhbmQgYGRldGVjdENoYW5nZXNgIGRvZXMgbm90IHJlZnJlc2ggaG9zdCBiaW5kaW5nc1xuICAgICAgLy8gc28gd2UgaGF2ZSB0byBjYWxsIGBtYXJrRm9yQ2hlY2tgIHRvIGVuc3VyZSB0aGUgaG9zdCB2aWV3IGlzIHJlZnJlc2hlZCBldmVudHVhbGx5LlxuICAgICAgdGhpcy5fY2hhbmdlRGV0ZWN0b3JSZWYubWFya0ZvckNoZWNrKCk7XG4gICAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZi5kZXRlY3RDaGFuZ2VzKCk7XG4gICAgICB0aGlzLl9zY3JlZW5SZWFkZXJBbm5vdW5jZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBCZWdpbiBhbmltYXRpb24gb2YgdGhlIHNuYWNrIGJhciBleGl0aW5nIGZyb20gdmlldy4gKi9cbiAgZXhpdCgpOiBPYnNlcnZhYmxlPHZvaWQ+IHtcbiAgICAvLyBJdCdzIGNvbW1vbiBmb3Igc25hY2sgYmFycyB0byBiZSBvcGVuZWQgYnkgcmFuZG9tIG91dHNpZGUgY2FsbHMgbGlrZSBIVFRQIHJlcXVlc3RzIG9yXG4gICAgLy8gZXJyb3JzLiBSdW4gaW5zaWRlIHRoZSBOZ1pvbmUgdG8gZW5zdXJlIHRoYXQgaXQgZnVuY3Rpb25zIGNvcnJlY3RseS5cbiAgICB0aGlzLl9uZ1pvbmUucnVuKCgpID0+IHtcbiAgICAgIC8vIE5vdGU6IHRoaXMgb25lIHRyYW5zaXRpb25zIHRvIGBoaWRkZW5gLCByYXRoZXIgdGhhbiBgdm9pZGAsIGluIG9yZGVyIHRvIGhhbmRsZSB0aGUgY2FzZVxuICAgICAgLy8gd2hlcmUgbXVsdGlwbGUgc25hY2sgYmFycyBhcmUgb3BlbmVkIGluIHF1aWNrIHN1Y2Nlc3Npb24gKGUuZy4gdHdvIGNvbnNlY3V0aXZlIGNhbGxzIHRvXG4gICAgICAvLyBgTWF0U25hY2tCYXIub3BlbmApLlxuICAgICAgdGhpcy5fYW5pbWF0aW9uU3RhdGUgPSAnaGlkZGVuJztcbiAgICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpO1xuXG4gICAgICAvLyBNYXJrIHRoaXMgZWxlbWVudCB3aXRoIGFuICdleGl0JyBhdHRyaWJ1dGUgdG8gaW5kaWNhdGUgdGhhdCB0aGUgc25hY2tiYXIgaGFzXG4gICAgICAvLyBiZWVuIGRpc21pc3NlZCBhbmQgd2lsbCBzb29uIGJlIHJlbW92ZWQgZnJvbSB0aGUgRE9NLiBUaGlzIGlzIHVzZWQgYnkgdGhlIHNuYWNrYmFyXG4gICAgICAvLyB0ZXN0IGhhcm5lc3MuXG4gICAgICB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuc2V0QXR0cmlidXRlKCdtYXQtZXhpdCcsICcnKTtcblxuICAgICAgLy8gSWYgdGhlIHNuYWNrIGJhciBoYXNuJ3QgYmVlbiBhbm5vdW5jZWQgYnkgdGhlIHRpbWUgaXQgZXhpdHMgaXQgd291bGRuJ3QgaGF2ZSBiZWVuIG9wZW5cbiAgICAgIC8vIGxvbmcgZW5vdWdoIHRvIHZpc3VhbGx5IHJlYWQgaXQgZWl0aGVyLCBzbyBjbGVhciB0aGUgdGltZW91dCBmb3IgYW5ub3VuY2luZy5cbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9hbm5vdW5jZVRpbWVvdXRJZCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcy5fb25FeGl0O1xuICB9XG5cbiAgLyoqIE1ha2VzIHN1cmUgdGhlIGV4aXQgY2FsbGJhY2tzIGhhdmUgYmVlbiBpbnZva2VkIHdoZW4gdGhlIGVsZW1lbnQgaXMgZGVzdHJveWVkLiAqL1xuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLl9kZXN0cm95ZWQgPSB0cnVlO1xuICAgIHRoaXMuX2NsZWFyRnJvbU1vZGFscygpO1xuICAgIHRoaXMuX2NvbXBsZXRlRXhpdCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgdGhlIGVsZW1lbnQgaW4gYSBtaWNyb3Rhc2suIEhlbHBzIHByZXZlbnQgZXJyb3JzIHdoZXJlIHdlIGVuZCB1cFxuICAgKiByZW1vdmluZyBhbiBlbGVtZW50IHdoaWNoIGlzIGluIHRoZSBtaWRkbGUgb2YgYW4gYW5pbWF0aW9uLlxuICAgKi9cbiAgcHJpdmF0ZSBfY29tcGxldGVFeGl0KCkge1xuICAgIHF1ZXVlTWljcm90YXNrKCgpID0+IHtcbiAgICAgIHRoaXMuX29uRXhpdC5uZXh0KCk7XG4gICAgICB0aGlzLl9vbkV4aXQuY29tcGxldGUoKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgYWZ0ZXIgdGhlIHBvcnRhbCBjb250ZW50cyBoYXZlIGJlZW4gYXR0YWNoZWQuIENhbiBiZVxuICAgKiB1c2VkIHRvIG1vZGlmeSB0aGUgRE9NIG9uY2UgaXQncyBndWFyYW50ZWVkIHRvIGJlIGluIHBsYWNlLlxuICAgKi9cbiAgcHJpdmF0ZSBfYWZ0ZXJQb3J0YWxBdHRhY2hlZCgpIHtcbiAgICBjb25zdCBlbGVtZW50OiBIVE1MRWxlbWVudCA9IHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudDtcbiAgICBjb25zdCBwYW5lbENsYXNzZXMgPSB0aGlzLnNuYWNrQmFyQ29uZmlnLnBhbmVsQ2xhc3M7XG5cbiAgICBpZiAocGFuZWxDbGFzc2VzKSB7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShwYW5lbENsYXNzZXMpKSB7XG4gICAgICAgIC8vIE5vdGUgdGhhdCB3ZSBjYW4ndCB1c2UgYSBzcHJlYWQgaGVyZSwgYmVjYXVzZSBJRSBkb2Vzbid0IHN1cHBvcnQgbXVsdGlwbGUgYXJndW1lbnRzLlxuICAgICAgICBwYW5lbENsYXNzZXMuZm9yRWFjaChjc3NDbGFzcyA9PiBlbGVtZW50LmNsYXNzTGlzdC5hZGQoY3NzQ2xhc3MpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChwYW5lbENsYXNzZXMpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuX2V4cG9zZVRvTW9kYWxzKCk7XG5cbiAgICAvLyBDaGVjayB0byBzZWUgaWYgdGhlIGF0dGFjaGVkIGNvbXBvbmVudCBvciB0ZW1wbGF0ZSB1c2VzIHRoZSBNREMgdGVtcGxhdGUgc3RydWN0dXJlLFxuICAgIC8vIHNwZWNpZmljYWxseSB0aGUgTURDIGxhYmVsLiBJZiBub3QsIHRoZSBjb250YWluZXIgc2hvdWxkIGFwcGx5IHRoZSBNREMgbGFiZWwgY2xhc3MgdG8gdGhpc1xuICAgIC8vIGNvbXBvbmVudCdzIGxhYmVsIGNvbnRhaW5lciwgd2hpY2ggd2lsbCBhcHBseSBNREMncyBsYWJlbCBzdHlsZXMgdG8gdGhlIGF0dGFjaGVkIHZpZXcuXG4gICAgY29uc3QgbGFiZWwgPSB0aGlzLl9sYWJlbC5uYXRpdmVFbGVtZW50O1xuICAgIGNvbnN0IGxhYmVsQ2xhc3MgPSAnbWRjLXNuYWNrYmFyX19sYWJlbCc7XG4gICAgbGFiZWwuY2xhc3NMaXN0LnRvZ2dsZShsYWJlbENsYXNzLCAhbGFiZWwucXVlcnlTZWxlY3RvcihgLiR7bGFiZWxDbGFzc31gKSk7XG4gIH1cblxuICAvKipcbiAgICogU29tZSBicm93c2VycyB3b24ndCBleHBvc2UgdGhlIGFjY2Vzc2liaWxpdHkgbm9kZSBvZiB0aGUgbGl2ZSBlbGVtZW50IGlmIHRoZXJlIGlzIGFuXG4gICAqIGBhcmlhLW1vZGFsYCBhbmQgdGhlIGxpdmUgZWxlbWVudCBpcyBvdXRzaWRlIG9mIGl0LiBUaGlzIG1ldGhvZCB3b3JrcyBhcm91bmQgdGhlIGlzc3VlIGJ5XG4gICAqIHBvaW50aW5nIHRoZSBgYXJpYS1vd25zYCBvZiBhbGwgbW9kYWxzIHRvIHRoZSBsaXZlIGVsZW1lbnQuXG4gICAqL1xuICBwcml2YXRlIF9leHBvc2VUb01vZGFscygpIHtcbiAgICAvLyBUT0RPKGh0dHA6Ly9naXRodWIuY29tL2FuZ3VsYXIvY29tcG9uZW50cy9pc3N1ZXMvMjY4NTMpOiBjb25zaWRlciBkZS1kdXBsaWNhdGluZyB0aGlzIHdpdGggdGhlXG4gICAgLy8gYExpdmVBbm5vdW5jZXJgIGFuZCBhbnkgb3RoZXIgdXNhZ2VzLlxuICAgIC8vXG4gICAgLy8gTm90ZSB0aGF0IHRoZSBzZWxlY3RvciBoZXJlIGlzIGxpbWl0ZWQgdG8gQ0RLIG92ZXJsYXlzIGF0IHRoZSBtb21lbnQgaW4gb3JkZXIgdG8gcmVkdWNlIHRoZVxuICAgIC8vIHNlY3Rpb24gb2YgdGhlIERPTSB3ZSBuZWVkIHRvIGxvb2sgdGhyb3VnaC4gVGhpcyBzaG91bGQgY292ZXIgYWxsIHRoZSBjYXNlcyB3ZSBzdXBwb3J0LCBidXRcbiAgICAvLyB0aGUgc2VsZWN0b3IgY2FuIGJlIGV4cGFuZGVkIGlmIGl0IHR1cm5zIG91dCB0byBiZSB0b28gbmFycm93LlxuICAgIGNvbnN0IGlkID0gdGhpcy5fbGl2ZUVsZW1lbnRJZDtcbiAgICBjb25zdCBtb2RhbHMgPSB0aGlzLl9kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgJ2JvZHkgPiAuY2RrLW92ZXJsYXktY29udGFpbmVyIFthcmlhLW1vZGFsPVwidHJ1ZVwiXScsXG4gICAgKTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbW9kYWxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBtb2RhbCA9IG1vZGFsc1tpXTtcbiAgICAgIGNvbnN0IGFyaWFPd25zID0gbW9kYWwuZ2V0QXR0cmlidXRlKCdhcmlhLW93bnMnKTtcbiAgICAgIHRoaXMuX3RyYWNrZWRNb2RhbHMuYWRkKG1vZGFsKTtcblxuICAgICAgaWYgKCFhcmlhT3ducykge1xuICAgICAgICBtb2RhbC5zZXRBdHRyaWJ1dGUoJ2FyaWEtb3ducycsIGlkKTtcbiAgICAgIH0gZWxzZSBpZiAoYXJpYU93bnMuaW5kZXhPZihpZCkgPT09IC0xKSB7XG4gICAgICAgIG1vZGFsLnNldEF0dHJpYnV0ZSgnYXJpYS1vd25zJywgYXJpYU93bnMgKyAnICcgKyBpZCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqIENsZWFycyB0aGUgcmVmZXJlbmNlcyB0byB0aGUgbGl2ZSBlbGVtZW50IGZyb20gYW55IG1vZGFscyBpdCB3YXMgYWRkZWQgdG8uICovXG4gIHByaXZhdGUgX2NsZWFyRnJvbU1vZGFscygpIHtcbiAgICB0aGlzLl90cmFja2VkTW9kYWxzLmZvckVhY2gobW9kYWwgPT4ge1xuICAgICAgY29uc3QgYXJpYU93bnMgPSBtb2RhbC5nZXRBdHRyaWJ1dGUoJ2FyaWEtb3ducycpO1xuXG4gICAgICBpZiAoYXJpYU93bnMpIHtcbiAgICAgICAgY29uc3QgbmV3VmFsdWUgPSBhcmlhT3ducy5yZXBsYWNlKHRoaXMuX2xpdmVFbGVtZW50SWQsICcnKS50cmltKCk7XG5cbiAgICAgICAgaWYgKG5ld1ZhbHVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBtb2RhbC5zZXRBdHRyaWJ1dGUoJ2FyaWEtb3ducycsIG5ld1ZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBtb2RhbC5yZW1vdmVBdHRyaWJ1dGUoJ2FyaWEtb3ducycpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgdGhpcy5fdHJhY2tlZE1vZGFscy5jbGVhcigpO1xuICB9XG5cbiAgLyoqIEFzc2VydHMgdGhhdCBubyBjb250ZW50IGlzIGFscmVhZHkgYXR0YWNoZWQgdG8gdGhlIGNvbnRhaW5lci4gKi9cbiAgcHJpdmF0ZSBfYXNzZXJ0Tm90QXR0YWNoZWQoKSB7XG4gICAgaWYgKHRoaXMuX3BvcnRhbE91dGxldC5oYXNBdHRhY2hlZCgpICYmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpKSB7XG4gICAgICB0aHJvdyBFcnJvcignQXR0ZW1wdGluZyB0byBhdHRhY2ggc25hY2sgYmFyIGNvbnRlbnQgYWZ0ZXIgY29udGVudCBpcyBhbHJlYWR5IGF0dGFjaGVkJyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0cyBhIHRpbWVvdXQgdG8gbW92ZSB0aGUgc25hY2sgYmFyIGNvbnRlbnQgdG8gdGhlIGxpdmUgcmVnaW9uIHNvIHNjcmVlbiByZWFkZXJzIHdpbGxcbiAgICogYW5ub3VuY2UgaXQuXG4gICAqL1xuICBwcml2YXRlIF9zY3JlZW5SZWFkZXJBbm5vdW5jZSgpIHtcbiAgICBpZiAoIXRoaXMuX2Fubm91bmNlVGltZW91dElkKSB7XG4gICAgICB0aGlzLl9uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgICB0aGlzLl9hbm5vdW5jZVRpbWVvdXRJZCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IGluZXJ0RWxlbWVudCA9IHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCdbYXJpYS1oaWRkZW5dJyk7XG4gICAgICAgICAgY29uc3QgbGl2ZUVsZW1lbnQgPSB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQucXVlcnlTZWxlY3RvcignW2FyaWEtbGl2ZV0nKTtcblxuICAgICAgICAgIGlmIChpbmVydEVsZW1lbnQgJiYgbGl2ZUVsZW1lbnQpIHtcbiAgICAgICAgICAgIC8vIElmIGFuIGVsZW1lbnQgaW4gdGhlIHNuYWNrIGJhciBjb250ZW50IGlzIGZvY3VzZWQgYmVmb3JlIGJlaW5nIG1vdmVkXG4gICAgICAgICAgICAvLyB0cmFjayBpdCBhbmQgcmVzdG9yZSBmb2N1cyBhZnRlciBtb3ZpbmcgdG8gdGhlIGxpdmUgcmVnaW9uLlxuICAgICAgICAgICAgbGV0IGZvY3VzZWRFbGVtZW50OiBIVE1MRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICB0aGlzLl9wbGF0Zm9ybS5pc0Jyb3dzZXIgJiZcbiAgICAgICAgICAgICAgZG9jdW1lbnQuYWN0aXZlRWxlbWVudCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50ICYmXG4gICAgICAgICAgICAgIGluZXJ0RWxlbWVudC5jb250YWlucyhkb2N1bWVudC5hY3RpdmVFbGVtZW50KVxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgIGZvY3VzZWRFbGVtZW50ID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaW5lcnRFbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nKTtcbiAgICAgICAgICAgIGxpdmVFbGVtZW50LmFwcGVuZENoaWxkKGluZXJ0RWxlbWVudCk7XG4gICAgICAgICAgICBmb2N1c2VkRWxlbWVudD8uZm9jdXMoKTtcblxuICAgICAgICAgICAgdGhpcy5fb25Bbm5vdW5jZS5uZXh0KCk7XG4gICAgICAgICAgICB0aGlzLl9vbkFubm91bmNlLmNvbXBsZXRlKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9LCB0aGlzLl9hbm5vdW5jZURlbGF5KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxufVxuIiwiPGRpdiBjbGFzcz1cIm1kYy1zbmFja2Jhcl9fc3VyZmFjZVwiPlxuICA8IS0tXG4gICAgVGhpcyBvdXRlciBsYWJlbCB3cmFwcGVyIHdpbGwgaGF2ZSB0aGUgY2xhc3MgYG1kYy1zbmFja2Jhcl9fbGFiZWxgIGFwcGxpZWQgaWZcbiAgICB0aGUgYXR0YWNoZWQgdGVtcGxhdGUvY29tcG9uZW50IGRvZXMgbm90IGNvbnRhaW4gaXQuXG4gIC0tPlxuICA8ZGl2IGNsYXNzPVwibWF0LW1kYy1zbmFjay1iYXItbGFiZWxcIiAjbGFiZWw+XG4gICAgPCEtLSBJbml0aWFseSBob2xkcyB0aGUgc25hY2sgYmFyIGNvbnRlbnQsIHdpbGwgYmUgZW1wdHkgYWZ0ZXIgYW5ub3VuY2luZyB0byBzY3JlZW4gcmVhZGVycy4gLS0+XG4gICAgPGRpdiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgIDxuZy10ZW1wbGF0ZSBjZGtQb3J0YWxPdXRsZXQgLz5cbiAgICA8L2Rpdj5cblxuICAgIDwhLS0gV2lsbCByZWNlaXZlIHRoZSBzbmFjayBiYXIgY29udGVudCBmcm9tIHRoZSBub24tbGl2ZSBkaXYsIG1vdmUgd2lsbCBoYXBwZW4gYSBzaG9ydCBkZWxheSBhZnRlciBvcGVuaW5nIC0tPlxuICAgIDxkaXYgW2F0dHIuYXJpYS1saXZlXT1cIl9saXZlXCIgW2F0dHIucm9sZV09XCJfcm9sZVwiIFthdHRyLmlkXT1cIl9saXZlRWxlbWVudElkXCI+PC9kaXY+XG4gIDwvZGl2PlxuPC9kaXY+XG4iXX0=