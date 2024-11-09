import { normalizePassiveListenerOptions } from '@angular/cdk/platform';
import { isFakeMousedownFromScreenReader, isFakeTouchstartFromScreenReader } from '@angular/cdk/a11y';
import { coerceElement } from '@angular/cdk/coercion';
import { RippleRef, RippleState } from './ripple-ref';
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
    static { this._eventManager = new RippleEventManager(); }
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
        rippleRef.state = RippleState.FADING_IN;
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
        if (rippleRef.state === RippleState.FADING_OUT || rippleRef.state === RippleState.HIDDEN) {
            return;
        }
        const rippleEl = rippleRef.element;
        const animationConfig = { ...defaultRippleAnimationConfig, ...rippleRef.config.animation };
        // This starts the fade-out transition and will fire the transition end listener that
        // removes the ripple element from the DOM.
        rippleEl.style.transitionDuration = `${animationConfig.exitDuration}ms`;
        rippleEl.style.opacity = '0';
        rippleRef.state = RippleState.FADING_OUT;
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
        if (rippleRef.state === RippleState.FADING_IN) {
            this._startFadeOutTransition(rippleRef);
        }
        else if (rippleRef.state === RippleState.FADING_OUT) {
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
        rippleRef.state = RippleState.VISIBLE;
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
        rippleRef.state = RippleState.HIDDEN;
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
            // According to the typings the touches should always be defined, but in some cases
            // the browser appears to not assign them in tests which leads to flakes.
            if (touches) {
                for (let i = 0; i < touches.length; i++) {
                    this.fadeInRipple(touches[i].clientX, touches[i].clientY, this._target.rippleConfig);
                }
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
            const isVisible = ripple.state === RippleState.VISIBLE ||
                (ripple.config.terminateOnPointerUp && ripple.state === RippleState.FADING_IN);
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
/**
 * Returns the distance from the point (x, y) to the furthest corner of a rectangle.
 */
function distanceToFurthestCorner(x, y, rect) {
    const distX = Math.max(Math.abs(x - rect.left), Math.abs(x - rect.right));
    const distY = Math.max(Math.abs(y - rect.top), Math.abs(y - rect.bottom));
    return Math.sqrt(distX * distX + distY * distY);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmlwcGxlLXJlbmRlcmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL2NvcmUvcmlwcGxlL3JpcHBsZS1yZW5kZXJlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFRQSxPQUFPLEVBQVcsK0JBQStCLEVBQWtCLE1BQU0sdUJBQXVCLENBQUM7QUFDakcsT0FBTyxFQUFDLCtCQUErQixFQUFFLGdDQUFnQyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDcEcsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQ3BELE9BQU8sRUFBQyxTQUFTLEVBQUUsV0FBVyxFQUFlLE1BQU0sY0FBYyxDQUFDO0FBQ2xFLE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBb0IxRDs7O0dBR0c7QUFDSCxNQUFNLENBQUMsTUFBTSw0QkFBNEIsR0FBRztJQUMxQyxhQUFhLEVBQUUsR0FBRztJQUNsQixZQUFZLEVBQUUsR0FBRztDQUNsQixDQUFDO0FBRUY7OztHQUdHO0FBQ0gsTUFBTSx3QkFBd0IsR0FBRyxHQUFHLENBQUM7QUFFckMsc0RBQXNEO0FBQ3RELE1BQU0sNEJBQTRCLEdBQUcsK0JBQStCLENBQUM7SUFDbkUsT0FBTyxFQUFFLElBQUk7SUFDYixPQUFPLEVBQUUsSUFBSTtDQUNkLENBQUMsQ0FBQztBQUVILG1EQUFtRDtBQUNuRCxNQUFNLGlCQUFpQixHQUFHLENBQUMsV0FBVyxFQUFFLFlBQVksQ0FBQyxDQUFDO0FBRXRELGlEQUFpRDtBQUNqRCxNQUFNLGVBQWUsR0FBRyxDQUFDLFNBQVMsRUFBRSxZQUFZLEVBQUUsVUFBVSxFQUFFLGFBQWEsQ0FBQyxDQUFDO0FBRTdFOzs7Ozs7R0FNRztBQUNILE1BQU0sT0FBTyxjQUFjO2FBaUNWLGtCQUFhLEdBQUcsSUFBSSxrQkFBa0IsRUFBRSxBQUEzQixDQUE0QjtJQUV4RCxZQUNVLE9BQXFCLEVBQ3JC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LENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDMUUsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLEdBQUcsS0FBSyxHQUFHLEtBQUssQ0FBQyxDQUFDO0FBQ2xELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7RWxlbWVudFJlZiwgTmdab25lfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7UGxhdGZvcm0sIG5vcm1hbGl6ZVBhc3NpdmVMaXN0ZW5lck9wdGlvbnMsIF9nZXRFdmVudFRhcmdldH0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BsYXRmb3JtJztcbmltcG9ydCB7aXNGYWtlTW91c2Vkb3duRnJvbVNjcmVlblJlYWRlciwgaXNGYWtlVG91Y2hzdGFydEZyb21TY3JlZW5SZWFkZXJ9IGZyb20gJ0Bhbmd1bGFyL2Nkay9hMTF5JztcbmltcG9ydCB7Y29lcmNlRWxlbWVudH0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvZXJjaW9uJztcbmltcG9ydCB7UmlwcGxlUmVmLCBSaXBwbGVTdGF0ZSwgUmlwcGxlQ29uZmlnfSBmcm9tICcuL3JpcHBsZS1yZWYnO1xuaW1wb3J0IHtSaXBwbGVFdmVudE1hbmFnZXJ9IGZyb20gJy4vcmlwcGxlLWV2ZW50LW1hbmFnZXInO1xuXG4vKipcbiAqIEludGVyZmFjZSB0aGF0IGRlc2NyaWJlcyB0aGUgdGFyZ2V0IGZvciBsYXVuY2hpbmcgcmlwcGxlcy5cbiAqIEl0IGRlZmluZXMgdGhlIHJpcHBsZSBjb25maWd1cmF0aW9uIGFuZCBkaXNhYmxlZCBzdGF0ZSBmb3IgaW50ZXJhY3Rpb24gcmlwcGxlcy5cbiAqIEBkb2NzLXByaXZhdGVcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBSaXBwbGVUYXJnZXQge1xuICAvKiogQ29uZmlndXJhdGlvbiBmb3IgcmlwcGxlcyB0aGF0IGFyZSBsYXVuY2hlZCBvbiBwb2ludGVyIGRvd24uICovXG4gIHJpcHBsZUNvbmZpZzogUmlwcGxlQ29uZmlnO1xuICAvKiogV2hldGhlciByaXBwbGVzIG9uIHBvaW50ZXIgZG93biBzaG91bGQgYmUgZGlzYWJsZWQuICovXG4gIHJpcHBsZURpc2FibGVkOiBib29sZWFuO1xufVxuXG4vKiogSW50ZXJmYWNlcyB0aGUgZGVmaW5lcyByaXBwbGUgZWxlbWVudCB0cmFuc2l0aW9uIGV2ZW50IGxpc3RlbmVycy4gKi9cbmludGVyZmFjZSBSaXBwbGVFdmVudExpc3RlbmVycyB7XG4gIG9uVHJhbnNpdGlvbkVuZDogRXZlbnRMaXN0ZW5lcjtcbiAgb25UcmFuc2l0aW9uQ2FuY2VsOiBFdmVudExpc3RlbmVyO1xufVxuXG4vKipcbiAqIERlZmF1bHQgcmlwcGxlIGFuaW1hdGlvbiBjb25maWd1cmF0aW9uIGZvciByaXBwbGVzIHdpdGhvdXQgYW4gZXhwbGljaXRcbiAqIGFuaW1hdGlvbiBjb25maWcgc3BlY2lmaWVkLlxuICovXG5leHBvcnQgY29uc3QgZGVmYXVsdFJpcHBsZUFuaW1hdGlvbkNvbmZpZyA9IHtcbiAgZW50ZXJEdXJhdGlvbjogMjI1LFxuICBleGl0RHVyYXRpb246IDE1MCxcbn07XG5cbi8qKlxuICogVGltZW91dCBmb3IgaWdub3JpbmcgbW91c2UgZXZlbnRzLiBNb3VzZSBldmVudHMgd2lsbCBiZSB0ZW1wb3JhcnkgaWdub3JlZCBhZnRlciB0b3VjaFxuICogZXZlbnRzIHRvIGF2b2lkIHN5bnRoZXRpYyBtb3VzZSBldmVudHMuXG4gKi9cbmNvbnN0IGlnbm9yZU1vdXNlRXZlbnRzVGltZW91dCA9IDgwMDtcblxuLyoqIE9wdGlvbnMgdXNlZCB0byBiaW5kIGEgcGFzc2l2ZSBjYXB0dXJpbmcgZXZlbnQuICovXG5jb25zdCBwYXNzaXZlQ2FwdHVyaW5nRXZlbnRPcHRpb25zID0gbm9ybWFsaXplUGFzc2l2ZUxpc3RlbmVyT3B0aW9ucyh7XG4gIHBhc3NpdmU6IHRydWUsXG4gIGNhcHR1cmU6IHRydWUsXG59KTtcblxuLyoqIEV2ZW50cyB0aGF0IHNpZ25hbCB0aGF0IHRoZSBwb2ludGVyIGlzIGRvd24uICovXG5jb25zdCBwb2ludGVyRG93bkV2ZW50cyA9IFsnbW91c2Vkb3duJywgJ3RvdWNoc3RhcnQnXTtcblxuLyoqIEV2ZW50cyB0aGF0IHNpZ25hbCB0aGF0IHRoZSBwb2ludGVyIGlzIHVwLiAqL1xuY29uc3QgcG9pbnRlclVwRXZlbnRzID0gWydtb3VzZXVwJywgJ21vdXNlbGVhdmUnLCAndG91Y2hlbmQnLCAndG91Y2hjYW5jZWwnXTtcblxuLyoqXG4gKiBIZWxwZXIgc2VydmljZSB0aGF0IHBlcmZvcm1zIERPTSBtYW5pcHVsYXRpb25zLiBOb3QgaW50ZW5kZWQgdG8gYmUgdXNlZCBvdXRzaWRlIHRoaXMgbW9kdWxlLlxuICogVGhlIGNvbnN0cnVjdG9yIHRha2VzIGEgcmVmZXJlbmNlIHRvIHRoZSByaXBwbGUgZGlyZWN0aXZlJ3MgaG9zdCBlbGVtZW50IGFuZCBhIG1hcCBvZiBET01cbiAqIGV2ZW50IGhhbmRsZXJzIHRvIGJlIGluc3RhbGxlZCBvbiB0aGUgZWxlbWVudCB0aGF0IHRyaWdnZXJzIHJpcHBsZSBhbmltYXRpb25zLlxuICogVGhpcyB3aWxsIGV2ZW50dWFsbHkgYmVjb21lIGEgY3VzdG9tIHJlbmRlcmVyIG9uY2UgQW5ndWxhciBzdXBwb3J0IGV4aXN0cy5cbiAqIEBkb2NzLXByaXZhdGVcbiAqL1xuZXhwb3J0IGNsYXNzIFJpcHBsZVJlbmRlcmVyIGltcGxlbWVudHMgRXZlbnRMaXN0ZW5lck9iamVjdCB7XG4gIC8qKiBFbGVtZW50IHdoZXJlIHRoZSByaXBwbGVzIGFyZSBiZWluZyBhZGRlZCB0by4gKi9cbiAgcHJpdmF0ZSBfY29udGFpbmVyRWxlbWVudDogSFRNTEVsZW1lbnQ7XG5cbiAgLyoqIEVsZW1lbnQgd2hpY2ggdHJpZ2dlcnMgdGhlIHJpcHBsZSBlbGVtZW50cyBvbiBtb3VzZSBldmVudHMuICovXG4gIHByaXZhdGUgX3RyaWdnZXJFbGVtZW50OiBIVE1MRWxlbWVudCB8IG51bGw7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIHBvaW50ZXIgaXMgY3VycmVudGx5IGRvd24gb3Igbm90LiAqL1xuICBwcml2YXRlIF9pc1BvaW50ZXJEb3duID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIE1hcCBvZiBjdXJyZW50bHkgYWN0aXZlIHJpcHBsZSByZWZlcmVuY2VzLlxuICAgKiBUaGUgcmlwcGxlIHJlZmVyZW5jZSBpcyBtYXBwZWQgdG8gaXRzIGVsZW1lbnQgZXZlbnQgbGlzdGVuZXJzLlxuICAgKiBUaGUgcmVhc29uIHdoeSBgfCBudWxsYCBpcyB1c2VkIGlzIHRoYXQgZXZlbnQgbGlzdGVuZXJzIGFyZSBhZGRlZCBvbmx5XG4gICAqIHdoZW4gdGhlIGNvbmRpdGlvbiBpcyB0cnV0aHkgKHNlZSB0aGUgYF9zdGFydEZhZGVPdXRUcmFuc2l0aW9uYCBtZXRob2QpLlxuICAgKi9cbiAgcHJpdmF0ZSBfYWN0aXZlUmlwcGxlcyA9IG5ldyBNYXA8UmlwcGxlUmVmLCBSaXBwbGVFdmVudExpc3RlbmVycyB8IG51bGw+KCk7XG5cbiAgLyoqIExhdGVzdCBub24tcGVyc2lzdGVudCByaXBwbGUgdGhhdCB3YXMgdHJpZ2dlcmVkLiAqL1xuICBwcml2YXRlIF9tb3N0UmVjZW50VHJhbnNpZW50UmlwcGxlOiBSaXBwbGVSZWYgfCBudWxsO1xuXG4gIC8qKiBUaW1lIGluIG1pbGxpc2Vjb25kcyB3aGVuIHRoZSBsYXN0IHRvdWNoc3RhcnQgZXZlbnQgaGFwcGVuZWQuICovXG4gIHByaXZhdGUgX2xhc3RUb3VjaFN0YXJ0RXZlbnQ6IG51bWJlcjtcblxuICAvKiogV2hldGhlciBwb2ludGVyLXVwIGV2ZW50IGxpc3RlbmVycyBoYXZlIGJlZW4gcmVnaXN0ZXJlZC4gKi9cbiAgcHJpdmF0ZSBfcG9pbnRlclVwRXZlbnRzUmVnaXN0ZXJlZCA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBDYWNoZWQgZGltZW5zaW9ucyBvZiB0aGUgcmlwcGxlIGNvbnRhaW5lci4gU2V0IHdoZW4gdGhlIGZpcnN0XG4gICAqIHJpcHBsZSBpcyBzaG93biBhbmQgY2xlYXJlZCBvbmNlIG5vIG1vcmUgcmlwcGxlcyBhcmUgdmlzaWJsZS5cbiAgICovXG4gIHByaXZhdGUgX2NvbnRhaW5lclJlY3Q6IERPTVJlY3QgfCBudWxsO1xuXG4gIHByaXZhdGUgc3RhdGljIF9ldmVudE1hbmFnZXIgPSBuZXcgUmlwcGxlRXZlbnRNYW5hZ2VyKCk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBfdGFyZ2V0OiBSaXBwbGVUYXJnZXQsXG4gICAgcHJpdmF0ZSBfbmdab25lOiBOZ1pvbmUsXG4gICAgZWxlbWVudE9yRWxlbWVudFJlZjogSFRNTEVsZW1lbnQgfCBFbGVtZW50UmVmPEhUTUxFbGVtZW50PixcbiAgICBwcml2YXRlIF9wbGF0Zm9ybTogUGxhdGZvcm0sXG4gICkge1xuICAgIC8vIE9ubHkgZG8gYW55dGhpbmcgaWYgd2UncmUgb24gdGhlIGJyb3dzZXIuXG4gICAgaWYgKF9wbGF0Zm9ybS5pc0Jyb3dzZXIpIHtcbiAgICAgIHRoaXMuX2NvbnRhaW5lckVsZW1lbnQgPSBjb2VyY2VFbGVtZW50KGVsZW1lbnRPckVsZW1lbnRSZWYpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBGYWRlcyBpbiBhIHJpcHBsZSBhdCB0aGUgZ2l2ZW4gY29vcmRpbmF0ZXMuXG4gICAqIEBwYXJhbSB4IENvb3JkaW5hdGUgd2l0aGluIHRoZSBlbGVtZW50LCBhbG9uZyB0aGUgWCBheGlzIGF0IHdoaWNoIHRvIHN0YXJ0IHRoZSByaXBwbGUuXG4gICAqIEBwYXJhbSB5IENvb3JkaW5hdGUgd2l0aGluIHRoZSBlbGVtZW50LCBhbG9uZyB0aGUgWSBheGlzIGF0IHdoaWNoIHRvIHN0YXJ0IHRoZSByaXBwbGUuXG4gICAqIEBwYXJhbSBjb25maWcgRXh0cmEgcmlwcGxlIG9wdGlvbnMuXG4gICAqL1xuICBmYWRlSW5SaXBwbGUoeDogbnVtYmVyLCB5OiBudW1iZXIsIGNvbmZpZzogUmlwcGxlQ29uZmlnID0ge30pOiBSaXBwbGVSZWYge1xuICAgIGNvbnN0IGNvbnRhaW5lclJlY3QgPSAodGhpcy5fY29udGFpbmVyUmVjdCA9XG4gICAgICB0aGlzLl9jb250YWluZXJSZWN0IHx8IHRoaXMuX2NvbnRhaW5lckVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkpO1xuICAgIGNvbnN0IGFuaW1hdGlvbkNvbmZpZyA9IHsuLi5kZWZhdWx0UmlwcGxlQW5pbWF0aW9uQ29uZmlnLCAuLi5jb25maWcuYW5pbWF0aW9ufTtcblxuICAgIGlmIChjb25maWcuY2VudGVyZWQpIHtcbiAgICAgIHggPSBjb250YWluZXJSZWN0LmxlZnQgKyBjb250YWluZXJSZWN0LndpZHRoIC8gMjtcbiAgICAgIHkgPSBjb250YWluZXJSZWN0LnRvcCArIGNvbnRhaW5lclJlY3QuaGVpZ2h0IC8gMjtcbiAgICB9XG5cbiAgICBjb25zdCByYWRpdXMgPSBjb25maWcucmFkaXVzIHx8IGRpc3RhbmNlVG9GdXJ0aGVzdENvcm5lcih4LCB5LCBjb250YWluZXJSZWN0KTtcbiAgICBjb25zdCBvZmZzZXRYID0geCAtIGNvbnRhaW5lclJlY3QubGVmdDtcbiAgICBjb25zdCBvZmZzZXRZID0geSAtIGNvbnRhaW5lclJlY3QudG9wO1xuICAgIGNvbnN0IGVudGVyRHVyYXRpb24gPSBhbmltYXRpb25Db25maWcuZW50ZXJEdXJhdGlvbjtcblxuICAgIGNvbnN0IHJpcHBsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHJpcHBsZS5jbGFzc0xpc3QuYWRkKCdtYXQtcmlwcGxlLWVsZW1lbnQnKTtcblxuICAgIHJpcHBsZS5zdHlsZS5sZWZ0ID0gYCR7b2Zmc2V0WCAtIHJhZGl1c31weGA7XG4gICAgcmlwcGxlLnN0eWxlLnRvcCA9IGAke29mZnNldFkgLSByYWRpdXN9cHhgO1xuICAgIHJpcHBsZS5zdHlsZS5oZWlnaHQgPSBgJHtyYWRpdXMgKiAyfXB4YDtcbiAgICByaXBwbGUuc3R5bGUud2lkdGggPSBgJHtyYWRpdXMgKiAyfXB4YDtcblxuICAgIC8vIElmIGEgY3VzdG9tIGNvbG9yIGhhcyBiZWVuIHNwZWNpZmllZCwgc2V0IGl0IGFzIGlubGluZSBzdHlsZS4gSWYgbm8gY29sb3IgaXNcbiAgICAvLyBzZXQsIHRoZSBkZWZhdWx0IGNvbG9yIHdpbGwgYmUgYXBwbGllZCB0aHJvdWdoIHRoZSByaXBwbGUgdGhlbWUgc3R5bGVzLlxuICAgIGlmIChjb25maWcuY29sb3IgIT0gbnVsbCkge1xuICAgICAgcmlwcGxlLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IGNvbmZpZy5jb2xvcjtcbiAgICB9XG5cbiAgICByaXBwbGUuc3R5bGUudHJhbnNpdGlvbkR1cmF0aW9uID0gYCR7ZW50ZXJEdXJhdGlvbn1tc2A7XG5cbiAgICB0aGlzLl9jb250YWluZXJFbGVtZW50LmFwcGVuZENoaWxkKHJpcHBsZSk7XG5cbiAgICAvLyBCeSBkZWZhdWx0IHRoZSBicm93c2VyIGRvZXMgbm90IHJlY2FsY3VsYXRlIHRoZSBzdHlsZXMgb2YgZHluYW1pY2FsbHkgY3JlYXRlZFxuICAgIC8vIHJpcHBsZSBlbGVtZW50cy4gVGhpcyBpcyBjcml0aWNhbCB0byBlbnN1cmUgdGhhdCB0aGUgYHNjYWxlYCBhbmltYXRlcyBwcm9wZXJseS5cbiAgICAvLyBXZSBlbmZvcmNlIGEgc3R5bGUgcmVjYWxjdWxhdGlvbiBieSBjYWxsaW5nIGBnZXRDb21wdXRlZFN0eWxlYCBhbmQgKmFjY2Vzc2luZyogYSBwcm9wZXJ0eS5cbiAgICAvLyBTZWU6IGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL3BhdWxpcmlzaC81ZDUyZmIwODFiMzU3MGM4MWUzYVxuICAgIGNvbnN0IGNvbXB1dGVkU3R5bGVzID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUocmlwcGxlKTtcbiAgICBjb25zdCB1c2VyVHJhbnNpdGlvblByb3BlcnR5ID0gY29tcHV0ZWRTdHlsZXMudHJhbnNpdGlvblByb3BlcnR5O1xuICAgIGNvbnN0IHVzZXJUcmFuc2l0aW9uRHVyYXRpb24gPSBjb21wdXRlZFN0eWxlcy50cmFuc2l0aW9uRHVyYXRpb247XG5cbiAgICAvLyBOb3RlOiBXZSBkZXRlY3Qgd2hldGhlciBhbmltYXRpb24gaXMgZm9yY2libHkgZGlzYWJsZWQgdGhyb3VnaCBDU1MgKGUuZy4gdGhyb3VnaFxuICAgIC8vIGB0cmFuc2l0aW9uOiBub25lYCBvciBgZGlzcGxheTogbm9uZWApLiBUaGlzIGlzIHRlY2huaWNhbGx5IHVuZXhwZWN0ZWQgc2luY2UgYW5pbWF0aW9ucyBhcmVcbiAgICAvLyBjb250cm9sbGVkIHRocm91Z2ggdGhlIGFuaW1hdGlvbiBjb25maWcsIGJ1dCB0aGlzIGV4aXN0cyBmb3IgYmFja3dhcmRzIGNvbXBhdGliaWxpdHkuIFRoaXNcbiAgICAvLyBsb2dpYyBkb2VzIG5vdCBuZWVkIHRvIGJlIHN1cGVyIGFjY3VyYXRlIHNpbmNlIGl0IGNvdmVycyBzb21lIGVkZ2UgY2FzZXMgd2hpY2ggY2FuIGJlIGVhc2lseVxuICAgIC8vIGF2b2lkZWQgYnkgdXNlcnMuXG4gICAgY29uc3QgYW5pbWF0aW9uRm9yY2libHlEaXNhYmxlZFRocm91Z2hDc3MgPVxuICAgICAgdXNlclRyYW5zaXRpb25Qcm9wZXJ0eSA9PT0gJ25vbmUnIHx8XG4gICAgICAvLyBOb3RlOiBUaGUgY2Fub25pY2FsIHVuaXQgZm9yIHNlcmlhbGl6ZWQgQ1NTIGA8dGltZT5gIHByb3BlcnRpZXMgaXMgc2Vjb25kcy4gQWRkaXRpb25hbGx5XG4gICAgICAvLyBzb21lIGJyb3dzZXJzIGV4cGFuZCB0aGUgZHVyYXRpb24gZm9yIGV2ZXJ5IHByb3BlcnR5IChpbiBvdXIgY2FzZSBgb3BhY2l0eWAgYW5kIGB0cmFuc2Zvcm1gKS5cbiAgICAgIHVzZXJUcmFuc2l0aW9uRHVyYXRpb24gPT09ICcwcycgfHxcbiAgICAgIHVzZXJUcmFuc2l0aW9uRHVyYXRpb24gPT09ICcwcywgMHMnIHx8XG4gICAgICAvLyBJZiB0aGUgY29udGFpbmVyIGlzIDB4MCwgaXQncyBsaWtlbHkgYGRpc3BsYXk6IG5vbmVgLlxuICAgICAgKGNvbnRhaW5lclJlY3Qud2lkdGggPT09IDAgJiYgY29udGFpbmVyUmVjdC5oZWlnaHQgPT09IDApO1xuXG4gICAgLy8gRXhwb3NlZCByZWZlcmVuY2UgdG8gdGhlIHJpcHBsZSB0aGF0IHdpbGwgYmUgcmV0dXJuZWQuXG4gICAgY29uc3QgcmlwcGxlUmVmID0gbmV3IFJpcHBsZVJlZih0aGlzLCByaXBwbGUsIGNvbmZpZywgYW5pbWF0aW9uRm9yY2libHlEaXNhYmxlZFRocm91Z2hDc3MpO1xuXG4gICAgLy8gU3RhcnQgdGhlIGVudGVyIGFuaW1hdGlvbiBieSBzZXR0aW5nIHRoZSB0cmFuc2Zvcm0vc2NhbGUgdG8gMTAwJS4gVGhlIGFuaW1hdGlvbiB3aWxsXG4gICAgLy8gZXhlY3V0ZSBhcyBwYXJ0IG9mIHRoaXMgc3RhdGVtZW50IGJlY2F1c2Ugd2UgZm9yY2VkIGEgc3R5bGUgcmVjYWxjdWxhdGlvbiBiZWZvcmUuXG4gICAgLy8gTm90ZTogV2UgdXNlIGEgM2QgdHJhbnNmb3JtIGhlcmUgaW4gb3JkZXIgdG8gYXZvaWQgYW4gaXNzdWUgaW4gU2FmYXJpIHdoZXJlXG4gICAgLy8gdGhlIHJpcHBsZXMgYXJlbid0IGNsaXBwZWQgd2hlbiBpbnNpZGUgdGhlIHNoYWRvdyBET00gKHNlZSAjMjQwMjgpLlxuICAgIHJpcHBsZS5zdHlsZS50cmFuc2Zvcm0gPSAnc2NhbGUzZCgxLCAxLCAxKSc7XG5cbiAgICByaXBwbGVSZWYuc3RhdGUgPSBSaXBwbGVTdGF0ZS5GQURJTkdfSU47XG5cbiAgICBpZiAoIWNvbmZpZy5wZXJzaXN0ZW50KSB7XG4gICAgICB0aGlzLl9tb3N0UmVjZW50VHJhbnNpZW50UmlwcGxlID0gcmlwcGxlUmVmO1xuICAgIH1cblxuICAgIGxldCBldmVudExpc3RlbmVyczogUmlwcGxlRXZlbnRMaXN0ZW5lcnMgfCBudWxsID0gbnVsbDtcblxuICAgIC8vIERvIG5vdCByZWdpc3RlciB0aGUgYHRyYW5zaXRpb25gIGV2ZW50IGxpc3RlbmVyIGlmIGZhZGUtaW4gYW5kIGZhZGUtb3V0IGR1cmF0aW9uXG4gICAgLy8gYXJlIHNldCB0byB6ZXJvLiBUaGUgZXZlbnRzIHdvbid0IGZpcmUgYW55d2F5IGFuZCB3ZSBjYW4gc2F2ZSByZXNvdXJjZXMgaGVyZS5cbiAgICBpZiAoIWFuaW1hdGlvbkZvcmNpYmx5RGlzYWJsZWRUaHJvdWdoQ3NzICYmIChlbnRlckR1cmF0aW9uIHx8IGFuaW1hdGlvbkNvbmZpZy5leGl0RHVyYXRpb24pKSB7XG4gICAgICB0aGlzLl9uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgICBjb25zdCBvblRyYW5zaXRpb25FbmQgPSAoKSA9PiB0aGlzLl9maW5pc2hSaXBwbGVUcmFuc2l0aW9uKHJpcHBsZVJlZik7XG4gICAgICAgIGNvbnN0IG9uVHJhbnNpdGlvbkNhbmNlbCA9ICgpID0+IHRoaXMuX2Rlc3Ryb3lSaXBwbGUocmlwcGxlUmVmKTtcbiAgICAgICAgcmlwcGxlLmFkZEV2ZW50TGlzdGVuZXIoJ3RyYW5zaXRpb25lbmQnLCBvblRyYW5zaXRpb25FbmQpO1xuICAgICAgICAvLyBJZiB0aGUgdHJhbnNpdGlvbiBpcyBjYW5jZWxsZWQgKGUuZy4gZHVlIHRvIERPTSByZW1vdmFsKSwgd2UgZGVzdHJveSB0aGUgcmlwcGxlXG4gICAgICAgIC8vIGRpcmVjdGx5IGFzIG90aGVyd2lzZSB3ZSB3b3VsZCBrZWVwIGl0IHBhcnQgb2YgdGhlIHJpcHBsZSBjb250YWluZXIgZm9yZXZlci5cbiAgICAgICAgLy8gaHR0cHM6Ly93d3cudzMub3JnL1RSL2Nzcy10cmFuc2l0aW9ucy0xLyM6fjp0ZXh0PW5vJTIwbG9uZ2VyJTIwaW4lMjB0aGUlMjBkb2N1bWVudC5cbiAgICAgICAgcmlwcGxlLmFkZEV2ZW50TGlzdGVuZXIoJ3RyYW5zaXRpb25jYW5jZWwnLCBvblRyYW5zaXRpb25DYW5jZWwpO1xuICAgICAgICBldmVudExpc3RlbmVycyA9IHtvblRyYW5zaXRpb25FbmQsIG9uVHJhbnNpdGlvbkNhbmNlbH07XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBBZGQgdGhlIHJpcHBsZSByZWZlcmVuY2UgdG8gdGhlIGxpc3Qgb2YgYWxsIGFjdGl2ZSByaXBwbGVzLlxuICAgIHRoaXMuX2FjdGl2ZVJpcHBsZXMuc2V0KHJpcHBsZVJlZiwgZXZlbnRMaXN0ZW5lcnMpO1xuXG4gICAgLy8gSW4gY2FzZSB0aGVyZSBpcyBubyBmYWRlLWluIHRyYW5zaXRpb24gZHVyYXRpb24sIHdlIG5lZWQgdG8gbWFudWFsbHkgY2FsbCB0aGUgdHJhbnNpdGlvblxuICAgIC8vIGVuZCBsaXN0ZW5lciBiZWNhdXNlIGB0cmFuc2l0aW9uZW5kYCBkb2Vzbid0IGZpcmUgaWYgdGhlcmUgaXMgbm8gdHJhbnNpdGlvbi5cbiAgICBpZiAoYW5pbWF0aW9uRm9yY2libHlEaXNhYmxlZFRocm91Z2hDc3MgfHwgIWVudGVyRHVyYXRpb24pIHtcbiAgICAgIHRoaXMuX2ZpbmlzaFJpcHBsZVRyYW5zaXRpb24ocmlwcGxlUmVmKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmlwcGxlUmVmO1xuICB9XG5cbiAgLyoqIEZhZGVzIG91dCBhIHJpcHBsZSByZWZlcmVuY2UuICovXG4gIGZhZGVPdXRSaXBwbGUocmlwcGxlUmVmOiBSaXBwbGVSZWYpIHtcbiAgICAvLyBGb3IgcmlwcGxlcyBhbHJlYWR5IGZhZGluZyBvdXQgb3IgaGlkZGVuLCB0aGlzIHNob3VsZCBiZSBhIG5vb3AuXG4gICAgaWYgKHJpcHBsZVJlZi5zdGF0ZSA9PT0gUmlwcGxlU3RhdGUuRkFESU5HX09VVCB8fCByaXBwbGVSZWYuc3RhdGUgPT09IFJpcHBsZVN0YXRlLkhJRERFTikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHJpcHBsZUVsID0gcmlwcGxlUmVmLmVsZW1lbnQ7XG4gICAgY29uc3QgYW5pbWF0aW9uQ29uZmlnID0gey4uLmRlZmF1bHRSaXBwbGVBbmltYXRpb25Db25maWcsIC4uLnJpcHBsZVJlZi5jb25maWcuYW5pbWF0aW9ufTtcblxuICAgIC8vIFRoaXMgc3RhcnRzIHRoZSBmYWRlLW91dCB0cmFuc2l0aW9uIGFuZCB3aWxsIGZpcmUgdGhlIHRyYW5zaXRpb24gZW5kIGxpc3RlbmVyIHRoYXRcbiAgICAvLyByZW1vdmVzIHRoZSByaXBwbGUgZWxlbWVudCBmcm9tIHRoZSBET00uXG4gICAgcmlwcGxlRWwuc3R5bGUudHJhbnNpdGlvbkR1cmF0aW9uID0gYCR7YW5pbWF0aW9uQ29uZmlnLmV4aXREdXJhdGlvbn1tc2A7XG4gICAgcmlwcGxlRWwuc3R5bGUub3BhY2l0eSA9ICcwJztcbiAgICByaXBwbGVSZWYuc3RhdGUgPSBSaXBwbGVTdGF0ZS5GQURJTkdfT1VUO1xuXG4gICAgLy8gSW4gY2FzZSB0aGVyZSBpcyBubyBmYWRlLW91dCB0cmFuc2l0aW9uIGR1cmF0aW9uLCB3ZSBuZWVkIHRvIG1hbnVhbGx5IGNhbGwgdGhlXG4gICAgLy8gdHJhbnNpdGlvbiBlbmQgbGlzdGVuZXIgYmVjYXVzZSBgdHJhbnNpdGlvbmVuZGAgZG9lc24ndCBmaXJlIGlmIHRoZXJlIGlzIG5vIHRyYW5zaXRpb24uXG4gICAgaWYgKHJpcHBsZVJlZi5fYW5pbWF0aW9uRm9yY2libHlEaXNhYmxlZFRocm91Z2hDc3MgfHwgIWFuaW1hdGlvbkNvbmZpZy5leGl0RHVyYXRpb24pIHtcbiAgICAgIHRoaXMuX2ZpbmlzaFJpcHBsZVRyYW5zaXRpb24ocmlwcGxlUmVmKTtcbiAgICB9XG4gIH1cblxuICAvKiogRmFkZXMgb3V0IGFsbCBjdXJyZW50bHkgYWN0aXZlIHJpcHBsZXMuICovXG4gIGZhZGVPdXRBbGwoKSB7XG4gICAgdGhpcy5fZ2V0QWN0aXZlUmlwcGxlcygpLmZvckVhY2gocmlwcGxlID0+IHJpcHBsZS5mYWRlT3V0KCkpO1xuICB9XG5cbiAgLyoqIEZhZGVzIG91dCBhbGwgY3VycmVudGx5IGFjdGl2ZSBub24tcGVyc2lzdGVudCByaXBwbGVzLiAqL1xuICBmYWRlT3V0QWxsTm9uUGVyc2lzdGVudCgpIHtcbiAgICB0aGlzLl9nZXRBY3RpdmVSaXBwbGVzKCkuZm9yRWFjaChyaXBwbGUgPT4ge1xuICAgICAgaWYgKCFyaXBwbGUuY29uZmlnLnBlcnNpc3RlbnQpIHtcbiAgICAgICAgcmlwcGxlLmZhZGVPdXQoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBTZXRzIHVwIHRoZSB0cmlnZ2VyIGV2ZW50IGxpc3RlbmVycyAqL1xuICBzZXR1cFRyaWdnZXJFdmVudHMoZWxlbWVudE9yRWxlbWVudFJlZjogSFRNTEVsZW1lbnQgfCBFbGVtZW50UmVmPEhUTUxFbGVtZW50Pikge1xuICAgIGNvbnN0IGVsZW1lbnQgPSBjb2VyY2VFbGVtZW50KGVsZW1lbnRPckVsZW1lbnRSZWYpO1xuXG4gICAgaWYgKCF0aGlzLl9wbGF0Zm9ybS5pc0Jyb3dzZXIgfHwgIWVsZW1lbnQgfHwgZWxlbWVudCA9PT0gdGhpcy5fdHJpZ2dlckVsZW1lbnQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBSZW1vdmUgYWxsIHByZXZpb3VzbHkgcmVnaXN0ZXJlZCBldmVudCBsaXN0ZW5lcnMgZnJvbSB0aGUgdHJpZ2dlciBlbGVtZW50LlxuICAgIHRoaXMuX3JlbW92ZVRyaWdnZXJFdmVudHMoKTtcbiAgICB0aGlzLl90cmlnZ2VyRWxlbWVudCA9IGVsZW1lbnQ7XG5cbiAgICAvLyBVc2UgZXZlbnQgZGVsZWdhdGlvbiBmb3IgdGhlIHRyaWdnZXIgZXZlbnRzIHNpbmNlIHRoZXkncmVcbiAgICAvLyBzZXQgdXAgZHVyaW5nIGNyZWF0aW9uIGFuZCBhcmUgcGVyZm9ybWFuY2Utc2Vuc2l0aXZlLlxuICAgIHBvaW50ZXJEb3duRXZlbnRzLmZvckVhY2godHlwZSA9PiB7XG4gICAgICBSaXBwbGVSZW5kZXJlci5fZXZlbnRNYW5hZ2VyLmFkZEhhbmRsZXIodGhpcy5fbmdab25lLCB0eXBlLCBlbGVtZW50LCB0aGlzKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIGFsbCByZWdpc3RlcmVkIGV2ZW50cy5cbiAgICogQGRvY3MtcHJpdmF0ZVxuICAgKi9cbiAgaGFuZGxlRXZlbnQoZXZlbnQ6IEV2ZW50KSB7XG4gICAgaWYgKGV2ZW50LnR5cGUgPT09ICdtb3VzZWRvd24nKSB7XG4gICAgICB0aGlzLl9vbk1vdXNlZG93bihldmVudCBhcyBNb3VzZUV2ZW50KTtcbiAgICB9IGVsc2UgaWYgKGV2ZW50LnR5cGUgPT09ICd0b3VjaHN0YXJ0Jykge1xuICAgICAgdGhpcy5fb25Ub3VjaFN0YXJ0KGV2ZW50IGFzIFRvdWNoRXZlbnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9vblBvaW50ZXJVcCgpO1xuICAgIH1cblxuICAgIC8vIElmIHBvaW50ZXItdXAgZXZlbnRzIGhhdmVuJ3QgYmVlbiByZWdpc3RlcmVkIHlldCwgZG8gc28gbm93LlxuICAgIC8vIFdlIGRvIHRoaXMgb24tZGVtYW5kIGluIG9yZGVyIHRvIHJlZHVjZSB0aGUgdG90YWwgbnVtYmVyIG9mIGV2ZW50IGxpc3RlbmVyc1xuICAgIC8vIHJlZ2lzdGVyZWQgYnkgdGhlIHJpcHBsZXMsIHdoaWNoIHNwZWVkcyB1cCB0aGUgcmVuZGVyaW5nIHRpbWUgZm9yIGxhcmdlIFVJcy5cbiAgICBpZiAoIXRoaXMuX3BvaW50ZXJVcEV2ZW50c1JlZ2lzdGVyZWQpIHtcbiAgICAgIC8vIFRoZSBldmVudHMgZm9yIGhpZGluZyB0aGUgcmlwcGxlIGFyZSBib3VuZCBkaXJlY3RseSBvbiB0aGUgdHJpZ2dlciwgYmVjYXVzZTpcbiAgICAgIC8vIDEuIFNvbWUgb2YgdGhlbSBvY2N1ciBmcmVxdWVudGx5IChlLmcuIGBtb3VzZWxlYXZlYCkgYW5kIGFueSBhZHZhbnRhZ2Ugd2UgZ2V0IGZyb21cbiAgICAgIC8vIGRlbGVnYXRpb24gd2lsbCBiZSBkaW1pbmlzaGVkIGJ5IGhhdmluZyB0byBsb29rIHRocm91Z2ggYWxsIHRoZSBkYXRhIHN0cnVjdHVyZXMgb2Z0ZW4uXG4gICAgICAvLyAyLiBUaGV5IGFyZW4ndCBhcyBwZXJmb3JtYW5jZS1zZW5zaXRpdmUsIGJlY2F1c2UgdGhleSdyZSBib3VuZCBvbmx5IGFmdGVyIHRoZSB1c2VyXG4gICAgICAvLyBoYXMgaW50ZXJhY3RlZCB3aXRoIGFuIGVsZW1lbnQuXG4gICAgICB0aGlzLl9uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgICBwb2ludGVyVXBFdmVudHMuZm9yRWFjaCh0eXBlID0+IHtcbiAgICAgICAgICB0aGlzLl90cmlnZ2VyRWxlbWVudCEuYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCB0aGlzLCBwYXNzaXZlQ2FwdHVyaW5nRXZlbnRPcHRpb25zKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5fcG9pbnRlclVwRXZlbnRzUmVnaXN0ZXJlZCA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgLyoqIE1ldGhvZCB0aGF0IHdpbGwgYmUgY2FsbGVkIGlmIHRoZSBmYWRlLWluIG9yIGZhZGUtaW4gdHJhbnNpdGlvbiBjb21wbGV0ZWQuICovXG4gIHByaXZhdGUgX2ZpbmlzaFJpcHBsZVRyYW5zaXRpb24ocmlwcGxlUmVmOiBSaXBwbGVSZWYpIHtcbiAgICBpZiAocmlwcGxlUmVmLnN0YXRlID09PSBSaXBwbGVTdGF0ZS5GQURJTkdfSU4pIHtcbiAgICAgIHRoaXMuX3N0YXJ0RmFkZU91dFRyYW5zaXRpb24ocmlwcGxlUmVmKTtcbiAgICB9IGVsc2UgaWYgKHJpcHBsZVJlZi5zdGF0ZSA9PT0gUmlwcGxlU3RhdGUuRkFESU5HX09VVCkge1xuICAgICAgdGhpcy5fZGVzdHJveVJpcHBsZShyaXBwbGVSZWYpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydHMgdGhlIGZhZGUtb3V0IHRyYW5zaXRpb24gb2YgdGhlIGdpdmVuIHJpcHBsZSBpZiBpdCdzIG5vdCBwZXJzaXN0ZW50IGFuZCB0aGUgcG9pbnRlclxuICAgKiBpcyBub3QgaGVsZCBkb3duIGFueW1vcmUuXG4gICAqL1xuICBwcml2YXRlIF9zdGFydEZhZGVPdXRUcmFuc2l0aW9uKHJpcHBsZVJlZjogUmlwcGxlUmVmKSB7XG4gICAgY29uc3QgaXNNb3N0UmVjZW50VHJhbnNpZW50UmlwcGxlID0gcmlwcGxlUmVmID09PSB0aGlzLl9tb3N0UmVjZW50VHJhbnNpZW50UmlwcGxlO1xuICAgIGNvbnN0IHtwZXJzaXN0ZW50fSA9IHJpcHBsZVJlZi5jb25maWc7XG5cbiAgICByaXBwbGVSZWYuc3RhdGUgPSBSaXBwbGVTdGF0ZS5WSVNJQkxFO1xuXG4gICAgLy8gV2hlbiB0aGUgdGltZXIgcnVucyBvdXQgd2hpbGUgdGhlIHVzZXIgaGFzIGtlcHQgdGhlaXIgcG9pbnRlciBkb3duLCB3ZSB3YW50IHRvXG4gICAgLy8ga2VlcCBvbmx5IHRoZSBwZXJzaXN0ZW50IHJpcHBsZXMgYW5kIHRoZSBsYXRlc3QgdHJhbnNpZW50IHJpcHBsZS4gV2UgZG8gdGhpcyxcbiAgICAvLyBiZWNhdXNlIHdlIGRvbid0IHdhbnQgc3RhY2tlZCB0cmFuc2llbnQgcmlwcGxlcyB0byBhcHBlYXIgYWZ0ZXIgdGhlaXIgZW50ZXJcbiAgICAvLyBhbmltYXRpb24gaGFzIGZpbmlzaGVkLlxuICAgIGlmICghcGVyc2lzdGVudCAmJiAoIWlzTW9zdFJlY2VudFRyYW5zaWVudFJpcHBsZSB8fCAhdGhpcy5faXNQb2ludGVyRG93bikpIHtcbiAgICAgIHJpcHBsZVJlZi5mYWRlT3V0KCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIERlc3Ryb3lzIHRoZSBnaXZlbiByaXBwbGUgYnkgcmVtb3ZpbmcgaXQgZnJvbSB0aGUgRE9NIGFuZCB1cGRhdGluZyBpdHMgc3RhdGUuICovXG4gIHByaXZhdGUgX2Rlc3Ryb3lSaXBwbGUocmlwcGxlUmVmOiBSaXBwbGVSZWYpIHtcbiAgICBjb25zdCBldmVudExpc3RlbmVycyA9IHRoaXMuX2FjdGl2ZVJpcHBsZXMuZ2V0KHJpcHBsZVJlZikgPz8gbnVsbDtcbiAgICB0aGlzLl9hY3RpdmVSaXBwbGVzLmRlbGV0ZShyaXBwbGVSZWYpO1xuXG4gICAgLy8gQ2xlYXIgb3V0IHRoZSBjYWNoZWQgYm91bmRpbmcgcmVjdCBpZiB3ZSBoYXZlIG5vIG1vcmUgcmlwcGxlcy5cbiAgICBpZiAoIXRoaXMuX2FjdGl2ZVJpcHBsZXMuc2l6ZSkge1xuICAgICAgdGhpcy5fY29udGFpbmVyUmVjdCA9IG51bGw7XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIGN1cnJlbnQgcmVmIGlzIHRoZSBtb3N0IHJlY2VudCB0cmFuc2llbnQgcmlwcGxlLCB1bnNldCBpdFxuICAgIC8vIGF2b2lkIG1lbW9yeSBsZWFrcy5cbiAgICBpZiAocmlwcGxlUmVmID09PSB0aGlzLl9tb3N0UmVjZW50VHJhbnNpZW50UmlwcGxlKSB7XG4gICAgICB0aGlzLl9tb3N0UmVjZW50VHJhbnNpZW50UmlwcGxlID0gbnVsbDtcbiAgICB9XG5cbiAgICByaXBwbGVSZWYuc3RhdGUgPSBSaXBwbGVTdGF0ZS5ISURERU47XG4gICAgaWYgKGV2ZW50TGlzdGVuZXJzICE9PSBudWxsKSB7XG4gICAgICByaXBwbGVSZWYuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCd0cmFuc2l0aW9uZW5kJywgZXZlbnRMaXN0ZW5lcnMub25UcmFuc2l0aW9uRW5kKTtcbiAgICAgIHJpcHBsZVJlZi5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RyYW5zaXRpb25jYW5jZWwnLCBldmVudExpc3RlbmVycy5vblRyYW5zaXRpb25DYW5jZWwpO1xuICAgIH1cbiAgICByaXBwbGVSZWYuZWxlbWVudC5yZW1vdmUoKTtcbiAgfVxuXG4gIC8qKiBGdW5jdGlvbiBiZWluZyBjYWxsZWQgd2hlbmV2ZXIgdGhlIHRyaWdnZXIgaXMgYmVpbmcgcHJlc3NlZCB1c2luZyBtb3VzZS4gKi9cbiAgcHJpdmF0ZSBfb25Nb3VzZWRvd24oZXZlbnQ6IE1vdXNlRXZlbnQpIHtcbiAgICAvLyBTY3JlZW4gcmVhZGVycyB3aWxsIGZpcmUgZmFrZSBtb3VzZSBldmVudHMgZm9yIHNwYWNlL2VudGVyLiBTa2lwIGxhdW5jaGluZyBhXG4gICAgLy8gcmlwcGxlIGluIHRoaXMgY2FzZSBmb3IgY29uc2lzdGVuY3kgd2l0aCB0aGUgbm9uLXNjcmVlbi1yZWFkZXIgZXhwZXJpZW5jZS5cbiAgICBjb25zdCBpc0Zha2VNb3VzZWRvd24gPSBpc0Zha2VNb3VzZWRvd25Gcm9tU2NyZWVuUmVhZGVyKGV2ZW50KTtcbiAgICBjb25zdCBpc1N5bnRoZXRpY0V2ZW50ID1cbiAgICAgIHRoaXMuX2xhc3RUb3VjaFN0YXJ0RXZlbnQgJiZcbiAgICAgIERhdGUubm93KCkgPCB0aGlzLl9sYXN0VG91Y2hTdGFydEV2ZW50ICsgaWdub3JlTW91c2VFdmVudHNUaW1lb3V0O1xuXG4gICAgaWYgKCF0aGlzLl90YXJnZXQucmlwcGxlRGlzYWJsZWQgJiYgIWlzRmFrZU1vdXNlZG93biAmJiAhaXNTeW50aGV0aWNFdmVudCkge1xuICAgICAgdGhpcy5faXNQb2ludGVyRG93biA9IHRydWU7XG4gICAgICB0aGlzLmZhZGVJblJpcHBsZShldmVudC5jbGllbnRYLCBldmVudC5jbGllbnRZLCB0aGlzLl90YXJnZXQucmlwcGxlQ29uZmlnKTtcbiAgICB9XG4gIH1cblxuICAvKiogRnVuY3Rpb24gYmVpbmcgY2FsbGVkIHdoZW5ldmVyIHRoZSB0cmlnZ2VyIGlzIGJlaW5nIHByZXNzZWQgdXNpbmcgdG91Y2guICovXG4gIHByaXZhdGUgX29uVG91Y2hTdGFydChldmVudDogVG91Y2hFdmVudCkge1xuICAgIGlmICghdGhpcy5fdGFyZ2V0LnJpcHBsZURpc2FibGVkICYmICFpc0Zha2VUb3VjaHN0YXJ0RnJvbVNjcmVlblJlYWRlcihldmVudCkpIHtcbiAgICAgIC8vIFNvbWUgYnJvd3NlcnMgZmlyZSBtb3VzZSBldmVudHMgYWZ0ZXIgYSBgdG91Y2hzdGFydGAgZXZlbnQuIFRob3NlIHN5bnRoZXRpYyBtb3VzZVxuICAgICAgLy8gZXZlbnRzIHdpbGwgbGF1bmNoIGEgc2Vjb25kIHJpcHBsZSBpZiB3ZSBkb24ndCBpZ25vcmUgbW91c2UgZXZlbnRzIGZvciBhIHNwZWNpZmljXG4gICAgICAvLyB0aW1lIGFmdGVyIGEgdG91Y2hzdGFydCBldmVudC5cbiAgICAgIHRoaXMuX2xhc3RUb3VjaFN0YXJ0RXZlbnQgPSBEYXRlLm5vdygpO1xuICAgICAgdGhpcy5faXNQb2ludGVyRG93biA9IHRydWU7XG5cbiAgICAgIC8vIFVzZSBgY2hhbmdlZFRvdWNoZXNgIHNvIHdlIHNraXAgYW55IHRvdWNoZXMgd2hlcmUgdGhlIHVzZXIgcHV0XG4gICAgICAvLyB0aGVpciBmaW5nZXIgZG93biwgYnV0IHVzZWQgYW5vdGhlciBmaW5nZXIgdG8gdGFwIHRoZSBlbGVtZW50IGFnYWluLlxuICAgICAgY29uc3QgdG91Y2hlcyA9IGV2ZW50LmNoYW5nZWRUb3VjaGVzIGFzIFRvdWNoTGlzdCB8IHVuZGVmaW5lZDtcblxuICAgICAgLy8gQWNjb3JkaW5nIHRvIHRoZSB0eXBpbmdzIHRoZSB0b3VjaGVzIHNob3VsZCBhbHdheXMgYmUgZGVmaW5lZCwgYnV0IGluIHNvbWUgY2FzZXNcbiAgICAgIC8vIHRoZSBicm93c2VyIGFwcGVhcnMgdG8gbm90IGFzc2lnbiB0aGVtIGluIHRlc3RzIHdoaWNoIGxlYWRzIHRvIGZsYWtlcy5cbiAgICAgIGlmICh0b3VjaGVzKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdG91Y2hlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHRoaXMuZmFkZUluUmlwcGxlKHRvdWNoZXNbaV0uY2xpZW50WCwgdG91Y2hlc1tpXS5jbGllbnRZLCB0aGlzLl90YXJnZXQucmlwcGxlQ29uZmlnKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKiBGdW5jdGlvbiBiZWluZyBjYWxsZWQgd2hlbmV2ZXIgdGhlIHRyaWdnZXIgaXMgYmVpbmcgcmVsZWFzZWQuICovXG4gIHByaXZhdGUgX29uUG9pbnRlclVwKCkge1xuICAgIGlmICghdGhpcy5faXNQb2ludGVyRG93bikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX2lzUG9pbnRlckRvd24gPSBmYWxzZTtcblxuICAgIC8vIEZhZGUtb3V0IGFsbCByaXBwbGVzIHRoYXQgYXJlIHZpc2libGUgYW5kIG5vdCBwZXJzaXN0ZW50LlxuICAgIHRoaXMuX2dldEFjdGl2ZVJpcHBsZXMoKS5mb3JFYWNoKHJpcHBsZSA9PiB7XG4gICAgICAvLyBCeSBkZWZhdWx0LCBvbmx5IHJpcHBsZXMgdGhhdCBhcmUgY29tcGxldGVseSB2aXNpYmxlIHdpbGwgZmFkZSBvdXQgb24gcG9pbnRlciByZWxlYXNlLlxuICAgICAgLy8gSWYgdGhlIGB0ZXJtaW5hdGVPblBvaW50ZXJVcGAgb3B0aW9uIGlzIHNldCwgcmlwcGxlcyB0aGF0IHN0aWxsIGZhZGUgaW4gd2lsbCBhbHNvIGZhZGUgb3V0LlxuICAgICAgY29uc3QgaXNWaXNpYmxlID1cbiAgICAgICAgcmlwcGxlLnN0YXRlID09PSBSaXBwbGVTdGF0ZS5WSVNJQkxFIHx8XG4gICAgICAgIChyaXBwbGUuY29uZmlnLnRlcm1pbmF0ZU9uUG9pbnRlclVwICYmIHJpcHBsZS5zdGF0ZSA9PT0gUmlwcGxlU3RhdGUuRkFESU5HX0lOKTtcblxuICAgICAgaWYgKCFyaXBwbGUuY29uZmlnLnBlcnNpc3RlbnQgJiYgaXNWaXNpYmxlKSB7XG4gICAgICAgIHJpcHBsZS5mYWRlT3V0KCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIF9nZXRBY3RpdmVSaXBwbGVzKCk6IFJpcHBsZVJlZltdIHtcbiAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLl9hY3RpdmVSaXBwbGVzLmtleXMoKSk7XG4gIH1cblxuICAvKiogUmVtb3ZlcyBwcmV2aW91c2x5IHJlZ2lzdGVyZWQgZXZlbnQgbGlzdGVuZXJzIGZyb20gdGhlIHRyaWdnZXIgZWxlbWVudC4gKi9cbiAgX3JlbW92ZVRyaWdnZXJFdmVudHMoKSB7XG4gICAgY29uc3QgdHJpZ2dlciA9IHRoaXMuX3RyaWdnZXJFbGVtZW50O1xuXG4gICAgaWYgKHRyaWdnZXIpIHtcbiAgICAgIHBvaW50ZXJEb3duRXZlbnRzLmZvckVhY2godHlwZSA9PlxuICAgICAgICBSaXBwbGVSZW5kZXJlci5fZXZlbnRNYW5hZ2VyLnJlbW92ZUhhbmRsZXIodHlwZSwgdHJpZ2dlciwgdGhpcyksXG4gICAgICApO1xuXG4gICAgICBpZiAodGhpcy5fcG9pbnRlclVwRXZlbnRzUmVnaXN0ZXJlZCkge1xuICAgICAgICBwb2ludGVyVXBFdmVudHMuZm9yRWFjaCh0eXBlID0+XG4gICAgICAgICAgdHJpZ2dlci5yZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIHRoaXMsIHBhc3NpdmVDYXB0dXJpbmdFdmVudE9wdGlvbnMpLFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIGRpc3RhbmNlIGZyb20gdGhlIHBvaW50ICh4LCB5KSB0byB0aGUgZnVydGhlc3QgY29ybmVyIG9mIGEgcmVjdGFuZ2xlLlxuICovXG5mdW5jdGlvbiBkaXN0YW5jZVRvRnVydGhlc3RDb3JuZXIoeDogbnVtYmVyLCB5OiBudW1iZXIsIHJlY3Q6IERPTVJlY3QpIHtcbiAgY29uc3QgZGlzdFggPSBNYXRoLm1heChNYXRoLmFicyh4IC0gcmVjdC5sZWZ0KSwgTWF0aC5hYnMoeCAtIHJlY3QucmlnaHQpKTtcbiAgY29uc3QgZGlzdFkgPSBNYXRoLm1heChNYXRoLmFicyh5IC0gcmVjdC50b3ApLCBNYXRoLmFicyh5IC0gcmVjdC5ib3R0b20pKTtcbiAgcmV0dXJuIE1hdGguc3FydChkaXN0WCAqIGRpc3RYICsgZGlzdFkgKiBkaXN0WSk7XG59XG4iXX0=