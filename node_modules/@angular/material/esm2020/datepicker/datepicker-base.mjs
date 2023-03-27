/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directionality } from '@angular/cdk/bidi';
import { coerceBooleanProperty, coerceStringArray } from '@angular/cdk/coercion';
import { DOWN_ARROW, ESCAPE, hasModifierKey, LEFT_ARROW, PAGE_DOWN, PAGE_UP, RIGHT_ARROW, UP_ARROW, } from '@angular/cdk/keycodes';
import { Overlay, OverlayConfig, FlexibleConnectedPositionStrategy, } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Inject, InjectionToken, Input, NgZone, Optional, Output, ViewChild, ViewContainerRef, ViewEncapsulation, ChangeDetectorRef, Directive, inject, } from '@angular/core';
import { DateAdapter, mixinColor } from '@angular/material/core';
import { merge, Subject, Subscription } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { _getFocusedElementPierceShadowDom } from '@angular/cdk/platform';
import { MatCalendar } from './calendar';
import { matDatepickerAnimations } from './datepicker-animations';
import { createMissingDateImplError } from './datepicker-errors';
import { MatDateSelectionModel, DateRange, } from './date-selection-model';
import { MAT_DATE_RANGE_SELECTION_STRATEGY, } from './date-range-selection-strategy';
import { MatDatepickerIntl } from './datepicker-intl';
import { DOCUMENT } from '@angular/common';
import * as i0 from "@angular/core";
import * as i1 from "./date-selection-model";
import * as i2 from "@angular/material/core";
import * as i3 from "./datepicker-intl";
import * as i4 from "@angular/common";
import * as i5 from "@angular/material/button";
import * as i6 from "@angular/cdk/a11y";
import * as i7 from "@angular/cdk/portal";
import * as i8 from "./calendar";
import * as i9 from "@angular/cdk/overlay";
import * as i10 from "@angular/cdk/bidi";
/** Used to generate a unique ID for each datepicker instance. */
let datepickerUid = 0;
/** Injection token that determines the scroll handling while the calendar is open. */
export const MAT_DATEPICKER_SCROLL_STRATEGY = new InjectionToken('mat-datepicker-scroll-strategy');
/** @docs-private */
export function MAT_DATEPICKER_SCROLL_STRATEGY_FACTORY(overlay) {
    return () => overlay.scrollStrategies.reposition();
}
/** @docs-private */
export const MAT_DATEPICKER_SCROLL_STRATEGY_FACTORY_PROVIDER = {
    provide: MAT_DATEPICKER_SCROLL_STRATEGY,
    deps: [Overlay],
    useFactory: MAT_DATEPICKER_SCROLL_STRATEGY_FACTORY,
};
// Boilerplate for applying mixins to MatDatepickerContent.
/** @docs-private */
const _MatDatepickerContentBase = mixinColor(class {
    constructor(_elementRef) {
        this._elementRef = _elementRef;
    }
});
/**
 * Component used as the content for the datepicker overlay. We use this instead of using
 * MatCalendar directly as the content so we can control the initial focus. This also gives us a
 * place to put additional features of the overlay that are not part of the calendar itself in the
 * future. (e.g. confirmation buttons).
 * @docs-private
 */
export class MatDatepickerContent extends _MatDatepickerContentBase {
    constructor(elementRef, _changeDetectorRef, _globalModel, _dateAdapter, _rangeSelectionStrategy, intl) {
        super(elementRef);
        this._changeDetectorRef = _changeDetectorRef;
        this._globalModel = _globalModel;
        this._dateAdapter = _dateAdapter;
        this._rangeSelectionStrategy = _rangeSelectionStrategy;
        this._subscriptions = new Subscription();
        /** Emits when an animation has finished. */
        this._animationDone = new Subject();
        /** Whether there is an in-progress animation. */
        this._isAnimating = false;
        /** Portal with projected action buttons. */
        this._actionsPortal = null;
        this._closeButtonText = intl.closeCalendarLabel;
    }
    ngOnInit() {
        this._animationState = this.datepicker.touchUi ? 'enter-dialog' : 'enter-dropdown';
    }
    ngAfterViewInit() {
        this._subscriptions.add(this.datepicker.stateChanges.subscribe(() => {
            this._changeDetectorRef.markForCheck();
        }));
        this._calendar.focusActiveCell();
    }
    ngOnDestroy() {
        this._subscriptions.unsubscribe();
        this._animationDone.complete();
    }
    _handleUserSelection(event) {
        const selection = this._model.selection;
        const value = event.value;
        const isRange = selection instanceof DateRange;
        // If we're selecting a range and we have a selection strategy, always pass the value through
        // there. Otherwise don't assign null values to the model, unless we're selecting a range.
        // A null value when picking a range means that the user cancelled the selection (e.g. by
        // pressing escape), whereas when selecting a single value it means that the value didn't
        // change. This isn't very intuitive, but it's here for backwards-compatibility.
        if (isRange && this._rangeSelectionStrategy) {
            const newSelection = this._rangeSelectionStrategy.selectionFinished(value, selection, event.event);
            this._model.updateSelection(newSelection, this);
        }
        else if (value &&
            (isRange || !this._dateAdapter.sameDate(value, selection))) {
            this._model.add(value);
        }
        // Delegate closing the overlay to the actions.
        if ((!this._model || this._model.isComplete()) && !this._actionsPortal) {
            this.datepicker.close();
        }
    }
    _handleUserDragDrop(event) {
        this._model.updateSelection(event.value, this);
    }
    _startExitAnimation() {
        this._animationState = 'void';
        this._changeDetectorRef.markForCheck();
    }
    _handleAnimationEvent(event) {
        this._isAnimating = event.phaseName === 'start';
        if (!this._isAnimating) {
            this._animationDone.next();
        }
    }
    _getSelected() {
        return this._model.selection;
    }
    /** Applies the current pending selection to the global model. */
    _applyPendingSelection() {
        if (this._model !== this._globalModel) {
            this._globalModel.updateSelection(this._model.selection, this);
        }
    }
    /**
     * Assigns a new portal containing the datepicker actions.
     * @param portal Portal with the actions to be assigned.
     * @param forceRerender Whether a re-render of the portal should be triggered. This isn't
     * necessary if the portal is assigned during initialization, but it may be required if it's
     * added at a later point.
     */
    _assignActions(portal, forceRerender) {
        // If we have actions, clone the model so that we have the ability to cancel the selection,
        // otherwise update the global model directly. Note that we want to assign this as soon as
        // possible, but `_actionsPortal` isn't available in the constructor so we do it in `ngOnInit`.
        this._model = portal ? this._globalModel.clone() : this._globalModel;
        this._actionsPortal = portal;
        if (forceRerender) {
            this._changeDetectorRef.detectChanges();
        }
    }
}
MatDatepickerContent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: MatDatepickerContent, deps: [{ token: i0.ElementRef }, { token: i0.ChangeDetectorRef }, { token: i1.MatDateSelectionModel }, { token: i2.DateAdapter }, { token: MAT_DATE_RANGE_SELECTION_STRATEGY, optional: true }, { token: i3.MatDatepickerIntl }], target: i0.ɵɵFactoryTarget.Component });
MatDatepickerContent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "15.2.0-rc.0", type: MatDatepickerContent, selector: "mat-datepicker-content", inputs: { color: "color" }, host: { listeners: { "@transformPanel.start": "_handleAnimationEvent($event)", "@transformPanel.done": "_handleAnimationEvent($event)" }, properties: { "@transformPanel": "_animationState", "class.mat-datepicker-content-touch": "datepicker.touchUi" }, classAttribute: "mat-datepicker-content" }, viewQueries: [{ propertyName: "_calendar", first: true, predicate: MatCalendar, descendants: true }], exportAs: ["matDatepickerContent"], usesInheritance: true, ngImport: i0, template: "<div\n  cdkTrapFocus\n  role=\"dialog\"\n  [attr.aria-modal]=\"true\"\n  [attr.aria-labelledby]=\"_dialogLabelId ?? undefined\"\n  class=\"mat-datepicker-content-container\"\n  [class.mat-datepicker-content-container-with-custom-header]=\"datepicker.calendarHeaderComponent\"\n  [class.mat-datepicker-content-container-with-actions]=\"_actionsPortal\">\n  <mat-calendar\n    [id]=\"datepicker.id\"\n    [ngClass]=\"datepicker.panelClass\"\n    [startAt]=\"datepicker.startAt\"\n    [startView]=\"datepicker.startView\"\n    [minDate]=\"datepicker._getMinDate()\"\n    [maxDate]=\"datepicker._getMaxDate()\"\n    [dateFilter]=\"datepicker._getDateFilter()\"\n    [headerComponent]=\"datepicker.calendarHeaderComponent\"\n    [selected]=\"_getSelected()\"\n    [dateClass]=\"datepicker.dateClass\"\n    [comparisonStart]=\"comparisonStart\"\n    [comparisonEnd]=\"comparisonEnd\"\n    [@fadeInCalendar]=\"'enter'\"\n    [startDateAccessibleName]=\"startDateAccessibleName\"\n    [endDateAccessibleName]=\"endDateAccessibleName\"\n    (yearSelected)=\"datepicker._selectYear($event)\"\n    (monthSelected)=\"datepicker._selectMonth($event)\"\n    (viewChanged)=\"datepicker._viewChanged($event)\"\n    (_userSelection)=\"_handleUserSelection($event)\"\n    (_userDragDrop)=\"_handleUserDragDrop($event)\"></mat-calendar>\n\n  <ng-template [cdkPortalOutlet]=\"_actionsPortal\"></ng-template>\n\n  <!-- Invisible close button for screen reader users. -->\n  <button\n    type=\"button\"\n    mat-raised-button\n    [color]=\"color || 'primary'\"\n    class=\"mat-datepicker-close-button\"\n    [class.cdk-visually-hidden]=\"!_closeButtonFocused\"\n    (focus)=\"_closeButtonFocused = true\"\n    (blur)=\"_closeButtonFocused = false\"\n    (click)=\"datepicker.close()\">{{ _closeButtonText }}</button>\n</div>\n", styles: [".mat-datepicker-content{display:block;border-radius:4px}.mat-datepicker-content .mat-calendar{width:296px;height:354px}.mat-datepicker-content .mat-datepicker-content-container-with-custom-header .mat-calendar{height:auto}.mat-datepicker-content .mat-datepicker-close-button{position:absolute;top:100%;left:0;margin-top:8px}.ng-animating .mat-datepicker-content .mat-datepicker-close-button{display:none}.mat-datepicker-content-container{display:flex;flex-direction:column;justify-content:space-between}.mat-datepicker-content-touch{display:block;max-height:80vh;position:relative;overflow:visible}.mat-datepicker-content-touch .mat-datepicker-content-container{min-height:312px;max-height:788px;min-width:250px;max-width:750px}.mat-datepicker-content-touch .mat-calendar{width:100%;height:auto}@media all and (orientation: landscape){.mat-datepicker-content-touch .mat-datepicker-content-container{width:64vh;height:80vh}}@media all and (orientation: portrait){.mat-datepicker-content-touch .mat-datepicker-content-container{width:80vw;height:100vw}.mat-datepicker-content-touch .mat-datepicker-content-container-with-actions{height:115vw}}"], dependencies: [{ kind: "directive", type: i4.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "component", type: i5.MatButton, selector: "    button[mat-button], button[mat-raised-button], button[mat-flat-button],    button[mat-stroked-button]  ", inputs: ["disabled", "disableRipple", "color"], exportAs: ["matButton"] }, { kind: "directive", type: i6.CdkTrapFocus, selector: "[cdkTrapFocus]", inputs: ["cdkTrapFocus", "cdkTrapFocusAutoCapture"], exportAs: ["cdkTrapFocus"] }, { kind: "directive", type: i7.CdkPortalOutlet, selector: "[cdkPortalOutlet]", inputs: ["cdkPortalOutlet"], outputs: ["attached"], exportAs: ["cdkPortalOutlet"] }, { kind: "component", type: i8.MatCalendar, selector: "mat-calendar", inputs: ["headerComponent", "startAt", "startView", "selected", "minDate", "maxDate", "dateFilter", "dateClass", "comparisonStart", "comparisonEnd", "startDateAccessibleName", "endDateAccessibleName"], outputs: ["selectedChange", "yearSelected", "monthSelected", "viewChanged", "_userSelection", "_userDragDrop"], exportAs: ["matCalendar"] }], animations: [matDatepickerAnimations.transformPanel, matDatepickerAnimations.fadeInCalendar], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: MatDatepickerContent, decorators: [{
            type: Component,
            args: [{ selector: 'mat-datepicker-content', host: {
                        'class': 'mat-datepicker-content',
                        '[@transformPanel]': '_animationState',
                        '(@transformPanel.start)': '_handleAnimationEvent($event)',
                        '(@transformPanel.done)': '_handleAnimationEvent($event)',
                        '[class.mat-datepicker-content-touch]': 'datepicker.touchUi',
                    }, animations: [matDatepickerAnimations.transformPanel, matDatepickerAnimations.fadeInCalendar], exportAs: 'matDatepickerContent', encapsulation: ViewEncapsulation.None, changeDetection: ChangeDetectionStrategy.OnPush, inputs: ['color'], template: "<div\n  cdkTrapFocus\n  role=\"dialog\"\n  [attr.aria-modal]=\"true\"\n  [attr.aria-labelledby]=\"_dialogLabelId ?? undefined\"\n  class=\"mat-datepicker-content-container\"\n  [class.mat-datepicker-content-container-with-custom-header]=\"datepicker.calendarHeaderComponent\"\n  [class.mat-datepicker-content-container-with-actions]=\"_actionsPortal\">\n  <mat-calendar\n    [id]=\"datepicker.id\"\n    [ngClass]=\"datepicker.panelClass\"\n    [startAt]=\"datepicker.startAt\"\n    [startView]=\"datepicker.startView\"\n    [minDate]=\"datepicker._getMinDate()\"\n    [maxDate]=\"datepicker._getMaxDate()\"\n    [dateFilter]=\"datepicker._getDateFilter()\"\n    [headerComponent]=\"datepicker.calendarHeaderComponent\"\n    [selected]=\"_getSelected()\"\n    [dateClass]=\"datepicker.dateClass\"\n    [comparisonStart]=\"comparisonStart\"\n    [comparisonEnd]=\"comparisonEnd\"\n    [@fadeInCalendar]=\"'enter'\"\n    [startDateAccessibleName]=\"startDateAccessibleName\"\n    [endDateAccessibleName]=\"endDateAccessibleName\"\n    (yearSelected)=\"datepicker._selectYear($event)\"\n    (monthSelected)=\"datepicker._selectMonth($event)\"\n    (viewChanged)=\"datepicker._viewChanged($event)\"\n    (_userSelection)=\"_handleUserSelection($event)\"\n    (_userDragDrop)=\"_handleUserDragDrop($event)\"></mat-calendar>\n\n  <ng-template [cdkPortalOutlet]=\"_actionsPortal\"></ng-template>\n\n  <!-- Invisible close button for screen reader users. -->\n  <button\n    type=\"button\"\n    mat-raised-button\n    [color]=\"color || 'primary'\"\n    class=\"mat-datepicker-close-button\"\n    [class.cdk-visually-hidden]=\"!_closeButtonFocused\"\n    (focus)=\"_closeButtonFocused = true\"\n    (blur)=\"_closeButtonFocused = false\"\n    (click)=\"datepicker.close()\">{{ _closeButtonText }}</button>\n</div>\n", styles: [".mat-datepicker-content{display:block;border-radius:4px}.mat-datepicker-content .mat-calendar{width:296px;height:354px}.mat-datepicker-content .mat-datepicker-content-container-with-custom-header .mat-calendar{height:auto}.mat-datepicker-content .mat-datepicker-close-button{position:absolute;top:100%;left:0;margin-top:8px}.ng-animating .mat-datepicker-content .mat-datepicker-close-button{display:none}.mat-datepicker-content-container{display:flex;flex-direction:column;justify-content:space-between}.mat-datepicker-content-touch{display:block;max-height:80vh;position:relative;overflow:visible}.mat-datepicker-content-touch .mat-datepicker-content-container{min-height:312px;max-height:788px;min-width:250px;max-width:750px}.mat-datepicker-content-touch .mat-calendar{width:100%;height:auto}@media all and (orientation: landscape){.mat-datepicker-content-touch .mat-datepicker-content-container{width:64vh;height:80vh}}@media all and (orientation: portrait){.mat-datepicker-content-touch .mat-datepicker-content-container{width:80vw;height:100vw}.mat-datepicker-content-touch .mat-datepicker-content-container-with-actions{height:115vw}}"] }]
        }], ctorParameters: function () { return [{ type: i0.ElementRef }, { type: i0.ChangeDetectorRef }, { type: i1.MatDateSelectionModel }, { type: i2.DateAdapter }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [MAT_DATE_RANGE_SELECTION_STRATEGY]
                }] }, { type: i3.MatDatepickerIntl }]; }, propDecorators: { _calendar: [{
                type: ViewChild,
                args: [MatCalendar]
            }] } });
