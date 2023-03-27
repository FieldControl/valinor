/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ComponentFactoryResolver, Directive, EventEmitter, NgModule, Output, TemplateRef, ViewContainerRef, Inject, } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { BasePortalOutlet, TemplatePortal } from './portal';
import * as i0 from "@angular/core";
/**
 * Directive version of a `TemplatePortal`. Because the directive *is* a TemplatePortal,
 * the directive instance itself can be attached to a host, enabling declarative use of portals.
 */
export class CdkPortal extends TemplatePortal {
    constructor(templateRef, viewContainerRef) {
        super(templateRef, viewContainerRef);
    }
}
CdkPortal.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: CdkPortal, deps: [{ token: i0.TemplateRef }, { token: i0.ViewContainerRef }], target: i0.ɵɵFactoryTarget.Directive });
CdkPortal.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "15.2.0-rc.0", type: CdkPortal, selector: "[cdkPortal]", exportAs: ["cdkPortal"], usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: CdkPortal, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkPortal]',
                    exportAs: 'cdkPortal',
                }]
        }], ctorParameters: function () { return [{ type: i0.TemplateRef }, { type: i0.ViewContainerRef }]; } });
/**
 * @deprecated Use `CdkPortal` instead.
 * @breaking-change 9.0.0
 */
export class TemplatePortalDirective extends CdkPortal {
}
TemplatePortalDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: TemplatePortalDirective, deps: null, target: i0.ɵɵFactoryTarget.Directive });
TemplatePortalDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "15.2.0-rc.0", type: TemplatePortalDirective, selector: "[cdk-portal], [portal]", providers: [
        {
            provide: CdkPortal,
            useExisting: TemplatePortalDirective,
        },
    ], exportAs: ["cdkPortal"], usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: TemplatePortalDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdk-portal], [portal]',
                    exportAs: 'cdkPortal',
                    providers: [
                        {
                            provide: CdkPortal,
                            useExisting: TemplatePortalDirective,
                        },
                    ],
                }]
        }] });
/**
 * Directive version of a PortalOutlet. Because the directive *is* a PortalOutlet, portals can be
 * directly attached to it, enabling declarative use.
 *
 * Usage:
 * `<ng-template [cdkPortalOutlet]="greeting"></ng-template>`
 */
