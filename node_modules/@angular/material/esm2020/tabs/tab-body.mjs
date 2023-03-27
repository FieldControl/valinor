/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ComponentFactoryResolver, Directive, ElementRef, EventEmitter, forwardRef, Inject, Input, Optional, Output, ViewChild, ViewContainerRef, ViewEncapsulation, } from '@angular/core';
import { CdkPortalOutlet, TemplatePortal } from '@angular/cdk/portal';
import { Directionality } from '@angular/cdk/bidi';
import { DOCUMENT } from '@angular/common';
import { Subject, Subscription } from 'rxjs';
import { distinctUntilChanged, startWith } from 'rxjs/operators';
import { matTabsAnimations } from './tabs-animations';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/bidi";
/**
 * The portal host directive for the contents of the tab.
 * @docs-private
 */
export class MatTabBodyPortal extends CdkPortalOutlet {
    constructor(componentFactoryResolver, viewContainerRef, _host, _document) {
        super(componentFactoryResolver, viewContainerRef, _document);
        this._host = _host;
        /** Subscription to events for when the tab body begins centering. */
        this._centeringSub = Subscription.EMPTY;
        /** Subscription to events for when the tab body finishes leaving from center position. */
        this._leavingSub = Subscription.EMPTY;
    }
    /** Set initial visibility or set up subscription for changing visibility. */
    ngOnInit() {
        super.ngOnInit();
        this._centeringSub = this._host._beforeCentering
            .pipe(startWith(this._host._isCenterPosition(this._host._position)))
            .subscribe((isCentering) => {
            if (isCentering && !this.hasAttached()) {
                this.attach(this._host._content);
            }
        });
        this._leavingSub = this._host._afterLeavingCenter.subscribe(() => {
            if (!this._host.preserveContent) {
                this.detach();
            }
        });
    }
    /** Clean up centering subscription. */
    ngOnDestroy() {
        super.ngOnDestroy();
        this._centeringSub.unsubscribe();
        this._leavingSub.unsubscribe();
    }
}
MatTabBodyPortal.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: MatTabBodyPortal, deps: [{ token: i0.ComponentFactoryResolver }, { token: i0.ViewContainerRef }, { token: forwardRef(() => MatTabBody) }, { token: DOCUMENT }], target: i0.ɵɵFactoryTarget.Directive });
MatTabBodyPortal.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "15.2.0-rc.0", type: MatTabBodyPortal, selector: "[matTabBodyHost]", usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: MatTabBodyPortal, decorators: [{
            type: Directive,
            args: [{
                    selector: '[matTabBodyHost]',
                }]
        }], ctorParameters: function () { return [{ type: i0.ComponentFactoryResolver }, { type: i0.ViewContainerRef }, { type: MatTabBody, decorators: [{
                    type: Inject,
                    args: [forwardRef(() => MatTabBody)]
                }] }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }]; } });
/**
 * Base class with all of the `MatTabBody` functionality.
 * @docs-private
 */
export class _MatTabBodyBase {
    /** The shifted index position of the tab body, where zero represents the active center tab. */
    set position(position) {
        this._positionIndex = position;
        this._computePositionAnimationState();
    }
    constructor(_elementRef, _dir, changeDetectorRef) {
        this._elementRef = _elementRef;
        this._dir = _dir;
        /** Subscription to the directionality change observable. */
        this._dirChangeSubscription = Subscription.EMPTY;
        /** Emits when an animation on the tab is complete. */
        this._translateTabComplete = new Subject();
        /** Event emitted when the tab begins to animate towards the center as the active tab. */
        this._onCentering = new EventEmitter();
        /** Event emitted before the centering of the tab begins. */
        this._beforeCentering = new EventEmitter();
        /** Event emitted before the centering of the tab begins. */
        this._afterLeavingCenter = new EventEmitter();
        /** Event emitted when the tab completes its animation towards the center. */
        this._onCentered = new EventEmitter(true);
        // Note that the default value will always be overwritten by `MatTabBody`, but we need one
        // anyway to prevent the animations module from throwing an error if the body is used on its own.
        /** Duration for the tab's animation. */
        this.animationDuration = '500ms';
        /** Whether the tab's content should be kept in the DOM while it's off-screen. */
        this.preserveContent = false;
        if (_dir) {
            this._dirChangeSubscription = _dir.change.subscribe((dir) => {
                this._computePositionAnimationState(dir);
                changeDetectorRef.markForCheck();
            });
        }
        // Ensure that we get unique animation events, because the `.done` callback can get
        // invoked twice in some browsers. See https://github.com/angular/angular/issues/24084.
        this._translateTabComplete
            .pipe(distinctUntilChanged((x, y) => {
            return x.fromState === y.fromState && x.toState === y.toState;
        }))
            .subscribe(event => {
            // If the transition to the center is complete, emit an event.
            if (this._isCenterPosition(event.toState) && this._isCenterPosition(this._position)) {
                this._onCentered.emit();
            }
            if (this._isCenterPosition(event.fromState) && !this._isCenterPosition(this._position)) {
                this._afterLeavingCenter.emit();
            }
        });
    }
    /**
     * After initialized, check if the content is centered and has an origin. If so, set the
     * special position states that transition the tab from the left or right before centering.
     */
    ngOnInit() {
        if (this._position == 'center' && this.origin != null) {
            this._position = this._computePositionFromOrigin(this.origin);
        }
    }
    ngOnDestroy() {
        this._dirChangeSubscription.unsubscribe();
        this._translateTabComplete.complete();
    }
    _onTranslateTabStarted(event) {
        const isCentering = this._isCenterPosition(event.toState);
        this._beforeCentering.emit(isCentering);
        if (isCentering) {
            this._onCentering.emit(this._elementRef.nativeElement.clientHeight);
        }
    }
    /** The text direction of the containing app. */
    _getLayoutDirection() {
        return this._dir && this._dir.value === 'rtl' ? 'rtl' : 'ltr';
    }
    /** Whether the provided position state is considered center, regardless of origin. */
    _isCenterPosition(position) {
        return (position == 'center' || position == 'left-origin-center' || position == 'right-origin-center');
    }
    /** Computes the position state that will be used for the tab-body animation trigger. */
    _computePositionAnimationState(dir = this._getLayoutDirection()) {
        if (this._positionIndex < 0) {
            this._position = dir == 'ltr' ? 'left' : 'right';
        }
        else if (this._positionIndex > 0) {
            this._position = dir == 'ltr' ? 'right' : 'left';
        }
        else {
            this._position = 'center';
        }
    }
    /**
     * Computes the position state based on the specified origin position. This is used if the
     * tab is becoming visible immediately after creation.
     */
    _computePositionFromOrigin(origin) {
        const dir = this._getLayoutDirection();
        if ((dir == 'ltr' && origin <= 0) || (dir == 'rtl' && origin > 0)) {
            return 'left-origin-center';
        }
        return 'right-origin-center';
    }
}
_MatTabBodyBase.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: _MatTabBodyBase, deps: [{ token: i0.ElementRef }, { token: i1.Directionality, optional: true }, { token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Directive });
_MatTabBodyBase.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "15.2.0-rc.0", type: _MatTabBodyBase, inputs: { _content: ["content", "_content"], origin: "origin", animationDuration: "animationDuration", preserveContent: "preserveContent", position: "position" }, outputs: { _onCentering: "_onCentering", _beforeCentering: "_beforeCentering", _afterLeavingCenter: "_afterLeavingCenter", _onCentered: "_onCentered" }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: _MatTabBodyBase, decorators: [{
            type: Directive
        }], ctorParameters: function () { return [{ type: i0.ElementRef }, { type: i1.Directionality, decorators: [{
                    type: Optional
                }] }, { type: i0.ChangeDetectorRef }]; }, propDecorators: { _onCentering: [{
                type: Output
            }], _beforeCentering: [{
                type: Output
            }], _afterLeavingCenter: [{
                type: Output
            }], _onCentered: [{
                type: Output
            }], _content: [{
                type: Input,
                args: ['content']
            }], origin: [{
                type: Input
            }], animationDuration: [{
                type: Input
            }], preserveContent: [{
                type: Input
            }], position: [{
                type: Input
            }] } });
