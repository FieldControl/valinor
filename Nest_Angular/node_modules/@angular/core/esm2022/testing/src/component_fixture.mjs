/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ApplicationRef, getDebugNode, inject, NgZone, RendererFactory2, ɵdetectChangesInViewIfRequired, ɵEffectScheduler as EffectScheduler, ɵgetDeferBlocks as getDeferBlocks, ɵNoopNgZone as NoopNgZone, ɵPendingTasks as PendingTasks, } from '@angular/core';
import { Subscription } from 'rxjs';
import { DeferBlockFixture } from './defer';
import { ComponentFixtureAutoDetect, ComponentFixtureNoNgZone } from './test_bed_common';
import { TestBedApplicationErrorHandler } from './application_error_handler';
/**
 * Fixture for debugging and testing a component.
 *
 * @publicApi
 */
export class ComponentFixture {
    /** @nodoc */
    constructor(componentRef) {
        this.componentRef = componentRef;
        this._isDestroyed = false;
        /** @internal */
        this._noZoneOptionIsSet = inject(ComponentFixtureNoNgZone, { optional: true });
        /** @internal */
        this._ngZone = this._noZoneOptionIsSet ? new NoopNgZone() : inject(NgZone);
        /** @internal */
        this._effectRunner = inject(EffectScheduler);
        // Inject ApplicationRef to ensure NgZone stableness causes after render hooks to run
        // This will likely happen as a result of fixture.detectChanges because it calls ngZone.run
        // This is a crazy way of doing things but hey, it's the world we live in.
        // The zoneless scheduler should instead do this more imperatively by attaching
        // the `ComponentRef` to `ApplicationRef` and calling `appRef.tick` as the `detectChanges`
        // behavior.
        /** @internal */
        this._appRef = inject(ApplicationRef);
        /** @internal */
        this._testAppRef = this._appRef;
        this.pendingTasks = inject(PendingTasks);
        this.appErrorHandler = inject(TestBedApplicationErrorHandler);
        // TODO(atscott): Remove this from public API
        this.ngZone = this._noZoneOptionIsSet ? null : this._ngZone;
        this.changeDetectorRef = componentRef.changeDetectorRef;
        this.elementRef = componentRef.location;
        this.debugElement = getDebugNode(this.elementRef.nativeElement);
        this.componentInstance = componentRef.instance;
        this.nativeElement = this.elementRef.nativeElement;
        this.componentRef = componentRef;
    }
    /**
     * Do a change detection run to make sure there were no changes.
     */
    checkNoChanges() {
        this.changeDetectorRef.checkNoChanges();
    }
    /**
     * Return whether the fixture is currently stable or has async tasks that have not been completed
     * yet.
     */
    isStable() {
        return !this.pendingTasks.hasPendingTasks.value;
    }
    /**
     * Get a promise that resolves when the fixture is stable.
     *
     * This can be used to resume testing after events have triggered asynchronous activity or
     * asynchronous change detection.
     */
    whenStable() {
        if (this.isStable()) {
            return Promise.resolve(false);
        }
        return new Promise((resolve, reject) => {
            this.appErrorHandler.whenStableRejectFunctions.add(reject);
            this._appRef.whenStable().then(() => {
                this.appErrorHandler.whenStableRejectFunctions.delete(reject);
                resolve(true);
            });
        });
    }
    /**
     * Retrieves all defer block fixtures in the component fixture.
     */
    getDeferBlocks() {
        const deferBlocks = [];
        const lView = this.componentRef.hostView['_lView'];
        getDeferBlocks(lView, deferBlocks);
        const deferBlockFixtures = [];
        for (const block of deferBlocks) {
            deferBlockFixtures.push(new DeferBlockFixture(block, this));
        }
        return Promise.resolve(deferBlockFixtures);
    }
    _getRenderer() {
        if (this._renderer === undefined) {
            this._renderer = this.componentRef.injector.get(RendererFactory2, null);
        }
        return this._renderer;
    }
    /**
     * Get a promise that resolves when the ui state is stable following animations.
     */
    whenRenderingDone() {
        const renderer = this._getRenderer();
        if (renderer && renderer.whenRenderingDone) {
            return renderer.whenRenderingDone();
        }
        return this.whenStable();
    }
    /**
     * Trigger component destruction.
     */
    destroy() {
        if (!this._isDestroyed) {
            this.componentRef.destroy();
            this._isDestroyed = true;
        }
    }
}
/**
 * ComponentFixture behavior that actually attaches the component to the application to ensure
 * behaviors between fixture and application do not diverge. `detectChanges` is disabled by default
 * (instead, tests should wait for the scheduler to detect changes), `whenStable` is directly the
 * `ApplicationRef.isStable`, and `autoDetectChanges` cannot be disabled.
 */
