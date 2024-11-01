/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { inject, ɵɵdefineInjectable } from '../di';
import { INJECTOR } from '../render3/interfaces/view';
import { NgZone } from '../zone';
/**
 * Helper function to schedule a callback to be invoked when a browser becomes idle.
 *
 * @param callback A function to be invoked when a browser becomes idle.
 * @param lView LView that hosts an instance of a defer block.
 */
export function onIdle(callback, lView) {
    const injector = lView[INJECTOR];
    const scheduler = injector.get(IdleScheduler);
    const cleanupFn = () => scheduler.remove(callback);
    scheduler.add(callback);
    return cleanupFn;
}
/**
 * Use shims for the `requestIdleCallback` and `cancelIdleCallback` functions for
 * environments where those functions are not available (e.g. Node.js and Safari).
 *
 * Note: we wrap the `requestIdleCallback` call into a function, so that it can be
 * overridden/mocked in test environment and picked up by the runtime code.
 */
const _requestIdleCallback = () => typeof requestIdleCallback !== 'undefined' ? requestIdleCallback : setTimeout;
const _cancelIdleCallback = () => typeof requestIdleCallback !== 'undefined' ? cancelIdleCallback : clearTimeout;
/**
 * Helper service to schedule `requestIdleCallback`s for batches of defer blocks,
 * to avoid calling `requestIdleCallback` for each defer block (e.g. if
 * defer blocks are defined inside a for loop).
 */
