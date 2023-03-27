/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, EventEmitter, inject, InjectionToken, Injector, ViewContainerRef, } from '@angular/core';
import { MENU_STACK } from './menu-stack';
import { TemplatePortal } from '@angular/cdk/portal';
import { merge, Subject } from 'rxjs';
import * as i0 from "@angular/core";
/** Injection token used for an implementation of MenuStack. */
export const MENU_TRIGGER = new InjectionToken('cdk-menu-trigger');
/**
 * Abstract directive that implements shared logic common to all menu triggers.
 * This class can be extended to create custom menu trigger types.
 */
export class CdkMenuTriggerBase {
    constructor() {
        /** The DI injector for this component. */
        this.injector = inject(Injector);
        /** The view container ref for this component */
        this.viewContainerRef = inject(ViewContainerRef);
        /** The menu stack in which this menu resides. */
        this.menuStack = inject(MENU_STACK);
        /** Emits when the attached menu is requested to open */
        this.opened = new EventEmitter();
        /** Emits when the attached menu is requested to close */
        this.closed = new EventEmitter();
        /** A reference to the overlay which manages the triggered menu */
        this.overlayRef = null;
        /** Emits when this trigger is destroyed. */
        this.destroyed = new Subject();
        /** Emits when the outside pointer events listener on the overlay should be stopped. */
        this.stopOutsideClicksListener = merge(this.closed, this.destroyed);
    }
    ngOnDestroy() {
        this._destroyOverlay();
        this.destroyed.next();
        this.destroyed.complete();
    }
    /** Whether the attached menu is open. */
    isOpen() {
        return !!this.overlayRef?.hasAttached();
    }
    /** Registers a child menu as having been opened by this trigger. */
    registerChildMenu(child) {
        this.childMenu = child;
    }
    /**
     * Get the portal to be attached to the overlay which contains the menu. Allows for the menu
     * content to change dynamically and be reflected in the application.
     */
    getMenuContentPortal() {
        const hasMenuContentChanged = this.menuTemplateRef !== this._menuPortal?.templateRef;
        if (this.menuTemplateRef && (!this._menuPortal || hasMenuContentChanged)) {
            this._menuPortal = new TemplatePortal(this.menuTemplateRef, this.viewContainerRef, this.menuData, this._getChildMenuInjector());
        }
        return this._menuPortal;
    }
    /**
     * Whether the given element is inside the scope of this trigger's menu stack.
     * @param element The element to check.
     * @return Whether the element is inside the scope of this trigger's menu stack.
     */
    isElementInsideMenuStack(element) {
        for (let el = element; el; el = el?.parentElement ?? null) {
            if (el.getAttribute('data-cdk-menu-stack-id') === this.menuStack.id) {
                return true;
            }
        }
        return false;
    }
    /** Destroy and unset the overlay reference it if exists */
    _destroyOverlay() {
        if (this.overlayRef) {
            this.overlayRef.dispose();
            this.overlayRef = null;
        }
    }
    /** Gets the injector to use when creating a child menu. */
    _getChildMenuInjector() {
        this._childMenuInjector =
            this._childMenuInjector ||
                Injector.create({
                    providers: [
                        { provide: MENU_TRIGGER, useValue: this },
                        { provide: MENU_STACK, useValue: this.menuStack },
                    ],
                    parent: this.injector,
                });
        return this._childMenuInjector;
    }
}
CdkMenuTriggerBase.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: CdkMenuTriggerBase, deps: [], target: i0.ɵɵFactoryTarget.Directive });
CdkMenuTriggerBase.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "15.2.0-rc.0", type: CdkMenuTriggerBase, host: { properties: { "attr.aria-controls": "childMenu?.id", "attr.data-cdk-menu-stack-id": "menuStack.id" } }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: CdkMenuTriggerBase, decorators: [{
            type: Directive,
            args: [{
                    host: {
                        '[attr.aria-controls]': 'childMenu?.id',
                        '[attr.data-cdk-menu-stack-id]': 'menuStack.id',
                    },
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS10cmlnZ2VyLWJhc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL21lbnUvbWVudS10cmlnZ2VyLWJhc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLFNBQVMsRUFDVCxZQUFZLEVBQ1osTUFBTSxFQUNOLGNBQWMsRUFDZCxRQUFRLEVBR1IsZ0JBQWdCLEdBQ2pCLE1BQU0sZUFBZSxDQUFDO0FBRXZCLE9BQU8sRUFBQyxVQUFVLEVBQVksTUFBTSxjQUFjLENBQUM7QUFFbkQsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ25ELE9BQU8sRUFBQyxLQUFLLEVBQUUsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDOztBQUVwQywrREFBK0Q7QUFDL0QsTUFBTSxDQUFDLE1BQU0sWUFBWSxHQUFHLElBQUksY0FBYyxDQUFxQixrQkFBa0IsQ0FBQyxDQUFDO0FBRXZGOzs7R0FHRztBQU9ILE1BQU0sT0FBZ0Isa0JBQWtCO0lBTnhDO1FBT0UsMENBQTBDO1FBQ2pDLGFBQVEsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFckMsZ0RBQWdEO1FBQzdCLHFCQUFnQixHQUFHLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBRS9ELGlEQUFpRDtRQUM5QixjQUFTLEdBQWMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBUTdELHdEQUF3RDtRQUMvQyxXQUFNLEdBQXVCLElBQUksWUFBWSxFQUFFLENBQUM7UUFFekQseURBQXlEO1FBQ2hELFdBQU0sR0FBdUIsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQVF6RCxrRUFBa0U7UUFDeEQsZUFBVSxHQUFzQixJQUFJLENBQUM7UUFFL0MsNENBQTRDO1FBQ3pCLGNBQVMsR0FBa0IsSUFBSSxPQUFPLEVBQUUsQ0FBQztRQUU1RCx1RkFBdUY7UUFDcEUsOEJBQXlCLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0tBaUZuRjtJQXRFQyxXQUFXO1FBQ1QsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBRXZCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDdEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUM1QixDQUFDO0lBRUQseUNBQXlDO0lBQ3pDLE1BQU07UUFDSixPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLFdBQVcsRUFBRSxDQUFDO0lBQzFDLENBQUM7SUFFRCxvRUFBb0U7SUFDcEUsaUJBQWlCLENBQUMsS0FBVztRQUMzQixJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztJQUN6QixDQUFDO0lBRUQ7OztPQUdHO0lBQ08sb0JBQW9CO1FBQzVCLE1BQU0scUJBQXFCLEdBQUcsSUFBSSxDQUFDLGVBQWUsS0FBSyxJQUFJLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQztRQUNyRixJQUFJLElBQUksQ0FBQyxlQUFlLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLElBQUkscUJBQXFCLENBQUMsRUFBRTtZQUN4RSxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksY0FBYyxDQUNuQyxJQUFJLENBQUMsZUFBZSxFQUNwQixJQUFJLENBQUMsZ0JBQWdCLEVBQ3JCLElBQUksQ0FBQyxRQUFRLEVBQ2IsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQzdCLENBQUM7U0FDSDtRQUVELE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQztJQUMxQixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNPLHdCQUF3QixDQUFDLE9BQWdCO1FBQ2pELEtBQUssSUFBSSxFQUFFLEdBQW1CLE9BQU8sRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxhQUFhLElBQUksSUFBSSxFQUFFO1lBQ3pFLElBQUksRUFBRSxDQUFDLFlBQVksQ0FBQyx3QkFBd0IsQ0FBQyxLQUFLLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFFO2dCQUNuRSxPQUFPLElBQUksQ0FBQzthQUNiO1NBQ0Y7UUFDRCxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFFRCwyREFBMkQ7SUFDbkQsZUFBZTtRQUNyQixJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDbkIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUMxQixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztTQUN4QjtJQUNILENBQUM7SUFFRCwyREFBMkQ7SUFDbkQscUJBQXFCO1FBQzNCLElBQUksQ0FBQyxrQkFBa0I7WUFDckIsSUFBSSxDQUFDLGtCQUFrQjtnQkFDdkIsUUFBUSxDQUFDLE1BQU0sQ0FBQztvQkFDZCxTQUFTLEVBQUU7d0JBQ1QsRUFBQyxPQUFPLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7d0JBQ3ZDLEVBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBQztxQkFDaEQ7b0JBQ0QsTUFBTSxFQUFFLElBQUksQ0FBQyxRQUFRO2lCQUN0QixDQUFDLENBQUM7UUFDTCxPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztJQUNqQyxDQUFDOztvSEFuSG1CLGtCQUFrQjt3R0FBbEIsa0JBQWtCO2dHQUFsQixrQkFBa0I7a0JBTnZDLFNBQVM7bUJBQUM7b0JBQ1QsSUFBSSxFQUFFO3dCQUNKLHNCQUFzQixFQUFFLGVBQWU7d0JBQ3ZDLCtCQUErQixFQUFFLGNBQWM7cUJBQ2hEO2lCQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIERpcmVjdGl2ZSxcbiAgRXZlbnRFbWl0dGVyLFxuICBpbmplY3QsXG4gIEluamVjdGlvblRva2VuLFxuICBJbmplY3RvcixcbiAgT25EZXN0cm95LFxuICBUZW1wbGF0ZVJlZixcbiAgVmlld0NvbnRhaW5lclJlZixcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge01lbnV9IGZyb20gJy4vbWVudS1pbnRlcmZhY2UnO1xuaW1wb3J0IHtNRU5VX1NUQUNLLCBNZW51U3RhY2t9IGZyb20gJy4vbWVudS1zdGFjayc7XG5pbXBvcnQge0Nvbm5lY3RlZFBvc2l0aW9uLCBPdmVybGF5UmVmfSBmcm9tICdAYW5ndWxhci9jZGsvb3ZlcmxheSc7XG5pbXBvcnQge1RlbXBsYXRlUG9ydGFsfSBmcm9tICdAYW5ndWxhci9jZGsvcG9ydGFsJztcbmltcG9ydCB7bWVyZ2UsIFN1YmplY3R9IGZyb20gJ3J4anMnO1xuXG4vKiogSW5qZWN0aW9uIHRva2VuIHVzZWQgZm9yIGFuIGltcGxlbWVudGF0aW9uIG9mIE1lbnVTdGFjay4gKi9cbmV4cG9ydCBjb25zdCBNRU5VX1RSSUdHRVIgPSBuZXcgSW5qZWN0aW9uVG9rZW48Q2RrTWVudVRyaWdnZXJCYXNlPignY2RrLW1lbnUtdHJpZ2dlcicpO1xuXG4vKipcbiAqIEFic3RyYWN0IGRpcmVjdGl2ZSB0aGF0IGltcGxlbWVudHMgc2hhcmVkIGxvZ2ljIGNvbW1vbiB0byBhbGwgbWVudSB0cmlnZ2Vycy5cbiAqIFRoaXMgY2xhc3MgY2FuIGJlIGV4dGVuZGVkIHRvIGNyZWF0ZSBjdXN0b20gbWVudSB0cmlnZ2VyIHR5cGVzLlxuICovXG5ARGlyZWN0aXZlKHtcbiAgaG9zdDoge1xuICAgICdbYXR0ci5hcmlhLWNvbnRyb2xzXSc6ICdjaGlsZE1lbnU/LmlkJyxcbiAgICAnW2F0dHIuZGF0YS1jZGstbWVudS1zdGFjay1pZF0nOiAnbWVudVN0YWNrLmlkJyxcbiAgfSxcbn0pXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQ2RrTWVudVRyaWdnZXJCYXNlIGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgLyoqIFRoZSBESSBpbmplY3RvciBmb3IgdGhpcyBjb21wb25lbnQuICovXG4gIHJlYWRvbmx5IGluamVjdG9yID0gaW5qZWN0KEluamVjdG9yKTtcblxuICAvKiogVGhlIHZpZXcgY29udGFpbmVyIHJlZiBmb3IgdGhpcyBjb21wb25lbnQgKi9cbiAgcHJvdGVjdGVkIHJlYWRvbmx5IHZpZXdDb250YWluZXJSZWYgPSBpbmplY3QoVmlld0NvbnRhaW5lclJlZik7XG5cbiAgLyoqIFRoZSBtZW51IHN0YWNrIGluIHdoaWNoIHRoaXMgbWVudSByZXNpZGVzLiAqL1xuICBwcm90ZWN0ZWQgcmVhZG9ubHkgbWVudVN0YWNrOiBNZW51U3RhY2sgPSBpbmplY3QoTUVOVV9TVEFDSyk7XG5cbiAgLyoqXG4gICAqIEEgbGlzdCBvZiBwcmVmZXJyZWQgbWVudSBwb3NpdGlvbnMgdG8gYmUgdXNlZCB3aGVuIGNvbnN0cnVjdGluZyB0aGVcbiAgICogYEZsZXhpYmxlQ29ubmVjdGVkUG9zaXRpb25TdHJhdGVneWAgZm9yIHRoaXMgdHJpZ2dlcidzIG1lbnUuXG4gICAqL1xuICBtZW51UG9zaXRpb246IENvbm5lY3RlZFBvc2l0aW9uW107XG5cbiAgLyoqIEVtaXRzIHdoZW4gdGhlIGF0dGFjaGVkIG1lbnUgaXMgcmVxdWVzdGVkIHRvIG9wZW4gKi9cbiAgcmVhZG9ubHkgb3BlbmVkOiBFdmVudEVtaXR0ZXI8dm9pZD4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgLyoqIEVtaXRzIHdoZW4gdGhlIGF0dGFjaGVkIG1lbnUgaXMgcmVxdWVzdGVkIHRvIGNsb3NlICovXG4gIHJlYWRvbmx5IGNsb3NlZDogRXZlbnRFbWl0dGVyPHZvaWQ+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gIC8qKiBUZW1wbGF0ZSByZWZlcmVuY2UgdmFyaWFibGUgdG8gdGhlIG1lbnUgdGhpcyB0cmlnZ2VyIG9wZW5zICovXG4gIG1lbnVUZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWY8dW5rbm93bj4gfCBudWxsO1xuXG4gIC8qKiBDb250ZXh0IGRhdGEgdG8gYmUgcGFzc2VkIGFsb25nIHRvIHRoZSBtZW51IHRlbXBsYXRlICovXG4gIG1lbnVEYXRhOiB1bmtub3duO1xuXG4gIC8qKiBBIHJlZmVyZW5jZSB0byB0aGUgb3ZlcmxheSB3aGljaCBtYW5hZ2VzIHRoZSB0cmlnZ2VyZWQgbWVudSAqL1xuICBwcm90ZWN0ZWQgb3ZlcmxheVJlZjogT3ZlcmxheVJlZiB8IG51bGwgPSBudWxsO1xuXG4gIC8qKiBFbWl0cyB3aGVuIHRoaXMgdHJpZ2dlciBpcyBkZXN0cm95ZWQuICovXG4gIHByb3RlY3RlZCByZWFkb25seSBkZXN0cm95ZWQ6IFN1YmplY3Q8dm9pZD4gPSBuZXcgU3ViamVjdCgpO1xuXG4gIC8qKiBFbWl0cyB3aGVuIHRoZSBvdXRzaWRlIHBvaW50ZXIgZXZlbnRzIGxpc3RlbmVyIG9uIHRoZSBvdmVybGF5IHNob3VsZCBiZSBzdG9wcGVkLiAqL1xuICBwcm90ZWN0ZWQgcmVhZG9ubHkgc3RvcE91dHNpZGVDbGlja3NMaXN0ZW5lciA9IG1lcmdlKHRoaXMuY2xvc2VkLCB0aGlzLmRlc3Ryb3llZCk7XG5cbiAgLyoqIFRoZSBjaGlsZCBtZW51IG9wZW5lZCBieSB0aGlzIHRyaWdnZXIuICovXG4gIHByb3RlY3RlZCBjaGlsZE1lbnU/OiBNZW51O1xuXG4gIC8qKiBUaGUgY29udGVudCBvZiB0aGUgbWVudSBwYW5lbCBvcGVuZWQgYnkgdGhpcyB0cmlnZ2VyLiAqL1xuICBwcml2YXRlIF9tZW51UG9ydGFsOiBUZW1wbGF0ZVBvcnRhbDtcblxuICAvKiogVGhlIGluamVjdG9yIHRvIHVzZSBmb3IgdGhlIGNoaWxkIG1lbnUgb3BlbmVkIGJ5IHRoaXMgdHJpZ2dlci4gKi9cbiAgcHJpdmF0ZSBfY2hpbGRNZW51SW5qZWN0b3I/OiBJbmplY3RvcjtcblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLl9kZXN0cm95T3ZlcmxheSgpO1xuXG4gICAgdGhpcy5kZXN0cm95ZWQubmV4dCgpO1xuICAgIHRoaXMuZGVzdHJveWVkLmNvbXBsZXRlKCk7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgYXR0YWNoZWQgbWVudSBpcyBvcGVuLiAqL1xuICBpc09wZW4oKSB7XG4gICAgcmV0dXJuICEhdGhpcy5vdmVybGF5UmVmPy5oYXNBdHRhY2hlZCgpO1xuICB9XG5cbiAgLyoqIFJlZ2lzdGVycyBhIGNoaWxkIG1lbnUgYXMgaGF2aW5nIGJlZW4gb3BlbmVkIGJ5IHRoaXMgdHJpZ2dlci4gKi9cbiAgcmVnaXN0ZXJDaGlsZE1lbnUoY2hpbGQ6IE1lbnUpIHtcbiAgICB0aGlzLmNoaWxkTWVudSA9IGNoaWxkO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgcG9ydGFsIHRvIGJlIGF0dGFjaGVkIHRvIHRoZSBvdmVybGF5IHdoaWNoIGNvbnRhaW5zIHRoZSBtZW51LiBBbGxvd3MgZm9yIHRoZSBtZW51XG4gICAqIGNvbnRlbnQgdG8gY2hhbmdlIGR5bmFtaWNhbGx5IGFuZCBiZSByZWZsZWN0ZWQgaW4gdGhlIGFwcGxpY2F0aW9uLlxuICAgKi9cbiAgcHJvdGVjdGVkIGdldE1lbnVDb250ZW50UG9ydGFsKCkge1xuICAgIGNvbnN0IGhhc01lbnVDb250ZW50Q2hhbmdlZCA9IHRoaXMubWVudVRlbXBsYXRlUmVmICE9PSB0aGlzLl9tZW51UG9ydGFsPy50ZW1wbGF0ZVJlZjtcbiAgICBpZiAodGhpcy5tZW51VGVtcGxhdGVSZWYgJiYgKCF0aGlzLl9tZW51UG9ydGFsIHx8IGhhc01lbnVDb250ZW50Q2hhbmdlZCkpIHtcbiAgICAgIHRoaXMuX21lbnVQb3J0YWwgPSBuZXcgVGVtcGxhdGVQb3J0YWwoXG4gICAgICAgIHRoaXMubWVudVRlbXBsYXRlUmVmLFxuICAgICAgICB0aGlzLnZpZXdDb250YWluZXJSZWYsXG4gICAgICAgIHRoaXMubWVudURhdGEsXG4gICAgICAgIHRoaXMuX2dldENoaWxkTWVudUluamVjdG9yKCksXG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9tZW51UG9ydGFsO1xuICB9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIGdpdmVuIGVsZW1lbnQgaXMgaW5zaWRlIHRoZSBzY29wZSBvZiB0aGlzIHRyaWdnZXIncyBtZW51IHN0YWNrLlxuICAgKiBAcGFyYW0gZWxlbWVudCBUaGUgZWxlbWVudCB0byBjaGVjay5cbiAgICogQHJldHVybiBXaGV0aGVyIHRoZSBlbGVtZW50IGlzIGluc2lkZSB0aGUgc2NvcGUgb2YgdGhpcyB0cmlnZ2VyJ3MgbWVudSBzdGFjay5cbiAgICovXG4gIHByb3RlY3RlZCBpc0VsZW1lbnRJbnNpZGVNZW51U3RhY2soZWxlbWVudDogRWxlbWVudCkge1xuICAgIGZvciAobGV0IGVsOiBFbGVtZW50IHwgbnVsbCA9IGVsZW1lbnQ7IGVsOyBlbCA9IGVsPy5wYXJlbnRFbGVtZW50ID8/IG51bGwpIHtcbiAgICAgIGlmIChlbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtY2RrLW1lbnUtc3RhY2staWQnKSA9PT0gdGhpcy5tZW51U3RhY2suaWQpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKiBEZXN0cm95IGFuZCB1bnNldCB0aGUgb3ZlcmxheSByZWZlcmVuY2UgaXQgaWYgZXhpc3RzICovXG4gIHByaXZhdGUgX2Rlc3Ryb3lPdmVybGF5KCkge1xuICAgIGlmICh0aGlzLm92ZXJsYXlSZWYpIHtcbiAgICAgIHRoaXMub3ZlcmxheVJlZi5kaXNwb3NlKCk7XG4gICAgICB0aGlzLm92ZXJsYXlSZWYgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBpbmplY3RvciB0byB1c2Ugd2hlbiBjcmVhdGluZyBhIGNoaWxkIG1lbnUuICovXG4gIHByaXZhdGUgX2dldENoaWxkTWVudUluamVjdG9yKCkge1xuICAgIHRoaXMuX2NoaWxkTWVudUluamVjdG9yID1cbiAgICAgIHRoaXMuX2NoaWxkTWVudUluamVjdG9yIHx8XG4gICAgICBJbmplY3Rvci5jcmVhdGUoe1xuICAgICAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgICB7cHJvdmlkZTogTUVOVV9UUklHR0VSLCB1c2VWYWx1ZTogdGhpc30sXG4gICAgICAgICAge3Byb3ZpZGU6IE1FTlVfU1RBQ0ssIHVzZVZhbHVlOiB0aGlzLm1lbnVTdGFja30sXG4gICAgICAgIF0sXG4gICAgICAgIHBhcmVudDogdGhpcy5pbmplY3RvcixcbiAgICAgIH0pO1xuICAgIHJldHVybiB0aGlzLl9jaGlsZE1lbnVJbmplY3RvcjtcbiAgfVxufVxuIl19