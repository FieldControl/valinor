/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
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
/**
 * Wraps a function to be executed in the `fakeAsync` zone:
 * - Microtasks are manually executed by calling `flushMicrotasks()`.
 * - Timers are synchronous; `tick()` simulates the asynchronous passage of time.
 *
 * If there are any pending timers at the end of the function, an exception is thrown.
 *
 * Can be used to wrap `inject()` calls.
 *
 * @param fn The function that you want to wrap in the `fakeAysnc` zone.
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
export function fakeAsync(fn) {
    if (fakeAsyncTestModule) {
        return fakeAsyncTestModule.fakeAsync(fn);
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
    processNewMacroTasksSynchronously: true
}) {
    if (fakeAsyncTestModule) {
        return fakeAsyncTestModule.tick(millis, tickOptions);
    }
    throw new Error(fakeAsyncTestModuleNotLoadedErrorMessage);
}
/**
 * Simulates the asynchronous passage of time for the timers in the `fakeAsync` zone by
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmFrZV9hc3luYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvdGVzdGluZy9zcmMvZmFrZV9hc3luYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFDSCxNQUFNLEtBQUssR0FBUSxPQUFPLElBQUksS0FBSyxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0FBQzdELE1BQU0sbUJBQW1CLEdBQUcsS0FBSyxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7QUFFOUUsTUFBTSx3Q0FBd0MsR0FDMUM7d0VBQ29FLENBQUM7QUFFekU7Ozs7O0dBS0c7QUFDSCxNQUFNLFVBQVUsa0JBQWtCO0lBQ2hDLElBQUksbUJBQW1CLEVBQUU7UUFDdkIsT0FBTyxtQkFBbUIsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0tBQ2pEO0lBQ0QsTUFBTSxJQUFJLEtBQUssQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFDO0FBQzVELENBQUM7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXNCRztBQUNILE1BQU0sVUFBVSxTQUFTLENBQUMsRUFBWTtJQUNwQyxJQUFJLG1CQUFtQixFQUFFO1FBQ3ZCLE9BQU8sbUJBQW1CLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0tBQzFDO0lBQ0QsTUFBTSxJQUFJLEtBQUssQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFDO0FBQzVELENBQUM7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBK0RHO0FBQ0gsTUFBTSxVQUFVLElBQUksQ0FDaEIsU0FBaUIsQ0FBQyxFQUFFLGNBQTREO0lBQzlFLGlDQUFpQyxFQUFFLElBQUk7Q0FDeEM7SUFDSCxJQUFJLG1CQUFtQixFQUFFO1FBQ3ZCLE9BQU8sbUJBQW1CLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQztLQUN0RDtJQUNELE1BQU0sSUFBSSxLQUFLLENBQUMsd0NBQXdDLENBQUMsQ0FBQztBQUM1RCxDQUFDO0FBRUQ7Ozs7Ozs7OztHQVNHO0FBQ0gsTUFBTSxVQUFVLEtBQUssQ0FBQyxRQUFpQjtJQUNyQyxJQUFJLG1CQUFtQixFQUFFO1FBQ3ZCLE9BQU8sbUJBQW1CLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQzVDO0lBQ0QsTUFBTSxJQUFJLEtBQUssQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFDO0FBQzVELENBQUM7QUFFRDs7OztHQUlHO0FBQ0gsTUFBTSxVQUFVLG9CQUFvQjtJQUNsQyxJQUFJLG1CQUFtQixFQUFFO1FBQ3ZCLE9BQU8sbUJBQW1CLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztLQUNuRDtJQUNELE1BQU0sSUFBSSxLQUFLLENBQUMsd0NBQXdDLENBQUMsQ0FBQztBQUM1RCxDQUFDO0FBRUQ7Ozs7R0FJRztBQUNILE1BQU0sVUFBVSxlQUFlO0lBQzdCLElBQUksbUJBQW1CLEVBQUU7UUFDdkIsT0FBTyxtQkFBbUIsQ0FBQyxlQUFlLEVBQUUsQ0FBQztLQUM5QztJQUNELE1BQU0sSUFBSSxLQUFLLENBQUMsd0NBQXdDLENBQUMsQ0FBQztBQUM1RCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5jb25zdCBfWm9uZTogYW55ID0gdHlwZW9mIFpvbmUgIT09ICd1bmRlZmluZWQnID8gWm9uZSA6IG51bGw7XG5jb25zdCBmYWtlQXN5bmNUZXN0TW9kdWxlID0gX1pvbmUgJiYgX1pvbmVbX1pvbmUuX19zeW1ib2xfXygnZmFrZUFzeW5jVGVzdCcpXTtcblxuY29uc3QgZmFrZUFzeW5jVGVzdE1vZHVsZU5vdExvYWRlZEVycm9yTWVzc2FnZSA9XG4gICAgYHpvbmUtdGVzdGluZy5qcyBpcyBuZWVkZWQgZm9yIHRoZSBmYWtlQXN5bmMoKSB0ZXN0IGhlbHBlciBidXQgY291bGQgbm90IGJlIGZvdW5kLlxuICAgICAgICBQbGVhc2UgbWFrZSBzdXJlIHRoYXQgeW91ciBlbnZpcm9ubWVudCBpbmNsdWRlcyB6b25lLmpzL3Rlc3RpbmdgO1xuXG4vKipcbiAqIENsZWFycyBvdXQgdGhlIHNoYXJlZCBmYWtlIGFzeW5jIHpvbmUgZm9yIGEgdGVzdC5cbiAqIFRvIGJlIGNhbGxlZCBpbiBhIGdsb2JhbCBgYmVmb3JlRWFjaGAuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVzZXRGYWtlQXN5bmNab25lKCk6IHZvaWQge1xuICBpZiAoZmFrZUFzeW5jVGVzdE1vZHVsZSkge1xuICAgIHJldHVybiBmYWtlQXN5bmNUZXN0TW9kdWxlLnJlc2V0RmFrZUFzeW5jWm9uZSgpO1xuICB9XG4gIHRocm93IG5ldyBFcnJvcihmYWtlQXN5bmNUZXN0TW9kdWxlTm90TG9hZGVkRXJyb3JNZXNzYWdlKTtcbn1cblxuLyoqXG4gKiBXcmFwcyBhIGZ1bmN0aW9uIHRvIGJlIGV4ZWN1dGVkIGluIHRoZSBgZmFrZUFzeW5jYCB6b25lOlxuICogLSBNaWNyb3Rhc2tzIGFyZSBtYW51YWxseSBleGVjdXRlZCBieSBjYWxsaW5nIGBmbHVzaE1pY3JvdGFza3MoKWAuXG4gKiAtIFRpbWVycyBhcmUgc3luY2hyb25vdXM7IGB0aWNrKClgIHNpbXVsYXRlcyB0aGUgYXN5bmNocm9ub3VzIHBhc3NhZ2Ugb2YgdGltZS5cbiAqXG4gKiBJZiB0aGVyZSBhcmUgYW55IHBlbmRpbmcgdGltZXJzIGF0IHRoZSBlbmQgb2YgdGhlIGZ1bmN0aW9uLCBhbiBleGNlcHRpb24gaXMgdGhyb3duLlxuICpcbiAqIENhbiBiZSB1c2VkIHRvIHdyYXAgYGluamVjdCgpYCBjYWxscy5cbiAqXG4gKiBAcGFyYW0gZm4gVGhlIGZ1bmN0aW9uIHRoYXQgeW91IHdhbnQgdG8gd3JhcCBpbiB0aGUgYGZha2VBeXNuY2Agem9uZS5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogIyMjIEV4YW1wbGVcbiAqXG4gKiB7QGV4YW1wbGUgY29yZS90ZXN0aW5nL3RzL2Zha2VfYXN5bmMudHMgcmVnaW9uPSdiYXNpYyd9XG4gKlxuICpcbiAqIEByZXR1cm5zIFRoZSBmdW5jdGlvbiB3cmFwcGVkIHRvIGJlIGV4ZWN1dGVkIGluIHRoZSBgZmFrZUFzeW5jYCB6b25lLlxuICogQW55IGFyZ3VtZW50cyBwYXNzZWQgd2hlbiBjYWxsaW5nIHRoaXMgcmV0dXJuZWQgZnVuY3Rpb24gd2lsbCBiZSBwYXNzZWQgdGhyb3VnaCB0byB0aGUgYGZuYFxuICogZnVuY3Rpb24gaW4gdGhlIHBhcmFtZXRlcnMgd2hlbiBpdCBpcyBjYWxsZWQuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gZmFrZUFzeW5jKGZuOiBGdW5jdGlvbik6ICguLi5hcmdzOiBhbnlbXSkgPT4gYW55IHtcbiAgaWYgKGZha2VBc3luY1Rlc3RNb2R1bGUpIHtcbiAgICByZXR1cm4gZmFrZUFzeW5jVGVzdE1vZHVsZS5mYWtlQXN5bmMoZm4pO1xuICB9XG4gIHRocm93IG5ldyBFcnJvcihmYWtlQXN5bmNUZXN0TW9kdWxlTm90TG9hZGVkRXJyb3JNZXNzYWdlKTtcbn1cblxuLyoqXG4gKiBTaW11bGF0ZXMgdGhlIGFzeW5jaHJvbm91cyBwYXNzYWdlIG9mIHRpbWUgZm9yIHRoZSB0aW1lcnMgaW4gdGhlIGBmYWtlQXN5bmNgIHpvbmUuXG4gKlxuICogVGhlIG1pY3JvdGFza3MgcXVldWUgaXMgZHJhaW5lZCBhdCB0aGUgdmVyeSBzdGFydCBvZiB0aGlzIGZ1bmN0aW9uIGFuZCBhZnRlciBhbnkgdGltZXIgY2FsbGJhY2tcbiAqIGhhcyBiZWVuIGV4ZWN1dGVkLlxuICpcbiAqIEBwYXJhbSBtaWxsaXMgVGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgdG8gYWR2YW5jZSB0aGUgdmlydHVhbCB0aW1lci5cbiAqIEBwYXJhbSB0aWNrT3B0aW9ucyBUaGUgb3B0aW9ucyB0byBwYXNzIHRvIHRoZSBgdGljaygpYCBmdW5jdGlvbi5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqIFRoZSBgdGljaygpYCBvcHRpb24gaXMgYSBmbGFnIGNhbGxlZCBgcHJvY2Vzc05ld01hY3JvVGFza3NTeW5jaHJvbm91c2x5YCxcbiAqIHdoaWNoIGRldGVybWluZXMgd2hldGhlciBvciBub3QgdG8gaW52b2tlIG5ldyBtYWNyb1Rhc2tzLlxuICpcbiAqIElmIHlvdSBwcm92aWRlIGEgYHRpY2tPcHRpb25zYCBvYmplY3QsIGJ1dCBkbyBub3Qgc3BlY2lmeSBhXG4gKiBgcHJvY2Vzc05ld01hY3JvVGFza3NTeW5jaHJvbm91c2x5YCBwcm9wZXJ0eSAoYHRpY2soMTAwLCB7fSlgKSxcbiAqIHRoZW4gYHByb2Nlc3NOZXdNYWNyb1Rhc2tzU3luY2hyb25vdXNseWAgZGVmYXVsdHMgdG8gdHJ1ZS5cbiAqXG4gKiBJZiB5b3Ugb21pdCB0aGUgYHRpY2tPcHRpb25zYCBwYXJhbWV0ZXIgKGB0aWNrKDEwMCkpYCksIHRoZW5cbiAqIGB0aWNrT3B0aW9uc2AgZGVmYXVsdHMgdG8gYHtwcm9jZXNzTmV3TWFjcm9UYXNrc1N5bmNocm9ub3VzbHk6IHRydWV9YC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIHtAZXhhbXBsZSBjb3JlL3Rlc3RpbmcvdHMvZmFrZV9hc3luYy50cyByZWdpb249J2Jhc2ljJ31cbiAqXG4gKiBUaGUgZm9sbG93aW5nIGV4YW1wbGUgaW5jbHVkZXMgYSBuZXN0ZWQgdGltZW91dCAobmV3IG1hY3JvVGFzayksIGFuZFxuICogdGhlIGB0aWNrT3B0aW9uc2AgcGFyYW1ldGVyIGlzIGFsbG93ZWQgdG8gZGVmYXVsdC4gSW4gdGhpcyBjYXNlLFxuICogYHByb2Nlc3NOZXdNYWNyb1Rhc2tzU3luY2hyb25vdXNseWAgZGVmYXVsdHMgdG8gdHJ1ZSwgYW5kIHRoZSBuZXN0ZWRcbiAqIGZ1bmN0aW9uIGlzIGV4ZWN1dGVkIG9uIGVhY2ggdGljay5cbiAqXG4gKiBgYGBcbiAqIGl0ICgndGVzdCB3aXRoIG5lc3RlZCBzZXRUaW1lb3V0JywgZmFrZUFzeW5jKCgpID0+IHtcbiAqICAgbGV0IG5lc3RlZFRpbWVvdXRJbnZva2VkID0gZmFsc2U7XG4gKiAgIGZ1bmN0aW9uIGZ1bmNXaXRoTmVzdGVkVGltZW91dCgpIHtcbiAqICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAqICAgICAgIG5lc3RlZFRpbWVvdXRJbnZva2VkID0gdHJ1ZTtcbiAqICAgICB9KTtcbiAqICAgfTtcbiAqICAgc2V0VGltZW91dChmdW5jV2l0aE5lc3RlZFRpbWVvdXQpO1xuICogICB0aWNrKCk7XG4gKiAgIGV4cGVjdChuZXN0ZWRUaW1lb3V0SW52b2tlZCkudG9CZSh0cnVlKTtcbiAqIH0pKTtcbiAqIGBgYFxuICpcbiAqIEluIHRoZSBmb2xsb3dpbmcgY2FzZSwgYHByb2Nlc3NOZXdNYWNyb1Rhc2tzU3luY2hyb25vdXNseWAgaXMgZXhwbGljaXRseVxuICogc2V0IHRvIGZhbHNlLCBzbyB0aGUgbmVzdGVkIHRpbWVvdXQgZnVuY3Rpb24gaXMgbm90IGludm9rZWQuXG4gKlxuICogYGBgXG4gKiBpdCAoJ3Rlc3Qgd2l0aCBuZXN0ZWQgc2V0VGltZW91dCcsIGZha2VBc3luYygoKSA9PiB7XG4gKiAgIGxldCBuZXN0ZWRUaW1lb3V0SW52b2tlZCA9IGZhbHNlO1xuICogICBmdW5jdGlvbiBmdW5jV2l0aE5lc3RlZFRpbWVvdXQoKSB7XG4gKiAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gKiAgICAgICBuZXN0ZWRUaW1lb3V0SW52b2tlZCA9IHRydWU7XG4gKiAgICAgfSk7XG4gKiAgIH07XG4gKiAgIHNldFRpbWVvdXQoZnVuY1dpdGhOZXN0ZWRUaW1lb3V0KTtcbiAqICAgdGljaygwLCB7cHJvY2Vzc05ld01hY3JvVGFza3NTeW5jaHJvbm91c2x5OiBmYWxzZX0pO1xuICogICBleHBlY3QobmVzdGVkVGltZW91dEludm9rZWQpLnRvQmUoZmFsc2UpO1xuICogfSkpO1xuICogYGBgXG4gKlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRpY2soXG4gICAgbWlsbGlzOiBudW1iZXIgPSAwLCB0aWNrT3B0aW9uczoge3Byb2Nlc3NOZXdNYWNyb1Rhc2tzU3luY2hyb25vdXNseTogYm9vbGVhbn0gPSB7XG4gICAgICBwcm9jZXNzTmV3TWFjcm9UYXNrc1N5bmNocm9ub3VzbHk6IHRydWVcbiAgICB9KTogdm9pZCB7XG4gIGlmIChmYWtlQXN5bmNUZXN0TW9kdWxlKSB7XG4gICAgcmV0dXJuIGZha2VBc3luY1Rlc3RNb2R1bGUudGljayhtaWxsaXMsIHRpY2tPcHRpb25zKTtcbiAgfVxuICB0aHJvdyBuZXcgRXJyb3IoZmFrZUFzeW5jVGVzdE1vZHVsZU5vdExvYWRlZEVycm9yTWVzc2FnZSk7XG59XG5cbi8qKlxuICogU2ltdWxhdGVzIHRoZSBhc3luY2hyb25vdXMgcGFzc2FnZSBvZiB0aW1lIGZvciB0aGUgdGltZXJzIGluIHRoZSBgZmFrZUFzeW5jYCB6b25lIGJ5XG4gKiBkcmFpbmluZyB0aGUgbWFjcm90YXNrIHF1ZXVlIHVudGlsIGl0IGlzIGVtcHR5LlxuICpcbiAqIEBwYXJhbSBtYXhUdXJucyBUaGUgbWF4aW11bSBudW1iZXIgb2YgdGltZXMgdGhlIHNjaGVkdWxlciBhdHRlbXB0cyB0byBjbGVhciBpdHMgcXVldWUgYmVmb3JlXG4gKiAgICAgdGhyb3dpbmcgYW4gZXJyb3IuXG4gKiBAcmV0dXJucyBUaGUgc2ltdWxhdGVkIHRpbWUgZWxhcHNlZCwgaW4gbWlsbGlzZWNvbmRzLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZsdXNoKG1heFR1cm5zPzogbnVtYmVyKTogbnVtYmVyIHtcbiAgaWYgKGZha2VBc3luY1Rlc3RNb2R1bGUpIHtcbiAgICByZXR1cm4gZmFrZUFzeW5jVGVzdE1vZHVsZS5mbHVzaChtYXhUdXJucyk7XG4gIH1cbiAgdGhyb3cgbmV3IEVycm9yKGZha2VBc3luY1Rlc3RNb2R1bGVOb3RMb2FkZWRFcnJvck1lc3NhZ2UpO1xufVxuXG4vKipcbiAqIERpc2NhcmQgYWxsIHJlbWFpbmluZyBwZXJpb2RpYyB0YXNrcy5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkaXNjYXJkUGVyaW9kaWNUYXNrcygpOiB2b2lkIHtcbiAgaWYgKGZha2VBc3luY1Rlc3RNb2R1bGUpIHtcbiAgICByZXR1cm4gZmFrZUFzeW5jVGVzdE1vZHVsZS5kaXNjYXJkUGVyaW9kaWNUYXNrcygpO1xuICB9XG4gIHRocm93IG5ldyBFcnJvcihmYWtlQXN5bmNUZXN0TW9kdWxlTm90TG9hZGVkRXJyb3JNZXNzYWdlKTtcbn1cblxuLyoqXG4gKiBGbHVzaCBhbnkgcGVuZGluZyBtaWNyb3Rhc2tzLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZsdXNoTWljcm90YXNrcygpOiB2b2lkIHtcbiAgaWYgKGZha2VBc3luY1Rlc3RNb2R1bGUpIHtcbiAgICByZXR1cm4gZmFrZUFzeW5jVGVzdE1vZHVsZS5mbHVzaE1pY3JvdGFza3MoKTtcbiAgfVxuICB0aHJvdyBuZXcgRXJyb3IoZmFrZUFzeW5jVGVzdE1vZHVsZU5vdExvYWRlZEVycm9yTWVzc2FnZSk7XG59XG4iXX0=