export class CdkPortalOutlet extends BasePortalOutlet {
    constructor(_componentFactoryResolver, _viewContainerRef, 
    /**
     * @deprecated `_document` parameter to be made required.
     * @breaking-change 9.0.0
     */
    _document) {
        super();
        this._componentFactoryResolver = _componentFactoryResolver;
        this._viewContainerRef = _viewContainerRef;
        /** Whether the portal component is initialized. */
        this._isInitialized = false;
        /** Emits when a portal is attached to the outlet. */
        this.attached = new EventEmitter();
        /**
         * Attaches the given DomPortal to this PortalHost by moving all of the portal content into it.
         * @param portal Portal to be attached.
         * @deprecated To be turned into a method.
         * @breaking-change 10.0.0
         */
        this.attachDomPortal = (portal) => {
            // @breaking-change 9.0.0 Remove check and error once the
            // `_document` constructor parameter is required.
            if (!this._document && (typeof ngDevMode === 'undefined' || ngDevMode)) {
                throw Error('Cannot attach DOM portal without _document constructor parameter');
            }
            const element = portal.element;
            if (!element.parentNode && (typeof ngDevMode === 'undefined' || ngDevMode)) {
                throw Error('DOM portal content must be attached to a parent node.');
            }
            // Anchor used to save the element's previous position so
            // that we can restore it when the portal is detached.
            const anchorNode = this._document.createComment('dom-portal');
            portal.setAttachedHost(this);
            element.parentNode.insertBefore(anchorNode, element);
            this._getRootNode().appendChild(element);
            this._attachedPortal = portal;
            super.setDisposeFn(() => {
                if (anchorNode.parentNode) {
                    anchorNode.parentNode.replaceChild(element, anchorNode);
                }
            });
        };
        this._document = _document;
    }
    /** Portal associated with the Portal outlet. */
    get portal() {
        return this._attachedPortal;
    }
    set portal(portal) {
        // Ignore the cases where the `portal` is set to a falsy value before the lifecycle hooks have
        // run. This handles the cases where the user might do something like `<div cdkPortalOutlet>`
        // and attach a portal programmatically in the parent component. When Angular does the first CD
        // round, it will fire the setter with empty string, causing the user's content to be cleared.
        if (this.hasAttached() && !portal && !this._isInitialized) {
            return;
        }
        if (this.hasAttached()) {
            super.detach();
        }
        if (portal) {
            super.attach(portal);
        }
        this._attachedPortal = portal || null;
    }
    /** Component or view reference that is attached to the portal. */
    get attachedRef() {
        return this._attachedRef;
    }
    ngOnInit() {
        this._isInitialized = true;
    }
    ngOnDestroy() {
        super.dispose();
        this._attachedRef = this._attachedPortal = null;
    }
    /**
     * Attach the given ComponentPortal to this PortalOutlet using the ComponentFactoryResolver.
     *
     * @param portal Portal to be attached to the portal outlet.
     * @returns Reference to the created component.
     */
    attachComponentPortal(portal) {
        portal.setAttachedHost(this);
        // If the portal specifies an origin, use that as the logical location of the component
        // in the application tree. Otherwise use the location of this PortalOutlet.
        const viewContainerRef = portal.viewContainerRef != null ? portal.viewContainerRef : this._viewContainerRef;
        const resolver = portal.componentFactoryResolver || this._componentFactoryResolver;
        const componentFactory = resolver.resolveComponentFactory(portal.component);
        const ref = viewContainerRef.createComponent(componentFactory, viewContainerRef.length, portal.injector || viewContainerRef.injector, portal.projectableNodes || undefined);
        // If we're using a view container that's different from the injected one (e.g. when the portal
        // specifies its own) we need to move the component into the outlet, otherwise it'll be rendered
        // inside of the alternate view container.
        if (viewContainerRef !== this._viewContainerRef) {
            this._getRootNode().appendChild(ref.hostView.rootNodes[0]);
        }
        super.setDisposeFn(() => ref.destroy());
        this._attachedPortal = portal;
        this._attachedRef = ref;
        this.attached.emit(ref);
        return ref;
    }
    /**
     * Attach the given TemplatePortal to this PortalHost as an embedded View.
     * @param portal Portal to be attached.
     * @returns Reference to the created embedded view.
     */
    attachTemplatePortal(portal) {
        portal.setAttachedHost(this);
        const viewRef = this._viewContainerRef.createEmbeddedView(portal.templateRef, portal.context, {
            injector: portal.injector,
        });
        super.setDisposeFn(() => this._viewContainerRef.clear());
        this._attachedPortal = portal;
        this._attachedRef = viewRef;
        this.attached.emit(viewRef);
        return viewRef;
    }
    /** Gets the root node of the portal outlet. */
    _getRootNode() {
        const nativeElement = this._viewContainerRef.element.nativeElement;
        // The directive could be set on a template which will result in a comment
        // node being the root. Use the comment's parent node if that is the case.
        return (nativeElement.nodeType === nativeElement.ELEMENT_NODE
            ? nativeElement
            : nativeElement.parentNode);
    }
}
CdkPortalOutlet.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: CdkPortalOutlet, deps: [{ token: i0.ComponentFactoryResolver }, { token: i0.ViewContainerRef }, { token: DOCUMENT }], target: i0.ɵɵFactoryTarget.Directive });
CdkPortalOutlet.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "15.2.0-rc.0", type: CdkPortalOutlet, selector: "[cdkPortalOutlet]", inputs: { portal: ["cdkPortalOutlet", "portal"] }, outputs: { attached: "attached" }, exportAs: ["cdkPortalOutlet"], usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: CdkPortalOutlet, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkPortalOutlet]',
                    exportAs: 'cdkPortalOutlet',
                    inputs: ['portal: cdkPortalOutlet'],
                }]
        }], ctorParameters: function () { return [{ type: i0.ComponentFactoryResolver }, { type: i0.ViewContainerRef }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }]; }, propDecorators: { attached: [{
                type: Output
            }] } });
/**
 * @deprecated Use `CdkPortalOutlet` instead.
 * @breaking-change 9.0.0
 */
export class PortalHostDirective extends CdkPortalOutlet {
}
PortalHostDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: PortalHostDirective, deps: null, target: i0.ɵɵFactoryTarget.Directive });
PortalHostDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "15.2.0-rc.0", type: PortalHostDirective, selector: "[cdkPortalHost], [portalHost]", inputs: { portal: ["cdkPortalHost", "portal"] }, providers: [
        {
            provide: CdkPortalOutlet,
            useExisting: PortalHostDirective,
        },
    ], exportAs: ["cdkPortalHost"], usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: PortalHostDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkPortalHost], [portalHost]',
                    exportAs: 'cdkPortalHost',
                    inputs: ['portal: cdkPortalHost'],
                    providers: [
                        {
                            provide: CdkPortalOutlet,
                            useExisting: PortalHostDirective,
                        },
                    ],
                }]
        }] });
