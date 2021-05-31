/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BROWSER_ANIMATIONS_PROVIDERS, BROWSER_NOOP_ANIMATIONS_PROVIDERS } from './providers';
/**
 * Exports `BrowserModule` with additional [dependency-injection providers](guide/glossary#provider)
 * for use with animations. See [Animations](guide/animations).
 * @publicApi
 */
export class BrowserAnimationsModule {
    /**
     * Configures the module based on the specified object.
     *
     * @param config Object used to configure the behavior of the `BrowserAnimationsModule`.
     * @see `BrowserAnimationsModuleConfig`
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
            providers: config.disableAnimations ? BROWSER_NOOP_ANIMATIONS_PROVIDERS :
                BROWSER_ANIMATIONS_PROVIDERS
        };
    }
}
BrowserAnimationsModule.decorators = [
    { type: NgModule, args: [{
                exports: [BrowserModule],
                providers: BROWSER_ANIMATIONS_PROVIDERS,
            },] }
];
/**
 * A null player that must be imported to allow disabling of animations.
 * @publicApi
 */
export class NoopAnimationsModule {
}
NoopAnimationsModule.decorators = [
    { type: NgModule, args: [{
                exports: [BrowserModule],
                providers: BROWSER_NOOP_ANIMATIONS_PROVIDERS,
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvcGxhdGZvcm0tYnJvd3Nlci9hbmltYXRpb25zL3NyYy9tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBQ0gsT0FBTyxFQUFzQixRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDNUQsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLDJCQUEyQixDQUFDO0FBRXhELE9BQU8sRUFBQyw0QkFBNEIsRUFBRSxpQ0FBaUMsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQWM1Rjs7OztHQUlHO0FBS0gsTUFBTSxPQUFPLHVCQUF1QjtJQUNsQzs7Ozs7Ozs7Ozs7Ozs7O09BZUc7SUFDSCxNQUFNLENBQUMsVUFBVSxDQUFDLE1BQXFDO1FBRXJELE9BQU87WUFDTCxRQUFRLEVBQUUsdUJBQXVCO1lBQ2pDLFNBQVMsRUFBRSxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLGlDQUFpQyxDQUFDLENBQUM7Z0JBQ25DLDRCQUE0QjtTQUNuRSxDQUFDO0lBQ0osQ0FBQzs7O1lBNUJGLFFBQVEsU0FBQztnQkFDUixPQUFPLEVBQUUsQ0FBQyxhQUFhLENBQUM7Z0JBQ3hCLFNBQVMsRUFBRSw0QkFBNEI7YUFDeEM7O0FBNEJEOzs7R0FHRztBQUtILE1BQU0sT0FBTyxvQkFBb0I7OztZQUpoQyxRQUFRLFNBQUM7Z0JBQ1IsT0FBTyxFQUFFLENBQUMsYUFBYSxDQUFDO2dCQUN4QixTQUFTLEVBQUUsaUNBQWlDO2FBQzdDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge01vZHVsZVdpdGhQcm92aWRlcnMsIE5nTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7QnJvd3Nlck1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvcGxhdGZvcm0tYnJvd3Nlcic7XG5cbmltcG9ydCB7QlJPV1NFUl9BTklNQVRJT05TX1BST1ZJREVSUywgQlJPV1NFUl9OT09QX0FOSU1BVElPTlNfUFJPVklERVJTfSBmcm9tICcuL3Byb3ZpZGVycyc7XG5cbi8qKlxuICogT2JqZWN0IHVzZWQgdG8gY29uZmlndXJlIHRoZSBiZWhhdmlvciBvZiB7QGxpbmsgQnJvd3NlckFuaW1hdGlvbnNNb2R1bGV9XG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQnJvd3NlckFuaW1hdGlvbnNNb2R1bGVDb25maWcge1xuICAvKipcbiAgICogIFdoZXRoZXIgYW5pbWF0aW9ucyBzaG91bGQgYmUgZGlzYWJsZWQuIFBhc3NpbmcgdGhpcyBpcyBpZGVudGljYWwgdG8gcHJvdmlkaW5nIHRoZVxuICAgKiBgTm9vcEFuaW1hdGlvbnNNb2R1bGVgLCBidXQgaXQgY2FuIGJlIGNvbnRyb2xsZWQgYmFzZWQgb24gYSBydW50aW1lIHZhbHVlLlxuICAgKi9cbiAgZGlzYWJsZUFuaW1hdGlvbnM/OiBib29sZWFuO1xufVxuXG4vKipcbiAqIEV4cG9ydHMgYEJyb3dzZXJNb2R1bGVgIHdpdGggYWRkaXRpb25hbCBbZGVwZW5kZW5jeS1pbmplY3Rpb24gcHJvdmlkZXJzXShndWlkZS9nbG9zc2FyeSNwcm92aWRlcilcbiAqIGZvciB1c2Ugd2l0aCBhbmltYXRpb25zLiBTZWUgW0FuaW1hdGlvbnNdKGd1aWRlL2FuaW1hdGlvbnMpLlxuICogQHB1YmxpY0FwaVxuICovXG5ATmdNb2R1bGUoe1xuICBleHBvcnRzOiBbQnJvd3Nlck1vZHVsZV0sXG4gIHByb3ZpZGVyczogQlJPV1NFUl9BTklNQVRJT05TX1BST1ZJREVSUyxcbn0pXG5leHBvcnQgY2xhc3MgQnJvd3NlckFuaW1hdGlvbnNNb2R1bGUge1xuICAvKipcbiAgICogQ29uZmlndXJlcyB0aGUgbW9kdWxlIGJhc2VkIG9uIHRoZSBzcGVjaWZpZWQgb2JqZWN0LlxuICAgKlxuICAgKiBAcGFyYW0gY29uZmlnIE9iamVjdCB1c2VkIHRvIGNvbmZpZ3VyZSB0aGUgYmVoYXZpb3Igb2YgdGhlIGBCcm93c2VyQW5pbWF0aW9uc01vZHVsZWAuXG4gICAqIEBzZWUgYEJyb3dzZXJBbmltYXRpb25zTW9kdWxlQ29uZmlnYFxuICAgKlxuICAgKiBAdXNhZ2VOb3Rlc1xuICAgKiBXaGVuIHJlZ2lzdGVyaW5nIHRoZSBgQnJvd3NlckFuaW1hdGlvbnNNb2R1bGVgLCB5b3UgY2FuIHVzZSB0aGUgYHdpdGhDb25maWdgXG4gICAqIGZ1bmN0aW9uIGFzIGZvbGxvd3M6XG4gICAqIGBgYFxuICAgKiBATmdNb2R1bGUoe1xuICAgKiAgIGltcG9ydHM6IFtCcm93c2VyQW5pbWF0aW9uc01vZHVsZS53aXRoQ29uZmlnKGNvbmZpZyldXG4gICAqIH0pXG4gICAqIGNsYXNzIE15TmdNb2R1bGUge31cbiAgICogYGBgXG4gICAqL1xuICBzdGF0aWMgd2l0aENvbmZpZyhjb25maWc6IEJyb3dzZXJBbmltYXRpb25zTW9kdWxlQ29uZmlnKTpcbiAgICAgIE1vZHVsZVdpdGhQcm92aWRlcnM8QnJvd3NlckFuaW1hdGlvbnNNb2R1bGU+IHtcbiAgICByZXR1cm4ge1xuICAgICAgbmdNb2R1bGU6IEJyb3dzZXJBbmltYXRpb25zTW9kdWxlLFxuICAgICAgcHJvdmlkZXJzOiBjb25maWcuZGlzYWJsZUFuaW1hdGlvbnMgPyBCUk9XU0VSX05PT1BfQU5JTUFUSU9OU19QUk9WSURFUlMgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBCUk9XU0VSX0FOSU1BVElPTlNfUFJPVklERVJTXG4gICAgfTtcbiAgfVxufVxuXG4vKipcbiAqIEEgbnVsbCBwbGF5ZXIgdGhhdCBtdXN0IGJlIGltcG9ydGVkIHRvIGFsbG93IGRpc2FibGluZyBvZiBhbmltYXRpb25zLlxuICogQHB1YmxpY0FwaVxuICovXG5ATmdNb2R1bGUoe1xuICBleHBvcnRzOiBbQnJvd3Nlck1vZHVsZV0sXG4gIHByb3ZpZGVyczogQlJPV1NFUl9OT09QX0FOSU1BVElPTlNfUFJPVklERVJTLFxufSlcbmV4cG9ydCBjbGFzcyBOb29wQW5pbWF0aW9uc01vZHVsZSB7XG59XG4iXX0=