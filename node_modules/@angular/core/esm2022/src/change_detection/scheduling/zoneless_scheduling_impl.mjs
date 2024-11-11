/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Subscription } from 'rxjs';
import { ApplicationRef } from '../../application/application_ref';
import { Injectable } from '../../di/injectable';
import { inject } from '../../di/injector_compatibility';
import { makeEnvironmentProviders } from '../../di/provider_collection';
import { RuntimeError, formatRuntimeError } from '../../errors';
import { PendingTasks } from '../../pending_tasks';
import { scheduleCallbackWithMicrotask, scheduleCallbackWithRafRace, } from '../../util/callback_scheduler';
import { performanceMarkFeature } from '../../util/performance';
import { NgZone, NoopNgZone, angularZoneInstanceIdProperty } from '../../zone/ng_zone';
import { ChangeDetectionScheduler, ZONELESS_ENABLED, PROVIDED_ZONELESS, ZONELESS_SCHEDULER_DISABLED, SCHEDULE_IN_ROOT_ZONE, } from './zoneless_scheduling';
import * as i0 from "../../r3_symbols";
const CONSECUTIVE_MICROTASK_NOTIFICATION_LIMIT = 100;
let consecutiveMicrotaskNotifications = 0;
let stackFromLastFewNotifications = [];
function trackMicrotaskNotificationForDebugging() {
    consecutiveMicrotaskNotifications++;
    if (CONSECUTIVE_MICROTASK_NOTIFICATION_LIMIT - consecutiveMicrotaskNotifications < 5) {
        const stack = new Error().stack;
        if (stack) {
            stackFromLastFewNotifications.push(stack);
        }
    }
    if (consecutiveMicrotaskNotifications === CONSECUTIVE_MICROTASK_NOTIFICATION_LIMIT) {
        throw new RuntimeError(103 /* RuntimeErrorCode.INFINITE_CHANGE_DETECTION */, 'Angular could not stabilize because there were endless change notifications within the browser event loop. ' +
            'The stack from the last several notifications: \n' +
            stackFromLastFewNotifications.join('\n'));
    }
}
export class ChangeDetectionSchedulerImpl {
    constructor() {
        this.appRef = inject(ApplicationRef);
        this.taskService = inject(PendingTasks);
        this.ngZone = inject(NgZone);
        this.zonelessEnabled = inject(ZONELESS_ENABLED);
        this.disableScheduling = inject(ZONELESS_SCHEDULER_DISABLED, { optional: true }) ?? false;
        this.zoneIsDefined = typeof Zone !== 'undefined' && !!Zone.root.run;
        this.schedulerTickApplyArgs = [{ data: { '__scheduler_tick__': true } }];
        this.subscriptions = new Subscription();
        this.angularZoneId = this.zoneIsDefined
            ? this.ngZone._inner?.get(angularZoneInstanceIdProperty)
            : null;
        this.scheduleInRootZone = !this.zonelessEnabled &&
            this.zoneIsDefined &&
            (inject(SCHEDULE_IN_ROOT_ZONE, { optional: true }) ?? false);
        this.cancelScheduledCallback = null;
        this.useMicrotaskScheduler = false;
        this.runningTick = false;
        this.pendingRenderTaskId = null;
        this.subscriptions.add(this.appRef.afterTick.subscribe(() => {
            // If the scheduler isn't running a tick but the application ticked, that means
            // someone called ApplicationRef.tick manually. In this case, we should cancel
            // any change detections that had been scheduled so we don't run an extra one.
            if (!this.runningTick) {
                this.cleanup();
            }
        }));
        this.subscriptions.add(this.ngZone.onUnstable.subscribe(() => {
            // If the zone becomes unstable when we're not running tick (this happens from the zone.run),
            // we should cancel any scheduled change detection here because at this point we
            // know that the zone will stabilize at some point and run change detection itself.
            if (!this.runningTick) {
                this.cleanup();
            }
        }));
        // TODO(atscott): These conditions will need to change when zoneless is the default
        // Instead, they should flip to checking if ZoneJS scheduling is provided
        this.disableScheduling ||=
            !this.zonelessEnabled &&
                // NoopNgZone without enabling zoneless means no scheduling whatsoever
                (this.ngZone instanceof NoopNgZone ||
                    // The same goes for the lack of Zone without enabling zoneless scheduling
                    !this.zoneIsDefined);
    }
    notify(source) {
        if (!this.zonelessEnabled && source === 5 /* NotificationSource.Listener */) {
            // When the notification comes from a listener, we skip the notification unless the
            // application has enabled zoneless. Ideally, listeners wouldn't notify the scheduler at all
            // automatically. We do not know that a developer made a change in the listener callback that
            // requires an `ApplicationRef.tick` (synchronize templates / run render hooks). We do this
            // only for an easier migration from OnPush components to zoneless. Because listeners are
            // usually executed inside the Angular zone and listeners automatically call `markViewDirty`,
            // developers never needed to manually use `ChangeDetectorRef.markForCheck` or some other API
            // to make listener callbacks work correctly with `OnPush` components.
            return;
        }
        switch (source) {
            case 0 /* NotificationSource.MarkAncestorsForTraversal */: {
                this.appRef.dirtyFlags |= 2 /* ApplicationRefDirtyFlags.ViewTreeTraversal */;
                break;
            }
            case 3 /* NotificationSource.DebugApplyChanges */:
            case 2 /* NotificationSource.DeferBlockStateUpdate */:
            case 4 /* NotificationSource.MarkForCheck */:
            case 5 /* NotificationSource.Listener */:
            case 1 /* NotificationSource.SetInput */: {
                this.appRef.dirtyFlags |= 4 /* ApplicationRefDirtyFlags.ViewTreeCheck */;
                break;
            }
            case 7 /* NotificationSource.DeferredRenderHook */: {
                // Render hooks are "deferred" when they're triggered from other render hooks. Using the
                // deferred dirty flags ensures that adding new hooks doesn't automatically trigger a loop
                // inside tick().
                this.appRef.deferredDirtyFlags |= 8 /* ApplicationRefDirtyFlags.AfterRender */;
                break;
            }
            case 9 /* NotificationSource.ViewDetachedFromDOM */:
            case 8 /* NotificationSource.ViewAttached */:
            case 6 /* NotificationSource.RenderHook */:
            case 10 /* NotificationSource.AsyncAnimationsLoaded */:
            default: {
                // These notifications only schedule a tick but do not change whether we should refresh
                // views. Instead, we only need to run render hooks unless another notification from the
                // other set is also received before `tick` happens.
                this.appRef.dirtyFlags |= 8 /* ApplicationRefDirtyFlags.AfterRender */;
            }
        }
        if (!this.shouldScheduleTick()) {
            return;
        }
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
            if (this.useMicrotaskScheduler) {
                trackMicrotaskNotificationForDebugging();
            }
            else {
                consecutiveMicrotaskNotifications = 0;
                stackFromLastFewNotifications.length = 0;
            }
        }
        const scheduleCallback = this.useMicrotaskScheduler
            ? scheduleCallbackWithMicrotask
            : scheduleCallbackWithRafRace;
        this.pendingRenderTaskId = this.taskService.add();
        if (this.scheduleInRootZone) {
            this.cancelScheduledCallback = Zone.root.run(() => scheduleCallback(() => this.tick()));
        }
        else {
            this.cancelScheduledCallback = this.ngZone.runOutsideAngular(() => scheduleCallback(() => this.tick()));
        }
    }
    shouldScheduleTick() {
        if (this.disableScheduling) {
            return false;
        }
        // already scheduled or running
        if (this.pendingRenderTaskId !== null || this.runningTick || this.appRef._runningTick) {
            return false;
        }
        // If we're inside the zone don't bother with scheduler. Zone will stabilize
        // eventually and run change detection.
        if (!this.zonelessEnabled &&
            this.zoneIsDefined &&
            Zone.current.get(angularZoneInstanceIdProperty + this.angularZoneId)) {
            return false;
        }
        return true;
    }
    /**
     * Calls ApplicationRef._tick inside the `NgZone`.
     *
     * Calling `tick` directly runs change detection and cancels any change detection that had been
     * scheduled previously.
     *
     * @param shouldRefreshViews Passed directly to `ApplicationRef._tick` and skips straight to
     *     render hooks when `false`.
     */
    tick() {
        // When ngZone.run below exits, onMicrotaskEmpty may emit if the zone is
        // stable. We want to prevent double ticking so we track whether the tick is
        // already running and skip it if so.
        if (this.runningTick || this.appRef.destroyed) {
            return;
        }
        // The scheduler used to pass "whether to check views" as a boolean flag instead of setting
        // fine-grained dirtiness flags, and global checking was always used on the first pass. This
        // created an interesting edge case: if a notification made a view dirty and then ticked via the
        // scheduler (and not the zone) a global check was still performed.
        //
        // Ideally, this would not be the case, and only zone-based ticks would do global passes.
        // However this is a breaking change and requires fixes in g3. Until this cleanup can be done,
        // we add the `ViewTreeGlobal` flag to request a global check if any views are dirty in a
        // scheduled tick (unless zoneless is enabled, in which case global checks aren't really a
        // thing).
        //
        // TODO(alxhub): clean up and remove this workaround as a breaking change.
        if (!this.zonelessEnabled && this.appRef.dirtyFlags & 7 /* ApplicationRefDirtyFlags.ViewTreeAny */) {
            this.appRef.dirtyFlags |= 1 /* ApplicationRefDirtyFlags.ViewTreeGlobal */;
        }
        const task = this.taskService.add();
        try {
            this.ngZone.run(() => {
                this.runningTick = true;
                this.appRef._tick();
            }, undefined, this.schedulerTickApplyArgs);
        }
        catch (e) {
            this.taskService.remove(task);
            throw e;
        }
        finally {
            this.cleanup();
        }
        // If we're notified of a change within 1 microtask of running change
        // detection, run another round in the same event loop. This allows code
        // which uses Promise.resolve (see NgModel) to avoid
        // ExpressionChanged...Error to still be reflected in a single browser
        // paint, even if that spans multiple rounds of change detection.
        this.useMicrotaskScheduler = true;
        scheduleCallbackWithMicrotask(() => {
            this.useMicrotaskScheduler = false;
            this.taskService.remove(task);
        });
    }
    ngOnDestroy() {
        this.subscriptions.unsubscribe();
        this.cleanup();
    }
    cleanup() {
        this.runningTick = false;
        this.cancelScheduledCallback?.();
        this.cancelScheduledCallback = null;
        // If this is the last task, the service will synchronously emit a stable
        // notification. If there is a subscriber that then acts in a way that
        // tries to notify the scheduler again, we need to be able to respond to
        // schedule a new change detection. Therefore, we should clear the task ID
        // before removing it from the pending tasks (or the tasks service should
        // not synchronously emit stable, similar to how Zone stableness only
        // happens if it's still stable after a microtask).
        if (this.pendingRenderTaskId !== null) {
            const taskId = this.pendingRenderTaskId;
            this.pendingRenderTaskId = null;
            this.taskService.remove(taskId);
        }
    }
    static { this.ɵfac = function ChangeDetectionSchedulerImpl_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ChangeDetectionSchedulerImpl)(); }; }
    static { this.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: ChangeDetectionSchedulerImpl, factory: ChangeDetectionSchedulerImpl.ɵfac, providedIn: 'root' }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.setClassMetadata(ChangeDetectionSchedulerImpl, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], () => [], null); })();
