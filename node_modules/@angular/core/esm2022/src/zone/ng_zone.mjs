/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { SCHEDULE_IN_ROOT_ZONE_DEFAULT } from '../change_detection/scheduling/flags';
import { RuntimeError } from '../errors';
import { EventEmitter } from '../event_emitter';
import { scheduleCallbackWithRafRace } from '../util/callback_scheduler';
import { noop } from '../util/noop';
import { AsyncStackTaggingZoneSpec } from './async-stack-tagging';
const isAngularZoneProperty = 'isAngularZone';
export const angularZoneInstanceIdProperty = isAngularZoneProperty + '_ID';
let ngZoneInstanceId = 0;
/**
 * An injectable service for executing work inside or outside of the Angular zone.
 *
 * The most common use of this service is to optimize performance when starting a work consisting of
 * one or more asynchronous tasks that don't require UI updates or error handling to be handled by
 * Angular. Such tasks can be kicked off via {@link #runOutsideAngular} and if needed, these tasks
 * can reenter the Angular zone via {@link #run}.
 *
 * <!-- TODO: add/fix links to:
 *   - docs explaining zones and the use of zones in Angular and change-detection
 *   - link to runOutsideAngular/run (throughout this file!)
 *   -->
 *
 * @usageNotes
 * ### Example
 *
 * ```
 * import {Component, NgZone} from '@angular/core';
 * import {NgIf} from '@angular/common';
 *
 * @Component({
 *   selector: 'ng-zone-demo',
 *   template: `
 *     <h2>Demo: NgZone</h2>
 *
 *     <p>Progress: {{progress}}%</p>
 *     <p *ngIf="progress >= 100">Done processing {{label}} of Angular zone!</p>
 *
 *     <button (click)="processWithinAngularZone()">Process within Angular zone</button>
 *     <button (click)="processOutsideOfAngularZone()">Process outside of Angular zone</button>
 *   `,
 * })
 * export class NgZoneDemo {
 *   progress: number = 0;
 *   label: string;
 *
 *   constructor(private _ngZone: NgZone) {}
 *
 *   // Loop inside the Angular zone
 *   // so the UI DOES refresh after each setTimeout cycle
 *   processWithinAngularZone() {
 *     this.label = 'inside';
 *     this.progress = 0;
 *     this._increaseProgress(() => console.log('Inside Done!'));
 *   }
 *
 *   // Loop outside of the Angular zone
 *   // so the UI DOES NOT refresh after each setTimeout cycle
 *   processOutsideOfAngularZone() {
 *     this.label = 'outside';
 *     this.progress = 0;
 *     this._ngZone.runOutsideAngular(() => {
 *       this._increaseProgress(() => {
 *         // reenter the Angular zone and display done
 *         this._ngZone.run(() => { console.log('Outside Done!'); });
 *       });
 *     });
 *   }
 *
 *   _increaseProgress(doneCallback: () => void) {
 *     this.progress += 1;
 *     console.log(`Current progress: ${this.progress}%`);
 *
 *     if (this.progress < 100) {
 *       window.setTimeout(() => this._increaseProgress(doneCallback), 10);
 *     } else {
 *       doneCallback();
 *     }
 *   }
 * }
 * ```
 *
 * @publicApi
 */
export class NgZone {
    constructor(options) {
        this.hasPendingMacrotasks = false;
        this.hasPendingMicrotasks = false;
        /**
         * Whether there are no outstanding microtasks or macrotasks.
         */
        this.isStable = true;
        /**
         * Notifies when code enters Angular Zone. This gets fired first on VM Turn.
         */
        this.onUnstable = new EventEmitter(false);
        /**
         * Notifies when there is no more microtasks enqueued in the current VM Turn.
         * This is a hint for Angular to do change detection, which may enqueue more microtasks.
         * For this reason this event can fire multiple times per VM Turn.
         */
        this.onMicrotaskEmpty = new EventEmitter(false);
        /**
         * Notifies when the last `onMicrotaskEmpty` has run and there are no more microtasks, which
         * implies we are about to relinquish VM turn.
         * This event gets called just once.
         */
        this.onStable = new EventEmitter(false);
        /**
         * Notifies that an error has been delivered.
         */
        this.onError = new EventEmitter(false);
        const { enableLongStackTrace = false, shouldCoalesceEventChangeDetection = false, shouldCoalesceRunChangeDetection = false, scheduleInRootZone = SCHEDULE_IN_ROOT_ZONE_DEFAULT, } = options;
        if (typeof Zone == 'undefined') {
            throw new RuntimeError(908 /* RuntimeErrorCode.MISSING_ZONEJS */, ngDevMode && `In this configuration Angular requires Zone.js`);
        }
        Zone.assertZonePatched();
        const self = this;
        self._nesting = 0;
        self._outer = self._inner = Zone.current;
        // AsyncStackTaggingZoneSpec provides `linked stack traces` to show
        // where the async operation is scheduled. For more details, refer
        // to this article, https://developer.chrome.com/blog/devtools-better-angular-debugging/
        // And we only import this AsyncStackTaggingZoneSpec in development mode,
        // in the production mode, the AsyncStackTaggingZoneSpec will be tree shaken away.
        if (ngDevMode) {
            self._inner = self._inner.fork(new AsyncStackTaggingZoneSpec('Angular'));
        }
        if (Zone['TaskTrackingZoneSpec']) {
            self._inner = self._inner.fork(new Zone['TaskTrackingZoneSpec']());
        }
        if (enableLongStackTrace && Zone['longStackTraceZoneSpec']) {
            self._inner = self._inner.fork(Zone['longStackTraceZoneSpec']);
        }
        // if shouldCoalesceRunChangeDetection is true, all tasks including event tasks will be
        // coalesced, so shouldCoalesceEventChangeDetection option is not necessary and can be skipped.
        self.shouldCoalesceEventChangeDetection =
            !shouldCoalesceRunChangeDetection && shouldCoalesceEventChangeDetection;
        self.shouldCoalesceRunChangeDetection = shouldCoalesceRunChangeDetection;
        self.callbackScheduled = false;
        self.scheduleInRootZone = scheduleInRootZone;
        forkInnerZoneWithAngularBehavior(self);
    }
    /**
      This method checks whether the method call happens within an Angular Zone instance.
    */
    static isInAngularZone() {
        // Zone needs to be checked, because this method might be called even when NoopNgZone is used.
        return typeof Zone !== 'undefined' && Zone.current.get(isAngularZoneProperty) === true;
    }
    /**
      Assures that the method is called within the Angular Zone, otherwise throws an error.
    */
    static assertInAngularZone() {
        if (!NgZone.isInAngularZone()) {
            throw new RuntimeError(909 /* RuntimeErrorCode.UNEXPECTED_ZONE_STATE */, ngDevMode && 'Expected to be in Angular Zone, but it is not!');
        }
    }
    /**
      Assures that the method is called outside of the Angular Zone, otherwise throws an error.
    */
    static assertNotInAngularZone() {
        if (NgZone.isInAngularZone()) {
            throw new RuntimeError(909 /* RuntimeErrorCode.UNEXPECTED_ZONE_STATE */, ngDevMode && 'Expected to not be in Angular Zone, but it is!');
        }
    }
    /**
     * Executes the `fn` function synchronously within the Angular zone and returns value returned by
     * the function.
     *
     * Running functions via `run` allows you to reenter Angular zone from a task that was executed
     * outside of the Angular zone (typically started via {@link #runOutsideAngular}).
     *
     * Any future tasks or microtasks scheduled from within this function will continue executing from
     * within the Angular zone.
     *
     * If a synchronous error happens it will be rethrown and not reported via `onError`.
     */
    run(fn, applyThis, applyArgs) {
        return this._inner.run(fn, applyThis, applyArgs);
    }
    /**
     * Executes the `fn` function synchronously within the Angular zone as a task and returns value
     * returned by the function.
     *
     * Running functions via `run` allows you to reenter Angular zone from a task that was executed
     * outside of the Angular zone (typically started via {@link #runOutsideAngular}).
     *
     * Any future tasks or microtasks scheduled from within this function will continue executing from
     * within the Angular zone.
     *
     * If a synchronous error happens it will be rethrown and not reported via `onError`.
     */
    runTask(fn, applyThis, applyArgs, name) {
        const zone = this._inner;
        const task = zone.scheduleEventTask('NgZoneEvent: ' + name, fn, EMPTY_PAYLOAD, noop, noop);
        try {
            return zone.runTask(task, applyThis, applyArgs);
        }
        finally {
            zone.cancelTask(task);
        }
    }
    /**
     * Same as `run`, except that synchronous errors are caught and forwarded via `onError` and not
     * rethrown.
     */
    runGuarded(fn, applyThis, applyArgs) {
        return this._inner.runGuarded(fn, applyThis, applyArgs);
    }
    /**
     * Executes the `fn` function synchronously in Angular's parent zone and returns value returned by
     * the function.
     *
     * Running functions via {@link #runOutsideAngular} allows you to escape Angular's zone and do
     * work that
     * doesn't trigger Angular change-detection or is subject to Angular's error handling.
     *
     * Any future tasks or microtasks scheduled from within this function will continue executing from
     * outside of the Angular zone.
     *
     * Use {@link #run} to reenter the Angular zone and do work that updates the application model.
     */
    runOutsideAngular(fn) {
        return this._outer.run(fn);
    }
}
const EMPTY_PAYLOAD = {};
function checkStable(zone) {
    // TODO: @JiaLiPassion, should check zone.isCheckStableRunning to prevent
    // re-entry. The case is:
    //
    // @Component({...})
    // export class AppComponent {
    // constructor(private ngZone: NgZone) {
    //   this.ngZone.onStable.subscribe(() => {
    //     this.ngZone.run(() => console.log('stable'););
    //   });
    // }
    //
    // The onStable subscriber run another function inside ngZone
    // which causes `checkStable()` re-entry.
    // But this fix causes some issues in g3, so this fix will be
    // launched in another PR.
    if (zone._nesting == 0 && !zone.hasPendingMicrotasks && !zone.isStable) {
        try {
            zone._nesting++;
            zone.onMicrotaskEmpty.emit(null);
        }
        finally {
            zone._nesting--;
            if (!zone.hasPendingMicrotasks) {
                try {
                    zone.runOutsideAngular(() => zone.onStable.emit(null));
                }
                finally {
                    zone.isStable = true;
                }
            }
        }
    }
}
function delayChangeDetectionForEvents(zone) {
    /**
     * We also need to check _nesting here
     * Consider the following case with shouldCoalesceRunChangeDetection = true
     *
     * ngZone.run(() => {});
     * ngZone.run(() => {});
     *
     * We want the two `ngZone.run()` only trigger one change detection
     * when shouldCoalesceRunChangeDetection is true.
     * And because in this case, change detection run in async way(requestAnimationFrame),
     * so we also need to check the _nesting here to prevent multiple
     * change detections.
     */
    if (zone.isCheckStableRunning || zone.callbackScheduled) {
        return;
    }
    zone.callbackScheduled = true;
    function scheduleCheckStable() {
        scheduleCallbackWithRafRace(() => {
            zone.callbackScheduled = false;
            updateMicroTaskStatus(zone);
            zone.isCheckStableRunning = true;
            checkStable(zone);
            zone.isCheckStableRunning = false;
        });
    }
    if (zone.scheduleInRootZone) {
        Zone.root.run(() => {
            scheduleCheckStable();
        });
    }
    else {
        zone._outer.run(() => {
            scheduleCheckStable();
        });
    }
    updateMicroTaskStatus(zone);
}
function forkInnerZoneWithAngularBehavior(zone) {
    const delayChangeDetectionForEventsDelegate = () => {
        delayChangeDetectionForEvents(zone);
    };
    const instanceId = ngZoneInstanceId++;
    zone._inner = zone._inner.fork({
        name: 'angular',
        properties: {
            [isAngularZoneProperty]: true,
            [angularZoneInstanceIdProperty]: instanceId,
            [angularZoneInstanceIdProperty + instanceId]: true,
        },
        onInvokeTask: (delegate, current, target, task, applyThis, applyArgs) => {
            // Prevent triggering change detection when the flag is detected.
            if (shouldBeIgnoredByZone(applyArgs)) {
                return delegate.invokeTask(target, task, applyThis, applyArgs);
            }
            try {
                onEnter(zone);
                return delegate.invokeTask(target, task, applyThis, applyArgs);
            }
            finally {
                if ((zone.shouldCoalesceEventChangeDetection && task.type === 'eventTask') ||
                    zone.shouldCoalesceRunChangeDetection) {
                    delayChangeDetectionForEventsDelegate();
                }
                onLeave(zone);
            }
        },
        onInvoke: (delegate, current, target, callback, applyThis, applyArgs, source) => {
            try {
                onEnter(zone);
                return delegate.invoke(target, callback, applyThis, applyArgs, source);
            }
            finally {
                if (zone.shouldCoalesceRunChangeDetection &&
                    // Do not delay change detection when the task is the scheduler's tick.
                    // We need to synchronously trigger the stability logic so that the
                    // zone-based scheduler can prevent a duplicate ApplicationRef.tick
                    // by first checking if the scheduler tick is running. This does seem a bit roundabout,
                    // but we _do_ still want to trigger all the correct events when we exit the zone.run
                    // (`onMicrotaskEmpty` and `onStable` _should_ emit; developers can have code which
                    // relies on these events happening after change detection runs).
                    // Note: `zone.callbackScheduled` is already in delayChangeDetectionForEventsDelegate
                    // but is added here as well to prevent reads of applyArgs when not necessary
                    !zone.callbackScheduled &&
                    !isSchedulerTick(applyArgs)) {
                    delayChangeDetectionForEventsDelegate();
                }
                onLeave(zone);
            }
        },
        onHasTask: (delegate, current, target, hasTaskState) => {
            delegate.hasTask(target, hasTaskState);
            if (current === target) {
                // We are only interested in hasTask events which originate from our zone
                // (A child hasTask event is not interesting to us)
                if (hasTaskState.change == 'microTask') {
                    zone._hasPendingMicrotasks = hasTaskState.microTask;
                    updateMicroTaskStatus(zone);
                    checkStable(zone);
                }
                else if (hasTaskState.change == 'macroTask') {
                    zone.hasPendingMacrotasks = hasTaskState.macroTask;
                }
            }
        },
        onHandleError: (delegate, current, target, error) => {
            delegate.handleError(target, error);
            zone.runOutsideAngular(() => zone.onError.emit(error));
            return false;
        },
    });
}
function updateMicroTaskStatus(zone) {
    if (zone._hasPendingMicrotasks ||
        ((zone.shouldCoalesceEventChangeDetection || zone.shouldCoalesceRunChangeDetection) &&
            zone.callbackScheduled === true)) {
        zone.hasPendingMicrotasks = true;
    }
    else {
        zone.hasPendingMicrotasks = false;
    }
}
function onEnter(zone) {
    zone._nesting++;
    if (zone.isStable) {
        zone.isStable = false;
        zone.onUnstable.emit(null);
    }
}
function onLeave(zone) {
    zone._nesting--;
    checkStable(zone);
}
/**
 * Provides a noop implementation of `NgZone` which does nothing. This zone requires explicit calls
 * to framework to perform rendering.
 */
