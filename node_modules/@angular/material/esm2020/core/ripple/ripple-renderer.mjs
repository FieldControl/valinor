import { normalizePassiveListenerOptions } from '@angular/cdk/platform';
import { isFakeMousedownFromScreenReader, isFakeTouchstartFromScreenReader } from '@angular/cdk/a11y';
import { coerceElement } from '@angular/cdk/coercion';
import { RippleRef } from './ripple-ref';
import { RippleEventManager } from './ripple-event-manager';
/**
 * Default ripple animation configuration for ripples without an explicit
 * animation config specified.
 */
export const defaultRippleAnimationConfig = {
    enterDuration: 225,
    exitDuration: 150,
};
/**
 * Timeout for ignoring mouse events. Mouse events will be temporary ignored after touch
 * events to avoid synthetic mouse events.
 */
const ignoreMouseEventsTimeout = 800;
/** Options used to bind a passive capturing event. */
const passiveCapturingEventOptions = normalizePassiveListenerOptions({
    passive: true,
    capture: true,
});
/** Events that signal that the pointer is down. */
const pointerDownEvents = ['mousedown', 'touchstart'];
/** Events that signal that the pointer is up. */
const pointerUpEvents = ['mouseup', 'mouseleave', 'touchend', 'touchcancel'];
/**
 * Helper service that performs DOM manipulations. Not intended to be used outside this module.
 * The constructor takes a reference to the ripple directive's host element and a map of DOM
 * event handlers to be installed on the element that triggers ripple animations.
 * This will eventually become a custom renderer once Angular support exists.
 * @docs-private
 */
export class RippleRenderer {
    constructor(_target, _ngZone, elementOrElementRef, _platform) {
        this._target = _target;
        this._ngZone = _ngZone;
        this._platform = _platform;
        /** Whether the pointer is currently down or not. */
        this._isPointerDown = false;
        /**
         * Map of currently active ripple references.
         * The ripple reference is mapped to its element event listeners.
         * The reason why `| null` is used is that event listeners are added only
         * when the condition is truthy (see the `_startFadeOutTransition` method).
         */
        this._activeRipples = new Map();
        /** Whether pointer-up event listeners have been registered. */
        this._pointerUpEventsRegistered = false;
        // Only do anything if we're on the browser.
        if (_platform.isBrowser) {
            this._containerElement = coerceElement(elementOrElementRef);
        }
    }
    /**
     * Fades in a ripple at the given coordinates.
     * @param x Coordinate within the element, along the X axis at which to start the ripple.
     * @param y Coordinate within the element, along the Y axis at which to start the ripple.
     * @param config Extra ripple options.
     */
    fadeInRipple(x, y, config = {}) {
        const containerRect = (this._containerRect =
            this._containerRect || this._containerElement.getBoundingClientRect());
        const animationConfig = { ...defaultRippleAnimationConfig, ...config.animation };
        if (config.centered) {
            x = containerRect.left + containerRect.width / 2;
            y = containerRect.top + containerRect.height / 2;
        }
        const radius = config.radius || distanceToFurthestCorner(x, y, containerRect);
        const offsetX = x - containerRect.left;
        const offsetY = y - containerRect.top;
        const enterDuration = animationConfig.enterDuration;
        const ripple = document.createElement('div');
        ripple.classList.add('mat-ripple-element');
        ripple.style.left = `${offsetX - radius}px`;
        ripple.style.top = `${offsetY - radius}px`;
        ripple.style.height = `${radius * 2}px`;
        ripple.style.width = `${radius * 2}px`;
        // If a custom color has been specified, set it as inline style. If no color is
        // set, the default color will be applied through the ripple theme styles.
        if (config.color != null) {
            ripple.style.backgroundColor = config.color;
        }
        ripple.style.transitionDuration = `${enterDuration}ms`;
        this._containerElement.appendChild(ripple);
        // By default the browser does not recalculate the styles of dynamically created
        // ripple elements. This is critical to ensure that the `scale` animates properly.
        // We enforce a style recalculation by calling `getComputedStyle` and *accessing* a property.
        // See: https://gist.github.com/paulirish/5d52fb081b3570c81e3a
        const computedStyles = window.getComputedStyle(ripple);
        const userTransitionProperty = computedStyles.transitionProperty;
        const userTransitionDuration = computedStyles.transitionDuration;
        // Note: We detect whether animation is forcibly disabled through CSS (e.g. through
        // `transition: none` or `display: none`). This is technically unexpected since animations are
        // controlled through the animation config, but this exists for backwards compatibility. This
        // logic does not need to be super accurate since it covers some edge cases which can be easily
        // avoided by users.
        const animationForciblyDisabledThroughCss = userTransitionProperty === 'none' ||
            // Note: The canonical unit for serialized CSS `<time>` properties is seconds. Additionally
            // some browsers expand the duration for every property (in our case `opacity` and `transform`).
            userTransitionDuration === '0s' ||
            userTransitionDuration === '0s, 0s' ||
            // If the container is 0x0, it's likely `display: none`.
            (containerRect.width === 0 && containerRect.height === 0);
        // Exposed reference to the ripple that will be returned.
        const rippleRef = new RippleRef(this, ripple, config, animationForciblyDisabledThroughCss);
        // Start the enter animation by setting the transform/scale to 100%. The animation will
        // execute as part of this statement because we forced a style recalculation before.
        // Note: We use a 3d transform here in order to avoid an issue in Safari where
        // the ripples aren't clipped when inside the shadow DOM (see #24028).
        ripple.style.transform = 'scale3d(1, 1, 1)';
        rippleRef.state = 0 /* RippleState.FADING_IN */;
        if (!config.persistent) {
            this._mostRecentTransientRipple = rippleRef;
        }
        let eventListeners = null;
        // Do not register the `transition` event listener if fade-in and fade-out duration
        // are set to zero. The events won't fire anyway and we can save resources here.
        if (!animationForciblyDisabledThroughCss && (enterDuration || animationConfig.exitDuration)) {
            this._ngZone.runOutsideAngular(() => {
                const onTransitionEnd = () => this._finishRippleTransition(rippleRef);
                const onTransitionCancel = () => this._destroyRipple(rippleRef);
                ripple.addEventListener('transitionend', onTransitionEnd);
                // If the transition is cancelled (e.g. due to DOM removal), we destroy the ripple
                // directly as otherwise we would keep it part of the ripple container forever.
                // https://www.w3.org/TR/css-transitions-1/#:~:text=no%20longer%20in%20the%20document.
                ripple.addEventListener('transitioncancel', onTransitionCancel);
                eventListeners = { onTransitionEnd, onTransitionCancel };
            });
        }
        // Add the ripple reference to the list of all active ripples.
        this._activeRipples.set(rippleRef, eventListeners);
        // In case there is no fade-in transition duration, we need to manually call the transition
        // end listener because `transitionend` doesn't fire if there is no transition.
        if (animationForciblyDisabledThroughCss || !enterDuration) {
            this._finishRippleTransition(rippleRef);
        }
        return rippleRef;
    }
    /** Fades out a ripple reference. */
    fadeOutRipple(rippleRef) {
        // For ripples already fading out or hidden, this should be a noop.
        if (rippleRef.state === 2 /* RippleState.FADING_OUT */ || rippleRef.state === 3 /* RippleState.HIDDEN */) {
            return;
        }
        const rippleEl = rippleRef.element;
        const animationConfig = { ...defaultRippleAnimationConfig, ...rippleRef.config.animation };
        // This starts the fade-out transition and will fire the transition end listener that
        // removes the ripple element from the DOM.
        rippleEl.style.transitionDuration = `${animationConfig.exitDuration}ms`;
        rippleEl.style.opacity = '0';
        rippleRef.state = 2 /* RippleState.FADING_OUT */;
        // In case there is no fade-out transition duration, we need to manually call the
        // transition end listener because `transitionend` doesn't fire if there is no transition.
        if (rippleRef._animationForciblyDisabledThroughCss || !animationConfig.exitDuration) {
            this._finishRippleTransition(rippleRef);
        }
    }
    /** Fades out all currently active ripples. */
    fadeOutAll() {
        this._getActiveRipples().forEach(ripple => ripple.fadeOut());
    }
    /** Fades out all currently active non-persistent ripples. */
    fadeOutAllNonPersistent() {
        this._getActiveRipples().forEach(ripple => {
            if (!ripple.config.persistent) {
                ripple.fadeOut();
            }
        });
    }
    /** Sets up the trigger event listeners */
    setupTriggerEvents(elementOrElementRef) {
        const element = coerceElement(elementOrElementRef);
        if (!this._platform.isBrowser || !element || element === this._triggerElement) {
            return;
        }
        // Remove all previously registered event listeners from the trigger element.
        this._removeTriggerEvents();
        this._triggerElement = element;
        // Use event delegation for the trigger events since they're
        // set up during creation and are performance-sensitive.
        pointerDownEvents.forEach(type => {
            RippleRenderer._eventManager.addHandler(this._ngZone, type, element, this);
        });
    }
    /**
     * Handles all registered events.
     * @docs-private
     */
    handleEvent(event) {
        if (event.type === 'mousedown') {
            this._onMousedown(event);
        }
        else if (event.type === 'touchstart') {
            this._onTouchStart(event);
        }
        else {
            this._onPointerUp();
        }
        // If pointer-up events haven't been registered yet, do so now.
        // We do this on-demand in order to reduce the total number of event listeners
        // registered by the ripples, which speeds up the rendering time for large UIs.
        if (!this._pointerUpEventsRegistered) {
            // The events for hiding the ripple are bound directly on the trigger, because:
            // 1. Some of them occur frequently (e.g. `mouseleave`) and any advantage we get from
            // delegation will be diminished by having to look through all the data structures often.
            // 2. They aren't as performance-sensitive, because they're bound only after the user
            // has interacted with an element.
            this._ngZone.runOutsideAngular(() => {
                pointerUpEvents.forEach(type => {
                    this._triggerElement.addEventListener(type, this, passiveCapturingEventOptions);
                });
            });
            this._pointerUpEventsRegistered = true;
        }
    }
    /** Method that will be called if the fade-in or fade-in transition completed. */
    _finishRippleTransition(rippleRef) {
        if (rippleRef.state === 0 /* RippleState.FADING_IN */) {
            this._startFadeOutTransition(rippleRef);
        }
        else if (rippleRef.state === 2 /* RippleState.FADING_OUT */) {
            this._destroyRipple(rippleRef);
        }
    }
    /**
     * Starts the fade-out transition of the given ripple if it's not persistent and the pointer
     * is not held down anymore.
     */
    _startFadeOutTransition(rippleRef) {
        const isMostRecentTransientRipple = rippleRef === this._mostRecentTransientRipple;
        const { persistent } = rippleRef.config;
        rippleRef.state = 1 /* RippleState.VISIBLE */;
        // When the timer runs out while the user has kept their pointer down, we want to
        // keep only the persistent ripples and the latest transient ripple. We do this,
        // because we don't want stacked transient ripples to appear after their enter
        // animation has finished.
        if (!persistent && (!isMostRecentTransientRipple || !this._isPointerDown)) {
            rippleRef.fadeOut();
        }
    }
    /** Destroys the given ripple by removing it from the DOM and updating its state. */
    _destroyRipple(rippleRef) {
        const eventListeners = this._activeRipples.get(rippleRef) ?? null;
        this._activeRipples.delete(rippleRef);
        // Clear out the cached bounding rect if we have no more ripples.
        if (!this._activeRipples.size) {
            this._containerRect = null;
        }
        // If the current ref is the most recent transient ripple, unset it
        // avoid memory leaks.
        if (rippleRef === this._mostRecentTransientRipple) {
            this._mostRecentTransientRipple = null;
        }
        rippleRef.state = 3 /* RippleState.HIDDEN */;
        if (eventListeners !== null) {
            rippleRef.element.removeEventListener('transitionend', eventListeners.onTransitionEnd);
            rippleRef.element.removeEventListener('transitioncancel', eventListeners.onTransitionCancel);
        }
        rippleRef.element.remove();
    }
    /** Function being called whenever the trigger is being pressed using mouse. */
    _onMousedown(event) {
        // Screen readers will fire fake mouse events for space/enter. Skip launching a
        // ripple in this case for consistency with the non-screen-reader experience.
        const isFakeMousedown = isFakeMousedownFromScreenReader(event);
        const isSyntheticEvent = this._lastTouchStartEvent &&
            Date.now() < this._lastTouchStartEvent + ignoreMouseEventsTimeout;
        if (!this._target.rippleDisabled && !isFakeMousedown && !isSyntheticEvent) {
            this._isPointerDown = true;
            this.fadeInRipple(event.clientX, event.clientY, this._target.rippleConfig);
        }
    }
    /** Function being called whenever the trigger is being pressed using touch. */
    _onTouchStart(event) {
        if (!this._target.rippleDisabled && !isFakeTouchstartFromScreenReader(event)) {
            // Some browsers fire mouse events after a `touchstart` event. Those synthetic mouse
            // events will launch a second ripple if we don't ignore mouse events for a specific
            // time after a touchstart event.
            this._lastTouchStartEvent = Date.now();
            this._isPointerDown = true;
            // Use `changedTouches` so we skip any touches where the user put
            // their finger down, but used another finger to tap the element again.
            const touches = event.changedTouches;
            for (let i = 0; i < touches.length; i++) {
                this.fadeInRipple(touches[i].clientX, touches[i].clientY, this._target.rippleConfig);
            }
        }
    }
    /** Function being called whenever the trigger is being released. */
    _onPointerUp() {
        if (!this._isPointerDown) {
            return;
        }
        this._isPointerDown = false;
        // Fade-out all ripples that are visible and not persistent.
        this._getActiveRipples().forEach(ripple => {
            // By default, only ripples that are completely visible will fade out on pointer release.
            // If the `terminateOnPointerUp` option is set, ripples that still fade in will also fade out.
            const isVisible = ripple.state === 1 /* RippleState.VISIBLE */ ||
                (ripple.config.terminateOnPointerUp && ripple.state === 0 /* RippleState.FADING_IN */);
            if (!ripple.config.persistent && isVisible) {
                ripple.fadeOut();
            }
        });
    }
    _getActiveRipples() {
        return Array.from(this._activeRipples.keys());
    }
    /** Removes previously registered event listeners from the trigger element. */
    _removeTriggerEvents() {
        const trigger = this._triggerElement;
        if (trigger) {
            pointerDownEvents.forEach(type => RippleRenderer._eventManager.removeHandler(type, trigger, this));
            if (this._pointerUpEventsRegistered) {
                pointerUpEvents.forEach(type => trigger.removeEventListener(type, this, passiveCapturingEventOptions));
            }
        }
    }
}
RippleRenderer._eventManager = new RippleEventManager();
/**
 * Returns the distance from the point (x, y) to the furthest corner of a rectangle.
 */
