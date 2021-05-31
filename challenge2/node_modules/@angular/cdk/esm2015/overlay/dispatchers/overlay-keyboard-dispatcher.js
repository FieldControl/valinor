/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { BaseOverlayDispatcher } from './base-overlay-dispatcher';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
/**
 * Service for dispatching keyboard events that land on the body to appropriate overlay ref,
 * if any. It maintains a list of attached overlays to determine best suited overlay based
 * on event target and order of overlay opens.
 */
export class OverlayKeyboardDispatcher extends BaseOverlayDispatcher {
    constructor(document) {
        super(document);
        /** Keyboard event listener that will be attached to the body. */
        this._keydownListener = (event) => {
            const overlays = this._attachedOverlays;
            for (let i = overlays.length - 1; i > -1; i--) {
                // Dispatch the keydown event to the top overlay which has subscribers to its keydown events.
                // We want to target the most recent overlay, rather than trying to match where the event came
                // from, because some components might open an overlay, but keep focus on a trigger element
                // (e.g. for select and autocomplete). We skip overlays without keydown event subscriptions,
                // because we don't want overlays that don't handle keyboard events to block the ones below
                // them that do.
                if (overlays[i]._keydownEvents.observers.length > 0) {
                    overlays[i]._keydownEvents.next(event);
                    break;
                }
            }
        };
    }
    /** Add a new overlay to the list of attached overlay refs. */
    add(overlayRef) {
        super.add(overlayRef);
        // Lazily start dispatcher once first overlay is added
        if (!this._isAttached) {
            this._document.body.addEventListener('keydown', this._keydownListener);
            this._isAttached = true;
        }
    }
    /** Detaches the global keyboard event listener. */
    detach() {
        if (this._isAttached) {
            this._document.body.removeEventListener('keydown', this._keydownListener);
            this._isAttached = false;
        }
    }
}
OverlayKeyboardDispatcher.ɵprov = i0.ɵɵdefineInjectable({ factory: function OverlayKeyboardDispatcher_Factory() { return new OverlayKeyboardDispatcher(i0.ɵɵinject(i1.DOCUMENT)); }, token: OverlayKeyboardDispatcher, providedIn: "root" });
OverlayKeyboardDispatcher.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
OverlayKeyboardDispatcher.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] }] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3ZlcmxheS1rZXlib2FyZC1kaXNwYXRjaGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9vdmVybGF5L2Rpc3BhdGNoZXJzL292ZXJsYXkta2V5Ym9hcmQtZGlzcGF0Y2hlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDekMsT0FBTyxFQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFakQsT0FBTyxFQUFDLHFCQUFxQixFQUFDLE1BQU0sMkJBQTJCLENBQUM7OztBQUdoRTs7OztHQUlHO0FBRUgsTUFBTSxPQUFPLHlCQUEwQixTQUFRLHFCQUFxQjtJQUVsRSxZQUE4QixRQUFhO1FBQ3pDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztRQXNCbEIsaUVBQWlFO1FBQ3pELHFCQUFnQixHQUFHLENBQUMsS0FBb0IsRUFBRSxFQUFFO1lBQ2xELE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztZQUV4QyxLQUFLLElBQUksQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDN0MsNkZBQTZGO2dCQUM3Riw4RkFBOEY7Z0JBQzlGLDJGQUEyRjtnQkFDM0YsNEZBQTRGO2dCQUM1RiwyRkFBMkY7Z0JBQzNGLGdCQUFnQjtnQkFDaEIsSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO29CQUNuRCxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDdkMsTUFBTTtpQkFDUDthQUNGO1FBQ0gsQ0FBQyxDQUFBO0lBckNELENBQUM7SUFFRCw4REFBOEQ7SUFDOUQsR0FBRyxDQUFDLFVBQTRCO1FBQzlCLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFdEIsc0RBQXNEO1FBQ3RELElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ3JCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUN2RSxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztTQUN6QjtJQUNILENBQUM7SUFFRCxtREFBbUQ7SUFDekMsTUFBTTtRQUNkLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRTtZQUNwQixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDMUUsSUFBSSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7U0FDMUI7SUFDSCxDQUFDOzs7O1lBeEJGLFVBQVUsU0FBQyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUM7Ozs0Q0FHakIsTUFBTSxTQUFDLFFBQVEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtET0NVTUVOVH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7SW5qZWN0LCBJbmplY3RhYmxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7T3ZlcmxheVJlZmVyZW5jZX0gZnJvbSAnLi4vb3ZlcmxheS1yZWZlcmVuY2UnO1xuaW1wb3J0IHtCYXNlT3ZlcmxheURpc3BhdGNoZXJ9IGZyb20gJy4vYmFzZS1vdmVybGF5LWRpc3BhdGNoZXInO1xuXG5cbi8qKlxuICogU2VydmljZSBmb3IgZGlzcGF0Y2hpbmcga2V5Ym9hcmQgZXZlbnRzIHRoYXQgbGFuZCBvbiB0aGUgYm9keSB0byBhcHByb3ByaWF0ZSBvdmVybGF5IHJlZixcbiAqIGlmIGFueS4gSXQgbWFpbnRhaW5zIGEgbGlzdCBvZiBhdHRhY2hlZCBvdmVybGF5cyB0byBkZXRlcm1pbmUgYmVzdCBzdWl0ZWQgb3ZlcmxheSBiYXNlZFxuICogb24gZXZlbnQgdGFyZ2V0IGFuZCBvcmRlciBvZiBvdmVybGF5IG9wZW5zLlxuICovXG5ASW5qZWN0YWJsZSh7cHJvdmlkZWRJbjogJ3Jvb3QnfSlcbmV4cG9ydCBjbGFzcyBPdmVybGF5S2V5Ym9hcmREaXNwYXRjaGVyIGV4dGVuZHMgQmFzZU92ZXJsYXlEaXNwYXRjaGVyIHtcblxuICBjb25zdHJ1Y3RvcihASW5qZWN0KERPQ1VNRU5UKSBkb2N1bWVudDogYW55KSB7XG4gICAgc3VwZXIoZG9jdW1lbnQpO1xuICB9XG5cbiAgLyoqIEFkZCBhIG5ldyBvdmVybGF5IHRvIHRoZSBsaXN0IG9mIGF0dGFjaGVkIG92ZXJsYXkgcmVmcy4gKi9cbiAgYWRkKG92ZXJsYXlSZWY6IE92ZXJsYXlSZWZlcmVuY2UpOiB2b2lkIHtcbiAgICBzdXBlci5hZGQob3ZlcmxheVJlZik7XG5cbiAgICAvLyBMYXppbHkgc3RhcnQgZGlzcGF0Y2hlciBvbmNlIGZpcnN0IG92ZXJsYXkgaXMgYWRkZWRcbiAgICBpZiAoIXRoaXMuX2lzQXR0YWNoZWQpIHtcbiAgICAgIHRoaXMuX2RvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuX2tleWRvd25MaXN0ZW5lcik7XG4gICAgICB0aGlzLl9pc0F0dGFjaGVkID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICAvKiogRGV0YWNoZXMgdGhlIGdsb2JhbCBrZXlib2FyZCBldmVudCBsaXN0ZW5lci4gKi9cbiAgcHJvdGVjdGVkIGRldGFjaCgpIHtcbiAgICBpZiAodGhpcy5faXNBdHRhY2hlZCkge1xuICAgICAgdGhpcy5fZG9jdW1lbnQuYm9keS5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5fa2V5ZG93bkxpc3RlbmVyKTtcbiAgICAgIHRoaXMuX2lzQXR0YWNoZWQgPSBmYWxzZTtcbiAgICB9XG4gIH1cblxuICAvKiogS2V5Ym9hcmQgZXZlbnQgbGlzdGVuZXIgdGhhdCB3aWxsIGJlIGF0dGFjaGVkIHRvIHRoZSBib2R5LiAqL1xuICBwcml2YXRlIF9rZXlkb3duTGlzdGVuZXIgPSAoZXZlbnQ6IEtleWJvYXJkRXZlbnQpID0+IHtcbiAgICBjb25zdCBvdmVybGF5cyA9IHRoaXMuX2F0dGFjaGVkT3ZlcmxheXM7XG5cbiAgICBmb3IgKGxldCBpID0gb3ZlcmxheXMubGVuZ3RoIC0gMTsgaSA+IC0xOyBpLS0pIHtcbiAgICAgIC8vIERpc3BhdGNoIHRoZSBrZXlkb3duIGV2ZW50IHRvIHRoZSB0b3Agb3ZlcmxheSB3aGljaCBoYXMgc3Vic2NyaWJlcnMgdG8gaXRzIGtleWRvd24gZXZlbnRzLlxuICAgICAgLy8gV2Ugd2FudCB0byB0YXJnZXQgdGhlIG1vc3QgcmVjZW50IG92ZXJsYXksIHJhdGhlciB0aGFuIHRyeWluZyB0byBtYXRjaCB3aGVyZSB0aGUgZXZlbnQgY2FtZVxuICAgICAgLy8gZnJvbSwgYmVjYXVzZSBzb21lIGNvbXBvbmVudHMgbWlnaHQgb3BlbiBhbiBvdmVybGF5LCBidXQga2VlcCBmb2N1cyBvbiBhIHRyaWdnZXIgZWxlbWVudFxuICAgICAgLy8gKGUuZy4gZm9yIHNlbGVjdCBhbmQgYXV0b2NvbXBsZXRlKS4gV2Ugc2tpcCBvdmVybGF5cyB3aXRob3V0IGtleWRvd24gZXZlbnQgc3Vic2NyaXB0aW9ucyxcbiAgICAgIC8vIGJlY2F1c2Ugd2UgZG9uJ3Qgd2FudCBvdmVybGF5cyB0aGF0IGRvbid0IGhhbmRsZSBrZXlib2FyZCBldmVudHMgdG8gYmxvY2sgdGhlIG9uZXMgYmVsb3dcbiAgICAgIC8vIHRoZW0gdGhhdCBkby5cbiAgICAgIGlmIChvdmVybGF5c1tpXS5fa2V5ZG93bkV2ZW50cy5vYnNlcnZlcnMubGVuZ3RoID4gMCkge1xuICAgICAgICBvdmVybGF5c1tpXS5fa2V5ZG93bkV2ZW50cy5uZXh0KGV2ZW50KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXX0=