/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { APP_BOOTSTRAP_LISTENER, ApplicationRef, whenStable } from '../application/application_ref';
import { Console } from '../console';
import { ENVIRONMENT_INITIALIZER, Injector, makeEnvironmentProviders, } from '../di';
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
import { enableClaimDehydratedIcuCaseImpl, enablePrepareI18nBlockForHydrationImpl, setIsI18nHydrationSupportEnabled, } from './i18n';
import { IS_HYDRATION_DOM_REUSE_ENABLED, IS_I18N_HYDRATION_ENABLED, PRESERVE_HOST_CONTENT, } from './tokens';
import { enableRetrieveHydrationInfoImpl, NGH_DATA_KEY, SSR_CONTENT_INTEGRITY_MARKER } from './utils';
import { enableFindMatchingDehydratedViewImpl } from './views';
/**
 * Indicates whether the hydration-related code was added,
 * prevents adding it multiple times.
 */
let isHydrationSupportEnabled = false;
/**
 * Indicates whether the i18n-related code was added,
 * prevents adding it multiple times.
 *
 * Note: This merely controls whether the code is loaded,
 * while `setIsI18nHydrationSupportEnabled` determines
 * whether i18n blocks are serialized or hydrated.
 */
let isI18nHydrationRuntimeSupportEnabled = false;
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
    }
}
/**
 * Brings the necessary i18n hydration code in tree-shakable manner.
 * Similar to `enableHydrationRuntimeSupport`, the code is only
 * present when `withI18nSupport` is invoked.
 */
function enableI18nHydrationRuntimeSupport() {
    if (!isI18nHydrationRuntimeSupportEnabled) {
        isI18nHydrationRuntimeSupportEnabled = true;
        enableLocateOrCreateI18nNodeImpl();
        enablePrepareI18nBlockForHydrationImpl();
        enableClaimDehydratedIcuCaseImpl();
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
        `Learn more at https://angular.dev/guide/hydration.`;
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
                    if (!isEnabled && typeof ngDevMode !== 'undefined' && ngDevMode) {
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
                // i18n support is enabled by calling withI18nSupport(), but there's
                // no way to turn it off (e.g. for tests), so we turn it off by default.
                setIsI18nHydrationSupportEnabled(false);
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
            },
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
                        // Note: the cleanup task *MUST* be scheduled within the Angular zone in Zone apps
                        // to ensure that change detection is properly run afterward.
                        whenStableWithTimeout(appRef, injector).then(() => {
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
        },
    ]);
}
/**
 * Returns a set of providers required to setup support for i18n hydration.
 * Requires hydration to be enabled separately.
 */
