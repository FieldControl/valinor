import { CdkAccordionItem } from '@angular/cdk/accordion';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { UniqueSelectionDispatcher } from '@angular/cdk/collections';
import { TemplatePortal } from '@angular/cdk/portal';
import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChild, Directive, ElementRef, EventEmitter, Inject, InjectionToken, Input, Optional, Output, SkipSelf, ViewChild, ViewContainerRef, ViewEncapsulation, } from '@angular/core';
import { ANIMATION_MODULE_TYPE } from '@angular/platform-browser/animations';
import { Subject } from 'rxjs';
import { distinctUntilChanged, filter, startWith, take } from 'rxjs/operators';
import { MAT_ACCORDION } from './accordion-base';
import { matExpansionAnimations } from './expansion-animations';
import { MAT_EXPANSION_PANEL } from './expansion-panel-base';
import { MatExpansionPanelContent } from './expansion-panel-content';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/collections";
import * as i2 from "@angular/cdk/portal";
/** Counter for generating unique element ids. */
let uniqueId = 0;
/**
 * Injection token that can be used to configure the default
 * options for the expansion panel component.
 */
export const MAT_EXPANSION_PANEL_DEFAULT_OPTIONS = new InjectionToken('MAT_EXPANSION_PANEL_DEFAULT_OPTIONS');
/**
 * This component can be used as a single element to show expandable content, or as one of
 * multiple children of an element with the MatAccordion directive attached.
 */
