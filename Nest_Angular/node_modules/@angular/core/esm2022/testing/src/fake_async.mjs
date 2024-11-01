/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
const _Zone = typeof Zone !== 'undefined' ? Zone : null;
const fakeAsyncTestModule = _Zone && _Zone[_Zone.__symbol__('fakeAsyncTest')];
const fakeAsyncTestModuleNotLoadedErrorMessage = `zone-testing.js is needed for the fakeAsync() test helper but could not be found.
        Please make sure that your environment includes zone.js/testing`;
/**
 * Clears out the shared fake async zone for a test.
 * To be called in a global `beforeEach`.
 *
 * @publicApi
 */
export function resetFakeAsyncZone() {
    if (fakeAsyncTestModule) {
        return fakeAsyncTestModule.resetFakeAsyncZone();
    }
    throw new Error(fakeAsyncTestModuleNotLoadedErrorMessage);
}
export function resetFakeAsyncZoneIfExists() {
    if (fakeAsyncTestModule) {
        fakeAsyncTestModule.resetFakeAsyncZone();
    }
}
/**
 * Wraps a function to be executed in the `fakeAsync` zone:
 * - Microtasks are manually executed by calling `flushMicrotasks()`.
 * - Timers are synchronous; `tick()` simulates the asynchronous passage of time.
 *
 * Can be used to wrap `inject()` calls.
 *
 * @param fn The function that you want to wrap in the `fakeAsync` zone.
 * @param options
 *   - flush: When true, will drain the macrotask queue after the test function completes.
 *     When false, will throw an exception at the end of the function if there are pending timers.
 *
 * @usageNotes
 * ### Example
 *
 * {@example core/testing/ts/fake_async.ts region='basic'}
 *
 *
 * @returns The function wrapped to be executed in the `fakeAsync` zone.
 * Any arguments passed when calling this returned function will be passed through to the `fn`
 * function in the parameters when it is called.
 *
 * @publicApi
 */
export function fakeAsync(fn, options) {
    if (fakeAsyncTestModule) {
        return fakeAsyncTestModule.fakeAsync(fn, options);
    }
    throw new Error(fakeAsyncTestModuleNotLoadedErrorMessage);
}
/**
 * Simulates the asynchronous passage of time for the timers in the `fakeAsync` zone.
 *
 * The microtasks queue is drained at the very start of this function and after any timer callback
 * has been executed.
 *
 * @param millis The number of milliseconds to advance the virtual timer.
 * @param tickOptions The options to pass to the `tick()` function.
 *
 * @usageNotes
 *
 * The `tick()` option is a flag called `processNewMacroTasksSynchronously`,
 * which determines whether or not to invoke new macroTasks.
 *
 * If you provide a `tickOptions` object, but do not specify a
 * `processNewMacroTasksSynchronously` property (`tick(100, {})`),
 * then `processNewMacroTasksSynchronously` defaults to true.
 *
 * If you omit the `tickOptions` parameter (`tick(100))`), then
 * `tickOptions` defaults to `{processNewMacroTasksSynchronously: true}`.
 *
 * ### Example
 *
 * {@example core/testing/ts/fake_async.ts region='basic'}
 *
 * The following example includes a nested timeout (new macroTask), and
 * the `tickOptions` parameter is allowed to default. In this case,
 * `processNewMacroTasksSynchronously` defaults to true, and the nested
 * function is executed on each tick.
 *
 * ```
 * it ('test with nested setTimeout', fakeAsync(() => {
 *   let nestedTimeoutInvoked = false;
 *   function funcWithNestedTimeout() {
 *     setTimeout(() => {
 *       nestedTimeoutInvoked = true;
 *     });
 *   };
 *   setTimeout(funcWithNestedTimeout);
 *   tick();
 *   expect(nestedTimeoutInvoked).toBe(true);
 * }));
 * ```
 *
 * In the following case, `processNewMacroTasksSynchronously` is explicitly
 * set to false, so the nested timeout function is not invoked.
 *
 * ```
 * it ('test with nested setTimeout', fakeAsync(() => {
 *   let nestedTimeoutInvoked = false;
 *   function funcWithNestedTimeout() {
 *     setTimeout(() => {
 *       nestedTimeoutInvoked = true;
 *     });
 *   };
 *   setTimeout(funcWithNestedTimeout);
 *   tick(0, {processNewMacroTasksSynchronously: false});
 *   expect(nestedTimeoutInvoked).toBe(false);
 * }));
 * ```
 *
 *
 * @publicApi
 */
