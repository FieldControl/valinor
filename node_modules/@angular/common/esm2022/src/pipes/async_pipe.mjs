/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ChangeDetectorRef, Pipe, untracked, ɵisPromise, ɵisSubscribable, } from '@angular/core';
import { invalidPipeArgumentError } from './invalid_pipe_argument_error';
import * as i0 from "@angular/core";
class SubscribableStrategy {
    createSubscription(async, updateLatestValue) {
        // Subscription can be side-effectful, and we don't want any signal reads which happen in the
        // side effect of the subscription to be tracked by a component's template when that
        // subscription is triggered via the async pipe. So we wrap the subscription in `untracked` to
        // decouple from the current reactive context.
        //
        // `untracked` also prevents signal _writes_ which happen in the subscription side effect from
        // being treated as signal writes during the template evaluation (which throws errors).
        return untracked(() => async.subscribe({
            next: updateLatestValue,
            error: (e) => {
                throw e;
            },
        }));
    }
    dispose(subscription) {
        // See the comment in `createSubscription` above on the use of `untracked`.
        untracked(() => subscription.unsubscribe());
    }
}
class PromiseStrategy {
    createSubscription(async, updateLatestValue) {
        return async.then(updateLatestValue, (e) => {
            throw e;
        });
    }
    dispose(subscription) { }
}
const _promiseStrategy = new PromiseStrategy();
const _subscribableStrategy = new SubscribableStrategy();
/**
 * @ngModule CommonModule
 * @description
 *
 * Unwraps a value from an asynchronous primitive.
 *
 * The `async` pipe subscribes to an `Observable` or `Promise` and returns the latest value it has
 * emitted. When a new value is emitted, the `async` pipe marks the component to be checked for
 * changes. When the component gets destroyed, the `async` pipe unsubscribes automatically to avoid
 * potential memory leaks. When the reference of the expression changes, the `async` pipe
 * automatically unsubscribes from the old `Observable` or `Promise` and subscribes to the new one.
 *
 * @usageNotes
 *
 * ### Examples
 *
 * This example binds a `Promise` to the view. Clicking the `Resolve` button resolves the
 * promise.
 *
 * {@example common/pipes/ts/async_pipe.ts region='AsyncPipePromise'}
 *
 * It's also possible to use `async` with Observables. The example below binds the `time` Observable
 * to the view. The Observable continuously updates the view with the current time.
 *
 * {@example common/pipes/ts/async_pipe.ts region='AsyncPipeObservable'}
 *
 * @publicApi
 */