function distanceToFurthestCorner(x, y, rect) {
    const distX = Math.max(Math.abs(x - rect.left), Math.abs(x - rect.right));
    const distY = Math.max(Math.abs(y - rect.top), Math.abs(y - rect.bottom));
    return Math.sqrt(distX * distX + distY * distY);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmlwcGxlLXJlbmRlcmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL2NvcmUvcmlwcGxlL3JpcHBsZS1yZW5kZXJlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFRQSxPQUFPLEVBQVcsK0JBQStCLEVBQWtCLE1BQU0sdUJBQXVCLENBQUM7QUFDakcsT0FBTyxFQUFDLCtCQUErQixFQUFFLGdDQUFnQyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDcEcsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQ3BELE9BQU8sRUFBQyxTQUFTLEVBQTRCLE1BQU0sY0FBYyxDQUFDO0FBQ2xFLE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBb0IxRDs7O0dBR0c7QUFDSCxNQUFNLENBQUMsTUFBTSw0QkFBNEIsR0FBRztJQUMxQyxhQUFhLEVBQUUsR0FBRztJQUNsQixZQUFZLEVBQUUsR0FBRztDQUNsQixDQUFDO0FBRUY7OztHQUdHO0FBQ0gsTUFBTSx3QkFBd0IsR0FBRyxHQUFHLENBQUM7QUFFckMsc0RBQXNEO0FBQ3RELE1BQU0sNEJBQTRCLEdBQUcsK0JBQStCLENBQUM7SUFDbkUsT0FBTyxFQUFFLElBQUk7SUFDYixPQUFPLEVBQUUsSUFBSTtDQUNkLENBQUMsQ0FBQztBQUVILG1EQUFtRDtBQUNuRCxNQUFNLGlCQUFpQixHQUFHLENBQUMsV0FBVyxFQUFFLFlBQVksQ0FBQyxDQUFDO0FBRXRELGlEQUFpRDtBQUNqRCxNQUFNLGVBQWUsR0FBRyxDQUFDLFNBQVMsRUFBRSxZQUFZLEVBQUUsVUFBVSxFQUFFLGFBQWEsQ0FBQyxDQUFDO0FBRTdFOzs7Ozs7R0FNRztBQUNILE1BQU0sT0FBTyxjQUFjO0lBbUN6QixZQUNVLE9BQXFCLEVBQ3JCLE9BQWUsRUFDdkIsbUJBQTBELEVBQ2xELFNBQW1CO1FBSG5CLFlBQU8sR0FBUCxPQUFPLENB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LENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQzdCLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLDRCQUE0QixDQUFDLENBQ3RFLENBQUM7YUFDSDtTQUNGO0lBQ0gsQ0FBQzs7QUE5VWMsNEJBQWEsR0FBRyxJQUFJLGtCQUFrQixFQUFFLENBQUM7QUFpVjFEOztHQUVHO0FBQ0gsU0FBUyx3QkFBd0IsQ0FBQyxDQUFTLEVBQUUsQ0FBUyxFQUFFLElBQWdCO0lBQ3RFLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQzFFLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQzFFLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxHQUFHLEtBQUssR0FBRyxLQUFLLENBQUMsQ0FBQztBQUNsRCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0VsZW1lbnRSZWYsIE5nWm9uZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge1BsYXRmb3JtLCBub3JtYWxpemVQYXNzaXZlTGlzdGVuZXJPcHRpb25zLCBfZ2V0RXZlbnRUYXJnZXR9IGZyb20gJ0Bhbmd1bGFyL2Nkay9wbGF0Zm9ybSc7XG5pbXBvcnQge2lzRmFrZU1vdXNlZG93bkZyb21TY3JlZW5SZWFkZXIsIGlzRmFrZVRvdWNoc3RhcnRGcm9tU2NyZWVuUmVhZGVyfSBmcm9tICdAYW5ndWxhci9jZGsvYTExeSc7XG5pbXBvcnQge2NvZXJjZUVsZW1lbnR9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5pbXBvcnQge1JpcHBsZVJlZiwgUmlwcGxlU3RhdGUsIFJpcHBsZUNvbmZpZ30gZnJvbSAnLi9yaXBwbGUtcmVmJztcbmltcG9ydCB7UmlwcGxlRXZlbnRNYW5hZ2VyfSBmcm9tICcuL3JpcHBsZS1ldmVudC1tYW5hZ2VyJztcblxuLyoqXG4gKiBJbnRlcmZhY2UgdGhhdCBkZXNjcmliZXMgdGhlIHRhcmdldCBmb3IgbGF1bmNoaW5nIHJpcHBsZXMuXG4gKiBJdCBkZWZpbmVzIHRoZSByaXBwbGUgY29uZmlndXJhdGlvbiBhbmQgZGlzYWJsZWQgc3RhdGUgZm9yIGludGVyYWN0aW9uIHJpcHBsZXMuXG4gKiBAZG9jcy1wcml2YXRlXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmlwcGxlVGFyZ2V0IHtcbiAgLyoqIENvbmZpZ3VyYXRpb24gZm9yIHJpcHBsZXMgdGhhdCBhcmUgbGF1bmNoZWQgb24gcG9pbnRlciBkb3duLiAqL1xuICByaXBwbGVDb25maWc6IFJpcHBsZUNvbmZpZztcbiAgLyoqIFdoZXRoZXIgcmlwcGxlcyBvbiBwb2ludGVyIGRvd24gc2hvdWxkIGJlIGRpc2FibGVkLiAqL1xuICByaXBwbGVEaXNhYmxlZDogYm9vbGVhbjtcbn1cblxuLyoqIEludGVyZmFjZXMgdGhlIGRlZmluZXMgcmlwcGxlIGVsZW1lbnQgdHJhbnNpdGlvbiBldmVudCBsaXN0ZW5lcnMuICovXG5pbnRlcmZhY2UgUmlwcGxlRXZlbnRMaXN0ZW5lcnMge1xuICBvblRyYW5zaXRpb25FbmQ6IEV2ZW50TGlzdGVuZXI7XG4gIG9uVHJhbnNpdGlvbkNhbmNlbDogRXZlbnRMaXN0ZW5lcjtcbn1cblxuLyoqXG4gKiBEZWZhdWx0IHJpcHBsZSBhbmltYXRpb24gY29uZmlndXJhdGlvbiBmb3IgcmlwcGxlcyB3aXRob3V0IGFuIGV4cGxpY2l0XG4gKiBhbmltYXRpb24gY29uZmlnIHNwZWNpZmllZC5cbiAqL1xuZXhwb3J0IGNvbnN0IGRlZmF1bHRSaXBwbGVBbmltYXRpb25Db25maWcgPSB7XG4gIGVudGVyRHVyYXRpb246IDIyNSxcbiAgZXhpdER1cmF0aW9uOiAxNTAsXG59O1xuXG4vKipcbiAqIFRpbWVvdXQgZm9yIGlnbm9yaW5nIG1vdXNlIGV2ZW50cy4gTW91c2UgZXZlbnRzIHdpbGwgYmUgdGVtcG9yYXJ5IGlnbm9yZWQgYWZ0ZXIgdG91Y2hcbiAqIGV2ZW50cyB0byBhdm9pZCBzeW50aGV0aWMgbW91c2UgZXZlbnRzLlxuICovXG5jb25zdCBpZ25vcmVNb3VzZUV2ZW50c1RpbWVvdXQgPSA4MDA7XG5cbi8qKiBPcHRpb25zIHVzZWQgdG8gYmluZCBhIHBhc3NpdmUgY2FwdHVyaW5nIGV2ZW50LiAqL1xuY29uc3QgcGFzc2l2ZUNhcHR1cmluZ0V2ZW50T3B0aW9ucyA9IG5vcm1hbGl6ZVBhc3NpdmVMaXN0ZW5lck9wdGlvbnMoe1xuICBwYXNzaXZlOiB0cnVlLFxuICBjYXB0dXJlOiB0cnVlLFxufSk7XG5cbi8qKiBFdmVudHMgdGhhdCBzaWduYWwgdGhhdCB0aGUgcG9pbnRlciBpcyBkb3duLiAqL1xuY29uc3QgcG9pbnRlckRvd25FdmVudHMgPSBbJ21vdXNlZG93bicsICd0b3VjaHN0YXJ0J107XG5cbi8qKiBFdmVudHMgdGhhdCBzaWduYWwgdGhhdCB0aGUgcG9pbnRlciBpcyB1cC4gKi9cbmNvbnN0IHBvaW50ZXJVcEV2ZW50cyA9IFsnbW91c2V1cCcsICdtb3VzZWxlYXZlJywgJ3RvdWNoZW5kJywgJ3RvdWNoY2FuY2VsJ107XG5cbi8qKlxuICogSGVscGVyIHNlcnZpY2UgdGhhdCBwZXJmb3JtcyBET00gbWFuaXB1bGF0aW9ucy4gTm90IGludGVuZGVkIHRvIGJlIHVzZWQgb3V0c2lkZSB0aGlzIG1vZHVsZS5cbiAqIFRoZSBjb25zdHJ1Y3RvciB0YWtlcyBhIHJlZmVyZW5jZSB0byB0aGUgcmlwcGxlIGRpcmVjdGl2ZSdzIGhvc3QgZWxlbWVudCBhbmQgYSBtYXAgb2YgRE9NXG4gKiBldmVudCBoYW5kbGVycyB0byBiZSBpbnN0YWxsZWQgb24gdGhlIGVsZW1lbnQgdGhhdCB0cmlnZ2VycyByaXBwbGUgYW5pbWF0aW9ucy5cbiAqIFRoaXMgd2lsbCBldmVudHVhbGx5IGJlY29tZSBhIGN1c3RvbSByZW5kZXJlciBvbmNlIEFuZ3VsYXIgc3VwcG9ydCBleGlzdHMuXG4gKiBAZG9jcy1wcml2YXRlXG4gKi9cbmV4cG9ydCBjbGFzcyBSaXBwbGVSZW5kZXJlciBpbXBsZW1lbnRzIEV2ZW50TGlzdGVuZXJPYmplY3Qge1xuICAvKiogRWxlbWVudCB3aGVyZSB0aGUgcmlwcGxlcyBhcmUgYmVpbmcgYWRkZWQgdG8uICovXG4gIHByaXZhdGUgX2NvbnRhaW5lckVsZW1lbnQ6IEhUTUxFbGVtZW50O1xuXG4gIC8qKiBFbGVtZW50IHdoaWNoIHRyaWdnZXJzIHRoZSByaXBwbGUgZWxlbWVudHMgb24gbW91c2UgZXZlbnRzLiAqL1xuICBwcml2YXRlIF90cmlnZ2VyRWxlbWVudDogSFRNTEVsZW1lbnQgfCBudWxsO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBwb2ludGVyIGlzIGN1cnJlbnRseSBkb3duIG9yIG5vdC4gKi9cbiAgcHJpdmF0ZSBfaXNQb2ludGVyRG93biA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBNYXAgb2YgY3VycmVudGx5IGFjdGl2ZSByaXBwbGUgcmVmZXJlbmNlcy5cbiAgICogVGhlIHJpcHBsZSByZWZlcmVuY2UgaXMgbWFwcGVkIHRvIGl0cyBlbGVtZW50IGV2ZW50IGxpc3RlbmVycy5cbiAgICogVGhlIHJlYXNvbiB3aHkgYHwgbnVsbGAgaXMgdXNlZCBpcyB0aGF0IGV2ZW50IGxpc3RlbmVycyBhcmUgYWRkZWQgb25seVxuICAgKiB3aGVuIHRoZSBjb25kaXRpb24gaXMgdHJ1dGh5IChzZWUgdGhlIGBfc3RhcnRGYWRlT3V0VHJhbnNpdGlvbmAgbWV0aG9kKS5cbiAgICovXG4gIHByaXZhdGUgX2FjdGl2ZVJpcHBsZXMgPSBuZXcgTWFwPFJpcHBsZVJlZiwgUmlwcGxlRXZlbnRMaXN0ZW5lcnMgfCBudWxsPigpO1xuXG4gIC8qKiBMYXRlc3Qgbm9uLXBlcnNpc3RlbnQgcmlwcGxlIHRoYXQgd2FzIHRyaWdnZXJlZC4gKi9cbiAgcHJpdmF0ZSBfbW9zdFJlY2VudFRyYW5zaWVudFJpcHBsZTogUmlwcGxlUmVmIHwgbnVsbDtcblxuICAvKiogVGltZSBpbiBtaWxsaXNlY29uZHMgd2hlbiB0aGUgbGFzdCB0b3VjaHN0YXJ0IGV2ZW50IGhhcHBlbmVkLiAqL1xuICBwcml2YXRlIF9sYXN0VG91Y2hTdGFydEV2ZW50OiBudW1iZXI7XG5cbiAgLyoqIFdoZXRoZXIgcG9pbnRlci11cCBldmVudCBsaXN0ZW5lcnMgaGF2ZSBiZWVuIHJlZ2lzdGVyZWQuICovXG4gIHByaXZhdGUgX3BvaW50ZXJVcEV2ZW50c1JlZ2lzdGVyZWQgPSBmYWxzZTtcblxuICAvKipcbiAgICogQ2FjaGVkIGRpbWVuc2lvbnMgb2YgdGhlIHJpcHBsZSBjb250YWluZXIuIFNldCB3aGVuIHRoZSBmaXJzdFxuICAgKiByaXBwbGUgaXMgc2hvd24gYW5kIGNsZWFyZWQgb25jZSBubyBtb3JlIHJpcHBsZXMgYXJlIHZpc2libGUuXG4gICAqL1xuICBwcml2YXRlIF9jb250YWluZXJSZWN0OiBDbGllbnRSZWN0IHwgbnVsbDtcblxuICBwcml2YXRlIHN0YXRpYyBfZXZlbnRNYW5hZ2VyID0gbmV3IFJpcHBsZUV2ZW50TWFuYWdlcigpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgX3RhcmdldDogUmlwcGxlVGFyZ2V0LFxuICAgIHByaXZhdGUgX25nWm9uZTogTmdab25lLFxuICAgIGVsZW1lbnRPckVsZW1lbnRSZWY6IEhUTUxFbGVtZW50IHwgRWxlbWVudFJlZjxIVE1MRWxlbWVudD4sXG4gICAgcHJpdmF0ZSBfcGxhdGZvcm06IFBsYXRmb3JtLFxuICApIHtcbiAgICAvLyBPbmx5IGRvIGFueXRoaW5nIGlmIHdlJ3JlIG9uIHRoZSBicm93c2VyLlxuICAgIGlmIChfcGxhdGZvcm0uaXNCcm93c2VyKSB7XG4gICAgICB0aGlzLl9jb250YWluZXJFbGVtZW50ID0gY29lcmNlRWxlbWVudChlbGVtZW50T3JFbGVtZW50UmVmKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRmFkZXMgaW4gYSByaXBwbGUgYXQgdGhlIGdpdmVuIGNvb3JkaW5hdGVzLlxuICAgKiBAcGFyYW0geCBDb29yZGluYXRlIHdpdGhpbiB0aGUgZWxlbWVudCwgYWxvbmcgdGhlIFggYXhpcyBhdCB3aGljaCB0byBzdGFydCB0aGUgcmlwcGxlLlxuICAgKiBAcGFyYW0geSBDb29yZGluYXRlIHdpdGhpbiB0aGUgZWxlbWVudCwgYWxvbmcgdGhlIFkgYXhpcyBhdCB3aGljaCB0byBzdGFydCB0aGUgcmlwcGxlLlxuICAgKiBAcGFyYW0gY29uZmlnIEV4dHJhIHJpcHBsZSBvcHRpb25zLlxuICAgKi9cbiAgZmFkZUluUmlwcGxlKHg6IG51bWJlciwgeTogbnVtYmVyLCBjb25maWc6IFJpcHBsZUNvbmZpZyA9IHt9KTogUmlwcGxlUmVmIHtcbiAgICBjb25zdCBjb250YWluZXJSZWN0ID0gKHRoaXMuX2NvbnRhaW5lclJlY3QgPVxuICAgICAgdGhpcy5fY29udGFpbmVyUmVjdCB8fCB0aGlzLl9jb250YWluZXJFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpKTtcbiAgICBjb25zdCBhbmltYXRpb25Db25maWcgPSB7Li4uZGVmYXVsdFJpcHBsZUFuaW1hdGlvbkNvbmZpZywgLi4uY29uZmlnLmFuaW1hdGlvbn07XG5cbiAgICBpZiAoY29uZmlnLmNlbnRlcmVkKSB7XG4gICAgICB4ID0gY29udGFpbmVyUmVjdC5sZWZ0ICsgY29udGFpbmVyUmVjdC53aWR0aCAvIDI7XG4gICAgICB5ID0gY29udGFpbmVyUmVjdC50b3AgKyBjb250YWluZXJSZWN0LmhlaWdodCAvIDI7XG4gICAgfVxuXG4gICAgY29uc3QgcmFkaXVzID0gY29uZmlnLnJhZGl1cyB8fCBkaXN0YW5jZVRvRnVydGhlc3RDb3JuZXIoeCwgeSwgY29udGFpbmVyUmVjdCk7XG4gICAgY29uc3Qgb2Zmc2V0WCA9IHggLSBjb250YWluZXJSZWN0LmxlZnQ7XG4gICAgY29uc3Qgb2Zmc2V0WSA9IHkgLSBjb250YWluZXJSZWN0LnRvcDtcbiAgICBjb25zdCBlbnRlckR1cmF0aW9uID0gYW5pbWF0aW9uQ29uZmlnLmVudGVyRHVyYXRpb247XG5cbiAgICBjb25zdCByaXBwbGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICByaXBwbGUuY2xhc3NMaXN0LmFkZCgnbWF0LXJpcHBsZS1lbGVtZW50Jyk7XG5cbiAgICByaXBwbGUuc3R5bGUubGVmdCA9IGAke29mZnNldFggLSByYWRpdXN9cHhgO1xuICAgIHJpcHBsZS5zdHlsZS50b3AgPSBgJHtvZmZzZXRZIC0gcmFkaXVzfXB4YDtcbiAgICByaXBwbGUuc3R5bGUuaGVpZ2h0ID0gYCR7cmFkaXVzICogMn1weGA7XG4gICAgcmlwcGxlLnN0eWxlLndpZHRoID0gYCR7cmFkaXVzICogMn1weGA7XG5cbiAgICAvLyBJZiBhIGN1c3RvbSBjb2xvciBoYXMgYmVlbiBzcGVjaWZpZWQsIHNldCBpdCBhcyBpbmxpbmUgc3R5bGUuIElmIG5vIGNvbG9yIGlzXG4gICAgLy8gc2V0LCB0aGUgZGVmYXVsdCBjb2xvciB3aWxsIGJlIGFwcGxpZWQgdGhyb3VnaCB0aGUgcmlwcGxlIHRoZW1lIHN0eWxlcy5cbiAgICBpZiAoY29uZmlnLmNvbG9yICE9IG51bGwpIHtcbiAgICAgIHJpcHBsZS5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBjb25maWcuY29sb3I7XG4gICAgfVxuXG4gICAgcmlwcGxlLnN0eWxlLnRyYW5zaXRpb25EdXJhdGlvbiA9IGAke2VudGVyRHVyYXRpb259bXNgO1xuXG4gICAgdGhpcy5fY29udGFpbmVyRWxlbWVudC5hcHBlbmRDaGlsZChyaXBwbGUpO1xuXG4gICAgLy8gQnkgZGVmYXVsdCB0aGUgYnJvd3NlciBkb2VzIG5vdCByZWNhbGN1bGF0ZSB0aGUgc3R5bGVzIG9mIGR5bmFtaWNhbGx5IGNyZWF0ZWRcbiAgICAvLyByaXBwbGUgZWxlbWVudHMuIFRoaXMgaXMgY3JpdGljYWwgdG8gZW5zdXJlIHRoYXQgdGhlIGBzY2FsZWAgYW5pbWF0ZXMgcHJvcGVybHkuXG4gICAgLy8gV2UgZW5mb3JjZSBhIHN0eWxlIHJlY2FsY3VsYXRpb24gYnkgY2FsbGluZyBgZ2V0Q29tcHV0ZWRTdHlsZWAgYW5kICphY2Nlc3NpbmcqIGEgcHJvcGVydHkuXG4gICAgLy8gU2VlOiBodHRwczovL2dpc3QuZ2l0aHViLmNvbS9wYXVsaXJpc2gvNWQ1MmZiMDgxYjM1NzBjODFlM2FcbiAgICBjb25zdCBjb21wdXRlZFN0eWxlcyA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHJpcHBsZSk7XG4gICAgY29uc3QgdXNlclRyYW5zaXRpb25Qcm9wZXJ0eSA9IGNvbXB1dGVkU3R5bGVzLnRyYW5zaXRpb25Qcm9wZXJ0eTtcbiAgICBjb25zdCB1c2VyVHJhbnNpdGlvbkR1cmF0aW9uID0gY29tcHV0ZWRTdHlsZXMudHJhbnNpdGlvbkR1cmF0aW9uO1xuXG4gICAgLy8gTm90ZTogV2UgZGV0ZWN0IHdoZXRoZXIgYW5pbWF0aW9uIGlzIGZvcmNpYmx5IGRpc2FibGVkIHRocm91Z2ggQ1NTIChlLmcuIHRocm91Z2hcbiAgICAvLyBgdHJhbnNpdGlvbjogbm9uZWAgb3IgYGRpc3BsYXk6IG5vbmVgKS4gVGhpcyBpcyB0ZWNobmljYWxseSB1bmV4cGVjdGVkIHNpbmNlIGFuaW1hdGlvbnMgYXJlXG4gICAgLy8gY29udHJvbGxlZCB0aHJvdWdoIHRoZSBhbmltYXRpb24gY29uZmlnLCBidXQgdGhpcyBleGlzdHMgZm9yIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5LiBUaGlzXG4gICAgLy8gbG9naWMgZG9lcyBub3QgbmVlZCB0byBiZSBzdXBlciBhY2N1cmF0ZSBzaW5jZSBpdCBjb3ZlcnMgc29tZSBlZGdlIGNhc2VzIHdoaWNoIGNhbiBiZSBlYXNpbHlcbiAgICAvLyBhdm9pZGVkIGJ5IHVzZXJzLlxuICAgIGNvbnN0IGFuaW1hdGlvbkZvcmNpYmx5RGlzYWJsZWRUaHJvdWdoQ3NzID1cbiAgICAgIHVzZXJUcmFuc2l0aW9uUHJvcGVydHkgPT09ICdub25lJyB8fFxuICAgICAgLy8gTm90ZTogVGhlIGNhbm9uaWNhbCB1bml0IGZvciBzZXJpYWxpemVkIENTUyBgPHRpbWU+YCBwcm9wZXJ0aWVzIGlzIHNlY29uZHMuIEFkZGl0aW9uYWxseVxuICAgICAgLy8gc29tZSBicm93c2VycyBleHBhbmQgdGhlIGR1cmF0aW9uIGZvciBldmVyeSBwcm9wZXJ0eSAoaW4gb3VyIGNhc2UgYG9wYWNpdHlgIGFuZCBgdHJhbnNmb3JtYCkuXG4gICAgICB1c2VyVHJhbnNpdGlvbkR1cmF0aW9uID09PSAnMHMnIHx8XG4gICAgICB1c2VyVHJhbnNpdGlvbkR1cmF0aW9uID09PSAnMHMsIDBzJyB8fFxuICAgICAgLy8gSWYgdGhlIGNvbnRhaW5lciBpcyAweDAsIGl0J3MgbGlrZWx5IGBkaXNwbGF5OiBub25lYC5cbiAgICAgIChjb250YWluZXJSZWN0LndpZHRoID09PSAwICYmIGNvbnRhaW5lclJlY3QuaGVpZ2h0ID09PSAwKTtcblxuICAgIC8vIEV4cG9zZWQgcmVmZXJlbmNlIHRvIHRoZSByaXBwbGUgdGhhdCB3aWxsIGJlIHJldHVybmVkLlxuICAgIGNvbnN0IHJpcHBsZVJlZiA9IG5ldyBSaXBwbGVSZWYodGhpcywgcmlwcGxlLCBjb25maWcsIGFuaW1hdGlvbkZvcmNpYmx5RGlzYWJsZWRUaHJvdWdoQ3NzKTtcblxuICAgIC8vIFN0YXJ0IHRoZSBlbnRlciBhbmltYXRpb24gYnkgc2V0dGluZyB0aGUgdHJhbnNmb3JtL3NjYWxlIHRvIDEwMCUuIFRoZSBhbmltYXRpb24gd2lsbFxuICAgIC8vIGV4ZWN1dGUgYXMgcGFydCBvZiB0aGlzIHN0YXRlbWVudCBiZWNhdXNlIHdlIGZvcmNlZCBhIHN0eWxlIHJlY2FsY3VsYXRpb24gYmVmb3JlLlxuICAgIC8vIE5vdGU6IFdlIHVzZSBhIDNkIHRyYW5zZm9ybSBoZXJlIGluIG9yZGVyIHRvIGF2b2lkIGFuIGlzc3VlIGluIFNhZmFyaSB3aGVyZVxuICAgIC8vIHRoZSByaXBwbGVzIGFyZW4ndCBjbGlwcGVkIHdoZW4gaW5zaWRlIHRoZSBzaGFkb3cgRE9NIChzZWUgIzI0MDI4KS5cbiAgICByaXBwbGUuc3R5bGUudHJhbnNmb3JtID0gJ3NjYWxlM2QoMSwgMSwgMSknO1xuXG4gICAgcmlwcGxlUmVmLnN0YXRlID0gUmlwcGxlU3RhdGUuRkFESU5HX0lOO1xuXG4gICAgaWYgKCFjb25maWcucGVyc2lzdGVudCkge1xuICAgICAgdGhpcy5fbW9zdFJlY2VudFRyYW5zaWVudFJpcHBsZSA9IHJpcHBsZVJlZjtcbiAgICB9XG5cbiAgICBsZXQgZXZlbnRMaXN0ZW5lcnM6IFJpcHBsZUV2ZW50TGlzdGVuZXJzIHwgbnVsbCA9IG51bGw7XG5cbiAgICAvLyBEbyBub3QgcmVnaXN0ZXIgdGhlIGB0cmFuc2l0aW9uYCBldmVudCBsaXN0ZW5lciBpZiBmYWRlLWluIGFuZCBmYWRlLW91dCBkdXJhdGlvblxuICAgIC8vIGFyZSBzZXQgdG8gemVyby4gVGhlIGV2ZW50cyB3b24ndCBmaXJlIGFueXdheSBhbmQgd2UgY2FuIHNhdmUgcmVzb3VyY2VzIGhlcmUuXG4gICAgaWYgKCFhbmltYXRpb25Gb3JjaWJseURpc2FibGVkVGhyb3VnaENzcyAmJiAoZW50ZXJEdXJhdGlvbiB8fCBhbmltYXRpb25Db25maWcuZXhpdER1cmF0aW9uKSkge1xuICAgICAgdGhpcy5fbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgICAgY29uc3Qgb25UcmFuc2l0aW9uRW5kID0gKCkgPT4gdGhpcy5fZmluaXNoUmlwcGxlVHJhbnNpdGlvbihyaXBwbGVSZWYpO1xuICAgICAgICBjb25zdCBvblRyYW5zaXRpb25DYW5jZWwgPSAoKSA9PiB0aGlzLl9kZXN0cm95UmlwcGxlKHJpcHBsZVJlZik7XG4gICAgICAgIHJpcHBsZS5hZGRFdmVudExpc3RlbmVyKCd0cmFuc2l0aW9uZW5kJywgb25UcmFuc2l0aW9uRW5kKTtcbiAgICAgICAgLy8gSWYgdGhlIHRyYW5zaXRpb24gaXMgY2FuY2VsbGVkIChlLmcuIGR1ZSB0byBET00gcmVtb3ZhbCksIHdlIGRlc3Ryb3kgdGhlIHJpcHBsZVxuICAgICAgICAvLyBkaXJlY3RseSBhcyBvdGhlcndpc2Ugd2Ugd291bGQga2VlcCBpdCBwYXJ0IG9mIHRoZSByaXBwbGUgY29udGFpbmVyIGZvcmV2ZXIuXG4gICAgICAgIC8vIGh0dHBzOi8vd3d3LnczLm9yZy9UUi9jc3MtdHJhbnNpdGlvbnMtMS8jOn46dGV4dD1ubyUyMGxvbmdlciUyMGluJTIwdGhlJTIwZG9jdW1lbnQuXG4gICAgICAgIHJpcHBsZS5hZGRFdmVudExpc3RlbmVyKCd0cmFuc2l0aW9uY2FuY2VsJywgb25UcmFuc2l0aW9uQ2FuY2VsKTtcbiAgICAgICAgZXZlbnRMaXN0ZW5lcnMgPSB7b25UcmFuc2l0aW9uRW5kLCBvblRyYW5zaXRpb25DYW5jZWx9O1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gQWRkIHRoZSByaXBwbGUgcmVmZXJlbmNlIHRvIHRoZSBsaXN0IG9mIGFsbCBhY3RpdmUgcmlwcGxlcy5cbiAgICB0aGlzLl9hY3RpdmVSaXBwbGVzLnNldChyaXBwbGVSZWYsIGV2ZW50TGlzdGVuZXJzKTtcblxuICAgIC8vIEluIGNhc2UgdGhlcmUgaXMgbm8gZmFkZS1pbiB0cmFuc2l0aW9uIGR1cmF0aW9uLCB3ZSBuZWVkIHRvIG1hbnVhbGx5IGNhbGwgdGhlIHRyYW5zaXRpb25cbiAgICAvLyBlbmQgbGlzdGVuZXIgYmVjYXVzZSBgdHJhbnNpdGlvbmVuZGAgZG9lc24ndCBmaXJlIGlmIHRoZXJlIGlzIG5vIHRyYW5zaXRpb24uXG4gICAgaWYgKGFuaW1hdGlvbkZvcmNpYmx5RGlzYWJsZWRUaHJvdWdoQ3NzIHx8ICFlbnRlckR1cmF0aW9uKSB7XG4gICAgICB0aGlzLl9maW5pc2hSaXBwbGVUcmFuc2l0aW9uKHJpcHBsZVJlZik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJpcHBsZVJlZjtcbiAgfVxuXG4gIC8qKiBGYWRlcyBvdXQgYSByaXBwbGUgcmVmZXJlbmNlLiAqL1xuICBmYWRlT3V0UmlwcGxlKHJpcHBsZVJlZjogUmlwcGxlUmVmKSB7XG4gICAgLy8gRm9yIHJpcHBsZXMgYWxyZWFkeSBmYWRpbmcgb3V0IG9yIGhpZGRlbiwgdGhpcyBzaG91bGQgYmUgYSBub29wLlxuICAgIGlmIChyaXBwbGVSZWYuc3RhdGUgPT09IFJpcHBsZVN0YXRlLkZBRElOR19PVVQgfHwgcmlwcGxlUmVmLnN0YXRlID09PSBSaXBwbGVTdGF0ZS5ISURERU4pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCByaXBwbGVFbCA9IHJpcHBsZVJlZi5lbGVtZW50O1xuICAgIGNvbnN0IGFuaW1hdGlvbkNvbmZpZyA9IHsuLi5kZWZhdWx0UmlwcGxlQW5pbWF0aW9uQ29uZmlnLCAuLi5yaXBwbGVSZWYuY29uZmlnLmFuaW1hdGlvbn07XG5cbiAgICAvLyBUaGlzIHN0YXJ0cyB0aGUgZmFkZS1vdXQgdHJhbnNpdGlvbiBhbmQgd2lsbCBmaXJlIHRoZSB0cmFuc2l0aW9uIGVuZCBsaXN0ZW5lciB0aGF0XG4gICAgLy8gcmVtb3ZlcyB0aGUgcmlwcGxlIGVsZW1lbnQgZnJvbSB0aGUgRE9NLlxuICAgIHJpcHBsZUVsLnN0eWxlLnRyYW5zaXRpb25EdXJhdGlvbiA9IGAke2FuaW1hdGlvbkNvbmZpZy5leGl0RHVyYXRpb259bXNgO1xuICAgIHJpcHBsZUVsLnN0eWxlLm9wYWNpdHkgPSAnMCc7XG4gICAgcmlwcGxlUmVmLnN0YXRlID0gUmlwcGxlU3RhdGUuRkFESU5HX09VVDtcblxuICAgIC8vIEluIGNhc2UgdGhlcmUgaXMgbm8gZmFkZS1vdXQgdHJhbnNpdGlvbiBkdXJhdGlvbiwgd2UgbmVlZCB0byBtYW51YWxseSBjYWxsIHRoZVxuICAgIC8vIHRyYW5zaXRpb24gZW5kIGxpc3RlbmVyIGJlY2F1c2UgYHRyYW5zaXRpb25lbmRgIGRvZXNuJ3QgZmlyZSBpZiB0aGVyZSBpcyBubyB0cmFuc2l0aW9uLlxuICAgIGlmIChyaXBwbGVSZWYuX2FuaW1hdGlvbkZvcmNpYmx5RGlzYWJsZWRUaHJvdWdoQ3NzIHx8ICFhbmltYXRpb25Db25maWcuZXhpdER1cmF0aW9uKSB7XG4gICAgICB0aGlzLl9maW5pc2hSaXBwbGVUcmFuc2l0aW9uKHJpcHBsZVJlZik7XG4gICAgfVxuICB9XG5cbiAgLyoqIEZhZGVzIG91dCBhbGwgY3VycmVudGx5IGFjdGl2ZSByaXBwbGVzLiAqL1xuICBmYWRlT3V0QWxsKCkge1xuICAgIHRoaXMuX2dldEFjdGl2ZVJpcHBsZXMoKS5mb3JFYWNoKHJpcHBsZSA9PiByaXBwbGUuZmFkZU91dCgpKTtcbiAgfVxuXG4gIC8qKiBGYWRlcyBvdXQgYWxsIGN1cnJlbnRseSBhY3RpdmUgbm9uLXBlcnNpc3RlbnQgcmlwcGxlcy4gKi9cbiAgZmFkZU91dEFsbE5vblBlcnNpc3RlbnQoKSB7XG4gICAgdGhpcy5fZ2V0QWN0aXZlUmlwcGxlcygpLmZvckVhY2gocmlwcGxlID0+IHtcbiAgICAgIGlmICghcmlwcGxlLmNvbmZpZy5wZXJzaXN0ZW50KSB7XG4gICAgICAgIHJpcHBsZS5mYWRlT3V0KCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKiogU2V0cyB1cCB0aGUgdHJpZ2dlciBldmVudCBsaXN0ZW5lcnMgKi9cbiAgc2V0dXBUcmlnZ2VyRXZlbnRzKGVsZW1lbnRPckVsZW1lbnRSZWY6IEhUTUxFbGVtZW50IHwgRWxlbWVudFJlZjxIVE1MRWxlbWVudD4pIHtcbiAgICBjb25zdCBlbGVtZW50ID0gY29lcmNlRWxlbWVudChlbGVtZW50T3JFbGVtZW50UmVmKTtcblxuICAgIGlmICghdGhpcy5fcGxhdGZvcm0uaXNCcm93c2VyIHx8ICFlbGVtZW50IHx8IGVsZW1lbnQgPT09IHRoaXMuX3RyaWdnZXJFbGVtZW50KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gUmVtb3ZlIGFsbCBwcmV2aW91c2x5IHJlZ2lzdGVyZWQgZXZlbnQgbGlzdGVuZXJzIGZyb20gdGhlIHRyaWdnZXIgZWxlbWVudC5cbiAgICB0aGlzLl9yZW1vdmVUcmlnZ2VyRXZlbnRzKCk7XG4gICAgdGhpcy5fdHJpZ2dlckVsZW1lbnQgPSBlbGVtZW50O1xuXG4gICAgLy8gVXNlIGV2ZW50IGRlbGVnYXRpb24gZm9yIHRoZSB0cmlnZ2VyIGV2ZW50cyBzaW5jZSB0aGV5J3JlXG4gICAgLy8gc2V0IHVwIGR1cmluZyBjcmVhdGlvbiBhbmQgYXJlIHBlcmZvcm1hbmNlLXNlbnNpdGl2ZS5cbiAgICBwb2ludGVyRG93bkV2ZW50cy5mb3JFYWNoKHR5cGUgPT4ge1xuICAgICAgUmlwcGxlUmVuZGVyZXIuX2V2ZW50TWFuYWdlci5hZGRIYW5kbGVyKHRoaXMuX25nWm9uZSwgdHlwZSwgZWxlbWVudCwgdGhpcyk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyBhbGwgcmVnaXN0ZXJlZCBldmVudHMuXG4gICAqIEBkb2NzLXByaXZhdGVcbiAgICovXG4gIGhhbmRsZUV2ZW50KGV2ZW50OiBFdmVudCkge1xuICAgIGlmIChldmVudC50eXBlID09PSAnbW91c2Vkb3duJykge1xuICAgICAgdGhpcy5fb25Nb3VzZWRvd24oZXZlbnQgYXMgTW91c2VFdmVudCk7XG4gICAgfSBlbHNlIGlmIChldmVudC50eXBlID09PSAndG91Y2hzdGFydCcpIHtcbiAgICAgIHRoaXMuX29uVG91Y2hTdGFydChldmVudCBhcyBUb3VjaEV2ZW50KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fb25Qb2ludGVyVXAoKTtcbiAgICB9XG5cbiAgICAvLyBJZiBwb2ludGVyLXVwIGV2ZW50cyBoYXZlbid0IGJlZW4gcmVnaXN0ZXJlZCB5ZXQsIGRvIHNvIG5vdy5cbiAgICAvLyBXZSBkbyB0aGlzIG9uLWRlbWFuZCBpbiBvcmRlciB0byByZWR1Y2UgdGhlIHRvdGFsIG51bWJlciBvZiBldmVudCBsaXN0ZW5lcnNcbiAgICAvLyByZWdpc3RlcmVkIGJ5IHRoZSByaXBwbGVzLCB3aGljaCBzcGVlZHMgdXAgdGhlIHJlbmRlcmluZyB0aW1lIGZvciBsYXJnZSBVSXMuXG4gICAgaWYgKCF0aGlzLl9wb2ludGVyVXBFdmVudHNSZWdpc3RlcmVkKSB7XG4gICAgICAvLyBUaGUgZXZlbnRzIGZvciBoaWRpbmcgdGhlIHJpcHBsZSBhcmUgYm91bmQgZGlyZWN0bHkgb24gdGhlIHRyaWdnZXIsIGJlY2F1c2U6XG4gICAgICAvLyAxLiBTb21lIG9mIHRoZW0gb2NjdXIgZnJlcXVlbnRseSAoZS5nLiBgbW91c2VsZWF2ZWApIGFuZCBhbnkgYWR2YW50YWdlIHdlIGdldCBmcm9tXG4gICAgICAvLyBkZWxlZ2F0aW9uIHdpbGwgYmUgZGltaW5pc2hlZCBieSBoYXZpbmcgdG8gbG9vayB0aHJvdWdoIGFsbCB0aGUgZGF0YSBzdHJ1Y3R1cmVzIG9mdGVuLlxuICAgICAgLy8gMi4gVGhleSBhcmVuJ3QgYXMgcGVyZm9ybWFuY2Utc2Vuc2l0aXZlLCBiZWNhdXNlIHRoZXkncmUgYm91bmQgb25seSBhZnRlciB0aGUgdXNlclxuICAgICAgLy8gaGFzIGludGVyYWN0ZWQgd2l0aCBhbiBlbGVtZW50LlxuICAgICAgdGhpcy5fbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgICAgcG9pbnRlclVwRXZlbnRzLmZvckVhY2godHlwZSA9PiB7XG4gICAgICAgICAgdGhpcy5fdHJpZ2dlckVsZW1lbnQhLmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgdGhpcywgcGFzc2l2ZUNhcHR1cmluZ0V2ZW50T3B0aW9ucyk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuX3BvaW50ZXJVcEV2ZW50c1JlZ2lzdGVyZWQgPSB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBNZXRob2QgdGhhdCB3aWxsIGJlIGNhbGxlZCBpZiB0aGUgZmFkZS1pbiBvciBmYWRlLWluIHRyYW5zaXRpb24gY29tcGxldGVkLiAqL1xuICBwcml2YXRlIF9maW5pc2hSaXBwbGVUcmFuc2l0aW9uKHJpcHBsZVJlZjogUmlwcGxlUmVmKSB7XG4gICAgaWYgKHJpcHBsZVJlZi5zdGF0ZSA9PT0gUmlwcGxlU3RhdGUuRkFESU5HX0lOKSB7XG4gICAgICB0aGlzLl9zdGFydEZhZGVPdXRUcmFuc2l0aW9uKHJpcHBsZVJlZik7XG4gICAgfSBlbHNlIGlmIChyaXBwbGVSZWYuc3RhdGUgPT09IFJpcHBsZVN0YXRlLkZBRElOR19PVVQpIHtcbiAgICAgIHRoaXMuX2Rlc3Ryb3lSaXBwbGUocmlwcGxlUmVmKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU3RhcnRzIHRoZSBmYWRlLW91dCB0cmFuc2l0aW9uIG9mIHRoZSBnaXZlbiByaXBwbGUgaWYgaXQncyBub3QgcGVyc2lzdGVudCBhbmQgdGhlIHBvaW50ZXJcbiAgICogaXMgbm90IGhlbGQgZG93biBhbnltb3JlLlxuICAgKi9cbiAgcHJpdmF0ZSBfc3RhcnRGYWRlT3V0VHJhbnNpdGlvbihyaXBwbGVSZWY6IFJpcHBsZVJlZikge1xuICAgIGNvbnN0IGlzTW9zdFJlY2VudFRyYW5zaWVudFJpcHBsZSA9IHJpcHBsZVJlZiA9PT0gdGhpcy5fbW9zdFJlY2VudFRyYW5zaWVudFJpcHBsZTtcbiAgICBjb25zdCB7cGVyc2lzdGVudH0gPSByaXBwbGVSZWYuY29uZmlnO1xuXG4gICAgcmlwcGxlUmVmLnN0YXRlID0gUmlwcGxlU3RhdGUuVklTSUJMRTtcblxuICAgIC8vIFdoZW4gdGhlIHRpbWVyIHJ1bnMgb3V0IHdoaWxlIHRoZSB1c2VyIGhhcyBrZXB0IHRoZWlyIHBvaW50ZXIgZG93biwgd2Ugd2FudCB0b1xuICAgIC8vIGtlZXAgb25seSB0aGUgcGVyc2lzdGVudCByaXBwbGVzIGFuZCB0aGUgbGF0ZXN0IHRyYW5zaWVudCByaXBwbGUuIFdlIGRvIHRoaXMsXG4gICAgLy8gYmVjYXVzZSB3ZSBkb24ndCB3YW50IHN0YWNrZWQgdHJhbnNpZW50IHJpcHBsZXMgdG8gYXBwZWFyIGFmdGVyIHRoZWlyIGVudGVyXG4gICAgLy8gYW5pbWF0aW9uIGhhcyBmaW5pc2hlZC5cbiAgICBpZiAoIXBlcnNpc3RlbnQgJiYgKCFpc01vc3RSZWNlbnRUcmFuc2llbnRSaXBwbGUgfHwgIXRoaXMuX2lzUG9pbnRlckRvd24pKSB7XG4gICAgICByaXBwbGVSZWYuZmFkZU91dCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBEZXN0cm95cyB0aGUgZ2l2ZW4gcmlwcGxlIGJ5IHJlbW92aW5nIGl0IGZyb20gdGhlIERPTSBhbmQgdXBkYXRpbmcgaXRzIHN0YXRlLiAqL1xuICBwcml2YXRlIF9kZXN0cm95UmlwcGxlKHJpcHBsZVJlZjogUmlwcGxlUmVmKSB7XG4gICAgY29uc3QgZXZlbnRMaXN0ZW5lcnMgPSB0aGlzLl9hY3RpdmVSaXBwbGVzLmdldChyaXBwbGVSZWYpID8/IG51bGw7XG4gICAgdGhpcy5fYWN0aXZlUmlwcGxlcy5kZWxldGUocmlwcGxlUmVmKTtcblxuICAgIC8vIENsZWFyIG91dCB0aGUgY2FjaGVkIGJvdW5kaW5nIHJlY3QgaWYgd2UgaGF2ZSBubyBtb3JlIHJpcHBsZXMuXG4gICAgaWYgKCF0aGlzLl9hY3RpdmVSaXBwbGVzLnNpemUpIHtcbiAgICAgIHRoaXMuX2NvbnRhaW5lclJlY3QgPSBudWxsO1xuICAgIH1cblxuICAgIC8vIElmIHRoZSBjdXJyZW50IHJlZiBpcyB0aGUgbW9zdCByZWNlbnQgdHJhbnNpZW50IHJpcHBsZSwgdW5zZXQgaXRcbiAgICAvLyBhdm9pZCBtZW1vcnkgbGVha3MuXG4gICAgaWYgKHJpcHBsZVJlZiA9PT0gdGhpcy5fbW9zdFJlY2VudFRyYW5zaWVudFJpcHBsZSkge1xuICAgICAgdGhpcy5fbW9zdFJlY2VudFRyYW5zaWVudFJpcHBsZSA9IG51bGw7XG4gICAgfVxuXG4gICAgcmlwcGxlUmVmLnN0YXRlID0gUmlwcGxlU3RhdGUuSElEREVOO1xuICAgIGlmIChldmVudExpc3RlbmVycyAhPT0gbnVsbCkge1xuICAgICAgcmlwcGxlUmVmLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigndHJhbnNpdGlvbmVuZCcsIGV2ZW50TGlzdGVuZXJzLm9uVHJhbnNpdGlvbkVuZCk7XG4gICAgICByaXBwbGVSZWYuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCd0cmFuc2l0aW9uY2FuY2VsJywgZXZlbnRMaXN0ZW5lcnMub25UcmFuc2l0aW9uQ2FuY2VsKTtcbiAgICB9XG4gICAgcmlwcGxlUmVmLmVsZW1lbnQucmVtb3ZlKCk7XG4gIH1cblxuICAvKiogRnVuY3Rpb24gYmVpbmcgY2FsbGVkIHdoZW5ldmVyIHRoZSB0cmlnZ2VyIGlzIGJlaW5nIHByZXNzZWQgdXNpbmcgbW91c2UuICovXG4gIHByaXZhdGUgX29uTW91c2Vkb3duKGV2ZW50OiBNb3VzZUV2ZW50KSB7XG4gICAgLy8gU2NyZWVuIHJlYWRlcnMgd2lsbCBmaXJlIGZha2UgbW91c2UgZXZlbnRzIGZvciBzcGFjZS9lbnRlci4gU2tpcCBsYXVuY2hpbmcgYVxuICAgIC8vIHJpcHBsZSBpbiB0aGlzIGNhc2UgZm9yIGNvbnNpc3RlbmN5IHdpdGggdGhlIG5vbi1zY3JlZW4tcmVhZGVyIGV4cGVyaWVuY2UuXG4gICAgY29uc3QgaXNGYWtlTW91c2Vkb3duID0gaXNGYWtlTW91c2Vkb3duRnJvbVNjcmVlblJlYWRlcihldmVudCk7XG4gICAgY29uc3QgaXNTeW50aGV0aWNFdmVudCA9XG4gICAgICB0aGlzLl9sYXN0VG91Y2hTdGFydEV2ZW50ICYmXG4gICAgICBEYXRlLm5vdygpIDwgdGhpcy5fbGFzdFRvdWNoU3RhcnRFdmVudCArIGlnbm9yZU1vdXNlRXZlbnRzVGltZW91dDtcblxuICAgIGlmICghdGhpcy5fdGFyZ2V0LnJpcHBsZURpc2FibGVkICYmICFpc0Zha2VNb3VzZWRvd24gJiYgIWlzU3ludGhldGljRXZlbnQpIHtcbiAgICAgIHRoaXMuX2lzUG9pbnRlckRvd24gPSB0cnVlO1xuICAgICAgdGhpcy5mYWRlSW5SaXBwbGUoZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WSwgdGhpcy5fdGFyZ2V0LnJpcHBsZUNvbmZpZyk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEZ1bmN0aW9uIGJlaW5nIGNhbGxlZCB3aGVuZXZlciB0aGUgdHJpZ2dlciBpcyBiZWluZyBwcmVzc2VkIHVzaW5nIHRvdWNoLiAqL1xuICBwcml2YXRlIF9vblRvdWNoU3RhcnQoZXZlbnQ6IFRvdWNoRXZlbnQpIHtcbiAgICBpZiAoIXRoaXMuX3RhcmdldC5yaXBwbGVEaXNhYmxlZCAmJiAhaXNGYWtlVG91Y2hzdGFydEZyb21TY3JlZW5SZWFkZXIoZXZlbnQpKSB7XG4gICAgICAvLyBTb21lIGJyb3dzZXJzIGZpcmUgbW91c2UgZXZlbnRzIGFmdGVyIGEgYHRvdWNoc3RhcnRgIGV2ZW50LiBUaG9zZSBzeW50aGV0aWMgbW91c2VcbiAgICAgIC8vIGV2ZW50cyB3aWxsIGxhdW5jaCBhIHNlY29uZCByaXBwbGUgaWYgd2UgZG9uJ3QgaWdub3JlIG1vdXNlIGV2ZW50cyBmb3IgYSBzcGVjaWZpY1xuICAgICAgLy8gdGltZSBhZnRlciBhIHRvdWNoc3RhcnQgZXZlbnQuXG4gICAgICB0aGlzLl9sYXN0VG91Y2hTdGFydEV2ZW50ID0gRGF0ZS5ub3coKTtcbiAgICAgIHRoaXMuX2lzUG9pbnRlckRvd24gPSB0cnVlO1xuXG4gICAgICAvLyBVc2UgYGNoYW5nZWRUb3VjaGVzYCBzbyB3ZSBza2lwIGFueSB0b3VjaGVzIHdoZXJlIHRoZSB1c2VyIHB1dFxuICAgICAgLy8gdGhlaXIgZmluZ2VyIGRvd24sIGJ1dCB1c2VkIGFub3RoZXIgZmluZ2VyIHRvIHRhcCB0aGUgZWxlbWVudCBhZ2Fpbi5cbiAgICAgIGNvbnN0IHRvdWNoZXMgPSBldmVudC5jaGFuZ2VkVG91Y2hlcztcblxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0b3VjaGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHRoaXMuZmFkZUluUmlwcGxlKHRvdWNoZXNbaV0uY2xpZW50WCwgdG91Y2hlc1tpXS5jbGllbnRZLCB0aGlzLl90YXJnZXQucmlwcGxlQ29uZmlnKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKiogRnVuY3Rpb24gYmVpbmcgY2FsbGVkIHdoZW5ldmVyIHRoZSB0cmlnZ2VyIGlzIGJlaW5nIHJlbGVhc2VkLiAqL1xuICBwcml2YXRlIF9vblBvaW50ZXJVcCgpIHtcbiAgICBpZiAoIXRoaXMuX2lzUG9pbnRlckRvd24pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9pc1BvaW50ZXJEb3duID0gZmFsc2U7XG5cbiAgICAvLyBGYWRlLW91dCBhbGwgcmlwcGxlcyB0aGF0IGFyZSB2aXNpYmxlIGFuZCBub3QgcGVyc2lzdGVudC5cbiAgICB0aGlzLl9nZXRBY3RpdmVSaXBwbGVzKCkuZm9yRWFjaChyaXBwbGUgPT4ge1xuICAgICAgLy8gQnkgZGVmYXVsdCwgb25seSByaXBwbGVzIHRoYXQgYXJlIGNvbXBsZXRlbHkgdmlzaWJsZSB3aWxsIGZhZGUgb3V0IG9uIHBvaW50ZXIgcmVsZWFzZS5cbiAgICAgIC8vIElmIHRoZSBgdGVybWluYXRlT25Qb2ludGVyVXBgIG9wdGlvbiBpcyBzZXQsIHJpcHBsZXMgdGhhdCBzdGlsbCBmYWRlIGluIHdpbGwgYWxzbyBmYWRlIG91dC5cbiAgICAgIGNvbnN0IGlzVmlzaWJsZSA9XG4gICAgICAgIHJpcHBsZS5zdGF0ZSA9PT0gUmlwcGxlU3RhdGUuVklTSUJMRSB8fFxuICAgICAgICAocmlwcGxlLmNvbmZpZy50ZXJtaW5hdGVPblBvaW50ZXJVcCAmJiByaXBwbGUuc3RhdGUgPT09IFJpcHBsZVN0YXRlLkZBRElOR19JTik7XG5cbiAgICAgIGlmICghcmlwcGxlLmNvbmZpZy5wZXJzaXN0ZW50ICYmIGlzVmlzaWJsZSkge1xuICAgICAgICByaXBwbGUuZmFkZU91dCgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0QWN0aXZlUmlwcGxlcygpOiBSaXBwbGVSZWZbXSB7XG4gICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5fYWN0aXZlUmlwcGxlcy5rZXlzKCkpO1xuICB9XG5cbiAgLyoqIFJlbW92ZXMgcHJldmlvdXNseSByZWdpc3RlcmVkIGV2ZW50IGxpc3RlbmVycyBmcm9tIHRoZSB0cmlnZ2VyIGVsZW1lbnQuICovXG4gIF9yZW1vdmVUcmlnZ2VyRXZlbnRzKCkge1xuICAgIGNvbnN0IHRyaWdnZXIgPSB0aGlzLl90cmlnZ2VyRWxlbWVudDtcblxuICAgIGlmICh0cmlnZ2VyKSB7XG4gICAgICBwb2ludGVyRG93bkV2ZW50cy5mb3JFYWNoKHR5cGUgPT5cbiAgICAgICAgUmlwcGxlUmVuZGVyZXIuX2V2ZW50TWFuYWdlci5yZW1vdmVIYW5kbGVyKHR5cGUsIHRyaWdnZXIsIHRoaXMpLFxuICAgICAgKTtcblxuICAgICAgaWYgKHRoaXMuX3BvaW50ZXJVcEV2ZW50c1JlZ2lzdGVyZWQpIHtcbiAgICAgICAgcG9pbnRlclVwRXZlbnRzLmZvckVhY2godHlwZSA9PlxuICAgICAgICAgIHRyaWdnZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCB0aGlzLCBwYXNzaXZlQ2FwdHVyaW5nRXZlbnRPcHRpb25zKSxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBkaXN0YW5jZSBmcm9tIHRoZSBwb2ludCAoeCwgeSkgdG8gdGhlIGZ1cnRoZXN0IGNvcm5lciBvZiBhIHJlY3RhbmdsZS5cbiAqL1xuZnVuY3Rpb24gZGlzdGFuY2VUb0Z1cnRoZXN0Q29ybmVyKHg6IG51bWJlciwgeTogbnVtYmVyLCByZWN0OiBDbGllbnRSZWN0KSB7XG4gIGNvbnN0IGRpc3RYID0gTWF0aC5tYXgoTWF0aC5hYnMoeCAtIHJlY3QubGVmdCksIE1hdGguYWJzKHggLSByZWN0LnJpZ2h0KSk7XG4gIGNvbnN0IGRpc3RZID0gTWF0aC5tYXgoTWF0aC5hYnMoeSAtIHJlY3QudG9wKSwgTWF0aC5hYnMoeSAtIHJlY3QuYm90dG9tKSk7XG4gIHJldHVybiBNYXRoLnNxcnQoZGlzdFggKiBkaXN0WCArIGRpc3RZICogZGlzdFkpO1xufVxuIl19