/**
 * Wrapper for the contents of a tab.
 * @docs-private
 */
export class MatTabBody extends _MatTabBodyBase {
    constructor(elementRef, dir, changeDetectorRef) {
        super(elementRef, dir, changeDetectorRef);
    }
}
MatTabBody.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: MatTabBody, deps: [{ token: i0.ElementRef }, { token: i1.Directionality, optional: true }, { token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Component });
MatTabBody.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "15.2.0-rc.0", type: MatTabBody, selector: "mat-tab-body", host: { classAttribute: "mat-mdc-tab-body" }, viewQueries: [{ propertyName: "_portalHost", first: true, predicate: CdkPortalOutlet, descendants: true }], usesInheritance: true, ngImport: i0, template: "<div class=\"mat-mdc-tab-body-content\" #content\n     [@translateTab]=\"{\n        value: _position,\n        params: {animationDuration: animationDuration}\n     }\"\n     (@translateTab.start)=\"_onTranslateTabStarted($event)\"\n     (@translateTab.done)=\"_translateTabComplete.next($event)\"\n     cdkScrollable>\n  <ng-template matTabBodyHost></ng-template>\n</div>\n", styles: [".mat-mdc-tab-body{top:0;left:0;right:0;bottom:0;position:absolute;display:block;overflow:hidden;outline:0;flex-basis:100%}.mat-mdc-tab-body.mat-mdc-tab-body-active{position:relative;overflow-x:hidden;overflow-y:auto;z-index:1;flex-grow:1}.mat-mdc-tab-group.mat-mdc-tab-group-dynamic-height .mat-mdc-tab-body.mat-mdc-tab-body-active{overflow-y:hidden}.mat-mdc-tab-body-content{height:100%;overflow:auto}.mat-mdc-tab-group-dynamic-height .mat-mdc-tab-body-content{overflow:hidden}.mat-mdc-tab-body-content[style*=\"visibility: hidden\"]{display:none}"], dependencies: [{ kind: "directive", type: MatTabBodyPortal, selector: "[matTabBodyHost]" }], animations: [matTabsAnimations.translateTab], changeDetection: i0.ChangeDetectionStrategy.Default, encapsulation: i0.ViewEncapsulation.None });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: MatTabBody, decorators: [{
            type: Component,
            args: [{ selector: 'mat-tab-body', encapsulation: ViewEncapsulation.None, changeDetection: ChangeDetectionStrategy.Default, animations: [matTabsAnimations.translateTab], host: {
                        'class': 'mat-mdc-tab-body',
                    }, template: "<div class=\"mat-mdc-tab-body-content\" #content\n     [@translateTab]=\"{\n        value: _position,\n        params: {animationDuration: animationDuration}\n     }\"\n     (@translateTab.start)=\"_onTranslateTabStarted($event)\"\n     (@translateTab.done)=\"_translateTabComplete.next($event)\"\n     cdkScrollable>\n  <ng-template matTabBodyHost></ng-template>\n</div>\n", styles: [".mat-mdc-tab-body{top:0;left:0;right:0;bottom:0;position:absolute;display:block;overflow:hidden;outline:0;flex-basis:100%}.mat-mdc-tab-body.mat-mdc-tab-body-active{position:relative;overflow-x:hidden;overflow-y:auto;z-index:1;flex-grow:1}.mat-mdc-tab-group.mat-mdc-tab-group-dynamic-height .mat-mdc-tab-body.mat-mdc-tab-body-active{overflow-y:hidden}.mat-mdc-tab-body-content{height:100%;overflow:auto}.mat-mdc-tab-group-dynamic-height .mat-mdc-tab-body-content{overflow:hidden}.mat-mdc-tab-body-content[style*=\"visibility: hidden\"]{display:none}"] }]
        }], ctorParameters: function () { return [{ type: i0.ElementRef }, { type: i1.Directionality, decorators: [{
                    type: Optional
                }] }, { type: i0.ChangeDetectorRef }]; }, propDecorators: { _portalHost: [{
                type: ViewChild,
                args: [CdkPortalOutlet]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFiLWJvZHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvdGFicy90YWItYm9keS50cyIsIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC90YWJzL3RhYi1ib2R5Lmh0bWwiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLHVCQUF1QixFQUN2QixpQkFBaUIsRUFDakIsU0FBUyxFQUNULHdCQUF3QixFQUN4QixTQUFTLEVBQ1QsVUFBVSxFQUNWLFlBQVksRUFDWixVQUFVLEVBQ1YsTUFBTSxFQUNOLEtBQUssRUFHTCxRQUFRLEVBQ1IsTUFBTSxFQUNOLFNBQVMsRUFDVCxnQkFBZ0IsRUFDaEIsaUJBQWlCLEdBQ2xCLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBQyxlQUFlLEVBQUUsY0FBYyxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDcEUsT0FBTyxFQUFZLGNBQWMsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQzVELE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUN6QyxPQUFPLEVBQUMsT0FBTyxFQUFFLFlBQVksRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUMzQyxPQUFPLEVBQUMsb0JBQW9CLEVBQUUsU0FBUyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFFL0QsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sbUJBQW1CLENBQUM7OztBQUVwRDs7O0dBR0c7QUFJSCxNQUFNLE9BQU8sZ0JBQWlCLFNBQVEsZUFBZTtJQU1uRCxZQUNFLHdCQUFrRCxFQUNsRCxnQkFBa0MsRUFDWSxLQUFpQixFQUM3QyxTQUFjO1FBRWhDLEtBQUssQ0FBQyx3QkFBd0IsRUFBRSxnQkFBZ0IsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUhmLFVBQUssR0FBTCxLQUFLLENBQVk7UUFSakUscUVBQXFFO1FBQzdELGtCQUFhLEdBQUcsWUFBWSxDQUFDLEtBQUssQ0FBQztRQUMzQywwRkFBMEY7UUFDbEYsZ0JBQVcsR0FBRyxZQUFZLENBQUMsS0FBSyxDQUFDO0lBU3pDLENBQUM7SUFFRCw2RUFBNkU7SUFDcEUsUUFBUTtRQUNmLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUVqQixJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsZ0JBQWdCO2FBQzdDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7YUFDbkUsU0FBUyxDQUFDLENBQUMsV0FBb0IsRUFBRSxFQUFFO1lBQ2xDLElBQUksV0FBVyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFO2dCQUN0QyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDbEM7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUVMLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFO1lBQy9ELElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsRUFBRTtnQkFDL0IsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO2FBQ2Y7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCx1Q0FBdUM7SUFDOUIsV0FBVztRQUNsQixLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDcEIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUNqQyxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ2pDLENBQUM7O2tIQXZDVSxnQkFBZ0IsMEZBU2pCLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsYUFDNUIsUUFBUTtzR0FWUCxnQkFBZ0I7Z0dBQWhCLGdCQUFnQjtrQkFINUIsU0FBUzttQkFBQztvQkFDVCxRQUFRLEVBQUUsa0JBQWtCO2lCQUM3Qjs7MEJBVUksTUFBTTsyQkFBQyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsVUFBVSxDQUFDOzswQkFDbkMsTUFBTTsyQkFBQyxRQUFROztBQWlEcEI7OztHQUdHO0FBRUgsTUFBTSxPQUFnQixlQUFlO0lBMENuQywrRkFBK0Y7SUFDL0YsSUFDSSxRQUFRLENBQUMsUUFBZ0I7UUFDM0IsSUFBSSxDQUFDLGNBQWMsR0FBRyxRQUFRLENBQUM7UUFDL0IsSUFBSSxDQUFDLDhCQUE4QixFQUFFLENBQUM7SUFDeEMsQ0FBQztJQUVELFlBQ1UsV0FBb0MsRUFDeEIsSUFBb0IsRUFDeEMsaUJBQW9DO1FBRjVCLGdCQUFXLEdBQVgsV0FBVyxDQUF5QjtRQUN4QixTQUFJLEdBQUosSUFBSSxDQUFnQjtRQS9DMUMsNERBQTREO1FBQ3BELDJCQUFzQixHQUFHLFlBQVksQ0FBQyxLQUFLLENBQUM7UUFLcEQsc0RBQXNEO1FBQzdDLDBCQUFxQixHQUFHLElBQUksT0FBTyxFQUFrQixDQUFDO1FBRS9ELHlGQUF5RjtRQUN0RSxpQkFBWSxHQUF5QixJQUFJLFlBQVksRUFBVSxDQUFDO1FBRW5GLDREQUE0RDtRQUN6QyxxQkFBZ0IsR0FBMEIsSUFBSSxZQUFZLEVBQVcsQ0FBQztRQUV6Riw0REFBNEQ7UUFDekMsd0JBQW1CLEdBQXVCLElBQUksWUFBWSxFQUFRLENBQUM7UUFFdEYsNkVBQTZFO1FBQzFELGdCQUFXLEdBQXVCLElBQUksWUFBWSxDQUFPLElBQUksQ0FBQyxDQUFDO1FBV2xGLDBGQUEwRjtRQUMxRixpR0FBaUc7UUFDakcsd0NBQXdDO1FBQy9CLHNCQUFpQixHQUFXLE9BQU8sQ0FBQztRQUU3QyxpRkFBaUY7UUFDeEUsb0JBQWUsR0FBWSxLQUFLLENBQUM7UUFjeEMsSUFBSSxJQUFJLEVBQUU7WUFDUixJQUFJLENBQUMsc0JBQXNCLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxHQUFjLEVBQUUsRUFBRTtnQkFDckUsSUFBSSxDQUFDLDhCQUE4QixDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUN6QyxpQkFBaUIsQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUNuQyxDQUFDLENBQUMsQ0FBQztTQUNKO1FBRUQsbUZBQW1GO1FBQ25GLHVGQUF1RjtRQUN2RixJQUFJLENBQUMscUJBQXFCO2FBQ3ZCLElBQUksQ0FDSCxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUM1QixPQUFPLENBQUMsQ0FBQyxTQUFTLEtBQUssQ0FBQyxDQUFDLFNBQVMsSUFBSSxDQUFDLENBQUMsT0FBTyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUM7UUFDaEUsQ0FBQyxDQUFDLENBQ0g7YUFDQSxTQUFTLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDakIsOERBQThEO1lBQzlELElBQUksSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFO2dCQUNuRixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDO2FBQ3pCO1lBRUQsSUFBSSxJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRTtnQkFDdEYsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksRUFBRSxDQUFDO2FBQ2pDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsUUFBUTtRQUNOLElBQUksSUFBSSxDQUFDLFNBQVMsSUFBSSxRQUFRLElBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLEVBQUU7WUFDckQsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsMEJBQTBCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQy9EO0lBQ0gsQ0FBQztJQUVELFdBQVc7UUFDVCxJQUFJLENBQUMsc0JBQXNCLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDMUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ3hDLENBQUM7SUFFRCxzQkFBc0IsQ0FBQyxLQUFxQjtRQUMxQyxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzFELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDeEMsSUFBSSxXQUFXLEVBQUU7WUFDZixJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsQ0FBQztTQUNyRTtJQUNILENBQUM7SUFFRCxnREFBZ0Q7SUFDaEQsbUJBQW1CO1FBQ2pCLE9BQU8sSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0lBQ2hFLENBQUM7SUFFRCxzRkFBc0Y7SUFDdEYsaUJBQWlCLENBQUMsUUFBMEM7UUFDMUQsT0FBTyxDQUNMLFFBQVEsSUFBSSxRQUFRLElBQUksUUFBUSxJQUFJLG9CQUFvQixJQUFJLFFBQVEsSUFBSSxxQkFBcUIsQ0FDOUYsQ0FBQztJQUNKLENBQUM7SUFFRCx3RkFBd0Y7SUFDaEYsOEJBQThCLENBQUMsTUFBaUIsSUFBSSxDQUFDLG1CQUFtQixFQUFFO1FBQ2hGLElBQUksSUFBSSxDQUFDLGNBQWMsR0FBRyxDQUFDLEVBQUU7WUFDM0IsSUFBSSxDQUFDLFNBQVMsR0FBRyxHQUFHLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztTQUNsRDthQUFNLElBQUksSUFBSSxDQUFDLGNBQWMsR0FBRyxDQUFDLEVBQUU7WUFDbEMsSUFBSSxDQUFDLFNBQVMsR0FBRyxHQUFHLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztTQUNsRDthQUFNO1lBQ0wsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7U0FDM0I7SUFDSCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0ssMEJBQTBCLENBQUMsTUFBYztRQUMvQyxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztRQUV2QyxJQUFJLENBQUMsR0FBRyxJQUFJLEtBQUssSUFBSSxNQUFNLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksS0FBSyxJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUMsRUFBRTtZQUNqRSxPQUFPLG9CQUFvQixDQUFDO1NBQzdCO1FBRUQsT0FBTyxxQkFBcUIsQ0FBQztJQUMvQixDQUFDOztpSEEzSW1CLGVBQWU7cUdBQWYsZUFBZTtnR0FBZixlQUFlO2tCQURwQyxTQUFTOzswQkFvREwsUUFBUTs0RUFyQ1EsWUFBWTtzQkFBOUIsTUFBTTtnQkFHWSxnQkFBZ0I7c0JBQWxDLE1BQU07Z0JBR1ksbUJBQW1CO3NCQUFyQyxNQUFNO2dCQUdZLFdBQVc7c0JBQTdCLE1BQU07Z0JBTVcsUUFBUTtzQkFBekIsS0FBSzt1QkFBQyxTQUFTO2dCQUdQLE1BQU07c0JBQWQsS0FBSztnQkFLRyxpQkFBaUI7c0JBQXpCLEtBQUs7Z0JBR0csZUFBZTtzQkFBdkIsS0FBSztnQkFJRixRQUFRO3NCQURYLEtBQUs7O0FBbUdSOzs7R0FHRztBQWFILE1BQU0sT0FBTyxVQUFXLFNBQVEsZUFBZTtJQUc3QyxZQUNFLFVBQW1DLEVBQ3ZCLEdBQW1CLEVBQy9CLGlCQUFvQztRQUVwQyxLQUFLLENBQUMsVUFBVSxFQUFFLEdBQUcsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO0lBQzVDLENBQUM7OzRHQVRVLFVBQVU7Z0dBQVYsVUFBVSwrSUFDVixlQUFlLHVFQ3pRNUIsdVhBVUEsOGxCRGdDYSxnQkFBZ0IsK0NBeU5mLENBQUMsaUJBQWlCLENBQUMsWUFBWSxDQUFDO2dHQUtqQyxVQUFVO2tCQVp0QixTQUFTOytCQUNFLGNBQWMsaUJBR1QsaUJBQWlCLENBQUMsSUFBSSxtQkFFcEIsdUJBQXVCLENBQUMsT0FBTyxjQUNwQyxDQUFDLGlCQUFpQixDQUFDLFlBQVksQ0FBQyxRQUN0Qzt3QkFDSixPQUFPLEVBQUUsa0JBQWtCO3FCQUM1Qjs7MEJBT0UsUUFBUTs0RUFKaUIsV0FBVztzQkFBdEMsU0FBUzt1QkFBQyxlQUFlIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxuICBDaGFuZ2VEZXRlY3RvclJlZixcbiAgQ29tcG9uZW50LFxuICBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIsXG4gIERpcmVjdGl2ZSxcbiAgRWxlbWVudFJlZixcbiAgRXZlbnRFbWl0dGVyLFxuICBmb3J3YXJkUmVmLFxuICBJbmplY3QsXG4gIElucHV0LFxuICBPbkRlc3Ryb3ksXG4gIE9uSW5pdCxcbiAgT3B0aW9uYWwsXG4gIE91dHB1dCxcbiAgVmlld0NoaWxkLFxuICBWaWV3Q29udGFpbmVyUmVmLFxuICBWaWV3RW5jYXBzdWxhdGlvbixcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0Nka1BvcnRhbE91dGxldCwgVGVtcGxhdGVQb3J0YWx9IGZyb20gJ0Bhbmd1bGFyL2Nkay9wb3J0YWwnO1xuaW1wb3J0IHtEaXJlY3Rpb24sIERpcmVjdGlvbmFsaXR5fSBmcm9tICdAYW5ndWxhci9jZGsvYmlkaSc7XG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtTdWJqZWN0LCBTdWJzY3JpcHRpb259IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtkaXN0aW5jdFVudGlsQ2hhbmdlZCwgc3RhcnRXaXRofSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQge0FuaW1hdGlvbkV2ZW50fSBmcm9tICdAYW5ndWxhci9hbmltYXRpb25zJztcbmltcG9ydCB7bWF0VGFic0FuaW1hdGlvbnN9IGZyb20gJy4vdGFicy1hbmltYXRpb25zJztcblxuLyoqXG4gKiBUaGUgcG9ydGFsIGhvc3QgZGlyZWN0aXZlIGZvciB0aGUgY29udGVudHMgb2YgdGhlIHRhYi5cbiAqIEBkb2NzLXByaXZhdGVcbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW21hdFRhYkJvZHlIb3N0XScsXG59KVxuZXhwb3J0IGNsYXNzIE1hdFRhYkJvZHlQb3J0YWwgZXh0ZW5kcyBDZGtQb3J0YWxPdXRsZXQgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XG4gIC8qKiBTdWJzY3JpcHRpb24gdG8gZXZlbnRzIGZvciB3aGVuIHRoZSB0YWIgYm9keSBiZWdpbnMgY2VudGVyaW5nLiAqL1xuICBwcml2YXRlIF9jZW50ZXJpbmdTdWIgPSBTdWJzY3JpcHRpb24uRU1QVFk7XG4gIC8qKiBTdWJzY3JpcHRpb24gdG8gZXZlbnRzIGZvciB3aGVuIHRoZSB0YWIgYm9keSBmaW5pc2hlcyBsZWF2aW5nIGZyb20gY2VudGVyIHBvc2l0aW9uLiAqL1xuICBwcml2YXRlIF9sZWF2aW5nU3ViID0gU3Vic2NyaXB0aW9uLkVNUFRZO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIGNvbXBvbmVudEZhY3RvcnlSZXNvbHZlcjogQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyLFxuICAgIHZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWYsXG4gICAgQEluamVjdChmb3J3YXJkUmVmKCgpID0+IE1hdFRhYkJvZHkpKSBwcml2YXRlIF9ob3N0OiBNYXRUYWJCb2R5LFxuICAgIEBJbmplY3QoRE9DVU1FTlQpIF9kb2N1bWVudDogYW55LFxuICApIHtcbiAgICBzdXBlcihjb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIsIHZpZXdDb250YWluZXJSZWYsIF9kb2N1bWVudCk7XG4gIH1cblxuICAvKiogU2V0IGluaXRpYWwgdmlzaWJpbGl0eSBvciBzZXQgdXAgc3Vic2NyaXB0aW9uIGZvciBjaGFuZ2luZyB2aXNpYmlsaXR5LiAqL1xuICBvdmVycmlkZSBuZ09uSW5pdCgpOiB2b2lkIHtcbiAgICBzdXBlci5uZ09uSW5pdCgpO1xuXG4gICAgdGhpcy5fY2VudGVyaW5nU3ViID0gdGhpcy5faG9zdC5fYmVmb3JlQ2VudGVyaW5nXG4gICAgICAucGlwZShzdGFydFdpdGgodGhpcy5faG9zdC5faXNDZW50ZXJQb3NpdGlvbih0aGlzLl9ob3N0Ll9wb3NpdGlvbikpKVxuICAgICAgLnN1YnNjcmliZSgoaXNDZW50ZXJpbmc6IGJvb2xlYW4pID0+IHtcbiAgICAgICAgaWYgKGlzQ2VudGVyaW5nICYmICF0aGlzLmhhc0F0dGFjaGVkKCkpIHtcbiAgICAgICAgICB0aGlzLmF0dGFjaCh0aGlzLl9ob3N0Ll9jb250ZW50KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICB0aGlzLl9sZWF2aW5nU3ViID0gdGhpcy5faG9zdC5fYWZ0ZXJMZWF2aW5nQ2VudGVyLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICBpZiAoIXRoaXMuX2hvc3QucHJlc2VydmVDb250ZW50KSB7XG4gICAgICAgIHRoaXMuZGV0YWNoKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKiogQ2xlYW4gdXAgY2VudGVyaW5nIHN1YnNjcmlwdGlvbi4gKi9cbiAgb3ZlcnJpZGUgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgc3VwZXIubmdPbkRlc3Ryb3koKTtcbiAgICB0aGlzLl9jZW50ZXJpbmdTdWIudW5zdWJzY3JpYmUoKTtcbiAgICB0aGlzLl9sZWF2aW5nU3ViLnVuc3Vic2NyaWJlKCk7XG4gIH1cbn1cblxuLyoqXG4gKiBUaGVzZSBwb3NpdGlvbiBzdGF0ZXMgYXJlIHVzZWQgaW50ZXJuYWxseSBhcyBhbmltYXRpb24gc3RhdGVzIGZvciB0aGUgdGFiIGJvZHkuIFNldHRpbmcgdGhlXG4gKiBwb3NpdGlvbiBzdGF0ZSB0byBsZWZ0LCByaWdodCwgb3IgY2VudGVyIHdpbGwgdHJhbnNpdGlvbiB0aGUgdGFiIGJvZHkgZnJvbSBpdHMgY3VycmVudFxuICogcG9zaXRpb24gdG8gaXRzIHJlc3BlY3RpdmUgc3RhdGUuIElmIHRoZXJlIGlzIG5vdCBjdXJyZW50IHBvc2l0aW9uICh2b2lkLCBpbiB0aGUgY2FzZSBvZiBhIG5ld1xuICogdGFiIGJvZHkpLCB0aGVuIHRoZXJlIHdpbGwgYmUgbm8gdHJhbnNpdGlvbiBhbmltYXRpb24gdG8gaXRzIHN0YXRlLlxuICpcbiAqIEluIHRoZSBjYXNlIG9mIGEgbmV3IHRhYiBib2R5IHRoYXQgc2hvdWxkIGltbWVkaWF0ZWx5IGJlIGNlbnRlcmVkIHdpdGggYW4gYW5pbWF0aW5nIHRyYW5zaXRpb24sXG4gKiB0aGVuIGxlZnQtb3JpZ2luLWNlbnRlciBvciByaWdodC1vcmlnaW4tY2VudGVyIGNhbiBiZSB1c2VkLCB3aGljaCB3aWxsIHVzZSBsZWZ0IG9yIHJpZ2h0IGFzIGl0c1xuICogcHNldWRvLXByaW9yIHN0YXRlLlxuICovXG5leHBvcnQgdHlwZSBNYXRUYWJCb2R5UG9zaXRpb25TdGF0ZSA9XG4gIHwgJ2xlZnQnXG4gIHwgJ2NlbnRlcidcbiAgfCAncmlnaHQnXG4gIHwgJ2xlZnQtb3JpZ2luLWNlbnRlcidcbiAgfCAncmlnaHQtb3JpZ2luLWNlbnRlcic7XG5cbi8qKlxuICogQmFzZSBjbGFzcyB3aXRoIGFsbCBvZiB0aGUgYE1hdFRhYkJvZHlgIGZ1bmN0aW9uYWxpdHkuXG4gKiBAZG9jcy1wcml2YXRlXG4gKi9cbkBEaXJlY3RpdmUoKVxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIF9NYXRUYWJCb2R5QmFzZSBpbXBsZW1lbnRzIE9uSW5pdCwgT25EZXN0cm95IHtcbiAgLyoqIEN1cnJlbnQgcG9zaXRpb24gb2YgdGhlIHRhYi1ib2R5IGluIHRoZSB0YWItZ3JvdXAuIFplcm8gbWVhbnMgdGhhdCB0aGUgdGFiIGlzIHZpc2libGUuICovXG4gIHByaXZhdGUgX3Bvc2l0aW9uSW5kZXg6IG51bWJlcjtcblxuICAvKiogU3Vic2NyaXB0aW9uIHRvIHRoZSBkaXJlY3Rpb25hbGl0eSBjaGFuZ2Ugb2JzZXJ2YWJsZS4gKi9cbiAgcHJpdmF0ZSBfZGlyQ2hhbmdlU3Vic2NyaXB0aW9uID0gU3Vic2NyaXB0aW9uLkVNUFRZO1xuXG4gIC8qKiBUYWIgYm9keSBwb3NpdGlvbiBzdGF0ZS4gVXNlZCBieSB0aGUgYW5pbWF0aW9uIHRyaWdnZXIgZm9yIHRoZSBjdXJyZW50IHN0YXRlLiAqL1xuICBfcG9zaXRpb246IE1hdFRhYkJvZHlQb3NpdGlvblN0YXRlO1xuXG4gIC8qKiBFbWl0cyB3aGVuIGFuIGFuaW1hdGlvbiBvbiB0aGUgdGFiIGlzIGNvbXBsZXRlLiAqL1xuICByZWFkb25seSBfdHJhbnNsYXRlVGFiQ29tcGxldGUgPSBuZXcgU3ViamVjdDxBbmltYXRpb25FdmVudD4oKTtcblxuICAvKiogRXZlbnQgZW1pdHRlZCB3aGVuIHRoZSB0YWIgYmVnaW5zIHRvIGFuaW1hdGUgdG93YXJkcyB0aGUgY2VudGVyIGFzIHRoZSBhY3RpdmUgdGFiLiAqL1xuICBAT3V0cHV0KCkgcmVhZG9ubHkgX29uQ2VudGVyaW5nOiBFdmVudEVtaXR0ZXI8bnVtYmVyPiA9IG5ldyBFdmVudEVtaXR0ZXI8bnVtYmVyPigpO1xuXG4gIC8qKiBFdmVudCBlbWl0dGVkIGJlZm9yZSB0aGUgY2VudGVyaW5nIG9mIHRoZSB0YWIgYmVnaW5zLiAqL1xuICBAT3V0cHV0KCkgcmVhZG9ubHkgX2JlZm9yZUNlbnRlcmluZzogRXZlbnRFbWl0dGVyPGJvb2xlYW4+ID0gbmV3IEV2ZW50RW1pdHRlcjxib29sZWFuPigpO1xuXG4gIC8qKiBFdmVudCBlbWl0dGVkIGJlZm9yZSB0aGUgY2VudGVyaW5nIG9mIHRoZSB0YWIgYmVnaW5zLiAqL1xuICBAT3V0cHV0KCkgcmVhZG9ubHkgX2FmdGVyTGVhdmluZ0NlbnRlcjogRXZlbnRFbWl0dGVyPHZvaWQ+ID0gbmV3IEV2ZW50RW1pdHRlcjx2b2lkPigpO1xuXG4gIC8qKiBFdmVudCBlbWl0dGVkIHdoZW4gdGhlIHRhYiBjb21wbGV0ZXMgaXRzIGFuaW1hdGlvbiB0b3dhcmRzIHRoZSBjZW50ZXIuICovXG4gIEBPdXRwdXQoKSByZWFkb25seSBfb25DZW50ZXJlZDogRXZlbnRFbWl0dGVyPHZvaWQ+ID0gbmV3IEV2ZW50RW1pdHRlcjx2b2lkPih0cnVlKTtcblxuICAvKiogVGhlIHBvcnRhbCBob3N0IGluc2lkZSBvZiB0aGlzIGNvbnRhaW5lciBpbnRvIHdoaWNoIHRoZSB0YWIgYm9keSBjb250ZW50IHdpbGwgYmUgbG9hZGVkLiAqL1xuICBhYnN0cmFjdCBfcG9ydGFsSG9zdDogQ2RrUG9ydGFsT3V0bGV0O1xuXG4gIC8qKiBUaGUgdGFiIGJvZHkgY29udGVudCB0byBkaXNwbGF5LiAqL1xuICBASW5wdXQoJ2NvbnRlbnQnKSBfY29udGVudDogVGVtcGxhdGVQb3J0YWw7XG5cbiAgLyoqIFBvc2l0aW9uIHRoYXQgd2lsbCBiZSB1c2VkIHdoZW4gdGhlIHRhYiBpcyBpbW1lZGlhdGVseSBiZWNvbWluZyB2aXNpYmxlIGFmdGVyIGNyZWF0aW9uLiAqL1xuICBASW5wdXQoKSBvcmlnaW46IG51bWJlciB8IG51bGw7XG5cbiAgLy8gTm90ZSB0aGF0IHRoZSBkZWZhdWx0IHZhbHVlIHdpbGwgYWx3YXlzIGJlIG92ZXJ3cml0dGVuIGJ5IGBNYXRUYWJCb2R5YCwgYnV0IHdlIG5lZWQgb25lXG4gIC8vIGFueXdheSB0byBwcmV2ZW50IHRoZSBhbmltYXRpb25zIG1vZHVsZSBmcm9tIHRocm93aW5nIGFuIGVycm9yIGlmIHRoZSBib2R5IGlzIHVzZWQgb24gaXRzIG93bi5cbiAgLyoqIER1cmF0aW9uIGZvciB0aGUgdGFiJ3MgYW5pbWF0aW9uLiAqL1xuICBASW5wdXQoKSBhbmltYXRpb25EdXJhdGlvbjogc3RyaW5nID0gJzUwMG1zJztcblxuICAvKiogV2hldGhlciB0aGUgdGFiJ3MgY29udGVudCBzaG91bGQgYmUga2VwdCBpbiB0aGUgRE9NIHdoaWxlIGl0J3Mgb2ZmLXNjcmVlbi4gKi9cbiAgQElucHV0KCkgcHJlc2VydmVDb250ZW50OiBib29sZWFuID0gZmFsc2U7XG5cbiAgLyoqIFRoZSBzaGlmdGVkIGluZGV4IHBvc2l0aW9uIG9mIHRoZSB0YWIgYm9keSwgd2hlcmUgemVybyByZXByZXNlbnRzIHRoZSBhY3RpdmUgY2VudGVyIHRhYi4gKi9cbiAgQElucHV0KClcbiAgc2V0IHBvc2l0aW9uKHBvc2l0aW9uOiBudW1iZXIpIHtcbiAgICB0aGlzLl9wb3NpdGlvbkluZGV4ID0gcG9zaXRpb247XG4gICAgdGhpcy5fY29tcHV0ZVBvc2l0aW9uQW5pbWF0aW9uU3RhdGUoKTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+LFxuICAgIEBPcHRpb25hbCgpIHByaXZhdGUgX2RpcjogRGlyZWN0aW9uYWxpdHksXG4gICAgY2hhbmdlRGV0ZWN0b3JSZWY6IENoYW5nZURldGVjdG9yUmVmLFxuICApIHtcbiAgICBpZiAoX2Rpcikge1xuICAgICAgdGhpcy5fZGlyQ2hhbmdlU3Vic2NyaXB0aW9uID0gX2Rpci5jaGFuZ2Uuc3Vic2NyaWJlKChkaXI6IERpcmVjdGlvbikgPT4ge1xuICAgICAgICB0aGlzLl9jb21wdXRlUG9zaXRpb25BbmltYXRpb25TdGF0ZShkaXIpO1xuICAgICAgICBjaGFuZ2VEZXRlY3RvclJlZi5tYXJrRm9yQ2hlY2soKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIEVuc3VyZSB0aGF0IHdlIGdldCB1bmlxdWUgYW5pbWF0aW9uIGV2ZW50cywgYmVjYXVzZSB0aGUgYC5kb25lYCBjYWxsYmFjayBjYW4gZ2V0XG4gICAgLy8gaW52b2tlZCB0d2ljZSBpbiBzb21lIGJyb3dzZXJzLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci9pc3N1ZXMvMjQwODQuXG4gICAgdGhpcy5fdHJhbnNsYXRlVGFiQ29tcGxldGVcbiAgICAgIC5waXBlKFxuICAgICAgICBkaXN0aW5jdFVudGlsQ2hhbmdlZCgoeCwgeSkgPT4ge1xuICAgICAgICAgIHJldHVybiB4LmZyb21TdGF0ZSA9PT0geS5mcm9tU3RhdGUgJiYgeC50b1N0YXRlID09PSB5LnRvU3RhdGU7XG4gICAgICAgIH0pLFxuICAgICAgKVxuICAgICAgLnN1YnNjcmliZShldmVudCA9PiB7XG4gICAgICAgIC8vIElmIHRoZSB0cmFuc2l0aW9uIHRvIHRoZSBjZW50ZXIgaXMgY29tcGxldGUsIGVtaXQgYW4gZXZlbnQuXG4gICAgICAgIGlmICh0aGlzLl9pc0NlbnRlclBvc2l0aW9uKGV2ZW50LnRvU3RhdGUpICYmIHRoaXMuX2lzQ2VudGVyUG9zaXRpb24odGhpcy5fcG9zaXRpb24pKSB7XG4gICAgICAgICAgdGhpcy5fb25DZW50ZXJlZC5lbWl0KCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5faXNDZW50ZXJQb3NpdGlvbihldmVudC5mcm9tU3RhdGUpICYmICF0aGlzLl9pc0NlbnRlclBvc2l0aW9uKHRoaXMuX3Bvc2l0aW9uKSkge1xuICAgICAgICAgIHRoaXMuX2FmdGVyTGVhdmluZ0NlbnRlci5lbWl0KCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEFmdGVyIGluaXRpYWxpemVkLCBjaGVjayBpZiB0aGUgY29udGVudCBpcyBjZW50ZXJlZCBhbmQgaGFzIGFuIG9yaWdpbi4gSWYgc28sIHNldCB0aGVcbiAgICogc3BlY2lhbCBwb3NpdGlvbiBzdGF0ZXMgdGhhdCB0cmFuc2l0aW9uIHRoZSB0YWIgZnJvbSB0aGUgbGVmdCBvciByaWdodCBiZWZvcmUgY2VudGVyaW5nLlxuICAgKi9cbiAgbmdPbkluaXQoKSB7XG4gICAgaWYgKHRoaXMuX3Bvc2l0aW9uID09ICdjZW50ZXInICYmIHRoaXMub3JpZ2luICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX3Bvc2l0aW9uID0gdGhpcy5fY29tcHV0ZVBvc2l0aW9uRnJvbU9yaWdpbih0aGlzLm9yaWdpbik7XG4gICAgfVxuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5fZGlyQ2hhbmdlU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgdGhpcy5fdHJhbnNsYXRlVGFiQ29tcGxldGUuY29tcGxldGUoKTtcbiAgfVxuXG4gIF9vblRyYW5zbGF0ZVRhYlN0YXJ0ZWQoZXZlbnQ6IEFuaW1hdGlvbkV2ZW50KTogdm9pZCB7XG4gICAgY29uc3QgaXNDZW50ZXJpbmcgPSB0aGlzLl9pc0NlbnRlclBvc2l0aW9uKGV2ZW50LnRvU3RhdGUpO1xuICAgIHRoaXMuX2JlZm9yZUNlbnRlcmluZy5lbWl0KGlzQ2VudGVyaW5nKTtcbiAgICBpZiAoaXNDZW50ZXJpbmcpIHtcbiAgICAgIHRoaXMuX29uQ2VudGVyaW5nLmVtaXQodGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmNsaWVudEhlaWdodCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFRoZSB0ZXh0IGRpcmVjdGlvbiBvZiB0aGUgY29udGFpbmluZyBhcHAuICovXG4gIF9nZXRMYXlvdXREaXJlY3Rpb24oKTogRGlyZWN0aW9uIHtcbiAgICByZXR1cm4gdGhpcy5fZGlyICYmIHRoaXMuX2Rpci52YWx1ZSA9PT0gJ3J0bCcgPyAncnRsJyA6ICdsdHInO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIHByb3ZpZGVkIHBvc2l0aW9uIHN0YXRlIGlzIGNvbnNpZGVyZWQgY2VudGVyLCByZWdhcmRsZXNzIG9mIG9yaWdpbi4gKi9cbiAgX2lzQ2VudGVyUG9zaXRpb24ocG9zaXRpb246IE1hdFRhYkJvZHlQb3NpdGlvblN0YXRlIHwgc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIChcbiAgICAgIHBvc2l0aW9uID09ICdjZW50ZXInIHx8IHBvc2l0aW9uID09ICdsZWZ0LW9yaWdpbi1jZW50ZXInIHx8IHBvc2l0aW9uID09ICdyaWdodC1vcmlnaW4tY2VudGVyJ1xuICAgICk7XG4gIH1cblxuICAvKiogQ29tcHV0ZXMgdGhlIHBvc2l0aW9uIHN0YXRlIHRoYXQgd2lsbCBiZSB1c2VkIGZvciB0aGUgdGFiLWJvZHkgYW5pbWF0aW9uIHRyaWdnZXIuICovXG4gIHByaXZhdGUgX2NvbXB1dGVQb3NpdGlvbkFuaW1hdGlvblN0YXRlKGRpcjogRGlyZWN0aW9uID0gdGhpcy5fZ2V0TGF5b3V0RGlyZWN0aW9uKCkpIHtcbiAgICBpZiAodGhpcy5fcG9zaXRpb25JbmRleCA8IDApIHtcbiAgICAgIHRoaXMuX3Bvc2l0aW9uID0gZGlyID09ICdsdHInID8gJ2xlZnQnIDogJ3JpZ2h0JztcbiAgICB9IGVsc2UgaWYgKHRoaXMuX3Bvc2l0aW9uSW5kZXggPiAwKSB7XG4gICAgICB0aGlzLl9wb3NpdGlvbiA9IGRpciA9PSAnbHRyJyA/ICdyaWdodCcgOiAnbGVmdCc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3Bvc2l0aW9uID0gJ2NlbnRlcic7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENvbXB1dGVzIHRoZSBwb3NpdGlvbiBzdGF0ZSBiYXNlZCBvbiB0aGUgc3BlY2lmaWVkIG9yaWdpbiBwb3NpdGlvbi4gVGhpcyBpcyB1c2VkIGlmIHRoZVxuICAgKiB0YWIgaXMgYmVjb21pbmcgdmlzaWJsZSBpbW1lZGlhdGVseSBhZnRlciBjcmVhdGlvbi5cbiAgICovXG4gIHByaXZhdGUgX2NvbXB1dGVQb3NpdGlvbkZyb21PcmlnaW4ob3JpZ2luOiBudW1iZXIpOiBNYXRUYWJCb2R5UG9zaXRpb25TdGF0ZSB7XG4gICAgY29uc3QgZGlyID0gdGhpcy5fZ2V0TGF5b3V0RGlyZWN0aW9uKCk7XG5cbiAgICBpZiAoKGRpciA9PSAnbHRyJyAmJiBvcmlnaW4gPD0gMCkgfHwgKGRpciA9PSAncnRsJyAmJiBvcmlnaW4gPiAwKSkge1xuICAgICAgcmV0dXJuICdsZWZ0LW9yaWdpbi1jZW50ZXInO1xuICAgIH1cblxuICAgIHJldHVybiAncmlnaHQtb3JpZ2luLWNlbnRlcic7XG4gIH1cbn1cblxuLyoqXG4gKiBXcmFwcGVyIGZvciB0aGUgY29udGVudHMgb2YgYSB0YWIuXG4gKiBAZG9jcy1wcml2YXRlXG4gKi9cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ21hdC10YWItYm9keScsXG4gIHRlbXBsYXRlVXJsOiAndGFiLWJvZHkuaHRtbCcsXG4gIHN0eWxlVXJsczogWyd0YWItYm9keS5jc3MnXSxcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOnZhbGlkYXRlLWRlY29yYXRvcnNcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5EZWZhdWx0LFxuICBhbmltYXRpb25zOiBbbWF0VGFic0FuaW1hdGlvbnMudHJhbnNsYXRlVGFiXSxcbiAgaG9zdDoge1xuICAgICdjbGFzcyc6ICdtYXQtbWRjLXRhYi1ib2R5JyxcbiAgfSxcbn0pXG5leHBvcnQgY2xhc3MgTWF0VGFiQm9keSBleHRlbmRzIF9NYXRUYWJCb2R5QmFzZSB7XG4gIEBWaWV3Q2hpbGQoQ2RrUG9ydGFsT3V0bGV0KSBfcG9ydGFsSG9zdDogQ2RrUG9ydGFsT3V0bGV0O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIGVsZW1lbnRSZWY6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+LFxuICAgIEBPcHRpb25hbCgpIGRpcjogRGlyZWN0aW9uYWxpdHksXG4gICAgY2hhbmdlRGV0ZWN0b3JSZWY6IENoYW5nZURldGVjdG9yUmVmLFxuICApIHtcbiAgICBzdXBlcihlbGVtZW50UmVmLCBkaXIsIGNoYW5nZURldGVjdG9yUmVmKTtcbiAgfVxufVxuXG4vKipcbiAqIFRoZSBvcmlnaW4gc3RhdGUgaXMgYW4gaW50ZXJuYWxseSB1c2VkIHN0YXRlIHRoYXQgaXMgc2V0IG9uIGEgbmV3IHRhYiBib2R5IGluZGljYXRpbmcgaWYgaXRcbiAqIGJlZ2FuIHRvIHRoZSBsZWZ0IG9yIHJpZ2h0IG9mIHRoZSBwcmlvciBzZWxlY3RlZCBpbmRleC4gRm9yIGV4YW1wbGUsIGlmIHRoZSBzZWxlY3RlZCBpbmRleCB3YXNcbiAqIHNldCB0byAxLCBhbmQgYSBuZXcgdGFiIGlzIGNyZWF0ZWQgYW5kIHNlbGVjdGVkIGF0IGluZGV4IDIsIHRoZW4gdGhlIHRhYiBib2R5IHdvdWxkIGhhdmUgYW5cbiAqIG9yaWdpbiBvZiByaWdodCBiZWNhdXNlIGl0cyBpbmRleCB3YXMgZ3JlYXRlciB0aGFuIHRoZSBwcmlvciBzZWxlY3RlZCBpbmRleC5cbiAqL1xuZXhwb3J0IHR5cGUgTWF0VGFiQm9keU9yaWdpblN0YXRlID0gJ2xlZnQnIHwgJ3JpZ2h0JztcbiIsIjxkaXYgY2xhc3M9XCJtYXQtbWRjLXRhYi1ib2R5LWNvbnRlbnRcIiAjY29udGVudFxuICAgICBbQHRyYW5zbGF0ZVRhYl09XCJ7XG4gICAgICAgIHZhbHVlOiBfcG9zaXRpb24sXG4gICAgICAgIHBhcmFtczoge2FuaW1hdGlvbkR1cmF0aW9uOiBhbmltYXRpb25EdXJhdGlvbn1cbiAgICAgfVwiXG4gICAgIChAdHJhbnNsYXRlVGFiLnN0YXJ0KT1cIl9vblRyYW5zbGF0ZVRhYlN0YXJ0ZWQoJGV2ZW50KVwiXG4gICAgIChAdHJhbnNsYXRlVGFiLmRvbmUpPVwiX3RyYW5zbGF0ZVRhYkNvbXBsZXRlLm5leHQoJGV2ZW50KVwiXG4gICAgIGNka1Njcm9sbGFibGU+XG4gIDxuZy10ZW1wbGF0ZSBtYXRUYWJCb2R5SG9zdD48L25nLXRlbXBsYXRlPlxuPC9kaXY+XG4iXX0=