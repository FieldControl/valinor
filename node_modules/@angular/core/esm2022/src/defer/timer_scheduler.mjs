/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ɵɵdefineInjectable } from '../di';
import { INJECTOR } from '../render3/interfaces/view';
import { arrayInsert2, arraySplice } from '../util/array_utils';
/**
 * Returns a function that captures a provided delay.
 * Invoking the returned function schedules a trigger.
 */
export function onTimer(delay) {
    return (callback, lView) => scheduleTimerTrigger(delay, callback, lView);
}
/**
 * Schedules a callback to be invoked after a given timeout.
 *
 * @param delay A number of ms to wait until firing a callback.
 * @param callback A function to be invoked after a timeout.
 * @param lView LView that hosts an instance of a defer block.
 */
export function scheduleTimerTrigger(delay, callback, lView) {
    const injector = lView[INJECTOR];
    const scheduler = injector.get(TimerScheduler);
    const cleanupFn = () => scheduler.remove(callback);
    scheduler.add(delay, callback);
    return cleanupFn;
}
/**
 * Helper service to schedule `setTimeout`s for batches of defer blocks,
 * to avoid calling `setTimeout` for each defer block (e.g. if defer blocks
 * are created inside a for loop).
 */
export class TimerScheduler {
    constructor() {
        // Indicates whether current callbacks are being invoked.
        this.executingCallbacks = false;
        // Currently scheduled `setTimeout` id.
        this.timeoutId = null;
        // When currently scheduled timer would fire.
        this.invokeTimerAt = null;
        // List of callbacks to be invoked.
        // For each callback we also store a timestamp on when the callback
        // should be invoked. We store timestamps and callback functions
        // in a flat array to avoid creating new objects for each entry.
        // [timestamp1, callback1, timestamp2, callback2, ...]
        this.current = [];
        // List of callbacks collected while invoking current set of callbacks.
        // Those callbacks are added to the "current" queue at the end of
        // the current callback invocation. The shape of this list is the same
        // as the shape of the `current` list.
        this.deferred = [];
    }
    add(delay, callback) {
        const target = this.executingCallbacks ? this.deferred : this.current;
        this.addToQueue(target, Date.now() + delay, callback);
        this.scheduleTimer();
    }
    remove(callback) {
        const { current, deferred } = this;
        const callbackIndex = this.removeFromQueue(current, callback);
        if (callbackIndex === -1) {
            // Try cleaning up deferred queue only in case
            // we didn't find a callback in the "current" queue.
            this.removeFromQueue(deferred, callback);
        }
        // If the last callback was removed and there is a pending timeout - cancel it.
        if (current.length === 0 && deferred.length === 0) {
            this.clearTimeout();
        }
    }
    addToQueue(target, invokeAt, callback) {
        let insertAtIndex = target.length;
        for (let i = 0; i < target.length; i += 2) {
            const invokeQueuedCallbackAt = target[i];
            if (invokeQueuedCallbackAt > invokeAt) {
                // We've reached a first timer that is scheduled
                // for a later time than what we are trying to insert.
                // This is the location at which we need to insert,
                // no need to iterate further.
                insertAtIndex = i;
                break;
            }
        }
        arrayInsert2(target, insertAtIndex, invokeAt, callback);
    }
    removeFromQueue(target, callback) {
        let index = -1;
        for (let i = 0; i < target.length; i += 2) {
            const queuedCallback = target[i + 1];
            if (queuedCallback === callback) {
                index = i;
                break;
            }
        }
        if (index > -1) {
            // Remove 2 elements: a timestamp slot and
            // the following slot with a callback function.
            arraySplice(target, index, 2);
        }
        return index;
    }
    scheduleTimer() {
        const callback = () => {
            this.clearTimeout();
            this.executingCallbacks = true;
            // Clone the current state of the queue, since it might be altered
            // as we invoke callbacks.
            const current = [...this.current];
            // Invoke callbacks that were scheduled to run before the current time.
            const now = Date.now();
            for (let i = 0; i < current.length; i += 2) {
                const invokeAt = current[i];
                const callback = current[i + 1];
                if (invokeAt <= now) {
                    callback();
                }
                else {
                    // We've reached a timer that should not be invoked yet.
                    break;
                }
            }
            // The state of the queue might've changed after callbacks invocation,
            // run the cleanup logic based on the *current* state of the queue.
            let lastCallbackIndex = -1;
            for (let i = 0; i < this.current.length; i += 2) {
                const invokeAt = this.current[i];
                if (invokeAt <= now) {
                    // Add +1 to account for a callback function that
                    // goes after the timestamp in events array.
                    lastCallbackIndex = i + 1;
                }
                else {
                    // We've reached a timer that should not be invoked yet.
                    break;
                }
            }
            if (lastCallbackIndex >= 0) {
                arraySplice(this.current, 0, lastCallbackIndex + 1);
            }
            this.executingCallbacks = false;
            // If there are any callbacks added during an invocation
            // of the current ones - move them over to the "current"
            // queue.
            if (this.deferred.length > 0) {
                for (let i = 0; i < this.deferred.length; i += 2) {
                    const invokeAt = this.deferred[i];
                    const callback = this.deferred[i + 1];
                    this.addToQueue(this.current, invokeAt, callback);
                }
                this.deferred.length = 0;
            }
            this.scheduleTimer();
        };
        // Avoid running timer callbacks more than once per
        // average frame duration. This is needed for better
        // batching and to avoid kicking off excessive change
        // detection cycles.
        const FRAME_DURATION_MS = 16; // 1000ms / 60fps
        if (this.current.length > 0) {
            const now = Date.now();
            // First element in the queue points at the timestamp
            // of the first (earliest) event.
            const invokeAt = this.current[0];
            if (this.timeoutId === null ||
                // Reschedule a timer in case a queue contains an item with
                // an earlier timestamp and the delta is more than an average
                // frame duration.
                (this.invokeTimerAt && this.invokeTimerAt - invokeAt > FRAME_DURATION_MS)) {
                // There was a timeout already, but an earlier event was added
                // into the queue. In this case we drop an old timer and setup
                // a new one with an updated (smaller) timeout.
                this.clearTimeout();
                const timeout = Math.max(invokeAt - now, FRAME_DURATION_MS);
                this.invokeTimerAt = invokeAt;
                this.timeoutId = setTimeout(callback, timeout);
            }
        }
    }
    clearTimeout() {
        if (this.timeoutId !== null) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    }
    ngOnDestroy() {
        this.clearTimeout();
        this.current.length = 0;
        this.deferred.length = 0;
    }
    /** @nocollapse */
    static { this.ɵprov = ɵɵdefineInjectable({
        token: TimerScheduler,
        providedIn: 'root',
        factory: () => new TimerScheduler(),
    }); }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZXJfc2NoZWR1bGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvZGVmZXIvdGltZXJfc2NoZWR1bGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLE9BQU8sQ0FBQztBQUN6QyxPQUFPLEVBQUMsUUFBUSxFQUFRLE1BQU0sNEJBQTRCLENBQUM7QUFDM0QsT0FBTyxFQUFDLFlBQVksRUFBRSxXQUFXLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUU5RDs7O0dBR0c7QUFDSCxNQUFNLFVBQVUsT0FBTyxDQUFDLEtBQWE7SUFDbkMsT0FBTyxDQUFDLFFBQXNCLEVBQUUsS0FBWSxFQUFFLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ2hHLENBQUM7QUFFRDs7Ozs7O0dBTUc7QUFDSCxNQUFNLFVBQVUsb0JBQW9CLENBQUMsS0FBYSxFQUFFLFFBQXNCLEVBQUUsS0FBWTtJQUN0RixNQUFNLFFBQVEsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFFLENBQUM7SUFDbEMsTUFBTSxTQUFTLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUMvQyxNQUFNLFNBQVMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ25ELFNBQVMsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQy9CLE9BQU8sU0FBUyxDQUFDO0FBQ25CLENBQUM7QUFFRDs7OztHQUlHO0FBQ0gsTUFBTSxPQUFPLGNBQWM7SUFBM0I7UUFDRSx5REFBeUQ7UUFDekQsdUJBQWtCLEdBQUcsS0FBSyxDQUFDO1FBRTNCLHVDQUF1QztRQUN2QyxjQUFTLEdBQWtCLElBQUksQ0FB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QixDQUFDO1FBQzFELEtBQUssRUFBRSxjQUFjO1FBQ3JCLFVBQVUsRUFBRSxNQUFNO1FBQ2xCLE9BQU8sRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLGNBQWMsRUFBRTtLQUNwQyxDQUFDLEFBSlUsQ0FJVCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHvJtcm1ZGVmaW5lSW5qZWN0YWJsZX0gZnJvbSAnLi4vZGknO1xuaW1wb3J0IHtJTkpFQ1RPUiwgTFZpZXd9IGZyb20gJy4uL3JlbmRlcjMvaW50ZXJmYWNlcy92aWV3JztcbmltcG9ydCB7YXJyYXlJbnNlcnQyLCBhcnJheVNwbGljZX0gZnJvbSAnLi4vdXRpbC9hcnJheV91dGlscyc7XG5cbi8qKlxuICogUmV0dXJucyBhIGZ1bmN0aW9uIHRoYXQgY2FwdHVyZXMgYSBwcm92aWRlZCBkZWxheS5cbiAqIEludm9raW5nIHRoZSByZXR1cm5lZCBmdW5jdGlvbiBzY2hlZHVsZXMgYSB0cmlnZ2VyLlxuICovXG5leHBvcnQgZnVuY3Rpb24gb25UaW1lcihkZWxheTogbnVtYmVyKSB7XG4gIHJldHVybiAoY2FsbGJhY2s6IFZvaWRGdW5jdGlvbiwgbFZpZXc6IExWaWV3KSA9PiBzY2hlZHVsZVRpbWVyVHJpZ2dlcihkZWxheSwgY2FsbGJhY2ssIGxWaWV3KTtcbn1cblxuLyoqXG4gKiBTY2hlZHVsZXMgYSBjYWxsYmFjayB0byBiZSBpbnZva2VkIGFmdGVyIGEgZ2l2ZW4gdGltZW91dC5cbiAqXG4gKiBAcGFyYW0gZGVsYXkgQSBudW1iZXIgb2YgbXMgdG8gd2FpdCB1bnRpbCBmaXJpbmcgYSBjYWxsYmFjay5cbiAqIEBwYXJhbSBjYWxsYmFjayBBIGZ1bmN0aW9uIHRvIGJlIGludm9rZWQgYWZ0ZXIgYSB0aW1lb3V0LlxuICogQHBhcmFtIGxWaWV3IExWaWV3IHRoYXQgaG9zdHMgYW4gaW5zdGFuY2Ugb2YgYSBkZWZlciBibG9jay5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNjaGVkdWxlVGltZXJUcmlnZ2VyKGRlbGF5OiBudW1iZXIsIGNhbGxiYWNrOiBWb2lkRnVuY3Rpb24sIGxWaWV3OiBMVmlldykge1xuICBjb25zdCBpbmplY3RvciA9IGxWaWV3W0lOSkVDVE9SXSE7XG4gIGNvbnN0IHNjaGVkdWxlciA9IGluamVjdG9yLmdldChUaW1lclNjaGVkdWxlcik7XG4gIGNvbnN0IGNsZWFudXBGbiA9ICgpID0+IHNjaGVkdWxlci5yZW1vdmUoY2FsbGJhY2spO1xuICBzY2hlZHVsZXIuYWRkKGRlbGF5LCBjYWxsYmFjayk7XG4gIHJldHVybiBjbGVhbnVwRm47XG59XG5cbi8qKlxuICogSGVscGVyIHNlcnZpY2UgdG8gc2NoZWR1bGUgYHNldFRpbWVvdXRgcyBmb3IgYmF0Y2hlcyBvZiBkZWZlciBibG9ja3MsXG4gKiB0byBhdm9pZCBjYWxsaW5nIGBzZXRUaW1lb3V0YCBmb3IgZWFjaCBkZWZlciBibG9jayAoZS5nLiBpZiBkZWZlciBibG9ja3NcbiAqIGFyZSBjcmVhdGVkIGluc2lkZSBhIGZvciBsb29wKS5cbiAqL1xuZXhwb3J0IGNsYXNzIFRpbWVyU2NoZWR1bGVyIHtcbiAgLy8gSW5kaWNhdGVzIHdoZXRoZXIgY3VycmVudCBjYWxsYmFja3MgYXJlIGJlaW5nIGludm9rZWQuXG4gIGV4ZWN1dGluZ0NhbGxiYWNrcyA9IGZhbHNlO1xuXG4gIC8vIEN1cnJlbnRseSBzY2hlZHVsZWQgYHNldFRpbWVvdXRgIGlkLlxuICB0aW1lb3V0SWQ6IG51bWJlciB8IG51bGwgPSBudWxsO1xuXG4gIC8vIFdoZW4gY3VycmVudGx5IHNjaGVkdWxlZCB0aW1lciB3b3VsZCBmaXJlLlxuICBpbnZva2VUaW1lckF0OiBudW1iZXIgfCBudWxsID0gbnVsbDtcblxuICAvLyBMaXN0IG9mIGNhbGxiYWNrcyB0byBiZSBpbnZva2VkLlxuICAvLyBGb3IgZWFjaCBjYWxsYmFjayB3ZSBhbHNvIHN0b3JlIGEgdGltZXN0YW1wIG9uIHdoZW4gdGhlIGNhbGxiYWNrXG4gIC8vIHNob3VsZCBiZSBpbnZva2VkLiBXZSBzdG9yZSB0aW1lc3RhbXBzIGFuZCBjYWxsYmFjayBmdW5jdGlvbnNcbiAgLy8gaW4gYSBmbGF0IGFycmF5IHRvIGF2b2lkIGNyZWF0aW5nIG5ldyBvYmplY3RzIGZvciBlYWNoIGVudHJ5LlxuICAvLyBbdGltZXN0YW1wMSwgY2FsbGJhY2sxLCB0aW1lc3RhbXAyLCBjYWxsYmFjazIsIC4uLl1cbiAgY3VycmVudDogQXJyYXk8bnVtYmVyIHwgVm9pZEZ1bmN0aW9uPiA9IFtdO1xuXG4gIC8vIExpc3Qgb2YgY2FsbGJhY2tzIGNvbGxlY3RlZCB3aGlsZSBpbnZva2luZyBjdXJyZW50IHNldCBvZiBjYWxsYmFja3MuXG4gIC8vIFRob3NlIGNhbGxiYWNrcyBhcmUgYWRkZWQgdG8gdGhlIFwiY3VycmVudFwiIHF1ZXVlIGF0IHRoZSBlbmQgb2ZcbiAgLy8gdGhlIGN1cnJlbnQgY2FsbGJhY2sgaW52b2NhdGlvbi4gVGhlIHNoYXBlIG9mIHRoaXMgbGlzdCBpcyB0aGUgc2FtZVxuICAvLyBhcyB0aGUgc2hhcGUgb2YgdGhlIGBjdXJyZW50YCBsaXN0LlxuICBkZWZlcnJlZDogQXJyYXk8bnVtYmVyIHwgVm9pZEZ1bmN0aW9uPiA9IFtdO1xuXG4gIGFkZChkZWxheTogbnVtYmVyLCBjYWxsYmFjazogVm9pZEZ1bmN0aW9uKSB7XG4gICAgY29uc3QgdGFyZ2V0ID0gdGhpcy5leGVjdXRpbmdDYWxsYmFja3MgPyB0aGlzLmRlZmVycmVkIDogdGhpcy5jdXJyZW50O1xuICAgIHRoaXMuYWRkVG9RdWV1ZSh0YXJnZXQsIERhdGUubm93KCkgKyBkZWxheSwgY2FsbGJhY2spO1xuICAgIHRoaXMuc2NoZWR1bGVUaW1lcigpO1xuICB9XG5cbiAgcmVtb3ZlKGNhbGxiYWNrOiBWb2lkRnVuY3Rpb24pIHtcbiAgICBjb25zdCB7Y3VycmVudCwgZGVmZXJyZWR9ID0gdGhpcztcbiAgICBjb25zdCBjYWxsYmFja0luZGV4ID0gdGhpcy5yZW1vdmVGcm9tUXVldWUoY3VycmVudCwgY2FsbGJhY2spO1xuICAgIGlmIChjYWxsYmFja0luZGV4ID09PSAtMSkge1xuICAgICAgLy8gVHJ5IGNsZWFuaW5nIHVwIGRlZmVycmVkIHF1ZXVlIG9ubHkgaW4gY2FzZVxuICAgICAgLy8gd2UgZGlkbid0IGZpbmQgYSBjYWxsYmFjayBpbiB0aGUgXCJjdXJyZW50XCIgcXVldWUuXG4gICAgICB0aGlzLnJlbW92ZUZyb21RdWV1ZShkZWZlcnJlZCwgY2FsbGJhY2spO1xuICAgIH1cbiAgICAvLyBJZiB0aGUgbGFzdCBjYWxsYmFjayB3YXMgcmVtb3ZlZCBhbmQgdGhlcmUgaXMgYSBwZW5kaW5nIHRpbWVvdXQgLSBjYW5jZWwgaXQuXG4gICAgaWYgKGN1cnJlbnQubGVuZ3RoID09PSAwICYmIGRlZmVycmVkLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhpcy5jbGVhclRpbWVvdXQoKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGFkZFRvUXVldWUoXG4gICAgdGFyZ2V0OiBBcnJheTxudW1iZXIgfCBWb2lkRnVuY3Rpb24+LFxuICAgIGludm9rZUF0OiBudW1iZXIsXG4gICAgY2FsbGJhY2s6IFZvaWRGdW5jdGlvbixcbiAgKSB7XG4gICAgbGV0IGluc2VydEF0SW5kZXggPSB0YXJnZXQubGVuZ3RoO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGFyZ2V0Lmxlbmd0aDsgaSArPSAyKSB7XG4gICAgICBjb25zdCBpbnZva2VRdWV1ZWRDYWxsYmFja0F0ID0gdGFyZ2V0W2ldIGFzIG51bWJlcjtcbiAgICAgIGlmIChpbnZva2VRdWV1ZWRDYWxsYmFja0F0ID4gaW52b2tlQXQpIHtcbiAgICAgICAgLy8gV2UndmUgcmVhY2hlZCBhIGZpcnN0IHRpbWVyIHRoYXQgaXMgc2NoZWR1bGVkXG4gICAgICAgIC8vIGZvciBhIGxhdGVyIHRpbWUgdGhhbiB3aGF0IHdlIGFyZSB0cnlpbmcgdG8gaW5zZXJ0LlxuICAgICAgICAvLyBUaGlzIGlzIHRoZSBsb2NhdGlvbiBhdCB3aGljaCB3ZSBuZWVkIHRvIGluc2VydCxcbiAgICAgICAgLy8gbm8gbmVlZCB0byBpdGVyYXRlIGZ1cnRoZXIuXG4gICAgICAgIGluc2VydEF0SW5kZXggPSBpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgYXJyYXlJbnNlcnQyKHRhcmdldCwgaW5zZXJ0QXRJbmRleCwgaW52b2tlQXQsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIHByaXZhdGUgcmVtb3ZlRnJvbVF1ZXVlKHRhcmdldDogQXJyYXk8bnVtYmVyIHwgVm9pZEZ1bmN0aW9uPiwgY2FsbGJhY2s6IFZvaWRGdW5jdGlvbikge1xuICAgIGxldCBpbmRleCA9IC0xO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGFyZ2V0Lmxlbmd0aDsgaSArPSAyKSB7XG4gICAgICBjb25zdCBxdWV1ZWRDYWxsYmFjayA9IHRhcmdldFtpICsgMV07XG4gICAgICBpZiAocXVldWVkQ2FsbGJhY2sgPT09IGNhbGxiYWNrKSB7XG4gICAgICAgIGluZGV4ID0gaTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAvLyBSZW1vdmUgMiBlbGVtZW50czogYSB0aW1lc3RhbXAgc2xvdCBhbmRcbiAgICAgIC8vIHRoZSBmb2xsb3dpbmcgc2xvdCB3aXRoIGEgY2FsbGJhY2sgZnVuY3Rpb24uXG4gICAgICBhcnJheVNwbGljZSh0YXJnZXQsIGluZGV4LCAyKTtcbiAgICB9XG4gICAgcmV0dXJuIGluZGV4O1xuICB9XG5cbiAgcHJpdmF0ZSBzY2hlZHVsZVRpbWVyKCkge1xuICAgIGNvbnN0IGNhbGxiYWNrID0gKCkgPT4ge1xuICAgICAgdGhpcy5jbGVhclRpbWVvdXQoKTtcblxuICAgICAgdGhpcy5leGVjdXRpbmdDYWxsYmFja3MgPSB0cnVlO1xuXG4gICAgICAvLyBDbG9uZSB0aGUgY3VycmVudCBzdGF0ZSBvZiB0aGUgcXVldWUsIHNpbmNlIGl0IG1pZ2h0IGJlIGFsdGVyZWRcbiAgICAgIC8vIGFzIHdlIGludm9rZSBjYWxsYmFja3MuXG4gICAgICBjb25zdCBjdXJyZW50ID0gWy4uLnRoaXMuY3VycmVudF07XG5cbiAgICAgIC8vIEludm9rZSBjYWxsYmFja3MgdGhhdCB3ZXJlIHNjaGVkdWxlZCB0byBydW4gYmVmb3JlIHRoZSBjdXJyZW50IHRpbWUuXG4gICAgICBjb25zdCBub3cgPSBEYXRlLm5vdygpO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjdXJyZW50Lmxlbmd0aDsgaSArPSAyKSB7XG4gICAgICAgIGNvbnN0IGludm9rZUF0ID0gY3VycmVudFtpXSBhcyBudW1iZXI7XG4gICAgICAgIGNvbnN0IGNhbGxiYWNrID0gY3VycmVudFtpICsgMV0gYXMgVm9pZEZ1bmN0aW9uO1xuICAgICAgICBpZiAoaW52b2tlQXQgPD0gbm93KSB7XG4gICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBXZSd2ZSByZWFjaGVkIGEgdGltZXIgdGhhdCBzaG91bGQgbm90IGJlIGludm9rZWQgeWV0LlxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBUaGUgc3RhdGUgb2YgdGhlIHF1ZXVlIG1pZ2h0J3ZlIGNoYW5nZWQgYWZ0ZXIgY2FsbGJhY2tzIGludm9jYXRpb24sXG4gICAgICAvLyBydW4gdGhlIGNsZWFudXAgbG9naWMgYmFzZWQgb24gdGhlICpjdXJyZW50KiBzdGF0ZSBvZiB0aGUgcXVldWUuXG4gICAgICBsZXQgbGFzdENhbGxiYWNrSW5kZXggPSAtMTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5jdXJyZW50Lmxlbmd0aDsgaSArPSAyKSB7XG4gICAgICAgIGNvbnN0IGludm9rZUF0ID0gdGhpcy5jdXJyZW50W2ldIGFzIG51bWJlcjtcbiAgICAgICAgaWYgKGludm9rZUF0IDw9IG5vdykge1xuICAgICAgICAgIC8vIEFkZCArMSB0byBhY2NvdW50IGZvciBhIGNhbGxiYWNrIGZ1bmN0aW9uIHRoYXRcbiAgICAgICAgICAvLyBnb2VzIGFmdGVyIHRoZSB0aW1lc3RhbXAgaW4gZXZlbnRzIGFycmF5LlxuICAgICAgICAgIGxhc3RDYWxsYmFja0luZGV4ID0gaSArIDE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gV2UndmUgcmVhY2hlZCBhIHRpbWVyIHRoYXQgc2hvdWxkIG5vdCBiZSBpbnZva2VkIHlldC5cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGxhc3RDYWxsYmFja0luZGV4ID49IDApIHtcbiAgICAgICAgYXJyYXlTcGxpY2UodGhpcy5jdXJyZW50LCAwLCBsYXN0Q2FsbGJhY2tJbmRleCArIDEpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmV4ZWN1dGluZ0NhbGxiYWNrcyA9IGZhbHNlO1xuXG4gICAgICAvLyBJZiB0aGVyZSBhcmUgYW55IGNhbGxiYWNrcyBhZGRlZCBkdXJpbmcgYW4gaW52b2NhdGlvblxuICAgICAgLy8gb2YgdGhlIGN1cnJlbnQgb25lcyAtIG1vdmUgdGhlbSBvdmVyIHRvIHRoZSBcImN1cnJlbnRcIlxuICAgICAgLy8gcXVldWUuXG4gICAgICBpZiAodGhpcy5kZWZlcnJlZC5sZW5ndGggPiAwKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5kZWZlcnJlZC5sZW5ndGg7IGkgKz0gMikge1xuICAgICAgICAgIGNvbnN0IGludm9rZUF0ID0gdGhpcy5kZWZlcnJlZFtpXSBhcyBudW1iZXI7XG4gICAgICAgICAgY29uc3QgY2FsbGJhY2sgPSB0aGlzLmRlZmVycmVkW2kgKyAxXSBhcyBWb2lkRnVuY3Rpb247XG4gICAgICAgICAgdGhpcy5hZGRUb1F1ZXVlKHRoaXMuY3VycmVudCwgaW52b2tlQXQsIGNhbGxiYWNrKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmRlZmVycmVkLmxlbmd0aCA9IDA7XG4gICAgICB9XG4gICAgICB0aGlzLnNjaGVkdWxlVGltZXIoKTtcbiAgICB9O1xuXG4gICAgLy8gQXZvaWQgcnVubmluZyB0aW1lciBjYWxsYmFja3MgbW9yZSB0aGFuIG9uY2UgcGVyXG4gICAgLy8gYXZlcmFnZSBmcmFtZSBkdXJhdGlvbi4gVGhpcyBpcyBuZWVkZWQgZm9yIGJldHRlclxuICAgIC8vIGJhdGNoaW5nIGFuZCB0byBhdm9pZCBraWNraW5nIG9mZiBleGNlc3NpdmUgY2hhbmdlXG4gICAgLy8gZGV0ZWN0aW9uIGN5Y2xlcy5cbiAgICBjb25zdCBGUkFNRV9EVVJBVElPTl9NUyA9IDE2OyAvLyAxMDAwbXMgLyA2MGZwc1xuXG4gICAgaWYgKHRoaXMuY3VycmVudC5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCBub3cgPSBEYXRlLm5vdygpO1xuICAgICAgLy8gRmlyc3QgZWxlbWVudCBpbiB0aGUgcXVldWUgcG9pbnRzIGF0IHRoZSB0aW1lc3RhbXBcbiAgICAgIC8vIG9mIHRoZSBmaXJzdCAoZWFybGllc3QpIGV2ZW50LlxuICAgICAgY29uc3QgaW52b2tlQXQgPSB0aGlzLmN1cnJlbnRbMF0gYXMgbnVtYmVyO1xuICAgICAgaWYgKFxuICAgICAgICB0aGlzLnRpbWVvdXRJZCA9PT0gbnVsbCB8fFxuICAgICAgICAvLyBSZXNjaGVkdWxlIGEgdGltZXIgaW4gY2FzZSBhIHF1ZXVlIGNvbnRhaW5zIGFuIGl0ZW0gd2l0aFxuICAgICAgICAvLyBhbiBlYXJsaWVyIHRpbWVzdGFtcCBhbmQgdGhlIGRlbHRhIGlzIG1vcmUgdGhhbiBhbiBhdmVyYWdlXG4gICAgICAgIC8vIGZyYW1lIGR1cmF0aW9uLlxuICAgICAgICAodGhpcy5pbnZva2VUaW1lckF0ICYmIHRoaXMuaW52b2tlVGltZXJBdCAtIGludm9rZUF0ID4gRlJBTUVfRFVSQVRJT05fTVMpXG4gICAgICApIHtcbiAgICAgICAgLy8gVGhlcmUgd2FzIGEgdGltZW91dCBhbHJlYWR5LCBidXQgYW4gZWFybGllciBldmVudCB3YXMgYWRkZWRcbiAgICAgICAgLy8gaW50byB0aGUgcXVldWUuIEluIHRoaXMgY2FzZSB3ZSBkcm9wIGFuIG9sZCB0aW1lciBhbmQgc2V0dXBcbiAgICAgICAgLy8gYSBuZXcgb25lIHdpdGggYW4gdXBkYXRlZCAoc21hbGxlcikgdGltZW91dC5cbiAgICAgICAgdGhpcy5jbGVhclRpbWVvdXQoKTtcblxuICAgICAgICBjb25zdCB0aW1lb3V0ID0gTWF0aC5tYXgoaW52b2tlQXQgLSBub3csIEZSQU1FX0RVUkFUSU9OX01TKTtcbiAgICAgICAgdGhpcy5pbnZva2VUaW1lckF0ID0gaW52b2tlQXQ7XG4gICAgICAgIHRoaXMudGltZW91dElkID0gc2V0VGltZW91dChjYWxsYmFjaywgdGltZW91dCkgYXMgdW5rbm93biBhcyBudW1iZXI7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBjbGVhclRpbWVvdXQoKSB7XG4gICAgaWYgKHRoaXMudGltZW91dElkICE9PSBudWxsKSB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0SWQpO1xuICAgICAgdGhpcy50aW1lb3V0SWQgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuY2xlYXJUaW1lb3V0KCk7XG4gICAgdGhpcy5jdXJyZW50Lmxlbmd0aCA9IDA7XG4gICAgdGhpcy5kZWZlcnJlZC5sZW5ndGggPSAwO1xuICB9XG5cbiAgLyoqIEBub2NvbGxhcHNlICovXG4gIHN0YXRpYyDJtXByb3YgPSAvKiogQHB1cmVPckJyZWFrTXlDb2RlICovIMm1ybVkZWZpbmVJbmplY3RhYmxlKHtcbiAgICB0b2tlbjogVGltZXJTY2hlZHVsZXIsXG4gICAgcHJvdmlkZWRJbjogJ3Jvb3QnLFxuICAgIGZhY3Rvcnk6ICgpID0+IG5ldyBUaW1lclNjaGVkdWxlcigpLFxuICB9KTtcbn1cbiJdfQ==