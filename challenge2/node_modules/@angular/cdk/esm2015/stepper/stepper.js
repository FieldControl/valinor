/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { FocusKeyManager } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { coerceBooleanProperty, coerceNumberProperty } from '@angular/cdk/coercion';
import { ENTER, hasModifierKey, SPACE } from '@angular/cdk/keycodes';
import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChild, ContentChildren, Directive, ElementRef, EventEmitter, forwardRef, Inject, InjectionToken, Input, Optional, Output, QueryList, TemplateRef, ViewChild, ViewEncapsulation, } from '@angular/core';
import { of as observableOf, Subject } from 'rxjs';
import { startWith, takeUntil } from 'rxjs/operators';
import { CdkStepHeader } from './step-header';
import { CdkStepLabel } from './step-label';
/** Used to generate unique ID for each stepper component. */
let nextId = 0;
/** Change event emitted on selection changes. */
export class StepperSelectionEvent {
}
/** Enum to represent the different states of the steps. */
export const STEP_STATE = {
    NUMBER: 'number',
    EDIT: 'edit',
    DONE: 'done',
    ERROR: 'error'
};
/** InjectionToken that can be used to specify the global stepper options. */
export const STEPPER_GLOBAL_OPTIONS = new InjectionToken('STEPPER_GLOBAL_OPTIONS');
export class CdkStep {
    constructor(_stepper, stepperOptions) {
        this._stepper = _stepper;
        /** Whether user has attempted to move away from the step. */
        this.interacted = false;
        /** Emits when the user has attempted to move away from the step. */
        this.interactedStream = new EventEmitter();
        this._editable = true;
        this._optional = false;
        this._completedOverride = null;
        this._customError = null;
        this._stepperOptions = stepperOptions ? stepperOptions : {};
        this._displayDefaultIndicatorType = this._stepperOptions.displayDefaultIndicatorType !== false;
        this._showError = !!this._stepperOptions.showError;
    }
    /** Whether the user can return to this step once it has been marked as completed. */
    get editable() {
        return this._editable;
    }
    set editable(value) {
        this._editable = coerceBooleanProperty(value);
    }
    /** Whether the completion of step is optional. */
    get optional() {
        return this._optional;
    }
    set optional(value) {
        this._optional = coerceBooleanProperty(value);
    }
    /** Whether step is marked as completed. */
    get completed() {
        return this._completedOverride == null ? this._getDefaultCompleted() : this._completedOverride;
    }
    set completed(value) {
        this._completedOverride = coerceBooleanProperty(value);
    }
    _getDefaultCompleted() {
        return this.stepControl ? this.stepControl.valid && this.interacted : this.interacted;
    }
    /** Whether step has an error. */
    get hasError() {
        return this._customError == null ? this._getDefaultError() : this._customError;
    }
    set hasError(value) {
        this._customError = coerceBooleanProperty(value);
    }
    _getDefaultError() {
        return this.stepControl && this.stepControl.invalid && this.interacted;
    }
    /** Selects this step component. */
    select() {
        this._stepper.selected = this;
    }
    /** Resets the step to its initial state. Note that this includes resetting form data. */
    reset() {
        this.interacted = false;
        if (this._completedOverride != null) {
            this._completedOverride = false;
        }
        if (this._customError != null) {
            this._customError = false;
        }
        if (this.stepControl) {
            this.stepControl.reset();
        }
    }
    ngOnChanges() {
        // Since basically all inputs of the MatStep get proxied through the view down to the
        // underlying MatStepHeader, we have to make sure that change detection runs correctly.
        this._stepper._stateChanged();
    }
    _markAsInteracted() {
        if (!this.interacted) {
            this.interacted = true;
            this.interactedStream.emit(this);
        }
    }
}
CdkStep.decorators = [
    { type: Component, args: [{
                selector: 'cdk-step',
                exportAs: 'cdkStep',
                template: '<ng-template><ng-content></ng-content></ng-template>',
                encapsulation: ViewEncapsulation.None,
                changeDetection: ChangeDetectionStrategy.OnPush
            },] }
];
CdkStep.ctorParameters = () => [
    { type: CdkStepper, decorators: [{ type: Inject, args: [forwardRef(() => CdkStepper),] }] },
    { type: undefined, decorators: [{ type: Optional }, { type: Inject, args: [STEPPER_GLOBAL_OPTIONS,] }] }
];
CdkStep.propDecorators = {
    stepLabel: [{ type: ContentChild, args: [CdkStepLabel,] }],
    content: [{ type: ViewChild, args: [TemplateRef, { static: true },] }],
    stepControl: [{ type: Input }],
    interactedStream: [{ type: Output, args: ['interacted',] }],
    label: [{ type: Input }],
    errorMessage: [{ type: Input }],
    ariaLabel: [{ type: Input, args: ['aria-label',] }],
    ariaLabelledby: [{ type: Input, args: ['aria-labelledby',] }],
    state: [{ type: Input }],
    editable: [{ type: Input }],
    optional: [{ type: Input }],
    completed: [{ type: Input }],
    hasError: [{ type: Input }]
};
export class CdkStepper {
    constructor(_dir, _changeDetectorRef, _elementRef, _document) {
        this._dir = _dir;
        this._changeDetectorRef = _changeDetectorRef;
        this._elementRef = _elementRef;
        /** Emits when the component is destroyed. */
        this._destroyed = new Subject();
        /** Steps that belong to the current stepper, excluding ones from nested steppers. */
        this.steps = new QueryList();
        this._linear = false;
        this._selectedIndex = 0;
        /** Event emitted when the selected step has changed. */
        this.selectionChange = new EventEmitter();
        /**
         * @deprecated To be turned into a private property. Use `orientation` instead.
         * @breaking-change 13.0.0
         */
        this._orientation = 'horizontal';
        this._groupId = nextId++;
        this._document = _document;
    }
    /** Whether the validity of previous steps should be checked or not. */
    get linear() {
        return this._linear;
    }
    set linear(value) {
        this._linear = coerceBooleanProperty(value);
    }
    /** The index of the selected step. */
    get selectedIndex() {
        return this._selectedIndex;
    }
    set selectedIndex(index) {
        var _a;
        const newIndex = coerceNumberProperty(index);
        if (this.steps && this._steps) {
            // Ensure that the index can't be out of bounds.
            if (!this._isValidIndex(index) && (typeof ngDevMode === 'undefined' || ngDevMode)) {
                throw Error('cdkStepper: Cannot assign out-of-bounds value to `selectedIndex`.');
            }
            (_a = this.selected) === null || _a === void 0 ? void 0 : _a._markAsInteracted();
            if (this._selectedIndex !== newIndex && !this._anyControlsInvalidOrPending(newIndex) &&
                (newIndex >= this._selectedIndex || this.steps.toArray()[newIndex].editable)) {
                this._updateSelectedItemIndex(index);
            }
        }
        else {
            this._selectedIndex = newIndex;
        }
    }
    /** The step that is selected. */
    get selected() {
        return this.steps ? this.steps.toArray()[this.selectedIndex] : undefined;
    }
    set selected(step) {
        this.selectedIndex = (step && this.steps) ? this.steps.toArray().indexOf(step) : -1;
    }
    /** Orientation of the stepper. */
    get orientation() { return this._orientation; }
    set orientation(value) {
        // This is a protected method so that `MatSteppter` can hook into it.
        this._orientation = value;
        if (this._keyManager) {
            this._keyManager.withVerticalOrientation(value === 'vertical');
        }
    }
    ngAfterContentInit() {
        this._steps.changes
            .pipe(startWith(this._steps), takeUntil(this._destroyed))
            .subscribe((steps) => {
            this.steps.reset(steps.filter(step => step._stepper === this));
            this.steps.notifyOnChanges();
        });
    }
    ngAfterViewInit() {
        // Note that while the step headers are content children by default, any components that
        // extend this one might have them as view children. We initialize the keyboard handling in
        // AfterViewInit so we're guaranteed for both view and content children to be defined.
        this._keyManager = new FocusKeyManager(this._stepHeader)
            .withWrap()
            .withHomeAndEnd()
            .withVerticalOrientation(this._orientation === 'vertical');
        (this._dir ? this._dir.change : observableOf())
            .pipe(startWith(this._layoutDirection()), takeUntil(this._destroyed))
            .subscribe(direction => this._keyManager.withHorizontalOrientation(direction));
        this._keyManager.updateActiveItem(this._selectedIndex);
        // No need to `takeUntil` here, because we're the ones destroying `steps`.
        this.steps.changes.subscribe(() => {
            if (!this.selected) {
                this._selectedIndex = Math.max(this._selectedIndex - 1, 0);
            }
        });
        // The logic which asserts that the selected index is within bounds doesn't run before the
        // steps are initialized, because we don't how many steps there are yet so we may have an
        // invalid index on init. If that's the case, auto-correct to the default so we don't throw.
        if (!this._isValidIndex(this._selectedIndex)) {
            this._selectedIndex = 0;
        }
    }
    ngOnDestroy() {
        this.steps.destroy();
        this._destroyed.next();
        this._destroyed.complete();
    }
    /** Selects and focuses the next step in list. */
    next() {
        this.selectedIndex = Math.min(this._selectedIndex + 1, this.steps.length - 1);
    }
    /** Selects and focuses the previous step in list. */
    previous() {
        this.selectedIndex = Math.max(this._selectedIndex - 1, 0);
    }
    /** Resets the stepper to its initial state. Note that this includes clearing form data. */
    reset() {
        this._updateSelectedItemIndex(0);
        this.steps.forEach(step => step.reset());
        this._stateChanged();
    }
    /** Returns a unique id for each step label element. */
    _getStepLabelId(i) {
        return `cdk-step-label-${this._groupId}-${i}`;
    }
    /** Returns unique id for each step content element. */
    _getStepContentId(i) {
        return `cdk-step-content-${this._groupId}-${i}`;
    }
    /** Marks the component to be change detected. */
    _stateChanged() {
        this._changeDetectorRef.markForCheck();
    }
    /** Returns position state of the step with the given index. */
    _getAnimationDirection(index) {
        const position = index - this._selectedIndex;
        if (position < 0) {
            return this._layoutDirection() === 'rtl' ? 'next' : 'previous';
        }
        else if (position > 0) {
            return this._layoutDirection() === 'rtl' ? 'previous' : 'next';
        }
        return 'current';
    }
    /** Returns the type of icon to be displayed. */
    _getIndicatorType(index, state = STEP_STATE.NUMBER) {
        const step = this.steps.toArray()[index];
        const isCurrentStep = this._isCurrentStep(index);
        return step._displayDefaultIndicatorType ? this._getDefaultIndicatorLogic(step, isCurrentStep) :
            this._getGuidelineLogic(step, isCurrentStep, state);
    }
    _getDefaultIndicatorLogic(step, isCurrentStep) {
        if (step._showError && step.hasError && !isCurrentStep) {
            return STEP_STATE.ERROR;
        }
        else if (!step.completed || isCurrentStep) {
            return STEP_STATE.NUMBER;
        }
        else {
            return step.editable ? STEP_STATE.EDIT : STEP_STATE.DONE;
        }
    }
    _getGuidelineLogic(step, isCurrentStep, state = STEP_STATE.NUMBER) {
        if (step._showError && step.hasError && !isCurrentStep) {
            return STEP_STATE.ERROR;
        }
        else if (step.completed && !isCurrentStep) {
            return STEP_STATE.DONE;
        }
        else if (step.completed && isCurrentStep) {
            return state;
        }
        else if (step.editable && isCurrentStep) {
            return STEP_STATE.EDIT;
        }
        else {
            return state;
        }
    }
    _isCurrentStep(index) {
        return this._selectedIndex === index;
    }
    /** Returns the index of the currently-focused step header. */
    _getFocusIndex() {
        return this._keyManager ? this._keyManager.activeItemIndex : this._selectedIndex;
    }
    _updateSelectedItemIndex(newIndex) {
        const stepsArray = this.steps.toArray();
        this.selectionChange.emit({
            selectedIndex: newIndex,
            previouslySelectedIndex: this._selectedIndex,
            selectedStep: stepsArray[newIndex],
            previouslySelectedStep: stepsArray[this._selectedIndex],
        });
        // If focus is inside the stepper, move it to the next header, otherwise it may become
        // lost when the active step content is hidden. We can't be more granular with the check
        // (e.g. checking whether focus is inside the active step), because we don't have a
        // reference to the elements that are rendering out the content.
        this._containsFocus() ? this._keyManager.setActiveItem(newIndex) :
            this._keyManager.updateActiveItem(newIndex);
        this._selectedIndex = newIndex;
        this._stateChanged();
    }
    _onKeydown(event) {
        const hasModifier = hasModifierKey(event);
        const keyCode = event.keyCode;
        const manager = this._keyManager;
        if (manager.activeItemIndex != null && !hasModifier &&
            (keyCode === SPACE || keyCode === ENTER)) {
            this.selectedIndex = manager.activeItemIndex;
            event.preventDefault();
        }
        else {
            manager.onKeydown(event);
        }
    }
    _anyControlsInvalidOrPending(index) {
        if (this._linear && index >= 0) {
            return this.steps.toArray().slice(0, index).some(step => {
                const control = step.stepControl;
                const isIncomplete = control ? (control.invalid || control.pending || !step.interacted) : !step.completed;
                return isIncomplete && !step.optional && !step._completedOverride;
            });
        }
        return false;
    }
    _layoutDirection() {
        return this._dir && this._dir.value === 'rtl' ? 'rtl' : 'ltr';
    }
    /** Checks whether the stepper contains the focused element. */
    _containsFocus() {
        const stepperElement = this._elementRef.nativeElement;
        const focusedElement = this._document.activeElement;
        return stepperElement === focusedElement || stepperElement.contains(focusedElement);
    }
    /** Checks whether the passed-in index is a valid step index. */
    _isValidIndex(index) {
        return index > -1 && (!this.steps || index < this.steps.length);
    }
}
CdkStepper.decorators = [
    { type: Directive, args: [{
                selector: '[cdkStepper]',
                exportAs: 'cdkStepper',
            },] }
];
CdkStepper.ctorParameters = () => [
    { type: Directionality, decorators: [{ type: Optional }] },
    { type: ChangeDetectorRef },
    { type: ElementRef },
    { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] }] }
];
CdkStepper.propDecorators = {
    _steps: [{ type: ContentChildren, args: [CdkStep, { descendants: true },] }],
    _stepHeader: [{ type: ContentChildren, args: [CdkStepHeader, { descendants: true },] }],
    linear: [{ type: Input }],
    selectedIndex: [{ type: Input }],
    selected: [{ type: Input }],
    selectionChange: [{ type: Output }],
    orientation: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RlcHBlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvc3RlcHBlci9zdGVwcGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBa0IsZUFBZSxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDbkUsT0FBTyxFQUFZLGNBQWMsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQzVELE9BQU8sRUFFTCxxQkFBcUIsRUFDckIsb0JBQW9CLEVBRXJCLE1BQU0sdUJBQXVCLENBQUM7QUFDL0IsT0FBTyxFQUFDLEtBQUssRUFBRSxjQUFjLEVBQUUsS0FBSyxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDbkUsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQ3pDLE9BQU8sRUFFTCx1QkFBdUIsRUFDdkIsaUJBQWlCLEVBQ2pCLFNBQVMsRUFDVCxZQUFZLEVBQ1osZUFBZSxFQUNmLFNBQVMsRUFDVCxVQUFVLEVBQ1YsWUFBWSxFQUNaLFVBQVUsRUFDVixNQUFNLEVBQ04sY0FBYyxFQUNkLEtBQUssRUFHTCxRQUFRLEVBQ1IsTUFBTSxFQUNOLFNBQVMsRUFDVCxXQUFXLEVBQ1gsU0FBUyxFQUNULGlCQUFpQixHQUVsQixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQWEsRUFBRSxJQUFJLFlBQVksRUFBRSxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDN0QsT0FBTyxFQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUVwRCxPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQzVDLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFFMUMsNkRBQTZEO0FBQzdELElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQztBQVdmLGlEQUFpRDtBQUNqRCxNQUFNLE9BQU8scUJBQXFCO0NBWWpDO0FBS0QsMkRBQTJEO0FBQzNELE1BQU0sQ0FBQyxNQUFNLFVBQVUsR0FBRztJQUN4QixNQUFNLEVBQUUsUUFBUTtJQUNoQixJQUFJLEVBQUUsTUFBTTtJQUNaLElBQUksRUFBRSxNQUFNO0lBQ1osS0FBSyxFQUFFLE9BQU87Q0FDZixDQUFDO0FBRUYsNkVBQTZFO0FBQzdFLE1BQU0sQ0FBQyxNQUFNLHNCQUFzQixHQUFHLElBQUksY0FBYyxDQUFpQix3QkFBd0IsQ0FBQyxDQUFDO0FBeUJuRyxNQUFNLE9BQU8sT0FBTztJQXVGbEIsWUFDaUQsUUFBb0IsRUFDckIsY0FBK0I7UUFEOUIsYUFBUSxHQUFSLFFBQVEsQ0FBWTtRQTFFckUsNkRBQTZEO1FBQzdELGVBQVUsR0FBRyxLQUFLLENBQUM7UUFFbkIsb0VBQW9FO1FBRTNELHFCQUFnQixHQUEwQixJQUFJLFlBQVksRUFBVyxDQUFDO1FBNEJ2RSxjQUFTLEdBQUcsSUFBSSxDQUFDO1FBVWpCLGNBQVMsR0FBRyxLQUFLLENBQUM7UUFVMUIsdUJBQWtCLEdBQWlCLElBQUksQ0FBQztRQWNoQyxpQkFBWSxHQUFpQixJQUFJLENBQUM7UUFTeEMsSUFBSSxDQUFDLGVBQWUsR0FBRyxjQUFjLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQzVELElBQUksQ0FBQyw0QkFBNEIsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLDJCQUEyQixLQUFLLEtBQUssQ0FBQztRQUMvRixJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQztJQUNyRCxDQUFDO0lBdERELHFGQUFxRjtJQUNyRixJQUNJLFFBQVE7UUFDVixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7SUFDeEIsQ0FBQztJQUNELElBQUksUUFBUSxDQUFDLEtBQWM7UUFDekIsSUFBSSxDQUFDLFNBQVMsR0FBRyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNoRCxDQUFDO0lBR0Qsa0RBQWtEO0lBQ2xELElBQ0ksUUFBUTtRQUNWLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUN4QixDQUFDO0lBQ0QsSUFBSSxRQUFRLENBQUMsS0FBYztRQUN6QixJQUFJLENBQUMsU0FBUyxHQUFHLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2hELENBQUM7SUFHRCwyQ0FBMkM7SUFDM0MsSUFDSSxTQUFTO1FBQ1gsT0FBTyxJQUFJLENBQUMsa0JBQWtCLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDO0lBQ2pHLENBQUM7SUFDRCxJQUFJLFNBQVMsQ0FBQyxLQUFjO1FBQzFCLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN6RCxDQUFDO0lBR08sb0JBQW9CO1FBQzFCLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztJQUN4RixDQUFDO0lBRUQsaUNBQWlDO0lBQ2pDLElBQ0ksUUFBUTtRQUNWLE9BQU8sSUFBSSxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDO0lBQ2pGLENBQUM7SUFDRCxJQUFJLFFBQVEsQ0FBQyxLQUFjO1FBQ3pCLElBQUksQ0FBQyxZQUFZLEdBQUcscUJBQXFCLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDbkQsQ0FBQztJQUdPLGdCQUFnQjtRQUN0QixPQUFPLElBQUksQ0FBQyxXQUFXLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQztJQUN6RSxDQUFDO0lBVUQsbUNBQW1DO0lBQ25DLE1BQU07UUFDSixJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7SUFDaEMsQ0FBQztJQUVELHlGQUF5RjtJQUN6RixLQUFLO1FBQ0gsSUFBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUM7UUFFeEIsSUFBSSxJQUFJLENBQUMsa0JBQWtCLElBQUksSUFBSSxFQUFFO1lBQ25DLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxLQUFLLENBQUM7U0FDakM7UUFFRCxJQUFJLElBQUksQ0FBQyxZQUFZLElBQUksSUFBSSxFQUFFO1lBQzdCLElBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDO1NBQzNCO1FBRUQsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ3BCLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7U0FDMUI7SUFDSCxDQUFDO0lBRUQsV0FBVztRQUNULHFGQUFxRjtRQUNyRix1RkFBdUY7UUFDdkYsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLEVBQUUsQ0FBQztJQUNoQyxDQUFDO0lBRUQsaUJBQWlCO1FBQ2YsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDcEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7WUFDdkIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNsQztJQUNILENBQUM7OztZQXZJRixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLFVBQVU7Z0JBQ3BCLFFBQVEsRUFBRSxTQUFTO2dCQUNuQixRQUFRLEVBQUUsc0RBQXNEO2dCQUNoRSxhQUFhLEVBQUUsaUJBQWlCLENBQUMsSUFBSTtnQkFDckMsZUFBZSxFQUFFLHVCQUF1QixDQUFDLE1BQU07YUFDaEQ7OztZQXlGNEQsVUFBVSx1QkFBaEUsTUFBTSxTQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUM7NENBQ25DLFFBQVEsWUFBSSxNQUFNLFNBQUMsc0JBQXNCOzs7d0JBbkY3QyxZQUFZLFNBQUMsWUFBWTtzQkFHekIsU0FBUyxTQUFDLFdBQVcsRUFBRSxFQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUM7MEJBR3JDLEtBQUs7K0JBTUwsTUFBTSxTQUFDLFlBQVk7b0JBSW5CLEtBQUs7MkJBR0wsS0FBSzt3QkFHTCxLQUFLLFNBQUMsWUFBWTs2QkFNbEIsS0FBSyxTQUFDLGlCQUFpQjtvQkFHdkIsS0FBSzt1QkFHTCxLQUFLO3VCQVVMLEtBQUs7d0JBVUwsS0FBSzt1QkFjTCxLQUFLOztBQWtFUixNQUFNLE9BQU8sVUFBVTtJQXVGckIsWUFDd0IsSUFBb0IsRUFBVSxrQkFBcUMsRUFDL0UsV0FBb0MsRUFBb0IsU0FBYztRQUQxRCxTQUFJLEdBQUosSUFBSSxDQUFnQjtRQUFVLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBbUI7UUFDL0UsZ0JBQVcsR0FBWCxXQUFXLENBQXlCO1FBeEZoRCw2Q0FBNkM7UUFDMUIsZUFBVSxHQUFHLElBQUksT0FBTyxFQUFRLENBQUM7UUFVcEQscUZBQXFGO1FBQzVFLFVBQUssR0FBdUIsSUFBSSxTQUFTLEVBQVcsQ0FBQztRQWF0RCxZQUFPLEdBQUcsS0FBSyxDQUFDO1FBMEJoQixtQkFBYyxHQUFHLENBQUMsQ0FBQztRQVczQix3REFBd0Q7UUFDckMsb0JBQWUsR0FBRyxJQUFJLFlBQVksRUFBeUIsQ0FBQztRQWlCL0U7OztXQUdHO1FBQ08saUJBQVksR0FBdUIsWUFBWSxDQUFDO1FBS3hELElBQUksQ0FBQyxRQUFRLEdBQUcsTUFBTSxFQUFFLENBQUM7UUFDekIsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7SUFDN0IsQ0FBQztJQTFFRCx1RUFBdUU7SUFDdkUsSUFDSSxNQUFNO1FBQ1IsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDO0lBQ3RCLENBQUM7SUFDRCxJQUFJLE1BQU0sQ0FBQyxLQUFjO1FBQ3ZCLElBQUksQ0FBQyxPQUFPLEdBQUcscUJBQXFCLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDOUMsQ0FBQztJQUdELHNDQUFzQztJQUN0QyxJQUNJLGFBQWE7UUFDZixPQUFPLElBQUksQ0FBQyxjQUFjLENBQUM7SUFDN0IsQ0FBQztJQUNELElBQUksYUFBYSxDQUFDLEtBQWE7O1FBQzdCLE1BQU0sUUFBUSxHQUFHLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRTdDLElBQUksSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQzdCLGdEQUFnRDtZQUNoRCxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sU0FBUyxLQUFLLFdBQVcsSUFBSSxTQUFTLENBQUMsRUFBRTtnQkFDakYsTUFBTSxLQUFLLENBQUMsbUVBQW1FLENBQUMsQ0FBQzthQUNsRjtZQUVELE1BQUEsSUFBSSxDQUFDLFFBQVEsMENBQUUsaUJBQWlCLEVBQUUsQ0FBQztZQUVuQyxJQUFJLElBQUksQ0FBQyxjQUFjLEtBQUssUUFBUSxJQUFJLENBQUMsSUFBSSxDQUFDLDRCQUE0QixDQUFDLFFBQVEsQ0FBQztnQkFDaEYsQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLGNBQWMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUNoRixJQUFJLENBQUMsd0JBQXdCLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDdEM7U0FDRjthQUFNO1lBQ0wsSUFBSSxDQUFDLGNBQWMsR0FBRyxRQUFRLENBQUM7U0FDaEM7SUFDSCxDQUFDO0lBR0QsaUNBQWlDO0lBQ2pDLElBQ0ksUUFBUTtRQUNWLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztJQUMzRSxDQUFDO0lBQ0QsSUFBSSxRQUFRLENBQUMsSUFBeUI7UUFDcEMsSUFBSSxDQUFDLGFBQWEsR0FBRyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN0RixDQUFDO0lBUUQsa0NBQWtDO0lBQ2xDLElBQ0ksV0FBVyxLQUF5QixPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO0lBQ25FLElBQUksV0FBVyxDQUFDLEtBQXlCO1FBQ3ZDLHFFQUFxRTtRQUNyRSxJQUFJLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQztRQUUxQixJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDcEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyx1QkFBdUIsQ0FBQyxLQUFLLEtBQUssVUFBVSxDQUFDLENBQUM7U0FDaEU7SUFDSCxDQUFDO0lBZUQsa0JBQWtCO1FBQ2hCLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTzthQUNoQixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2FBQ3hELFNBQVMsQ0FBQyxDQUFDLEtBQXlCLEVBQUUsRUFBRTtZQUN2QyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQy9ELElBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDL0IsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsZUFBZTtRQUNiLHdGQUF3RjtRQUN4RiwyRkFBMkY7UUFDM0Ysc0ZBQXNGO1FBQ3RGLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxlQUFlLENBQWtCLElBQUksQ0FBQyxXQUFXLENBQUM7YUFDakQsUUFBUSxFQUFFO2FBQ1YsY0FBYyxFQUFFO2FBQ2hCLHVCQUF1QixDQUFDLElBQUksQ0FBQyxZQUFZLEtBQUssVUFBVSxDQUFDLENBQUM7UUFFbEYsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBRSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQWdDLENBQUMsQ0FBQyxDQUFDLFlBQVksRUFBYSxDQUFDO2FBQ2hGLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUMsRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2FBQ3BFLFNBQVMsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMseUJBQXlCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztRQUVuRixJQUFJLENBQUMsV0FBVyxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUV2RCwwRUFBMEU7UUFDMUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRTtZQUNoQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDbEIsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxjQUFjLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQzVEO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFFSCwwRkFBMEY7UUFDMUYseUZBQXlGO1FBQ3pGLDRGQUE0RjtRQUM1RixJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLEVBQUU7WUFDNUMsSUFBSSxDQUFDLGNBQWMsR0FBRyxDQUFDLENBQUM7U0FDekI7SUFDSCxDQUFDO0lBRUQsV0FBVztRQUNULElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDckIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUN2QixJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQzdCLENBQUM7SUFFRCxpREFBaUQ7SUFDakQsSUFBSTtRQUNGLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsY0FBYyxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztJQUNoRixDQUFDO0lBRUQscURBQXFEO0lBQ3JELFFBQVE7UUFDTixJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGNBQWMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDNUQsQ0FBQztJQUVELDJGQUEyRjtJQUMzRixLQUFLO1FBQ0gsSUFBSSxDQUFDLHdCQUF3QixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2pDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDekMsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBQ3ZCLENBQUM7SUFFRCx1REFBdUQ7SUFDdkQsZUFBZSxDQUFDLENBQVM7UUFDdkIsT0FBTyxrQkFBa0IsSUFBSSxDQUFDLFFBQVEsSUFBSSxDQUFDLEVBQUUsQ0FBQztJQUNoRCxDQUFDO0lBRUQsdURBQXVEO0lBQ3ZELGlCQUFpQixDQUFDLENBQVM7UUFDekIsT0FBTyxvQkFBb0IsSUFBSSxDQUFDLFFBQVEsSUFBSSxDQUFDLEVBQUUsQ0FBQztJQUNsRCxDQUFDO0lBRUQsaURBQWlEO0lBQ2pELGFBQWE7UUFDWCxJQUFJLENBQUMsa0JBQWtCLENBQUMsWUFBWSxFQUFFLENBQUM7SUFDekMsQ0FBQztJQUVELCtEQUErRDtJQUMvRCxzQkFBc0IsQ0FBQyxLQUFhO1FBQ2xDLE1BQU0sUUFBUSxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDO1FBQzdDLElBQUksUUFBUSxHQUFHLENBQUMsRUFBRTtZQUNoQixPQUFPLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUM7U0FDaEU7YUFBTSxJQUFJLFFBQVEsR0FBRyxDQUFDLEVBQUU7WUFDdkIsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO1NBQ2hFO1FBQ0QsT0FBTyxTQUFTLENBQUM7SUFDbkIsQ0FBQztJQUVELGdEQUFnRDtJQUNoRCxpQkFBaUIsQ0FBQyxLQUFhLEVBQUUsUUFBbUIsVUFBVSxDQUFDLE1BQU07UUFDbkUsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN6QyxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRWpELE9BQU8sSUFBSSxDQUFDLDRCQUE0QixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMsSUFBSSxFQUFFLGFBQWEsQ0FBQyxDQUFDLENBQUM7WUFDckQsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksRUFBRSxhQUFhLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDakcsQ0FBQztJQUVPLHlCQUF5QixDQUFDLElBQWEsRUFBRSxhQUFzQjtRQUNyRSxJQUFJLElBQUksQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDLFFBQVEsSUFBSSxDQUFDLGFBQWEsRUFBRTtZQUN0RCxPQUFPLFVBQVUsQ0FBQyxLQUFLLENBQUM7U0FDekI7YUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsSUFBSSxhQUFhLEVBQUU7WUFDM0MsT0FBTyxVQUFVLENBQUMsTUFBTSxDQUFDO1NBQzFCO2FBQU07WUFDTCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUM7U0FDMUQ7SUFDSCxDQUFDO0lBRU8sa0JBQWtCLENBQ3RCLElBQWEsRUFBRSxhQUFzQixFQUFFLFFBQW1CLFVBQVUsQ0FBQyxNQUFNO1FBQzdFLElBQUksSUFBSSxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLENBQUMsYUFBYSxFQUFFO1lBQ3RELE9BQU8sVUFBVSxDQUFDLEtBQUssQ0FBQztTQUN6QjthQUFNLElBQUksSUFBSSxDQUFDLFNBQVMsSUFBSSxDQUFDLGFBQWEsRUFBRTtZQUMzQyxPQUFPLFVBQVUsQ0FBQyxJQUFJLENBQUM7U0FDeEI7YUFBTSxJQUFJLElBQUksQ0FBQyxTQUFTLElBQUksYUFBYSxFQUFFO1lBQzFDLE9BQU8sS0FBSyxDQUFDO1NBQ2Q7YUFBTSxJQUFJLElBQUksQ0FBQyxRQUFRLElBQUksYUFBYSxFQUFFO1lBQ3pDLE9BQU8sVUFBVSxDQUFDLElBQUksQ0FBQztTQUN4QjthQUFNO1lBQ0wsT0FBTyxLQUFLLENBQUM7U0FDZDtJQUNILENBQUM7SUFFTyxjQUFjLENBQUMsS0FBYTtRQUNsQyxPQUFPLElBQUksQ0FBQyxjQUFjLEtBQUssS0FBSyxDQUFDO0lBQ3ZDLENBQUM7SUFFRCw4REFBOEQ7SUFDOUQsY0FBYztRQUNaLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUM7SUFDbkYsQ0FBQztJQUVPLHdCQUF3QixDQUFDLFFBQWdCO1FBQy9DLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDeEMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUM7WUFDeEIsYUFBYSxFQUFFLFFBQVE7WUFDdkIsdUJBQXVCLEVBQUUsSUFBSSxDQUFDLGNBQWM7WUFDNUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxRQUFRLENBQUM7WUFDbEMsc0JBQXNCLEVBQUUsVUFBVSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUM7U0FDeEQsQ0FBQyxDQUFDO1FBRUgsc0ZBQXNGO1FBQ3RGLHdGQUF3RjtRQUN4RixtRkFBbUY7UUFDbkYsZ0VBQWdFO1FBQ2hFLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUMxQyxJQUFJLENBQUMsV0FBVyxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRXBFLElBQUksQ0FBQyxjQUFjLEdBQUcsUUFBUSxDQUFDO1FBQy9CLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztJQUN2QixDQUFDO0lBRUQsVUFBVSxDQUFDLEtBQW9CO1FBQzdCLE1BQU0sV0FBVyxHQUFHLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMxQyxNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDO1FBQzlCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7UUFFakMsSUFBSSxPQUFPLENBQUMsZUFBZSxJQUFJLElBQUksSUFBSSxDQUFDLFdBQVc7WUFDL0MsQ0FBQyxPQUFPLEtBQUssS0FBSyxJQUFJLE9BQU8sS0FBSyxLQUFLLENBQUMsRUFBRTtZQUM1QyxJQUFJLENBQUMsYUFBYSxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUM7WUFDN0MsS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO1NBQ3hCO2FBQU07WUFDTCxPQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQzFCO0lBQ0gsQ0FBQztJQUVPLDRCQUE0QixDQUFDLEtBQWE7UUFDaEQsSUFBSSxJQUFJLENBQUMsT0FBTyxJQUFJLEtBQUssSUFBSSxDQUFDLEVBQUU7WUFDOUIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUN0RCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO2dCQUNqQyxNQUFNLFlBQVksR0FDZCxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7Z0JBQ3pGLE9BQU8sWUFBWSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztZQUNwRSxDQUFDLENBQUMsQ0FBQztTQUNKO1FBRUQsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0lBRU8sZ0JBQWdCO1FBQ3RCLE9BQU8sSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0lBQ2hFLENBQUM7SUFFRCwrREFBK0Q7SUFDdkQsY0FBYztRQUNwQixNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQztRQUN0RCxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQztRQUNwRCxPQUFPLGNBQWMsS0FBSyxjQUFjLElBQUksY0FBYyxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUN0RixDQUFDO0lBRUQsZ0VBQWdFO0lBQ3hELGFBQWEsQ0FBQyxLQUFhO1FBQ2pDLE9BQU8sS0FBSyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2xFLENBQUM7OztZQWxTRixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLGNBQWM7Z0JBQ3hCLFFBQVEsRUFBRSxZQUFZO2FBQ3ZCOzs7WUFsUGtCLGNBQWMsdUJBMlUxQixRQUFRO1lBL1RiLGlCQUFpQjtZQUtqQixVQUFVOzRDQTJUeUMsTUFBTSxTQUFDLFFBQVE7OztxQkEvRWpFLGVBQWUsU0FBQyxPQUFPLEVBQUUsRUFBQyxXQUFXLEVBQUUsSUFBSSxFQUFDOzBCQU01QyxlQUFlLFNBQUMsYUFBYSxFQUFFLEVBQUMsV0FBVyxFQUFFLElBQUksRUFBQztxQkFHbEQsS0FBSzs0QkFVTCxLQUFLO3VCQTBCTCxLQUFLOzhCQVNMLE1BQU07MEJBTU4sS0FBSyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0ZvY3VzYWJsZU9wdGlvbiwgRm9jdXNLZXlNYW5hZ2VyfSBmcm9tICdAYW5ndWxhci9jZGsvYTExeSc7XG5pbXBvcnQge0RpcmVjdGlvbiwgRGlyZWN0aW9uYWxpdHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9iaWRpJztcbmltcG9ydCB7XG4gIEJvb2xlYW5JbnB1dCxcbiAgY29lcmNlQm9vbGVhblByb3BlcnR5LFxuICBjb2VyY2VOdW1iZXJQcm9wZXJ0eSxcbiAgTnVtYmVySW5wdXRcbn0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvZXJjaW9uJztcbmltcG9ydCB7RU5URVIsIGhhc01vZGlmaWVyS2V5LCBTUEFDRX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2tleWNvZGVzJztcbmltcG9ydCB7RE9DVU1FTlR9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge1xuICBBZnRlclZpZXdJbml0LFxuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gIENvbXBvbmVudCxcbiAgQ29udGVudENoaWxkLFxuICBDb250ZW50Q2hpbGRyZW4sXG4gIERpcmVjdGl2ZSxcbiAgRWxlbWVudFJlZixcbiAgRXZlbnRFbWl0dGVyLFxuICBmb3J3YXJkUmVmLFxuICBJbmplY3QsXG4gIEluamVjdGlvblRva2VuLFxuICBJbnB1dCxcbiAgT25DaGFuZ2VzLFxuICBPbkRlc3Ryb3ksXG4gIE9wdGlvbmFsLFxuICBPdXRwdXQsXG4gIFF1ZXJ5TGlzdCxcbiAgVGVtcGxhdGVSZWYsXG4gIFZpZXdDaGlsZCxcbiAgVmlld0VuY2Fwc3VsYXRpb24sXG4gIEFmdGVyQ29udGVudEluaXQsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtPYnNlcnZhYmxlLCBvZiBhcyBvYnNlcnZhYmxlT2YsIFN1YmplY3R9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtzdGFydFdpdGgsIHRha2VVbnRpbH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5pbXBvcnQge0Nka1N0ZXBIZWFkZXJ9IGZyb20gJy4vc3RlcC1oZWFkZXInO1xuaW1wb3J0IHtDZGtTdGVwTGFiZWx9IGZyb20gJy4vc3RlcC1sYWJlbCc7XG5cbi8qKiBVc2VkIHRvIGdlbmVyYXRlIHVuaXF1ZSBJRCBmb3IgZWFjaCBzdGVwcGVyIGNvbXBvbmVudC4gKi9cbmxldCBuZXh0SWQgPSAwO1xuXG4vKipcbiAqIFBvc2l0aW9uIHN0YXRlIG9mIHRoZSBjb250ZW50IG9mIGVhY2ggc3RlcCBpbiBzdGVwcGVyIHRoYXQgaXMgdXNlZCBmb3IgdHJhbnNpdGlvbmluZ1xuICogdGhlIGNvbnRlbnQgaW50byBjb3JyZWN0IHBvc2l0aW9uIHVwb24gc3RlcCBzZWxlY3Rpb24gY2hhbmdlLlxuICovXG5leHBvcnQgdHlwZSBTdGVwQ29udGVudFBvc2l0aW9uU3RhdGUgPSAncHJldmlvdXMnfCdjdXJyZW50J3wnbmV4dCc7XG5cbi8qKiBQb3NzaWJsZSBvcmllbnRhdGlvbiBvZiBhIHN0ZXBwZXIuICovXG5leHBvcnQgdHlwZSBTdGVwcGVyT3JpZW50YXRpb24gPSAnaG9yaXpvbnRhbCd8J3ZlcnRpY2FsJztcblxuLyoqIENoYW5nZSBldmVudCBlbWl0dGVkIG9uIHNlbGVjdGlvbiBjaGFuZ2VzLiAqL1xuZXhwb3J0IGNsYXNzIFN0ZXBwZXJTZWxlY3Rpb25FdmVudCB7XG4gIC8qKiBJbmRleCBvZiB0aGUgc3RlcCBub3cgc2VsZWN0ZWQuICovXG4gIHNlbGVjdGVkSW5kZXg6IG51bWJlcjtcblxuICAvKiogSW5kZXggb2YgdGhlIHN0ZXAgcHJldmlvdXNseSBzZWxlY3RlZC4gKi9cbiAgcHJldmlvdXNseVNlbGVjdGVkSW5kZXg6IG51bWJlcjtcblxuICAvKiogVGhlIHN0ZXAgaW5zdGFuY2Ugbm93IHNlbGVjdGVkLiAqL1xuICBzZWxlY3RlZFN0ZXA6IENka1N0ZXA7XG5cbiAgLyoqIFRoZSBzdGVwIGluc3RhbmNlIHByZXZpb3VzbHkgc2VsZWN0ZWQuICovXG4gIHByZXZpb3VzbHlTZWxlY3RlZFN0ZXA6IENka1N0ZXA7XG59XG5cbi8qKiBUaGUgc3RhdGUgb2YgZWFjaCBzdGVwLiAqL1xuZXhwb3J0IHR5cGUgU3RlcFN0YXRlID0gJ251bWJlcid8J2VkaXQnfCdkb25lJ3wnZXJyb3InfHN0cmluZztcblxuLyoqIEVudW0gdG8gcmVwcmVzZW50IHRoZSBkaWZmZXJlbnQgc3RhdGVzIG9mIHRoZSBzdGVwcy4gKi9cbmV4cG9ydCBjb25zdCBTVEVQX1NUQVRFID0ge1xuICBOVU1CRVI6ICdudW1iZXInLFxuICBFRElUOiAnZWRpdCcsXG4gIERPTkU6ICdkb25lJyxcbiAgRVJST1I6ICdlcnJvcidcbn07XG5cbi8qKiBJbmplY3Rpb25Ub2tlbiB0aGF0IGNhbiBiZSB1c2VkIHRvIHNwZWNpZnkgdGhlIGdsb2JhbCBzdGVwcGVyIG9wdGlvbnMuICovXG5leHBvcnQgY29uc3QgU1RFUFBFUl9HTE9CQUxfT1BUSU9OUyA9IG5ldyBJbmplY3Rpb25Ub2tlbjxTdGVwcGVyT3B0aW9ucz4oJ1NURVBQRVJfR0xPQkFMX09QVElPTlMnKTtcblxuLyoqIENvbmZpZ3VyYWJsZSBvcHRpb25zIGZvciBzdGVwcGVyLiAqL1xuZXhwb3J0IGludGVyZmFjZSBTdGVwcGVyT3B0aW9ucyB7XG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSBzdGVwcGVyIHNob3VsZCBkaXNwbGF5IGFuIGVycm9yIHN0YXRlIG9yIG5vdC5cbiAgICogRGVmYXVsdCBiZWhhdmlvciBpcyBhc3N1bWVkIHRvIGJlIGZhbHNlLlxuICAgKi9cbiAgc2hvd0Vycm9yPzogYm9vbGVhbjtcblxuICAvKipcbiAgICogV2hldGhlciB0aGUgc3RlcHBlciBzaG91bGQgZGlzcGxheSB0aGUgZGVmYXVsdCBpbmRpY2F0b3IgdHlwZVxuICAgKiBvciBub3QuXG4gICAqIERlZmF1bHQgYmVoYXZpb3IgaXMgYXNzdW1lZCB0byBiZSB0cnVlLlxuICAgKi9cbiAgZGlzcGxheURlZmF1bHRJbmRpY2F0b3JUeXBlPzogYm9vbGVhbjtcbn1cblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnY2RrLXN0ZXAnLFxuICBleHBvcnRBczogJ2Nka1N0ZXAnLFxuICB0ZW1wbGF0ZTogJzxuZy10ZW1wbGF0ZT48bmctY29udGVudD48L25nLWNvbnRlbnQ+PC9uZy10ZW1wbGF0ZT4nLFxuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaCxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrU3RlcCBpbXBsZW1lbnRzIE9uQ2hhbmdlcyB7XG4gIHByaXZhdGUgX3N0ZXBwZXJPcHRpb25zOiBTdGVwcGVyT3B0aW9ucztcbiAgX3Nob3dFcnJvcjogYm9vbGVhbjtcbiAgX2Rpc3BsYXlEZWZhdWx0SW5kaWNhdG9yVHlwZTogYm9vbGVhbjtcblxuICAvKiogVGVtcGxhdGUgZm9yIHN0ZXAgbGFiZWwgaWYgaXQgZXhpc3RzLiAqL1xuICBAQ29udGVudENoaWxkKENka1N0ZXBMYWJlbCkgc3RlcExhYmVsOiBDZGtTdGVwTGFiZWw7XG5cbiAgLyoqIFRlbXBsYXRlIGZvciBzdGVwIGNvbnRlbnQuICovXG4gIEBWaWV3Q2hpbGQoVGVtcGxhdGVSZWYsIHtzdGF0aWM6IHRydWV9KSBjb250ZW50OiBUZW1wbGF0ZVJlZjxhbnk+O1xuXG4gIC8qKiBUaGUgdG9wIGxldmVsIGFic3RyYWN0IGNvbnRyb2wgb2YgdGhlIHN0ZXAuICovXG4gIEBJbnB1dCgpIHN0ZXBDb250cm9sOiBBYnN0cmFjdENvbnRyb2xMaWtlO1xuXG4gIC8qKiBXaGV0aGVyIHVzZXIgaGFzIGF0dGVtcHRlZCB0byBtb3ZlIGF3YXkgZnJvbSB0aGUgc3RlcC4gKi9cbiAgaW50ZXJhY3RlZCA9IGZhbHNlO1xuXG4gIC8qKiBFbWl0cyB3aGVuIHRoZSB1c2VyIGhhcyBhdHRlbXB0ZWQgdG8gbW92ZSBhd2F5IGZyb20gdGhlIHN0ZXAuICovXG4gIEBPdXRwdXQoJ2ludGVyYWN0ZWQnKVxuICByZWFkb25seSBpbnRlcmFjdGVkU3RyZWFtOiBFdmVudEVtaXR0ZXI8Q2RrU3RlcD4gPSBuZXcgRXZlbnRFbWl0dGVyPENka1N0ZXA+KCk7XG5cbiAgLyoqIFBsYWluIHRleHQgbGFiZWwgb2YgdGhlIHN0ZXAuICovXG4gIEBJbnB1dCgpIGxhYmVsOiBzdHJpbmc7XG5cbiAgLyoqIEVycm9yIG1lc3NhZ2UgdG8gZGlzcGxheSB3aGVuIHRoZXJlJ3MgYW4gZXJyb3IuICovXG4gIEBJbnB1dCgpIGVycm9yTWVzc2FnZTogc3RyaW5nO1xuXG4gIC8qKiBBcmlhIGxhYmVsIGZvciB0aGUgdGFiLiAqL1xuICBASW5wdXQoJ2FyaWEtbGFiZWwnKSBhcmlhTGFiZWw6IHN0cmluZztcblxuICAvKipcbiAgICogUmVmZXJlbmNlIHRvIHRoZSBlbGVtZW50IHRoYXQgdGhlIHRhYiBpcyBsYWJlbGxlZCBieS5cbiAgICogV2lsbCBiZSBjbGVhcmVkIGlmIGBhcmlhLWxhYmVsYCBpcyBzZXQgYXQgdGhlIHNhbWUgdGltZS5cbiAgICovXG4gIEBJbnB1dCgnYXJpYS1sYWJlbGxlZGJ5JykgYXJpYUxhYmVsbGVkYnk6IHN0cmluZztcblxuICAvKiogU3RhdGUgb2YgdGhlIHN0ZXAuICovXG4gIEBJbnB1dCgpIHN0YXRlOiBTdGVwU3RhdGU7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIHVzZXIgY2FuIHJldHVybiB0byB0aGlzIHN0ZXAgb25jZSBpdCBoYXMgYmVlbiBtYXJrZWQgYXMgY29tcGxldGVkLiAqL1xuICBASW5wdXQoKVxuICBnZXQgZWRpdGFibGUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2VkaXRhYmxlO1xuICB9XG4gIHNldCBlZGl0YWJsZSh2YWx1ZTogYm9vbGVhbikge1xuICAgIHRoaXMuX2VkaXRhYmxlID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHZhbHVlKTtcbiAgfVxuICBwcml2YXRlIF9lZGl0YWJsZSA9IHRydWU7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGNvbXBsZXRpb24gb2Ygc3RlcCBpcyBvcHRpb25hbC4gKi9cbiAgQElucHV0KClcbiAgZ2V0IG9wdGlvbmFsKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9vcHRpb25hbDtcbiAgfVxuICBzZXQgb3B0aW9uYWwodmFsdWU6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl9vcHRpb25hbCA9IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSh2YWx1ZSk7XG4gIH1cbiAgcHJpdmF0ZSBfb3B0aW9uYWwgPSBmYWxzZTtcblxuICAvKiogV2hldGhlciBzdGVwIGlzIG1hcmtlZCBhcyBjb21wbGV0ZWQuICovXG4gIEBJbnB1dCgpXG4gIGdldCBjb21wbGV0ZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbXBsZXRlZE92ZXJyaWRlID09IG51bGwgPyB0aGlzLl9nZXREZWZhdWx0Q29tcGxldGVkKCkgOiB0aGlzLl9jb21wbGV0ZWRPdmVycmlkZTtcbiAgfVxuICBzZXQgY29tcGxldGVkKHZhbHVlOiBib29sZWFuKSB7XG4gICAgdGhpcy5fY29tcGxldGVkT3ZlcnJpZGUgPSBjb2VyY2VCb29sZWFuUHJvcGVydHkodmFsdWUpO1xuICB9XG4gIF9jb21wbGV0ZWRPdmVycmlkZTogYm9vbGVhbnxudWxsID0gbnVsbDtcblxuICBwcml2YXRlIF9nZXREZWZhdWx0Q29tcGxldGVkKCkge1xuICAgIHJldHVybiB0aGlzLnN0ZXBDb250cm9sID8gdGhpcy5zdGVwQ29udHJvbC52YWxpZCAmJiB0aGlzLmludGVyYWN0ZWQgOiB0aGlzLmludGVyYWN0ZWQ7XG4gIH1cblxuICAvKiogV2hldGhlciBzdGVwIGhhcyBhbiBlcnJvci4gKi9cbiAgQElucHV0KClcbiAgZ2V0IGhhc0Vycm9yKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9jdXN0b21FcnJvciA9PSBudWxsID8gdGhpcy5fZ2V0RGVmYXVsdEVycm9yKCkgOiB0aGlzLl9jdXN0b21FcnJvcjtcbiAgfVxuICBzZXQgaGFzRXJyb3IodmFsdWU6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl9jdXN0b21FcnJvciA9IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSh2YWx1ZSk7XG4gIH1cbiAgcHJpdmF0ZSBfY3VzdG9tRXJyb3I6IGJvb2xlYW58bnVsbCA9IG51bGw7XG5cbiAgcHJpdmF0ZSBfZ2V0RGVmYXVsdEVycm9yKCkge1xuICAgIHJldHVybiB0aGlzLnN0ZXBDb250cm9sICYmIHRoaXMuc3RlcENvbnRyb2wuaW52YWxpZCAmJiB0aGlzLmludGVyYWN0ZWQ7XG4gIH1cblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIEBJbmplY3QoZm9yd2FyZFJlZigoKSA9PiBDZGtTdGVwcGVyKSkgcHVibGljIF9zdGVwcGVyOiBDZGtTdGVwcGVyLFxuICAgICAgQE9wdGlvbmFsKCkgQEluamVjdChTVEVQUEVSX0dMT0JBTF9PUFRJT05TKSBzdGVwcGVyT3B0aW9ucz86IFN0ZXBwZXJPcHRpb25zKSB7XG4gICAgdGhpcy5fc3RlcHBlck9wdGlvbnMgPSBzdGVwcGVyT3B0aW9ucyA/IHN0ZXBwZXJPcHRpb25zIDoge307XG4gICAgdGhpcy5fZGlzcGxheURlZmF1bHRJbmRpY2F0b3JUeXBlID0gdGhpcy5fc3RlcHBlck9wdGlvbnMuZGlzcGxheURlZmF1bHRJbmRpY2F0b3JUeXBlICE9PSBmYWxzZTtcbiAgICB0aGlzLl9zaG93RXJyb3IgPSAhIXRoaXMuX3N0ZXBwZXJPcHRpb25zLnNob3dFcnJvcjtcbiAgfVxuXG4gIC8qKiBTZWxlY3RzIHRoaXMgc3RlcCBjb21wb25lbnQuICovXG4gIHNlbGVjdCgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdGVwcGVyLnNlbGVjdGVkID0gdGhpcztcbiAgfVxuXG4gIC8qKiBSZXNldHMgdGhlIHN0ZXAgdG8gaXRzIGluaXRpYWwgc3RhdGUuIE5vdGUgdGhhdCB0aGlzIGluY2x1ZGVzIHJlc2V0dGluZyBmb3JtIGRhdGEuICovXG4gIHJlc2V0KCk6IHZvaWQge1xuICAgIHRoaXMuaW50ZXJhY3RlZCA9IGZhbHNlO1xuXG4gICAgaWYgKHRoaXMuX2NvbXBsZXRlZE92ZXJyaWRlICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX2NvbXBsZXRlZE92ZXJyaWRlID0gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2N1c3RvbUVycm9yICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX2N1c3RvbUVycm9yID0gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc3RlcENvbnRyb2wpIHtcbiAgICAgIHRoaXMuc3RlcENvbnRyb2wucmVzZXQoKTtcbiAgICB9XG4gIH1cblxuICBuZ09uQ2hhbmdlcygpIHtcbiAgICAvLyBTaW5jZSBiYXNpY2FsbHkgYWxsIGlucHV0cyBvZiB0aGUgTWF0U3RlcCBnZXQgcHJveGllZCB0aHJvdWdoIHRoZSB2aWV3IGRvd24gdG8gdGhlXG4gICAgLy8gdW5kZXJseWluZyBNYXRTdGVwSGVhZGVyLCB3ZSBoYXZlIHRvIG1ha2Ugc3VyZSB0aGF0IGNoYW5nZSBkZXRlY3Rpb24gcnVucyBjb3JyZWN0bHkuXG4gICAgdGhpcy5fc3RlcHBlci5fc3RhdGVDaGFuZ2VkKCk7XG4gIH1cblxuICBfbWFya0FzSW50ZXJhY3RlZCgpIHtcbiAgICBpZiAoIXRoaXMuaW50ZXJhY3RlZCkge1xuICAgICAgdGhpcy5pbnRlcmFjdGVkID0gdHJ1ZTtcbiAgICAgIHRoaXMuaW50ZXJhY3RlZFN0cmVhbS5lbWl0KHRoaXMpO1xuICAgIH1cbiAgfVxuXG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lZGl0YWJsZTogQm9vbGVhbklucHV0O1xuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfaGFzRXJyb3I6IEJvb2xlYW5JbnB1dDtcbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX29wdGlvbmFsOiBCb29sZWFuSW5wdXQ7XG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9jb21wbGV0ZWQ6IEJvb2xlYW5JbnB1dDtcbn1cblxuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Nka1N0ZXBwZXJdJyxcbiAgZXhwb3J0QXM6ICdjZGtTdGVwcGVyJyxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrU3RlcHBlciBpbXBsZW1lbnRzIEFmdGVyQ29udGVudEluaXQsIEFmdGVyVmlld0luaXQsIE9uRGVzdHJveSB7XG4gIC8qKiBFbWl0cyB3aGVuIHRoZSBjb21wb25lbnQgaXMgZGVzdHJveWVkLiAqL1xuICBwcm90ZWN0ZWQgcmVhZG9ubHkgX2Rlc3Ryb3llZCA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG5cbiAgLyoqIFVzZWQgZm9yIG1hbmFnaW5nIGtleWJvYXJkIGZvY3VzLiAqL1xuICBwcml2YXRlIF9rZXlNYW5hZ2VyOiBGb2N1c0tleU1hbmFnZXI8Rm9jdXNhYmxlT3B0aW9uPjtcblxuICBwcml2YXRlIF9kb2N1bWVudDogRG9jdW1lbnQ7XG5cbiAgLyoqIEZ1bGwgbGlzdCBvZiBzdGVwcyBpbnNpZGUgdGhlIHN0ZXBwZXIsIGluY2x1ZGluZyBpbnNpZGUgbmVzdGVkIHN0ZXBwZXJzLiAqL1xuICBAQ29udGVudENoaWxkcmVuKENka1N0ZXAsIHtkZXNjZW5kYW50czogdHJ1ZX0pIF9zdGVwczogUXVlcnlMaXN0PENka1N0ZXA+O1xuXG4gIC8qKiBTdGVwcyB0aGF0IGJlbG9uZyB0byB0aGUgY3VycmVudCBzdGVwcGVyLCBleGNsdWRpbmcgb25lcyBmcm9tIG5lc3RlZCBzdGVwcGVycy4gKi9cbiAgcmVhZG9ubHkgc3RlcHM6IFF1ZXJ5TGlzdDxDZGtTdGVwPiA9IG5ldyBRdWVyeUxpc3Q8Q2RrU3RlcD4oKTtcblxuICAvKiogVGhlIGxpc3Qgb2Ygc3RlcCBoZWFkZXJzIG9mIHRoZSBzdGVwcyBpbiB0aGUgc3RlcHBlci4gKi9cbiAgQENvbnRlbnRDaGlsZHJlbihDZGtTdGVwSGVhZGVyLCB7ZGVzY2VuZGFudHM6IHRydWV9KSBfc3RlcEhlYWRlcjogUXVlcnlMaXN0PENka1N0ZXBIZWFkZXI+O1xuXG4gIC8qKiBXaGV0aGVyIHRoZSB2YWxpZGl0eSBvZiBwcmV2aW91cyBzdGVwcyBzaG91bGQgYmUgY2hlY2tlZCBvciBub3QuICovXG4gIEBJbnB1dCgpXG4gIGdldCBsaW5lYXIoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2xpbmVhcjtcbiAgfVxuICBzZXQgbGluZWFyKHZhbHVlOiBib29sZWFuKSB7XG4gICAgdGhpcy5fbGluZWFyID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHZhbHVlKTtcbiAgfVxuICBwcml2YXRlIF9saW5lYXIgPSBmYWxzZTtcblxuICAvKiogVGhlIGluZGV4IG9mIHRoZSBzZWxlY3RlZCBzdGVwLiAqL1xuICBASW5wdXQoKVxuICBnZXQgc2VsZWN0ZWRJbmRleCgpIHtcbiAgICByZXR1cm4gdGhpcy5fc2VsZWN0ZWRJbmRleDtcbiAgfVxuICBzZXQgc2VsZWN0ZWRJbmRleChpbmRleDogbnVtYmVyKSB7XG4gICAgY29uc3QgbmV3SW5kZXggPSBjb2VyY2VOdW1iZXJQcm9wZXJ0eShpbmRleCk7XG5cbiAgICBpZiAodGhpcy5zdGVwcyAmJiB0aGlzLl9zdGVwcykge1xuICAgICAgLy8gRW5zdXJlIHRoYXQgdGhlIGluZGV4IGNhbid0IGJlIG91dCBvZiBib3VuZHMuXG4gICAgICBpZiAoIXRoaXMuX2lzVmFsaWRJbmRleChpbmRleCkgJiYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkpIHtcbiAgICAgICAgdGhyb3cgRXJyb3IoJ2Nka1N0ZXBwZXI6IENhbm5vdCBhc3NpZ24gb3V0LW9mLWJvdW5kcyB2YWx1ZSB0byBgc2VsZWN0ZWRJbmRleGAuJyk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuc2VsZWN0ZWQ/Ll9tYXJrQXNJbnRlcmFjdGVkKCk7XG5cbiAgICAgIGlmICh0aGlzLl9zZWxlY3RlZEluZGV4ICE9PSBuZXdJbmRleCAmJiAhdGhpcy5fYW55Q29udHJvbHNJbnZhbGlkT3JQZW5kaW5nKG5ld0luZGV4KSAmJlxuICAgICAgICAgIChuZXdJbmRleCA+PSB0aGlzLl9zZWxlY3RlZEluZGV4IHx8IHRoaXMuc3RlcHMudG9BcnJheSgpW25ld0luZGV4XS5lZGl0YWJsZSkpIHtcbiAgICAgICAgdGhpcy5fdXBkYXRlU2VsZWN0ZWRJdGVtSW5kZXgoaW5kZXgpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9zZWxlY3RlZEluZGV4ID0gbmV3SW5kZXg7XG4gICAgfVxuICB9XG4gIHByaXZhdGUgX3NlbGVjdGVkSW5kZXggPSAwO1xuXG4gIC8qKiBUaGUgc3RlcCB0aGF0IGlzIHNlbGVjdGVkLiAqL1xuICBASW5wdXQoKVxuICBnZXQgc2VsZWN0ZWQoKTogQ2RrU3RlcCB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMuc3RlcHMgPyB0aGlzLnN0ZXBzLnRvQXJyYXkoKVt0aGlzLnNlbGVjdGVkSW5kZXhdIDogdW5kZWZpbmVkO1xuICB9XG4gIHNldCBzZWxlY3RlZChzdGVwOiBDZGtTdGVwIHwgdW5kZWZpbmVkKSB7XG4gICAgdGhpcy5zZWxlY3RlZEluZGV4ID0gKHN0ZXAgJiYgdGhpcy5zdGVwcykgPyB0aGlzLnN0ZXBzLnRvQXJyYXkoKS5pbmRleE9mKHN0ZXApIDogLTE7XG4gIH1cblxuICAvKiogRXZlbnQgZW1pdHRlZCB3aGVuIHRoZSBzZWxlY3RlZCBzdGVwIGhhcyBjaGFuZ2VkLiAqL1xuICBAT3V0cHV0KCkgcmVhZG9ubHkgc2VsZWN0aW9uQ2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjxTdGVwcGVyU2VsZWN0aW9uRXZlbnQ+KCk7XG5cbiAgLyoqIFVzZWQgdG8gdHJhY2sgdW5pcXVlIElEIGZvciBlYWNoIHN0ZXBwZXIgY29tcG9uZW50LiAqL1xuICBfZ3JvdXBJZDogbnVtYmVyO1xuXG4gIC8qKiBPcmllbnRhdGlvbiBvZiB0aGUgc3RlcHBlci4gKi9cbiAgQElucHV0KClcbiAgZ2V0IG9yaWVudGF0aW9uKCk6IFN0ZXBwZXJPcmllbnRhdGlvbiB7IHJldHVybiB0aGlzLl9vcmllbnRhdGlvbjsgfVxuICBzZXQgb3JpZW50YXRpb24odmFsdWU6IFN0ZXBwZXJPcmllbnRhdGlvbikge1xuICAgIC8vIFRoaXMgaXMgYSBwcm90ZWN0ZWQgbWV0aG9kIHNvIHRoYXQgYE1hdFN0ZXBwdGVyYCBjYW4gaG9vayBpbnRvIGl0LlxuICAgIHRoaXMuX29yaWVudGF0aW9uID0gdmFsdWU7XG5cbiAgICBpZiAodGhpcy5fa2V5TWFuYWdlcikge1xuICAgICAgdGhpcy5fa2V5TWFuYWdlci53aXRoVmVydGljYWxPcmllbnRhdGlvbih2YWx1ZSA9PT0gJ3ZlcnRpY2FsJyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBkZXByZWNhdGVkIFRvIGJlIHR1cm5lZCBpbnRvIGEgcHJpdmF0ZSBwcm9wZXJ0eS4gVXNlIGBvcmllbnRhdGlvbmAgaW5zdGVhZC5cbiAgICogQGJyZWFraW5nLWNoYW5nZSAxMy4wLjBcbiAgICovXG4gIHByb3RlY3RlZCBfb3JpZW50YXRpb246IFN0ZXBwZXJPcmllbnRhdGlvbiA9ICdob3Jpem9udGFsJztcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIEBPcHRpb25hbCgpIHByaXZhdGUgX2RpcjogRGlyZWN0aW9uYWxpdHksIHByaXZhdGUgX2NoYW5nZURldGVjdG9yUmVmOiBDaGFuZ2VEZXRlY3RvclJlZixcbiAgICAgIHByaXZhdGUgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+LCBASW5qZWN0KERPQ1VNRU5UKSBfZG9jdW1lbnQ6IGFueSkge1xuICAgIHRoaXMuX2dyb3VwSWQgPSBuZXh0SWQrKztcbiAgICB0aGlzLl9kb2N1bWVudCA9IF9kb2N1bWVudDtcbiAgfVxuXG4gIG5nQWZ0ZXJDb250ZW50SW5pdCgpIHtcbiAgICB0aGlzLl9zdGVwcy5jaGFuZ2VzXG4gICAgICAucGlwZShzdGFydFdpdGgodGhpcy5fc3RlcHMpLCB0YWtlVW50aWwodGhpcy5fZGVzdHJveWVkKSlcbiAgICAgIC5zdWJzY3JpYmUoKHN0ZXBzOiBRdWVyeUxpc3Q8Q2RrU3RlcD4pID0+IHtcbiAgICAgICAgdGhpcy5zdGVwcy5yZXNldChzdGVwcy5maWx0ZXIoc3RlcCA9PiBzdGVwLl9zdGVwcGVyID09PSB0aGlzKSk7XG4gICAgICAgIHRoaXMuc3RlcHMubm90aWZ5T25DaGFuZ2VzKCk7XG4gICAgICB9KTtcbiAgfVxuXG4gIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcbiAgICAvLyBOb3RlIHRoYXQgd2hpbGUgdGhlIHN0ZXAgaGVhZGVycyBhcmUgY29udGVudCBjaGlsZHJlbiBieSBkZWZhdWx0LCBhbnkgY29tcG9uZW50cyB0aGF0XG4gICAgLy8gZXh0ZW5kIHRoaXMgb25lIG1pZ2h0IGhhdmUgdGhlbSBhcyB2aWV3IGNoaWxkcmVuLiBXZSBpbml0aWFsaXplIHRoZSBrZXlib2FyZCBoYW5kbGluZyBpblxuICAgIC8vIEFmdGVyVmlld0luaXQgc28gd2UncmUgZ3VhcmFudGVlZCBmb3IgYm90aCB2aWV3IGFuZCBjb250ZW50IGNoaWxkcmVuIHRvIGJlIGRlZmluZWQuXG4gICAgdGhpcy5fa2V5TWFuYWdlciA9IG5ldyBGb2N1c0tleU1hbmFnZXI8Rm9jdXNhYmxlT3B0aW9uPih0aGlzLl9zdGVwSGVhZGVyKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgLndpdGhXcmFwKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIC53aXRoSG9tZUFuZEVuZCgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAud2l0aFZlcnRpY2FsT3JpZW50YXRpb24odGhpcy5fb3JpZW50YXRpb24gPT09ICd2ZXJ0aWNhbCcpO1xuXG4gICAgKHRoaXMuX2RpciA/ICh0aGlzLl9kaXIuY2hhbmdlIGFzIE9ic2VydmFibGU8RGlyZWN0aW9uPikgOiBvYnNlcnZhYmxlT2Y8RGlyZWN0aW9uPigpKVxuICAgICAgICAucGlwZShzdGFydFdpdGgodGhpcy5fbGF5b3V0RGlyZWN0aW9uKCkpLCB0YWtlVW50aWwodGhpcy5fZGVzdHJveWVkKSlcbiAgICAgICAgLnN1YnNjcmliZShkaXJlY3Rpb24gPT4gdGhpcy5fa2V5TWFuYWdlci53aXRoSG9yaXpvbnRhbE9yaWVudGF0aW9uKGRpcmVjdGlvbikpO1xuXG4gICAgdGhpcy5fa2V5TWFuYWdlci51cGRhdGVBY3RpdmVJdGVtKHRoaXMuX3NlbGVjdGVkSW5kZXgpO1xuXG4gICAgLy8gTm8gbmVlZCB0byBgdGFrZVVudGlsYCBoZXJlLCBiZWNhdXNlIHdlJ3JlIHRoZSBvbmVzIGRlc3Ryb3lpbmcgYHN0ZXBzYC5cbiAgICB0aGlzLnN0ZXBzLmNoYW5nZXMuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgIGlmICghdGhpcy5zZWxlY3RlZCkge1xuICAgICAgICB0aGlzLl9zZWxlY3RlZEluZGV4ID0gTWF0aC5tYXgodGhpcy5fc2VsZWN0ZWRJbmRleCAtIDEsIDApO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gVGhlIGxvZ2ljIHdoaWNoIGFzc2VydHMgdGhhdCB0aGUgc2VsZWN0ZWQgaW5kZXggaXMgd2l0aGluIGJvdW5kcyBkb2Vzbid0IHJ1biBiZWZvcmUgdGhlXG4gICAgLy8gc3RlcHMgYXJlIGluaXRpYWxpemVkLCBiZWNhdXNlIHdlIGRvbid0IGhvdyBtYW55IHN0ZXBzIHRoZXJlIGFyZSB5ZXQgc28gd2UgbWF5IGhhdmUgYW5cbiAgICAvLyBpbnZhbGlkIGluZGV4IG9uIGluaXQuIElmIHRoYXQncyB0aGUgY2FzZSwgYXV0by1jb3JyZWN0IHRvIHRoZSBkZWZhdWx0IHNvIHdlIGRvbid0IHRocm93LlxuICAgIGlmICghdGhpcy5faXNWYWxpZEluZGV4KHRoaXMuX3NlbGVjdGVkSW5kZXgpKSB7XG4gICAgICB0aGlzLl9zZWxlY3RlZEluZGV4ID0gMDtcbiAgICB9XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLnN0ZXBzLmRlc3Ryb3koKTtcbiAgICB0aGlzLl9kZXN0cm95ZWQubmV4dCgpO1xuICAgIHRoaXMuX2Rlc3Ryb3llZC5jb21wbGV0ZSgpO1xuICB9XG5cbiAgLyoqIFNlbGVjdHMgYW5kIGZvY3VzZXMgdGhlIG5leHQgc3RlcCBpbiBsaXN0LiAqL1xuICBuZXh0KCk6IHZvaWQge1xuICAgIHRoaXMuc2VsZWN0ZWRJbmRleCA9IE1hdGgubWluKHRoaXMuX3NlbGVjdGVkSW5kZXggKyAxLCB0aGlzLnN0ZXBzLmxlbmd0aCAtIDEpO1xuICB9XG5cbiAgLyoqIFNlbGVjdHMgYW5kIGZvY3VzZXMgdGhlIHByZXZpb3VzIHN0ZXAgaW4gbGlzdC4gKi9cbiAgcHJldmlvdXMoKTogdm9pZCB7XG4gICAgdGhpcy5zZWxlY3RlZEluZGV4ID0gTWF0aC5tYXgodGhpcy5fc2VsZWN0ZWRJbmRleCAtIDEsIDApO1xuICB9XG5cbiAgLyoqIFJlc2V0cyB0aGUgc3RlcHBlciB0byBpdHMgaW5pdGlhbCBzdGF0ZS4gTm90ZSB0aGF0IHRoaXMgaW5jbHVkZXMgY2xlYXJpbmcgZm9ybSBkYXRhLiAqL1xuICByZXNldCgpOiB2b2lkIHtcbiAgICB0aGlzLl91cGRhdGVTZWxlY3RlZEl0ZW1JbmRleCgwKTtcbiAgICB0aGlzLnN0ZXBzLmZvckVhY2goc3RlcCA9PiBzdGVwLnJlc2V0KCkpO1xuICAgIHRoaXMuX3N0YXRlQ2hhbmdlZCgpO1xuICB9XG5cbiAgLyoqIFJldHVybnMgYSB1bmlxdWUgaWQgZm9yIGVhY2ggc3RlcCBsYWJlbCBlbGVtZW50LiAqL1xuICBfZ2V0U3RlcExhYmVsSWQoaTogbnVtYmVyKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYGNkay1zdGVwLWxhYmVsLSR7dGhpcy5fZ3JvdXBJZH0tJHtpfWA7XG4gIH1cblxuICAvKiogUmV0dXJucyB1bmlxdWUgaWQgZm9yIGVhY2ggc3RlcCBjb250ZW50IGVsZW1lbnQuICovXG4gIF9nZXRTdGVwQ29udGVudElkKGk6IG51bWJlcik6IHN0cmluZyB7XG4gICAgcmV0dXJuIGBjZGstc3RlcC1jb250ZW50LSR7dGhpcy5fZ3JvdXBJZH0tJHtpfWA7XG4gIH1cblxuICAvKiogTWFya3MgdGhlIGNvbXBvbmVudCB0byBiZSBjaGFuZ2UgZGV0ZWN0ZWQuICovXG4gIF9zdGF0ZUNoYW5nZWQoKSB7XG4gICAgdGhpcy5fY2hhbmdlRGV0ZWN0b3JSZWYubWFya0ZvckNoZWNrKCk7XG4gIH1cblxuICAvKiogUmV0dXJucyBwb3NpdGlvbiBzdGF0ZSBvZiB0aGUgc3RlcCB3aXRoIHRoZSBnaXZlbiBpbmRleC4gKi9cbiAgX2dldEFuaW1hdGlvbkRpcmVjdGlvbihpbmRleDogbnVtYmVyKTogU3RlcENvbnRlbnRQb3NpdGlvblN0YXRlIHtcbiAgICBjb25zdCBwb3NpdGlvbiA9IGluZGV4IC0gdGhpcy5fc2VsZWN0ZWRJbmRleDtcbiAgICBpZiAocG9zaXRpb24gPCAwKSB7XG4gICAgICByZXR1cm4gdGhpcy5fbGF5b3V0RGlyZWN0aW9uKCkgPT09ICdydGwnID8gJ25leHQnIDogJ3ByZXZpb3VzJztcbiAgICB9IGVsc2UgaWYgKHBvc2l0aW9uID4gMCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2xheW91dERpcmVjdGlvbigpID09PSAncnRsJyA/ICdwcmV2aW91cycgOiAnbmV4dCc7XG4gICAgfVxuICAgIHJldHVybiAnY3VycmVudCc7XG4gIH1cblxuICAvKiogUmV0dXJucyB0aGUgdHlwZSBvZiBpY29uIHRvIGJlIGRpc3BsYXllZC4gKi9cbiAgX2dldEluZGljYXRvclR5cGUoaW5kZXg6IG51bWJlciwgc3RhdGU6IFN0ZXBTdGF0ZSA9IFNURVBfU1RBVEUuTlVNQkVSKTogU3RlcFN0YXRlIHtcbiAgICBjb25zdCBzdGVwID0gdGhpcy5zdGVwcy50b0FycmF5KClbaW5kZXhdO1xuICAgIGNvbnN0IGlzQ3VycmVudFN0ZXAgPSB0aGlzLl9pc0N1cnJlbnRTdGVwKGluZGV4KTtcblxuICAgIHJldHVybiBzdGVwLl9kaXNwbGF5RGVmYXVsdEluZGljYXRvclR5cGUgPyB0aGlzLl9nZXREZWZhdWx0SW5kaWNhdG9yTG9naWMoc3RlcCwgaXNDdXJyZW50U3RlcCkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9nZXRHdWlkZWxpbmVMb2dpYyhzdGVwLCBpc0N1cnJlbnRTdGVwLCBzdGF0ZSk7XG4gIH1cblxuICBwcml2YXRlIF9nZXREZWZhdWx0SW5kaWNhdG9yTG9naWMoc3RlcDogQ2RrU3RlcCwgaXNDdXJyZW50U3RlcDogYm9vbGVhbik6IFN0ZXBTdGF0ZSB7XG4gICAgaWYgKHN0ZXAuX3Nob3dFcnJvciAmJiBzdGVwLmhhc0Vycm9yICYmICFpc0N1cnJlbnRTdGVwKSB7XG4gICAgICByZXR1cm4gU1RFUF9TVEFURS5FUlJPUjtcbiAgICB9IGVsc2UgaWYgKCFzdGVwLmNvbXBsZXRlZCB8fCBpc0N1cnJlbnRTdGVwKSB7XG4gICAgICByZXR1cm4gU1RFUF9TVEFURS5OVU1CRVI7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBzdGVwLmVkaXRhYmxlID8gU1RFUF9TVEFURS5FRElUIDogU1RFUF9TVEFURS5ET05FO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2dldEd1aWRlbGluZUxvZ2ljKFxuICAgICAgc3RlcDogQ2RrU3RlcCwgaXNDdXJyZW50U3RlcDogYm9vbGVhbiwgc3RhdGU6IFN0ZXBTdGF0ZSA9IFNURVBfU1RBVEUuTlVNQkVSKTogU3RlcFN0YXRlIHtcbiAgICBpZiAoc3RlcC5fc2hvd0Vycm9yICYmIHN0ZXAuaGFzRXJyb3IgJiYgIWlzQ3VycmVudFN0ZXApIHtcbiAgICAgIHJldHVybiBTVEVQX1NUQVRFLkVSUk9SO1xuICAgIH0gZWxzZSBpZiAoc3RlcC5jb21wbGV0ZWQgJiYgIWlzQ3VycmVudFN0ZXApIHtcbiAgICAgIHJldHVybiBTVEVQX1NUQVRFLkRPTkU7XG4gICAgfSBlbHNlIGlmIChzdGVwLmNvbXBsZXRlZCAmJiBpc0N1cnJlbnRTdGVwKSB7XG4gICAgICByZXR1cm4gc3RhdGU7XG4gICAgfSBlbHNlIGlmIChzdGVwLmVkaXRhYmxlICYmIGlzQ3VycmVudFN0ZXApIHtcbiAgICAgIHJldHVybiBTVEVQX1NUQVRFLkVESVQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBzdGF0ZTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9pc0N1cnJlbnRTdGVwKGluZGV4OiBudW1iZXIpIHtcbiAgICByZXR1cm4gdGhpcy5fc2VsZWN0ZWRJbmRleCA9PT0gaW5kZXg7XG4gIH1cblxuICAvKiogUmV0dXJucyB0aGUgaW5kZXggb2YgdGhlIGN1cnJlbnRseS1mb2N1c2VkIHN0ZXAgaGVhZGVyLiAqL1xuICBfZ2V0Rm9jdXNJbmRleCgpIHtcbiAgICByZXR1cm4gdGhpcy5fa2V5TWFuYWdlciA/IHRoaXMuX2tleU1hbmFnZXIuYWN0aXZlSXRlbUluZGV4IDogdGhpcy5fc2VsZWN0ZWRJbmRleDtcbiAgfVxuXG4gIHByaXZhdGUgX3VwZGF0ZVNlbGVjdGVkSXRlbUluZGV4KG5ld0luZGV4OiBudW1iZXIpOiB2b2lkIHtcbiAgICBjb25zdCBzdGVwc0FycmF5ID0gdGhpcy5zdGVwcy50b0FycmF5KCk7XG4gICAgdGhpcy5zZWxlY3Rpb25DaGFuZ2UuZW1pdCh7XG4gICAgICBzZWxlY3RlZEluZGV4OiBuZXdJbmRleCxcbiAgICAgIHByZXZpb3VzbHlTZWxlY3RlZEluZGV4OiB0aGlzLl9zZWxlY3RlZEluZGV4LFxuICAgICAgc2VsZWN0ZWRTdGVwOiBzdGVwc0FycmF5W25ld0luZGV4XSxcbiAgICAgIHByZXZpb3VzbHlTZWxlY3RlZFN0ZXA6IHN0ZXBzQXJyYXlbdGhpcy5fc2VsZWN0ZWRJbmRleF0sXG4gICAgfSk7XG5cbiAgICAvLyBJZiBmb2N1cyBpcyBpbnNpZGUgdGhlIHN0ZXBwZXIsIG1vdmUgaXQgdG8gdGhlIG5leHQgaGVhZGVyLCBvdGhlcndpc2UgaXQgbWF5IGJlY29tZVxuICAgIC8vIGxvc3Qgd2hlbiB0aGUgYWN0aXZlIHN0ZXAgY29udGVudCBpcyBoaWRkZW4uIFdlIGNhbid0IGJlIG1vcmUgZ3JhbnVsYXIgd2l0aCB0aGUgY2hlY2tcbiAgICAvLyAoZS5nLiBjaGVja2luZyB3aGV0aGVyIGZvY3VzIGlzIGluc2lkZSB0aGUgYWN0aXZlIHN0ZXApLCBiZWNhdXNlIHdlIGRvbid0IGhhdmUgYVxuICAgIC8vIHJlZmVyZW5jZSB0byB0aGUgZWxlbWVudHMgdGhhdCBhcmUgcmVuZGVyaW5nIG91dCB0aGUgY29udGVudC5cbiAgICB0aGlzLl9jb250YWluc0ZvY3VzKCkgPyB0aGlzLl9rZXlNYW5hZ2VyLnNldEFjdGl2ZUl0ZW0obmV3SW5kZXgpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9rZXlNYW5hZ2VyLnVwZGF0ZUFjdGl2ZUl0ZW0obmV3SW5kZXgpO1xuXG4gICAgdGhpcy5fc2VsZWN0ZWRJbmRleCA9IG5ld0luZGV4O1xuICAgIHRoaXMuX3N0YXRlQ2hhbmdlZCgpO1xuICB9XG5cbiAgX29uS2V5ZG93bihldmVudDogS2V5Ym9hcmRFdmVudCkge1xuICAgIGNvbnN0IGhhc01vZGlmaWVyID0gaGFzTW9kaWZpZXJLZXkoZXZlbnQpO1xuICAgIGNvbnN0IGtleUNvZGUgPSBldmVudC5rZXlDb2RlO1xuICAgIGNvbnN0IG1hbmFnZXIgPSB0aGlzLl9rZXlNYW5hZ2VyO1xuXG4gICAgaWYgKG1hbmFnZXIuYWN0aXZlSXRlbUluZGV4ICE9IG51bGwgJiYgIWhhc01vZGlmaWVyICYmXG4gICAgICAgIChrZXlDb2RlID09PSBTUEFDRSB8fCBrZXlDb2RlID09PSBFTlRFUikpIHtcbiAgICAgIHRoaXMuc2VsZWN0ZWRJbmRleCA9IG1hbmFnZXIuYWN0aXZlSXRlbUluZGV4O1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbWFuYWdlci5vbktleWRvd24oZXZlbnQpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2FueUNvbnRyb2xzSW52YWxpZE9yUGVuZGluZyhpbmRleDogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMuX2xpbmVhciAmJiBpbmRleCA+PSAwKSB7XG4gICAgICByZXR1cm4gdGhpcy5zdGVwcy50b0FycmF5KCkuc2xpY2UoMCwgaW5kZXgpLnNvbWUoc3RlcCA9PiB7XG4gICAgICAgIGNvbnN0IGNvbnRyb2wgPSBzdGVwLnN0ZXBDb250cm9sO1xuICAgICAgICBjb25zdCBpc0luY29tcGxldGUgPVxuICAgICAgICAgICAgY29udHJvbCA/IChjb250cm9sLmludmFsaWQgfHwgY29udHJvbC5wZW5kaW5nIHx8ICFzdGVwLmludGVyYWN0ZWQpIDogIXN0ZXAuY29tcGxldGVkO1xuICAgICAgICByZXR1cm4gaXNJbmNvbXBsZXRlICYmICFzdGVwLm9wdGlvbmFsICYmICFzdGVwLl9jb21wbGV0ZWRPdmVycmlkZTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHByaXZhdGUgX2xheW91dERpcmVjdGlvbigpOiBEaXJlY3Rpb24ge1xuICAgIHJldHVybiB0aGlzLl9kaXIgJiYgdGhpcy5fZGlyLnZhbHVlID09PSAncnRsJyA/ICdydGwnIDogJ2x0cic7XG4gIH1cblxuICAvKiogQ2hlY2tzIHdoZXRoZXIgdGhlIHN0ZXBwZXIgY29udGFpbnMgdGhlIGZvY3VzZWQgZWxlbWVudC4gKi9cbiAgcHJpdmF0ZSBfY29udGFpbnNGb2N1cygpOiBib29sZWFuIHtcbiAgICBjb25zdCBzdGVwcGVyRWxlbWVudCA9IHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudDtcbiAgICBjb25zdCBmb2N1c2VkRWxlbWVudCA9IHRoaXMuX2RvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7XG4gICAgcmV0dXJuIHN0ZXBwZXJFbGVtZW50ID09PSBmb2N1c2VkRWxlbWVudCB8fCBzdGVwcGVyRWxlbWVudC5jb250YWlucyhmb2N1c2VkRWxlbWVudCk7XG4gIH1cblxuICAvKiogQ2hlY2tzIHdoZXRoZXIgdGhlIHBhc3NlZC1pbiBpbmRleCBpcyBhIHZhbGlkIHN0ZXAgaW5kZXguICovXG4gIHByaXZhdGUgX2lzVmFsaWRJbmRleChpbmRleDogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGluZGV4ID4gLTEgJiYgKCF0aGlzLnN0ZXBzIHx8IGluZGV4IDwgdGhpcy5zdGVwcy5sZW5ndGgpO1xuICB9XG5cbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VkaXRhYmxlOiBCb29sZWFuSW5wdXQ7XG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9vcHRpb25hbDogQm9vbGVhbklucHV0O1xuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfY29tcGxldGVkOiBCb29sZWFuSW5wdXQ7XG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9oYXNFcnJvcjogQm9vbGVhbklucHV0O1xuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfbGluZWFyOiBCb29sZWFuSW5wdXQ7XG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zZWxlY3RlZEluZGV4OiBOdW1iZXJJbnB1dDtcbn1cblxuXG4vKipcbiAqIFNpbXBsaWZpZWQgcmVwcmVzZW50YXRpb24gb2YgYW4gXCJBYnN0cmFjdENvbnRyb2xcIiBmcm9tIEBhbmd1bGFyL2Zvcm1zLlxuICogVXNlZCB0byBhdm9pZCBoYXZpbmcgdG8gYnJpbmcgaW4gQGFuZ3VsYXIvZm9ybXMgZm9yIGEgc2luZ2xlIG9wdGlvbmFsIGludGVyZmFjZS5cbiAqIEBkb2NzLXByaXZhdGVcbiAqL1xuaW50ZXJmYWNlIEFic3RyYWN0Q29udHJvbExpa2Uge1xuICBhc3luY1ZhbGlkYXRvcjogKChjb250cm9sOiBhbnkpID0+IGFueSkgfCBudWxsO1xuICBkaXJ0eTogYm9vbGVhbjtcbiAgZGlzYWJsZWQ6IGJvb2xlYW47XG4gIGVuYWJsZWQ6IGJvb2xlYW47XG4gIGVycm9yczoge1trZXk6IHN0cmluZ106IGFueX0gfCBudWxsO1xuICBpbnZhbGlkOiBib29sZWFuO1xuICBwYXJlbnQ6IGFueTtcbiAgcGVuZGluZzogYm9vbGVhbjtcbiAgcHJpc3RpbmU6IGJvb2xlYW47XG4gIHJvb3Q6IEFic3RyYWN0Q29udHJvbExpa2U7XG4gIHN0YXR1czogc3RyaW5nO1xuICByZWFkb25seSBzdGF0dXNDaGFuZ2VzOiBPYnNlcnZhYmxlPGFueT47XG4gIHRvdWNoZWQ6IGJvb2xlYW47XG4gIHVudG91Y2hlZDogYm9vbGVhbjtcbiAgdXBkYXRlT246IGFueTtcbiAgdmFsaWQ6IGJvb2xlYW47XG4gIHZhbGlkYXRvcjogKChjb250cm9sOiBhbnkpID0+IGFueSkgfCBudWxsO1xuICB2YWx1ZTogYW55O1xuICByZWFkb25seSB2YWx1ZUNoYW5nZXM6IE9ic2VydmFibGU8YW55PjtcbiAgY2xlYXJBc3luY1ZhbGlkYXRvcnMoKTogdm9pZDtcbiAgY2xlYXJWYWxpZGF0b3JzKCk6IHZvaWQ7XG4gIGRpc2FibGUob3B0cz86IGFueSk6IHZvaWQ7XG4gIGVuYWJsZShvcHRzPzogYW55KTogdm9pZDtcbiAgZ2V0KHBhdGg6IChzdHJpbmcgfCBudW1iZXIpW10gfCBzdHJpbmcpOiBBYnN0cmFjdENvbnRyb2xMaWtlIHwgbnVsbDtcbiAgZ2V0RXJyb3IoZXJyb3JDb2RlOiBzdHJpbmcsIHBhdGg/OiAoc3RyaW5nIHwgbnVtYmVyKVtdIHwgc3RyaW5nKTogYW55O1xuICBoYXNFcnJvcihlcnJvckNvZGU6IHN0cmluZywgcGF0aD86IChzdHJpbmcgfCBudW1iZXIpW10gfCBzdHJpbmcpOiBib29sZWFuO1xuICBtYXJrQWxsQXNUb3VjaGVkKCk6IHZvaWQ7XG4gIG1hcmtBc0RpcnR5KG9wdHM/OiBhbnkpOiB2b2lkO1xuICBtYXJrQXNQZW5kaW5nKG9wdHM/OiBhbnkpOiB2b2lkO1xuICBtYXJrQXNQcmlzdGluZShvcHRzPzogYW55KTogdm9pZDtcbiAgbWFya0FzVG91Y2hlZChvcHRzPzogYW55KTogdm9pZDtcbiAgbWFya0FzVW50b3VjaGVkKG9wdHM/OiBhbnkpOiB2b2lkO1xuICBwYXRjaFZhbHVlKHZhbHVlOiBhbnksIG9wdGlvbnM/OiBPYmplY3QpOiB2b2lkO1xuICByZXNldCh2YWx1ZT86IGFueSwgb3B0aW9ucz86IE9iamVjdCk6IHZvaWQ7XG4gIHNldEFzeW5jVmFsaWRhdG9ycyhuZXdWYWxpZGF0b3I6IChjb250cm9sOiBhbnkpID0+IGFueSB8XG4gICAgKChjb250cm9sOiBhbnkpID0+IGFueSlbXSB8IG51bGwpOiB2b2lkO1xuICBzZXRFcnJvcnMoZXJyb3JzOiB7W2tleTogc3RyaW5nXTogYW55fSB8IG51bGwsIG9wdHM/OiBhbnkpOiB2b2lkO1xuICBzZXRQYXJlbnQocGFyZW50OiBhbnkpOiB2b2lkO1xuICBzZXRWYWxpZGF0b3JzKG5ld1ZhbGlkYXRvcjogKGNvbnRyb2w6IGFueSkgPT4gYW55IHxcbiAgICAoKGNvbnRyb2w6IGFueSkgPT4gYW55KVtdIHwgbnVsbCk6IHZvaWQ7XG4gIHNldFZhbHVlKHZhbHVlOiBhbnksIG9wdGlvbnM/OiBPYmplY3QpOiB2b2lkO1xuICB1cGRhdGVWYWx1ZUFuZFZhbGlkaXR5KG9wdHM/OiBhbnkpOiB2b2lkO1xuICBwYXRjaFZhbHVlKHZhbHVlOiBhbnksIG9wdGlvbnM/OiBhbnkpOiB2b2lkO1xuICByZXNldChmb3JtU3RhdGU/OiBhbnksIG9wdGlvbnM/OiBhbnkpOiB2b2lkO1xuICBzZXRWYWx1ZSh2YWx1ZTogYW55LCBvcHRpb25zPzogYW55KTogdm9pZDtcbn1cbiJdfQ==