export class MatExpansionPanel extends CdkAccordionItem {
    /** Whether the toggle indicator should be hidden. */
    get hideToggle() {
        return this._hideToggle || (this.accordion && this.accordion.hideToggle);
    }
    set hideToggle(value) {
        this._hideToggle = coerceBooleanProperty(value);
    }
    /** The position of the expansion indicator. */
    get togglePosition() {
        return this._togglePosition || (this.accordion && this.accordion.togglePosition);
    }
    set togglePosition(value) {
        this._togglePosition = value;
    }
    constructor(accordion, _changeDetectorRef, _uniqueSelectionDispatcher, _viewContainerRef, _document, _animationMode, defaultOptions) {
        super(accordion, _changeDetectorRef, _uniqueSelectionDispatcher);
        this._viewContainerRef = _viewContainerRef;
        this._animationMode = _animationMode;
        this._hideToggle = false;
        /** An event emitted after the body's expansion animation happens. */
        this.afterExpand = new EventEmitter();
        /** An event emitted after the body's collapse animation happens. */
        this.afterCollapse = new EventEmitter();
        /** Stream that emits for changes in `@Input` properties. */
        this._inputChanges = new Subject();
        /** ID for the associated header element. Used for a11y labelling. */
        this._headerId = `mat-expansion-panel-header-${uniqueId++}`;
        /** Stream of body animation done events. */
        this._bodyAnimationDone = new Subject();
        this.accordion = accordion;
        this._document = _document;
        // We need a Subject with distinctUntilChanged, because the `done` event
        // fires twice on some browsers. See https://github.com/angular/angular/issues/24084
        this._bodyAnimationDone
            .pipe(distinctUntilChanged((x, y) => {
            return x.fromState === y.fromState && x.toState === y.toState;
        }))
            .subscribe(event => {
            if (event.fromState !== 'void') {
                if (event.toState === 'expanded') {
                    this.afterExpand.emit();
                }
                else if (event.toState === 'collapsed') {
                    this.afterCollapse.emit();
                }
            }
        });
        if (defaultOptions) {
            this.hideToggle = defaultOptions.hideToggle;
        }
    }
    /** Determines whether the expansion panel should have spacing between it and its siblings. */
    _hasSpacing() {
        if (this.accordion) {
            return this.expanded && this.accordion.displayMode === 'default';
        }
        return false;
    }
    /** Gets the expanded state string. */
    _getExpandedState() {
        return this.expanded ? 'expanded' : 'collapsed';
    }
    /** Toggles the expanded state of the expansion panel. */
    toggle() {
        this.expanded = !this.expanded;
    }
    /** Sets the expanded state of the expansion panel to false. */
    close() {
        this.expanded = false;
    }
    /** Sets the expanded state of the expansion panel to true. */
    open() {
        this.expanded = true;
    }
    ngAfterContentInit() {
        if (this._lazyContent && this._lazyContent._expansionPanel === this) {
            // Render the content as soon as the panel becomes open.
            this.opened
                .pipe(startWith(null), filter(() => this.expanded && !this._portal), take(1))
                .subscribe(() => {
                this._portal = new TemplatePortal(this._lazyContent._template, this._viewContainerRef);
            });
        }
    }
    ngOnChanges(changes) {
        this._inputChanges.next(changes);
    }
    ngOnDestroy() {
        super.ngOnDestroy();
        this._bodyAnimationDone.complete();
        this._inputChanges.complete();
    }
    /** Checks whether the expansion panel's content contains the currently-focused element. */
    _containsFocus() {
        if (this._body) {
            const focusedElement = this._document.activeElement;
            const bodyElement = this._body.nativeElement;
            return focusedElement === bodyElement || bodyElement.contains(focusedElement);
        }
        return false;
    }
}
MatExpansionPanel.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: MatExpansionPanel, deps: [{ token: MAT_ACCORDION, optional: true, skipSelf: true }, { token: i0.ChangeDetectorRef }, { token: i1.UniqueSelectionDispatcher }, { token: i0.ViewContainerRef }, { token: DOCUMENT }, { token: ANIMATION_MODULE_TYPE, optional: true }, { token: MAT_EXPANSION_PANEL_DEFAULT_OPTIONS, optional: true }], target: i0.ɵɵFactoryTarget.Component });
MatExpansionPanel.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "15.2.0-rc.0", type: MatExpansionPanel, selector: "mat-expansion-panel", inputs: { disabled: "disabled", expanded: "expanded", hideToggle: "hideToggle", togglePosition: "togglePosition" }, outputs: { opened: "opened", closed: "closed", expandedChange: "expandedChange", afterExpand: "afterExpand", afterCollapse: "afterCollapse" }, host: { properties: { "class.mat-expanded": "expanded", "class._mat-animation-noopable": "_animationMode === \"NoopAnimations\"", "class.mat-expansion-panel-spacing": "_hasSpacing()" }, classAttribute: "mat-expansion-panel" }, providers: [
        // Provide MatAccordion as undefined to prevent nested expansion panels from registering
        // to the same accordion.
        { provide: MAT_ACCORDION, useValue: undefined },
        { provide: MAT_EXPANSION_PANEL, useExisting: MatExpansionPanel },
    ], queries: [{ propertyName: "_lazyContent", first: true, predicate: MatExpansionPanelContent, descendants: true }], viewQueries: [{ propertyName: "_body", first: true, predicate: ["body"], descendants: true }], exportAs: ["matExpansionPanel"], usesInheritance: true, usesOnChanges: true, ngImport: i0, template: "<ng-content select=\"mat-expansion-panel-header\"></ng-content>\n<div class=\"mat-expansion-panel-content\"\n     role=\"region\"\n     [@bodyExpansion]=\"_getExpandedState()\"\n     (@bodyExpansion.done)=\"_bodyAnimationDone.next($event)\"\n     [attr.aria-labelledby]=\"_headerId\"\n     [id]=\"id\"\n     #body>\n  <div class=\"mat-expansion-panel-body\">\n    <ng-content></ng-content>\n    <ng-template [cdkPortalOutlet]=\"_portal\"></ng-template>\n  </div>\n  <ng-content select=\"mat-action-row\"></ng-content>\n</div>\n", styles: [".mat-expansion-panel{box-sizing:content-box;display:block;margin:0;border-radius:4px;overflow:hidden;transition:margin 225ms cubic-bezier(0.4, 0, 0.2, 1),box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1);position:relative}.mat-accordion .mat-expansion-panel:not(.mat-expanded),.mat-accordion .mat-expansion-panel:not(.mat-expansion-panel-spacing){border-radius:0}.mat-accordion .mat-expansion-panel:first-of-type{border-top-right-radius:4px;border-top-left-radius:4px}.mat-accordion .mat-expansion-panel:last-of-type{border-bottom-right-radius:4px;border-bottom-left-radius:4px}.cdk-high-contrast-active .mat-expansion-panel{outline:solid 1px}.mat-expansion-panel.ng-animate-disabled,.ng-animate-disabled .mat-expansion-panel,.mat-expansion-panel._mat-animation-noopable{transition:none}.mat-expansion-panel-content{display:flex;flex-direction:column;overflow:visible}.mat-expansion-panel-content[style*=\"visibility: hidden\"] *{visibility:hidden !important}.mat-expansion-panel-body{padding:0 24px 16px}.mat-expansion-panel-spacing{margin:16px 0}.mat-accordion>.mat-expansion-panel-spacing:first-child,.mat-accordion>*:first-child:not(.mat-expansion-panel) .mat-expansion-panel-spacing{margin-top:0}.mat-accordion>.mat-expansion-panel-spacing:last-child,.mat-accordion>*:last-child:not(.mat-expansion-panel) .mat-expansion-panel-spacing{margin-bottom:0}.mat-action-row{border-top-style:solid;border-top-width:1px;display:flex;flex-direction:row;justify-content:flex-end;padding:16px 8px 16px 24px}.mat-action-row .mat-button-base,.mat-action-row .mat-mdc-button-base{margin-left:8px}[dir=rtl] .mat-action-row .mat-button-base,[dir=rtl] .mat-action-row .mat-mdc-button-base{margin-left:0;margin-right:8px}"], dependencies: [{ kind: "directive", type: i2.CdkPortalOutlet, selector: "[cdkPortalOutlet]", inputs: ["cdkPortalOutlet"], outputs: ["attached"], exportAs: ["cdkPortalOutlet"] }], animations: [matExpansionAnimations.bodyExpansion], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: MatExpansionPanel, decorators: [{
            type: Component,
            args: [{ selector: 'mat-expansion-panel', exportAs: 'matExpansionPanel', encapsulation: ViewEncapsulation.None, changeDetection: ChangeDetectionStrategy.OnPush, inputs: ['disabled', 'expanded'], outputs: ['opened', 'closed', 'expandedChange'], animations: [matExpansionAnimations.bodyExpansion], providers: [
                        // Provide MatAccordion as undefined to prevent nested expansion panels from registering
                        // to the same accordion.
                        { provide: MAT_ACCORDION, useValue: undefined },
                        { provide: MAT_EXPANSION_PANEL, useExisting: MatExpansionPanel },
                    ], host: {
                        'class': 'mat-expansion-panel',
                        '[class.mat-expanded]': 'expanded',
                        '[class._mat-animation-noopable]': '_animationMode === "NoopAnimations"',
                        '[class.mat-expansion-panel-spacing]': '_hasSpacing()',
                    }, template: "<ng-content select=\"mat-expansion-panel-header\"></ng-content>\n<div class=\"mat-expansion-panel-content\"\n     role=\"region\"\n     [@bodyExpansion]=\"_getExpandedState()\"\n     (@bodyExpansion.done)=\"_bodyAnimationDone.next($event)\"\n     [attr.aria-labelledby]=\"_headerId\"\n     [id]=\"id\"\n     #body>\n  <div class=\"mat-expansion-panel-body\">\n    <ng-content></ng-content>\n    <ng-template [cdkPortalOutlet]=\"_portal\"></ng-template>\n  </div>\n  <ng-content select=\"mat-action-row\"></ng-content>\n</div>\n", styles: [".mat-expansion-panel{box-sizing:content-box;display:block;margin:0;border-radius:4px;overflow:hidden;transition:margin 225ms cubic-bezier(0.4, 0, 0.2, 1),box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1);position:relative}.mat-accordion .mat-expansion-panel:not(.mat-expanded),.mat-accordion .mat-expansion-panel:not(.mat-expansion-panel-spacing){border-radius:0}.mat-accordion .mat-expansion-panel:first-of-type{border-top-right-radius:4px;border-top-left-radius:4px}.mat-accordion .mat-expansion-panel:last-of-type{border-bottom-right-radius:4px;border-bottom-left-radius:4px}.cdk-high-contrast-active .mat-expansion-panel{outline:solid 1px}.mat-expansion-panel.ng-animate-disabled,.ng-animate-disabled .mat-expansion-panel,.mat-expansion-panel._mat-animation-noopable{transition:none}.mat-expansion-panel-content{display:flex;flex-direction:column;overflow:visible}.mat-expansion-panel-content[style*=\"visibility: hidden\"] *{visibility:hidden !important}.mat-expansion-panel-body{padding:0 24px 16px}.mat-expansion-panel-spacing{margin:16px 0}.mat-accordion>.mat-expansion-panel-spacing:first-child,.mat-accordion>*:first-child:not(.mat-expansion-panel) .mat-expansion-panel-spacing{margin-top:0}.mat-accordion>.mat-expansion-panel-spacing:last-child,.mat-accordion>*:last-child:not(.mat-expansion-panel) .mat-expansion-panel-spacing{margin-bottom:0}.mat-action-row{border-top-style:solid;border-top-width:1px;display:flex;flex-direction:row;justify-content:flex-end;padding:16px 8px 16px 24px}.mat-action-row .mat-button-base,.mat-action-row .mat-mdc-button-base{margin-left:8px}[dir=rtl] .mat-action-row .mat-button-base,[dir=rtl] .mat-action-row .mat-mdc-button-base{margin-left:0;margin-right:8px}"] }]
        }], ctorParameters: function () { return [{ type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: SkipSelf
                }, {
                    type: Inject,
                    args: [MAT_ACCORDION]
                }] }, { type: i0.ChangeDetectorRef }, { type: i1.UniqueSelectionDispatcher }, { type: i0.ViewContainerRef }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [ANIMATION_MODULE_TYPE]
                }] }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [MAT_EXPANSION_PANEL_DEFAULT_OPTIONS]
                }, {
                    type: Optional
                }] }]; }, propDecorators: { hideToggle: [{
                type: Input
            }], togglePosition: [{
                type: Input
            }], afterExpand: [{
                type: Output
            }], afterCollapse: [{
                type: Output
            }], _lazyContent: [{
                type: ContentChild,
                args: [MatExpansionPanelContent]
            }], _body: [{
                type: ViewChild,
                args: ['body']
            }] } });
