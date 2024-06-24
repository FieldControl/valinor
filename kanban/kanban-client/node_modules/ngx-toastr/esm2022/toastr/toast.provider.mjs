import { DefaultNoComponentGlobalConfig, TOAST_CONFIG } from './toastr-config';
import { makeEnvironmentProviders } from '@angular/core';
import { Toast } from './toast.component';
export const DefaultGlobalConfig = {
    ...DefaultNoComponentGlobalConfig,
    toastComponent: Toast,
};
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
export const provideToastr = (config = {}) => {
    const providers = [
        {
            provide: TOAST_CONFIG,
            useValue: {
                default: DefaultGlobalConfig,
                config,
            }
        }
    ];
    return makeEnvironmentProviders(providers);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9hc3QucHJvdmlkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGliL3RvYXN0ci90b2FzdC5wcm92aWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsOEJBQThCLEVBQWdCLFlBQVksRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQzdGLE9BQU8sRUFBd0Isd0JBQXdCLEVBQVksTUFBTSxlQUFlLENBQUM7QUFDekYsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRTFDLE1BQU0sQ0FBQyxNQUFNLG1CQUFtQixHQUFpQjtJQUMvQyxHQUFHLDhCQUE4QjtJQUNqQyxjQUFjLEVBQUUsS0FBSztDQUN0QixDQUFDO0FBRUY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FtQkc7QUFDSCxNQUFNLENBQUMsTUFBTSxhQUFhLEdBQUcsQ0FBQyxTQUFnQyxFQUFFLEVBQXdCLEVBQUU7SUFDeEYsTUFBTSxTQUFTLEdBQWU7UUFDNUI7WUFDRSxPQUFPLEVBQUUsWUFBWTtZQUNyQixRQUFRLEVBQUU7Z0JBQ1IsT0FBTyxFQUFFLG1CQUFtQjtnQkFDNUIsTUFBTTthQUNQO1NBQ0Y7S0FDRixDQUFDO0lBRUYsT0FBTyx3QkFBd0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUM3QyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEZWZhdWx0Tm9Db21wb25lbnRHbG9iYWxDb25maWcsIEdsb2JhbENvbmZpZywgVE9BU1RfQ09ORklHIH0gZnJvbSAnLi90b2FzdHItY29uZmlnJztcbmltcG9ydCB7IEVudmlyb25tZW50UHJvdmlkZXJzLCBtYWtlRW52aXJvbm1lbnRQcm92aWRlcnMsIFByb3ZpZGVyIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBUb2FzdCB9IGZyb20gJy4vdG9hc3QuY29tcG9uZW50JztcblxuZXhwb3J0IGNvbnN0IERlZmF1bHRHbG9iYWxDb25maWc6IEdsb2JhbENvbmZpZyA9IHtcbiAgLi4uRGVmYXVsdE5vQ29tcG9uZW50R2xvYmFsQ29uZmlnLFxuICB0b2FzdENvbXBvbmVudDogVG9hc3QsXG59O1xuXG4vKipcbiAqIEBkZXNjcmlwdGlvblxuICogUHJvdmlkZXMgdGhlIGBUT0FTVF9DT05GSUdgIHRva2VuIHdpdGggdGhlIGdpdmVuIGNvbmZpZy5cbiAqXG4gKiBAcGFyYW0gY29uZmlnIFRoZSBjb25maWcgdG8gY29uZmlndXJlIHRvYXN0ci5cbiAqIEByZXR1cm5zIFRoZSBlbnZpcm9ubWVudCBwcm92aWRlcnMuXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBwcm92aWRlVG9hc3RyIH0gZnJvbSAnbmd4LXRvYXN0cic7XG4gKlxuICogYm9vdHN0cmFwKEFwcENvbXBvbmVudCwge1xuICogICBwcm92aWRlcnM6IFtcbiAqICAgICBwcm92aWRlVG9hc3RyKHtcbiAqICAgICAgIHRpbWVPdXQ6IDIwMDAsXG4gKiAgICAgICBwb3NpdGlvbkNsYXNzOiAndG9hc3QtdG9wLXJpZ2h0JyxcbiAqICAgICB9KSxcbiAqICAgXSxcbiAqIH0pXG4gKi9cbmV4cG9ydCBjb25zdCBwcm92aWRlVG9hc3RyID0gKGNvbmZpZzogUGFydGlhbDxHbG9iYWxDb25maWc+ID0ge30pOiBFbnZpcm9ubWVudFByb3ZpZGVycyA9PiB7XG4gIGNvbnN0IHByb3ZpZGVyczogUHJvdmlkZXJbXSA9IFtcbiAgICB7XG4gICAgICBwcm92aWRlOiBUT0FTVF9DT05GSUcsXG4gICAgICB1c2VWYWx1ZToge1xuICAgICAgICBkZWZhdWx0OiBEZWZhdWx0R2xvYmFsQ29uZmlnLFxuICAgICAgICBjb25maWcsXG4gICAgICB9XG4gICAgfVxuICBdO1xuXG4gIHJldHVybiBtYWtlRW52aXJvbm1lbnRQcm92aWRlcnMocHJvdmlkZXJzKTtcbn07XG4iXX0=