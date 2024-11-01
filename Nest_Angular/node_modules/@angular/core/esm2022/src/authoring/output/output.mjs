/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { assertInInjectionContext } from '../../di';
import { OutputEmitterRef } from './output_emitter_ref';
/**
 * The `output` function allows declaration of Angular outputs in
 * directives and components.
 *
 * You can use outputs to emit values to parent directives and component.
 * Parents can subscribe to changes via:
 *
 * - template event bindings. For example, `(myOutput)="doSomething($event)"`
 * - programmatic subscription by using `OutputRef#subscribe`.
 *
 * @usageNotes
 *
 * To use `output()`, import the function from `@angular/core`.
 *
 * ```ts
 * import {output} from '@angular/core';
 * ```
 *
 * Inside your component, introduce a new class member and initialize
 * it with a call to `output`.
 *
 * ```ts
 * @Directive({
 *   ...
 * })
 * export class MyDir {
 *   nameChange = output<string>();    // OutputEmitterRef<string>
 *   onClick    = output();            // OutputEmitterRef<void>
 * }
 * ```
 *
 * You can emit values to consumers of your directive, by using
 * the `emit` method from `OutputEmitterRef`.
 *
 * ```ts
 * updateName(newName: string): void {
 *   this.nameChange.emit(newName);
 * }
 * ```
 *
 * @developerPreview
 * @initializerApiFunction {"showTypesInSignaturePreview": true}
 */
export function output(opts) {
    ngDevMode && assertInInjectionContext(output);
    return new OutputEmitterRef();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3V0cHV0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvYXV0aG9yaW5nL291dHB1dC9vdXRwdXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLHdCQUF3QixFQUFDLE1BQU0sVUFBVSxDQUFDO0FBRWxELE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBV3REOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0EwQ0c7QUFDSCxNQUFNLFVBQVUsTUFBTSxDQUFXLElBQW9CO0lBQ25ELFNBQVMsSUFBSSx3QkFBd0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUM5QyxPQUFPLElBQUksZ0JBQWdCLEVBQUssQ0FBQztBQUNuQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2Fzc2VydEluSW5qZWN0aW9uQ29udGV4dH0gZnJvbSAnLi4vLi4vZGknO1xuXG5pbXBvcnQge091dHB1dEVtaXR0ZXJSZWZ9IGZyb20gJy4vb3V0cHV0X2VtaXR0ZXJfcmVmJztcblxuLyoqXG4gKiBPcHRpb25zIGZvciBkZWNsYXJpbmcgYW4gb3V0cHV0LlxuICpcbiAqIEBkZXZlbG9wZXJQcmV2aWV3XG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgT3V0cHV0T3B0aW9ucyB7XG4gIGFsaWFzPzogc3RyaW5nO1xufVxuXG4vKipcbiAqIFRoZSBgb3V0cHV0YCBmdW5jdGlvbiBhbGxvd3MgZGVjbGFyYXRpb24gb2YgQW5ndWxhciBvdXRwdXRzIGluXG4gKiBkaXJlY3RpdmVzIGFuZCBjb21wb25lbnRzLlxuICpcbiAqIFlvdSBjYW4gdXNlIG91dHB1dHMgdG8gZW1pdCB2YWx1ZXMgdG8gcGFyZW50IGRpcmVjdGl2ZXMgYW5kIGNvbXBvbmVudC5cbiAqIFBhcmVudHMgY2FuIHN1YnNjcmliZSB0byBjaGFuZ2VzIHZpYTpcbiAqXG4gKiAtIHRlbXBsYXRlIGV2ZW50IGJpbmRpbmdzLiBGb3IgZXhhbXBsZSwgYChteU91dHB1dCk9XCJkb1NvbWV0aGluZygkZXZlbnQpXCJgXG4gKiAtIHByb2dyYW1tYXRpYyBzdWJzY3JpcHRpb24gYnkgdXNpbmcgYE91dHB1dFJlZiNzdWJzY3JpYmVgLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogVG8gdXNlIGBvdXRwdXQoKWAsIGltcG9ydCB0aGUgZnVuY3Rpb24gZnJvbSBgQGFuZ3VsYXIvY29yZWAuXG4gKlxuICogYGBgdHNcbiAqIGltcG9ydCB7b3V0cHV0fSBmcm9tICdAYW5ndWxhci9jb3JlJztcbiAqIGBgYFxuICpcbiAqIEluc2lkZSB5b3VyIGNvbXBvbmVudCwgaW50cm9kdWNlIGEgbmV3IGNsYXNzIG1lbWJlciBhbmQgaW5pdGlhbGl6ZVxuICogaXQgd2l0aCBhIGNhbGwgdG8gYG91dHB1dGAuXG4gKlxuICogYGBgdHNcbiAqIEBEaXJlY3RpdmUoe1xuICogICAuLi5cbiAqIH0pXG4gKiBleHBvcnQgY2xhc3MgTXlEaXIge1xuICogICBuYW1lQ2hhbmdlID0gb3V0cHV0PHN0cmluZz4oKTsgICAgLy8gT3V0cHV0RW1pdHRlclJlZjxzdHJpbmc+XG4gKiAgIG9uQ2xpY2sgICAgPSBvdXRwdXQoKTsgICAgICAgICAgICAvLyBPdXRwdXRFbWl0dGVyUmVmPHZvaWQ+XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBZb3UgY2FuIGVtaXQgdmFsdWVzIHRvIGNvbnN1bWVycyBvZiB5b3VyIGRpcmVjdGl2ZSwgYnkgdXNpbmdcbiAqIHRoZSBgZW1pdGAgbWV0aG9kIGZyb20gYE91dHB1dEVtaXR0ZXJSZWZgLlxuICpcbiAqIGBgYHRzXG4gKiB1cGRhdGVOYW1lKG5ld05hbWU6IHN0cmluZyk6IHZvaWQge1xuICogICB0aGlzLm5hbWVDaGFuZ2UuZW1pdChuZXdOYW1lKTtcbiAqIH1cbiAqIGBgYFxuICpcbiAqIEBkZXZlbG9wZXJQcmV2aWV3XG4gKiBAaW5pdGlhbGl6ZXJBcGlGdW5jdGlvbiB7XCJzaG93VHlwZXNJblNpZ25hdHVyZVByZXZpZXdcIjogdHJ1ZX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG91dHB1dDxUID0gdm9pZD4ob3B0cz86IE91dHB1dE9wdGlvbnMpOiBPdXRwdXRFbWl0dGVyUmVmPFQ+IHtcbiAgbmdEZXZNb2RlICYmIGFzc2VydEluSW5qZWN0aW9uQ29udGV4dChvdXRwdXQpO1xuICByZXR1cm4gbmV3IE91dHB1dEVtaXR0ZXJSZWY8VD4oKTtcbn1cbiJdfQ==