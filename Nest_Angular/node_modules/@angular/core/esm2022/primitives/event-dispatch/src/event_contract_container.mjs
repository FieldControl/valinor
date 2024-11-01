/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as eventLib from './event';
/**
 * Whether the user agent is running on iOS.
 */
const isIos = typeof navigator !== 'undefined' && /iPhone|iPad|iPod/.test(navigator.userAgent);
/**
 * A class representing a container node and all the event handlers
 * installed on it. Used so that handlers can be cleaned up if the
 * container is removed from the contract.
 */
export class EventContractContainer {
    /**
     * @param element The container Element.
     */
    constructor(element) {
        this.element = element;
        /**
         * Array of event handlers and their corresponding event types that are
         * installed on this container.
         *
         */
        this.handlerInfos = [];
    }
    /**
     * Installs the provided installer on the element owned by this container,
     * and maintains a reference to resulting handler in order to remove it
     * later if desired.
     */
    addEventListener(eventType, getHandler) {
        // In iOS, event bubbling doesn't happen automatically in any DOM element,
        // unless it has an onclick attribute or DOM event handler attached to it.
        // This breaks JsAction in some cases. See "Making Elements Clickable"
        // section at http://goo.gl/2VoGnB.
        //
        // A workaround for this issue is to change the CSS cursor style to 'pointer'
        // for the container element, which magically turns on event bubbling. This
        // solution is described in the comments section at http://goo.gl/6pEO1z.
        //
        // We use a navigator.userAgent check here as this problem is present both
        // on Mobile Safari and thin WebKit wrappers, such as Chrome for iOS.
        if (isIos) {
            this.element.style.cursor = 'pointer';
        }
        this.handlerInfos.push(eventLib.addEventListener(this.element, eventType, getHandler(this.element)));
    }
    /**
     * Removes all the handlers installed on this container.
     */
    cleanUp() {
        for (let i = 0; i < this.handlerInfos.length; i++) {
            eventLib.removeEventListener(this.element, this.handlerInfos[i]);
        }
        this.handlerInfos = [];
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnRfY29udHJhY3RfY29udGFpbmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9wcmltaXRpdmVzL2V2ZW50LWRpc3BhdGNoL3NyYy9ldmVudF9jb250cmFjdF9jb250YWluZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxLQUFLLFFBQVEsTUFBTSxTQUFTLENBQUM7QUFnQnBDOztHQUVHO0FBQ0gsTUFBTSxLQUFLLEdBQUcsT0FBTyxTQUFTLEtBQUssV0FBVyxJQUFJLGtCQUFrQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7QUFFL0Y7Ozs7R0FJRztBQUNILE1BQU0sT0FBTyxzQkFBc0I7SUFRakM7O09BRUc7SUFDSCxZQUFxQixPQUFnQjtRQUFoQixZQUFPLEdBQVAsT0FBTyxDQUFTO1FBVnJDOzs7O1dBSUc7UUFDSyxpQkFBWSxHQUF1QixFQUFFLENBQUM7SUFLTixDQUFDO0lBRXpDOzs7O09BSUc7SUFDSCxnQkFBZ0IsQ0FBQyxTQUFpQixFQUFFLFVBQXdEO1FBQzFGLDBFQUEwRTtRQUMxRSwwRUFBMEU7UUFDMUUsc0VBQXNFO1FBQ3RFLG1DQUFtQztRQUNuQyxFQUFFO1FBQ0YsNkVBQTZFO1FBQzdFLDJFQUEyRTtRQUMzRSx5RUFBeUU7UUFDekUsRUFBRTtRQUNGLDBFQUEwRTtRQUMxRSxxRUFBcUU7UUFDckUsSUFBSSxLQUFLLEVBQUUsQ0FBQztZQUNULElBQUksQ0FBQyxPQUF1QixDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDO1FBQ3pELENBQUM7UUFDRCxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FDcEIsUUFBUSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLFVBQVUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FDN0UsQ0FBQztJQUNKLENBQUM7SUFFRDs7T0FFRztJQUNILE9BQU87UUFDTCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUNsRCxRQUFRLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbkUsQ0FBQztRQUVELElBQUksQ0FBQyxZQUFZLEdBQUcsRUFBRSxDQUFDO0lBQ3pCLENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgZXZlbnRMaWIgZnJvbSAnLi9ldmVudCc7XG5pbXBvcnQge0V2ZW50SGFuZGxlckluZm99IGZyb20gJy4vZXZlbnRfaGFuZGxlcic7XG5cbi8qKlxuICogQW4gYEV2ZW50Q29udHJhY3RDb250YWluZXJNYW5hZ2VyYCBwcm92aWRlcyB0aGUgY29tbW9uIGludGVyZmFjZSBmb3IgbWFuYWdpbmdcbiAqIGNvbnRhaW5lcnMuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRXZlbnRDb250cmFjdENvbnRhaW5lck1hbmFnZXIge1xuICBhZGRFdmVudExpc3RlbmVyKFxuICAgIGV2ZW50VHlwZTogc3RyaW5nLFxuICAgIGdldEhhbmRsZXI6IChlbGVtZW50OiBFbGVtZW50KSA9PiAoZXZlbnQ6IEV2ZW50KSA9PiB2b2lkLFxuICApOiB2b2lkO1xuXG4gIGNsZWFuVXAoKTogdm9pZDtcbn1cblxuLyoqXG4gKiBXaGV0aGVyIHRoZSB1c2VyIGFnZW50IGlzIHJ1bm5pbmcgb24gaU9TLlxuICovXG5jb25zdCBpc0lvcyA9IHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnICYmIC9pUGhvbmV8aVBhZHxpUG9kLy50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpO1xuXG4vKipcbiAqIEEgY2xhc3MgcmVwcmVzZW50aW5nIGEgY29udGFpbmVyIG5vZGUgYW5kIGFsbCB0aGUgZXZlbnQgaGFuZGxlcnNcbiAqIGluc3RhbGxlZCBvbiBpdC4gVXNlZCBzbyB0aGF0IGhhbmRsZXJzIGNhbiBiZSBjbGVhbmVkIHVwIGlmIHRoZVxuICogY29udGFpbmVyIGlzIHJlbW92ZWQgZnJvbSB0aGUgY29udHJhY3QuXG4gKi9cbmV4cG9ydCBjbGFzcyBFdmVudENvbnRyYWN0Q29udGFpbmVyIGltcGxlbWVudHMgRXZlbnRDb250cmFjdENvbnRhaW5lck1hbmFnZXIge1xuICAvKipcbiAgICogQXJyYXkgb2YgZXZlbnQgaGFuZGxlcnMgYW5kIHRoZWlyIGNvcnJlc3BvbmRpbmcgZXZlbnQgdHlwZXMgdGhhdCBhcmVcbiAgICogaW5zdGFsbGVkIG9uIHRoaXMgY29udGFpbmVyLlxuICAgKlxuICAgKi9cbiAgcHJpdmF0ZSBoYW5kbGVySW5mb3M6IEV2ZW50SGFuZGxlckluZm9bXSA9IFtdO1xuXG4gIC8qKlxuICAgKiBAcGFyYW0gZWxlbWVudCBUaGUgY29udGFpbmVyIEVsZW1lbnQuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihyZWFkb25seSBlbGVtZW50OiBFbGVtZW50KSB7fVxuXG4gIC8qKlxuICAgKiBJbnN0YWxscyB0aGUgcHJvdmlkZWQgaW5zdGFsbGVyIG9uIHRoZSBlbGVtZW50IG93bmVkIGJ5IHRoaXMgY29udGFpbmVyLFxuICAgKiBhbmQgbWFpbnRhaW5zIGEgcmVmZXJlbmNlIHRvIHJlc3VsdGluZyBoYW5kbGVyIGluIG9yZGVyIHRvIHJlbW92ZSBpdFxuICAgKiBsYXRlciBpZiBkZXNpcmVkLlxuICAgKi9cbiAgYWRkRXZlbnRMaXN0ZW5lcihldmVudFR5cGU6IHN0cmluZywgZ2V0SGFuZGxlcjogKGVsZW1lbnQ6IEVsZW1lbnQpID0+IChldmVudDogRXZlbnQpID0+IHZvaWQpIHtcbiAgICAvLyBJbiBpT1MsIGV2ZW50IGJ1YmJsaW5nIGRvZXNuJ3QgaGFwcGVuIGF1dG9tYXRpY2FsbHkgaW4gYW55IERPTSBlbGVtZW50LFxuICAgIC8vIHVubGVzcyBpdCBoYXMgYW4gb25jbGljayBhdHRyaWJ1dGUgb3IgRE9NIGV2ZW50IGhhbmRsZXIgYXR0YWNoZWQgdG8gaXQuXG4gICAgLy8gVGhpcyBicmVha3MgSnNBY3Rpb24gaW4gc29tZSBjYXNlcy4gU2VlIFwiTWFraW5nIEVsZW1lbnRzIENsaWNrYWJsZVwiXG4gICAgLy8gc2VjdGlvbiBhdCBodHRwOi8vZ29vLmdsLzJWb0duQi5cbiAgICAvL1xuICAgIC8vIEEgd29ya2Fyb3VuZCBmb3IgdGhpcyBpc3N1ZSBpcyB0byBjaGFuZ2UgdGhlIENTUyBjdXJzb3Igc3R5bGUgdG8gJ3BvaW50ZXInXG4gICAgLy8gZm9yIHRoZSBjb250YWluZXIgZWxlbWVudCwgd2hpY2ggbWFnaWNhbGx5IHR1cm5zIG9uIGV2ZW50IGJ1YmJsaW5nLiBUaGlzXG4gICAgLy8gc29sdXRpb24gaXMgZGVzY3JpYmVkIGluIHRoZSBjb21tZW50cyBzZWN0aW9uIGF0IGh0dHA6Ly9nb28uZ2wvNnBFTzF6LlxuICAgIC8vXG4gICAgLy8gV2UgdXNlIGEgbmF2aWdhdG9yLnVzZXJBZ2VudCBjaGVjayBoZXJlIGFzIHRoaXMgcHJvYmxlbSBpcyBwcmVzZW50IGJvdGhcbiAgICAvLyBvbiBNb2JpbGUgU2FmYXJpIGFuZCB0aGluIFdlYktpdCB3cmFwcGVycywgc3VjaCBhcyBDaHJvbWUgZm9yIGlPUy5cbiAgICBpZiAoaXNJb3MpIHtcbiAgICAgICh0aGlzLmVsZW1lbnQgYXMgSFRNTEVsZW1lbnQpLnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJztcbiAgICB9XG4gICAgdGhpcy5oYW5kbGVySW5mb3MucHVzaChcbiAgICAgIGV2ZW50TGliLmFkZEV2ZW50TGlzdGVuZXIodGhpcy5lbGVtZW50LCBldmVudFR5cGUsIGdldEhhbmRsZXIodGhpcy5lbGVtZW50KSksXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGFsbCB0aGUgaGFuZGxlcnMgaW5zdGFsbGVkIG9uIHRoaXMgY29udGFpbmVyLlxuICAgKi9cbiAgY2xlYW5VcCgpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuaGFuZGxlckluZm9zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBldmVudExpYi5yZW1vdmVFdmVudExpc3RlbmVyKHRoaXMuZWxlbWVudCwgdGhpcy5oYW5kbGVySW5mb3NbaV0pO1xuICAgIH1cblxuICAgIHRoaXMuaGFuZGxlckluZm9zID0gW107XG4gIH1cbn1cbiJdfQ==