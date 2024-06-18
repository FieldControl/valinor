import { GlobalConfig } from './toastr-config';
import { EnvironmentProviders } from '@angular/core';
export declare const DefaultGlobalConfig: GlobalConfig;
/**
 * @description
 * Provides the `TOAST_CONFIG` token with the given config.
 *
 * @param config The config to configure toastr.
 * @returns The environment providers.
 *
 * @example
 * ```ts
 * import { provideToastr } from 'ngx-toastr';
 *
 * bootstrap(AppComponent, {
 *   providers: [
 *     provideToastr({
 *       timeOut: 2000,
 *       positionClass: 'toast-top-right',
 *     }),
 *   ],
 * })
 */
export declare const provideToastr: (config?: Partial<GlobalConfig>) => EnvironmentProviders;
