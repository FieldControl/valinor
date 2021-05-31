/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Overlay, OverlayConfig } from '@angular/cdk/overlay';
import { ComponentPortal, TemplatePortal } from '@angular/cdk/portal';
import { Inject, Injectable, InjectionToken, Injector, Optional, SkipSelf, TemplateRef, } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { SimpleSnackBar } from './simple-snack-bar';
import { MAT_SNACK_BAR_DATA, MatSnackBarConfig } from './snack-bar-config';
import { MatSnackBarContainer } from './snack-bar-container';
import { MatSnackBarModule } from './snack-bar-module';
import { MatSnackBarRef } from './snack-bar-ref';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/overlay";
import * as i2 from "@angular/cdk/a11y";
import * as i3 from "@angular/cdk/layout";
import * as i4 from "./snack-bar-module";
/** Injection token that can be used to specify default snack bar. */
export const MAT_SNACK_BAR_DEFAULT_OPTIONS = new InjectionToken('mat-snack-bar-default-options', {
    providedIn: 'root',
    factory: MAT_SNACK_BAR_DEFAULT_OPTIONS_FACTORY,
});
/** @docs-private */
export function MAT_SNACK_BAR_DEFAULT_OPTIONS_FACTORY() {
    return new MatSnackBarConfig();
}
/**
 * Service to dispatch Material Design snack bar messages.
 */