export function tick(millis = 0, tickOptions = {
    processNewMacroTasksSynchronously: true,
}) {
    if (fakeAsyncTestModule) {
        return fakeAsyncTestModule.tick(millis, tickOptions);
    }
    throw new Error(fakeAsyncTestModuleNotLoadedErrorMessage);
}
/**
 * Flushes any pending microtasks and simulates the asynchronous passage of time for the timers in
 * the `fakeAsync` zone by
 * draining the macrotask queue until it is empty.
 *
 * @param maxTurns The maximum number of times the scheduler attempts to clear its queue before
 *     throwing an error.
 * @returns The simulated time elapsed, in milliseconds.
 *
 * @publicApi
 */
export function flush(maxTurns) {
    if (fakeAsyncTestModule) {
        return fakeAsyncTestModule.flush(maxTurns);
    }
    throw new Error(fakeAsyncTestModuleNotLoadedErrorMessage);
}
/**
 * Discard all remaining periodic tasks.
 *
 * @publicApi
 */
export function discardPeriodicTasks() {
    if (fakeAsyncTestModule) {
        return fakeAsyncTestModule.discardPeriodicTasks();
    }
    throw new Error(fakeAsyncTestModuleNotLoadedErrorMessage);
}
/**
 * Flush any pending microtasks.
 *
 * @publicApi
 */
