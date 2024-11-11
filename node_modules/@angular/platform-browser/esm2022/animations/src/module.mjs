/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { NgModule, ɵperformanceMarkFeature as performanceMarkFeature, } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BROWSER_ANIMATIONS_PROVIDERS, BROWSER_NOOP_ANIMATIONS_PROVIDERS } from './providers';
import * as i0 from "@angular/core";
/**
 * Exports `BrowserModule` with additional dependency-injection providers
 * for use with animations. See [Animations](guide/animations).
 * @publicApi
 */
export class BrowserAnimationsModule {
    /**
     * Configures the module based on the specified object.
     *
     * @param config Object used to configure the behavior of the `BrowserAnimationsModule`.
     * @see {@link BrowserAnimationsModuleConfig}
     *
     * @usageNotes
     * When registering the `BrowserAnimationsModule`, you can use the `withConfig`
     * function as follows:
     * ```
     * @NgModule({
     *   imports: [BrowserAnimationsModule.withConfig(config)]
     * })
     * class MyNgModule {}
     * ```
     */
    static withConfig(config) {
        return {
            ngModule: BrowserAnimationsModule,
            providers: config.disableAnimations
                ? BROWSER_NOOP_ANIMATIONS_PROVIDERS
                : BROWSER_ANIMATIONS_PROVIDERS,
        };
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: BrowserAnimationsModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.7", ngImport: i0, type: BrowserAnimationsModule, exports: [BrowserModule] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: BrowserAnimationsModule, providers: BROWSER_ANIMATIONS_PROVIDERS, imports: [BrowserModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: BrowserAnimationsModule, decorators: [{
            type: NgModule,
            args: [{
                    exports: [BrowserModule],
                    providers: BROWSER_ANIMATIONS_PROVIDERS,
                }]
        }] });
/**
 * Returns the set of dependency-injection providers
 * to enable animations in an application. See [animations guide](guide/animations)
 * to learn more about animations in Angular.
 *
 * @usageNotes
 *
 * The function is useful when you want to enable animations in an application
 * bootstrapped using the `bootstrapApplication` function. In this scenario there
 * is no need to import the `BrowserAnimationsModule` NgModule at all, just add
 * providers returned by this function to the `providers` list as show below.
 *
 * ```typescript
 * bootstrapApplication(RootComponent, {
 *   providers: [
 *     provideAnimations()
 *   ]
 * });
 * ```
 *
 * @publicApi
 */
export function provideAnimations() {
    performanceMarkFeature('NgEagerAnimations');
    // Return a copy to prevent changes to the original array in case any in-place
    // alterations are performed to the `provideAnimations` call results in app code.
    return [...BROWSER_ANIMATIONS_PROVIDERS];
}
/**
 * A null player that must be imported to allow disabling of animations.
 * @publicApi
 */
export class NoopAnimationsModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: NoopAnimationsModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.7", ngImport: i0, type: NoopAnimationsModule, exports: [BrowserModule] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: NoopAnimationsModule, providers: BROWSER_NOOP_ANIMATIONS_PROVIDERS, imports: [BrowserModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: NoopAnimationsModule, decorators: [{
            type: NgModule,
            args: [{
                    exports: [BrowserModule],
                    providers: BROWSER_NOOP_ANIMATIONS_PROVIDERS,
                }]
        }] });
/**
 * Returns the set of dependency-injection providers
 * to disable animations in an application. See [animations guide](guide/animations)
 * to learn more about animations in Angular.
 *
 * @usageNotes
 *
 * The function is useful when you want to bootstrap an application using
 * the `bootstrapApplication` function, but you need to disable animations
 * (for example, when running tests).
 *
 * ```typescript
 * bootstrapApplication(RootComponent, {
 *   providers: [
 *     provideNoopAnimations()
 *   ]
 * });
 * ```
 *
 * @publicApi
 */
