/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ApplicationRef } from '../../application/application_ref';
import { ChangeDetectionSchedulerImpl } from './zoneless_scheduling_impl';
import { inject } from '../../di/injector_compatibility';
import { makeEnvironmentProviders } from '../../di/provider_collection';
import { NgZone } from '../../zone/ng_zone';
import { EnvironmentInjector } from '../../di/r3_injector';
import { ENVIRONMENT_INITIALIZER } from '../../di/initializer_token';
import { CheckNoChangesMode } from '../../render3/state';
import { ErrorHandler } from '../../error_handler';
import { checkNoChangesInternal } from '../../render3/instructions/change_detection';
import { ZONELESS_ENABLED } from './zoneless_scheduling';
/**
 * Used to periodically verify no expressions have changed after they were checked.
 *
 * @param options Used to configure when the check will execute.
 *   - `interval` will periodically run exhaustive `checkNoChanges` on application views
 *   - `useNgZoneOnStable` will use ZoneJS to determine when change detection might have run
 *      in an application using ZoneJS to drive change detection. When the `NgZone.onStable` would
 *      have emitted, all views attached to the `ApplicationRef` are checked for changes.
 *   - 'exhaustive' means that all views attached to `ApplicationRef` and all the descendants of those views will be
 *     checked for changes (excluding those subtrees which are detached via `ChangeDetectorRef.detach()`).
 *     This is useful because the check that runs after regular change detection does not work for components using `ChangeDetectionStrategy.OnPush`.
 *     This check is will surface any existing errors hidden by `OnPush` components. By default, this check is exhaustive
 *     and will always check all views, regardless of their "dirty" state and `ChangeDetectionStrategy`.
 *
 * When the `useNgZoneOnStable` option is `true`, this function will provide its own `NgZone` implementation and needs
 * to come after any other `NgZone` provider, including `provideZoneChangeDetection()` and `provideExperimentalZonelessChangeDetection()`.
 *
 * @experimental
 * @publicApi
 */
