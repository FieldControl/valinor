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
import { Subject } from 'rxjs';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
/** Event options that can be used to bind an active, capturing event. */
const activeCapturingEventOptions = normalizePassiveListenerOptions({
    passive: false,
    capture: true
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
        /** Emits when the viewport has been scrolled while the user is dragging an item. */
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
                options: true
            })
                .set('scroll', {
                handler: (e) => this.scroll.next(e),
                // Use capturing so that we pick up scroll changes in any scrollable nodes that aren't
                // the document. See https://github.com/angular/components/issues/17144.
                options: true
            })
                // Preventing the default action on `mousemove` isn't enough to disable text selection
                // on Safari so we need to prevent the selection event as well. Alternatively this can
                // be done by setting `user-select: none` on the `body`, however it has causes a style
                // recalculation which can be expensive on pages with a lot of elements.
                .set('selectstart', {
                handler: this._preventDefaultWhileDragging,
                options: activeCapturingEventOptions
            });
            // We don't have to bind a move event for touch drag sequences, because
            // we already have a persistent global one bound from `registerDragItem`.
            if (!isTouchEvent) {
                this._globalListeners.set('mousemove', {
                    handler: (e) => this.pointerMove.next(e),
                    options: activeCapturingEventOptions
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
}
DragDropRegistry.ɵprov = i0.ɵɵdefineInjectable({ factory: function DragDropRegistry_Factory() { return new DragDropRegistry(i0.ɵɵinject(i0.NgZone), i0.ɵɵinject(i1.DOCUMENT)); }, token: DragDropRegistry, providedIn: "root" });
DragDropRegistry.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
DragDropRegistry.ctorParameters = () => [
    { type: NgZone },
    { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] }] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJhZy1kcm9wLXJlZ2lzdHJ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9kcmFnLWRyb3AvZHJhZy1kcm9wLXJlZ2lzdHJ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxVQUFVLEVBQUUsTUFBTSxFQUFhLE1BQU0sRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUNwRSxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDekMsT0FBTyxFQUFDLCtCQUErQixFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDdEUsT0FBTyxFQUFDLE9BQU8sRUFBQyxNQUFNLE1BQU0sQ0FBQzs7O0FBRTdCLHlFQUF5RTtBQUN6RSxNQUFNLDJCQUEyQixHQUFHLCtCQUErQixDQUFDO0lBQ2xFLE9BQU8sRUFBRSxLQUFLO0lBQ2QsT0FBTyxFQUFFLElBQUk7Q0FDZCxDQUFDLENBQUM7QUFFSDs7OztHQUlHO0FBQ0gsa0dBQWtHO0FBQ2xHLGdHQUFnRztBQUNoRyw0RUFBNEU7QUFFNUUsTUFBTSxPQUFPLGdCQUFnQjtJQXVDM0IsWUFDVSxPQUFlLEVBQ0wsU0FBYztRQUR4QixZQUFPLEdBQVAsT0FBTyxDQUFRO1FBckN6QiwyQ0FBMkM7UUFDbkMsbUJBQWMsR0FBRyxJQUFJLEdBQUcsRUFBSyxDQUFDO1FBRXRDLHNDQUFzQztRQUM5QixtQkFBYyxHQUFHLElBQUksR0FBRyxFQUFLLENBQUM7UUFFdEMsNERBQTREO1FBQ3BELHlCQUFvQixHQUFRLEVBQUUsQ0FBQztRQUV2Qyw2RUFBNkU7UUFDckUscUJBQWdCLEdBQUcsSUFBSSxHQUFHLEVBRzlCLENBQUM7UUFFTDs7O1dBR0c7UUFDSyx1QkFBa0IsR0FBRyxDQUFDLElBQU8sRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBRTVEOzs7V0FHRztRQUNNLGdCQUFXLEdBQXFDLElBQUks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QUFDO1FBQzdCLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDNUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUM1QixDQUFDO0lBMEJELGlFQUFpRTtJQUN6RCxxQkFBcUI7UUFDM0IsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsRUFBRTtZQUM3QyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFtQixDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMzRSxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNoQyxDQUFDOzs7O1lBdk1GLFVBQVUsU0FBQyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUM7OztZQW5CWixNQUFNOzRDQTZEckIsTUFBTSxTQUFDLFFBQVEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3RhYmxlLCBOZ1pvbmUsIE9uRGVzdHJveSwgSW5qZWN0fSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7RE9DVU1FTlR9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge25vcm1hbGl6ZVBhc3NpdmVMaXN0ZW5lck9wdGlvbnN9IGZyb20gJ0Bhbmd1bGFyL2Nkay9wbGF0Zm9ybSc7XG5pbXBvcnQge1N1YmplY3R9IGZyb20gJ3J4anMnO1xuXG4vKiogRXZlbnQgb3B0aW9ucyB0aGF0IGNhbiBiZSB1c2VkIHRvIGJpbmQgYW4gYWN0aXZlLCBjYXB0dXJpbmcgZXZlbnQuICovXG5jb25zdCBhY3RpdmVDYXB0dXJpbmdFdmVudE9wdGlvbnMgPSBub3JtYWxpemVQYXNzaXZlTGlzdGVuZXJPcHRpb25zKHtcbiAgcGFzc2l2ZTogZmFsc2UsXG4gIGNhcHR1cmU6IHRydWVcbn0pO1xuXG4vKipcbiAqIFNlcnZpY2UgdGhhdCBrZWVwcyB0cmFjayBvZiBhbGwgdGhlIGRyYWcgaXRlbSBhbmQgZHJvcCBjb250YWluZXJcbiAqIGluc3RhbmNlcywgYW5kIG1hbmFnZXMgZ2xvYmFsIGV2ZW50IGxpc3RlbmVycyBvbiB0aGUgYGRvY3VtZW50YC5cbiAqIEBkb2NzLXByaXZhdGVcbiAqL1xuLy8gTm90ZTogdGhpcyBjbGFzcyBpcyBnZW5lcmljLCByYXRoZXIgdGhhbiByZWZlcmVuY2luZyBDZGtEcmFnIGFuZCBDZGtEcm9wTGlzdCBkaXJlY3RseSwgaW4gb3JkZXJcbi8vIHRvIGF2b2lkIGNpcmN1bGFyIGltcG9ydHMuIElmIHdlIHdlcmUgdG8gcmVmZXJlbmNlIHRoZW0gaGVyZSwgaW1wb3J0aW5nIHRoZSByZWdpc3RyeSBpbnRvIHRoZVxuLy8gY2xhc3NlcyB0aGF0IGFyZSByZWdpc3RlcmluZyB0aGVtc2VsdmVzIHdpbGwgaW50cm9kdWNlIGEgY2lyY3VsYXIgaW1wb3J0LlxuQEluamVjdGFibGUoe3Byb3ZpZGVkSW46ICdyb290J30pXG5leHBvcnQgY2xhc3MgRHJhZ0Ryb3BSZWdpc3RyeTxJIGV4dGVuZHMge2lzRHJhZ2dpbmcoKTogYm9vbGVhbn0sIEM+IGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgcHJpdmF0ZSBfZG9jdW1lbnQ6IERvY3VtZW50O1xuXG4gIC8qKiBSZWdpc3RlcmVkIGRyb3AgY29udGFpbmVyIGluc3RhbmNlcy4gKi9cbiAgcHJpdmF0ZSBfZHJvcEluc3RhbmNlcyA9IG5ldyBTZXQ8Qz4oKTtcblxuICAvKiogUmVnaXN0ZXJlZCBkcmFnIGl0ZW0gaW5zdGFuY2VzLiAqL1xuICBwcml2YXRlIF9kcmFnSW5zdGFuY2VzID0gbmV3IFNldDxJPigpO1xuXG4gIC8qKiBEcmFnIGl0ZW0gaW5zdGFuY2VzIHRoYXQgYXJlIGN1cnJlbnRseSBiZWluZyBkcmFnZ2VkLiAqL1xuICBwcml2YXRlIF9hY3RpdmVEcmFnSW5zdGFuY2VzOiBJW10gPSBbXTtcblxuICAvKiogS2VlcHMgdHJhY2sgb2YgdGhlIGV2ZW50IGxpc3RlbmVycyB0aGF0IHdlJ3ZlIGJvdW5kIHRvIHRoZSBgZG9jdW1lbnRgLiAqL1xuICBwcml2YXRlIF9nbG9iYWxMaXN0ZW5lcnMgPSBuZXcgTWFwPHN0cmluZywge1xuICAgIGhhbmRsZXI6IChldmVudDogRXZlbnQpID0+IHZvaWQsXG4gICAgb3B0aW9ucz86IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zIHwgYm9vbGVhblxuICB9PigpO1xuXG4gIC8qKlxuICAgKiBQcmVkaWNhdGUgZnVuY3Rpb24gdG8gY2hlY2sgaWYgYW4gaXRlbSBpcyBiZWluZyBkcmFnZ2VkLiAgTW92ZWQgb3V0IGludG8gYSBwcm9wZXJ0eSxcbiAgICogYmVjYXVzZSBpdCdsbCBiZSBjYWxsZWQgYSBsb3QgYW5kIHdlIGRvbid0IHdhbnQgdG8gY3JlYXRlIGEgbmV3IGZ1bmN0aW9uIGV2ZXJ5IHRpbWUuXG4gICAqL1xuICBwcml2YXRlIF9kcmFnZ2luZ1ByZWRpY2F0ZSA9IChpdGVtOiBJKSA9PiBpdGVtLmlzRHJhZ2dpbmcoKTtcblxuICAvKipcbiAgICogRW1pdHMgdGhlIGB0b3VjaG1vdmVgIG9yIGBtb3VzZW1vdmVgIGV2ZW50cyB0aGF0IGFyZSBkaXNwYXRjaGVkXG4gICAqIHdoaWxlIHRoZSB1c2VyIGlzIGRyYWdnaW5nIGEgZHJhZyBpdGVtIGluc3RhbmNlLlxuICAgKi9cbiAgcmVhZG9ubHkgcG9pbnRlck1vdmU6IFN1YmplY3Q8VG91Y2hFdmVudCB8IE1vdXNlRXZlbnQ+ID0gbmV3IFN1YmplY3Q8VG91Y2hFdmVudCB8IE1vdXNlRXZlbnQ+KCk7XG5cbiAgLyoqXG4gICAqIEVtaXRzIHRoZSBgdG91Y2hlbmRgIG9yIGBtb3VzZXVwYCBldmVudHMgdGhhdCBhcmUgZGlzcGF0Y2hlZFxuICAgKiB3aGlsZSB0aGUgdXNlciBpcyBkcmFnZ2luZyBhIGRyYWcgaXRlbSBpbnN0YW5jZS5cbiAgICovXG4gIHJlYWRvbmx5IHBvaW50ZXJVcDogU3ViamVjdDxUb3VjaEV2ZW50IHwgTW91c2VFdmVudD4gPSBuZXcgU3ViamVjdDxUb3VjaEV2ZW50IHwgTW91c2VFdmVudD4oKTtcblxuICAvKiogRW1pdHMgd2hlbiB0aGUgdmlld3BvcnQgaGFzIGJlZW4gc2Nyb2xsZWQgd2hpbGUgdGhlIHVzZXIgaXMgZHJhZ2dpbmcgYW4gaXRlbS4gKi9cbiAgcmVhZG9ubHkgc2Nyb2xsOiBTdWJqZWN0PEV2ZW50PiA9IG5ldyBTdWJqZWN0PEV2ZW50PigpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgX25nWm9uZTogTmdab25lLFxuICAgIEBJbmplY3QoRE9DVU1FTlQpIF9kb2N1bWVudDogYW55KSB7XG4gICAgdGhpcy5fZG9jdW1lbnQgPSBfZG9jdW1lbnQ7XG4gIH1cblxuICAvKiogQWRkcyBhIGRyb3AgY29udGFpbmVyIHRvIHRoZSByZWdpc3RyeS4gKi9cbiAgcmVnaXN0ZXJEcm9wQ29udGFpbmVyKGRyb3A6IEMpIHtcbiAgICBpZiAoIXRoaXMuX2Ryb3BJbnN0YW5jZXMuaGFzKGRyb3ApKSB7XG4gICAgICB0aGlzLl9kcm9wSW5zdGFuY2VzLmFkZChkcm9wKTtcbiAgICB9XG4gIH1cblxuICAvKiogQWRkcyBhIGRyYWcgaXRlbSBpbnN0YW5jZSB0byB0aGUgcmVnaXN0cnkuICovXG4gIHJlZ2lzdGVyRHJhZ0l0ZW0oZHJhZzogSSkge1xuICAgIHRoaXMuX2RyYWdJbnN0YW5jZXMuYWRkKGRyYWcpO1xuXG4gICAgLy8gVGhlIGB0b3VjaG1vdmVgIGV2ZW50IGdldHMgYm91bmQgb25jZSwgYWhlYWQgb2YgdGltZSwgYmVjYXVzZSBXZWJLaXRcbiAgICAvLyB3b24ndCBwcmV2ZW50RGVmYXVsdCBvbiBhIGR5bmFtaWNhbGx5LWFkZGVkIGB0b3VjaG1vdmVgIGxpc3RlbmVyLlxuICAgIC8vIFNlZSBodHRwczovL2J1Z3Mud2Via2l0Lm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MTg0MjUwLlxuICAgIGlmICh0aGlzLl9kcmFnSW5zdGFuY2VzLnNpemUgPT09IDEpIHtcbiAgICAgIHRoaXMuX25nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICAgIC8vIFRoZSBldmVudCBoYW5kbGVyIGhhcyB0byBiZSBleHBsaWNpdGx5IGFjdGl2ZSxcbiAgICAgICAgLy8gYmVjYXVzZSBuZXdlciBicm93c2VycyBtYWtlIGl0IHBhc3NpdmUgYnkgZGVmYXVsdC5cbiAgICAgICAgdGhpcy5fZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgdGhpcy5fcGVyc2lzdGVudFRvdWNobW92ZUxpc3RlbmVyLFxuICAgICAgICAgICAgYWN0aXZlQ2FwdHVyaW5nRXZlbnRPcHRpb25zKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBSZW1vdmVzIGEgZHJvcCBjb250YWluZXIgZnJvbSB0aGUgcmVnaXN0cnkuICovXG4gIHJlbW92ZURyb3BDb250YWluZXIoZHJvcDogQykge1xuICAgIHRoaXMuX2Ryb3BJbnN0YW5jZXMuZGVsZXRlKGRyb3ApO1xuICB9XG5cbiAgLyoqIFJlbW92ZXMgYSBkcmFnIGl0ZW0gaW5zdGFuY2UgZnJvbSB0aGUgcmVnaXN0cnkuICovXG4gIHJlbW92ZURyYWdJdGVtKGRyYWc6IEkpIHtcbiAgICB0aGlzLl9kcmFnSW5zdGFuY2VzLmRlbGV0ZShkcmFnKTtcbiAgICB0aGlzLnN0b3BEcmFnZ2luZyhkcmFnKTtcblxuICAgIGlmICh0aGlzLl9kcmFnSW5zdGFuY2VzLnNpemUgPT09IDApIHtcbiAgICAgIHRoaXMuX2RvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHRoaXMuX3BlcnNpc3RlbnRUb3VjaG1vdmVMaXN0ZW5lcixcbiAgICAgICAgICBhY3RpdmVDYXB0dXJpbmdFdmVudE9wdGlvbnMpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydHMgdGhlIGRyYWdnaW5nIHNlcXVlbmNlIGZvciBhIGRyYWcgaW5zdGFuY2UuXG4gICAqIEBwYXJhbSBkcmFnIERyYWcgaW5zdGFuY2Ugd2hpY2ggaXMgYmVpbmcgZHJhZ2dlZC5cbiAgICogQHBhcmFtIGV2ZW50IEV2ZW50IHRoYXQgaW5pdGlhdGVkIHRoZSBkcmFnZ2luZy5cbiAgICovXG4gIHN0YXJ0RHJhZ2dpbmcoZHJhZzogSSwgZXZlbnQ6IFRvdWNoRXZlbnQgfCBNb3VzZUV2ZW50KSB7XG4gICAgLy8gRG8gbm90IHByb2Nlc3MgdGhlIHNhbWUgZHJhZyB0d2ljZSB0byBhdm9pZCBtZW1vcnkgbGVha3MgYW5kIHJlZHVuZGFudCBsaXN0ZW5lcnNcbiAgICBpZiAodGhpcy5fYWN0aXZlRHJhZ0luc3RhbmNlcy5pbmRleE9mKGRyYWcpID4gLTEpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9hY3RpdmVEcmFnSW5zdGFuY2VzLnB1c2goZHJhZyk7XG5cbiAgICBpZiAodGhpcy5fYWN0aXZlRHJhZ0luc3RhbmNlcy5sZW5ndGggPT09IDEpIHtcbiAgICAgIGNvbnN0IGlzVG91Y2hFdmVudCA9IGV2ZW50LnR5cGUuc3RhcnRzV2l0aCgndG91Y2gnKTtcblxuICAgICAgLy8gV2UgZXhwbGljaXRseSBiaW5kIF9fYWN0aXZlX18gbGlzdGVuZXJzIGhlcmUsIGJlY2F1c2UgbmV3ZXIgYnJvd3NlcnMgd2lsbCBkZWZhdWx0IHRvXG4gICAgICAvLyBwYXNzaXZlIG9uZXMgZm9yIGBtb3VzZW1vdmVgIGFuZCBgdG91Y2htb3ZlYC4gVGhlIGV2ZW50cyBuZWVkIHRvIGJlIGFjdGl2ZSwgYmVjYXVzZSB3ZVxuICAgICAgLy8gdXNlIGBwcmV2ZW50RGVmYXVsdGAgdG8gcHJldmVudCB0aGUgcGFnZSBmcm9tIHNjcm9sbGluZyB3aGlsZSB0aGUgdXNlciBpcyBkcmFnZ2luZy5cbiAgICAgIHRoaXMuX2dsb2JhbExpc3RlbmVyc1xuICAgICAgICAuc2V0KGlzVG91Y2hFdmVudCA/ICd0b3VjaGVuZCcgOiAnbW91c2V1cCcsIHtcbiAgICAgICAgICBoYW5kbGVyOiAoZTogRXZlbnQpID0+IHRoaXMucG9pbnRlclVwLm5leHQoZSBhcyBUb3VjaEV2ZW50IHwgTW91c2VFdmVudCksXG4gICAgICAgICAgb3B0aW9uczogdHJ1ZVxuICAgICAgICB9KVxuICAgICAgICAuc2V0KCdzY3JvbGwnLCB7XG4gICAgICAgICAgaGFuZGxlcjogKGU6IEV2ZW50KSA9PiB0aGlzLnNjcm9sbC5uZXh0KGUpLFxuICAgICAgICAgIC8vIFVzZSBjYXB0dXJpbmcgc28gdGhhdCB3ZSBwaWNrIHVwIHNjcm9sbCBjaGFuZ2VzIGluIGFueSBzY3JvbGxhYmxlIG5vZGVzIHRoYXQgYXJlbid0XG4gICAgICAgICAgLy8gdGhlIGRvY3VtZW50LiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvY29tcG9uZW50cy9pc3N1ZXMvMTcxNDQuXG4gICAgICAgICAgb3B0aW9uczogdHJ1ZVxuICAgICAgICB9KVxuICAgICAgICAvLyBQcmV2ZW50aW5nIHRoZSBkZWZhdWx0IGFjdGlvbiBvbiBgbW91c2Vtb3ZlYCBpc24ndCBlbm91Z2ggdG8gZGlzYWJsZSB0ZXh0IHNlbGVjdGlvblxuICAgICAgICAvLyBvbiBTYWZhcmkgc28gd2UgbmVlZCB0byBwcmV2ZW50IHRoZSBzZWxlY3Rpb24gZXZlbnQgYXMgd2VsbC4gQWx0ZXJuYXRpdmVseSB0aGlzIGNhblxuICAgICAgICAvLyBiZSBkb25lIGJ5IHNldHRpbmcgYHVzZXItc2VsZWN0OiBub25lYCBvbiB0aGUgYGJvZHlgLCBob3dldmVyIGl0IGhhcyBjYXVzZXMgYSBzdHlsZVxuICAgICAgICAvLyByZWNhbGN1bGF0aW9uIHdoaWNoIGNhbiBiZSBleHBlbnNpdmUgb24gcGFnZXMgd2l0aCBhIGxvdCBvZiBlbGVtZW50cy5cbiAgICAgICAgLnNldCgnc2VsZWN0c3RhcnQnLCB7XG4gICAgICAgICAgaGFuZGxlcjogdGhpcy5fcHJldmVudERlZmF1bHRXaGlsZURyYWdnaW5nLFxuICAgICAgICAgIG9wdGlvbnM6IGFjdGl2ZUNhcHR1cmluZ0V2ZW50T3B0aW9uc1xuICAgICAgICB9KTtcblxuICAgICAgLy8gV2UgZG9uJ3QgaGF2ZSB0byBiaW5kIGEgbW92ZSBldmVudCBmb3IgdG91Y2ggZHJhZyBzZXF1ZW5jZXMsIGJlY2F1c2VcbiAgICAgIC8vIHdlIGFscmVhZHkgaGF2ZSBhIHBlcnNpc3RlbnQgZ2xvYmFsIG9uZSBib3VuZCBmcm9tIGByZWdpc3RlckRyYWdJdGVtYC5cbiAgICAgIGlmICghaXNUb3VjaEV2ZW50KSB7XG4gICAgICAgIHRoaXMuX2dsb2JhbExpc3RlbmVycy5zZXQoJ21vdXNlbW92ZScsIHtcbiAgICAgICAgICBoYW5kbGVyOiAoZTogRXZlbnQpID0+IHRoaXMucG9pbnRlck1vdmUubmV4dChlIGFzIE1vdXNlRXZlbnQpLFxuICAgICAgICAgIG9wdGlvbnM6IGFjdGl2ZUNhcHR1cmluZ0V2ZW50T3B0aW9uc1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgICAgdGhpcy5fZ2xvYmFsTGlzdGVuZXJzLmZvckVhY2goKGNvbmZpZywgbmFtZSkgPT4ge1xuICAgICAgICAgIHRoaXMuX2RvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIobmFtZSwgY29uZmlnLmhhbmRsZXIsIGNvbmZpZy5vcHRpb25zKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKiogU3RvcHMgZHJhZ2dpbmcgYSBkcmFnIGl0ZW0gaW5zdGFuY2UuICovXG4gIHN0b3BEcmFnZ2luZyhkcmFnOiBJKSB7XG4gICAgY29uc3QgaW5kZXggPSB0aGlzLl9hY3RpdmVEcmFnSW5zdGFuY2VzLmluZGV4T2YoZHJhZyk7XG5cbiAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgdGhpcy5fYWN0aXZlRHJhZ0luc3RhbmNlcy5zcGxpY2UoaW5kZXgsIDEpO1xuXG4gICAgICBpZiAodGhpcy5fYWN0aXZlRHJhZ0luc3RhbmNlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgdGhpcy5fY2xlYXJHbG9iYWxMaXN0ZW5lcnMoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKiogR2V0cyB3aGV0aGVyIGEgZHJhZyBpdGVtIGluc3RhbmNlIGlzIGN1cnJlbnRseSBiZWluZyBkcmFnZ2VkLiAqL1xuICBpc0RyYWdnaW5nKGRyYWc6IEkpIHtcbiAgICByZXR1cm4gdGhpcy5fYWN0aXZlRHJhZ0luc3RhbmNlcy5pbmRleE9mKGRyYWcpID4gLTE7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLl9kcmFnSW5zdGFuY2VzLmZvckVhY2goaW5zdGFuY2UgPT4gdGhpcy5yZW1vdmVEcmFnSXRlbShpbnN0YW5jZSkpO1xuICAgIHRoaXMuX2Ryb3BJbnN0YW5jZXMuZm9yRWFjaChpbnN0YW5jZSA9PiB0aGlzLnJlbW92ZURyb3BDb250YWluZXIoaW5zdGFuY2UpKTtcbiAgICB0aGlzLl9jbGVhckdsb2JhbExpc3RlbmVycygpO1xuICAgIHRoaXMucG9pbnRlck1vdmUuY29tcGxldGUoKTtcbiAgICB0aGlzLnBvaW50ZXJVcC5jb21wbGV0ZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEV2ZW50IGxpc3RlbmVyIHRoYXQgd2lsbCBwcmV2ZW50IHRoZSBkZWZhdWx0IGJyb3dzZXIgYWN0aW9uIHdoaWxlIHRoZSB1c2VyIGlzIGRyYWdnaW5nLlxuICAgKiBAcGFyYW0gZXZlbnQgRXZlbnQgd2hvc2UgZGVmYXVsdCBhY3Rpb24gc2hvdWxkIGJlIHByZXZlbnRlZC5cbiAgICovXG4gIHByaXZhdGUgX3ByZXZlbnREZWZhdWx0V2hpbGVEcmFnZ2luZyA9IChldmVudDogRXZlbnQpID0+IHtcbiAgICBpZiAodGhpcy5fYWN0aXZlRHJhZ0luc3RhbmNlcy5sZW5ndGggPiAwKSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBFdmVudCBsaXN0ZW5lciBmb3IgYHRvdWNobW92ZWAgdGhhdCBpcyBib3VuZCBldmVuIGlmIG5vIGRyYWdnaW5nIGlzIGhhcHBlbmluZy4gKi9cbiAgcHJpdmF0ZSBfcGVyc2lzdGVudFRvdWNobW92ZUxpc3RlbmVyID0gKGV2ZW50OiBUb3VjaEV2ZW50KSA9PiB7XG4gICAgaWYgKHRoaXMuX2FjdGl2ZURyYWdJbnN0YW5jZXMubGVuZ3RoID4gMCkge1xuICAgICAgLy8gTm90ZSB0aGF0IHdlIG9ubHkgd2FudCB0byBwcmV2ZW50IHRoZSBkZWZhdWx0IGFjdGlvbiBhZnRlciBkcmFnZ2luZyBoYXMgYWN0dWFsbHkgc3RhcnRlZC5cbiAgICAgIC8vIFVzdWFsbHkgdGhpcyBpcyB0aGUgc2FtZSB0aW1lIGF0IHdoaWNoIHRoZSBpdGVtIGlzIGFkZGVkIHRvIHRoZSBgX2FjdGl2ZURyYWdJbnN0YW5jZXNgLFxuICAgICAgLy8gYnV0IGl0IGNvdWxkIGJlIHB1c2hlZCBiYWNrIGlmIHRoZSB1c2VyIGhhcyBzZXQgdXAgYSBkcmFnIGRlbGF5IG9yIHRocmVzaG9sZC5cbiAgICAgIGlmICh0aGlzLl9hY3RpdmVEcmFnSW5zdGFuY2VzLnNvbWUodGhpcy5fZHJhZ2dpbmdQcmVkaWNhdGUpKSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMucG9pbnRlck1vdmUubmV4dChldmVudCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIENsZWFycyBvdXQgdGhlIGdsb2JhbCBldmVudCBsaXN0ZW5lcnMgZnJvbSB0aGUgYGRvY3VtZW50YC4gKi9cbiAgcHJpdmF0ZSBfY2xlYXJHbG9iYWxMaXN0ZW5lcnMoKSB7XG4gICAgdGhpcy5fZ2xvYmFsTGlzdGVuZXJzLmZvckVhY2goKGNvbmZpZywgbmFtZSkgPT4ge1xuICAgICAgdGhpcy5fZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihuYW1lLCBjb25maWcuaGFuZGxlciwgY29uZmlnLm9wdGlvbnMpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5fZ2xvYmFsTGlzdGVuZXJzLmNsZWFyKCk7XG4gIH1cbn1cbiJdfQ==