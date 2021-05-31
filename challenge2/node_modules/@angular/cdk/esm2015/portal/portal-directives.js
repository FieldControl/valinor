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
/**
 * Directive version of a `TemplatePortal`. Because the directive *is* a TemplatePortal,
 * the directive instance itself can be attached to a host, enabling declarative use of portals.
 */
export class CdkPortal extends TemplatePortal {
    constructor(templateRef, viewContainerRef) {
        super(templateRef, viewContainerRef);
    }
}
CdkPortal.decorators = [
    { type: Directive, args: [{
                selector: '[cdkPortal]',
                exportAs: 'cdkPortal',
            },] }
];
CdkPortal.ctorParameters = () => [
    { type: TemplateRef },
    { type: ViewContainerRef }
];
/**
 * @deprecated Use `CdkPortal` instead.
 * @breaking-change 9.0.0
 */
export class TemplatePortalDirective extends CdkPortal {
}
TemplatePortalDirective.decorators = [
    { type: Directive, args: [{
                selector: '[cdk-portal], [portal]',
                exportAs: 'cdkPortal',
                providers: [{
                        provide: CdkPortal,
                        useExisting: TemplatePortalDirective
                    }]
            },] }
];
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
        this._attachedPortal = portal;
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
        this._attachedPortal = null;
        this._attachedRef = null;
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
        const viewContainerRef = portal.viewContainerRef != null ?
            portal.viewContainerRef :
            this._viewContainerRef;
        const resolver = portal.componentFactoryResolver || this._componentFactoryResolver;
        const componentFactory = resolver.resolveComponentFactory(portal.component);
        const ref = viewContainerRef.createComponent(componentFactory, viewContainerRef.length, portal.injector || viewContainerRef.injector);
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
        const viewRef = this._viewContainerRef.createEmbeddedView(portal.templateRef, portal.context);
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
        return (nativeElement.nodeType === nativeElement.ELEMENT_NODE ?
            nativeElement : nativeElement.parentNode);
    }
}
CdkPortalOutlet.decorators = [
    { type: Directive, args: [{
                selector: '[cdkPortalOutlet]',
                exportAs: 'cdkPortalOutlet',
                inputs: ['portal: cdkPortalOutlet']
            },] }
];
CdkPortalOutlet.ctorParameters = () => [
    { type: ComponentFactoryResolver },
    { type: ViewContainerRef },
    { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] }] }
];
CdkPortalOutlet.propDecorators = {
    attached: [{ type: Output }]
};
/**
 * @deprecated Use `CdkPortalOutlet` instead.
 * @breaking-change 9.0.0
 */
