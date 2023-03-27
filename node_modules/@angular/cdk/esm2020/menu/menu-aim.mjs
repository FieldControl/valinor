/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, inject, Injectable, InjectionToken, NgZone } from '@angular/core';
import { fromEvent, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { throwMissingMenuReference, throwMissingPointerFocusTracker } from './menu-errors';
import * as i0 from "@angular/core";
/** Injection token used for an implementation of MenuAim. */
export const MENU_AIM = new InjectionToken('cdk-menu-aim');
/** Capture every nth mouse move event. */
const MOUSE_MOVE_SAMPLE_FREQUENCY = 3;
/** The number of mouse move events to track. */
const NUM_POINTS = 5;
/**
 * How long to wait before closing a sibling menu if a user stops short of the submenu they were
 * predicted to go into.
 */
const CLOSE_DELAY = 300;
/** Calculate the slope between point a and b. */
function getSlope(a, b) {
    return (b.y - a.y) / (b.x - a.x);
}
/** Calculate the y intercept for the given point and slope. */
function getYIntercept(point, slope) {
    return point.y - slope * point.x;
}
/**
 * Whether the given mouse trajectory line defined by the slope and y intercept falls within the
 * submenu as defined by `submenuPoints`
 * @param submenuPoints the submenu DOMRect points.
 * @param m the slope of the trajectory line.
 * @param b the y intercept of the trajectory line.
 * @return true if any point on the line falls within the submenu.
 */
function isWithinSubmenu(submenuPoints, m, b) {
    const { left, right, top, bottom } = submenuPoints;
    // Check for intersection with each edge of the submenu (left, right, top, bottom)
    // by fixing one coordinate to that edge's coordinate (either x or y) and checking if the
    // other coordinate is within bounds.
    return ((m * left + b >= top && m * left + b <= bottom) ||
        (m * right + b >= top && m * right + b <= bottom) ||
        ((top - b) / m >= left && (top - b) / m <= right) ||
        ((bottom - b) / m >= left && (bottom - b) / m <= right));
}
/**
 * TargetMenuAim predicts if a user is moving into a submenu. It calculates the
 * trajectory of the user's mouse movement in the current menu to determine if the
 * mouse is moving towards an open submenu.
 *
 * The determination is made by calculating the slope of the users last NUM_POINTS moves where each
 * pair of points determines if the trajectory line points into the submenu. It uses consensus
 * approach by checking if at least NUM_POINTS / 2 pairs determine that the user is moving towards
 * to submenu.
 */
export class TargetMenuAim {
    constructor() {
        /** The Angular zone. */
        this._ngZone = inject(NgZone);
        /** The last NUM_POINTS mouse move events. */
        this._points = [];
        /** Emits when this service is destroyed. */
        this._destroyed = new Subject();
    }
    ngOnDestroy() {
        this._destroyed.next();
        this._destroyed.complete();
    }
    /**
     * Set the Menu and its PointerFocusTracker.
     * @param menu The menu that this menu aim service controls.
     * @param pointerTracker The `PointerFocusTracker` for the given menu.
     */
    initialize(menu, pointerTracker) {
        this._menu = menu;
        this._pointerTracker = pointerTracker;
        this._subscribeToMouseMoves();
    }
    /**
     * Calls the `doToggle` callback when it is deemed that the user is not moving towards
     * the submenu.
     * @param doToggle the function called when the user is not moving towards the submenu.
     */
    toggle(doToggle) {
        // If the menu is horizontal the sub-menus open below and there is no risk of premature
        // closing of any sub-menus therefore we automatically resolve the callback.
        if (this._menu.orientation === 'horizontal') {
            doToggle();
        }
        this._checkConfigured();
        const siblingItemIsWaiting = !!this._timeoutId;
        const hasPoints = this._points.length > 1;
        if (hasPoints && !siblingItemIsWaiting) {
            if (this._isMovingToSubmenu()) {
                this._startTimeout(doToggle);
            }
            else {
                doToggle();
            }
        }
        else if (!siblingItemIsWaiting) {
            doToggle();
        }
    }
    /**
     * Start the delayed toggle handler if one isn't running already.
     *
     * The delayed toggle handler executes the `doToggle` callback after some period of time iff the
     * users mouse is on an item in the current menu.
     *
     * @param doToggle the function called when the user is not moving towards the submenu.
     */
    _startTimeout(doToggle) {
        // If the users mouse is moving towards a submenu we don't want to immediately resolve.
        // Wait for some period of time before determining if the previous menu should close in
        // cases where the user may have moved towards the submenu but stopped on a sibling menu
        // item intentionally.
        const timeoutId = setTimeout(() => {
            // Resolve if the user is currently moused over some element in the root menu
            if (this._pointerTracker.activeElement && timeoutId === this._timeoutId) {
                doToggle();
            }
            this._timeoutId = null;
        }, CLOSE_DELAY);
        this._timeoutId = timeoutId;
    }
    /** Whether the user is heading towards the open submenu. */
    _isMovingToSubmenu() {
        const submenuPoints = this._getSubmenuBounds();
        if (!submenuPoints) {
            return false;
        }
        let numMoving = 0;
        const currPoint = this._points[this._points.length - 1];
        // start from the second last point and calculate the slope between each point and the last
        // point.
        for (let i = this._points.length - 2; i >= 0; i--) {
            const previous = this._points[i];
            const slope = getSlope(currPoint, previous);
            if (isWithinSubmenu(submenuPoints, slope, getYIntercept(currPoint, slope))) {
                numMoving++;
            }
        }
        return numMoving >= Math.floor(NUM_POINTS / 2);
    }
    /** Get the bounding DOMRect for the open submenu. */
    _getSubmenuBounds() {
        return this._pointerTracker?.previousElement?.getMenu()?.nativeElement.getBoundingClientRect();
    }
    /**
     * Check if a reference to the PointerFocusTracker and menu element is provided.
     * @throws an error if neither reference is provided.
     */
    _checkConfigured() {
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
            if (!this._pointerTracker) {
                throwMissingPointerFocusTracker();
            }
            if (!this._menu) {
                throwMissingMenuReference();
            }
        }
    }
    /** Subscribe to the root menus mouse move events and update the tracked mouse points. */
    _subscribeToMouseMoves() {
        this._ngZone.runOutsideAngular(() => {
            fromEvent(this._menu.nativeElement, 'mousemove')
                .pipe(filter((_, index) => index % MOUSE_MOVE_SAMPLE_FREQUENCY === 0), takeUntil(this._destroyed))
                .subscribe((event) => {
                this._points.push({ x: event.clientX, y: event.clientY });
                if (this._points.length > NUM_POINTS) {
                    this._points.shift();
                }
            });
        });
    }
}
TargetMenuAim.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: TargetMenuAim, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
TargetMenuAim.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: TargetMenuAim });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: TargetMenuAim, decorators: [{
            type: Injectable
        }] });
