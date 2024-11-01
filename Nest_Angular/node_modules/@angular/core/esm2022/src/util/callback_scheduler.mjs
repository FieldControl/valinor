/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { noop } from './noop';
/**
 * Gets a scheduling function that runs the callback after the first of setTimeout and
 * requestAnimationFrame resolves.
 *
 * - `requestAnimationFrame` ensures that change detection runs ahead of a browser repaint.
 * This ensures that the create and update passes of a change detection always happen
 * in the same frame.
 * - When the browser is resource-starved, `rAF` can execute _before_ a `setTimeout` because
 * rendering is a very high priority process. This means that `setTimeout` cannot guarantee
 * same-frame create and update pass, when `setTimeout` is used to schedule the update phase.
 * - While `rAF` gives us the desirable same-frame updates, it has two limitations that
 * prevent it from being used alone. First, it does not run in background tabs, which would
 * prevent Angular from initializing an application when opened in a new tab (for example).
 * Second, repeated calls to requestAnimationFrame will execute at the refresh rate of the
 * hardware (~16ms for a 60Hz display). This would cause significant slowdown of tests that
 * are written with several updates and asserts in the form of "update; await stable; assert;".
 * - Both `setTimeout` and `rAF` are able to "coalesce" several events from a single user
 * interaction into a single change detection. Importantly, this reduces view tree traversals when
 * compared to an alternative timing mechanism like `queueMicrotask`, where change detection would
 * then be interleaves between each event.
 *
 * By running change detection after the first of `setTimeout` and `rAF` to execute, we get the
 * best of both worlds.
 *
 * @returns a function to cancel the scheduled callback
 */
