/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { BehaviorSubject } from 'rxjs';
/** Unique symbol that is used to patch a property to a proxy zone. */
const stateObservableSymbol = Symbol('ProxyZone_PATCHED#stateObservable');
/**
 * Interceptor that can be set up in a `ProxyZone` instance. The interceptor
 * will keep track of the task state and emit whenever the state changes.
 *
 * This serves as a workaround for https://github.com/angular/angular/issues/32896.
 */
export class TaskStateZoneInterceptor {
    constructor(_lastState) {
        this._lastState = _lastState;
        /** Subject that can be used to emit a new state change. */
        this._stateSubject = new BehaviorSubject(this._lastState ? this._getTaskStateFromInternalZoneState(this._lastState) : { stable: true });
        /** Public observable that emits whenever the task state changes. */
        this.state = this._stateSubject;
    }
    /** This will be called whenever the task state changes in the intercepted zone. */
    onHasTask(delegate, current, target, hasTaskState) {
        if (current === target) {
            this._stateSubject.next(this._getTaskStateFromInternalZoneState(hasTaskState));
        }
    }
    /** Gets the task state from the internal ZoneJS task state. */
    _getTaskStateFromInternalZoneState(state) {
        return { stable: !state.macroTask && !state.microTask };
    }
    /**
     * Sets up the custom task state Zone interceptor in the  `ProxyZone`. Throws if
     * no `ProxyZone` could be found.
     * @returns an observable that emits whenever the task state changes.
     */
    static setup() {
        if (Zone === undefined) {
            throw Error('Could not find ZoneJS. For test harnesses running in TestBed, ' +
                'ZoneJS needs to be installed.');
        }
        // tslint:disable-next-line:variable-name
        const ProxyZoneSpec = Zone['ProxyZoneSpec'];
        // If there is no "ProxyZoneSpec" installed, we throw an error and recommend
        // setting up the proxy zone by pulling in the testing bundle.
        if (!ProxyZoneSpec) {
            throw Error('ProxyZoneSpec is needed for the test harnesses but could not be found. ' +
                'Please make sure that your environment includes zone.js/dist/zone-testing.js');
        }
        // Ensure that there is a proxy zone instance set up, and get
        // a reference to the instance if present.
        const zoneSpec = ProxyZoneSpec.assertPresent();
        // If there already is a delegate registered in the proxy zone, and it
        // is type of the custom task state interceptor, we just use that state
        // observable. This allows us to only intercept Zone once per test
        // (similar to how `fakeAsync` or `async` work).
        if (zoneSpec[stateObservableSymbol]) {
            return zoneSpec[stateObservableSymbol];
        }
        // Since we intercept on environment creation and the fixture has been
        // created before, we might have missed tasks scheduled before. Fortunately
        // the proxy zone keeps track of the previous task state, so we can just pass
        // this as initial state to the task zone interceptor.
        const interceptor = new TaskStateZoneInterceptor(zoneSpec.lastTaskState);
        const zoneSpecOnHasTask = zoneSpec.onHasTask.bind(zoneSpec);
        // We setup the task state interceptor in the `ProxyZone`. Note that we cannot register
        // the interceptor as a new proxy zone delegate because it would mean that other zone
        // delegates (e.g. `FakeAsyncTestZone` or `AsyncTestZone`) can accidentally overwrite/disable
        // our interceptor. Since we just intend to monitor the task state of the proxy zone, it is
        // sufficient to just patch the proxy zone. This also avoids that we interfere with the task
        // queue scheduling logic.
        zoneSpec.onHasTask = function (...args) {
            zoneSpecOnHasTask(...args);
            interceptor.onHasTask(...args);
        };
        return zoneSpec[stateObservableSymbol] = interceptor.state;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFzay1zdGF0ZS16b25lLWludGVyY2VwdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay90ZXN0aW5nL3Rlc3RiZWQvdGFzay1zdGF0ZS16b25lLWludGVyY2VwdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxlQUFlLEVBQWEsTUFBTSxNQUFNLENBQUM7QUFTakQsc0VBQXNFO0FBQ3RFLE1BQU0scUJBQXFCLEdBQUcsTUFBTSxDQUFDLG1DQUFtQyxDQUFDLENBQUM7QUFPMUU7Ozs7O0dBS0c7QUFDSCxNQUFNLE9BQU8sd0JBQXdCO0lBUW5DLFlBQW9CLFVBQTZCO1FBQTdCLGVBQVUsR0FBVixVQUFVLENBQW1CO1FBUGpELDJEQUEyRDtRQUMxQyxrQkFBYSxHQUFHLElBQUksZUFBZSxDQUNoRCxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsa0NBQWtDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO1FBRWpHLG9FQUFvRTtRQUMzRCxVQUFLLEdBQTBCLElBQUksQ0FBQyxhQUFhLENBQUM7SUFFUCxDQUFDO0lBRXJELG1GQUFtRjtJQUNuRixTQUFTLENBQUMsUUFBc0IsRUFBRSxPQUFhLEVBQUUsTUFBWSxFQUFFLFlBQTBCO1FBQ3ZGLElBQUksT0FBTyxLQUFLLE1BQU0sRUFBRTtZQUN0QixJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsa0NBQWtDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztTQUNoRjtJQUNILENBQUM7SUFFRCwrREFBK0Q7SUFDdkQsa0NBQWtDLENBQUMsS0FBbUI7UUFDNUQsT0FBTyxFQUFDLE1BQU0sRUFBRSxDQUFDLEtBQUssQ0FBQyxTQUFTLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFDLENBQUM7SUFDeEQsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxNQUFNLENBQUMsS0FBSztRQUNWLElBQUksSUFBSSxLQUFLLFNBQVMsRUFBRTtZQUN0QixNQUFNLEtBQUssQ0FBQyxnRUFBZ0U7Z0JBQzFFLCtCQUErQixDQUFDLENBQUM7U0FDcEM7UUFFRCx5Q0FBeUM7UUFDekMsTUFBTSxhQUFhLEdBQUksSUFBWSxDQUFDLGVBQWUsQ0FBOEIsQ0FBQztRQUVsRiw0RUFBNEU7UUFDNUUsOERBQThEO1FBQzlELElBQUksQ0FBQyxhQUFhLEVBQUU7WUFDbEIsTUFBTSxLQUFLLENBQ1QseUVBQXlFO2dCQUN6RSw4RUFBOEUsQ0FBQyxDQUFDO1NBQ25GO1FBRUQsNkRBQTZEO1FBQzdELDBDQUEwQztRQUMxQyxNQUFNLFFBQVEsR0FBRyxhQUFhLENBQUMsYUFBYSxFQUFzQixDQUFDO1FBRW5FLHNFQUFzRTtRQUN0RSx1RUFBdUU7UUFDdkUsa0VBQWtFO1FBQ2xFLGdEQUFnRDtRQUNoRCxJQUFJLFFBQVEsQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFO1lBQ25DLE9BQU8sUUFBUSxDQUFDLHFCQUFxQixDQUFFLENBQUM7U0FDekM7UUFFRCxzRUFBc0U7UUFDdEUsMkVBQTJFO1FBQzNFLDZFQUE2RTtRQUM3RSxzREFBc0Q7UUFDdEQsTUFBTSxXQUFXLEdBQUcsSUFBSSx3QkFBd0IsQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDekUsTUFBTSxpQkFBaUIsR0FBRyxRQUFRLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUU1RCx1RkFBdUY7UUFDdkYscUZBQXFGO1FBQ3JGLDZGQUE2RjtRQUM3RiwyRkFBMkY7UUFDM0YsNEZBQTRGO1FBQzVGLDBCQUEwQjtRQUMxQixRQUFRLENBQUMsU0FBUyxHQUFHLFVBQVMsR0FBRyxJQUE4QztZQUM3RSxpQkFBaUIsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO1lBQzNCLFdBQVcsQ0FBQyxTQUFTLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUNqQyxDQUFDLENBQUM7UUFFRixPQUFPLFFBQVEsQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUM7SUFDN0QsQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QmVoYXZpb3JTdWJqZWN0LCBPYnNlcnZhYmxlfSBmcm9tICdyeGpzJztcbmltcG9ydCB7UHJveHlab25lLCBQcm94eVpvbmVTdGF0aWN9IGZyb20gJy4vcHJveHktem9uZS10eXBlcyc7XG5cbi8qKiBDdXJyZW50IHN0YXRlIG9mIHRoZSBpbnRlcmNlcHRlZCB6b25lLiAqL1xuZXhwb3J0IGludGVyZmFjZSBUYXNrU3RhdGUge1xuICAvKiogV2hldGhlciB0aGUgem9uZSBpcyBzdGFibGUgKGkuZS4gbm8gbWljcm90YXNrcyBhbmQgbWFjcm90YXNrcykuICovXG4gIHN0YWJsZTogYm9vbGVhbjtcbn1cblxuLyoqIFVuaXF1ZSBzeW1ib2wgdGhhdCBpcyB1c2VkIHRvIHBhdGNoIGEgcHJvcGVydHkgdG8gYSBwcm94eSB6b25lLiAqL1xuY29uc3Qgc3RhdGVPYnNlcnZhYmxlU3ltYm9sID0gU3ltYm9sKCdQcm94eVpvbmVfUEFUQ0hFRCNzdGF0ZU9ic2VydmFibGUnKTtcblxuLyoqIFR5cGUgdGhhdCBkZXNjcmliZXMgYSBwb3RlbnRpYWxseSBwYXRjaGVkIHByb3h5IHpvbmUgaW5zdGFuY2UuICovXG50eXBlIFBhdGNoZWRQcm94eVpvbmUgPSBQcm94eVpvbmUgJiB7XG4gIFtzdGF0ZU9ic2VydmFibGVTeW1ib2xdOiB1bmRlZmluZWR8T2JzZXJ2YWJsZTxUYXNrU3RhdGU+O1xufTtcblxuLyoqXG4gKiBJbnRlcmNlcHRvciB0aGF0IGNhbiBiZSBzZXQgdXAgaW4gYSBgUHJveHlab25lYCBpbnN0YW5jZS4gVGhlIGludGVyY2VwdG9yXG4gKiB3aWxsIGtlZXAgdHJhY2sgb2YgdGhlIHRhc2sgc3RhdGUgYW5kIGVtaXQgd2hlbmV2ZXIgdGhlIHN0YXRlIGNoYW5nZXMuXG4gKlxuICogVGhpcyBzZXJ2ZXMgYXMgYSB3b3JrYXJvdW5kIGZvciBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyL2lzc3Vlcy8zMjg5Ni5cbiAqL1xuZXhwb3J0IGNsYXNzIFRhc2tTdGF0ZVpvbmVJbnRlcmNlcHRvciB7XG4gIC8qKiBTdWJqZWN0IHRoYXQgY2FuIGJlIHVzZWQgdG8gZW1pdCBhIG5ldyBzdGF0ZSBjaGFuZ2UuICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX3N0YXRlU3ViamVjdCA9IG5ldyBCZWhhdmlvclN1YmplY3Q8VGFza1N0YXRlPihcbiAgICAgIHRoaXMuX2xhc3RTdGF0ZSA/IHRoaXMuX2dldFRhc2tTdGF0ZUZyb21JbnRlcm5hbFpvbmVTdGF0ZSh0aGlzLl9sYXN0U3RhdGUpIDoge3N0YWJsZTogdHJ1ZX0pO1xuXG4gIC8qKiBQdWJsaWMgb2JzZXJ2YWJsZSB0aGF0IGVtaXRzIHdoZW5ldmVyIHRoZSB0YXNrIHN0YXRlIGNoYW5nZXMuICovXG4gIHJlYWRvbmx5IHN0YXRlOiBPYnNlcnZhYmxlPFRhc2tTdGF0ZT4gPSB0aGlzLl9zdGF0ZVN1YmplY3Q7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfbGFzdFN0YXRlOiBIYXNUYXNrU3RhdGV8bnVsbCkge31cblxuICAvKiogVGhpcyB3aWxsIGJlIGNhbGxlZCB3aGVuZXZlciB0aGUgdGFzayBzdGF0ZSBjaGFuZ2VzIGluIHRoZSBpbnRlcmNlcHRlZCB6b25lLiAqL1xuICBvbkhhc1Rhc2soZGVsZWdhdGU6IFpvbmVEZWxlZ2F0ZSwgY3VycmVudDogWm9uZSwgdGFyZ2V0OiBab25lLCBoYXNUYXNrU3RhdGU6IEhhc1Rhc2tTdGF0ZSkge1xuICAgIGlmIChjdXJyZW50ID09PSB0YXJnZXQpIHtcbiAgICAgIHRoaXMuX3N0YXRlU3ViamVjdC5uZXh0KHRoaXMuX2dldFRhc2tTdGF0ZUZyb21JbnRlcm5hbFpvbmVTdGF0ZShoYXNUYXNrU3RhdGUpKTtcbiAgICB9XG4gIH1cblxuICAvKiogR2V0cyB0aGUgdGFzayBzdGF0ZSBmcm9tIHRoZSBpbnRlcm5hbCBab25lSlMgdGFzayBzdGF0ZS4gKi9cbiAgcHJpdmF0ZSBfZ2V0VGFza1N0YXRlRnJvbUludGVybmFsWm9uZVN0YXRlKHN0YXRlOiBIYXNUYXNrU3RhdGUpOiBUYXNrU3RhdGUge1xuICAgIHJldHVybiB7c3RhYmxlOiAhc3RhdGUubWFjcm9UYXNrICYmICFzdGF0ZS5taWNyb1Rhc2t9O1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdXAgdGhlIGN1c3RvbSB0YXNrIHN0YXRlIFpvbmUgaW50ZXJjZXB0b3IgaW4gdGhlICBgUHJveHlab25lYC4gVGhyb3dzIGlmXG4gICAqIG5vIGBQcm94eVpvbmVgIGNvdWxkIGJlIGZvdW5kLlxuICAgKiBAcmV0dXJucyBhbiBvYnNlcnZhYmxlIHRoYXQgZW1pdHMgd2hlbmV2ZXIgdGhlIHRhc2sgc3RhdGUgY2hhbmdlcy5cbiAgICovXG4gIHN0YXRpYyBzZXR1cCgpOiBPYnNlcnZhYmxlPFRhc2tTdGF0ZT4ge1xuICAgIGlmIChab25lID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IEVycm9yKCdDb3VsZCBub3QgZmluZCBab25lSlMuIEZvciB0ZXN0IGhhcm5lc3NlcyBydW5uaW5nIGluIFRlc3RCZWQsICcgK1xuICAgICAgICAnWm9uZUpTIG5lZWRzIHRvIGJlIGluc3RhbGxlZC4nKTtcbiAgICB9XG5cbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6dmFyaWFibGUtbmFtZVxuICAgIGNvbnN0IFByb3h5Wm9uZVNwZWMgPSAoWm9uZSBhcyBhbnkpWydQcm94eVpvbmVTcGVjJ10gYXMgUHJveHlab25lU3RhdGljfHVuZGVmaW5lZDtcblxuICAgIC8vIElmIHRoZXJlIGlzIG5vIFwiUHJveHlab25lU3BlY1wiIGluc3RhbGxlZCwgd2UgdGhyb3cgYW4gZXJyb3IgYW5kIHJlY29tbWVuZFxuICAgIC8vIHNldHRpbmcgdXAgdGhlIHByb3h5IHpvbmUgYnkgcHVsbGluZyBpbiB0aGUgdGVzdGluZyBidW5kbGUuXG4gICAgaWYgKCFQcm94eVpvbmVTcGVjKSB7XG4gICAgICB0aHJvdyBFcnJvcihcbiAgICAgICAgJ1Byb3h5Wm9uZVNwZWMgaXMgbmVlZGVkIGZvciB0aGUgdGVzdCBoYXJuZXNzZXMgYnV0IGNvdWxkIG5vdCBiZSBmb3VuZC4gJyArXG4gICAgICAgICdQbGVhc2UgbWFrZSBzdXJlIHRoYXQgeW91ciBlbnZpcm9ubWVudCBpbmNsdWRlcyB6b25lLmpzL2Rpc3Qvem9uZS10ZXN0aW5nLmpzJyk7XG4gICAgfVxuXG4gICAgLy8gRW5zdXJlIHRoYXQgdGhlcmUgaXMgYSBwcm94eSB6b25lIGluc3RhbmNlIHNldCB1cCwgYW5kIGdldFxuICAgIC8vIGEgcmVmZXJlbmNlIHRvIHRoZSBpbnN0YW5jZSBpZiBwcmVzZW50LlxuICAgIGNvbnN0IHpvbmVTcGVjID0gUHJveHlab25lU3BlYy5hc3NlcnRQcmVzZW50KCkgYXMgUGF0Y2hlZFByb3h5Wm9uZTtcblxuICAgIC8vIElmIHRoZXJlIGFscmVhZHkgaXMgYSBkZWxlZ2F0ZSByZWdpc3RlcmVkIGluIHRoZSBwcm94eSB6b25lLCBhbmQgaXRcbiAgICAvLyBpcyB0eXBlIG9mIHRoZSBjdXN0b20gdGFzayBzdGF0ZSBpbnRlcmNlcHRvciwgd2UganVzdCB1c2UgdGhhdCBzdGF0ZVxuICAgIC8vIG9ic2VydmFibGUuIFRoaXMgYWxsb3dzIHVzIHRvIG9ubHkgaW50ZXJjZXB0IFpvbmUgb25jZSBwZXIgdGVzdFxuICAgIC8vIChzaW1pbGFyIHRvIGhvdyBgZmFrZUFzeW5jYCBvciBgYXN5bmNgIHdvcmspLlxuICAgIGlmICh6b25lU3BlY1tzdGF0ZU9ic2VydmFibGVTeW1ib2xdKSB7XG4gICAgICByZXR1cm4gem9uZVNwZWNbc3RhdGVPYnNlcnZhYmxlU3ltYm9sXSE7XG4gICAgfVxuXG4gICAgLy8gU2luY2Ugd2UgaW50ZXJjZXB0IG9uIGVudmlyb25tZW50IGNyZWF0aW9uIGFuZCB0aGUgZml4dHVyZSBoYXMgYmVlblxuICAgIC8vIGNyZWF0ZWQgYmVmb3JlLCB3ZSBtaWdodCBoYXZlIG1pc3NlZCB0YXNrcyBzY2hlZHVsZWQgYmVmb3JlLiBGb3J0dW5hdGVseVxuICAgIC8vIHRoZSBwcm94eSB6b25lIGtlZXBzIHRyYWNrIG9mIHRoZSBwcmV2aW91cyB0YXNrIHN0YXRlLCBzbyB3ZSBjYW4ganVzdCBwYXNzXG4gICAgLy8gdGhpcyBhcyBpbml0aWFsIHN0YXRlIHRvIHRoZSB0YXNrIHpvbmUgaW50ZXJjZXB0b3IuXG4gICAgY29uc3QgaW50ZXJjZXB0b3IgPSBuZXcgVGFza1N0YXRlWm9uZUludGVyY2VwdG9yKHpvbmVTcGVjLmxhc3RUYXNrU3RhdGUpO1xuICAgIGNvbnN0IHpvbmVTcGVjT25IYXNUYXNrID0gem9uZVNwZWMub25IYXNUYXNrLmJpbmQoem9uZVNwZWMpO1xuXG4gICAgLy8gV2Ugc2V0dXAgdGhlIHRhc2sgc3RhdGUgaW50ZXJjZXB0b3IgaW4gdGhlIGBQcm94eVpvbmVgLiBOb3RlIHRoYXQgd2UgY2Fubm90IHJlZ2lzdGVyXG4gICAgLy8gdGhlIGludGVyY2VwdG9yIGFzIGEgbmV3IHByb3h5IHpvbmUgZGVsZWdhdGUgYmVjYXVzZSBpdCB3b3VsZCBtZWFuIHRoYXQgb3RoZXIgem9uZVxuICAgIC8vIGRlbGVnYXRlcyAoZS5nLiBgRmFrZUFzeW5jVGVzdFpvbmVgIG9yIGBBc3luY1Rlc3Rab25lYCkgY2FuIGFjY2lkZW50YWxseSBvdmVyd3JpdGUvZGlzYWJsZVxuICAgIC8vIG91ciBpbnRlcmNlcHRvci4gU2luY2Ugd2UganVzdCBpbnRlbmQgdG8gbW9uaXRvciB0aGUgdGFzayBzdGF0ZSBvZiB0aGUgcHJveHkgem9uZSwgaXQgaXNcbiAgICAvLyBzdWZmaWNpZW50IHRvIGp1c3QgcGF0Y2ggdGhlIHByb3h5IHpvbmUuIFRoaXMgYWxzbyBhdm9pZHMgdGhhdCB3ZSBpbnRlcmZlcmUgd2l0aCB0aGUgdGFza1xuICAgIC8vIHF1ZXVlIHNjaGVkdWxpbmcgbG9naWMuXG4gICAgem9uZVNwZWMub25IYXNUYXNrID0gZnVuY3Rpb24oLi4uYXJnczogW1pvbmVEZWxlZ2F0ZSwgWm9uZSwgWm9uZSwgSGFzVGFza1N0YXRlXSkge1xuICAgICAgem9uZVNwZWNPbkhhc1Rhc2soLi4uYXJncyk7XG4gICAgICBpbnRlcmNlcHRvci5vbkhhc1Rhc2soLi4uYXJncyk7XG4gICAgfTtcblxuICAgIHJldHVybiB6b25lU3BlY1tzdGF0ZU9ic2VydmFibGVTeW1ib2xdID0gaW50ZXJjZXB0b3Iuc3RhdGU7XG4gIH1cbn1cbiJdfQ==