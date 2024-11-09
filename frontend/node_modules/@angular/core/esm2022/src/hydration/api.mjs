/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { APP_BOOTSTRAP_LISTENER, ApplicationRef, whenStable } from '../application/application_ref';
import { Console } from '../console';
import { ENVIRONMENT_INITIALIZER, Injector, makeEnvironmentProviders } from '../di';
import { inject } from '../di/injector_compatibility';
import { formatRuntimeError, RuntimeError } from '../errors';
import { enableLocateOrCreateContainerRefImpl } from '../linker/view_container_ref';
import { enableLocateOrCreateI18nNodeImpl } from '../render3/i18n/i18n_apply';
import { enableLocateOrCreateElementNodeImpl } from '../render3/instructions/element';
import { enableLocateOrCreateElementContainerNodeImpl } from '../render3/instructions/element_container';
import { enableApplyRootElementTransformImpl } from '../render3/instructions/shared';
import { enableLocateOrCreateContainerAnchorImpl } from '../render3/instructions/template';
import { enableLocateOrCreateTextNodeImpl } from '../render3/instructions/text';
import { getDocument } from '../render3/interfaces/document';
import { isPlatformBrowser } from '../render3/util/misc_utils';
import { TransferState } from '../transfer_state';
import { performanceMarkFeature } from '../util/performance';
import { NgZone } from '../zone';
import { cleanupDehydratedViews } from './cleanup';
import { IS_HYDRATION_DOM_REUSE_ENABLED, IS_I18N_HYDRATION_ENABLED, PRESERVE_HOST_CONTENT } from './tokens';
import { enableRetrieveHydrationInfoImpl, NGH_DATA_KEY, SSR_CONTENT_INTEGRITY_MARKER } from './utils';
import { enableFindMatchingDehydratedViewImpl } from './views';
/**
 * Indicates whether the hydration-related code was added,
 * prevents adding it multiple times.
 */
let isHydrationSupportEnabled = false;
/**
 * Indicates whether support for hydrating i18n blocks is enabled.
 */
let _isI18nHydrationSupportEnabled = false;
/**
 * Defines a period of time that Angular waits for the `ApplicationRef.isStable` to emit `true`.
 * If there was no event with the `true` value during this time, Angular reports a warning.
 */
const APPLICATION_IS_STABLE_TIMEOUT = 10_000;
/**
 * Brings the necessary hydration code in tree-shakable manner.
 * The code is only present when the `provideClientHydration` is
 * invoked. Otherwise, this code is tree-shaken away during the
 * build optimization step.
 *
 * This technique allows us to swap implementations of methods so
 * tree shaking works appropriately when hydration is disabled or
 * enabled. It brings in the appropriate version of the method that
 * supports hydration only when enabled.
 */
function enableHydrationRuntimeSupport() {
    if (!isHydrationSupportEnabled) {
        isHydrationSupportEnabled = true;
        enableRetrieveHydrationInfoImpl();
        enableLocateOrCreateElementNodeImpl();
        enableLocateOrCreateTextNodeImpl();
        enableLocateOrCreateElementContainerNodeImpl();
        enableLocateOrCreateContainerAnchorImpl();
        enableLocateOrCreateContainerRefImpl();
        enableFindMatchingDehydratedViewImpl();
        enableApplyRootElementTransformImpl();
        enableLocateOrCreateI18nNodeImpl();
    }
}
/**
 * Outputs a message with hydration stats into a console.
 */
function printHydrationStats(injector) {
    const console = injector.get(Console);
    const message = `Angular hydrated ${ngDevMode.hydratedComponents} component(s) ` +
        `and ${ngDevMode.hydratedNodes} node(s), ` +
        `${ngDevMode.componentsSkippedHydration} component(s) were skipped. ` +
        `Learn more at https://angular.io/guide/hydration.`;
    // tslint:disable-next-line:no-console
    console.log(message);
}
/**
 * Returns a Promise that is resolved when an application becomes stable.
 */
function whenStableWithTimeout(appRef, injector) {
    const whenStablePromise = whenStable(appRef);
    if (typeof ngDevMode !== 'undefined' && ngDevMode) {
        const timeoutTime = APPLICATION_IS_STABLE_TIMEOUT;
        const console = injector.get(Console);
        const ngZone = injector.get(NgZone);
        // The following call should not and does not prevent the app to become stable
        // We cannot use RxJS timer here because the app would remain unstable.
        // This also avoids an extra change detection cycle.
        const timeoutId = ngZone.runOutsideAngular(() => {
            return setTimeout(() => logWarningOnStableTimedout(timeoutTime, console), timeoutTime);
        });
        whenStablePromise.finally(() => clearTimeout(timeoutId));
    }
    return whenStablePromise;
}
/**
 * Returns a set of providers required to setup hydration support
 * for an application that is server side rendered. This function is
 * included into the `provideClientHydration` public API function from
 * the `platform-browser` package.
 *
 * The function sets up an internal flag that would be recognized during
 * the server side rendering time as well, so there is no need to
 * configure or change anything in NgUniversal to enable the feature.
 */
