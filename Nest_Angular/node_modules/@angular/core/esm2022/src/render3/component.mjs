/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { getNullInjector } from '../di/r3_injector';
import { ComponentFactory } from './component_ref';
import { getComponentDef } from './definition';
import { assertComponentDef } from './errors';
/**
 * Creates a `ComponentRef` instance based on provided component type and a set of options.
 *
 * @usageNotes
 *
 * The example below demonstrates how the `createComponent` function can be used
 * to create an instance of a ComponentRef dynamically and attach it to an ApplicationRef,
 * so that it gets included into change detection cycles.
 *
 * Note: the example uses standalone components, but the function can also be used for
 * non-standalone components (declared in an NgModule) as well.
 *
 * ```typescript
 * @Component({
 *   standalone: true,
 *   template: `Hello {{ name }}!`
 * })
 * class HelloComponent {
 *   name = 'Angular';
 * }
 *
 * @Component({
 *   standalone: true,
 *   template: `<div id="hello-component-host"></div>`
 * })
 * class RootComponent {}
 *
 * // Bootstrap an application.
 * const applicationRef = await bootstrapApplication(RootComponent);
 *
 * // Locate a DOM node that would be used as a host.
 * const hostElement = document.getElementById('hello-component-host');
 *
 * // Get an `EnvironmentInjector` instance from the `ApplicationRef`.
 * const environmentInjector = applicationRef.injector;
 *
 * // We can now create a `ComponentRef` instance.
 * const componentRef = createComponent(HelloComponent, {hostElement, environmentInjector});
 *
 * // Last step is to register the newly created ref using the `ApplicationRef` instance
 * // to include the component view into change detection cycles.
 * applicationRef.attachView(componentRef.hostView);
 * componentRef.changeDetectorRef.detectChanges();
 * ```
 *
 * @param component Component class reference.
 * @param options Set of options to use:
 *  * `environmentInjector`: An `EnvironmentInjector` instance to be used for the component.
 *  * `hostElement` (optional): A DOM node that should act as a host node for the component. If not
 * provided, Angular creates one based on the tag name used in the component selector (and falls
 * back to using `div` if selector doesn't have tag name info).
 *  * `elementInjector` (optional): An `ElementInjector` instance, see additional info about it
 * [here](guide/di/hierarchical-dependency-injection#elementinjector).
 *  * `projectableNodes` (optional): A list of DOM nodes that should be projected through
 *                      [`<ng-content>`](api/core/ng-content) of the new component instance.
 * @returns ComponentRef instance that represents a given Component.
 *
 * @publicApi
 */
export function createComponent(component, options) {
    ngDevMode && assertComponentDef(component);
    const componentDef = getComponentDef(component);
    const elementInjector = options.elementInjector || getNullInjector();
    const factory = new ComponentFactory(componentDef);
    return factory.create(elementInjector, options.projectableNodes, options.hostElement, options.environmentInjector);
}
/**
 * Creates an object that allows to retrieve component metadata.
 *
 * @usageNotes
 *
 * The example below demonstrates how to use the function and how the fields
 * of the returned object map to the component metadata.
 *
 * ```typescript
 * @Component({
 *   standalone: true,
 *   selector: 'foo-component',
 *   template: `
 *     <ng-content></ng-content>
 *     <ng-content select="content-selector-a"></ng-content>
 *   `,
 * })
 * class FooComponent {
 *   @Input('inputName') inputPropName: string;
 *   @Output('outputName') outputPropName = new EventEmitter<void>();
 * }
 *
 * const mirror = reflectComponentType(FooComponent);
 * expect(mirror.type).toBe(FooComponent);
 * expect(mirror.selector).toBe('foo-component');
 * expect(mirror.isStandalone).toBe(true);
 * expect(mirror.inputs).toEqual([{propName: 'inputName', templateName: 'inputPropName'}]);
 * expect(mirror.outputs).toEqual([{propName: 'outputName', templateName: 'outputPropName'}]);
 * expect(mirror.ngContentSelectors).toEqual([
 *   '*',                 // first `<ng-content>` in a template, the selector defaults to `*`
 *   'content-selector-a' // second `<ng-content>` in a template
 * ]);
 * ```
 *
 * @param component Component class reference.
 * @returns An object that allows to retrieve component metadata.
 *
 * @publicApi
 */