export function flushMicrotasks() {
    if (fakeAsyncTestModule) {
        return fakeAsyncTestModule.flushMicrotasks();
    }
    throw new Error(fakeAsyncTestModuleNotLoadedErrorMessage);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmFrZV9hc3luYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvdGVzdGluZy9zcmMvZmFrZV9hc3luYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFDSCxNQUFNLEtBQUssR0FBUSxPQUFPLElBQUksS0FBSyxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0FBQzdELE1BQU0sbUJBQW1CLEdBQUcsS0FBSyxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7QUFFOUUsTUFBTSx3Q0FBd0MsR0FBRzt3RUFDdUIsQ0FBQztBQUV6RTs7Ozs7R0FLRztBQUNILE1BQU0sVUFBVSxrQkFBa0I7SUFDaEMsSUFBSSxtQkFBbUIsRUFBRSxDQUFDO1FBQ3hCLE9BQU8sbUJBQW1CLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztJQUNsRCxDQUFDO0lBQ0QsTUFBTSxJQUFJLEtBQUssQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFDO0FBQzVELENBQUM7QUFFRCxNQUFNLFVBQVUsMEJBQTBCO0lBQ3hDLElBQUksbUJBQW1CLEVBQUUsQ0FBQztRQUN4QixtQkFBbUIsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0lBQzNDLENBQUM7QUFDSCxDQUFDO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBdUJHO0FBQ0gsTUFBTSxVQUFVLFNBQVMsQ0FBQyxFQUFZLEVBQUUsT0FBMkI7SUFDakUsSUFBSSxtQkFBbUIsRUFBRSxDQUFDO1FBQ3hCLE9BQU8sbUJBQW1CLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNwRCxDQUFDO0lBQ0QsTUFBTSxJQUFJLEtBQUssQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFDO0FBQzVELENBQUM7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBK0RHO0FBQ0gsTUFBTSxVQUFVLElBQUksQ0FDbEIsU0FBaUIsQ0FBQyxFQUNsQixjQUE0RDtJQUMxRCxpQ0FBaUMsRUFBRSxJQUFJO0NBQ3hDO0lBRUQsSUFBSSxtQkFBbUIsRUFBRSxDQUFDO1FBQ3hCLE9BQU8sbUJBQW1CLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQztJQUN2RCxDQUFDO0lBQ0QsTUFBTSxJQUFJLEtBQUssQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFDO0FBQzVELENBQUM7QUFFRDs7Ozs7Ozs7OztHQVVHO0FBQ0gsTUFBTSxVQUFVLEtBQUssQ0FBQyxRQUFpQjtJQUNyQyxJQUFJLG1CQUFtQixFQUFFLENBQUM7UUFDeEIsT0FBTyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUNELE1BQU0sSUFBSSxLQUFLLENBQUMsd0NBQXdDLENBQUMsQ0FBQztBQUM1RCxDQUFDO0FBRUQ7Ozs7R0FJRztBQUNILE1BQU0sVUFBVSxvQkFBb0I7SUFDbEMsSUFBSSxtQkFBbUIsRUFBRSxDQUFDO1FBQ3hCLE9BQU8sbUJBQW1CLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztJQUNwRCxDQUFDO0lBQ0QsTUFBTSxJQUFJLEtBQUssQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFDO0FBQzVELENBQUM7QUFFRDs7OztHQUlHO0FBQ0gsTUFBTSxVQUFVLGVBQWU7SUFDN0IsSUFBSSxtQkFBbUIsRUFBRSxDQUFDO1FBQ3hCLE9BQU8sbUJBQW1CLENBQUMsZUFBZSxFQUFFLENBQUM7SUFDL0MsQ0FBQztJQUNELE1BQU0sSUFBSSxLQUFLLENBQUMsd0NBQXdDLENBQUMsQ0FBQztBQUM1RCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuY29uc3QgX1pvbmU6IGFueSA9IHR5cGVvZiBab25lICE9PSAndW5kZWZpbmVkJyA/IFpvbmUgOiBudWxsO1xuY29uc3QgZmFrZUFzeW5jVGVzdE1vZHVsZSA9IF9ab25lICYmIF9ab25lW19ab25lLl9fc3ltYm9sX18oJ2Zha2VBc3luY1Rlc3QnKV07XG5cbmNvbnN0IGZha2VBc3luY1Rlc3RNb2R1bGVOb3RMb2FkZWRFcnJvck1lc3NhZ2UgPSBgem9uZS10ZXN0aW5nLmpzIGlzIG5lZWRlZCBmb3IgdGhlIGZha2VBc3luYygpIHRlc3QgaGVscGVyIGJ1dCBjb3VsZCBub3QgYmUgZm91bmQuXG4gICAgICAgIFBsZWFzZSBtYWtlIHN1cmUgdGhhdCB5b3VyIGVudmlyb25tZW50IGluY2x1ZGVzIHpvbmUuanMvdGVzdGluZ2A7XG5cbi8qKlxuICogQ2xlYXJzIG91dCB0aGUgc2hhcmVkIGZha2UgYXN5bmMgem9uZSBmb3IgYSB0ZXN0LlxuICogVG8gYmUgY2FsbGVkIGluIGEgZ2xvYmFsIGBiZWZvcmVFYWNoYC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNldEZha2VBc3luY1pvbmUoKTogdm9pZCB7XG4gIGlmIChmYWtlQXN5bmNUZXN0TW9kdWxlKSB7XG4gICAgcmV0dXJuIGZha2VBc3luY1Rlc3RNb2R1bGUucmVzZXRGYWtlQXN5bmNab25lKCk7XG4gIH1cbiAgdGhyb3cgbmV3IEVycm9yKGZha2VBc3luY1Rlc3RNb2R1bGVOb3RMb2FkZWRFcnJvck1lc3NhZ2UpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVzZXRGYWtlQXN5bmNab25lSWZFeGlzdHMoKTogdm9pZCB7XG4gIGlmIChmYWtlQXN5bmNUZXN0TW9kdWxlKSB7XG4gICAgZmFrZUFzeW5jVGVzdE1vZHVsZS5yZXNldEZha2VBc3luY1pvbmUoKTtcbiAgfVxufVxuXG4vKipcbiAqIFdyYXBzIGEgZnVuY3Rpb24gdG8gYmUgZXhlY3V0ZWQgaW4gdGhlIGBmYWtlQXN5bmNgIHpvbmU6XG4gKiAtIE1pY3JvdGFza3MgYXJlIG1hbnVhbGx5IGV4ZWN1dGVkIGJ5IGNhbGxpbmcgYGZsdXNoTWljcm90YXNrcygpYC5cbiAqIC0gVGltZXJzIGFyZSBzeW5jaHJvbm91czsgYHRpY2soKWAgc2ltdWxhdGVzIHRoZSBhc3luY2hyb25vdXMgcGFzc2FnZSBvZiB0aW1lLlxuICpcbiAqIENhbiBiZSB1c2VkIHRvIHdyYXAgYGluamVjdCgpYCBjYWxscy5cbiAqXG4gKiBAcGFyYW0gZm4gVGhlIGZ1bmN0aW9uIHRoYXQgeW91IHdhbnQgdG8gd3JhcCBpbiB0aGUgYGZha2VBc3luY2Agem9uZS5cbiAqIEBwYXJhbSBvcHRpb25zXG4gKiAgIC0gZmx1c2g6IFdoZW4gdHJ1ZSwgd2lsbCBkcmFpbiB0aGUgbWFjcm90YXNrIHF1ZXVlIGFmdGVyIHRoZSB0ZXN0IGZ1bmN0aW9uIGNvbXBsZXRlcy5cbiAqICAgICBXaGVuIGZhbHNlLCB3aWxsIHRocm93IGFuIGV4Y2VwdGlvbiBhdCB0aGUgZW5kIG9mIHRoZSBmdW5jdGlvbiBpZiB0aGVyZSBhcmUgcGVuZGluZyB0aW1lcnMuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqICMjIyBFeGFtcGxlXG4gKlxuICoge0BleGFtcGxlIGNvcmUvdGVzdGluZy90cy9mYWtlX2FzeW5jLnRzIHJlZ2lvbj0nYmFzaWMnfVxuICpcbiAqXG4gKiBAcmV0dXJucyBUaGUgZnVuY3Rpb24gd3JhcHBlZCB0byBiZSBleGVjdXRlZCBpbiB0aGUgYGZha2VBc3luY2Agem9uZS5cbiAqIEFueSBhcmd1bWVudHMgcGFzc2VkIHdoZW4gY2FsbGluZyB0aGlzIHJldHVybmVkIGZ1bmN0aW9uIHdpbGwgYmUgcGFzc2VkIHRocm91Z2ggdG8gdGhlIGBmbmBcbiAqIGZ1bmN0aW9uIGluIHRoZSBwYXJhbWV0ZXJzIHdoZW4gaXQgaXMgY2FsbGVkLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZha2VBc3luYyhmbjogRnVuY3Rpb24sIG9wdGlvbnM/OiB7Zmx1c2g/OiBib29sZWFufSk6ICguLi5hcmdzOiBhbnlbXSkgPT4gYW55IHtcbiAgaWYgKGZha2VBc3luY1Rlc3RNb2R1bGUpIHtcbiAgICByZXR1cm4gZmFrZUFzeW5jVGVzdE1vZHVsZS5mYWtlQXN5bmMoZm4sIG9wdGlvbnMpO1xuICB9XG4gIHRocm93IG5ldyBFcnJvcihmYWtlQXN5bmNUZXN0TW9kdWxlTm90TG9hZGVkRXJyb3JNZXNzYWdlKTtcbn1cblxuLyoqXG4gKiBTaW11bGF0ZXMgdGhlIGFzeW5jaHJvbm91cyBwYXNzYWdlIG9mIHRpbWUgZm9yIHRoZSB0aW1lcnMgaW4gdGhlIGBmYWtlQXN5bmNgIHpvbmUuXG4gKlxuICogVGhlIG1pY3JvdGFza3MgcXVldWUgaXMgZHJhaW5lZCBhdCB0aGUgdmVyeSBzdGFydCBvZiB0aGlzIGZ1bmN0aW9uIGFuZCBhZnRlciBhbnkgdGltZXIgY2FsbGJhY2tcbiAqIGhhcyBiZWVuIGV4ZWN1dGVkLlxuICpcbiAqIEBwYXJhbSBtaWxsaXMgVGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgdG8gYWR2YW5jZSB0aGUgdmlydHVhbCB0aW1lci5cbiAqIEBwYXJhbSB0aWNrT3B0aW9ucyBUaGUgb3B0aW9ucyB0byBwYXNzIHRvIHRoZSBgdGljaygpYCBmdW5jdGlvbi5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqIFRoZSBgdGljaygpYCBvcHRpb24gaXMgYSBmbGFnIGNhbGxlZCBgcHJvY2Vzc05ld01hY3JvVGFza3NTeW5jaHJvbm91c2x5YCxcbiAqIHdoaWNoIGRldGVybWluZXMgd2hldGhlciBvciBub3QgdG8gaW52b2tlIG5ldyBtYWNyb1Rhc2tzLlxuICpcbiAqIElmIHlvdSBwcm92aWRlIGEgYHRpY2tPcHRpb25zYCBvYmplY3QsIGJ1dCBkbyBub3Qgc3BlY2lmeSBhXG4gKiBgcHJvY2Vzc05ld01hY3JvVGFza3NTeW5jaHJvbm91c2x5YCBwcm9wZXJ0eSAoYHRpY2soMTAwLCB7fSlgKSxcbiAqIHRoZW4gYHByb2Nlc3NOZXdNYWNyb1Rhc2tzU3luY2hyb25vdXNseWAgZGVmYXVsdHMgdG8gdHJ1ZS5cbiAqXG4gKiBJZiB5b3Ugb21pdCB0aGUgYHRpY2tPcHRpb25zYCBwYXJhbWV0ZXIgKGB0aWNrKDEwMCkpYCksIHRoZW5cbiAqIGB0aWNrT3B0aW9uc2AgZGVmYXVsdHMgdG8gYHtwcm9jZXNzTmV3TWFjcm9UYXNrc1N5bmNocm9ub3VzbHk6IHRydWV9YC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIHtAZXhhbXBsZSBjb3JlL3Rlc3RpbmcvdHMvZmFrZV9hc3luYy50cyByZWdpb249J2Jhc2ljJ31cbiAqXG4gKiBUaGUgZm9sbG93aW5nIGV4YW1wbGUgaW5jbHVkZXMgYSBuZXN0ZWQgdGltZW91dCAobmV3IG1hY3JvVGFzayksIGFuZFxuICogdGhlIGB0aWNrT3B0aW9uc2AgcGFyYW1ldGVyIGlzIGFsbG93ZWQgdG8gZGVmYXVsdC4gSW4gdGhpcyBjYXNlLFxuICogYHByb2Nlc3NOZXdNYWNyb1Rhc2tzU3luY2hyb25vdXNseWAgZGVmYXVsdHMgdG8gdHJ1ZSwgYW5kIHRoZSBuZXN0ZWRcbiAqIGZ1bmN0aW9uIGlzIGV4ZWN1dGVkIG9uIGVhY2ggdGljay5cbiAqXG4gKiBgYGBcbiAqIGl0ICgndGVzdCB3aXRoIG5lc3RlZCBzZXRUaW1lb3V0JywgZmFrZUFzeW5jKCgpID0+IHtcbiAqICAgbGV0IG5lc3RlZFRpbWVvdXRJbnZva2VkID0gZmFsc2U7XG4gKiAgIGZ1bmN0aW9uIGZ1bmNXaXRoTmVzdGVkVGltZW91dCgpIHtcbiAqICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAqICAgICAgIG5lc3RlZFRpbWVvdXRJbnZva2VkID0gdHJ1ZTtcbiAqICAgICB9KTtcbiAqICAgfTtcbiAqICAgc2V0VGltZW91dChmdW5jV2l0aE5lc3RlZFRpbWVvdXQpO1xuICogICB0aWNrKCk7XG4gKiAgIGV4cGVjdChuZXN0ZWRUaW1lb3V0SW52b2tlZCkudG9CZSh0cnVlKTtcbiAqIH0pKTtcbiAqIGBgYFxuICpcbiAqIEluIHRoZSBmb2xsb3dpbmcgY2FzZSwgYHByb2Nlc3NOZXdNYWNyb1Rhc2tzU3luY2hyb25vdXNseWAgaXMgZXhwbGljaXRseVxuICogc2V0IHRvIGZhbHNlLCBzbyB0aGUgbmVzdGVkIHRpbWVvdXQgZnVuY3Rpb24gaXMgbm90IGludm9rZWQuXG4gKlxuICogYGBgXG4gKiBpdCAoJ3Rlc3Qgd2l0aCBuZXN0ZWQgc2V0VGltZW91dCcsIGZha2VBc3luYygoKSA9PiB7XG4gKiAgIGxldCBuZXN0ZWRUaW1lb3V0SW52b2tlZCA9IGZhbHNlO1xuICogICBmdW5jdGlvbiBmdW5jV2l0aE5lc3RlZFRpbWVvdXQoKSB7XG4gKiAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gKiAgICAgICBuZXN0ZWRUaW1lb3V0SW52b2tlZCA9IHRydWU7XG4gKiAgICAgfSk7XG4gKiAgIH07XG4gKiAgIHNldFRpbWVvdXQoZnVuY1dpdGhOZXN0ZWRUaW1lb3V0KTtcbiAqICAgdGljaygwLCB7cHJvY2Vzc05ld01hY3JvVGFza3NTeW5jaHJvbm91c2x5OiBmYWxzZX0pO1xuICogICBleHBlY3QobmVzdGVkVGltZW91dEludm9rZWQpLnRvQmUoZmFsc2UpO1xuICogfSkpO1xuICogYGBgXG4gKlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRpY2soXG4gIG1pbGxpczogbnVtYmVyID0gMCxcbiAgdGlja09wdGlvbnM6IHtwcm9jZXNzTmV3TWFjcm9UYXNrc1N5bmNocm9ub3VzbHk6IGJvb2xlYW59ID0ge1xuICAgIHByb2Nlc3NOZXdNYWNyb1Rhc2tzU3luY2hyb25vdXNseTogdHJ1ZSxcbiAgfSxcbik6IHZvaWQge1xuICBpZiAoZmFrZUFzeW5jVGVzdE1vZHVsZSkge1xuICAgIHJldHVybiBmYWtlQXN5bmNUZXN0TW9kdWxlLnRpY2sobWlsbGlzLCB0aWNrT3B0aW9ucyk7XG4gIH1cbiAgdGhyb3cgbmV3IEVycm9yKGZha2VBc3luY1Rlc3RNb2R1bGVOb3RMb2FkZWRFcnJvck1lc3NhZ2UpO1xufVxuXG4vKipcbiAqIEZsdXNoZXMgYW55IHBlbmRpbmcgbWljcm90YXNrcyBhbmQgc2ltdWxhdGVzIHRoZSBhc3luY2hyb25vdXMgcGFzc2FnZSBvZiB0aW1lIGZvciB0aGUgdGltZXJzIGluXG4gKiB0aGUgYGZha2VBc3luY2Agem9uZSBieVxuICogZHJhaW5pbmcgdGhlIG1hY3JvdGFzayBxdWV1ZSB1bnRpbCBpdCBpcyBlbXB0eS5cbiAqXG4gKiBAcGFyYW0gbWF4VHVybnMgVGhlIG1heGltdW0gbnVtYmVyIG9mIHRpbWVzIHRoZSBzY2hlZHVsZXIgYXR0ZW1wdHMgdG8gY2xlYXIgaXRzIHF1ZXVlIGJlZm9yZVxuICogICAgIHRocm93aW5nIGFuIGVycm9yLlxuICogQHJldHVybnMgVGhlIHNpbXVsYXRlZCB0aW1lIGVsYXBzZWQsIGluIG1pbGxpc2Vjb25kcy5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmbHVzaChtYXhUdXJucz86IG51bWJlcik6IG51bWJlciB7XG4gIGlmIChmYWtlQXN5bmNUZXN0TW9kdWxlKSB7XG4gICAgcmV0dXJuIGZha2VBc3luY1Rlc3RNb2R1bGUuZmx1c2gobWF4VHVybnMpO1xuICB9XG4gIHRocm93IG5ldyBFcnJvcihmYWtlQXN5bmNUZXN0TW9kdWxlTm90TG9hZGVkRXJyb3JNZXNzYWdlKTtcbn1cblxuLyoqXG4gKiBEaXNjYXJkIGFsbCByZW1haW5pbmcgcGVyaW9kaWMgdGFza3MuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gZGlzY2FyZFBlcmlvZGljVGFza3MoKTogdm9pZCB7XG4gIGlmIChmYWtlQXN5bmNUZXN0TW9kdWxlKSB7XG4gICAgcmV0dXJuIGZha2VBc3luY1Rlc3RNb2R1bGUuZGlzY2FyZFBlcmlvZGljVGFza3MoKTtcbiAgfVxuICB0aHJvdyBuZXcgRXJyb3IoZmFrZUFzeW5jVGVzdE1vZHVsZU5vdExvYWRlZEVycm9yTWVzc2FnZSk7XG59XG5cbi8qKlxuICogRmx1c2ggYW55IHBlbmRpbmcgbWljcm90YXNrcy5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmbHVzaE1pY3JvdGFza3MoKTogdm9pZCB7XG4gIGlmIChmYWtlQXN5bmNUZXN0TW9kdWxlKSB7XG4gICAgcmV0dXJuIGZha2VBc3luY1Rlc3RNb2R1bGUuZmx1c2hNaWNyb3Rhc2tzKCk7XG4gIH1cbiAgdGhyb3cgbmV3IEVycm9yKGZha2VBc3luY1Rlc3RNb2R1bGVOb3RMb2FkZWRFcnJvck1lc3NhZ2UpO1xufVxuIl19