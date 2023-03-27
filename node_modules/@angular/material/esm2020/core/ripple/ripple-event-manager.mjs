/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { normalizePassiveListenerOptions, _getEventTarget } from '@angular/cdk/platform';
/** Options used to bind a passive capturing event. */
const passiveCapturingEventOptions = normalizePassiveListenerOptions({
    passive: true,
    capture: true,
});
/** Manages events through delegation so that as few event handlers as possible are bound. */
export class RippleEventManager {
    constructor() {
        this._events = new Map();
        /** Event handler that is bound and which dispatches the events to the different targets. */
        this._delegateEventHandler = (event) => {
            const target = _getEventTarget(event);
            if (target) {
                this._events.get(event.type)?.forEach((handlers, element) => {
                    if (element === target || element.contains(target)) {
                        handlers.forEach(handler => handler.handleEvent(event));
                    }
                });
            }
        };
    }
    /** Adds an event handler. */
    addHandler(ngZone, name, element, handler) {
        const handlersForEvent = this._events.get(name);
        if (handlersForEvent) {
            const handlersForElement = handlersForEvent.get(element);
            if (handlersForElement) {
                handlersForElement.add(handler);
            }
            else {
                handlersForEvent.set(element, new Set([handler]));
            }
        }
        else {
            this._events.set(name, new Map([[element, new Set([handler])]]));
            ngZone.runOutsideAngular(() => {
                document.addEventListener(name, this._delegateEventHandler, passiveCapturingEventOptions);
            });
        }
    }
    /** Removes an event handler. */
    removeHandler(name, element, handler) {
        const handlersForEvent = this._events.get(name);
        if (!handlersForEvent) {
            return;
        }
        const handlersForElement = handlersForEvent.get(element);
        if (!handlersForElement) {
            return;
        }
        handlersForElement.delete(handler);
        if (handlersForElement.size === 0) {
            handlersForEvent.delete(element);
        }
        if (handlersForEvent.size === 0) {
            this._events.delete(name);
            document.removeEventListener(name, this._delegateEventHandler, passiveCapturingEventOptions);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmlwcGxlLWV2ZW50LW1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvY29yZS9yaXBwbGUvcmlwcGxlLWV2ZW50LW1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLCtCQUErQixFQUFFLGVBQWUsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBR3ZGLHNEQUFzRDtBQUN0RCxNQUFNLDRCQUE0QixHQUFHLCtCQUErQixDQUFDO0lBQ25FLE9BQU8sRUFBRSxJQUFJO0lBQ2IsT0FBTyxFQUFFLElBQUk7Q0FDZCxDQUFDLENBQUM7QUFFSCw2RkFBNkY7QUFDN0YsTUFBTSxPQUFPLGtCQUFrQjtJQUEvQjtRQUNVLFlBQU8sR0FBRyxJQUFJLEdBQUcsRUFBc0QsQ0FBQztRQWlEaEYsNEZBQTRGO1FBQ3BGLDBCQUFxQixHQUFHLENBQUMsS0FBWSxFQUFFLEVBQUU7WUFDL0MsTUFBTSxNQUFNLEdBQUcsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRXRDLElBQUksTUFBTSxFQUFFO2dCQUNWLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLEVBQUU7b0JBQzFELElBQUksT0FBTyxLQUFLLE1BQU0sSUFBSSxPQUFPLENBQUMsUUFBUSxDQUFDLE1BQWMsQ0FBQyxFQUFFO3dCQUMxRCxRQUFRLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO3FCQUN6RDtnQkFDSCxDQUFDLENBQUMsQ0FBQzthQUNKO1FBQ0gsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQTNEQyw2QkFBNkI7SUFDN0IsVUFBVSxDQUFDLE1BQWMsRUFBRSxJQUFZLEVBQUUsT0FBb0IsRUFBRSxPQUE0QjtRQUN6RixNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRWhELElBQUksZ0JBQWdCLEVBQUU7WUFDcEIsTUFBTSxrQkFBa0IsR0FBRyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFekQsSUFBSSxrQkFBa0IsRUFBRTtnQkFDdEIsa0JBQWtCLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2FBQ2pDO2lCQUFNO2dCQUNMLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsSUFBSSxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDbkQ7U0FDRjthQUFNO1lBQ0wsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFakUsTUFBTSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsRUFBRTtnQkFDNUIsUUFBUSxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMscUJBQXFCLEVBQUUsNEJBQTRCLENBQUMsQ0FBQztZQUM1RixDQUFDLENBQUMsQ0FBQztTQUNKO0lBQ0gsQ0FBQztJQUVELGdDQUFnQztJQUNoQyxhQUFhLENBQUMsSUFBWSxFQUFFLE9BQW9CLEVBQUUsT0FBNEI7UUFDNUUsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVoRCxJQUFJLENBQUMsZ0JBQWdCLEVBQUU7WUFDckIsT0FBTztTQUNSO1FBRUQsTUFBTSxrQkFBa0IsR0FBRyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFekQsSUFBSSxDQUFDLGtCQUFrQixFQUFFO1lBQ3ZCLE9BQU87U0FDUjtRQUVELGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUVuQyxJQUFJLGtCQUFrQixDQUFDLElBQUksS0FBSyxDQUFDLEVBQUU7WUFDakMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQ2xDO1FBRUQsSUFBSSxnQkFBZ0IsQ0FBQyxJQUFJLEtBQUssQ0FBQyxFQUFFO1lBQy9CLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzFCLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLHFCQUFxQixFQUFFLDRCQUE0QixDQUFDLENBQUM7U0FDOUY7SUFDSCxDQUFDO0NBY0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtub3JtYWxpemVQYXNzaXZlTGlzdGVuZXJPcHRpb25zLCBfZ2V0RXZlbnRUYXJnZXR9IGZyb20gJ0Bhbmd1bGFyL2Nkay9wbGF0Zm9ybSc7XG5pbXBvcnQge05nWm9uZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbi8qKiBPcHRpb25zIHVzZWQgdG8gYmluZCBhIHBhc3NpdmUgY2FwdHVyaW5nIGV2ZW50LiAqL1xuY29uc3QgcGFzc2l2ZUNhcHR1cmluZ0V2ZW50T3B0aW9ucyA9IG5vcm1hbGl6ZVBhc3NpdmVMaXN0ZW5lck9wdGlvbnMoe1xuICBwYXNzaXZlOiB0cnVlLFxuICBjYXB0dXJlOiB0cnVlLFxufSk7XG5cbi8qKiBNYW5hZ2VzIGV2ZW50cyB0aHJvdWdoIGRlbGVnYXRpb24gc28gdGhhdCBhcyBmZXcgZXZlbnQgaGFuZGxlcnMgYXMgcG9zc2libGUgYXJlIGJvdW5kLiAqL1xuZXhwb3J0IGNsYXNzIFJpcHBsZUV2ZW50TWFuYWdlciB7XG4gIHByaXZhdGUgX2V2ZW50cyA9IG5ldyBNYXA8c3RyaW5nLCBNYXA8SFRNTEVsZW1lbnQsIFNldDxFdmVudExpc3RlbmVyT2JqZWN0Pj4+KCk7XG5cbiAgLyoqIEFkZHMgYW4gZXZlbnQgaGFuZGxlci4gKi9cbiAgYWRkSGFuZGxlcihuZ1pvbmU6IE5nWm9uZSwgbmFtZTogc3RyaW5nLCBlbGVtZW50OiBIVE1MRWxlbWVudCwgaGFuZGxlcjogRXZlbnRMaXN0ZW5lck9iamVjdCkge1xuICAgIGNvbnN0IGhhbmRsZXJzRm9yRXZlbnQgPSB0aGlzLl9ldmVudHMuZ2V0KG5hbWUpO1xuXG4gICAgaWYgKGhhbmRsZXJzRm9yRXZlbnQpIHtcbiAgICAgIGNvbnN0IGhhbmRsZXJzRm9yRWxlbWVudCA9IGhhbmRsZXJzRm9yRXZlbnQuZ2V0KGVsZW1lbnQpO1xuXG4gICAgICBpZiAoaGFuZGxlcnNGb3JFbGVtZW50KSB7XG4gICAgICAgIGhhbmRsZXJzRm9yRWxlbWVudC5hZGQoaGFuZGxlcik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBoYW5kbGVyc0ZvckV2ZW50LnNldChlbGVtZW50LCBuZXcgU2V0KFtoYW5kbGVyXSkpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9ldmVudHMuc2V0KG5hbWUsIG5ldyBNYXAoW1tlbGVtZW50LCBuZXcgU2V0KFtoYW5kbGVyXSldXSkpO1xuXG4gICAgICBuZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKG5hbWUsIHRoaXMuX2RlbGVnYXRlRXZlbnRIYW5kbGVyLCBwYXNzaXZlQ2FwdHVyaW5nRXZlbnRPcHRpb25zKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBSZW1vdmVzIGFuIGV2ZW50IGhhbmRsZXIuICovXG4gIHJlbW92ZUhhbmRsZXIobmFtZTogc3RyaW5nLCBlbGVtZW50OiBIVE1MRWxlbWVudCwgaGFuZGxlcjogRXZlbnRMaXN0ZW5lck9iamVjdCkge1xuICAgIGNvbnN0IGhhbmRsZXJzRm9yRXZlbnQgPSB0aGlzLl9ldmVudHMuZ2V0KG5hbWUpO1xuXG4gICAgaWYgKCFoYW5kbGVyc0ZvckV2ZW50KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgaGFuZGxlcnNGb3JFbGVtZW50ID0gaGFuZGxlcnNGb3JFdmVudC5nZXQoZWxlbWVudCk7XG5cbiAgICBpZiAoIWhhbmRsZXJzRm9yRWxlbWVudCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGhhbmRsZXJzRm9yRWxlbWVudC5kZWxldGUoaGFuZGxlcik7XG5cbiAgICBpZiAoaGFuZGxlcnNGb3JFbGVtZW50LnNpemUgPT09IDApIHtcbiAgICAgIGhhbmRsZXJzRm9yRXZlbnQuZGVsZXRlKGVsZW1lbnQpO1xuICAgIH1cblxuICAgIGlmIChoYW5kbGVyc0ZvckV2ZW50LnNpemUgPT09IDApIHtcbiAgICAgIHRoaXMuX2V2ZW50cy5kZWxldGUobmFtZSk7XG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKG5hbWUsIHRoaXMuX2RlbGVnYXRlRXZlbnRIYW5kbGVyLCBwYXNzaXZlQ2FwdHVyaW5nRXZlbnRPcHRpb25zKTtcbiAgICB9XG4gIH1cblxuICAvKiogRXZlbnQgaGFuZGxlciB0aGF0IGlzIGJvdW5kIGFuZCB3aGljaCBkaXNwYXRjaGVzIHRoZSBldmVudHMgdG8gdGhlIGRpZmZlcmVudCB0YXJnZXRzLiAqL1xuICBwcml2YXRlIF9kZWxlZ2F0ZUV2ZW50SGFuZGxlciA9IChldmVudDogRXZlbnQpID0+IHtcbiAgICBjb25zdCB0YXJnZXQgPSBfZ2V0RXZlbnRUYXJnZXQoZXZlbnQpO1xuXG4gICAgaWYgKHRhcmdldCkge1xuICAgICAgdGhpcy5fZXZlbnRzLmdldChldmVudC50eXBlKT8uZm9yRWFjaCgoaGFuZGxlcnMsIGVsZW1lbnQpID0+IHtcbiAgICAgICAgaWYgKGVsZW1lbnQgPT09IHRhcmdldCB8fCBlbGVtZW50LmNvbnRhaW5zKHRhcmdldCBhcyBOb2RlKSkge1xuICAgICAgICAgIGhhbmRsZXJzLmZvckVhY2goaGFuZGxlciA9PiBoYW5kbGVyLmhhbmRsZUV2ZW50KGV2ZW50KSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbn1cbiJdfQ==