/**
 * Provides change detection without ZoneJS for the application bootstrapped using
 * `bootstrapApplication`.
 *
 * This function allows you to configure the application to not use the state/state changes of
 * ZoneJS to schedule change detection in the application. This will work when ZoneJS is not present
 * on the page at all or if it exists because something else is using it (either another Angular
 * application which uses ZoneJS for scheduling or some other library that relies on ZoneJS).
 *
 * This can also be added to the `TestBed` providers to configure the test environment to more
 * closely match production behavior. This will help give higher confidence that components are
 * compatible with zoneless change detection.
 *
 * ZoneJS uses browser events to trigger change detection. When using this provider, Angular will
 * instead use Angular APIs to schedule change detection. These APIs include:
 *
 * - `ChangeDetectorRef.markForCheck`
 * - `ComponentRef.setInput`
 * - updating a signal that is read in a template
 * - when bound host or template listeners are triggered
 * - attaching a view that was marked dirty by one of the above
 * - removing a view
 * - registering a render hook (templates are only refreshed if render hooks do one of the above)
 *
 * @usageNotes
 * ```typescript
 * bootstrapApplication(MyApp, {providers: [
 *   provideExperimentalZonelessChangeDetection(),
 * ]});
 * ```
 *
 * This API is experimental. Neither the shape, nor the underlying behavior is stable and can change
 * in patch versions. There are known feature gaps and API ergonomic considerations. We will iterate
 * on the exact API based on the feedback and our understanding of the problem and solution space.
 *
 * @publicApi
 * @experimental
 * @see [bootstrapApplication](/api/platform-browser/bootstrapApplication)
 */
