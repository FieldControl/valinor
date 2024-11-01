/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { AfterRenderPhase } from './api';
import { NgZone } from '../../zone';
import { inject } from '../../di/injector_compatibility';
import { ɵɵdefineInjectable } from '../../di/interface/defs';
import { ErrorHandler } from '../../error_handler';
import { ChangeDetectionScheduler, } from '../../change_detection/scheduling/zoneless_scheduling';
export class AfterRenderManager {
    constructor() {
        this.impl = null;
    }
    execute() {
        this.impl?.execute();
    }
    /** @nocollapse */
    static { this.ɵprov = ɵɵdefineInjectable({
        token: AfterRenderManager,
        providedIn: 'root',
        factory: () => new AfterRenderManager(),
    }); }
}
export class AfterRenderImpl {
    constructor() {
        this.ngZone = inject(NgZone);
        this.scheduler = inject(ChangeDetectionScheduler);
        this.errorHandler = inject(ErrorHandler, { optional: true });
        /** Current set of active sequences. */
        this.sequences = new Set();
        /** Tracks registrations made during the current set of executions. */
        this.deferredRegistrations = new Set();
        /** Whether the `AfterRenderManager` is currently executing hooks. */
        this.executing = false;
    }
    static { this.PHASES = [
        AfterRenderPhase.EarlyRead,
        AfterRenderPhase.Write,
        AfterRenderPhase.MixedReadWrite,
        AfterRenderPhase.Read,
    ]; }
    /**
     * Run the sequence of phases of hooks, once through. As a result of executing some hooks, more
     * might be scheduled.
     */
    execute() {
        this.executing = true;
        for (const phase of AfterRenderImpl.PHASES) {
            for (const sequence of this.sequences) {
                if (sequence.erroredOrDestroyed || !sequence.hooks[phase]) {
                    continue;
                }
                try {
                    sequence.pipelinedValue = this.ngZone.runOutsideAngular(() => sequence.hooks[phase](sequence.pipelinedValue));
                }
                catch (err) {
                    sequence.erroredOrDestroyed = true;
                    this.errorHandler?.handleError(err);
                }
            }
        }
        this.executing = false;
        // Cleanup step to reset sequence state and also collect one-shot sequences for removal.
        for (const sequence of this.sequences) {
            sequence.afterRun();
            if (sequence.once) {
                this.sequences.delete(sequence);
                // Destroy the sequence so its on destroy callbacks can be cleaned up
                // immediately, instead of waiting until the injector is destroyed.
                sequence.destroy();
            }
        }
        for (const sequence of this.deferredRegistrations) {
            this.sequences.add(sequence);
        }
        if (this.deferredRegistrations.size > 0) {
            this.scheduler.notify(7 /* NotificationSource.DeferredRenderHook */);
        }
        this.deferredRegistrations.clear();
    }
    register(sequence) {
        if (!this.executing) {
            this.sequences.add(sequence);
            // Trigger an `ApplicationRef.tick()` if one is not already pending/running, because we have a
            // new render hook that needs to run.
            this.scheduler.notify(6 /* NotificationSource.RenderHook */);
        }
        else {
            this.deferredRegistrations.add(sequence);
        }
    }
    unregister(sequence) {
        if (this.executing && this.sequences.has(sequence)) {
            // We can't remove an `AfterRenderSequence` in the middle of iteration.
            // Instead, mark it as destroyed so it doesn't run any more, and mark it as one-shot so it'll
            // be removed at the end of the current execution.
            sequence.erroredOrDestroyed = true;
            sequence.pipelinedValue = undefined;
            sequence.once = true;
        }
        else {
            // It's safe to directly remove this sequence.
            this.sequences.delete(sequence);
            this.deferredRegistrations.delete(sequence);
        }
    }
    /** @nocollapse */
    static { this.ɵprov = ɵɵdefineInjectable({
        token: AfterRenderImpl,
        providedIn: 'root',
        factory: () => new AfterRenderImpl(),
    }); }
}
export class AfterRenderSequence {
    constructor(impl, hooks, once, destroyRef) {
        this.impl = impl;
        this.hooks = hooks;
        this.once = once;
        /**
         * Whether this sequence errored or was destroyed during this execution, and hooks should no
         * longer run for it.
         */
        this.erroredOrDestroyed = false;
        /**
         * The value returned by the last hook execution (if any), ready to be pipelined into the next
         * one.
         */
        this.pipelinedValue = undefined;
        this.unregisterOnDestroy = destroyRef?.onDestroy(() => this.destroy());
    }
    afterRun() {
        this.erroredOrDestroyed = false;
        this.pipelinedValue = undefined;
    }
    destroy() {
        this.impl.unregister(this);
        this.unregisterOnDestroy?.();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL3JlbmRlcjMvYWZ0ZXJfcmVuZGVyL21hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGdCQUFnQixFQUFpQixNQUFNLE9BQU8sQ0FBQztBQUN2RCxPQUFPLEVBQUMsTUFBTSxFQUFDLE1BQU0sWUFBWSxDQUFDO0FBQ2xDLE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSxpQ0FBaUMsQ0FBQztBQUN2RCxPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSx5QkFBeUIsQ0FBQztBQUMzRCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDakQsT0FBTyxFQUNMLHdCQUF3QixHQUV6QixNQUFNLHVEQUF1RCxDQUFDO0FBRy9ELE1BQU0sT0FBTyxrQkFBa0I7SUFBL0I7UUFDRSxTQUFJLEdBQTJCLElBQUksQ0FBQztJQVl0QyxDQUFDO0lBVkMsT0FBTztRQUNMLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLENBQUM7SUFDdkIsQ0FBQztJQUVELGtCQUFrQjthQUNYLFVBQUssR0FBNkIsa0JBQWtCLENBQUM7UUFDMUQsS0FBSyxFQUFFLGtCQUFrQjtRQUN6QixVQUFVLEVBQUUsTUFBTTtRQUNsQixPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxrQkFBa0IsRUFBRTtLQUN4QyxDQUFDLEFBSlUsQ0FJVDs7QUFHTCxNQUFNLE9BQU8sZUFBZTtJQUE1QjtRQVFtQixXQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3hCLGNBQVMsR0FBRyxNQUFNLENBQUMsd0JBQXdCLENBQUMsQ0FBQztRQUM3QyxpQkFBWSxHQUFHLE1BQU0sQ0FBQyxZQUFZLEVBQUUsRUFBQyxRQUFRLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztR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LE9BQU87UUFDTCxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMzQixJQUFJLENBQUMsbUJBQW1CLEVBQUUsRUFBRSxDQUFDO0lBQy9CLENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtBZnRlclJlbmRlclBoYXNlLCBBZnRlclJlbmRlclJlZn0gZnJvbSAnLi9hcGknO1xuaW1wb3J0IHtOZ1pvbmV9IGZyb20gJy4uLy4uL3pvbmUnO1xuaW1wb3J0IHtpbmplY3R9IGZyb20gJy4uLy4uL2RpL2luamVjdG9yX2NvbXBhdGliaWxpdHknO1xuaW1wb3J0IHvJtcm1ZGVmaW5lSW5qZWN0YWJsZX0gZnJvbSAnLi4vLi4vZGkvaW50ZXJmYWNlL2RlZnMnO1xuaW1wb3J0IHtFcnJvckhhbmRsZXJ9IGZyb20gJy4uLy4uL2Vycm9yX2hhbmRsZXInO1xuaW1wb3J0IHtcbiAgQ2hhbmdlRGV0ZWN0aW9uU2NoZWR1bGVyLFxuICBOb3RpZmljYXRpb25Tb3VyY2UsXG59IGZyb20gJy4uLy4uL2NoYW5nZV9kZXRlY3Rpb24vc2NoZWR1bGluZy96b25lbGVzc19zY2hlZHVsaW5nJztcbmltcG9ydCB7dHlwZSBEZXN0cm95UmVmfSBmcm9tICcuLi8uLi9saW5rZXIvZGVzdHJveV9yZWYnO1xuXG5leHBvcnQgY2xhc3MgQWZ0ZXJSZW5kZXJNYW5hZ2VyIHtcbiAgaW1wbDogQWZ0ZXJSZW5kZXJJbXBsIHwgbnVsbCA9IG51bGw7XG5cbiAgZXhlY3V0ZSgpOiB2b2lkIHtcbiAgICB0aGlzLmltcGw/LmV4ZWN1dGUoKTtcbiAgfVxuXG4gIC8qKiBAbm9jb2xsYXBzZSAqL1xuICBzdGF0aWMgybVwcm92ID0gLyoqIEBwdXJlT3JCcmVha015Q29kZSAqLyDJtcm1ZGVmaW5lSW5qZWN0YWJsZSh7XG4gICAgdG9rZW46IEFmdGVyUmVuZGVyTWFuYWdlcixcbiAgICBwcm92aWRlZEluOiAncm9vdCcsXG4gICAgZmFjdG9yeTogKCkgPT4gbmV3IEFmdGVyUmVuZGVyTWFuYWdlcigpLFxuICB9KTtcbn1cblxuZXhwb3J0IGNsYXNzIEFmdGVyUmVuZGVySW1wbCB7XG4gIHN0YXRpYyByZWFkb25seSBQSEFTRVMgPSBbXG4gICAgQWZ0ZXJSZW5kZXJQaGFzZS5FYXJseVJlYWQsXG4gICAgQWZ0ZXJSZW5kZXJQaGFzZS5Xcml0ZSxcbiAgICBBZnRlclJlbmRlclBoYXNlLk1peGVkUmVhZFdyaXRlLFxuICAgIEFmdGVyUmVuZGVyUGhhc2UuUmVhZCxcbiAgXSBhcyBjb25zdDtcblxuICBwcml2YXRlIHJlYWRvbmx5IG5nWm9uZSA9IGluamVjdChOZ1pvbmUpO1xuICBwcml2YXRlIHJlYWRvbmx5IHNjaGVkdWxlciA9IGluamVjdChDaGFuZ2VEZXRlY3Rpb25TY2hlZHVsZXIpO1xuICBwcml2YXRlIHJlYWRvbmx5IGVycm9ySGFuZGxlciA9IGluamVjdChFcnJvckhhbmRsZXIsIHtvcHRpb25hbDogdHJ1ZX0pO1xuXG4gIC8qKiBDdXJyZW50IHNldCBvZiBhY3RpdmUgc2VxdWVuY2VzLiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IHNlcXVlbmNlcyA9IG5ldyBTZXQ8QWZ0ZXJSZW5kZXJTZXF1ZW5jZT4oKTtcblxuICAvKiogVHJhY2tzIHJlZ2lzdHJhdGlvbnMgbWFkZSBkdXJpbmcgdGhlIGN1cnJlbnQgc2V0IG9mIGV4ZWN1dGlvbnMuICovXG4gIHByaXZhdGUgcmVhZG9ubHkgZGVmZXJyZWRSZWdpc3RyYXRpb25zID0gbmV3IFNldDxBZnRlclJlbmRlclNlcXVlbmNlPigpO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBgQWZ0ZXJSZW5kZXJNYW5hZ2VyYCBpcyBjdXJyZW50bHkgZXhlY3V0aW5nIGhvb2tzLiAqL1xuICBleGVjdXRpbmcgPSBmYWxzZTtcblxuICAvKipcbiAgICogUnVuIHRoZSBzZXF1ZW5jZSBvZiBwaGFzZXMgb2YgaG9va3MsIG9uY2UgdGhyb3VnaC4gQXMgYSByZXN1bHQgb2YgZXhlY3V0aW5nIHNvbWUgaG9va3MsIG1vcmVcbiAgICogbWlnaHQgYmUgc2NoZWR1bGVkLlxuICAgKi9cbiAgZXhlY3V0ZSgpOiB2b2lkIHtcbiAgICB0aGlzLmV4ZWN1dGluZyA9IHRydWU7XG4gICAgZm9yIChjb25zdCBwaGFzZSBvZiBBZnRlclJlbmRlckltcGwuUEhBU0VTKSB7XG4gICAgICBmb3IgKGNvbnN0IHNlcXVlbmNlIG9mIHRoaXMuc2VxdWVuY2VzKSB7XG4gICAgICAgIGlmIChzZXF1ZW5jZS5lcnJvcmVkT3JEZXN0cm95ZWQgfHwgIXNlcXVlbmNlLmhvb2tzW3BoYXNlXSkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBzZXF1ZW5jZS5waXBlbGluZWRWYWx1ZSA9IHRoaXMubmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+XG4gICAgICAgICAgICBzZXF1ZW5jZS5ob29rc1twaGFzZV0hKHNlcXVlbmNlLnBpcGVsaW5lZFZhbHVlKSxcbiAgICAgICAgICApO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICBzZXF1ZW5jZS5lcnJvcmVkT3JEZXN0cm95ZWQgPSB0cnVlO1xuICAgICAgICAgIHRoaXMuZXJyb3JIYW5kbGVyPy5oYW5kbGVFcnJvcihlcnIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuZXhlY3V0aW5nID0gZmFsc2U7XG5cbiAgICAvLyBDbGVhbnVwIHN0ZXAgdG8gcmVzZXQgc2VxdWVuY2Ugc3RhdGUgYW5kIGFsc28gY29sbGVjdCBvbmUtc2hvdCBzZXF1ZW5jZXMgZm9yIHJlbW92YWwuXG4gICAgZm9yIChjb25zdCBzZXF1ZW5jZSBvZiB0aGlzLnNlcXVlbmNlcykge1xuICAgICAgc2VxdWVuY2UuYWZ0ZXJSdW4oKTtcbiAgICAgIGlmIChzZXF1ZW5jZS5vbmNlKSB7XG4gICAgICAgIHRoaXMuc2VxdWVuY2VzLmRlbGV0ZShzZXF1ZW5jZSk7XG4gICAgICAgIC8vIERlc3Ryb3kgdGhlIHNlcXVlbmNlIHNvIGl0cyBvbiBkZXN0cm95IGNhbGxiYWNrcyBjYW4gYmUgY2xlYW5lZCB1cFxuICAgICAgICAvLyBpbW1lZGlhdGVseSwgaW5zdGVhZCBvZiB3YWl0aW5nIHVudGlsIHRoZSBpbmplY3RvciBpcyBkZXN0cm95ZWQuXG4gICAgICAgIHNlcXVlbmNlLmRlc3Ryb3koKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IHNlcXVlbmNlIG9mIHRoaXMuZGVmZXJyZWRSZWdpc3RyYXRpb25zKSB7XG4gICAgICB0aGlzLnNlcXVlbmNlcy5hZGQoc2VxdWVuY2UpO1xuICAgIH1cbiAgICBpZiAodGhpcy5kZWZlcnJlZFJlZ2lzdHJhdGlvbnMuc2l6ZSA+IDApIHtcbiAgICAgIHRoaXMuc2NoZWR1bGVyLm5vdGlmeShOb3RpZmljYXRpb25Tb3VyY2UuRGVmZXJyZWRSZW5kZXJIb29rKTtcbiAgICB9XG4gICAgdGhpcy5kZWZlcnJlZFJlZ2lzdHJhdGlvbnMuY2xlYXIoKTtcbiAgfVxuXG4gIHJlZ2lzdGVyKHNlcXVlbmNlOiBBZnRlclJlbmRlclNlcXVlbmNlKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLmV4ZWN1dGluZykge1xuICAgICAgdGhpcy5zZXF1ZW5jZXMuYWRkKHNlcXVlbmNlKTtcbiAgICAgIC8vIFRyaWdnZXIgYW4gYEFwcGxpY2F0aW9uUmVmLnRpY2soKWAgaWYgb25lIGlzIG5vdCBhbHJlYWR5IHBlbmRpbmcvcnVubmluZywgYmVjYXVzZSB3ZSBoYXZlIGFcbiAgICAgIC8vIG5ldyByZW5kZXIgaG9vayB0aGF0IG5lZWRzIHRvIHJ1bi5cbiAgICAgIHRoaXMuc2NoZWR1bGVyLm5vdGlmeShOb3RpZmljYXRpb25Tb3VyY2UuUmVuZGVySG9vayk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZGVmZXJyZWRSZWdpc3RyYXRpb25zLmFkZChzZXF1ZW5jZSk7XG4gICAgfVxuICB9XG5cbiAgdW5yZWdpc3RlcihzZXF1ZW5jZTogQWZ0ZXJSZW5kZXJTZXF1ZW5jZSk6IHZvaWQge1xuICAgIGlmICh0aGlzLmV4ZWN1dGluZyAmJiB0aGlzLnNlcXVlbmNlcy5oYXMoc2VxdWVuY2UpKSB7XG4gICAgICAvLyBXZSBjYW4ndCByZW1vdmUgYW4gYEFmdGVyUmVuZGVyU2VxdWVuY2VgIGluIHRoZSBtaWRkbGUgb2YgaXRlcmF0aW9uLlxuICAgICAgLy8gSW5zdGVhZCwgbWFyayBpdCBhcyBkZXN0cm95ZWQgc28gaXQgZG9lc24ndCBydW4gYW55IG1vcmUsIGFuZCBtYXJrIGl0IGFzIG9uZS1zaG90IHNvIGl0J2xsXG4gICAgICAvLyBiZSByZW1vdmVkIGF0IHRoZSBlbmQgb2YgdGhlIGN1cnJlbnQgZXhlY3V0aW9uLlxuICAgICAgc2VxdWVuY2UuZXJyb3JlZE9yRGVzdHJveWVkID0gdHJ1ZTtcbiAgICAgIHNlcXVlbmNlLnBpcGVsaW5lZFZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgc2VxdWVuY2Uub25jZSA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEl0J3Mgc2FmZSB0byBkaXJlY3RseSByZW1vdmUgdGhpcyBzZXF1ZW5jZS5cbiAgICAgIHRoaXMuc2VxdWVuY2VzLmRlbGV0ZShzZXF1ZW5jZSk7XG4gICAgICB0aGlzLmRlZmVycmVkUmVnaXN0cmF0aW9ucy5kZWxldGUoc2VxdWVuY2UpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAbm9jb2xsYXBzZSAqL1xuICBzdGF0aWMgybVwcm92ID0gLyoqIEBwdXJlT3JCcmVha015Q29kZSAqLyDJtcm1ZGVmaW5lSW5qZWN0YWJsZSh7XG4gICAgdG9rZW46IEFmdGVyUmVuZGVySW1wbCxcbiAgICBwcm92aWRlZEluOiAncm9vdCcsXG4gICAgZmFjdG9yeTogKCkgPT4gbmV3IEFmdGVyUmVuZGVySW1wbCgpLFxuICB9KTtcbn1cblxuZXhwb3J0IHR5cGUgQWZ0ZXJSZW5kZXJIb29rID0gKHZhbHVlPzogdW5rbm93bikgPT4gdW5rbm93bjtcbmV4cG9ydCB0eXBlIEFmdGVyUmVuZGVySG9va3MgPSBbXG4gIC8qICAgICAgRWFybHlSZWFkICovIEFmdGVyUmVuZGVySG9vayB8IHVuZGVmaW5lZCxcbiAgLyogICAgICAgICAgV3JpdGUgKi8gQWZ0ZXJSZW5kZXJIb29rIHwgdW5kZWZpbmVkLFxuICAvKiBNaXhlZFJlYWRXcml0ZSAqLyBBZnRlclJlbmRlckhvb2sgfCB1bmRlZmluZWQsXG4gIC8qICAgICAgICAgICBSZWFkICovIEFmdGVyUmVuZGVySG9vayB8IHVuZGVmaW5lZCxcbl07XG5cbmV4cG9ydCBjbGFzcyBBZnRlclJlbmRlclNlcXVlbmNlIGltcGxlbWVudHMgQWZ0ZXJSZW5kZXJSZWYge1xuICAvKipcbiAgICogV2hldGhlciB0aGlzIHNlcXVlbmNlIGVycm9yZWQgb3Igd2FzIGRlc3Ryb3llZCBkdXJpbmcgdGhpcyBleGVjdXRpb24sIGFuZCBob29rcyBzaG91bGQgbm9cbiAgICogbG9uZ2VyIHJ1biBmb3IgaXQuXG4gICAqL1xuICBlcnJvcmVkT3JEZXN0cm95ZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAvKipcbiAgICogVGhlIHZhbHVlIHJldHVybmVkIGJ5IHRoZSBsYXN0IGhvb2sgZXhlY3V0aW9uIChpZiBhbnkpLCByZWFkeSB0byBiZSBwaXBlbGluZWQgaW50byB0aGUgbmV4dFxuICAgKiBvbmUuXG4gICAqL1xuICBwaXBlbGluZWRWYWx1ZTogdW5rbm93biA9IHVuZGVmaW5lZDtcblxuICBwcml2YXRlIHVucmVnaXN0ZXJPbkRlc3Ryb3k6ICgoKSA9PiB2b2lkKSB8IHVuZGVmaW5lZDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICByZWFkb25seSBpbXBsOiBBZnRlclJlbmRlckltcGwsXG4gICAgcmVhZG9ubHkgaG9va3M6IEFmdGVyUmVuZGVySG9va3MsXG4gICAgcHVibGljIG9uY2U6IGJvb2xlYW4sXG4gICAgZGVzdHJveVJlZjogRGVzdHJveVJlZiB8IG51bGwsXG4gICkge1xuICAgIHRoaXMudW5yZWdpc3Rlck9uRGVzdHJveSA9IGRlc3Ryb3lSZWY/Lm9uRGVzdHJveSgoKSA9PiB0aGlzLmRlc3Ryb3koKSk7XG4gIH1cblxuICBhZnRlclJ1bigpOiB2b2lkIHtcbiAgICB0aGlzLmVycm9yZWRPckRlc3Ryb3llZCA9IGZhbHNlO1xuICAgIHRoaXMucGlwZWxpbmVkVmFsdWUgPSB1bmRlZmluZWQ7XG4gIH1cblxuICBkZXN0cm95KCk6IHZvaWQge1xuICAgIHRoaXMuaW1wbC51bnJlZ2lzdGVyKHRoaXMpO1xuICAgIHRoaXMudW5yZWdpc3Rlck9uRGVzdHJveT8uKCk7XG4gIH1cbn1cbiJdfQ==