/** Base class for a datepicker. */
export class MatDatepickerBase {
    /** The date to open the calendar to initially. */
    get startAt() {
        // If an explicit startAt is set we start there, otherwise we start at whatever the currently
        // selected value is.
        return this._startAt || (this.datepickerInput ? this.datepickerInput.getStartValue() : null);
    }
    set startAt(value) {
        this._startAt = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(value));
    }
    /** Color palette to use on the datepicker's calendar. */
    get color() {
        return (this._color || (this.datepickerInput ? this.datepickerInput.getThemePalette() : undefined));
    }
    set color(value) {
        this._color = value;
    }
    /**
     * Whether the calendar UI is in touch mode. In touch mode the calendar opens in a dialog rather
     * than a dropdown and elements have more padding to allow for bigger touch targets.
     */
    get touchUi() {
        return this._touchUi;
    }
    set touchUi(value) {
        this._touchUi = coerceBooleanProperty(value);
    }
    /** Whether the datepicker pop-up should be disabled. */
    get disabled() {
        return this._disabled === undefined && this.datepickerInput
            ? this.datepickerInput.disabled
            : !!this._disabled;
    }
    set disabled(value) {
        const newValue = coerceBooleanProperty(value);
        if (newValue !== this._disabled) {
            this._disabled = newValue;
            this.stateChanges.next(undefined);
        }
    }
    /**
     * Whether to restore focus to the previously-focused element when the calendar is closed.
     * Note that automatic focus restoration is an accessibility feature and it is recommended that
     * you provide your own equivalent, if you decide to turn it off.
     */
    get restoreFocus() {
        return this._restoreFocus;
    }
    set restoreFocus(value) {
        this._restoreFocus = coerceBooleanProperty(value);
    }
    /**
     * Classes to be passed to the date picker panel.
     * Supports string and string array values, similar to `ngClass`.
     */
    get panelClass() {
        return this._panelClass;
    }
    set panelClass(value) {
        this._panelClass = coerceStringArray(value);
    }
    /** Whether the calendar is open. */
    get opened() {
        return this._opened;
    }
    set opened(value) {
        coerceBooleanProperty(value) ? this.open() : this.close();
    }
    /** The minimum selectable date. */
    _getMinDate() {
        return this.datepickerInput && this.datepickerInput.min;
    }
    /** The maximum selectable date. */
    _getMaxDate() {
        return this.datepickerInput && this.datepickerInput.max;
    }
    _getDateFilter() {
        return this.datepickerInput && this.datepickerInput.dateFilter;
    }
    constructor(_overlay, _ngZone, _viewContainerRef, scrollStrategy, _dateAdapter, _dir, _model) {
        this._overlay = _overlay;
        this._ngZone = _ngZone;
        this._viewContainerRef = _viewContainerRef;
        this._dateAdapter = _dateAdapter;
        this._dir = _dir;
        this._model = _model;
        this._inputStateChanges = Subscription.EMPTY;
        this._document = inject(DOCUMENT);
        /** The view that the calendar should start in. */
        this.startView = 'month';
        this._touchUi = false;
        /** Preferred position of the datepicker in the X axis. */
        this.xPosition = 'start';
        /** Preferred position of the datepicker in the Y axis. */
        this.yPosition = 'below';
        this._restoreFocus = true;
        /**
         * Emits selected year in multiyear view.
         * This doesn't imply a change on the selected date.
         */
        this.yearSelected = new EventEmitter();
        /**
         * Emits selected month in year view.
         * This doesn't imply a change on the selected date.
         */
        this.monthSelected = new EventEmitter();
        /**
         * Emits when the current view changes.
         */
        this.viewChanged = new EventEmitter(true);
        /** Emits when the datepicker has been opened. */
        this.openedStream = new EventEmitter();
        /** Emits when the datepicker has been closed. */
        this.closedStream = new EventEmitter();
        this._opened = false;
        /** The id for the datepicker calendar. */
        this.id = `mat-datepicker-${datepickerUid++}`;
        /** The element that was focused before the datepicker was opened. */
        this._focusedElementBeforeOpen = null;
        /** Unique class that will be added to the backdrop so that the test harnesses can look it up. */
        this._backdropHarnessClass = `${this.id}-backdrop`;
        /** Emits when the datepicker's state changes. */
        this.stateChanges = new Subject();
        if (!this._dateAdapter && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throw createMissingDateImplError('DateAdapter');
        }
        this._scrollStrategy = scrollStrategy;
    }
    ngOnChanges(changes) {
        const positionChange = changes['xPosition'] || changes['yPosition'];
        if (positionChange && !positionChange.firstChange && this._overlayRef) {
            const positionStrategy = this._overlayRef.getConfig().positionStrategy;
            if (positionStrategy instanceof FlexibleConnectedPositionStrategy) {
                this._setConnectedPositions(positionStrategy);
                if (this.opened) {
                    this._overlayRef.updatePosition();
                }
            }
        }
        this.stateChanges.next(undefined);
    }
    ngOnDestroy() {
        this._destroyOverlay();
        this.close();
        this._inputStateChanges.unsubscribe();
        this.stateChanges.complete();
    }
    /** Selects the given date */
    select(date) {
        this._model.add(date);
    }
    /** Emits the selected year in multiyear view */
    _selectYear(normalizedYear) {
        this.yearSelected.emit(normalizedYear);
    }
    /** Emits selected month in year view */
    _selectMonth(normalizedMonth) {
        this.monthSelected.emit(normalizedMonth);
    }
    /** Emits changed view */
    _viewChanged(view) {
        this.viewChanged.emit(view);
    }
    /**
     * Register an input with this datepicker.
     * @param input The datepicker input to register with this datepicker.
     * @returns Selection model that the input should hook itself up to.
     */
    registerInput(input) {
        if (this.datepickerInput && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throw Error('A MatDatepicker can only be associated with a single input.');
        }
        this._inputStateChanges.unsubscribe();
        this.datepickerInput = input;
        this._inputStateChanges = input.stateChanges.subscribe(() => this.stateChanges.next(undefined));
        return this._model;
    }
    /**
     * Registers a portal containing action buttons with the datepicker.
     * @param portal Portal to be registered.
     */
    registerActions(portal) {
        if (this._actionsPortal && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throw Error('A MatDatepicker can only be associated with a single actions row.');
        }
        this._actionsPortal = portal;
        this._componentRef?.instance._assignActions(portal, true);
    }
    /**
     * Removes a portal containing action buttons from the datepicker.
     * @param portal Portal to be removed.
     */
    removeActions(portal) {
        if (portal === this._actionsPortal) {
            this._actionsPortal = null;
            this._componentRef?.instance._assignActions(null, true);
        }
    }
    /** Open the calendar. */
    open() {
        // Skip reopening if there's an in-progress animation to avoid overlapping
        // sequences which can cause "changed after checked" errors. See #25837.
        if (this._opened || this.disabled || this._componentRef?.instance._isAnimating) {
            return;
        }
        if (!this.datepickerInput && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throw Error('Attempted to open an MatDatepicker with no associated input.');
        }
        this._focusedElementBeforeOpen = _getFocusedElementPierceShadowDom();
        this._openOverlay();
        this._opened = true;
        this.openedStream.emit();
    }
    /** Close the calendar. */
    close() {
        // Skip reopening if there's an in-progress animation to avoid overlapping
        // sequences which can cause "changed after checked" errors. See #25837.
        if (!this._opened || this._componentRef?.instance._isAnimating) {
            return;
        }
        const canRestoreFocus = this._restoreFocus &&
            this._focusedElementBeforeOpen &&
            typeof this._focusedElementBeforeOpen.focus === 'function';
        const completeClose = () => {
            // The `_opened` could've been reset already if
            // we got two events in quick succession.
            if (this._opened) {
                this._opened = false;
                this.closedStream.emit();
            }
        };
        if (this._componentRef) {
            const { instance, location } = this._componentRef;
            instance._startExitAnimation();
            instance._animationDone.pipe(take(1)).subscribe(() => {
                const activeElement = this._document.activeElement;
                // Since we restore focus after the exit animation, we have to check that
                // the user didn't move focus themselves inside the `close` handler.
                if (canRestoreFocus &&
                    (!activeElement ||
                        activeElement === this._document.activeElement ||
                        location.nativeElement.contains(activeElement))) {
                    this._focusedElementBeforeOpen.focus();
                }
                this._focusedElementBeforeOpen = null;
                this._destroyOverlay();
            });
        }
        if (canRestoreFocus) {
            // Because IE moves focus asynchronously, we can't count on it being restored before we've
            // marked the datepicker as closed. If the event fires out of sequence and the element that
            // we're refocusing opens the datepicker on focus, the user could be stuck with not being
            // able to close the calendar at all. We work around it by making the logic, that marks
            // the datepicker as closed, async as well.
            setTimeout(completeClose);
        }
        else {
            completeClose();
        }
    }
    /** Applies the current pending selection on the overlay to the model. */
    _applyPendingSelection() {
        this._componentRef?.instance?._applyPendingSelection();
    }
    /** Forwards relevant values from the datepicker to the datepicker content inside the overlay. */
    _forwardContentValues(instance) {
        instance.datepicker = this;
        instance.color = this.color;
        instance._dialogLabelId = this.datepickerInput.getOverlayLabelId();
        instance._assignActions(this._actionsPortal, false);
    }
    /** Opens the overlay with the calendar. */
    _openOverlay() {
        this._destroyOverlay();
        const isDialog = this.touchUi;
        const portal = new ComponentPortal(MatDatepickerContent, this._viewContainerRef);
        const overlayRef = (this._overlayRef = this._overlay.create(new OverlayConfig({
            positionStrategy: isDialog ? this._getDialogStrategy() : this._getDropdownStrategy(),
            hasBackdrop: true,
            backdropClass: [
                isDialog ? 'cdk-overlay-dark-backdrop' : 'mat-overlay-transparent-backdrop',
                this._backdropHarnessClass,
            ],
            direction: this._dir,
            scrollStrategy: isDialog ? this._overlay.scrollStrategies.block() : this._scrollStrategy(),
            panelClass: `mat-datepicker-${isDialog ? 'dialog' : 'popup'}`,
        })));
        this._getCloseStream(overlayRef).subscribe(event => {
            if (event) {
                event.preventDefault();
            }
            this.close();
        });
        // The `preventDefault` call happens inside the calendar as well, however focus moves into
        // it inside a timeout which can give browsers a chance to fire off a keyboard event in-between
        // that can scroll the page (see #24969). Always block default actions of arrow keys for the
        // entire overlay so the page doesn't get scrolled by accident.
        overlayRef.keydownEvents().subscribe(event => {
            const keyCode = event.keyCode;
            if (keyCode === UP_ARROW ||
                keyCode === DOWN_ARROW ||
                keyCode === LEFT_ARROW ||
                keyCode === RIGHT_ARROW ||
                keyCode === PAGE_UP ||
                keyCode === PAGE_DOWN) {
                event.preventDefault();
            }
        });
        this._componentRef = overlayRef.attach(portal);
        this._forwardContentValues(this._componentRef.instance);
        // Update the position once the calendar has rendered. Only relevant in dropdown mode.
        if (!isDialog) {
            this._ngZone.onStable.pipe(take(1)).subscribe(() => overlayRef.updatePosition());
        }
    }
    /** Destroys the current overlay. */
    _destroyOverlay() {
        if (this._overlayRef) {
            this._overlayRef.dispose();
            this._overlayRef = this._componentRef = null;
        }
    }
    /** Gets a position strategy that will open the calendar as a dropdown. */
    _getDialogStrategy() {
        return this._overlay.position().global().centerHorizontally().centerVertically();
    }
    /** Gets a position strategy that will open the calendar as a dropdown. */
    _getDropdownStrategy() {
        const strategy = this._overlay
            .position()
            .flexibleConnectedTo(this.datepickerInput.getConnectedOverlayOrigin())
            .withTransformOriginOn('.mat-datepicker-content')
            .withFlexibleDimensions(false)
            .withViewportMargin(8)
            .withLockedPosition();
        return this._setConnectedPositions(strategy);
    }
    /** Sets the positions of the datepicker in dropdown mode based on the current configuration. */
    _setConnectedPositions(strategy) {
        const primaryX = this.xPosition === 'end' ? 'end' : 'start';
        const secondaryX = primaryX === 'start' ? 'end' : 'start';
        const primaryY = this.yPosition === 'above' ? 'bottom' : 'top';
        const secondaryY = primaryY === 'top' ? 'bottom' : 'top';
        return strategy.withPositions([
            {
                originX: primaryX,
                originY: secondaryY,
                overlayX: primaryX,
                overlayY: primaryY,
            },
            {
                originX: primaryX,
                originY: primaryY,
                overlayX: primaryX,
                overlayY: secondaryY,
            },
            {
                originX: secondaryX,
                originY: secondaryY,
                overlayX: secondaryX,
                overlayY: primaryY,
            },
            {
                originX: secondaryX,
                originY: primaryY,
                overlayX: secondaryX,
                overlayY: secondaryY,
            },
        ]);
    }
    /** Gets an observable that will emit when the overlay is supposed to be closed. */
    _getCloseStream(overlayRef) {
        const ctrlShiftMetaModifiers = ['ctrlKey', 'shiftKey', 'metaKey'];
        return merge(overlayRef.backdropClick(), overlayRef.detachments(), overlayRef.keydownEvents().pipe(filter(event => {
            // Closing on alt + up is only valid when there's an input associated with the datepicker.
            return ((event.keyCode === ESCAPE && !hasModifierKey(event)) ||
                (this.datepickerInput &&
                    hasModifierKey(event, 'altKey') &&
                    event.keyCode === UP_ARROW &&
                    ctrlShiftMetaModifiers.every((modifier) => !hasModifierKey(event, modifier))));
        })));
    }
}
MatDatepickerBase.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: MatDatepickerBase, deps: [{ token: i9.Overlay }, { token: i0.NgZone }, { token: i0.ViewContainerRef }, { token: MAT_DATEPICKER_SCROLL_STRATEGY }, { token: i2.DateAdapter, optional: true }, { token: i10.Directionality, optional: true }, { token: i1.MatDateSelectionModel }], target: i0.ɵɵFactoryTarget.Directive });
MatDatepickerBase.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "15.2.0-rc.0", type: MatDatepickerBase, inputs: { calendarHeaderComponent: "calendarHeaderComponent", startAt: "startAt", startView: "startView", color: "color", touchUi: "touchUi", disabled: "disabled", xPosition: "xPosition", yPosition: "yPosition", restoreFocus: "restoreFocus", dateClass: "dateClass", panelClass: "panelClass", opened: "opened" }, outputs: { yearSelected: "yearSelected", monthSelected: "monthSelected", viewChanged: "viewChanged", openedStream: "opened", closedStream: "closed" }, usesOnChanges: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: MatDatepickerBase, decorators: [{
            type: Directive
        }], ctorParameters: function () { return [{ type: i9.Overlay }, { type: i0.NgZone }, { type: i0.ViewContainerRef }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [MAT_DATEPICKER_SCROLL_STRATEGY]
                }] }, { type: i2.DateAdapter, decorators: [{
                    type: Optional
                }] }, { type: i10.Directionality, decorators: [{
                    type: Optional
                }] }, { type: i1.MatDateSelectionModel }]; }, propDecorators: { calendarHeaderComponent: [{
                type: Input
            }], startAt: [{
                type: Input
            }], startView: [{
                type: Input
            }], color: [{
                type: Input
            }], touchUi: [{
                type: Input
            }], disabled: [{
                type: Input
            }], xPosition: [{
                type: Input
            }], yPosition: [{
                type: Input
            }], restoreFocus: [{
                type: Input
            }], yearSelected: [{
                type: Output
            }], monthSelected: [{
                type: Output
            }], viewChanged: [{
                type: Output
            }], dateClass: [{
                type: Input
            }], openedStream: [{
                type: Output,
                args: ['opened']
            }], closedStream: [{
                type: Output,
                args: ['closed']
            }], panelClass: [{
                type: Input
            }], opened: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZXBpY2tlci1iYXNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL2RhdGVwaWNrZXIvZGF0ZXBpY2tlci1iYXNlLnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL2RhdGVwaWNrZXIvZGF0ZXBpY2tlci1jb250ZW50Lmh0bWwiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ2pELE9BQU8sRUFBZSxxQkFBcUIsRUFBRSxpQkFBaUIsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQzdGLE9BQU8sRUFDTCxVQUFVLEVBQ1YsTUFBTSxFQUNOLGNBQWMsRUFDZCxVQUFVLEVBRVYsU0FBUyxFQUNULE9BQU8sRUFDUCxXQUFXLEVBQ1gsUUFBUSxHQUNULE1BQU0sdUJBQXVCLENBQUM7QUFDL0IsT0FBTyxFQUNMLE9BQU8sRUFDUCxhQUFhLEVBR2IsaUNBQWlDLEdBQ2xDLE1BQU0sc0JBQXNCLENBQUM7QUFDOUIsT0FBTyxFQUFDLGVBQWUsRUFBZ0MsTUFBTSxxQkFBcUIsQ0FBQztBQUNuRixPQUFPLEVBRUwsdUJBQXVCLEVBQ3ZCLFNBQVMsRUFFVCxVQUFVLEVBQ1YsWUFBWSxFQUNaLE1BQU0sRUFDTixjQUFjLEVBQ2QsS0FBSyxFQUNMLE1BQU0sRUFFTixRQUFRLEVBQ1IsTUFBTSxFQUNOLFNBQVMsRUFDVCxnQkFBZ0IsRUFDaEIsaUJBQWlCLEVBQ2pCLGlCQUFpQixFQUNqQixTQUFTLEVBSVQsTUFBTSxHQUNQLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBVyxXQUFXLEVBQUUsVUFBVSxFQUFlLE1BQU0sd0JBQXdCLENBQUM7QUFFdkYsT0FBTyxFQUFDLEtBQUssRUFBRSxPQUFPLEVBQWMsWUFBWSxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQzlELE9BQU8sRUFBQyxNQUFNLEVB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QUFDLEtBQUssRUFBRSxRQUFRLENBQUM7b0JBQy9CLEtBQUssQ0FBQyxPQUFPLEtBQUssUUFBUTtvQkFDMUIsc0JBQXNCLENBQUMsS0FBSyxDQUMxQixDQUFDLFFBQXFCLEVBQUUsRUFBRSxDQUFDLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FDNUQsQ0FBQyxDQUNMLENBQUM7UUFDSixDQUFDLENBQUMsQ0FDSCxDQUNGLENBQUM7SUFDSixDQUFDOzttSEEzZm1CLGlCQUFpQiwrRkF5TDNCLDhCQUE4Qjt1R0F6THBCLGlCQUFpQjtnR0FBakIsaUJBQWlCO2tCQUR0QyxTQUFTOzswQkEwTEwsTUFBTTsyQkFBQyw4QkFBOEI7OzBCQUNyQyxRQUFROzswQkFDUixRQUFRO2dGQWhMRix1QkFBdUI7c0JBQS9CLEtBQUs7Z0JBSUYsT0FBTztzQkFEVixLQUFLO2dCQVlHLFNBQVM7c0JBQWpCLEtBQUs7Z0JBSUYsS0FBSztzQkFEUixLQUFLO2dCQWdCRixPQUFPO3NCQURWLEtBQUs7Z0JBV0YsUUFBUTtzQkFEWCxLQUFLO2dCQWtCTixTQUFTO3NCQURSLEtBQUs7Z0JBS04sU0FBUztzQkFEUixLQUFLO2dCQVNGLFlBQVk7c0JBRGYsS0FBSztnQkFhYSxZQUFZO3NCQUE5QixNQUFNO2dCQU1ZLGFBQWE7c0JBQS9CLE1BQU07Z0JBS1ksV0FBVztzQkFBN0IsTUFBTTtnQkFLRSxTQUFTO3NCQUFqQixLQUFLO2dCQUdxQixZQUFZO3NCQUF0QyxNQUFNO3VCQUFDLFFBQVE7Z0JBR1csWUFBWTtzQkFBdEMsTUFBTTt1QkFBQyxRQUFRO2dCQU9aLFVBQVU7c0JBRGIsS0FBSztnQkFXRixNQUFNO3NCQURULEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtEaXJlY3Rpb25hbGl0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuaW1wb3J0IHtCb29sZWFuSW5wdXQsIGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSwgY29lcmNlU3RyaW5nQXJyYXl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5pbXBvcnQge1xuICBET1dOX0FSUk9XLFxuICBFU0NBUEUsXG4gIGhhc01vZGlmaWVyS2V5LFxuICBMRUZUX0FSUk9XLFxuICBNb2RpZmllcktleSxcbiAgUEFHRV9ET1dOLFxuICBQQUdFX1VQLFxuICBSSUdIVF9BUlJPVyxcbiAgVVBfQVJST1csXG59IGZyb20gJ0Bhbmd1bGFyL2Nkay9rZXljb2Rlcyc7XG5pbXBvcnQge1xuICBPdmVybGF5LFxuICBPdmVybGF5Q29uZmlnLFxuICBPdmVybGF5UmVmLFxuICBTY3JvbGxTdHJhdGVneSxcbiAgRmxleGlibGVDb25uZWN0ZWRQb3NpdGlvblN0cmF0ZWd5LFxufSBmcm9tICdAYW5ndWxhci9jZGsvb3ZlcmxheSc7XG5pbXBvcnQge0NvbXBvbmVudFBvcnRhbCwgQ29tcG9uZW50VHlwZSwgVGVtcGxhdGVQb3J0YWx9IGZyb20gJ0Bhbmd1bGFyL2Nkay9wb3J0YWwnO1xuaW1wb3J0IHtcbiAgQWZ0ZXJWaWV3SW5pdCxcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIENvbXBvbmVudCxcbiAgQ29tcG9uZW50UmVmLFxuICBFbGVtZW50UmVmLFxuICBFdmVudEVtaXR0ZXIsXG4gIEluamVjdCxcbiAgSW5qZWN0aW9uVG9rZW4sXG4gIElucHV0LFxuICBOZ1pvbmUsXG4gIE9uRGVzdHJveSxcbiAgT3B0aW9uYWwsXG4gIE91dHB1dCxcbiAgVmlld0NoaWxkLFxuICBWaWV3Q29udGFpbmVyUmVmLFxuICBWaWV3RW5jYXBzdWxhdGlvbixcbiAgQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gIERpcmVjdGl2ZSxcbiAgT25DaGFuZ2VzLFxuICBTaW1wbGVDaGFuZ2VzLFxuICBPbkluaXQsXG4gIGluamVjdCxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0NhbkNvbG9yLCBEYXRlQWRhcHRlciwgbWl4aW5Db2xvciwgVGhlbWVQYWxldHRlfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9jb3JlJztcbmltcG9ydCB7QW5pbWF0aW9uRXZlbnR9IGZyb20gJ0Bhbmd1bGFyL2FuaW1hdGlvbnMnO1xuaW1wb3J0IHttZXJnZSwgU3ViamVjdCwgT2JzZXJ2YWJsZSwgU3Vic2NyaXB0aW9ufSBmcm9tICdyeGpzJztcbmltcG9ydCB7ZmlsdGVyLCB0YWtlfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQge19nZXRGb2N1c2VkRWxlbWVudFBpZXJjZVNoYWRvd0RvbX0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BsYXRmb3JtJztcbmltcG9ydCB7TWF0Q2FsZW5kYXIsIE1hdENhbGVuZGFyVmlld30gZnJvbSAnLi9jYWxlbmRhcic7XG5pbXBvcnQge21hdERhdGVwaWNrZXJBbmltYXRpb25zfSBmcm9tICcuL2RhdGVwaWNrZXItYW5pbWF0aW9ucyc7XG5pbXBvcnQge2NyZWF0ZU1pc3NpbmdEYXRlSW1wbEVycm9yfSBmcm9tICcuL2RhdGVwaWNrZXItZXJyb3JzJztcbmltcG9ydCB7TWF0Q2FsZW5kYXJVc2VyRXZlbnQsIE1hdENhbGVuZGFyQ2VsbENsYXNzRnVuY3Rpb259IGZyb20gJy4vY2FsZW5kYXItYm9keSc7XG5pbXBvcnQge0RhdGVGaWx0ZXJGbn0gZnJvbSAnLi9kYXRlcGlja2VyLWlucHV0LWJhc2UnO1xuaW1wb3J0IHtcbiAgRXh0cmFjdERhdGVUeXBlRnJvbVNlbGVjdGlvbixcbiAgTWF0RGF0ZVNlbGVjdGlvbk1vZGVsLFxuICBEYXRlUmFuZ2UsXG59IGZyb20gJy4vZGF0ZS1zZWxlY3Rpb24tbW9kZWwnO1xuaW1wb3J0IHtcbiAgTUFUX0RBVEVfUkFOR0VfU0VMRUNUSU9OX1NUUkFURUdZLFxuICBNYXREYXRlUmFuZ2VTZWxlY3Rpb25TdHJhdGVneSxcbn0gZnJvbSAnLi9kYXRlLXJhbmdlLXNlbGVjdGlvbi1zdHJhdGVneSc7XG5pbXBvcnQge01hdERhdGVwaWNrZXJJbnRsfSBmcm9tICcuL2RhdGVwaWNrZXItaW50bCc7XG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuXG4vKiogVXNlZCB0byBnZW5lcmF0ZSBhIHVuaXF1ZSBJRCBmb3IgZWFjaCBkYXRlcGlja2VyIGluc3RhbmNlLiAqL1xubGV0IGRhdGVwaWNrZXJVaWQgPSAwO1xuXG4vKiogSW5qZWN0aW9uIHRva2VuIHRoYXQgZGV0ZXJtaW5lcyB0aGUgc2Nyb2xsIGhhbmRsaW5nIHdoaWxlIHRoZSBjYWxlbmRhciBpcyBvcGVuLiAqL1xuZXhwb3J0IGNvbnN0IE1BVF9EQVRFUElDS0VSX1NDUk9MTF9TVFJBVEVHWSA9IG5ldyBJbmplY3Rpb25Ub2tlbjwoKSA9PiBTY3JvbGxTdHJhdGVneT4oXG4gICdtYXQtZGF0ZXBpY2tlci1zY3JvbGwtc3RyYXRlZ3knLFxuKTtcblxuLyoqIEBkb2NzLXByaXZhdGUgKi9cbmV4cG9ydCBmdW5jdGlvbiBNQVRfREFURVBJQ0tFUl9TQ1JPTExfU1RSQVRFR1lfRkFDVE9SWShvdmVybGF5OiBPdmVybGF5KTogKCkgPT4gU2Nyb2xsU3RyYXRlZ3kge1xuICByZXR1cm4gKCkgPT4gb3ZlcmxheS5zY3JvbGxTdHJhdGVnaWVzLnJlcG9zaXRpb24oKTtcbn1cblxuLyoqIFBvc3NpYmxlIHBvc2l0aW9ucyBmb3IgdGhlIGRhdGVwaWNrZXIgZHJvcGRvd24gYWxvbmcgdGhlIFggYXhpcy4gKi9cbmV4cG9ydCB0eXBlIERhdGVwaWNrZXJEcm9wZG93blBvc2l0aW9uWCA9ICdzdGFydCcgfCAnZW5kJztcblxuLyoqIFBvc3NpYmxlIHBvc2l0aW9ucyBmb3IgdGhlIGRhdGVwaWNrZXIgZHJvcGRvd24gYWxvbmcgdGhlIFkgYXhpcy4gKi9cbmV4cG9ydCB0eXBlIERhdGVwaWNrZXJEcm9wZG93blBvc2l0aW9uWSA9ICdhYm92ZScgfCAnYmVsb3cnO1xuXG4vKiogQGRvY3MtcHJpdmF0ZSAqL1xuZXhwb3J0IGNvbnN0IE1BVF9EQVRFUElDS0VSX1NDUk9MTF9TVFJBVEVHWV9GQUNUT1JZX1BST1ZJREVSID0ge1xuICBwcm92aWRlOiBNQVRfREFURVBJQ0tFUl9TQ1JPTExfU1RSQVRFR1ksXG4gIGRlcHM6IFtPdmVybGF5XSxcbiAgdXNlRmFjdG9yeTogTUFUX0RBVEVQSUNLRVJfU0NST0xMX1NUUkFURUdZX0ZBQ1RPUlksXG59O1xuXG4vLyBCb2lsZXJwbGF0ZSBmb3IgYXBwbHlpbmcgbWl4aW5zIHRvIE1hdERhdGVwaWNrZXJDb250ZW50LlxuLyoqIEBkb2NzLXByaXZhdGUgKi9cbmNvbnN0IF9NYXREYXRlcGlja2VyQ29udGVudEJhc2UgPSBtaXhpbkNvbG9yKFxuICBjbGFzcyB7XG4gICAgY29uc3RydWN0b3IocHVibGljIF9lbGVtZW50UmVmOiBFbGVtZW50UmVmKSB7fVxuICB9LFxuKTtcblxuLyoqXG4gKiBDb21wb25lbnQgdXNlZCBhcyB0aGUgY29udGVudCBmb3IgdGhlIGRhdGVwaWNrZXIgb3ZlcmxheS4gV2UgdXNlIHRoaXMgaW5zdGVhZCBvZiB1c2luZ1xuICogTWF0Q2FsZW5kYXIgZGlyZWN0bHkgYXMgdGhlIGNvbnRlbnQgc28gd2UgY2FuIGNvbnRyb2wgdGhlIGluaXRpYWwgZm9jdXMuIFRoaXMgYWxzbyBnaXZlcyB1cyBhXG4gKiBwbGFjZSB0byBwdXQgYWRkaXRpb25hbCBmZWF0dXJlcyBvZiB0aGUgb3ZlcmxheSB0aGF0IGFyZSBub3QgcGFydCBvZiB0aGUgY2FsZW5kYXIgaXRzZWxmIGluIHRoZVxuICogZnV0dXJlLiAoZS5nLiBjb25maXJtYXRpb24gYnV0dG9ucykuXG4gKiBAZG9jcy1wcml2YXRlXG4gKi9cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ21hdC1kYXRlcGlja2VyLWNvbnRlbnQnLFxuICB0ZW1wbGF0ZVVybDogJ2RhdGVwaWNrZXItY29udGVudC5odG1sJyxcbiAgc3R5bGVVcmxzOiBbJ2RhdGVwaWNrZXItY29udGVudC5jc3MnXSxcbiAgaG9zdDoge1xuICAgICdjbGFzcyc6ICdtYXQtZGF0ZXBpY2tlci1jb250ZW50JyxcbiAgICAnW0B0cmFuc2Zvcm1QYW5lbF0nOiAnX2FuaW1hdGlvblN0YXRlJyxcbiAgICAnKEB0cmFuc2Zvcm1QYW5lbC5zdGFydCknOiAnX2hhbmRsZUFuaW1hdGlvbkV2ZW50KCRldmVudCknLFxuICAgICcoQHRyYW5zZm9ybVBhbmVsLmRvbmUpJzogJ19oYW5kbGVBbmltYXRpb25FdmVudCgkZXZlbnQpJyxcbiAgICAnW2NsYXNzLm1hdC1kYXRlcGlja2VyLWNvbnRlbnQtdG91Y2hdJzogJ2RhdGVwaWNrZXIudG91Y2hVaScsXG4gIH0sXG4gIGFuaW1hdGlvbnM6IFttYXREYXRlcGlja2VyQW5pbWF0aW9ucy50cmFuc2Zvcm1QYW5lbCwgbWF0RGF0ZXBpY2tlckFuaW1hdGlvbnMuZmFkZUluQ2FsZW5kYXJdLFxuICBleHBvcnRBczogJ21hdERhdGVwaWNrZXJDb250ZW50JyxcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXG4gIGlucHV0czogWydjb2xvciddLFxufSlcbmV4cG9ydCBjbGFzcyBNYXREYXRlcGlja2VyQ29udGVudDxTLCBEID0gRXh0cmFjdERhdGVUeXBlRnJvbVNlbGVjdGlvbjxTPj5cbiAgZXh0ZW5kcyBfTWF0RGF0ZXBpY2tlckNvbnRlbnRCYXNlXG4gIGltcGxlbWVudHMgT25Jbml0LCBBZnRlclZpZXdJbml0LCBPbkRlc3Ryb3ksIENhbkNvbG9yXG57XG4gIHByaXZhdGUgX3N1YnNjcmlwdGlvbnMgPSBuZXcgU3Vic2NyaXB0aW9uKCk7XG4gIHByaXZhdGUgX21vZGVsOiBNYXREYXRlU2VsZWN0aW9uTW9kZWw8UywgRD47XG4gIC8qKiBSZWZlcmVuY2UgdG8gdGhlIGludGVybmFsIGNhbGVuZGFyIGNvbXBvbmVudC4gKi9cbiAgQFZpZXdDaGlsZChNYXRDYWxlbmRhcikgX2NhbGVuZGFyOiBNYXRDYWxlbmRhcjxEPjtcblxuICAvKiogUmVmZXJlbmNlIHRvIHRoZSBkYXRlcGlja2VyIHRoYXQgY3JlYXRlZCB0aGUgb3ZlcmxheS4gKi9cbiAgZGF0ZXBpY2tlcjogTWF0RGF0ZXBpY2tlckJhc2U8YW55LCBTLCBEPjtcblxuICAvKiogU3RhcnQgb2YgdGhlIGNvbXBhcmlzb24gcmFuZ2UuICovXG4gIGNvbXBhcmlzb25TdGFydDogRCB8IG51bGw7XG5cbiAgLyoqIEVuZCBvZiB0aGUgY29tcGFyaXNvbiByYW5nZS4gKi9cbiAgY29tcGFyaXNvbkVuZDogRCB8IG51bGw7XG5cbiAgLyoqIEFSSUEgQWNjZXNzaWJsZSBuYW1lIG9mIHRoZSBgPGlucHV0IG1hdFN0YXJ0RGF0ZS8+YCAqL1xuICBzdGFydERhdGVBY2Nlc3NpYmxlTmFtZTogc3RyaW5nIHwgbnVsbDtcblxuICAvKiogQVJJQSBBY2Nlc3NpYmxlIG5hbWUgb2YgdGhlIGA8aW5wdXQgbWF0RW5kRGF0ZS8+YCAqL1xuICBlbmREYXRlQWNjZXNzaWJsZU5hbWU6IHN0cmluZyB8IG51bGw7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGRhdGVwaWNrZXIgaXMgYWJvdmUgb3IgYmVsb3cgdGhlIGlucHV0LiAqL1xuICBfaXNBYm92ZTogYm9vbGVhbjtcblxuICAvKiogQ3VycmVudCBzdGF0ZSBvZiB0aGUgYW5pbWF0aW9uLiAqL1xuICBfYW5pbWF0aW9uU3RhdGU6ICdlbnRlci1kcm9wZG93bicgfCAnZW50ZXItZGlhbG9nJyB8ICd2b2lkJztcblxuICAvKiogRW1pdHMgd2hlbiBhbiBhbmltYXRpb24gaGFzIGZpbmlzaGVkLiAqL1xuICByZWFkb25seSBfYW5pbWF0aW9uRG9uZSA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG5cbiAgLyoqIFdoZXRoZXIgdGhlcmUgaXMgYW4gaW4tcHJvZ3Jlc3MgYW5pbWF0aW9uLiAqL1xuICBfaXNBbmltYXRpbmcgPSBmYWxzZTtcblxuICAvKiogVGV4dCBmb3IgdGhlIGNsb3NlIGJ1dHRvbi4gKi9cbiAgX2Nsb3NlQnV0dG9uVGV4dDogc3RyaW5nO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBjbG9zZSBidXR0b24gY3VycmVudGx5IGhhcyBmb2N1cy4gKi9cbiAgX2Nsb3NlQnV0dG9uRm9jdXNlZDogYm9vbGVhbjtcblxuICAvKiogUG9ydGFsIHdpdGggcHJvamVjdGVkIGFjdGlvbiBidXR0b25zLiAqL1xuICBfYWN0aW9uc1BvcnRhbDogVGVtcGxhdGVQb3J0YWwgfCBudWxsID0gbnVsbDtcblxuICAvKiogSWQgb2YgdGhlIGxhYmVsIGZvciB0aGUgYHJvbGU9XCJkaWFsb2dcImAgZWxlbWVudC4gKi9cbiAgX2RpYWxvZ0xhYmVsSWQ6IHN0cmluZyB8IG51bGw7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgZWxlbWVudFJlZjogRWxlbWVudFJlZixcbiAgICBwcml2YXRlIF9jaGFuZ2VEZXRlY3RvclJlZjogQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gICAgcHJpdmF0ZSBfZ2xvYmFsTW9kZWw6IE1hdERhdGVTZWxlY3Rpb25Nb2RlbDxTLCBEPixcbiAgICBwcml2YXRlIF9kYXRlQWRhcHRlcjogRGF0ZUFkYXB0ZXI8RD4sXG4gICAgQE9wdGlvbmFsKClcbiAgICBASW5qZWN0KE1BVF9EQVRFX1JBTkdFX1NFTEVDVElPTl9TVFJBVEVHWSlcbiAgICBwcml2YXRlIF9yYW5nZVNlbGVjdGlvblN0cmF0ZWd5OiBNYXREYXRlUmFuZ2VTZWxlY3Rpb25TdHJhdGVneTxEPixcbiAgICBpbnRsOiBNYXREYXRlcGlja2VySW50bCxcbiAgKSB7XG4gICAgc3VwZXIoZWxlbWVudFJlZik7XG4gICAgdGhpcy5fY2xvc2VCdXR0b25UZXh0ID0gaW50bC5jbG9zZUNhbGVuZGFyTGFiZWw7XG4gIH1cblxuICBuZ09uSW5pdCgpIHtcbiAgICB0aGlzLl9hbmltYXRpb25TdGF0ZSA9IHRoaXMuZGF0ZXBpY2tlci50b3VjaFVpID8gJ2VudGVyLWRpYWxvZycgOiAnZW50ZXItZHJvcGRvd24nO1xuICB9XG5cbiAgbmdBZnRlclZpZXdJbml0KCkge1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgdGhpcy5kYXRlcGlja2VyLnN0YXRlQ2hhbmdlcy5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZi5tYXJrRm9yQ2hlY2soKTtcbiAgICAgIH0pLFxuICAgICk7XG4gICAgdGhpcy5fY2FsZW5kYXIuZm9jdXNBY3RpdmVDZWxsKCk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLnVuc3Vic2NyaWJlKCk7XG4gICAgdGhpcy5fYW5pbWF0aW9uRG9uZS5jb21wbGV0ZSgpO1xuICB9XG5cbiAgX2hhbmRsZVVzZXJTZWxlY3Rpb24oZXZlbnQ6IE1hdENhbGVuZGFyVXNlckV2ZW50PEQgfCBudWxsPikge1xuICAgIGNvbnN0IHNlbGVjdGlvbiA9IHRoaXMuX21vZGVsLnNlbGVjdGlvbjtcbiAgICBjb25zdCB2YWx1ZSA9IGV2ZW50LnZhbHVlO1xuICAgIGNvbnN0IGlzUmFuZ2UgPSBzZWxlY3Rpb24gaW5zdGFuY2VvZiBEYXRlUmFuZ2U7XG5cbiAgICAvLyBJZiB3ZSdyZSBzZWxlY3RpbmcgYSByYW5nZSBhbmQgd2UgaGF2ZSBhIHNlbGVjdGlvbiBzdHJhdGVneSwgYWx3YXlzIHBhc3MgdGhlIHZhbHVlIHRocm91Z2hcbiAgICAvLyB0aGVyZS4gT3RoZXJ3aXNlIGRvbid0IGFzc2lnbiBudWxsIHZhbHVlcyB0byB0aGUgbW9kZWwsIHVubGVzcyB3ZSdyZSBzZWxlY3RpbmcgYSByYW5nZS5cbiAgICAvLyBBIG51bGwgdmFsdWUgd2hlbiBwaWNraW5nIGEgcmFuZ2UgbWVhbnMgdGhhdCB0aGUgdXNlciBjYW5jZWxsZWQgdGhlIHNlbGVjdGlvbiAoZS5nLiBieVxuICAgIC8vIHByZXNzaW5nIGVzY2FwZSksIHdoZXJlYXMgd2hlbiBzZWxlY3RpbmcgYSBzaW5nbGUgdmFsdWUgaXQgbWVhbnMgdGhhdCB0aGUgdmFsdWUgZGlkbid0XG4gICAgLy8gY2hhbmdlLiBUaGlzIGlzbid0IHZlcnkgaW50dWl0aXZlLCBidXQgaXQncyBoZXJlIGZvciBiYWNrd2FyZHMtY29tcGF0aWJpbGl0eS5cbiAgICBpZiAoaXNSYW5nZSAmJiB0aGlzLl9yYW5nZVNlbGVjdGlvblN0cmF0ZWd5KSB7XG4gICAgICBjb25zdCBuZXdTZWxlY3Rpb24gPSB0aGlzLl9yYW5nZVNlbGVjdGlvblN0cmF0ZWd5LnNlbGVjdGlvbkZpbmlzaGVkKFxuICAgICAgICB2YWx1ZSxcbiAgICAgICAgc2VsZWN0aW9uIGFzIHVua25vd24gYXMgRGF0ZVJhbmdlPEQ+LFxuICAgICAgICBldmVudC5ldmVudCxcbiAgICAgICk7XG4gICAgICB0aGlzLl9tb2RlbC51cGRhdGVTZWxlY3Rpb24obmV3U2VsZWN0aW9uIGFzIHVua25vd24gYXMgUywgdGhpcyk7XG4gICAgfSBlbHNlIGlmIChcbiAgICAgIHZhbHVlICYmXG4gICAgICAoaXNSYW5nZSB8fCAhdGhpcy5fZGF0ZUFkYXB0ZXIuc2FtZURhdGUodmFsdWUsIHNlbGVjdGlvbiBhcyB1bmtub3duIGFzIEQpKVxuICAgICkge1xuICAgICAgdGhpcy5fbW9kZWwuYWRkKHZhbHVlKTtcbiAgICB9XG5cbiAgICAvLyBEZWxlZ2F0ZSBjbG9zaW5nIHRoZSBvdmVybGF5IHRvIHRoZSBhY3Rpb25zLlxuICAgIGlmICgoIXRoaXMuX21vZGVsIHx8IHRoaXMuX21vZGVsLmlzQ29tcGxldGUoKSkgJiYgIXRoaXMuX2FjdGlvbnNQb3J0YWwpIHtcbiAgICAgIHRoaXMuZGF0ZXBpY2tlci5jbG9zZSgpO1xuICAgIH1cbiAgfVxuXG4gIF9oYW5kbGVVc2VyRHJhZ0Ryb3AoZXZlbnQ6IE1hdENhbGVuZGFyVXNlckV2ZW50PERhdGVSYW5nZTxEPj4pIHtcbiAgICB0aGlzLl9tb2RlbC51cGRhdGVTZWxlY3Rpb24oZXZlbnQudmFsdWUgYXMgdW5rbm93biBhcyBTLCB0aGlzKTtcbiAgfVxuXG4gIF9zdGFydEV4aXRBbmltYXRpb24oKSB7XG4gICAgdGhpcy5fYW5pbWF0aW9uU3RhdGUgPSAndm9pZCc7XG4gICAgdGhpcy5fY2hhbmdlRGV0ZWN0b3JSZWYubWFya0ZvckNoZWNrKCk7XG4gIH1cblxuICBfaGFuZGxlQW5pbWF0aW9uRXZlbnQoZXZlbnQ6IEFuaW1hdGlvbkV2ZW50KSB7XG4gICAgdGhpcy5faXNBbmltYXRpbmcgPSBldmVudC5waGFzZU5hbWUgPT09ICdzdGFydCc7XG5cbiAgICBpZiAoIXRoaXMuX2lzQW5pbWF0aW5nKSB7XG4gICAgICB0aGlzLl9hbmltYXRpb25Eb25lLm5leHQoKTtcbiAgICB9XG4gIH1cblxuICBfZ2V0U2VsZWN0ZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX21vZGVsLnNlbGVjdGlvbiBhcyB1bmtub3duIGFzIEQgfCBEYXRlUmFuZ2U8RD4gfCBudWxsO1xuICB9XG5cbiAgLyoqIEFwcGxpZXMgdGhlIGN1cnJlbnQgcGVuZGluZyBzZWxlY3Rpb24gdG8gdGhlIGdsb2JhbCBtb2RlbC4gKi9cbiAgX2FwcGx5UGVuZGluZ1NlbGVjdGlvbigpIHtcbiAgICBpZiAodGhpcy5fbW9kZWwgIT09IHRoaXMuX2dsb2JhbE1vZGVsKSB7XG4gICAgICB0aGlzLl9nbG9iYWxNb2RlbC51cGRhdGVTZWxlY3Rpb24odGhpcy5fbW9kZWwuc2VsZWN0aW9uLCB0aGlzKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQXNzaWducyBhIG5ldyBwb3J0YWwgY29udGFpbmluZyB0aGUgZGF0ZXBpY2tlciBhY3Rpb25zLlxuICAgKiBAcGFyYW0gcG9ydGFsIFBvcnRhbCB3aXRoIHRoZSBhY3Rpb25zIHRvIGJlIGFzc2lnbmVkLlxuICAgKiBAcGFyYW0gZm9yY2VSZXJlbmRlciBXaGV0aGVyIGEgcmUtcmVuZGVyIG9mIHRoZSBwb3J0YWwgc2hvdWxkIGJlIHRyaWdnZXJlZC4gVGhpcyBpc24ndFxuICAgKiBuZWNlc3NhcnkgaWYgdGhlIHBvcnRhbCBpcyBhc3NpZ25lZCBkdXJpbmcgaW5pdGlhbGl6YXRpb24sIGJ1dCBpdCBtYXkgYmUgcmVxdWlyZWQgaWYgaXQnc1xuICAgKiBhZGRlZCBhdCBhIGxhdGVyIHBvaW50LlxuICAgKi9cbiAgX2Fzc2lnbkFjdGlvbnMocG9ydGFsOiBUZW1wbGF0ZVBvcnRhbDxhbnk+IHwgbnVsbCwgZm9yY2VSZXJlbmRlcjogYm9vbGVhbikge1xuICAgIC8vIElmIHdlIGhhdmUgYWN0aW9ucywgY2xvbmUgdGhlIG1vZGVsIHNvIHRoYXQgd2UgaGF2ZSB0aGUgYWJpbGl0eSB0byBjYW5jZWwgdGhlIHNlbGVjdGlvbixcbiAgICAvLyBvdGhlcndpc2UgdXBkYXRlIHRoZSBnbG9iYWwgbW9kZWwgZGlyZWN0bHkuIE5vdGUgdGhhdCB3ZSB3YW50IHRvIGFzc2lnbiB0aGlzIGFzIHNvb24gYXNcbiAgICAvLyBwb3NzaWJsZSwgYnV0IGBfYWN0aW9uc1BvcnRhbGAgaXNuJ3QgYXZhaWxhYmxlIGluIHRoZSBjb25zdHJ1Y3RvciBzbyB3ZSBkbyBpdCBpbiBgbmdPbkluaXRgLlxuICAgIHRoaXMuX21vZGVsID0gcG9ydGFsID8gdGhpcy5fZ2xvYmFsTW9kZWwuY2xvbmUoKSA6IHRoaXMuX2dsb2JhbE1vZGVsO1xuICAgIHRoaXMuX2FjdGlvbnNQb3J0YWwgPSBwb3J0YWw7XG5cbiAgICBpZiAoZm9yY2VSZXJlbmRlcikge1xuICAgICAgdGhpcy5fY2hhbmdlRGV0ZWN0b3JSZWYuZGV0ZWN0Q2hhbmdlcygpO1xuICAgIH1cbiAgfVxufVxuXG4vKiogRm9ybSBjb250cm9sIHRoYXQgY2FuIGJlIGFzc29jaWF0ZWQgd2l0aCBhIGRhdGVwaWNrZXIuICovXG5leHBvcnQgaW50ZXJmYWNlIE1hdERhdGVwaWNrZXJDb250cm9sPEQ+IHtcbiAgZ2V0U3RhcnRWYWx1ZSgpOiBEIHwgbnVsbDtcbiAgZ2V0VGhlbWVQYWxldHRlKCk6IFRoZW1lUGFsZXR0ZTtcbiAgbWluOiBEIHwgbnVsbDtcbiAgbWF4OiBEIHwgbnVsbDtcbiAgZGlzYWJsZWQ6IGJvb2xlYW47XG4gIGRhdGVGaWx0ZXI6IERhdGVGaWx0ZXJGbjxEPjtcbiAgZ2V0Q29ubmVjdGVkT3ZlcmxheU9yaWdpbigpOiBFbGVtZW50UmVmO1xuICBnZXRPdmVybGF5TGFiZWxJZCgpOiBzdHJpbmcgfCBudWxsO1xuICBzdGF0ZUNoYW5nZXM6IE9ic2VydmFibGU8dm9pZD47XG59XG5cbi8qKiBBIGRhdGVwaWNrZXIgdGhhdCBjYW4gYmUgYXR0YWNoZWQgdG8gYSB7QGxpbmsgTWF0RGF0ZXBpY2tlckNvbnRyb2x9LiAqL1xuZXhwb3J0IGludGVyZmFjZSBNYXREYXRlcGlja2VyUGFuZWw8XG4gIEMgZXh0ZW5kcyBNYXREYXRlcGlja2VyQ29udHJvbDxEPixcbiAgUyxcbiAgRCA9IEV4dHJhY3REYXRlVHlwZUZyb21TZWxlY3Rpb248Uz4sXG4+IHtcbiAgLyoqIFN0cmVhbSB0aGF0IGVtaXRzIHdoZW5ldmVyIHRoZSBkYXRlIHBpY2tlciBpcyBjbG9zZWQuICovXG4gIGNsb3NlZFN0cmVhbTogRXZlbnRFbWl0dGVyPHZvaWQ+O1xuICAvKiogQ29sb3IgcGFsZXR0ZSB0byB1c2Ugb24gdGhlIGRhdGVwaWNrZXIncyBjYWxlbmRhci4gKi9cbiAgY29sb3I6IFRoZW1lUGFsZXR0ZTtcbiAgLyoqIFRoZSBpbnB1dCBlbGVtZW50IHRoZSBkYXRlcGlja2VyIGlzIGFzc29jaWF0ZWQgd2l0aC4gKi9cbiAgZGF0ZXBpY2tlcklucHV0OiBDO1xuICAvKiogV2hldGhlciB0aGUgZGF0ZXBpY2tlciBwb3AtdXAgc2hvdWxkIGJlIGRpc2FibGVkLiAqL1xuICBkaXNhYmxlZDogYm9vbGVhbjtcbiAgLyoqIFRoZSBpZCBmb3IgdGhlIGRhdGVwaWNrZXIncyBjYWxlbmRhci4gKi9cbiAgaWQ6IHN0cmluZztcbiAgLyoqIFdoZXRoZXIgdGhlIGRhdGVwaWNrZXIgaXMgb3Blbi4gKi9cbiAgb3BlbmVkOiBib29sZWFuO1xuICAvKiogU3RyZWFtIHRoYXQgZW1pdHMgd2hlbmV2ZXIgdGhlIGRhdGUgcGlja2VyIGlzIG9wZW5lZC4gKi9cbiAgb3BlbmVkU3RyZWFtOiBFdmVudEVtaXR0ZXI8dm9pZD47XG4gIC8qKiBFbWl0cyB3aGVuIHRoZSBkYXRlcGlja2VyJ3Mgc3RhdGUgY2hhbmdlcy4gKi9cbiAgc3RhdGVDaGFuZ2VzOiBTdWJqZWN0PHZvaWQ+O1xuICAvKiogT3BlbnMgdGhlIGRhdGVwaWNrZXIuICovXG4gIG9wZW4oKTogdm9pZDtcbiAgLyoqIFJlZ2lzdGVyIGFuIGlucHV0IHdpdGggdGhlIGRhdGVwaWNrZXIuICovXG4gIHJlZ2lzdGVySW5wdXQoaW5wdXQ6IEMpOiBNYXREYXRlU2VsZWN0aW9uTW9kZWw8UywgRD47XG59XG5cbi8qKiBCYXNlIGNsYXNzIGZvciBhIGRhdGVwaWNrZXIuICovXG5ARGlyZWN0aXZlKClcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBNYXREYXRlcGlja2VyQmFzZTxcbiAgQyBleHRlbmRzIE1hdERhdGVwaWNrZXJDb250cm9sPEQ+LFxuICBTLFxuICBEID0gRXh0cmFjdERhdGVUeXBlRnJvbVNlbGVjdGlvbjxTPixcbj4gaW1wbGVtZW50cyBNYXREYXRlcGlja2VyUGFuZWw8QywgUywgRD4sIE9uRGVzdHJveSwgT25DaGFuZ2VzXG57XG4gIHByaXZhdGUgX3Njcm9sbFN0cmF0ZWd5OiAoKSA9PiBTY3JvbGxTdHJhdGVneTtcbiAgcHJpdmF0ZSBfaW5wdXRTdGF0ZUNoYW5nZXMgPSBTdWJzY3JpcHRpb24uRU1QVFk7XG4gIHByaXZhdGUgX2RvY3VtZW50ID0gaW5qZWN0KERPQ1VNRU5UKTtcblxuICAvKiogQW4gaW5wdXQgaW5kaWNhdGluZyB0aGUgdHlwZSBvZiB0aGUgY3VzdG9tIGhlYWRlciBjb21wb25lbnQgZm9yIHRoZSBjYWxlbmRhciwgaWYgc2V0LiAqL1xuICBASW5wdXQoKSBjYWxlbmRhckhlYWRlckNvbXBvbmVudDogQ29tcG9uZW50VHlwZTxhbnk+O1xuXG4gIC8qKiBUaGUgZGF0ZSB0byBvcGVuIHRoZSBjYWxlbmRhciB0byBpbml0aWFsbHkuICovXG4gIEBJbnB1dCgpXG4gIGdldCBzdGFydEF0KCk6IEQgfCBudWxsIHtcbiAgICAvLyBJZiBhbiBleHBsaWNpdCBzdGFydEF0IGlzIHNldCB3ZSBzdGFydCB0aGVyZSwgb3RoZXJ3aXNlIHdlIHN0YXJ0IGF0IHdoYXRldmVyIHRoZSBjdXJyZW50bHlcbiAgICAvLyBzZWxlY3RlZCB2YWx1ZSBpcy5cbiAgICByZXR1cm4gdGhpcy5fc3RhcnRBdCB8fCAodGhpcy5kYXRlcGlja2VySW5wdXQgPyB0aGlzLmRhdGVwaWNrZXJJbnB1dC5nZXRTdGFydFZhbHVlKCkgOiBudWxsKTtcbiAgfVxuICBzZXQgc3RhcnRBdCh2YWx1ZTogRCB8IG51bGwpIHtcbiAgICB0aGlzLl9zdGFydEF0ID0gdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0VmFsaWREYXRlT3JOdWxsKHRoaXMuX2RhdGVBZGFwdGVyLmRlc2VyaWFsaXplKHZhbHVlKSk7XG4gIH1cbiAgcHJpdmF0ZSBfc3RhcnRBdDogRCB8IG51bGw7XG5cbiAgLyoqIFRoZSB2aWV3IHRoYXQgdGhlIGNhbGVuZGFyIHNob3VsZCBzdGFydCBpbi4gKi9cbiAgQElucHV0KCkgc3RhcnRWaWV3OiAnbW9udGgnIHwgJ3llYXInIHwgJ211bHRpLXllYXInID0gJ21vbnRoJztcblxuICAvKiogQ29sb3IgcGFsZXR0ZSB0byB1c2Ugb24gdGhlIGRhdGVwaWNrZXIncyBjYWxlbmRhci4gKi9cbiAgQElucHV0KClcbiAgZ2V0IGNvbG9yKCk6IFRoZW1lUGFsZXR0ZSB7XG4gICAgcmV0dXJuIChcbiAgICAgIHRoaXMuX2NvbG9yIHx8ICh0aGlzLmRhdGVwaWNrZXJJbnB1dCA/IHRoaXMuZGF0ZXBpY2tlcklucHV0LmdldFRoZW1lUGFsZXR0ZSgpIDogdW5kZWZpbmVkKVxuICAgICk7XG4gIH1cbiAgc2V0IGNvbG9yKHZhbHVlOiBUaGVtZVBhbGV0dGUpIHtcbiAgICB0aGlzLl9jb2xvciA9IHZhbHVlO1xuICB9XG4gIF9jb2xvcjogVGhlbWVQYWxldHRlO1xuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSBjYWxlbmRhciBVSSBpcyBpbiB0b3VjaCBtb2RlLiBJbiB0b3VjaCBtb2RlIHRoZSBjYWxlbmRhciBvcGVucyBpbiBhIGRpYWxvZyByYXRoZXJcbiAgICogdGhhbiBhIGRyb3Bkb3duIGFuZCBlbGVtZW50cyBoYXZlIG1vcmUgcGFkZGluZyB0byBhbGxvdyBmb3IgYmlnZ2VyIHRvdWNoIHRhcmdldHMuXG4gICAqL1xuICBASW5wdXQoKVxuICBnZXQgdG91Y2hVaSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fdG91Y2hVaTtcbiAgfVxuICBzZXQgdG91Y2hVaSh2YWx1ZTogQm9vbGVhbklucHV0KSB7XG4gICAgdGhpcy5fdG91Y2hVaSA9IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSh2YWx1ZSk7XG4gIH1cbiAgcHJpdmF0ZSBfdG91Y2hVaSA9IGZhbHNlO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBkYXRlcGlja2VyIHBvcC11cCBzaG91bGQgYmUgZGlzYWJsZWQuICovXG4gIEBJbnB1dCgpXG4gIGdldCBkaXNhYmxlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fZGlzYWJsZWQgPT09IHVuZGVmaW5lZCAmJiB0aGlzLmRhdGVwaWNrZXJJbnB1dFxuICAgICAgPyB0aGlzLmRhdGVwaWNrZXJJbnB1dC5kaXNhYmxlZFxuICAgICAgOiAhIXRoaXMuX2Rpc2FibGVkO1xuICB9XG4gIHNldCBkaXNhYmxlZCh2YWx1ZTogQm9vbGVhbklucHV0KSB7XG4gICAgY29uc3QgbmV3VmFsdWUgPSBjb2VyY2VCb29sZWFuUHJvcGVydHkodmFsdWUpO1xuXG4gICAgaWYgKG5ld1ZhbHVlICE9PSB0aGlzLl9kaXNhYmxlZCkge1xuICAgICAgdGhpcy5fZGlzYWJsZWQgPSBuZXdWYWx1ZTtcbiAgICAgIHRoaXMuc3RhdGVDaGFuZ2VzLm5leHQodW5kZWZpbmVkKTtcbiAgICB9XG4gIH1cbiAgcHJpdmF0ZSBfZGlzYWJsZWQ6IGJvb2xlYW47XG5cbiAgLyoqIFByZWZlcnJlZCBwb3NpdGlvbiBvZiB0aGUgZGF0ZXBpY2tlciBpbiB0aGUgWCBheGlzLiAqL1xuICBASW5wdXQoKVxuICB4UG9zaXRpb246IERhdGVwaWNrZXJEcm9wZG93blBvc2l0aW9uWCA9ICdzdGFydCc7XG5cbiAgLyoqIFByZWZlcnJlZCBwb3NpdGlvbiBvZiB0aGUgZGF0ZXBpY2tlciBpbiB0aGUgWSBheGlzLiAqL1xuICBASW5wdXQoKVxuICB5UG9zaXRpb246IERhdGVwaWNrZXJEcm9wZG93blBvc2l0aW9uWSA9ICdiZWxvdyc7XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdG8gcmVzdG9yZSBmb2N1cyB0byB0aGUgcHJldmlvdXNseS1mb2N1c2VkIGVsZW1lbnQgd2hlbiB0aGUgY2FsZW5kYXIgaXMgY2xvc2VkLlxuICAgKiBOb3RlIHRoYXQgYXV0b21hdGljIGZvY3VzIHJlc3RvcmF0aW9uIGlzIGFuIGFjY2Vzc2liaWxpdHkgZmVhdHVyZSBhbmQgaXQgaXMgcmVjb21tZW5kZWQgdGhhdFxuICAgKiB5b3UgcHJvdmlkZSB5b3VyIG93biBlcXVpdmFsZW50LCBpZiB5b3UgZGVjaWRlIHRvIHR1cm4gaXQgb2ZmLlxuICAgKi9cbiAgQElucHV0KClcbiAgZ2V0IHJlc3RvcmVGb2N1cygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fcmVzdG9yZUZvY3VzO1xuICB9XG4gIHNldCByZXN0b3JlRm9jdXModmFsdWU6IEJvb2xlYW5JbnB1dCkge1xuICAgIHRoaXMuX3Jlc3RvcmVGb2N1cyA9IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSh2YWx1ZSk7XG4gIH1cbiAgcHJpdmF0ZSBfcmVzdG9yZUZvY3VzID0gdHJ1ZTtcblxuICAvKipcbiAgICogRW1pdHMgc2VsZWN0ZWQgeWVhciBpbiBtdWx0aXllYXIgdmlldy5cbiAgICogVGhpcyBkb2Vzbid0IGltcGx5IGEgY2hhbmdlIG9uIHRoZSBzZWxlY3RlZCBkYXRlLlxuICAgKi9cbiAgQE91dHB1dCgpIHJlYWRvbmx5IHllYXJTZWxlY3RlZDogRXZlbnRFbWl0dGVyPEQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxEPigpO1xuXG4gIC8qKlxuICAgKiBFbWl0cyBzZWxlY3RlZCBtb250aCBpbiB5ZWFyIHZpZXcuXG4gICAqIFRoaXMgZG9lc24ndCBpbXBseSBhIGNoYW5nZSBvbiB0aGUgc2VsZWN0ZWQgZGF0ZS5cbiAgICovXG4gIEBPdXRwdXQoKSByZWFkb25seSBtb250aFNlbGVjdGVkOiBFdmVudEVtaXR0ZXI8RD4gPSBuZXcgRXZlbnRFbWl0dGVyPEQ+KCk7XG5cbiAgLyoqXG4gICAqIEVtaXRzIHdoZW4gdGhlIGN1cnJlbnQgdmlldyBjaGFuZ2VzLlxuICAgKi9cbiAgQE91dHB1dCgpIHJlYWRvbmx5IHZpZXdDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8TWF0Q2FsZW5kYXJWaWV3PiA9IG5ldyBFdmVudEVtaXR0ZXI8TWF0Q2FsZW5kYXJWaWV3PihcbiAgICB0cnVlLFxuICApO1xuXG4gIC8qKiBGdW5jdGlvbiB0aGF0IGNhbiBiZSB1c2VkIHRvIGFkZCBjdXN0b20gQ1NTIGNsYXNzZXMgdG8gZGF0ZXMuICovXG4gIEBJbnB1dCgpIGRhdGVDbGFzczogTWF0Q2FsZW5kYXJDZWxsQ2xhc3NGdW5jdGlvbjxEPjtcblxuICAvKiogRW1pdHMgd2hlbiB0aGUgZGF0ZXBpY2tlciBoYXMgYmVlbiBvcGVuZWQuICovXG4gIEBPdXRwdXQoJ29wZW5lZCcpIHJlYWRvbmx5IG9wZW5lZFN0cmVhbSA9IG5ldyBFdmVudEVtaXR0ZXI8dm9pZD4oKTtcblxuICAvKiogRW1pdHMgd2hlbiB0aGUgZGF0ZXBpY2tlciBoYXMgYmVlbiBjbG9zZWQuICovXG4gIEBPdXRwdXQoJ2Nsb3NlZCcpIHJlYWRvbmx5IGNsb3NlZFN0cmVhbSA9IG5ldyBFdmVudEVtaXR0ZXI8dm9pZD4oKTtcblxuICAvKipcbiAgICogQ2xhc3NlcyB0byBiZSBwYXNzZWQgdG8gdGhlIGRhdGUgcGlja2VyIHBhbmVsLlxuICAgKiBTdXBwb3J0cyBzdHJpbmcgYW5kIHN0cmluZyBhcnJheSB2YWx1ZXMsIHNpbWlsYXIgdG8gYG5nQ2xhc3NgLlxuICAgKi9cbiAgQElucHV0KClcbiAgZ2V0IHBhbmVsQ2xhc3MoKTogc3RyaW5nIHwgc3RyaW5nW10ge1xuICAgIHJldHVybiB0aGlzLl9wYW5lbENsYXNzO1xuICB9XG4gIHNldCBwYW5lbENsYXNzKHZhbHVlOiBzdHJpbmcgfCBzdHJpbmdbXSkge1xuICAgIHRoaXMuX3BhbmVsQ2xhc3MgPSBjb2VyY2VTdHJpbmdBcnJheSh2YWx1ZSk7XG4gIH1cbiAgcHJpdmF0ZSBfcGFuZWxDbGFzczogc3RyaW5nW107XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGNhbGVuZGFyIGlzIG9wZW4uICovXG4gIEBJbnB1dCgpXG4gIGdldCBvcGVuZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX29wZW5lZDtcbiAgfVxuICBzZXQgb3BlbmVkKHZhbHVlOiBCb29sZWFuSW5wdXQpIHtcbiAgICBjb2VyY2VCb29sZWFuUHJvcGVydHkodmFsdWUpID8gdGhpcy5vcGVuKCkgOiB0aGlzLmNsb3NlKCk7XG4gIH1cbiAgcHJpdmF0ZSBfb3BlbmVkID0gZmFsc2U7XG5cbiAgLyoqIFRoZSBpZCBmb3IgdGhlIGRhdGVwaWNrZXIgY2FsZW5kYXIuICovXG4gIGlkOiBzdHJpbmcgPSBgbWF0LWRhdGVwaWNrZXItJHtkYXRlcGlja2VyVWlkKyt9YDtcblxuICAvKiogVGhlIG1pbmltdW0gc2VsZWN0YWJsZSBkYXRlLiAqL1xuICBfZ2V0TWluRGF0ZSgpOiBEIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuZGF0ZXBpY2tlcklucHV0ICYmIHRoaXMuZGF0ZXBpY2tlcklucHV0Lm1pbjtcbiAgfVxuXG4gIC8qKiBUaGUgbWF4aW11bSBzZWxlY3RhYmxlIGRhdGUuICovXG4gIF9nZXRNYXhEYXRlKCk6IEQgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5kYXRlcGlja2VySW5wdXQgJiYgdGhpcy5kYXRlcGlja2VySW5wdXQubWF4O1xuICB9XG5cbiAgX2dldERhdGVGaWx0ZXIoKTogRGF0ZUZpbHRlckZuPEQ+IHtcbiAgICByZXR1cm4gdGhpcy5kYXRlcGlja2VySW5wdXQgJiYgdGhpcy5kYXRlcGlja2VySW5wdXQuZGF0ZUZpbHRlcjtcbiAgfVxuXG4gIC8qKiBBIHJlZmVyZW5jZSB0byB0aGUgb3ZlcmxheSBpbnRvIHdoaWNoIHdlJ3ZlIHJlbmRlcmVkIHRoZSBjYWxlbmRhci4gKi9cbiAgcHJpdmF0ZSBfb3ZlcmxheVJlZjogT3ZlcmxheVJlZiB8IG51bGw7XG5cbiAgLyoqIFJlZmVyZW5jZSB0byB0aGUgY29tcG9uZW50IGluc3RhbmNlIHJlbmRlcmVkIGluIHRoZSBvdmVybGF5LiAqL1xuICBwcml2YXRlIF9jb21wb25lbnRSZWY6IENvbXBvbmVudFJlZjxNYXREYXRlcGlja2VyQ29udGVudDxTLCBEPj4gfCBudWxsO1xuXG4gIC8qKiBUaGUgZWxlbWVudCB0aGF0IHdhcyBmb2N1c2VkIGJlZm9yZSB0aGUgZGF0ZXBpY2tlciB3YXMgb3BlbmVkLiAqL1xuICBwcml2YXRlIF9mb2N1c2VkRWxlbWVudEJlZm9yZU9wZW46IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqIFVuaXF1ZSBjbGFzcyB0aGF0IHdpbGwgYmUgYWRkZWQgdG8gdGhlIGJhY2tkcm9wIHNvIHRoYXQgdGhlIHRlc3QgaGFybmVzc2VzIGNhbiBsb29rIGl0IHVwLiAqL1xuICBwcml2YXRlIF9iYWNrZHJvcEhhcm5lc3NDbGFzcyA9IGAke3RoaXMuaWR9LWJhY2tkcm9wYDtcblxuICAvKiogQ3VycmVudGx5LXJlZ2lzdGVyZWQgYWN0aW9ucyBwb3J0YWwuICovXG4gIHByaXZhdGUgX2FjdGlvbnNQb3J0YWw6IFRlbXBsYXRlUG9ydGFsIHwgbnVsbDtcblxuICAvKiogVGhlIGlucHV0IGVsZW1lbnQgdGhpcyBkYXRlcGlja2VyIGlzIGFzc29jaWF0ZWQgd2l0aC4gKi9cbiAgZGF0ZXBpY2tlcklucHV0OiBDO1xuXG4gIC8qKiBFbWl0cyB3aGVuIHRoZSBkYXRlcGlja2VyJ3Mgc3RhdGUgY2hhbmdlcy4gKi9cbiAgcmVhZG9ubHkgc3RhdGVDaGFuZ2VzID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIF9vdmVybGF5OiBPdmVybGF5LFxuICAgIHByaXZhdGUgX25nWm9uZTogTmdab25lLFxuICAgIHByaXZhdGUgX3ZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWYsXG4gICAgQEluamVjdChNQVRfREFURVBJQ0tFUl9TQ1JPTExfU1RSQVRFR1kpIHNjcm9sbFN0cmF0ZWd5OiBhbnksXG4gICAgQE9wdGlvbmFsKCkgcHJpdmF0ZSBfZGF0ZUFkYXB0ZXI6IERhdGVBZGFwdGVyPEQ+LFxuICAgIEBPcHRpb25hbCgpIHByaXZhdGUgX2RpcjogRGlyZWN0aW9uYWxpdHksXG4gICAgcHJpdmF0ZSBfbW9kZWw6IE1hdERhdGVTZWxlY3Rpb25Nb2RlbDxTLCBEPixcbiAgKSB7XG4gICAgaWYgKCF0aGlzLl9kYXRlQWRhcHRlciAmJiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSkge1xuICAgICAgdGhyb3cgY3JlYXRlTWlzc2luZ0RhdGVJbXBsRXJyb3IoJ0RhdGVBZGFwdGVyJyk7XG4gICAgfVxuXG4gICAgdGhpcy5fc2Nyb2xsU3RyYXRlZ3kgPSBzY3JvbGxTdHJhdGVneTtcbiAgfVxuXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpIHtcbiAgICBjb25zdCBwb3NpdGlvbkNoYW5nZSA9IGNoYW5nZXNbJ3hQb3NpdGlvbiddIHx8IGNoYW5nZXNbJ3lQb3NpdGlvbiddO1xuXG4gICAgaWYgKHBvc2l0aW9uQ2hhbmdlICYmICFwb3NpdGlvbkNoYW5nZS5maXJzdENoYW5nZSAmJiB0aGlzLl9vdmVybGF5UmVmKSB7XG4gICAgICBjb25zdCBwb3NpdGlvblN0cmF0ZWd5ID0gdGhpcy5fb3ZlcmxheVJlZi5nZXRDb25maWcoKS5wb3NpdGlvblN0cmF0ZWd5O1xuXG4gICAgICBpZiAocG9zaXRpb25TdHJhdGVneSBpbnN0YW5jZW9mIEZsZXhpYmxlQ29ubmVjdGVkUG9zaXRpb25TdHJhdGVneSkge1xuICAgICAgICB0aGlzLl9zZXRDb25uZWN0ZWRQb3NpdGlvbnMocG9zaXRpb25TdHJhdGVneSk7XG5cbiAgICAgICAgaWYgKHRoaXMub3BlbmVkKSB7XG4gICAgICAgICAgdGhpcy5fb3ZlcmxheVJlZi51cGRhdGVQb3NpdGlvbigpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5zdGF0ZUNoYW5nZXMubmV4dCh1bmRlZmluZWQpO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5fZGVzdHJveU92ZXJsYXkoKTtcbiAgICB0aGlzLmNsb3NlKCk7XG4gICAgdGhpcy5faW5wdXRTdGF0ZUNoYW5nZXMudW5zdWJzY3JpYmUoKTtcbiAgICB0aGlzLnN0YXRlQ2hhbmdlcy5jb21wbGV0ZSgpO1xuICB9XG5cbiAgLyoqIFNlbGVjdHMgdGhlIGdpdmVuIGRhdGUgKi9cbiAgc2VsZWN0KGRhdGU6IEQpOiB2b2lkIHtcbiAgICB0aGlzLl9tb2RlbC5hZGQoZGF0ZSk7XG4gIH1cblxuICAvKiogRW1pdHMgdGhlIHNlbGVjdGVkIHllYXIgaW4gbXVsdGl5ZWFyIHZpZXcgKi9cbiAgX3NlbGVjdFllYXIobm9ybWFsaXplZFllYXI6IEQpOiB2b2lkIHtcbiAgICB0aGlzLnllYXJTZWxlY3RlZC5lbWl0KG5vcm1hbGl6ZWRZZWFyKTtcbiAgfVxuXG4gIC8qKiBFbWl0cyBzZWxlY3RlZCBtb250aCBpbiB5ZWFyIHZpZXcgKi9cbiAgX3NlbGVjdE1vbnRoKG5vcm1hbGl6ZWRNb250aDogRCk6IHZvaWQge1xuICAgIHRoaXMubW9udGhTZWxlY3RlZC5lbWl0KG5vcm1hbGl6ZWRNb250aCk7XG4gIH1cblxuICAvKiogRW1pdHMgY2hhbmdlZCB2aWV3ICovXG4gIF92aWV3Q2hhbmdlZCh2aWV3OiBNYXRDYWxlbmRhclZpZXcpOiB2b2lkIHtcbiAgICB0aGlzLnZpZXdDaGFuZ2VkLmVtaXQodmlldyk7XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXIgYW4gaW5wdXQgd2l0aCB0aGlzIGRhdGVwaWNrZXIuXG4gICAqIEBwYXJhbSBpbnB1dCBUaGUgZGF0ZXBpY2tlciBpbnB1dCB0byByZWdpc3RlciB3aXRoIHRoaXMgZGF0ZXBpY2tlci5cbiAgICogQHJldHVybnMgU2VsZWN0aW9uIG1vZGVsIHRoYXQgdGhlIGlucHV0IHNob3VsZCBob29rIGl0c2VsZiB1cCB0by5cbiAgICovXG4gIHJlZ2lzdGVySW5wdXQoaW5wdXQ6IEMpOiBNYXREYXRlU2VsZWN0aW9uTW9kZWw8UywgRD4ge1xuICAgIGlmICh0aGlzLmRhdGVwaWNrZXJJbnB1dCAmJiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSkge1xuICAgICAgdGhyb3cgRXJyb3IoJ0EgTWF0RGF0ZXBpY2tlciBjYW4gb25seSBiZSBhc3NvY2lhdGVkIHdpdGggYSBzaW5nbGUgaW5wdXQuJyk7XG4gICAgfVxuICAgIHRoaXMuX2lucHV0U3RhdGVDaGFuZ2VzLnVuc3Vic2NyaWJlKCk7XG4gICAgdGhpcy5kYXRlcGlja2VySW5wdXQgPSBpbnB1dDtcbiAgICB0aGlzLl9pbnB1dFN0YXRlQ2hhbmdlcyA9IGlucHV0LnN0YXRlQ2hhbmdlcy5zdWJzY3JpYmUoKCkgPT4gdGhpcy5zdGF0ZUNoYW5nZXMubmV4dCh1bmRlZmluZWQpKTtcbiAgICByZXR1cm4gdGhpcy5fbW9kZWw7XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXJzIGEgcG9ydGFsIGNvbnRhaW5pbmcgYWN0aW9uIGJ1dHRvbnMgd2l0aCB0aGUgZGF0ZXBpY2tlci5cbiAgICogQHBhcmFtIHBvcnRhbCBQb3J0YWwgdG8gYmUgcmVnaXN0ZXJlZC5cbiAgICovXG4gIHJlZ2lzdGVyQWN0aW9ucyhwb3J0YWw6IFRlbXBsYXRlUG9ydGFsKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2FjdGlvbnNQb3J0YWwgJiYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkpIHtcbiAgICAgIHRocm93IEVycm9yKCdBIE1hdERhdGVwaWNrZXIgY2FuIG9ubHkgYmUgYXNzb2NpYXRlZCB3aXRoIGEgc2luZ2xlIGFjdGlvbnMgcm93LicpO1xuICAgIH1cbiAgICB0aGlzLl9hY3Rpb25zUG9ydGFsID0gcG9ydGFsO1xuICAgIHRoaXMuX2NvbXBvbmVudFJlZj8uaW5zdGFuY2UuX2Fzc2lnbkFjdGlvbnMocG9ydGFsLCB0cnVlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGEgcG9ydGFsIGNvbnRhaW5pbmcgYWN0aW9uIGJ1dHRvbnMgZnJvbSB0aGUgZGF0ZXBpY2tlci5cbiAgICogQHBhcmFtIHBvcnRhbCBQb3J0YWwgdG8gYmUgcmVtb3ZlZC5cbiAgICovXG4gIHJlbW92ZUFjdGlvbnMocG9ydGFsOiBUZW1wbGF0ZVBvcnRhbCk6IHZvaWQge1xuICAgIGlmIChwb3J0YWwgPT09IHRoaXMuX2FjdGlvbnNQb3J0YWwpIHtcbiAgICAgIHRoaXMuX2FjdGlvbnNQb3J0YWwgPSBudWxsO1xuICAgICAgdGhpcy5fY29tcG9uZW50UmVmPy5pbnN0YW5jZS5fYXNzaWduQWN0aW9ucyhudWxsLCB0cnVlKTtcbiAgICB9XG4gIH1cblxuICAvKiogT3BlbiB0aGUgY2FsZW5kYXIuICovXG4gIG9wZW4oKTogdm9pZCB7XG4gICAgLy8gU2tpcCByZW9wZW5pbmcgaWYgdGhlcmUncyBhbiBpbi1wcm9ncmVzcyBhbmltYXRpb24gdG8gYXZvaWQgb3ZlcmxhcHBpbmdcbiAgICAvLyBzZXF1ZW5jZXMgd2hpY2ggY2FuIGNhdXNlIFwiY2hhbmdlZCBhZnRlciBjaGVja2VkXCIgZXJyb3JzLiBTZWUgIzI1ODM3LlxuICAgIGlmICh0aGlzLl9vcGVuZWQgfHwgdGhpcy5kaXNhYmxlZCB8fCB0aGlzLl9jb21wb25lbnRSZWY/Lmluc3RhbmNlLl9pc0FuaW1hdGluZykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5kYXRlcGlja2VySW5wdXQgJiYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkpIHtcbiAgICAgIHRocm93IEVycm9yKCdBdHRlbXB0ZWQgdG8gb3BlbiBhbiBNYXREYXRlcGlja2VyIHdpdGggbm8gYXNzb2NpYXRlZCBpbnB1dC4nKTtcbiAgICB9XG5cbiAgICB0aGlzLl9mb2N1c2VkRWxlbWVudEJlZm9yZU9wZW4gPSBfZ2V0Rm9jdXNlZEVsZW1lbnRQaWVyY2VTaGFkb3dEb20oKTtcbiAgICB0aGlzLl9vcGVuT3ZlcmxheSgpO1xuICAgIHRoaXMuX29wZW5lZCA9IHRydWU7XG4gICAgdGhpcy5vcGVuZWRTdHJlYW0uZW1pdCgpO1xuICB9XG5cbiAgLyoqIENsb3NlIHRoZSBjYWxlbmRhci4gKi9cbiAgY2xvc2UoKTogdm9pZCB7XG4gICAgLy8gU2tpcCByZW9wZW5pbmcgaWYgdGhlcmUncyBhbiBpbi1wcm9ncmVzcyBhbmltYXRpb24gdG8gYXZvaWQgb3ZlcmxhcHBpbmdcbiAgICAvLyBzZXF1ZW5jZXMgd2hpY2ggY2FuIGNhdXNlIFwiY2hhbmdlZCBhZnRlciBjaGVja2VkXCIgZXJyb3JzLiBTZWUgIzI1ODM3LlxuICAgIGlmICghdGhpcy5fb3BlbmVkIHx8IHRoaXMuX2NvbXBvbmVudFJlZj8uaW5zdGFuY2UuX2lzQW5pbWF0aW5nKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgY2FuUmVzdG9yZUZvY3VzID1cbiAgICAgIHRoaXMuX3Jlc3RvcmVGb2N1cyAmJlxuICAgICAgdGhpcy5fZm9jdXNlZEVsZW1lbnRCZWZvcmVPcGVuICYmXG4gICAgICB0eXBlb2YgdGhpcy5fZm9jdXNlZEVsZW1lbnRCZWZvcmVPcGVuLmZvY3VzID09PSAnZnVuY3Rpb24nO1xuXG4gICAgY29uc3QgY29tcGxldGVDbG9zZSA9ICgpID0+IHtcbiAgICAgIC8vIFRoZSBgX29wZW5lZGAgY291bGQndmUgYmVlbiByZXNldCBhbHJlYWR5IGlmXG4gICAgICAvLyB3ZSBnb3QgdHdvIGV2ZW50cyBpbiBxdWljayBzdWNjZXNzaW9uLlxuICAgICAgaWYgKHRoaXMuX29wZW5lZCkge1xuICAgICAgICB0aGlzLl9vcGVuZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5jbG9zZWRTdHJlYW0uZW1pdCgpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBpZiAodGhpcy5fY29tcG9uZW50UmVmKSB7XG4gICAgICBjb25zdCB7aW5zdGFuY2UsIGxvY2F0aW9ufSA9IHRoaXMuX2NvbXBvbmVudFJlZjtcbiAgICAgIGluc3RhbmNlLl9zdGFydEV4aXRBbmltYXRpb24oKTtcbiAgICAgIGluc3RhbmNlLl9hbmltYXRpb25Eb25lLnBpcGUodGFrZSgxKSkuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgY29uc3QgYWN0aXZlRWxlbWVudCA9IHRoaXMuX2RvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7XG5cbiAgICAgICAgLy8gU2luY2Ugd2UgcmVzdG9yZSBmb2N1cyBhZnRlciB0aGUgZXhpdCBhbmltYXRpb24sIHdlIGhhdmUgdG8gY2hlY2sgdGhhdFxuICAgICAgICAvLyB0aGUgdXNlciBkaWRuJ3QgbW92ZSBmb2N1cyB0aGVtc2VsdmVzIGluc2lkZSB0aGUgYGNsb3NlYCBoYW5kbGVyLlxuICAgICAgICBpZiAoXG4gICAgICAgICAgY2FuUmVzdG9yZUZvY3VzICYmXG4gICAgICAgICAgKCFhY3RpdmVFbGVtZW50IHx8XG4gICAgICAgICAgICBhY3RpdmVFbGVtZW50ID09PSB0aGlzLl9kb2N1bWVudC5hY3RpdmVFbGVtZW50IHx8XG4gICAgICAgICAgICBsb2NhdGlvbi5uYXRpdmVFbGVtZW50LmNvbnRhaW5zKGFjdGl2ZUVsZW1lbnQpKVxuICAgICAgICApIHtcbiAgICAgICAgICB0aGlzLl9mb2N1c2VkRWxlbWVudEJlZm9yZU9wZW4hLmZvY3VzKCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9mb2N1c2VkRWxlbWVudEJlZm9yZU9wZW4gPSBudWxsO1xuICAgICAgICB0aGlzLl9kZXN0cm95T3ZlcmxheSgpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKGNhblJlc3RvcmVGb2N1cykge1xuICAgICAgLy8gQmVjYXVzZSBJRSBtb3ZlcyBmb2N1cyBhc3luY2hyb25vdXNseSwgd2UgY2FuJ3QgY291bnQgb24gaXQgYmVpbmcgcmVzdG9yZWQgYmVmb3JlIHdlJ3ZlXG4gICAgICAvLyBtYXJrZWQgdGhlIGRhdGVwaWNrZXIgYXMgY2xvc2VkLiBJZiB0aGUgZXZlbnQgZmlyZXMgb3V0IG9mIHNlcXVlbmNlIGFuZCB0aGUgZWxlbWVudCB0aGF0XG4gICAgICAvLyB3ZSdyZSByZWZvY3VzaW5nIG9wZW5zIHRoZSBkYXRlcGlja2VyIG9uIGZvY3VzLCB0aGUgdXNlciBjb3VsZCBiZSBzdHVjayB3aXRoIG5vdCBiZWluZ1xuICAgICAgLy8gYWJsZSB0byBjbG9zZSB0aGUgY2FsZW5kYXIgYXQgYWxsLiBXZSB3b3JrIGFyb3VuZCBpdCBieSBtYWtpbmcgdGhlIGxvZ2ljLCB0aGF0IG1hcmtzXG4gICAgICAvLyB0aGUgZGF0ZXBpY2tlciBhcyBjbG9zZWQsIGFzeW5jIGFzIHdlbGwuXG4gICAgICBzZXRUaW1lb3V0KGNvbXBsZXRlQ2xvc2UpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb21wbGV0ZUNsb3NlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEFwcGxpZXMgdGhlIGN1cnJlbnQgcGVuZGluZyBzZWxlY3Rpb24gb24gdGhlIG92ZXJsYXkgdG8gdGhlIG1vZGVsLiAqL1xuICBfYXBwbHlQZW5kaW5nU2VsZWN0aW9uKCkge1xuICAgIHRoaXMuX2NvbXBvbmVudFJlZj8uaW5zdGFuY2U/Ll9hcHBseVBlbmRpbmdTZWxlY3Rpb24oKTtcbiAgfVxuXG4gIC8qKiBGb3J3YXJkcyByZWxldmFudCB2YWx1ZXMgZnJvbSB0aGUgZGF0ZXBpY2tlciB0byB0aGUgZGF0ZXBpY2tlciBjb250ZW50IGluc2lkZSB0aGUgb3ZlcmxheS4gKi9cbiAgcHJvdGVjdGVkIF9mb3J3YXJkQ29udGVudFZhbHVlcyhpbnN0YW5jZTogTWF0RGF0ZXBpY2tlckNvbnRlbnQ8UywgRD4pIHtcbiAgICBpbnN0YW5jZS5kYXRlcGlja2VyID0gdGhpcztcbiAgICBpbnN0YW5jZS5jb2xvciA9IHRoaXMuY29sb3I7XG4gICAgaW5zdGFuY2UuX2RpYWxvZ0xhYmVsSWQgPSB0aGlzLmRhdGVwaWNrZXJJbnB1dC5nZXRPdmVybGF5TGFiZWxJZCgpO1xuICAgIGluc3RhbmNlLl9hc3NpZ25BY3Rpb25zKHRoaXMuX2FjdGlvbnNQb3J0YWwsIGZhbHNlKTtcbiAgfVxuXG4gIC8qKiBPcGVucyB0aGUgb3ZlcmxheSB3aXRoIHRoZSBjYWxlbmRhci4gKi9cbiAgcHJpdmF0ZSBfb3Blbk92ZXJsYXkoKTogdm9pZCB7XG4gICAgdGhpcy5fZGVzdHJveU92ZXJsYXkoKTtcblxuICAgIGNvbnN0IGlzRGlhbG9nID0gdGhpcy50b3VjaFVpO1xuICAgIGNvbnN0IHBvcnRhbCA9IG5ldyBDb21wb25lbnRQb3J0YWw8TWF0RGF0ZXBpY2tlckNvbnRlbnQ8UywgRD4+KFxuICAgICAgTWF0RGF0ZXBpY2tlckNvbnRlbnQsXG4gICAgICB0aGlzLl92aWV3Q29udGFpbmVyUmVmLFxuICAgICk7XG4gICAgY29uc3Qgb3ZlcmxheVJlZiA9ICh0aGlzLl9vdmVybGF5UmVmID0gdGhpcy5fb3ZlcmxheS5jcmVhdGUoXG4gICAgICBuZXcgT3ZlcmxheUNvbmZpZyh7XG4gICAgICAgIHBvc2l0aW9uU3RyYXRlZ3k6IGlzRGlhbG9nID8gdGhpcy5fZ2V0RGlhbG9nU3RyYXRlZ3koKSA6IHRoaXMuX2dldERyb3Bkb3duU3RyYXRlZ3koKSxcbiAgICAgICAgaGFzQmFja2Ryb3A6IHRydWUsXG4gICAgICAgIGJhY2tkcm9wQ2xhc3M6IFtcbiAgICAgICAgICBpc0RpYWxvZyA/ICdjZGstb3ZlcmxheS1kYXJrLWJhY2tkcm9wJyA6ICdtYXQtb3ZlcmxheS10cmFuc3BhcmVudC1iYWNrZHJvcCcsXG4gICAgICAgICAgdGhpcy5fYmFja2Ryb3BIYXJuZXNzQ2xhc3MsXG4gICAgICAgIF0sXG4gICAgICAgIGRpcmVjdGlvbjogdGhpcy5fZGlyLFxuICAgICAgICBzY3JvbGxTdHJhdGVneTogaXNEaWFsb2cgPyB0aGlzLl9vdmVybGF5LnNjcm9sbFN0cmF0ZWdpZXMuYmxvY2soKSA6IHRoaXMuX3Njcm9sbFN0cmF0ZWd5KCksXG4gICAgICAgIHBhbmVsQ2xhc3M6IGBtYXQtZGF0ZXBpY2tlci0ke2lzRGlhbG9nID8gJ2RpYWxvZycgOiAncG9wdXAnfWAsXG4gICAgICB9KSxcbiAgICApKTtcblxuICAgIHRoaXMuX2dldENsb3NlU3RyZWFtKG92ZXJsYXlSZWYpLnN1YnNjcmliZShldmVudCA9PiB7XG4gICAgICBpZiAoZXZlbnQpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICB9KTtcblxuICAgIC8vIFRoZSBgcHJldmVudERlZmF1bHRgIGNhbGwgaGFwcGVucyBpbnNpZGUgdGhlIGNhbGVuZGFyIGFzIHdlbGwsIGhvd2V2ZXIgZm9jdXMgbW92ZXMgaW50b1xuICAgIC8vIGl0IGluc2lkZSBhIHRpbWVvdXQgd2hpY2ggY2FuIGdpdmUgYnJvd3NlcnMgYSBjaGFuY2UgdG8gZmlyZSBvZmYgYSBrZXlib2FyZCBldmVudCBpbi1iZXR3ZWVuXG4gICAgLy8gdGhhdCBjYW4gc2Nyb2xsIHRoZSBwYWdlIChzZWUgIzI0OTY5KS4gQWx3YXlzIGJsb2NrIGRlZmF1bHQgYWN0aW9ucyBvZiBhcnJvdyBrZXlzIGZvciB0aGVcbiAgICAvLyBlbnRpcmUgb3ZlcmxheSBzbyB0aGUgcGFnZSBkb2Vzbid0IGdldCBzY3JvbGxlZCBieSBhY2NpZGVudC5cbiAgICBvdmVybGF5UmVmLmtleWRvd25FdmVudHMoKS5zdWJzY3JpYmUoZXZlbnQgPT4ge1xuICAgICAgY29uc3Qga2V5Q29kZSA9IGV2ZW50LmtleUNvZGU7XG5cbiAgICAgIGlmIChcbiAgICAgICAga2V5Q29kZSA9PT0gVVBfQVJST1cgfHxcbiAgICAgICAga2V5Q29kZSA9PT0gRE9XTl9BUlJPVyB8fFxuICAgICAgICBrZXlDb2RlID09PSBMRUZUX0FSUk9XIHx8XG4gICAgICAgIGtleUNvZGUgPT09IFJJR0hUX0FSUk9XIHx8XG4gICAgICAgIGtleUNvZGUgPT09IFBBR0VfVVAgfHxcbiAgICAgICAga2V5Q29kZSA9PT0gUEFHRV9ET1dOXG4gICAgICApIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuX2NvbXBvbmVudFJlZiA9IG92ZXJsYXlSZWYuYXR0YWNoKHBvcnRhbCk7XG4gICAgdGhpcy5fZm9yd2FyZENvbnRlbnRWYWx1ZXModGhpcy5fY29tcG9uZW50UmVmLmluc3RhbmNlKTtcblxuICAgIC8vIFVwZGF0ZSB0aGUgcG9zaXRpb24gb25jZSB0aGUgY2FsZW5kYXIgaGFzIHJlbmRlcmVkLiBPbmx5IHJlbGV2YW50IGluIGRyb3Bkb3duIG1vZGUuXG4gICAgaWYgKCFpc0RpYWxvZykge1xuICAgICAgdGhpcy5fbmdab25lLm9uU3RhYmxlLnBpcGUodGFrZSgxKSkuc3Vic2NyaWJlKCgpID0+IG92ZXJsYXlSZWYudXBkYXRlUG9zaXRpb24oKSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIERlc3Ryb3lzIHRoZSBjdXJyZW50IG92ZXJsYXkuICovXG4gIHByaXZhdGUgX2Rlc3Ryb3lPdmVybGF5KCkge1xuICAgIGlmICh0aGlzLl9vdmVybGF5UmVmKSB7XG4gICAgICB0aGlzLl9vdmVybGF5UmVmLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX292ZXJsYXlSZWYgPSB0aGlzLl9jb21wb25lbnRSZWYgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBHZXRzIGEgcG9zaXRpb24gc3RyYXRlZ3kgdGhhdCB3aWxsIG9wZW4gdGhlIGNhbGVuZGFyIGFzIGEgZHJvcGRvd24uICovXG4gIHByaXZhdGUgX2dldERpYWxvZ1N0cmF0ZWd5KCkge1xuICAgIHJldHVybiB0aGlzLl9vdmVybGF5LnBvc2l0aW9uKCkuZ2xvYmFsKCkuY2VudGVySG9yaXpvbnRhbGx5KCkuY2VudGVyVmVydGljYWxseSgpO1xuICB9XG5cbiAgLyoqIEdldHMgYSBwb3NpdGlvbiBzdHJhdGVneSB0aGF0IHdpbGwgb3BlbiB0aGUgY2FsZW5kYXIgYXMgYSBkcm9wZG93bi4gKi9cbiAgcHJpdmF0ZSBfZ2V0RHJvcGRvd25TdHJhdGVneSgpIHtcbiAgICBjb25zdCBzdHJhdGVneSA9IHRoaXMuX292ZXJsYXlcbiAgICAgIC5wb3NpdGlvbigpXG4gICAgICAuZmxleGlibGVDb25uZWN0ZWRUbyh0aGlzLmRhdGVwaWNrZXJJbnB1dC5nZXRDb25uZWN0ZWRPdmVybGF5T3JpZ2luKCkpXG4gICAgICAud2l0aFRyYW5zZm9ybU9yaWdpbk9uKCcubWF0LWRhdGVwaWNrZXItY29udGVudCcpXG4gICAgICAud2l0aEZsZXhpYmxlRGltZW5zaW9ucyhmYWxzZSlcbiAgICAgIC53aXRoVmlld3BvcnRNYXJnaW4oOClcbiAgICAgIC53aXRoTG9ja2VkUG9zaXRpb24oKTtcblxuICAgIHJldHVybiB0aGlzLl9zZXRDb25uZWN0ZWRQb3NpdGlvbnMoc3RyYXRlZ3kpO1xuICB9XG5cbiAgLyoqIFNldHMgdGhlIHBvc2l0aW9ucyBvZiB0aGUgZGF0ZXBpY2tlciBpbiBkcm9wZG93biBtb2RlIGJhc2VkIG9uIHRoZSBjdXJyZW50IGNvbmZpZ3VyYXRpb24uICovXG4gIHByaXZhdGUgX3NldENvbm5lY3RlZFBvc2l0aW9ucyhzdHJhdGVneTogRmxleGlibGVDb25uZWN0ZWRQb3NpdGlvblN0cmF0ZWd5KSB7XG4gICAgY29uc3QgcHJpbWFyeVggPSB0aGlzLnhQb3NpdGlvbiA9PT0gJ2VuZCcgPyAnZW5kJyA6ICdzdGFydCc7XG4gICAgY29uc3Qgc2Vjb25kYXJ5WCA9IHByaW1hcnlYID09PSAnc3RhcnQnID8gJ2VuZCcgOiAnc3RhcnQnO1xuICAgIGNvbnN0IHByaW1hcnlZID0gdGhpcy55UG9zaXRpb24gPT09ICdhYm92ZScgPyAnYm90dG9tJyA6ICd0b3AnO1xuICAgIGNvbnN0IHNlY29uZGFyeVkgPSBwcmltYXJ5WSA9PT0gJ3RvcCcgPyAnYm90dG9tJyA6ICd0b3AnO1xuXG4gICAgcmV0dXJuIHN0cmF0ZWd5LndpdGhQb3NpdGlvbnMoW1xuICAgICAge1xuICAgICAgICBvcmlnaW5YOiBwcmltYXJ5WCxcbiAgICAgICAgb3JpZ2luWTogc2Vjb25kYXJ5WSxcbiAgICAgICAgb3ZlcmxheVg6IHByaW1hcnlYLFxuICAgICAgICBvdmVybGF5WTogcHJpbWFyeVksXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBvcmlnaW5YOiBwcmltYXJ5WCxcbiAgICAgICAgb3JpZ2luWTogcHJpbWFyeVksXG4gICAgICAgIG92ZXJsYXlYOiBwcmltYXJ5WCxcbiAgICAgICAgb3ZlcmxheVk6IHNlY29uZGFyeVksXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBvcmlnaW5YOiBzZWNvbmRhcnlYLFxuICAgICAgICBvcmlnaW5ZOiBzZWNvbmRhcnlZLFxuICAgICAgICBvdmVybGF5WDogc2Vjb25kYXJ5WCxcbiAgICAgICAgb3ZlcmxheVk6IHByaW1hcnlZLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgb3JpZ2luWDogc2Vjb25kYXJ5WCxcbiAgICAgICAgb3JpZ2luWTogcHJpbWFyeVksXG4gICAgICAgIG92ZXJsYXlYOiBzZWNvbmRhcnlYLFxuICAgICAgICBvdmVybGF5WTogc2Vjb25kYXJ5WSxcbiAgICAgIH0sXG4gICAgXSk7XG4gIH1cblxuICAvKiogR2V0cyBhbiBvYnNlcnZhYmxlIHRoYXQgd2lsbCBlbWl0IHdoZW4gdGhlIG92ZXJsYXkgaXMgc3VwcG9zZWQgdG8gYmUgY2xvc2VkLiAqL1xuICBwcml2YXRlIF9nZXRDbG9zZVN0cmVhbShvdmVybGF5UmVmOiBPdmVybGF5UmVmKSB7XG4gICAgY29uc3QgY3RybFNoaWZ0TWV0YU1vZGlmaWVyczogTW9kaWZpZXJLZXlbXSA9IFsnY3RybEtleScsICdzaGlmdEtleScsICdtZXRhS2V5J107XG4gICAgcmV0dXJuIG1lcmdlKFxuICAgICAgb3ZlcmxheVJlZi5iYWNrZHJvcENsaWNrKCksXG4gICAgICBvdmVybGF5UmVmLmRldGFjaG1lbnRzKCksXG4gICAgICBvdmVybGF5UmVmLmtleWRvd25FdmVudHMoKS5waXBlKFxuICAgICAgICBmaWx0ZXIoZXZlbnQgPT4ge1xuICAgICAgICAgIC8vIENsb3Npbmcgb24gYWx0ICsgdXAgaXMgb25seSB2YWxpZCB3aGVuIHRoZXJlJ3MgYW4gaW5wdXQgYXNzb2NpYXRlZCB3aXRoIHRoZSBkYXRlcGlja2VyLlxuICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAoZXZlbnQua2V5Q29kZSA9PT0gRVNDQVBFICYmICFoYXNNb2RpZmllcktleShldmVudCkpIHx8XG4gICAgICAgICAgICAodGhpcy5kYXRlcGlja2VySW5wdXQgJiZcbiAgICAgICAgICAgICAgaGFzTW9kaWZpZXJLZXkoZXZlbnQsICdhbHRLZXknKSAmJlxuICAgICAgICAgICAgICBldmVudC5rZXlDb2RlID09PSBVUF9BUlJPVyAmJlxuICAgICAgICAgICAgICBjdHJsU2hpZnRNZXRhTW9kaWZpZXJzLmV2ZXJ5KFxuICAgICAgICAgICAgICAgIChtb2RpZmllcjogTW9kaWZpZXJLZXkpID0+ICFoYXNNb2RpZmllcktleShldmVudCwgbW9kaWZpZXIpLFxuICAgICAgICAgICAgICApKVxuICAgICAgICAgICk7XG4gICAgICAgIH0pLFxuICAgICAgKSxcbiAgICApO1xuICB9XG59XG4iLCI8ZGl2XG4gIGNka1RyYXBGb2N1c1xuICByb2xlPVwiZGlhbG9nXCJcbiAgW2F0dHIuYXJpYS1tb2RhbF09XCJ0cnVlXCJcbiAgW2F0dHIuYXJpYS1sYWJlbGxlZGJ5XT1cIl9kaWFsb2dMYWJlbElkID8/IHVuZGVmaW5lZFwiXG4gIGNsYXNzPVwibWF0LWRhdGVwaWNrZXItY29udGVudC1jb250YWluZXJcIlxuICBbY2xhc3MubWF0LWRhdGVwaWNrZXItY29udGVudC1jb250YWluZXItd2l0aC1jdXN0b20taGVhZGVyXT1cImRhdGVwaWNrZXIuY2FsZW5kYXJIZWFkZXJDb21wb25lbnRcIlxuICBbY2xhc3MubWF0LWRhdGVwaWNrZXItY29udGVudC1jb250YWluZXItd2l0aC1hY3Rpb25zXT1cIl9hY3Rpb25zUG9ydGFsXCI+XG4gIDxtYXQtY2FsZW5kYXJcbiAgICBbaWRdPVwiZGF0ZXBpY2tlci5pZFwiXG4gICAgW25nQ2xhc3NdPVwiZGF0ZXBpY2tlci5wYW5lbENsYXNzXCJcbiAgICBbc3RhcnRBdF09XCJkYXRlcGlja2VyLnN0YXJ0QXRcIlxuICAgIFtzdGFydFZpZXddPVwiZGF0ZXBpY2tlci5zdGFydFZpZXdcIlxuICAgIFttaW5EYXRlXT1cImRhdGVwaWNrZXIuX2dldE1pbkRhdGUoKVwiXG4gICAgW21heERhdGVdPVwiZGF0ZXBpY2tlci5fZ2V0TWF4RGF0ZSgpXCJcbiAgICBbZGF0ZUZpbHRlcl09XCJkYXRlcGlja2VyLl9nZXREYXRlRmlsdGVyKClcIlxuICAgIFtoZWFkZXJDb21wb25lbnRdPVwiZGF0ZXBpY2tlci5jYWxlbmRhckhlYWRlckNvbXBvbmVudFwiXG4gICAgW3NlbGVjdGVkXT1cIl9nZXRTZWxlY3RlZCgpXCJcbiAgICBbZGF0ZUNsYXNzXT1cImRhdGVwaWNrZXIuZGF0ZUNsYXNzXCJcbiAgICBbY29tcGFyaXNvblN0YXJ0XT1cImNvbXBhcmlzb25TdGFydFwiXG4gICAgW2NvbXBhcmlzb25FbmRdPVwiY29tcGFyaXNvbkVuZFwiXG4gICAgW0BmYWRlSW5DYWxlbmRhcl09XCInZW50ZXInXCJcbiAgICBbc3RhcnREYXRlQWNjZXNzaWJsZU5hbWVdPVwic3RhcnREYXRlQWNjZXNzaWJsZU5hbWVcIlxuICAgIFtlbmREYXRlQWNjZXNzaWJsZU5hbWVdPVwiZW5kRGF0ZUFjY2Vzc2libGVOYW1lXCJcbiAgICAoeWVhclNlbGVjdGVkKT1cImRhdGVwaWNrZXIuX3NlbGVjdFllYXIoJGV2ZW50KVwiXG4gICAgKG1vbnRoU2VsZWN0ZWQpPVwiZGF0ZXBpY2tlci5fc2VsZWN0TW9udGgoJGV2ZW50KVwiXG4gICAgKHZpZXdDaGFuZ2VkKT1cImRhdGVwaWNrZXIuX3ZpZXdDaGFuZ2VkKCRldmVudClcIlxuICAgIChfdXNlclNlbGVjdGlvbik9XCJfaGFuZGxlVXNlclNlbGVjdGlvbigkZXZlbnQpXCJcbiAgICAoX3VzZXJEcmFnRHJvcCk9XCJfaGFuZGxlVXNlckRyYWdEcm9wKCRldmVudClcIj48L21hdC1jYWxlbmRhcj5cblxuICA8bmctdGVtcGxhdGUgW2Nka1BvcnRhbE91dGxldF09XCJfYWN0aW9uc1BvcnRhbFwiPjwvbmctdGVtcGxhdGU+XG5cbiAgPCEtLSBJbnZpc2libGUgY2xvc2UgYnV0dG9uIGZvciBzY3JlZW4gcmVhZGVyIHVzZXJzLiAtLT5cbiAgPGJ1dHRvblxuICAgIHR5cGU9XCJidXR0b25cIlxuICAgIG1hdC1yYWlzZWQtYnV0dG9uXG4gICAgW2NvbG9yXT1cImNvbG9yIHx8ICdwcmltYXJ5J1wiXG4gICAgY2xhc3M9XCJtYXQtZGF0ZXBpY2tlci1jbG9zZS1idXR0b25cIlxuICAgIFtjbGFzcy5jZGstdmlzdWFsbHktaGlkZGVuXT1cIiFfY2xvc2VCdXR0b25Gb2N1c2VkXCJcbiAgICAoZm9jdXMpPVwiX2Nsb3NlQnV0dG9uRm9jdXNlZCA9IHRydWVcIlxuICAgIChibHVyKT1cIl9jbG9zZUJ1dHRvbkZvY3VzZWQgPSBmYWxzZVwiXG4gICAgKGNsaWNrKT1cImRhdGVwaWNrZXIuY2xvc2UoKVwiPnt7IF9jbG9zZUJ1dHRvblRleHQgfX08L2J1dHRvbj5cbjwvZGl2PlxuIl19