/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { noSideEffects } from '../util/closure';
/**
 * The name of a field that Angular monkey-patches onto a component
 * class to store a function that loads defer-loadable dependencies
 * and applies metadata to a class.
 */
const ASYNC_COMPONENT_METADATA_FN = '__ngAsyncComponentMetadataFn__';
/**
 * If a given component has unresolved async metadata - returns a reference
 * to a function that applies component metadata after resolving defer-loadable
 * dependencies. Otherwise - this function returns `null`.
 */
export function getAsyncClassMetadataFn(type) {
    const componentClass = type; // cast to `any`, so that we can read a monkey-patched field
    return componentClass[ASYNC_COMPONENT_METADATA_FN] ?? null;
}
/**
 * Handles the process of applying metadata info to a component class in case
 * component template has defer blocks (thus some dependencies became deferrable).
 *
 * @param type Component class where metadata should be added
 * @param dependencyLoaderFn Function that loads dependencies
 * @param metadataSetterFn Function that forms a scope in which the `setClassMetadata` is invoked
 */
export function setClassMetadataAsync(type, dependencyLoaderFn, metadataSetterFn) {
    const componentClass = type; // cast to `any`, so that we can monkey-patch it
    componentClass[ASYNC_COMPONENT_METADATA_FN] = () => Promise.all(dependencyLoaderFn()).then((dependencies) => {
        metadataSetterFn(...dependencies);
        // Metadata is now set, reset field value to indicate that this component
        // can by used/compiled synchronously.
        componentClass[ASYNC_COMPONENT_METADATA_FN] = null;
        return dependencies;
    });
    return componentClass[ASYNC_COMPONENT_METADATA_FN];
}
/**
 * Adds decorator, constructor, and property metadata to a given type via static metadata fields
 * on the type.
 *
 * These metadata fields can later be read with Angular's `ReflectionCapabilities` API.
 *
 * Calls to `setClassMetadata` can be guarded by ngDevMode, resulting in the metadata assignments
 * being tree-shaken away during production builds.
 */
