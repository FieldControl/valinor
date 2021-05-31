/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { DomPortalOutlet, TemplatePortal } from '@angular/cdk/portal';
import { DOCUMENT } from '@angular/common';
import { ApplicationRef, ChangeDetectorRef, ComponentFactoryResolver, Directive, Inject, InjectionToken, Injector, TemplateRef, ViewContainerRef, } from '@angular/core';
import { Subject } from 'rxjs';
/**
 * Injection token that can be used to reference instances of `MatMenuContent`. It serves
 * as alternative token to the actual `MatMenuContent` class which could cause unnecessary
 * retention of the class and its directive metadata.
 */
export const MAT_MENU_CONTENT = new InjectionToken('MatMenuContent');
/**
 * Menu content that will be rendered lazily once the menu is opened.
 */
export class MatMenuContent {
    constructor(_template, _componentFactoryResolver, _appRef, _injector, _viewContainerRef, _document, _changeDetectorRef) {
        this._template = _template;
        this._componentFactoryResolver = _componentFactoryResolver;
        this._appRef = _appRef;
        this._injector = _injector;
        this._viewContainerRef = _viewContainerRef;
        this._document = _document;
        this._changeDetectorRef = _changeDetectorRef;
        /** Emits when the menu content has been attached. */
        this._attached = new Subject();
    }
    /**
     * Attaches the content with a particular context.
     * @docs-private
     */
    attach(context = {}) {
        if (!this._portal) {
            this._portal = new TemplatePortal(this._template, this._viewContainerRef);
        }
        this.detach();
        if (!this._outlet) {
            this._outlet = new DomPortalOutlet(this._document.createElement('div'), this._componentFactoryResolver, this._appRef, this._injector);
        }
        const element = this._template.elementRef.nativeElement;
        // Because we support opening the same menu from different triggers (which in turn have their
        // own `OverlayRef` panel), we have to re-insert the host element every time, otherwise we
        // risk it staying attached to a pane that's no longer in the DOM.
        element.parentNode.insertBefore(this._outlet.outletElement, element);
        // When `MatMenuContent` is used in an `OnPush` component, the insertion of the menu
        // content via `createEmbeddedView` does not cause the content to be seen as "dirty"
        // by Angular. This causes the `@ContentChildren` for menu items within the menu to
        // not be updated by Angular. By explicitly marking for check here, we tell Angular that
        // it needs to check for new menu items and update the `@ContentChild` in `MatMenu`.
        // @breaking-change 9.0.0 Make change detector ref required
        if (this._changeDetectorRef) {
            this._changeDetectorRef.markForCheck();
        }
        this._portal.attach(this._outlet, context);
        this._attached.next();
    }
    /**
     * Detaches the content.
     * @docs-private
     */
    detach() {
        if (this._portal.isAttached) {
            this._portal.detach();
        }
    }
    ngOnDestroy() {
        if (this._outlet) {
            this._outlet.dispose();
        }
    }
}
MatMenuContent.decorators = [
    { type: Directive, args: [{
                selector: 'ng-template[matMenuContent]',
                providers: [{ provide: MAT_MENU_CONTENT, useExisting: MatMenuContent }],
            },] }
];
MatMenuContent.ctorParameters = () => [
    { type: TemplateRef },
    { type: ComponentFactoryResolver },
    { type: ApplicationRef },
    { type: Injector },
    { type: ViewContainerRef },
    { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] }] },
    { type: ChangeDetectorRef }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1jb250ZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL21lbnUvbWVudS1jb250ZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxlQUFlLEVBQUUsY0FBYyxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDcEUsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQ3pDLE9BQU8sRUFDTCxjQUFjLEVBQ2QsaUJBQWlCLEVBQ2pCLHdCQUF3QixFQUN4QixTQUFTLEVBQ1QsTUFBTSxFQUNOLGNBQWMsRUFDZCxRQUFRLEVBRVIsV0FBVyxFQUNYLGdCQUFnQixHQUNqQixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBRTdCOzs7O0dBSUc7QUFDSCxNQUFNLENBQUMsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLGNBQWMsQ0FBaUIsZ0JBQWdCLENBQUMsQ0FBQztBQUVyRjs7R0FFRztBQUtILE1BQU0sT0FBTyxjQUFjO0lBT3pCLFlBQ1UsU0FBMkIsRUFDM0IseUJBQW1ELEVBQ25ELE9BQXVCLEVBQ3ZCLFNBQW1CLEVBQ25CLGlCQUFtQyxFQUNqQixTQUFjLEVBQ2hDLGtCQUFzQztRQU50QyxjQUFTLEdBQVQsU0FBUyxDQUFrQjtRQUMzQiw4QkFBeUIsR0FBekIseUJBQXlCLENBQTBCO1FBQ25ELFlBQU8sR0FBUCxPQUFPLENBQWdCO1FBQ3ZCLGNBQVMsR0FBVCxTQUFTLENBQVU7UUFDbkIsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFrQjtRQUNqQixjQUFTLEdBQVQsU0FBUyxDQUFLO1FBQ2hDLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBb0I7UUFWaEQscURBQXFEO1FBQzVDLGNBQVMsR0FBRyxJQUFJLE9BQU8sRUFBUSxDQUFDO0lBU1UsQ0FBQztJQUVwRDs7O09BR0c7SUFDSCxNQUFNLENBQUMsVUFBZSxFQUFFO1FBQ3RCLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ2pCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxjQUFjLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztTQUMzRTtRQUVELElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUVkLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ2pCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxlQUFlLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLEVBQ2xFLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUNuRTtRQUVELE1BQU0sT0FBTyxHQUFnQixJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUM7UUFFckUsNkZBQTZGO1FBQzdGLDBGQUEwRjtRQUMxRixrRUFBa0U7UUFDbEUsT0FBTyxDQUFDLFVBQVcsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFFdEUsb0ZBQW9GO1FBQ3BGLG9GQUFvRjtRQUNwRixtRkFBbUY7UUFDbkYsd0ZBQXdGO1FBQ3hGLG9GQUFvRjtRQUNwRiwyREFBMkQ7UUFDM0QsSUFBSSxJQUFJLENBQUMsa0JBQWtCLEVBQUU7WUFDM0IsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFlBQVksRUFBRSxDQUFDO1NBQ3hDO1FBRUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUMzQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ3hCLENBQUM7SUFFRDs7O09BR0c7SUFDSCxNQUFNO1FBQ0osSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRTtZQUMzQixJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO1NBQ3ZCO0lBQ0gsQ0FBQztJQUVELFdBQVc7UUFDVCxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDaEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztTQUN4QjtJQUNILENBQUM7OztZQXZFRixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLDZCQUE2QjtnQkFDdkMsU0FBUyxFQUFFLENBQUMsRUFBQyxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsV0FBVyxFQUFFLGNBQWMsRUFBQyxDQUFDO2FBQ3RFOzs7WUFsQkMsV0FBVztZQU5YLHdCQUF3QjtZQUZ4QixjQUFjO1lBTWQsUUFBUTtZQUdSLGdCQUFnQjs0Q0ErQmIsTUFBTSxTQUFDLFFBQVE7WUF2Q2xCLGlCQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RvbVBvcnRhbE91dGxldCwgVGVtcGxhdGVQb3J0YWx9IGZyb20gJ0Bhbmd1bGFyL2Nkay9wb3J0YWwnO1xuaW1wb3J0IHtET0NVTUVOVH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7XG4gIEFwcGxpY2F0aW9uUmVmLFxuICBDaGFuZ2VEZXRlY3RvclJlZixcbiAgQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyLFxuICBEaXJlY3RpdmUsXG4gIEluamVjdCxcbiAgSW5qZWN0aW9uVG9rZW4sXG4gIEluamVjdG9yLFxuICBPbkRlc3Ryb3ksXG4gIFRlbXBsYXRlUmVmLFxuICBWaWV3Q29udGFpbmVyUmVmLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7U3ViamVjdH0gZnJvbSAncnhqcyc7XG5cbi8qKlxuICogSW5qZWN0aW9uIHRva2VuIHRoYXQgY2FuIGJlIHVzZWQgdG8gcmVmZXJlbmNlIGluc3RhbmNlcyBvZiBgTWF0TWVudUNvbnRlbnRgLiBJdCBzZXJ2ZXNcbiAqIGFzIGFsdGVybmF0aXZlIHRva2VuIHRvIHRoZSBhY3R1YWwgYE1hdE1lbnVDb250ZW50YCBjbGFzcyB3aGljaCBjb3VsZCBjYXVzZSB1bm5lY2Vzc2FyeVxuICogcmV0ZW50aW9uIG9mIHRoZSBjbGFzcyBhbmQgaXRzIGRpcmVjdGl2ZSBtZXRhZGF0YS5cbiAqL1xuZXhwb3J0IGNvbnN0IE1BVF9NRU5VX0NPTlRFTlQgPSBuZXcgSW5qZWN0aW9uVG9rZW48TWF0TWVudUNvbnRlbnQ+KCdNYXRNZW51Q29udGVudCcpO1xuXG4vKipcbiAqIE1lbnUgY29udGVudCB0aGF0IHdpbGwgYmUgcmVuZGVyZWQgbGF6aWx5IG9uY2UgdGhlIG1lbnUgaXMgb3BlbmVkLlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICduZy10ZW1wbGF0ZVttYXRNZW51Q29udGVudF0nLFxuICBwcm92aWRlcnM6IFt7cHJvdmlkZTogTUFUX01FTlVfQ09OVEVOVCwgdXNlRXhpc3Rpbmc6IE1hdE1lbnVDb250ZW50fV0sXG59KVxuZXhwb3J0IGNsYXNzIE1hdE1lbnVDb250ZW50IGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgcHJpdmF0ZSBfcG9ydGFsOiBUZW1wbGF0ZVBvcnRhbDxhbnk+O1xuICBwcml2YXRlIF9vdXRsZXQ6IERvbVBvcnRhbE91dGxldDtcblxuICAvKiogRW1pdHMgd2hlbiB0aGUgbWVudSBjb250ZW50IGhhcyBiZWVuIGF0dGFjaGVkLiAqL1xuICByZWFkb25seSBfYXR0YWNoZWQgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgX3RlbXBsYXRlOiBUZW1wbGF0ZVJlZjxhbnk+LFxuICAgIHByaXZhdGUgX2NvbXBvbmVudEZhY3RvcnlSZXNvbHZlcjogQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyLFxuICAgIHByaXZhdGUgX2FwcFJlZjogQXBwbGljYXRpb25SZWYsXG4gICAgcHJpdmF0ZSBfaW5qZWN0b3I6IEluamVjdG9yLFxuICAgIHByaXZhdGUgX3ZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWYsXG4gICAgQEluamVjdChET0NVTUVOVCkgcHJpdmF0ZSBfZG9jdW1lbnQ6IGFueSxcbiAgICBwcml2YXRlIF9jaGFuZ2VEZXRlY3RvclJlZj86IENoYW5nZURldGVjdG9yUmVmKSB7fVxuXG4gIC8qKlxuICAgKiBBdHRhY2hlcyB0aGUgY29udGVudCB3aXRoIGEgcGFydGljdWxhciBjb250ZXh0LlxuICAgKiBAZG9jcy1wcml2YXRlXG4gICAqL1xuICBhdHRhY2goY29udGV4dDogYW55ID0ge30pIHtcbiAgICBpZiAoIXRoaXMuX3BvcnRhbCkge1xuICAgICAgdGhpcy5fcG9ydGFsID0gbmV3IFRlbXBsYXRlUG9ydGFsKHRoaXMuX3RlbXBsYXRlLCB0aGlzLl92aWV3Q29udGFpbmVyUmVmKTtcbiAgICB9XG5cbiAgICB0aGlzLmRldGFjaCgpO1xuXG4gICAgaWYgKCF0aGlzLl9vdXRsZXQpIHtcbiAgICAgIHRoaXMuX291dGxldCA9IG5ldyBEb21Qb3J0YWxPdXRsZXQodGhpcy5fZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JyksXG4gICAgICAgICAgdGhpcy5fY29tcG9uZW50RmFjdG9yeVJlc29sdmVyLCB0aGlzLl9hcHBSZWYsIHRoaXMuX2luamVjdG9yKTtcbiAgICB9XG5cbiAgICBjb25zdCBlbGVtZW50OiBIVE1MRWxlbWVudCA9IHRoaXMuX3RlbXBsYXRlLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudDtcblxuICAgIC8vIEJlY2F1c2Ugd2Ugc3VwcG9ydCBvcGVuaW5nIHRoZSBzYW1lIG1lbnUgZnJvbSBkaWZmZXJlbnQgdHJpZ2dlcnMgKHdoaWNoIGluIHR1cm4gaGF2ZSB0aGVpclxuICAgIC8vIG93biBgT3ZlcmxheVJlZmAgcGFuZWwpLCB3ZSBoYXZlIHRvIHJlLWluc2VydCB0aGUgaG9zdCBlbGVtZW50IGV2ZXJ5IHRpbWUsIG90aGVyd2lzZSB3ZVxuICAgIC8vIHJpc2sgaXQgc3RheWluZyBhdHRhY2hlZCB0byBhIHBhbmUgdGhhdCdzIG5vIGxvbmdlciBpbiB0aGUgRE9NLlxuICAgIGVsZW1lbnQucGFyZW50Tm9kZSEuaW5zZXJ0QmVmb3JlKHRoaXMuX291dGxldC5vdXRsZXRFbGVtZW50LCBlbGVtZW50KTtcblxuICAgIC8vIFdoZW4gYE1hdE1lbnVDb250ZW50YCBpcyB1c2VkIGluIGFuIGBPblB1c2hgIGNvbXBvbmVudCwgdGhlIGluc2VydGlvbiBvZiB0aGUgbWVudVxuICAgIC8vIGNvbnRlbnQgdmlhIGBjcmVhdGVFbWJlZGRlZFZpZXdgIGRvZXMgbm90IGNhdXNlIHRoZSBjb250ZW50IHRvIGJlIHNlZW4gYXMgXCJkaXJ0eVwiXG4gICAgLy8gYnkgQW5ndWxhci4gVGhpcyBjYXVzZXMgdGhlIGBAQ29udGVudENoaWxkcmVuYCBmb3IgbWVudSBpdGVtcyB3aXRoaW4gdGhlIG1lbnUgdG9cbiAgICAvLyBub3QgYmUgdXBkYXRlZCBieSBBbmd1bGFyLiBCeSBleHBsaWNpdGx5IG1hcmtpbmcgZm9yIGNoZWNrIGhlcmUsIHdlIHRlbGwgQW5ndWxhciB0aGF0XG4gICAgLy8gaXQgbmVlZHMgdG8gY2hlY2sgZm9yIG5ldyBtZW51IGl0ZW1zIGFuZCB1cGRhdGUgdGhlIGBAQ29udGVudENoaWxkYCBpbiBgTWF0TWVudWAuXG4gICAgLy8gQGJyZWFraW5nLWNoYW5nZSA5LjAuMCBNYWtlIGNoYW5nZSBkZXRlY3RvciByZWYgcmVxdWlyZWRcbiAgICBpZiAodGhpcy5fY2hhbmdlRGV0ZWN0b3JSZWYpIHtcbiAgICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpO1xuICAgIH1cblxuICAgIHRoaXMuX3BvcnRhbC5hdHRhY2godGhpcy5fb3V0bGV0LCBjb250ZXh0KTtcbiAgICB0aGlzLl9hdHRhY2hlZC5uZXh0KCk7XG4gIH1cblxuICAvKipcbiAgICogRGV0YWNoZXMgdGhlIGNvbnRlbnQuXG4gICAqIEBkb2NzLXByaXZhdGVcbiAgICovXG4gIGRldGFjaCgpIHtcbiAgICBpZiAodGhpcy5fcG9ydGFsLmlzQXR0YWNoZWQpIHtcbiAgICAgIHRoaXMuX3BvcnRhbC5kZXRhY2goKTtcbiAgICB9XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICBpZiAodGhpcy5fb3V0bGV0KSB7XG4gICAgICB0aGlzLl9vdXRsZXQuZGlzcG9zZSgpO1xuICAgIH1cbiAgfVxufVxuIl19