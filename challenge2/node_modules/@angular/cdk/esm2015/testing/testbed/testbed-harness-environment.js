/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { handleAutoChangeDetectionStatus, HarnessEnvironment, stopHandlingAutoChangeDetectionStatus } from '@angular/cdk/testing';
import { flush } from '@angular/core/testing';
import { takeWhile } from 'rxjs/operators';
import { TaskStateZoneInterceptor } from './task-state-zone-interceptor';
import { UnitTestElement } from './unit-test-element';
/** The default environment options. */
const defaultEnvironmentOptions = {
    queryFn: (selector, root) => root.querySelectorAll(selector)
};
/** Whether auto change detection is currently disabled. */
let disableAutoChangeDetection = false;
/**
 * The set of non-destroyed fixtures currently being used by `TestbedHarnessEnvironment` instances.
 */
const activeFixtures = new Set();
/**
 * Installs a handler for change detection batching status changes for a specific fixture.
 * @param fixture The fixture to handle change detection batching for.
 */
function installAutoChangeDetectionStatusHandler(fixture) {
    if (!activeFixtures.size) {
        handleAutoChangeDetectionStatus(({ isDisabled, onDetectChangesNow }) => {
            disableAutoChangeDetection = isDisabled;
            if (onDetectChangesNow) {
                Promise.all(Array.from(activeFixtures).map(detectChanges)).then(onDetectChangesNow);
            }
        });
    }
    activeFixtures.add(fixture);
}
/**
 * Uninstalls a handler for change detection batching status changes for a specific fixture.
 * @param fixture The fixture to stop handling change detection batching for.
 */
function uninstallAutoChangeDetectionStatusHandler(fixture) {
    activeFixtures.delete(fixture);
    if (!activeFixtures.size) {
        stopHandlingAutoChangeDetectionStatus();
    }
}
/** Whether we are currently in the fake async zone. */
function isInFakeAsyncZone() {
    return Zone.current.get('FakeAsyncTestZoneSpec') != null;
}
/**
 * Triggers change detection for a specific fixture.
 * @param fixture The fixture to trigger change detection for.
 */