export class PortalHostDirective extends CdkPortalOutlet {
}
PortalHostDirective.decorators = [
    { type: Directive, args: [{
                selector: '[cdkPortalHost], [portalHost]',
                exportAs: 'cdkPortalHost',
                inputs: ['portal: cdkPortalHost'],
                providers: [{
                        provide: CdkPortalOutlet,
                        useExisting: PortalHostDirective
                    }]
            },] }
];
export class PortalModule {
}
PortalModule.decorators = [
    { type: NgModule, args: [{
                exports: [CdkPortal, CdkPortalOutlet, TemplatePortalDirective, PortalHostDirective],
                declarations: [CdkPortal, CdkPortalOutlet, TemplatePortalDirective, PortalHostDirective],
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9ydGFsLWRpcmVjdGl2ZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL3BvcnRhbC9wb3J0YWwtZGlyZWN0aXZlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQ0wsd0JBQXdCLEVBRXhCLFNBQVMsRUFFVCxZQUFZLEVBQ1osUUFBUSxFQUdSLE1BQU0sRUFDTixXQUFXLEVBQ1gsZ0JBQWdCLEVBQ2hCLE1BQU0sR0FDUCxNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDekMsT0FBTyxFQUFDLGdCQUFnQixFQUEyQixjQUFjLEVBQVksTUFBTSxVQUFVLENBQUM7QUFHOUY7OztHQUdHO0FBS0gsTUFBTSxPQUFPLFNBQVUsU0FBUSxjQUFjO0lBQzNDLFlBQVksV0FBNkIsRUFBRSxnQkFBa0M7UUFDM0UsS0FBSyxDQUFDLFdBQVcsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7OztZQVBGLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUsYUFBYTtnQkFDdkIsUUFBUSxFQUFFLFdBQVc7YUFDdEI7OztZQWZDLFdBQVc7WUFDWCxnQkFBZ0I7O0FBcUJsQjs7O0dBR0c7QUFTSCxNQUFNLE9BQU8sdUJBQXdCLFNBQVEsU0FBUzs7O1lBUnJELFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUsd0JBQXdCO2dCQUNsQyxRQUFRLEVBQUUsV0FBVztnQkFDckIsU0FBUyxFQUFFLENBQUM7d0JBQ1YsT0FBTyxFQUFFLFNBQVM7d0JBQ2xCLFdBQVcsRUFBRSx1QkFBdUI7cUJBQ3JDLENBQUM7YUFDSDs7QUFTRDs7Ozs7O0dBTUc7QUFNSCxNQUFNLE9BQU8sZUFBZ0IsU0FBUSxnQkFBZ0I7SUFTbkQsWUFDWSx5QkFBbUQsRUFDbkQsaUJBQW1DO0lBRTNDOzs7T0FHRztJQUNlLFNBQWU7UUFDbkMsS0FB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QU8sRUFBRSxlQUFlO3dCQUN4QixXQUFXLEVBQUUsbUJBQW1CO3FCQUNqQyxDQUFDO2FBQ0g7O0FBUUQsTUFBTSxPQUFPLFlBQVk7OztZQUp4QixRQUFRLFNBQUM7Z0JBQ1IsT0FBTyxFQUFFLENBQUMsU0FBUyxFQUFFLGVBQWUsRUFBRSx1QkFBdUIsRUFBRSxtQkFBbUIsQ0FBQztnQkFDbkYsWUFBWSxFQUFFLENBQUMsU0FBUyxFQUFFLGVBQWUsRUFBRSx1QkFBdUIsRUFBRSxtQkFBbUIsQ0FBQzthQUN6RiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIsXG4gIENvbXBvbmVudFJlZixcbiAgRGlyZWN0aXZlLFxuICBFbWJlZGRlZFZpZXdSZWYsXG4gIEV2ZW50RW1pdHRlcixcbiAgTmdNb2R1bGUsXG4gIE9uRGVzdHJveSxcbiAgT25Jbml0LFxuICBPdXRwdXQsXG4gIFRlbXBsYXRlUmVmLFxuICBWaWV3Q29udGFpbmVyUmVmLFxuICBJbmplY3QsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtET0NVTUVOVH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7QmFzZVBvcnRhbE91dGxldCwgQ29tcG9uZW50UG9ydGFsLCBQb3J0YWwsIFRlbXBsYXRlUG9ydGFsLCBEb21Qb3J0YWx9IGZyb20gJy4vcG9ydGFsJztcblxuXG4vKipcbiAqIERpcmVjdGl2ZSB2ZXJzaW9uIG9mIGEgYFRlbXBsYXRlUG9ydGFsYC4gQmVjYXVzZSB0aGUgZGlyZWN0aXZlICppcyogYSBUZW1wbGF0ZVBvcnRhbCxcbiAqIHRoZSBkaXJlY3RpdmUgaW5zdGFuY2UgaXRzZWxmIGNhbiBiZSBhdHRhY2hlZCB0byBhIGhvc3QsIGVuYWJsaW5nIGRlY2xhcmF0aXZlIHVzZSBvZiBwb3J0YWxzLlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbY2RrUG9ydGFsXScsXG4gIGV4cG9ydEFzOiAnY2RrUG9ydGFsJyxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrUG9ydGFsIGV4dGVuZHMgVGVtcGxhdGVQb3J0YWwge1xuICBjb25zdHJ1Y3Rvcih0ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWY8YW55Piwgdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZikge1xuICAgIHN1cGVyKHRlbXBsYXRlUmVmLCB2aWV3Q29udGFpbmVyUmVmKTtcbiAgfVxufVxuXG4vKipcbiAqIEBkZXByZWNhdGVkIFVzZSBgQ2RrUG9ydGFsYCBpbnN0ZWFkLlxuICogQGJyZWFraW5nLWNoYW5nZSA5LjAuMFxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbY2RrLXBvcnRhbF0sIFtwb3J0YWxdJyxcbiAgZXhwb3J0QXM6ICdjZGtQb3J0YWwnLFxuICBwcm92aWRlcnM6IFt7XG4gICAgcHJvdmlkZTogQ2RrUG9ydGFsLFxuICAgIHVzZUV4aXN0aW5nOiBUZW1wbGF0ZVBvcnRhbERpcmVjdGl2ZVxuICB9XVxufSlcbmV4cG9ydCBjbGFzcyBUZW1wbGF0ZVBvcnRhbERpcmVjdGl2ZSBleHRlbmRzIENka1BvcnRhbCB7fVxuXG4vKipcbiAqIFBvc3NpYmxlIGF0dGFjaGVkIHJlZmVyZW5jZXMgdG8gdGhlIENka1BvcnRhbE91dGxldC5cbiAqL1xuZXhwb3J0IHR5cGUgQ2RrUG9ydGFsT3V0bGV0QXR0YWNoZWRSZWYgPSBDb21wb25lbnRSZWY8YW55PiB8IEVtYmVkZGVkVmlld1JlZjxhbnk+IHwgbnVsbDtcblxuXG4vKipcbiAqIERpcmVjdGl2ZSB2ZXJzaW9uIG9mIGEgUG9ydGFsT3V0bGV0LiBCZWNhdXNlIHRoZSBkaXJlY3RpdmUgKmlzKiBhIFBvcnRhbE91dGxldCwgcG9ydGFscyBjYW4gYmVcbiAqIGRpcmVjdGx5IGF0dGFjaGVkIHRvIGl0LCBlbmFibGluZyBkZWNsYXJhdGl2ZSB1c2UuXG4gKlxuICogVXNhZ2U6XG4gKiBgPG5nLXRlbXBsYXRlIFtjZGtQb3J0YWxPdXRsZXRdPVwiZ3JlZXRpbmdcIj48L25nLXRlbXBsYXRlPmBcbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Nka1BvcnRhbE91dGxldF0nLFxuICBleHBvcnRBczogJ2Nka1BvcnRhbE91dGxldCcsXG4gIGlucHV0czogWydwb3J0YWw6IGNka1BvcnRhbE91dGxldCddXG59KVxuZXhwb3J0IGNsYXNzIENka1BvcnRhbE91dGxldCBleHRlbmRzIEJhc2VQb3J0YWxPdXRsZXQgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XG4gIHByaXZhdGUgX2RvY3VtZW50OiBEb2N1bWVudDtcblxuICAvKiogV2hldGhlciB0aGUgcG9ydGFsIGNvbXBvbmVudCBpcyBpbml0aWFsaXplZC4gKi9cbiAgcHJpdmF0ZSBfaXNJbml0aWFsaXplZCA9IGZhbHNlO1xuXG4gIC8qKiBSZWZlcmVuY2UgdG8gdGhlIGN1cnJlbnRseS1hdHRhY2hlZCBjb21wb25lbnQvdmlldyByZWYuICovXG4gIHByaXZhdGUgX2F0dGFjaGVkUmVmOiBDZGtQb3J0YWxPdXRsZXRBdHRhY2hlZFJlZjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgX2NvbXBvbmVudEZhY3RvcnlSZXNvbHZlcjogQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyLFxuICAgICAgcHJpdmF0ZSBfdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZixcblxuICAgICAgLyoqXG4gICAgICAgKiBAZGVwcmVjYXRlZCBgX2RvY3VtZW50YCBwYXJhbWV0ZXIgdG8gYmUgbWFkZSByZXF1aXJlZC5cbiAgICAgICAqIEBicmVha2luZy1jaGFuZ2UgOS4wLjBcbiAgICAgICAqL1xuICAgICAgQEluamVjdChET0NVTUVOVCkgX2RvY3VtZW50PzogYW55KSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLl9kb2N1bWVudCA9IF9kb2N1bWVudDtcbiAgfVxuXG4gIC8qKiBQb3J0YWwgYXNzb2NpYXRlZCB3aXRoIHRoZSBQb3J0YWwgb3V0bGV0LiAqL1xuICBnZXQgcG9ydGFsKCk6IFBvcnRhbDxhbnk+IHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuX2F0dGFjaGVkUG9ydGFsO1xuICB9XG5cbiAgc2V0IHBvcnRhbChwb3J0YWw6IFBvcnRhbDxhbnk+IHwgbnVsbCkge1xuICAgIC8vIElnbm9yZSB0aGUgY2FzZXMgd2hlcmUgdGhlIGBwb3J0YWxgIGlzIHNldCB0byBhIGZhbHN5IHZhbHVlIGJlZm9yZSB0aGUgbGlmZWN5Y2xlIGhvb2tzIGhhdmVcbiAgICAvLyBydW4uIFRoaXMgaGFuZGxlcyB0aGUgY2FzZXMgd2hlcmUgdGhlIHVzZXIgbWlnaHQgZG8gc29tZXRoaW5nIGxpa2UgYDxkaXYgY2RrUG9ydGFsT3V0bGV0PmBcbiAgICAvLyBhbmQgYXR0YWNoIGEgcG9ydGFsIHByb2dyYW1tYXRpY2FsbHkgaW4gdGhlIHBhcmVudCBjb21wb25lbnQuIFdoZW4gQW5ndWxhciBkb2VzIHRoZSBmaXJzdCBDRFxuICAgIC8vIHJvdW5kLCBpdCB3aWxsIGZpcmUgdGhlIHNldHRlciB3aXRoIGVtcHR5IHN0cmluZywgY2F1c2luZyB0aGUgdXNlcidzIGNvbnRlbnQgdG8gYmUgY2xlYXJlZC5cbiAgICBpZiAodGhpcy5oYXNBdHRhY2hlZCgpICYmICFwb3J0YWwgJiYgIXRoaXMuX2lzSW5pdGlhbGl6ZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5oYXNBdHRhY2hlZCgpKSB7XG4gICAgICBzdXBlci5kZXRhY2goKTtcbiAgICB9XG5cbiAgICBpZiAocG9ydGFsKSB7XG4gICAgICBzdXBlci5hdHRhY2gocG9ydGFsKTtcbiAgICB9XG5cbiAgICB0aGlzLl9hdHRhY2hlZFBvcnRhbCA9IHBvcnRhbDtcbiAgfVxuXG4gIC8qKiBFbWl0cyB3aGVuIGEgcG9ydGFsIGlzIGF0dGFjaGVkIHRvIHRoZSBvdXRsZXQuICovXG4gIEBPdXRwdXQoKSByZWFkb25seSBhdHRhY2hlZDogRXZlbnRFbWl0dGVyPENka1BvcnRhbE91dGxldEF0dGFjaGVkUmVmPiA9XG4gICAgICBuZXcgRXZlbnRFbWl0dGVyPENka1BvcnRhbE91dGxldEF0dGFjaGVkUmVmPigpO1xuXG4gIC8qKiBDb21wb25lbnQgb3IgdmlldyByZWZlcmVuY2UgdGhhdCBpcyBhdHRhY2hlZCB0byB0aGUgcG9ydGFsLiAqL1xuICBnZXQgYXR0YWNoZWRSZWYoKTogQ2RrUG9ydGFsT3V0bGV0QXR0YWNoZWRSZWYge1xuICAgIHJldHVybiB0aGlzLl9hdHRhY2hlZFJlZjtcbiAgfVxuXG4gIG5nT25Jbml0KCkge1xuICAgIHRoaXMuX2lzSW5pdGlhbGl6ZWQgPSB0cnVlO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgc3VwZXIuZGlzcG9zZSgpO1xuICAgIHRoaXMuX2F0dGFjaGVkUG9ydGFsID0gbnVsbDtcbiAgICB0aGlzLl9hdHRhY2hlZFJlZiA9IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogQXR0YWNoIHRoZSBnaXZlbiBDb21wb25lbnRQb3J0YWwgdG8gdGhpcyBQb3J0YWxPdXRsZXQgdXNpbmcgdGhlIENvbXBvbmVudEZhY3RvcnlSZXNvbHZlci5cbiAgICpcbiAgICogQHBhcmFtIHBvcnRhbCBQb3J0YWwgdG8gYmUgYXR0YWNoZWQgdG8gdGhlIHBvcnRhbCBvdXRsZXQuXG4gICAqIEByZXR1cm5zIFJlZmVyZW5jZSB0byB0aGUgY3JlYXRlZCBjb21wb25lbnQuXG4gICAqL1xuICBhdHRhY2hDb21wb25lbnRQb3J0YWw8VD4ocG9ydGFsOiBDb21wb25lbnRQb3J0YWw8VD4pOiBDb21wb25lbnRSZWY8VD4ge1xuICAgIHBvcnRhbC5zZXRBdHRhY2hlZEhvc3QodGhpcyk7XG5cbiAgICAvLyBJZiB0aGUgcG9ydGFsIHNwZWNpZmllcyBhbiBvcmlnaW4sIHVzZSB0aGF0IGFzIHRoZSBsb2dpY2FsIGxvY2F0aW9uIG9mIHRoZSBjb21wb25lbnRcbiAgICAvLyBpbiB0aGUgYXBwbGljYXRpb24gdHJlZS4gT3RoZXJ3aXNlIHVzZSB0aGUgbG9jYXRpb24gb2YgdGhpcyBQb3J0YWxPdXRsZXQuXG4gICAgY29uc3Qgdmlld0NvbnRhaW5lclJlZiA9IHBvcnRhbC52aWV3Q29udGFpbmVyUmVmICE9IG51bGwgP1xuICAgICAgICBwb3J0YWwudmlld0NvbnRhaW5lclJlZiA6XG4gICAgICAgIHRoaXMuX3ZpZXdDb250YWluZXJSZWY7XG5cbiAgICBjb25zdCByZXNvbHZlciA9IHBvcnRhbC5jb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIgfHwgdGhpcy5fY29tcG9uZW50RmFjdG9yeVJlc29sdmVyO1xuICAgIGNvbnN0IGNvbXBvbmVudEZhY3RvcnkgPSByZXNvbHZlci5yZXNvbHZlQ29tcG9uZW50RmFjdG9yeShwb3J0YWwuY29tcG9uZW50KTtcbiAgICBjb25zdCByZWYgPSB2aWV3Q29udGFpbmVyUmVmLmNyZWF0ZUNvbXBvbmVudChcbiAgICAgICAgY29tcG9uZW50RmFjdG9yeSwgdmlld0NvbnRhaW5lclJlZi5sZW5ndGgsXG4gICAgICAgIHBvcnRhbC5pbmplY3RvciB8fCB2aWV3Q29udGFpbmVyUmVmLmluamVjdG9yKTtcblxuICAgIC8vIElmIHdlJ3JlIHVzaW5nIGEgdmlldyBjb250YWluZXIgdGhhdCdzIGRpZmZlcmVudCBmcm9tIHRoZSBpbmplY3RlZCBvbmUgKGUuZy4gd2hlbiB0aGUgcG9ydGFsXG4gICAgLy8gc3BlY2lmaWVzIGl0cyBvd24pIHdlIG5lZWQgdG8gbW92ZSB0aGUgY29tcG9uZW50IGludG8gdGhlIG91dGxldCwgb3RoZXJ3aXNlIGl0J2xsIGJlIHJlbmRlcmVkXG4gICAgLy8gaW5zaWRlIG9mIHRoZSBhbHRlcm5hdGUgdmlldyBjb250YWluZXIuXG4gICAgaWYgKHZpZXdDb250YWluZXJSZWYgIT09IHRoaXMuX3ZpZXdDb250YWluZXJSZWYpIHtcbiAgICAgIHRoaXMuX2dldFJvb3ROb2RlKCkuYXBwZW5kQ2hpbGQoKHJlZi5ob3N0VmlldyBhcyBFbWJlZGRlZFZpZXdSZWY8YW55Pikucm9vdE5vZGVzWzBdKTtcbiAgICB9XG5cbiAgICBzdXBlci5zZXREaXNwb3NlRm4oKCkgPT4gcmVmLmRlc3Ryb3koKSk7XG4gICAgdGhpcy5fYXR0YWNoZWRQb3J0YWwgPSBwb3J0YWw7XG4gICAgdGhpcy5fYXR0YWNoZWRSZWYgPSByZWY7XG4gICAgdGhpcy5hdHRhY2hlZC5lbWl0KHJlZik7XG5cbiAgICByZXR1cm4gcmVmO1xuICB9XG5cbiAgLyoqXG4gICAqIEF0dGFjaCB0aGUgZ2l2ZW4gVGVtcGxhdGVQb3J0YWwgdG8gdGhpcyBQb3J0YWxIb3N0IGFzIGFuIGVtYmVkZGVkIFZpZXcuXG4gICAqIEBwYXJhbSBwb3J0YWwgUG9ydGFsIHRvIGJlIGF0dGFjaGVkLlxuICAgKiBAcmV0dXJucyBSZWZlcmVuY2UgdG8gdGhlIGNyZWF0ZWQgZW1iZWRkZWQgdmlldy5cbiAgICovXG4gIGF0dGFjaFRlbXBsYXRlUG9ydGFsPEM+KHBvcnRhbDogVGVtcGxhdGVQb3J0YWw8Qz4pOiBFbWJlZGRlZFZpZXdSZWY8Qz4ge1xuICAgIHBvcnRhbC5zZXRBdHRhY2hlZEhvc3QodGhpcyk7XG4gICAgY29uc3Qgdmlld1JlZiA9IHRoaXMuX3ZpZXdDb250YWluZXJSZWYuY3JlYXRlRW1iZWRkZWRWaWV3KHBvcnRhbC50ZW1wbGF0ZVJlZiwgcG9ydGFsLmNvbnRleHQpO1xuICAgIHN1cGVyLnNldERpc3Bvc2VGbigoKSA9PiB0aGlzLl92aWV3Q29udGFpbmVyUmVmLmNsZWFyKCkpO1xuXG4gICAgdGhpcy5fYXR0YWNoZWRQb3J0YWwgPSBwb3J0YWw7XG4gICAgdGhpcy5fYXR0YWNoZWRSZWYgPSB2aWV3UmVmO1xuICAgIHRoaXMuYXR0YWNoZWQuZW1pdCh2aWV3UmVmKTtcblxuICAgIHJldHVybiB2aWV3UmVmO1xuICB9XG5cbiAgLyoqXG4gICAqIEF0dGFjaGVzIHRoZSBnaXZlbiBEb21Qb3J0YWwgdG8gdGhpcyBQb3J0YWxIb3N0IGJ5IG1vdmluZyBhbGwgb2YgdGhlIHBvcnRhbCBjb250ZW50IGludG8gaXQuXG4gICAqIEBwYXJhbSBwb3J0YWwgUG9ydGFsIHRvIGJlIGF0dGFjaGVkLlxuICAgKiBAZGVwcmVjYXRlZCBUbyBiZSB0dXJuZWQgaW50byBhIG1ldGhvZC5cbiAgICogQGJyZWFraW5nLWNoYW5nZSAxMC4wLjBcbiAgICovXG4gIGF0dGFjaERvbVBvcnRhbCA9IChwb3J0YWw6IERvbVBvcnRhbCkgPT4ge1xuICAgIC8vIEBicmVha2luZy1jaGFuZ2UgOS4wLjAgUmVtb3ZlIGNoZWNrIGFuZCBlcnJvciBvbmNlIHRoZVxuICAgIC8vIGBfZG9jdW1lbnRgIGNvbnN0cnVjdG9yIHBhcmFtZXRlciBpcyByZXF1aXJlZC5cbiAgICBpZiAoIXRoaXMuX2RvY3VtZW50ICYmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpKSB7XG4gICAgICB0aHJvdyBFcnJvcignQ2Fubm90IGF0dGFjaCBET00gcG9ydGFsIHdpdGhvdXQgX2RvY3VtZW50IGNvbnN0cnVjdG9yIHBhcmFtZXRlcicpO1xuICAgIH1cblxuICAgIGNvbnN0IGVsZW1lbnQgPSBwb3J0YWwuZWxlbWVudDtcbiAgICBpZiAoIWVsZW1lbnQucGFyZW50Tm9kZSAmJiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSkge1xuICAgICAgdGhyb3cgRXJyb3IoJ0RPTSBwb3J0YWwgY29udGVudCBtdXN0IGJlIGF0dGFjaGVkIHRvIGEgcGFyZW50IG5vZGUuJyk7XG4gICAgfVxuXG4gICAgLy8gQW5jaG9yIHVzZWQgdG8gc2F2ZSB0aGUgZWxlbWVudCdzIHByZXZpb3VzIHBvc2l0aW9uIHNvXG4gICAgLy8gdGhhdCB3ZSBjYW4gcmVzdG9yZSBpdCB3aGVuIHRoZSBwb3J0YWwgaXMgZGV0YWNoZWQuXG4gICAgY29uc3QgYW5jaG9yTm9kZSA9IHRoaXMuX2RvY3VtZW50LmNyZWF0ZUNvbW1lbnQoJ2RvbS1wb3J0YWwnKTtcblxuICAgIHBvcnRhbC5zZXRBdHRhY2hlZEhvc3QodGhpcyk7XG4gICAgZWxlbWVudC5wYXJlbnROb2RlIS5pbnNlcnRCZWZvcmUoYW5jaG9yTm9kZSwgZWxlbWVudCk7XG4gICAgdGhpcy5fZ2V0Um9vdE5vZGUoKS5hcHBlbmRDaGlsZChlbGVtZW50KTtcbiAgICB0aGlzLl9hdHRhY2hlZFBvcnRhbCA9IHBvcnRhbDtcblxuICAgIHN1cGVyLnNldERpc3Bvc2VGbigoKSA9PiB7XG4gICAgICBpZiAoYW5jaG9yTm9kZS5wYXJlbnROb2RlKSB7XG4gICAgICAgIGFuY2hvck5vZGUucGFyZW50Tm9kZSEucmVwbGFjZUNoaWxkKGVsZW1lbnQsIGFuY2hvck5vZGUpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIHJvb3Qgbm9kZSBvZiB0aGUgcG9ydGFsIG91dGxldC4gKi9cbiAgcHJpdmF0ZSBfZ2V0Um9vdE5vZGUoKTogSFRNTEVsZW1lbnQge1xuICAgIGNvbnN0IG5hdGl2ZUVsZW1lbnQ6IE5vZGUgPSB0aGlzLl92aWV3Q29udGFpbmVyUmVmLmVsZW1lbnQubmF0aXZlRWxlbWVudDtcblxuICAgIC8vIFRoZSBkaXJlY3RpdmUgY291bGQgYmUgc2V0IG9uIGEgdGVtcGxhdGUgd2hpY2ggd2lsbCByZXN1bHQgaW4gYSBjb21tZW50XG4gICAgLy8gbm9kZSBiZWluZyB0aGUgcm9vdC4gVXNlIHRoZSBjb21tZW50J3MgcGFyZW50IG5vZGUgaWYgdGhhdCBpcyB0aGUgY2FzZS5cbiAgICByZXR1cm4gKG5hdGl2ZUVsZW1lbnQubm9kZVR5cGUgPT09IG5hdGl2ZUVsZW1lbnQuRUxFTUVOVF9OT0RFID9cbiAgICAgICAgICAgbmF0aXZlRWxlbWVudCA6IG5hdGl2ZUVsZW1lbnQucGFyZW50Tm9kZSEpIGFzIEhUTUxFbGVtZW50O1xuICB9XG5cbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3BvcnRhbDogUG9ydGFsPGFueT4gfCBudWxsIHwgdW5kZWZpbmVkIHwgJyc7XG59XG5cbi8qKlxuICogQGRlcHJlY2F0ZWQgVXNlIGBDZGtQb3J0YWxPdXRsZXRgIGluc3RlYWQuXG4gKiBAYnJlYWtpbmctY2hhbmdlIDkuMC4wXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tjZGtQb3J0YWxIb3N0XSwgW3BvcnRhbEhvc3RdJyxcbiAgZXhwb3J0QXM6ICdjZGtQb3J0YWxIb3N0JyxcbiAgaW5wdXRzOiBbJ3BvcnRhbDogY2RrUG9ydGFsSG9zdCddLFxuICBwcm92aWRlcnM6IFt7XG4gICAgcHJvdmlkZTogQ2RrUG9ydGFsT3V0bGV0LFxuICAgIHVzZUV4aXN0aW5nOiBQb3J0YWxIb3N0RGlyZWN0aXZlXG4gIH1dXG59KVxuZXhwb3J0IGNsYXNzIFBvcnRhbEhvc3REaXJlY3RpdmUgZXh0ZW5kcyBDZGtQb3J0YWxPdXRsZXQge31cblxuXG5ATmdNb2R1bGUoe1xuICBleHBvcnRzOiBbQ2RrUG9ydGFsLCBDZGtQb3J0YWxPdXRsZXQsIFRlbXBsYXRlUG9ydGFsRGlyZWN0aXZlLCBQb3J0YWxIb3N0RGlyZWN0aXZlXSxcbiAgZGVjbGFyYXRpb25zOiBbQ2RrUG9ydGFsLCBDZGtQb3J0YWxPdXRsZXQsIFRlbXBsYXRlUG9ydGFsRGlyZWN0aXZlLCBQb3J0YWxIb3N0RGlyZWN0aXZlXSxcbn0pXG5leHBvcnQgY2xhc3MgUG9ydGFsTW9kdWxlIHt9XG4iXX0=