export function provideExperimentalCheckNoChangesForDebug(options) {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
        if (options.interval === undefined && !options.useNgZoneOnStable) {
            throw new Error('Must provide one of `useNgZoneOnStable` or `interval`');
        }
        const checkNoChangesMode = options?.exhaustive === false
            ? CheckNoChangesMode.OnlyDirtyViews
            : CheckNoChangesMode.Exhaustive;
        return makeEnvironmentProviders([
            options?.useNgZoneOnStable
                ? { provide: NgZone, useFactory: () => new DebugNgZoneForCheckNoChanges(checkNoChangesMode) }
                : [],
            options?.interval !== undefined
                ? exhaustiveCheckNoChangesInterval(options.interval, checkNoChangesMode)
                : [],
            {
                provide: ENVIRONMENT_INITIALIZER,
                multi: true,
                useValue: () => {
                    if (options?.useNgZoneOnStable &&
                        !(inject(NgZone) instanceof DebugNgZoneForCheckNoChanges)) {
                        throw new Error('`provideExperimentalCheckNoChangesForDebug` with `useNgZoneOnStable` must be after any other provider for `NgZone`.');
                    }
                },
            },
        ]);
    }
    else {
        return makeEnvironmentProviders([]);
    }
}
export class DebugNgZoneForCheckNoChanges extends NgZone {
    constructor(checkNoChangesMode) {
        const zonelessEnabled = inject(ZONELESS_ENABLED);
        // Use coalescing to ensure we aren't ever running this check synchronously
        super({
            shouldCoalesceEventChangeDetection: true,
            shouldCoalesceRunChangeDetection: zonelessEnabled,
        });
        this.checkNoChangesMode = checkNoChangesMode;
        this.injector = inject(EnvironmentInjector);
        if (zonelessEnabled) {
            // prevent emits to ensure code doesn't rely on these
            this.onMicrotaskEmpty.emit = () => { };
            this.onStable.emit = () => {
                this.scheduler ||= this.injector.get(ChangeDetectionSchedulerImpl);
                if (this.scheduler.pendingRenderTaskId || this.scheduler.runningTick) {
                    return;
                }
                this.checkApplicationViews();
            };
            this.onUnstable.emit = () => { };
        }
        else {
            this.runOutsideAngular(() => {
                this.onStable.subscribe(() => {
                    this.checkApplicationViews();
                });
            });
        }
    }
    checkApplicationViews() {
        this.applicationRef ||= this.injector.get(ApplicationRef);
        for (const view of this.applicationRef.allViews) {
            try {
                checkNoChangesInternal(view._lView, this.checkNoChangesMode, view.notifyErrorHandler);
            }
            catch (e) {
                this.errorHandler ||= this.injector.get(ErrorHandler);
                this.errorHandler.handleError(e);
            }
        }
    }
}
function exhaustiveCheckNoChangesInterval(interval, checkNoChangesMode) {
    return {
        provide: ENVIRONMENT_INITIALIZER,
        multi: true,
        useFactory: () => {
            const applicationRef = inject(ApplicationRef);
            const errorHandler = inject(ErrorHandler);
            const scheduler = inject(ChangeDetectionSchedulerImpl);
            const ngZone = inject(NgZone);
            return () => {
                function scheduleCheckNoChanges() {
                    ngZone.runOutsideAngular(() => {
                        setTimeout(() => {
                            if (applicationRef.destroyed) {
                                return;
                            }
                            if (scheduler.pendingRenderTaskId || scheduler.runningTick) {
                                scheduleCheckNoChanges();
                                return;
                            }
                            for (const view of applicationRef.allViews) {
                                try {
                                    checkNoChangesInternal(view._lView, checkNoChangesMode, view.notifyErrorHandler);
                                }
                                catch (e) {
                                    errorHandler.handleError(e);
                                }
                            }
                            scheduleCheckNoChanges();
                        }, interval);
                    });
                }
                scheduleCheckNoChanges();
            };
        },
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhoYXVzdGl2ZV9jaGVja19ub19jaGFuZ2VzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvY2hhbmdlX2RldGVjdGlvbi9zY2hlZHVsaW5nL2V4aGF1c3RpdmVfY2hlY2tfbm9fY2hhbmdlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sbUNBQW1DLENBQUM7QUFDakUsT0FBTyxFQUFDLDRCQUE0QixFQUFDLE1BQU0sNEJBQTRCLENBQUM7QUFDeEUsT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLGlDQUFpQyxDQUFDO0FBQ3ZELE9BQU8sRUFBQyx3QkFBd0IsRUFBQyxNQUFNLDhCQUE4QixDQUFDO0FBQ3RFLE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQUUxQyxPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUN6RCxPQUFPLEVBQUMsdUJBQXVCLEVBQUMsTUFBTSw0QkFBNEIsQ0FBQztBQUNuRSxPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUN2RCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDakQsT0FBTyxFQUFDLHNCQUFzQixFQUFDLE1BQU0sNkNBQTZDLENBQUM7QUFDbkYsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFFdkQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FtQkc7QUFDSCxNQUFNLFVBQVUseUNBQXlDLENBQUMsT0FJekQ7SUFDQyxJQUFJLE9BQU8sU0FBUyxLQUFLLFdBQVcsSUFBSSxTQUFTLEVBQUUsQ0FBQztRQUNsRCxJQUFJLE9BQU8sQ0FBQyxRQUFRLEtBQUssU0FBUyxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFDakUs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RUQsS0FBSyxNQUFNLElBQUksSUFBSSxjQUFjLENBQUMsUUFBUSxFQUFFLENBQUM7Z0NBQzNDLElBQUksQ0FBQztvQ0FDSCxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLGtCQUFrQixFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO2dDQUNuRixDQUFDO2dDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7b0NBQ1gsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQ0FDOUIsQ0FBQzs0QkFDSCxDQUFDOzRCQUVELHNCQUFzQixFQUFFLENBQUM7d0JBQzNCLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztvQkFDZixDQUFDLENBQUMsQ0FBQztnQkFDTCxDQUFDO2dCQUNELHNCQUFzQixFQUFFLENBQUM7WUFDM0IsQ0FBQyxDQUFDO1FBQ0osQ0FBQztLQUNGLENBQUM7QUFDSixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FwcGxpY2F0aW9uUmVmfSBmcm9tICcuLi8uLi9hcHBsaWNhdGlvbi9hcHBsaWNhdGlvbl9yZWYnO1xuaW1wb3J0IHtDaGFuZ2VEZXRlY3Rpb25TY2hlZHVsZXJJbXBsfSBmcm9tICcuL3pvbmVsZXNzX3NjaGVkdWxpbmdfaW1wbCc7XG5pbXBvcnQge2luamVjdH0gZnJvbSAnLi4vLi4vZGkvaW5qZWN0b3JfY29tcGF0aWJpbGl0eSc7XG5pbXBvcnQge21ha2VFbnZpcm9ubWVudFByb3ZpZGVyc30gZnJvbSAnLi4vLi4vZGkvcHJvdmlkZXJfY29sbGVjdGlvbic7XG5pbXBvcnQge05nWm9uZX0gZnJvbSAnLi4vLi4vem9uZS9uZ196b25lJztcblxuaW1wb3J0IHtFbnZpcm9ubWVudEluamVjdG9yfSBmcm9tICcuLi8uLi9kaS9yM19pbmplY3Rvcic7XG5pbXBvcnQge0VOVklST05NRU5UX0lOSVRJQUxJWkVSfSBmcm9tICcuLi8uLi9kaS9pbml0aWFsaXplcl90b2tlbic7XG5pbXBvcnQge0NoZWNrTm9DaGFuZ2VzTW9kZX0gZnJvbSAnLi4vLi4vcmVuZGVyMy9zdGF0ZSc7XG5pbXBvcnQge0Vycm9ySGFuZGxlcn0gZnJvbSAnLi4vLi4vZXJyb3JfaGFuZGxlcic7XG5pbXBvcnQge2NoZWNrTm9DaGFuZ2VzSW50ZXJuYWx9IGZyb20gJy4uLy4uL3JlbmRlcjMvaW5zdHJ1Y3Rpb25zL2NoYW5nZV9kZXRlY3Rpb24nO1xuaW1wb3J0IHtaT05FTEVTU19FTkFCTEVEfSBmcm9tICcuL3pvbmVsZXNzX3NjaGVkdWxpbmcnO1xuXG4vKipcbiAqIFVzZWQgdG8gcGVyaW9kaWNhbGx5IHZlcmlmeSBubyBleHByZXNzaW9ucyBoYXZlIGNoYW5nZWQgYWZ0ZXIgdGhleSB3ZXJlIGNoZWNrZWQuXG4gKlxuICogQHBhcmFtIG9wdGlvbnMgVXNlZCB0byBjb25maWd1cmUgd2hlbiB0aGUgY2hlY2sgd2lsbCBleGVjdXRlLlxuICogICAtIGBpbnRlcnZhbGAgd2lsbCBwZXJpb2RpY2FsbHkgcnVuIGV4aGF1c3RpdmUgYGNoZWNrTm9DaGFuZ2VzYCBvbiBhcHBsaWNhdGlvbiB2aWV3c1xuICogICAtIGB1c2VOZ1pvbmVPblN0YWJsZWAgd2lsbCB1c2UgWm9uZUpTIHRvIGRldGVybWluZSB3aGVuIGNoYW5nZSBkZXRlY3Rpb24gbWlnaHQgaGF2ZSBydW5cbiAqICAgICAgaW4gYW4gYXBwbGljYXRpb24gdXNpbmcgWm9uZUpTIHRvIGRyaXZlIGNoYW5nZSBkZXRlY3Rpb24uIFdoZW4gdGhlIGBOZ1pvbmUub25TdGFibGVgIHdvdWxkXG4gKiAgICAgIGhhdmUgZW1pdHRlZCwgYWxsIHZpZXdzIGF0dGFjaGVkIHRvIHRoZSBgQXBwbGljYXRpb25SZWZgIGFyZSBjaGVja2VkIGZvciBjaGFuZ2VzLlxuICogICAtICdleGhhdXN0aXZlJyBtZWFucyB0aGF0IGFsbCB2aWV3cyBhdHRhY2hlZCB0byBgQXBwbGljYXRpb25SZWZgIGFuZCBhbGwgdGhlIGRlc2NlbmRhbnRzIG9mIHRob3NlIHZpZXdzIHdpbGwgYmVcbiAqICAgICBjaGVja2VkIGZvciBjaGFuZ2VzIChleGNsdWRpbmcgdGhvc2Ugc3VidHJlZXMgd2hpY2ggYXJlIGRldGFjaGVkIHZpYSBgQ2hhbmdlRGV0ZWN0b3JSZWYuZGV0YWNoKClgKS5cbiAqICAgICBUaGlzIGlzIHVzZWZ1bCBiZWNhdXNlIHRoZSBjaGVjayB0aGF0IHJ1bnMgYWZ0ZXIgcmVndWxhciBjaGFuZ2UgZGV0ZWN0aW9uIGRvZXMgbm90IHdvcmsgZm9yIGNvbXBvbmVudHMgdXNpbmcgYENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaGAuXG4gKiAgICAgVGhpcyBjaGVjayBpcyB3aWxsIHN1cmZhY2UgYW55IGV4aXN0aW5nIGVycm9ycyBoaWRkZW4gYnkgYE9uUHVzaGAgY29tcG9uZW50cy4gQnkgZGVmYXVsdCwgdGhpcyBjaGVjayBpcyBleGhhdXN0aXZlXG4gKiAgICAgYW5kIHdpbGwgYWx3YXlzIGNoZWNrIGFsbCB2aWV3cywgcmVnYXJkbGVzcyBvZiB0aGVpciBcImRpcnR5XCIgc3RhdGUgYW5kIGBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneWAuXG4gKlxuICogV2hlbiB0aGUgYHVzZU5nWm9uZU9uU3RhYmxlYCBvcHRpb24gaXMgYHRydWVgLCB0aGlzIGZ1bmN0aW9uIHdpbGwgcHJvdmlkZSBpdHMgb3duIGBOZ1pvbmVgIGltcGxlbWVudGF0aW9uIGFuZCBuZWVkc1xuICogdG8gY29tZSBhZnRlciBhbnkgb3RoZXIgYE5nWm9uZWAgcHJvdmlkZXIsIGluY2x1ZGluZyBgcHJvdmlkZVpvbmVDaGFuZ2VEZXRlY3Rpb24oKWAgYW5kIGBwcm92aWRlRXhwZXJpbWVudGFsWm9uZWxlc3NDaGFuZ2VEZXRlY3Rpb24oKWAuXG4gKlxuICogQGV4cGVyaW1lbnRhbFxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gcHJvdmlkZUV4cGVyaW1lbnRhbENoZWNrTm9DaGFuZ2VzRm9yRGVidWcob3B0aW9uczoge1xuICBpbnRlcnZhbD86IG51bWJlcjtcbiAgdXNlTmdab25lT25TdGFibGU/OiBib29sZWFuO1xuICBleGhhdXN0aXZlPzogYm9vbGVhbjtcbn0pIHtcbiAgaWYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkge1xuICAgIGlmIChvcHRpb25zLmludGVydmFsID09PSB1bmRlZmluZWQgJiYgIW9wdGlvbnMudXNlTmdab25lT25TdGFibGUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTXVzdCBwcm92aWRlIG9uZSBvZiBgdXNlTmdab25lT25TdGFibGVgIG9yIGBpbnRlcnZhbGAnKTtcbiAgICB9XG4gICAgY29uc3QgY2hlY2tOb0NoYW5nZXNNb2RlID1cbiAgICAgIG9wdGlvbnM/LmV4aGF1c3RpdmUgPT09IGZhbHNlXG4gICAgICAgID8gQ2hlY2tOb0NoYW5nZXNNb2RlLk9ubHlEaXJ0eVZpZXdzXG4gICAgICAgIDogQ2hlY2tOb0NoYW5nZXNNb2RlLkV4aGF1c3RpdmU7XG4gICAgcmV0dXJuIG1ha2VFbnZpcm9ubWVudFByb3ZpZGVycyhbXG4gICAgICBvcHRpb25zPy51c2VOZ1pvbmVPblN0YWJsZVxuICAgICAgICA/IHtwcm92aWRlOiBOZ1pvbmUsIHVzZUZhY3Rvcnk6ICgpID0+IG5ldyBEZWJ1Z05nWm9uZUZvckNoZWNrTm9DaGFuZ2VzKGNoZWNrTm9DaGFuZ2VzTW9kZSl9XG4gICAgICAgIDogW10sXG4gICAgICBvcHRpb25zPy5pbnRlcnZhbCAhPT0gdW5kZWZpbmVkXG4gICAgICAgID8gZXhoYXVzdGl2ZUNoZWNrTm9DaGFuZ2VzSW50ZXJ2YWwob3B0aW9ucy5pbnRlcnZhbCwgY2hlY2tOb0NoYW5nZXNNb2RlKVxuICAgICAgICA6IFtdLFxuICAgICAge1xuICAgICAgICBwcm92aWRlOiBFTlZJUk9OTUVOVF9JTklUSUFMSVpFUixcbiAgICAgICAgbXVsdGk6IHRydWUsXG4gICAgICAgIHVzZVZhbHVlOiAoKSA9PiB7XG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgb3B0aW9ucz8udXNlTmdab25lT25TdGFibGUgJiZcbiAgICAgICAgICAgICEoaW5qZWN0KE5nWm9uZSkgaW5zdGFuY2VvZiBEZWJ1Z05nWm9uZUZvckNoZWNrTm9DaGFuZ2VzKVxuICAgICAgICAgICkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAnYHByb3ZpZGVFeHBlcmltZW50YWxDaGVja05vQ2hhbmdlc0ZvckRlYnVnYCB3aXRoIGB1c2VOZ1pvbmVPblN0YWJsZWAgbXVzdCBiZSBhZnRlciBhbnkgb3RoZXIgcHJvdmlkZXIgZm9yIGBOZ1pvbmVgLicsXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgXSk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG1ha2VFbnZpcm9ubWVudFByb3ZpZGVycyhbXSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIERlYnVnTmdab25lRm9yQ2hlY2tOb0NoYW5nZXMgZXh0ZW5kcyBOZ1pvbmUge1xuICBwcml2YXRlIGFwcGxpY2F0aW9uUmVmPzogQXBwbGljYXRpb25SZWY7XG4gIHByaXZhdGUgc2NoZWR1bGVyPzogQ2hhbmdlRGV0ZWN0aW9uU2NoZWR1bGVySW1wbDtcbiAgcHJpdmF0ZSBlcnJvckhhbmRsZXI/OiBFcnJvckhhbmRsZXI7XG4gIHByaXZhdGUgcmVhZG9ubHkgaW5qZWN0b3IgPSBpbmplY3QoRW52aXJvbm1lbnRJbmplY3Rvcik7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSBjaGVja05vQ2hhbmdlc01vZGU6IENoZWNrTm9DaGFuZ2VzTW9kZSkge1xuICAgIGNvbnN0IHpvbmVsZXNzRW5hYmxlZCA9IGluamVjdChaT05FTEVTU19FTkFCTEVEKTtcbiAgICAvLyBVc2UgY29hbGVzY2luZyB0byBlbnN1cmUgd2UgYXJlbid0IGV2ZXIgcnVubmluZyB0aGlzIGNoZWNrIHN5bmNocm9ub3VzbHlcbiAgICBzdXBlcih7XG4gICAgICBzaG91bGRDb2FsZXNjZUV2ZW50Q2hhbmdlRGV0ZWN0aW9uOiB0cnVlLFxuICAgICAgc2hvdWxkQ29hbGVzY2VSdW5DaGFuZ2VEZXRlY3Rpb246IHpvbmVsZXNzRW5hYmxlZCxcbiAgICB9KTtcblxuICAgIGlmICh6b25lbGVzc0VuYWJsZWQpIHtcbiAgICAgIC8vIHByZXZlbnQgZW1pdHMgdG8gZW5zdXJlIGNvZGUgZG9lc24ndCByZWx5IG9uIHRoZXNlXG4gICAgICB0aGlzLm9uTWljcm90YXNrRW1wdHkuZW1pdCA9ICgpID0+IHt9O1xuICAgICAgdGhpcy5vblN0YWJsZS5lbWl0ID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNjaGVkdWxlciB8fD0gdGhpcy5pbmplY3Rvci5nZXQoQ2hhbmdlRGV0ZWN0aW9uU2NoZWR1bGVySW1wbCk7XG4gICAgICAgIGlmICh0aGlzLnNjaGVkdWxlci5wZW5kaW5nUmVuZGVyVGFza0lkIHx8IHRoaXMuc2NoZWR1bGVyLnJ1bm5pbmdUaWNrKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY2hlY2tBcHBsaWNhdGlvblZpZXdzKCk7XG4gICAgICB9O1xuICAgICAgdGhpcy5vblVuc3RhYmxlLmVtaXQgPSAoKSA9PiB7fTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICAgIHRoaXMub25TdGFibGUuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgICB0aGlzLmNoZWNrQXBwbGljYXRpb25WaWV3cygpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgY2hlY2tBcHBsaWNhdGlvblZpZXdzKCkge1xuICAgIHRoaXMuYXBwbGljYXRpb25SZWYgfHw9IHRoaXMuaW5qZWN0b3IuZ2V0KEFwcGxpY2F0aW9uUmVmKTtcbiAgICBmb3IgKGNvbnN0IHZpZXcgb2YgdGhpcy5hcHBsaWNhdGlvblJlZi5hbGxWaWV3cykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY2hlY2tOb0NoYW5nZXNJbnRlcm5hbCh2aWV3Ll9sVmlldywgdGhpcy5jaGVja05vQ2hhbmdlc01vZGUsIHZpZXcubm90aWZ5RXJyb3JIYW5kbGVyKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgdGhpcy5lcnJvckhhbmRsZXIgfHw9IHRoaXMuaW5qZWN0b3IuZ2V0KEVycm9ySGFuZGxlcik7XG4gICAgICAgIHRoaXMuZXJyb3JIYW5kbGVyLmhhbmRsZUVycm9yKGUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBleGhhdXN0aXZlQ2hlY2tOb0NoYW5nZXNJbnRlcnZhbChcbiAgaW50ZXJ2YWw6IG51bWJlcixcbiAgY2hlY2tOb0NoYW5nZXNNb2RlOiBDaGVja05vQ2hhbmdlc01vZGUsXG4pIHtcbiAgcmV0dXJuIHtcbiAgICBwcm92aWRlOiBFTlZJUk9OTUVOVF9JTklUSUFMSVpFUixcbiAgICBtdWx0aTogdHJ1ZSxcbiAgICB1c2VGYWN0b3J5OiAoKSA9PiB7XG4gICAgICBjb25zdCBhcHBsaWNhdGlvblJlZiA9IGluamVjdChBcHBsaWNhdGlvblJlZik7XG4gICAgICBjb25zdCBlcnJvckhhbmRsZXIgPSBpbmplY3QoRXJyb3JIYW5kbGVyKTtcbiAgICAgIGNvbnN0IHNjaGVkdWxlciA9IGluamVjdChDaGFuZ2VEZXRlY3Rpb25TY2hlZHVsZXJJbXBsKTtcbiAgICAgIGNvbnN0IG5nWm9uZSA9IGluamVjdChOZ1pvbmUpO1xuXG4gICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICBmdW5jdGlvbiBzY2hlZHVsZUNoZWNrTm9DaGFuZ2VzKCkge1xuICAgICAgICAgIG5nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgaWYgKGFwcGxpY2F0aW9uUmVmLmRlc3Ryb3llZCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAoc2NoZWR1bGVyLnBlbmRpbmdSZW5kZXJUYXNrSWQgfHwgc2NoZWR1bGVyLnJ1bm5pbmdUaWNrKSB7XG4gICAgICAgICAgICAgICAgc2NoZWR1bGVDaGVja05vQ2hhbmdlcygpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGZvciAoY29uc3QgdmlldyBvZiBhcHBsaWNhdGlvblJlZi5hbGxWaWV3cykge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICBjaGVja05vQ2hhbmdlc0ludGVybmFsKHZpZXcuX2xWaWV3LCBjaGVja05vQ2hhbmdlc01vZGUsIHZpZXcubm90aWZ5RXJyb3JIYW5kbGVyKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICBlcnJvckhhbmRsZXIuaGFuZGxlRXJyb3IoZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgc2NoZWR1bGVDaGVja05vQ2hhbmdlcygpO1xuICAgICAgICAgICAgfSwgaW50ZXJ2YWwpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHNjaGVkdWxlQ2hlY2tOb0NoYW5nZXMoKTtcbiAgICAgIH07XG4gICAgfSxcbiAgfTtcbn1cbiJdfQ==