export class NoopNgZone {
    constructor() {
        this.hasPendingMicrotasks = false;
        this.hasPendingMacrotasks = false;
        this.isStable = true;
        this.onUnstable = new EventEmitter();
        this.onMicrotaskEmpty = new EventEmitter();
        this.onStable = new EventEmitter();
        this.onError = new EventEmitter();
    }
    run(fn, applyThis, applyArgs) {
        return fn.apply(applyThis, applyArgs);
    }
    runGuarded(fn, applyThis, applyArgs) {
        return fn.apply(applyThis, applyArgs);
    }
    runOutsideAngular(fn) {
        return fn();
    }
    runTask(fn, applyThis, applyArgs, name) {
        return fn.apply(applyThis, applyArgs);
    }
}
function shouldBeIgnoredByZone(applyArgs) {
    return hasApplyArgsData(applyArgs, '__ignore_ng_zone__');
}
function isSchedulerTick(applyArgs) {
    return hasApplyArgsData(applyArgs, '__scheduler_tick__');
}
function hasApplyArgsData(applyArgs, key) {
    if (!Array.isArray(applyArgs)) {
        return false;
    }
    // We should only ever get 1 arg passed through to invokeTask.
    // Short circuit here incase that behavior changes.
    if (applyArgs.length !== 1) {
        return false;
    }
    return applyArgs[0]?.data?.[key] === true;
}
export function getNgZone(ngZoneToUse = 'zone.js', options) {
    if (ngZoneToUse === 'noop') {
        return new NoopNgZone();
    }
    if (ngZoneToUse === 'zone.js') {
        return new NgZone(options);
    }
    return ngZoneToUse;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfem9uZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL3pvbmUvbmdfem9uZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsNkJBQTZCLEVBQUMsTUFBTSxzQ0FBc0MsQ0FBQztBQUNuRixPQUFPLEVBQUMsWUFBWSxFQUFtQixNQUFNLFdBQVcsQ0FBQztBQUN6RCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFDOUMsT0FBTyxFQUFDLDJCQUEyQixFQUFDLE1BQU0sNEJBQTRCLENBQUM7QUFDdkUsT0FBTyxFQUFDLElBQUksRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUVsQyxPQUFPLEVBQUMseUJBQXlCLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQU1oRSxNQUFNLHFCQUFxQixHQUFHLGVBQWUsQ0FBQztBQUM5QyxNQUFNLENBQUMsTUFBTSw2QkFBNkIsR0FBRyxxQkFBcUIsR0FBRyxLQUFLLENBQUM7QUFFM0UsSUFBSSxnQkFBZ0IsR0FBRyxDQUFDLENBQUM7QUFFekI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F5RUc7QUFDSCxNQUFNLE9BQU8sTUFBTTtJQWlDakIsWUFBWSxPQUlYO1FBcENRLHlCQUFvQixHQUFZLEtBQUssQ0FBQztRQUN0Qyx5QkFBb0IsR0FBWSxLQUFLLENBQUM7UUFFL0M7O1dBRUc7UUFDTSxhQUFRLEdBQVksSUFBSSxDQUFDO1FBRWxDOztXQUVHO1FBQ00sZUFBVSxHQUFzQixJQUFJLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUVqRTs7OztXQUlHO1FBQ00scUJBQWdCLEdBQXNCLElBQUksWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRXZFOzs7O1dBSUc7UUFDTSxhQUFRLEdBQXNC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SSxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDN0IsQ0FBQztJQUNELE9BQU8sV0FBVyxDQUFDO0FBQ3JCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCB7U0NIRURVTEVfSU5fUk9PVF9aT05FX0RFRkFVTFR9IGZyb20gJy4uL2NoYW5nZV9kZXRlY3Rpb24vc2NoZWR1bGluZy9mbGFncyc7XG5pbXBvcnQge1J1bnRpbWVFcnJvciwgUnVudGltZUVycm9yQ29kZX0gZnJvbSAnLi4vZXJyb3JzJztcbmltcG9ydCB7RXZlbnRFbWl0dGVyfSBmcm9tICcuLi9ldmVudF9lbWl0dGVyJztcbmltcG9ydCB7c2NoZWR1bGVDYWxsYmFja1dpdGhSYWZSYWNlfSBmcm9tICcuLi91dGlsL2NhbGxiYWNrX3NjaGVkdWxlcic7XG5pbXBvcnQge25vb3B9IGZyb20gJy4uL3V0aWwvbm9vcCc7XG5cbmltcG9ydCB7QXN5bmNTdGFja1RhZ2dpbmdab25lU3BlY30gZnJvbSAnLi9hc3luYy1zdGFjay10YWdnaW5nJztcblxuLy8gVGhlIGJlbG93IGlzIG5lZWRlZCBhcyBvdGhlcndpc2UgYSBudW1iZXIgb2YgdGFyZ2V0cyBmYWlsIGluIEczIGR1ZSB0bzpcbi8vIEVSUk9SIC0gW0pTQ19VTkRFRklORURfVkFSSUFCTEVdIHZhcmlhYmxlIFpvbmUgaXMgdW5kZWNsYXJlZFxuZGVjbGFyZSBjb25zdCBab25lOiBhbnk7XG5cbmNvbnN0IGlzQW5ndWxhclpvbmVQcm9wZXJ0eSA9ICdpc0FuZ3VsYXJab25lJztcbmV4cG9ydCBjb25zdCBhbmd1bGFyWm9uZUluc3RhbmNlSWRQcm9wZXJ0eSA9IGlzQW5ndWxhclpvbmVQcm9wZXJ0eSArICdfSUQnO1xuXG5sZXQgbmdab25lSW5zdGFuY2VJZCA9IDA7XG5cbi8qKlxuICogQW4gaW5qZWN0YWJsZSBzZXJ2aWNlIGZvciBleGVjdXRpbmcgd29yayBpbnNpZGUgb3Igb3V0c2lkZSBvZiB0aGUgQW5ndWxhciB6b25lLlxuICpcbiAqIFRoZSBtb3N0IGNvbW1vbiB1c2Ugb2YgdGhpcyBzZXJ2aWNlIGlzIHRvIG9wdGltaXplIHBlcmZvcm1hbmNlIHdoZW4gc3RhcnRpbmcgYSB3b3JrIGNvbnNpc3Rpbmcgb2ZcbiAqIG9uZSBvciBtb3JlIGFzeW5jaHJvbm91cyB0YXNrcyB0aGF0IGRvbid0IHJlcXVpcmUgVUkgdXBkYXRlcyBvciBlcnJvciBoYW5kbGluZyB0byBiZSBoYW5kbGVkIGJ5XG4gKiBBbmd1bGFyLiBTdWNoIHRhc2tzIGNhbiBiZSBraWNrZWQgb2ZmIHZpYSB7QGxpbmsgI3J1bk91dHNpZGVBbmd1bGFyfSBhbmQgaWYgbmVlZGVkLCB0aGVzZSB0YXNrc1xuICogY2FuIHJlZW50ZXIgdGhlIEFuZ3VsYXIgem9uZSB2aWEge0BsaW5rICNydW59LlxuICpcbiAqIDwhLS0gVE9ETzogYWRkL2ZpeCBsaW5rcyB0bzpcbiAqICAgLSBkb2NzIGV4cGxhaW5pbmcgem9uZXMgYW5kIHRoZSB1c2Ugb2Ygem9uZXMgaW4gQW5ndWxhciBhbmQgY2hhbmdlLWRldGVjdGlvblxuICogICAtIGxpbmsgdG8gcnVuT3V0c2lkZUFuZ3VsYXIvcnVuICh0aHJvdWdob3V0IHRoaXMgZmlsZSEpXG4gKiAgIC0tPlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYFxuICogaW1wb3J0IHtDb21wb25lbnQsIE5nWm9uZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG4gKiBpbXBvcnQge05nSWZ9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnbmctem9uZS1kZW1vJyxcbiAqICAgdGVtcGxhdGU6IGBcbiAqICAgICA8aDI+RGVtbzogTmdab25lPC9oMj5cbiAqXG4gKiAgICAgPHA+UHJvZ3Jlc3M6IHt7cHJvZ3Jlc3N9fSU8L3A+XG4gKiAgICAgPHAgKm5nSWY9XCJwcm9ncmVzcyA+PSAxMDBcIj5Eb25lIHByb2Nlc3Npbmcge3tsYWJlbH19IG9mIEFuZ3VsYXIgem9uZSE8L3A+XG4gKlxuICogICAgIDxidXR0b24gKGNsaWNrKT1cInByb2Nlc3NXaXRoaW5Bbmd1bGFyWm9uZSgpXCI+UHJvY2VzcyB3aXRoaW4gQW5ndWxhciB6b25lPC9idXR0b24+XG4gKiAgICAgPGJ1dHRvbiAoY2xpY2spPVwicHJvY2Vzc091dHNpZGVPZkFuZ3VsYXJab25lKClcIj5Qcm9jZXNzIG91dHNpZGUgb2YgQW5ndWxhciB6b25lPC9idXR0b24+XG4gKiAgIGAsXG4gKiB9KVxuICogZXhwb3J0IGNsYXNzIE5nWm9uZURlbW8ge1xuICogICBwcm9ncmVzczogbnVtYmVyID0gMDtcbiAqICAgbGFiZWw6IHN0cmluZztcbiAqXG4gKiAgIGNvbnN0cnVjdG9yKHByaXZhdGUgX25nWm9uZTogTmdab25lKSB7fVxuICpcbiAqICAgLy8gTG9vcCBpbnNpZGUgdGhlIEFuZ3VsYXIgem9uZVxuICogICAvLyBzbyB0aGUgVUkgRE9FUyByZWZyZXNoIGFmdGVyIGVhY2ggc2V0VGltZW91dCBjeWNsZVxuICogICBwcm9jZXNzV2l0aGluQW5ndWxhclpvbmUoKSB7XG4gKiAgICAgdGhpcy5sYWJlbCA9ICdpbnNpZGUnO1xuICogICAgIHRoaXMucHJvZ3Jlc3MgPSAwO1xuICogICAgIHRoaXMuX2luY3JlYXNlUHJvZ3Jlc3MoKCkgPT4gY29uc29sZS5sb2coJ0luc2lkZSBEb25lIScpKTtcbiAqICAgfVxuICpcbiAqICAgLy8gTG9vcCBvdXRzaWRlIG9mIHRoZSBBbmd1bGFyIHpvbmVcbiAqICAgLy8gc28gdGhlIFVJIERPRVMgTk9UIHJlZnJlc2ggYWZ0ZXIgZWFjaCBzZXRUaW1lb3V0IGN5Y2xlXG4gKiAgIHByb2Nlc3NPdXRzaWRlT2ZBbmd1bGFyWm9uZSgpIHtcbiAqICAgICB0aGlzLmxhYmVsID0gJ291dHNpZGUnO1xuICogICAgIHRoaXMucHJvZ3Jlc3MgPSAwO1xuICogICAgIHRoaXMuX25nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gKiAgICAgICB0aGlzLl9pbmNyZWFzZVByb2dyZXNzKCgpID0+IHtcbiAqICAgICAgICAgLy8gcmVlbnRlciB0aGUgQW5ndWxhciB6b25lIGFuZCBkaXNwbGF5IGRvbmVcbiAqICAgICAgICAgdGhpcy5fbmdab25lLnJ1bigoKSA9PiB7IGNvbnNvbGUubG9nKCdPdXRzaWRlIERvbmUhJyk7IH0pO1xuICogICAgICAgfSk7XG4gKiAgICAgfSk7XG4gKiAgIH1cbiAqXG4gKiAgIF9pbmNyZWFzZVByb2dyZXNzKGRvbmVDYWxsYmFjazogKCkgPT4gdm9pZCkge1xuICogICAgIHRoaXMucHJvZ3Jlc3MgKz0gMTtcbiAqICAgICBjb25zb2xlLmxvZyhgQ3VycmVudCBwcm9ncmVzczogJHt0aGlzLnByb2dyZXNzfSVgKTtcbiAqXG4gKiAgICAgaWYgKHRoaXMucHJvZ3Jlc3MgPCAxMDApIHtcbiAqICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHRoaXMuX2luY3JlYXNlUHJvZ3Jlc3MoZG9uZUNhbGxiYWNrKSwgMTApO1xuICogICAgIH0gZWxzZSB7XG4gKiAgICAgICBkb25lQ2FsbGJhY2soKTtcbiAqICAgICB9XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIE5nWm9uZSB7XG4gIHJlYWRvbmx5IGhhc1BlbmRpbmdNYWNyb3Rhc2tzOiBib29sZWFuID0gZmFsc2U7XG4gIHJlYWRvbmx5IGhhc1BlbmRpbmdNaWNyb3Rhc2tzOiBib29sZWFuID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlcmUgYXJlIG5vIG91dHN0YW5kaW5nIG1pY3JvdGFza3Mgb3IgbWFjcm90YXNrcy5cbiAgICovXG4gIHJlYWRvbmx5IGlzU3RhYmxlOiBib29sZWFuID0gdHJ1ZTtcblxuICAvKipcbiAgICogTm90aWZpZXMgd2hlbiBjb2RlIGVudGVycyBBbmd1bGFyIFpvbmUuIFRoaXMgZ2V0cyBmaXJlZCBmaXJzdCBvbiBWTSBUdXJuLlxuICAgKi9cbiAgcmVhZG9ubHkgb25VbnN0YWJsZTogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKGZhbHNlKTtcblxuICAvKipcbiAgICogTm90aWZpZXMgd2hlbiB0aGVyZSBpcyBubyBtb3JlIG1pY3JvdGFza3MgZW5xdWV1ZWQgaW4gdGhlIGN1cnJlbnQgVk0gVHVybi5cbiAgICogVGhpcyBpcyBhIGhpbnQgZm9yIEFuZ3VsYXIgdG8gZG8gY2hhbmdlIGRldGVjdGlvbiwgd2hpY2ggbWF5IGVucXVldWUgbW9yZSBtaWNyb3Rhc2tzLlxuICAgKiBGb3IgdGhpcyByZWFzb24gdGhpcyBldmVudCBjYW4gZmlyZSBtdWx0aXBsZSB0aW1lcyBwZXIgVk0gVHVybi5cbiAgICovXG4gIHJlYWRvbmx5IG9uTWljcm90YXNrRW1wdHk6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcihmYWxzZSk7XG5cbiAgLyoqXG4gICAqIE5vdGlmaWVzIHdoZW4gdGhlIGxhc3QgYG9uTWljcm90YXNrRW1wdHlgIGhhcyBydW4gYW5kIHRoZXJlIGFyZSBubyBtb3JlIG1pY3JvdGFza3MsIHdoaWNoXG4gICAqIGltcGxpZXMgd2UgYXJlIGFib3V0IHRvIHJlbGlucXVpc2ggVk0gdHVybi5cbiAgICogVGhpcyBldmVudCBnZXRzIGNhbGxlZCBqdXN0IG9uY2UuXG4gICAqL1xuICByZWFkb25seSBvblN0YWJsZTogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKGZhbHNlKTtcblxuICAvKipcbiAgICogTm90aWZpZXMgdGhhdCBhbiBlcnJvciBoYXMgYmVlbiBkZWxpdmVyZWQuXG4gICAqL1xuICByZWFkb25seSBvbkVycm9yOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoZmFsc2UpO1xuXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnM6IHtcbiAgICBlbmFibGVMb25nU3RhY2tUcmFjZT86IGJvb2xlYW47XG4gICAgc2hvdWxkQ29hbGVzY2VFdmVudENoYW5nZURldGVjdGlvbj86IGJvb2xlYW47XG4gICAgc2hvdWxkQ29hbGVzY2VSdW5DaGFuZ2VEZXRlY3Rpb24/OiBib29sZWFuO1xuICB9KSB7XG4gICAgY29uc3Qge1xuICAgICAgZW5hYmxlTG9uZ1N0YWNrVHJhY2UgPSBmYWxzZSxcbiAgICAgIHNob3VsZENvYWxlc2NlRXZlbnRDaGFuZ2VEZXRlY3Rpb24gPSBmYWxzZSxcbiAgICAgIHNob3VsZENvYWxlc2NlUnVuQ2hhbmdlRGV0ZWN0aW9uID0gZmFsc2UsXG4gICAgICBzY2hlZHVsZUluUm9vdFpvbmUgPSBTQ0hFRFVMRV9JTl9ST09UX1pPTkVfREVGQVVMVCxcbiAgICB9ID0gb3B0aW9ucyBhcyBJbnRlcm5hbE5nWm9uZU9wdGlvbnM7XG5cbiAgICBpZiAodHlwZW9mIFpvbmUgPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuTUlTU0lOR19aT05FSlMsXG4gICAgICAgIG5nRGV2TW9kZSAmJiBgSW4gdGhpcyBjb25maWd1cmF0aW9uIEFuZ3VsYXIgcmVxdWlyZXMgWm9uZS5qc2AsXG4gICAgICApO1xuICAgIH1cblxuICAgIFpvbmUuYXNzZXJ0Wm9uZVBhdGNoZWQoKTtcbiAgICBjb25zdCBzZWxmID0gdGhpcyBhcyBhbnkgYXMgTmdab25lUHJpdmF0ZTtcbiAgICBzZWxmLl9uZXN0aW5nID0gMDtcblxuICAgIHNlbGYuX291dGVyID0gc2VsZi5faW5uZXIgPSBab25lLmN1cnJlbnQ7XG5cbiAgICAvLyBBc3luY1N0YWNrVGFnZ2luZ1pvbmVTcGVjIHByb3ZpZGVzIGBsaW5rZWQgc3RhY2sgdHJhY2VzYCB0byBzaG93XG4gICAgLy8gd2hlcmUgdGhlIGFzeW5jIG9wZXJhdGlvbiBpcyBzY2hlZHVsZWQuIEZvciBtb3JlIGRldGFpbHMsIHJlZmVyXG4gICAgLy8gdG8gdGhpcyBhcnRpY2xlLCBodHRwczovL2RldmVsb3Blci5jaHJvbWUuY29tL2Jsb2cvZGV2dG9vbHMtYmV0dGVyLWFuZ3VsYXItZGVidWdnaW5nL1xuICAgIC8vIEFuZCB3ZSBvbmx5IGltcG9ydCB0aGlzIEFzeW5jU3RhY2tUYWdnaW5nWm9uZVNwZWMgaW4gZGV2ZWxvcG1lbnQgbW9kZSxcbiAgICAvLyBpbiB0aGUgcHJvZHVjdGlvbiBtb2RlLCB0aGUgQXN5bmNTdGFja1RhZ2dpbmdab25lU3BlYyB3aWxsIGJlIHRyZWUgc2hha2VuIGF3YXkuXG4gICAgaWYgKG5nRGV2TW9kZSkge1xuICAgICAgc2VsZi5faW5uZXIgPSBzZWxmLl9pbm5lci5mb3JrKG5ldyBBc3luY1N0YWNrVGFnZ2luZ1pvbmVTcGVjKCdBbmd1bGFyJykpO1xuICAgIH1cblxuICAgIGlmICgoWm9uZSBhcyBhbnkpWydUYXNrVHJhY2tpbmdab25lU3BlYyddKSB7XG4gICAgICBzZWxmLl9pbm5lciA9IHNlbGYuX2lubmVyLmZvcmsobmV3ICgoWm9uZSBhcyBhbnkpWydUYXNrVHJhY2tpbmdab25lU3BlYyddIGFzIGFueSkoKSk7XG4gICAgfVxuXG4gICAgaWYgKGVuYWJsZUxvbmdTdGFja1RyYWNlICYmIChab25lIGFzIGFueSlbJ2xvbmdTdGFja1RyYWNlWm9uZVNwZWMnXSkge1xuICAgICAgc2VsZi5faW5uZXIgPSBzZWxmLl9pbm5lci5mb3JrKChab25lIGFzIGFueSlbJ2xvbmdTdGFja1RyYWNlWm9uZVNwZWMnXSk7XG4gICAgfVxuICAgIC8vIGlmIHNob3VsZENvYWxlc2NlUnVuQ2hhbmdlRGV0ZWN0aW9uIGlzIHRydWUsIGFsbCB0YXNrcyBpbmNsdWRpbmcgZXZlbnQgdGFza3Mgd2lsbCBiZVxuICAgIC8vIGNvYWxlc2NlZCwgc28gc2hvdWxkQ29hbGVzY2VFdmVudENoYW5nZURldGVjdGlvbiBvcHRpb24gaXMgbm90IG5lY2Vzc2FyeSBhbmQgY2FuIGJlIHNraXBwZWQuXG4gICAgc2VsZi5zaG91bGRDb2FsZXNjZUV2ZW50Q2hhbmdlRGV0ZWN0aW9uID1cbiAgICAgICFzaG91bGRDb2FsZXNjZVJ1bkNoYW5nZURldGVjdGlvbiAmJiBzaG91bGRDb2FsZXNjZUV2ZW50Q2hhbmdlRGV0ZWN0aW9uO1xuICAgIHNlbGYuc2hvdWxkQ29hbGVzY2VSdW5DaGFuZ2VEZXRlY3Rpb24gPSBzaG91bGRDb2FsZXNjZVJ1bkNoYW5nZURldGVjdGlvbjtcbiAgICBzZWxmLmNhbGxiYWNrU2NoZWR1bGVkID0gZmFsc2U7XG4gICAgc2VsZi5zY2hlZHVsZUluUm9vdFpvbmUgPSBzY2hlZHVsZUluUm9vdFpvbmU7XG4gICAgZm9ya0lubmVyWm9uZVdpdGhBbmd1bGFyQmVoYXZpb3Ioc2VsZik7XG4gIH1cblxuICAvKipcbiAgICBUaGlzIG1ldGhvZCBjaGVja3Mgd2hldGhlciB0aGUgbWV0aG9kIGNhbGwgaGFwcGVucyB3aXRoaW4gYW4gQW5ndWxhciBab25lIGluc3RhbmNlLlxuICAqL1xuICBzdGF0aWMgaXNJbkFuZ3VsYXJab25lKCk6IGJvb2xlYW4ge1xuICAgIC8vIFpvbmUgbmVlZHMgdG8gYmUgY2hlY2tlZCwgYmVjYXVzZSB0aGlzIG1ldGhvZCBtaWdodCBiZSBjYWxsZWQgZXZlbiB3aGVuIE5vb3BOZ1pvbmUgaXMgdXNlZC5cbiAgICByZXR1cm4gdHlwZW9mIFpvbmUgIT09ICd1bmRlZmluZWQnICYmIFpvbmUuY3VycmVudC5nZXQoaXNBbmd1bGFyWm9uZVByb3BlcnR5KSA9PT0gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgIEFzc3VyZXMgdGhhdCB0aGUgbWV0aG9kIGlzIGNhbGxlZCB3aXRoaW4gdGhlIEFuZ3VsYXIgWm9uZSwgb3RoZXJ3aXNlIHRocm93cyBhbiBlcnJvci5cbiAgKi9cbiAgc3RhdGljIGFzc2VydEluQW5ndWxhclpvbmUoKTogdm9pZCB7XG4gICAgaWYgKCFOZ1pvbmUuaXNJbkFuZ3VsYXJab25lKCkpIHtcbiAgICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuVU5FWFBFQ1RFRF9aT05FX1NUQVRFLFxuICAgICAgICBuZ0Rldk1vZGUgJiYgJ0V4cGVjdGVkIHRvIGJlIGluIEFuZ3VsYXIgWm9uZSwgYnV0IGl0IGlzIG5vdCEnLFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICBBc3N1cmVzIHRoYXQgdGhlIG1ldGhvZCBpcyBjYWxsZWQgb3V0c2lkZSBvZiB0aGUgQW5ndWxhciBab25lLCBvdGhlcndpc2UgdGhyb3dzIGFuIGVycm9yLlxuICAqL1xuICBzdGF0aWMgYXNzZXJ0Tm90SW5Bbmd1bGFyWm9uZSgpOiB2b2lkIHtcbiAgICBpZiAoTmdab25lLmlzSW5Bbmd1bGFyWm9uZSgpKSB7XG4gICAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLlVORVhQRUNURURfWk9ORV9TVEFURSxcbiAgICAgICAgbmdEZXZNb2RlICYmICdFeHBlY3RlZCB0byBub3QgYmUgaW4gQW5ndWxhciBab25lLCBidXQgaXQgaXMhJyxcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEV4ZWN1dGVzIHRoZSBgZm5gIGZ1bmN0aW9uIHN5bmNocm9ub3VzbHkgd2l0aGluIHRoZSBBbmd1bGFyIHpvbmUgYW5kIHJldHVybnMgdmFsdWUgcmV0dXJuZWQgYnlcbiAgICogdGhlIGZ1bmN0aW9uLlxuICAgKlxuICAgKiBSdW5uaW5nIGZ1bmN0aW9ucyB2aWEgYHJ1bmAgYWxsb3dzIHlvdSB0byByZWVudGVyIEFuZ3VsYXIgem9uZSBmcm9tIGEgdGFzayB0aGF0IHdhcyBleGVjdXRlZFxuICAgKiBvdXRzaWRlIG9mIHRoZSBBbmd1bGFyIHpvbmUgKHR5cGljYWxseSBzdGFydGVkIHZpYSB7QGxpbmsgI3J1bk91dHNpZGVBbmd1bGFyfSkuXG4gICAqXG4gICAqIEFueSBmdXR1cmUgdGFza3Mgb3IgbWljcm90YXNrcyBzY2hlZHVsZWQgZnJvbSB3aXRoaW4gdGhpcyBmdW5jdGlvbiB3aWxsIGNvbnRpbnVlIGV4ZWN1dGluZyBmcm9tXG4gICAqIHdpdGhpbiB0aGUgQW5ndWxhciB6b25lLlxuICAgKlxuICAgKiBJZiBhIHN5bmNocm9ub3VzIGVycm9yIGhhcHBlbnMgaXQgd2lsbCBiZSByZXRocm93biBhbmQgbm90IHJlcG9ydGVkIHZpYSBgb25FcnJvcmAuXG4gICAqL1xuICBydW48VD4oZm46ICguLi5hcmdzOiBhbnlbXSkgPT4gVCwgYXBwbHlUaGlzPzogYW55LCBhcHBseUFyZ3M/OiBhbnlbXSk6IFQge1xuICAgIHJldHVybiAodGhpcyBhcyBhbnkgYXMgTmdab25lUHJpdmF0ZSkuX2lubmVyLnJ1bihmbiwgYXBwbHlUaGlzLCBhcHBseUFyZ3MpO1xuICB9XG5cbiAgLyoqXG4gICAqIEV4ZWN1dGVzIHRoZSBgZm5gIGZ1bmN0aW9uIHN5bmNocm9ub3VzbHkgd2l0aGluIHRoZSBBbmd1bGFyIHpvbmUgYXMgYSB0YXNrIGFuZCByZXR1cm5zIHZhbHVlXG4gICAqIHJldHVybmVkIGJ5IHRoZSBmdW5jdGlvbi5cbiAgICpcbiAgICogUnVubmluZyBmdW5jdGlvbnMgdmlhIGBydW5gIGFsbG93cyB5b3UgdG8gcmVlbnRlciBBbmd1bGFyIHpvbmUgZnJvbSBhIHRhc2sgdGhhdCB3YXMgZXhlY3V0ZWRcbiAgICogb3V0c2lkZSBvZiB0aGUgQW5ndWxhciB6b25lICh0eXBpY2FsbHkgc3RhcnRlZCB2aWEge0BsaW5rICNydW5PdXRzaWRlQW5ndWxhcn0pLlxuICAgKlxuICAgKiBBbnkgZnV0dXJlIHRhc2tzIG9yIG1pY3JvdGFza3Mgc2NoZWR1bGVkIGZyb20gd2l0aGluIHRoaXMgZnVuY3Rpb24gd2lsbCBjb250aW51ZSBleGVjdXRpbmcgZnJvbVxuICAgKiB3aXRoaW4gdGhlIEFuZ3VsYXIgem9uZS5cbiAgICpcbiAgICogSWYgYSBzeW5jaHJvbm91cyBlcnJvciBoYXBwZW5zIGl0IHdpbGwgYmUgcmV0aHJvd24gYW5kIG5vdCByZXBvcnRlZCB2aWEgYG9uRXJyb3JgLlxuICAgKi9cbiAgcnVuVGFzazxUPihmbjogKC4uLmFyZ3M6IGFueVtdKSA9PiBULCBhcHBseVRoaXM/OiBhbnksIGFwcGx5QXJncz86IGFueVtdLCBuYW1lPzogc3RyaW5nKTogVCB7XG4gICAgY29uc3Qgem9uZSA9ICh0aGlzIGFzIGFueSBhcyBOZ1pvbmVQcml2YXRlKS5faW5uZXI7XG4gICAgY29uc3QgdGFzayA9IHpvbmUuc2NoZWR1bGVFdmVudFRhc2soJ05nWm9uZUV2ZW50OiAnICsgbmFtZSwgZm4sIEVNUFRZX1BBWUxPQUQsIG5vb3AsIG5vb3ApO1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gem9uZS5ydW5UYXNrKHRhc2ssIGFwcGx5VGhpcywgYXBwbHlBcmdzKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgem9uZS5jYW5jZWxUYXNrKHRhc2spO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTYW1lIGFzIGBydW5gLCBleGNlcHQgdGhhdCBzeW5jaHJvbm91cyBlcnJvcnMgYXJlIGNhdWdodCBhbmQgZm9yd2FyZGVkIHZpYSBgb25FcnJvcmAgYW5kIG5vdFxuICAgKiByZXRocm93bi5cbiAgICovXG4gIHJ1bkd1YXJkZWQ8VD4oZm46ICguLi5hcmdzOiBhbnlbXSkgPT4gVCwgYXBwbHlUaGlzPzogYW55LCBhcHBseUFyZ3M/OiBhbnlbXSk6IFQge1xuICAgIHJldHVybiAodGhpcyBhcyBhbnkgYXMgTmdab25lUHJpdmF0ZSkuX2lubmVyLnJ1bkd1YXJkZWQoZm4sIGFwcGx5VGhpcywgYXBwbHlBcmdzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFeGVjdXRlcyB0aGUgYGZuYCBmdW5jdGlvbiBzeW5jaHJvbm91c2x5IGluIEFuZ3VsYXIncyBwYXJlbnQgem9uZSBhbmQgcmV0dXJucyB2YWx1ZSByZXR1cm5lZCBieVxuICAgKiB0aGUgZnVuY3Rpb24uXG4gICAqXG4gICAqIFJ1bm5pbmcgZnVuY3Rpb25zIHZpYSB7QGxpbmsgI3J1bk91dHNpZGVBbmd1bGFyfSBhbGxvd3MgeW91IHRvIGVzY2FwZSBBbmd1bGFyJ3Mgem9uZSBhbmQgZG9cbiAgICogd29yayB0aGF0XG4gICAqIGRvZXNuJ3QgdHJpZ2dlciBBbmd1bGFyIGNoYW5nZS1kZXRlY3Rpb24gb3IgaXMgc3ViamVjdCB0byBBbmd1bGFyJ3MgZXJyb3IgaGFuZGxpbmcuXG4gICAqXG4gICAqIEFueSBmdXR1cmUgdGFza3Mgb3IgbWljcm90YXNrcyBzY2hlZHVsZWQgZnJvbSB3aXRoaW4gdGhpcyBmdW5jdGlvbiB3aWxsIGNvbnRpbnVlIGV4ZWN1dGluZyBmcm9tXG4gICAqIG91dHNpZGUgb2YgdGhlIEFuZ3VsYXIgem9uZS5cbiAgICpcbiAgICogVXNlIHtAbGluayAjcnVufSB0byByZWVudGVyIHRoZSBBbmd1bGFyIHpvbmUgYW5kIGRvIHdvcmsgdGhhdCB1cGRhdGVzIHRoZSBhcHBsaWNhdGlvbiBtb2RlbC5cbiAgICovXG4gIHJ1bk91dHNpZGVBbmd1bGFyPFQ+KGZuOiAoLi4uYXJnczogYW55W10pID0+IFQpOiBUIHtcbiAgICByZXR1cm4gKHRoaXMgYXMgYW55IGFzIE5nWm9uZVByaXZhdGUpLl9vdXRlci5ydW4oZm4pO1xuICB9XG59XG5cbmNvbnN0IEVNUFRZX1BBWUxPQUQgPSB7fTtcblxuZXhwb3J0IGludGVyZmFjZSBOZ1pvbmVQcml2YXRlIGV4dGVuZHMgTmdab25lIHtcbiAgX291dGVyOiBab25lO1xuICBfaW5uZXI6IFpvbmU7XG4gIF9uZXN0aW5nOiBudW1iZXI7XG4gIF9oYXNQZW5kaW5nTWljcm90YXNrczogYm9vbGVhbjtcblxuICBoYXNQZW5kaW5nTWFjcm90YXNrczogYm9vbGVhbjtcbiAgaGFzUGVuZGluZ01pY3JvdGFza3M6IGJvb2xlYW47XG4gIGNhbGxiYWNrU2NoZWR1bGVkOiBib29sZWFuO1xuICAvKipcbiAgICogQSBmbGFnIHRvIGluZGljYXRlIGlmIE5nWm9uZSBpcyBjdXJyZW50bHkgaW5zaWRlXG4gICAqIGNoZWNrU3RhYmxlIGFuZCB0byBwcmV2ZW50IHJlLWVudHJ5LiBUaGUgZmxhZyBpc1xuICAgKiBuZWVkZWQgYmVjYXVzZSBpdCBpcyBwb3NzaWJsZSB0byBpbnZva2UgdGhlIGNoYW5nZVxuICAgKiBkZXRlY3Rpb24gZnJvbSB3aXRoaW4gY2hhbmdlIGRldGVjdGlvbiBsZWFkaW5nIHRvXG4gICAqIGluY29ycmVjdCBiZWhhdmlvci5cbiAgICpcbiAgICogRm9yIGRldGFpbCwgcGxlYXNlIHJlZmVyIGhlcmUsXG4gICAqIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvcHVsbC80MDU0MFxuICAgKi9cbiAgaXNDaGVja1N0YWJsZVJ1bm5pbmc6IGJvb2xlYW47XG4gIGlzU3RhYmxlOiBib29sZWFuO1xuICAvKipcbiAgICogT3B0aW9uYWxseSBzcGVjaWZ5IGNvYWxlc2NpbmcgZXZlbnQgY2hhbmdlIGRldGVjdGlvbnMgb3Igbm90LlxuICAgKiBDb25zaWRlciB0aGUgZm9sbG93aW5nIGNhc2UuXG4gICAqXG4gICAqIDxkaXYgKGNsaWNrKT1cImRvU29tZXRoaW5nKClcIj5cbiAgICogICA8YnV0dG9uIChjbGljayk9XCJkb1NvbWV0aGluZ0Vsc2UoKVwiPjwvYnV0dG9uPlxuICAgKiA8L2Rpdj5cbiAgICpcbiAgICogV2hlbiBidXR0b24gaXMgY2xpY2tlZCwgYmVjYXVzZSBvZiB0aGUgZXZlbnQgYnViYmxpbmcsIGJvdGhcbiAgICogZXZlbnQgaGFuZGxlcnMgd2lsbCBiZSBjYWxsZWQgYW5kIDIgY2hhbmdlIGRldGVjdGlvbnMgd2lsbCBiZVxuICAgKiB0cmlnZ2VyZWQuIFdlIGNhbiBjb2FsZXNjZSBzdWNoIGtpbmQgb2YgZXZlbnRzIHRvIHRyaWdnZXJcbiAgICogY2hhbmdlIGRldGVjdGlvbiBvbmx5IG9uY2UuXG4gICAqXG4gICAqIEJ5IGRlZmF1bHQsIHRoaXMgb3B0aW9uIHdpbGwgYmUgZmFsc2UuIFNvIHRoZSBldmVudHMgd2lsbCBub3QgYmVcbiAgICogY29hbGVzY2VkIGFuZCB0aGUgY2hhbmdlIGRldGVjdGlvbiB3aWxsIGJlIHRyaWdnZXJlZCBtdWx0aXBsZSB0aW1lcy5cbiAgICogQW5kIGlmIHRoaXMgb3B0aW9uIGJlIHNldCB0byB0cnVlLCB0aGUgY2hhbmdlIGRldGVjdGlvbiB3aWxsIGJlXG4gICAqIHRyaWdnZXJlZCBhc3luYyBieSBzY2hlZHVsaW5nIGl0IGluIGFuIGFuaW1hdGlvbiBmcmFtZS4gU28gaW4gdGhlIGNhc2UgYWJvdmUsXG4gICAqIHRoZSBjaGFuZ2UgZGV0ZWN0aW9uIHdpbGwgb25seSBiZSB0cmlnZ2VkIG9uY2UuXG4gICAqL1xuICBzaG91bGRDb2FsZXNjZUV2ZW50Q2hhbmdlRGV0ZWN0aW9uOiBib29sZWFuO1xuICAvKipcbiAgICogT3B0aW9uYWxseSBzcGVjaWZ5IGlmIGBOZ1pvbmUjcnVuKClgIG1ldGhvZCBpbnZvY2F0aW9ucyBzaG91bGQgYmUgY29hbGVzY2VkXG4gICAqIGludG8gYSBzaW5nbGUgY2hhbmdlIGRldGVjdGlvbi5cbiAgICpcbiAgICogQ29uc2lkZXIgdGhlIGZvbGxvd2luZyBjYXNlLlxuICAgKlxuICAgKiBmb3IgKGxldCBpID0gMDsgaSA8IDEwOyBpICsrKSB7XG4gICAqICAgbmdab25lLnJ1bigoKSA9PiB7XG4gICAqICAgICAvLyBkbyBzb21ldGhpbmdcbiAgICogICB9KTtcbiAgICogfVxuICAgKlxuICAgKiBUaGlzIGNhc2UgdHJpZ2dlcnMgdGhlIGNoYW5nZSBkZXRlY3Rpb24gbXVsdGlwbGUgdGltZXMuXG4gICAqIFdpdGggbmdab25lUnVuQ29hbGVzY2luZyBvcHRpb25zLCBhbGwgY2hhbmdlIGRldGVjdGlvbnMgaW4gYW4gZXZlbnQgbG9vcHMgdHJpZ2dlciBvbmx5IG9uY2UuXG4gICAqIEluIGFkZGl0aW9uLCB0aGUgY2hhbmdlIGRldGVjdGlvbiBleGVjdXRlcyBpbiByZXF1ZXN0QW5pbWF0aW9uLlxuICAgKlxuICAgKi9cbiAgc2hvdWxkQ29hbGVzY2VSdW5DaGFuZ2VEZXRlY3Rpb246IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdG8gc2NoZWR1bGUgdGhlIGNvYWxlc2NlZCBjaGFuZ2UgZGV0ZWN0aW9uIGluIHRoZSByb290IHpvbmVcbiAgICovXG4gIHNjaGVkdWxlSW5Sb290Wm9uZTogYm9vbGVhbjtcbn1cblxuZnVuY3Rpb24gY2hlY2tTdGFibGUoem9uZTogTmdab25lUHJpdmF0ZSkge1xuICAvLyBUT0RPOiBASmlhTGlQYXNzaW9uLCBzaG91bGQgY2hlY2sgem9uZS5pc0NoZWNrU3RhYmxlUnVubmluZyB0byBwcmV2ZW50XG4gIC8vIHJlLWVudHJ5LiBUaGUgY2FzZSBpczpcbiAgLy9cbiAgLy8gQENvbXBvbmVudCh7Li4ufSlcbiAgLy8gZXhwb3J0IGNsYXNzIEFwcENvbXBvbmVudCB7XG4gIC8vIGNvbnN0cnVjdG9yKHByaXZhdGUgbmdab25lOiBOZ1pvbmUpIHtcbiAgLy8gICB0aGlzLm5nWm9uZS5vblN0YWJsZS5zdWJzY3JpYmUoKCkgPT4ge1xuICAvLyAgICAgdGhpcy5uZ1pvbmUucnVuKCgpID0+IGNvbnNvbGUubG9nKCdzdGFibGUnKTspO1xuICAvLyAgIH0pO1xuICAvLyB9XG4gIC8vXG4gIC8vIFRoZSBvblN0YWJsZSBzdWJzY3JpYmVyIHJ1biBhbm90aGVyIGZ1bmN0aW9uIGluc2lkZSBuZ1pvbmVcbiAgLy8gd2hpY2ggY2F1c2VzIGBjaGVja1N0YWJsZSgpYCByZS1lbnRyeS5cbiAgLy8gQnV0IHRoaXMgZml4IGNhdXNlcyBzb21lIGlzc3VlcyBpbiBnMywgc28gdGhpcyBmaXggd2lsbCBiZVxuICAvLyBsYXVuY2hlZCBpbiBhbm90aGVyIFBSLlxuICBpZiAoem9uZS5fbmVzdGluZyA9PSAwICYmICF6b25lLmhhc1BlbmRpbmdNaWNyb3Rhc2tzICYmICF6b25lLmlzU3RhYmxlKSB7XG4gICAgdHJ5IHtcbiAgICAgIHpvbmUuX25lc3RpbmcrKztcbiAgICAgIHpvbmUub25NaWNyb3Rhc2tFbXB0eS5lbWl0KG51bGwpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICB6b25lLl9uZXN0aW5nLS07XG4gICAgICBpZiAoIXpvbmUuaGFzUGVuZGluZ01pY3JvdGFza3MpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB6b25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHpvbmUub25TdGFibGUuZW1pdChudWxsKSk7XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgem9uZS5pc1N0YWJsZSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZGVsYXlDaGFuZ2VEZXRlY3Rpb25Gb3JFdmVudHMoem9uZTogTmdab25lUHJpdmF0ZSkge1xuICAvKipcbiAgICogV2UgYWxzbyBuZWVkIHRvIGNoZWNrIF9uZXN0aW5nIGhlcmVcbiAgICogQ29uc2lkZXIgdGhlIGZvbGxvd2luZyBjYXNlIHdpdGggc2hvdWxkQ29hbGVzY2VSdW5DaGFuZ2VEZXRlY3Rpb24gPSB0cnVlXG4gICAqXG4gICAqIG5nWm9uZS5ydW4oKCkgPT4ge30pO1xuICAgKiBuZ1pvbmUucnVuKCgpID0+IHt9KTtcbiAgICpcbiAgICogV2Ugd2FudCB0aGUgdHdvIGBuZ1pvbmUucnVuKClgIG9ubHkgdHJpZ2dlciBvbmUgY2hhbmdlIGRldGVjdGlvblxuICAgKiB3aGVuIHNob3VsZENvYWxlc2NlUnVuQ2hhbmdlRGV0ZWN0aW9uIGlzIHRydWUuXG4gICAqIEFuZCBiZWNhdXNlIGluIHRoaXMgY2FzZSwgY2hhbmdlIGRldGVjdGlvbiBydW4gaW4gYXN5bmMgd2F5KHJlcXVlc3RBbmltYXRpb25GcmFtZSksXG4gICAqIHNvIHdlIGFsc28gbmVlZCB0byBjaGVjayB0aGUgX25lc3RpbmcgaGVyZSB0byBwcmV2ZW50IG11bHRpcGxlXG4gICAqIGNoYW5nZSBkZXRlY3Rpb25zLlxuICAgKi9cbiAgaWYgKHpvbmUuaXNDaGVja1N0YWJsZVJ1bm5pbmcgfHwgem9uZS5jYWxsYmFja1NjaGVkdWxlZCkge1xuICAgIHJldHVybjtcbiAgfVxuICB6b25lLmNhbGxiYWNrU2NoZWR1bGVkID0gdHJ1ZTtcbiAgZnVuY3Rpb24gc2NoZWR1bGVDaGVja1N0YWJsZSgpIHtcbiAgICBzY2hlZHVsZUNhbGxiYWNrV2l0aFJhZlJhY2UoKCkgPT4ge1xuICAgICAgem9uZS5jYWxsYmFja1NjaGVkdWxlZCA9IGZhbHNlO1xuICAgICAgdXBkYXRlTWljcm9UYXNrU3RhdHVzKHpvbmUpO1xuICAgICAgem9uZS5pc0NoZWNrU3RhYmxlUnVubmluZyA9IHRydWU7XG4gICAgICBjaGVja1N0YWJsZSh6b25lKTtcbiAgICAgIHpvbmUuaXNDaGVja1N0YWJsZVJ1bm5pbmcgPSBmYWxzZTtcbiAgICB9KTtcbiAgfVxuICBpZiAoem9uZS5zY2hlZHVsZUluUm9vdFpvbmUpIHtcbiAgICBab25lLnJvb3QucnVuKCgpID0+IHtcbiAgICAgIHNjaGVkdWxlQ2hlY2tTdGFibGUoKTtcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICB6b25lLl9vdXRlci5ydW4oKCkgPT4ge1xuICAgICAgc2NoZWR1bGVDaGVja1N0YWJsZSgpO1xuICAgIH0pO1xuICB9XG4gIHVwZGF0ZU1pY3JvVGFza1N0YXR1cyh6b25lKTtcbn1cblxuZnVuY3Rpb24gZm9ya0lubmVyWm9uZVdpdGhBbmd1bGFyQmVoYXZpb3Ioem9uZTogTmdab25lUHJpdmF0ZSkge1xuICBjb25zdCBkZWxheUNoYW5nZURldGVjdGlvbkZvckV2ZW50c0RlbGVnYXRlID0gKCkgPT4ge1xuICAgIGRlbGF5Q2hhbmdlRGV0ZWN0aW9uRm9yRXZlbnRzKHpvbmUpO1xuICB9O1xuICBjb25zdCBpbnN0YW5jZUlkID0gbmdab25lSW5zdGFuY2VJZCsrO1xuICB6b25lLl9pbm5lciA9IHpvbmUuX2lubmVyLmZvcmsoe1xuICAgIG5hbWU6ICdhbmd1bGFyJyxcbiAgICBwcm9wZXJ0aWVzOiA8YW55PntcbiAgICAgIFtpc0FuZ3VsYXJab25lUHJvcGVydHldOiB0cnVlLFxuICAgICAgW2FuZ3VsYXJab25lSW5zdGFuY2VJZFByb3BlcnR5XTogaW5zdGFuY2VJZCxcbiAgICAgIFthbmd1bGFyWm9uZUluc3RhbmNlSWRQcm9wZXJ0eSArIGluc3RhbmNlSWRdOiB0cnVlLFxuICAgIH0sXG4gICAgb25JbnZva2VUYXNrOiAoXG4gICAgICBkZWxlZ2F0ZTogWm9uZURlbGVnYXRlLFxuICAgICAgY3VycmVudDogWm9uZSxcbiAgICAgIHRhcmdldDogWm9uZSxcbiAgICAgIHRhc2s6IFRhc2ssXG4gICAgICBhcHBseVRoaXM6IGFueSxcbiAgICAgIGFwcGx5QXJnczogYW55LFxuICAgICk6IGFueSA9PiB7XG4gICAgICAvLyBQcmV2ZW50IHRyaWdnZXJpbmcgY2hhbmdlIGRldGVjdGlvbiB3aGVuIHRoZSBmbGFnIGlzIGRldGVjdGVkLlxuICAgICAgaWYgKHNob3VsZEJlSWdub3JlZEJ5Wm9uZShhcHBseUFyZ3MpKSB7XG4gICAgICAgIHJldHVybiBkZWxlZ2F0ZS5pbnZva2VUYXNrKHRhcmdldCwgdGFzaywgYXBwbHlUaGlzLCBhcHBseUFyZ3MpO1xuICAgICAgfVxuXG4gICAgICB0cnkge1xuICAgICAgICBvbkVudGVyKHpvbmUpO1xuICAgICAgICByZXR1cm4gZGVsZWdhdGUuaW52b2tlVGFzayh0YXJnZXQsIHRhc2ssIGFwcGx5VGhpcywgYXBwbHlBcmdzKTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAoem9uZS5zaG91bGRDb2FsZXNjZUV2ZW50Q2hhbmdlRGV0ZWN0aW9uICYmIHRhc2sudHlwZSA9PT0gJ2V2ZW50VGFzaycpIHx8XG4gICAgICAgICAgem9uZS5zaG91bGRDb2FsZXNjZVJ1bkNoYW5nZURldGVjdGlvblxuICAgICAgICApIHtcbiAgICAgICAgICBkZWxheUNoYW5nZURldGVjdGlvbkZvckV2ZW50c0RlbGVnYXRlKCk7XG4gICAgICAgIH1cbiAgICAgICAgb25MZWF2ZSh6b25lKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgb25JbnZva2U6IChcbiAgICAgIGRlbGVnYXRlOiBab25lRGVsZWdhdGUsXG4gICAgICBjdXJyZW50OiBab25lLFxuICAgICAgdGFyZ2V0OiBab25lLFxuICAgICAgY2FsbGJhY2s6IEZ1bmN0aW9uLFxuICAgICAgYXBwbHlUaGlzOiBhbnksXG4gICAgICBhcHBseUFyZ3M/OiBhbnlbXSxcbiAgICAgIHNvdXJjZT86IHN0cmluZyxcbiAgICApOiBhbnkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgb25FbnRlcih6b25lKTtcbiAgICAgICAgcmV0dXJuIGRlbGVnYXRlLmludm9rZSh0YXJnZXQsIGNhbGxiYWNrLCBhcHBseVRoaXMsIGFwcGx5QXJncywgc291cmNlKTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICB6b25lLnNob3VsZENvYWxlc2NlUnVuQ2hhbmdlRGV0ZWN0aW9uICYmXG4gICAgICAgICAgLy8gRG8gbm90IGRlbGF5IGNoYW5nZSBkZXRlY3Rpb24gd2hlbiB0aGUgdGFzayBpcyB0aGUgc2NoZWR1bGVyJ3MgdGljay5cbiAgICAgICAgICAvLyBXZSBuZWVkIHRvIHN5bmNocm9ub3VzbHkgdHJpZ2dlciB0aGUgc3RhYmlsaXR5IGxvZ2ljIHNvIHRoYXQgdGhlXG4gICAgICAgICAgLy8gem9uZS1iYXNlZCBzY2hlZHVsZXIgY2FuIHByZXZlbnQgYSBkdXBsaWNhdGUgQXBwbGljYXRpb25SZWYudGlja1xuICAgICAgICAgIC8vIGJ5IGZpcnN0IGNoZWNraW5nIGlmIHRoZSBzY2hlZHVsZXIgdGljayBpcyBydW5uaW5nLiBUaGlzIGRvZXMgc2VlbSBhIGJpdCByb3VuZGFib3V0LFxuICAgICAgICAgIC8vIGJ1dCB3ZSBfZG9fIHN0aWxsIHdhbnQgdG8gdHJpZ2dlciBhbGwgdGhlIGNvcnJlY3QgZXZlbnRzIHdoZW4gd2UgZXhpdCB0aGUgem9uZS5ydW5cbiAgICAgICAgICAvLyAoYG9uTWljcm90YXNrRW1wdHlgIGFuZCBgb25TdGFibGVgIF9zaG91bGRfIGVtaXQ7IGRldmVsb3BlcnMgY2FuIGhhdmUgY29kZSB3aGljaFxuICAgICAgICAgIC8vIHJlbGllcyBvbiB0aGVzZSBldmVudHMgaGFwcGVuaW5nIGFmdGVyIGNoYW5nZSBkZXRlY3Rpb24gcnVucykuXG4gICAgICAgICAgLy8gTm90ZTogYHpvbmUuY2FsbGJhY2tTY2hlZHVsZWRgIGlzIGFscmVhZHkgaW4gZGVsYXlDaGFuZ2VEZXRlY3Rpb25Gb3JFdmVudHNEZWxlZ2F0ZVxuICAgICAgICAgIC8vIGJ1dCBpcyBhZGRlZCBoZXJlIGFzIHdlbGwgdG8gcHJldmVudCByZWFkcyBvZiBhcHBseUFyZ3Mgd2hlbiBub3QgbmVjZXNzYXJ5XG4gICAgICAgICAgIXpvbmUuY2FsbGJhY2tTY2hlZHVsZWQgJiZcbiAgICAgICAgICAhaXNTY2hlZHVsZXJUaWNrKGFwcGx5QXJncylcbiAgICAgICAgKSB7XG4gICAgICAgICAgZGVsYXlDaGFuZ2VEZXRlY3Rpb25Gb3JFdmVudHNEZWxlZ2F0ZSgpO1xuICAgICAgICB9XG4gICAgICAgIG9uTGVhdmUoem9uZSk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIG9uSGFzVGFzazogKFxuICAgICAgZGVsZWdhdGU6IFpvbmVEZWxlZ2F0ZSxcbiAgICAgIGN1cnJlbnQ6IFpvbmUsXG4gICAgICB0YXJnZXQ6IFpvbmUsXG4gICAgICBoYXNUYXNrU3RhdGU6IEhhc1Rhc2tTdGF0ZSxcbiAgICApID0+IHtcbiAgICAgIGRlbGVnYXRlLmhhc1Rhc2sodGFyZ2V0LCBoYXNUYXNrU3RhdGUpO1xuICAgICAgaWYgKGN1cnJlbnQgPT09IHRhcmdldCkge1xuICAgICAgICAvLyBXZSBhcmUgb25seSBpbnRlcmVzdGVkIGluIGhhc1Rhc2sgZXZlbnRzIHdoaWNoIG9yaWdpbmF0ZSBmcm9tIG91ciB6b25lXG4gICAgICAgIC8vIChBIGNoaWxkIGhhc1Rhc2sgZXZlbnQgaXMgbm90IGludGVyZXN0aW5nIHRvIHVzKVxuICAgICAgICBpZiAoaGFzVGFza1N0YXRlLmNoYW5nZSA9PSAnbWljcm9UYXNrJykge1xuICAgICAgICAgIHpvbmUuX2hhc1BlbmRpbmdNaWNyb3Rhc2tzID0gaGFzVGFza1N0YXRlLm1pY3JvVGFzaztcbiAgICAgICAgICB1cGRhdGVNaWNyb1Rhc2tTdGF0dXMoem9uZSk7XG4gICAgICAgICAgY2hlY2tTdGFibGUoem9uZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoaGFzVGFza1N0YXRlLmNoYW5nZSA9PSAnbWFjcm9UYXNrJykge1xuICAgICAgICAgIHpvbmUuaGFzUGVuZGluZ01hY3JvdGFza3MgPSBoYXNUYXNrU3RhdGUubWFjcm9UYXNrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIG9uSGFuZGxlRXJyb3I6IChkZWxlZ2F0ZTogWm9uZURlbGVnYXRlLCBjdXJyZW50OiBab25lLCB0YXJnZXQ6IFpvbmUsIGVycm9yOiBhbnkpOiBib29sZWFuID0+IHtcbiAgICAgIGRlbGVnYXRlLmhhbmRsZUVycm9yKHRhcmdldCwgZXJyb3IpO1xuICAgICAgem9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB6b25lLm9uRXJyb3IuZW1pdChlcnJvcikpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG4gIH0pO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVNaWNyb1Rhc2tTdGF0dXMoem9uZTogTmdab25lUHJpdmF0ZSkge1xuICBpZiAoXG4gICAgem9uZS5faGFzUGVuZGluZ01pY3JvdGFza3MgfHxcbiAgICAoKHpvbmUuc2hvdWxkQ29hbGVzY2VFdmVudENoYW5nZURldGVjdGlvbiB8fCB6b25lLnNob3VsZENvYWxlc2NlUnVuQ2hhbmdlRGV0ZWN0aW9uKSAmJlxuICAgICAgem9uZS5jYWxsYmFja1NjaGVkdWxlZCA9PT0gdHJ1ZSlcbiAgKSB7XG4gICAgem9uZS5oYXNQZW5kaW5nTWljcm90YXNrcyA9IHRydWU7XG4gIH0gZWxzZSB7XG4gICAgem9uZS5oYXNQZW5kaW5nTWljcm90YXNrcyA9IGZhbHNlO1xuICB9XG59XG5cbmZ1bmN0aW9uIG9uRW50ZXIoem9uZTogTmdab25lUHJpdmF0ZSkge1xuICB6b25lLl9uZXN0aW5nKys7XG4gIGlmICh6b25lLmlzU3RhYmxlKSB7XG4gICAgem9uZS5pc1N0YWJsZSA9IGZhbHNlO1xuICAgIHpvbmUub25VbnN0YWJsZS5lbWl0KG51bGwpO1xuICB9XG59XG5cbmZ1bmN0aW9uIG9uTGVhdmUoem9uZTogTmdab25lUHJpdmF0ZSkge1xuICB6b25lLl9uZXN0aW5nLS07XG4gIGNoZWNrU3RhYmxlKHpvbmUpO1xufVxuXG4vKipcbiAqIFByb3ZpZGVzIGEgbm9vcCBpbXBsZW1lbnRhdGlvbiBvZiBgTmdab25lYCB3aGljaCBkb2VzIG5vdGhpbmcuIFRoaXMgem9uZSByZXF1aXJlcyBleHBsaWNpdCBjYWxsc1xuICogdG8gZnJhbWV3b3JrIHRvIHBlcmZvcm0gcmVuZGVyaW5nLlxuICovXG5leHBvcnQgY2xhc3MgTm9vcE5nWm9uZSBpbXBsZW1lbnRzIE5nWm9uZSB7XG4gIHJlYWRvbmx5IGhhc1BlbmRpbmdNaWNyb3Rhc2tzID0gZmFsc2U7XG4gIHJlYWRvbmx5IGhhc1BlbmRpbmdNYWNyb3Rhc2tzID0gZmFsc2U7XG4gIHJlYWRvbmx5IGlzU3RhYmxlID0gdHJ1ZTtcbiAgcmVhZG9ubHkgb25VbnN0YWJsZSA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICByZWFkb25seSBvbk1pY3JvdGFza0VtcHR5ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gIHJlYWRvbmx5IG9uU3RhYmxlID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gIHJlYWRvbmx5IG9uRXJyb3IgPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcblxuICBydW48VD4oZm46ICguLi5hcmdzOiBhbnlbXSkgPT4gVCwgYXBwbHlUaGlzPzogYW55LCBhcHBseUFyZ3M/OiBhbnkpOiBUIHtcbiAgICByZXR1cm4gZm4uYXBwbHkoYXBwbHlUaGlzLCBhcHBseUFyZ3MpO1xuICB9XG5cbiAgcnVuR3VhcmRlZDxUPihmbjogKC4uLmFyZ3M6IGFueVtdKSA9PiBhbnksIGFwcGx5VGhpcz86IGFueSwgYXBwbHlBcmdzPzogYW55KTogVCB7XG4gICAgcmV0dXJuIGZuLmFwcGx5KGFwcGx5VGhpcywgYXBwbHlBcmdzKTtcbiAgfVxuXG4gIHJ1bk91dHNpZGVBbmd1bGFyPFQ+KGZuOiAoLi4uYXJnczogYW55W10pID0+IFQpOiBUIHtcbiAgICByZXR1cm4gZm4oKTtcbiAgfVxuXG4gIHJ1blRhc2s8VD4oZm46ICguLi5hcmdzOiBhbnlbXSkgPT4gVCwgYXBwbHlUaGlzPzogYW55LCBhcHBseUFyZ3M/OiBhbnksIG5hbWU/OiBzdHJpbmcpOiBUIHtcbiAgICByZXR1cm4gZm4uYXBwbHkoYXBwbHlUaGlzLCBhcHBseUFyZ3MpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHNob3VsZEJlSWdub3JlZEJ5Wm9uZShhcHBseUFyZ3M6IHVua25vd24pOiBib29sZWFuIHtcbiAgcmV0dXJuIGhhc0FwcGx5QXJnc0RhdGEoYXBwbHlBcmdzLCAnX19pZ25vcmVfbmdfem9uZV9fJyk7XG59XG5cbmZ1bmN0aW9uIGlzU2NoZWR1bGVyVGljayhhcHBseUFyZ3M6IHVua25vd24pOiBib29sZWFuIHtcbiAgcmV0dXJuIGhhc0FwcGx5QXJnc0RhdGEoYXBwbHlBcmdzLCAnX19zY2hlZHVsZXJfdGlja19fJyk7XG59XG5cbmZ1bmN0aW9uIGhhc0FwcGx5QXJnc0RhdGEoYXBwbHlBcmdzOiB1bmtub3duLCBrZXk6IHN0cmluZykge1xuICBpZiAoIUFycmF5LmlzQXJyYXkoYXBwbHlBcmdzKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIFdlIHNob3VsZCBvbmx5IGV2ZXIgZ2V0IDEgYXJnIHBhc3NlZCB0aHJvdWdoIHRvIGludm9rZVRhc2suXG4gIC8vIFNob3J0IGNpcmN1aXQgaGVyZSBpbmNhc2UgdGhhdCBiZWhhdmlvciBjaGFuZ2VzLlxuICBpZiAoYXBwbHlBcmdzLmxlbmd0aCAhPT0gMSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiBhcHBseUFyZ3NbMF0/LmRhdGE/LltrZXldID09PSB0cnVlO1xufVxuXG4vLyBTZXQgb2Ygb3B0aW9ucyByZWNvZ25pemVkIGJ5IHRoZSBOZ1pvbmUuXG5leHBvcnQgaW50ZXJmYWNlIEludGVybmFsTmdab25lT3B0aW9ucyB7XG4gIGVuYWJsZUxvbmdTdGFja1RyYWNlPzogYm9vbGVhbjtcbiAgc2hvdWxkQ29hbGVzY2VFdmVudENoYW5nZURldGVjdGlvbj86IGJvb2xlYW47XG4gIHNob3VsZENvYWxlc2NlUnVuQ2hhbmdlRGV0ZWN0aW9uPzogYm9vbGVhbjtcbiAgc2NoZWR1bGVJblJvb3Rab25lPzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldE5nWm9uZShcbiAgbmdab25lVG9Vc2U6IE5nWm9uZSB8ICd6b25lLmpzJyB8ICdub29wJyA9ICd6b25lLmpzJyxcbiAgb3B0aW9uczogSW50ZXJuYWxOZ1pvbmVPcHRpb25zLFxuKTogTmdab25lIHtcbiAgaWYgKG5nWm9uZVRvVXNlID09PSAnbm9vcCcpIHtcbiAgICByZXR1cm4gbmV3IE5vb3BOZ1pvbmUoKTtcbiAgfVxuICBpZiAobmdab25lVG9Vc2UgPT09ICd6b25lLmpzJykge1xuICAgIHJldHVybiBuZXcgTmdab25lKG9wdGlvbnMpO1xuICB9XG4gIHJldHVybiBuZ1pvbmVUb1VzZTtcbn1cbiJdfQ==