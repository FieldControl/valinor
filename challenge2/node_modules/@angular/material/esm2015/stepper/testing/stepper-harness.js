/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';
import { MatStepHarness } from './step-harness';
/** Harness for interacting with a standard Material stepper in tests. */
export class MatStepperHarness extends ComponentHarness {
    /**
     * Gets a `HarnessPredicate` that can be used to search for a `MatStepperHarness` that meets
     * certain criteria.
     * @param options Options for filtering which stepper instances are considered a match.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(MatStepperHarness, options)
            .addOption('orientation', options.orientation, (harness, orientation) => __awaiter(this, void 0, void 0, function* () { return (yield harness.getOrientation()) === orientation; }));
    }
    /**
     * Gets the list of steps in the stepper.
     * @param filter Optionally filters which steps are included.
     */
    getSteps(filter = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.locatorForAll(MatStepHarness.with(filter))();
        });
    }
    /** Gets the orientation of the stepper. */
    getOrientation() {
        return __awaiter(this, void 0, void 0, function* () {
            const host = yield this.host();
            return (yield host.hasClass('mat-stepper-horizontal')) ?
                0 /* HORIZONTAL */ : 1 /* VERTICAL */;
        });
    }
    /**
     * Selects a step in this stepper.
     * @param filter An optional filter to apply to the child steps. The first step matching the
     *    filter will be selected.
     */
    selectStep(filter = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const steps = yield this.getSteps(filter);
            if (!steps.length) {
                throw Error(`Cannot find mat-step matching filter ${JSON.stringify(filter)}`);
            }
            yield steps[0].select();
        });
    }
}
/** The selector for the host element of a `MatStepper` instance. */
MatStepperHarness.hostSelector = '.mat-stepper-horizontal, .mat-stepper-vertical';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RlcHBlci1oYXJuZXNzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL3N0ZXBwZXIvdGVzdGluZy9zdGVwcGVyLWhhcm5lc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sRUFBQyxnQkFBZ0IsRUFBRSxnQkFBZ0IsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQ3hFLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQU85Qyx5RUFBeUU7QUFDekUsTUFBTSxPQUFPLGlCQUFrQixTQUFRLGdCQUFnQjtJQUlyRDs7Ozs7T0FLRztJQUNILE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBaUMsRUFBRTtRQUM3QyxPQUFPLElBQUksZ0JBQWdCLENBQUMsaUJBQWlCLEVBQUUsT0FBTyxDQUFDO2FBQ2xELFNBQVMsQ0FBQyxhQUFhLEVBQUUsT0FBTyxDQUFDLFdBQVcsRUFDekMsQ0FBTyxPQUFPLEVBQUUsV0FBVyxFQUFFLEVBQUUsZ0RBQUMsT0FBQSxDQUFDLE1BQU0sT0FBTyxDQUFDLGNBQWMsRUFBRSxDQUFDLEtBQUssV0FBVyxDQUFBLEdBQUEsQ0FBQyxDQUFDO0lBQzVGLENBQUM7SUFFRDs7O09BR0c7SUFDRyxRQUFRLENBQUMsU0FBNkIsRUFBRTs7WUFDNUMsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQzNELENBQUM7S0FBQTtJQUVELDJDQUEyQztJQUNyQyxjQUFjOztZQUNsQixNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUMvQixPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLHdCQUF3QixDQUFDLENBQUMsQ0FBQyxDQUFDO21DQUN0QixDQUFDLGlCQUE0QixDQUFDO1FBQ2xFLENBQUM7S0FBQTtJQUVEOzs7O09BSUc7SUFDRyxVQUFVLENBQUMsU0FBNkIsRUFBRTs7WUFDOUMsTUFBTSxLQUFLLEdBQUcsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFO2dCQUNqQixNQUFNLEtBQUssQ0FBQyx3Q0FBd0MsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7YUFDL0U7WUFDRCxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUMxQixDQUFDO0tBQUE7O0FBekNELG9FQUFvRTtBQUM3RCw4QkFBWSxHQUFHLGdEQUFnRCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q29tcG9uZW50SGFybmVzcywgSGFybmVzc1ByZWRpY2F0ZX0gZnJvbSAnQGFuZ3VsYXIvY2RrL3Rlc3RpbmcnO1xuaW1wb3J0IHtNYXRTdGVwSGFybmVzc30gZnJvbSAnLi9zdGVwLWhhcm5lc3MnO1xuaW1wb3J0IHtcbiAgU3RlcHBlckhhcm5lc3NGaWx0ZXJzLFxuICBTdGVwSGFybmVzc0ZpbHRlcnMsXG4gIFN0ZXBwZXJPcmllbnRhdGlvbixcbn0gZnJvbSAnLi9zdGVwLWhhcm5lc3MtZmlsdGVycyc7XG5cbi8qKiBIYXJuZXNzIGZvciBpbnRlcmFjdGluZyB3aXRoIGEgc3RhbmRhcmQgTWF0ZXJpYWwgc3RlcHBlciBpbiB0ZXN0cy4gKi9cbmV4cG9ydCBjbGFzcyBNYXRTdGVwcGVySGFybmVzcyBleHRlbmRzIENvbXBvbmVudEhhcm5lc3Mge1xuICAvKiogVGhlIHNlbGVjdG9yIGZvciB0aGUgaG9zdCBlbGVtZW50IG9mIGEgYE1hdFN0ZXBwZXJgIGluc3RhbmNlLiAqL1xuICBzdGF0aWMgaG9zdFNlbGVjdG9yID0gJy5tYXQtc3RlcHBlci1ob3Jpem9udGFsLCAubWF0LXN0ZXBwZXItdmVydGljYWwnO1xuXG4gIC8qKlxuICAgKiBHZXRzIGEgYEhhcm5lc3NQcmVkaWNhdGVgIHRoYXQgY2FuIGJlIHVzZWQgdG8gc2VhcmNoIGZvciBhIGBNYXRTdGVwcGVySGFybmVzc2AgdGhhdCBtZWV0c1xuICAgKiBjZXJ0YWluIGNyaXRlcmlhLlxuICAgKiBAcGFyYW0gb3B0aW9ucyBPcHRpb25zIGZvciBmaWx0ZXJpbmcgd2hpY2ggc3RlcHBlciBpbnN0YW5jZXMgYXJlIGNvbnNpZGVyZWQgYSBtYXRjaC5cbiAgICogQHJldHVybiBhIGBIYXJuZXNzUHJlZGljYXRlYCBjb25maWd1cmVkIHdpdGggdGhlIGdpdmVuIG9wdGlvbnMuXG4gICAqL1xuICBzdGF0aWMgd2l0aChvcHRpb25zOiBTdGVwcGVySGFybmVzc0ZpbHRlcnMgPSB7fSk6IEhhcm5lc3NQcmVkaWNhdGU8TWF0U3RlcHBlckhhcm5lc3M+IHtcbiAgICByZXR1cm4gbmV3IEhhcm5lc3NQcmVkaWNhdGUoTWF0U3RlcHBlckhhcm5lc3MsIG9wdGlvbnMpXG4gICAgICAgIC5hZGRPcHRpb24oJ29yaWVudGF0aW9uJywgb3B0aW9ucy5vcmllbnRhdGlvbixcbiAgICAgICAgICAgIGFzeW5jIChoYXJuZXNzLCBvcmllbnRhdGlvbikgPT4gKGF3YWl0IGhhcm5lc3MuZ2V0T3JpZW50YXRpb24oKSkgPT09IG9yaWVudGF0aW9uKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBsaXN0IG9mIHN0ZXBzIGluIHRoZSBzdGVwcGVyLlxuICAgKiBAcGFyYW0gZmlsdGVyIE9wdGlvbmFsbHkgZmlsdGVycyB3aGljaCBzdGVwcyBhcmUgaW5jbHVkZWQuXG4gICAqL1xuICBhc3luYyBnZXRTdGVwcyhmaWx0ZXI6IFN0ZXBIYXJuZXNzRmlsdGVycyA9IHt9KTogUHJvbWlzZTxNYXRTdGVwSGFybmVzc1tdPiB7XG4gICAgcmV0dXJuIHRoaXMubG9jYXRvckZvckFsbChNYXRTdGVwSGFybmVzcy53aXRoKGZpbHRlcikpKCk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgb3JpZW50YXRpb24gb2YgdGhlIHN0ZXBwZXIuICovXG4gIGFzeW5jIGdldE9yaWVudGF0aW9uKCk6IFByb21pc2U8U3RlcHBlck9yaWVudGF0aW9uPiB7XG4gICAgY29uc3QgaG9zdCA9IGF3YWl0IHRoaXMuaG9zdCgpO1xuICAgIHJldHVybiAoYXdhaXQgaG9zdC5oYXNDbGFzcygnbWF0LXN0ZXBwZXItaG9yaXpvbnRhbCcpKSA/XG4gICAgICAgIFN0ZXBwZXJPcmllbnRhdGlvbi5IT1JJWk9OVEFMIDogU3RlcHBlck9yaWVudGF0aW9uLlZFUlRJQ0FMO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlbGVjdHMgYSBzdGVwIGluIHRoaXMgc3RlcHBlci5cbiAgICogQHBhcmFtIGZpbHRlciBBbiBvcHRpb25hbCBmaWx0ZXIgdG8gYXBwbHkgdG8gdGhlIGNoaWxkIHN0ZXBzLiBUaGUgZmlyc3Qgc3RlcCBtYXRjaGluZyB0aGVcbiAgICogICAgZmlsdGVyIHdpbGwgYmUgc2VsZWN0ZWQuXG4gICAqL1xuICBhc3luYyBzZWxlY3RTdGVwKGZpbHRlcjogU3RlcEhhcm5lc3NGaWx0ZXJzID0ge30pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBzdGVwcyA9IGF3YWl0IHRoaXMuZ2V0U3RlcHMoZmlsdGVyKTtcbiAgICBpZiAoIXN0ZXBzLmxlbmd0aCkge1xuICAgICAgdGhyb3cgRXJyb3IoYENhbm5vdCBmaW5kIG1hdC1zdGVwIG1hdGNoaW5nIGZpbHRlciAke0pTT04uc3RyaW5naWZ5KGZpbHRlcil9YCk7XG4gICAgfVxuICAgIGF3YWl0IHN0ZXBzWzBdLnNlbGVjdCgpO1xuICB9XG59XG4iXX0=