export class ScheduledComponentFixture extends ComponentFixture {
    constructor() {
        super(...arguments);
        this._autoDetect = inject(ComponentFixtureAutoDetect, { optional: true }) ?? true;
    }
    initialize() {
        if (this._autoDetect) {
            this._appRef.attachView(this.componentRef.hostView);
        }
    }
    detectChanges(checkNoChanges = true) {
        if (!checkNoChanges) {
            throw new Error('Cannot disable `checkNoChanges` in this configuration. ' +
                'Use `fixture.componentRef.hostView.changeDetectorRef.detectChanges()` instead.');
        }
        this._effectRunner.flush();
        this._appRef.tick();
        this._effectRunner.flush();
    }
    autoDetectChanges(autoDetect = true) {
        if (!autoDetect) {
            throw new Error('Cannot disable autoDetect after it has been enabled when using the zoneless scheduler. ' +
                'To disable autoDetect, add `{provide: ComponentFixtureAutoDetect, useValue: false}` to the TestBed providers.');
        }
        else if (!this._autoDetect) {
            this._autoDetect = autoDetect;
            this._appRef.attachView(this.componentRef.hostView);
        }
        this.detectChanges();
    }
}
/**
 * ComponentFixture behavior that attempts to act as a "mini application".
 */
export class PseudoApplicationComponentFixture extends ComponentFixture {
    constructor() {
        super(...arguments);
        this._subscriptions = new Subscription();
        this._autoDetect = inject(ComponentFixtureAutoDetect, { optional: true }) ?? false;
        this.afterTickSubscription = undefined;
        this.beforeRenderSubscription = undefined;
    }
    initialize() {
        if (this._autoDetect) {
            this.subscribeToAppRefEvents();
        }
        this.componentRef.hostView.onDestroy(() => {
            this.unsubscribeFromAppRefEvents();
        });
        // Create subscriptions outside the NgZone so that the callbacks run outside
        // of NgZone.
        this._ngZone.runOutsideAngular(() => {
            this._subscriptions.add(this._ngZone.onError.subscribe({
                next: (error) => {
                    throw error;
                },
            }));
        });
    }
    detectChanges(checkNoChanges = true) {
        this._effectRunner.flush();
        // Run the change detection inside the NgZone so that any async tasks as part of the change
        // detection are captured by the zone and can be waited for in isStable.
        this._ngZone.run(() => {
            this.changeDetectorRef.detectChanges();
            if (checkNoChanges) {
                this.checkNoChanges();
            }
        });
        // Run any effects that were created/dirtied during change detection. Such effects might become
        // dirty in response to input signals changing.
        this._effectRunner.flush();
    }
    autoDetectChanges(autoDetect = true) {
        if (this._noZoneOptionIsSet) {
            throw new Error('Cannot call autoDetectChanges when ComponentFixtureNoNgZone is set.');
        }
        if (autoDetect !== this._autoDetect) {
            if (autoDetect) {
                this.subscribeToAppRefEvents();
            }
            else {
                this.unsubscribeFromAppRefEvents();
            }
        }
        this._autoDetect = autoDetect;
        this.detectChanges();
    }
    subscribeToAppRefEvents() {
        this._ngZone.runOutsideAngular(() => {
            this.afterTickSubscription = this._testAppRef.afterTick.subscribe(() => {
                this.checkNoChanges();
            });
            this.beforeRenderSubscription = this._testAppRef.beforeRender.subscribe((isFirstPass) => {
                try {
                    ɵdetectChangesInViewIfRequired(this.componentRef.hostView._lView, this.componentRef.hostView.notifyErrorHandler, isFirstPass, false /** zoneless enabled */);
                }
                catch (e) {
                    // If an error occurred during change detection, remove the test view from the application
                    // ref tracking. Note that this isn't exactly desirable but done this way because of how
                    // things used to work with `autoDetect` and uncaught errors. Ideally we would surface
                    // this error to the error handler instead and continue refreshing the view like
                    // what would happen in the application.
                    this.unsubscribeFromAppRefEvents();
                    throw e;
                }
            });
            this._testAppRef.externalTestViews.add(this.componentRef.hostView);
        });
    }
    unsubscribeFromAppRefEvents() {
        this.afterTickSubscription?.unsubscribe();
        this.beforeRenderSubscription?.unsubscribe();
        this.afterTickSubscription = undefined;
        this.beforeRenderSubscription = undefined;
        this._testAppRef.externalTestViews.delete(this.componentRef.hostView);
    }
    destroy() {
        this.unsubscribeFromAppRefEvents();
        this._subscriptions.unsubscribe();
        super.destroy();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50X2ZpeHR1cmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3Rlc3Rpbmcvc3JjL2NvbXBvbmVudF9maXh0dXJlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFDTCxjQUFjLEVBS2QsWUFBWSxFQUNaLE1BQU0sRUFDTixNQUFNLEVBQ04sZ0JBQWdCLEVBR2hCLDhCQUE4QixFQUM5QixnQkFBZ0IsSUFBSSxlQUFlLEVBQ25DLGVBQWUsSUFBSSxjQUFjLEVBQ2pDLFdBQVcsSUFBSSxVQUFVLEVBQ3pCLGFBQWEsSUFBSSxZQUFZLEdBQzlCLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBVSxZQUFZLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFFM0MsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sU0FBUyxDQUFDO0FBQzFDLE9BQU8sRUFBQywwQkFBMEIsRUFBRSx3QkFBd0IsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ3ZGLE9BQU8sRUFBQyw4QkFBOEIsRUFBQyxNQUFNLDZCQUE2QixDQUFDO0FBRTNFOzs7O0dBSUc7QUFDSCxNQUFNLE9BQWdCLGdCQUFnQjtJQWtEcEMsYUFBYTtJQUNiLFlBQW1CLFlBQTZCO1FBQTdCLGlCQUFZLEdBQVosWUFBWSxDQUFpQjtRQXhCeEMsaUJBQVksR0FBWSxLQUFLLENBQUM7UUFDdEMsZ0JBQWdCO1FBQ0csdUJBQWtCLEdBQUcsTUFBTSxDQUFDLHdCQUF3QixFQUFFLEVBQUMsUUFBUSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7UUFDM0YsZ0JBQWdCO1FBQ04sWUFBTyxHQUFXLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsSUFBSSxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3hGLGdCQUFnQjtRQUNOLGtCQUFhLEdBQUcs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QUMxQyxJQUFJLENBQUMsd0JBQXdCLEVBQUUsV0FBVyxFQUFFLENBQUM7UUFDN0MsSUFBSSxDQUFDLHFCQUFxQixHQUFHLFNBQVMsQ0FBQztRQUN2QyxJQUFJLENBQUMsd0JBQXdCLEdBQUcsU0FBUyxDQUFDO1FBQzFDLElBQUksQ0FBQyxXQUFXLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDeEUsQ0FBQztJQUVRLE9BQU87UUFDZCxJQUFJLENBQUMsMkJBQTJCLEVBQUUsQ0FBQztRQUNuQyxJQUFJLENBQUMsY0FBYyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ2xDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUNsQixDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIEFwcGxpY2F0aW9uUmVmLFxuICBDaGFuZ2VEZXRlY3RvclJlZixcbiAgQ29tcG9uZW50UmVmLFxuICBEZWJ1Z0VsZW1lbnQsXG4gIEVsZW1lbnRSZWYsXG4gIGdldERlYnVnTm9kZSxcbiAgaW5qZWN0LFxuICBOZ1pvbmUsXG4gIFJlbmRlcmVyRmFjdG9yeTIsXG4gIFZpZXdSZWYsXG4gIMm1RGVmZXJCbG9ja0RldGFpbHMgYXMgRGVmZXJCbG9ja0RldGFpbHMsXG4gIMm1ZGV0ZWN0Q2hhbmdlc0luVmlld0lmUmVxdWlyZWQsXG4gIMm1RWZmZWN0U2NoZWR1bGVyIGFzIEVmZmVjdFNjaGVkdWxlcixcbiAgybVnZXREZWZlckJsb2NrcyBhcyBnZXREZWZlckJsb2NrcyxcbiAgybVOb29wTmdab25lIGFzIE5vb3BOZ1pvbmUsXG4gIMm1UGVuZGluZ1Rhc2tzIGFzIFBlbmRpbmdUYXNrcyxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge1N1YmplY3QsIFN1YnNjcmlwdGlvbn0gZnJvbSAncnhqcyc7XG5cbmltcG9ydCB7RGVmZXJCbG9ja0ZpeHR1cmV9IGZyb20gJy4vZGVmZXInO1xuaW1wb3J0IHtDb21wb25lbnRGaXh0dXJlQXV0b0RldGVjdCwgQ29tcG9uZW50Rml4dHVyZU5vTmdab25lfSBmcm9tICcuL3Rlc3RfYmVkX2NvbW1vbic7XG5pbXBvcnQge1Rlc3RCZWRBcHBsaWNhdGlvbkVycm9ySGFuZGxlcn0gZnJvbSAnLi9hcHBsaWNhdGlvbl9lcnJvcl9oYW5kbGVyJztcblxuLyoqXG4gKiBGaXh0dXJlIGZvciBkZWJ1Z2dpbmcgYW5kIHRlc3RpbmcgYSBjb21wb25lbnQuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQ29tcG9uZW50Rml4dHVyZTxUPiB7XG4gIC8qKlxuICAgKiBUaGUgRGVidWdFbGVtZW50IGFzc29jaWF0ZWQgd2l0aCB0aGUgcm9vdCBlbGVtZW50IG9mIHRoaXMgY29tcG9uZW50LlxuICAgKi9cbiAgZGVidWdFbGVtZW50OiBEZWJ1Z0VsZW1lbnQ7XG5cbiAgLyoqXG4gICAqIFRoZSBpbnN0YW5jZSBvZiB0aGUgcm9vdCBjb21wb25lbnQgY2xhc3MuXG4gICAqL1xuICBjb21wb25lbnRJbnN0YW5jZTogVDtcblxuICAvKipcbiAgICogVGhlIG5hdGl2ZSBlbGVtZW50IGF0IHRoZSByb290IG9mIHRoZSBjb21wb25lbnQuXG4gICAqL1xuICBuYXRpdmVFbGVtZW50OiBhbnk7XG5cbiAgLyoqXG4gICAqIFRoZSBFbGVtZW50UmVmIGZvciB0aGUgZWxlbWVudCBhdCB0aGUgcm9vdCBvZiB0aGUgY29tcG9uZW50LlxuICAgKi9cbiAgZWxlbWVudFJlZjogRWxlbWVudFJlZjtcblxuICAvKipcbiAgICogVGhlIENoYW5nZURldGVjdG9yUmVmIGZvciB0aGUgY29tcG9uZW50XG4gICAqL1xuICBjaGFuZ2VEZXRlY3RvclJlZjogQ2hhbmdlRGV0ZWN0b3JSZWY7XG5cbiAgcHJpdmF0ZSBfcmVuZGVyZXI6IFJlbmRlcmVyRmFjdG9yeTIgfCBudWxsIHwgdW5kZWZpbmVkO1xuICBwcml2YXRlIF9pc0Rlc3Ryb3llZDogYm9vbGVhbiA9IGZhbHNlO1xuICAvKiogQGludGVybmFsICovXG4gIHByb3RlY3RlZCByZWFkb25seSBfbm9ab25lT3B0aW9uSXNTZXQgPSBpbmplY3QoQ29tcG9uZW50Rml4dHVyZU5vTmdab25lLCB7b3B0aW9uYWw6IHRydWV9KTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBwcm90ZWN0ZWQgX25nWm9uZTogTmdab25lID0gdGhpcy5fbm9ab25lT3B0aW9uSXNTZXQgPyBuZXcgTm9vcE5nWm9uZSgpIDogaW5qZWN0KE5nWm9uZSk7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHJvdGVjdGVkIF9lZmZlY3RSdW5uZXIgPSBpbmplY3QoRWZmZWN0U2NoZWR1bGVyKTtcbiAgLy8gSW5qZWN0IEFwcGxpY2F0aW9uUmVmIHRvIGVuc3VyZSBOZ1pvbmUgc3RhYmxlbmVzcyBjYXVzZXMgYWZ0ZXIgcmVuZGVyIGhvb2tzIHRvIHJ1blxuICAvLyBUaGlzIHdpbGwgbGlrZWx5IGhhcHBlbiBhcyBhIHJlc3VsdCBvZiBmaXh0dXJlLmRldGVjdENoYW5nZXMgYmVjYXVzZSBpdCBjYWxscyBuZ1pvbmUucnVuXG4gIC8vIFRoaXMgaXMgYSBjcmF6eSB3YXkgb2YgZG9pbmcgdGhpbmdzIGJ1dCBoZXksIGl0J3MgdGhlIHdvcmxkIHdlIGxpdmUgaW4uXG4gIC8vIFRoZSB6b25lbGVzcyBzY2hlZHVsZXIgc2hvdWxkIGluc3RlYWQgZG8gdGhpcyBtb3JlIGltcGVyYXRpdmVseSBieSBhdHRhY2hpbmdcbiAgLy8gdGhlIGBDb21wb25lbnRSZWZgIHRvIGBBcHBsaWNhdGlvblJlZmAgYW5kIGNhbGxpbmcgYGFwcFJlZi50aWNrYCBhcyB0aGUgYGRldGVjdENoYW5nZXNgXG4gIC8vIGJlaGF2aW9yLlxuICAvKiogQGludGVybmFsICovXG4gIHByb3RlY3RlZCByZWFkb25seSBfYXBwUmVmID0gaW5qZWN0KEFwcGxpY2F0aW9uUmVmKTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBwcm90ZWN0ZWQgcmVhZG9ubHkgX3Rlc3RBcHBSZWYgPSB0aGlzLl9hcHBSZWYgYXMgdW5rbm93biBhcyBUZXN0QXBwUmVmO1xuICBwcml2YXRlIHJlYWRvbmx5IHBlbmRpbmdUYXNrcyA9IGluamVjdChQZW5kaW5nVGFza3MpO1xuICBwcml2YXRlIHJlYWRvbmx5IGFwcEVycm9ySGFuZGxlciA9IGluamVjdChUZXN0QmVkQXBwbGljYXRpb25FcnJvckhhbmRsZXIpO1xuXG4gIC8vIFRPRE8oYXRzY290dCk6IFJlbW92ZSB0aGlzIGZyb20gcHVibGljIEFQSVxuICBuZ1pvbmUgPSB0aGlzLl9ub1pvbmVPcHRpb25Jc1NldCA/IG51bGwgOiB0aGlzLl9uZ1pvbmU7XG5cbiAgLyoqIEBub2RvYyAqL1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgY29tcG9uZW50UmVmOiBDb21wb25lbnRSZWY8VD4pIHtcbiAgICB0aGlzLmNoYW5nZURldGVjdG9yUmVmID0gY29tcG9uZW50UmVmLmNoYW5nZURldGVjdG9yUmVmO1xuICAgIHRoaXMuZWxlbWVudFJlZiA9IGNvbXBvbmVudFJlZi5sb2NhdGlvbjtcbiAgICB0aGlzLmRlYnVnRWxlbWVudCA9IDxEZWJ1Z0VsZW1lbnQ+Z2V0RGVidWdOb2RlKHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50KTtcbiAgICB0aGlzLmNvbXBvbmVudEluc3RhbmNlID0gY29tcG9uZW50UmVmLmluc3RhbmNlO1xuICAgIHRoaXMubmF0aXZlRWxlbWVudCA9IHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50O1xuICAgIHRoaXMuY29tcG9uZW50UmVmID0gY29tcG9uZW50UmVmO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyaWdnZXIgYSBjaGFuZ2UgZGV0ZWN0aW9uIGN5Y2xlIGZvciB0aGUgY29tcG9uZW50LlxuICAgKi9cbiAgYWJzdHJhY3QgZGV0ZWN0Q2hhbmdlcyhjaGVja05vQ2hhbmdlcz86IGJvb2xlYW4pOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBEbyBhIGNoYW5nZSBkZXRlY3Rpb24gcnVuIHRvIG1ha2Ugc3VyZSB0aGVyZSB3ZXJlIG5vIGNoYW5nZXMuXG4gICAqL1xuICBjaGVja05vQ2hhbmdlcygpOiB2b2lkIHtcbiAgICB0aGlzLmNoYW5nZURldGVjdG9yUmVmLmNoZWNrTm9DaGFuZ2VzKCk7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHdoZXRoZXIgdGhlIGZpeHR1cmUgc2hvdWxkIGF1dG9kZXRlY3QgY2hhbmdlcy5cbiAgICpcbiAgICogQWxzbyBydW5zIGRldGVjdENoYW5nZXMgb25jZSBzbyB0aGF0IGFueSBleGlzdGluZyBjaGFuZ2UgaXMgZGV0ZWN0ZWQuXG4gICAqXG4gICAqIEBwYXJhbSBhdXRvRGV0ZWN0IFdoZXRoZXIgdG8gYXV0b2RldGVjdCBjaGFuZ2VzLiBCeSBkZWZhdWx0LCBgdHJ1ZWAuXG4gICAqL1xuICBhYnN0cmFjdCBhdXRvRGV0ZWN0Q2hhbmdlcyhhdXRvRGV0ZWN0PzogYm9vbGVhbik6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIFJldHVybiB3aGV0aGVyIHRoZSBmaXh0dXJlIGlzIGN1cnJlbnRseSBzdGFibGUgb3IgaGFzIGFzeW5jIHRhc2tzIHRoYXQgaGF2ZSBub3QgYmVlbiBjb21wbGV0ZWRcbiAgICogeWV0LlxuICAgKi9cbiAgaXNTdGFibGUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICF0aGlzLnBlbmRpbmdUYXNrcy5oYXNQZW5kaW5nVGFza3MudmFsdWU7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdoZW4gdGhlIGZpeHR1cmUgaXMgc3RhYmxlLlxuICAgKlxuICAgKiBUaGlzIGNhbiBiZSB1c2VkIHRvIHJlc3VtZSB0ZXN0aW5nIGFmdGVyIGV2ZW50cyBoYXZlIHRyaWdnZXJlZCBhc3luY2hyb25vdXMgYWN0aXZpdHkgb3JcbiAgICogYXN5bmNocm9ub3VzIGNoYW5nZSBkZXRlY3Rpb24uXG4gICAqL1xuICB3aGVuU3RhYmxlKCk6IFByb21pc2U8YW55PiB7XG4gICAgaWYgKHRoaXMuaXNTdGFibGUoKSkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShmYWxzZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRoaXMuYXBwRXJyb3JIYW5kbGVyLndoZW5TdGFibGVSZWplY3RGdW5jdGlvbnMuYWRkKHJlamVjdCk7XG4gICAgICB0aGlzLl9hcHBSZWYud2hlblN0YWJsZSgpLnRoZW4oKCkgPT4ge1xuICAgICAgICB0aGlzLmFwcEVycm9ySGFuZGxlci53aGVuU3RhYmxlUmVqZWN0RnVuY3Rpb25zLmRlbGV0ZShyZWplY3QpO1xuICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0cmlldmVzIGFsbCBkZWZlciBibG9jayBmaXh0dXJlcyBpbiB0aGUgY29tcG9uZW50IGZpeHR1cmUuXG4gICAqL1xuICBnZXREZWZlckJsb2NrcygpOiBQcm9taXNlPERlZmVyQmxvY2tGaXh0dXJlW10+IHtcbiAgICBjb25zdCBkZWZlckJsb2NrczogRGVmZXJCbG9ja0RldGFpbHNbXSA9IFtdO1xuICAgIGNvbnN0IGxWaWV3ID0gKHRoaXMuY29tcG9uZW50UmVmLmhvc3RWaWV3IGFzIGFueSlbJ19sVmlldyddO1xuICAgIGdldERlZmVyQmxvY2tzKGxWaWV3LCBkZWZlckJsb2Nrcyk7XG5cbiAgICBjb25zdCBkZWZlckJsb2NrRml4dHVyZXMgPSBbXTtcbiAgICBmb3IgKGNvbnN0IGJsb2NrIG9mIGRlZmVyQmxvY2tzKSB7XG4gICAgICBkZWZlckJsb2NrRml4dHVyZXMucHVzaChuZXcgRGVmZXJCbG9ja0ZpeHR1cmUoYmxvY2ssIHRoaXMpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGRlZmVyQmxvY2tGaXh0dXJlcyk7XG4gIH1cblxuICBwcml2YXRlIF9nZXRSZW5kZXJlcigpIHtcbiAgICBpZiAodGhpcy5fcmVuZGVyZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5fcmVuZGVyZXIgPSB0aGlzLmNvbXBvbmVudFJlZi5pbmplY3Rvci5nZXQoUmVuZGVyZXJGYWN0b3J5MiwgbnVsbCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9yZW5kZXJlciBhcyBSZW5kZXJlckZhY3RvcnkyIHwgbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2hlbiB0aGUgdWkgc3RhdGUgaXMgc3RhYmxlIGZvbGxvd2luZyBhbmltYXRpb25zLlxuICAgKi9cbiAgd2hlblJlbmRlcmluZ0RvbmUoKTogUHJvbWlzZTxhbnk+IHtcbiAgICBjb25zdCByZW5kZXJlciA9IHRoaXMuX2dldFJlbmRlcmVyKCk7XG4gICAgaWYgKHJlbmRlcmVyICYmIHJlbmRlcmVyLndoZW5SZW5kZXJpbmdEb25lKSB7XG4gICAgICByZXR1cm4gcmVuZGVyZXIud2hlblJlbmRlcmluZ0RvbmUoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMud2hlblN0YWJsZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyaWdnZXIgY29tcG9uZW50IGRlc3RydWN0aW9uLlxuICAgKi9cbiAgZGVzdHJveSgpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX2lzRGVzdHJveWVkKSB7XG4gICAgICB0aGlzLmNvbXBvbmVudFJlZi5kZXN0cm95KCk7XG4gICAgICB0aGlzLl9pc0Rlc3Ryb3llZCA9IHRydWU7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQ29tcG9uZW50Rml4dHVyZSBiZWhhdmlvciB0aGF0IGFjdHVhbGx5IGF0dGFjaGVzIHRoZSBjb21wb25lbnQgdG8gdGhlIGFwcGxpY2F0aW9uIHRvIGVuc3VyZVxuICogYmVoYXZpb3JzIGJldHdlZW4gZml4dHVyZSBhbmQgYXBwbGljYXRpb24gZG8gbm90IGRpdmVyZ2UuIGBkZXRlY3RDaGFuZ2VzYCBpcyBkaXNhYmxlZCBieSBkZWZhdWx0XG4gKiAoaW5zdGVhZCwgdGVzdHMgc2hvdWxkIHdhaXQgZm9yIHRoZSBzY2hlZHVsZXIgdG8gZGV0ZWN0IGNoYW5nZXMpLCBgd2hlblN0YWJsZWAgaXMgZGlyZWN0bHkgdGhlXG4gKiBgQXBwbGljYXRpb25SZWYuaXNTdGFibGVgLCBhbmQgYGF1dG9EZXRlY3RDaGFuZ2VzYCBjYW5ub3QgYmUgZGlzYWJsZWQuXG4gKi9cbmV4cG9ydCBjbGFzcyBTY2hlZHVsZWRDb21wb25lbnRGaXh0dXJlPFQ+IGV4dGVuZHMgQ29tcG9uZW50Rml4dHVyZTxUPiB7XG4gIHByaXZhdGUgX2F1dG9EZXRlY3QgPSBpbmplY3QoQ29tcG9uZW50Rml4dHVyZUF1dG9EZXRlY3QsIHtvcHRpb25hbDogdHJ1ZX0pID8/IHRydWU7XG5cbiAgaW5pdGlhbGl6ZSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fYXV0b0RldGVjdCkge1xuICAgICAgdGhpcy5fYXBwUmVmLmF0dGFjaFZpZXcodGhpcy5jb21wb25lbnRSZWYuaG9zdFZpZXcpO1xuICAgIH1cbiAgfVxuXG4gIG92ZXJyaWRlIGRldGVjdENoYW5nZXMoY2hlY2tOb0NoYW5nZXMgPSB0cnVlKTogdm9pZCB7XG4gICAgaWYgKCFjaGVja05vQ2hhbmdlcykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAnQ2Fubm90IGRpc2FibGUgYGNoZWNrTm9DaGFuZ2VzYCBpbiB0aGlzIGNvbmZpZ3VyYXRpb24uICcgK1xuICAgICAgICAgICdVc2UgYGZpeHR1cmUuY29tcG9uZW50UmVmLmhvc3RWaWV3LmNoYW5nZURldGVjdG9yUmVmLmRldGVjdENoYW5nZXMoKWAgaW5zdGVhZC4nLFxuICAgICAgKTtcbiAgICB9XG4gICAgdGhpcy5fZWZmZWN0UnVubmVyLmZsdXNoKCk7XG4gICAgdGhpcy5fYXBwUmVmLnRpY2soKTtcbiAgICB0aGlzLl9lZmZlY3RSdW5uZXIuZmx1c2goKTtcbiAgfVxuXG4gIG92ZXJyaWRlIGF1dG9EZXRlY3RDaGFuZ2VzKGF1dG9EZXRlY3QgPSB0cnVlKTogdm9pZCB7XG4gICAgaWYgKCFhdXRvRGV0ZWN0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICdDYW5ub3QgZGlzYWJsZSBhdXRvRGV0ZWN0IGFmdGVyIGl0IGhhcyBiZWVuIGVuYWJsZWQgd2hlbiB1c2luZyB0aGUgem9uZWxlc3Mgc2NoZWR1bGVyLiAnICtcbiAgICAgICAgICAnVG8gZGlzYWJsZSBhdXRvRGV0ZWN0LCBhZGQgYHtwcm92aWRlOiBDb21wb25lbnRGaXh0dXJlQXV0b0RldGVjdCwgdXNlVmFsdWU6IGZhbHNlfWAgdG8gdGhlIFRlc3RCZWQgcHJvdmlkZXJzLicsXG4gICAgICApO1xuICAgIH0gZWxzZSBpZiAoIXRoaXMuX2F1dG9EZXRlY3QpIHtcbiAgICAgIHRoaXMuX2F1dG9EZXRlY3QgPSBhdXRvRGV0ZWN0O1xuICAgICAgdGhpcy5fYXBwUmVmLmF0dGFjaFZpZXcodGhpcy5jb21wb25lbnRSZWYuaG9zdFZpZXcpO1xuICAgIH1cbiAgICB0aGlzLmRldGVjdENoYW5nZXMoKTtcbiAgfVxufVxuXG5pbnRlcmZhY2UgVGVzdEFwcFJlZiB7XG4gIGV4dGVybmFsVGVzdFZpZXdzOiBTZXQ8Vmlld1JlZj47XG4gIGJlZm9yZVJlbmRlcjogU3ViamVjdDxib29sZWFuPjtcbiAgYWZ0ZXJUaWNrOiBTdWJqZWN0PHZvaWQ+O1xufVxuXG4vKipcbiAqIENvbXBvbmVudEZpeHR1cmUgYmVoYXZpb3IgdGhhdCBhdHRlbXB0cyB0byBhY3QgYXMgYSBcIm1pbmkgYXBwbGljYXRpb25cIi5cbiAqL1xuZXhwb3J0IGNsYXNzIFBzZXVkb0FwcGxpY2F0aW9uQ29tcG9uZW50Rml4dHVyZTxUPiBleHRlbmRzIENvbXBvbmVudEZpeHR1cmU8VD4ge1xuICBwcml2YXRlIF9zdWJzY3JpcHRpb25zID0gbmV3IFN1YnNjcmlwdGlvbigpO1xuICBwcml2YXRlIF9hdXRvRGV0ZWN0ID0gaW5qZWN0KENvbXBvbmVudEZpeHR1cmVBdXRvRGV0ZWN0LCB7b3B0aW9uYWw6IHRydWV9KSA/PyBmYWxzZTtcbiAgcHJpdmF0ZSBhZnRlclRpY2tTdWJzY3JpcHRpb246IFN1YnNjcmlwdGlvbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgcHJpdmF0ZSBiZWZvcmVSZW5kZXJTdWJzY3JpcHRpb246IFN1YnNjcmlwdGlvbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcblxuICBpbml0aWFsaXplKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9hdXRvRGV0ZWN0KSB7XG4gICAgICB0aGlzLnN1YnNjcmliZVRvQXBwUmVmRXZlbnRzKCk7XG4gICAgfVxuICAgIHRoaXMuY29tcG9uZW50UmVmLmhvc3RWaWV3Lm9uRGVzdHJveSgoKSA9PiB7XG4gICAgICB0aGlzLnVuc3Vic2NyaWJlRnJvbUFwcFJlZkV2ZW50cygpO1xuICAgIH0pO1xuICAgIC8vIENyZWF0ZSBzdWJzY3JpcHRpb25zIG91dHNpZGUgdGhlIE5nWm9uZSBzbyB0aGF0IHRoZSBjYWxsYmFja3MgcnVuIG91dHNpZGVcbiAgICAvLyBvZiBOZ1pvbmUuXG4gICAgdGhpcy5fbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgICB0aGlzLl9uZ1pvbmUub25FcnJvci5zdWJzY3JpYmUoe1xuICAgICAgICAgIG5leHQ6IChlcnJvcjogYW55KSA9PiB7XG4gICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgICB9LFxuICAgICAgICB9KSxcbiAgICAgICk7XG4gICAgfSk7XG4gIH1cblxuICBvdmVycmlkZSBkZXRlY3RDaGFuZ2VzKGNoZWNrTm9DaGFuZ2VzID0gdHJ1ZSk6IHZvaWQge1xuICAgIHRoaXMuX2VmZmVjdFJ1bm5lci5mbHVzaCgpO1xuICAgIC8vIFJ1biB0aGUgY2hhbmdlIGRldGVjdGlvbiBpbnNpZGUgdGhlIE5nWm9uZSBzbyB0aGF0IGFueSBhc3luYyB0YXNrcyBhcyBwYXJ0IG9mIHRoZSBjaGFuZ2VcbiAgICAvLyBkZXRlY3Rpb24gYXJlIGNhcHR1cmVkIGJ5IHRoZSB6b25lIGFuZCBjYW4gYmUgd2FpdGVkIGZvciBpbiBpc1N0YWJsZS5cbiAgICB0aGlzLl9uZ1pvbmUucnVuKCgpID0+IHtcbiAgICAgIHRoaXMuY2hhbmdlRGV0ZWN0b3JSZWYuZGV0ZWN0Q2hhbmdlcygpO1xuICAgICAgaWYgKGNoZWNrTm9DaGFuZ2VzKSB7XG4gICAgICAgIHRoaXMuY2hlY2tOb0NoYW5nZXMoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICAvLyBSdW4gYW55IGVmZmVjdHMgdGhhdCB3ZXJlIGNyZWF0ZWQvZGlydGllZCBkdXJpbmcgY2hhbmdlIGRldGVjdGlvbi4gU3VjaCBlZmZlY3RzIG1pZ2h0IGJlY29tZVxuICAgIC8vIGRpcnR5IGluIHJlc3BvbnNlIHRvIGlucHV0IHNpZ25hbHMgY2hhbmdpbmcuXG4gICAgdGhpcy5fZWZmZWN0UnVubmVyLmZsdXNoKCk7XG4gIH1cblxuICBvdmVycmlkZSBhdXRvRGV0ZWN0Q2hhbmdlcyhhdXRvRGV0ZWN0ID0gdHJ1ZSk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9ub1pvbmVPcHRpb25Jc1NldCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgY2FsbCBhdXRvRGV0ZWN0Q2hhbmdlcyB3aGVuIENvbXBvbmVudEZpeHR1cmVOb05nWm9uZSBpcyBzZXQuJyk7XG4gICAgfVxuXG4gICAgaWYgKGF1dG9EZXRlY3QgIT09IHRoaXMuX2F1dG9EZXRlY3QpIHtcbiAgICAgIGlmIChhdXRvRGV0ZWN0KSB7XG4gICAgICAgIHRoaXMuc3Vic2NyaWJlVG9BcHBSZWZFdmVudHMoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMudW5zdWJzY3JpYmVGcm9tQXBwUmVmRXZlbnRzKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5fYXV0b0RldGVjdCA9IGF1dG9EZXRlY3Q7XG4gICAgdGhpcy5kZXRlY3RDaGFuZ2VzKCk7XG4gIH1cblxuICBwcml2YXRlIHN1YnNjcmliZVRvQXBwUmVmRXZlbnRzKCkge1xuICAgIHRoaXMuX25nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICB0aGlzLmFmdGVyVGlja1N1YnNjcmlwdGlvbiA9IHRoaXMuX3Rlc3RBcHBSZWYuYWZ0ZXJUaWNrLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgIHRoaXMuY2hlY2tOb0NoYW5nZXMoKTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5iZWZvcmVSZW5kZXJTdWJzY3JpcHRpb24gPSB0aGlzLl90ZXN0QXBwUmVmLmJlZm9yZVJlbmRlci5zdWJzY3JpYmUoKGlzRmlyc3RQYXNzKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgybVkZXRlY3RDaGFuZ2VzSW5WaWV3SWZSZXF1aXJlZChcbiAgICAgICAgICAgICh0aGlzLmNvbXBvbmVudFJlZi5ob3N0VmlldyBhcyBhbnkpLl9sVmlldyxcbiAgICAgICAgICAgICh0aGlzLmNvbXBvbmVudFJlZi5ob3N0VmlldyBhcyBhbnkpLm5vdGlmeUVycm9ySGFuZGxlcixcbiAgICAgICAgICAgIGlzRmlyc3RQYXNzLFxuICAgICAgICAgICAgZmFsc2UgLyoqIHpvbmVsZXNzIGVuYWJsZWQgKi8sXG4gICAgICAgICAgKTtcbiAgICAgICAgfSBjYXRjaCAoZTogdW5rbm93bikge1xuICAgICAgICAgIC8vIElmIGFuIGVycm9yIG9jY3VycmVkIGR1cmluZyBjaGFuZ2UgZGV0ZWN0aW9uLCByZW1vdmUgdGhlIHRlc3QgdmlldyBmcm9tIHRoZSBhcHBsaWNhdGlvblxuICAgICAgICAgIC8vIHJlZiB0cmFja2luZy4gTm90ZSB0aGF0IHRoaXMgaXNuJ3QgZXhhY3RseSBkZXNpcmFibGUgYnV0IGRvbmUgdGhpcyB3YXkgYmVjYXVzZSBvZiBob3dcbiAgICAgICAgICAvLyB0aGluZ3MgdXNlZCB0byB3b3JrIHdpdGggYGF1dG9EZXRlY3RgIGFuZCB1bmNhdWdodCBlcnJvcnMuIElkZWFsbHkgd2Ugd291bGQgc3VyZmFjZVxuICAgICAgICAgIC8vIHRoaXMgZXJyb3IgdG8gdGhlIGVycm9yIGhhbmRsZXIgaW5zdGVhZCBhbmQgY29udGludWUgcmVmcmVzaGluZyB0aGUgdmlldyBsaWtlXG4gICAgICAgICAgLy8gd2hhdCB3b3VsZCBoYXBwZW4gaW4gdGhlIGFwcGxpY2F0aW9uLlxuICAgICAgICAgIHRoaXMudW5zdWJzY3JpYmVGcm9tQXBwUmVmRXZlbnRzKCk7XG5cbiAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHRoaXMuX3Rlc3RBcHBSZWYuZXh0ZXJuYWxUZXN0Vmlld3MuYWRkKHRoaXMuY29tcG9uZW50UmVmLmhvc3RWaWV3KTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgdW5zdWJzY3JpYmVGcm9tQXBwUmVmRXZlbnRzKCkge1xuICAgIHRoaXMuYWZ0ZXJUaWNrU3Vic2NyaXB0aW9uPy51bnN1YnNjcmliZSgpO1xuICAgIHRoaXMuYmVmb3JlUmVuZGVyU3Vic2NyaXB0aW9uPy51bnN1YnNjcmliZSgpO1xuICAgIHRoaXMuYWZ0ZXJUaWNrU3Vic2NyaXB0aW9uID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuYmVmb3JlUmVuZGVyU3Vic2NyaXB0aW9uID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuX3Rlc3RBcHBSZWYuZXh0ZXJuYWxUZXN0Vmlld3MuZGVsZXRlKHRoaXMuY29tcG9uZW50UmVmLmhvc3RWaWV3KTtcbiAgfVxuXG4gIG92ZXJyaWRlIGRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy51bnN1YnNjcmliZUZyb21BcHBSZWZFdmVudHMoKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLnVuc3Vic2NyaWJlKCk7XG4gICAgc3VwZXIuZGVzdHJveSgpO1xuICB9XG59XG4iXX0=