export function withDomHydration() {
    return makeEnvironmentProviders([
        {
            provide: IS_HYDRATION_DOM_REUSE_ENABLED,
            useFactory: () => {
                let isEnabled = true;
                if (isPlatformBrowser()) {
                    // On the client, verify that the server response contains
                    // hydration annotations. Otherwise, keep hydration disabled.
                    const transferState = inject(TransferState, { optional: true });
                    isEnabled = !!transferState?.get(NGH_DATA_KEY, null);
                    if (!isEnabled && (typeof ngDevMode !== 'undefined' && ngDevMode)) {
                        const console = inject(Console);
                        const message = formatRuntimeError(-505 /* RuntimeErrorCode.MISSING_HYDRATION_ANNOTATIONS */, 'Angular hydration was requested on the client, but there was no ' +
                            'serialized information present in the server response, ' +
                            'thus hydration was not enabled. ' +
                            'Make sure the `provideClientHydration()` is included into the list ' +
                            'of providers in the server part of the application configuration.');
                        // tslint:disable-next-line:no-console
                        console.warn(message);
                    }
                }
                if (isEnabled) {
                    performanceMarkFeature('NgHydration');
                }
                return isEnabled;
            },
        },
        {
            provide: ENVIRONMENT_INITIALIZER,
            useValue: () => {
                _isI18nHydrationSupportEnabled = !!inject(IS_I18N_HYDRATION_ENABLED, { optional: true });
                // Since this function is used across both server and client,
                // make sure that the runtime code is only added when invoked
                // on the client. Moving forward, the `isPlatformBrowser` check should
                // be replaced with a tree-shakable alternative (e.g. `isServer`
                // flag).
                if (isPlatformBrowser() && inject(IS_HYDRATION_DOM_REUSE_ENABLED)) {
                    verifySsrContentsIntegrity();
                    enableHydrationRuntimeSupport();
                }
            },
            multi: true,
        },
        {
            provide: PRESERVE_HOST_CONTENT,
            useFactory: () => {
                // Preserve host element content only in a browser
                // environment and when hydration is configured properly.
                // On a server, an application is rendered from scratch,
                // so the host content needs to be empty.
                return isPlatformBrowser() && inject(IS_HYDRATION_DOM_REUSE_ENABLED);
            }
        },
        {
            provide: APP_BOOTSTRAP_LISTENER,
            useFactory: () => {
                if (isPlatformBrowser() && inject(IS_HYDRATION_DOM_REUSE_ENABLED)) {
                    const appRef = inject(ApplicationRef);
                    const injector = inject(Injector);
                    return () => {
                        // Wait until an app becomes stable and cleanup all views that
                        // were not claimed during the application bootstrap process.
                        // The timing is similar to when we start the serialization process
                        // on the server.
                        //
                        // Note: the cleanup task *MUST* be scheduled within the Angular zone
                        // to ensure that change detection is properly run afterward.
                        whenStableWithTimeout(appRef, injector).then(() => {
                            NgZone.assertInAngularZone();
                            cleanupDehydratedViews(appRef);
                            if (typeof ngDevMode !== 'undefined' && ngDevMode) {
                                printHydrationStats(injector);
                            }
                        });
                    };
                }
                return () => { }; // noop
            },
            multi: true,
        }
    ]);
}
/**
 * Returns a set of providers required to setup support for i18n hydration.
 * Requires hydration to be enabled separately.
 */
export function withI18nHydration() {
    return makeEnvironmentProviders([
        {
            provide: IS_I18N_HYDRATION_ENABLED,
            useValue: true,
        },
    ]);
}
/**
 * Returns whether i18n hydration support is enabled.
 */
export function isI18nHydrationSupportEnabled() {
    return _isI18nHydrationSupportEnabled;
}
/**
 *
 * @param time The time in ms until the stable timedout warning message is logged
 */
function logWarningOnStableTimedout(time, console) {
    const message = `Angular hydration expected the ApplicationRef.isStable() to emit \`true\`, but it ` +
        `didn't happen within ${time}ms. Angular hydration logic depends on the application becoming stable ` +
        `as a signal to complete hydration process.`;
    console.warn(formatRuntimeError(-506 /* RuntimeErrorCode.HYDRATION_STABLE_TIMEDOUT */, message));
}
/**
 * Verifies whether the DOM contains a special marker added during SSR time to make sure
 * there is no SSR'ed contents transformations happen after SSR is completed. Typically that
 * happens either by CDN or during the build process as an optimization to remove comment nodes.
 * Hydration process requires comment nodes produced by Angular to locate correct DOM segments.
 * When this special marker is *not* present - throw an error and do not proceed with hydration,
 * since it will not be able to function correctly.
 *
 * Note: this function is invoked only on the client, so it's safe to use DOM APIs.
 */