export function provideNoopAnimations() {
    // Return a copy to prevent changes to the original array in case any in-place
    // alterations are performed to the `provideNoopAnimations` call results in app code.
    return [...BROWSER_NOOP_ANIMATIONS_PROVIDERS];
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvcGxhdGZvcm0tYnJvd3Nlci9hbmltYXRpb25zL3NyYy9tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBQ0gsT0FBTyxFQUVMLFFBQVEsRUFFUix1QkFBdUIsSUFBSSxzQkFBc0IsR0FDbEQsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLDJCQUEyQixDQUFDO0FBRXhELE9BQU8sRUFBQyw0QkFBNEIsRUFBRSxpQ0FBaUMsRUFBQyxNQUFNLGFBQWEsQ0FBQzs7QUFjNUY7Ozs7R0FJRztBQUtILE1BQU0sT0FBTyx1QkFBdUI7SUFDbEM7Ozs7Ozs7Ozs7Ozs7OztPQWVHO0lBQ0gsTUFBTSxDQUFDLFVBQVUsQ0FDZixNQUFxQztRQUVyQyxPQUFPO1lBQ0wsUUFBUSxFQUFFLHVCQUF1QjtZQUNqQyxTQUFTLEVBQUUsTUFBTSxDQUFDLGlCQUFpQjtnQkFDakMsQ0FBQyxDQUFDLGlDQUFpQztnQkFDbkMsQ0FBQyxDQUFDLDRCQUE0QjtTQUNqQyxDQUFDO0lBQ0osQ0FBQzt5SEExQlUsdUJBQXVCOzBIQUF2Qix1QkFBdUIsWUFIeEIsYUFBYTswSEFHWix1QkFBdUIsYUFGdkIsNEJBQTRCLFlBRDdCLGFBQWE7O3NHQUdaLHVCQUF1QjtrQkFKbkMsUUFBUTttQkFBQztvQkFDUixPQUFPLEVBQUUsQ0FBQyxhQUFhLENBQUM7b0JBQ3hCLFNBQVMsRUFBRSw0QkFBNEI7aUJBQ3hDOztBQThCRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBcUJHO0FBQ0gsTUFBTSxVQUFVLGlCQUFpQjtJQUMvQixzQkFBc0IsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0lBQzVDLDhFQUE4RTtJQUM5RSxpRkFBaUY7SUFDakYsT0FBTyxDQUFDLEdBQUcsNEJBQTRCLENBQUMsQ0FBQztBQUMzQyxDQUFDO0FBRUQ7OztHQUdHO0FBS0gsTUFBTSxPQUFPLG9CQUFvQjt5SEFBcEIsb0JBQW9COzBIQUFwQixvQkFBb0IsWUFIckIsYUFBYTswSEFHWixvQkFBb0IsYUFGcEIsaUNBQWlDLFlBRGxDLGFBQWE7O3NHQUdaLG9CQUFvQjtrQkFKaEMsUUFBUTttQkFBQztvQkFDUixPQUFPLEVBQUUsQ0FBQyxhQUFhLENBQUM7b0JBQ3hCLFNBQVMsRUFBRSxpQ0FBaUM7aUJBQzdDOztBQUdEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQW9CRztBQUNILE1BQU0sVUFBVSxxQkFBcUI7SUFDbkMsOEVBQThFO0lBQzlFLHFGQUFxRjtJQUNyRixPQUFPLENBQUMsR0FBRyxpQ0FBaUMsQ0FBQyxDQUFDO0FBQ2hELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5pbXBvcnQge1xuICBNb2R1bGVXaXRoUHJvdmlkZXJzLFxuICBOZ01vZHVsZSxcbiAgUHJvdmlkZXIsXG4gIMm1cGVyZm9ybWFuY2VNYXJrRmVhdHVyZSBhcyBwZXJmb3JtYW5jZU1hcmtGZWF0dXJlLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7QnJvd3Nlck1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvcGxhdGZvcm0tYnJvd3Nlcic7XG5cbmltcG9ydCB7QlJPV1NFUl9BTklNQVRJT05TX1BST1ZJREVSUywgQlJPV1NFUl9OT09QX0FOSU1BVElPTlNfUFJPVklERVJTfSBmcm9tICcuL3Byb3ZpZGVycyc7XG5cbi8qKlxuICogT2JqZWN0IHVzZWQgdG8gY29uZmlndXJlIHRoZSBiZWhhdmlvciBvZiB7QGxpbmsgQnJvd3NlckFuaW1hdGlvbnNNb2R1bGV9XG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQnJvd3NlckFuaW1hdGlvbnNNb2R1bGVDb25maWcge1xuICAvKipcbiAgICogIFdoZXRoZXIgYW5pbWF0aW9ucyBzaG91bGQgYmUgZGlzYWJsZWQuIFBhc3NpbmcgdGhpcyBpcyBpZGVudGljYWwgdG8gcHJvdmlkaW5nIHRoZVxuICAgKiBgTm9vcEFuaW1hdGlvbnNNb2R1bGVgLCBidXQgaXQgY2FuIGJlIGNvbnRyb2xsZWQgYmFzZWQgb24gYSBydW50aW1lIHZhbHVlLlxuICAgKi9cbiAgZGlzYWJsZUFuaW1hdGlvbnM/OiBib29sZWFuO1xufVxuXG4vKipcbiAqIEV4cG9ydHMgYEJyb3dzZXJNb2R1bGVgIHdpdGggYWRkaXRpb25hbCBkZXBlbmRlbmN5LWluamVjdGlvbiBwcm92aWRlcnNcbiAqIGZvciB1c2Ugd2l0aCBhbmltYXRpb25zLiBTZWUgW0FuaW1hdGlvbnNdKGd1aWRlL2FuaW1hdGlvbnMpLlxuICogQHB1YmxpY0FwaVxuICovXG5ATmdNb2R1bGUoe1xuICBleHBvcnRzOiBbQnJvd3Nlck1vZHVsZV0sXG4gIHByb3ZpZGVyczogQlJPV1NFUl9BTklNQVRJT05TX1BST1ZJREVSUyxcbn0pXG5leHBvcnQgY2xhc3MgQnJvd3NlckFuaW1hdGlvbnNNb2R1bGUge1xuICAvKipcbiAgICogQ29uZmlndXJlcyB0aGUgbW9kdWxlIGJhc2VkIG9uIHRoZSBzcGVjaWZpZWQgb2JqZWN0LlxuICAgKlxuICAgKiBAcGFyYW0gY29uZmlnIE9iamVjdCB1c2VkIHRvIGNvbmZpZ3VyZSB0aGUgYmVoYXZpb3Igb2YgdGhlIGBCcm93c2VyQW5pbWF0aW9uc01vZHVsZWAuXG4gICAqIEBzZWUge0BsaW5rIEJyb3dzZXJBbmltYXRpb25zTW9kdWxlQ29uZmlnfVxuICAgKlxuICAgKiBAdXNhZ2VOb3Rlc1xuICAgKiBXaGVuIHJlZ2lzdGVyaW5nIHRoZSBgQnJvd3NlckFuaW1hdGlvbnNNb2R1bGVgLCB5b3UgY2FuIHVzZSB0aGUgYHdpdGhDb25maWdgXG4gICAqIGZ1bmN0aW9uIGFzIGZvbGxvd3M6XG4gICAqIGBgYFxuICAgKiBATmdNb2R1bGUoe1xuICAgKiAgIGltcG9ydHM6IFtCcm93c2VyQW5pbWF0aW9uc01vZHVsZS53aXRoQ29uZmlnKGNvbmZpZyldXG4gICAqIH0pXG4gICAqIGNsYXNzIE15TmdNb2R1bGUge31cbiAgICogYGBgXG4gICAqL1xuICBzdGF0aWMgd2l0aENvbmZpZyhcbiAgICBjb25maWc6IEJyb3dzZXJBbmltYXRpb25zTW9kdWxlQ29uZmlnLFxuICApOiBNb2R1bGVXaXRoUHJvdmlkZXJzPEJyb3dzZXJBbmltYXRpb25zTW9kdWxlPiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5nTW9kdWxlOiBCcm93c2VyQW5pbWF0aW9uc01vZHVsZSxcbiAgICAgIHByb3ZpZGVyczogY29uZmlnLmRpc2FibGVBbmltYXRpb25zXG4gICAgICAgID8gQlJPV1NFUl9OT09QX0FOSU1BVElPTlNfUFJPVklERVJTXG4gICAgICAgIDogQlJPV1NFUl9BTklNQVRJT05TX1BST1ZJREVSUyxcbiAgICB9O1xuICB9XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgc2V0IG9mIGRlcGVuZGVuY3ktaW5qZWN0aW9uIHByb3ZpZGVyc1xuICogdG8gZW5hYmxlIGFuaW1hdGlvbnMgaW4gYW4gYXBwbGljYXRpb24uIFNlZSBbYW5pbWF0aW9ucyBndWlkZV0oZ3VpZGUvYW5pbWF0aW9ucylcbiAqIHRvIGxlYXJuIG1vcmUgYWJvdXQgYW5pbWF0aW9ucyBpbiBBbmd1bGFyLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogVGhlIGZ1bmN0aW9uIGlzIHVzZWZ1bCB3aGVuIHlvdSB3YW50IHRvIGVuYWJsZSBhbmltYXRpb25zIGluIGFuIGFwcGxpY2F0aW9uXG4gKiBib290c3RyYXBwZWQgdXNpbmcgdGhlIGBib290c3RyYXBBcHBsaWNhdGlvbmAgZnVuY3Rpb24uIEluIHRoaXMgc2NlbmFyaW8gdGhlcmVcbiAqIGlzIG5vIG5lZWQgdG8gaW1wb3J0IHRoZSBgQnJvd3NlckFuaW1hdGlvbnNNb2R1bGVgIE5nTW9kdWxlIGF0IGFsbCwganVzdCBhZGRcbiAqIHByb3ZpZGVycyByZXR1cm5lZCBieSB0aGlzIGZ1bmN0aW9uIHRvIHRoZSBgcHJvdmlkZXJzYCBsaXN0IGFzIHNob3cgYmVsb3cuXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogYm9vdHN0cmFwQXBwbGljYXRpb24oUm9vdENvbXBvbmVudCwge1xuICogICBwcm92aWRlcnM6IFtcbiAqICAgICBwcm92aWRlQW5pbWF0aW9ucygpXG4gKiAgIF1cbiAqIH0pO1xuICogYGBgXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gcHJvdmlkZUFuaW1hdGlvbnMoKTogUHJvdmlkZXJbXSB7XG4gIHBlcmZvcm1hbmNlTWFya0ZlYXR1cmUoJ05nRWFnZXJBbmltYXRpb25zJyk7XG4gIC8vIFJldHVybiBhIGNvcHkgdG8gcHJldmVudCBjaGFuZ2VzIHRvIHRoZSBvcmlnaW5hbCBhcnJheSBpbiBjYXNlIGFueSBpbi1wbGFjZVxuICAvLyBhbHRlcmF0aW9ucyBhcmUgcGVyZm9ybWVkIHRvIHRoZSBgcHJvdmlkZUFuaW1hdGlvbnNgIGNhbGwgcmVzdWx0cyBpbiBhcHAgY29kZS5cbiAgcmV0dXJuIFsuLi5CUk9XU0VSX0FOSU1BVElPTlNfUFJPVklERVJTXTtcbn1cblxuLyoqXG4gKiBBIG51bGwgcGxheWVyIHRoYXQgbXVzdCBiZSBpbXBvcnRlZCB0byBhbGxvdyBkaXNhYmxpbmcgb2YgYW5pbWF0aW9ucy5cbiAqIEBwdWJsaWNBcGlcbiAqL1xuQE5nTW9kdWxlKHtcbiAgZXhwb3J0czogW0Jyb3dzZXJNb2R1bGVdLFxuICBwcm92aWRlcnM6IEJST1dTRVJfTk9PUF9BTklNQVRJT05TX1BST1ZJREVSUyxcbn0pXG5leHBvcnQgY2xhc3MgTm9vcEFuaW1hdGlvbnNNb2R1bGUge31cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBzZXQgb2YgZGVwZW5kZW5jeS1pbmplY3Rpb24gcHJvdmlkZXJzXG4gKiB0byBkaXNhYmxlIGFuaW1hdGlvbnMgaW4gYW4gYXBwbGljYXRpb24uIFNlZSBbYW5pbWF0aW9ucyBndWlkZV0oZ3VpZGUvYW5pbWF0aW9ucylcbiAqIHRvIGxlYXJuIG1vcmUgYWJvdXQgYW5pbWF0aW9ucyBpbiBBbmd1bGFyLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogVGhlIGZ1bmN0aW9uIGlzIHVzZWZ1bCB3aGVuIHlvdSB3YW50IHRvIGJvb3RzdHJhcCBhbiBhcHBsaWNhdGlvbiB1c2luZ1xuICogdGhlIGBib290c3RyYXBBcHBsaWNhdGlvbmAgZnVuY3Rpb24sIGJ1dCB5b3UgbmVlZCB0byBkaXNhYmxlIGFuaW1hdGlvbnNcbiAqIChmb3IgZXhhbXBsZSwgd2hlbiBydW5uaW5nIHRlc3RzKS5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBib290c3RyYXBBcHBsaWNhdGlvbihSb290Q29tcG9uZW50LCB7XG4gKiAgIHByb3ZpZGVyczogW1xuICogICAgIHByb3ZpZGVOb29wQW5pbWF0aW9ucygpXG4gKiAgIF1cbiAqIH0pO1xuICogYGBgXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gcHJvdmlkZU5vb3BBbmltYXRpb25zKCk6IFByb3ZpZGVyW10ge1xuICAvLyBSZXR1cm4gYSBjb3B5IHRvIHByZXZlbnQgY2hhbmdlcyB0byB0aGUgb3JpZ2luYWwgYXJyYXkgaW4gY2FzZSBhbnkgaW4tcGxhY2VcbiAgLy8gYWx0ZXJhdGlvbnMgYXJlIHBlcmZvcm1lZCB0byB0aGUgYHByb3ZpZGVOb29wQW5pbWF0aW9uc2AgY2FsbCByZXN1bHRzIGluIGFwcCBjb2RlLlxuICByZXR1cm4gWy4uLkJST1dTRVJfTk9PUF9BTklNQVRJT05TX1BST1ZJREVSU107XG59XG4iXX0=