export class IdleScheduler {
    constructor() {
        // Indicates whether current callbacks are being invoked.
        this.executingCallbacks = false;
        // Currently scheduled idle callback id.
        this.idleId = null;
        // Set of callbacks to be invoked next.
        this.current = new Set();
        // Set of callbacks collected while invoking current set of callbacks.
        // Those callbacks are scheduled for the next idle period.
        this.deferred = new Set();
        this.ngZone = inject(NgZone);
        this.requestIdleCallbackFn = _requestIdleCallback().bind(globalThis);
        this.cancelIdleCallbackFn = _cancelIdleCallback().bind(globalThis);
    }
    add(callback) {
        const target = this.executingCallbacks ? this.deferred : this.current;
        target.add(callback);
        if (this.idleId === null) {
            this.scheduleIdleCallback();
        }
    }
    remove(callback) {
        const { current, deferred } = this;
        current.delete(callback);
        deferred.delete(callback);
        // If the last callback was removed and there is a pending
        // idle callback - cancel it.
        if (current.size === 0 && deferred.size === 0) {
            this.cancelIdleCallback();
        }
    }
    scheduleIdleCallback() {
        const callback = () => {
            this.cancelIdleCallback();
            this.executingCallbacks = true;
            for (const callback of this.current) {
                callback();
            }
            this.current.clear();
            this.executingCallbacks = false;
            // If there are any callbacks added during an invocation
            // of the current ones - make them "current" and schedule
            // a new idle callback.
            if (this.deferred.size > 0) {
                for (const callback of this.deferred) {
                    this.current.add(callback);
                }
                this.deferred.clear();
                this.scheduleIdleCallback();
            }
        };
        // Ensure that the callback runs in the NgZone since
        // the `requestIdleCallback` is not currently patched by Zone.js.
        this.idleId = this.requestIdleCallbackFn(() => this.ngZone.run(callback));
    }
    cancelIdleCallback() {
        if (this.idleId !== null) {
            this.cancelIdleCallbackFn(this.idleId);
            this.idleId = null;
        }
    }
    ngOnDestroy() {
        this.cancelIdleCallback();
        this.current.clear();
        this.deferred.clear();
    }
    /** @nocollapse */
    static { this.ɵprov = ɵɵdefineInjectable({
        token: IdleScheduler,
        providedIn: 'root',
        factory: () => new IdleScheduler(),
    }); }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWRsZV9zY2hlZHVsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9kZWZlci9pZGxlX3NjaGVkdWxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsTUFBTSxFQUFFLGtCQUFrQixFQUFDLE1BQU0sT0FBTyxDQUFDO0FBQ2pELE9BQU8sRUFBQyxRQUFRLEVBQVEsTUFBTSw0QkFBNEIsQ0FBQztBQUMzRCxPQUFPLEVBQUMsTUFBTSxFQUFDLE1BQU0sU0FBUyxDQUFDO0FBRS9COzs7OztHQUtHO0FBQ0gsTUFBTSxVQUFVLE1BQU0sQ0FBQyxRQUFzQixFQUFFLEtBQVk7SUFDekQsTUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBRSxDQUFDO0lBQ2xDLE1BQU0sU0FBUyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDOUMsTUFBTSxTQUFTLEdBQUcsR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNuRCxTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3hCLE9BQU8sU0FBUyxDQUFDO0FBQ25CLENBQUM7QUFFRDs7Ozs7O0dBTUc7QUFDSCxNQUFNLG9CQUFvQixHQUFHLEdBQUcsRUFBRSxDQUNoQyxPQUFPLG1CQUFtQixLQUFLLFdBQVcsQ0FBQyxDQUFDLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQztBQUNoRixNQUFNLG1CQUFtQixHQUFHLEdBQUcsRUFBRSxDQUMvQixPQUFPLG1CQUFtQixLQUFLLFdBQVcsQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQztBQUVqRjs7OztHQUlHO0FBQ0gsTUFBTSxPQUFPLGFBQWE7SUFBMUI7UUFDRSx5REFBeUQ7UUFDekQsdUJB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QUFDO1FBQ3JCLENBQUM7SUFDSCxDQUFDO0lBRUQsV0FBVztRQUNULElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQzFCLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDckIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUN4QixDQUFDO0lBRUQsa0JBQWtCO2FBQ1gsVUFBSyxHQUE2QixrQkFBa0IsQ0FBQztRQUMxRCxLQUFLLEVBQUUsYUFBYTtRQUNwQixVQUFVLEVBQUUsTUFBTTtRQUNsQixPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxhQUFhLEVBQUU7S0FDbkMsQ0FBQyxBQUpVLENBSVQiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCB7aW5qZWN0LCDJtcm1ZGVmaW5lSW5qZWN0YWJsZX0gZnJvbSAnLi4vZGknO1xuaW1wb3J0IHtJTkpFQ1RPUiwgTFZpZXd9IGZyb20gJy4uL3JlbmRlcjMvaW50ZXJmYWNlcy92aWV3JztcbmltcG9ydCB7Tmdab25lfSBmcm9tICcuLi96b25lJztcblxuLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb24gdG8gc2NoZWR1bGUgYSBjYWxsYmFjayB0byBiZSBpbnZva2VkIHdoZW4gYSBicm93c2VyIGJlY29tZXMgaWRsZS5cbiAqXG4gKiBAcGFyYW0gY2FsbGJhY2sgQSBmdW5jdGlvbiB0byBiZSBpbnZva2VkIHdoZW4gYSBicm93c2VyIGJlY29tZXMgaWRsZS5cbiAqIEBwYXJhbSBsVmlldyBMVmlldyB0aGF0IGhvc3RzIGFuIGluc3RhbmNlIG9mIGEgZGVmZXIgYmxvY2suXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBvbklkbGUoY2FsbGJhY2s6IFZvaWRGdW5jdGlvbiwgbFZpZXc6IExWaWV3KSB7XG4gIGNvbnN0IGluamVjdG9yID0gbFZpZXdbSU5KRUNUT1JdITtcbiAgY29uc3Qgc2NoZWR1bGVyID0gaW5qZWN0b3IuZ2V0KElkbGVTY2hlZHVsZXIpO1xuICBjb25zdCBjbGVhbnVwRm4gPSAoKSA9PiBzY2hlZHVsZXIucmVtb3ZlKGNhbGxiYWNrKTtcbiAgc2NoZWR1bGVyLmFkZChjYWxsYmFjayk7XG4gIHJldHVybiBjbGVhbnVwRm47XG59XG5cbi8qKlxuICogVXNlIHNoaW1zIGZvciB0aGUgYHJlcXVlc3RJZGxlQ2FsbGJhY2tgIGFuZCBgY2FuY2VsSWRsZUNhbGxiYWNrYCBmdW5jdGlvbnMgZm9yXG4gKiBlbnZpcm9ubWVudHMgd2hlcmUgdGhvc2UgZnVuY3Rpb25zIGFyZSBub3QgYXZhaWxhYmxlIChlLmcuIE5vZGUuanMgYW5kIFNhZmFyaSkuXG4gKlxuICogTm90ZTogd2Ugd3JhcCB0aGUgYHJlcXVlc3RJZGxlQ2FsbGJhY2tgIGNhbGwgaW50byBhIGZ1bmN0aW9uLCBzbyB0aGF0IGl0IGNhbiBiZVxuICogb3ZlcnJpZGRlbi9tb2NrZWQgaW4gdGVzdCBlbnZpcm9ubWVudCBhbmQgcGlja2VkIHVwIGJ5IHRoZSBydW50aW1lIGNvZGUuXG4gKi9cbmNvbnN0IF9yZXF1ZXN0SWRsZUNhbGxiYWNrID0gKCkgPT5cbiAgdHlwZW9mIHJlcXVlc3RJZGxlQ2FsbGJhY2sgIT09ICd1bmRlZmluZWQnID8gcmVxdWVzdElkbGVDYWxsYmFjayA6IHNldFRpbWVvdXQ7XG5jb25zdCBfY2FuY2VsSWRsZUNhbGxiYWNrID0gKCkgPT5cbiAgdHlwZW9mIHJlcXVlc3RJZGxlQ2FsbGJhY2sgIT09ICd1bmRlZmluZWQnID8gY2FuY2VsSWRsZUNhbGxiYWNrIDogY2xlYXJUaW1lb3V0O1xuXG4vKipcbiAqIEhlbHBlciBzZXJ2aWNlIHRvIHNjaGVkdWxlIGByZXF1ZXN0SWRsZUNhbGxiYWNrYHMgZm9yIGJhdGNoZXMgb2YgZGVmZXIgYmxvY2tzLFxuICogdG8gYXZvaWQgY2FsbGluZyBgcmVxdWVzdElkbGVDYWxsYmFja2AgZm9yIGVhY2ggZGVmZXIgYmxvY2sgKGUuZy4gaWZcbiAqIGRlZmVyIGJsb2NrcyBhcmUgZGVmaW5lZCBpbnNpZGUgYSBmb3IgbG9vcCkuXG4gKi9cbmV4cG9ydCBjbGFzcyBJZGxlU2NoZWR1bGVyIHtcbiAgLy8gSW5kaWNhdGVzIHdoZXRoZXIgY3VycmVudCBjYWxsYmFja3MgYXJlIGJlaW5nIGludm9rZWQuXG4gIGV4ZWN1dGluZ0NhbGxiYWNrcyA9IGZhbHNlO1xuXG4gIC8vIEN1cnJlbnRseSBzY2hlZHVsZWQgaWRsZSBjYWxsYmFjayBpZC5cbiAgaWRsZUlkOiBudW1iZXIgfCBudWxsID0gbnVsbDtcblxuICAvLyBTZXQgb2YgY2FsbGJhY2tzIHRvIGJlIGludm9rZWQgbmV4dC5cbiAgY3VycmVudCA9IG5ldyBTZXQ8Vm9pZEZ1bmN0aW9uPigpO1xuXG4gIC8vIFNldCBvZiBjYWxsYmFja3MgY29sbGVjdGVkIHdoaWxlIGludm9raW5nIGN1cnJlbnQgc2V0IG9mIGNhbGxiYWNrcy5cbiAgLy8gVGhvc2UgY2FsbGJhY2tzIGFyZSBzY2hlZHVsZWQgZm9yIHRoZSBuZXh0IGlkbGUgcGVyaW9kLlxuICBkZWZlcnJlZCA9IG5ldyBTZXQ8Vm9pZEZ1bmN0aW9uPigpO1xuXG4gIG5nWm9uZSA9IGluamVjdChOZ1pvbmUpO1xuXG4gIHJlcXVlc3RJZGxlQ2FsbGJhY2tGbiA9IF9yZXF1ZXN0SWRsZUNhbGxiYWNrKCkuYmluZChnbG9iYWxUaGlzKTtcbiAgY2FuY2VsSWRsZUNhbGxiYWNrRm4gPSBfY2FuY2VsSWRsZUNhbGxiYWNrKCkuYmluZChnbG9iYWxUaGlzKTtcblxuICBhZGQoY2FsbGJhY2s6IFZvaWRGdW5jdGlvbikge1xuICAgIGNvbnN0IHRhcmdldCA9IHRoaXMuZXhlY3V0aW5nQ2FsbGJhY2tzID8gdGhpcy5kZWZlcnJlZCA6IHRoaXMuY3VycmVudDtcbiAgICB0YXJnZXQuYWRkKGNhbGxiYWNrKTtcbiAgICBpZiAodGhpcy5pZGxlSWQgPT09IG51bGwpIHtcbiAgICAgIHRoaXMuc2NoZWR1bGVJZGxlQ2FsbGJhY2soKTtcbiAgICB9XG4gIH1cblxuICByZW1vdmUoY2FsbGJhY2s6IFZvaWRGdW5jdGlvbikge1xuICAgIGNvbnN0IHtjdXJyZW50LCBkZWZlcnJlZH0gPSB0aGlzO1xuXG4gICAgY3VycmVudC5kZWxldGUoY2FsbGJhY2spO1xuICAgIGRlZmVycmVkLmRlbGV0ZShjYWxsYmFjayk7XG5cbiAgICAvLyBJZiB0aGUgbGFzdCBjYWxsYmFjayB3YXMgcmVtb3ZlZCBhbmQgdGhlcmUgaXMgYSBwZW5kaW5nXG4gICAgLy8gaWRsZSBjYWxsYmFjayAtIGNhbmNlbCBpdC5cbiAgICBpZiAoY3VycmVudC5zaXplID09PSAwICYmIGRlZmVycmVkLnNpemUgPT09IDApIHtcbiAgICAgIHRoaXMuY2FuY2VsSWRsZUNhbGxiYWNrKCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBzY2hlZHVsZUlkbGVDYWxsYmFjaygpIHtcbiAgICBjb25zdCBjYWxsYmFjayA9ICgpID0+IHtcbiAgICAgIHRoaXMuY2FuY2VsSWRsZUNhbGxiYWNrKCk7XG5cbiAgICAgIHRoaXMuZXhlY3V0aW5nQ2FsbGJhY2tzID0gdHJ1ZTtcblxuICAgICAgZm9yIChjb25zdCBjYWxsYmFjayBvZiB0aGlzLmN1cnJlbnQpIHtcbiAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuY3VycmVudC5jbGVhcigpO1xuXG4gICAgICB0aGlzLmV4ZWN1dGluZ0NhbGxiYWNrcyA9IGZhbHNlO1xuXG4gICAgICAvLyBJZiB0aGVyZSBhcmUgYW55IGNhbGxiYWNrcyBhZGRlZCBkdXJpbmcgYW4gaW52b2NhdGlvblxuICAgICAgLy8gb2YgdGhlIGN1cnJlbnQgb25lcyAtIG1ha2UgdGhlbSBcImN1cnJlbnRcIiBhbmQgc2NoZWR1bGVcbiAgICAgIC8vIGEgbmV3IGlkbGUgY2FsbGJhY2suXG4gICAgICBpZiAodGhpcy5kZWZlcnJlZC5zaXplID4gMCkge1xuICAgICAgICBmb3IgKGNvbnN0IGNhbGxiYWNrIG9mIHRoaXMuZGVmZXJyZWQpIHtcbiAgICAgICAgICB0aGlzLmN1cnJlbnQuYWRkKGNhbGxiYWNrKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmRlZmVycmVkLmNsZWFyKCk7XG4gICAgICAgIHRoaXMuc2NoZWR1bGVJZGxlQ2FsbGJhY2soKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIC8vIEVuc3VyZSB0aGF0IHRoZSBjYWxsYmFjayBydW5zIGluIHRoZSBOZ1pvbmUgc2luY2VcbiAgICAvLyB0aGUgYHJlcXVlc3RJZGxlQ2FsbGJhY2tgIGlzIG5vdCBjdXJyZW50bHkgcGF0Y2hlZCBieSBab25lLmpzLlxuICAgIHRoaXMuaWRsZUlkID0gdGhpcy5yZXF1ZXN0SWRsZUNhbGxiYWNrRm4oKCkgPT4gdGhpcy5uZ1pvbmUucnVuKGNhbGxiYWNrKSkgYXMgbnVtYmVyO1xuICB9XG5cbiAgcHJpdmF0ZSBjYW5jZWxJZGxlQ2FsbGJhY2soKSB7XG4gICAgaWYgKHRoaXMuaWRsZUlkICE9PSBudWxsKSB7XG4gICAgICB0aGlzLmNhbmNlbElkbGVDYWxsYmFja0ZuKHRoaXMuaWRsZUlkKTtcbiAgICAgIHRoaXMuaWRsZUlkID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLmNhbmNlbElkbGVDYWxsYmFjaygpO1xuICAgIHRoaXMuY3VycmVudC5jbGVhcigpO1xuICAgIHRoaXMuZGVmZXJyZWQuY2xlYXIoKTtcbiAgfVxuXG4gIC8qKiBAbm9jb2xsYXBzZSAqL1xuICBzdGF0aWMgybVwcm92ID0gLyoqIEBwdXJlT3JCcmVha015Q29kZSAqLyDJtcm1ZGVmaW5lSW5qZWN0YWJsZSh7XG4gICAgdG9rZW46IElkbGVTY2hlZHVsZXIsXG4gICAgcHJvdmlkZWRJbjogJ3Jvb3QnLFxuICAgIGZhY3Rvcnk6ICgpID0+IG5ldyBJZGxlU2NoZWR1bGVyKCksXG4gIH0pO1xufVxuIl19