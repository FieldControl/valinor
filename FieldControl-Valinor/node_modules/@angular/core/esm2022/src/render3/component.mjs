/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
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
 * const host = document.getElementById('hello-component-host');
 *
 * // Get an `EnvironmentInjector` instance from the `ApplicationRef`.
 * const environmentInjector = applicationRef.injector;
 *
 * // We can now create a `ComponentRef` instance.
 * const componentRef = createComponent(HelloComponent, {host, environmentInjector});
 *
 * // Last step is to register the newly created ref using the `ApplicationRef` instance
 * // to include the component view into change detection cycles.
 * applicationRef.attachView(componentRef.hostView);
 * ```
 *
 * @param component Component class reference.
 * @param options Set of options to use:
 *  * `environmentInjector`: An `EnvironmentInjector` instance to be used for the component, see
 * additional info about it [here](/guide/standalone-components#environment-injectors).
 *  * `hostElement` (optional): A DOM node that should act as a host node for the component. If not
 * provided, Angular creates one based on the tag name used in the component selector (and falls
 * back to using `div` if selector doesn't have tag name info).
 *  * `elementInjector` (optional): An `ElementInjector` instance, see additional info about it
 * [here](/guide/hierarchical-dependency-injection#elementinjector).
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvcmVuZGVyMy9jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBR0gsT0FBTyxFQUFzQixlQUFlLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUl2RSxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUNqRCxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sY0FBYyxDQUFDO0FBQzdDLE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUU1Qzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTBERztBQUNILE1BQU0sVUFBVSxlQUFlLENBQUksU0FBa0IsRUFBRSxPQUt0RDtJQUNDLFNBQVMsSUFBSSxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUMzQyxNQUFNLFlBQVksR0FBRyxlQUFlLENBQUMsU0FBUyxDQUFFLENBQUM7SUFDakQsTUFBTSxlQUFlLEdBQUcsT0FBTyxDQUFDLGVBQWUsSUFBSSxlQUFlLEVBQUUsQ0FBQztJQUNyRSxNQUFNLE9BQU8sR0FBRyxJQUFJLGdCQUFnQixDQUFJLFlBQVksQ0FBQyxDQUFDO0lBQ3RELE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FDakIsZUFBZSxFQUFFLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRSxPQUFPLENBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0FBQ25HLENBQUM7QUE2Q0Q7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBc0NHO0FBQ0gsTUFBTSxVQUFVLG9CQUFvQixDQUFJLFNBQWtCO0lBQ3hELE1BQU0sWUFBWSxHQUFHLGVBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNoRCxJQUFJLENBQUMsWUFBWTtRQUFFLE9BQU8sSUFBSSxDQUFDO0lBRS9CLE1BQU0sT0FBTyxHQUFHLElBQUksZ0JBQWdCLENBQUksWUFBWSxDQUFDLENBQUM7SUFDdEQsT0FBTztRQUNMLElBQUksUUFBUTtZQUNWLE9BQU8sT0FBTyxDQUFDLFFBQVEsQ0FBQztRQUMxQixDQUFDO1FBQ0QsSUFBSSxJQUFJO1lBQ04sT0FBTyxPQUFPLENBQUMsYUFBYSxDQUFDO1FBQy9CLENBQUM7UUFDRCxJQUFJLE1BQU07WUFLUixPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUM7UUFDeEIsQ0FBQztRQUNELElBQUksT0FBTztZQUNULE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQztRQUN6QixDQUFDO1FBQ0QsSUFBSSxrQkFBa0I7WUFDcEIsT0FBTyxPQUFPLENBQUMsa0JBQWtCLENBQUM7UUFDcEMsQ0FBQztRQUNELElBQUksWUFBWTtZQUNkLE9BQU8sWUFBWSxDQUFDLFVBQVUsQ0FBQztRQUNqQyxDQUFDO1FBQ0QsSUFBSSxRQUFRO1lBQ1YsT0FBTyxZQUFZLENBQUMsT0FBTyxDQUFDO1FBQzlCLENBQUM7S0FDRixDQUFDO0FBQ0osQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdG9yfSBmcm9tICcuLi9kaS9pbmplY3Rvcic7XG5pbXBvcnQge0Vudmlyb25tZW50SW5qZWN0b3IsIGdldE51bGxJbmplY3Rvcn0gZnJvbSAnLi4vZGkvcjNfaW5qZWN0b3InO1xuaW1wb3J0IHtUeXBlfSBmcm9tICcuLi9pbnRlcmZhY2UvdHlwZSc7XG5pbXBvcnQge0NvbXBvbmVudFJlZn0gZnJvbSAnLi4vbGlua2VyL2NvbXBvbmVudF9mYWN0b3J5JztcblxuaW1wb3J0IHtDb21wb25lbnRGYWN0b3J5fSBmcm9tICcuL2NvbXBvbmVudF9yZWYnO1xuaW1wb3J0IHtnZXRDb21wb25lbnREZWZ9IGZyb20gJy4vZGVmaW5pdGlvbic7XG5pbXBvcnQge2Fzc2VydENvbXBvbmVudERlZn0gZnJvbSAnLi9lcnJvcnMnO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBgQ29tcG9uZW50UmVmYCBpbnN0YW5jZSBiYXNlZCBvbiBwcm92aWRlZCBjb21wb25lbnQgdHlwZSBhbmQgYSBzZXQgb2Ygb3B0aW9ucy5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqIFRoZSBleGFtcGxlIGJlbG93IGRlbW9uc3RyYXRlcyBob3cgdGhlIGBjcmVhdGVDb21wb25lbnRgIGZ1bmN0aW9uIGNhbiBiZSB1c2VkXG4gKiB0byBjcmVhdGUgYW4gaW5zdGFuY2Ugb2YgYSBDb21wb25lbnRSZWYgZHluYW1pY2FsbHkgYW5kIGF0dGFjaCBpdCB0byBhbiBBcHBsaWNhdGlvblJlZixcbiAqIHNvIHRoYXQgaXQgZ2V0cyBpbmNsdWRlZCBpbnRvIGNoYW5nZSBkZXRlY3Rpb24gY3ljbGVzLlxuICpcbiAqIE5vdGU6IHRoZSBleGFtcGxlIHVzZXMgc3RhbmRhbG9uZSBjb21wb25lbnRzLCBidXQgdGhlIGZ1bmN0aW9uIGNhbiBhbHNvIGJlIHVzZWQgZm9yXG4gKiBub24tc3RhbmRhbG9uZSBjb21wb25lbnRzIChkZWNsYXJlZCBpbiBhbiBOZ01vZHVsZSkgYXMgd2VsbC5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc3RhbmRhbG9uZTogdHJ1ZSxcbiAqICAgdGVtcGxhdGU6IGBIZWxsbyB7eyBuYW1lIH19IWBcbiAqIH0pXG4gKiBjbGFzcyBIZWxsb0NvbXBvbmVudCB7XG4gKiAgIG5hbWUgPSAnQW5ndWxhcic7XG4gKiB9XG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgIHN0YW5kYWxvbmU6IHRydWUsXG4gKiAgIHRlbXBsYXRlOiBgPGRpdiBpZD1cImhlbGxvLWNvbXBvbmVudC1ob3N0XCI+PC9kaXY+YFxuICogfSlcbiAqIGNsYXNzIFJvb3RDb21wb25lbnQge31cbiAqXG4gKiAvLyBCb290c3RyYXAgYW4gYXBwbGljYXRpb24uXG4gKiBjb25zdCBhcHBsaWNhdGlvblJlZiA9IGF3YWl0IGJvb3RzdHJhcEFwcGxpY2F0aW9uKFJvb3RDb21wb25lbnQpO1xuICpcbiAqIC8vIExvY2F0ZSBhIERPTSBub2RlIHRoYXQgd291bGQgYmUgdXNlZCBhcyBhIGhvc3QuXG4gKiBjb25zdCBob3N0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2hlbGxvLWNvbXBvbmVudC1ob3N0Jyk7XG4gKlxuICogLy8gR2V0IGFuIGBFbnZpcm9ubWVudEluamVjdG9yYCBpbnN0YW5jZSBmcm9tIHRoZSBgQXBwbGljYXRpb25SZWZgLlxuICogY29uc3QgZW52aXJvbm1lbnRJbmplY3RvciA9IGFwcGxpY2F0aW9uUmVmLmluamVjdG9yO1xuICpcbiAqIC8vIFdlIGNhbiBub3cgY3JlYXRlIGEgYENvbXBvbmVudFJlZmAgaW5zdGFuY2UuXG4gKiBjb25zdCBjb21wb25lbnRSZWYgPSBjcmVhdGVDb21wb25lbnQoSGVsbG9Db21wb25lbnQsIHtob3N0LCBlbnZpcm9ubWVudEluamVjdG9yfSk7XG4gKlxuICogLy8gTGFzdCBzdGVwIGlzIHRvIHJlZ2lzdGVyIHRoZSBuZXdseSBjcmVhdGVkIHJlZiB1c2luZyB0aGUgYEFwcGxpY2F0aW9uUmVmYCBpbnN0YW5jZVxuICogLy8gdG8gaW5jbHVkZSB0aGUgY29tcG9uZW50IHZpZXcgaW50byBjaGFuZ2UgZGV0ZWN0aW9uIGN5Y2xlcy5cbiAqIGFwcGxpY2F0aW9uUmVmLmF0dGFjaFZpZXcoY29tcG9uZW50UmVmLmhvc3RWaWV3KTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBjb21wb25lbnQgQ29tcG9uZW50IGNsYXNzIHJlZmVyZW5jZS5cbiAqIEBwYXJhbSBvcHRpb25zIFNldCBvZiBvcHRpb25zIHRvIHVzZTpcbiAqICAqIGBlbnZpcm9ubWVudEluamVjdG9yYDogQW4gYEVudmlyb25tZW50SW5qZWN0b3JgIGluc3RhbmNlIHRvIGJlIHVzZWQgZm9yIHRoZSBjb21wb25lbnQsIHNlZVxuICogYWRkaXRpb25hbCBpbmZvIGFib3V0IGl0IFtoZXJlXSgvZ3VpZGUvc3RhbmRhbG9uZS1jb21wb25lbnRzI2Vudmlyb25tZW50LWluamVjdG9ycykuXG4gKiAgKiBgaG9zdEVsZW1lbnRgIChvcHRpb25hbCk6IEEgRE9NIG5vZGUgdGhhdCBzaG91bGQgYWN0IGFzIGEgaG9zdCBub2RlIGZvciB0aGUgY29tcG9uZW50LiBJZiBub3RcbiAqIHByb3ZpZGVkLCBBbmd1bGFyIGNyZWF0ZXMgb25lIGJhc2VkIG9uIHRoZSB0YWcgbmFtZSB1c2VkIGluIHRoZSBjb21wb25lbnQgc2VsZWN0b3IgKGFuZCBmYWxsc1xuICogYmFjayB0byB1c2luZyBgZGl2YCBpZiBzZWxlY3RvciBkb2Vzbid0IGhhdmUgdGFnIG5hbWUgaW5mbykuXG4gKiAgKiBgZWxlbWVudEluamVjdG9yYCAob3B0aW9uYWwpOiBBbiBgRWxlbWVudEluamVjdG9yYCBpbnN0YW5jZSwgc2VlIGFkZGl0aW9uYWwgaW5mbyBhYm91dCBpdFxuICogW2hlcmVdKC9ndWlkZS9oaWVyYXJjaGljYWwtZGVwZW5kZW5jeS1pbmplY3Rpb24jZWxlbWVudGluamVjdG9yKS5cbiAqICAqIGBwcm9qZWN0YWJsZU5vZGVzYCAob3B0aW9uYWwpOiBBIGxpc3Qgb2YgRE9NIG5vZGVzIHRoYXQgc2hvdWxkIGJlIHByb2plY3RlZCB0aHJvdWdoXG4gKiAgICAgICAgICAgICAgICAgICAgICBbYDxuZy1jb250ZW50PmBdKGFwaS9jb3JlL25nLWNvbnRlbnQpIG9mIHRoZSBuZXcgY29tcG9uZW50IGluc3RhbmNlLlxuICogQHJldHVybnMgQ29tcG9uZW50UmVmIGluc3RhbmNlIHRoYXQgcmVwcmVzZW50cyBhIGdpdmVuIENvbXBvbmVudC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVDb21wb25lbnQ8Qz4oY29tcG9uZW50OiBUeXBlPEM+LCBvcHRpb25zOiB7XG4gIGVudmlyb25tZW50SW5qZWN0b3I6IEVudmlyb25tZW50SW5qZWN0b3IsXG4gIGhvc3RFbGVtZW50PzogRWxlbWVudCxcbiAgZWxlbWVudEluamVjdG9yPzogSW5qZWN0b3IsXG4gIHByb2plY3RhYmxlTm9kZXM/OiBOb2RlW11bXSxcbn0pOiBDb21wb25lbnRSZWY8Qz4ge1xuICBuZ0Rldk1vZGUgJiYgYXNzZXJ0Q29tcG9uZW50RGVmKGNvbXBvbmVudCk7XG4gIGNvbnN0IGNvbXBvbmVudERlZiA9IGdldENvbXBvbmVudERlZihjb21wb25lbnQpITtcbiAgY29uc3QgZWxlbWVudEluamVjdG9yID0gb3B0aW9ucy5lbGVtZW50SW5qZWN0b3IgfHwgZ2V0TnVsbEluamVjdG9yKCk7XG4gIGNvbnN0IGZhY3RvcnkgPSBuZXcgQ29tcG9uZW50RmFjdG9yeTxDPihjb21wb25lbnREZWYpO1xuICByZXR1cm4gZmFjdG9yeS5jcmVhdGUoXG4gICAgICBlbGVtZW50SW5qZWN0b3IsIG9wdGlvbnMucHJvamVjdGFibGVOb2Rlcywgb3B0aW9ucy5ob3N0RWxlbWVudCwgb3B0aW9ucy5lbnZpcm9ubWVudEluamVjdG9yKTtcbn1cblxuLyoqXG4gKiBBbiBpbnRlcmZhY2UgdGhhdCBkZXNjcmliZXMgdGhlIHN1YnNldCBvZiBjb21wb25lbnQgbWV0YWRhdGFcbiAqIHRoYXQgY2FuIGJlIHJldHJpZXZlZCB1c2luZyB0aGUgYHJlZmxlY3RDb21wb25lbnRUeXBlYCBmdW5jdGlvbi5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ29tcG9uZW50TWlycm9yPEM+IHtcbiAgLyoqXG4gICAqIFRoZSBjb21wb25lbnQncyBIVE1MIHNlbGVjdG9yLlxuICAgKi9cbiAgZ2V0IHNlbGVjdG9yKCk6IHN0cmluZztcbiAgLyoqXG4gICAqIFRoZSB0eXBlIG9mIGNvbXBvbmVudCB0aGUgZmFjdG9yeSB3aWxsIGNyZWF0ZS5cbiAgICovXG4gIGdldCB0eXBlKCk6IFR5cGU8Qz47XG4gIC8qKlxuICAgKiBUaGUgaW5wdXRzIG9mIHRoZSBjb21wb25lbnQuXG4gICAqL1xuICBnZXQgaW5wdXRzKCk6IFJlYWRvbmx5QXJyYXk8e1xuICAgIHJlYWRvbmx5IHByb3BOYW1lOiBzdHJpbmcsXG4gICAgcmVhZG9ubHkgdGVtcGxhdGVOYW1lOiBzdHJpbmcsXG4gICAgcmVhZG9ubHkgdHJhbnNmb3JtPzogKHZhbHVlOiBhbnkpID0+IGFueSxcbiAgfT47XG4gIC8qKlxuICAgKiBUaGUgb3V0cHV0cyBvZiB0aGUgY29tcG9uZW50LlxuICAgKi9cbiAgZ2V0IG91dHB1dHMoKTogUmVhZG9ubHlBcnJheTx7cmVhZG9ubHkgcHJvcE5hbWU6IHN0cmluZywgcmVhZG9ubHkgdGVtcGxhdGVOYW1lOiBzdHJpbmd9PjtcbiAgLyoqXG4gICAqIFNlbGVjdG9yIGZvciBhbGwgPG5nLWNvbnRlbnQ+IGVsZW1lbnRzIGluIHRoZSBjb21wb25lbnQuXG4gICAqL1xuICBnZXQgbmdDb250ZW50U2VsZWN0b3JzKCk6IFJlYWRvbmx5QXJyYXk8c3RyaW5nPjtcbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhpcyBjb21wb25lbnQgaXMgbWFya2VkIGFzIHN0YW5kYWxvbmUuXG4gICAqIE5vdGU6IGFuIGV4dHJhIGZsYWcsIG5vdCBwcmVzZW50IGluIGBDb21wb25lbnRGYWN0b3J5YC5cbiAgICovXG4gIGdldCBpc1N0YW5kYWxvbmUoKTogYm9vbGVhbjtcbiAgLyoqXG4gICAqIC8vIFRPRE8oc2lnbmFscyk6IFJlbW92ZSBpbnRlcm5hbCBhbmQgYWRkIHB1YmxpYyBkb2N1bWVudGF0aW9uXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgZ2V0IGlzU2lnbmFsKCk6IGJvb2xlYW47XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBvYmplY3QgdGhhdCBhbGxvd3MgdG8gcmV0cmlldmUgY29tcG9uZW50IG1ldGFkYXRhLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogVGhlIGV4YW1wbGUgYmVsb3cgZGVtb25zdHJhdGVzIGhvdyB0byB1c2UgdGhlIGZ1bmN0aW9uIGFuZCBob3cgdGhlIGZpZWxkc1xuICogb2YgdGhlIHJldHVybmVkIG9iamVjdCBtYXAgdG8gdGhlIGNvbXBvbmVudCBtZXRhZGF0YS5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc3RhbmRhbG9uZTogdHJ1ZSxcbiAqICAgc2VsZWN0b3I6ICdmb28tY29tcG9uZW50JyxcbiAqICAgdGVtcGxhdGU6IGBcbiAqICAgICA8bmctY29udGVudD48L25nLWNvbnRlbnQ+XG4gKiAgICAgPG5nLWNvbnRlbnQgc2VsZWN0PVwiY29udGVudC1zZWxlY3Rvci1hXCI+PC9uZy1jb250ZW50PlxuICogICBgLFxuICogfSlcbiAqIGNsYXNzIEZvb0NvbXBvbmVudCB7XG4gKiAgIEBJbnB1dCgnaW5wdXROYW1lJykgaW5wdXRQcm9wTmFtZTogc3RyaW5nO1xuICogICBAT3V0cHV0KCdvdXRwdXROYW1lJykgb3V0cHV0UHJvcE5hbWUgPSBuZXcgRXZlbnRFbWl0dGVyPHZvaWQ+KCk7XG4gKiB9XG4gKlxuICogY29uc3QgbWlycm9yID0gcmVmbGVjdENvbXBvbmVudFR5cGUoRm9vQ29tcG9uZW50KTtcbiAqIGV4cGVjdChtaXJyb3IudHlwZSkudG9CZShGb29Db21wb25lbnQpO1xuICogZXhwZWN0KG1pcnJvci5zZWxlY3RvcikudG9CZSgnZm9vLWNvbXBvbmVudCcpO1xuICogZXhwZWN0KG1pcnJvci5pc1N0YW5kYWxvbmUpLnRvQmUodHJ1ZSk7XG4gKiBleHBlY3QobWlycm9yLmlucHV0cykudG9FcXVhbChbe3Byb3BOYW1lOiAnaW5wdXROYW1lJywgdGVtcGxhdGVOYW1lOiAnaW5wdXRQcm9wTmFtZSd9XSk7XG4gKiBleHBlY3QobWlycm9yLm91dHB1dHMpLnRvRXF1YWwoW3twcm9wTmFtZTogJ291dHB1dE5hbWUnLCB0ZW1wbGF0ZU5hbWU6ICdvdXRwdXRQcm9wTmFtZSd9XSk7XG4gKiBleHBlY3QobWlycm9yLm5nQ29udGVudFNlbGVjdG9ycykudG9FcXVhbChbXG4gKiAgICcqJywgICAgICAgICAgICAgICAgIC8vIGZpcnN0IGA8bmctY29udGVudD5gIGluIGEgdGVtcGxhdGUsIHRoZSBzZWxlY3RvciBkZWZhdWx0cyB0byBgKmBcbiAqICAgJ2NvbnRlbnQtc2VsZWN0b3ItYScgLy8gc2Vjb25kIGA8bmctY29udGVudD5gIGluIGEgdGVtcGxhdGVcbiAqIF0pO1xuICogYGBgXG4gKlxuICogQHBhcmFtIGNvbXBvbmVudCBDb21wb25lbnQgY2xhc3MgcmVmZXJlbmNlLlxuICogQHJldHVybnMgQW4gb2JqZWN0IHRoYXQgYWxsb3dzIHRvIHJldHJpZXZlIGNvbXBvbmVudCBtZXRhZGF0YS5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZWZsZWN0Q29tcG9uZW50VHlwZTxDPihjb21wb25lbnQ6IFR5cGU8Qz4pOiBDb21wb25lbnRNaXJyb3I8Qz58bnVsbCB7XG4gIGNvbnN0IGNvbXBvbmVudERlZiA9IGdldENvbXBvbmVudERlZihjb21wb25lbnQpO1xuICBpZiAoIWNvbXBvbmVudERlZikgcmV0dXJuIG51bGw7XG5cbiAgY29uc3QgZmFjdG9yeSA9IG5ldyBDb21wb25lbnRGYWN0b3J5PEM+KGNvbXBvbmVudERlZik7XG4gIHJldHVybiB7XG4gICAgZ2V0IHNlbGVjdG9yKCk6IHN0cmluZyB7XG4gICAgICByZXR1cm4gZmFjdG9yeS5zZWxlY3RvcjtcbiAgICB9LFxuICAgIGdldCB0eXBlKCk6IFR5cGU8Qz4ge1xuICAgICAgcmV0dXJuIGZhY3RvcnkuY29tcG9uZW50VHlwZTtcbiAgICB9LFxuICAgIGdldCBpbnB1dHMoKTogUmVhZG9ubHlBcnJheTx7XG4gICAgICBwcm9wTmFtZTogc3RyaW5nLFxuICAgICAgdGVtcGxhdGVOYW1lOiBzdHJpbmcsXG4gICAgICB0cmFuc2Zvcm0/OiAodmFsdWU6IGFueSkgPT4gYW55LFxuICAgIH0+IHtcbiAgICAgIHJldHVybiBmYWN0b3J5LmlucHV0cztcbiAgICB9LFxuICAgIGdldCBvdXRwdXRzKCk6IFJlYWRvbmx5QXJyYXk8e3Byb3BOYW1lOiBzdHJpbmcsIHRlbXBsYXRlTmFtZTogc3RyaW5nfT4ge1xuICAgICAgcmV0dXJuIGZhY3Rvcnkub3V0cHV0cztcbiAgICB9LFxuICAgIGdldCBuZ0NvbnRlbnRTZWxlY3RvcnMoKTogUmVhZG9ubHlBcnJheTxzdHJpbmc+IHtcbiAgICAgIHJldHVybiBmYWN0b3J5Lm5nQ29udGVudFNlbGVjdG9ycztcbiAgICB9LFxuICAgIGdldCBpc1N0YW5kYWxvbmUoKTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gY29tcG9uZW50RGVmLnN0YW5kYWxvbmU7XG4gICAgfSxcbiAgICBnZXQgaXNTaWduYWwoKTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gY29tcG9uZW50RGVmLnNpZ25hbHM7XG4gICAgfSxcbiAgfTtcbn1cbiJdfQ==