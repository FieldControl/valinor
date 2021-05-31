/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ɵgetDOM as getDOM } from '@angular/common';
import { Inject, Injectable, InjectionToken, NgZone } from '@angular/core';
/**
 * The injection token for the event-manager plug-in service.
 *
 * @publicApi
 */
export const EVENT_MANAGER_PLUGINS = new InjectionToken('EventManagerPlugins');
/**
 * An injectable service that provides event management for Angular
 * through a browser plug-in.
 *
 * @publicApi
 */
export class EventManager {
    /**
     * Initializes an instance of the event-manager service.
     */
    constructor(plugins, _zone) {
        this._zone = _zone;
        this._eventNameToPlugin = new Map();
        plugins.forEach(p => p.manager = this);
        this._plugins = plugins.slice().reverse();
    }
    /**
     * Registers a handler for a specific element and event.
     *
     * @param element The HTML element to receive event notifications.
     * @param eventName The name of the event to listen for.
     * @param handler A function to call when the notification occurs. Receives the
     * event object as an argument.
     * @returns  A callback function that can be used to remove the handler.
     */
    addEventListener(element, eventName, handler) {
        const plugin = this._findPluginFor(eventName);
        return plugin.addEventListener(element, eventName, handler);
    }
    /**
     * Registers a global handler for an event in a target view.
     *
     * @param target A target for global event notifications. One of "window", "document", or "body".
     * @param eventName The name of the event to listen for.
     * @param handler A function to call when the notification occurs. Receives the
     * event object as an argument.
     * @returns A callback function that can be used to remove the handler.
     * @deprecated No longer being used in Ivy code. To be removed in version 14.
     */
    addGlobalEventListener(target, eventName, handler) {
        const plugin = this._findPluginFor(eventName);
        return plugin.addGlobalEventListener(target, eventName, handler);
    }
    /**
     * Retrieves the compilation zone in which event listeners are registered.
     */
    getZone() {
        return this._zone;
    }
    /** @internal */
    _findPluginFor(eventName) {
        const plugin = this._eventNameToPlugin.get(eventName);
        if (plugin) {
            return plugin;
        }
        const plugins = this._plugins;
        for (let i = 0; i < plugins.length; i++) {
            const plugin = plugins[i];
            if (plugin.supports(eventName)) {
                this._eventNameToPlugin.set(eventName, plugin);
                return plugin;
            }
        }
        throw new Error(`No event manager plugin found for event ${eventName}`);
    }
}
EventManager.decorators = [
    { type: Injectable }
];
EventManager.ctorParameters = () => [
    { type: Array, decorators: [{ type: Inject, args: [EVENT_MANAGER_PLUGINS,] }] },
    { type: NgZone }
];
export class EventManagerPlugin {
    constructor(_doc) {
        this._doc = _doc;
    }
    addGlobalEventListener(element, eventName, handler) {
        const target = getDOM().getGlobalEventTarget(this._doc, element);
        if (!target) {
            throw new Error(`Unsupported event target ${target} for event ${eventName}`);
        }
        return this.addEventListener(target, eventName, handler);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnRfbWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3BsYXRmb3JtLWJyb3dzZXIvc3JjL2RvbS9ldmVudHMvZXZlbnRfbWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsT0FBTyxJQUFJLE1BQU0sRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQ2xELE9BQU8sRUFBQyxNQUFNLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRSxNQUFNLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFekU7Ozs7R0FJRztBQUNILE1BQU0sQ0FBQyxNQUFNLHFCQUFxQixHQUM5QixJQUFJLGNBQWMsQ0FBdUIscUJBQXFCLENBQUMsQ0FBQztBQUVwRTs7Ozs7R0FLRztBQUVILE1BQU0sT0FBTyxZQUFZO0lBSXZCOztPQUVHO0lBQ0gsWUFBMkMsT0FBNkIsRUFBVSxLQUFhO1FBQWIsVUFBSyxHQUFMLEtBQUssQ0FBUTtRQUx2Rix1QkFBa0IsR0FBRyxJQUFJLEdBQUcsRUFBOEIsQ0FBQztRQU1qRSxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsQ0FBQztRQUN2QyxJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUM1QyxDQUFDO0lBRUQ7Ozs7Ozs7O09BUUc7SUFDSCxnQkFBZ0IsQ0FBQyxPQUFvQixFQUFFLFNBQWlCLEVBQUUsT0FBaUI7UUFDekUsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUM5QyxPQUFPLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzlELENBQUM7SUFFRDs7Ozs7Ozs7O09BU0c7SUFDSCxzQkFBc0IsQ0FBQyxNQUFjLEVBQUUsU0FBaUIsRUFBRSxPQUFpQjtRQUN6RSxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzlDLE9BQU8sTUFBTSxDQUFDLHNCQUFzQixDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDbkUsQ0FBQztJQUVEOztPQUVHO0lBQ0gsT0FBTztRQUNMLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztJQUNwQixDQUFDO0lBRUQsZ0JBQWdCO0lBQ2hCLGNBQWMsQ0FBQyxTQUFpQjtRQUM5QixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3RELElBQUksTUFBTSxFQUFFO1lBQ1YsT0FBTyxNQUFNLENBQUM7U0FDZjtRQUVELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDOUIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDdkMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFCLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsRUFBRTtnQkFDOUIsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQy9DLE9BQU8sTUFBTSxDQUFDO2FBQ2Y7U0FDRjtRQUNELE1BQU0sSUFBSSxLQUFLLENBQUMsMkNBQTJDLFNBQVMsRUFBRSxDQUFDLENBQUM7SUFDMUUsQ0FBQzs7O1lBakVGLFVBQVU7Ozt3Q0FRSSxNQUFNLFNBQUMscUJBQXFCO1lBeEJDLE1BQU07O0FBb0ZsRCxNQUFNLE9BQWdCLGtCQUFrQjtJQUN0QyxZQUFvQixJQUFTO1FBQVQsU0FBSSxHQUFKLElBQUksQ0FBSztJQUFHLENBQUM7SUFTakMsc0JBQXNCLENBQUMsT0FBZSxFQUFFLFNBQWlCLEVBQUUsT0FBaUI7UUFDMUUsTUFBTSxNQUFNLEdBQWdCLE1BQU0sRUFBRSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDOUUsSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNYLE1BQU0sSUFBSSxLQUFLLENBQUMsNEJBQTRCLE1BQU0sY0FBYyxTQUFTLEVBQUUsQ0FBQyxDQUFDO1NBQzlFO1FBQ0QsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUMzRCxDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHvJtWdldERPTSBhcyBnZXRET019IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge0luamVjdCwgSW5qZWN0YWJsZSwgSW5qZWN0aW9uVG9rZW4sIE5nWm9uZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbi8qKlxuICogVGhlIGluamVjdGlvbiB0b2tlbiBmb3IgdGhlIGV2ZW50LW1hbmFnZXIgcGx1Zy1pbiBzZXJ2aWNlLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNvbnN0IEVWRU5UX01BTkFHRVJfUExVR0lOUyA9XG4gICAgbmV3IEluamVjdGlvblRva2VuPEV2ZW50TWFuYWdlclBsdWdpbltdPignRXZlbnRNYW5hZ2VyUGx1Z2lucycpO1xuXG4vKipcbiAqIEFuIGluamVjdGFibGUgc2VydmljZSB0aGF0IHByb3ZpZGVzIGV2ZW50IG1hbmFnZW1lbnQgZm9yIEFuZ3VsYXJcbiAqIHRocm91Z2ggYSBicm93c2VyIHBsdWctaW4uXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgRXZlbnRNYW5hZ2VyIHtcbiAgcHJpdmF0ZSBfcGx1Z2luczogRXZlbnRNYW5hZ2VyUGx1Z2luW107XG4gIHByaXZhdGUgX2V2ZW50TmFtZVRvUGx1Z2luID0gbmV3IE1hcDxzdHJpbmcsIEV2ZW50TWFuYWdlclBsdWdpbj4oKTtcblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgYW4gaW5zdGFuY2Ugb2YgdGhlIGV2ZW50LW1hbmFnZXIgc2VydmljZS5cbiAgICovXG4gIGNvbnN0cnVjdG9yKEBJbmplY3QoRVZFTlRfTUFOQUdFUl9QTFVHSU5TKSBwbHVnaW5zOiBFdmVudE1hbmFnZXJQbHVnaW5bXSwgcHJpdmF0ZSBfem9uZTogTmdab25lKSB7XG4gICAgcGx1Z2lucy5mb3JFYWNoKHAgPT4gcC5tYW5hZ2VyID0gdGhpcyk7XG4gICAgdGhpcy5fcGx1Z2lucyA9IHBsdWdpbnMuc2xpY2UoKS5yZXZlcnNlKCk7XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXJzIGEgaGFuZGxlciBmb3IgYSBzcGVjaWZpYyBlbGVtZW50IGFuZCBldmVudC5cbiAgICpcbiAgICogQHBhcmFtIGVsZW1lbnQgVGhlIEhUTUwgZWxlbWVudCB0byByZWNlaXZlIGV2ZW50IG5vdGlmaWNhdGlvbnMuXG4gICAqIEBwYXJhbSBldmVudE5hbWUgVGhlIG5hbWUgb2YgdGhlIGV2ZW50IHRvIGxpc3RlbiBmb3IuXG4gICAqIEBwYXJhbSBoYW5kbGVyIEEgZnVuY3Rpb24gdG8gY2FsbCB3aGVuIHRoZSBub3RpZmljYXRpb24gb2NjdXJzLiBSZWNlaXZlcyB0aGVcbiAgICogZXZlbnQgb2JqZWN0IGFzIGFuIGFyZ3VtZW50LlxuICAgKiBAcmV0dXJucyAgQSBjYWxsYmFjayBmdW5jdGlvbiB0aGF0IGNhbiBiZSB1c2VkIHRvIHJlbW92ZSB0aGUgaGFuZGxlci5cbiAgICovXG4gIGFkZEV2ZW50TGlzdGVuZXIoZWxlbWVudDogSFRNTEVsZW1lbnQsIGV2ZW50TmFtZTogc3RyaW5nLCBoYW5kbGVyOiBGdW5jdGlvbik6IEZ1bmN0aW9uIHtcbiAgICBjb25zdCBwbHVnaW4gPSB0aGlzLl9maW5kUGx1Z2luRm9yKGV2ZW50TmFtZSk7XG4gICAgcmV0dXJuIHBsdWdpbi5hZGRFdmVudExpc3RlbmVyKGVsZW1lbnQsIGV2ZW50TmFtZSwgaGFuZGxlcik7XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXJzIGEgZ2xvYmFsIGhhbmRsZXIgZm9yIGFuIGV2ZW50IGluIGEgdGFyZ2V0IHZpZXcuXG4gICAqXG4gICAqIEBwYXJhbSB0YXJnZXQgQSB0YXJnZXQgZm9yIGdsb2JhbCBldmVudCBub3RpZmljYXRpb25zLiBPbmUgb2YgXCJ3aW5kb3dcIiwgXCJkb2N1bWVudFwiLCBvciBcImJvZHlcIi5cbiAgICogQHBhcmFtIGV2ZW50TmFtZSBUaGUgbmFtZSBvZiB0aGUgZXZlbnQgdG8gbGlzdGVuIGZvci5cbiAgICogQHBhcmFtIGhhbmRsZXIgQSBmdW5jdGlvbiB0byBjYWxsIHdoZW4gdGhlIG5vdGlmaWNhdGlvbiBvY2N1cnMuIFJlY2VpdmVzIHRoZVxuICAgKiBldmVudCBvYmplY3QgYXMgYW4gYXJndW1lbnQuXG4gICAqIEByZXR1cm5zIEEgY2FsbGJhY2sgZnVuY3Rpb24gdGhhdCBjYW4gYmUgdXNlZCB0byByZW1vdmUgdGhlIGhhbmRsZXIuXG4gICAqIEBkZXByZWNhdGVkIE5vIGxvbmdlciBiZWluZyB1c2VkIGluIEl2eSBjb2RlLiBUbyBiZSByZW1vdmVkIGluIHZlcnNpb24gMTQuXG4gICAqL1xuICBhZGRHbG9iYWxFdmVudExpc3RlbmVyKHRhcmdldDogc3RyaW5nLCBldmVudE5hbWU6IHN0cmluZywgaGFuZGxlcjogRnVuY3Rpb24pOiBGdW5jdGlvbiB7XG4gICAgY29uc3QgcGx1Z2luID0gdGhpcy5fZmluZFBsdWdpbkZvcihldmVudE5hbWUpO1xuICAgIHJldHVybiBwbHVnaW4uYWRkR2xvYmFsRXZlbnRMaXN0ZW5lcih0YXJnZXQsIGV2ZW50TmFtZSwgaGFuZGxlcik7XG4gIH1cblxuICAvKipcbiAgICogUmV0cmlldmVzIHRoZSBjb21waWxhdGlvbiB6b25lIGluIHdoaWNoIGV2ZW50IGxpc3RlbmVycyBhcmUgcmVnaXN0ZXJlZC5cbiAgICovXG4gIGdldFpvbmUoKTogTmdab25lIHtcbiAgICByZXR1cm4gdGhpcy5fem9uZTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2ZpbmRQbHVnaW5Gb3IoZXZlbnROYW1lOiBzdHJpbmcpOiBFdmVudE1hbmFnZXJQbHVnaW4ge1xuICAgIGNvbnN0IHBsdWdpbiA9IHRoaXMuX2V2ZW50TmFtZVRvUGx1Z2luLmdldChldmVudE5hbWUpO1xuICAgIGlmIChwbHVnaW4pIHtcbiAgICAgIHJldHVybiBwbHVnaW47XG4gICAgfVxuXG4gICAgY29uc3QgcGx1Z2lucyA9IHRoaXMuX3BsdWdpbnM7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwbHVnaW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBwbHVnaW4gPSBwbHVnaW5zW2ldO1xuICAgICAgaWYgKHBsdWdpbi5zdXBwb3J0cyhldmVudE5hbWUpKSB7XG4gICAgICAgIHRoaXMuX2V2ZW50TmFtZVRvUGx1Z2luLnNldChldmVudE5hbWUsIHBsdWdpbik7XG4gICAgICAgIHJldHVybiBwbHVnaW47XG4gICAgICB9XG4gICAgfVxuICAgIHRocm93IG5ldyBFcnJvcihgTm8gZXZlbnQgbWFuYWdlciBwbHVnaW4gZm91bmQgZm9yIGV2ZW50ICR7ZXZlbnROYW1lfWApO1xuICB9XG59XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBFdmVudE1hbmFnZXJQbHVnaW4ge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9kb2M6IGFueSkge31cblxuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgbWFuYWdlciE6IEV2ZW50TWFuYWdlcjtcblxuICBhYnN0cmFjdCBzdXBwb3J0cyhldmVudE5hbWU6IHN0cmluZyk6IGJvb2xlYW47XG5cbiAgYWJzdHJhY3QgYWRkRXZlbnRMaXN0ZW5lcihlbGVtZW50OiBIVE1MRWxlbWVudCwgZXZlbnROYW1lOiBzdHJpbmcsIGhhbmRsZXI6IEZ1bmN0aW9uKTogRnVuY3Rpb247XG5cbiAgYWRkR2xvYmFsRXZlbnRMaXN0ZW5lcihlbGVtZW50OiBzdHJpbmcsIGV2ZW50TmFtZTogc3RyaW5nLCBoYW5kbGVyOiBGdW5jdGlvbik6IEZ1bmN0aW9uIHtcbiAgICBjb25zdCB0YXJnZXQ6IEhUTUxFbGVtZW50ID0gZ2V0RE9NKCkuZ2V0R2xvYmFsRXZlbnRUYXJnZXQodGhpcy5fZG9jLCBlbGVtZW50KTtcbiAgICBpZiAoIXRhcmdldCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbnN1cHBvcnRlZCBldmVudCB0YXJnZXQgJHt0YXJnZXR9IGZvciBldmVudCAke2V2ZW50TmFtZX1gKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcih0YXJnZXQsIGV2ZW50TmFtZSwgaGFuZGxlcik7XG4gIH1cbn1cbiJdfQ==