export function provideExperimentalZonelessChangeDetection() {
    performanceMarkFeature('NgZoneless');
    if ((typeof ngDevMode === 'undefined' || ngDevMode) && typeof Zone !== 'undefined' && Zone) {
        const message = formatRuntimeError(914 /* RuntimeErrorCode.UNEXPECTED_ZONEJS_PRESENT_IN_ZONELESS_MODE */, `The application is using zoneless change detection, but is still loading Zone.js. ` +
            `Consider removing Zone.js to get the full benefits of zoneless. ` +
            `In applications using the Angular CLI, Zone.js is typically included in the "polyfills" section of the angular.json file.`);
        console.warn(message);
    }
    return makeEnvironmentProviders([
        { provide: ChangeDetectionScheduler, useExisting: ChangeDetectionSchedulerImpl },
        { provide: NgZone, useClass: NoopNgZone },
        { provide: ZONELESS_ENABLED, useValue: true },
        { provide: SCHEDULE_IN_ROOT_ZONE, useValue: false },
        typeof ngDevMode === 'undefined' || ngDevMode
            ? [{ provide: PROVIDED_ZONELESS, useValue: true }]
            : [],
    ]);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiem9uZWxlc3Nfc2NoZWR1bGluZ19pbXBsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvY2hhbmdlX2RldGVjdGlvbi9zY2hlZHVsaW5nL3pvbmVsZXNzX3NjaGVkdWxpbmdfaW1wbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBRWxDLE9BQU8sRUFBQyxjQUFjLEVBQTJCLE1BQU0sbUNBQW1DLENBQUM7QUFDM0YsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQy9DLE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSxpQ0FBaUMsQ0FBQztBQUV2RCxPQUFPLEVBQUMsd0JBQXdCLEVBQUMsTUFBTSw4QkFBOEIsQ0FBQztBQUN0RSxPQUFPLEVBQUMsWUFBWSxFQUFvQixrQkFBa0IsRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUNoRixPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDakQsT0FBTyxFQUNMLDZCQUE2QixFQUM3QiwyQkFBMkIsR0FDNUIsTUFBTSwrQkFBK0IsQ0FBQztBQUN2QyxPQUFPLEVBQUMsc0JBQXNCLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUM5RCxPQUFPLEVBQUMsTUFBTSxFQUFpQixVQUFVLEVBQUUsNkJBQTZCLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQUVwRyxPQUFPLEVBQ0wsd0JBQXdCLEVBRXhCLGdCQUFnQixFQUNoQixpQkFBaUIsRUFDakIsMkJBQTJCLEVBQzNCLHFCQUFxQixHQUN0QixNQUFNLHVCQUF1QixDQUFDOztBQUUvQixNQUFNLHdDQUF3QyxHQUFHLEdBQUcsQ0FBQztBQUNyRCxJQUFJLGlDQUFpQyxHQUFHLENBQUMsQ0FBQztBQUMxQyxJQUFJLDZCQUE2QixHQUFhLEVBQUUsQ0FBQztBQUVq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RUFBQyxDQUFDO1lBQ2hELENBQUMsQ0FBQyxFQUFFO0tBQ1AsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtTdWJzY3JpcHRpb259IGZyb20gJ3J4anMnO1xuXG5pbXBvcnQge0FwcGxpY2F0aW9uUmVmLCBBcHBsaWNhdGlvblJlZkRpcnR5RmxhZ3N9IGZyb20gJy4uLy4uL2FwcGxpY2F0aW9uL2FwcGxpY2F0aW9uX3JlZic7XG5pbXBvcnQge0luamVjdGFibGV9IGZyb20gJy4uLy4uL2RpL2luamVjdGFibGUnO1xuaW1wb3J0IHtpbmplY3R9IGZyb20gJy4uLy4uL2RpL2luamVjdG9yX2NvbXBhdGliaWxpdHknO1xuaW1wb3J0IHtFbnZpcm9ubWVudFByb3ZpZGVyc30gZnJvbSAnLi4vLi4vZGkvaW50ZXJmYWNlL3Byb3ZpZGVyJztcbmltcG9ydCB7bWFrZUVudmlyb25tZW50UHJvdmlkZXJzfSBmcm9tICcuLi8uLi9kaS9wcm92aWRlcl9jb2xsZWN0aW9uJztcbmltcG9ydCB7UnVudGltZUVycm9yLCBSdW50aW1lRXJyb3JDb2RlLCBmb3JtYXRSdW50aW1lRXJyb3J9IGZyb20gJy4uLy4uL2Vycm9ycyc7XG5pbXBvcnQge1BlbmRpbmdUYXNrc30gZnJvbSAnLi4vLi4vcGVuZGluZ190YXNrcyc7XG5pbXBvcnQge1xuICBzY2hlZHVsZUNhbGxiYWNrV2l0aE1pY3JvdGFzayxcbiAgc2NoZWR1bGVDYWxsYmFja1dpdGhSYWZSYWNlLFxufSBmcm9tICcuLi8uLi91dGlsL2NhbGxiYWNrX3NjaGVkdWxlcic7XG5pbXBvcnQge3BlcmZvcm1hbmNlTWFya0ZlYXR1cmV9IGZyb20gJy4uLy4uL3V0aWwvcGVyZm9ybWFuY2UnO1xuaW1wb3J0IHtOZ1pvbmUsIE5nWm9uZVByaXZhdGUsIE5vb3BOZ1pvbmUsIGFuZ3VsYXJab25lSW5zdGFuY2VJZFByb3BlcnR5fSBmcm9tICcuLi8uLi96b25lL25nX3pvbmUnO1xuXG5pbXBvcnQge1xuICBDaGFuZ2VEZXRlY3Rpb25TY2hlZHVsZXIsXG4gIE5vdGlmaWNhdGlvblNvdXJjZSxcbiAgWk9ORUxFU1NfRU5BQkxFRCxcbiAgUFJPVklERURfWk9ORUxFU1MsXG4gIFpPTkVMRVNTX1NDSEVEVUxFUl9ESVNBQkxFRCxcbiAgU0NIRURVTEVfSU5fUk9PVF9aT05FLFxufSBmcm9tICcuL3pvbmVsZXNzX3NjaGVkdWxpbmcnO1xuXG5jb25zdCBDT05TRUNVVElWRV9NSUNST1RBU0tfTk9USUZJQ0FUSU9OX0xJTUlUID0gMTAwO1xubGV0IGNvbnNlY3V0aXZlTWljcm90YXNrTm90aWZpY2F0aW9ucyA9IDA7XG5sZXQgc3RhY2tGcm9tTGFzdEZld05vdGlmaWNhdGlvbnM6IHN0cmluZ1tdID0gW107XG5cbmZ1bmN0aW9uIHRyYWNrTWljcm90YXNrTm90aWZpY2F0aW9uRm9yRGVidWdnaW5nKCkge1xuICBjb25zZWN1dGl2ZU1pY3JvdGFza05vdGlmaWNhdGlvbnMrKztcbiAgaWYgKENPTlNFQ1VUSVZFX01JQ1JPVEFTS19OT1RJRklDQVRJT05fTElNSVQgLSBjb25zZWN1dGl2ZU1pY3JvdGFza05vdGlmaWNhdGlvbnMgPCA1KSB7XG4gICAgY29uc3Qgc3RhY2sgPSBuZXcgRXJyb3IoKS5zdGFjaztcbiAgICBpZiAoc3RhY2spIHtcbiAgICAgIHN0YWNrRnJvbUxhc3RGZXdOb3RpZmljYXRpb25zLnB1c2goc3RhY2spO1xuICAgIH1cbiAgfVxuXG4gIGlmIChjb25zZWN1dGl2ZU1pY3JvdGFza05vdGlmaWNhdGlvbnMgPT09IENPTlNFQ1VUSVZFX01JQ1JPVEFTS19OT1RJRklDQVRJT05fTElNSVQpIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgUnVudGltZUVycm9yQ29kZS5JTkZJTklURV9DSEFOR0VfREVURUNUSU9OLFxuICAgICAgJ0FuZ3VsYXIgY291bGQgbm90IHN0YWJpbGl6ZSBiZWNhdXNlIHRoZXJlIHdlcmUgZW5kbGVzcyBjaGFuZ2Ugbm90aWZpY2F0aW9ucyB3aXRoaW4gdGhlIGJyb3dzZXIgZXZlbnQgbG9vcC4gJyArXG4gICAgICAgICdUaGUgc3RhY2sgZnJvbSB0aGUgbGFzdCBzZXZlcmFsIG5vdGlmaWNhdGlvbnM6IFxcbicgK1xuICAgICAgICBzdGFja0Zyb21MYXN0RmV3Tm90aWZpY2F0aW9ucy5qb2luKCdcXG4nKSxcbiAgICApO1xuICB9XG59XG5cbkBJbmplY3RhYmxlKHtwcm92aWRlZEluOiAncm9vdCd9KVxuZXhwb3J0IGNsYXNzIENoYW5nZURldGVjdGlvblNjaGVkdWxlckltcGwgaW1wbGVtZW50cyBDaGFuZ2VEZXRlY3Rpb25TY2hlZHVsZXIge1xuICBwcml2YXRlIHJlYWRvbmx5IGFwcFJlZiA9IGluamVjdChBcHBsaWNhdGlvblJlZik7XG4gIHByaXZhdGUgcmVhZG9ubHkgdGFza1NlcnZpY2UgPSBpbmplY3QoUGVuZGluZ1Rhc2tzKTtcbiAgcHJpdmF0ZSByZWFkb25seSBuZ1pvbmUgPSBpbmplY3QoTmdab25lKTtcbiAgcHJpdmF0ZSByZWFkb25seSB6b25lbGVzc0VuYWJsZWQgPSBpbmplY3QoWk9ORUxFU1NfRU5BQkxFRCk7XG4gIHByaXZhdGUgcmVhZG9ubHkgZGlzYWJsZVNjaGVkdWxpbmcgPVxuICAgIGluamVjdChaT05FTEVTU19TQ0hFRFVMRVJfRElTQUJMRUQsIHtvcHRpb25hbDogdHJ1ZX0pID8/IGZhbHNlO1xuICBwcml2YXRlIHJlYWRvbmx5IHpvbmVJc0RlZmluZWQgPSB0eXBlb2YgWm9uZSAhPT0gJ3VuZGVmaW5lZCcgJiYgISFab25lLnJvb3QucnVuO1xuICBwcml2YXRlIHJlYWRvbmx5IHNjaGVkdWxlclRpY2tBcHBseUFyZ3MgPSBbe2RhdGE6IHsnX19zY2hlZHVsZXJfdGlja19fJzogdHJ1ZX19XTtcbiAgcHJpdmF0ZSByZWFkb25seSBzdWJzY3JpcHRpb25zID0gbmV3IFN1YnNjcmlwdGlvbigpO1xuICBwcml2YXRlIHJlYWRvbmx5IGFuZ3VsYXJab25lSWQgPSB0aGlzLnpvbmVJc0RlZmluZWRcbiAgICA/ICh0aGlzLm5nWm9uZSBhcyBOZ1pvbmVQcml2YXRlKS5faW5uZXI/LmdldChhbmd1bGFyWm9uZUluc3RhbmNlSWRQcm9wZXJ0eSlcbiAgICA6IG51bGw7XG4gIHByaXZhdGUgcmVhZG9ubHkgc2NoZWR1bGVJblJvb3Rab25lID1cbiAgICAhdGhpcy56b25lbGVzc0VuYWJsZWQgJiZcbiAgICB0aGlzLnpvbmVJc0RlZmluZWQgJiZcbiAgICAoaW5qZWN0KFNDSEVEVUxFX0lOX1JPT1RfWk9ORSwge29wdGlvbmFsOiB0cnVlfSkgPz8gZmFsc2UpO1xuXG4gIHByaXZhdGUgY2FuY2VsU2NoZWR1bGVkQ2FsbGJhY2s6IG51bGwgfCAoKCkgPT4gdm9pZCkgPSBudWxsO1xuICBwcml2YXRlIHVzZU1pY3JvdGFza1NjaGVkdWxlciA9IGZhbHNlO1xuICBydW5uaW5nVGljayA9IGZhbHNlO1xuICBwZW5kaW5nUmVuZGVyVGFza0lkOiBudW1iZXIgfCBudWxsID0gbnVsbDtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgdGhpcy5hcHBSZWYuYWZ0ZXJUaWNrLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgIC8vIElmIHRoZSBzY2hlZHVsZXIgaXNuJ3QgcnVubmluZyBhIHRpY2sgYnV0IHRoZSBhcHBsaWNhdGlvbiB0aWNrZWQsIHRoYXQgbWVhbnNcbiAgICAgICAgLy8gc29tZW9uZSBjYWxsZWQgQXBwbGljYXRpb25SZWYudGljayBtYW51YWxseS4gSW4gdGhpcyBjYXNlLCB3ZSBzaG91bGQgY2FuY2VsXG4gICAgICAgIC8vIGFueSBjaGFuZ2UgZGV0ZWN0aW9ucyB0aGF0IGhhZCBiZWVuIHNjaGVkdWxlZCBzbyB3ZSBkb24ndCBydW4gYW4gZXh0cmEgb25lLlxuICAgICAgICBpZiAoIXRoaXMucnVubmluZ1RpY2spIHtcbiAgICAgICAgICB0aGlzLmNsZWFudXAoKTtcbiAgICAgICAgfVxuICAgICAgfSksXG4gICAgKTtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgdGhpcy5uZ1pvbmUub25VbnN0YWJsZS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICAvLyBJZiB0aGUgem9uZSBiZWNvbWVzIHVuc3RhYmxlIHdoZW4gd2UncmUgbm90IHJ1bm5pbmcgdGljayAodGhpcyBoYXBwZW5zIGZyb20gdGhlIHpvbmUucnVuKSxcbiAgICAgICAgLy8gd2Ugc2hvdWxkIGNhbmNlbCBhbnkgc2NoZWR1bGVkIGNoYW5nZSBkZXRlY3Rpb24gaGVyZSBiZWNhdXNlIGF0IHRoaXMgcG9pbnQgd2VcbiAgICAgICAgLy8ga25vdyB0aGF0IHRoZSB6b25lIHdpbGwgc3RhYmlsaXplIGF0IHNvbWUgcG9pbnQgYW5kIHJ1biBjaGFuZ2UgZGV0ZWN0aW9uIGl0c2VsZi5cbiAgICAgICAgaWYgKCF0aGlzLnJ1bm5pbmdUaWNrKSB7XG4gICAgICAgICAgdGhpcy5jbGVhbnVwKCk7XG4gICAgICAgIH1cbiAgICAgIH0pLFxuICAgICk7XG5cbiAgICAvLyBUT0RPKGF0c2NvdHQpOiBUaGVzZSBjb25kaXRpb25zIHdpbGwgbmVlZCB0byBjaGFuZ2Ugd2hlbiB6b25lbGVzcyBpcyB0aGUgZGVmYXVsdFxuICAgIC8vIEluc3RlYWQsIHRoZXkgc2hvdWxkIGZsaXAgdG8gY2hlY2tpbmcgaWYgWm9uZUpTIHNjaGVkdWxpbmcgaXMgcHJvdmlkZWRcbiAgICB0aGlzLmRpc2FibGVTY2hlZHVsaW5nIHx8PVxuICAgICAgIXRoaXMuem9uZWxlc3NFbmFibGVkICYmXG4gICAgICAvLyBOb29wTmdab25lIHdpdGhvdXQgZW5hYmxpbmcgem9uZWxlc3MgbWVhbnMgbm8gc2NoZWR1bGluZyB3aGF0c29ldmVyXG4gICAgICAodGhpcy5uZ1pvbmUgaW5zdGFuY2VvZiBOb29wTmdab25lIHx8XG4gICAgICAgIC8vIFRoZSBzYW1lIGdvZXMgZm9yIHRoZSBsYWNrIG9mIFpvbmUgd2l0aG91dCBlbmFibGluZyB6b25lbGVzcyBzY2hlZHVsaW5nXG4gICAgICAgICF0aGlzLnpvbmVJc0RlZmluZWQpO1xuICB9XG5cbiAgbm90aWZ5KHNvdXJjZTogTm90aWZpY2F0aW9uU291cmNlKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLnpvbmVsZXNzRW5hYmxlZCAmJiBzb3VyY2UgPT09IE5vdGlmaWNhdGlvblNvdXJjZS5MaXN0ZW5lcikge1xuICAgICAgLy8gV2hlbiB0aGUgbm90aWZpY2F0aW9uIGNvbWVzIGZyb20gYSBsaXN0ZW5lciwgd2Ugc2tpcCB0aGUgbm90aWZpY2F0aW9uIHVubGVzcyB0aGVcbiAgICAgIC8vIGFwcGxpY2F0aW9uIGhhcyBlbmFibGVkIHpvbmVsZXNzLiBJZGVhbGx5LCBsaXN0ZW5lcnMgd291bGRuJ3Qgbm90aWZ5IHRoZSBzY2hlZHVsZXIgYXQgYWxsXG4gICAgICAvLyBhdXRvbWF0aWNhbGx5LiBXZSBkbyBub3Qga25vdyB0aGF0IGEgZGV2ZWxvcGVyIG1hZGUgYSBjaGFuZ2UgaW4gdGhlIGxpc3RlbmVyIGNhbGxiYWNrIHRoYXRcbiAgICAgIC8vIHJlcXVpcmVzIGFuIGBBcHBsaWNhdGlvblJlZi50aWNrYCAoc3luY2hyb25pemUgdGVtcGxhdGVzIC8gcnVuIHJlbmRlciBob29rcykuIFdlIGRvIHRoaXNcbiAgICAgIC8vIG9ubHkgZm9yIGFuIGVhc2llciBtaWdyYXRpb24gZnJvbSBPblB1c2ggY29tcG9uZW50cyB0byB6b25lbGVzcy4gQmVjYXVzZSBsaXN0ZW5lcnMgYXJlXG4gICAgICAvLyB1c3VhbGx5IGV4ZWN1dGVkIGluc2lkZSB0aGUgQW5ndWxhciB6b25lIGFuZCBsaXN0ZW5lcnMgYXV0b21hdGljYWxseSBjYWxsIGBtYXJrVmlld0RpcnR5YCxcbiAgICAgIC8vIGRldmVsb3BlcnMgbmV2ZXIgbmVlZGVkIHRvIG1hbnVhbGx5IHVzZSBgQ2hhbmdlRGV0ZWN0b3JSZWYubWFya0ZvckNoZWNrYCBvciBzb21lIG90aGVyIEFQSVxuICAgICAgLy8gdG8gbWFrZSBsaXN0ZW5lciBjYWxsYmFja3Mgd29yayBjb3JyZWN0bHkgd2l0aCBgT25QdXNoYCBjb21wb25lbnRzLlxuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBzd2l0Y2ggKHNvdXJjZSkge1xuICAgICAgY2FzZSBOb3RpZmljYXRpb25Tb3VyY2UuTWFya0FuY2VzdG9yc0ZvclRyYXZlcnNhbDoge1xuICAgICAgICB0aGlzLmFwcFJlZi5kaXJ0eUZsYWdzIHw9IEFwcGxpY2F0aW9uUmVmRGlydHlGbGFncy5WaWV3VHJlZVRyYXZlcnNhbDtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjYXNlIE5vdGlmaWNhdGlvblNvdXJjZS5EZWJ1Z0FwcGx5Q2hhbmdlczpcbiAgICAgIGNhc2UgTm90aWZpY2F0aW9uU291cmNlLkRlZmVyQmxvY2tTdGF0ZVVwZGF0ZTpcbiAgICAgIGNhc2UgTm90aWZpY2F0aW9uU291cmNlLk1hcmtGb3JDaGVjazpcbiAgICAgIGNhc2UgTm90aWZpY2F0aW9uU291cmNlLkxpc3RlbmVyOlxuICAgICAgY2FzZSBOb3RpZmljYXRpb25Tb3VyY2UuU2V0SW5wdXQ6IHtcbiAgICAgICAgdGhpcy5hcHBSZWYuZGlydHlGbGFncyB8PSBBcHBsaWNhdGlvblJlZkRpcnR5RmxhZ3MuVmlld1RyZWVDaGVjaztcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjYXNlIE5vdGlmaWNhdGlvblNvdXJjZS5EZWZlcnJlZFJlbmRlckhvb2s6IHtcbiAgICAgICAgLy8gUmVuZGVyIGhvb2tzIGFyZSBcImRlZmVycmVkXCIgd2hlbiB0aGV5J3JlIHRyaWdnZXJlZCBmcm9tIG90aGVyIHJlbmRlciBob29rcy4gVXNpbmcgdGhlXG4gICAgICAgIC8vIGRlZmVycmVkIGRpcnR5IGZsYWdzIGVuc3VyZXMgdGhhdCBhZGRpbmcgbmV3IGhvb2tzIGRvZXNuJ3QgYXV0b21hdGljYWxseSB0cmlnZ2VyIGEgbG9vcFxuICAgICAgICAvLyBpbnNpZGUgdGljaygpLlxuICAgICAgICB0aGlzLmFwcFJlZi5kZWZlcnJlZERpcnR5RmxhZ3MgfD0gQXBwbGljYXRpb25SZWZEaXJ0eUZsYWdzLkFmdGVyUmVuZGVyO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGNhc2UgTm90aWZpY2F0aW9uU291cmNlLlZpZXdEZXRhY2hlZEZyb21ET006XG4gICAgICBjYXNlIE5vdGlmaWNhdGlvblNvdXJjZS5WaWV3QXR0YWNoZWQ6XG4gICAgICBjYXNlIE5vdGlmaWNhdGlvblNvdXJjZS5SZW5kZXJIb29rOlxuICAgICAgY2FzZSBOb3RpZmljYXRpb25Tb3VyY2UuQXN5bmNBbmltYXRpb25zTG9hZGVkOlxuICAgICAgZGVmYXVsdDoge1xuICAgICAgICAvLyBUaGVzZSBub3RpZmljYXRpb25zIG9ubHkgc2NoZWR1bGUgYSB0aWNrIGJ1dCBkbyBub3QgY2hhbmdlIHdoZXRoZXIgd2Ugc2hvdWxkIHJlZnJlc2hcbiAgICAgICAgLy8gdmlld3MuIEluc3RlYWQsIHdlIG9ubHkgbmVlZCB0byBydW4gcmVuZGVyIGhvb2tzIHVubGVzcyBhbm90aGVyIG5vdGlmaWNhdGlvbiBmcm9tIHRoZVxuICAgICAgICAvLyBvdGhlciBzZXQgaXMgYWxzbyByZWNlaXZlZCBiZWZvcmUgYHRpY2tgIGhhcHBlbnMuXG4gICAgICAgIHRoaXMuYXBwUmVmLmRpcnR5RmxhZ3MgfD0gQXBwbGljYXRpb25SZWZEaXJ0eUZsYWdzLkFmdGVyUmVuZGVyO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghdGhpcy5zaG91bGRTY2hlZHVsZVRpY2soKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpIHtcbiAgICAgIGlmICh0aGlzLnVzZU1pY3JvdGFza1NjaGVkdWxlcikge1xuICAgICAgICB0cmFja01pY3JvdGFza05vdGlmaWNhdGlvbkZvckRlYnVnZ2luZygpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc2VjdXRpdmVNaWNyb3Rhc2tOb3RpZmljYXRpb25zID0gMDtcbiAgICAgICAgc3RhY2tGcm9tTGFzdEZld05vdGlmaWNhdGlvbnMubGVuZ3RoID0gMDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBzY2hlZHVsZUNhbGxiYWNrID0gdGhpcy51c2VNaWNyb3Rhc2tTY2hlZHVsZXJcbiAgICAgID8gc2NoZWR1bGVDYWxsYmFja1dpdGhNaWNyb3Rhc2tcbiAgICAgIDogc2NoZWR1bGVDYWxsYmFja1dpdGhSYWZSYWNlO1xuICAgIHRoaXMucGVuZGluZ1JlbmRlclRhc2tJZCA9IHRoaXMudGFza1NlcnZpY2UuYWRkKCk7XG4gICAgaWYgKHRoaXMuc2NoZWR1bGVJblJvb3Rab25lKSB7XG4gICAgICB0aGlzLmNhbmNlbFNjaGVkdWxlZENhbGxiYWNrID0gWm9uZS5yb290LnJ1bigoKSA9PiBzY2hlZHVsZUNhbGxiYWNrKCgpID0+IHRoaXMudGljaygpKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY2FuY2VsU2NoZWR1bGVkQ2FsbGJhY2sgPSB0aGlzLm5nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PlxuICAgICAgICBzY2hlZHVsZUNhbGxiYWNrKCgpID0+IHRoaXMudGljaygpKSxcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBzaG91bGRTY2hlZHVsZVRpY2soKTogYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMuZGlzYWJsZVNjaGVkdWxpbmcpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgLy8gYWxyZWFkeSBzY2hlZHVsZWQgb3IgcnVubmluZ1xuICAgIGlmICh0aGlzLnBlbmRpbmdSZW5kZXJUYXNrSWQgIT09IG51bGwgfHwgdGhpcy5ydW5uaW5nVGljayB8fCB0aGlzLmFwcFJlZi5fcnVubmluZ1RpY2spIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgLy8gSWYgd2UncmUgaW5zaWRlIHRoZSB6b25lIGRvbid0IGJvdGhlciB3aXRoIHNjaGVkdWxlci4gWm9uZSB3aWxsIHN0YWJpbGl6ZVxuICAgIC8vIGV2ZW50dWFsbHkgYW5kIHJ1biBjaGFuZ2UgZGV0ZWN0aW9uLlxuICAgIGlmIChcbiAgICAgICF0aGlzLnpvbmVsZXNzRW5hYmxlZCAmJlxuICAgICAgdGhpcy56b25lSXNEZWZpbmVkICYmXG4gICAgICBab25lLmN1cnJlbnQuZ2V0KGFuZ3VsYXJab25lSW5zdGFuY2VJZFByb3BlcnR5ICsgdGhpcy5hbmd1bGFyWm9uZUlkKVxuICAgICkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxzIEFwcGxpY2F0aW9uUmVmLl90aWNrIGluc2lkZSB0aGUgYE5nWm9uZWAuXG4gICAqXG4gICAqIENhbGxpbmcgYHRpY2tgIGRpcmVjdGx5IHJ1bnMgY2hhbmdlIGRldGVjdGlvbiBhbmQgY2FuY2VscyBhbnkgY2hhbmdlIGRldGVjdGlvbiB0aGF0IGhhZCBiZWVuXG4gICAqIHNjaGVkdWxlZCBwcmV2aW91c2x5LlxuICAgKlxuICAgKiBAcGFyYW0gc2hvdWxkUmVmcmVzaFZpZXdzIFBhc3NlZCBkaXJlY3RseSB0byBgQXBwbGljYXRpb25SZWYuX3RpY2tgIGFuZCBza2lwcyBzdHJhaWdodCB0b1xuICAgKiAgICAgcmVuZGVyIGhvb2tzIHdoZW4gYGZhbHNlYC5cbiAgICovXG4gIHByaXZhdGUgdGljaygpOiB2b2lkIHtcbiAgICAvLyBXaGVuIG5nWm9uZS5ydW4gYmVsb3cgZXhpdHMsIG9uTWljcm90YXNrRW1wdHkgbWF5IGVtaXQgaWYgdGhlIHpvbmUgaXNcbiAgICAvLyBzdGFibGUuIFdlIHdhbnQgdG8gcHJldmVudCBkb3VibGUgdGlja2luZyBzbyB3ZSB0cmFjayB3aGV0aGVyIHRoZSB0aWNrIGlzXG4gICAgLy8gYWxyZWFkeSBydW5uaW5nIGFuZCBza2lwIGl0IGlmIHNvLlxuICAgIGlmICh0aGlzLnJ1bm5pbmdUaWNrIHx8IHRoaXMuYXBwUmVmLmRlc3Ryb3llZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFRoZSBzY2hlZHVsZXIgdXNlZCB0byBwYXNzIFwid2hldGhlciB0byBjaGVjayB2aWV3c1wiIGFzIGEgYm9vbGVhbiBmbGFnIGluc3RlYWQgb2Ygc2V0dGluZ1xuICAgIC8vIGZpbmUtZ3JhaW5lZCBkaXJ0aW5lc3MgZmxhZ3MsIGFuZCBnbG9iYWwgY2hlY2tpbmcgd2FzIGFsd2F5cyB1c2VkIG9uIHRoZSBmaXJzdCBwYXNzLiBUaGlzXG4gICAgLy8gY3JlYXRlZCBhbiBpbnRlcmVzdGluZyBlZGdlIGNhc2U6IGlmIGEgbm90aWZpY2F0aW9uIG1hZGUgYSB2aWV3IGRpcnR5IGFuZCB0aGVuIHRpY2tlZCB2aWEgdGhlXG4gICAgLy8gc2NoZWR1bGVyIChhbmQgbm90IHRoZSB6b25lKSBhIGdsb2JhbCBjaGVjayB3YXMgc3RpbGwgcGVyZm9ybWVkLlxuICAgIC8vXG4gICAgLy8gSWRlYWxseSwgdGhpcyB3b3VsZCBub3QgYmUgdGhlIGNhc2UsIGFuZCBvbmx5IHpvbmUtYmFzZWQgdGlja3Mgd291bGQgZG8gZ2xvYmFsIHBhc3Nlcy5cbiAgICAvLyBIb3dldmVyIHRoaXMgaXMgYSBicmVha2luZyBjaGFuZ2UgYW5kIHJlcXVpcmVzIGZpeGVzIGluIGczLiBVbnRpbCB0aGlzIGNsZWFudXAgY2FuIGJlIGRvbmUsXG4gICAgLy8gd2UgYWRkIHRoZSBgVmlld1RyZWVHbG9iYWxgIGZsYWcgdG8gcmVxdWVzdCBhIGdsb2JhbCBjaGVjayBpZiBhbnkgdmlld3MgYXJlIGRpcnR5IGluIGFcbiAgICAvLyBzY2hlZHVsZWQgdGljayAodW5sZXNzIHpvbmVsZXNzIGlzIGVuYWJsZWQsIGluIHdoaWNoIGNhc2UgZ2xvYmFsIGNoZWNrcyBhcmVuJ3QgcmVhbGx5IGFcbiAgICAvLyB0aGluZykuXG4gICAgLy9cbiAgICAvLyBUT0RPKGFseGh1Yik6IGNsZWFuIHVwIGFuZCByZW1vdmUgdGhpcyB3b3JrYXJvdW5kIGFzIGEgYnJlYWtpbmcgY2hhbmdlLlxuICAgIGlmICghdGhpcy56b25lbGVzc0VuYWJsZWQgJiYgdGhpcy5hcHBSZWYuZGlydHlGbGFncyAmIEFwcGxpY2F0aW9uUmVmRGlydHlGbGFncy5WaWV3VHJlZUFueSkge1xuICAgICAgdGhpcy5hcHBSZWYuZGlydHlGbGFncyB8PSBBcHBsaWNhdGlvblJlZkRpcnR5RmxhZ3MuVmlld1RyZWVHbG9iYWw7XG4gICAgfVxuXG4gICAgY29uc3QgdGFzayA9IHRoaXMudGFza1NlcnZpY2UuYWRkKCk7XG4gICAgdHJ5IHtcbiAgICAgIHRoaXMubmdab25lLnJ1bihcbiAgICAgICAgKCkgPT4ge1xuICAgICAgICAgIHRoaXMucnVubmluZ1RpY2sgPSB0cnVlO1xuICAgICAgICAgIHRoaXMuYXBwUmVmLl90aWNrKCk7XG4gICAgICAgIH0sXG4gICAgICAgIHVuZGVmaW5lZCxcbiAgICAgICAgdGhpcy5zY2hlZHVsZXJUaWNrQXBwbHlBcmdzLFxuICAgICAgKTtcbiAgICB9IGNhdGNoIChlOiB1bmtub3duKSB7XG4gICAgICB0aGlzLnRhc2tTZXJ2aWNlLnJlbW92ZSh0YXNrKTtcbiAgICAgIHRocm93IGU7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRoaXMuY2xlYW51cCgpO1xuICAgIH1cbiAgICAvLyBJZiB3ZSdyZSBub3RpZmllZCBvZiBhIGNoYW5nZSB3aXRoaW4gMSBtaWNyb3Rhc2sgb2YgcnVubmluZyBjaGFuZ2VcbiAgICAvLyBkZXRlY3Rpb24sIHJ1biBhbm90aGVyIHJvdW5kIGluIHRoZSBzYW1lIGV2ZW50IGxvb3AuIFRoaXMgYWxsb3dzIGNvZGVcbiAgICAvLyB3aGljaCB1c2VzIFByb21pc2UucmVzb2x2ZSAoc2VlIE5nTW9kZWwpIHRvIGF2b2lkXG4gICAgLy8gRXhwcmVzc2lvbkNoYW5nZWQuLi5FcnJvciB0byBzdGlsbCBiZSByZWZsZWN0ZWQgaW4gYSBzaW5nbGUgYnJvd3NlclxuICAgIC8vIHBhaW50LCBldmVuIGlmIHRoYXQgc3BhbnMgbXVsdGlwbGUgcm91bmRzIG9mIGNoYW5nZSBkZXRlY3Rpb24uXG4gICAgdGhpcy51c2VNaWNyb3Rhc2tTY2hlZHVsZXIgPSB0cnVlO1xuICAgIHNjaGVkdWxlQ2FsbGJhY2tXaXRoTWljcm90YXNrKCgpID0+IHtcbiAgICAgIHRoaXMudXNlTWljcm90YXNrU2NoZWR1bGVyID0gZmFsc2U7XG4gICAgICB0aGlzLnRhc2tTZXJ2aWNlLnJlbW92ZSh0YXNrKTtcbiAgICB9KTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy51bnN1YnNjcmliZSgpO1xuICAgIHRoaXMuY2xlYW51cCgpO1xuICB9XG5cbiAgcHJpdmF0ZSBjbGVhbnVwKCkge1xuICAgIHRoaXMucnVubmluZ1RpY2sgPSBmYWxzZTtcbiAgICB0aGlzLmNhbmNlbFNjaGVkdWxlZENhbGxiYWNrPy4oKTtcbiAgICB0aGlzLmNhbmNlbFNjaGVkdWxlZENhbGxiYWNrID0gbnVsbDtcbiAgICAvLyBJZiB0aGlzIGlzIHRoZSBsYXN0IHRhc2ssIHRoZSBzZXJ2aWNlIHdpbGwgc3luY2hyb25vdXNseSBlbWl0IGEgc3RhYmxlXG4gICAgLy8gbm90aWZpY2F0aW9uLiBJZiB0aGVyZSBpcyBhIHN1YnNjcmliZXIgdGhhdCB0aGVuIGFjdHMgaW4gYSB3YXkgdGhhdFxuICAgIC8vIHRyaWVzIHRvIG5vdGlmeSB0aGUgc2NoZWR1bGVyIGFnYWluLCB3ZSBuZWVkIHRvIGJlIGFibGUgdG8gcmVzcG9uZCB0b1xuICAgIC8vIHNjaGVkdWxlIGEgbmV3IGNoYW5nZSBkZXRlY3Rpb24uIFRoZXJlZm9yZSwgd2Ugc2hvdWxkIGNsZWFyIHRoZSB0YXNrIElEXG4gICAgLy8gYmVmb3JlIHJlbW92aW5nIGl0IGZyb20gdGhlIHBlbmRpbmcgdGFza3MgKG9yIHRoZSB0YXNrcyBzZXJ2aWNlIHNob3VsZFxuICAgIC8vIG5vdCBzeW5jaHJvbm91c2x5IGVtaXQgc3RhYmxlLCBzaW1pbGFyIHRvIGhvdyBab25lIHN0YWJsZW5lc3Mgb25seVxuICAgIC8vIGhhcHBlbnMgaWYgaXQncyBzdGlsbCBzdGFibGUgYWZ0ZXIgYSBtaWNyb3Rhc2spLlxuICAgIGlmICh0aGlzLnBlbmRpbmdSZW5kZXJUYXNrSWQgIT09IG51bGwpIHtcbiAgICAgIGNvbnN0IHRhc2tJZCA9IHRoaXMucGVuZGluZ1JlbmRlclRhc2tJZDtcbiAgICAgIHRoaXMucGVuZGluZ1JlbmRlclRhc2tJZCA9IG51bGw7XG4gICAgICB0aGlzLnRhc2tTZXJ2aWNlLnJlbW92ZSh0YXNrSWQpO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIFByb3ZpZGVzIGNoYW5nZSBkZXRlY3Rpb24gd2l0aG91dCBab25lSlMgZm9yIHRoZSBhcHBsaWNhdGlvbiBib290c3RyYXBwZWQgdXNpbmdcbiAqIGBib290c3RyYXBBcHBsaWNhdGlvbmAuXG4gKlxuICogVGhpcyBmdW5jdGlvbiBhbGxvd3MgeW91IHRvIGNvbmZpZ3VyZSB0aGUgYXBwbGljYXRpb24gdG8gbm90IHVzZSB0aGUgc3RhdGUvc3RhdGUgY2hhbmdlcyBvZlxuICogWm9uZUpTIHRvIHNjaGVkdWxlIGNoYW5nZSBkZXRlY3Rpb24gaW4gdGhlIGFwcGxpY2F0aW9uLiBUaGlzIHdpbGwgd29yayB3aGVuIFpvbmVKUyBpcyBub3QgcHJlc2VudFxuICogb24gdGhlIHBhZ2UgYXQgYWxsIG9yIGlmIGl0IGV4aXN0cyBiZWNhdXNlIHNvbWV0aGluZyBlbHNlIGlzIHVzaW5nIGl0IChlaXRoZXIgYW5vdGhlciBBbmd1bGFyXG4gKiBhcHBsaWNhdGlvbiB3aGljaCB1c2VzIFpvbmVKUyBmb3Igc2NoZWR1bGluZyBvciBzb21lIG90aGVyIGxpYnJhcnkgdGhhdCByZWxpZXMgb24gWm9uZUpTKS5cbiAqXG4gKiBUaGlzIGNhbiBhbHNvIGJlIGFkZGVkIHRvIHRoZSBgVGVzdEJlZGAgcHJvdmlkZXJzIHRvIGNvbmZpZ3VyZSB0aGUgdGVzdCBlbnZpcm9ubWVudCB0byBtb3JlXG4gKiBjbG9zZWx5IG1hdGNoIHByb2R1Y3Rpb24gYmVoYXZpb3IuIFRoaXMgd2lsbCBoZWxwIGdpdmUgaGlnaGVyIGNvbmZpZGVuY2UgdGhhdCBjb21wb25lbnRzIGFyZVxuICogY29tcGF0aWJsZSB3aXRoIHpvbmVsZXNzIGNoYW5nZSBkZXRlY3Rpb24uXG4gKlxuICogWm9uZUpTIHVzZXMgYnJvd3NlciBldmVudHMgdG8gdHJpZ2dlciBjaGFuZ2UgZGV0ZWN0aW9uLiBXaGVuIHVzaW5nIHRoaXMgcHJvdmlkZXIsIEFuZ3VsYXIgd2lsbFxuICogaW5zdGVhZCB1c2UgQW5ndWxhciBBUElzIHRvIHNjaGVkdWxlIGNoYW5nZSBkZXRlY3Rpb24uIFRoZXNlIEFQSXMgaW5jbHVkZTpcbiAqXG4gKiAtIGBDaGFuZ2VEZXRlY3RvclJlZi5tYXJrRm9yQ2hlY2tgXG4gKiAtIGBDb21wb25lbnRSZWYuc2V0SW5wdXRgXG4gKiAtIHVwZGF0aW5nIGEgc2lnbmFsIHRoYXQgaXMgcmVhZCBpbiBhIHRlbXBsYXRlXG4gKiAtIHdoZW4gYm91bmQgaG9zdCBvciB0ZW1wbGF0ZSBsaXN0ZW5lcnMgYXJlIHRyaWdnZXJlZFxuICogLSBhdHRhY2hpbmcgYSB2aWV3IHRoYXQgd2FzIG1hcmtlZCBkaXJ0eSBieSBvbmUgb2YgdGhlIGFib3ZlXG4gKiAtIHJlbW92aW5nIGEgdmlld1xuICogLSByZWdpc3RlcmluZyBhIHJlbmRlciBob29rICh0ZW1wbGF0ZXMgYXJlIG9ubHkgcmVmcmVzaGVkIGlmIHJlbmRlciBob29rcyBkbyBvbmUgb2YgdGhlIGFib3ZlKVxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBib290c3RyYXBBcHBsaWNhdGlvbihNeUFwcCwge3Byb3ZpZGVyczogW1xuICogICBwcm92aWRlRXhwZXJpbWVudGFsWm9uZWxlc3NDaGFuZ2VEZXRlY3Rpb24oKSxcbiAqIF19KTtcbiAqIGBgYFxuICpcbiAqIFRoaXMgQVBJIGlzIGV4cGVyaW1lbnRhbC4gTmVpdGhlciB0aGUgc2hhcGUsIG5vciB0aGUgdW5kZXJseWluZyBiZWhhdmlvciBpcyBzdGFibGUgYW5kIGNhbiBjaGFuZ2VcbiAqIGluIHBhdGNoIHZlcnNpb25zLiBUaGVyZSBhcmUga25vd24gZmVhdHVyZSBnYXBzIGFuZCBBUEkgZXJnb25vbWljIGNvbnNpZGVyYXRpb25zLiBXZSB3aWxsIGl0ZXJhdGVcbiAqIG9uIHRoZSBleGFjdCBBUEkgYmFzZWQgb24gdGhlIGZlZWRiYWNrIGFuZCBvdXIgdW5kZXJzdGFuZGluZyBvZiB0aGUgcHJvYmxlbSBhbmQgc29sdXRpb24gc3BhY2UuXG4gKlxuICogQHB1YmxpY0FwaVxuICogQGV4cGVyaW1lbnRhbFxuICogQHNlZSBbYm9vdHN0cmFwQXBwbGljYXRpb25dKC9hcGkvcGxhdGZvcm0tYnJvd3Nlci9ib290c3RyYXBBcHBsaWNhdGlvbilcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByb3ZpZGVFeHBlcmltZW50YWxab25lbGVzc0NoYW5nZURldGVjdGlvbigpOiBFbnZpcm9ubWVudFByb3ZpZGVycyB7XG4gIHBlcmZvcm1hbmNlTWFya0ZlYXR1cmUoJ05nWm9uZWxlc3MnKTtcblxuICBpZiAoKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkgJiYgdHlwZW9mIFpvbmUgIT09ICd1bmRlZmluZWQnICYmIFpvbmUpIHtcbiAgICBjb25zdCBtZXNzYWdlID0gZm9ybWF0UnVudGltZUVycm9yKFxuICAgICAgUnVudGltZUVycm9yQ29kZS5VTkVYUEVDVEVEX1pPTkVKU19QUkVTRU5UX0lOX1pPTkVMRVNTX01PREUsXG4gICAgICBgVGhlIGFwcGxpY2F0aW9uIGlzIHVzaW5nIHpvbmVsZXNzIGNoYW5nZSBkZXRlY3Rpb24sIGJ1dCBpcyBzdGlsbCBsb2FkaW5nIFpvbmUuanMuIGAgK1xuICAgICAgICBgQ29uc2lkZXIgcmVtb3ZpbmcgWm9uZS5qcyB0byBnZXQgdGhlIGZ1bGwgYmVuZWZpdHMgb2Ygem9uZWxlc3MuIGAgK1xuICAgICAgICBgSW4gYXBwbGljYXRpb25zIHVzaW5nIHRoZSBBbmd1bGFyIENMSSwgWm9uZS5qcyBpcyB0eXBpY2FsbHkgaW5jbHVkZWQgaW4gdGhlIFwicG9seWZpbGxzXCIgc2VjdGlvbiBvZiB0aGUgYW5ndWxhci5qc29uIGZpbGUuYCxcbiAgICApO1xuICAgIGNvbnNvbGUud2FybihtZXNzYWdlKTtcbiAgfVxuXG4gIHJldHVybiBtYWtlRW52aXJvbm1lbnRQcm92aWRlcnMoW1xuICAgIHtwcm92aWRlOiBDaGFuZ2VEZXRlY3Rpb25TY2hlZHVsZXIsIHVzZUV4aXN0aW5nOiBDaGFuZ2VEZXRlY3Rpb25TY2hlZHVsZXJJbXBsfSxcbiAgICB7cHJvdmlkZTogTmdab25lLCB1c2VDbGFzczogTm9vcE5nWm9uZX0sXG4gICAge3Byb3ZpZGU6IFpPTkVMRVNTX0VOQUJMRUQsIHVzZVZhbHVlOiB0cnVlfSxcbiAgICB7cHJvdmlkZTogU0NIRURVTEVfSU5fUk9PVF9aT05FLCB1c2VWYWx1ZTogZmFsc2V9LFxuICAgIHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZVxuICAgICAgPyBbe3Byb3ZpZGU6IFBST1ZJREVEX1pPTkVMRVNTLCB1c2VWYWx1ZTogdHJ1ZX1dXG4gICAgICA6IFtdLFxuICBdKTtcbn1cbiJdfQ==