export function setClassMetadata(type, decorators, ctorParameters, propDecorators) {
    return noSideEffects(() => {
        const clazz = type;
        if (decorators !== null) {
            if (clazz.hasOwnProperty('decorators') && clazz.decorators !== undefined) {
                clazz.decorators.push(...decorators);
            }
            else {
                clazz.decorators = decorators;
            }
        }
        if (ctorParameters !== null) {
            // Rather than merging, clobber the existing parameters. If other projects exist which
            // use tsickle-style annotations and reflect over them in the same way, this could
            // cause issues, but that is vanishingly unlikely.
            clazz.ctorParameters = ctorParameters;
        }
        if (propDecorators !== null) {
            // The property decorator objects are merged as it is possible different fields have
            // different decorator types. Decorators on individual fields are not merged, as it's
            // also incredibly unlikely that a field will be decorated both with an Angular
            // decorator and a non-Angular decorator that's also been downleveled.
            if (clazz.hasOwnProperty('propDecorators') && clazz.propDecorators !== undefined) {
                clazz.propDecorators = { ...clazz.propDecorators, ...propDecorators };
            }
            else {
                clazz.propDecorators = propDecorators;
            }
        }
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YWRhdGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9yZW5kZXIzL21ldGFkYXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUdILE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQVE5Qzs7OztHQUlHO0FBQ0gsTUFBTSwyQkFBMkIsR0FBRyxnQ0FBZ0MsQ0FBQztBQUVyRTs7OztHQUlHO0FBQ0gsTUFBTSxVQUFVLHVCQUF1QixDQUNyQyxJQUFtQjtJQUVuQixNQUFNLGNBQWMsR0FBRyxJQUFXLENBQUMsQ0FBQyw0REFBNEQ7SUFDaEcsT0FBTyxjQUFjLENBQUMsMkJBQTJCLENBQUMsSUFBSSxJQUFJLENBQUM7QUFDN0QsQ0FBQztBQUVEOzs7Ozs7O0dBT0c7QUFDSCxNQUFNLFVBQVUscUJBQXFCLENBQ25DLElBQWUsRUFDZixrQkFBdUQsRUFDdkQsZ0JBQXFEO0lBRXJELE1BQU0sY0FBYyxHQUFHLElBQVcsQ0FBQyxDQUFDLGdEQUFnRDtJQUNwRixjQUFjLENBQUMsMkJBQTJCLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FDakQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsWUFBWSxFQUFFLEVBQUU7UUFDdEQsZ0JBQWdCLENBQUMsR0FBRyxZQUFZLENBQUMsQ0FBQztRQUNsQyx5RUFBeUU7UUFDekUsc0NBQXNDO1FBQ3RDLGNBQWMsQ0FBQywyQkFBMkIsQ0FBQyxHQUFHLElBQUksQ0FBQztRQUVuRCxPQUFPLFlBQVksQ0FBQztJQUN0QixDQUFDLENBQUMsQ0FBQztJQUNMLE9BQU8sY0FBYyxDQUFDLDJCQUEyQixDQUFDLENBQUM7QUFDckQsQ0FBQztBQUVEOzs7Ozs7OztHQVFHO0FBQ0gsTUFBTSxVQUFVLGdCQUFnQixDQUM5QixJQUFlLEVBQ2YsVUFBd0IsRUFDeEIsY0FBb0MsRUFDcEMsY0FBNkM7SUFFN0MsT0FBTyxhQUFhLENBQUMsR0FBRyxFQUFFO1FBQ3hCLE1BQU0sS0FBSyxHQUFHLElBQXdCLENBQUM7UUFFdkMsSUFBSSxVQUFVLEtBQUssSUFBSSxFQUFFLENBQUM7WUFDeEIsSUFBSSxLQUFLLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQyxJQUFJLEtBQUssQ0FBQyxVQUFVLEtBQUssU0FBUyxFQUFFLENBQUM7Z0JBQ3pFLEtBQUssQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsVUFBVSxDQUFDLENBQUM7WUFDdkMsQ0FBQztpQkFBTSxDQUFDO2dCQUNOLEtBQUssQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1lBQ2hDLENBQUM7UUFDSCxDQUFDO1FBQ0QsSUFBSSxjQUFjLEtBQUssSUFBSSxFQUFFLENBQUM7WUFDNUIsc0ZBQXNGO1lBQ3RGLGtGQUFrRjtZQUNsRixrREFBa0Q7WUFDbEQsS0FBSyxDQUFDLGNBQWMsR0FBRyxjQUFjLENBQUM7UUFDeEMsQ0FBQztRQUNELElBQUksY0FBYyxLQUFLLElBQUksRUFBRSxDQUFDO1lBQzVCLG9GQUFvRjtZQUNwRixxRkFBcUY7WUFDckYsK0VBQStFO1lBQy9FLHNFQUFzRTtZQUN0RSxJQUFJLEtBQUssQ0FBQyxjQUFjLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxLQUFLLENBQUMsY0FBYyxLQUFLLFNBQVMsRUFBRSxDQUFDO2dCQUNqRixLQUFLLENBQUMsY0FBYyxHQUFHLEVBQUMsR0FBRyxLQUFLLENBQUMsY0FBYyxFQUFFLEdBQUcsY0FBYyxFQUFDLENBQUM7WUFDdEUsQ0FBQztpQkFBTSxDQUFDO2dCQUNOLEtBQUssQ0FBQyxjQUFjLEdBQUcsY0FBYyxDQUFDO1lBQ3hDLENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQyxDQUFVLENBQUM7QUFDZCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1R5cGV9IGZyb20gJy4uL2ludGVyZmFjZS90eXBlJztcbmltcG9ydCB7bm9TaWRlRWZmZWN0c30gZnJvbSAnLi4vdXRpbC9jbG9zdXJlJztcblxuaW50ZXJmYWNlIFR5cGVXaXRoTWV0YWRhdGEgZXh0ZW5kcyBUeXBlPGFueT4ge1xuICBkZWNvcmF0b3JzPzogYW55W107XG4gIGN0b3JQYXJhbWV0ZXJzPzogKCkgPT4gYW55W107XG4gIHByb3BEZWNvcmF0b3JzPzoge1tmaWVsZDogc3RyaW5nXTogYW55fTtcbn1cblxuLyoqXG4gKiBUaGUgbmFtZSBvZiBhIGZpZWxkIHRoYXQgQW5ndWxhciBtb25rZXktcGF0Y2hlcyBvbnRvIGEgY29tcG9uZW50XG4gKiBjbGFzcyB0byBzdG9yZSBhIGZ1bmN0aW9uIHRoYXQgbG9hZHMgZGVmZXItbG9hZGFibGUgZGVwZW5kZW5jaWVzXG4gKiBhbmQgYXBwbGllcyBtZXRhZGF0YSB0byBhIGNsYXNzLlxuICovXG5jb25zdCBBU1lOQ19DT01QT05FTlRfTUVUQURBVEFfRk4gPSAnX19uZ0FzeW5jQ29tcG9uZW50TWV0YWRhdGFGbl9fJztcblxuLyoqXG4gKiBJZiBhIGdpdmVuIGNvbXBvbmVudCBoYXMgdW5yZXNvbHZlZCBhc3luYyBtZXRhZGF0YSAtIHJldHVybnMgYSByZWZlcmVuY2VcbiAqIHRvIGEgZnVuY3Rpb24gdGhhdCBhcHBsaWVzIGNvbXBvbmVudCBtZXRhZGF0YSBhZnRlciByZXNvbHZpbmcgZGVmZXItbG9hZGFibGVcbiAqIGRlcGVuZGVuY2llcy4gT3RoZXJ3aXNlIC0gdGhpcyBmdW5jdGlvbiByZXR1cm5zIGBudWxsYC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEFzeW5jQ2xhc3NNZXRhZGF0YUZuKFxuICB0eXBlOiBUeXBlPHVua25vd24+LFxuKTogKCgpID0+IFByb21pc2U8QXJyYXk8VHlwZTx1bmtub3duPj4+KSB8IG51bGwge1xuICBjb25zdCBjb21wb25lbnRDbGFzcyA9IHR5cGUgYXMgYW55OyAvLyBjYXN0IHRvIGBhbnlgLCBzbyB0aGF0IHdlIGNhbiByZWFkIGEgbW9ua2V5LXBhdGNoZWQgZmllbGRcbiAgcmV0dXJuIGNvbXBvbmVudENsYXNzW0FTWU5DX0NPTVBPTkVOVF9NRVRBREFUQV9GTl0gPz8gbnVsbDtcbn1cblxuLyoqXG4gKiBIYW5kbGVzIHRoZSBwcm9jZXNzIG9mIGFwcGx5aW5nIG1ldGFkYXRhIGluZm8gdG8gYSBjb21wb25lbnQgY2xhc3MgaW4gY2FzZVxuICogY29tcG9uZW50IHRlbXBsYXRlIGhhcyBkZWZlciBibG9ja3MgKHRodXMgc29tZSBkZXBlbmRlbmNpZXMgYmVjYW1lIGRlZmVycmFibGUpLlxuICpcbiAqIEBwYXJhbSB0eXBlIENvbXBvbmVudCBjbGFzcyB3aGVyZSBtZXRhZGF0YSBzaG91bGQgYmUgYWRkZWRcbiAqIEBwYXJhbSBkZXBlbmRlbmN5TG9hZGVyRm4gRnVuY3Rpb24gdGhhdCBsb2FkcyBkZXBlbmRlbmNpZXNcbiAqIEBwYXJhbSBtZXRhZGF0YVNldHRlckZuIEZ1bmN0aW9uIHRoYXQgZm9ybXMgYSBzY29wZSBpbiB3aGljaCB0aGUgYHNldENsYXNzTWV0YWRhdGFgIGlzIGludm9rZWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldENsYXNzTWV0YWRhdGFBc3luYyhcbiAgdHlwZTogVHlwZTxhbnk+LFxuICBkZXBlbmRlbmN5TG9hZGVyRm46ICgpID0+IEFycmF5PFByb21pc2U8VHlwZTx1bmtub3duPj4+LFxuICBtZXRhZGF0YVNldHRlckZuOiAoLi4udHlwZXM6IFR5cGU8dW5rbm93bj5bXSkgPT4gdm9pZCxcbik6ICgpID0+IFByb21pc2U8QXJyYXk8VHlwZTx1bmtub3duPj4+IHtcbiAgY29uc3QgY29tcG9uZW50Q2xhc3MgPSB0eXBlIGFzIGFueTsgLy8gY2FzdCB0byBgYW55YCwgc28gdGhhdCB3ZSBjYW4gbW9ua2V5LXBhdGNoIGl0XG4gIGNvbXBvbmVudENsYXNzW0FTWU5DX0NPTVBPTkVOVF9NRVRBREFUQV9GTl0gPSAoKSA9PlxuICAgIFByb21pc2UuYWxsKGRlcGVuZGVuY3lMb2FkZXJGbigpKS50aGVuKChkZXBlbmRlbmNpZXMpID0+IHtcbiAgICAgIG1ldGFkYXRhU2V0dGVyRm4oLi4uZGVwZW5kZW5jaWVzKTtcbiAgICAgIC8vIE1ldGFkYXRhIGlzIG5vdyBzZXQsIHJlc2V0IGZpZWxkIHZhbHVlIHRvIGluZGljYXRlIHRoYXQgdGhpcyBjb21wb25lbnRcbiAgICAgIC8vIGNhbiBieSB1c2VkL2NvbXBpbGVkIHN5bmNocm9ub3VzbHkuXG4gICAgICBjb21wb25lbnRDbGFzc1tBU1lOQ19DT01QT05FTlRfTUVUQURBVEFfRk5dID0gbnVsbDtcblxuICAgICAgcmV0dXJuIGRlcGVuZGVuY2llcztcbiAgICB9KTtcbiAgcmV0dXJuIGNvbXBvbmVudENsYXNzW0FTWU5DX0NPTVBPTkVOVF9NRVRBREFUQV9GTl07XG59XG5cbi8qKlxuICogQWRkcyBkZWNvcmF0b3IsIGNvbnN0cnVjdG9yLCBhbmQgcHJvcGVydHkgbWV0YWRhdGEgdG8gYSBnaXZlbiB0eXBlIHZpYSBzdGF0aWMgbWV0YWRhdGEgZmllbGRzXG4gKiBvbiB0aGUgdHlwZS5cbiAqXG4gKiBUaGVzZSBtZXRhZGF0YSBmaWVsZHMgY2FuIGxhdGVyIGJlIHJlYWQgd2l0aCBBbmd1bGFyJ3MgYFJlZmxlY3Rpb25DYXBhYmlsaXRpZXNgIEFQSS5cbiAqXG4gKiBDYWxscyB0byBgc2V0Q2xhc3NNZXRhZGF0YWAgY2FuIGJlIGd1YXJkZWQgYnkgbmdEZXZNb2RlLCByZXN1bHRpbmcgaW4gdGhlIG1ldGFkYXRhIGFzc2lnbm1lbnRzXG4gKiBiZWluZyB0cmVlLXNoYWtlbiBhd2F5IGR1cmluZyBwcm9kdWN0aW9uIGJ1aWxkcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldENsYXNzTWV0YWRhdGEoXG4gIHR5cGU6IFR5cGU8YW55PixcbiAgZGVjb3JhdG9yczogYW55W10gfCBudWxsLFxuICBjdG9yUGFyYW1ldGVyczogKCgpID0+IGFueVtdKSB8IG51bGwsXG4gIHByb3BEZWNvcmF0b3JzOiB7W2ZpZWxkOiBzdHJpbmddOiBhbnl9IHwgbnVsbCxcbik6IHZvaWQge1xuICByZXR1cm4gbm9TaWRlRWZmZWN0cygoKSA9PiB7XG4gICAgY29uc3QgY2xhenogPSB0eXBlIGFzIFR5cGVXaXRoTWV0YWRhdGE7XG5cbiAgICBpZiAoZGVjb3JhdG9ycyAhPT0gbnVsbCkge1xuICAgICAgaWYgKGNsYXp6Lmhhc093blByb3BlcnR5KCdkZWNvcmF0b3JzJykgJiYgY2xhenouZGVjb3JhdG9ycyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNsYXp6LmRlY29yYXRvcnMucHVzaCguLi5kZWNvcmF0b3JzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNsYXp6LmRlY29yYXRvcnMgPSBkZWNvcmF0b3JzO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoY3RvclBhcmFtZXRlcnMgIT09IG51bGwpIHtcbiAgICAgIC8vIFJhdGhlciB0aGFuIG1lcmdpbmcsIGNsb2JiZXIgdGhlIGV4aXN0aW5nIHBhcmFtZXRlcnMuIElmIG90aGVyIHByb2plY3RzIGV4aXN0IHdoaWNoXG4gICAgICAvLyB1c2UgdHNpY2tsZS1zdHlsZSBhbm5vdGF0aW9ucyBhbmQgcmVmbGVjdCBvdmVyIHRoZW0gaW4gdGhlIHNhbWUgd2F5LCB0aGlzIGNvdWxkXG4gICAgICAvLyBjYXVzZSBpc3N1ZXMsIGJ1dCB0aGF0IGlzIHZhbmlzaGluZ2x5IHVubGlrZWx5LlxuICAgICAgY2xhenouY3RvclBhcmFtZXRlcnMgPSBjdG9yUGFyYW1ldGVycztcbiAgICB9XG4gICAgaWYgKHByb3BEZWNvcmF0b3JzICE9PSBudWxsKSB7XG4gICAgICAvLyBUaGUgcHJvcGVydHkgZGVjb3JhdG9yIG9iamVjdHMgYXJlIG1lcmdlZCBhcyBpdCBpcyBwb3NzaWJsZSBkaWZmZXJlbnQgZmllbGRzIGhhdmVcbiAgICAgIC8vIGRpZmZlcmVudCBkZWNvcmF0b3IgdHlwZXMuIERlY29yYXRvcnMgb24gaW5kaXZpZHVhbCBmaWVsZHMgYXJlIG5vdCBtZXJnZWQsIGFzIGl0J3NcbiAgICAgIC8vIGFsc28gaW5jcmVkaWJseSB1bmxpa2VseSB0aGF0IGEgZmllbGQgd2lsbCBiZSBkZWNvcmF0ZWQgYm90aCB3aXRoIGFuIEFuZ3VsYXJcbiAgICAgIC8vIGRlY29yYXRvciBhbmQgYSBub24tQW5ndWxhciBkZWNvcmF0b3IgdGhhdCdzIGFsc28gYmVlbiBkb3dubGV2ZWxlZC5cbiAgICAgIGlmIChjbGF6ei5oYXNPd25Qcm9wZXJ0eSgncHJvcERlY29yYXRvcnMnKSAmJiBjbGF6ei5wcm9wRGVjb3JhdG9ycyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNsYXp6LnByb3BEZWNvcmF0b3JzID0gey4uLmNsYXp6LnByb3BEZWNvcmF0b3JzLCAuLi5wcm9wRGVjb3JhdG9yc307XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjbGF6ei5wcm9wRGVjb3JhdG9ycyA9IHByb3BEZWNvcmF0b3JzO1xuICAgICAgfVxuICAgIH1cbiAgfSkgYXMgbmV2ZXI7XG59XG4iXX0=