/**
 * Actions of a `<mat-expansion-panel>`.
 */
export class MatExpansionPanelActionRow {
}
MatExpansionPanelActionRow.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: MatExpansionPanelActionRow, deps: [], target: i0.ɵɵFactoryTarget.Directive });
MatExpansionPanelActionRow.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "15.2.0-rc.0", type: MatExpansionPanelActionRow, selector: "mat-action-row", host: { classAttribute: "mat-action-row" }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: MatExpansionPanelActionRow, decorators: [{
            type: Directive,
            args: [{
                    selector: 'mat-action-row',
                    host: {
                        class: 'mat-action-row',
                    },
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwYW5zaW9uLXBhbmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL2V4cGFuc2lvbi9leHBhbnNpb24tcGFuZWwudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvZXhwYW5zaW9uL2V4cGFuc2lvbi1wYW5lbC5odG1sIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQVNBLE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBQ3hELE9BQU8sRUFBZSxxQkFBcUIsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQzFFLE9BQU8sRUFBQyx5QkFBeUIsRUFBQyxNQUFNLDBCQUEwQixDQUFDO0FBQ25FLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUNuRCxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDekMsT0FBTyxFQUVMLHVCQUF1QixFQUN2QixpQkFBaUIsRUFDakIsU0FBUyxFQUNULFlBQVksRUFDWixTQUFTLEVBQ1QsVUFBVSxFQUNWLFlBQVksRUFDWixNQUFNLEVBQ04sY0FBYyxFQUNkLEtBQUssRUFHTCxRQUFRLEVBQ1IsTUFBTSxFQUVOLFFBQVEsRUFDUixTQUFTLEVBQ1QsZ0JBQWdCLEVBQ2hCLGlCQUFpQixHQUNsQixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSxzQ0FBc0MsQ0FBQztBQUMzRSxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQzdCLE9BQU8sRUFBQyxvQkFBb0IsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQzdFLE9BQU8sRUFBK0MsYUFBYSxFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFDN0YsT0FBTyxFQUFDLHNCQUFzQixFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFDOUQsT0FB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bCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FuaW1hdGlvbkV2ZW50fSBmcm9tICdAYW5ndWxhci9hbmltYXRpb25zJztcbmltcG9ydCB7Q2RrQWNjb3JkaW9uSXRlbX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2FjY29yZGlvbic7XG5pbXBvcnQge0Jvb2xlYW5JbnB1dCwgY29lcmNlQm9vbGVhblByb3BlcnR5fSBmcm9tICdAYW5ndWxhci9jZGsvY29lcmNpb24nO1xuaW1wb3J0IHtVbmlxdWVTZWxlY3Rpb25EaXNwYXRjaGVyfSBmcm9tICdAYW5ndWxhci9jZGsvY29sbGVjdGlvbnMnO1xuaW1wb3J0IHtUZW1wbGF0ZVBvcnRhbH0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BvcnRhbCc7XG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtcbiAgQWZ0ZXJDb250ZW50SW5pdCxcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIENoYW5nZURldGVjdG9yUmVmLFxuICBDb21wb25lbnQsXG4gIENvbnRlbnRDaGlsZCxcbiAgRGlyZWN0aXZlLFxuICBFbGVtZW50UmVmLFxuICBFdmVudEVtaXR0ZXIsXG4gIEluamVjdCxcbiAgSW5qZWN0aW9uVG9rZW4sXG4gIElucHV0LFxuICBPbkNoYW5nZXMsXG4gIE9uRGVzdHJveSxcbiAgT3B0aW9uYWwsXG4gIE91dHB1dCxcbiAgU2ltcGxlQ2hhbmdlcyxcbiAgU2tpcFNlbGYsXG4gIFZpZXdDaGlsZCxcbiAgVmlld0NvbnRhaW5lclJlZixcbiAgVmlld0VuY2Fwc3VsYXRpb24sXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtBTklNQVRJT05fTU9EVUxFX1RZUEV9IGZyb20gJ0Bhbmd1bGFyL3BsYXRmb3JtLWJyb3dzZXIvYW5pbWF0aW9ucyc7XG5pbXBvcnQge1N1YmplY3R9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtkaXN0aW5jdFVudGlsQ2hhbmdlZCwgZmlsdGVyLCBzdGFydFdpdGgsIHRha2V9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7TWF0QWNjb3JkaW9uQmFzZSwgTWF0QWNjb3JkaW9uVG9nZ2xlUG9zaXRpb24sIE1BVF9BQ0NPUkRJT059IGZyb20gJy4vYWNjb3JkaW9uLWJhc2UnO1xuaW1wb3J0IHttYXRFeHBhbnNpb25BbmltYXRpb25zfSBmcm9tICcuL2V4cGFuc2lvbi1hbmltYXRpb25zJztcbmltcG9ydCB7TUFUX0VYUEFOU0lPTl9QQU5FTH0gZnJvbSAnLi9leHBhbnNpb24tcGFuZWwtYmFzZSc7XG5pbXBvcnQge01hdEV4cGFuc2lvblBhbmVsQ29udGVudH0gZnJvbSAnLi9leHBhbnNpb24tcGFuZWwtY29udGVudCc7XG5cbi8qKiBNYXRFeHBhbnNpb25QYW5lbCdzIHN0YXRlcy4gKi9cbmV4cG9ydCB0eXBlIE1hdEV4cGFuc2lvblBhbmVsU3RhdGUgPSAnZXhwYW5kZWQnIHwgJ2NvbGxhcHNlZCc7XG5cbi8qKiBDb3VudGVyIGZvciBnZW5lcmF0aW5nIHVuaXF1ZSBlbGVtZW50IGlkcy4gKi9cbmxldCB1bmlxdWVJZCA9IDA7XG5cbi8qKlxuICogT2JqZWN0IHRoYXQgY2FuIGJlIHVzZWQgdG8gb3ZlcnJpZGUgdGhlIGRlZmF1bHQgb3B0aW9uc1xuICogZm9yIGFsbCBvZiB0aGUgZXhwYW5zaW9uIHBhbmVscyBpbiBhIG1vZHVsZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBNYXRFeHBhbnNpb25QYW5lbERlZmF1bHRPcHRpb25zIHtcbiAgLyoqIEhlaWdodCBvZiB0aGUgaGVhZGVyIHdoaWxlIHRoZSBwYW5lbCBpcyBleHBhbmRlZC4gKi9cbiAgZXhwYW5kZWRIZWlnaHQ6IHN0cmluZztcblxuICAvKiogSGVpZ2h0IG9mIHRoZSBoZWFkZXIgd2hpbGUgdGhlIHBhbmVsIGlzIGNvbGxhcHNlZC4gKi9cbiAgY29sbGFwc2VkSGVpZ2h0OiBzdHJpbmc7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIHRvZ2dsZSBpbmRpY2F0b3Igc2hvdWxkIGJlIGhpZGRlbi4gKi9cbiAgaGlkZVRvZ2dsZTogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBJbmplY3Rpb24gdG9rZW4gdGhhdCBjYW4gYmUgdXNlZCB0byBjb25maWd1cmUgdGhlIGRlZmF1bHRcbiAqIG9wdGlvbnMgZm9yIHRoZSBleHBhbnNpb24gcGFuZWwgY29tcG9uZW50LlxuICovXG5leHBvcnQgY29uc3QgTUFUX0VYUEFOU0lPTl9QQU5FTF9ERUZBVUxUX09QVElPTlMgPVxuICBuZXcgSW5qZWN0aW9uVG9rZW48TWF0RXhwYW5zaW9uUGFuZWxEZWZhdWx0T3B0aW9ucz4oJ01BVF9FWFBBTlNJT05fUEFORUxfREVGQVVMVF9PUFRJT05TJyk7XG5cbi8qKlxuICogVGhpcyBjb21wb25lbnQgY2FuIGJlIHVzZWQgYXMgYSBzaW5nbGUgZWxlbWVudCB0byBzaG93IGV4cGFuZGFibGUgY29udGVudCwgb3IgYXMgb25lIG9mXG4gKiBtdWx0aXBsZSBjaGlsZHJlbiBvZiBhbiBlbGVtZW50IHdpdGggdGhlIE1hdEFjY29yZGlvbiBkaXJlY3RpdmUgYXR0YWNoZWQuXG4gKi9cbkBDb21wb25lbnQoe1xuICBzdHlsZVVybHM6IFsnZXhwYW5zaW9uLXBhbmVsLmNzcyddLFxuICBzZWxlY3RvcjogJ21hdC1leHBhbnNpb24tcGFuZWwnLFxuICBleHBvcnRBczogJ21hdEV4cGFuc2lvblBhbmVsJyxcbiAgdGVtcGxhdGVVcmw6ICdleHBhbnNpb24tcGFuZWwuaHRtbCcsXG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxuICBpbnB1dHM6IFsnZGlzYWJsZWQnLCAnZXhwYW5kZWQnXSxcbiAgb3V0cHV0czogWydvcGVuZWQnLCAnY2xvc2VkJywgJ2V4cGFuZGVkQ2hhbmdlJ10sXG4gIGFuaW1hdGlvbnM6IFttYXRFeHBhbnNpb25BbmltYXRpb25zLmJvZHlFeHBhbnNpb25dLFxuICBwcm92aWRlcnM6IFtcbiAgICAvLyBQcm92aWRlIE1hdEFjY29yZGlvbiBhcyB1bmRlZmluZWQgdG8gcHJldmVudCBuZXN0ZWQgZXhwYW5zaW9uIHBhbmVscyBmcm9tIHJlZ2lzdGVyaW5nXG4gICAgLy8gdG8gdGhlIHNhbWUgYWNjb3JkaW9uLlxuICAgIHtwcm92aWRlOiBNQVRfQUNDT1JESU9OLCB1c2VWYWx1ZTogdW5kZWZpbmVkfSxcbiAgICB7cHJvdmlkZTogTUFUX0VYUEFOU0lPTl9QQU5FTCwgdXNlRXhpc3Rpbmc6IE1hdEV4cGFuc2lvblBhbmVsfSxcbiAgXSxcbiAgaG9zdDoge1xuICAgICdjbGFzcyc6ICdtYXQtZXhwYW5zaW9uLXBhbmVsJyxcbiAgICAnW2NsYXNzLm1hdC1leHBhbmRlZF0nOiAnZXhwYW5kZWQnLFxuICAgICdbY2xhc3MuX21hdC1hbmltYXRpb24tbm9vcGFibGVdJzogJ19hbmltYXRpb25Nb2RlID09PSBcIk5vb3BBbmltYXRpb25zXCInLFxuICAgICdbY2xhc3MubWF0LWV4cGFuc2lvbi1wYW5lbC1zcGFjaW5nXSc6ICdfaGFzU3BhY2luZygpJyxcbiAgfSxcbn0pXG5leHBvcnQgY2xhc3MgTWF0RXhwYW5zaW9uUGFuZWxcbiAgZXh0ZW5kcyBDZGtBY2NvcmRpb25JdGVtXG4gIGltcGxlbWVudHMgQWZ0ZXJDb250ZW50SW5pdCwgT25DaGFuZ2VzLCBPbkRlc3Ryb3lcbntcbiAgcHJpdmF0ZSBfZG9jdW1lbnQ6IERvY3VtZW50O1xuICBwcml2YXRlIF9oaWRlVG9nZ2xlID0gZmFsc2U7XG4gIHByaXZhdGUgX3RvZ2dsZVBvc2l0aW9uOiBNYXRBY2NvcmRpb25Ub2dnbGVQb3NpdGlvbjtcblxuICAvKiogV2hldGhlciB0aGUgdG9nZ2xlIGluZGljYXRvciBzaG91bGQgYmUgaGlkZGVuLiAqL1xuICBASW5wdXQoKVxuICBnZXQgaGlkZVRvZ2dsZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5faGlkZVRvZ2dsZSB8fCAodGhpcy5hY2NvcmRpb24gJiYgdGhpcy5hY2NvcmRpb24uaGlkZVRvZ2dsZSk7XG4gIH1cbiAgc2V0IGhpZGVUb2dnbGUodmFsdWU6IEJvb2xlYW5JbnB1dCkge1xuICAgIHRoaXMuX2hpZGVUb2dnbGUgPSBjb2VyY2VCb29sZWFuUHJvcGVydHkodmFsdWUpO1xuICB9XG5cbiAgLyoqIFRoZSBwb3NpdGlvbiBvZiB0aGUgZXhwYW5zaW9uIGluZGljYXRvci4gKi9cbiAgQElucHV0KClcbiAgZ2V0IHRvZ2dsZVBvc2l0aW9uKCk6IE1hdEFjY29yZGlvblRvZ2dsZVBvc2l0aW9uIHtcbiAgICByZXR1cm4gdGhpcy5fdG9nZ2xlUG9zaXRpb24gfHwgKHRoaXMuYWNjb3JkaW9uICYmIHRoaXMuYWNjb3JkaW9uLnRvZ2dsZVBvc2l0aW9uKTtcbiAgfVxuICBzZXQgdG9nZ2xlUG9zaXRpb24odmFsdWU6IE1hdEFjY29yZGlvblRvZ2dsZVBvc2l0aW9uKSB7XG4gICAgdGhpcy5fdG9nZ2xlUG9zaXRpb24gPSB2YWx1ZTtcbiAgfVxuXG4gIC8qKiBBbiBldmVudCBlbWl0dGVkIGFmdGVyIHRoZSBib2R5J3MgZXhwYW5zaW9uIGFuaW1hdGlvbiBoYXBwZW5zLiAqL1xuICBAT3V0cHV0KCkgcmVhZG9ubHkgYWZ0ZXJFeHBhbmQgPSBuZXcgRXZlbnRFbWl0dGVyPHZvaWQ+KCk7XG5cbiAgLyoqIEFuIGV2ZW50IGVtaXR0ZWQgYWZ0ZXIgdGhlIGJvZHkncyBjb2xsYXBzZSBhbmltYXRpb24gaGFwcGVucy4gKi9cbiAgQE91dHB1dCgpIHJlYWRvbmx5IGFmdGVyQ29sbGFwc2UgPSBuZXcgRXZlbnRFbWl0dGVyPHZvaWQ+KCk7XG5cbiAgLyoqIFN0cmVhbSB0aGF0IGVtaXRzIGZvciBjaGFuZ2VzIGluIGBASW5wdXRgIHByb3BlcnRpZXMuICovXG4gIHJlYWRvbmx5IF9pbnB1dENoYW5nZXMgPSBuZXcgU3ViamVjdDxTaW1wbGVDaGFuZ2VzPigpO1xuXG4gIC8qKiBPcHRpb25hbGx5IGRlZmluZWQgYWNjb3JkaW9uIHRoZSBleHBhbnNpb24gcGFuZWwgYmVsb25ncyB0by4gKi9cbiAgb3ZlcnJpZGUgYWNjb3JkaW9uOiBNYXRBY2NvcmRpb25CYXNlO1xuXG4gIC8qKiBDb250ZW50IHRoYXQgd2lsbCBiZSByZW5kZXJlZCBsYXppbHkuICovXG4gIEBDb250ZW50Q2hpbGQoTWF0RXhwYW5zaW9uUGFuZWxDb250ZW50KSBfbGF6eUNvbnRlbnQ6IE1hdEV4cGFuc2lvblBhbmVsQ29udGVudDtcblxuICAvKiogRWxlbWVudCBjb250YWluaW5nIHRoZSBwYW5lbCdzIHVzZXItcHJvdmlkZWQgY29udGVudC4gKi9cbiAgQFZpZXdDaGlsZCgnYm9keScpIF9ib2R5OiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PjtcblxuICAvKiogUG9ydGFsIGhvbGRpbmcgdGhlIHVzZXIncyBjb250ZW50LiAqL1xuICBfcG9ydGFsOiBUZW1wbGF0ZVBvcnRhbDtcblxuICAvKiogSUQgZm9yIHRoZSBhc3NvY2lhdGVkIGhlYWRlciBlbGVtZW50LiBVc2VkIGZvciBhMTF5IGxhYmVsbGluZy4gKi9cbiAgX2hlYWRlcklkID0gYG1hdC1leHBhbnNpb24tcGFuZWwtaGVhZGVyLSR7dW5pcXVlSWQrK31gO1xuXG4gIC8qKiBTdHJlYW0gb2YgYm9keSBhbmltYXRpb24gZG9uZSBldmVudHMuICovXG4gIHJlYWRvbmx5IF9ib2R5QW5pbWF0aW9uRG9uZSA9IG5ldyBTdWJqZWN0PEFuaW1hdGlvbkV2ZW50PigpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIEBPcHRpb25hbCgpIEBTa2lwU2VsZigpIEBJbmplY3QoTUFUX0FDQ09SRElPTikgYWNjb3JkaW9uOiBNYXRBY2NvcmRpb25CYXNlLFxuICAgIF9jaGFuZ2VEZXRlY3RvclJlZjogQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gICAgX3VuaXF1ZVNlbGVjdGlvbkRpc3BhdGNoZXI6IFVuaXF1ZVNlbGVjdGlvbkRpc3BhdGNoZXIsXG4gICAgcHJpdmF0ZSBfdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZixcbiAgICBASW5qZWN0KERPQ1VNRU5UKSBfZG9jdW1lbnQ6IGFueSxcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KEFOSU1BVElPTl9NT0RVTEVfVFlQRSkgcHVibGljIF9hbmltYXRpb25Nb2RlOiBzdHJpbmcsXG4gICAgQEluamVjdChNQVRfRVhQQU5TSU9OX1BBTkVMX0RFRkFVTFRfT1BUSU9OUylcbiAgICBAT3B0aW9uYWwoKVxuICAgIGRlZmF1bHRPcHRpb25zPzogTWF0RXhwYW5zaW9uUGFuZWxEZWZhdWx0T3B0aW9ucyxcbiAgKSB7XG4gICAgc3VwZXIoYWNjb3JkaW9uLCBfY2hhbmdlRGV0ZWN0b3JSZWYsIF91bmlxdWVTZWxlY3Rpb25EaXNwYXRjaGVyKTtcbiAgICB0aGlzLmFjY29yZGlvbiA9IGFjY29yZGlvbjtcbiAgICB0aGlzLl9kb2N1bWVudCA9IF9kb2N1bWVudDtcblxuICAgIC8vIFdlIG5lZWQgYSBTdWJqZWN0IHdpdGggZGlzdGluY3RVbnRpbENoYW5nZWQsIGJlY2F1c2UgdGhlIGBkb25lYCBldmVudFxuICAgIC8vIGZpcmVzIHR3aWNlIG9uIHNvbWUgYnJvd3NlcnMuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyL2lzc3Vlcy8yNDA4NFxuICAgIHRoaXMuX2JvZHlBbmltYXRpb25Eb25lXG4gICAgICAucGlwZShcbiAgICAgICAgZGlzdGluY3RVbnRpbENoYW5nZWQoKHgsIHkpID0+IHtcbiAgICAgICAgICByZXR1cm4geC5mcm9tU3RhdGUgPT09IHkuZnJvbVN0YXRlICYmIHgudG9TdGF0ZSA9PT0geS50b1N0YXRlO1xuICAgICAgICB9KSxcbiAgICAgIClcbiAgICAgIC5zdWJzY3JpYmUoZXZlbnQgPT4ge1xuICAgICAgICBpZiAoZXZlbnQuZnJvbVN0YXRlICE9PSAndm9pZCcpIHtcbiAgICAgICAgICBpZiAoZXZlbnQudG9TdGF0ZSA9PT0gJ2V4cGFuZGVkJykge1xuICAgICAgICAgICAgdGhpcy5hZnRlckV4cGFuZC5lbWl0KCk7XG4gICAgICAgICAgfSBlbHNlIGlmIChldmVudC50b1N0YXRlID09PSAnY29sbGFwc2VkJykge1xuICAgICAgICAgICAgdGhpcy5hZnRlckNvbGxhcHNlLmVtaXQoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgaWYgKGRlZmF1bHRPcHRpb25zKSB7XG4gICAgICB0aGlzLmhpZGVUb2dnbGUgPSBkZWZhdWx0T3B0aW9ucy5oaWRlVG9nZ2xlO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIGV4cGFuc2lvbiBwYW5lbCBzaG91bGQgaGF2ZSBzcGFjaW5nIGJldHdlZW4gaXQgYW5kIGl0cyBzaWJsaW5ncy4gKi9cbiAgX2hhc1NwYWNpbmcoKTogYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMuYWNjb3JkaW9uKSB7XG4gICAgICByZXR1cm4gdGhpcy5leHBhbmRlZCAmJiB0aGlzLmFjY29yZGlvbi5kaXNwbGF5TW9kZSA9PT0gJ2RlZmF1bHQnO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgZXhwYW5kZWQgc3RhdGUgc3RyaW5nLiAqL1xuICBfZ2V0RXhwYW5kZWRTdGF0ZSgpOiBNYXRFeHBhbnNpb25QYW5lbFN0YXRlIHtcbiAgICByZXR1cm4gdGhpcy5leHBhbmRlZCA/ICdleHBhbmRlZCcgOiAnY29sbGFwc2VkJztcbiAgfVxuXG4gIC8qKiBUb2dnbGVzIHRoZSBleHBhbmRlZCBzdGF0ZSBvZiB0aGUgZXhwYW5zaW9uIHBhbmVsLiAqL1xuICBvdmVycmlkZSB0b2dnbGUoKTogdm9pZCB7XG4gICAgdGhpcy5leHBhbmRlZCA9ICF0aGlzLmV4cGFuZGVkO1xuICB9XG5cbiAgLyoqIFNldHMgdGhlIGV4cGFuZGVkIHN0YXRlIG9mIHRoZSBleHBhbnNpb24gcGFuZWwgdG8gZmFsc2UuICovXG4gIG92ZXJyaWRlIGNsb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuZXhwYW5kZWQgPSBmYWxzZTtcbiAgfVxuXG4gIC8qKiBTZXRzIHRoZSBleHBhbmRlZCBzdGF0ZSBvZiB0aGUgZXhwYW5zaW9uIHBhbmVsIHRvIHRydWUuICovXG4gIG92ZXJyaWRlIG9wZW4oKTogdm9pZCB7XG4gICAgdGhpcy5leHBhbmRlZCA9IHRydWU7XG4gIH1cblxuICBuZ0FmdGVyQ29udGVudEluaXQoKSB7XG4gICAgaWYgKHRoaXMuX2xhenlDb250ZW50ICYmIHRoaXMuX2xhenlDb250ZW50Ll9leHBhbnNpb25QYW5lbCA9PT0gdGhpcykge1xuICAgICAgLy8gUmVuZGVyIHRoZSBjb250ZW50IGFzIHNvb24gYXMgdGhlIHBhbmVsIGJlY29tZXMgb3Blbi5cbiAgICAgIHRoaXMub3BlbmVkXG4gICAgICAgIC5waXBlKFxuICAgICAgICAgIHN0YXJ0V2l0aChudWxsKSxcbiAgICAgICAgICBmaWx0ZXIoKCkgPT4gdGhpcy5leHBhbmRlZCAmJiAhdGhpcy5fcG9ydGFsKSxcbiAgICAgICAgICB0YWtlKDEpLFxuICAgICAgICApXG4gICAgICAgIC5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICAgIHRoaXMuX3BvcnRhbCA9IG5ldyBUZW1wbGF0ZVBvcnRhbCh0aGlzLl9sYXp5Q29udGVudC5fdGVtcGxhdGUsIHRoaXMuX3ZpZXdDb250YWluZXJSZWYpO1xuICAgICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKSB7XG4gICAgdGhpcy5faW5wdXRDaGFuZ2VzLm5leHQoY2hhbmdlcyk7XG4gIH1cblxuICBvdmVycmlkZSBuZ09uRGVzdHJveSgpIHtcbiAgICBzdXBlci5uZ09uRGVzdHJveSgpO1xuICAgIHRoaXMuX2JvZHlBbmltYXRpb25Eb25lLmNvbXBsZXRlKCk7XG4gICAgdGhpcy5faW5wdXRDaGFuZ2VzLmNvbXBsZXRlKCk7XG4gIH1cblxuICAvKiogQ2hlY2tzIHdoZXRoZXIgdGhlIGV4cGFuc2lvbiBwYW5lbCdzIGNvbnRlbnQgY29udGFpbnMgdGhlIGN1cnJlbnRseS1mb2N1c2VkIGVsZW1lbnQuICovXG4gIF9jb250YWluc0ZvY3VzKCk6IGJvb2xlYW4ge1xuICAgIGlmICh0aGlzLl9ib2R5KSB7XG4gICAgICBjb25zdCBmb2N1c2VkRWxlbWVudCA9IHRoaXMuX2RvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7XG4gICAgICBjb25zdCBib2R5RWxlbWVudCA9IHRoaXMuX2JvZHkubmF0aXZlRWxlbWVudDtcbiAgICAgIHJldHVybiBmb2N1c2VkRWxlbWVudCA9PT0gYm9keUVsZW1lbnQgfHwgYm9keUVsZW1lbnQuY29udGFpbnMoZm9jdXNlZEVsZW1lbnQpO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG4vKipcbiAqIEFjdGlvbnMgb2YgYSBgPG1hdC1leHBhbnNpb24tcGFuZWw+YC5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnbWF0LWFjdGlvbi1yb3cnLFxuICBob3N0OiB7XG4gICAgY2xhc3M6ICdtYXQtYWN0aW9uLXJvdycsXG4gIH0sXG59KVxuZXhwb3J0IGNsYXNzIE1hdEV4cGFuc2lvblBhbmVsQWN0aW9uUm93IHt9XG4iLCI8bmctY29udGVudCBzZWxlY3Q9XCJtYXQtZXhwYW5zaW9uLXBhbmVsLWhlYWRlclwiPjwvbmctY29udGVudD5cbjxkaXYgY2xhc3M9XCJtYXQtZXhwYW5zaW9uLXBhbmVsLWNvbnRlbnRcIlxuICAgICByb2xlPVwicmVnaW9uXCJcbiAgICAgW0Bib2R5RXhwYW5zaW9uXT1cIl9nZXRFeHBhbmRlZFN0YXRlKClcIlxuICAgICAoQGJvZHlFeHBhbnNpb24uZG9uZSk9XCJfYm9keUFuaW1hdGlvbkRvbmUubmV4dCgkZXZlbnQpXCJcbiAgICAgW2F0dHIuYXJpYS1sYWJlbGxlZGJ5XT1cIl9oZWFkZXJJZFwiXG4gICAgIFtpZF09XCJpZFwiXG4gICAgICNib2R5PlxuICA8ZGl2IGNsYXNzPVwibWF0LWV4cGFuc2lvbi1wYW5lbC1ib2R5XCI+XG4gICAgPG5nLWNvbnRlbnQ+PC9uZy1jb250ZW50PlxuICAgIDxuZy10ZW1wbGF0ZSBbY2RrUG9ydGFsT3V0bGV0XT1cIl9wb3J0YWxcIj48L25nLXRlbXBsYXRlPlxuICA8L2Rpdj5cbiAgPG5nLWNvbnRlbnQgc2VsZWN0PVwibWF0LWFjdGlvbi1yb3dcIj48L25nLWNvbnRlbnQ+XG48L2Rpdj5cbiJdfQ==