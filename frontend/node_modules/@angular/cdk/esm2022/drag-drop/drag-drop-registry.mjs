/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injectable, NgZone, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { normalizePassiveListenerOptions } from '@angular/cdk/platform';
import { merge, Observable, Subject } from 'rxjs';
import * as i0 from "@angular/core";
/** Event options that can be used to bind an active, capturing event. */
const activeCapturingEventOptions = normalizePassiveListenerOptions({
    passive: false,
    capture: true,
});
/**
 * Service that keeps track of all the drag item and drop container
 * instances, and manages global event listeners on the `document`.
 * @docs-private
 */
// Note: this class is generic, rather than referencing CdkDrag and CdkDropList directly, in order
// to avoid circular imports. If we were to reference them here, importing the registry into the
// classes that are registering themselves will introduce a circular import.
export class DragDropRegistry {
    constructor(_ngZone, _document) {
        this._ngZone = _ngZone;
        /** Registered drop container instances. */
        this._dropInstances = new Set();
        /** Registered drag item instances. */
        this._dragInstances = new Set();
        /** Drag item instances that are currently being dragged. */
        this._activeDragInstances = [];
        /** Keeps track of the event listeners that we've bound to the `document`. */
        this._globalListeners = new Map();
        /**
         * Predicate function to check if an item is being dragged.  Moved out into a property,
         * because it'll be called a lot and we don't want to create a new function every time.
         */
        this._draggingPredicate = (item) => item.isDragging();
        /**
         * Emits the `touchmove` or `mousemove` events that are dispatched
         * while the user is dragging a drag item instance.
         */
        this.pointerMove = new Subject();
        /**
         * Emits the `touchend` or `mouseup` events that are dispatched
         * while the user is dragging a drag item instance.
         */
        this.pointerUp = new Subject();
        /**
         * Emits when the viewport has been scrolled while the user is dragging an item.
         * @deprecated To be turned into a private member. Use the `scrolled` method instead.
         * @breaking-change 13.0.0
         */
        this.scroll = new Subject();
        /**
         * Event listener that will prevent the default browser action while the user is dragging.
         * @param event Event whose default action should be prevented.
         */
        this._preventDefaultWhileDragging = (event) => {
            if (this._activeDragInstances.length > 0) {
                event.preventDefault();
            }
        };
        /** Event listener for `touchmove` that is bound even if no dragging is happening. */
        this._persistentTouchmoveListener = (event) => {
            if (this._activeDragInstances.length > 0) {
                // Note that we only want to prevent the default action after dragging has actually started.
                // Usually this is the same time at which the item is added to the `_activeDragInstances`,
                // but it could be pushed back if the user has set up a drag delay or threshold.
                if (this._activeDragInstances.some(this._draggingPredicate)) {
                    event.preventDefault();
                }
                this.pointerMove.next(event);
            }
        };
        this._document = _document;
    }
    /** Adds a drop container to the registry. */
    registerDropContainer(drop) {
        if (!this._dropInstances.has(drop)) {
            this._dropInstances.add(drop);
        }
    }
    /** Adds a drag item instance to the registry. */
    registerDragItem(drag) {
        this._dragInstances.add(drag);
        // The `touchmove` event gets bound once, ahead of time, because WebKit
        // won't preventDefault on a dynamically-added `touchmove` listener.
        // See https://bugs.webkit.org/show_bug.cgi?id=184250.
        if (this._dragInstances.size === 1) {
            this._ngZone.runOutsideAngular(() => {
                // The event handler has to be explicitly active,
                // because newer browsers make it passive by default.
                this._document.addEventListener('touchmove', this._persistentTouchmoveListener, activeCapturingEventOptions);
            });
        }
    }
    /** Removes a drop container from the registry. */
    removeDropContainer(drop) {
        this._dropInstances.delete(drop);
    }
    /** Removes a drag item instance from the registry. */
    removeDragItem(drag) {
        this._dragInstances.delete(drag);
        this.stopDragging(drag);
        if (this._dragInstances.size === 0) {
            this._document.removeEventListener('touchmove', this._persistentTouchmoveListener, activeCapturingEventOptions);
        }
    }
    /**
     * Starts the dragging sequence for a drag instance.
     * @param drag Drag instance which is being dragged.
     * @param event Event that initiated the dragging.
     */
    startDragging(drag, event) {
        // Do not process the same drag twice to avoid memory leaks and redundant listeners
        if (this._activeDragInstances.indexOf(drag) > -1) {
            return;
        }
        this._activeDragInstances.push(drag);
        if (this._activeDragInstances.length === 1) {
            const isTouchEvent = event.type.startsWith('touch');
            // We explicitly bind __active__ listeners here, because newer browsers will default to
            // passive ones for `mousemove` and `touchmove`. The events need to be active, because we
            // use `preventDefault` to prevent the page from scrolling while the user is dragging.
            this._globalListeners
                .set(isTouchEvent ? 'touchend' : 'mouseup', {
                handler: (e) => this.pointerUp.next(e),
                options: true,
            })
                .set('scroll', {
                handler: (e) => this.scroll.next(e),
                // Use capturing so that we pick up scroll changes in any scrollable nodes that aren't
                // the document. See https://github.com/angular/components/issues/17144.
                options: true,
            })
                // Preventing the default action on `mousemove` isn't enough to disable text selection
                // on Safari so we need to prevent the selection event as well. Alternatively this can
                // be done by setting `user-select: none` on the `body`, however it has causes a style
                // recalculation which can be expensive on pages with a lot of elements.
                .set('selectstart', {
                handler: this._preventDefaultWhileDragging,
                options: activeCapturingEventOptions,
            });
            // We don't have to bind a move event for touch drag sequences, because
            // we already have a persistent global one bound from `registerDragItem`.
            if (!isTouchEvent) {
                this._globalListeners.set('mousemove', {
                    handler: (e) => this.pointerMove.next(e),
                    options: activeCapturingEventOptions,
                });
            }
            this._ngZone.runOutsideAngular(() => {
                this._globalListeners.forEach((config, name) => {
                    this._document.addEventListener(name, config.handler, config.options);
                });
            });
        }
    }
    /** Stops dragging a drag item instance. */
    stopDragging(drag) {
        const index = this._activeDragInstances.indexOf(drag);
        if (index > -1) {
            this._activeDragInstances.splice(index, 1);
            if (this._activeDragInstances.length === 0) {
                this._clearGlobalListeners();
            }
        }
    }
    /** Gets whether a drag item instance is currently being dragged. */
    isDragging(drag) {
        return this._activeDragInstances.indexOf(drag) > -1;
    }
    /**
     * Gets a stream that will emit when any element on the page is scrolled while an item is being
     * dragged.
     * @param shadowRoot Optional shadow root that the current dragging sequence started from.
     *   Top-level listeners won't pick up events coming from the shadow DOM so this parameter can
     *   be used to include an additional top-level listener at the shadow root level.
     */
    scrolled(shadowRoot) {
        const streams = [this.scroll];
        if (shadowRoot && shadowRoot !== this._document) {
            // Note that this is basically the same as `fromEvent` from rxjs, but we do it ourselves,
            // because we want to guarantee that the event is bound outside of the `NgZone`. With
            // `fromEvent` it'll only happen if the subscription is outside the `NgZone`.
            streams.push(new Observable((observer) => {
                return this._ngZone.runOutsideAngular(() => {
                    const eventOptions = true;
                    const callback = (event) => {
                        if (this._activeDragInstances.length) {
                            observer.next(event);
                        }
                    };
                    shadowRoot.addEventListener('scroll', callback, eventOptions);
                    return () => {
                        shadowRoot.removeEventListener('scroll', callback, eventOptions);
                    };
                });
            }));
        }
        return merge(...streams);
    }
    ngOnDestroy() {
        this._dragInstances.forEach(instance => this.removeDragItem(instance));
        this._dropInstances.forEach(instance => this.removeDropContainer(instance));
        this._clearGlobalListeners();
        this.pointerMove.complete();
        this.pointerUp.complete();
    }
    /** Clears out the global event listeners from the `document`. */
    _clearGlobalListeners() {
        this._globalListeners.forEach((config, name) => {
            this._document.removeEventListener(name, config.handler, config.options);
        });
        this._globalListeners.clear();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.2.0", ngImport: i0, type: DragDropRegistry, deps: [{ token: i0.NgZone }, { token: DOCUMENT }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "17.2.0", ngImport: i0, type: DragDropRegistry, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.2.0", ngImport: i0, type: DragDropRegistry, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [{ type: i0.NgZone }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJhZy1kcm9wLXJlZ2lzdHJ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9kcmFnLWRyb3AvZHJhZy1kcm9wLXJlZ2lzdHJ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxVQUFVLEVBQUUsTUFBTSxFQUFhLE1BQU0sRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUNwRSxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDekMsT0FBTyxFQUFDLCtCQUErQixFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDdEUsT0FBTyxFQUFDLEtBQUssRUFBRSxVQUFVLEVBQVksT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDOztBQUUxRCx5RUFBeUU7QUFDekUsTUFBTSwyQkFBMkIsR0FBRywrQkFBK0IsQ0FBQztJQUNsRSxPQUFPLEVBQUUsS0FBSztJQUNkLE9BQU8sRUFBRSxJQUFJO0NBQ2QsQ0FBQyxDQUFDO0FBRUg7Ozs7R0FJRztBQUNILGtHQUFrRztBQUNsRyxnR0FBZ0c7QUFDaEcsNEVBQTRFO0FBRTVFLE1BQU0sT0FBTyxnQkFBZ0I7SUE4QzNCLFlBQ1UsT0FBZSxFQUNMLFNBQWM7UUFEeEIsWUFBTyxHQUFQLE9BQU8sQ0FBUTtRQTVDekIsMkNBQTJDO1FBQ25DLG1CQUFjLEdBQUcsSUFBSSxHQUFHLEVBQUssQ0FBQztRQUV0QyxzQ0FBc0M7UUFDOUIsbUJBQWMsR0FBRyxJQUFJLEdBQUcsRUFBSyxDQUFDO1FBRXRDLDREQUE0RDtRQUNwRCx5QkFBb0IsR0FBUSxFQUFFLENBQUM7UUFFdkMsNkVBQTZFO1FBQ3JFLHFCQUFnQixHQUFHLElBQUksR0FBRyxFQU0vQixDQUFDO1FBRUo7OztXQUdHO1FBQ0ssdUJBQWtCLEdBQUcsQ0FBQyxJQUFPLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUU1RDs7O1dBR0c7UUFDTSxnQkFBVyxHQUFxQyxJQUFJLE9BQU8sRUFBMkIsQ0FBQztRQUVoRzs7O1dBR0c7UUFDTSxjQUFTLEdBQXFDLElBQUksT0FBTyxFQUEyQixDQUFDO1FBRTlGOzs7O1dBSUc7UUFDTSxXQUFNLEdBQW1CLElBQUksT0FBTyxFQUFTLENBQUM7UUE4S3ZEOzs7V0FHRztRQUNLLGlDQUE0QixHQUFHLENBQUMsS0FBWSxFQUFFLEVBQUU7WUFDdEQsSUFBSSxJQUFJLENBQUMsb0JBQW9CLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUN6QyxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDekIsQ0FBQztRQUNILENBQUMsQ0FBQztRQUVGLHFGQUFxRjtRQUM3RSxpQ0FBNEIsR0FBRyxDQUFDLEtBQWlCLEVBQUUsRUFBRTtZQUMzRCxJQUFJLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQ3pDLDRGQUE0RjtnQkFDNUYsMEZBQTBGO2dCQUMxRixnRkFBZ0Y7Z0JBQ2hGLElBQUksSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsRUFBRSxDQUFDO29CQUM1RCxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBQ3pCLENBQUM7Z0JBRUQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDL0IsQ0FBQztRQUNILENBQUMsQ0FBQztRQTlMQSxJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztJQUM3QixDQUFDO0lBRUQsNkNBQTZDO0lBQzdDLHFCQUFxQixDQUFDLElBQU87UUFDM0IsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDbkMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDaEMsQ0FBQztJQUNILENBQUM7SUFFRCxpREFBaUQ7SUFDakQsZ0JBQWdCLENBQUMsSUFBTztRQUN0QixJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUU5Qix1RUFBdUU7UUFDdkUsb0VBQW9FO1FBQ3BFLHNEQUFzRDtRQUN0RCxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxLQUFLLENBQUMsRUFBRSxDQUFDO1lBQ25DLElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsR0FBRyxFQUFFO2dCQUNsQyxpREFBaUQ7Z0JBQ2pELHFEQUFxRDtnQkFDckQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FDN0IsV0FBVyxFQUNYLElBQUksQ0FBQyw0QkFBNEIsRUFDakMsMkJBQTJCLENBQzVCLENBQUM7WUFDSixDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7SUFDSCxDQUFDO0lBRUQsa0RBQWtEO0lBQ2xELG1CQUFtQixDQUFDLElBQU87UUFDekIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDbkMsQ0FBQztJQUVELHNEQUFzRDtJQUN0RCxjQUFjLENBQUMsSUFBTztRQUNwQixJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNqQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRXhCLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDbkMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsQ0FDaEMsV0FBVyxFQUNYLElBQUksQ0FBQyw0QkFBNEIsRUFDakMsMkJBQTJCLENBQzVCLENBQUM7UUFDSixDQUFDO0lBQ0gsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxhQUFhLENBQUMsSUFBTyxFQUFFLEtBQThCO1FBQ25ELG1GQUFtRjtRQUNuRixJQUFJLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUNqRCxPQUFPO1FBQ1QsQ0FBQztRQUVELElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFckMsSUFBSSxJQUFJLENBQUMsb0JBQW9CLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO1lBQzNDLE1BQU0sWUFBWSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRXBELHVGQUF1RjtZQUN2Rix5RkFBeUY7WUFDekYsc0ZBQXNGO1lBQ3RGLElBQUksQ0FBQyxnQkFBZ0I7aUJBQ2xCLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFO2dCQUMxQyxPQUFPLEVBQUUsQ0FBQyxDQUFRLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQTRCLENBQUM7Z0JBQ3hFLE9BQU8sRUFBRSxJQUFJO2FBQ2QsQ0FBQztpQkFDRCxHQUFHLENBQUMsUUFBUSxFQUFFO2dCQUNiLE9BQU8sRUFBRSxDQUFDLENBQVEsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUMxQyxzRkFBc0Y7Z0JBQ3RGLHdFQUF3RTtnQkFDeEUsT0FBTyxFQUFFLElBQUk7YUFDZCxDQUFDO2dCQUNGLHNGQUFzRjtnQkFDdEYsc0ZBQXNGO2dCQUN0RixzRkFBc0Y7Z0JBQ3RGLHdFQUF3RTtpQkFDdkUsR0FBRyxDQUFDLGFBQWEsRUFBRTtnQkFDbEIsT0FBTyxFQUFFLElBQUksQ0FBQyw0QkFBNEI7Z0JBQzFDLE9BQU8sRUFBRSwyQkFBMkI7YUFDckMsQ0FBQyxDQUFDO1lBRUwsdUVBQXVFO1lBQ3ZFLHlFQUF5RTtZQUN6RSxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7Z0JBQ2xCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFO29CQUNyQyxPQUFPLEVBQUUsQ0FBQyxDQUFRLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQWUsQ0FBQztvQkFDN0QsT0FBTyxFQUFFLDJCQUEyQjtpQkFDckMsQ0FBQyxDQUFDO1lBQ0wsQ0FBQztZQUVELElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsR0FBRyxFQUFFO2dCQUNsQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxFQUFFO29CQUM3QyxJQUFJLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDeEUsQ0FBQyxDQUFDLENBQUM7WUFDTCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7SUFDSCxDQUFDO0lBRUQsMkNBQTJDO0lBQzNDLFlBQVksQ0FBQyxJQUFPO1FBQ2xCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFdEQsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUNmLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRTNDLElBQUksSUFBSSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDM0MsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7WUFDL0IsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0lBRUQsb0VBQW9FO0lBQ3BFLFVBQVUsQ0FBQyxJQUFPO1FBQ2hCLE9BQU8sSUFBSSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0gsUUFBUSxDQUFDLFVBQXdDO1FBQy9DLE1BQU0sT0FBTyxHQUF3QixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUVuRCxJQUFJLFVBQVUsSUFBSSxVQUFVLEtBQUssSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ2hELHlGQUF5RjtZQUN6RixxRkFBcUY7WUFDckYsNkVBQTZFO1lBQzdFLE9BQU8sQ0FBQyxJQUFJLENBQ1YsSUFBSSxVQUFVLENBQUMsQ0FBQyxRQUF5QixFQUFFLEVBQUU7Z0JBQzNDLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUU7b0JBQ3pDLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQztvQkFDMUIsTUFBTSxRQUFRLEdBQUcsQ0FBQyxLQUFZLEVBQUUsRUFBRTt3QkFDaEMsSUFBSSxJQUFJLENBQUMsb0JBQW9CLENBQUMsTUFBTSxFQUFFLENBQUM7NEJBQ3JDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7d0JBQ3ZCLENBQUM7b0JBQ0gsQ0FBQyxDQUFDO29CQUVELFVBQXlCLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxZQUFZLENBQUMsQ0FBQztvQkFFOUUsT0FBTyxHQUFHLEVBQUU7d0JBQ1QsVUFBeUIsQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLFlBQVksQ0FBQyxDQUFDO29CQUNuRixDQUFDLENBQUM7Z0JBQ0osQ0FBQyxDQUFDLENBQUM7WUFDTCxDQUFDLENBQUMsQ0FDSCxDQUFDO1FBQ0osQ0FBQztRQUVELE9BQU8sS0FBSyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUM7SUFDM0IsQ0FBQztJQUVELFdBQVc7UUFDVCxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUN2RSxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQzVFLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1FBQzdCLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDNUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUM1QixDQUFDO0lBMEJELGlFQUFpRTtJQUN6RCxxQkFBcUI7UUFDM0IsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsRUFBRTtZQUM3QyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFtQixDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMzRSxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNoQyxDQUFDOzhHQXpQVSxnQkFBZ0Isd0NBZ0RqQixRQUFRO2tIQWhEUCxnQkFBZ0IsY0FESixNQUFNOzsyRkFDbEIsZ0JBQWdCO2tCQUQ1QixVQUFVO21CQUFDLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBQzs7MEJBaUQzQixNQUFNOzJCQUFDLFFBQVEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3RhYmxlLCBOZ1pvbmUsIE9uRGVzdHJveSwgSW5qZWN0fSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7RE9DVU1FTlR9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge25vcm1hbGl6ZVBhc3NpdmVMaXN0ZW5lck9wdGlvbnN9IGZyb20gJ0Bhbmd1bGFyL2Nkay9wbGF0Zm9ybSc7XG5pbXBvcnQge21lcmdlLCBPYnNlcnZhYmxlLCBPYnNlcnZlciwgU3ViamVjdH0gZnJvbSAncnhqcyc7XG5cbi8qKiBFdmVudCBvcHRpb25zIHRoYXQgY2FuIGJlIHVzZWQgdG8gYmluZCBhbiBhY3RpdmUsIGNhcHR1cmluZyBldmVudC4gKi9cbmNvbnN0IGFjdGl2ZUNhcHR1cmluZ0V2ZW50T3B0aW9ucyA9IG5vcm1hbGl6ZVBhc3NpdmVMaXN0ZW5lck9wdGlvbnMoe1xuICBwYXNzaXZlOiBmYWxzZSxcbiAgY2FwdHVyZTogdHJ1ZSxcbn0pO1xuXG4vKipcbiAqIFNlcnZpY2UgdGhhdCBrZWVwcyB0cmFjayBvZiBhbGwgdGhlIGRyYWcgaXRlbSBhbmQgZHJvcCBjb250YWluZXJcbiAqIGluc3RhbmNlcywgYW5kIG1hbmFnZXMgZ2xvYmFsIGV2ZW50IGxpc3RlbmVycyBvbiB0aGUgYGRvY3VtZW50YC5cbiAqIEBkb2NzLXByaXZhdGVcbiAqL1xuLy8gTm90ZTogdGhpcyBjbGFzcyBpcyBnZW5lcmljLCByYXRoZXIgdGhhbiByZWZlcmVuY2luZyBDZGtEcmFnIGFuZCBDZGtEcm9wTGlzdCBkaXJlY3RseSwgaW4gb3JkZXJcbi8vIHRvIGF2b2lkIGNpcmN1bGFyIGltcG9ydHMuIElmIHdlIHdlcmUgdG8gcmVmZXJlbmNlIHRoZW0gaGVyZSwgaW1wb3J0aW5nIHRoZSByZWdpc3RyeSBpbnRvIHRoZVxuLy8gY2xhc3NlcyB0aGF0IGFyZSByZWdpc3RlcmluZyB0aGVtc2VsdmVzIHdpbGwgaW50cm9kdWNlIGEgY2lyY3VsYXIgaW1wb3J0LlxuQEluamVjdGFibGUoe3Byb3ZpZGVkSW46ICdyb290J30pXG5leHBvcnQgY2xhc3MgRHJhZ0Ryb3BSZWdpc3RyeTxJIGV4dGVuZHMge2lzRHJhZ2dpbmcoKTogYm9vbGVhbn0sIEM+IGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgcHJpdmF0ZSBfZG9jdW1lbnQ6IERvY3VtZW50O1xuXG4gIC8qKiBSZWdpc3RlcmVkIGRyb3AgY29udGFpbmVyIGluc3RhbmNlcy4gKi9cbiAgcHJpdmF0ZSBfZHJvcEluc3RhbmNlcyA9IG5ldyBTZXQ8Qz4oKTtcblxuICAvKiogUmVnaXN0ZXJlZCBkcmFnIGl0ZW0gaW5zdGFuY2VzLiAqL1xuICBwcml2YXRlIF9kcmFnSW5zdGFuY2VzID0gbmV3IFNldDxJPigpO1xuXG4gIC8qKiBEcmFnIGl0ZW0gaW5zdGFuY2VzIHRoYXQgYXJlIGN1cnJlbnRseSBiZWluZyBkcmFnZ2VkLiAqL1xuICBwcml2YXRlIF9hY3RpdmVEcmFnSW5zdGFuY2VzOiBJW10gPSBbXTtcblxuICAvKiogS2VlcHMgdHJhY2sgb2YgdGhlIGV2ZW50IGxpc3RlbmVycyB0aGF0IHdlJ3ZlIGJvdW5kIHRvIHRoZSBgZG9jdW1lbnRgLiAqL1xuICBwcml2YXRlIF9nbG9iYWxMaXN0ZW5lcnMgPSBuZXcgTWFwPFxuICAgIHN0cmluZyxcbiAgICB7XG4gICAgICBoYW5kbGVyOiAoZXZlbnQ6IEV2ZW50KSA9PiB2b2lkO1xuICAgICAgb3B0aW9ucz86IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zIHwgYm9vbGVhbjtcbiAgICB9XG4gID4oKTtcblxuICAvKipcbiAgICogUHJlZGljYXRlIGZ1bmN0aW9uIHRvIGNoZWNrIGlmIGFuIGl0ZW0gaXMgYmVpbmcgZHJhZ2dlZC4gIE1vdmVkIG91dCBpbnRvIGEgcHJvcGVydHksXG4gICAqIGJlY2F1c2UgaXQnbGwgYmUgY2FsbGVkIGEgbG90IGFuZCB3ZSBkb24ndCB3YW50IHRvIGNyZWF0ZSBhIG5ldyBmdW5jdGlvbiBldmVyeSB0aW1lLlxuICAgKi9cbiAgcHJpdmF0ZSBfZHJhZ2dpbmdQcmVkaWNhdGUgPSAoaXRlbTogSSkgPT4gaXRlbS5pc0RyYWdnaW5nKCk7XG5cbiAgLyoqXG4gICAqIEVtaXRzIHRoZSBgdG91Y2htb3ZlYCBvciBgbW91c2Vtb3ZlYCBldmVudHMgdGhhdCBhcmUgZGlzcGF0Y2hlZFxuICAgKiB3aGlsZSB0aGUgdXNlciBpcyBkcmFnZ2luZyBhIGRyYWcgaXRlbSBpbnN0YW5jZS5cbiAgICovXG4gIHJlYWRvbmx5IHBvaW50ZXJNb3ZlOiBTdWJqZWN0PFRvdWNoRXZlbnQgfCBNb3VzZUV2ZW50PiA9IG5ldyBTdWJqZWN0PFRvdWNoRXZlbnQgfCBNb3VzZUV2ZW50PigpO1xuXG4gIC8qKlxuICAgKiBFbWl0cyB0aGUgYHRvdWNoZW5kYCBvciBgbW91c2V1cGAgZXZlbnRzIHRoYXQgYXJlIGRpc3BhdGNoZWRcbiAgICogd2hpbGUgdGhlIHVzZXIgaXMgZHJhZ2dpbmcgYSBkcmFnIGl0ZW0gaW5zdGFuY2UuXG4gICAqL1xuICByZWFkb25seSBwb2ludGVyVXA6IFN1YmplY3Q8VG91Y2hFdmVudCB8IE1vdXNlRXZlbnQ+ID0gbmV3IFN1YmplY3Q8VG91Y2hFdmVudCB8IE1vdXNlRXZlbnQ+KCk7XG5cbiAgLyoqXG4gICAqIEVtaXRzIHdoZW4gdGhlIHZpZXdwb3J0IGhhcyBiZWVuIHNjcm9sbGVkIHdoaWxlIHRoZSB1c2VyIGlzIGRyYWdnaW5nIGFuIGl0ZW0uXG4gICAqIEBkZXByZWNhdGVkIFRvIGJlIHR1cm5lZCBpbnRvIGEgcHJpdmF0ZSBtZW1iZXIuIFVzZSB0aGUgYHNjcm9sbGVkYCBtZXRob2QgaW5zdGVhZC5cbiAgICogQGJyZWFraW5nLWNoYW5nZSAxMy4wLjBcbiAgICovXG4gIHJlYWRvbmx5IHNjcm9sbDogU3ViamVjdDxFdmVudD4gPSBuZXcgU3ViamVjdDxFdmVudD4oKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIF9uZ1pvbmU6IE5nWm9uZSxcbiAgICBASW5qZWN0KERPQ1VNRU5UKSBfZG9jdW1lbnQ6IGFueSxcbiAgKSB7XG4gICAgdGhpcy5fZG9jdW1lbnQgPSBfZG9jdW1lbnQ7XG4gIH1cblxuICAvKiogQWRkcyBhIGRyb3AgY29udGFpbmVyIHRvIHRoZSByZWdpc3RyeS4gKi9cbiAgcmVnaXN0ZXJEcm9wQ29udGFpbmVyKGRyb3A6IEMpIHtcbiAgICBpZiAoIXRoaXMuX2Ryb3BJbnN0YW5jZXMuaGFzKGRyb3ApKSB7XG4gICAgICB0aGlzLl9kcm9wSW5zdGFuY2VzLmFkZChkcm9wKTtcbiAgICB9XG4gIH1cblxuICAvKiogQWRkcyBhIGRyYWcgaXRlbSBpbnN0YW5jZSB0byB0aGUgcmVnaXN0cnkuICovXG4gIHJlZ2lzdGVyRHJhZ0l0ZW0oZHJhZzogSSkge1xuICAgIHRoaXMuX2RyYWdJbnN0YW5jZXMuYWRkKGRyYWcpO1xuXG4gICAgLy8gVGhlIGB0b3VjaG1vdmVgIGV2ZW50IGdldHMgYm91bmQgb25jZSwgYWhlYWQgb2YgdGltZSwgYmVjYXVzZSBXZWJLaXRcbiAgICAvLyB3b24ndCBwcmV2ZW50RGVmYXVsdCBvbiBhIGR5bmFtaWNhbGx5LWFkZGVkIGB0b3VjaG1vdmVgIGxpc3RlbmVyLlxuICAgIC8vIFNlZSBodHRwczovL2J1Z3Mud2Via2l0Lm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MTg0MjUwLlxuICAgIGlmICh0aGlzLl9kcmFnSW5zdGFuY2VzLnNpemUgPT09IDEpIHtcbiAgICAgIHRoaXMuX25nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICAgIC8vIFRoZSBldmVudCBoYW5kbGVyIGhhcyB0byBiZSBleHBsaWNpdGx5IGFjdGl2ZSxcbiAgICAgICAgLy8gYmVjYXVzZSBuZXdlciBicm93c2VycyBtYWtlIGl0IHBhc3NpdmUgYnkgZGVmYXVsdC5cbiAgICAgICAgdGhpcy5fZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICAndG91Y2htb3ZlJyxcbiAgICAgICAgICB0aGlzLl9wZXJzaXN0ZW50VG91Y2htb3ZlTGlzdGVuZXIsXG4gICAgICAgICAgYWN0aXZlQ2FwdHVyaW5nRXZlbnRPcHRpb25zLFxuICAgICAgICApO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFJlbW92ZXMgYSBkcm9wIGNvbnRhaW5lciBmcm9tIHRoZSByZWdpc3RyeS4gKi9cbiAgcmVtb3ZlRHJvcENvbnRhaW5lcihkcm9wOiBDKSB7XG4gICAgdGhpcy5fZHJvcEluc3RhbmNlcy5kZWxldGUoZHJvcCk7XG4gIH1cblxuICAvKiogUmVtb3ZlcyBhIGRyYWcgaXRlbSBpbnN0YW5jZSBmcm9tIHRoZSByZWdpc3RyeS4gKi9cbiAgcmVtb3ZlRHJhZ0l0ZW0oZHJhZzogSSkge1xuICAgIHRoaXMuX2RyYWdJbnN0YW5jZXMuZGVsZXRlKGRyYWcpO1xuICAgIHRoaXMuc3RvcERyYWdnaW5nKGRyYWcpO1xuXG4gICAgaWYgKHRoaXMuX2RyYWdJbnN0YW5jZXMuc2l6ZSA9PT0gMCkge1xuICAgICAgdGhpcy5fZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgJ3RvdWNobW92ZScsXG4gICAgICAgIHRoaXMuX3BlcnNpc3RlbnRUb3VjaG1vdmVMaXN0ZW5lcixcbiAgICAgICAgYWN0aXZlQ2FwdHVyaW5nRXZlbnRPcHRpb25zLFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU3RhcnRzIHRoZSBkcmFnZ2luZyBzZXF1ZW5jZSBmb3IgYSBkcmFnIGluc3RhbmNlLlxuICAgKiBAcGFyYW0gZHJhZyBEcmFnIGluc3RhbmNlIHdoaWNoIGlzIGJlaW5nIGRyYWdnZWQuXG4gICAqIEBwYXJhbSBldmVudCBFdmVudCB0aGF0IGluaXRpYXRlZCB0aGUgZHJhZ2dpbmcuXG4gICAqL1xuICBzdGFydERyYWdnaW5nKGRyYWc6IEksIGV2ZW50OiBUb3VjaEV2ZW50IHwgTW91c2VFdmVudCkge1xuICAgIC8vIERvIG5vdCBwcm9jZXNzIHRoZSBzYW1lIGRyYWcgdHdpY2UgdG8gYXZvaWQgbWVtb3J5IGxlYWtzIGFuZCByZWR1bmRhbnQgbGlzdGVuZXJzXG4gICAgaWYgKHRoaXMuX2FjdGl2ZURyYWdJbnN0YW5jZXMuaW5kZXhPZihkcmFnKSA+IC0xKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fYWN0aXZlRHJhZ0luc3RhbmNlcy5wdXNoKGRyYWcpO1xuXG4gICAgaWYgKHRoaXMuX2FjdGl2ZURyYWdJbnN0YW5jZXMubGVuZ3RoID09PSAxKSB7XG4gICAgICBjb25zdCBpc1RvdWNoRXZlbnQgPSBldmVudC50eXBlLnN0YXJ0c1dpdGgoJ3RvdWNoJyk7XG5cbiAgICAgIC8vIFdlIGV4cGxpY2l0bHkgYmluZCBfX2FjdGl2ZV9fIGxpc3RlbmVycyBoZXJlLCBiZWNhdXNlIG5ld2VyIGJyb3dzZXJzIHdpbGwgZGVmYXVsdCB0b1xuICAgICAgLy8gcGFzc2l2ZSBvbmVzIGZvciBgbW91c2Vtb3ZlYCBhbmQgYHRvdWNobW92ZWAuIFRoZSBldmVudHMgbmVlZCB0byBiZSBhY3RpdmUsIGJlY2F1c2Ugd2VcbiAgICAgIC8vIHVzZSBgcHJldmVudERlZmF1bHRgIHRvIHByZXZlbnQgdGhlIHBhZ2UgZnJvbSBzY3JvbGxpbmcgd2hpbGUgdGhlIHVzZXIgaXMgZHJhZ2dpbmcuXG4gICAgICB0aGlzLl9nbG9iYWxMaXN0ZW5lcnNcbiAgICAgICAgLnNldChpc1RvdWNoRXZlbnQgPyAndG91Y2hlbmQnIDogJ21vdXNldXAnLCB7XG4gICAgICAgICAgaGFuZGxlcjogKGU6IEV2ZW50KSA9PiB0aGlzLnBvaW50ZXJVcC5uZXh0KGUgYXMgVG91Y2hFdmVudCB8IE1vdXNlRXZlbnQpLFxuICAgICAgICAgIG9wdGlvbnM6IHRydWUsXG4gICAgICAgIH0pXG4gICAgICAgIC5zZXQoJ3Njcm9sbCcsIHtcbiAgICAgICAgICBoYW5kbGVyOiAoZTogRXZlbnQpID0+IHRoaXMuc2Nyb2xsLm5leHQoZSksXG4gICAgICAgICAgLy8gVXNlIGNhcHR1cmluZyBzbyB0aGF0IHdlIHBpY2sgdXAgc2Nyb2xsIGNoYW5nZXMgaW4gYW55IHNjcm9sbGFibGUgbm9kZXMgdGhhdCBhcmVuJ3RcbiAgICAgICAgICAvLyB0aGUgZG9jdW1lbnQuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9jb21wb25lbnRzL2lzc3Vlcy8xNzE0NC5cbiAgICAgICAgICBvcHRpb25zOiB0cnVlLFxuICAgICAgICB9KVxuICAgICAgICAvLyBQcmV2ZW50aW5nIHRoZSBkZWZhdWx0IGFjdGlvbiBvbiBgbW91c2Vtb3ZlYCBpc24ndCBlbm91Z2ggdG8gZGlzYWJsZSB0ZXh0IHNlbGVjdGlvblxuICAgICAgICAvLyBvbiBTYWZhcmkgc28gd2UgbmVlZCB0byBwcmV2ZW50IHRoZSBzZWxlY3Rpb24gZXZlbnQgYXMgd2VsbC4gQWx0ZXJuYXRpdmVseSB0aGlzIGNhblxuICAgICAgICAvLyBiZSBkb25lIGJ5IHNldHRpbmcgYHVzZXItc2VsZWN0OiBub25lYCBvbiB0aGUgYGJvZHlgLCBob3dldmVyIGl0IGhhcyBjYXVzZXMgYSBzdHlsZVxuICAgICAgICAvLyByZWNhbGN1bGF0aW9uIHdoaWNoIGNhbiBiZSBleHBlbnNpdmUgb24gcGFnZXMgd2l0aCBhIGxvdCBvZiBlbGVtZW50cy5cbiAgICAgICAgLnNldCgnc2VsZWN0c3RhcnQnLCB7XG4gICAgICAgICAgaGFuZGxlcjogdGhpcy5fcHJldmVudERlZmF1bHRXaGlsZURyYWdnaW5nLFxuICAgICAgICAgIG9wdGlvbnM6IGFjdGl2ZUNhcHR1cmluZ0V2ZW50T3B0aW9ucyxcbiAgICAgICAgfSk7XG5cbiAgICAgIC8vIFdlIGRvbid0IGhhdmUgdG8gYmluZCBhIG1vdmUgZXZlbnQgZm9yIHRvdWNoIGRyYWcgc2VxdWVuY2VzLCBiZWNhdXNlXG4gICAgICAvLyB3ZSBhbHJlYWR5IGhhdmUgYSBwZXJzaXN0ZW50IGdsb2JhbCBvbmUgYm91bmQgZnJvbSBgcmVnaXN0ZXJEcmFnSXRlbWAuXG4gICAgICBpZiAoIWlzVG91Y2hFdmVudCkge1xuICAgICAgICB0aGlzLl9nbG9iYWxMaXN0ZW5lcnMuc2V0KCdtb3VzZW1vdmUnLCB7XG4gICAgICAgICAgaGFuZGxlcjogKGU6IEV2ZW50KSA9PiB0aGlzLnBvaW50ZXJNb3ZlLm5leHQoZSBhcyBNb3VzZUV2ZW50KSxcbiAgICAgICAgICBvcHRpb25zOiBhY3RpdmVDYXB0dXJpbmdFdmVudE9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgICB0aGlzLl9nbG9iYWxMaXN0ZW5lcnMuZm9yRWFjaCgoY29uZmlnLCBuYW1lKSA9PiB7XG4gICAgICAgICAgdGhpcy5fZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihuYW1lLCBjb25maWcuaGFuZGxlciwgY29uZmlnLm9wdGlvbnMpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBTdG9wcyBkcmFnZ2luZyBhIGRyYWcgaXRlbSBpbnN0YW5jZS4gKi9cbiAgc3RvcERyYWdnaW5nKGRyYWc6IEkpIHtcbiAgICBjb25zdCBpbmRleCA9IHRoaXMuX2FjdGl2ZURyYWdJbnN0YW5jZXMuaW5kZXhPZihkcmFnKTtcblxuICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICB0aGlzLl9hY3RpdmVEcmFnSW5zdGFuY2VzLnNwbGljZShpbmRleCwgMSk7XG5cbiAgICAgIGlmICh0aGlzLl9hY3RpdmVEcmFnSW5zdGFuY2VzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB0aGlzLl9jbGVhckdsb2JhbExpc3RlbmVycygpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKiBHZXRzIHdoZXRoZXIgYSBkcmFnIGl0ZW0gaW5zdGFuY2UgaXMgY3VycmVudGx5IGJlaW5nIGRyYWdnZWQuICovXG4gIGlzRHJhZ2dpbmcoZHJhZzogSSkge1xuICAgIHJldHVybiB0aGlzLl9hY3RpdmVEcmFnSW5zdGFuY2VzLmluZGV4T2YoZHJhZykgPiAtMTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIGEgc3RyZWFtIHRoYXQgd2lsbCBlbWl0IHdoZW4gYW55IGVsZW1lbnQgb24gdGhlIHBhZ2UgaXMgc2Nyb2xsZWQgd2hpbGUgYW4gaXRlbSBpcyBiZWluZ1xuICAgKiBkcmFnZ2VkLlxuICAgKiBAcGFyYW0gc2hhZG93Um9vdCBPcHRpb25hbCBzaGFkb3cgcm9vdCB0aGF0IHRoZSBjdXJyZW50IGRyYWdnaW5nIHNlcXVlbmNlIHN0YXJ0ZWQgZnJvbS5cbiAgICogICBUb3AtbGV2ZWwgbGlzdGVuZXJzIHdvbid0IHBpY2sgdXAgZXZlbnRzIGNvbWluZyBmcm9tIHRoZSBzaGFkb3cgRE9NIHNvIHRoaXMgcGFyYW1ldGVyIGNhblxuICAgKiAgIGJlIHVzZWQgdG8gaW5jbHVkZSBhbiBhZGRpdGlvbmFsIHRvcC1sZXZlbCBsaXN0ZW5lciBhdCB0aGUgc2hhZG93IHJvb3QgbGV2ZWwuXG4gICAqL1xuICBzY3JvbGxlZChzaGFkb3dSb290PzogRG9jdW1lbnRPclNoYWRvd1Jvb3QgfCBudWxsKTogT2JzZXJ2YWJsZTxFdmVudD4ge1xuICAgIGNvbnN0IHN0cmVhbXM6IE9ic2VydmFibGU8RXZlbnQ+W10gPSBbdGhpcy5zY3JvbGxdO1xuXG4gICAgaWYgKHNoYWRvd1Jvb3QgJiYgc2hhZG93Um9vdCAhPT0gdGhpcy5fZG9jdW1lbnQpIHtcbiAgICAgIC8vIE5vdGUgdGhhdCB0aGlzIGlzIGJhc2ljYWxseSB0aGUgc2FtZSBhcyBgZnJvbUV2ZW50YCBmcm9tIHJ4anMsIGJ1dCB3ZSBkbyBpdCBvdXJzZWx2ZXMsXG4gICAgICAvLyBiZWNhdXNlIHdlIHdhbnQgdG8gZ3VhcmFudGVlIHRoYXQgdGhlIGV2ZW50IGlzIGJvdW5kIG91dHNpZGUgb2YgdGhlIGBOZ1pvbmVgLiBXaXRoXG4gICAgICAvLyBgZnJvbUV2ZW50YCBpdCdsbCBvbmx5IGhhcHBlbiBpZiB0aGUgc3Vic2NyaXB0aW9uIGlzIG91dHNpZGUgdGhlIGBOZ1pvbmVgLlxuICAgICAgc3RyZWFtcy5wdXNoKFxuICAgICAgICBuZXcgT2JzZXJ2YWJsZSgob2JzZXJ2ZXI6IE9ic2VydmVyPEV2ZW50PikgPT4ge1xuICAgICAgICAgIHJldHVybiB0aGlzLl9uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZXZlbnRPcHRpb25zID0gdHJ1ZTtcbiAgICAgICAgICAgIGNvbnN0IGNhbGxiYWNrID0gKGV2ZW50OiBFdmVudCkgPT4ge1xuICAgICAgICAgICAgICBpZiAodGhpcy5fYWN0aXZlRHJhZ0luc3RhbmNlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBvYnNlcnZlci5uZXh0KGV2ZW50KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgKHNoYWRvd1Jvb3QgYXMgU2hhZG93Um9vdCkuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgY2FsbGJhY2ssIGV2ZW50T3B0aW9ucyk7XG5cbiAgICAgICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICAgIChzaGFkb3dSb290IGFzIFNoYWRvd1Jvb3QpLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIGNhbGxiYWNrLCBldmVudE9wdGlvbnMpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSksXG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiBtZXJnZSguLi5zdHJlYW1zKTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuX2RyYWdJbnN0YW5jZXMuZm9yRWFjaChpbnN0YW5jZSA9PiB0aGlzLnJlbW92ZURyYWdJdGVtKGluc3RhbmNlKSk7XG4gICAgdGhpcy5fZHJvcEluc3RhbmNlcy5mb3JFYWNoKGluc3RhbmNlID0+IHRoaXMucmVtb3ZlRHJvcENvbnRhaW5lcihpbnN0YW5jZSkpO1xuICAgIHRoaXMuX2NsZWFyR2xvYmFsTGlzdGVuZXJzKCk7XG4gICAgdGhpcy5wb2ludGVyTW92ZS5jb21wbGV0ZSgpO1xuICAgIHRoaXMucG9pbnRlclVwLmNvbXBsZXRlKCk7XG4gIH1cblxuICAvKipcbiAgICogRXZlbnQgbGlzdGVuZXIgdGhhdCB3aWxsIHByZXZlbnQgdGhlIGRlZmF1bHQgYnJvd3NlciBhY3Rpb24gd2hpbGUgdGhlIHVzZXIgaXMgZHJhZ2dpbmcuXG4gICAqIEBwYXJhbSBldmVudCBFdmVudCB3aG9zZSBkZWZhdWx0IGFjdGlvbiBzaG91bGQgYmUgcHJldmVudGVkLlxuICAgKi9cbiAgcHJpdmF0ZSBfcHJldmVudERlZmF1bHRXaGlsZURyYWdnaW5nID0gKGV2ZW50OiBFdmVudCkgPT4ge1xuICAgIGlmICh0aGlzLl9hY3RpdmVEcmFnSW5zdGFuY2VzLmxlbmd0aCA+IDApIHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfVxuICB9O1xuXG4gIC8qKiBFdmVudCBsaXN0ZW5lciBmb3IgYHRvdWNobW92ZWAgdGhhdCBpcyBib3VuZCBldmVuIGlmIG5vIGRyYWdnaW5nIGlzIGhhcHBlbmluZy4gKi9cbiAgcHJpdmF0ZSBfcGVyc2lzdGVudFRvdWNobW92ZUxpc3RlbmVyID0gKGV2ZW50OiBUb3VjaEV2ZW50KSA9PiB7XG4gICAgaWYgKHRoaXMuX2FjdGl2ZURyYWdJbnN0YW5jZXMubGVuZ3RoID4gMCkge1xuICAgICAgLy8gTm90ZSB0aGF0IHdlIG9ubHkgd2FudCB0byBwcmV2ZW50IHRoZSBkZWZhdWx0IGFjdGlvbiBhZnRlciBkcmFnZ2luZyBoYXMgYWN0dWFsbHkgc3RhcnRlZC5cbiAgICAgIC8vIFVzdWFsbHkgdGhpcyBpcyB0aGUgc2FtZSB0aW1lIGF0IHdoaWNoIHRoZSBpdGVtIGlzIGFkZGVkIHRvIHRoZSBgX2FjdGl2ZURyYWdJbnN0YW5jZXNgLFxuICAgICAgLy8gYnV0IGl0IGNvdWxkIGJlIHB1c2hlZCBiYWNrIGlmIHRoZSB1c2VyIGhhcyBzZXQgdXAgYSBkcmFnIGRlbGF5IG9yIHRocmVzaG9sZC5cbiAgICAgIGlmICh0aGlzLl9hY3RpdmVEcmFnSW5zdGFuY2VzLnNvbWUodGhpcy5fZHJhZ2dpbmdQcmVkaWNhdGUpKSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMucG9pbnRlck1vdmUubmV4dChldmVudCk7XG4gICAgfVxuICB9O1xuXG4gIC8qKiBDbGVhcnMgb3V0IHRoZSBnbG9iYWwgZXZlbnQgbGlzdGVuZXJzIGZyb20gdGhlIGBkb2N1bWVudGAuICovXG4gIHByaXZhdGUgX2NsZWFyR2xvYmFsTGlzdGVuZXJzKCkge1xuICAgIHRoaXMuX2dsb2JhbExpc3RlbmVycy5mb3JFYWNoKChjb25maWcsIG5hbWUpID0+IHtcbiAgICAgIHRoaXMuX2RvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIobmFtZSwgY29uZmlnLmhhbmRsZXIsIGNvbmZpZy5vcHRpb25zKTtcbiAgICB9KTtcblxuICAgIHRoaXMuX2dsb2JhbExpc3RlbmVycy5jbGVhcigpO1xuICB9XG59XG4iXX0=