export function scheduleCallbackWithRafRace(callback) {
    let timeoutId;
    let animationFrameId;
    function cleanup() {
        callback = noop;
        try {
            if (animationFrameId !== undefined && typeof cancelAnimationFrame === 'function') {
                cancelAnimationFrame(animationFrameId);
            }
            if (timeoutId !== undefined) {
                clearTimeout(timeoutId);
            }
        }
        catch {
            // Clearing/canceling can fail in tests due to the timing of functions being patched and unpatched
            // Just ignore the errors - we protect ourselves from this issue by also making the callback a no-op.
        }
    }
    timeoutId = setTimeout(() => {
        callback();
        cleanup();
    });
    if (typeof requestAnimationFrame === 'function') {
        animationFrameId = requestAnimationFrame(() => {
            callback();
            cleanup();
        });
    }
    return () => cleanup();
}
export function scheduleCallbackWithMicrotask(callback) {
    queueMicrotask(() => callback());
    return () => {
        callback = noop;
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FsbGJhY2tfc2NoZWR1bGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvdXRpbC9jYWxsYmFja19zY2hlZHVsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLElBQUksRUFBQyxNQUFNLFFBQVEsQ0FBQztBQUU1Qjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXlCRztBQUNILE1BQU0sVUFBVSwyQkFBMkIsQ0FBQyxRQUFrQjtJQUM1RCxJQUFJLFNBQWlCLENBQUM7SUFDdEIsSUFBSSxnQkFBd0IsQ0FBQztJQUM3QixTQUFTLE9BQU87UUFDZCxRQUFRLEdBQUcsSUFBSSxDQUFDO1FBQ2hCLElBQUksQ0FBQztZQUNILElBQUksZ0JBQWdCLEtBQUssU0FBUyxJQUFJLE9BQU8sb0JBQW9CLEtBQUssVUFBVSxFQUFFLENBQUM7Z0JBQ2pGLG9CQUFvQixDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDekMsQ0FBQztZQUNELElBQUksU0FBUyxLQUFLLFNBQVMsRUFBRSxDQUFDO2dCQUM1QixZQUFZLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDMUIsQ0FBQztRQUNILENBQUM7UUFBQyxNQUFNLENBQUM7WUFDUCxrR0FBa0c7WUFDbEcscUdBQXFHO1FBQ3ZHLENBQUM7SUFDSCxDQUFDO0lBQ0QsU0FBUyxHQUFHLFVBQVUsQ0FBQyxHQUFHLEVBQUU7UUFDMUIsUUFBUSxFQUFFLENBQUM7UUFDWCxPQUFPLEVBQUUsQ0FBQztJQUNaLENBQUMsQ0FBc0IsQ0FBQztJQUN4QixJQUFJLE9BQU8scUJBQXFCLEtBQUssVUFBVSxFQUFFLENBQUM7UUFDaEQsZ0JBQWdCLEdBQUcscUJBQXFCLENBQUMsR0FBRyxFQUFFO1lBQzVDLFFBQVEsRUFBRSxDQUFDO1lBQ1gsT0FBTyxFQUFFLENBQUM7UUFDWixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxPQUFPLEdBQUcsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3pCLENBQUM7QUFFRCxNQUFNLFVBQVUsNkJBQTZCLENBQUMsUUFBa0I7SUFDOUQsY0FBYyxDQUFDLEdBQUcsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7SUFFakMsT0FBTyxHQUFHLEVBQUU7UUFDVixRQUFRLEdBQUcsSUFBSSxDQUFDO0lBQ2xCLENBQUMsQ0FBQztBQUNKLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCB7bm9vcH0gZnJvbSAnLi9ub29wJztcblxuLyoqXG4gKiBHZXRzIGEgc2NoZWR1bGluZyBmdW5jdGlvbiB0aGF0IHJ1bnMgdGhlIGNhbGxiYWNrIGFmdGVyIHRoZSBmaXJzdCBvZiBzZXRUaW1lb3V0IGFuZFxuICogcmVxdWVzdEFuaW1hdGlvbkZyYW1lIHJlc29sdmVzLlxuICpcbiAqIC0gYHJlcXVlc3RBbmltYXRpb25GcmFtZWAgZW5zdXJlcyB0aGF0IGNoYW5nZSBkZXRlY3Rpb24gcnVucyBhaGVhZCBvZiBhIGJyb3dzZXIgcmVwYWludC5cbiAqIFRoaXMgZW5zdXJlcyB0aGF0IHRoZSBjcmVhdGUgYW5kIHVwZGF0ZSBwYXNzZXMgb2YgYSBjaGFuZ2UgZGV0ZWN0aW9uIGFsd2F5cyBoYXBwZW5cbiAqIGluIHRoZSBzYW1lIGZyYW1lLlxuICogLSBXaGVuIHRoZSBicm93c2VyIGlzIHJlc291cmNlLXN0YXJ2ZWQsIGByQUZgIGNhbiBleGVjdXRlIF9iZWZvcmVfIGEgYHNldFRpbWVvdXRgIGJlY2F1c2VcbiAqIHJlbmRlcmluZyBpcyBhIHZlcnkgaGlnaCBwcmlvcml0eSBwcm9jZXNzLiBUaGlzIG1lYW5zIHRoYXQgYHNldFRpbWVvdXRgIGNhbm5vdCBndWFyYW50ZWVcbiAqIHNhbWUtZnJhbWUgY3JlYXRlIGFuZCB1cGRhdGUgcGFzcywgd2hlbiBgc2V0VGltZW91dGAgaXMgdXNlZCB0byBzY2hlZHVsZSB0aGUgdXBkYXRlIHBoYXNlLlxuICogLSBXaGlsZSBgckFGYCBnaXZlcyB1cyB0aGUgZGVzaXJhYmxlIHNhbWUtZnJhbWUgdXBkYXRlcywgaXQgaGFzIHR3byBsaW1pdGF0aW9ucyB0aGF0XG4gKiBwcmV2ZW50IGl0IGZyb20gYmVpbmcgdXNlZCBhbG9uZS4gRmlyc3QsIGl0IGRvZXMgbm90IHJ1biBpbiBiYWNrZ3JvdW5kIHRhYnMsIHdoaWNoIHdvdWxkXG4gKiBwcmV2ZW50IEFuZ3VsYXIgZnJvbSBpbml0aWFsaXppbmcgYW4gYXBwbGljYXRpb24gd2hlbiBvcGVuZWQgaW4gYSBuZXcgdGFiIChmb3IgZXhhbXBsZSkuXG4gKiBTZWNvbmQsIHJlcGVhdGVkIGNhbGxzIHRvIHJlcXVlc3RBbmltYXRpb25GcmFtZSB3aWxsIGV4ZWN1dGUgYXQgdGhlIHJlZnJlc2ggcmF0ZSBvZiB0aGVcbiAqIGhhcmR3YXJlICh+MTZtcyBmb3IgYSA2MEh6IGRpc3BsYXkpLiBUaGlzIHdvdWxkIGNhdXNlIHNpZ25pZmljYW50IHNsb3dkb3duIG9mIHRlc3RzIHRoYXRcbiAqIGFyZSB3cml0dGVuIHdpdGggc2V2ZXJhbCB1cGRhdGVzIGFuZCBhc3NlcnRzIGluIHRoZSBmb3JtIG9mIFwidXBkYXRlOyBhd2FpdCBzdGFibGU7IGFzc2VydDtcIi5cbiAqIC0gQm90aCBgc2V0VGltZW91dGAgYW5kIGByQUZgIGFyZSBhYmxlIHRvIFwiY29hbGVzY2VcIiBzZXZlcmFsIGV2ZW50cyBmcm9tIGEgc2luZ2xlIHVzZXJcbiAqIGludGVyYWN0aW9uIGludG8gYSBzaW5nbGUgY2hhbmdlIGRldGVjdGlvbi4gSW1wb3J0YW50bHksIHRoaXMgcmVkdWNlcyB2aWV3IHRyZWUgdHJhdmVyc2FscyB3aGVuXG4gKiBjb21wYXJlZCB0byBhbiBhbHRlcm5hdGl2ZSB0aW1pbmcgbWVjaGFuaXNtIGxpa2UgYHF1ZXVlTWljcm90YXNrYCwgd2hlcmUgY2hhbmdlIGRldGVjdGlvbiB3b3VsZFxuICogdGhlbiBiZSBpbnRlcmxlYXZlcyBiZXR3ZWVuIGVhY2ggZXZlbnQuXG4gKlxuICogQnkgcnVubmluZyBjaGFuZ2UgZGV0ZWN0aW9uIGFmdGVyIHRoZSBmaXJzdCBvZiBgc2V0VGltZW91dGAgYW5kIGByQUZgIHRvIGV4ZWN1dGUsIHdlIGdldCB0aGVcbiAqIGJlc3Qgb2YgYm90aCB3b3JsZHMuXG4gKlxuICogQHJldHVybnMgYSBmdW5jdGlvbiB0byBjYW5jZWwgdGhlIHNjaGVkdWxlZCBjYWxsYmFja1xuICovXG5leHBvcnQgZnVuY3Rpb24gc2NoZWR1bGVDYWxsYmFja1dpdGhSYWZSYWNlKGNhbGxiYWNrOiBGdW5jdGlvbik6ICgpID0+IHZvaWQge1xuICBsZXQgdGltZW91dElkOiBudW1iZXI7XG4gIGxldCBhbmltYXRpb25GcmFtZUlkOiBudW1iZXI7XG4gIGZ1bmN0aW9uIGNsZWFudXAoKSB7XG4gICAgY2FsbGJhY2sgPSBub29wO1xuICAgIHRyeSB7XG4gICAgICBpZiAoYW5pbWF0aW9uRnJhbWVJZCAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiBjYW5jZWxBbmltYXRpb25GcmFtZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBjYW5jZWxBbmltYXRpb25GcmFtZShhbmltYXRpb25GcmFtZUlkKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aW1lb3V0SWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIHtcbiAgICAgIC8vIENsZWFyaW5nL2NhbmNlbGluZyBjYW4gZmFpbCBpbiB0ZXN0cyBkdWUgdG8gdGhlIHRpbWluZyBvZiBmdW5jdGlvbnMgYmVpbmcgcGF0Y2hlZCBhbmQgdW5wYXRjaGVkXG4gICAgICAvLyBKdXN0IGlnbm9yZSB0aGUgZXJyb3JzIC0gd2UgcHJvdGVjdCBvdXJzZWx2ZXMgZnJvbSB0aGlzIGlzc3VlIGJ5IGFsc28gbWFraW5nIHRoZSBjYWxsYmFjayBhIG5vLW9wLlxuICAgIH1cbiAgfVxuICB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICBjYWxsYmFjaygpO1xuICAgIGNsZWFudXAoKTtcbiAgfSkgYXMgdW5rbm93biBhcyBudW1iZXI7XG4gIGlmICh0eXBlb2YgcmVxdWVzdEFuaW1hdGlvbkZyYW1lID09PSAnZnVuY3Rpb24nKSB7XG4gICAgYW5pbWF0aW9uRnJhbWVJZCA9IHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICBjYWxsYmFjaygpO1xuICAgICAgY2xlYW51cCgpO1xuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuICgpID0+IGNsZWFudXAoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNjaGVkdWxlQ2FsbGJhY2tXaXRoTWljcm90YXNrKGNhbGxiYWNrOiBGdW5jdGlvbik6ICgpID0+IHZvaWQge1xuICBxdWV1ZU1pY3JvdGFzaygoKSA9PiBjYWxsYmFjaygpKTtcblxuICByZXR1cm4gKCkgPT4ge1xuICAgIGNhbGxiYWNrID0gbm9vcDtcbiAgfTtcbn1cbiJdfQ==