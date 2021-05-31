/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Platform } from '@angular/cdk/platform';
import { BaseOverlayDispatcher } from './base-overlay-dispatcher';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
import * as i2 from "@angular/cdk/platform";
/**
 * Service for dispatching mouse click events that land on the body to appropriate overlay ref,
 * if any. It maintains a list of attached overlays to determine best suited overlay based
 * on event target and order of overlay opens.
 */
export class OverlayOutsideClickDispatcher extends BaseOverlayDispatcher {
    constructor(document, _platform) {
        super(document);
        this._platform = _platform;
        this._cursorStyleIsSet = false;
        /** Click event listener that will be attached to the body propagate phase. */
        this._clickListener = (event) => {
            // Get the target through the `composedPath` if possible to account for shadow DOM.
            const target = event.composedPath ? event.composedPath()[0] : event.target;
            // We copy the array because the original may be modified asynchronously if the
            // outsidePointerEvents listener decides to detach overlays resulting in index errors inside
            // the for loop.
            const overlays = this._attachedOverlays.slice();
            // Dispatch the mouse event to the top overlay which has subscribers to its mouse events.
            // We want to target all overlays for which the click could be considered as outside click.
            // As soon as we reach an overlay for which the click is not outside click we break off
            // the loop.
            for (let i = overlays.length - 1; i > -1; i--) {
                const overlayRef = overlays[i];
                if (overlayRef._outsidePointerEvents.observers.length < 1 || !overlayRef.hasAttached()) {
                    continue;
                }
                // If it's a click inside the overlay, just break - we should do nothing
                // If it's an outside click dispatch the mouse event, and proceed with the next overlay
                if (overlayRef.overlayElement.contains(target)) {
                    break;
                }
                overlayRef._outsidePointerEvents.next(event);
            }
        };
    }
    /** Add a new overlay to the list of attached overlay refs. */
    add(overlayRef) {
        super.add(overlayRef);
        // Safari on iOS does not generate click events for non-interactive
        // elements. However, we want to receive a click for any element outside
        // the overlay. We can force a "clickable" state by setting
        // `cursor: pointer` on the document body. See:
        // https://developer.mozilla.org/en-US/docs/Web/API/Element/click_event#Safari_Mobile
        // https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/HandlingEvents/HandlingEvents.html
        if (!this._isAttached) {
            const body = this._document.body;
            body.addEventListener('click', this._clickListener, true);
            body.addEventListener('auxclick', this._clickListener, true);
            body.addEventListener('contextmenu', this._clickListener, true);
            // click event is not fired on iOS. To make element "clickable" we are
            // setting the cursor to pointer
            if (this._platform.IOS && !this._cursorStyleIsSet) {
                this._cursorOriginalValue = body.style.cursor;
                body.style.cursor = 'pointer';
                this._cursorStyleIsSet = true;
            }
            this._isAttached = true;
        }
    }
    /** Detaches the global keyboard event listener. */
    detach() {
        if (this._isAttached) {
            const body = this._document.body;
            body.removeEventListener('click', this._clickListener, true);
            body.removeEventListener('auxclick', this._clickListener, true);
            body.removeEventListener('contextmenu', this._clickListener, true);
            if (this._platform.IOS && this._cursorStyleIsSet) {
                body.style.cursor = this._cursorOriginalValue;
                this._cursorStyleIsSet = false;
            }
            this._isAttached = false;
        }
    }
}
OverlayOutsideClickDispatcher.ɵprov = i0.ɵɵdefineInjectable({ factory: function OverlayOutsideClickDispatcher_Factory() { return new OverlayOutsideClickDispatcher(i0.ɵɵinject(i1.DOCUMENT), i0.ɵɵinject(i2.Platform)); }, token: OverlayOutsideClickDispatcher, providedIn: "root" });
OverlayOutsideClickDispatcher.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
OverlayOutsideClickDispatcher.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] }] },
    { type: Platform }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3ZlcmxheS1vdXRzaWRlLWNsaWNrLWRpc3BhdGNoZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL292ZXJsYXkvZGlzcGF0Y2hlcnMvb3ZlcmxheS1vdXRzaWRlLWNsaWNrLWRpc3BhdGNoZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQ3pDLE9BQU8sRUFBQyxNQUFNLEVBQUUsVUFBVSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRWpELE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUMvQyxPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSwyQkFBMkIsQ0FBQzs7OztBQUVoRTs7OztHQUlHO0FBRUgsTUFBTSxPQUFPLDZCQUE4QixTQUFRLHFCQUFxQjtJQUl0RSxZQUE4QixRQUFhLEVBQVUsU0FBbUI7UUFDdEUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRG1DLGNBQVMsR0FBVCxTQUFTLENBQVU7UUFGaEUsc0JBQWlCLEdBQUcsS0FBSyxDQUFDO1FBaURsQyw4RUFBOEU7UUFDdEUsbUJBQWMsR0FBRyxDQUFDLEtBQWlCLEVBQUUsRUFBRTtZQUM3QyxtRkFBbUY7WUFDbkYsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO1lBQzNFLCtFQUErRTtZQUMvRSw0RkFBNEY7WUFDNUYsZ0JBQWdCO1lBQ2hCLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUVoRCx5RkFBeUY7WUFDekYsMkZBQTJGO1lBQzNGLHVGQUF1RjtZQUN2RixZQUFZO1lBQ1osS0FBSyxJ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UUFBUSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtJbmplY3QsIEluamVjdGFibGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtPdmVybGF5UmVmZXJlbmNlfSBmcm9tICcuLi9vdmVybGF5LXJlZmVyZW5jZSc7XG5pbXBvcnQge1BsYXRmb3JtfSBmcm9tICdAYW5ndWxhci9jZGsvcGxhdGZvcm0nO1xuaW1wb3J0IHtCYXNlT3ZlcmxheURpc3BhdGNoZXJ9IGZyb20gJy4vYmFzZS1vdmVybGF5LWRpc3BhdGNoZXInO1xuXG4vKipcbiAqIFNlcnZpY2UgZm9yIGRpc3BhdGNoaW5nIG1vdXNlIGNsaWNrIGV2ZW50cyB0aGF0IGxhbmQgb24gdGhlIGJvZHkgdG8gYXBwcm9wcmlhdGUgb3ZlcmxheSByZWYsXG4gKiBpZiBhbnkuIEl0IG1haW50YWlucyBhIGxpc3Qgb2YgYXR0YWNoZWQgb3ZlcmxheXMgdG8gZGV0ZXJtaW5lIGJlc3Qgc3VpdGVkIG92ZXJsYXkgYmFzZWRcbiAqIG9uIGV2ZW50IHRhcmdldCBhbmQgb3JkZXIgb2Ygb3ZlcmxheSBvcGVucy5cbiAqL1xuQEluamVjdGFibGUoe3Byb3ZpZGVkSW46ICdyb290J30pXG5leHBvcnQgY2xhc3MgT3ZlcmxheU91dHNpZGVDbGlja0Rpc3BhdGNoZXIgZXh0ZW5kcyBCYXNlT3ZlcmxheURpc3BhdGNoZXIge1xuICBwcml2YXRlIF9jdXJzb3JPcmlnaW5hbFZhbHVlOiBzdHJpbmc7XG4gIHByaXZhdGUgX2N1cnNvclN0eWxlSXNTZXQgPSBmYWxzZTtcblxuICBjb25zdHJ1Y3RvcihASW5qZWN0KERPQ1VNRU5UKSBkb2N1bWVudDogYW55LCBwcml2YXRlIF9wbGF0Zm9ybTogUGxhdGZvcm0pIHtcbiAgICBzdXBlcihkb2N1bWVudCk7XG4gIH1cblxuICAvKiogQWRkIGEgbmV3IG92ZXJsYXkgdG8gdGhlIGxpc3Qgb2YgYXR0YWNoZWQgb3ZlcmxheSByZWZzLiAqL1xuICBhZGQob3ZlcmxheVJlZjogT3ZlcmxheVJlZmVyZW5jZSk6IHZvaWQge1xuICAgIHN1cGVyLmFkZChvdmVybGF5UmVmKTtcblxuICAgIC8vIFNhZmFyaSBvbiBpT1MgZG9lcyBub3QgZ2VuZXJhdGUgY2xpY2sgZXZlbnRzIGZvciBub24taW50ZXJhY3RpdmVcbiAgICAvLyBlbGVtZW50cy4gSG93ZXZlciwgd2Ugd2FudCB0byByZWNlaXZlIGEgY2xpY2sgZm9yIGFueSBlbGVtZW50IG91dHNpZGVcbiAgICAvLyB0aGUgb3ZlcmxheS4gV2UgY2FuIGZvcmNlIGEgXCJjbGlja2FibGVcIiBzdGF0ZSBieSBzZXR0aW5nXG4gICAgLy8gYGN1cnNvcjogcG9pbnRlcmAgb24gdGhlIGRvY3VtZW50IGJvZHkuIFNlZTpcbiAgICAvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvRWxlbWVudC9jbGlja19ldmVudCNTYWZhcmlfTW9iaWxlXG4gICAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIuYXBwbGUuY29tL2xpYnJhcnkvYXJjaGl2ZS9kb2N1bWVudGF0aW9uL0FwcGxlQXBwbGljYXRpb25zL1JlZmVyZW5jZS9TYWZhcmlXZWJDb250ZW50L0hhbmRsaW5nRXZlbnRzL0hhbmRsaW5nRXZlbnRzLmh0bWxcbiAgICBpZiAoIXRoaXMuX2lzQXR0YWNoZWQpIHtcbiAgICAgIGNvbnN0IGJvZHkgPSB0aGlzLl9kb2N1bWVudC5ib2R5O1xuICAgICAgYm9keS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2NsaWNrTGlzdGVuZXIsIHRydWUpO1xuICAgICAgYm9keS5hZGRFdmVudExpc3RlbmVyKCdhdXhjbGljaycsIHRoaXMuX2NsaWNrTGlzdGVuZXIsIHRydWUpO1xuICAgICAgYm9keS5hZGRFdmVudExpc3RlbmVyKCdjb250ZXh0bWVudScsIHRoaXMuX2NsaWNrTGlzdGVuZXIsIHRydWUpO1xuXG4gICAgICAvLyBjbGljayBldmVudCBpcyBub3QgZmlyZWQgb24gaU9TLiBUbyBtYWtlIGVsZW1lbnQgXCJjbGlja2FibGVcIiB3ZSBhcmVcbiAgICAgIC8vIHNldHRpbmcgdGhlIGN1cnNvciB0byBwb2ludGVyXG4gICAgICBpZiAodGhpcy5fcGxhdGZvcm0uSU9TICYmICF0aGlzLl9jdXJzb3JTdHlsZUlzU2V0KSB7XG4gICAgICAgIHRoaXMuX2N1cnNvck9yaWdpbmFsVmFsdWUgPSBib2R5LnN0eWxlLmN1cnNvcjtcbiAgICAgICAgYm9keS5zdHlsZS5jdXJzb3IgPSAncG9pbnRlcic7XG4gICAgICAgIHRoaXMuX2N1cnNvclN0eWxlSXNTZXQgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9pc0F0dGFjaGVkID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICAvKiogRGV0YWNoZXMgdGhlIGdsb2JhbCBrZXlib2FyZCBldmVudCBsaXN0ZW5lci4gKi9cbiAgcHJvdGVjdGVkIGRldGFjaCgpIHtcbiAgICBpZiAodGhpcy5faXNBdHRhY2hlZCkge1xuICAgICAgY29uc3QgYm9keSA9IHRoaXMuX2RvY3VtZW50LmJvZHk7XG4gICAgICBib2R5LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5fY2xpY2tMaXN0ZW5lciwgdHJ1ZSk7XG4gICAgICBib2R5LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2F1eGNsaWNrJywgdGhpcy5fY2xpY2tMaXN0ZW5lciwgdHJ1ZSk7XG4gICAgICBib2R5LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NvbnRleHRtZW51JywgdGhpcy5fY2xpY2tMaXN0ZW5lciwgdHJ1ZSk7XG4gICAgICBpZiAodGhpcy5fcGxhdGZvcm0uSU9TICYmIHRoaXMuX2N1cnNvclN0eWxlSXNTZXQpIHtcbiAgICAgICAgYm9keS5zdHlsZS5jdXJzb3IgPSB0aGlzLl9jdXJzb3JPcmlnaW5hbFZhbHVlO1xuICAgICAgICB0aGlzLl9jdXJzb3JTdHlsZUlzU2V0ID0gZmFsc2U7XG4gICAgICB9XG4gICAgICB0aGlzLl9pc0F0dGFjaGVkID0gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgLyoqIENsaWNrIGV2ZW50IGxpc3RlbmVyIHRoYXQgd2lsbCBiZSBhdHRhY2hlZCB0byB0aGUgYm9keSBwcm9wYWdhdGUgcGhhc2UuICovXG4gIHByaXZhdGUgX2NsaWNrTGlzdGVuZXIgPSAoZXZlbnQ6IE1vdXNlRXZlbnQpID0+IHtcbiAgICAvLyBHZXQgdGhlIHRhcmdldCB0aHJvdWdoIHRoZSBgY29tcG9zZWRQYXRoYCBpZiBwb3NzaWJsZSB0byBhY2NvdW50IGZvciBzaGFkb3cgRE9NLlxuICAgIGNvbnN0IHRhcmdldCA9IGV2ZW50LmNvbXBvc2VkUGF0aCA/IGV2ZW50LmNvbXBvc2VkUGF0aCgpWzBdIDogZXZlbnQudGFyZ2V0O1xuICAgIC8vIFdlIGNvcHkgdGhlIGFycmF5IGJlY2F1c2UgdGhlIG9yaWdpbmFsIG1heSBiZSBtb2RpZmllZCBhc3luY2hyb25vdXNseSBpZiB0aGVcbiAgICAvLyBvdXRzaWRlUG9pbnRlckV2ZW50cyBsaXN0ZW5lciBkZWNpZGVzIHRvIGRldGFjaCBvdmVybGF5cyByZXN1bHRpbmcgaW4gaW5kZXggZXJyb3JzIGluc2lkZVxuICAgIC8vIHRoZSBmb3IgbG9vcC5cbiAgICBjb25zdCBvdmVybGF5cyA9IHRoaXMuX2F0dGFjaGVkT3ZlcmxheXMuc2xpY2UoKTtcblxuICAgIC8vIERpc3BhdGNoIHRoZSBtb3VzZSBldmVudCB0byB0aGUgdG9wIG92ZXJsYXkgd2hpY2ggaGFzIHN1YnNjcmliZXJzIHRvIGl0cyBtb3VzZSBldmVudHMuXG4gICAgLy8gV2Ugd2FudCB0byB0YXJnZXQgYWxsIG92ZXJsYXlzIGZvciB3aGljaCB0aGUgY2xpY2sgY291bGQgYmUgY29uc2lkZXJlZCBhcyBvdXRzaWRlIGNsaWNrLlxuICAgIC8vIEFzIHNvb24gYXMgd2UgcmVhY2ggYW4gb3ZlcmxheSBmb3Igd2hpY2ggdGhlIGNsaWNrIGlzIG5vdCBvdXRzaWRlIGNsaWNrIHdlIGJyZWFrIG9mZlxuICAgIC8vIHRoZSBsb29wLlxuICAgIGZvciAobGV0IGkgPSBvdmVybGF5cy5sZW5ndGggLSAxOyBpID4gLTE7IGktLSkge1xuICAgICAgY29uc3Qgb3ZlcmxheVJlZiA9IG92ZXJsYXlzW2ldO1xuICAgICAgaWYgKG92ZXJsYXlSZWYuX291dHNpZGVQb2ludGVyRXZlbnRzLm9ic2VydmVycy5sZW5ndGggPCAxIHx8ICFvdmVybGF5UmVmLmhhc0F0dGFjaGVkKCkpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIElmIGl0J3MgYSBjbGljayBpbnNpZGUgdGhlIG92ZXJsYXksIGp1c3QgYnJlYWsgLSB3ZSBzaG91bGQgZG8gbm90aGluZ1xuICAgICAgLy8gSWYgaXQncyBhbiBvdXRzaWRlIGNsaWNrIGRpc3BhdGNoIHRoZSBtb3VzZSBldmVudCwgYW5kIHByb2NlZWQgd2l0aCB0aGUgbmV4dCBvdmVybGF5XG4gICAgICBpZiAob3ZlcmxheVJlZi5vdmVybGF5RWxlbWVudC5jb250YWlucyh0YXJnZXQgYXMgTm9kZSkpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIG92ZXJsYXlSZWYuX291dHNpZGVQb2ludGVyRXZlbnRzLm5leHQoZXZlbnQpO1xuICAgIH1cbiAgfVxufVxuIl19