/**
 * CdkTargetMenuAim is a provider for the TargetMenuAim service. It can be added to an
 * element with either the `cdkMenu` or `cdkMenuBar` directive and child menu items.
 */
export class CdkTargetMenuAim {
}
CdkTargetMenuAim.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: CdkTargetMenuAim, deps: [], target: i0.ɵɵFactoryTarget.Directive });
CdkTargetMenuAim.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "15.2.0-rc.0", type: CdkTargetMenuAim, isStandalone: true, selector: "[cdkTargetMenuAim]", providers: [{ provide: MENU_AIM, useClass: TargetMenuAim }], exportAs: ["cdkTargetMenuAim"], ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: CdkTargetMenuAim, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkTargetMenuAim]',
                    exportAs: 'cdkTargetMenuAim',
                    standalone: true,
                    providers: [{ provide: MENU_AIM, useClass: TargetMenuAim }],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1haW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL21lbnUvbWVudS1haW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFNBQVMsRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRSxNQUFNLEVBQVksTUFBTSxlQUFlLENBQUM7QUFDL0YsT0FBTyxFQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDeEMsT0FBTyxFQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUdqRCxPQUFPLEVBQUMseUJBQXlCLEVBQUUsK0JBQStCLEVBQUMsTUFBTSxlQUFlLENBQUM7O0FBdUJ6Riw2REFBNkQ7QUFDN0QsTUFBTSxDQUFDLE1BQU0sUUFBUSxHQUFHLElBQUksY0FBYyxDQUFVLGNBQWMsQ0FBQyxDQUFDO0FBRXBFLDBDQUEwQztBQUMxQyxNQUFNLDJCQUEyQixHQUFHLENBQUMsQ0FBQztBQUV0QyxnREFBZ0Q7QUFDaEQsTUFBTSxVQUFVLEdBQUcsQ0FBQyxDQUFDO0FBRXJCOzs7R0FHRztBQUNILE1BQU0sV0FBVyxHQUFHLEdBQUcsQ0FBQztBQVF4QixpREFBaUQ7QUFDakQsU0FBUyxRQUFRLENBQUMsQ0FBUSxFQUFFLENBQVE7SUFDbEMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbkMsQ0FBQztBQUVELCtEQUErRDtBQUMvRCxTQUFTLGFBQWEsQ0FBQyxLQUFZLEVBQUUsS0FBYTtJQUNoRCxPQUFPLEtBQUssQ0FBQyxDQUFDLEdBQUcsS0FBSyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFDbkMsQ0FBQztBQUtEOzs7Ozs7O0dBT0c7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QUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsYUFBYSxFQUFDLENBQUM7Z0dBRTlDLGdCQUFnQjtrQkFONUIsU0FBUzttQkFBQztvQkFDVCxRQUFRLEVBQUUsb0JBQW9CO29CQUM5QixRQUFRLEVBQUUsa0JBQWtCO29CQUM1QixVQUFVLEVBQUUsSUFBSTtvQkFDaEIsU0FBUyxFQUFFLENBQUMsRUFBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxhQUFhLEVBQUMsQ0FBQztpQkFDMUQiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtEaXJlY3RpdmUsIGluamVjdCwgSW5qZWN0YWJsZSwgSW5qZWN0aW9uVG9rZW4sIE5nWm9uZSwgT25EZXN0cm95fSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7ZnJvbUV2ZW50LCBTdWJqZWN0fSBmcm9tICdyeGpzJztcbmltcG9ydCB7ZmlsdGVyLCB0YWtlVW50aWx9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7Rm9jdXNhYmxlRWxlbWVudCwgUG9pbnRlckZvY3VzVHJhY2tlcn0gZnJvbSAnLi9wb2ludGVyLWZvY3VzLXRyYWNrZXInO1xuaW1wb3J0IHtNZW51fSBmcm9tICcuL21lbnUtaW50ZXJmYWNlJztcbmltcG9ydCB7dGhyb3dNaXNzaW5nTWVudVJlZmVyZW5jZSwgdGhyb3dNaXNzaW5nUG9pbnRlckZvY3VzVHJhY2tlcn0gZnJvbSAnLi9tZW51LWVycm9ycyc7XG5cbi8qKlxuICogTWVudUFpbSBpcyByZXNwb25zaWJsZSBmb3IgZGV0ZXJtaW5pbmcgaWYgYSBzaWJsaW5nIG1lbnVpdGVtJ3MgbWVudSBzaG91bGQgYmUgY2xvc2VkIHdoZW4gYVxuICogVG9nZ2xlciBpdGVtIGlzIGhvdmVyZWQgaW50by4gSXQgaXMgdXAgdG8gdGhlIGhvdmVyZWQgaW4gaXRlbSB0byBjYWxsIHRoZSBNZW51QWltIHNlcnZpY2UgaW5cbiAqIG9yZGVyIHRvIGRldGVybWluZSBpZiBpdCBtYXkgcGVyZm9ybSBpdHMgY2xvc2UgYWN0aW9ucy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBNZW51QWltIHtcbiAgLyoqXG4gICAqIFNldCB0aGUgTWVudSBhbmQgaXRzIFBvaW50ZXJGb2N1c1RyYWNrZXIuXG4gICAqIEBwYXJhbSBtZW51IFRoZSBtZW51IHRoYXQgdGhpcyBtZW51IGFpbSBzZXJ2aWNlIGNvbnRyb2xzLlxuICAgKiBAcGFyYW0gcG9pbnRlclRyYWNrZXIgVGhlIGBQb2ludGVyRm9jdXNUcmFja2VyYCBmb3IgdGhlIGdpdmVuIG1lbnUuXG4gICAqL1xuICBpbml0aWFsaXplKG1lbnU6IE1lbnUsIHBvaW50ZXJUcmFja2VyOiBQb2ludGVyRm9jdXNUcmFja2VyPEZvY3VzYWJsZUVsZW1lbnQgJiBUb2dnbGVyPik6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIENhbGxzIHRoZSBgZG9Ub2dnbGVgIGNhbGxiYWNrIHdoZW4gaXQgaXMgZGVlbWVkIHRoYXQgdGhlIHVzZXIgaXMgbm90IG1vdmluZyB0b3dhcmRzXG4gICAqIHRoZSBzdWJtZW51LlxuICAgKiBAcGFyYW0gZG9Ub2dnbGUgdGhlIGZ1bmN0aW9uIGNhbGxlZCB3aGVuIHRoZSB1c2VyIGlzIG5vdCBtb3ZpbmcgdG93YXJkcyB0aGUgc3VibWVudS5cbiAgICovXG4gIHRvZ2dsZShkb1RvZ2dsZTogKCkgPT4gdm9pZCk6IHZvaWQ7XG59XG5cbi8qKiBJbmplY3Rpb24gdG9rZW4gdXNlZCBmb3IgYW4gaW1wbGVtZW50YXRpb24gb2YgTWVudUFpbS4gKi9cbmV4cG9ydCBjb25zdCBNRU5VX0FJTSA9IG5ldyBJbmplY3Rpb25Ub2tlbjxNZW51QWltPignY2RrLW1lbnUtYWltJyk7XG5cbi8qKiBDYXB0dXJlIGV2ZXJ5IG50aCBtb3VzZSBtb3ZlIGV2ZW50LiAqL1xuY29uc3QgTU9VU0VfTU9WRV9TQU1QTEVfRlJFUVVFTkNZID0gMztcblxuLyoqIFRoZSBudW1iZXIgb2YgbW91c2UgbW92ZSBldmVudHMgdG8gdHJhY2suICovXG5jb25zdCBOVU1fUE9JTlRTID0gNTtcblxuLyoqXG4gKiBIb3cgbG9uZyB0byB3YWl0IGJlZm9yZSBjbG9zaW5nIGEgc2libGluZyBtZW51IGlmIGEgdXNlciBzdG9wcyBzaG9ydCBvZiB0aGUgc3VibWVudSB0aGV5IHdlcmVcbiAqIHByZWRpY3RlZCB0byBnbyBpbnRvLlxuICovXG5jb25zdCBDTE9TRV9ERUxBWSA9IDMwMDtcblxuLyoqIEFuIGVsZW1lbnQgd2hpY2ggd2hlbiBob3ZlcmVkIG92ZXIgbWF5IG9wZW4gb3IgY2xvc2UgYSBtZW51LiAqL1xuZXhwb3J0IGludGVyZmFjZSBUb2dnbGVyIHtcbiAgLyoqIEdldHMgdGhlIG9wZW4gbWVudSwgb3IgdW5kZWZpbmVkIGlmIG5vIG1lbnUgaXMgb3Blbi4gKi9cbiAgZ2V0TWVudSgpOiBNZW51IHwgdW5kZWZpbmVkO1xufVxuXG4vKiogQ2FsY3VsYXRlIHRoZSBzbG9wZSBiZXR3ZWVuIHBvaW50IGEgYW5kIGIuICovXG5mdW5jdGlvbiBnZXRTbG9wZShhOiBQb2ludCwgYjogUG9pbnQpIHtcbiAgcmV0dXJuIChiLnkgLSBhLnkpIC8gKGIueCAtIGEueCk7XG59XG5cbi8qKiBDYWxjdWxhdGUgdGhlIHkgaW50ZXJjZXB0IGZvciB0aGUgZ2l2ZW4gcG9pbnQgYW5kIHNsb3BlLiAqL1xuZnVuY3Rpb24gZ2V0WUludGVyY2VwdChwb2ludDogUG9pbnQsIHNsb3BlOiBudW1iZXIpIHtcbiAgcmV0dXJuIHBvaW50LnkgLSBzbG9wZSAqIHBvaW50Lng7XG59XG5cbi8qKiBSZXByZXNlbnRzIGEgY29vcmRpbmF0ZSBvZiBtb3VzZSB0cmF2ZWwuICovXG50eXBlIFBvaW50ID0ge3g6IG51bWJlcjsgeTogbnVtYmVyfTtcblxuLyoqXG4gKiBXaGV0aGVyIHRoZSBnaXZlbiBtb3VzZSB0cmFqZWN0b3J5IGxpbmUgZGVmaW5lZCBieSB0aGUgc2xvcGUgYW5kIHkgaW50ZXJjZXB0IGZhbGxzIHdpdGhpbiB0aGVcbiAqIHN1Ym1lbnUgYXMgZGVmaW5lZCBieSBgc3VibWVudVBvaW50c2BcbiAqIEBwYXJhbSBzdWJtZW51UG9pbnRzIHRoZSBzdWJtZW51IERPTVJlY3QgcG9pbnRzLlxuICogQHBhcmFtIG0gdGhlIHNsb3BlIG9mIHRoZSB0cmFqZWN0b3J5IGxpbmUuXG4gKiBAcGFyYW0gYiB0aGUgeSBpbnRlcmNlcHQgb2YgdGhlIHRyYWplY3RvcnkgbGluZS5cbiAqIEByZXR1cm4gdHJ1ZSBpZiBhbnkgcG9pbnQgb24gdGhlIGxpbmUgZmFsbHMgd2l0aGluIHRoZSBzdWJtZW51LlxuICovXG5mdW5jdGlvbiBpc1dpdGhpblN1Ym1lbnUoc3VibWVudVBvaW50czogRE9NUmVjdCwgbTogbnVtYmVyLCBiOiBudW1iZXIpIHtcbiAgY29uc3Qge2xlZnQsIHJpZ2h0LCB0b3AsIGJvdHRvbX0gPSBzdWJtZW51UG9pbnRzO1xuXG4gIC8vIENoZWNrIGZvciBpbnRlcnNlY3Rpb24gd2l0aCBlYWNoIGVkZ2Ugb2YgdGhlIHN1Ym1lbnUgKGxlZnQsIHJpZ2h0LCB0b3AsIGJvdHRvbSlcbiAgLy8gYnkgZml4aW5nIG9uZSBjb29yZGluYXRlIHRvIHRoYXQgZWRnZSdzIGNvb3JkaW5hdGUgKGVpdGhlciB4IG9yIHkpIGFuZCBjaGVja2luZyBpZiB0aGVcbiAgLy8gb3RoZXIgY29vcmRpbmF0ZSBpcyB3aXRoaW4gYm91bmRzLlxuICByZXR1cm4gKFxuICAgIChtICogbGVmdCArIGIgPj0gdG9wICYmIG0gKiBsZWZ0ICsgYiA8PSBib3R0b20pIHx8XG4gICAgKG0gKiByaWdodCArIGIgPj0gdG9wICYmIG0gKiByaWdodCArIGIgPD0gYm90dG9tKSB8fFxuICAgICgodG9wIC0gYikgLyBtID49IGxlZnQgJiYgKHRvcCAtIGIpIC8gbSA8PSByaWdodCkgfHxcbiAgICAoKGJvdHRvbSAtIGIpIC8gbSA+PSBsZWZ0ICYmIChib3R0b20gLSBiKSAvIG0gPD0gcmlnaHQpXG4gICk7XG59XG5cbi8qKlxuICogVGFyZ2V0TWVudUFpbSBwcmVkaWN0cyBpZiBhIHVzZXIgaXMgbW92aW5nIGludG8gYSBzdWJtZW51LiBJdCBjYWxjdWxhdGVzIHRoZVxuICogdHJhamVjdG9yeSBvZiB0aGUgdXNlcidzIG1vdXNlIG1vdmVtZW50IGluIHRoZSBjdXJyZW50IG1lbnUgdG8gZGV0ZXJtaW5lIGlmIHRoZVxuICogbW91c2UgaXMgbW92aW5nIHRvd2FyZHMgYW4gb3BlbiBzdWJtZW51LlxuICpcbiAqIFRoZSBkZXRlcm1pbmF0aW9uIGlzIG1hZGUgYnkgY2FsY3VsYXRpbmcgdGhlIHNsb3BlIG9mIHRoZSB1c2VycyBsYXN0IE5VTV9QT0lOVFMgbW92ZXMgd2hlcmUgZWFjaFxuICogcGFpciBvZiBwb2ludHMgZGV0ZXJtaW5lcyBpZiB0aGUgdHJhamVjdG9yeSBsaW5lIHBvaW50cyBpbnRvIHRoZSBzdWJtZW51LiBJdCB1c2VzIGNvbnNlbnN1c1xuICogYXBwcm9hY2ggYnkgY2hlY2tpbmcgaWYgYXQgbGVhc3QgTlVNX1BPSU5UUyAvIDIgcGFpcnMgZGV0ZXJtaW5lIHRoYXQgdGhlIHVzZXIgaXMgbW92aW5nIHRvd2FyZHNcbiAqIHRvIHN1Ym1lbnUuXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBUYXJnZXRNZW51QWltIGltcGxlbWVudHMgTWVudUFpbSwgT25EZXN0cm95IHtcbiAgLyoqIFRoZSBBbmd1bGFyIHpvbmUuICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX25nWm9uZSA9IGluamVjdChOZ1pvbmUpO1xuXG4gIC8qKiBUaGUgbGFzdCBOVU1fUE9JTlRTIG1vdXNlIG1vdmUgZXZlbnRzLiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9wb2ludHM6IFBvaW50W10gPSBbXTtcblxuICAvKiogUmVmZXJlbmNlIHRvIHRoZSByb290IG1lbnUgaW4gd2hpY2ggd2UgYXJlIHRyYWNraW5nIG1vdXNlIG1vdmVzLiAqL1xuICBwcml2YXRlIF9tZW51OiBNZW51O1xuXG4gIC8qKiBSZWZlcmVuY2UgdG8gdGhlIHJvb3QgbWVudSdzIG1vdXNlIG1hbmFnZXIuICovXG4gIHByaXZhdGUgX3BvaW50ZXJUcmFja2VyOiBQb2ludGVyRm9jdXNUcmFja2VyPFRvZ2dsZXIgJiBGb2N1c2FibGVFbGVtZW50PjtcblxuICAvKiogVGhlIGlkIGFzc29jaWF0ZWQgd2l0aCB0aGUgY3VycmVudCB0aW1lb3V0IGNhbGwgd2FpdGluZyB0byByZXNvbHZlLiAqL1xuICBwcml2YXRlIF90aW1lb3V0SWQ6IG51bWJlciB8IG51bGw7XG5cbiAgLyoqIEVtaXRzIHdoZW4gdGhpcyBzZXJ2aWNlIGlzIGRlc3Ryb3llZC4gKi9cbiAgcHJpdmF0ZSByZWFkb25seSBfZGVzdHJveWVkOiBTdWJqZWN0PHZvaWQ+ID0gbmV3IFN1YmplY3QoKTtcblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLl9kZXN0cm95ZWQubmV4dCgpO1xuICAgIHRoaXMuX2Rlc3Ryb3llZC5jb21wbGV0ZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCB0aGUgTWVudSBhbmQgaXRzIFBvaW50ZXJGb2N1c1RyYWNrZXIuXG4gICAqIEBwYXJhbSBtZW51IFRoZSBtZW51IHRoYXQgdGhpcyBtZW51IGFpbSBzZXJ2aWNlIGNvbnRyb2xzLlxuICAgKiBAcGFyYW0gcG9pbnRlclRyYWNrZXIgVGhlIGBQb2ludGVyRm9jdXNUcmFja2VyYCBmb3IgdGhlIGdpdmVuIG1lbnUuXG4gICAqL1xuICBpbml0aWFsaXplKG1lbnU6IE1lbnUsIHBvaW50ZXJUcmFja2VyOiBQb2ludGVyRm9jdXNUcmFja2VyPEZvY3VzYWJsZUVsZW1lbnQgJiBUb2dnbGVyPikge1xuICAgIHRoaXMuX21lbnUgPSBtZW51O1xuICAgIHRoaXMuX3BvaW50ZXJUcmFja2VyID0gcG9pbnRlclRyYWNrZXI7XG4gICAgdGhpcy5fc3Vic2NyaWJlVG9Nb3VzZU1vdmVzKCk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbHMgdGhlIGBkb1RvZ2dsZWAgY2FsbGJhY2sgd2hlbiBpdCBpcyBkZWVtZWQgdGhhdCB0aGUgdXNlciBpcyBub3QgbW92aW5nIHRvd2FyZHNcbiAgICogdGhlIHN1Ym1lbnUuXG4gICAqIEBwYXJhbSBkb1RvZ2dsZSB0aGUgZnVuY3Rpb24gY2FsbGVkIHdoZW4gdGhlIHVzZXIgaXMgbm90IG1vdmluZyB0b3dhcmRzIHRoZSBzdWJtZW51LlxuICAgKi9cbiAgdG9nZ2xlKGRvVG9nZ2xlOiAoKSA9PiB2b2lkKSB7XG4gICAgLy8gSWYgdGhlIG1lbnUgaXMgaG9yaXpvbnRhbCB0aGUgc3ViLW1lbnVzIG9wZW4gYmVsb3cgYW5kIHRoZXJlIGlzIG5vIHJpc2sgb2YgcHJlbWF0dXJlXG4gICAgLy8gY2xvc2luZyBvZiBhbnkgc3ViLW1lbnVzIHRoZXJlZm9yZSB3ZSBhdXRvbWF0aWNhbGx5IHJlc29sdmUgdGhlIGNhbGxiYWNrLlxuICAgIGlmICh0aGlzLl9tZW51Lm9yaWVudGF0aW9uID09PSAnaG9yaXpvbnRhbCcpIHtcbiAgICAgIGRvVG9nZ2xlKCk7XG4gICAgfVxuXG4gICAgdGhpcy5fY2hlY2tDb25maWd1cmVkKCk7XG5cbiAgICBjb25zdCBzaWJsaW5nSXRlbUlzV2FpdGluZyA9ICEhdGhpcy5fdGltZW91dElkO1xuICAgIGNvbnN0IGhhc1BvaW50cyA9IHRoaXMuX3BvaW50cy5sZW5ndGggPiAxO1xuXG4gICAgaWYgKGhhc1BvaW50cyAmJiAhc2libGluZ0l0ZW1Jc1dhaXRpbmcpIHtcbiAgICAgIGlmICh0aGlzLl9pc01vdmluZ1RvU3VibWVudSgpKSB7XG4gICAgICAgIHRoaXMuX3N0YXJ0VGltZW91dChkb1RvZ2dsZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkb1RvZ2dsZSgpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoIXNpYmxpbmdJdGVtSXNXYWl0aW5nKSB7XG4gICAgICBkb1RvZ2dsZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydCB0aGUgZGVsYXllZCB0b2dnbGUgaGFuZGxlciBpZiBvbmUgaXNuJ3QgcnVubmluZyBhbHJlYWR5LlxuICAgKlxuICAgKiBUaGUgZGVsYXllZCB0b2dnbGUgaGFuZGxlciBleGVjdXRlcyB0aGUgYGRvVG9nZ2xlYCBjYWxsYmFjayBhZnRlciBzb21lIHBlcmlvZCBvZiB0aW1lIGlmZiB0aGVcbiAgICogdXNlcnMgbW91c2UgaXMgb24gYW4gaXRlbSBpbiB0aGUgY3VycmVudCBtZW51LlxuICAgKlxuICAgKiBAcGFyYW0gZG9Ub2dnbGUgdGhlIGZ1bmN0aW9uIGNhbGxlZCB3aGVuIHRoZSB1c2VyIGlzIG5vdCBtb3ZpbmcgdG93YXJkcyB0aGUgc3VibWVudS5cbiAgICovXG4gIHByaXZhdGUgX3N0YXJ0VGltZW91dChkb1RvZ2dsZTogKCkgPT4gdm9pZCkge1xuICAgIC8vIElmIHRoZSB1c2VycyBtb3VzZSBpcyBtb3ZpbmcgdG93YXJkcyBhIHN1Ym1lbnUgd2UgZG9uJ3Qgd2FudCB0byBpbW1lZGlhdGVseSByZXNvbHZlLlxuICAgIC8vIFdhaXQgZm9yIHNvbWUgcGVyaW9kIG9mIHRpbWUgYmVmb3JlIGRldGVybWluaW5nIGlmIHRoZSBwcmV2aW91cyBtZW51IHNob3VsZCBjbG9zZSBpblxuICAgIC8vIGNhc2VzIHdoZXJlIHRoZSB1c2VyIG1heSBoYXZlIG1vdmVkIHRvd2FyZHMgdGhlIHN1Ym1lbnUgYnV0IHN0b3BwZWQgb24gYSBzaWJsaW5nIG1lbnVcbiAgICAvLyBpdGVtIGludGVudGlvbmFsbHkuXG4gICAgY29uc3QgdGltZW91dElkID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAvLyBSZXNvbHZlIGlmIHRoZSB1c2VyIGlzIGN1cnJlbnRseSBtb3VzZWQgb3ZlciBzb21lIGVsZW1lbnQgaW4gdGhlIHJvb3QgbWVudVxuICAgICAgaWYgKHRoaXMuX3BvaW50ZXJUcmFja2VyIS5hY3RpdmVFbGVtZW50ICYmIHRpbWVvdXRJZCA9PT0gdGhpcy5fdGltZW91dElkKSB7XG4gICAgICAgIGRvVG9nZ2xlKCk7XG4gICAgICB9XG4gICAgICB0aGlzLl90aW1lb3V0SWQgPSBudWxsO1xuICAgIH0sIENMT1NFX0RFTEFZKSBhcyBhbnkgYXMgbnVtYmVyO1xuXG4gICAgdGhpcy5fdGltZW91dElkID0gdGltZW91dElkO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIHVzZXIgaXMgaGVhZGluZyB0b3dhcmRzIHRoZSBvcGVuIHN1Ym1lbnUuICovXG4gIHByaXZhdGUgX2lzTW92aW5nVG9TdWJtZW51KCkge1xuICAgIGNvbnN0IHN1Ym1lbnVQb2ludHMgPSB0aGlzLl9nZXRTdWJtZW51Qm91bmRzKCk7XG4gICAgaWYgKCFzdWJtZW51UG9pbnRzKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgbGV0IG51bU1vdmluZyA9IDA7XG4gICAgY29uc3QgY3VyclBvaW50ID0gdGhpcy5fcG9pbnRzW3RoaXMuX3BvaW50cy5sZW5ndGggLSAxXTtcbiAgICAvLyBzdGFydCBmcm9tIHRoZSBzZWNvbmQgbGFzdCBwb2ludCBhbmQgY2FsY3VsYXRlIHRoZSBzbG9wZSBiZXR3ZWVuIGVhY2ggcG9pbnQgYW5kIHRoZSBsYXN0XG4gICAgLy8gcG9pbnQuXG4gICAgZm9yIChsZXQgaSA9IHRoaXMuX3BvaW50cy5sZW5ndGggLSAyOyBpID49IDA7IGktLSkge1xuICAgICAgY29uc3QgcHJldmlvdXMgPSB0aGlzLl9wb2ludHNbaV07XG4gICAgICBjb25zdCBzbG9wZSA9IGdldFNsb3BlKGN1cnJQb2ludCwgcHJldmlvdXMpO1xuICAgICAgaWYgKGlzV2l0aGluU3VibWVudShzdWJtZW51UG9pbnRzLCBzbG9wZSwgZ2V0WUludGVyY2VwdChjdXJyUG9pbnQsIHNsb3BlKSkpIHtcbiAgICAgICAgbnVtTW92aW5nKys7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudW1Nb3ZpbmcgPj0gTWF0aC5mbG9vcihOVU1fUE9JTlRTIC8gMik7XG4gIH1cblxuICAvKiogR2V0IHRoZSBib3VuZGluZyBET01SZWN0IGZvciB0aGUgb3BlbiBzdWJtZW51LiAqL1xuICBwcml2YXRlIF9nZXRTdWJtZW51Qm91bmRzKCk6IERPTVJlY3QgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLl9wb2ludGVyVHJhY2tlcj8ucHJldmlvdXNFbGVtZW50Py5nZXRNZW51KCk/Lm5hdGl2ZUVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgYSByZWZlcmVuY2UgdG8gdGhlIFBvaW50ZXJGb2N1c1RyYWNrZXIgYW5kIG1lbnUgZWxlbWVudCBpcyBwcm92aWRlZC5cbiAgICogQHRocm93cyBhbiBlcnJvciBpZiBuZWl0aGVyIHJlZmVyZW5jZSBpcyBwcm92aWRlZC5cbiAgICovXG4gIHByaXZhdGUgX2NoZWNrQ29uZmlndXJlZCgpIHtcbiAgICBpZiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSB7XG4gICAgICBpZiAoIXRoaXMuX3BvaW50ZXJUcmFja2VyKSB7XG4gICAgICAgIHRocm93TWlzc2luZ1BvaW50ZXJGb2N1c1RyYWNrZXIoKTtcbiAgICAgIH1cbiAgICAgIGlmICghdGhpcy5fbWVudSkge1xuICAgICAgICB0aHJvd01pc3NpbmdNZW51UmVmZXJlbmNlKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqIFN1YnNjcmliZSB0byB0aGUgcm9vdCBtZW51cyBtb3VzZSBtb3ZlIGV2ZW50cyBhbmQgdXBkYXRlIHRoZSB0cmFja2VkIG1vdXNlIHBvaW50cy4gKi9cbiAgcHJpdmF0ZSBfc3Vic2NyaWJlVG9Nb3VzZU1vdmVzKCkge1xuICAgIHRoaXMuX25nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICBmcm9tRXZlbnQ8TW91c2VFdmVudD4odGhpcy5fbWVudS5uYXRpdmVFbGVtZW50LCAnbW91c2Vtb3ZlJylcbiAgICAgICAgLnBpcGUoXG4gICAgICAgICAgZmlsdGVyKChfOiBNb3VzZUV2ZW50LCBpbmRleDogbnVtYmVyKSA9PiBpbmRleCAlIE1PVVNFX01PVkVfU0FNUExFX0ZSRVFVRU5DWSA9PT0gMCksXG4gICAgICAgICAgdGFrZVVudGlsKHRoaXMuX2Rlc3Ryb3llZCksXG4gICAgICAgIClcbiAgICAgICAgLnN1YnNjcmliZSgoZXZlbnQ6IE1vdXNlRXZlbnQpID0+IHtcbiAgICAgICAgICB0aGlzLl9wb2ludHMucHVzaCh7eDogZXZlbnQuY2xpZW50WCwgeTogZXZlbnQuY2xpZW50WX0pO1xuICAgICAgICAgIGlmICh0aGlzLl9wb2ludHMubGVuZ3RoID4gTlVNX1BPSU5UUykge1xuICAgICAgICAgICAgdGhpcy5fcG9pbnRzLnNoaWZ0KCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9KTtcbiAgfVxufVxuXG4vKipcbiAqIENka1RhcmdldE1lbnVBaW0gaXMgYSBwcm92aWRlciBmb3IgdGhlIFRhcmdldE1lbnVBaW0gc2VydmljZS4gSXQgY2FuIGJlIGFkZGVkIHRvIGFuXG4gKiBlbGVtZW50IHdpdGggZWl0aGVyIHRoZSBgY2RrTWVudWAgb3IgYGNka01lbnVCYXJgIGRpcmVjdGl2ZSBhbmQgY2hpbGQgbWVudSBpdGVtcy5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Nka1RhcmdldE1lbnVBaW1dJyxcbiAgZXhwb3J0QXM6ICdjZGtUYXJnZXRNZW51QWltJyxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbiAgcHJvdmlkZXJzOiBbe3Byb3ZpZGU6IE1FTlVfQUlNLCB1c2VDbGFzczogVGFyZ2V0TWVudUFpbX1dLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtUYXJnZXRNZW51QWltIHt9XG4iXX0=