export class AsyncPipe {
    constructor(ref) {
        this._latestValue = null;
        this.markForCheckOnValueUpdate = true;
        this._subscription = null;
        this._obj = null;
        this._strategy = null;
        // Assign `ref` into `this._ref` manually instead of declaring `_ref` in the constructor
        // parameter list, as the type of `this._ref` includes `null` unlike the type of `ref`.
        this._ref = ref;
    }
    ngOnDestroy() {
        if (this._subscription) {
            this._dispose();
        }
        // Clear the `ChangeDetectorRef` and its association with the view data, to mitigate
        // potential memory leaks in Observables that could otherwise cause the view data to
        // be retained.
        // https://github.com/angular/angular/issues/17624
        this._ref = null;
    }
    transform(obj) {
        if (!this._obj) {
            if (obj) {
                try {
                    // Only call `markForCheck` if the value is updated asynchronously.
                    // Synchronous updates _during_ subscription should not wastefully mark for check -
                    // this value is already going to be returned from the transform function.
                    this.markForCheckOnValueUpdate = false;
                    this._subscribe(obj);
                }
                finally {
                    this.markForCheckOnValueUpdate = true;
                }
            }
            return this._latestValue;
        }
        if (obj !== this._obj) {
            this._dispose();
            return this.transform(obj);
        }
        return this._latestValue;
    }
    _subscribe(obj) {
        this._obj = obj;
        this._strategy = this._selectStrategy(obj);
        this._subscription = this._strategy.createSubscription(obj, (value) => this._updateLatestValue(obj, value));
    }
    _selectStrategy(obj) {
        if (ɵisPromise(obj)) {
            return _promiseStrategy;
        }
        if (ɵisSubscribable(obj)) {
            return _subscribableStrategy;
        }
        throw invalidPipeArgumentError(AsyncPipe, obj);
    }
    _dispose() {
        // Note: `dispose` is only called if a subscription has been initialized before, indicating
        // that `this._strategy` is also available.
        this._strategy.dispose(this._subscription);
        this._latestValue = null;
        this._subscription = null;
        this._obj = null;
    }
    _updateLatestValue(async, value) {
        if (async === this._obj) {
            this._latestValue = value;
            if (this.markForCheckOnValueUpdate) {
                this._ref?.markForCheck();
            }
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: AsyncPipe, deps: [{ token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Pipe }); }
    static { this.ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "18.2.7", ngImport: i0, type: AsyncPipe, isStandalone: true, name: "async", pure: false }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: AsyncPipe, decorators: [{
            type: Pipe,
            args: [{
                    name: 'async',
                    pure: false,
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXN5bmNfcGlwZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9zcmMvcGlwZXMvYXN5bmNfcGlwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQ0wsaUJBQWlCLEVBR2pCLElBQUksRUFFSixTQUFTLEVBQ1QsVUFBVSxFQUNWLGVBQWUsR0FDaEIsTUFBTSxlQUFlLENBQUM7QUFHdkIsT0FBTyxFQUFDLHdCQUF3QixFQUFDLE1BQU0sK0JBQStCLENBQUM7O0FBVXZFLE1BQU0sb0JBQW9CO0lBQ3hCLGtCQUFrQixDQUFDLEtBQXdCLEVBQUUsaUJBQXNCO1FBQ2pFLDZGQUE2RjtRQUM3RixvRkFBb0Y7UUFDcEYsOEZBQThGO1FBQzlGLDhDQUE4QztRQUM5QyxFQUFFO1FBQ0YsOEZBQThGO1FBQzlGLHVGQUF1RjtRQUN2RixPQUFPLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FDcEIsS0FBSyxDQUFDLFNBQVMsQ0FBQztZQUNkLElBQUksRUFBRSxpQkFBaUI7WUFDdkIsS0FBSyxFQUFFLENBQUMsQ0FBTSxFQUFFLEVBQUU7Z0JBQ2hCLE1BQU0sQ0FBQyxDQUFDO1lBQ1YsQ0FBQztTQUNGLENBQUMsQ0FDSCxDQUFDO0lBQ0osQ0FBQztJQUVELE9BQU8sQ0FBQyxZQUE0QjtRQUNsQywyRUFBMkU7UUFDM0UsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO0lBQzlDLENBQUM7Q0FDRjtBQUVELE1BQU0sZUFBZTtJQUNuQixrQkFBa0IsQ0FBQyxLQUFtQixFQUFFLGlCQUFrQztRQUN4RSxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRTtZQUN6QyxNQUFNLENBQUMsQ0FBQztRQUNWLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELE9BQU8s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RyxJQUFJLENBQUM7SUFDbkIsQ0FBQztJQUVPLGtCQUFrQixDQUFDLEtBQVUsRUFBRSxLQUFhO1FBQ2xELElBQUksS0FBSyxLQUFLLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUN4QixJQUFJLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQztZQUMxQixJQUFJLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxDQUFDO2dCQUNuQyxJQUFJLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxDQUFDO1lBQzVCLENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQzt5SEEvRlUsU0FBUzt1SEFBVCxTQUFTOztzR0FBVCxTQUFTO2tCQUxyQixJQUFJO21CQUFDO29CQUNKLElBQUksRUFBRSxPQUFPO29CQUNiLElBQUksRUFBRSxLQUFLO29CQUNYLFVBQVUsRUFBRSxJQUFJO2lCQUNqQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gIEV2ZW50RW1pdHRlcixcbiAgT25EZXN0cm95LFxuICBQaXBlLFxuICBQaXBlVHJhbnNmb3JtLFxuICB1bnRyYWNrZWQsXG4gIMm1aXNQcm9taXNlLFxuICDJtWlzU3Vic2NyaWJhYmxlLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7T2JzZXJ2YWJsZSwgU3Vic2NyaWJhYmxlLCBVbnN1YnNjcmliYWJsZX0gZnJvbSAncnhqcyc7XG5cbmltcG9ydCB7aW52YWxpZFBpcGVBcmd1bWVudEVycm9yfSBmcm9tICcuL2ludmFsaWRfcGlwZV9hcmd1bWVudF9lcnJvcic7XG5cbmludGVyZmFjZSBTdWJzY3JpcHRpb25TdHJhdGVneSB7XG4gIGNyZWF0ZVN1YnNjcmlwdGlvbihcbiAgICBhc3luYzogU3Vic2NyaWJhYmxlPGFueT4gfCBQcm9taXNlPGFueT4sXG4gICAgdXBkYXRlTGF0ZXN0VmFsdWU6IGFueSxcbiAgKTogVW5zdWJzY3JpYmFibGUgfCBQcm9taXNlPGFueT47XG4gIGRpc3Bvc2Uoc3Vic2NyaXB0aW9uOiBVbnN1YnNjcmliYWJsZSB8IFByb21pc2U8YW55Pik6IHZvaWQ7XG59XG5cbmNsYXNzIFN1YnNjcmliYWJsZVN0cmF0ZWd5IGltcGxlbWVudHMgU3Vic2NyaXB0aW9uU3RyYXRlZ3kge1xuICBjcmVhdGVTdWJzY3JpcHRpb24oYXN5bmM6IFN1YnNjcmliYWJsZTxhbnk+LCB1cGRhdGVMYXRlc3RWYWx1ZTogYW55KTogVW5zdWJzY3JpYmFibGUge1xuICAgIC8vIFN1YnNjcmlwdGlvbiBjYW4gYmUgc2lkZS1lZmZlY3RmdWwsIGFuZCB3ZSBkb24ndCB3YW50IGFueSBzaWduYWwgcmVhZHMgd2hpY2ggaGFwcGVuIGluIHRoZVxuICAgIC8vIHNpZGUgZWZmZWN0IG9mIHRoZSBzdWJzY3JpcHRpb24gdG8gYmUgdHJhY2tlZCBieSBhIGNvbXBvbmVudCdzIHRlbXBsYXRlIHdoZW4gdGhhdFxuICAgIC8vIHN1YnNjcmlwdGlvbiBpcyB0cmlnZ2VyZWQgdmlhIHRoZSBhc3luYyBwaXBlLiBTbyB3ZSB3cmFwIHRoZSBzdWJzY3JpcHRpb24gaW4gYHVudHJhY2tlZGAgdG9cbiAgICAvLyBkZWNvdXBsZSBmcm9tIHRoZSBjdXJyZW50IHJlYWN0aXZlIGNvbnRleHQuXG4gICAgLy9cbiAgICAvLyBgdW50cmFja2VkYCBhbHNvIHByZXZlbnRzIHNpZ25hbCBfd3JpdGVzXyB3aGljaCBoYXBwZW4gaW4gdGhlIHN1YnNjcmlwdGlvbiBzaWRlIGVmZmVjdCBmcm9tXG4gICAgLy8gYmVpbmcgdHJlYXRlZCBhcyBzaWduYWwgd3JpdGVzIGR1cmluZyB0aGUgdGVtcGxhdGUgZXZhbHVhdGlvbiAod2hpY2ggdGhyb3dzIGVycm9ycykuXG4gICAgcmV0dXJuIHVudHJhY2tlZCgoKSA9PlxuICAgICAgYXN5bmMuc3Vic2NyaWJlKHtcbiAgICAgICAgbmV4dDogdXBkYXRlTGF0ZXN0VmFsdWUsXG4gICAgICAgIGVycm9yOiAoZTogYW55KSA9PiB7XG4gICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgfSxcbiAgICAgIH0pLFxuICAgICk7XG4gIH1cblxuICBkaXNwb3NlKHN1YnNjcmlwdGlvbjogVW5zdWJzY3JpYmFibGUpOiB2b2lkIHtcbiAgICAvLyBTZWUgdGhlIGNvbW1lbnQgaW4gYGNyZWF0ZVN1YnNjcmlwdGlvbmAgYWJvdmUgb24gdGhlIHVzZSBvZiBgdW50cmFja2VkYC5cbiAgICB1bnRyYWNrZWQoKCkgPT4gc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCkpO1xuICB9XG59XG5cbmNsYXNzIFByb21pc2VTdHJhdGVneSBpbXBsZW1lbnRzIFN1YnNjcmlwdGlvblN0cmF0ZWd5IHtcbiAgY3JlYXRlU3Vic2NyaXB0aW9uKGFzeW5jOiBQcm9taXNlPGFueT4sIHVwZGF0ZUxhdGVzdFZhbHVlOiAodjogYW55KSA9PiBhbnkpOiBQcm9taXNlPGFueT4ge1xuICAgIHJldHVybiBhc3luYy50aGVuKHVwZGF0ZUxhdGVzdFZhbHVlLCAoZSkgPT4ge1xuICAgICAgdGhyb3cgZTtcbiAgICB9KTtcbiAgfVxuXG4gIGRpc3Bvc2Uoc3Vic2NyaXB0aW9uOiBQcm9taXNlPGFueT4pOiB2b2lkIHt9XG59XG5cbmNvbnN0IF9wcm9taXNlU3RyYXRlZ3kgPSBuZXcgUHJvbWlzZVN0cmF0ZWd5KCk7XG5jb25zdCBfc3Vic2NyaWJhYmxlU3RyYXRlZ3kgPSBuZXcgU3Vic2NyaWJhYmxlU3RyYXRlZ3koKTtcblxuLyoqXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBVbndyYXBzIGEgdmFsdWUgZnJvbSBhbiBhc3luY2hyb25vdXMgcHJpbWl0aXZlLlxuICpcbiAqIFRoZSBgYXN5bmNgIHBpcGUgc3Vic2NyaWJlcyB0byBhbiBgT2JzZXJ2YWJsZWAgb3IgYFByb21pc2VgIGFuZCByZXR1cm5zIHRoZSBsYXRlc3QgdmFsdWUgaXQgaGFzXG4gKiBlbWl0dGVkLiBXaGVuIGEgbmV3IHZhbHVlIGlzIGVtaXR0ZWQsIHRoZSBgYXN5bmNgIHBpcGUgbWFya3MgdGhlIGNvbXBvbmVudCB0byBiZSBjaGVja2VkIGZvclxuICogY2hhbmdlcy4gV2hlbiB0aGUgY29tcG9uZW50IGdldHMgZGVzdHJveWVkLCB0aGUgYGFzeW5jYCBwaXBlIHVuc3Vic2NyaWJlcyBhdXRvbWF0aWNhbGx5IHRvIGF2b2lkXG4gKiBwb3RlbnRpYWwgbWVtb3J5IGxlYWtzLiBXaGVuIHRoZSByZWZlcmVuY2Ugb2YgdGhlIGV4cHJlc3Npb24gY2hhbmdlcywgdGhlIGBhc3luY2AgcGlwZVxuICogYXV0b21hdGljYWxseSB1bnN1YnNjcmliZXMgZnJvbSB0aGUgb2xkIGBPYnNlcnZhYmxlYCBvciBgUHJvbWlzZWAgYW5kIHN1YnNjcmliZXMgdG8gdGhlIG5ldyBvbmUuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiAjIyMgRXhhbXBsZXNcbiAqXG4gKiBUaGlzIGV4YW1wbGUgYmluZHMgYSBgUHJvbWlzZWAgdG8gdGhlIHZpZXcuIENsaWNraW5nIHRoZSBgUmVzb2x2ZWAgYnV0dG9uIHJlc29sdmVzIHRoZVxuICogcHJvbWlzZS5cbiAqXG4gKiB7QGV4YW1wbGUgY29tbW9uL3BpcGVzL3RzL2FzeW5jX3BpcGUudHMgcmVnaW9uPSdBc3luY1BpcGVQcm9taXNlJ31cbiAqXG4gKiBJdCdzIGFsc28gcG9zc2libGUgdG8gdXNlIGBhc3luY2Agd2l0aCBPYnNlcnZhYmxlcy4gVGhlIGV4YW1wbGUgYmVsb3cgYmluZHMgdGhlIGB0aW1lYCBPYnNlcnZhYmxlXG4gKiB0byB0aGUgdmlldy4gVGhlIE9ic2VydmFibGUgY29udGludW91c2x5IHVwZGF0ZXMgdGhlIHZpZXcgd2l0aCB0aGUgY3VycmVudCB0aW1lLlxuICpcbiAqIHtAZXhhbXBsZSBjb21tb24vcGlwZXMvdHMvYXN5bmNfcGlwZS50cyByZWdpb249J0FzeW5jUGlwZU9ic2VydmFibGUnfVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQFBpcGUoe1xuICBuYW1lOiAnYXN5bmMnLFxuICBwdXJlOiBmYWxzZSxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbn0pXG5leHBvcnQgY2xhc3MgQXN5bmNQaXBlIGltcGxlbWVudHMgT25EZXN0cm95LCBQaXBlVHJhbnNmb3JtIHtcbiAgcHJpdmF0ZSBfcmVmOiBDaGFuZ2VEZXRlY3RvclJlZiB8IG51bGw7XG4gIHByaXZhdGUgX2xhdGVzdFZhbHVlOiBhbnkgPSBudWxsO1xuICBwcml2YXRlIG1hcmtGb3JDaGVja09uVmFsdWVVcGRhdGUgPSB0cnVlO1xuXG4gIHByaXZhdGUgX3N1YnNjcmlwdGlvbjogVW5zdWJzY3JpYmFibGUgfCBQcm9taXNlPGFueT4gfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBfb2JqOiBTdWJzY3JpYmFibGU8YW55PiB8IFByb21pc2U8YW55PiB8IEV2ZW50RW1pdHRlcjxhbnk+IHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgX3N0cmF0ZWd5OiBTdWJzY3JpcHRpb25TdHJhdGVneSB8IG51bGwgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKHJlZjogQ2hhbmdlRGV0ZWN0b3JSZWYpIHtcbiAgICAvLyBBc3NpZ24gYHJlZmAgaW50byBgdGhpcy5fcmVmYCBtYW51YWxseSBpbnN0ZWFkIG9mIGRlY2xhcmluZyBgX3JlZmAgaW4gdGhlIGNvbnN0cnVjdG9yXG4gICAgLy8gcGFyYW1ldGVyIGxpc3QsIGFzIHRoZSB0eXBlIG9mIGB0aGlzLl9yZWZgIGluY2x1ZGVzIGBudWxsYCB1bmxpa2UgdGhlIHR5cGUgb2YgYHJlZmAuXG4gICAgdGhpcy5fcmVmID0gcmVmO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3N1YnNjcmlwdGlvbikge1xuICAgICAgdGhpcy5fZGlzcG9zZSgpO1xuICAgIH1cbiAgICAvLyBDbGVhciB0aGUgYENoYW5nZURldGVjdG9yUmVmYCBhbmQgaXRzIGFzc29jaWF0aW9uIHdpdGggdGhlIHZpZXcgZGF0YSwgdG8gbWl0aWdhdGVcbiAgICAvLyBwb3RlbnRpYWwgbWVtb3J5IGxlYWtzIGluIE9ic2VydmFibGVzIHRoYXQgY291bGQgb3RoZXJ3aXNlIGNhdXNlIHRoZSB2aWV3IGRhdGEgdG9cbiAgICAvLyBiZSByZXRhaW5lZC5cbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyL2lzc3Vlcy8xNzYyNFxuICAgIHRoaXMuX3JlZiA9IG51bGw7XG4gIH1cblxuICAvLyBOT1RFKEBiZW5sZXNoKTogQmVjYXVzZSBPYnNlcnZhYmxlIGhhcyBkZXByZWNhdGVkIGEgZmV3IGNhbGwgcGF0dGVybnMgZm9yIGBzdWJzY3JpYmVgLFxuICAvLyBUeXBlU2NyaXB0IGhhcyBhIGhhcmQgdGltZSBtYXRjaGluZyBPYnNlcnZhYmxlIHRvIFN1YnNjcmliYWJsZSwgZm9yIG1vcmUgaW5mb3JtYXRpb25cbiAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9taWNyb3NvZnQvVHlwZVNjcmlwdC9pc3N1ZXMvNDM2NDNcblxuICB0cmFuc2Zvcm08VD4ob2JqOiBPYnNlcnZhYmxlPFQ+IHwgU3Vic2NyaWJhYmxlPFQ+IHwgUHJvbWlzZTxUPik6IFQgfCBudWxsO1xuICB0cmFuc2Zvcm08VD4ob2JqOiBudWxsIHwgdW5kZWZpbmVkKTogbnVsbDtcbiAgdHJhbnNmb3JtPFQ+KG9iajogT2JzZXJ2YWJsZTxUPiB8IFN1YnNjcmliYWJsZTxUPiB8IFByb21pc2U8VD4gfCBudWxsIHwgdW5kZWZpbmVkKTogVCB8IG51bGw7XG4gIHRyYW5zZm9ybTxUPihvYmo6IE9ic2VydmFibGU8VD4gfCBTdWJzY3JpYmFibGU8VD4gfCBQcm9taXNlPFQ+IHwgbnVsbCB8IHVuZGVmaW5lZCk6IFQgfCBudWxsIHtcbiAgICBpZiAoIXRoaXMuX29iaikge1xuICAgICAgaWYgKG9iaikge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIC8vIE9ubHkgY2FsbCBgbWFya0ZvckNoZWNrYCBpZiB0aGUgdmFsdWUgaXMgdXBkYXRlZCBhc3luY2hyb25vdXNseS5cbiAgICAgICAgICAvLyBTeW5jaHJvbm91cyB1cGRhdGVzIF9kdXJpbmdfIHN1YnNjcmlwdGlvbiBzaG91bGQgbm90IHdhc3RlZnVsbHkgbWFyayBmb3IgY2hlY2sgLVxuICAgICAgICAgIC8vIHRoaXMgdmFsdWUgaXMgYWxyZWFkeSBnb2luZyB0byBiZSByZXR1cm5lZCBmcm9tIHRoZSB0cmFuc2Zvcm0gZnVuY3Rpb24uXG4gICAgICAgICAgdGhpcy5tYXJrRm9yQ2hlY2tPblZhbHVlVXBkYXRlID0gZmFsc2U7XG4gICAgICAgICAgdGhpcy5fc3Vic2NyaWJlKG9iaik7XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgdGhpcy5tYXJrRm9yQ2hlY2tPblZhbHVlVXBkYXRlID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuX2xhdGVzdFZhbHVlO1xuICAgIH1cblxuICAgIGlmIChvYmogIT09IHRoaXMuX29iaikge1xuICAgICAgdGhpcy5fZGlzcG9zZSgpO1xuICAgICAgcmV0dXJuIHRoaXMudHJhbnNmb3JtKG9iaik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX2xhdGVzdFZhbHVlO1xuICB9XG5cbiAgcHJpdmF0ZSBfc3Vic2NyaWJlKG9iajogU3Vic2NyaWJhYmxlPGFueT4gfCBQcm9taXNlPGFueT4gfCBFdmVudEVtaXR0ZXI8YW55Pik6IHZvaWQge1xuICAgIHRoaXMuX29iaiA9IG9iajtcbiAgICB0aGlzLl9zdHJhdGVneSA9IHRoaXMuX3NlbGVjdFN0cmF0ZWd5KG9iaik7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9uID0gdGhpcy5fc3RyYXRlZ3kuY3JlYXRlU3Vic2NyaXB0aW9uKG9iaiwgKHZhbHVlOiBPYmplY3QpID0+XG4gICAgICB0aGlzLl91cGRhdGVMYXRlc3RWYWx1ZShvYmosIHZhbHVlKSxcbiAgICApO1xuICB9XG5cbiAgcHJpdmF0ZSBfc2VsZWN0U3RyYXRlZ3koXG4gICAgb2JqOiBTdWJzY3JpYmFibGU8YW55PiB8IFByb21pc2U8YW55PiB8IEV2ZW50RW1pdHRlcjxhbnk+LFxuICApOiBTdWJzY3JpcHRpb25TdHJhdGVneSB7XG4gICAgaWYgKMm1aXNQcm9taXNlKG9iaikpIHtcbiAgICAgIHJldHVybiBfcHJvbWlzZVN0cmF0ZWd5O1xuICAgIH1cblxuICAgIGlmICjJtWlzU3Vic2NyaWJhYmxlKG9iaikpIHtcbiAgICAgIHJldHVybiBfc3Vic2NyaWJhYmxlU3RyYXRlZ3k7XG4gICAgfVxuXG4gICAgdGhyb3cgaW52YWxpZFBpcGVBcmd1bWVudEVycm9yKEFzeW5jUGlwZSwgb2JqKTtcbiAgfVxuXG4gIHByaXZhdGUgX2Rpc3Bvc2UoKTogdm9pZCB7XG4gICAgLy8gTm90ZTogYGRpc3Bvc2VgIGlzIG9ubHkgY2FsbGVkIGlmIGEgc3Vic2NyaXB0aW9uIGhhcyBiZWVuIGluaXRpYWxpemVkIGJlZm9yZSwgaW5kaWNhdGluZ1xuICAgIC8vIHRoYXQgYHRoaXMuX3N0cmF0ZWd5YCBpcyBhbHNvIGF2YWlsYWJsZS5cbiAgICB0aGlzLl9zdHJhdGVneSEuZGlzcG9zZSh0aGlzLl9zdWJzY3JpcHRpb24hKTtcbiAgICB0aGlzLl9sYXRlc3RWYWx1ZSA9IG51bGw7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9uID0gbnVsbDtcbiAgICB0aGlzLl9vYmogPSBudWxsO1xuICB9XG5cbiAgcHJpdmF0ZSBfdXBkYXRlTGF0ZXN0VmFsdWUoYXN5bmM6IGFueSwgdmFsdWU6IE9iamVjdCk6IHZvaWQge1xuICAgIGlmIChhc3luYyA9PT0gdGhpcy5fb2JqKSB7XG4gICAgICB0aGlzLl9sYXRlc3RWYWx1ZSA9IHZhbHVlO1xuICAgICAgaWYgKHRoaXMubWFya0ZvckNoZWNrT25WYWx1ZVVwZGF0ZSkge1xuICAgICAgICB0aGlzLl9yZWY/Lm1hcmtGb3JDaGVjaygpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19