export function withI18nSupport() {
    return [
        {
            provide: IS_I18N_HYDRATION_ENABLED,
            useValue: true,
        },
        {
            provide: ENVIRONMENT_INITIALIZER,
            useValue: () => {
                enableI18nHydrationRuntimeSupport();
                setIsI18nHydrationSupportEnabled(true);
                performanceMarkFeature('NgI18nHydration');
            },
            multi: true,
        },
    ];
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
        throw new RuntimeError(-507 /* RuntimeErrorCode.MISSING_SSR_CONTENT_INTEGRITY_MARKER */, typeof ngDevMode !== 'undefined' &&
            ngDevMode &&
            'Angular hydration logic detected that HTML content of this page was modified after it ' +
                'was produced during server side rendering. Make sure that there are no optimizations ' +
                'that remove comment nodes from HTML enabled on your CDN. Angular hydration ' +
                'relies on HTML produced by the server, including whitespaces and comment nodes.');
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvaHlkcmF0aW9uL2FwaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsc0JBQXNCLEVBQUUsY0FBYyxFQUFFLFVBQVUsRUFBQyxNQUFNLGdDQUFnQyxDQUFDO0FBQ2xHLE9BQU8sRUFBQyxPQUFPLEVBQUMsTUFBTSxZQUFZLENBQUM7QUFDbkMsT0FBTyxFQUNMLHVCQUF1QixFQUV2QixRQUFRLEVBQ1Isd0JBQXdCLEdBRXpCLE1BQU0sT0FBTyxDQUFDO0FBQ2YsT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLDhCQUE4QixDQUFDO0FBQ3BELE9BQU8sRUFBQyxrQkFBa0IsRUFBRSxZQUFZLEVBQW1CLE1BQU0sV0FBVyxDQUFDO0FBQzdFLE9BQU8sRUFBQyxvQ0FBb0MsRUFBQyxNQUFNLDhCQUE4QixDQUFDO0FBQ2xGLE9BQU8sRUFBQyxnQ0FBZ0MsRUFBQyxNQUFNLDRCQUE0QixDQUFDO0FBQzVFLE9BQU8sRUFBQyxtQ0FBbUMsRUFBQyxNQUFNLGlDQUFpQyxDQUFDO0FBQ3BGLE9BQU8sRUFBQyw0Q0FBNEMsRUFBQyxNQUFNLDJDQUEyQyxDQUFDO0FBQ3ZHLE9BQU8sRUFBQyxtQ0FBbUMsRUFBQyxNQUFNLGdDQUFnQyxDQUFDO0FBQ25GLE9BQU8sRUFBQyx1Q0FBdUMsRUFBQyxNQUFNLGtDQUFrQyxDQUFDO0FBQ3pGLE9BQU8sRUFBQyxnQ0FBZ0MsRUFBQyxNQUFNLDhCQUE4QixDQUFDO0FBQzlFLE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSxnQ0FBZ0MsQ0FBQztBQUMzRCxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSw0QkFBNEIsQ0FBQztBQUM3RCxPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDaEQsT0FBTyxFQUFDLHNCQUFzQixFQUFDLE1BQU0s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QUFRLEtBQUssSUFBSSxDQUFDLFlBQVk7WUFDbkMsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLEVBQUUsS0FBSyw0QkFBNEIsRUFDekQsQ0FBQztZQUNELGVBQWUsR0FBRyxJQUFJLENBQUM7WUFDdkIsTUFBTTtRQUNSLENBQUM7SUFDSCxDQUFDO0lBQ0QsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ3JCLE1BQU0sSUFBSSxZQUFZLG1FQUVwQixPQUFPLFNBQVMsS0FBSyxXQUFXO1lBQzlCLFNBQVM7WUFDVCx3RkFBd0Y7Z0JBQ3RGLHVGQUF1RjtnQkFDdkYsNkVBQTZFO2dCQUM3RSxpRkFBaUYsQ0FDdEYsQ0FBQztJQUNKLENBQUM7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FQUF9CT09UU1RSQVBfTElTVEVORVIsIEFwcGxpY2F0aW9uUmVmLCB3aGVuU3RhYmxlfSBmcm9tICcuLi9hcHBsaWNhdGlvbi9hcHBsaWNhdGlvbl9yZWYnO1xuaW1wb3J0IHtDb25zb2xlfSBmcm9tICcuLi9jb25zb2xlJztcbmltcG9ydCB7XG4gIEVOVklST05NRU5UX0lOSVRJQUxJWkVSLFxuICBFbnZpcm9ubWVudFByb3ZpZGVycyxcbiAgSW5qZWN0b3IsXG4gIG1ha2VFbnZpcm9ubWVudFByb3ZpZGVycyxcbiAgUHJvdmlkZXIsXG59IGZyb20gJy4uL2RpJztcbmltcG9ydCB7aW5qZWN0fSBmcm9tICcuLi9kaS9pbmplY3Rvcl9jb21wYXRpYmlsaXR5JztcbmltcG9ydCB7Zm9ybWF0UnVudGltZUVycm9yLCBSdW50aW1lRXJyb3IsIFJ1bnRpbWVFcnJvckNvZGV9IGZyb20gJy4uL2Vycm9ycyc7XG5pbXBvcnQge2VuYWJsZUxvY2F0ZU9yQ3JlYXRlQ29udGFpbmVyUmVmSW1wbH0gZnJvbSAnLi4vbGlua2VyL3ZpZXdfY29udGFpbmVyX3JlZic7XG5pbXBvcnQge2VuYWJsZUxvY2F0ZU9yQ3JlYXRlSTE4bk5vZGVJbXBsfSBmcm9tICcuLi9yZW5kZXIzL2kxOG4vaTE4bl9hcHBseSc7XG5pbXBvcnQge2VuYWJsZUxvY2F0ZU9yQ3JlYXRlRWxlbWVudE5vZGVJbXBsfSBmcm9tICcuLi9yZW5kZXIzL2luc3RydWN0aW9ucy9lbGVtZW50JztcbmltcG9ydCB7ZW5hYmxlTG9jYXRlT3JDcmVhdGVFbGVtZW50Q29udGFpbmVyTm9kZUltcGx9IGZyb20gJy4uL3JlbmRlcjMvaW5zdHJ1Y3Rpb25zL2VsZW1lbnRfY29udGFpbmVyJztcbmltcG9ydCB7ZW5hYmxlQXBwbHlSb290RWxlbWVudFRyYW5zZm9ybUltcGx9IGZyb20gJy4uL3JlbmRlcjMvaW5zdHJ1Y3Rpb25zL3NoYXJlZCc7XG5pbXBvcnQge2VuYWJsZUxvY2F0ZU9yQ3JlYXRlQ29udGFpbmVyQW5jaG9ySW1wbH0gZnJvbSAnLi4vcmVuZGVyMy9pbnN0cnVjdGlvbnMvdGVtcGxhdGUnO1xuaW1wb3J0IHtlbmFibGVMb2NhdGVPckNyZWF0ZVRleHROb2RlSW1wbH0gZnJvbSAnLi4vcmVuZGVyMy9pbnN0cnVjdGlvbnMvdGV4dCc7XG5pbXBvcnQge2dldERvY3VtZW50fSBmcm9tICcuLi9yZW5kZXIzL2ludGVyZmFjZXMvZG9jdW1lbnQnO1xuaW1wb3J0IHtpc1BsYXRmb3JtQnJvd3Nlcn0gZnJvbSAnLi4vcmVuZGVyMy91dGlsL21pc2NfdXRpbHMnO1xuaW1wb3J0IHtUcmFuc2ZlclN0YXRlfSBmcm9tICcuLi90cmFuc2Zlcl9zdGF0ZSc7XG5pbXBvcnQge3BlcmZvcm1hbmNlTWFya0ZlYXR1cmV9IGZyb20gJy4uL3V0aWwvcGVyZm9ybWFuY2UnO1xuaW1wb3J0IHtOZ1pvbmV9IGZyb20gJy4uL3pvbmUnO1xuXG5pbXBvcnQge2NsZWFudXBEZWh5ZHJhdGVkVmlld3N9IGZyb20gJy4vY2xlYW51cCc7XG5pbXBvcnQge1xuICBlbmFibGVDbGFpbURlaHlkcmF0ZWRJY3VDYXNlSW1wbCxcbiAgZW5hYmxlUHJlcGFyZUkxOG5CbG9ja0Zvckh5ZHJhdGlvbkltcGwsXG4gIGlzSTE4bkh5ZHJhdGlvbkVuYWJsZWQsXG4gIHNldElzSTE4bkh5ZHJhdGlvblN1cHBvcnRFbmFibGVkLFxufSBmcm9tICcuL2kxOG4nO1xuaW1wb3J0IHtcbiAgSVNfSFlEUkFUSU9OX0RPTV9SRVVTRV9FTkFCTEVELFxuICBJU19JMThOX0hZRFJBVElPTl9FTkFCTEVELFxuICBQUkVTRVJWRV9IT1NUX0NPTlRFTlQsXG59IGZyb20gJy4vdG9rZW5zJztcbmltcG9ydCB7ZW5hYmxlUmV0cmlldmVIeWRyYXRpb25JbmZvSW1wbCwgTkdIX0RBVEFfS0VZLCBTU1JfQ09OVEVOVF9JTlRFR1JJVFlfTUFSS0VSfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7ZW5hYmxlRmluZE1hdGNoaW5nRGVoeWRyYXRlZFZpZXdJbXBsfSBmcm9tICcuL3ZpZXdzJztcblxuLyoqXG4gKiBJbmRpY2F0ZXMgd2hldGhlciB0aGUgaHlkcmF0aW9uLXJlbGF0ZWQgY29kZSB3YXMgYWRkZWQsXG4gKiBwcmV2ZW50cyBhZGRpbmcgaXQgbXVsdGlwbGUgdGltZXMuXG4gKi9cbmxldCBpc0h5ZHJhdGlvblN1cHBvcnRFbmFibGVkID0gZmFsc2U7XG5cbi8qKlxuICogSW5kaWNhdGVzIHdoZXRoZXIgdGhlIGkxOG4tcmVsYXRlZCBjb2RlIHdhcyBhZGRlZCxcbiAqIHByZXZlbnRzIGFkZGluZyBpdCBtdWx0aXBsZSB0aW1lcy5cbiAqXG4gKiBOb3RlOiBUaGlzIG1lcmVseSBjb250cm9scyB3aGV0aGVyIHRoZSBjb2RlIGlzIGxvYWRlZCxcbiAqIHdoaWxlIGBzZXRJc0kxOG5IeWRyYXRpb25TdXBwb3J0RW5hYmxlZGAgZGV0ZXJtaW5lc1xuICogd2hldGhlciBpMThuIGJsb2NrcyBhcmUgc2VyaWFsaXplZCBvciBoeWRyYXRlZC5cbiAqL1xubGV0IGlzSTE4bkh5ZHJhdGlvblJ1bnRpbWVTdXBwb3J0RW5hYmxlZCA9IGZhbHNlO1xuXG4vKipcbiAqIERlZmluZXMgYSBwZXJpb2Qgb2YgdGltZSB0aGF0IEFuZ3VsYXIgd2FpdHMgZm9yIHRoZSBgQXBwbGljYXRpb25SZWYuaXNTdGFibGVgIHRvIGVtaXQgYHRydWVgLlxuICogSWYgdGhlcmUgd2FzIG5vIGV2ZW50IHdpdGggdGhlIGB0cnVlYCB2YWx1ZSBkdXJpbmcgdGhpcyB0aW1lLCBBbmd1bGFyIHJlcG9ydHMgYSB3YXJuaW5nLlxuICovXG5jb25zdCBBUFBMSUNBVElPTl9JU19TVEFCTEVfVElNRU9VVCA9IDEwXzAwMDtcblxuLyoqXG4gKiBCcmluZ3MgdGhlIG5lY2Vzc2FyeSBoeWRyYXRpb24gY29kZSBpbiB0cmVlLXNoYWthYmxlIG1hbm5lci5cbiAqIFRoZSBjb2RlIGlzIG9ubHkgcHJlc2VudCB3aGVuIHRoZSBgcHJvdmlkZUNsaWVudEh5ZHJhdGlvbmAgaXNcbiAqIGludm9rZWQuIE90aGVyd2lzZSwgdGhpcyBjb2RlIGlzIHRyZWUtc2hha2VuIGF3YXkgZHVyaW5nIHRoZVxuICogYnVpbGQgb3B0aW1pemF0aW9uIHN0ZXAuXG4gKlxuICogVGhpcyB0ZWNobmlxdWUgYWxsb3dzIHVzIHRvIHN3YXAgaW1wbGVtZW50YXRpb25zIG9mIG1ldGhvZHMgc29cbiAqIHRyZWUgc2hha2luZyB3b3JrcyBhcHByb3ByaWF0ZWx5IHdoZW4gaHlkcmF0aW9uIGlzIGRpc2FibGVkIG9yXG4gKiBlbmFibGVkLiBJdCBicmluZ3MgaW4gdGhlIGFwcHJvcHJpYXRlIHZlcnNpb24gb2YgdGhlIG1ldGhvZCB0aGF0XG4gKiBzdXBwb3J0cyBoeWRyYXRpb24gb25seSB3aGVuIGVuYWJsZWQuXG4gKi9cbmZ1bmN0aW9uIGVuYWJsZUh5ZHJhdGlvblJ1bnRpbWVTdXBwb3J0KCkge1xuICBpZiAoIWlzSHlkcmF0aW9uU3VwcG9ydEVuYWJsZWQpIHtcbiAgICBpc0h5ZHJhdGlvblN1cHBvcnRFbmFibGVkID0gdHJ1ZTtcbiAgICBlbmFibGVSZXRyaWV2ZUh5ZHJhdGlvbkluZm9JbXBsKCk7XG4gICAgZW5hYmxlTG9jYXRlT3JDcmVhdGVFbGVtZW50Tm9kZUltcGwoKTtcbiAgICBlbmFibGVMb2NhdGVPckNyZWF0ZVRleHROb2RlSW1wbCgpO1xuICAgIGVuYWJsZUxvY2F0ZU9yQ3JlYXRlRWxlbWVudENvbnRhaW5lck5vZGVJbXBsKCk7XG4gICAgZW5hYmxlTG9jYXRlT3JDcmVhdGVDb250YWluZXJBbmNob3JJbXBsKCk7XG4gICAgZW5hYmxlTG9jYXRlT3JDcmVhdGVDb250YWluZXJSZWZJbXBsKCk7XG4gICAgZW5hYmxlRmluZE1hdGNoaW5nRGVoeWRyYXRlZFZpZXdJbXBsKCk7XG4gICAgZW5hYmxlQXBwbHlSb290RWxlbWVudFRyYW5zZm9ybUltcGwoKTtcbiAgfVxufVxuXG4vKipcbiAqIEJyaW5ncyB0aGUgbmVjZXNzYXJ5IGkxOG4gaHlkcmF0aW9uIGNvZGUgaW4gdHJlZS1zaGFrYWJsZSBtYW5uZXIuXG4gKiBTaW1pbGFyIHRvIGBlbmFibGVIeWRyYXRpb25SdW50aW1lU3VwcG9ydGAsIHRoZSBjb2RlIGlzIG9ubHlcbiAqIHByZXNlbnQgd2hlbiBgd2l0aEkxOG5TdXBwb3J0YCBpcyBpbnZva2VkLlxuICovXG5mdW5jdGlvbiBlbmFibGVJMThuSHlkcmF0aW9uUnVudGltZVN1cHBvcnQoKSB7XG4gIGlmICghaXNJMThuSHlkcmF0aW9uUnVudGltZVN1cHBvcnRFbmFibGVkKSB7XG4gICAgaXNJMThuSHlkcmF0aW9uUnVudGltZVN1cHBvcnRFbmFibGVkID0gdHJ1ZTtcbiAgICBlbmFibGVMb2NhdGVPckNyZWF0ZUkxOG5Ob2RlSW1wbCgpO1xuICAgIGVuYWJsZVByZXBhcmVJMThuQmxvY2tGb3JIeWRyYXRpb25JbXBsKCk7XG4gICAgZW5hYmxlQ2xhaW1EZWh5ZHJhdGVkSWN1Q2FzZUltcGwoKTtcbiAgfVxufVxuXG4vKipcbiAqIE91dHB1dHMgYSBtZXNzYWdlIHdpdGggaHlkcmF0aW9uIHN0YXRzIGludG8gYSBjb25zb2xlLlxuICovXG5mdW5jdGlvbiBwcmludEh5ZHJhdGlvblN0YXRzKGluamVjdG9yOiBJbmplY3Rvcikge1xuICBjb25zdCBjb25zb2xlID0gaW5qZWN0b3IuZ2V0KENvbnNvbGUpO1xuICBjb25zdCBtZXNzYWdlID1cbiAgICBgQW5ndWxhciBoeWRyYXRlZCAke25nRGV2TW9kZSEuaHlkcmF0ZWRDb21wb25lbnRzfSBjb21wb25lbnQocykgYCArXG4gICAgYGFuZCAke25nRGV2TW9kZSEuaHlkcmF0ZWROb2Rlc30gbm9kZShzKSwgYCArXG4gICAgYCR7bmdEZXZNb2RlIS5jb21wb25lbnRzU2tpcHBlZEh5ZHJhdGlvbn0gY29tcG9uZW50KHMpIHdlcmUgc2tpcHBlZC4gYCArXG4gICAgYExlYXJuIG1vcmUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9ndWlkZS9oeWRyYXRpb24uYDtcbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWNvbnNvbGVcbiAgY29uc29sZS5sb2cobWVzc2FnZSk7XG59XG5cbi8qKlxuICogUmV0dXJucyBhIFByb21pc2UgdGhhdCBpcyByZXNvbHZlZCB3aGVuIGFuIGFwcGxpY2F0aW9uIGJlY29tZXMgc3RhYmxlLlxuICovXG5mdW5jdGlvbiB3aGVuU3RhYmxlV2l0aFRpbWVvdXQoYXBwUmVmOiBBcHBsaWNhdGlvblJlZiwgaW5qZWN0b3I6IEluamVjdG9yKTogUHJvbWlzZTx2b2lkPiB7XG4gIGNvbnN0IHdoZW5TdGFibGVQcm9taXNlID0gd2hlblN0YWJsZShhcHBSZWYpO1xuICBpZiAodHlwZW9mIG5nRGV2TW9kZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbmdEZXZNb2RlKSB7XG4gICAgY29uc3QgdGltZW91dFRpbWUgPSBBUFBMSUNBVElPTl9JU19TVEFCTEVfVElNRU9VVDtcbiAgICBjb25zdCBjb25zb2xlID0gaW5qZWN0b3IuZ2V0KENvbnNvbGUpO1xuICAgIGNvbnN0IG5nWm9uZSA9IGluamVjdG9yLmdldChOZ1pvbmUpO1xuXG4gICAgLy8gVGhlIGZvbGxvd2luZyBjYWxsIHNob3VsZCBub3QgYW5kIGRvZXMgbm90IHByZXZlbnQgdGhlIGFwcCB0byBiZWNvbWUgc3RhYmxlXG4gICAgLy8gV2UgY2Fubm90IHVzZSBSeEpTIHRpbWVyIGhlcmUgYmVjYXVzZSB0aGUgYXBwIHdvdWxkIHJlbWFpbiB1bnN0YWJsZS5cbiAgICAvLyBUaGlzIGFsc28gYXZvaWRzIGFuIGV4dHJhIGNoYW5nZSBkZXRlY3Rpb24gY3ljbGUuXG4gICAgY29uc3QgdGltZW91dElkID0gbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgIHJldHVybiBzZXRUaW1lb3V0KCgpID0+IGxvZ1dhcm5pbmdPblN0YWJsZVRpbWVkb3V0KHRpbWVvdXRUaW1lLCBjb25zb2xlKSwgdGltZW91dFRpbWUpO1xuICAgIH0pO1xuXG4gICAgd2hlblN0YWJsZVByb21pc2UuZmluYWxseSgoKSA9PiBjbGVhclRpbWVvdXQodGltZW91dElkKSk7XG4gIH1cblxuICByZXR1cm4gd2hlblN0YWJsZVByb21pc2U7XG59XG5cbi8qKlxuICogUmV0dXJucyBhIHNldCBvZiBwcm92aWRlcnMgcmVxdWlyZWQgdG8gc2V0dXAgaHlkcmF0aW9uIHN1cHBvcnRcbiAqIGZvciBhbiBhcHBsaWNhdGlvbiB0aGF0IGlzIHNlcnZlciBzaWRlIHJlbmRlcmVkLiBUaGlzIGZ1bmN0aW9uIGlzXG4gKiBpbmNsdWRlZCBpbnRvIHRoZSBgcHJvdmlkZUNsaWVudEh5ZHJhdGlvbmAgcHVibGljIEFQSSBmdW5jdGlvbiBmcm9tXG4gKiB0aGUgYHBsYXRmb3JtLWJyb3dzZXJgIHBhY2thZ2UuXG4gKlxuICogVGhlIGZ1bmN0aW9uIHNldHMgdXAgYW4gaW50ZXJuYWwgZmxhZyB0aGF0IHdvdWxkIGJlIHJlY29nbml6ZWQgZHVyaW5nXG4gKiB0aGUgc2VydmVyIHNpZGUgcmVuZGVyaW5nIHRpbWUgYXMgd2VsbCwgc28gdGhlcmUgaXMgbm8gbmVlZCB0b1xuICogY29uZmlndXJlIG9yIGNoYW5nZSBhbnl0aGluZyBpbiBOZ1VuaXZlcnNhbCB0byBlbmFibGUgdGhlIGZlYXR1cmUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3aXRoRG9tSHlkcmF0aW9uKCk6IEVudmlyb25tZW50UHJvdmlkZXJzIHtcbiAgcmV0dXJuIG1ha2VFbnZpcm9ubWVudFByb3ZpZGVycyhbXG4gICAge1xuICAgICAgcHJvdmlkZTogSVNfSFlEUkFUSU9OX0RPTV9SRVVTRV9FTkFCTEVELFxuICAgICAgdXNlRmFjdG9yeTogKCkgPT4ge1xuICAgICAgICBsZXQgaXNFbmFibGVkID0gdHJ1ZTtcbiAgICAgICAgaWYgKGlzUGxhdGZvcm1Ccm93c2VyKCkpIHtcbiAgICAgICAgICAvLyBPbiB0aGUgY2xpZW50LCB2ZXJpZnkgdGhhdCB0aGUgc2VydmVyIHJlc3BvbnNlIGNvbnRhaW5zXG4gICAgICAgICAgLy8gaHlkcmF0aW9uIGFubm90YXRpb25zLiBPdGhlcndpc2UsIGtlZXAgaHlkcmF0aW9uIGRpc2FibGVkLlxuICAgICAgICAgIGNvbnN0IHRyYW5zZmVyU3RhdGUgPSBpbmplY3QoVHJhbnNmZXJTdGF0ZSwge29wdGlvbmFsOiB0cnVlfSk7XG4gICAgICAgICAgaXNFbmFibGVkID0gISF0cmFuc2ZlclN0YXRlPy5nZXQoTkdIX0RBVEFfS0VZLCBudWxsKTtcbiAgICAgICAgICBpZiAoIWlzRW5hYmxlZCAmJiB0eXBlb2YgbmdEZXZNb2RlICE9PSAndW5kZWZpbmVkJyAmJiBuZ0Rldk1vZGUpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbnNvbGUgPSBpbmplY3QoQ29uc29sZSk7XG4gICAgICAgICAgICBjb25zdCBtZXNzYWdlID0gZm9ybWF0UnVudGltZUVycm9yKFxuICAgICAgICAgICAgICBSdW50aW1lRXJyb3JDb2RlLk1JU1NJTkdfSFlEUkFUSU9OX0FOTk9UQVRJT05TLFxuICAgICAgICAgICAgICAnQW5ndWxhciBoeWRyYXRpb24gd2FzIHJlcXVlc3RlZCBvbiB0aGUgY2xpZW50LCBidXQgdGhlcmUgd2FzIG5vICcgK1xuICAgICAgICAgICAgICAgICdzZXJpYWxpemVkIGluZm9ybWF0aW9uIHByZXNlbnQgaW4gdGhlIHNlcnZlciByZXNwb25zZSwgJyArXG4gICAgICAgICAgICAgICAgJ3RodXMgaHlkcmF0aW9uIHdhcyBub3QgZW5hYmxlZC4gJyArXG4gICAgICAgICAgICAgICAgJ01ha2Ugc3VyZSB0aGUgYHByb3ZpZGVDbGllbnRIeWRyYXRpb24oKWAgaXMgaW5jbHVkZWQgaW50byB0aGUgbGlzdCAnICtcbiAgICAgICAgICAgICAgICAnb2YgcHJvdmlkZXJzIGluIHRoZSBzZXJ2ZXIgcGFydCBvZiB0aGUgYXBwbGljYXRpb24gY29uZmlndXJhdGlvbi4nLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1jb25zb2xlXG4gICAgICAgICAgICBjb25zb2xlLndhcm4obWVzc2FnZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChpc0VuYWJsZWQpIHtcbiAgICAgICAgICBwZXJmb3JtYW5jZU1hcmtGZWF0dXJlKCdOZ0h5ZHJhdGlvbicpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpc0VuYWJsZWQ7XG4gICAgICB9LFxuICAgIH0sXG4gICAge1xuICAgICAgcHJvdmlkZTogRU5WSVJPTk1FTlRfSU5JVElBTElaRVIsXG4gICAgICB1c2VWYWx1ZTogKCkgPT4ge1xuICAgICAgICAvLyBpMThuIHN1cHBvcnQgaXMgZW5hYmxlZCBieSBjYWxsaW5nIHdpdGhJMThuU3VwcG9ydCgpLCBidXQgdGhlcmUnc1xuICAgICAgICAvLyBubyB3YXkgdG8gdHVybiBpdCBvZmYgKGUuZy4gZm9yIHRlc3RzKSwgc28gd2UgdHVybiBpdCBvZmYgYnkgZGVmYXVsdC5cbiAgICAgICAgc2V0SXNJMThuSHlkcmF0aW9uU3VwcG9ydEVuYWJsZWQoZmFsc2UpO1xuXG4gICAgICAgIC8vIFNpbmNlIHRoaXMgZnVuY3Rpb24gaXMgdXNlZCBhY3Jvc3MgYm90aCBzZXJ2ZXIgYW5kIGNsaWVudCxcbiAgICAgICAgLy8gbWFrZSBzdXJlIHRoYXQgdGhlIHJ1bnRpbWUgY29kZSBpcyBvbmx5IGFkZGVkIHdoZW4gaW52b2tlZFxuICAgICAgICAvLyBvbiB0aGUgY2xpZW50LiBNb3ZpbmcgZm9yd2FyZCwgdGhlIGBpc1BsYXRmb3JtQnJvd3NlcmAgY2hlY2sgc2hvdWxkXG4gICAgICAgIC8vIGJlIHJlcGxhY2VkIHdpdGggYSB0cmVlLXNoYWthYmxlIGFsdGVybmF0aXZlIChlLmcuIGBpc1NlcnZlcmBcbiAgICAgICAgLy8gZmxhZykuXG4gICAgICAgIGlmIChpc1BsYXRmb3JtQnJvd3NlcigpICYmIGluamVjdChJU19IWURSQVRJT05fRE9NX1JFVVNFX0VOQUJMRUQpKSB7XG4gICAgICAgICAgdmVyaWZ5U3NyQ29udGVudHNJbnRlZ3JpdHkoKTtcbiAgICAgICAgICBlbmFibGVIeWRyYXRpb25SdW50aW1lU3VwcG9ydCgpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgbXVsdGk6IHRydWUsXG4gICAgfSxcbiAgICB7XG4gICAgICBwcm92aWRlOiBQUkVTRVJWRV9IT1NUX0NPTlRFTlQsXG4gICAgICB1c2VGYWN0b3J5OiAoKSA9PiB7XG4gICAgICAgIC8vIFByZXNlcnZlIGhvc3QgZWxlbWVudCBjb250ZW50IG9ubHkgaW4gYSBicm93c2VyXG4gICAgICAgIC8vIGVudmlyb25tZW50IGFuZCB3aGVuIGh5ZHJhdGlvbiBpcyBjb25maWd1cmVkIHByb3Blcmx5LlxuICAgICAgICAvLyBPbiBhIHNlcnZlciwgYW4gYXBwbGljYXRpb24gaXMgcmVuZGVyZWQgZnJvbSBzY3JhdGNoLFxuICAgICAgICAvLyBzbyB0aGUgaG9zdCBjb250ZW50IG5lZWRzIHRvIGJlIGVtcHR5LlxuICAgICAgICByZXR1cm4gaXNQbGF0Zm9ybUJyb3dzZXIoKSAmJiBpbmplY3QoSVNfSFlEUkFUSU9OX0RPTV9SRVVTRV9FTkFCTEVEKTtcbiAgICAgIH0sXG4gICAgfSxcbiAgICB7XG4gICAgICBwcm92aWRlOiBBUFBfQk9PVFNUUkFQX0xJU1RFTkVSLFxuICAgICAgdXNlRmFjdG9yeTogKCkgPT4ge1xuICAgICAgICBpZiAoaXNQbGF0Zm9ybUJyb3dzZXIoKSAmJiBpbmplY3QoSVNfSFlEUkFUSU9OX0RPTV9SRVVTRV9FTkFCTEVEKSkge1xuICAgICAgICAgIGNvbnN0IGFwcFJlZiA9IGluamVjdChBcHBsaWNhdGlvblJlZik7XG4gICAgICAgICAgY29uc3QgaW5qZWN0b3IgPSBpbmplY3QoSW5qZWN0b3IpO1xuICAgICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICAvLyBXYWl0IHVudGlsIGFuIGFwcCBiZWNvbWVzIHN0YWJsZSBhbmQgY2xlYW51cCBhbGwgdmlld3MgdGhhdFxuICAgICAgICAgICAgLy8gd2VyZSBub3QgY2xhaW1lZCBkdXJpbmcgdGhlIGFwcGxpY2F0aW9uIGJvb3RzdHJhcCBwcm9jZXNzLlxuICAgICAgICAgICAgLy8gVGhlIHRpbWluZyBpcyBzaW1pbGFyIHRvIHdoZW4gd2Ugc3RhcnQgdGhlIHNlcmlhbGl6YXRpb24gcHJvY2Vzc1xuICAgICAgICAgICAgLy8gb24gdGhlIHNlcnZlci5cbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyBOb3RlOiB0aGUgY2xlYW51cCB0YXNrICpNVVNUKiBiZSBzY2hlZHVsZWQgd2l0aGluIHRoZSBBbmd1bGFyIHpvbmUgaW4gWm9uZSBhcHBzXG4gICAgICAgICAgICAvLyB0byBlbnN1cmUgdGhhdCBjaGFuZ2UgZGV0ZWN0aW9uIGlzIHByb3Blcmx5IHJ1biBhZnRlcndhcmQuXG4gICAgICAgICAgICB3aGVuU3RhYmxlV2l0aFRpbWVvdXQoYXBwUmVmLCBpbmplY3RvcikudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgIGNsZWFudXBEZWh5ZHJhdGVkVmlld3MoYXBwUmVmKTtcbiAgICAgICAgICAgICAgaWYgKHR5cGVvZiBuZ0Rldk1vZGUgIT09ICd1bmRlZmluZWQnICYmIG5nRGV2TW9kZSkge1xuICAgICAgICAgICAgICAgIHByaW50SHlkcmF0aW9uU3RhdHMoaW5qZWN0b3IpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAoKSA9PiB7fTsgLy8gbm9vcFxuICAgICAgfSxcbiAgICAgIG11bHRpOiB0cnVlLFxuICAgIH0sXG4gIF0pO1xufVxuXG4vKipcbiAqIFJldHVybnMgYSBzZXQgb2YgcHJvdmlkZXJzIHJlcXVpcmVkIHRvIHNldHVwIHN1cHBvcnQgZm9yIGkxOG4gaHlkcmF0aW9uLlxuICogUmVxdWlyZXMgaHlkcmF0aW9uIHRvIGJlIGVuYWJsZWQgc2VwYXJhdGVseS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdpdGhJMThuU3VwcG9ydCgpOiBQcm92aWRlcltdIHtcbiAgcmV0dXJuIFtcbiAgICB7XG4gICAgICBwcm92aWRlOiBJU19JMThOX0hZRFJBVElPTl9FTkFCTEVELFxuICAgICAgdXNlVmFsdWU6IHRydWUsXG4gICAgfSxcbiAgICB7XG4gICAgICBwcm92aWRlOiBFTlZJUk9OTUVOVF9JTklUSUFMSVpFUixcbiAgICAgIHVzZVZhbHVlOiAoKSA9PiB7XG4gICAgICAgIGVuYWJsZUkxOG5IeWRyYXRpb25SdW50aW1lU3VwcG9ydCgpO1xuICAgICAgICBzZXRJc0kxOG5IeWRyYXRpb25TdXBwb3J0RW5hYmxlZCh0cnVlKTtcbiAgICAgICAgcGVyZm9ybWFuY2VNYXJrRmVhdHVyZSgnTmdJMThuSHlkcmF0aW9uJyk7XG4gICAgICB9LFxuICAgICAgbXVsdGk6IHRydWUsXG4gICAgfSxcbiAgXTtcbn1cblxuLyoqXG4gKlxuICogQHBhcmFtIHRpbWUgVGhlIHRpbWUgaW4gbXMgdW50aWwgdGhlIHN0YWJsZSB0aW1lZG91dCB3YXJuaW5nIG1lc3NhZ2UgaXMgbG9nZ2VkXG4gKi9cbmZ1bmN0aW9uIGxvZ1dhcm5pbmdPblN0YWJsZVRpbWVkb3V0KHRpbWU6IG51bWJlciwgY29uc29sZTogQ29uc29sZSk6IHZvaWQge1xuICBjb25zdCBtZXNzYWdlID1cbiAgICBgQW5ndWxhciBoeWRyYXRpb24gZXhwZWN0ZWQgdGhlIEFwcGxpY2F0aW9uUmVmLmlzU3RhYmxlKCkgdG8gZW1pdCBcXGB0cnVlXFxgLCBidXQgaXQgYCArXG4gICAgYGRpZG4ndCBoYXBwZW4gd2l0aGluICR7dGltZX1tcy4gQW5ndWxhciBoeWRyYXRpb24gbG9naWMgZGVwZW5kcyBvbiB0aGUgYXBwbGljYXRpb24gYmVjb21pbmcgc3RhYmxlIGAgK1xuICAgIGBhcyBhIHNpZ25hbCB0byBjb21wbGV0ZSBoeWRyYXRpb24gcHJvY2Vzcy5gO1xuXG4gIGNvbnNvbGUud2Fybihmb3JtYXRSdW50aW1lRXJyb3IoUnVudGltZUVycm9yQ29kZS5IWURSQVRJT05fU1RBQkxFX1RJTUVET1VULCBtZXNzYWdlKSk7XG59XG5cbi8qKlxuICogVmVyaWZpZXMgd2hldGhlciB0aGUgRE9NIGNvbnRhaW5zIGEgc3BlY2lhbCBtYXJrZXIgYWRkZWQgZHVyaW5nIFNTUiB0aW1lIHRvIG1ha2Ugc3VyZVxuICogdGhlcmUgaXMgbm8gU1NSJ2VkIGNvbnRlbnRzIHRyYW5zZm9ybWF0aW9ucyBoYXBwZW4gYWZ0ZXIgU1NSIGlzIGNvbXBsZXRlZC4gVHlwaWNhbGx5IHRoYXRcbiAqIGhhcHBlbnMgZWl0aGVyIGJ5IENETiBvciBkdXJpbmcgdGhlIGJ1aWxkIHByb2Nlc3MgYXMgYW4gb3B0aW1pemF0aW9uIHRvIHJlbW92ZSBjb21tZW50IG5vZGVzLlxuICogSHlkcmF0aW9uIHByb2Nlc3MgcmVxdWlyZXMgY29tbWVudCBub2RlcyBwcm9kdWNlZCBieSBBbmd1bGFyIHRvIGxvY2F0ZSBjb3JyZWN0IERPTSBzZWdtZW50cy5cbiAqIFdoZW4gdGhpcyBzcGVjaWFsIG1hcmtlciBpcyAqbm90KiBwcmVzZW50IC0gdGhyb3cgYW4gZXJyb3IgYW5kIGRvIG5vdCBwcm9jZWVkIHdpdGggaHlkcmF0aW9uLFxuICogc2luY2UgaXQgd2lsbCBub3QgYmUgYWJsZSB0byBmdW5jdGlvbiBjb3JyZWN0bHkuXG4gKlxuICogTm90ZTogdGhpcyBmdW5jdGlvbiBpcyBpbnZva2VkIG9ubHkgb24gdGhlIGNsaWVudCwgc28gaXQncyBzYWZlIHRvIHVzZSBET00gQVBJcy5cbiAqL1xuZnVuY3Rpb24gdmVyaWZ5U3NyQ29udGVudHNJbnRlZ3JpdHkoKTogdm9pZCB7XG4gIGNvbnN0IGRvYyA9IGdldERvY3VtZW50KCk7XG4gIGxldCBoeWRyYXRpb25NYXJrZXI6IE5vZGUgfCB1bmRlZmluZWQ7XG4gIGZvciAoY29uc3Qgbm9kZSBvZiBkb2MuYm9keS5jaGlsZE5vZGVzKSB7XG4gICAgaWYgKFxuICAgICAgbm9kZS5ub2RlVHlwZSA9PT0gTm9kZS5DT01NRU5UX05PREUgJiZcbiAgICAgIG5vZGUudGV4dENvbnRlbnQ/LnRyaW0oKSA9PT0gU1NSX0NPTlRFTlRfSU5URUdSSVRZX01BUktFUlxuICAgICkge1xuICAgICAgaHlkcmF0aW9uTWFya2VyID0gbm9kZTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICBpZiAoIWh5ZHJhdGlvbk1hcmtlcikge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICBSdW50aW1lRXJyb3JDb2RlLk1JU1NJTkdfU1NSX0NPTlRFTlRfSU5URUdSSVRZX01BUktFUixcbiAgICAgIHR5cGVvZiBuZ0Rldk1vZGUgIT09ICd1bmRlZmluZWQnICYmXG4gICAgICAgIG5nRGV2TW9kZSAmJlxuICAgICAgICAnQW5ndWxhciBoeWRyYXRpb24gbG9naWMgZGV0ZWN0ZWQgdGhhdCBIVE1MIGNvbnRlbnQgb2YgdGhpcyBwYWdlIHdhcyBtb2RpZmllZCBhZnRlciBpdCAnICtcbiAgICAgICAgICAnd2FzIHByb2R1Y2VkIGR1cmluZyBzZXJ2ZXIgc2lkZSByZW5kZXJpbmcuIE1ha2Ugc3VyZSB0aGF0IHRoZXJlIGFyZSBubyBvcHRpbWl6YXRpb25zICcgK1xuICAgICAgICAgICd0aGF0IHJlbW92ZSBjb21tZW50IG5vZGVzIGZyb20gSFRNTCBlbmFibGVkIG9uIHlvdXIgQ0ROLiBBbmd1bGFyIGh5ZHJhdGlvbiAnICtcbiAgICAgICAgICAncmVsaWVzIG9uIEhUTUwgcHJvZHVjZWQgYnkgdGhlIHNlcnZlciwgaW5jbHVkaW5nIHdoaXRlc3BhY2VzIGFuZCBjb21tZW50IG5vZGVzLicsXG4gICAgKTtcbiAgfVxufVxuIl19