export class PortalModule {
}
PortalModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: PortalModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
PortalModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "15.2.0-rc.0", ngImport: i0, type: PortalModule, declarations: [CdkPortal, CdkPortalOutlet, TemplatePortalDirective, PortalHostDirective], exports: [CdkPortal, CdkPortalOutlet, TemplatePortalDirective, PortalHostDirective] });
PortalModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: PortalModule });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: PortalModule, decorators: [{
            type: NgModule,
            args: [{
                    exports: [CdkPortal, CdkPortalOutlet, TemplatePortalDirective, PortalHostDirective],
                    declarations: [CdkPortal, CdkPortalOutlet, TemplatePortalDirective, PortalHostDirective],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9ydGFsLWRpcmVjdGl2ZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL3BvcnRhbC9wb3J0YWwtZGlyZWN0aXZlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQ0wsd0JBQXdCLEVBRXhCLFNBQVMsRUFFVCxZQUFZLEVBQ1osUUFBUSxFQUdSLE1BQU0sRUFDTixXQUFXLEVBQ1gsZ0JBQWdCLEVBQ2hCLE1BQU0sR0FDUCxNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDekMsT0FBTyxFQUFDLGdCQUFnQixFQUEyQixjQUFjLEVBQVksTUFBTSxVQUFVLENBQUM7O0FBRTlGOzs7R0FHRztBQUtILE1BQU0sT0FBTyxTQUFVLFNBQVEsY0FBYztJQUMzQyxZQUFZLFdBQTZCLEVBQUUsZ0JBQWtDO1FBQzNFLEtBQUssQ0FBQyxXQUFXLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztJQUN2QyxDQUFDOzsyR0FIVSxTQUFTOytGQUFULFNBQVM7Z0dBQVQsU0FBUztrQkFKckIsU0FBUzttQkFBQztvQkFDVCxRQUFRLEVBQUUsYUFBYTtvQkFDdkIsUUFBUSxFQUFFLFdBQVc7aUJBQ3RCOztBQU9EOzs7R0FHRztBQVdILE1BQU0sT0FBTyx1QkFBd0IsU0FBUSxTQUFTOzt5SEFBekMsdUJBQXVCOzZHQUF2Qix1QkFBdUIsaURBUHZCO1FBQ1Q7WUFDRSxPQUFPLEVBQUUsU0FBUztZQUNsQixXQUFXLEVBQUUsdUJBQXVCO1NBQ3JDO0tBQ0Y7Z0dBRVUsdUJBQXVCO2tCQVZuQyxTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRSx3QkFBd0I7b0JBQ2xDLFFBQVEsRUFBRSxXQUFXO29CQUNyQixTQUFTLEVBQUU7d0JBQ1Q7NEJBQ0UsT0FBTyxFQUFFLFNBQVM7NEJBQ2xCLFdBQVcseUJBQXlCO3lCQUNyQztxQkFDRjtp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a0JJLE1BQU07MkJBQUMsUUFBUTs0Q0FnQ0MsUUFBUTtzQkFBMUIsTUFBTTs7QUEwSFQ7OztHQUdHO0FBWUgsTUFBTSxPQUFPLG1CQUFvQixTQUFRLGVBQWU7O3FIQUEzQyxtQkFBbUI7eUdBQW5CLG1CQUFtQix5R0FQbkI7UUFDVDtZQUNFLE9BQU8sRUFBRSxlQUFlO1lBQ3hCLFdBQVcsRUFBRSxtQkFBbUI7U0FDakM7S0FDRjtnR0FFVSxtQkFBbUI7a0JBWC9CLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLCtCQUErQjtvQkFDekMsUUFBUSxFQUFFLGVBQWU7b0JBQ3pCLE1BQU0sRUFBRSxDQUFDLHVCQUF1QixDQUFDO29CQUNqQyxTQUFTLEVBQUU7d0JBQ1Q7NEJBQ0UsT0FBTyxFQUFFLGVBQWU7NEJBQ3hCLFdBQVcscUJBQXFCO3lCQUNqQztxQkFDRjtpQkFDRjs7QUFPRCxNQUFNLE9BQU8sWUFBWTs7OEdBQVosWUFBWTsrR0FBWixZQUFZLGlCQXZPWixTQUFTLEVBdUNULGVBQWUsRUFuQmYsdUJBQXVCLEVBNk12QixtQkFBbUIsYUFqT25CLFNBQVMsRUF1Q1QsZUFBZSxFQW5CZix1QkFBdUIsRUE2TXZCLG1CQUFtQjsrR0FNbkIsWUFBWTtnR0FBWixZQUFZO2tCQUp4QixRQUFRO21CQUFDO29CQUNSLE9BQU8sRUFBRSxDQUFDLFNBQVMsRUFBRSxlQUFlLEVBQUUsdUJBQXVCLEVBQUUsbUJBQW1CLENBQUM7b0JBQ25GLFlBQVksRUFBRSxDQUFDLFNBQVMsRUFBRSxlQUFlLEVBQUUsdUJBQXVCLEVBQUUsbUJBQW1CLENBQUM7aUJBQ3pGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIENvbXBvbmVudEZhY3RvcnlSZXNvbHZlcixcbiAgQ29tcG9uZW50UmVmLFxuICBEaXJlY3RpdmUsXG4gIEVtYmVkZGVkVmlld1JlZixcbiAgRXZlbnRFbWl0dGVyLFxuICBOZ01vZHVsZSxcbiAgT25EZXN0cm95LFxuICBPbkluaXQsXG4gIE91dHB1dCxcbiAgVGVtcGxhdGVSZWYsXG4gIFZpZXdDb250YWluZXJSZWYsXG4gIEluamVjdCxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtCYXNlUG9ydGFsT3V0bGV0LCBDb21wb25lbnRQb3J0YWwsIFBvcnRhbCwgVGVtcGxhdGVQb3J0YWwsIERvbVBvcnRhbH0gZnJvbSAnLi9wb3J0YWwnO1xuXG4vKipcbiAqIERpcmVjdGl2ZSB2ZXJzaW9uIG9mIGEgYFRlbXBsYXRlUG9ydGFsYC4gQmVjYXVzZSB0aGUgZGlyZWN0aXZlICppcyogYSBUZW1wbGF0ZVBvcnRhbCxcbiAqIHRoZSBkaXJlY3RpdmUgaW5zdGFuY2UgaXRzZWxmIGNhbiBiZSBhdHRhY2hlZCB0byBhIGhvc3QsIGVuYWJsaW5nIGRlY2xhcmF0aXZlIHVzZSBvZiBwb3J0YWxzLlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbY2RrUG9ydGFsXScsXG4gIGV4cG9ydEFzOiAnY2RrUG9ydGFsJyxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrUG9ydGFsIGV4dGVuZHMgVGVtcGxhdGVQb3J0YWwge1xuICBjb25zdHJ1Y3Rvcih0ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWY8YW55Piwgdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZikge1xuICAgIHN1cGVyKHRlbXBsYXRlUmVmLCB2aWV3Q29udGFpbmVyUmVmKTtcbiAgfVxufVxuXG4vKipcbiAqIEBkZXByZWNhdGVkIFVzZSBgQ2RrUG9ydGFsYCBpbnN0ZWFkLlxuICogQGJyZWFraW5nLWNoYW5nZSA5LjAuMFxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbY2RrLXBvcnRhbF0sIFtwb3J0YWxdJyxcbiAgZXhwb3J0QXM6ICdjZGtQb3J0YWwnLFxuICBwcm92aWRlcnM6IFtcbiAgICB7XG4gICAgICBwcm92aWRlOiBDZGtQb3J0YWwsXG4gICAgICB1c2VFeGlzdGluZzogVGVtcGxhdGVQb3J0YWxEaXJlY3RpdmUsXG4gICAgfSxcbiAgXSxcbn0pXG5leHBvcnQgY2xhc3MgVGVtcGxhdGVQb3J0YWxEaXJlY3RpdmUgZXh0ZW5kcyBDZGtQb3J0YWwge31cblxuLyoqXG4gKiBQb3NzaWJsZSBhdHRhY2hlZCByZWZlcmVuY2VzIHRvIHRoZSBDZGtQb3J0YWxPdXRsZXQuXG4gKi9cbmV4cG9ydCB0eXBlIENka1BvcnRhbE91dGxldEF0dGFjaGVkUmVmID0gQ29tcG9uZW50UmVmPGFueT4gfCBFbWJlZGRlZFZpZXdSZWY8YW55PiB8IG51bGw7XG5cbi8qKlxuICogRGlyZWN0aXZlIHZlcnNpb24gb2YgYSBQb3J0YWxPdXRsZXQuIEJlY2F1c2UgdGhlIGRpcmVjdGl2ZSAqaXMqIGEgUG9ydGFsT3V0bGV0LCBwb3J0YWxzIGNhbiBiZVxuICogZGlyZWN0bHkgYXR0YWNoZWQgdG8gaXQsIGVuYWJsaW5nIGRlY2xhcmF0aXZlIHVzZS5cbiAqXG4gKiBVc2FnZTpcbiAqIGA8bmctdGVtcGxhdGUgW2Nka1BvcnRhbE91dGxldF09XCJncmVldGluZ1wiPjwvbmctdGVtcGxhdGU+YFxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbY2RrUG9ydGFsT3V0bGV0XScsXG4gIGV4cG9ydEFzOiAnY2RrUG9ydGFsT3V0bGV0JyxcbiAgaW5wdXRzOiBbJ3BvcnRhbDogY2RrUG9ydGFsT3V0bGV0J10sXG59KVxuZXhwb3J0IGNsYXNzIENka1BvcnRhbE91dGxldCBleHRlbmRzIEJhc2VQb3J0YWxPdXRsZXQgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XG4gIHByaXZhdGUgX2RvY3VtZW50OiBEb2N1bWVudDtcblxuICAvKiogV2hldGhlciB0aGUgcG9ydGFsIGNvbXBvbmVudCBpcyBpbml0aWFsaXplZC4gKi9cbiAgcHJpdmF0ZSBfaXNJbml0aWFsaXplZCA9IGZhbHNlO1xuXG4gIC8qKiBSZWZlcmVuY2UgdG8gdGhlIGN1cnJlbnRseS1hdHRhY2hlZCBjb21wb25lbnQvdmlldyByZWYuICovXG4gIHByaXZhdGUgX2F0dGFjaGVkUmVmOiBDZGtQb3J0YWxPdXRsZXRBdHRhY2hlZFJlZjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIF9jb21wb25lbnRGYWN0b3J5UmVzb2x2ZXI6IENvbXBvbmVudEZhY3RvcnlSZXNvbHZlcixcbiAgICBwcml2YXRlIF92aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmLFxuXG4gICAgLyoqXG4gICAgICogQGRlcHJlY2F0ZWQgYF9kb2N1bWVudGAgcGFyYW1ldGVyIHRvIGJlIG1hZGUgcmVxdWlyZWQuXG4gICAgICogQGJyZWFraW5nLWNoYW5nZSA5LjAuMFxuICAgICAqL1xuICAgIEBJbmplY3QoRE9DVU1FTlQpIF9kb2N1bWVudD86IGFueSxcbiAgKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLl9kb2N1bWVudCA9IF9kb2N1bWVudDtcbiAgfVxuXG4gIC8qKiBQb3J0YWwgYXNzb2NpYXRlZCB3aXRoIHRoZSBQb3J0YWwgb3V0bGV0LiAqL1xuICBnZXQgcG9ydGFsKCk6IFBvcnRhbDxhbnk+IHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuX2F0dGFjaGVkUG9ydGFsO1xuICB9XG5cbiAgc2V0IHBvcnRhbChwb3J0YWw6IFBvcnRhbDxhbnk+IHwgbnVsbCB8IHVuZGVmaW5lZCB8ICcnKSB7XG4gICAgLy8gSWdub3JlIHRoZSBjYXNlcyB3aGVyZSB0aGUgYHBvcnRhbGAgaXMgc2V0IHRvIGEgZmFsc3kgdmFsdWUgYmVmb3JlIHRoZSBsaWZlY3ljbGUgaG9va3MgaGF2ZVxuICAgIC8vIHJ1bi4gVGhpcyBoYW5kbGVzIHRoZSBjYXNlcyB3aGVyZSB0aGUgdXNlciBtaWdodCBkbyBzb21ldGhpbmcgbGlrZSBgPGRpdiBjZGtQb3J0YWxPdXRsZXQ+YFxuICAgIC8vIGFuZCBhdHRhY2ggYSBwb3J0YWwgcHJvZ3JhbW1hdGljYWxseSBpbiB0aGUgcGFyZW50IGNvbXBvbmVudC4gV2hlbiBBbmd1bGFyIGRvZXMgdGhlIGZpcnN0IENEXG4gICAgLy8gcm91bmQsIGl0IHdpbGwgZmlyZSB0aGUgc2V0dGVyIHdpdGggZW1wdHkgc3RyaW5nLCBjYXVzaW5nIHRoZSB1c2VyJ3MgY29udGVudCB0byBiZSBjbGVhcmVkLlxuICAgIGlmICh0aGlzLmhhc0F0dGFjaGVkKCkgJiYgIXBvcnRhbCAmJiAhdGhpcy5faXNJbml0aWFsaXplZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmhhc0F0dGFjaGVkKCkpIHtcbiAgICAgIHN1cGVyLmRldGFjaCgpO1xuICAgIH1cblxuICAgIGlmIChwb3J0YWwpIHtcbiAgICAgIHN1cGVyLmF0dGFjaChwb3J0YWwpO1xuICAgIH1cblxuICAgIHRoaXMuX2F0dGFjaGVkUG9ydGFsID0gcG9ydGFsIHx8IG51bGw7XG4gIH1cblxuICAvKiogRW1pdHMgd2hlbiBhIHBvcnRhbCBpcyBhdHRhY2hlZCB0byB0aGUgb3V0bGV0LiAqL1xuICBAT3V0cHV0KCkgcmVhZG9ubHkgYXR0YWNoZWQ6IEV2ZW50RW1pdHRlcjxDZGtQb3J0YWxPdXRsZXRBdHRhY2hlZFJlZj4gPVxuICAgIG5ldyBFdmVudEVtaXR0ZXI8Q2RrUG9ydGFsT3V0bGV0QXR0YWNoZWRSZWY+KCk7XG5cbiAgLyoqIENvbXBvbmVudCBvciB2aWV3IHJlZmVyZW5jZSB0aGF0IGlzIGF0dGFjaGVkIHRvIHRoZSBwb3J0YWwuICovXG4gIGdldCBhdHRhY2hlZFJlZigpOiBDZGtQb3J0YWxPdXRsZXRBdHRhY2hlZFJlZiB7XG4gICAgcmV0dXJuIHRoaXMuX2F0dGFjaGVkUmVmO1xuICB9XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgdGhpcy5faXNJbml0aWFsaXplZCA9IHRydWU7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICBzdXBlci5kaXNwb3NlKCk7XG4gICAgdGhpcy5fYXR0YWNoZWRSZWYgPSB0aGlzLl9hdHRhY2hlZFBvcnRhbCA9IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogQXR0YWNoIHRoZSBnaXZlbiBDb21wb25lbnRQb3J0YWwgdG8gdGhpcyBQb3J0YWxPdXRsZXQgdXNpbmcgdGhlIENvbXBvbmVudEZhY3RvcnlSZXNvbHZlci5cbiAgICpcbiAgICogQHBhcmFtIHBvcnRhbCBQb3J0YWwgdG8gYmUgYXR0YWNoZWQgdG8gdGhlIHBvcnRhbCBvdXRsZXQuXG4gICAqIEByZXR1cm5zIFJlZmVyZW5jZSB0byB0aGUgY3JlYXRlZCBjb21wb25lbnQuXG4gICAqL1xuICBhdHRhY2hDb21wb25lbnRQb3J0YWw8VD4ocG9ydGFsOiBDb21wb25lbnRQb3J0YWw8VD4pOiBDb21wb25lbnRSZWY8VD4ge1xuICAgIHBvcnRhbC5zZXRBdHRhY2hlZEhvc3QodGhpcyk7XG5cbiAgICAvLyBJZiB0aGUgcG9ydGFsIHNwZWNpZmllcyBhbiBvcmlnaW4sIHVzZSB0aGF0IGFzIHRoZSBsb2dpY2FsIGxvY2F0aW9uIG9mIHRoZSBjb21wb25lbnRcbiAgICAvLyBpbiB0aGUgYXBwbGljYXRpb24gdHJlZS4gT3RoZXJ3aXNlIHVzZSB0aGUgbG9jYXRpb24gb2YgdGhpcyBQb3J0YWxPdXRsZXQuXG4gICAgY29uc3Qgdmlld0NvbnRhaW5lclJlZiA9XG4gICAgICBwb3J0YWwudmlld0NvbnRhaW5lclJlZiAhPSBudWxsID8gcG9ydGFsLnZpZXdDb250YWluZXJSZWYgOiB0aGlzLl92aWV3Q29udGFpbmVyUmVmO1xuXG4gICAgY29uc3QgcmVzb2x2ZXIgPSBwb3J0YWwuY29tcG9uZW50RmFjdG9yeVJlc29sdmVyIHx8IHRoaXMuX2NvbXBvbmVudEZhY3RvcnlSZXNvbHZlcjtcbiAgICBjb25zdCBjb21wb25lbnRGYWN0b3J5ID0gcmVzb2x2ZXIucmVzb2x2ZUNvbXBvbmVudEZhY3RvcnkocG9ydGFsLmNvbXBvbmVudCk7XG4gICAgY29uc3QgcmVmID0gdmlld0NvbnRhaW5lclJlZi5jcmVhdGVDb21wb25lbnQoXG4gICAgICBjb21wb25lbnRGYWN0b3J5LFxuICAgICAgdmlld0NvbnRhaW5lclJlZi5sZW5ndGgsXG4gICAgICBwb3J0YWwuaW5qZWN0b3IgfHwgdmlld0NvbnRhaW5lclJlZi5pbmplY3RvcixcbiAgICAgIHBvcnRhbC5wcm9qZWN0YWJsZU5vZGVzIHx8IHVuZGVmaW5lZCxcbiAgICApO1xuXG4gICAgLy8gSWYgd2UncmUgdXNpbmcgYSB2aWV3IGNvbnRhaW5lciB0aGF0J3MgZGlmZmVyZW50IGZyb20gdGhlIGluamVjdGVkIG9uZSAoZS5nLiB3aGVuIHRoZSBwb3J0YWxcbiAgICAvLyBzcGVjaWZpZXMgaXRzIG93bikgd2UgbmVlZCB0byBtb3ZlIHRoZSBjb21wb25lbnQgaW50byB0aGUgb3V0bGV0LCBvdGhlcndpc2UgaXQnbGwgYmUgcmVuZGVyZWRcbiAgICAvLyBpbnNpZGUgb2YgdGhlIGFsdGVybmF0ZSB2aWV3IGNvbnRhaW5lci5cbiAgICBpZiAodmlld0NvbnRhaW5lclJlZiAhPT0gdGhpcy5fdmlld0NvbnRhaW5lclJlZikge1xuICAgICAgdGhpcy5fZ2V0Um9vdE5vZGUoKS5hcHBlbmRDaGlsZCgocmVmLmhvc3RWaWV3IGFzIEVtYmVkZGVkVmlld1JlZjxhbnk+KS5yb290Tm9kZXNbMF0pO1xuICAgIH1cblxuICAgIHN1cGVyLnNldERpc3Bvc2VGbigoKSA9PiByZWYuZGVzdHJveSgpKTtcbiAgICB0aGlzLl9hdHRhY2hlZFBvcnRhbCA9IHBvcnRhbDtcbiAgICB0aGlzLl9hdHRhY2hlZFJlZiA9IHJlZjtcbiAgICB0aGlzLmF0dGFjaGVkLmVtaXQocmVmKTtcblxuICAgIHJldHVybiByZWY7XG4gIH1cblxuICAvKipcbiAgICogQXR0YWNoIHRoZSBnaXZlbiBUZW1wbGF0ZVBvcnRhbCB0byB0aGlzIFBvcnRhbEhvc3QgYXMgYW4gZW1iZWRkZWQgVmlldy5cbiAgICogQHBhcmFtIHBvcnRhbCBQb3J0YWwgdG8gYmUgYXR0YWNoZWQuXG4gICAqIEByZXR1cm5zIFJlZmVyZW5jZSB0byB0aGUgY3JlYXRlZCBlbWJlZGRlZCB2aWV3LlxuICAgKi9cbiAgYXR0YWNoVGVtcGxhdGVQb3J0YWw8Qz4ocG9ydGFsOiBUZW1wbGF0ZVBvcnRhbDxDPik6IEVtYmVkZGVkVmlld1JlZjxDPiB7XG4gICAgcG9ydGFsLnNldEF0dGFjaGVkSG9zdCh0aGlzKTtcbiAgICBjb25zdCB2aWV3UmVmID0gdGhpcy5fdmlld0NvbnRhaW5lclJlZi5jcmVhdGVFbWJlZGRlZFZpZXcocG9ydGFsLnRlbXBsYXRlUmVmLCBwb3J0YWwuY29udGV4dCwge1xuICAgICAgaW5qZWN0b3I6IHBvcnRhbC5pbmplY3RvcixcbiAgICB9KTtcbiAgICBzdXBlci5zZXREaXNwb3NlRm4oKCkgPT4gdGhpcy5fdmlld0NvbnRhaW5lclJlZi5jbGVhcigpKTtcblxuICAgIHRoaXMuX2F0dGFjaGVkUG9ydGFsID0gcG9ydGFsO1xuICAgIHRoaXMuX2F0dGFjaGVkUmVmID0gdmlld1JlZjtcbiAgICB0aGlzLmF0dGFjaGVkLmVtaXQodmlld1JlZik7XG5cbiAgICByZXR1cm4gdmlld1JlZjtcbiAgfVxuXG4gIC8qKlxuICAgKiBBdHRhY2hlcyB0aGUgZ2l2ZW4gRG9tUG9ydGFsIHRvIHRoaXMgUG9ydGFsSG9zdCBieSBtb3ZpbmcgYWxsIG9mIHRoZSBwb3J0YWwgY29udGVudCBpbnRvIGl0LlxuICAgKiBAcGFyYW0gcG9ydGFsIFBvcnRhbCB0byBiZSBhdHRhY2hlZC5cbiAgICogQGRlcHJlY2F0ZWQgVG8gYmUgdHVybmVkIGludG8gYSBtZXRob2QuXG4gICAqIEBicmVha2luZy1jaGFuZ2UgMTAuMC4wXG4gICAqL1xuICBvdmVycmlkZSBhdHRhY2hEb21Qb3J0YWwgPSAocG9ydGFsOiBEb21Qb3J0YWwpID0+IHtcbiAgICAvLyBAYnJlYWtpbmctY2hhbmdlIDkuMC4wIFJlbW92ZSBjaGVjayBhbmQgZXJyb3Igb25jZSB0aGVcbiAgICAvLyBgX2RvY3VtZW50YCBjb25zdHJ1Y3RvciBwYXJhbWV0ZXIgaXMgcmVxdWlyZWQuXG4gICAgaWYgKCF0aGlzLl9kb2N1bWVudCAmJiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSkge1xuICAgICAgdGhyb3cgRXJyb3IoJ0Nhbm5vdCBhdHRhY2ggRE9NIHBvcnRhbCB3aXRob3V0IF9kb2N1bWVudCBjb25zdHJ1Y3RvciBwYXJhbWV0ZXInKTtcbiAgICB9XG5cbiAgICBjb25zdCBlbGVtZW50ID0gcG9ydGFsLmVsZW1lbnQ7XG4gICAgaWYgKCFlbGVtZW50LnBhcmVudE5vZGUgJiYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkpIHtcbiAgICAgIHRocm93IEVycm9yKCdET00gcG9ydGFsIGNvbnRlbnQgbXVzdCBiZSBhdHRhY2hlZCB0byBhIHBhcmVudCBub2RlLicpO1xuICAgIH1cblxuICAgIC8vIEFuY2hvciB1c2VkIHRvIHNhdmUgdGhlIGVsZW1lbnQncyBwcmV2aW91cyBwb3NpdGlvbiBzb1xuICAgIC8vIHRoYXQgd2UgY2FuIHJlc3RvcmUgaXQgd2hlbiB0aGUgcG9ydGFsIGlzIGRldGFjaGVkLlxuICAgIGNvbnN0IGFuY2hvck5vZGUgPSB0aGlzLl9kb2N1bWVudC5jcmVhdGVDb21tZW50KCdkb20tcG9ydGFsJyk7XG5cbiAgICBwb3J0YWwuc2V0QXR0YWNoZWRIb3N0KHRoaXMpO1xuICAgIGVsZW1lbnQucGFyZW50Tm9kZSEuaW5zZXJ0QmVmb3JlKGFuY2hvck5vZGUsIGVsZW1lbnQpO1xuICAgIHRoaXMuX2dldFJvb3ROb2RlKCkuYXBwZW5kQ2hpbGQoZWxlbWVudCk7XG4gICAgdGhpcy5fYXR0YWNoZWRQb3J0YWwgPSBwb3J0YWw7XG5cbiAgICBzdXBlci5zZXREaXNwb3NlRm4oKCkgPT4ge1xuICAgICAgaWYgKGFuY2hvck5vZGUucGFyZW50Tm9kZSkge1xuICAgICAgICBhbmNob3JOb2RlLnBhcmVudE5vZGUhLnJlcGxhY2VDaGlsZChlbGVtZW50LCBhbmNob3JOb2RlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcblxuICAvKiogR2V0cyB0aGUgcm9vdCBub2RlIG9mIHRoZSBwb3J0YWwgb3V0bGV0LiAqL1xuICBwcml2YXRlIF9nZXRSb290Tm9kZSgpOiBIVE1MRWxlbWVudCB7XG4gICAgY29uc3QgbmF0aXZlRWxlbWVudDogTm9kZSA9IHRoaXMuX3ZpZXdDb250YWluZXJSZWYuZWxlbWVudC5uYXRpdmVFbGVtZW50O1xuXG4gICAgLy8gVGhlIGRpcmVjdGl2ZSBjb3VsZCBiZSBzZXQgb24gYSB0ZW1wbGF0ZSB3aGljaCB3aWxsIHJlc3VsdCBpbiBhIGNvbW1lbnRcbiAgICAvLyBub2RlIGJlaW5nIHRoZSByb290LiBVc2UgdGhlIGNvbW1lbnQncyBwYXJlbnQgbm9kZSBpZiB0aGF0IGlzIHRoZSBjYXNlLlxuICAgIHJldHVybiAoXG4gICAgICBuYXRpdmVFbGVtZW50Lm5vZGVUeXBlID09PSBuYXRpdmVFbGVtZW50LkVMRU1FTlRfTk9ERVxuICAgICAgICA/IG5hdGl2ZUVsZW1lbnRcbiAgICAgICAgOiBuYXRpdmVFbGVtZW50LnBhcmVudE5vZGUhXG4gICAgKSBhcyBIVE1MRWxlbWVudDtcbiAgfVxufVxuXG4vKipcbiAqIEBkZXByZWNhdGVkIFVzZSBgQ2RrUG9ydGFsT3V0bGV0YCBpbnN0ZWFkLlxuICogQGJyZWFraW5nLWNoYW5nZSA5LjAuMFxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbY2RrUG9ydGFsSG9zdF0sIFtwb3J0YWxIb3N0XScsXG4gIGV4cG9ydEFzOiAnY2RrUG9ydGFsSG9zdCcsXG4gIGlucHV0czogWydwb3J0YWw6IGNka1BvcnRhbEhvc3QnXSxcbiAgcHJvdmlkZXJzOiBbXG4gICAge1xuICAgICAgcHJvdmlkZTogQ2RrUG9ydGFsT3V0bGV0LFxuICAgICAgdXNlRXhpc3Rpbmc6IFBvcnRhbEhvc3REaXJlY3RpdmUsXG4gICAgfSxcbiAgXSxcbn0pXG5leHBvcnQgY2xhc3MgUG9ydGFsSG9zdERpcmVjdGl2ZSBleHRlbmRzIENka1BvcnRhbE91dGxldCB7fVxuXG5ATmdNb2R1bGUoe1xuICBleHBvcnRzOiBbQ2RrUG9ydGFsLCBDZGtQb3J0YWxPdXRsZXQsIFRlbXBsYXRlUG9ydGFsRGlyZWN0aXZlLCBQb3J0YWxIb3N0RGlyZWN0aXZlXSxcbiAgZGVjbGFyYXRpb25zOiBbQ2RrUG9ydGFsLCBDZGtQb3J0YWxPdXRsZXQsIFRlbXBsYXRlUG9ydGFsRGlyZWN0aXZlLCBQb3J0YWxIb3N0RGlyZWN0aXZlXSxcbn0pXG5leHBvcnQgY2xhc3MgUG9ydGFsTW9kdWxlIHt9XG4iXX0=