function verifySsrContentsIntegrity() {
    const doc = getDocument();
    let hydrationMarker;
    for (const node of doc.body.childNodes) {
        if (node.nodeType === Node.COMMENT_NODE &&
            node.textContent?.trim() === SSR_CONTENT_INTEGRITY_MARKER) {
            hydrationMarker = node;
            break;
        }
    }
    if (!hydrationMarker) {
        throw new RuntimeError(-507 /* RuntimeErrorCode.MISSING_SSR_CONTENT_INTEGRITY_MARKER */, typeof ngDevMode !== 'undefined' && ngDevMode &&
            'Angular hydration logic detected that HTML content of this page was modified after it ' +
                'was produced during server side rendering. Make sure that there are no optimizations ' +
                'that remove comment nodes from HTML enabled on your CDN. Angular hydration ' +
                'relies on HTML produced by the server, including whitespaces and comment nodes.');
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvaHlkcmF0aW9uL2FwaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsc0JBQXNCLEVBQUUsY0FBYyxFQUFFLFVBQVUsRUFBQyxNQUFNLGdDQUFnQyxDQUFDO0FBQ2xHLE9BQU8sRUFBQyxPQUFPLEVBQUMsTUFBTSxZQUFZLENBQUM7QUFDbkMsT0FBTyxFQUFDLHVCQUF1QixFQUF3QixRQUFRLEVBQUUsd0JBQXdCLEVBQUMsTUFBTSxPQUFPLENBQUM7QUFDeEcsT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLDhCQUE4QixDQUFDO0FBQ3BELE9BQU8sRUFBQyxrQkFBa0IsRUFBRSxZQUFZLEVBQW1CLE1BQU0sV0FBVyxDQUFDO0FBQzdFLE9BQU8sRUFBQyxvQ0FBb0MsRUFBQyxNQUFNLDhCQUE4QixDQUFDO0FBQ2xGLE9BQU8sRUFBQyxnQ0FBZ0MsRUFBQyxNQUFNLDRCQUE0QixDQUFDO0FBQzVFLE9BQU8sRUFBQyxtQ0FBbUMsRUFBQyxNQUFNLGlDQUFpQyxDQUFDO0FBQ3BGLE9BQU8sRUFBQyw0Q0FBNEMsRUFBQyxNQUFNLDJDQUEyQyxDQUFDO0FBQ3ZHLE9BQU8sRUFBQyxtQ0FBbUMsRUFBQyxNQUFNLGdDQUFnQyxDQUFDO0FBQ25GLE9BQU8sRUFBQyx1Q0FBdUMsRUFBQyxNQUFNLGtDQUFrQyxDQUFDO0FBQ3pGLE9BQU8sRUFBQyxnQ0FBZ0MsRUFBQyxNQUFNLDhCQUE4QixDQUFDO0FBQzlFLE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSxnQ0FBZ0MsQ0FBQztBQUMzRCxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSw0QkFBNEIsQ0FBQztBQUM3RCxPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDaEQsT0FBTyxFQUFDLHNCQUFzQixFQUFDLE1BQU0s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QTZFO2dCQUM3RSxpRkFBaUYsQ0FBQyxDQUFDO0lBQ2pHLENBQUM7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QVBQX0JPT1RTVFJBUF9MSVNURU5FUiwgQXBwbGljYXRpb25SZWYsIHdoZW5TdGFibGV9IGZyb20gJy4uL2FwcGxpY2F0aW9uL2FwcGxpY2F0aW9uX3JlZic7XG5pbXBvcnQge0NvbnNvbGV9IGZyb20gJy4uL2NvbnNvbGUnO1xuaW1wb3J0IHtFTlZJUk9OTUVOVF9JTklUSUFMSVpFUiwgRW52aXJvbm1lbnRQcm92aWRlcnMsIEluamVjdG9yLCBtYWtlRW52aXJvbm1lbnRQcm92aWRlcnN9IGZyb20gJy4uL2RpJztcbmltcG9ydCB7aW5qZWN0fSBmcm9tICcuLi9kaS9pbmplY3Rvcl9jb21wYXRpYmlsaXR5JztcbmltcG9ydCB7Zm9ybWF0UnVudGltZUVycm9yLCBSdW50aW1lRXJyb3IsIFJ1bnRpbWVFcnJvckNvZGV9IGZyb20gJy4uL2Vycm9ycyc7XG5pbXBvcnQge2VuYWJsZUxvY2F0ZU9yQ3JlYXRlQ29udGFpbmVyUmVmSW1wbH0gZnJvbSAnLi4vbGlua2VyL3ZpZXdfY29udGFpbmVyX3JlZic7XG5pbXBvcnQge2VuYWJsZUxvY2F0ZU9yQ3JlYXRlSTE4bk5vZGVJbXBsfSBmcm9tICcuLi9yZW5kZXIzL2kxOG4vaTE4bl9hcHBseSc7XG5pbXBvcnQge2VuYWJsZUxvY2F0ZU9yQ3JlYXRlRWxlbWVudE5vZGVJbXBsfSBmcm9tICcuLi9yZW5kZXIzL2luc3RydWN0aW9ucy9lbGVtZW50JztcbmltcG9ydCB7ZW5hYmxlTG9jYXRlT3JDcmVhdGVFbGVtZW50Q29udGFpbmVyTm9kZUltcGx9IGZyb20gJy4uL3JlbmRlcjMvaW5zdHJ1Y3Rpb25zL2VsZW1lbnRfY29udGFpbmVyJztcbmltcG9ydCB7ZW5hYmxlQXBwbHlSb290RWxlbWVudFRyYW5zZm9ybUltcGx9IGZyb20gJy4uL3JlbmRlcjMvaW5zdHJ1Y3Rpb25zL3NoYXJlZCc7XG5pbXBvcnQge2VuYWJsZUxvY2F0ZU9yQ3JlYXRlQ29udGFpbmVyQW5jaG9ySW1wbH0gZnJvbSAnLi4vcmVuZGVyMy9pbnN0cnVjdGlvbnMvdGVtcGxhdGUnO1xuaW1wb3J0IHtlbmFibGVMb2NhdGVPckNyZWF0ZVRleHROb2RlSW1wbH0gZnJvbSAnLi4vcmVuZGVyMy9pbnN0cnVjdGlvbnMvdGV4dCc7XG5pbXBvcnQge2dldERvY3VtZW50fSBmcm9tICcuLi9yZW5kZXIzL2ludGVyZmFjZXMvZG9jdW1lbnQnO1xuaW1wb3J0IHtpc1BsYXRmb3JtQnJvd3Nlcn0gZnJvbSAnLi4vcmVuZGVyMy91dGlsL21pc2NfdXRpbHMnO1xuaW1wb3J0IHtUcmFuc2ZlclN0YXRlfSBmcm9tICcuLi90cmFuc2Zlcl9zdGF0ZSc7XG5pbXBvcnQge3BlcmZvcm1hbmNlTWFya0ZlYXR1cmV9IGZyb20gJy4uL3V0aWwvcGVyZm9ybWFuY2UnO1xuaW1wb3J0IHtOZ1pvbmV9IGZyb20gJy4uL3pvbmUnO1xuXG5pbXBvcnQge2NsZWFudXBEZWh5ZHJhdGVkVmlld3N9IGZyb20gJy4vY2xlYW51cCc7XG5pbXBvcnQge0lTX0hZRFJBVElPTl9ET01fUkVVU0VfRU5BQkxFRCwgSVNfSTE4Tl9IWURSQVRJT05fRU5BQkxFRCwgUFJFU0VSVkVfSE9TVF9DT05URU5UfSBmcm9tICcuL3Rva2Vucyc7XG5pbXBvcnQge2VuYWJsZVJldHJpZXZlSHlkcmF0aW9uSW5mb0ltcGwsIE5HSF9EQVRBX0tFWSwgU1NSX0NPTlRFTlRfSU5URUdSSVRZX01BUktFUn0gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQge2VuYWJsZUZpbmRNYXRjaGluZ0RlaHlkcmF0ZWRWaWV3SW1wbH0gZnJvbSAnLi92aWV3cyc7XG5cbi8qKlxuICogSW5kaWNhdGVzIHdoZXRoZXIgdGhlIGh5ZHJhdGlvbi1yZWxhdGVkIGNvZGUgd2FzIGFkZGVkLFxuICogcHJldmVudHMgYWRkaW5nIGl0IG11bHRpcGxlIHRpbWVzLlxuICovXG5sZXQgaXNIeWRyYXRpb25TdXBwb3J0RW5hYmxlZCA9IGZhbHNlO1xuXG4vKipcbiAqIEluZGljYXRlcyB3aGV0aGVyIHN1cHBvcnQgZm9yIGh5ZHJhdGluZyBpMThuIGJsb2NrcyBpcyBlbmFibGVkLlxuICovXG5sZXQgX2lzSTE4bkh5ZHJhdGlvblN1cHBvcnRFbmFibGVkID0gZmFsc2U7XG5cbi8qKlxuICogRGVmaW5lcyBhIHBlcmlvZCBvZiB0aW1lIHRoYXQgQW5ndWxhciB3YWl0cyBmb3IgdGhlIGBBcHBsaWNhdGlvblJlZi5pc1N0YWJsZWAgdG8gZW1pdCBgdHJ1ZWAuXG4gKiBJZiB0aGVyZSB3YXMgbm8gZXZlbnQgd2l0aCB0aGUgYHRydWVgIHZhbHVlIGR1cmluZyB0aGlzIHRpbWUsIEFuZ3VsYXIgcmVwb3J0cyBhIHdhcm5pbmcuXG4gKi9cbmNvbnN0IEFQUExJQ0FUSU9OX0lTX1NUQUJMRV9USU1FT1VUID0gMTBfMDAwO1xuXG4vKipcbiAqIEJyaW5ncyB0aGUgbmVjZXNzYXJ5IGh5ZHJhdGlvbiBjb2RlIGluIHRyZWUtc2hha2FibGUgbWFubmVyLlxuICogVGhlIGNvZGUgaXMgb25seSBwcmVzZW50IHdoZW4gdGhlIGBwcm92aWRlQ2xpZW50SHlkcmF0aW9uYCBpc1xuICogaW52b2tlZC4gT3RoZXJ3aXNlLCB0aGlzIGNvZGUgaXMgdHJlZS1zaGFrZW4gYXdheSBkdXJpbmcgdGhlXG4gKiBidWlsZCBvcHRpbWl6YXRpb24gc3RlcC5cbiAqXG4gKiBUaGlzIHRlY2huaXF1ZSBhbGxvd3MgdXMgdG8gc3dhcCBpbXBsZW1lbnRhdGlvbnMgb2YgbWV0aG9kcyBzb1xuICogdHJlZSBzaGFraW5nIHdvcmtzIGFwcHJvcHJpYXRlbHkgd2hlbiBoeWRyYXRpb24gaXMgZGlzYWJsZWQgb3JcbiAqIGVuYWJsZWQuIEl0IGJyaW5ncyBpbiB0aGUgYXBwcm9wcmlhdGUgdmVyc2lvbiBvZiB0aGUgbWV0aG9kIHRoYXRcbiAqIHN1cHBvcnRzIGh5ZHJhdGlvbiBvbmx5IHdoZW4gZW5hYmxlZC5cbiAqL1xuZnVuY3Rpb24gZW5hYmxlSHlkcmF0aW9uUnVudGltZVN1cHBvcnQoKSB7XG4gIGlmICghaXNIeWRyYXRpb25TdXBwb3J0RW5hYmxlZCkge1xuICAgIGlzSHlkcmF0aW9uU3VwcG9ydEVuYWJsZWQgPSB0cnVlO1xuICAgIGVuYWJsZVJldHJpZXZlSHlkcmF0aW9uSW5mb0ltcGwoKTtcbiAgICBlbmFibGVMb2NhdGVPckNyZWF0ZUVsZW1lbnROb2RlSW1wbCgpO1xuICAgIGVuYWJsZUxvY2F0ZU9yQ3JlYXRlVGV4dE5vZGVJbXBsKCk7XG4gICAgZW5hYmxlTG9jYXRlT3JDcmVhdGVFbGVtZW50Q29udGFpbmVyTm9kZUltcGwoKTtcbiAgICBlbmFibGVMb2NhdGVPckNyZWF0ZUNvbnRhaW5lckFuY2hvckltcGwoKTtcbiAgICBlbmFibGVMb2NhdGVPckNyZWF0ZUNvbnRhaW5lclJlZkltcGwoKTtcbiAgICBlbmFibGVGaW5kTWF0Y2hpbmdEZWh5ZHJhdGVkVmlld0ltcGwoKTtcbiAgICBlbmFibGVBcHBseVJvb3RFbGVtZW50VHJhbnNmb3JtSW1wbCgpO1xuICAgIGVuYWJsZUxvY2F0ZU9yQ3JlYXRlSTE4bk5vZGVJbXBsKCk7XG4gIH1cbn1cblxuLyoqXG4gKiBPdXRwdXRzIGEgbWVzc2FnZSB3aXRoIGh5ZHJhdGlvbiBzdGF0cyBpbnRvIGEgY29uc29sZS5cbiAqL1xuZnVuY3Rpb24gcHJpbnRIeWRyYXRpb25TdGF0cyhpbmplY3RvcjogSW5qZWN0b3IpIHtcbiAgY29uc3QgY29uc29sZSA9IGluamVjdG9yLmdldChDb25zb2xlKTtcbiAgY29uc3QgbWVzc2FnZSA9IGBBbmd1bGFyIGh5ZHJhdGVkICR7bmdEZXZNb2RlIS5oeWRyYXRlZENvbXBvbmVudHN9IGNvbXBvbmVudChzKSBgICtcbiAgICAgIGBhbmQgJHtuZ0Rldk1vZGUhLmh5ZHJhdGVkTm9kZXN9IG5vZGUocyksIGAgK1xuICAgICAgYCR7bmdEZXZNb2RlIS5jb21wb25lbnRzU2tpcHBlZEh5ZHJhdGlvbn0gY29tcG9uZW50KHMpIHdlcmUgc2tpcHBlZC4gYCArXG4gICAgICBgTGVhcm4gbW9yZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vZ3VpZGUvaHlkcmF0aW9uLmA7XG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1jb25zb2xlXG4gIGNvbnNvbGUubG9nKG1lc3NhZ2UpO1xufVxuXG5cbi8qKlxuICogUmV0dXJucyBhIFByb21pc2UgdGhhdCBpcyByZXNvbHZlZCB3aGVuIGFuIGFwcGxpY2F0aW9uIGJlY29tZXMgc3RhYmxlLlxuICovXG5mdW5jdGlvbiB3aGVuU3RhYmxlV2l0aFRpbWVvdXQoYXBwUmVmOiBBcHBsaWNhdGlvblJlZiwgaW5qZWN0b3I6IEluamVjdG9yKTogUHJvbWlzZTx2b2lkPiB7XG4gIGNvbnN0IHdoZW5TdGFibGVQcm9taXNlID0gd2hlblN0YWJsZShhcHBSZWYpO1xuICBpZiAodHlwZW9mIG5nRGV2TW9kZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbmdEZXZNb2RlKSB7XG4gICAgY29uc3QgdGltZW91dFRpbWUgPSBBUFBMSUNBVElPTl9JU19TVEFCTEVfVElNRU9VVDtcbiAgICBjb25zdCBjb25zb2xlID0gaW5qZWN0b3IuZ2V0KENvbnNvbGUpO1xuICAgIGNvbnN0IG5nWm9uZSA9IGluamVjdG9yLmdldChOZ1pvbmUpO1xuXG4gICAgLy8gVGhlIGZvbGxvd2luZyBjYWxsIHNob3VsZCBub3QgYW5kIGRvZXMgbm90IHByZXZlbnQgdGhlIGFwcCB0byBiZWNvbWUgc3RhYmxlXG4gICAgLy8gV2UgY2Fubm90IHVzZSBSeEpTIHRpbWVyIGhlcmUgYmVjYXVzZSB0aGUgYXBwIHdvdWxkIHJlbWFpbiB1bnN0YWJsZS5cbiAgICAvLyBUaGlzIGFsc28gYXZvaWRzIGFuIGV4dHJhIGNoYW5nZSBkZXRlY3Rpb24gY3ljbGUuXG4gICAgY29uc3QgdGltZW91dElkID0gbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgIHJldHVybiBzZXRUaW1lb3V0KCgpID0+IGxvZ1dhcm5pbmdPblN0YWJsZVRpbWVkb3V0KHRpbWVvdXRUaW1lLCBjb25zb2xlKSwgdGltZW91dFRpbWUpO1xuICAgIH0pO1xuXG4gICAgd2hlblN0YWJsZVByb21pc2UuZmluYWxseSgoKSA9PiBjbGVhclRpbWVvdXQodGltZW91dElkKSk7XG4gIH1cblxuICByZXR1cm4gd2hlblN0YWJsZVByb21pc2U7XG59XG5cbi8qKlxuICogUmV0dXJucyBhIHNldCBvZiBwcm92aWRlcnMgcmVxdWlyZWQgdG8gc2V0dXAgaHlkcmF0aW9uIHN1cHBvcnRcbiAqIGZvciBhbiBhcHBsaWNhdGlvbiB0aGF0IGlzIHNlcnZlciBzaWRlIHJlbmRlcmVkLiBUaGlzIGZ1bmN0aW9uIGlzXG4gKiBpbmNsdWRlZCBpbnRvIHRoZSBgcHJvdmlkZUNsaWVudEh5ZHJhdGlvbmAgcHVibGljIEFQSSBmdW5jdGlvbiBmcm9tXG4gKiB0aGUgYHBsYXRmb3JtLWJyb3dzZXJgIHBhY2thZ2UuXG4gKlxuICogVGhlIGZ1bmN0aW9uIHNldHMgdXAgYW4gaW50ZXJuYWwgZmxhZyB0aGF0IHdvdWxkIGJlIHJlY29nbml6ZWQgZHVyaW5nXG4gKiB0aGUgc2VydmVyIHNpZGUgcmVuZGVyaW5nIHRpbWUgYXMgd2VsbCwgc28gdGhlcmUgaXMgbm8gbmVlZCB0b1xuICogY29uZmlndXJlIG9yIGNoYW5nZSBhbnl0aGluZyBpbiBOZ1VuaXZlcnNhbCB0byBlbmFibGUgdGhlIGZlYXR1cmUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3aXRoRG9tSHlkcmF0aW9uKCk6IEVudmlyb25tZW50UHJvdmlkZXJzIHtcbiAgcmV0dXJuIG1ha2VFbnZpcm9ubWVudFByb3ZpZGVycyhbXG4gICAge1xuICAgICAgcHJvdmlkZTogSVNfSFlEUkFUSU9OX0RPTV9SRVVTRV9FTkFCTEVELFxuICAgICAgdXNlRmFjdG9yeTogKCkgPT4ge1xuICAgICAgICBsZXQgaXNFbmFibGVkID0gdHJ1ZTtcbiAgICAgICAgaWYgKGlzUGxhdGZvcm1Ccm93c2VyKCkpIHtcbiAgICAgICAgICAvLyBPbiB0aGUgY2xpZW50LCB2ZXJpZnkgdGhhdCB0aGUgc2VydmVyIHJlc3BvbnNlIGNvbnRhaW5zXG4gICAgICAgICAgLy8gaHlkcmF0aW9uIGFubm90YXRpb25zLiBPdGhlcndpc2UsIGtlZXAgaHlkcmF0aW9uIGRpc2FibGVkLlxuICAgICAgICAgIGNvbnN0IHRyYW5zZmVyU3RhdGUgPSBpbmplY3QoVHJhbnNmZXJTdGF0ZSwge29wdGlvbmFsOiB0cnVlfSk7XG4gICAgICAgICAgaXNFbmFibGVkID0gISF0cmFuc2ZlclN0YXRlPy5nZXQoTkdIX0RBVEFfS0VZLCBudWxsKTtcbiAgICAgICAgICBpZiAoIWlzRW5hYmxlZCAmJiAodHlwZW9mIG5nRGV2TW9kZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbmdEZXZNb2RlKSkge1xuICAgICAgICAgICAgY29uc3QgY29uc29sZSA9IGluamVjdChDb25zb2xlKTtcbiAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBmb3JtYXRSdW50aW1lRXJyb3IoXG4gICAgICAgICAgICAgICAgUnVudGltZUVycm9yQ29kZS5NSVNTSU5HX0hZRFJBVElPTl9BTk5PVEFUSU9OUyxcbiAgICAgICAgICAgICAgICAnQW5ndWxhciBoeWRyYXRpb24gd2FzIHJlcXVlc3RlZCBvbiB0aGUgY2xpZW50LCBidXQgdGhlcmUgd2FzIG5vICcgK1xuICAgICAgICAgICAgICAgICAgICAnc2VyaWFsaXplZCBpbmZvcm1hdGlvbiBwcmVzZW50IGluIHRoZSBzZXJ2ZXIgcmVzcG9uc2UsICcgK1xuICAgICAgICAgICAgICAgICAgICAndGh1cyBoeWRyYXRpb24gd2FzIG5vdCBlbmFibGVkLiAnICtcbiAgICAgICAgICAgICAgICAgICAgJ01ha2Ugc3VyZSB0aGUgYHByb3ZpZGVDbGllbnRIeWRyYXRpb24oKWAgaXMgaW5jbHVkZWQgaW50byB0aGUgbGlzdCAnICtcbiAgICAgICAgICAgICAgICAgICAgJ29mIHByb3ZpZGVycyBpbiB0aGUgc2VydmVyIHBhcnQgb2YgdGhlIGFwcGxpY2F0aW9uIGNvbmZpZ3VyYXRpb24uJyk7XG4gICAgICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tY29uc29sZVxuICAgICAgICAgICAgY29uc29sZS53YXJuKG1lc3NhZ2UpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNFbmFibGVkKSB7XG4gICAgICAgICAgcGVyZm9ybWFuY2VNYXJrRmVhdHVyZSgnTmdIeWRyYXRpb24nKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaXNFbmFibGVkO1xuICAgICAgfSxcbiAgICB9LFxuICAgIHtcbiAgICAgIHByb3ZpZGU6IEVOVklST05NRU5UX0lOSVRJQUxJWkVSLFxuICAgICAgdXNlVmFsdWU6ICgpID0+IHtcbiAgICAgICAgX2lzSTE4bkh5ZHJhdGlvblN1cHBvcnRFbmFibGVkID0gISFpbmplY3QoSVNfSTE4Tl9IWURSQVRJT05fRU5BQkxFRCwge29wdGlvbmFsOiB0cnVlfSk7XG5cbiAgICAgICAgLy8gU2luY2UgdGhpcyBmdW5jdGlvbiBpcyB1c2VkIGFjcm9zcyBib3RoIHNlcnZlciBhbmQgY2xpZW50LFxuICAgICAgICAvLyBtYWtlIHN1cmUgdGhhdCB0aGUgcnVudGltZSBjb2RlIGlzIG9ubHkgYWRkZWQgd2hlbiBpbnZva2VkXG4gICAgICAgIC8vIG9uIHRoZSBjbGllbnQuIE1vdmluZyBmb3J3YXJkLCB0aGUgYGlzUGxhdGZvcm1Ccm93c2VyYCBjaGVjayBzaG91bGRcbiAgICAgICAgLy8gYmUgcmVwbGFjZWQgd2l0aCBhIHRyZWUtc2hha2FibGUgYWx0ZXJuYXRpdmUgKGUuZy4gYGlzU2VydmVyYFxuICAgICAgICAvLyBmbGFnKS5cbiAgICAgICAgaWYgKGlzUGxhdGZvcm1Ccm93c2VyKCkgJiYgaW5qZWN0KElTX0hZRFJBVElPTl9ET01fUkVVU0VfRU5BQkxFRCkpIHtcbiAgICAgICAgICB2ZXJpZnlTc3JDb250ZW50c0ludGVncml0eSgpO1xuICAgICAgICAgIGVuYWJsZUh5ZHJhdGlvblJ1bnRpbWVTdXBwb3J0KCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBtdWx0aTogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIHByb3ZpZGU6IFBSRVNFUlZFX0hPU1RfQ09OVEVOVCxcbiAgICAgIHVzZUZhY3Rvcnk6ICgpID0+IHtcbiAgICAgICAgLy8gUHJlc2VydmUgaG9zdCBlbGVtZW50IGNvbnRlbnQgb25seSBpbiBhIGJyb3dzZXJcbiAgICAgICAgLy8gZW52aXJvbm1lbnQgYW5kIHdoZW4gaHlkcmF0aW9uIGlzIGNvbmZpZ3VyZWQgcHJvcGVybHkuXG4gICAgICAgIC8vIE9uIGEgc2VydmVyLCBhbiBhcHBsaWNhdGlvbiBpcyByZW5kZXJlZCBmcm9tIHNjcmF0Y2gsXG4gICAgICAgIC8vIHNvIHRoZSBob3N0IGNvbnRlbnQgbmVlZHMgdG8gYmUgZW1wdHkuXG4gICAgICAgIHJldHVybiBpc1BsYXRmb3JtQnJvd3NlcigpICYmIGluamVjdChJU19IWURSQVRJT05fRE9NX1JFVVNFX0VOQUJMRUQpO1xuICAgICAgfVxuICAgIH0sXG4gICAge1xuICAgICAgcHJvdmlkZTogQVBQX0JPT1RTVFJBUF9MSVNURU5FUixcbiAgICAgIHVzZUZhY3Rvcnk6ICgpID0+IHtcbiAgICAgICAgaWYgKGlzUGxhdGZvcm1Ccm93c2VyKCkgJiYgaW5qZWN0KElTX0hZRFJBVElPTl9ET01fUkVVU0VfRU5BQkxFRCkpIHtcbiAgICAgICAgICBjb25zdCBhcHBSZWYgPSBpbmplY3QoQXBwbGljYXRpb25SZWYpO1xuICAgICAgICAgIGNvbnN0IGluamVjdG9yID0gaW5qZWN0KEluamVjdG9yKTtcbiAgICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgLy8gV2FpdCB1bnRpbCBhbiBhcHAgYmVjb21lcyBzdGFibGUgYW5kIGNsZWFudXAgYWxsIHZpZXdzIHRoYXRcbiAgICAgICAgICAgIC8vIHdlcmUgbm90IGNsYWltZWQgZHVyaW5nIHRoZSBhcHBsaWNhdGlvbiBib290c3RyYXAgcHJvY2Vzcy5cbiAgICAgICAgICAgIC8vIFRoZSB0aW1pbmcgaXMgc2ltaWxhciB0byB3aGVuIHdlIHN0YXJ0IHRoZSBzZXJpYWxpemF0aW9uIHByb2Nlc3NcbiAgICAgICAgICAgIC8vIG9uIHRoZSBzZXJ2ZXIuXG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gTm90ZTogdGhlIGNsZWFudXAgdGFzayAqTVVTVCogYmUgc2NoZWR1bGVkIHdpdGhpbiB0aGUgQW5ndWxhciB6b25lXG4gICAgICAgICAgICAvLyB0byBlbnN1cmUgdGhhdCBjaGFuZ2UgZGV0ZWN0aW9uIGlzIHByb3Blcmx5IHJ1biBhZnRlcndhcmQuXG4gICAgICAgICAgICB3aGVuU3RhYmxlV2l0aFRpbWVvdXQoYXBwUmVmLCBpbmplY3RvcikudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgIE5nWm9uZS5hc3NlcnRJbkFuZ3VsYXJab25lKCk7XG4gICAgICAgICAgICAgIGNsZWFudXBEZWh5ZHJhdGVkVmlld3MoYXBwUmVmKTtcblxuICAgICAgICAgICAgICBpZiAodHlwZW9mIG5nRGV2TW9kZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbmdEZXZNb2RlKSB7XG4gICAgICAgICAgICAgICAgcHJpbnRIeWRyYXRpb25TdGF0cyhpbmplY3Rvcik7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICgpID0+IHt9OyAgLy8gbm9vcFxuICAgICAgfSxcbiAgICAgIG11bHRpOiB0cnVlLFxuICAgIH1cbiAgXSk7XG59XG5cbi8qKlxuICogUmV0dXJucyBhIHNldCBvZiBwcm92aWRlcnMgcmVxdWlyZWQgdG8gc2V0dXAgc3VwcG9ydCBmb3IgaTE4biBoeWRyYXRpb24uXG4gKiBSZXF1aXJlcyBoeWRyYXRpb24gdG8gYmUgZW5hYmxlZCBzZXBhcmF0ZWx5LlxuICovXG5leHBvcnQgZnVuY3Rpb24gd2l0aEkxOG5IeWRyYXRpb24oKTogRW52aXJvbm1lbnRQcm92aWRlcnMge1xuICByZXR1cm4gbWFrZUVudmlyb25tZW50UHJvdmlkZXJzKFtcbiAgICB7XG4gICAgICBwcm92aWRlOiBJU19JMThOX0hZRFJBVElPTl9FTkFCTEVELFxuICAgICAgdXNlVmFsdWU6IHRydWUsXG4gICAgfSxcbiAgXSk7XG59XG5cbi8qKlxuICogUmV0dXJucyB3aGV0aGVyIGkxOG4gaHlkcmF0aW9uIHN1cHBvcnQgaXMgZW5hYmxlZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzSTE4bkh5ZHJhdGlvblN1cHBvcnRFbmFibGVkKCk6IGJvb2xlYW4ge1xuICByZXR1cm4gX2lzSTE4bkh5ZHJhdGlvblN1cHBvcnRFbmFibGVkO1xufVxuXG4vKipcbiAqXG4gKiBAcGFyYW0gdGltZSBUaGUgdGltZSBpbiBtcyB1bnRpbCB0aGUgc3RhYmxlIHRpbWVkb3V0IHdhcm5pbmcgbWVzc2FnZSBpcyBsb2dnZWRcbiAqL1xuZnVuY3Rpb24gbG9nV2FybmluZ09uU3RhYmxlVGltZWRvdXQodGltZTogbnVtYmVyLCBjb25zb2xlOiBDb25zb2xlKTogdm9pZCB7XG4gIGNvbnN0IG1lc3NhZ2UgPVxuICAgICAgYEFuZ3VsYXIgaHlkcmF0aW9uIGV4cGVjdGVkIHRoZSBBcHBsaWNhdGlvblJlZi5pc1N0YWJsZSgpIHRvIGVtaXQgXFxgdHJ1ZVxcYCwgYnV0IGl0IGAgK1xuICAgICAgYGRpZG4ndCBoYXBwZW4gd2l0aGluICR7XG4gICAgICAgICAgdGltZX1tcy4gQW5ndWxhciBoeWRyYXRpb24gbG9naWMgZGVwZW5kcyBvbiB0aGUgYXBwbGljYXRpb24gYmVjb21pbmcgc3RhYmxlIGAgK1xuICAgICAgYGFzIGEgc2lnbmFsIHRvIGNvbXBsZXRlIGh5ZHJhdGlvbiBwcm9jZXNzLmA7XG5cbiAgY29uc29sZS53YXJuKGZvcm1hdFJ1bnRpbWVFcnJvcihSdW50aW1lRXJyb3JDb2RlLkhZRFJBVElPTl9TVEFCTEVfVElNRURPVVQsIG1lc3NhZ2UpKTtcbn1cblxuLyoqXG4gKiBWZXJpZmllcyB3aGV0aGVyIHRoZSBET00gY29udGFpbnMgYSBzcGVjaWFsIG1hcmtlciBhZGRlZCBkdXJpbmcgU1NSIHRpbWUgdG8gbWFrZSBzdXJlXG4gKiB0aGVyZSBpcyBubyBTU1InZWQgY29udGVudHMgdHJhbnNmb3JtYXRpb25zIGhhcHBlbiBhZnRlciBTU1IgaXMgY29tcGxldGVkLiBUeXBpY2FsbHkgdGhhdFxuICogaGFwcGVucyBlaXRoZXIgYnkgQ0ROIG9yIGR1cmluZyB0aGUgYnVpbGQgcHJvY2VzcyBhcyBhbiBvcHRpbWl6YXRpb24gdG8gcmVtb3ZlIGNvbW1lbnQgbm9kZXMuXG4gKiBIeWRyYXRpb24gcHJvY2VzcyByZXF1aXJlcyBjb21tZW50IG5vZGVzIHByb2R1Y2VkIGJ5IEFuZ3VsYXIgdG8gbG9jYXRlIGNvcnJlY3QgRE9NIHNlZ21lbnRzLlxuICogV2hlbiB0aGlzIHNwZWNpYWwgbWFya2VyIGlzICpub3QqIHByZXNlbnQgLSB0aHJvdyBhbiBlcnJvciBhbmQgZG8gbm90IHByb2NlZWQgd2l0aCBoeWRyYXRpb24sXG4gKiBzaW5jZSBpdCB3aWxsIG5vdCBiZSBhYmxlIHRvIGZ1bmN0aW9uIGNvcnJlY3RseS5cbiAqXG4gKiBOb3RlOiB0aGlzIGZ1bmN0aW9uIGlzIGludm9rZWQgb25seSBvbiB0aGUgY2xpZW50LCBzbyBpdCdzIHNhZmUgdG8gdXNlIERPTSBBUElzLlxuICovXG5mdW5jdGlvbiB2ZXJpZnlTc3JDb250ZW50c0ludGVncml0eSgpOiB2b2lkIHtcbiAgY29uc3QgZG9jID0gZ2V0RG9jdW1lbnQoKTtcbiAgbGV0IGh5ZHJhdGlvbk1hcmtlcjogTm9kZXx1bmRlZmluZWQ7XG4gIGZvciAoY29uc3Qgbm9kZSBvZiBkb2MuYm9keS5jaGlsZE5vZGVzKSB7XG4gICAgaWYgKG5vZGUubm9kZVR5cGUgPT09IE5vZGUuQ09NTUVOVF9OT0RFICYmXG4gICAgICAgIG5vZGUudGV4dENvbnRlbnQ/LnRyaW0oKSA9PT0gU1NSX0NPTlRFTlRfSU5URUdSSVRZX01BUktFUikge1xuICAgICAgaHlkcmF0aW9uTWFya2VyID0gbm9kZTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICBpZiAoIWh5ZHJhdGlvbk1hcmtlcikge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuTUlTU0lOR19TU1JfQ09OVEVOVF9JTlRFR1JJVFlfTUFSS0VSLFxuICAgICAgICB0eXBlb2YgbmdEZXZNb2RlICE9PSAndW5kZWZpbmVkJyAmJiBuZ0Rldk1vZGUgJiZcbiAgICAgICAgICAgICdBbmd1bGFyIGh5ZHJhdGlvbiBsb2dpYyBkZXRlY3RlZCB0aGF0IEhUTUwgY29udGVudCBvZiB0aGlzIHBhZ2Ugd2FzIG1vZGlmaWVkIGFmdGVyIGl0ICcgK1xuICAgICAgICAgICAgICAgICd3YXMgcHJvZHVjZWQgZHVyaW5nIHNlcnZlciBzaWRlIHJlbmRlcmluZy4gTWFrZSBzdXJlIHRoYXQgdGhlcmUgYXJlIG5vIG9wdGltaXphdGlvbnMgJyArXG4gICAgICAgICAgICAgICAgJ3RoYXQgcmVtb3ZlIGNvbW1lbnQgbm9kZXMgZnJvbSBIVE1MIGVuYWJsZWQgb24geW91ciBDRE4uIEFuZ3VsYXIgaHlkcmF0aW9uICcgK1xuICAgICAgICAgICAgICAgICdyZWxpZXMgb24gSFRNTCBwcm9kdWNlZCBieSB0aGUgc2VydmVyLCBpbmNsdWRpbmcgd2hpdGVzcGFjZXMgYW5kIGNvbW1lbnQgbm9kZXMuJyk7XG4gIH1cbn1cbiJdfQ==