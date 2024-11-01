import { providersResolver } from '../di_setup';
/**
 * This feature resolves the providers of a directive (or component),
 * and publish them into the DI system, making it visible to others for injection.
 *
 * For example:
 * ```ts
 * class ComponentWithProviders {
 *   constructor(private greeter: GreeterDE) {}
 *
 *   static ɵcmp = defineComponent({
 *     type: ComponentWithProviders,
 *     selectors: [['component-with-providers']],
 *    factory: () => new ComponentWithProviders(directiveInject(GreeterDE as any)),
 *    decls: 1,
 *    vars: 1,
 *    template: function(fs: RenderFlags, ctx: ComponentWithProviders) {
 *      if (fs & RenderFlags.Create) {
 *        ɵɵtext(0);
 *      }
 *      if (fs & RenderFlags.Update) {
 *        ɵɵtextInterpolate(ctx.greeter.greet());
 *      }
 *    },
 *    features: [ɵɵProvidersFeature([GreeterDE])]
 *  });
 * }
 * ```
 *
 * @param definition
 *
 * @codeGenApi
 */
export function ɵɵProvidersFeature(providers, viewProviders = []) {
    return (definition) => {
        definition.providersResolver = (def, processProvidersFn) => {
            return providersResolver(def, //
            processProvidersFn ? processProvidersFn(providers) : providers, //
            viewProviders);
        };
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvdmlkZXJzX2ZlYXR1cmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9yZW5kZXIzL2ZlYXR1cmVzL3Byb3ZpZGVyc19mZWF0dXJlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQVFBLE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUc5Qzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQStCRztBQUNILE1BQU0sVUFBVSxrQkFBa0IsQ0FBSSxTQUFxQixFQUFFLGdCQUE0QixFQUFFO0lBQ3pGLE9BQU8sQ0FBQyxVQUEyQixFQUFFLEVBQUU7UUFDckMsVUFBVSxDQUFDLGlCQUFpQixHQUFHLENBQzdCLEdBQW9CLEVBQ3BCLGtCQUE2QyxFQUM3QyxFQUFFO1lBQ0YsT0FBTyxpQkFBaUIsQ0FDdEIsR0FBRyxFQUFFLEVBQUU7WUFDUCxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxFQUFFO1lBQ2xFLGFBQWEsQ0FDZCxDQUFDO1FBQ0osQ0FBQyxDQUFDO0lBQ0osQ0FBQyxDQUFDO0FBQ0osQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cbmltcG9ydCB7UHJvY2Vzc1Byb3ZpZGVyc0Z1bmN0aW9uLCBQcm92aWRlcn0gZnJvbSAnLi4vLi4vZGkvaW50ZXJmYWNlL3Byb3ZpZGVyJztcbmltcG9ydCB7cHJvdmlkZXJzUmVzb2x2ZXJ9IGZyb20gJy4uL2RpX3NldHVwJztcbmltcG9ydCB7RGlyZWN0aXZlRGVmfSBmcm9tICcuLi9pbnRlcmZhY2VzL2RlZmluaXRpb24nO1xuXG4vKipcbiAqIFRoaXMgZmVhdHVyZSByZXNvbHZlcyB0aGUgcHJvdmlkZXJzIG9mIGEgZGlyZWN0aXZlIChvciBjb21wb25lbnQpLFxuICogYW5kIHB1Ymxpc2ggdGhlbSBpbnRvIHRoZSBESSBzeXN0ZW0sIG1ha2luZyBpdCB2aXNpYmxlIHRvIG90aGVycyBmb3IgaW5qZWN0aW9uLlxuICpcbiAqIEZvciBleGFtcGxlOlxuICogYGBgdHNcbiAqIGNsYXNzIENvbXBvbmVudFdpdGhQcm92aWRlcnMge1xuICogICBjb25zdHJ1Y3Rvcihwcml2YXRlIGdyZWV0ZXI6IEdyZWV0ZXJERSkge31cbiAqXG4gKiAgIHN0YXRpYyDJtWNtcCA9IGRlZmluZUNvbXBvbmVudCh7XG4gKiAgICAgdHlwZTogQ29tcG9uZW50V2l0aFByb3ZpZGVycyxcbiAqICAgICBzZWxlY3RvcnM6IFtbJ2NvbXBvbmVudC13aXRoLXByb3ZpZGVycyddXSxcbiAqICAgIGZhY3Rvcnk6ICgpID0+IG5ldyBDb21wb25lbnRXaXRoUHJvdmlkZXJzKGRpcmVjdGl2ZUluamVjdChHcmVldGVyREUgYXMgYW55KSksXG4gKiAgICBkZWNsczogMSxcbiAqICAgIHZhcnM6IDEsXG4gKiAgICB0ZW1wbGF0ZTogZnVuY3Rpb24oZnM6IFJlbmRlckZsYWdzLCBjdHg6IENvbXBvbmVudFdpdGhQcm92aWRlcnMpIHtcbiAqICAgICAgaWYgKGZzICYgUmVuZGVyRmxhZ3MuQ3JlYXRlKSB7XG4gKiAgICAgICAgybXJtXRleHQoMCk7XG4gKiAgICAgIH1cbiAqICAgICAgaWYgKGZzICYgUmVuZGVyRmxhZ3MuVXBkYXRlKSB7XG4gKiAgICAgICAgybXJtXRleHRJbnRlcnBvbGF0ZShjdHguZ3JlZXRlci5ncmVldCgpKTtcbiAqICAgICAgfVxuICogICAgfSxcbiAqICAgIGZlYXR1cmVzOiBbybXJtVByb3ZpZGVyc0ZlYXR1cmUoW0dyZWV0ZXJERV0pXVxuICogIH0pO1xuICogfVxuICogYGBgXG4gKlxuICogQHBhcmFtIGRlZmluaXRpb25cbiAqXG4gKiBAY29kZUdlbkFwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gybXJtVByb3ZpZGVyc0ZlYXR1cmU8VD4ocHJvdmlkZXJzOiBQcm92aWRlcltdLCB2aWV3UHJvdmlkZXJzOiBQcm92aWRlcltdID0gW10pIHtcbiAgcmV0dXJuIChkZWZpbml0aW9uOiBEaXJlY3RpdmVEZWY8VD4pID0+IHtcbiAgICBkZWZpbml0aW9uLnByb3ZpZGVyc1Jlc29sdmVyID0gKFxuICAgICAgZGVmOiBEaXJlY3RpdmVEZWY8VD4sXG4gICAgICBwcm9jZXNzUHJvdmlkZXJzRm4/OiBQcm9jZXNzUHJvdmlkZXJzRnVuY3Rpb24sXG4gICAgKSA9PiB7XG4gICAgICByZXR1cm4gcHJvdmlkZXJzUmVzb2x2ZXIoXG4gICAgICAgIGRlZiwgLy9cbiAgICAgICAgcHJvY2Vzc1Byb3ZpZGVyc0ZuID8gcHJvY2Vzc1Byb3ZpZGVyc0ZuKHByb3ZpZGVycykgOiBwcm92aWRlcnMsIC8vXG4gICAgICAgIHZpZXdQcm92aWRlcnMsXG4gICAgICApO1xuICAgIH07XG4gIH07XG59XG4iXX0=