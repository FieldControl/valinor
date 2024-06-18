import { EnvironmentProviders, InjectionToken } from '@angular/core';
import { ReduxDevtoolsExtension } from './extension';
import { StoreDevtoolsConfig, StoreDevtoolsOptions } from './config';
export declare const IS_EXTENSION_OR_MONITOR_PRESENT: InjectionToken<boolean>;
export declare function createIsExtensionOrMonitorPresent(extension: ReduxDevtoolsExtension | null, config: StoreDevtoolsConfig): boolean;
export declare function createReduxDevtoolsExtension(): any;
/**
 * Provides developer tools and instrumentation for `Store`.
 *
 * @usageNotes
 *
 * ```ts
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideStoreDevtools({
 *       maxAge: 25,
 *       logOnly: !isDevMode(),
 *     }),
 *   ],
 * });
 * ```
 */
export declare function provideStoreDevtools(options?: StoreDevtoolsOptions): EnvironmentProviders;
