/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { EventEmitter } from '../event_emitter';
import { global } from '../util/global';
import { noop } from '../util/noop';
import { getNativeRequestAnimationFrame } from '../util/raf';
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
    constructor({ enableLongStackTrace = false, shouldCoalesceEventChangeDetection = false, shouldCoalesceRunChangeDetection = false }) {
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
        if (typeof Zone == 'undefined') {
            throw new Error(`In this configuration Angular requires Zone.js`);
        }
        Zone.assertZonePatched();
        const self = this;
        self._nesting = 0;
        self._outer = self._inner = Zone.current;
        if (Zone['TaskTrackingZoneSpec']) {
            self._inner = self._inner.fork(new Zone['TaskTrackingZoneSpec']);
        }
        if (enableLongStackTrace && Zone['longStackTraceZoneSpec']) {
            self._inner = self._inner.fork(Zone['longStackTraceZoneSpec']);
        }
        // if shouldCoalesceRunChangeDetection is true, all tasks including event tasks will be
        // coalesced, so shouldCoalesceEventChangeDetection option is not necessary and can be skipped.
        self.shouldCoalesceEventChangeDetection =
            !shouldCoalesceRunChangeDetection && shouldCoalesceEventChangeDetection;
        self.shouldCoalesceRunChangeDetection = shouldCoalesceRunChangeDetection;
        self.lastRequestAnimationFrameId = -1;
        self.nativeRequestAnimationFrame = getNativeRequestAnimationFrame().nativeRequestAnimationFrame;
        forkInnerZoneWithAngularBehavior(self);
    }
    static isInAngularZone() {
        return Zone.current.get('isAngularZone') === true;
    }
    static assertInAngularZone() {
        if (!NgZone.isInAngularZone()) {
            throw new Error('Expected to be in Angular Zone, but it is not!');
        }
    }
    static assertNotInAngularZone() {
        if (NgZone.isInAngularZone()) {
            throw new Error('Expected to not be in Angular Zone, but it is!');
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
    if (zone.isCheckStableRunning || zone.lastRequestAnimationFrameId !== -1) {
        return;
    }
    zone.lastRequestAnimationFrameId = zone.nativeRequestAnimationFrame.call(global, () => {
        // This is a work around for https://github.com/angular/angular/issues/36839.
        // The core issue is that when event coalescing is enabled it is possible for microtasks
        // to get flushed too early (As is the case with `Promise.then`) between the
        // coalescing eventTasks.
        //
        // To workaround this we schedule a "fake" eventTask before we process the
        // coalescing eventTasks. The benefit of this is that the "fake" container eventTask
        //  will prevent the microtasks queue from getting drained in between the coalescing
        // eventTask execution.
        if (!zone.fakeTopEventTask) {
            zone.fakeTopEventTask = Zone.root.scheduleEventTask('fakeTopEventTask', () => {
                zone.lastRequestAnimationFrameId = -1;
                updateMicroTaskStatus(zone);
                zone.isCheckStableRunning = true;
                checkStable(zone);
                zone.isCheckStableRunning = false;
            }, undefined, () => { }, () => { });
        }
        zone.fakeTopEventTask.invoke();
    });
    updateMicroTaskStatus(zone);
}
function forkInnerZoneWithAngularBehavior(zone) {
    const delayChangeDetectionForEventsDelegate = () => {
        delayChangeDetectionForEvents(zone);
    };
    zone._inner = zone._inner.fork({
        name: 'angular',
        properties: { 'isAngularZone': true },
        onInvokeTask: (delegate, current, target, task, applyThis, applyArgs) => {
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
                if (zone.shouldCoalesceRunChangeDetection) {
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
        }
    });
}
function updateMicroTaskStatus(zone) {
    if (zone._hasPendingMicrotasks ||
        ((zone.shouldCoalesceEventChangeDetection || zone.shouldCoalesceRunChangeDetection) &&
            zone.lastRequestAnimationFrameId !== -1)) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfem9uZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL3pvbmUvbmdfem9uZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFDOUMsT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQ3RDLE9BQU8sRUFBQyxJQUFJLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFDbEMsT0FBTyxFQUFDLDhCQUE4QixFQUFDLE1BQU0sYUFBYSxDQUFDO0FBRzNEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBeUVHO0FBQ0gsTUFBTSxPQUFPLE1BQU07SUFrQ2pCLFlBQVksRUFDVixvQkFBb0IsR0FBRyxLQUFLLEVBQzVCLGtDQUFrQyxHQUFHLEtBQUssRUFDMUMsZ0NBQWdDLEdBQUcsS0FBSyxFQUN6QztRQXJDUSx5QkFBb0IsR0FBWSxLQUFLLENBQUM7UUFDdEMseUJBQW9CLEdBQVksS0FBSyxDQUFDO1FBRS9DOztXQUVHO1FBQ00sYUFBUSxHQUFZLElBQUksQ0FBQztRQUVsQzs7V0FFRztRQUNNLGVBQVUsR0FBc0IsSUFBSSxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFakU7Ozs7V0FJRztRQUNNLHFCQUFnQixHQUFzQixJQUFJLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUV2RTs7OztXQUlHO1FBQ00sYUFBUSxHQUFzQixJQUFJLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUUvRDs7V0FFRztRQUNNLFlBQU8sR0FBc0IsSUFBSSxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7UUFRNUQsSUFBSSxPQUFPLElBQUksSUFBSSxXQUFXLEVBQUU7WUFDOUIsTUFBTSxJQUFJLEtB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InNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0V2ZW50RW1pdHRlcn0gZnJvbSAnLi4vZXZlbnRfZW1pdHRlcic7XG5pbXBvcnQge2dsb2JhbH0gZnJvbSAnLi4vdXRpbC9nbG9iYWwnO1xuaW1wb3J0IHtub29wfSBmcm9tICcuLi91dGlsL25vb3AnO1xuaW1wb3J0IHtnZXROYXRpdmVSZXF1ZXN0QW5pbWF0aW9uRnJhbWV9IGZyb20gJy4uL3V0aWwvcmFmJztcblxuXG4vKipcbiAqIEFuIGluamVjdGFibGUgc2VydmljZSBmb3IgZXhlY3V0aW5nIHdvcmsgaW5zaWRlIG9yIG91dHNpZGUgb2YgdGhlIEFuZ3VsYXIgem9uZS5cbiAqXG4gKiBUaGUgbW9zdCBjb21tb24gdXNlIG9mIHRoaXMgc2VydmljZSBpcyB0byBvcHRpbWl6ZSBwZXJmb3JtYW5jZSB3aGVuIHN0YXJ0aW5nIGEgd29yayBjb25zaXN0aW5nIG9mXG4gKiBvbmUgb3IgbW9yZSBhc3luY2hyb25vdXMgdGFza3MgdGhhdCBkb24ndCByZXF1aXJlIFVJIHVwZGF0ZXMgb3IgZXJyb3IgaGFuZGxpbmcgdG8gYmUgaGFuZGxlZCBieVxuICogQW5ndWxhci4gU3VjaCB0YXNrcyBjYW4gYmUga2lja2VkIG9mZiB2aWEge0BsaW5rICNydW5PdXRzaWRlQW5ndWxhcn0gYW5kIGlmIG5lZWRlZCwgdGhlc2UgdGFza3NcbiAqIGNhbiByZWVudGVyIHRoZSBBbmd1bGFyIHpvbmUgdmlhIHtAbGluayAjcnVufS5cbiAqXG4gKiA8IS0tIFRPRE86IGFkZC9maXggbGlua3MgdG86XG4gKiAgIC0gZG9jcyBleHBsYWluaW5nIHpvbmVzIGFuZCB0aGUgdXNlIG9mIHpvbmVzIGluIEFuZ3VsYXIgYW5kIGNoYW5nZS1kZXRlY3Rpb25cbiAqICAgLSBsaW5rIHRvIHJ1bk91dHNpZGVBbmd1bGFyL3J1biAodGhyb3VnaG91dCB0aGlzIGZpbGUhKVxuICogICAtLT5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGBcbiAqIGltcG9ydCB7Q29tcG9uZW50LCBOZ1pvbmV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuICogaW1wb3J0IHtOZ0lmfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuICpcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ25nLXpvbmUtZGVtbycsXG4gKiAgIHRlbXBsYXRlOiBgXG4gKiAgICAgPGgyPkRlbW86IE5nWm9uZTwvaDI+XG4gKlxuICogICAgIDxwPlByb2dyZXNzOiB7e3Byb2dyZXNzfX0lPC9wPlxuICogICAgIDxwICpuZ0lmPVwicHJvZ3Jlc3MgPj0gMTAwXCI+RG9uZSBwcm9jZXNzaW5nIHt7bGFiZWx9fSBvZiBBbmd1bGFyIHpvbmUhPC9wPlxuICpcbiAqICAgICA8YnV0dG9uIChjbGljayk9XCJwcm9jZXNzV2l0aGluQW5ndWxhclpvbmUoKVwiPlByb2Nlc3Mgd2l0aGluIEFuZ3VsYXIgem9uZTwvYnV0dG9uPlxuICogICAgIDxidXR0b24gKGNsaWNrKT1cInByb2Nlc3NPdXRzaWRlT2ZBbmd1bGFyWm9uZSgpXCI+UHJvY2VzcyBvdXRzaWRlIG9mIEFuZ3VsYXIgem9uZTwvYnV0dG9uPlxuICogICBgLFxuICogfSlcbiAqIGV4cG9ydCBjbGFzcyBOZ1pvbmVEZW1vIHtcbiAqICAgcHJvZ3Jlc3M6IG51bWJlciA9IDA7XG4gKiAgIGxhYmVsOiBzdHJpbmc7XG4gKlxuICogICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9uZ1pvbmU6IE5nWm9uZSkge31cbiAqXG4gKiAgIC8vIExvb3AgaW5zaWRlIHRoZSBBbmd1bGFyIHpvbmVcbiAqICAgLy8gc28gdGhlIFVJIERPRVMgcmVmcmVzaCBhZnRlciBlYWNoIHNldFRpbWVvdXQgY3ljbGVcbiAqICAgcHJvY2Vzc1dpdGhpbkFuZ3VsYXJab25lKCkge1xuICogICAgIHRoaXMubGFiZWwgPSAnaW5zaWRlJztcbiAqICAgICB0aGlzLnByb2dyZXNzID0gMDtcbiAqICAgICB0aGlzLl9pbmNyZWFzZVByb2dyZXNzKCgpID0+IGNvbnNvbGUubG9nKCdJbnNpZGUgRG9uZSEnKSk7XG4gKiAgIH1cbiAqXG4gKiAgIC8vIExvb3Agb3V0c2lkZSBvZiB0aGUgQW5ndWxhciB6b25lXG4gKiAgIC8vIHNvIHRoZSBVSSBET0VTIE5PVCByZWZyZXNoIGFmdGVyIGVhY2ggc2V0VGltZW91dCBjeWNsZVxuICogICBwcm9jZXNzT3V0c2lkZU9mQW5ndWxhclpvbmUoKSB7XG4gKiAgICAgdGhpcy5sYWJlbCA9ICdvdXRzaWRlJztcbiAqICAgICB0aGlzLnByb2dyZXNzID0gMDtcbiAqICAgICB0aGlzLl9uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICogICAgICAgdGhpcy5faW5jcmVhc2VQcm9ncmVzcygoKSA9PiB7XG4gKiAgICAgICAgIC8vIHJlZW50ZXIgdGhlIEFuZ3VsYXIgem9uZSBhbmQgZGlzcGxheSBkb25lXG4gKiAgICAgICAgIHRoaXMuX25nWm9uZS5ydW4oKCkgPT4geyBjb25zb2xlLmxvZygnT3V0c2lkZSBEb25lIScpOyB9KTtcbiAqICAgICAgIH0pO1xuICogICAgIH0pO1xuICogICB9XG4gKlxuICogICBfaW5jcmVhc2VQcm9ncmVzcyhkb25lQ2FsbGJhY2s6ICgpID0+IHZvaWQpIHtcbiAqICAgICB0aGlzLnByb2dyZXNzICs9IDE7XG4gKiAgICAgY29uc29sZS5sb2coYEN1cnJlbnQgcHJvZ3Jlc3M6ICR7dGhpcy5wcm9ncmVzc30lYCk7XG4gKlxuICogICAgIGlmICh0aGlzLnByb2dyZXNzIDwgMTAwKSB7XG4gKiAgICAgICB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB0aGlzLl9pbmNyZWFzZVByb2dyZXNzKGRvbmVDYWxsYmFjayksIDEwKTtcbiAqICAgICB9IGVsc2Uge1xuICogICAgICAgZG9uZUNhbGxiYWNrKCk7XG4gKiAgICAgfVxuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBOZ1pvbmUge1xuICByZWFkb25seSBoYXNQZW5kaW5nTWFjcm90YXNrczogYm9vbGVhbiA9IGZhbHNlO1xuICByZWFkb25seSBoYXNQZW5kaW5nTWljcm90YXNrczogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZXJlIGFyZSBubyBvdXRzdGFuZGluZyBtaWNyb3Rhc2tzIG9yIG1hY3JvdGFza3MuXG4gICAqL1xuICByZWFkb25seSBpc1N0YWJsZTogYm9vbGVhbiA9IHRydWU7XG5cbiAgLyoqXG4gICAqIE5vdGlmaWVzIHdoZW4gY29kZSBlbnRlcnMgQW5ndWxhciBab25lLiBUaGlzIGdldHMgZmlyZWQgZmlyc3Qgb24gVk0gVHVybi5cbiAgICovXG4gIHJlYWRvbmx5IG9uVW5zdGFibGU6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcihmYWxzZSk7XG5cbiAgLyoqXG4gICAqIE5vdGlmaWVzIHdoZW4gdGhlcmUgaXMgbm8gbW9yZSBtaWNyb3Rhc2tzIGVucXVldWVkIGluIHRoZSBjdXJyZW50IFZNIFR1cm4uXG4gICAqIFRoaXMgaXMgYSBoaW50IGZvciBBbmd1bGFyIHRvIGRvIGNoYW5nZSBkZXRlY3Rpb24sIHdoaWNoIG1heSBlbnF1ZXVlIG1vcmUgbWljcm90YXNrcy5cbiAgICogRm9yIHRoaXMgcmVhc29uIHRoaXMgZXZlbnQgY2FuIGZpcmUgbXVsdGlwbGUgdGltZXMgcGVyIFZNIFR1cm4uXG4gICAqL1xuICByZWFkb25seSBvbk1pY3JvdGFza0VtcHR5OiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoZmFsc2UpO1xuXG4gIC8qKlxuICAgKiBOb3RpZmllcyB3aGVuIHRoZSBsYXN0IGBvbk1pY3JvdGFza0VtcHR5YCBoYXMgcnVuIGFuZCB0aGVyZSBhcmUgbm8gbW9yZSBtaWNyb3Rhc2tzLCB3aGljaFxuICAgKiBpbXBsaWVzIHdlIGFyZSBhYm91dCB0byByZWxpbnF1aXNoIFZNIHR1cm4uXG4gICAqIFRoaXMgZXZlbnQgZ2V0cyBjYWxsZWQganVzdCBvbmNlLlxuICAgKi9cbiAgcmVhZG9ubHkgb25TdGFibGU6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcihmYWxzZSk7XG5cbiAgLyoqXG4gICAqIE5vdGlmaWVzIHRoYXQgYW4gZXJyb3IgaGFzIGJlZW4gZGVsaXZlcmVkLlxuICAgKi9cbiAgcmVhZG9ubHkgb25FcnJvcjogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKGZhbHNlKTtcblxuXG4gIGNvbnN0cnVjdG9yKHtcbiAgICBlbmFibGVMb25nU3RhY2tUcmFjZSA9IGZhbHNlLFxuICAgIHNob3VsZENvYWxlc2NlRXZlbnRDaGFuZ2VEZXRlY3Rpb24gPSBmYWxzZSxcbiAgICBzaG91bGRDb2FsZXNjZVJ1bkNoYW5nZURldGVjdGlvbiA9IGZhbHNlXG4gIH0pIHtcbiAgICBpZiAodHlwZW9mIFpvbmUgPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgSW4gdGhpcyBjb25maWd1cmF0aW9uIEFuZ3VsYXIgcmVxdWlyZXMgWm9uZS5qc2ApO1xuICAgIH1cblxuICAgIFpvbmUuYXNzZXJ0Wm9uZVBhdGNoZWQoKTtcbiAgICBjb25zdCBzZWxmID0gdGhpcyBhcyBhbnkgYXMgTmdab25lUHJpdmF0ZTtcbiAgICBzZWxmLl9uZXN0aW5nID0gMDtcblxuICAgIHNlbGYuX291dGVyID0gc2VsZi5faW5uZXIgPSBab25lLmN1cnJlbnQ7XG5cbiAgICBpZiAoKFpvbmUgYXMgYW55KVsnVGFza1RyYWNraW5nWm9uZVNwZWMnXSkge1xuICAgICAgc2VsZi5faW5uZXIgPSBzZWxmLl9pbm5lci5mb3JrKG5ldyAoKFpvbmUgYXMgYW55KVsnVGFza1RyYWNraW5nWm9uZVNwZWMnXSBhcyBhbnkpKTtcbiAgICB9XG5cbiAgICBpZiAoZW5hYmxlTG9uZ1N0YWNrVHJhY2UgJiYgKFpvbmUgYXMgYW55KVsnbG9uZ1N0YWNrVHJhY2Vab25lU3BlYyddKSB7XG4gICAgICBzZWxmLl9pbm5lciA9IHNlbGYuX2lubmVyLmZvcmsoKFpvbmUgYXMgYW55KVsnbG9uZ1N0YWNrVHJhY2Vab25lU3BlYyddKTtcbiAgICB9XG4gICAgLy8gaWYgc2hvdWxkQ29hbGVzY2VSdW5DaGFuZ2VEZXRlY3Rpb24gaXMgdHJ1ZSwgYWxsIHRhc2tzIGluY2x1ZGluZyBldmVudCB0YXNrcyB3aWxsIGJlXG4gICAgLy8gY29hbGVzY2VkLCBzbyBzaG91bGRDb2FsZXNjZUV2ZW50Q2hhbmdlRGV0ZWN0aW9uIG9wdGlvbiBpcyBub3QgbmVjZXNzYXJ5IGFuZCBjYW4gYmUgc2tpcHBlZC5cbiAgICBzZWxmLnNob3VsZENvYWxlc2NlRXZlbnRDaGFuZ2VEZXRlY3Rpb24gPVxuICAgICAgICAhc2hvdWxkQ29hbGVzY2VSdW5DaGFuZ2VEZXRlY3Rpb24gJiYgc2hvdWxkQ29hbGVzY2VFdmVudENoYW5nZURldGVjdGlvbjtcbiAgICBzZWxmLnNob3VsZENvYWxlc2NlUnVuQ2hhbmdlRGV0ZWN0aW9uID0gc2hvdWxkQ29hbGVzY2VSdW5DaGFuZ2VEZXRlY3Rpb247XG4gICAgc2VsZi5sYXN0UmVxdWVzdEFuaW1hdGlvbkZyYW1lSWQgPSAtMTtcbiAgICBzZWxmLm5hdGl2ZVJlcXVlc3RBbmltYXRpb25GcmFtZSA9IGdldE5hdGl2ZVJlcXVlc3RBbmltYXRpb25GcmFtZSgpLm5hdGl2ZVJlcXVlc3RBbmltYXRpb25GcmFtZTtcbiAgICBmb3JrSW5uZXJab25lV2l0aEFuZ3VsYXJCZWhhdmlvcihzZWxmKTtcbiAgfVxuXG4gIHN0YXRpYyBpc0luQW5ndWxhclpvbmUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIFpvbmUuY3VycmVudC5nZXQoJ2lzQW5ndWxhclpvbmUnKSA9PT0gdHJ1ZTtcbiAgfVxuXG4gIHN0YXRpYyBhc3NlcnRJbkFuZ3VsYXJab25lKCk6IHZvaWQge1xuICAgIGlmICghTmdab25lLmlzSW5Bbmd1bGFyWm9uZSgpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0V4cGVjdGVkIHRvIGJlIGluIEFuZ3VsYXIgWm9uZSwgYnV0IGl0IGlzIG5vdCEnKTtcbiAgICB9XG4gIH1cblxuICBzdGF0aWMgYXNzZXJ0Tm90SW5Bbmd1bGFyWm9uZSgpOiB2b2lkIHtcbiAgICBpZiAoTmdab25lLmlzSW5Bbmd1bGFyWm9uZSgpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0V4cGVjdGVkIHRvIG5vdCBiZSBpbiBBbmd1bGFyIFpvbmUsIGJ1dCBpdCBpcyEnKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRXhlY3V0ZXMgdGhlIGBmbmAgZnVuY3Rpb24gc3luY2hyb25vdXNseSB3aXRoaW4gdGhlIEFuZ3VsYXIgem9uZSBhbmQgcmV0dXJucyB2YWx1ZSByZXR1cm5lZCBieVxuICAgKiB0aGUgZnVuY3Rpb24uXG4gICAqXG4gICAqIFJ1bm5pbmcgZnVuY3Rpb25zIHZpYSBgcnVuYCBhbGxvd3MgeW91IHRvIHJlZW50ZXIgQW5ndWxhciB6b25lIGZyb20gYSB0YXNrIHRoYXQgd2FzIGV4ZWN1dGVkXG4gICAqIG91dHNpZGUgb2YgdGhlIEFuZ3VsYXIgem9uZSAodHlwaWNhbGx5IHN0YXJ0ZWQgdmlhIHtAbGluayAjcnVuT3V0c2lkZUFuZ3VsYXJ9KS5cbiAgICpcbiAgICogQW55IGZ1dHVyZSB0YXNrcyBvciBtaWNyb3Rhc2tzIHNjaGVkdWxlZCBmcm9tIHdpdGhpbiB0aGlzIGZ1bmN0aW9uIHdpbGwgY29udGludWUgZXhlY3V0aW5nIGZyb21cbiAgICogd2l0aGluIHRoZSBBbmd1bGFyIHpvbmUuXG4gICAqXG4gICAqIElmIGEgc3luY2hyb25vdXMgZXJyb3IgaGFwcGVucyBpdCB3aWxsIGJlIHJldGhyb3duIGFuZCBub3QgcmVwb3J0ZWQgdmlhIGBvbkVycm9yYC5cbiAgICovXG4gIHJ1bjxUPihmbjogKC4uLmFyZ3M6IGFueVtdKSA9PiBULCBhcHBseVRoaXM/OiBhbnksIGFwcGx5QXJncz86IGFueVtdKTogVCB7XG4gICAgcmV0dXJuICh0aGlzIGFzIGFueSBhcyBOZ1pvbmVQcml2YXRlKS5faW5uZXIucnVuKGZuLCBhcHBseVRoaXMsIGFwcGx5QXJncyk7XG4gIH1cblxuICAvKipcbiAgICogRXhlY3V0ZXMgdGhlIGBmbmAgZnVuY3Rpb24gc3luY2hyb25vdXNseSB3aXRoaW4gdGhlIEFuZ3VsYXIgem9uZSBhcyBhIHRhc2sgYW5kIHJldHVybnMgdmFsdWVcbiAgICogcmV0dXJuZWQgYnkgdGhlIGZ1bmN0aW9uLlxuICAgKlxuICAgKiBSdW5uaW5nIGZ1bmN0aW9ucyB2aWEgYHJ1bmAgYWxsb3dzIHlvdSB0byByZWVudGVyIEFuZ3VsYXIgem9uZSBmcm9tIGEgdGFzayB0aGF0IHdhcyBleGVjdXRlZFxuICAgKiBvdXRzaWRlIG9mIHRoZSBBbmd1bGFyIHpvbmUgKHR5cGljYWxseSBzdGFydGVkIHZpYSB7QGxpbmsgI3J1bk91dHNpZGVBbmd1bGFyfSkuXG4gICAqXG4gICAqIEFueSBmdXR1cmUgdGFza3Mgb3IgbWljcm90YXNrcyBzY2hlZHVsZWQgZnJvbSB3aXRoaW4gdGhpcyBmdW5jdGlvbiB3aWxsIGNvbnRpbnVlIGV4ZWN1dGluZyBmcm9tXG4gICAqIHdpdGhpbiB0aGUgQW5ndWxhciB6b25lLlxuICAgKlxuICAgKiBJZiBhIHN5bmNocm9ub3VzIGVycm9yIGhhcHBlbnMgaXQgd2lsbCBiZSByZXRocm93biBhbmQgbm90IHJlcG9ydGVkIHZpYSBgb25FcnJvcmAuXG4gICAqL1xuICBydW5UYXNrPFQ+KGZuOiAoLi4uYXJnczogYW55W10pID0+IFQsIGFwcGx5VGhpcz86IGFueSwgYXBwbHlBcmdzPzogYW55W10sIG5hbWU/OiBzdHJpbmcpOiBUIHtcbiAgICBjb25zdCB6b25lID0gKHRoaXMgYXMgYW55IGFzIE5nWm9uZVByaXZhdGUpLl9pbm5lcjtcbiAgICBjb25zdCB0YXNrID0gem9uZS5zY2hlZHVsZUV2ZW50VGFzaygnTmdab25lRXZlbnQ6ICcgKyBuYW1lLCBmbiwgRU1QVFlfUEFZTE9BRCwgbm9vcCwgbm9vcCk7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiB6b25lLnJ1blRhc2sodGFzaywgYXBwbHlUaGlzLCBhcHBseUFyZ3MpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICB6b25lLmNhbmNlbFRhc2sodGFzayk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNhbWUgYXMgYHJ1bmAsIGV4Y2VwdCB0aGF0IHN5bmNocm9ub3VzIGVycm9ycyBhcmUgY2F1Z2h0IGFuZCBmb3J3YXJkZWQgdmlhIGBvbkVycm9yYCBhbmQgbm90XG4gICAqIHJldGhyb3duLlxuICAgKi9cbiAgcnVuR3VhcmRlZDxUPihmbjogKC4uLmFyZ3M6IGFueVtdKSA9PiBULCBhcHBseVRoaXM/OiBhbnksIGFwcGx5QXJncz86IGFueVtdKTogVCB7XG4gICAgcmV0dXJuICh0aGlzIGFzIGFueSBhcyBOZ1pvbmVQcml2YXRlKS5faW5uZXIucnVuR3VhcmRlZChmbiwgYXBwbHlUaGlzLCBhcHBseUFyZ3MpO1xuICB9XG5cbiAgLyoqXG4gICAqIEV4ZWN1dGVzIHRoZSBgZm5gIGZ1bmN0aW9uIHN5bmNocm9ub3VzbHkgaW4gQW5ndWxhcidzIHBhcmVudCB6b25lIGFuZCByZXR1cm5zIHZhbHVlIHJldHVybmVkIGJ5XG4gICAqIHRoZSBmdW5jdGlvbi5cbiAgICpcbiAgICogUnVubmluZyBmdW5jdGlvbnMgdmlhIHtAbGluayAjcnVuT3V0c2lkZUFuZ3VsYXJ9IGFsbG93cyB5b3UgdG8gZXNjYXBlIEFuZ3VsYXIncyB6b25lIGFuZCBkb1xuICAgKiB3b3JrIHRoYXRcbiAgICogZG9lc24ndCB0cmlnZ2VyIEFuZ3VsYXIgY2hhbmdlLWRldGVjdGlvbiBvciBpcyBzdWJqZWN0IHRvIEFuZ3VsYXIncyBlcnJvciBoYW5kbGluZy5cbiAgICpcbiAgICogQW55IGZ1dHVyZSB0YXNrcyBvciBtaWNyb3Rhc2tzIHNjaGVkdWxlZCBmcm9tIHdpdGhpbiB0aGlzIGZ1bmN0aW9uIHdpbGwgY29udGludWUgZXhlY3V0aW5nIGZyb21cbiAgICogb3V0c2lkZSBvZiB0aGUgQW5ndWxhciB6b25lLlxuICAgKlxuICAgKiBVc2Uge0BsaW5rICNydW59IHRvIHJlZW50ZXIgdGhlIEFuZ3VsYXIgem9uZSBhbmQgZG8gd29yayB0aGF0IHVwZGF0ZXMgdGhlIGFwcGxpY2F0aW9uIG1vZGVsLlxuICAgKi9cbiAgcnVuT3V0c2lkZUFuZ3VsYXI8VD4oZm46ICguLi5hcmdzOiBhbnlbXSkgPT4gVCk6IFQge1xuICAgIHJldHVybiAodGhpcyBhcyBhbnkgYXMgTmdab25lUHJpdmF0ZSkuX291dGVyLnJ1bihmbik7XG4gIH1cbn1cblxuY29uc3QgRU1QVFlfUEFZTE9BRCA9IHt9O1xuXG5pbnRlcmZhY2UgTmdab25lUHJpdmF0ZSBleHRlbmRzIE5nWm9uZSB7XG4gIF9vdXRlcjogWm9uZTtcbiAgX2lubmVyOiBab25lO1xuICBfbmVzdGluZzogbnVtYmVyO1xuICBfaGFzUGVuZGluZ01pY3JvdGFza3M6IGJvb2xlYW47XG5cbiAgaGFzUGVuZGluZ01hY3JvdGFza3M6IGJvb2xlYW47XG4gIGhhc1BlbmRpbmdNaWNyb3Rhc2tzOiBib29sZWFuO1xuICBsYXN0UmVxdWVzdEFuaW1hdGlvbkZyYW1lSWQ6IG51bWJlcjtcbiAgLyoqXG4gICAqIEEgZmxhZyB0byBpbmRpY2F0ZSBpZiBOZ1pvbmUgaXMgY3VycmVudGx5IGluc2lkZVxuICAgKiBjaGVja1N0YWJsZSBhbmQgdG8gcHJldmVudCByZS1lbnRyeS4gVGhlIGZsYWcgaXNcbiAgICogbmVlZGVkIGJlY2F1c2UgaXQgaXMgcG9zc2libGUgdG8gaW52b2tlIHRoZSBjaGFuZ2VcbiAgICogZGV0ZWN0aW9uIGZyb20gd2l0aGluIGNoYW5nZSBkZXRlY3Rpb24gbGVhZGluZyB0b1xuICAgKiBpbmNvcnJlY3QgYmVoYXZpb3IuXG4gICAqXG4gICAqIEZvciBkZXRhaWwsIHBsZWFzZSByZWZlciBoZXJlLFxuICAgKiBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyL3B1bGwvNDA1NDBcbiAgICovXG4gIGlzQ2hlY2tTdGFibGVSdW5uaW5nOiBib29sZWFuO1xuICBpc1N0YWJsZTogYm9vbGVhbjtcbiAgLyoqXG4gICAqIE9wdGlvbmFsbHkgc3BlY2lmeSBjb2FsZXNjaW5nIGV2ZW50IGNoYW5nZSBkZXRlY3Rpb25zIG9yIG5vdC5cbiAgICogQ29uc2lkZXIgdGhlIGZvbGxvd2luZyBjYXNlLlxuICAgKlxuICAgKiA8ZGl2IChjbGljayk9XCJkb1NvbWV0aGluZygpXCI+XG4gICAqICAgPGJ1dHRvbiAoY2xpY2spPVwiZG9Tb21ldGhpbmdFbHNlKClcIj48L2J1dHRvbj5cbiAgICogPC9kaXY+XG4gICAqXG4gICAqIFdoZW4gYnV0dG9uIGlzIGNsaWNrZWQsIGJlY2F1c2Ugb2YgdGhlIGV2ZW50IGJ1YmJsaW5nLCBib3RoXG4gICAqIGV2ZW50IGhhbmRsZXJzIHdpbGwgYmUgY2FsbGVkIGFuZCAyIGNoYW5nZSBkZXRlY3Rpb25zIHdpbGwgYmVcbiAgICogdHJpZ2dlcmVkLiBXZSBjYW4gY29hbGVzY2Ugc3VjaCBraW5kIG9mIGV2ZW50cyB0byB0cmlnZ2VyXG4gICAqIGNoYW5nZSBkZXRlY3Rpb24gb25seSBvbmNlLlxuICAgKlxuICAgKiBCeSBkZWZhdWx0LCB0aGlzIG9wdGlvbiB3aWxsIGJlIGZhbHNlLiBTbyB0aGUgZXZlbnRzIHdpbGwgbm90IGJlXG4gICAqIGNvYWxlc2NlZCBhbmQgdGhlIGNoYW5nZSBkZXRlY3Rpb24gd2lsbCBiZSB0cmlnZ2VyZWQgbXVsdGlwbGUgdGltZXMuXG4gICAqIEFuZCBpZiB0aGlzIG9wdGlvbiBiZSBzZXQgdG8gdHJ1ZSwgdGhlIGNoYW5nZSBkZXRlY3Rpb24gd2lsbCBiZVxuICAgKiB0cmlnZ2VyZWQgYXN5bmMgYnkgc2NoZWR1bGluZyBpdCBpbiBhbiBhbmltYXRpb24gZnJhbWUuIFNvIGluIHRoZSBjYXNlIGFib3ZlLFxuICAgKiB0aGUgY2hhbmdlIGRldGVjdGlvbiB3aWxsIG9ubHkgYmUgdHJpZ2dlZCBvbmNlLlxuICAgKi9cbiAgc2hvdWxkQ29hbGVzY2VFdmVudENoYW5nZURldGVjdGlvbjogYm9vbGVhbjtcbiAgLyoqXG4gICAqIE9wdGlvbmFsbHkgc3BlY2lmeSBpZiBgTmdab25lI3J1bigpYCBtZXRob2QgaW52b2NhdGlvbnMgc2hvdWxkIGJlIGNvYWxlc2NlZFxuICAgKiBpbnRvIGEgc2luZ2xlIGNoYW5nZSBkZXRlY3Rpb24uXG4gICAqXG4gICAqIENvbnNpZGVyIHRoZSBmb2xsb3dpbmcgY2FzZS5cbiAgICpcbiAgICogZm9yIChsZXQgaSA9IDA7IGkgPCAxMDsgaSArKykge1xuICAgKiAgIG5nWm9uZS5ydW4oKCkgPT4ge1xuICAgKiAgICAgLy8gZG8gc29tZXRoaW5nXG4gICAqICAgfSk7XG4gICAqIH1cbiAgICpcbiAgICogVGhpcyBjYXNlIHRyaWdnZXJzIHRoZSBjaGFuZ2UgZGV0ZWN0aW9uIG11bHRpcGxlIHRpbWVzLlxuICAgKiBXaXRoIG5nWm9uZVJ1bkNvYWxlc2Npbmcgb3B0aW9ucywgYWxsIGNoYW5nZSBkZXRlY3Rpb25zIGluIGFuIGV2ZW50IGxvb3BzIHRyaWdnZXIgb25seSBvbmNlLlxuICAgKiBJbiBhZGRpdGlvbiwgdGhlIGNoYW5nZSBkZXRlY3Rpb24gZXhlY3V0ZXMgaW4gcmVxdWVzdEFuaW1hdGlvbi5cbiAgICpcbiAgICovXG4gIHNob3VsZENvYWxlc2NlUnVuQ2hhbmdlRGV0ZWN0aW9uOiBib29sZWFuO1xuXG4gIG5hdGl2ZVJlcXVlc3RBbmltYXRpb25GcmFtZTogKGNhbGxiYWNrOiBGcmFtZVJlcXVlc3RDYWxsYmFjaykgPT4gbnVtYmVyO1xuXG4gIC8vIENhY2hlIGEgIFwiZmFrZVwiIHRvcCBldmVudFRhc2sgc28geW91IGRvbid0IG5lZWQgdG8gc2NoZWR1bGUgYSBuZXcgdGFzayBldmVyeVxuICAvLyB0aW1lIHlvdSBydW4gYSBgY2hlY2tTdGFibGVgLlxuICBmYWtlVG9wRXZlbnRUYXNrOiBUYXNrO1xufVxuXG5mdW5jdGlvbiBjaGVja1N0YWJsZSh6b25lOiBOZ1pvbmVQcml2YXRlKSB7XG4gIC8vIFRPRE86IEBKaWFMaVBhc3Npb24sIHNob3VsZCBjaGVjayB6b25lLmlzQ2hlY2tTdGFibGVSdW5uaW5nIHRvIHByZXZlbnRcbiAgLy8gcmUtZW50cnkuIFRoZSBjYXNlIGlzOlxuICAvL1xuICAvLyBAQ29tcG9uZW50KHsuLi59KVxuICAvLyBleHBvcnQgY2xhc3MgQXBwQ29tcG9uZW50IHtcbiAgLy8gY29uc3RydWN0b3IocHJpdmF0ZSBuZ1pvbmU6IE5nWm9uZSkge1xuICAvLyAgIHRoaXMubmdab25lLm9uU3RhYmxlLnN1YnNjcmliZSgoKSA9PiB7XG4gIC8vICAgICB0aGlzLm5nWm9uZS5ydW4oKCkgPT4gY29uc29sZS5sb2coJ3N0YWJsZScpOyk7XG4gIC8vICAgfSk7XG4gIC8vIH1cbiAgLy9cbiAgLy8gVGhlIG9uU3RhYmxlIHN1YnNjcmliZXIgcnVuIGFub3RoZXIgZnVuY3Rpb24gaW5zaWRlIG5nWm9uZVxuICAvLyB3aGljaCBjYXVzZXMgYGNoZWNrU3RhYmxlKClgIHJlLWVudHJ5LlxuICAvLyBCdXQgdGhpcyBmaXggY2F1c2VzIHNvbWUgaXNzdWVzIGluIGczLCBzbyB0aGlzIGZpeCB3aWxsIGJlXG4gIC8vIGxhdW5jaGVkIGluIGFub3RoZXIgUFIuXG4gIGlmICh6b25lLl9uZXN0aW5nID09IDAgJiYgIXpvbmUuaGFzUGVuZGluZ01pY3JvdGFza3MgJiYgIXpvbmUuaXNTdGFibGUpIHtcbiAgICB0cnkge1xuICAgICAgem9uZS5fbmVzdGluZysrO1xuICAgICAgem9uZS5vbk1pY3JvdGFza0VtcHR5LmVtaXQobnVsbCk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHpvbmUuX25lc3RpbmctLTtcbiAgICAgIGlmICghem9uZS5oYXNQZW5kaW5nTWljcm90YXNrcykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHpvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4gem9uZS5vblN0YWJsZS5lbWl0KG51bGwpKTtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICB6b25lLmlzU3RhYmxlID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBkZWxheUNoYW5nZURldGVjdGlvbkZvckV2ZW50cyh6b25lOiBOZ1pvbmVQcml2YXRlKSB7XG4gIC8qKlxuICAgKiBXZSBhbHNvIG5lZWQgdG8gY2hlY2sgX25lc3RpbmcgaGVyZVxuICAgKiBDb25zaWRlciB0aGUgZm9sbG93aW5nIGNhc2Ugd2l0aCBzaG91bGRDb2FsZXNjZVJ1bkNoYW5nZURldGVjdGlvbiA9IHRydWVcbiAgICpcbiAgICogbmdab25lLnJ1bigoKSA9PiB7fSk7XG4gICAqIG5nWm9uZS5ydW4oKCkgPT4ge30pO1xuICAgKlxuICAgKiBXZSB3YW50IHRoZSB0d28gYG5nWm9uZS5ydW4oKWAgb25seSB0cmlnZ2VyIG9uZSBjaGFuZ2UgZGV0ZWN0aW9uXG4gICAqIHdoZW4gc2hvdWxkQ29hbGVzY2VSdW5DaGFuZ2VEZXRlY3Rpb24gaXMgdHJ1ZS5cbiAgICogQW5kIGJlY2F1c2UgaW4gdGhpcyBjYXNlLCBjaGFuZ2UgZGV0ZWN0aW9uIHJ1biBpbiBhc3luYyB3YXkocmVxdWVzdEFuaW1hdGlvbkZyYW1lKSxcbiAgICogc28gd2UgYWxzbyBuZWVkIHRvIGNoZWNrIHRoZSBfbmVzdGluZyBoZXJlIHRvIHByZXZlbnQgbXVsdGlwbGVcbiAgICogY2hhbmdlIGRldGVjdGlvbnMuXG4gICAqL1xuICBpZiAoem9uZS5pc0NoZWNrU3RhYmxlUnVubmluZyB8fCB6b25lLmxhc3RSZXF1ZXN0QW5pbWF0aW9uRnJhbWVJZCAhPT0gLTEpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgem9uZS5sYXN0UmVxdWVzdEFuaW1hdGlvbkZyYW1lSWQgPSB6b25lLm5hdGl2ZVJlcXVlc3RBbmltYXRpb25GcmFtZS5jYWxsKGdsb2JhbCwgKCkgPT4ge1xuICAgIC8vIFRoaXMgaXMgYSB3b3JrIGFyb3VuZCBmb3IgaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci9pc3N1ZXMvMzY4MzkuXG4gICAgLy8gVGhlIGNvcmUgaXNzdWUgaXMgdGhhdCB3aGVuIGV2ZW50IGNvYWxlc2NpbmcgaXMgZW5hYmxlZCBpdCBpcyBwb3NzaWJsZSBmb3IgbWljcm90YXNrc1xuICAgIC8vIHRvIGdldCBmbHVzaGVkIHRvbyBlYXJseSAoQXMgaXMgdGhlIGNhc2Ugd2l0aCBgUHJvbWlzZS50aGVuYCkgYmV0d2VlbiB0aGVcbiAgICAvLyBjb2FsZXNjaW5nIGV2ZW50VGFza3MuXG4gICAgLy9cbiAgICAvLyBUbyB3b3JrYXJvdW5kIHRoaXMgd2Ugc2NoZWR1bGUgYSBcImZha2VcIiBldmVudFRhc2sgYmVmb3JlIHdlIHByb2Nlc3MgdGhlXG4gICAgLy8gY29hbGVzY2luZyBldmVudFRhc2tzLiBUaGUgYmVuZWZpdCBvZiB0aGlzIGlzIHRoYXQgdGhlIFwiZmFrZVwiIGNvbnRhaW5lciBldmVudFRhc2tcbiAgICAvLyAgd2lsbCBwcmV2ZW50IHRoZSBtaWNyb3Rhc2tzIHF1ZXVlIGZyb20gZ2V0dGluZyBkcmFpbmVkIGluIGJldHdlZW4gdGhlIGNvYWxlc2NpbmdcbiAgICAvLyBldmVudFRhc2sgZXhlY3V0aW9uLlxuICAgIGlmICghem9uZS5mYWtlVG9wRXZlbnRUYXNrKSB7XG4gICAgICB6b25lLmZha2VUb3BFdmVudFRhc2sgPSBab25lLnJvb3Quc2NoZWR1bGVFdmVudFRhc2soJ2Zha2VUb3BFdmVudFRhc2snLCAoKSA9PiB7XG4gICAgICAgIHpvbmUubGFzdFJlcXVlc3RBbmltYXRpb25GcmFtZUlkID0gLTE7XG4gICAgICAgIHVwZGF0ZU1pY3JvVGFza1N0YXR1cyh6b25lKTtcbiAgICAgICAgem9uZS5pc0NoZWNrU3RhYmxlUnVubmluZyA9IHRydWU7XG4gICAgICAgIGNoZWNrU3RhYmxlKHpvbmUpO1xuICAgICAgICB6b25lLmlzQ2hlY2tTdGFibGVSdW5uaW5nID0gZmFsc2U7XG4gICAgICB9LCB1bmRlZmluZWQsICgpID0+IHt9LCAoKSA9PiB7fSk7XG4gICAgfVxuICAgIHpvbmUuZmFrZVRvcEV2ZW50VGFzay5pbnZva2UoKTtcbiAgfSk7XG4gIHVwZGF0ZU1pY3JvVGFza1N0YXR1cyh6b25lKTtcbn1cblxuZnVuY3Rpb24gZm9ya0lubmVyWm9uZVdpdGhBbmd1bGFyQmVoYXZpb3Ioem9uZTogTmdab25lUHJpdmF0ZSkge1xuICBjb25zdCBkZWxheUNoYW5nZURldGVjdGlvbkZvckV2ZW50c0RlbGVnYXRlID0gKCkgPT4ge1xuICAgIGRlbGF5Q2hhbmdlRGV0ZWN0aW9uRm9yRXZlbnRzKHpvbmUpO1xuICB9O1xuICB6b25lLl9pbm5lciA9IHpvbmUuX2lubmVyLmZvcmsoe1xuICAgIG5hbWU6ICdhbmd1bGFyJyxcbiAgICBwcm9wZXJ0aWVzOiA8YW55PnsnaXNBbmd1bGFyWm9uZSc6IHRydWV9LFxuICAgIG9uSW52b2tlVGFzazpcbiAgICAgICAgKGRlbGVnYXRlOiBab25lRGVsZWdhdGUsIGN1cnJlbnQ6IFpvbmUsIHRhcmdldDogWm9uZSwgdGFzazogVGFzaywgYXBwbHlUaGlzOiBhbnksXG4gICAgICAgICBhcHBseUFyZ3M6IGFueSk6IGFueSA9PiB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIG9uRW50ZXIoem9uZSk7XG4gICAgICAgICAgICByZXR1cm4gZGVsZWdhdGUuaW52b2tlVGFzayh0YXJnZXQsIHRhc2ssIGFwcGx5VGhpcywgYXBwbHlBcmdzKTtcbiAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgaWYgKCh6b25lLnNob3VsZENvYWxlc2NlRXZlbnRDaGFuZ2VEZXRlY3Rpb24gJiYgdGFzay50eXBlID09PSAnZXZlbnRUYXNrJykgfHxcbiAgICAgICAgICAgICAgICB6b25lLnNob3VsZENvYWxlc2NlUnVuQ2hhbmdlRGV0ZWN0aW9uKSB7XG4gICAgICAgICAgICAgIGRlbGF5Q2hhbmdlRGV0ZWN0aW9uRm9yRXZlbnRzRGVsZWdhdGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG9uTGVhdmUoem9uZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgb25JbnZva2U6XG4gICAgICAgIChkZWxlZ2F0ZTogWm9uZURlbGVnYXRlLCBjdXJyZW50OiBab25lLCB0YXJnZXQ6IFpvbmUsIGNhbGxiYWNrOiBGdW5jdGlvbiwgYXBwbHlUaGlzOiBhbnksXG4gICAgICAgICBhcHBseUFyZ3M/OiBhbnlbXSwgc291cmNlPzogc3RyaW5nKTogYW55ID0+IHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgb25FbnRlcih6b25lKTtcbiAgICAgICAgICAgIHJldHVybiBkZWxlZ2F0ZS5pbnZva2UodGFyZ2V0LCBjYWxsYmFjaywgYXBwbHlUaGlzLCBhcHBseUFyZ3MsIHNvdXJjZSk7XG4gICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgIGlmICh6b25lLnNob3VsZENvYWxlc2NlUnVuQ2hhbmdlRGV0ZWN0aW9uKSB7XG4gICAgICAgICAgICAgIGRlbGF5Q2hhbmdlRGV0ZWN0aW9uRm9yRXZlbnRzRGVsZWdhdGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG9uTGVhdmUoem9uZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgb25IYXNUYXNrOlxuICAgICAgICAoZGVsZWdhdGU6IFpvbmVEZWxlZ2F0ZSwgY3VycmVudDogWm9uZSwgdGFyZ2V0OiBab25lLCBoYXNUYXNrU3RhdGU6IEhhc1Rhc2tTdGF0ZSkgPT4ge1xuICAgICAgICAgIGRlbGVnYXRlLmhhc1Rhc2sodGFyZ2V0LCBoYXNUYXNrU3RhdGUpO1xuICAgICAgICAgIGlmIChjdXJyZW50ID09PSB0YXJnZXQpIHtcbiAgICAgICAgICAgIC8vIFdlIGFyZSBvbmx5IGludGVyZXN0ZWQgaW4gaGFzVGFzayBldmVudHMgd2hpY2ggb3JpZ2luYXRlIGZyb20gb3VyIHpvbmVcbiAgICAgICAgICAgIC8vIChBIGNoaWxkIGhhc1Rhc2sgZXZlbnQgaXMgbm90IGludGVyZXN0aW5nIHRvIHVzKVxuICAgICAgICAgICAgaWYgKGhhc1Rhc2tTdGF0ZS5jaGFuZ2UgPT0gJ21pY3JvVGFzaycpIHtcbiAgICAgICAgICAgICAgem9uZS5faGFzUGVuZGluZ01pY3JvdGFza3MgPSBoYXNUYXNrU3RhdGUubWljcm9UYXNrO1xuICAgICAgICAgICAgICB1cGRhdGVNaWNyb1Rhc2tTdGF0dXMoem9uZSk7XG4gICAgICAgICAgICAgIGNoZWNrU3RhYmxlKHpvbmUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChoYXNUYXNrU3RhdGUuY2hhbmdlID09ICdtYWNyb1Rhc2snKSB7XG4gICAgICAgICAgICAgIHpvbmUuaGFzUGVuZGluZ01hY3JvdGFza3MgPSBoYXNUYXNrU3RhdGUubWFjcm9UYXNrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgIG9uSGFuZGxlRXJyb3I6IChkZWxlZ2F0ZTogWm9uZURlbGVnYXRlLCBjdXJyZW50OiBab25lLCB0YXJnZXQ6IFpvbmUsIGVycm9yOiBhbnkpOiBib29sZWFuID0+IHtcbiAgICAgIGRlbGVnYXRlLmhhbmRsZUVycm9yKHRhcmdldCwgZXJyb3IpO1xuICAgICAgem9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB6b25lLm9uRXJyb3IuZW1pdChlcnJvcikpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZU1pY3JvVGFza1N0YXR1cyh6b25lOiBOZ1pvbmVQcml2YXRlKSB7XG4gIGlmICh6b25lLl9oYXNQZW5kaW5nTWljcm90YXNrcyB8fFxuICAgICAgKCh6b25lLnNob3VsZENvYWxlc2NlRXZlbnRDaGFuZ2VEZXRlY3Rpb24gfHwgem9uZS5zaG91bGRDb2FsZXNjZVJ1bkNoYW5nZURldGVjdGlvbikgJiZcbiAgICAgICB6b25lLmxhc3RSZXF1ZXN0QW5pbWF0aW9uRnJhbWVJZCAhPT0gLTEpKSB7XG4gICAgem9uZS5oYXNQZW5kaW5nTWljcm90YXNrcyA9IHRydWU7XG4gIH0gZWxzZSB7XG4gICAgem9uZS5oYXNQZW5kaW5nTWljcm90YXNrcyA9IGZhbHNlO1xuICB9XG59XG5cbmZ1bmN0aW9uIG9uRW50ZXIoem9uZTogTmdab25lUHJpdmF0ZSkge1xuICB6b25lLl9uZXN0aW5nKys7XG4gIGlmICh6b25lLmlzU3RhYmxlKSB7XG4gICAgem9uZS5pc1N0YWJsZSA9IGZhbHNlO1xuICAgIHpvbmUub25VbnN0YWJsZS5lbWl0KG51bGwpO1xuICB9XG59XG5cbmZ1bmN0aW9uIG9uTGVhdmUoem9uZTogTmdab25lUHJpdmF0ZSkge1xuICB6b25lLl9uZXN0aW5nLS07XG4gIGNoZWNrU3RhYmxlKHpvbmUpO1xufVxuXG4vKipcbiAqIFByb3ZpZGVzIGEgbm9vcCBpbXBsZW1lbnRhdGlvbiBvZiBgTmdab25lYCB3aGljaCBkb2VzIG5vdGhpbmcuIFRoaXMgem9uZSByZXF1aXJlcyBleHBsaWNpdCBjYWxsc1xuICogdG8gZnJhbWV3b3JrIHRvIHBlcmZvcm0gcmVuZGVyaW5nLlxuICovXG5leHBvcnQgY2xhc3MgTm9vcE5nWm9uZSBpbXBsZW1lbnRzIE5nWm9uZSB7XG4gIHJlYWRvbmx5IGhhc1BlbmRpbmdNaWNyb3Rhc2tzOiBib29sZWFuID0gZmFsc2U7XG4gIHJlYWRvbmx5IGhhc1BlbmRpbmdNYWNyb3Rhc2tzOiBib29sZWFuID0gZmFsc2U7XG4gIHJlYWRvbmx5IGlzU3RhYmxlOiBib29sZWFuID0gdHJ1ZTtcbiAgcmVhZG9ubHkgb25VbnN0YWJsZTogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gIHJlYWRvbmx5IG9uTWljcm90YXNrRW1wdHk6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICByZWFkb25seSBvblN0YWJsZTogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gIHJlYWRvbmx5IG9uRXJyb3I6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gIHJ1bjxUPihmbjogKC4uLmFyZ3M6IGFueVtdKSA9PiBULCBhcHBseVRoaXM/OiBhbnksIGFwcGx5QXJncz86IGFueSk6IFQge1xuICAgIHJldHVybiBmbi5hcHBseShhcHBseVRoaXMsIGFwcGx5QXJncyk7XG4gIH1cblxuICBydW5HdWFyZGVkPFQ+KGZuOiAoLi4uYXJnczogYW55W10pID0+IGFueSwgYXBwbHlUaGlzPzogYW55LCBhcHBseUFyZ3M/OiBhbnkpOiBUIHtcbiAgICByZXR1cm4gZm4uYXBwbHkoYXBwbHlUaGlzLCBhcHBseUFyZ3MpO1xuICB9XG5cbiAgcnVuT3V0c2lkZUFuZ3VsYXI8VD4oZm46ICguLi5hcmdzOiBhbnlbXSkgPT4gVCk6IFQge1xuICAgIHJldHVybiBmbigpO1xuICB9XG5cbiAgcnVuVGFzazxUPihmbjogKC4uLmFyZ3M6IGFueVtdKSA9PiBULCBhcHBseVRoaXM/OiBhbnksIGFwcGx5QXJncz86IGFueSwgbmFtZT86IHN0cmluZyk6IFQge1xuICAgIHJldHVybiBmbi5hcHBseShhcHBseVRoaXMsIGFwcGx5QXJncyk7XG4gIH1cbn1cbiJdfQ==