export function reflectComponentType(component) {
    const componentDef = getComponentDef(component);
    if (!componentDef)
        return null;
    const factory = new ComponentFactory(componentDef);
    return {
        get selector() {
            return factory.selector;
        },
        get type() {
            return factory.componentType;
        },
        get inputs() {
            return factory.inputs;
        },
        get outputs() {
            return factory.outputs;
        },
        get ngContentSelectors() {
            return factory.ngContentSelectors;
        },
        get isStandalone() {
            return componentDef.standalone;
        },
        get isSignal() {
            return componentDef.signals;
        },
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvcmVuZGVyMy9jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBR0gsT0FBTyxFQUFzQixlQUFlLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUl2RSxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUNqRCxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sY0FBYyxDQUFDO0FBQzdDLE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUU1Qzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTBERztBQUNILE1BQU0sVUFBVSxlQUFlLENBQzdCLFNBQWtCLEVBQ2xCLE9BS0M7SUFFRCxTQUFTLElBQUksa0JBQWtCLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDM0MsTUFBTSxZQUFZLEdBQUcsZUFBZSxDQUFDLFNBQVMsQ0FBRSxDQUFDO0lBQ2pELE1BQU0sZUFBZSxHQUFHLE9BQU8sQ0FBQyxlQUFlLElBQUksZUFBZSxFQUFFLENBQUM7SUFDckUsTUFBTSxPQUFPLEdBQUcsSUFBSSxnQkFBZ0IsQ0FBSSxZQUFZLENBQUMsQ0FBQztJQUN0RCxPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQ25CLGVBQWUsRUFDZixPQUFPLENBQUMsZ0JBQWdCLEVBQ3hCLE9BQU8sQ0FBQyxXQUFXLEVBQ25CLE9BQU8sQ0FBQyxtQkFBbUIsQ0FDNUIsQ0FBQztBQUNKLENBQUM7QUE4Q0Q7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBc0NHO0FBQ0gsTUFBTSxVQUFVLG9CQUFvQixDQUFJLFNBQWtCO0lBQ3hELE1BQU0sWUFBWSxHQUFHLGVBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNoRCxJQUFJLENBQUMsWUFBWTtRQUFFLE9BQU8sSUFBSSxDQUFDO0lBRS9CLE1BQU0sT0FBTyxHQUFHLElBQUksZ0JBQWdCLENBQUksWUFBWSxDQUFDLENBQUM7SUFDdEQsT0FBTztRQUNMLElBQUksUUFBUTtZQUNWLE9BQU8sT0FBTyxDQUFDLFFBQVEsQ0FBQztRQUMxQixDQUFDO1FBQ0QsSUFBSSxJQUFJO1lBQ04sT0FBTyxPQUFPLENBQUMsYUFBYSxDQUFDO1FBQy9CLENBQUM7UUFDRCxJQUFJLE1BQU07WUFNUixPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUM7UUFDeEIsQ0FBQztRQUNELElBQUksT0FBTztZQUNULE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQztRQUN6QixDQUFDO1FBQ0QsSUFBSSxrQkFBa0I7WUFDcEIsT0FBTyxPQUFPLENBQUMsa0JBQWtCLENBQUM7UUFDcEMsQ0FBQztRQUNELElBQUksWUFBWTtZQUNkLE9BQU8sWUFBWSxDQUFDLFVBQVUsQ0FBQztRQUNqQyxDQUFDO1FBQ0QsSUFBSSxRQUFRO1lBQ1YsT0FBTyxZQUFZLENBQUMsT0FBTyxDQUFDO1FBQzlCLENBQUM7S0FDRixDQUFDO0FBQ0osQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3Rvcn0gZnJvbSAnLi4vZGkvaW5qZWN0b3InO1xuaW1wb3J0IHtFbnZpcm9ubWVudEluamVjdG9yLCBnZXROdWxsSW5qZWN0b3J9IGZyb20gJy4uL2RpL3IzX2luamVjdG9yJztcbmltcG9ydCB7VHlwZX0gZnJvbSAnLi4vaW50ZXJmYWNlL3R5cGUnO1xuaW1wb3J0IHtDb21wb25lbnRSZWZ9IGZyb20gJy4uL2xpbmtlci9jb21wb25lbnRfZmFjdG9yeSc7XG5cbmltcG9ydCB7Q29tcG9uZW50RmFjdG9yeX0gZnJvbSAnLi9jb21wb25lbnRfcmVmJztcbmltcG9ydCB7Z2V0Q29tcG9uZW50RGVmfSBmcm9tICcuL2RlZmluaXRpb24nO1xuaW1wb3J0IHthc3NlcnRDb21wb25lbnREZWZ9IGZyb20gJy4vZXJyb3JzJztcblxuLyoqXG4gKiBDcmVhdGVzIGEgYENvbXBvbmVudFJlZmAgaW5zdGFuY2UgYmFzZWQgb24gcHJvdmlkZWQgY29tcG9uZW50IHR5cGUgYW5kIGEgc2V0IG9mIG9wdGlvbnMuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiBUaGUgZXhhbXBsZSBiZWxvdyBkZW1vbnN0cmF0ZXMgaG93IHRoZSBgY3JlYXRlQ29tcG9uZW50YCBmdW5jdGlvbiBjYW4gYmUgdXNlZFxuICogdG8gY3JlYXRlIGFuIGluc3RhbmNlIG9mIGEgQ29tcG9uZW50UmVmIGR5bmFtaWNhbGx5IGFuZCBhdHRhY2ggaXQgdG8gYW4gQXBwbGljYXRpb25SZWYsXG4gKiBzbyB0aGF0IGl0IGdldHMgaW5jbHVkZWQgaW50byBjaGFuZ2UgZGV0ZWN0aW9uIGN5Y2xlcy5cbiAqXG4gKiBOb3RlOiB0aGUgZXhhbXBsZSB1c2VzIHN0YW5kYWxvbmUgY29tcG9uZW50cywgYnV0IHRoZSBmdW5jdGlvbiBjYW4gYWxzbyBiZSB1c2VkIGZvclxuICogbm9uLXN0YW5kYWxvbmUgY29tcG9uZW50cyAoZGVjbGFyZWQgaW4gYW4gTmdNb2R1bGUpIGFzIHdlbGwuXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogQENvbXBvbmVudCh7XG4gKiAgIHN0YW5kYWxvbmU6IHRydWUsXG4gKiAgIHRlbXBsYXRlOiBgSGVsbG8ge3sgbmFtZSB9fSFgXG4gKiB9KVxuICogY2xhc3MgSGVsbG9Db21wb25lbnQge1xuICogICBuYW1lID0gJ0FuZ3VsYXInO1xuICogfVxuICpcbiAqIEBDb21wb25lbnQoe1xuICogICBzdGFuZGFsb25lOiB0cnVlLFxuICogICB0ZW1wbGF0ZTogYDxkaXYgaWQ9XCJoZWxsby1jb21wb25lbnQtaG9zdFwiPjwvZGl2PmBcbiAqIH0pXG4gKiBjbGFzcyBSb290Q29tcG9uZW50IHt9XG4gKlxuICogLy8gQm9vdHN0cmFwIGFuIGFwcGxpY2F0aW9uLlxuICogY29uc3QgYXBwbGljYXRpb25SZWYgPSBhd2FpdCBib290c3RyYXBBcHBsaWNhdGlvbihSb290Q29tcG9uZW50KTtcbiAqXG4gKiAvLyBMb2NhdGUgYSBET00gbm9kZSB0aGF0IHdvdWxkIGJlIHVzZWQgYXMgYSBob3N0LlxuICogY29uc3QgaG9zdEVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaGVsbG8tY29tcG9uZW50LWhvc3QnKTtcbiAqXG4gKiAvLyBHZXQgYW4gYEVudmlyb25tZW50SW5qZWN0b3JgIGluc3RhbmNlIGZyb20gdGhlIGBBcHBsaWNhdGlvblJlZmAuXG4gKiBjb25zdCBlbnZpcm9ubWVudEluamVjdG9yID0gYXBwbGljYXRpb25SZWYuaW5qZWN0b3I7XG4gKlxuICogLy8gV2UgY2FuIG5vdyBjcmVhdGUgYSBgQ29tcG9uZW50UmVmYCBpbnN0YW5jZS5cbiAqIGNvbnN0IGNvbXBvbmVudFJlZiA9IGNyZWF0ZUNvbXBvbmVudChIZWxsb0NvbXBvbmVudCwge2hvc3RFbGVtZW50LCBlbnZpcm9ubWVudEluamVjdG9yfSk7XG4gKlxuICogLy8gTGFzdCBzdGVwIGlzIHRvIHJlZ2lzdGVyIHRoZSBuZXdseSBjcmVhdGVkIHJlZiB1c2luZyB0aGUgYEFwcGxpY2F0aW9uUmVmYCBpbnN0YW5jZVxuICogLy8gdG8gaW5jbHVkZSB0aGUgY29tcG9uZW50IHZpZXcgaW50byBjaGFuZ2UgZGV0ZWN0aW9uIGN5Y2xlcy5cbiAqIGFwcGxpY2F0aW9uUmVmLmF0dGFjaFZpZXcoY29tcG9uZW50UmVmLmhvc3RWaWV3KTtcbiAqIGNvbXBvbmVudFJlZi5jaGFuZ2VEZXRlY3RvclJlZi5kZXRlY3RDaGFuZ2VzKCk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gY29tcG9uZW50IENvbXBvbmVudCBjbGFzcyByZWZlcmVuY2UuXG4gKiBAcGFyYW0gb3B0aW9ucyBTZXQgb2Ygb3B0aW9ucyB0byB1c2U6XG4gKiAgKiBgZW52aXJvbm1lbnRJbmplY3RvcmA6IEFuIGBFbnZpcm9ubWVudEluamVjdG9yYCBpbnN0YW5jZSB0byBiZSB1c2VkIGZvciB0aGUgY29tcG9uZW50LlxuICogICogYGhvc3RFbGVtZW50YCAob3B0aW9uYWwpOiBBIERPTSBub2RlIHRoYXQgc2hvdWxkIGFjdCBhcyBhIGhvc3Qgbm9kZSBmb3IgdGhlIGNvbXBvbmVudC4gSWYgbm90XG4gKiBwcm92aWRlZCwgQW5ndWxhciBjcmVhdGVzIG9uZSBiYXNlZCBvbiB0aGUgdGFnIG5hbWUgdXNlZCBpbiB0aGUgY29tcG9uZW50IHNlbGVjdG9yIChhbmQgZmFsbHNcbiAqIGJhY2sgdG8gdXNpbmcgYGRpdmAgaWYgc2VsZWN0b3IgZG9lc24ndCBoYXZlIHRhZyBuYW1lIGluZm8pLlxuICogICogYGVsZW1lbnRJbmplY3RvcmAgKG9wdGlvbmFsKTogQW4gYEVsZW1lbnRJbmplY3RvcmAgaW5zdGFuY2UsIHNlZSBhZGRpdGlvbmFsIGluZm8gYWJvdXQgaXRcbiAqIFtoZXJlXShndWlkZS9kaS9oaWVyYXJjaGljYWwtZGVwZW5kZW5jeS1pbmplY3Rpb24jZWxlbWVudGluamVjdG9yKS5cbiAqICAqIGBwcm9qZWN0YWJsZU5vZGVzYCAob3B0aW9uYWwpOiBBIGxpc3Qgb2YgRE9NIG5vZGVzIHRoYXQgc2hvdWxkIGJlIHByb2plY3RlZCB0aHJvdWdoXG4gKiAgICAgICAgICAgICAgICAgICAgICBbYDxuZy1jb250ZW50PmBdKGFwaS9jb3JlL25nLWNvbnRlbnQpIG9mIHRoZSBuZXcgY29tcG9uZW50IGluc3RhbmNlLlxuICogQHJldHVybnMgQ29tcG9uZW50UmVmIGluc3RhbmNlIHRoYXQgcmVwcmVzZW50cyBhIGdpdmVuIENvbXBvbmVudC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVDb21wb25lbnQ8Qz4oXG4gIGNvbXBvbmVudDogVHlwZTxDPixcbiAgb3B0aW9uczoge1xuICAgIGVudmlyb25tZW50SW5qZWN0b3I6IEVudmlyb25tZW50SW5qZWN0b3I7XG4gICAgaG9zdEVsZW1lbnQ/OiBFbGVtZW50O1xuICAgIGVsZW1lbnRJbmplY3Rvcj86IEluamVjdG9yO1xuICAgIHByb2plY3RhYmxlTm9kZXM/OiBOb2RlW11bXTtcbiAgfSxcbik6IENvbXBvbmVudFJlZjxDPiB7XG4gIG5nRGV2TW9kZSAmJiBhc3NlcnRDb21wb25lbnREZWYoY29tcG9uZW50KTtcbiAgY29uc3QgY29tcG9uZW50RGVmID0gZ2V0Q29tcG9uZW50RGVmKGNvbXBvbmVudCkhO1xuICBjb25zdCBlbGVtZW50SW5qZWN0b3IgPSBvcHRpb25zLmVsZW1lbnRJbmplY3RvciB8fCBnZXROdWxsSW5qZWN0b3IoKTtcbiAgY29uc3QgZmFjdG9yeSA9IG5ldyBDb21wb25lbnRGYWN0b3J5PEM+KGNvbXBvbmVudERlZik7XG4gIHJldHVybiBmYWN0b3J5LmNyZWF0ZShcbiAgICBlbGVtZW50SW5qZWN0b3IsXG4gICAgb3B0aW9ucy5wcm9qZWN0YWJsZU5vZGVzLFxuICAgIG9wdGlvbnMuaG9zdEVsZW1lbnQsXG4gICAgb3B0aW9ucy5lbnZpcm9ubWVudEluamVjdG9yLFxuICApO1xufVxuXG4vKipcbiAqIEFuIGludGVyZmFjZSB0aGF0IGRlc2NyaWJlcyB0aGUgc3Vic2V0IG9mIGNvbXBvbmVudCBtZXRhZGF0YVxuICogdGhhdCBjYW4gYmUgcmV0cmlldmVkIHVzaW5nIHRoZSBgcmVmbGVjdENvbXBvbmVudFR5cGVgIGZ1bmN0aW9uLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb21wb25lbnRNaXJyb3I8Qz4ge1xuICAvKipcbiAgICogVGhlIGNvbXBvbmVudCdzIEhUTUwgc2VsZWN0b3IuXG4gICAqL1xuICBnZXQgc2VsZWN0b3IoKTogc3RyaW5nO1xuICAvKipcbiAgICogVGhlIHR5cGUgb2YgY29tcG9uZW50IHRoZSBmYWN0b3J5IHdpbGwgY3JlYXRlLlxuICAgKi9cbiAgZ2V0IHR5cGUoKTogVHlwZTxDPjtcbiAgLyoqXG4gICAqIFRoZSBpbnB1dHMgb2YgdGhlIGNvbXBvbmVudC5cbiAgICovXG4gIGdldCBpbnB1dHMoKTogUmVhZG9ubHlBcnJheTx7XG4gICAgcmVhZG9ubHkgcHJvcE5hbWU6IHN0cmluZztcbiAgICByZWFkb25seSB0ZW1wbGF0ZU5hbWU6IHN0cmluZztcbiAgICByZWFkb25seSB0cmFuc2Zvcm0/OiAodmFsdWU6IGFueSkgPT4gYW55O1xuICAgIHJlYWRvbmx5IGlzU2lnbmFsOiBib29sZWFuO1xuICB9PjtcbiAgLyoqXG4gICAqIFRoZSBvdXRwdXRzIG9mIHRoZSBjb21wb25lbnQuXG4gICAqL1xuICBnZXQgb3V0cHV0cygpOiBSZWFkb25seUFycmF5PHtyZWFkb25seSBwcm9wTmFtZTogc3RyaW5nOyByZWFkb25seSB0ZW1wbGF0ZU5hbWU6IHN0cmluZ30+O1xuICAvKipcbiAgICogU2VsZWN0b3IgZm9yIGFsbCA8bmctY29udGVudD4gZWxlbWVudHMgaW4gdGhlIGNvbXBvbmVudC5cbiAgICovXG4gIGdldCBuZ0NvbnRlbnRTZWxlY3RvcnMoKTogUmVhZG9ubHlBcnJheTxzdHJpbmc+O1xuICAvKipcbiAgICogV2hldGhlciB0aGlzIGNvbXBvbmVudCBpcyBtYXJrZWQgYXMgc3RhbmRhbG9uZS5cbiAgICogTm90ZTogYW4gZXh0cmEgZmxhZywgbm90IHByZXNlbnQgaW4gYENvbXBvbmVudEZhY3RvcnlgLlxuICAgKi9cbiAgZ2V0IGlzU3RhbmRhbG9uZSgpOiBib29sZWFuO1xuICAvKipcbiAgICogLy8gVE9ETyhzaWduYWxzKTogUmVtb3ZlIGludGVybmFsIGFuZCBhZGQgcHVibGljIGRvY3VtZW50YXRpb25cbiAgICogQGludGVybmFsXG4gICAqL1xuICBnZXQgaXNTaWduYWwoKTogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGFuIG9iamVjdCB0aGF0IGFsbG93cyB0byByZXRyaWV2ZSBjb21wb25lbnQgbWV0YWRhdGEuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiBUaGUgZXhhbXBsZSBiZWxvdyBkZW1vbnN0cmF0ZXMgaG93IHRvIHVzZSB0aGUgZnVuY3Rpb24gYW5kIGhvdyB0aGUgZmllbGRzXG4gKiBvZiB0aGUgcmV0dXJuZWQgb2JqZWN0IG1hcCB0byB0aGUgY29tcG9uZW50IG1ldGFkYXRhLlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIEBDb21wb25lbnQoe1xuICogICBzdGFuZGFsb25lOiB0cnVlLFxuICogICBzZWxlY3RvcjogJ2Zvby1jb21wb25lbnQnLFxuICogICB0ZW1wbGF0ZTogYFxuICogICAgIDxuZy1jb250ZW50PjwvbmctY29udGVudD5cbiAqICAgICA8bmctY29udGVudCBzZWxlY3Q9XCJjb250ZW50LXNlbGVjdG9yLWFcIj48L25nLWNvbnRlbnQ+XG4gKiAgIGAsXG4gKiB9KVxuICogY2xhc3MgRm9vQ29tcG9uZW50IHtcbiAqICAgQElucHV0KCdpbnB1dE5hbWUnKSBpbnB1dFByb3BOYW1lOiBzdHJpbmc7XG4gKiAgIEBPdXRwdXQoJ291dHB1dE5hbWUnKSBvdXRwdXRQcm9wTmFtZSA9IG5ldyBFdmVudEVtaXR0ZXI8dm9pZD4oKTtcbiAqIH1cbiAqXG4gKiBjb25zdCBtaXJyb3IgPSByZWZsZWN0Q29tcG9uZW50VHlwZShGb29Db21wb25lbnQpO1xuICogZXhwZWN0KG1pcnJvci50eXBlKS50b0JlKEZvb0NvbXBvbmVudCk7XG4gKiBleHBlY3QobWlycm9yLnNlbGVjdG9yKS50b0JlKCdmb28tY29tcG9uZW50Jyk7XG4gKiBleHBlY3QobWlycm9yLmlzU3RhbmRhbG9uZSkudG9CZSh0cnVlKTtcbiAqIGV4cGVjdChtaXJyb3IuaW5wdXRzKS50b0VxdWFsKFt7cHJvcE5hbWU6ICdpbnB1dE5hbWUnLCB0ZW1wbGF0ZU5hbWU6ICdpbnB1dFByb3BOYW1lJ31dKTtcbiAqIGV4cGVjdChtaXJyb3Iub3V0cHV0cykudG9FcXVhbChbe3Byb3BOYW1lOiAnb3V0cHV0TmFtZScsIHRlbXBsYXRlTmFtZTogJ291dHB1dFByb3BOYW1lJ31dKTtcbiAqIGV4cGVjdChtaXJyb3IubmdDb250ZW50U2VsZWN0b3JzKS50b0VxdWFsKFtcbiAqICAgJyonLCAgICAgICAgICAgICAgICAgLy8gZmlyc3QgYDxuZy1jb250ZW50PmAgaW4gYSB0ZW1wbGF0ZSwgdGhlIHNlbGVjdG9yIGRlZmF1bHRzIHRvIGAqYFxuICogICAnY29udGVudC1zZWxlY3Rvci1hJyAvLyBzZWNvbmQgYDxuZy1jb250ZW50PmAgaW4gYSB0ZW1wbGF0ZVxuICogXSk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gY29tcG9uZW50IENvbXBvbmVudCBjbGFzcyByZWZlcmVuY2UuXG4gKiBAcmV0dXJucyBBbiBvYmplY3QgdGhhdCBhbGxvd3MgdG8gcmV0cmlldmUgY29tcG9uZW50IG1ldGFkYXRhLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlZmxlY3RDb21wb25lbnRUeXBlPEM+KGNvbXBvbmVudDogVHlwZTxDPik6IENvbXBvbmVudE1pcnJvcjxDPiB8IG51bGwge1xuICBjb25zdCBjb21wb25lbnREZWYgPSBnZXRDb21wb25lbnREZWYoY29tcG9uZW50KTtcbiAgaWYgKCFjb21wb25lbnREZWYpIHJldHVybiBudWxsO1xuXG4gIGNvbnN0IGZhY3RvcnkgPSBuZXcgQ29tcG9uZW50RmFjdG9yeTxDPihjb21wb25lbnREZWYpO1xuICByZXR1cm4ge1xuICAgIGdldCBzZWxlY3RvcigpOiBzdHJpbmcge1xuICAgICAgcmV0dXJuIGZhY3Rvcnkuc2VsZWN0b3I7XG4gICAgfSxcbiAgICBnZXQgdHlwZSgpOiBUeXBlPEM+IHtcbiAgICAgIHJldHVybiBmYWN0b3J5LmNvbXBvbmVudFR5cGU7XG4gICAgfSxcbiAgICBnZXQgaW5wdXRzKCk6IFJlYWRvbmx5QXJyYXk8e1xuICAgICAgcHJvcE5hbWU6IHN0cmluZztcbiAgICAgIHRlbXBsYXRlTmFtZTogc3RyaW5nO1xuICAgICAgdHJhbnNmb3JtPzogKHZhbHVlOiBhbnkpID0+IGFueTtcbiAgICAgIGlzU2lnbmFsOiBib29sZWFuO1xuICAgIH0+IHtcbiAgICAgIHJldHVybiBmYWN0b3J5LmlucHV0cztcbiAgICB9LFxuICAgIGdldCBvdXRwdXRzKCk6IFJlYWRvbmx5QXJyYXk8e3Byb3BOYW1lOiBzdHJpbmc7IHRlbXBsYXRlTmFtZTogc3RyaW5nfT4ge1xuICAgICAgcmV0dXJuIGZhY3Rvcnkub3V0cHV0cztcbiAgICB9LFxuICAgIGdldCBuZ0NvbnRlbnRTZWxlY3RvcnMoKTogUmVhZG9ubHlBcnJheTxzdHJpbmc+IHtcbiAgICAgIHJldHVybiBmYWN0b3J5Lm5nQ29udGVudFNlbGVjdG9ycztcbiAgICB9LFxuICAgIGdldCBpc1N0YW5kYWxvbmUoKTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gY29tcG9uZW50RGVmLnN0YW5kYWxvbmU7XG4gICAgfSxcbiAgICBnZXQgaXNTaWduYWwoKTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gY29tcG9uZW50RGVmLnNpZ25hbHM7XG4gICAgfSxcbiAgfTtcbn1cbiJdfQ==