function detectChanges(fixture) {
    return __awaiter(this, void 0, void 0, function* () {
        fixture.detectChanges();
        if (isInFakeAsyncZone()) {
            flush();
        }
        else {
            yield fixture.whenStable();
        }
    });
}
/** A `HarnessEnvironment` implementation for Angular's Testbed. */
export class TestbedHarnessEnvironment extends HarnessEnvironment {
    constructor(rawRootElement, _fixture, options) {
        super(rawRootElement);
        this._fixture = _fixture;
        /** Whether the environment has been destroyed. */
        this._destroyed = false;
        this._options = Object.assign(Object.assign({}, defaultEnvironmentOptions), options);
        this._taskState = TaskStateZoneInterceptor.setup();
        installAutoChangeDetectionStatusHandler(_fixture);
        _fixture.componentRef.onDestroy(() => {
            uninstallAutoChangeDetectionStatusHandler(_fixture);
            this._destroyed = true;
        });
    }
    /** Creates a `HarnessLoader` rooted at the given fixture's root element. */
    static loader(fixture, options) {
        return new TestbedHarnessEnvironment(fixture.nativeElement, fixture, options);
    }
    /**
     * Creates a `HarnessLoader` at the document root. This can be used if harnesses are
     * located outside of a fixture (e.g. overlays appended to the document body).
     */
    static documentRootLoader(fixture, options) {
        return new TestbedHarnessEnvironment(document.body, fixture, options);
    }
    /** Gets the native DOM element corresponding to the given TestElement. */
    static getNativeElement(el) {
        if (el instanceof UnitTestElement) {
            return el.element;
        }
        throw Error('This TestElement was not created by the TestbedHarnessEnvironment');
    }
    /**
     * Creates an instance of the given harness type, using the fixture's root element as the
     * harness's host element. This method should be used when creating a harness for the root element
     * of a fixture, as components do not have the correct selector when they are created as the root
     * of the fixture.
     */
    static harnessForFixture(fixture, harnessType, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const environment = new TestbedHarnessEnvironment(fixture.nativeElement, fixture, options);
            yield environment.forceStabilize();
            return environment.createComponentHarness(harnessType, fixture.nativeElement);
        });
    }
    /**
     * Flushes change detection and async tasks captured in the Angular zone.
     * In most cases it should not be necessary to call this manually. However, there may be some edge
     * cases where it is needed to fully flush animation events.
     */
    forceStabilize() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!disableAutoChangeDetection) {
                if (this._destroyed) {
                    throw Error('Harness is attempting to use a fixture that has already been destroyed.');
                }
                yield detectChanges(this._fixture);
            }
        });
    }
    /**
     * Waits for all scheduled or running async tasks to complete. This allows harness
     * authors to wait for async tasks outside of the Angular zone.
     */
    waitForTasksOutsideAngular() {
        return __awaiter(this, void 0, void 0, function* () {
            // If we run in the fake async zone, we run "flush" to run any scheduled tasks. This
            // ensures that the harnesses behave inside of the FakeAsyncTestZone similar to the
            // "AsyncTestZone" and the root zone (i.e. neither fakeAsync or async). Note that we
            // cannot just rely on the task state observable to become stable because the state will
            // never change. This is because the task queue will be only drained if the fake async
            // zone is being flushed.
            if (isInFakeAsyncZone()) {
                flush();
            }
            // Wait until the task queue has been drained and the zone is stable. Note that
            // we cannot rely on "fixture.whenStable" since it does not catch tasks scheduled
            // outside of the Angular zone. For test harnesses, we want to ensure that the
            // app is fully stabilized and therefore need to use our own zone interceptor.
            yield this._taskState.pipe(takeWhile(state => !state.stable)).toPromise();
        });
    }
    /** Gets the root element for the document. */
    getDocumentRoot() {
        return document.body;
    }
    /** Creates a `TestElement` from a raw element. */
    createTestElement(element) {
        return new UnitTestElement(element, () => this.forceStabilize());
    }
    /** Creates a `HarnessLoader` rooted at the given raw element. */
    createEnvironment(element) {
        return new TestbedHarnessEnvironment(element, this._fixture, this._options);
    }
    /**
     * Gets a list of all elements matching the given selector under this environment's root element.
     */
    getAllRawElements(selector) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.forceStabilize();
            return Array.from(this._options.queryFn(selector, this.rawRootElement));
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdGJlZC1oYXJuZXNzLWVudmlyb25tZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay90ZXN0aW5nL3Rlc3RiZWQvdGVzdGJlZC1oYXJuZXNzLWVudmlyb25tZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEVBR0wsK0JBQStCLEVBQy9CLGtCQUFrQixFQUVsQixxQ0FBcUMsRUFFdEMsTUFBTSxzQkFBc0IsQ0FBQztBQUM5QixPQUFPLEVBQW1CLEtBQUssRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBRTlELE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUN6QyxPQUFPLEVBQVksd0JBQXdCLEVBQUMsTUFBTSwrQkFBK0IsQ0FBQztBQUNsRixPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFRcEQsdUNBQXVDO0FBQ3ZDLE1BQU0seUJBQXlCLEdBQXFDO0lBQ2xFLE9BQU8sRUFBRSxDQUFDLFFBQWdCLEVBQUUsSUFBYSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDO0NBQzlFLENBQUM7QUFFRiwyREFBMkQ7QUFDM0QsSUFBSSwwQkFBMEIsR0FBRyxLQUFLLENBQUM7QUFFdkM7O0dBRUc7QUFDSCxNQUFNLGNBQWMsR0FBRyxJQUFJLEdBQUcsRUFBNkIsQ0FBQztBQUU1RDs7O0dBR0c7QUFDSCxTQUFTLHVDQUF1QyxDQUFDLE9BQWtDO0lBQ2pGLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFO1FBQ3hCLCtCQUErQixDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUUsa0JBQWtCLEVBQUMsRUFBRSxFQUFFO1lBQ25FLDBCQUEwQixHQUFHLFVBQVUsQ0FBQztZQUN4QyxJQUFJLGtCQUFrQixFQUFFO2dCQUN0QixPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJ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O1lBQ2hELE1BQU0sSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQzVCLE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7UUFDMUUsQ0FBQztLQUFBO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgQ29tcG9uZW50SGFybmVzcyxcbiAgQ29tcG9uZW50SGFybmVzc0NvbnN0cnVjdG9yLFxuICBoYW5kbGVBdXRvQ2hhbmdlRGV0ZWN0aW9uU3RhdHVzLFxuICBIYXJuZXNzRW52aXJvbm1lbnQsXG4gIEhhcm5lc3NMb2FkZXIsXG4gIHN0b3BIYW5kbGluZ0F1dG9DaGFuZ2VEZXRlY3Rpb25TdGF0dXMsXG4gIFRlc3RFbGVtZW50XG59IGZyb20gJ0Bhbmd1bGFyL2Nkay90ZXN0aW5nJztcbmltcG9ydCB7Q29tcG9uZW50Rml4dHVyZSwgZmx1c2h9IGZyb20gJ0Bhbmd1bGFyL2NvcmUvdGVzdGluZyc7XG5pbXBvcnQge09ic2VydmFibGV9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHt0YWtlV2hpbGV9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7VGFza1N0YXRlLCBUYXNrU3RhdGVab25lSW50ZXJjZXB0b3J9IGZyb20gJy4vdGFzay1zdGF0ZS16b25lLWludGVyY2VwdG9yJztcbmltcG9ydCB7VW5pdFRlc3RFbGVtZW50fSBmcm9tICcuL3VuaXQtdGVzdC1lbGVtZW50JztcblxuLyoqIE9wdGlvbnMgdG8gY29uZmlndXJlIHRoZSBlbnZpcm9ubWVudC4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVGVzdGJlZEhhcm5lc3NFbnZpcm9ubWVudE9wdGlvbnMge1xuICAvKiogVGhlIHF1ZXJ5IGZ1bmN0aW9uIHVzZWQgdG8gZmluZCBET00gZWxlbWVudHMuICovXG4gIHF1ZXJ5Rm46IChzZWxlY3Rvcjogc3RyaW5nLCByb290OiBFbGVtZW50KSA9PiBJdGVyYWJsZTxFbGVtZW50PiB8IEFycmF5TGlrZTxFbGVtZW50Pjtcbn1cblxuLyoqIFRoZSBkZWZhdWx0IGVudmlyb25tZW50IG9wdGlvbnMuICovXG5jb25zdCBkZWZhdWx0RW52aXJvbm1lbnRPcHRpb25zOiBUZXN0YmVkSGFybmVzc0Vudmlyb25tZW50T3B0aW9ucyA9IHtcbiAgcXVlcnlGbjogKHNlbGVjdG9yOiBzdHJpbmcsIHJvb3Q6IEVsZW1lbnQpID0+IHJvb3QucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcilcbn07XG5cbi8qKiBXaGV0aGVyIGF1dG8gY2hhbmdlIGRldGVjdGlvbiBpcyBjdXJyZW50bHkgZGlzYWJsZWQuICovXG5sZXQgZGlzYWJsZUF1dG9DaGFuZ2VEZXRlY3Rpb24gPSBmYWxzZTtcblxuLyoqXG4gKiBUaGUgc2V0IG9mIG5vbi1kZXN0cm95ZWQgZml4dHVyZXMgY3VycmVudGx5IGJlaW5nIHVzZWQgYnkgYFRlc3RiZWRIYXJuZXNzRW52aXJvbm1lbnRgIGluc3RhbmNlcy5cbiAqL1xuY29uc3QgYWN0aXZlRml4dHVyZXMgPSBuZXcgU2V0PENvbXBvbmVudEZpeHR1cmU8dW5rbm93bj4+KCk7XG5cbi8qKlxuICogSW5zdGFsbHMgYSBoYW5kbGVyIGZvciBjaGFuZ2UgZGV0ZWN0aW9uIGJhdGNoaW5nIHN0YXR1cyBjaGFuZ2VzIGZvciBhIHNwZWNpZmljIGZpeHR1cmUuXG4gKiBAcGFyYW0gZml4dHVyZSBUaGUgZml4dHVyZSB0byBoYW5kbGUgY2hhbmdlIGRldGVjdGlvbiBiYXRjaGluZyBmb3IuXG4gKi9cbmZ1bmN0aW9uIGluc3RhbGxBdXRvQ2hhbmdlRGV0ZWN0aW9uU3RhdHVzSGFuZGxlcihmaXh0dXJlOiBDb21wb25lbnRGaXh0dXJlPHVua25vd24+KSB7XG4gIGlmICghYWN0aXZlRml4dHVyZXMuc2l6ZSkge1xuICAgIGhhbmRsZUF1dG9DaGFuZ2VEZXRlY3Rpb25TdGF0dXMoKHtpc0Rpc2FibGVkLCBvbkRldGVjdENoYW5nZXNOb3d9KSA9PiB7XG4gICAgICBkaXNhYmxlQXV0b0NoYW5nZURldGVjdGlvbiA9IGlzRGlzYWJsZWQ7XG4gICAgICBpZiAob25EZXRlY3RDaGFuZ2VzTm93KSB7XG4gICAgICAgIFByb21pc2UuYWxsKEFycmF5LmZyb20oYWN0aXZlRml4dHVyZXMpLm1hcChkZXRlY3RDaGFuZ2VzKSkudGhlbihvbkRldGVjdENoYW5nZXNOb3cpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIGFjdGl2ZUZpeHR1cmVzLmFkZChmaXh0dXJlKTtcbn1cblxuLyoqXG4gKiBVbmluc3RhbGxzIGEgaGFuZGxlciBmb3IgY2hhbmdlIGRldGVjdGlvbiBiYXRjaGluZyBzdGF0dXMgY2hhbmdlcyBmb3IgYSBzcGVjaWZpYyBmaXh0dXJlLlxuICogQHBhcmFtIGZpeHR1cmUgVGhlIGZpeHR1cmUgdG8gc3RvcCBoYW5kbGluZyBjaGFuZ2UgZGV0ZWN0aW9uIGJhdGNoaW5nIGZvci5cbiAqL1xuZnVuY3Rpb24gdW5pbnN0YWxsQXV0b0NoYW5nZURldGVjdGlvblN0YXR1c0hhbmRsZXIoZml4dHVyZTogQ29tcG9uZW50Rml4dHVyZTx1bmtub3duPikge1xuICBhY3RpdmVGaXh0dXJlcy5kZWxldGUoZml4dHVyZSk7XG4gIGlmICghYWN0aXZlRml4dHVyZXMuc2l6ZSkge1xuICAgIHN0b3BIYW5kbGluZ0F1dG9DaGFuZ2VEZXRlY3Rpb25TdGF0dXMoKTtcbiAgfVxufVxuXG4vKiogV2hldGhlciB3ZSBhcmUgY3VycmVudGx5IGluIHRoZSBmYWtlIGFzeW5jIHpvbmUuICovXG5mdW5jdGlvbiBpc0luRmFrZUFzeW5jWm9uZSgpIHtcbiAgcmV0dXJuIFpvbmUhLmN1cnJlbnQuZ2V0KCdGYWtlQXN5bmNUZXN0Wm9uZVNwZWMnKSAhPSBudWxsO1xufVxuXG4vKipcbiAqIFRyaWdnZXJzIGNoYW5nZSBkZXRlY3Rpb24gZm9yIGEgc3BlY2lmaWMgZml4dHVyZS5cbiAqIEBwYXJhbSBmaXh0dXJlIFRoZSBmaXh0dXJlIHRvIHRyaWdnZXIgY2hhbmdlIGRldGVjdGlvbiBmb3IuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGRldGVjdENoYW5nZXMoZml4dHVyZTogQ29tcG9uZW50Rml4dHVyZTx1bmtub3duPikge1xuICBmaXh0dXJlLmRldGVjdENoYW5nZXMoKTtcbiAgaWYgKGlzSW5GYWtlQXN5bmNab25lKCkpIHtcbiAgICBmbHVzaCgpO1xuICB9IGVsc2Uge1xuICAgIGF3YWl0IGZpeHR1cmUud2hlblN0YWJsZSgpO1xuICB9XG59XG5cbi8qKiBBIGBIYXJuZXNzRW52aXJvbm1lbnRgIGltcGxlbWVudGF0aW9uIGZvciBBbmd1bGFyJ3MgVGVzdGJlZC4gKi9cbmV4cG9ydCBjbGFzcyBUZXN0YmVkSGFybmVzc0Vudmlyb25tZW50IGV4dGVuZHMgSGFybmVzc0Vudmlyb25tZW50PEVsZW1lbnQ+IHtcbiAgLyoqIFdoZXRoZXIgdGhlIGVudmlyb25tZW50IGhhcyBiZWVuIGRlc3Ryb3llZC4gKi9cbiAgcHJpdmF0ZSBfZGVzdHJveWVkID0gZmFsc2U7XG5cbiAgLyoqIE9ic2VydmFibGUgdGhhdCBlbWl0cyB3aGVuZXZlciB0aGUgdGVzdCB0YXNrIHN0YXRlIGNoYW5nZXMuICovXG4gIHByaXZhdGUgX3Rhc2tTdGF0ZTogT2JzZXJ2YWJsZTxUYXNrU3RhdGU+O1xuXG4gIC8qKiBUaGUgb3B0aW9ucyBmb3IgdGhpcyBlbnZpcm9ubWVudC4gKi9cbiAgcHJpdmF0ZSBfb3B0aW9uczogVGVzdGJlZEhhcm5lc3NFbnZpcm9ubWVudE9wdGlvbnM7XG5cbiAgcHJvdGVjdGVkIGNvbnN0cnVjdG9yKHJhd1Jvb3RFbGVtZW50OiBFbGVtZW50LCBwcml2YXRlIF9maXh0dXJlOiBDb21wb25lbnRGaXh0dXJlPHVua25vd24+LFxuICAgICAgb3B0aW9ucz86IFRlc3RiZWRIYXJuZXNzRW52aXJvbm1lbnRPcHRpb25zKSB7XG4gICAgc3VwZXIocmF3Um9vdEVsZW1lbnQpO1xuICAgIHRoaXMuX29wdGlvbnMgPSB7Li4uZGVmYXVsdEVudmlyb25tZW50T3B0aW9ucywgLi4ub3B0aW9uc307XG4gICAgdGhpcy5fdGFza1N0YXRlID0gVGFza1N0YXRlWm9uZUludGVyY2VwdG9yLnNldHVwKCk7XG4gICAgaW5zdGFsbEF1dG9DaGFuZ2VEZXRlY3Rpb25TdGF0dXNIYW5kbGVyKF9maXh0dXJlKTtcbiAgICBfZml4dHVyZS5jb21wb25lbnRSZWYub25EZXN0cm95KCgpID0+IHtcbiAgICAgIHVuaW5zdGFsbEF1dG9DaGFuZ2VEZXRlY3Rpb25TdGF0dXNIYW5kbGVyKF9maXh0dXJlKTtcbiAgICAgIHRoaXMuX2Rlc3Ryb3llZCA9IHRydWU7XG4gICAgfSk7XG4gIH1cblxuICAvKiogQ3JlYXRlcyBhIGBIYXJuZXNzTG9hZGVyYCByb290ZWQgYXQgdGhlIGdpdmVuIGZpeHR1cmUncyByb290IGVsZW1lbnQuICovXG4gIHN0YXRpYyBsb2FkZXIoZml4dHVyZTogQ29tcG9uZW50Rml4dHVyZTx1bmtub3duPiwgb3B0aW9ucz86IFRlc3RiZWRIYXJuZXNzRW52aXJvbm1lbnRPcHRpb25zKTpcbiAgICAgIEhhcm5lc3NMb2FkZXIge1xuICAgIHJldHVybiBuZXcgVGVzdGJlZEhhcm5lc3NFbnZpcm9ubWVudChmaXh0dXJlLm5hdGl2ZUVsZW1lbnQsIGZpeHR1cmUsIG9wdGlvbnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBgSGFybmVzc0xvYWRlcmAgYXQgdGhlIGRvY3VtZW50IHJvb3QuIFRoaXMgY2FuIGJlIHVzZWQgaWYgaGFybmVzc2VzIGFyZVxuICAgKiBsb2NhdGVkIG91dHNpZGUgb2YgYSBmaXh0dXJlIChlLmcuIG92ZXJsYXlzIGFwcGVuZGVkIHRvIHRoZSBkb2N1bWVudCBib2R5KS5cbiAgICovXG4gIHN0YXRpYyBkb2N1bWVudFJvb3RMb2FkZXIoZml4dHVyZTogQ29tcG9uZW50Rml4dHVyZTx1bmtub3duPixcbiAgICAgIG9wdGlvbnM/OiBUZXN0YmVkSGFybmVzc0Vudmlyb25tZW50T3B0aW9ucyk6IEhhcm5lc3NMb2FkZXIge1xuICAgIHJldHVybiBuZXcgVGVzdGJlZEhhcm5lc3NFbnZpcm9ubWVudChkb2N1bWVudC5ib2R5LCBmaXh0dXJlLCBvcHRpb25zKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBuYXRpdmUgRE9NIGVsZW1lbnQgY29ycmVzcG9uZGluZyB0byB0aGUgZ2l2ZW4gVGVzdEVsZW1lbnQuICovXG4gIHN0YXRpYyBnZXROYXRpdmVFbGVtZW50KGVsOiBUZXN0RWxlbWVudCk6IEVsZW1lbnQge1xuICAgIGlmIChlbCBpbnN0YW5jZW9mIFVuaXRUZXN0RWxlbWVudCkge1xuICAgICAgcmV0dXJuIGVsLmVsZW1lbnQ7XG4gICAgfVxuICAgIHRocm93IEVycm9yKCdUaGlzIFRlc3RFbGVtZW50IHdhcyBub3QgY3JlYXRlZCBieSB0aGUgVGVzdGJlZEhhcm5lc3NFbnZpcm9ubWVudCcpO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW4gaW5zdGFuY2Ugb2YgdGhlIGdpdmVuIGhhcm5lc3MgdHlwZSwgdXNpbmcgdGhlIGZpeHR1cmUncyByb290IGVsZW1lbnQgYXMgdGhlXG4gICAqIGhhcm5lc3MncyBob3N0IGVsZW1lbnQuIFRoaXMgbWV0aG9kIHNob3VsZCBiZSB1c2VkIHdoZW4gY3JlYXRpbmcgYSBoYXJuZXNzIGZvciB0aGUgcm9vdCBlbGVtZW50XG4gICAqIG9mIGEgZml4dHVyZSwgYXMgY29tcG9uZW50cyBkbyBub3QgaGF2ZSB0aGUgY29ycmVjdCBzZWxlY3RvciB3aGVuIHRoZXkgYXJlIGNyZWF0ZWQgYXMgdGhlIHJvb3RcbiAgICogb2YgdGhlIGZpeHR1cmUuXG4gICAqL1xuICBzdGF0aWMgYXN5bmMgaGFybmVzc0ZvckZpeHR1cmU8VCBleHRlbmRzIENvbXBvbmVudEhhcm5lc3M+KFxuICAgICAgZml4dHVyZTogQ29tcG9uZW50Rml4dHVyZTx1bmtub3duPiwgaGFybmVzc1R5cGU6IENvbXBvbmVudEhhcm5lc3NDb25zdHJ1Y3RvcjxUPixcbiAgICAgIG9wdGlvbnM/OiBUZXN0YmVkSGFybmVzc0Vudmlyb25tZW50T3B0aW9ucyk6IFByb21pc2U8VD4ge1xuICAgIGNvbnN0IGVudmlyb25tZW50ID0gbmV3IFRlc3RiZWRIYXJuZXNzRW52aXJvbm1lbnQoZml4dHVyZS5uYXRpdmVFbGVtZW50LCBmaXh0dXJlLCBvcHRpb25zKTtcbiAgICBhd2FpdCBlbnZpcm9ubWVudC5mb3JjZVN0YWJpbGl6ZSgpO1xuICAgIHJldHVybiBlbnZpcm9ubWVudC5jcmVhdGVDb21wb25lbnRIYXJuZXNzKGhhcm5lc3NUeXBlLCBmaXh0dXJlLm5hdGl2ZUVsZW1lbnQpO1xuICB9XG5cbiAgLyoqXG4gICAqIEZsdXNoZXMgY2hhbmdlIGRldGVjdGlvbiBhbmQgYXN5bmMgdGFza3MgY2FwdHVyZWQgaW4gdGhlIEFuZ3VsYXIgem9uZS5cbiAgICogSW4gbW9zdCBjYXNlcyBpdCBzaG91bGQgbm90IGJlIG5lY2Vzc2FyeSB0byBjYWxsIHRoaXMgbWFudWFsbHkuIEhvd2V2ZXIsIHRoZXJlIG1heSBiZSBzb21lIGVkZ2VcbiAgICogY2FzZXMgd2hlcmUgaXQgaXMgbmVlZGVkIHRvIGZ1bGx5IGZsdXNoIGFuaW1hdGlvbiBldmVudHMuXG4gICAqL1xuICBhc3luYyBmb3JjZVN0YWJpbGl6ZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoIWRpc2FibGVBdXRvQ2hhbmdlRGV0ZWN0aW9uKSB7XG4gICAgICBpZiAodGhpcy5fZGVzdHJveWVkKSB7XG4gICAgICAgIHRocm93IEVycm9yKCdIYXJuZXNzIGlzIGF0dGVtcHRpbmcgdG8gdXNlIGEgZml4dHVyZSB0aGF0IGhhcyBhbHJlYWR5IGJlZW4gZGVzdHJveWVkLicpO1xuICAgICAgfVxuXG4gICAgICBhd2FpdCBkZXRlY3RDaGFuZ2VzKHRoaXMuX2ZpeHR1cmUpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBXYWl0cyBmb3IgYWxsIHNjaGVkdWxlZCBvciBydW5uaW5nIGFzeW5jIHRhc2tzIHRvIGNvbXBsZXRlLiBUaGlzIGFsbG93cyBoYXJuZXNzXG4gICAqIGF1dGhvcnMgdG8gd2FpdCBmb3IgYXN5bmMgdGFza3Mgb3V0c2lkZSBvZiB0aGUgQW5ndWxhciB6b25lLlxuICAgKi9cbiAgYXN5bmMgd2FpdEZvclRhc2tzT3V0c2lkZUFuZ3VsYXIoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgLy8gSWYgd2UgcnVuIGluIHRoZSBmYWtlIGFzeW5jIHpvbmUsIHdlIHJ1biBcImZsdXNoXCIgdG8gcnVuIGFueSBzY2hlZHVsZWQgdGFza3MuIFRoaXNcbiAgICAvLyBlbnN1cmVzIHRoYXQgdGhlIGhhcm5lc3NlcyBiZWhhdmUgaW5zaWRlIG9mIHRoZSBGYWtlQXN5bmNUZXN0Wm9uZSBzaW1pbGFyIHRvIHRoZVxuICAgIC8vIFwiQXN5bmNUZXN0Wm9uZVwiIGFuZCB0aGUgcm9vdCB6b25lIChpLmUuIG5laXRoZXIgZmFrZUFzeW5jIG9yIGFzeW5jKS4gTm90ZSB0aGF0IHdlXG4gICAgLy8gY2Fubm90IGp1c3QgcmVseSBvbiB0aGUgdGFzayBzdGF0ZSBvYnNlcnZhYmxlIHRvIGJlY29tZSBzdGFibGUgYmVjYXVzZSB0aGUgc3RhdGUgd2lsbFxuICAgIC8vIG5ldmVyIGNoYW5nZS4gVGhpcyBpcyBiZWNhdXNlIHRoZSB0YXNrIHF1ZXVlIHdpbGwgYmUgb25seSBkcmFpbmVkIGlmIHRoZSBmYWtlIGFzeW5jXG4gICAgLy8gem9uZSBpcyBiZWluZyBmbHVzaGVkLlxuICAgIGlmIChpc0luRmFrZUFzeW5jWm9uZSgpKSB7XG4gICAgICBmbHVzaCgpO1xuICAgIH1cblxuICAgIC8vIFdhaXQgdW50aWwgdGhlIHRhc2sgcXVldWUgaGFzIGJlZW4gZHJhaW5lZCBhbmQgdGhlIHpvbmUgaXMgc3RhYmxlLiBOb3RlIHRoYXRcbiAgICAvLyB3ZSBjYW5ub3QgcmVseSBvbiBcImZpeHR1cmUud2hlblN0YWJsZVwiIHNpbmNlIGl0IGRvZXMgbm90IGNhdGNoIHRhc2tzIHNjaGVkdWxlZFxuICAgIC8vIG91dHNpZGUgb2YgdGhlIEFuZ3VsYXIgem9uZS4gRm9yIHRlc3QgaGFybmVzc2VzLCB3ZSB3YW50IHRvIGVuc3VyZSB0aGF0IHRoZVxuICAgIC8vIGFwcCBpcyBmdWxseSBzdGFiaWxpemVkIGFuZCB0aGVyZWZvcmUgbmVlZCB0byB1c2Ugb3VyIG93biB6b25lIGludGVyY2VwdG9yLlxuICAgIGF3YWl0IHRoaXMuX3Rhc2tTdGF0ZS5waXBlKHRha2VXaGlsZShzdGF0ZSA9PiAhc3RhdGUuc3RhYmxlKSkudG9Qcm9taXNlKCk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgcm9vdCBlbGVtZW50IGZvciB0aGUgZG9jdW1lbnQuICovXG4gIHByb3RlY3RlZCBnZXREb2N1bWVudFJvb3QoKTogRWxlbWVudCB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmJvZHk7XG4gIH1cblxuICAvKiogQ3JlYXRlcyBhIGBUZXN0RWxlbWVudGAgZnJvbSBhIHJhdyBlbGVtZW50LiAqL1xuICBwcm90ZWN0ZWQgY3JlYXRlVGVzdEVsZW1lbnQoZWxlbWVudDogRWxlbWVudCk6IFRlc3RFbGVtZW50IHtcbiAgICByZXR1cm4gbmV3IFVuaXRUZXN0RWxlbWVudChlbGVtZW50LCAoKSA9PiB0aGlzLmZvcmNlU3RhYmlsaXplKCkpO1xuICB9XG5cbiAgLyoqIENyZWF0ZXMgYSBgSGFybmVzc0xvYWRlcmAgcm9vdGVkIGF0IHRoZSBnaXZlbiByYXcgZWxlbWVudC4gKi9cbiAgcHJvdGVjdGVkIGNyZWF0ZUVudmlyb25tZW50KGVsZW1lbnQ6IEVsZW1lbnQpOiBIYXJuZXNzRW52aXJvbm1lbnQ8RWxlbWVudD4ge1xuICAgIHJldHVybiBuZXcgVGVzdGJlZEhhcm5lc3NFbnZpcm9ubWVudChlbGVtZW50LCB0aGlzLl9maXh0dXJlLCB0aGlzLl9vcHRpb25zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIGEgbGlzdCBvZiBhbGwgZWxlbWVudHMgbWF0Y2hpbmcgdGhlIGdpdmVuIHNlbGVjdG9yIHVuZGVyIHRoaXMgZW52aXJvbm1lbnQncyByb290IGVsZW1lbnQuXG4gICAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgZ2V0QWxsUmF3RWxlbWVudHMoc2VsZWN0b3I6IHN0cmluZyk6IFByb21pc2U8RWxlbWVudFtdPiB7XG4gICAgYXdhaXQgdGhpcy5mb3JjZVN0YWJpbGl6ZSgpO1xuICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMuX29wdGlvbnMucXVlcnlGbihzZWxlY3RvciwgdGhpcy5yYXdSb290RWxlbWVudCkpO1xuICB9XG59XG4iXX0=