export class MatSnackBar {
    constructor(_overlay, _live, _injector, _breakpointObserver, _parentSnackBar, _defaultConfig) {
        this._overlay = _overlay;
        this._live = _live;
        this._injector = _injector;
        this._breakpointObserver = _breakpointObserver;
        this._parentSnackBar = _parentSnackBar;
        this._defaultConfig = _defaultConfig;
        /**
         * Reference to the current snack bar in the view *at this level* (in the Angular injector tree).
         * If there is a parent snack-bar service, all operations should delegate to that parent
         * via `_openedSnackBarRef`.
         */
        this._snackBarRefAtThisLevel = null;
        /** The component that should be rendered as the snack bar's simple component. */
        this.simpleSnackBarComponent = SimpleSnackBar;
        /** The container component that attaches the provided template or component. */
        this.snackBarContainerComponent = MatSnackBarContainer;
        /** The CSS class to apply for handset mode. */
        this.handsetCssClass = 'mat-snack-bar-handset';
    }
    /** Reference to the currently opened snackbar at *any* level. */
    get _openedSnackBarRef() {
        const parent = this._parentSnackBar;
        return parent ? parent._openedSnackBarRef : this._snackBarRefAtThisLevel;
    }
    set _openedSnackBarRef(value) {
        if (this._parentSnackBar) {
            this._parentSnackBar._openedSnackBarRef = value;
        }
        else {
            this._snackBarRefAtThisLevel = value;
        }
    }
    /**
     * Creates and dispatches a snack bar with a custom component for the content, removing any
     * currently opened snack bars.
     *
     * @param component Component to be instantiated.
     * @param config Extra configuration for the snack bar.
     */
    openFromComponent(component, config) {
        return this._attach(component, config);
    }
    /**
     * Creates and dispatches a snack bar with a custom template for the content, removing any
     * currently opened snack bars.
     *
     * @param template Template to be instantiated.
     * @param config Extra configuration for the snack bar.
     */
    openFromTemplate(template, config) {
        return this._attach(template, config);
    }
    /**
     * Opens a snackbar with a message and an optional action.
     * @param message The message to show in the snackbar.
     * @param action The label for the snackbar action.
     * @param config Additional configuration options for the snackbar.
     */
    open(message, action = '', config) {
        const _config = Object.assign(Object.assign({}, this._defaultConfig), config);
        // Since the user doesn't have access to the component, we can
        // override the data to pass in our own message and action.
        _config.data = { message, action };
        // Since the snack bar has `role="alert"`, we don't
        // want to announce the same message twice.
        if (_config.announcementMessage === message) {
            _config.announcementMessage = undefined;
        }
        return this.openFromComponent(this.simpleSnackBarComponent, _config);
    }
    /**
     * Dismisses the currently-visible snack bar.
     */
    dismiss() {
        if (this._openedSnackBarRef) {
            this._openedSnackBarRef.dismiss();
        }
    }
    ngOnDestroy() {
        // Only dismiss the snack bar at the current level on destroy.
        if (this._snackBarRefAtThisLevel) {
            this._snackBarRefAtThisLevel.dismiss();
        }
    }
    /**
     * Attaches the snack bar container component to the overlay.
     */
    _attachSnackBarContainer(overlayRef, config) {
        const userInjector = config && config.viewContainerRef && config.viewContainerRef.injector;
        const injector = Injector.create({
            parent: userInjector || this._injector,
            providers: [{ provide: MatSnackBarConfig, useValue: config }]
        });
        const containerPortal = new ComponentPortal(this.snackBarContainerComponent, config.viewContainerRef, injector);
        const containerRef = overlayRef.attach(containerPortal);
        containerRef.instance.snackBarConfig = config;
        return containerRef.instance;
    }
    /**
     * Places a new component or a template as the content of the snack bar container.
     */
    _attach(content, userConfig) {
        const config = Object.assign(Object.assign(Object.assign({}, new MatSnackBarConfig()), this._defaultConfig), userConfig);
        const overlayRef = this._createOverlay(config);
        const container = this._attachSnackBarContainer(overlayRef, config);
        const snackBarRef = new MatSnackBarRef(container, overlayRef);
        if (content instanceof TemplateRef) {
            const portal = new TemplatePortal(content, null, {
                $implicit: config.data,
                snackBarRef
            });
            snackBarRef.instance = container.attachTemplatePortal(portal);
        }
        else {
            const injector = this._createInjector(config, snackBarRef);
            const portal = new ComponentPortal(content, undefined, injector);
            const contentRef = container.attachComponentPortal(portal);
            // We can't pass this via the injector, because the injector is created earlier.
            snackBarRef.instance = contentRef.instance;
        }
        // Subscribe to the breakpoint observer and attach the mat-snack-bar-handset class as
        // appropriate. This class is applied to the overlay element because the overlay must expand to
        // fill the width of the screen for full width snackbars.
        this._breakpointObserver.observe(Breakpoints.HandsetPortrait).pipe(takeUntil(overlayRef.detachments())).subscribe(state => {
            const classList = overlayRef.overlayElement.classList;
            state.matches ? classList.add(this.handsetCssClass) : classList.remove(this.handsetCssClass);
        });
        if (config.announcementMessage) {
            // Wait until the snack bar contents have been announced then deliver this message.
            container._onAnnounce.subscribe(() => {
                this._live.announce(config.announcementMessage, config.politeness);
            });
        }
        this._animateSnackBar(snackBarRef, config);
        this._openedSnackBarRef = snackBarRef;
        return this._openedSnackBarRef;
    }
    /** Animates the old snack bar out and the new one in. */
    _animateSnackBar(snackBarRef, config) {
        // When the snackbar is dismissed, clear the reference to it.
        snackBarRef.afterDismissed().subscribe(() => {
            // Clear the snackbar ref if it hasn't already been replaced by a newer snackbar.
            if (this._openedSnackBarRef == snackBarRef) {
                this._openedSnackBarRef = null;
            }
            if (config.announcementMessage) {
                this._live.clear();
            }
        });
        if (this._openedSnackBarRef) {
            // If a snack bar is already in view, dismiss it and enter the
            // new snack bar after exit animation is complete.
            this._openedSnackBarRef.afterDismissed().subscribe(() => {
                snackBarRef.containerInstance.enter();
            });
            this._openedSnackBarRef.dismiss();
        }
        else {
            // If no snack bar is in view, enter the new snack bar.
            snackBarRef.containerInstance.enter();
        }
        // If a dismiss timeout is provided, set up dismiss based on after the snackbar is opened.
        if (config.duration && config.duration > 0) {
            snackBarRef.afterOpened().subscribe(() => snackBarRef._dismissAfter(config.duration));
        }
    }
    /**
     * Creates a new overlay and places it in the correct location.
     * @param config The user-specified snack bar config.
     */
    _createOverlay(config) {
        const overlayConfig = new OverlayConfig();
        overlayConfig.direction = config.direction;
        let positionStrategy = this._overlay.position().global();
        // Set horizontal position.
        const isRtl = config.direction === 'rtl';
        const isLeft = (config.horizontalPosition === 'left' ||
            (config.horizontalPosition === 'start' && !isRtl) ||
            (config.horizontalPosition === 'end' && isRtl));
        const isRight = !isLeft && config.horizontalPosition !== 'center';
        if (isLeft) {
            positionStrategy.left('0');
        }
        else if (isRight) {
            positionStrategy.right('0');
        }
        else {
            positionStrategy.centerHorizontally();
        }
        // Set horizontal position.
        if (config.verticalPosition === 'top') {
            positionStrategy.top('0');
        }
        else {
            positionStrategy.bottom('0');
        }
        overlayConfig.positionStrategy = positionStrategy;
        return this._overlay.create(overlayConfig);
    }
    /**
     * Creates an injector to be used inside of a snack bar component.
     * @param config Config that was used to create the snack bar.
     * @param snackBarRef Reference to the snack bar.
     */
    _createInjector(config, snackBarRef) {
        const userInjector = config && config.viewContainerRef && config.viewContainerRef.injector;
        return Injector.create({
            parent: userInjector || this._injector,
            providers: [
                { provide: MatSnackBarRef, useValue: snackBarRef },
                { provide: MAT_SNACK_BAR_DATA, useValue: config.data }
            ]
        });
    }
}
MatSnackBar.ɵprov = i0.ɵɵdefineInjectable({ factory: function MatSnackBar_Factory() { return new MatSnackBar(i0.ɵɵinject(i1.Overlay), i0.ɵɵinject(i2.LiveAnnouncer), i0.ɵɵinject(i0.INJECTOR), i0.ɵɵinject(i3.BreakpointObserver), i0.ɵɵinject(MatSnackBar, 12), i0.ɵɵinject(MAT_SNACK_BAR_DEFAULT_OPTIONS)); }, token: MatSnackBar, providedIn: i4.MatSnackBarModule });
MatSnackBar.decorators = [
    { type: Injectable, args: [{ providedIn: MatSnackBarModule },] }
];
MatSnackBar.ctorParameters = () => [
    { type: Overlay },
    { type: LiveAnnouncer },
    { type: Injector },
    { type: BreakpointObserver },
    { type: MatSnackBar, decorators: [{ type: Optional }, { type: SkipSelf }] },
    { type: MatSnackBarConfig, decorators: [{ type: Inject, args: [MAT_SNACK_BAR_DEFAULT_OPTIONS,] }] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic25hY2stYmFyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL3NuYWNrLWJhci9zbmFjay1iYXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ2hELE9BQU8sRUFBQyxrQkFBa0IsRUFBRSxXQUFXLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUNwRSxPQUFPLEVBQUMsT0FBTyxFQUFFLGFBQWEsRUFBYSxNQUFNLHNCQUFzQixDQUFDO0FBQ3hFLE9BQU8sRUFBQyxlQUFlLEVBQWlCLGNBQWMsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ25GLE9BQU8sRUFHTCxNQUFNLEVBQ04sVUFBVSxFQUNWLGNBQWMsRUFDZCxRQUFRLEVBQ1IsUUFBUSxFQUNSLFFBQVEsRUFDUixXQUFXLEdBRVosTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQ3pDLE9BQU8sRUFBbUIsY0FBYyxFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFDcEUsT0FBTyxFQUFDLGtCQUFrQixFQUFFLGlCQUFpQixFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFDekUsT0FBTyxFQUFDLG9CQUFvQixFQUFxQixNQUFNLHVCQUF1QixDQUFDO0FBQy9FLE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBQ3JELE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQzs7Ozs7O0FBRy9DLHFFQUFxRTtBQUNyRSxNQUFNLENBQUMsTUFBTSw2QkFBNkIsR0FDdEMsSUFBSSxjQUFjLENBQW9CLCtCQUErQixFQUFFO0lBQ3JFLFVBQVUsRUFBRSxNQUFNO0lBQ2xCLE9BQU8sRUFBRSxxQ0FBcUM7Q0FDL0MsQ0FBQyxDQUFDO0FBRVAsb0JBQW9CO0FBQ3BCLE1B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QzlCO1FBRUQsYUFBYSxDQUFDLGdCQUFnQixHQUFHLGdCQUFnQixDQUFDO1FBQ2xELE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUVEOzs7O09BSUc7SUFDSyxlQUFlLENBQUksTUFBeUIsRUFBRSxXQUE4QjtRQUNsRixNQUFNLFlBQVksR0FBRyxNQUFNLElBQUksTUFBTSxDQUFDLGdCQUFnQixJQUFJLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUM7UUFFM0YsT0FBTyxRQUFRLENBQUMsTUFBTSxDQUFDO1lBQ3JCLE1BQU0sRUFBRSxZQUFZLElBQUksSUFBSSxDQUFDLFNBQVM7WUFDdEMsU0FBUyxFQUFFO2dCQUNULEVBQUMsT0FBTyxFQUFFLGNBQWMsRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFDO2dCQUNoRCxFQUFDLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxRQUFRLEVBQUUsTUFBTSxDQUFDLElBQUksRUFBQzthQUNyRDtTQUNGLENBQUMsQ0FBQztJQUNMLENBQUM7Ozs7WUE3UEYsVUFBVSxTQUFDLEVBQUMsVUFBVSxFQUFFLGlCQUFpQixFQUFDOzs7WUFyQ25DLE9BQU87WUFGUCxhQUFhO1lBVW5CLFFBQVE7WUFURixrQkFBa0I7WUEyRTZCLFdBQVcsdUJBQTNELFFBQVEsWUFBSSxRQUFRO1lBMURDLGlCQUFpQix1QkEyRHRDLE1BQU0sU0FBQyw2QkFBNkIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtMaXZlQW5ub3VuY2VyfSBmcm9tICdAYW5ndWxhci9jZGsvYTExeSc7XG5pbXBvcnQge0JyZWFrcG9pbnRPYnNlcnZlciwgQnJlYWtwb2ludHN9IGZyb20gJ0Bhbmd1bGFyL2Nkay9sYXlvdXQnO1xuaW1wb3J0IHtPdmVybGF5LCBPdmVybGF5Q29uZmlnLCBPdmVybGF5UmVmfSBmcm9tICdAYW5ndWxhci9jZGsvb3ZlcmxheSc7XG5pbXBvcnQge0NvbXBvbmVudFBvcnRhbCwgQ29tcG9uZW50VHlwZSwgVGVtcGxhdGVQb3J0YWx9IGZyb20gJ0Bhbmd1bGFyL2Nkay9wb3J0YWwnO1xuaW1wb3J0IHtcbiAgQ29tcG9uZW50UmVmLFxuICBFbWJlZGRlZFZpZXdSZWYsXG4gIEluamVjdCxcbiAgSW5qZWN0YWJsZSxcbiAgSW5qZWN0aW9uVG9rZW4sXG4gIEluamVjdG9yLFxuICBPcHRpb25hbCxcbiAgU2tpcFNlbGYsXG4gIFRlbXBsYXRlUmVmLFxuICBPbkRlc3Ryb3ksIFR5cGUsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHt0YWtlVW50aWx9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7VGV4dE9ubHlTbmFja0JhciwgU2ltcGxlU25hY2tCYXJ9IGZyb20gJy4vc2ltcGxlLXNuYWNrLWJhcic7XG5pbXBvcnQge01BVF9TTkFDS19CQVJfREFUQSwgTWF0U25hY2tCYXJDb25maWd9IGZyb20gJy4vc25hY2stYmFyLWNvbmZpZyc7XG5pbXBvcnQge01hdFNuYWNrQmFyQ29udGFpbmVyLCBfU25hY2tCYXJDb250YWluZXJ9IGZyb20gJy4vc25hY2stYmFyLWNvbnRhaW5lcic7XG5pbXBvcnQge01hdFNuYWNrQmFyTW9kdWxlfSBmcm9tICcuL3NuYWNrLWJhci1tb2R1bGUnO1xuaW1wb3J0IHtNYXRTbmFja0JhclJlZn0gZnJvbSAnLi9zbmFjay1iYXItcmVmJztcblxuXG4vKiogSW5qZWN0aW9uIHRva2VuIHRoYXQgY2FuIGJlIHVzZWQgdG8gc3BlY2lmeSBkZWZhdWx0IHNuYWNrIGJhci4gKi9cbmV4cG9ydCBjb25zdCBNQVRfU05BQ0tfQkFSX0RFRkFVTFRfT1BUSU9OUyA9XG4gICAgbmV3IEluamVjdGlvblRva2VuPE1hdFNuYWNrQmFyQ29uZmlnPignbWF0LXNuYWNrLWJhci1kZWZhdWx0LW9wdGlvbnMnLCB7XG4gICAgICBwcm92aWRlZEluOiAncm9vdCcsXG4gICAgICBmYWN0b3J5OiBNQVRfU05BQ0tfQkFSX0RFRkFVTFRfT1BUSU9OU19GQUNUT1JZLFxuICAgIH0pO1xuXG4vKiogQGRvY3MtcHJpdmF0ZSAqL1xuZXhwb3J0IGZ1bmN0aW9uIE1BVF9TTkFDS19CQVJfREVGQVVMVF9PUFRJT05TX0ZBQ1RPUlkoKTogTWF0U25hY2tCYXJDb25maWcge1xuICByZXR1cm4gbmV3IE1hdFNuYWNrQmFyQ29uZmlnKCk7XG59XG5cbi8qKlxuICogU2VydmljZSB0byBkaXNwYXRjaCBNYXRlcmlhbCBEZXNpZ24gc25hY2sgYmFyIG1lc3NhZ2VzLlxuICovXG5ASW5qZWN0YWJsZSh7cHJvdmlkZWRJbjogTWF0U25hY2tCYXJNb2R1bGV9KVxuZXhwb3J0IGNsYXNzIE1hdFNuYWNrQmFyIGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgLyoqXG4gICAqIFJlZmVyZW5jZSB0byB0aGUgY3VycmVudCBzbmFjayBiYXIgaW4gdGhlIHZpZXcgKmF0IHRoaXMgbGV2ZWwqIChpbiB0aGUgQW5ndWxhciBpbmplY3RvciB0cmVlKS5cbiAgICogSWYgdGhlcmUgaXMgYSBwYXJlbnQgc25hY2stYmFyIHNlcnZpY2UsIGFsbCBvcGVyYXRpb25zIHNob3VsZCBkZWxlZ2F0ZSB0byB0aGF0IHBhcmVudFxuICAgKiB2aWEgYF9vcGVuZWRTbmFja0JhclJlZmAuXG4gICAqL1xuICBwcml2YXRlIF9zbmFja0JhclJlZkF0VGhpc0xldmVsOiBNYXRTbmFja0JhclJlZjxhbnk+IHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqIFRoZSBjb21wb25lbnQgdGhhdCBzaG91bGQgYmUgcmVuZGVyZWQgYXMgdGhlIHNuYWNrIGJhcidzIHNpbXBsZSBjb21wb25lbnQuICovXG4gIHByb3RlY3RlZCBzaW1wbGVTbmFja0JhckNvbXBvbmVudDogVHlwZTxUZXh0T25seVNuYWNrQmFyPiA9IFNpbXBsZVNuYWNrQmFyO1xuXG4gIC8qKiBUaGUgY29udGFpbmVyIGNvbXBvbmVudCB0aGF0IGF0dGFjaGVzIHRoZSBwcm92aWRlZCB0ZW1wbGF0ZSBvciBjb21wb25lbnQuICovXG4gIHByb3RlY3RlZCBzbmFja0JhckNvbnRhaW5lckNvbXBvbmVudDogVHlwZTxfU25hY2tCYXJDb250YWluZXI+ID0gTWF0U25hY2tCYXJDb250YWluZXI7XG5cbiAgLyoqIFRoZSBDU1MgY2xhc3MgdG8gYXBwbHkgZm9yIGhhbmRzZXQgbW9kZS4gKi9cbiAgcHJvdGVjdGVkIGhhbmRzZXRDc3NDbGFzcyA9ICdtYXQtc25hY2stYmFyLWhhbmRzZXQnO1xuXG4gIC8qKiBSZWZlcmVuY2UgdG8gdGhlIGN1cnJlbnRseSBvcGVuZWQgc25hY2tiYXIgYXQgKmFueSogbGV2ZWwuICovXG4gIGdldCBfb3BlbmVkU25hY2tCYXJSZWYoKTogTWF0U25hY2tCYXJSZWY8YW55PiB8IG51bGwge1xuICAgIGNvbnN0IHBhcmVudCA9IHRoaXMuX3BhcmVudFNuYWNrQmFyO1xuICAgIHJldHVybiBwYXJlbnQgPyBwYXJlbnQuX29wZW5lZFNuYWNrQmFyUmVmIDogdGhpcy5fc25hY2tCYXJSZWZBdFRoaXNMZXZlbDtcbiAgfVxuXG4gIHNldCBfb3BlbmVkU25hY2tCYXJSZWYodmFsdWU6IE1hdFNuYWNrQmFyUmVmPGFueT4gfCBudWxsKSB7XG4gICAgaWYgKHRoaXMuX3BhcmVudFNuYWNrQmFyKSB7XG4gICAgICB0aGlzLl9wYXJlbnRTbmFja0Jhci5fb3BlbmVkU25hY2tCYXJSZWYgPSB2YWx1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fc25hY2tCYXJSZWZBdFRoaXNMZXZlbCA9IHZhbHVlO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBfb3ZlcmxheTogT3ZlcmxheSxcbiAgICAgIHByaXZhdGUgX2xpdmU6IExpdmVBbm5vdW5jZXIsXG4gICAgICBwcml2YXRlIF9pbmplY3RvcjogSW5qZWN0b3IsXG4gICAgICBwcml2YXRlIF9icmVha3BvaW50T2JzZXJ2ZXI6IEJyZWFrcG9pbnRPYnNlcnZlcixcbiAgICAgIEBPcHRpb25hbCgpIEBTa2lwU2VsZigpIHByaXZhdGUgX3BhcmVudFNuYWNrQmFyOiBNYXRTbmFja0JhcixcbiAgICAgIEBJbmplY3QoTUFUX1NOQUNLX0JBUl9ERUZBVUxUX09QVElPTlMpIHByaXZhdGUgX2RlZmF1bHRDb25maWc6IE1hdFNuYWNrQmFyQ29uZmlnKSB7fVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuZCBkaXNwYXRjaGVzIGEgc25hY2sgYmFyIHdpdGggYSBjdXN0b20gY29tcG9uZW50IGZvciB0aGUgY29udGVudCwgcmVtb3ZpbmcgYW55XG4gICAqIGN1cnJlbnRseSBvcGVuZWQgc25hY2sgYmFycy5cbiAgICpcbiAgICogQHBhcmFtIGNvbXBvbmVudCBDb21wb25lbnQgdG8gYmUgaW5zdGFudGlhdGVkLlxuICAgKiBAcGFyYW0gY29uZmlnIEV4dHJhIGNvbmZpZ3VyYXRpb24gZm9yIHRoZSBzbmFjayBiYXIuXG4gICAqL1xuICBvcGVuRnJvbUNvbXBvbmVudDxUPihjb21wb25lbnQ6IENvbXBvbmVudFR5cGU8VD4sIGNvbmZpZz86IE1hdFNuYWNrQmFyQ29uZmlnKTpcbiAgICAgIE1hdFNuYWNrQmFyUmVmPFQ+IHtcbiAgICByZXR1cm4gdGhpcy5fYXR0YWNoKGNvbXBvbmVudCwgY29uZmlnKSBhcyBNYXRTbmFja0JhclJlZjxUPjtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuZCBkaXNwYXRjaGVzIGEgc25hY2sgYmFyIHdpdGggYSBjdXN0b20gdGVtcGxhdGUgZm9yIHRoZSBjb250ZW50LCByZW1vdmluZyBhbnlcbiAgICogY3VycmVudGx5IG9wZW5lZCBzbmFjayBiYXJzLlxuICAgKlxuICAgKiBAcGFyYW0gdGVtcGxhdGUgVGVtcGxhdGUgdG8gYmUgaW5zdGFudGlhdGVkLlxuICAgKiBAcGFyYW0gY29uZmlnIEV4dHJhIGNvbmZpZ3VyYXRpb24gZm9yIHRoZSBzbmFjayBiYXIuXG4gICAqL1xuICBvcGVuRnJvbVRlbXBsYXRlKHRlbXBsYXRlOiBUZW1wbGF0ZVJlZjxhbnk+LCBjb25maWc/OiBNYXRTbmFja0JhckNvbmZpZyk6XG4gICAgICBNYXRTbmFja0JhclJlZjxFbWJlZGRlZFZpZXdSZWY8YW55Pj4ge1xuICAgIHJldHVybiB0aGlzLl9hdHRhY2godGVtcGxhdGUsIGNvbmZpZyk7XG4gIH1cblxuICAvKipcbiAgICogT3BlbnMgYSBzbmFja2JhciB3aXRoIGEgbWVzc2FnZSBhbmQgYW4gb3B0aW9uYWwgYWN0aW9uLlxuICAgKiBAcGFyYW0gbWVzc2FnZSBUaGUgbWVzc2FnZSB0byBzaG93IGluIHRoZSBzbmFja2Jhci5cbiAgICogQHBhcmFtIGFjdGlvbiBUaGUgbGFiZWwgZm9yIHRoZSBzbmFja2JhciBhY3Rpb24uXG4gICAqIEBwYXJhbSBjb25maWcgQWRkaXRpb25hbCBjb25maWd1cmF0aW9uIG9wdGlvbnMgZm9yIHRoZSBzbmFja2Jhci5cbiAgICovXG4gIG9wZW4obWVzc2FnZTogc3RyaW5nLCBhY3Rpb246IHN0cmluZyA9ICcnLCBjb25maWc/OiBNYXRTbmFja0JhckNvbmZpZyk6XG4gICAgICBNYXRTbmFja0JhclJlZjxUZXh0T25seVNuYWNrQmFyPiB7XG4gICAgY29uc3QgX2NvbmZpZyA9IHsuLi50aGlzLl9kZWZhdWx0Q29uZmlnLCAuLi5jb25maWd9O1xuXG4gICAgLy8gU2luY2UgdGhlIHVzZXIgZG9lc24ndCBoYXZlIGFjY2VzcyB0byB0aGUgY29tcG9uZW50LCB3ZSBjYW5cbiAgICAvLyBvdmVycmlkZSB0aGUgZGF0YSB0byBwYXNzIGluIG91ciBvd24gbWVzc2FnZSBhbmQgYWN0aW9uLlxuICAgIF9jb25maWcuZGF0YSA9IHttZXNzYWdlLCBhY3Rpb259O1xuXG4gICAgLy8gU2luY2UgdGhlIHNuYWNrIGJhciBoYXMgYHJvbGU9XCJhbGVydFwiYCwgd2UgZG9uJ3RcbiAgICAvLyB3YW50IHRvIGFubm91bmNlIHRoZSBzYW1lIG1lc3NhZ2UgdHdpY2UuXG4gICAgaWYgKF9jb25maWcuYW5ub3VuY2VtZW50TWVzc2FnZSA9PT0gbWVzc2FnZSkge1xuICAgICAgX2NvbmZpZy5hbm5vdW5jZW1lbnRNZXNzYWdlID0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLm9wZW5Gcm9tQ29tcG9uZW50KHRoaXMuc2ltcGxlU25hY2tCYXJDb21wb25lbnQsIF9jb25maWcpO1xuICB9XG5cbiAgLyoqXG4gICAqIERpc21pc3NlcyB0aGUgY3VycmVudGx5LXZpc2libGUgc25hY2sgYmFyLlxuICAgKi9cbiAgZGlzbWlzcygpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fb3BlbmVkU25hY2tCYXJSZWYpIHtcbiAgICAgIHRoaXMuX29wZW5lZFNuYWNrQmFyUmVmLmRpc21pc3MoKTtcbiAgICB9XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICAvLyBPbmx5IGRpc21pc3MgdGhlIHNuYWNrIGJhciBhdCB0aGUgY3VycmVudCBsZXZlbCBvbiBkZXN0cm95LlxuICAgIGlmICh0aGlzLl9zbmFja0JhclJlZkF0VGhpc0xldmVsKSB7XG4gICAgICB0aGlzLl9zbmFja0JhclJlZkF0VGhpc0xldmVsLmRpc21pc3MoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQXR0YWNoZXMgdGhlIHNuYWNrIGJhciBjb250YWluZXIgY29tcG9uZW50IHRvIHRoZSBvdmVybGF5LlxuICAgKi9cbiAgcHJpdmF0ZSBfYXR0YWNoU25hY2tCYXJDb250YWluZXIob3ZlcmxheVJlZjogT3ZlcmxheVJlZixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWc6IE1hdFNuYWNrQmFyQ29uZmlnKTogX1NuYWNrQmFyQ29udGFpbmVyIHtcblxuICAgIGNvbnN0IHVzZXJJbmplY3RvciA9IGNvbmZpZyAmJiBjb25maWcudmlld0NvbnRhaW5lclJlZiAmJiBjb25maWcudmlld0NvbnRhaW5lclJlZi5pbmplY3RvcjtcbiAgICBjb25zdCBpbmplY3RvciA9IEluamVjdG9yLmNyZWF0ZSh7XG4gICAgICBwYXJlbnQ6IHVzZXJJbmplY3RvciB8fCB0aGlzLl9pbmplY3RvcixcbiAgICAgIHByb3ZpZGVyczogW3twcm92aWRlOiBNYXRTbmFja0JhckNvbmZpZywgdXNlVmFsdWU6IGNvbmZpZ31dXG4gICAgfSk7XG5cbiAgICBjb25zdCBjb250YWluZXJQb3J0YWwgPVxuICAgICAgICBuZXcgQ29tcG9uZW50UG9ydGFsKHRoaXMuc25hY2tCYXJDb250YWluZXJDb21wb25lbnQsIGNvbmZpZy52aWV3Q29udGFpbmVyUmVmLCBpbmplY3Rvcik7XG4gICAgY29uc3QgY29udGFpbmVyUmVmOiBDb21wb25lbnRSZWY8X1NuYWNrQmFyQ29udGFpbmVyPiA9XG4gICAgICAgIG92ZXJsYXlSZWYuYXR0YWNoKGNvbnRhaW5lclBvcnRhbCk7XG4gICAgY29udGFpbmVyUmVmLmluc3RhbmNlLnNuYWNrQmFyQ29uZmlnID0gY29uZmlnO1xuICAgIHJldHVybiBjb250YWluZXJSZWYuaW5zdGFuY2U7XG4gIH1cblxuICAvKipcbiAgICogUGxhY2VzIGEgbmV3IGNvbXBvbmVudCBvciBhIHRlbXBsYXRlIGFzIHRoZSBjb250ZW50IG9mIHRoZSBzbmFjayBiYXIgY29udGFpbmVyLlxuICAgKi9cbiAgcHJpdmF0ZSBfYXR0YWNoPFQ+KGNvbnRlbnQ6IENvbXBvbmVudFR5cGU8VD4gfCBUZW1wbGF0ZVJlZjxUPiwgdXNlckNvbmZpZz86IE1hdFNuYWNrQmFyQ29uZmlnKTpcbiAgICAgIE1hdFNuYWNrQmFyUmVmPFQgfCBFbWJlZGRlZFZpZXdSZWY8YW55Pj4ge1xuXG4gICAgY29uc3QgY29uZmlnID0gey4uLm5ldyBNYXRTbmFja0JhckNvbmZpZygpLCAuLi50aGlzLl9kZWZhdWx0Q29uZmlnLCAuLi51c2VyQ29uZmlnfTtcbiAgICBjb25zdCBvdmVybGF5UmVmID0gdGhpcy5fY3JlYXRlT3ZlcmxheShjb25maWcpO1xuICAgIGNvbnN0IGNvbnRhaW5lciA9IHRoaXMuX2F0dGFjaFNuYWNrQmFyQ29udGFpbmVyKG92ZXJsYXlSZWYsIGNvbmZpZyk7XG4gICAgY29uc3Qgc25hY2tCYXJSZWYgPSBuZXcgTWF0U25hY2tCYXJSZWY8VCB8IEVtYmVkZGVkVmlld1JlZjxhbnk+Pihjb250YWluZXIsIG92ZXJsYXlSZWYpO1xuXG4gICAgaWYgKGNvbnRlbnQgaW5zdGFuY2VvZiBUZW1wbGF0ZVJlZikge1xuICAgICAgY29uc3QgcG9ydGFsID0gbmV3IFRlbXBsYXRlUG9ydGFsKGNvbnRlbnQsIG51bGwhLCB7XG4gICAgICAgICRpbXBsaWNpdDogY29uZmlnLmRhdGEsXG4gICAgICAgIHNuYWNrQmFyUmVmXG4gICAgICB9IGFzIGFueSk7XG5cbiAgICAgIHNuYWNrQmFyUmVmLmluc3RhbmNlID0gY29udGFpbmVyLmF0dGFjaFRlbXBsYXRlUG9ydGFsKHBvcnRhbCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGluamVjdG9yID0gdGhpcy5fY3JlYXRlSW5qZWN0b3IoY29uZmlnLCBzbmFja0JhclJlZik7XG4gICAgICBjb25zdCBwb3J0YWwgPSBuZXcgQ29tcG9uZW50UG9ydGFsKGNvbnRlbnQsIHVuZGVmaW5lZCwgaW5qZWN0b3IpO1xuICAgICAgY29uc3QgY29udGVudFJlZiA9IGNvbnRhaW5lci5hdHRhY2hDb21wb25lbnRQb3J0YWw8VD4ocG9ydGFsKTtcblxuICAgICAgLy8gV2UgY2FuJ3QgcGFzcyB0aGlzIHZpYSB0aGUgaW5qZWN0b3IsIGJlY2F1c2UgdGhlIGluamVjdG9yIGlzIGNyZWF0ZWQgZWFybGllci5cbiAgICAgIHNuYWNrQmFyUmVmLmluc3RhbmNlID0gY29udGVudFJlZi5pbnN0YW5jZTtcbiAgICB9XG5cbiAgICAvLyBTdWJzY3JpYmUgdG8gdGhlIGJyZWFrcG9pbnQgb2JzZXJ2ZXIgYW5kIGF0dGFjaCB0aGUgbWF0LXNuYWNrLWJhci1oYW5kc2V0IGNsYXNzIGFzXG4gICAgLy8gYXBwcm9wcmlhdGUuIFRoaXMgY2xhc3MgaXMgYXBwbGllZCB0byB0aGUgb3ZlcmxheSBlbGVtZW50IGJlY2F1c2UgdGhlIG92ZXJsYXkgbXVzdCBleHBhbmQgdG9cbiAgICAvLyBmaWxsIHRoZSB3aWR0aCBvZiB0aGUgc2NyZWVuIGZvciBmdWxsIHdpZHRoIHNuYWNrYmFycy5cbiAgICB0aGlzLl9icmVha3BvaW50T2JzZXJ2ZXIub2JzZXJ2ZShCcmVha3BvaW50cy5IYW5kc2V0UG9ydHJhaXQpLnBpcGUoXG4gICAgICAgIHRha2VVbnRpbChvdmVybGF5UmVmLmRldGFjaG1lbnRzKCkpXG4gICAgKS5zdWJzY3JpYmUoc3RhdGUgPT4ge1xuICAgICAgY29uc3QgY2xhc3NMaXN0ID0gb3ZlcmxheVJlZi5vdmVybGF5RWxlbWVudC5jbGFzc0xpc3Q7XG4gICAgICBzdGF0ZS5tYXRjaGVzID8gY2xhc3NMaXN0LmFkZCh0aGlzLmhhbmRzZXRDc3NDbGFzcykgOiBjbGFzc0xpc3QucmVtb3ZlKHRoaXMuaGFuZHNldENzc0NsYXNzKTtcbiAgICB9KTtcblxuICAgIGlmIChjb25maWcuYW5ub3VuY2VtZW50TWVzc2FnZSkge1xuICAgICAgLy8gV2FpdCB1bnRpbCB0aGUgc25hY2sgYmFyIGNvbnRlbnRzIGhhdmUgYmVlbiBhbm5vdW5jZWQgdGhlbiBkZWxpdmVyIHRoaXMgbWVzc2FnZS5cbiAgICAgIGNvbnRhaW5lci5fb25Bbm5vdW5jZS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICB0aGlzLl9saXZlLmFubm91bmNlKGNvbmZpZy5hbm5vdW5jZW1lbnRNZXNzYWdlISwgY29uZmlnLnBvbGl0ZW5lc3MpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgdGhpcy5fYW5pbWF0ZVNuYWNrQmFyKHNuYWNrQmFyUmVmLCBjb25maWcpO1xuICAgIHRoaXMuX29wZW5lZFNuYWNrQmFyUmVmID0gc25hY2tCYXJSZWY7XG4gICAgcmV0dXJuIHRoaXMuX29wZW5lZFNuYWNrQmFyUmVmO1xuICB9XG5cbiAgLyoqIEFuaW1hdGVzIHRoZSBvbGQgc25hY2sgYmFyIG91dCBhbmQgdGhlIG5ldyBvbmUgaW4uICovXG4gIHByaXZhdGUgX2FuaW1hdGVTbmFja0JhcihzbmFja0JhclJlZjogTWF0U25hY2tCYXJSZWY8YW55PiwgY29uZmlnOiBNYXRTbmFja0JhckNvbmZpZykge1xuICAgIC8vIFdoZW4gdGhlIHNuYWNrYmFyIGlzIGRpc21pc3NlZCwgY2xlYXIgdGhlIHJlZmVyZW5jZSB0byBpdC5cbiAgICBzbmFja0JhclJlZi5hZnRlckRpc21pc3NlZCgpLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAvLyBDbGVhciB0aGUgc25hY2tiYXIgcmVmIGlmIGl0IGhhc24ndCBhbHJlYWR5IGJlZW4gcmVwbGFjZWQgYnkgYSBuZXdlciBzbmFja2Jhci5cbiAgICAgIGlmICh0aGlzLl9vcGVuZWRTbmFja0JhclJlZiA9PSBzbmFja0JhclJlZikge1xuICAgICAgICB0aGlzLl9vcGVuZWRTbmFja0JhclJlZiA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIGlmIChjb25maWcuYW5ub3VuY2VtZW50TWVzc2FnZSkge1xuICAgICAgICB0aGlzLl9saXZlLmNsZWFyKCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAodGhpcy5fb3BlbmVkU25hY2tCYXJSZWYpIHtcbiAgICAgIC8vIElmIGEgc25hY2sgYmFyIGlzIGFscmVhZHkgaW4gdmlldywgZGlzbWlzcyBpdCBhbmQgZW50ZXIgdGhlXG4gICAgICAvLyBuZXcgc25hY2sgYmFyIGFmdGVyIGV4aXQgYW5pbWF0aW9uIGlzIGNvbXBsZXRlLlxuICAgICAgdGhpcy5fb3BlbmVkU25hY2tCYXJSZWYuYWZ0ZXJEaXNtaXNzZWQoKS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICBzbmFja0JhclJlZi5jb250YWluZXJJbnN0YW5jZS5lbnRlcigpO1xuICAgICAgfSk7XG4gICAgICB0aGlzLl9vcGVuZWRTbmFja0JhclJlZi5kaXNtaXNzKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIElmIG5vIHNuYWNrIGJhciBpcyBpbiB2aWV3LCBlbnRlciB0aGUgbmV3IHNuYWNrIGJhci5cbiAgICAgIHNuYWNrQmFyUmVmLmNvbnRhaW5lckluc3RhbmNlLmVudGVyKCk7XG4gICAgfVxuXG4gICAgLy8gSWYgYSBkaXNtaXNzIHRpbWVvdXQgaXMgcHJvdmlkZWQsIHNldCB1cCBkaXNtaXNzIGJhc2VkIG9uIGFmdGVyIHRoZSBzbmFja2JhciBpcyBvcGVuZWQuXG4gICAgaWYgKGNvbmZpZy5kdXJhdGlvbiAmJiBjb25maWcuZHVyYXRpb24gPiAwKSB7XG4gICAgICBzbmFja0JhclJlZi5hZnRlck9wZW5lZCgpLnN1YnNjcmliZSgoKSA9PiBzbmFja0JhclJlZi5fZGlzbWlzc0FmdGVyKGNvbmZpZy5kdXJhdGlvbiEpKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBvdmVybGF5IGFuZCBwbGFjZXMgaXQgaW4gdGhlIGNvcnJlY3QgbG9jYXRpb24uXG4gICAqIEBwYXJhbSBjb25maWcgVGhlIHVzZXItc3BlY2lmaWVkIHNuYWNrIGJhciBjb25maWcuXG4gICAqL1xuICBwcml2YXRlIF9jcmVhdGVPdmVybGF5KGNvbmZpZzogTWF0U25hY2tCYXJDb25maWcpOiBPdmVybGF5UmVmIHtcbiAgICBjb25zdCBvdmVybGF5Q29uZmlnID0gbmV3IE92ZXJsYXlDb25maWcoKTtcbiAgICBvdmVybGF5Q29uZmlnLmRpcmVjdGlvbiA9IGNvbmZpZy5kaXJlY3Rpb247XG5cbiAgICBsZXQgcG9zaXRpb25TdHJhdGVneSA9IHRoaXMuX292ZXJsYXkucG9zaXRpb24oKS5nbG9iYWwoKTtcbiAgICAvLyBTZXQgaG9yaXpvbnRhbCBwb3NpdGlvbi5cbiAgICBjb25zdCBpc1J0bCA9IGNvbmZpZy5kaXJlY3Rpb24gPT09ICdydGwnO1xuICAgIGNvbnN0IGlzTGVmdCA9IChcbiAgICAgICAgY29uZmlnLmhvcml6b250YWxQb3NpdGlvbiA9PT0gJ2xlZnQnIHx8XG4gICAgICAgIChjb25maWcuaG9yaXpvbnRhbFBvc2l0aW9uID09PSAnc3RhcnQnICYmICFpc1J0bCkgfHxcbiAgICAgICAgKGNvbmZpZy5ob3Jpem9udGFsUG9zaXRpb24gPT09ICdlbmQnICYmIGlzUnRsKSk7XG4gICAgY29uc3QgaXNSaWdodCA9ICFpc0xlZnQgJiYgY29uZmlnLmhvcml6b250YWxQb3NpdGlvbiAhPT0gJ2NlbnRlcic7XG4gICAgaWYgKGlzTGVmdCkge1xuICAgICAgcG9zaXRpb25TdHJhdGVneS5sZWZ0KCcwJyk7XG4gICAgfSBlbHNlIGlmIChpc1JpZ2h0KSB7XG4gICAgICBwb3NpdGlvblN0cmF0ZWd5LnJpZ2h0KCcwJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBvc2l0aW9uU3RyYXRlZ3kuY2VudGVySG9yaXpvbnRhbGx5KCk7XG4gICAgfVxuICAgIC8vIFNldCBob3Jpem9udGFsIHBvc2l0aW9uLlxuICAgIGlmIChjb25maWcudmVydGljYWxQb3NpdGlvbiA9PT0gJ3RvcCcpIHtcbiAgICAgIHBvc2l0aW9uU3RyYXRlZ3kudG9wKCcwJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBvc2l0aW9uU3RyYXRlZ3kuYm90dG9tKCcwJyk7XG4gICAgfVxuXG4gICAgb3ZlcmxheUNvbmZpZy5wb3NpdGlvblN0cmF0ZWd5ID0gcG9zaXRpb25TdHJhdGVneTtcbiAgICByZXR1cm4gdGhpcy5fb3ZlcmxheS5jcmVhdGUob3ZlcmxheUNvbmZpZyk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhbiBpbmplY3RvciB0byBiZSB1c2VkIGluc2lkZSBvZiBhIHNuYWNrIGJhciBjb21wb25lbnQuXG4gICAqIEBwYXJhbSBjb25maWcgQ29uZmlnIHRoYXQgd2FzIHVzZWQgdG8gY3JlYXRlIHRoZSBzbmFjayBiYXIuXG4gICAqIEBwYXJhbSBzbmFja0JhclJlZiBSZWZlcmVuY2UgdG8gdGhlIHNuYWNrIGJhci5cbiAgICovXG4gIHByaXZhdGUgX2NyZWF0ZUluamVjdG9yPFQ+KGNvbmZpZzogTWF0U25hY2tCYXJDb25maWcsIHNuYWNrQmFyUmVmOiBNYXRTbmFja0JhclJlZjxUPik6IEluamVjdG9yIHtcbiAgICBjb25zdCB1c2VySW5qZWN0b3IgPSBjb25maWcgJiYgY29uZmlnLnZpZXdDb250YWluZXJSZWYgJiYgY29uZmlnLnZpZXdDb250YWluZXJSZWYuaW5qZWN0b3I7XG5cbiAgICByZXR1cm4gSW5qZWN0b3IuY3JlYXRlKHtcbiAgICAgIHBhcmVudDogdXNlckluamVjdG9yIHx8IHRoaXMuX2luamVjdG9yLFxuICAgICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHtwcm92aWRlOiBNYXRTbmFja0JhclJlZiwgdXNlVmFsdWU6IHNuYWNrQmFyUmVmfSxcbiAgICAgICAge3Byb3ZpZGU6IE1BVF9TTkFDS19CQVJfREFUQSwgdXNlVmFsdWU6IGNvbmZpZy5kYXRhfVxuICAgICAgXVxuICAgIH0pO1xuICB9XG59XG4iXX0=