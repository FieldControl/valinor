/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { global } from '../util/global';
export * from './compiler_facade_interface';
export function getCompilerFacade(request) {
    const globalNg = global['ng'];
    if (globalNg && globalNg.ɵcompilerFacade) {
        return globalNg.ɵcompilerFacade;
    }
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
        // Log the type as an error so that a developer can easily navigate to the type from the
        // console.
        console.error(`JIT compilation failed for ${request.kind}`, request.type);
        let message = `The ${request.kind} '${request.type.name}' needs to be compiled using the JIT compiler, but '@angular/compiler' is not available.\n\n`;
        if (request.usage === 1 /* JitCompilerUsage.PartialDeclaration */) {
            message += `The ${request.kind} is part of a library that has been partially compiled.\n`;
            message += `However, the Angular Linker has not processed the library such that JIT compilation is used as fallback.\n`;
            message += '\n';
            message += `Ideally, the library is processed using the Angular Linker to become fully AOT compiled.\n`;
        }
        else {
            message += `JIT compilation is discouraged for production use-cases! Consider using AOT mode instead.\n`;
        }
        message += `Alternatively, the JIT compiler should be loaded by bootstrapping using '@angular/platform-browser-dynamic' or '@angular/platform-server',\n`;
        message += `or manually provide the compiler with 'import "@angular/compiler";' before bootstrapping.`;
        throw new Error(message);
    }
    else {
        throw new Error('JIT compiler unavailable');
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGlsZXJfZmFjYWRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvY29tcGlsZXIvY29tcGlsZXJfZmFjYWRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUNILE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUV0QyxjQUFjLDZCQUE2QixDQUFDO0FBYTVDLE1BQU0sVUFBVSxpQkFBaUIsQ0FBQyxPQUFnQztJQUNoRSxNQUFNLFFBQVEsR0FBMkIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3RELElBQUksUUFBUSxJQUFJLFFBQVEsQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUN6QyxPQUFPLFFBQVEsQ0FBQyxlQUFlLENBQUM7SUFDbEMsQ0FBQztJQUVELElBQUksT0FBTyxTQUFTLEtBQUssV0FBVyxJQUFJLFNBQVMsRUFBRSxDQUFDO1FBQ2xELHdGQUF3RjtRQUN4RixXQUFXO1FBQ1gsT0FBTyxDQUFDLEtBQUssQ0FBQyw4QkFBOEIsT0FBTyxDQUFDLElBQUksRUFBRSxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUUxRSxJQUFJLE9BQU8sR0FBRyxPQUFPLE9BQU8sQ0FBQyxJQUFJLEtBQUssT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLDhGQUE4RixDQUFDO1FBQ3RKLElBQUksT0FBTyxDQUFDLEtBQUssZ0RBQXdDLEVBQUUsQ0FBQztZQUMxRCxPQUFPLElBQUksT0FBTyxPQUFPLENBQUMsSUFBSSwyREFBMkQsQ0FBQztZQUMxRixPQUFPLElBQUksNEdBQTRHLENBQUM7WUFDeEgsT0FBTyxJQUFJLElBQUksQ0FBQztZQUNoQixPQUFPLElBQUksNEZBQTRGLENBQUM7UUFDMUcsQ0FBQzthQUFNLENBQUM7WUFDTixPQUFPLElBQUksNkZBQTZGLENBQUM7UUFDM0csQ0FBQztRQUNELE9BQU8sSUFBSSw4SUFBOEksQ0FBQztRQUMxSixPQUFPLElBQUksMkZBQTJGLENBQUM7UUFDdkcsTUFBTSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUMzQixDQUFDO1NBQU0sQ0FBQztRQUNOLE1BQU0sSUFBSSxLQUFLLENBQUMsMEJBQTBCLENBQUMsQ0FBQztJQUM5QyxDQUFDO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cbmltcG9ydCB7Z2xvYmFsfSBmcm9tICcuLi91dGlsL2dsb2JhbCc7XG5pbXBvcnQge0NvbXBpbGVyRmFjYWRlLCBFeHBvcnRlZENvbXBpbGVyRmFjYWRlLCBUeXBlfSBmcm9tICcuL2NvbXBpbGVyX2ZhY2FkZV9pbnRlcmZhY2UnO1xuZXhwb3J0ICogZnJvbSAnLi9jb21waWxlcl9mYWNhZGVfaW50ZXJmYWNlJztcblxuZXhwb3J0IGNvbnN0IGVudW0gSml0Q29tcGlsZXJVc2FnZSB7XG4gIERlY29yYXRvcixcbiAgUGFydGlhbERlY2xhcmF0aW9uLFxufVxuXG5pbnRlcmZhY2UgSml0Q29tcGlsZXJVc2FnZVJlcXVlc3Qge1xuICB1c2FnZTogSml0Q29tcGlsZXJVc2FnZTtcbiAga2luZDogJ2RpcmVjdGl2ZScgfCAnY29tcG9uZW50JyB8ICdwaXBlJyB8ICdpbmplY3RhYmxlJyB8ICdOZ01vZHVsZSc7XG4gIHR5cGU6IFR5cGU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRDb21waWxlckZhY2FkZShyZXF1ZXN0OiBKaXRDb21waWxlclVzYWdlUmVxdWVzdCk6IENvbXBpbGVyRmFjYWRlIHtcbiAgY29uc3QgZ2xvYmFsTmc6IEV4cG9ydGVkQ29tcGlsZXJGYWNhZGUgPSBnbG9iYWxbJ25nJ107XG4gIGlmIChnbG9iYWxOZyAmJiBnbG9iYWxOZy7JtWNvbXBpbGVyRmFjYWRlKSB7XG4gICAgcmV0dXJuIGdsb2JhbE5nLsm1Y29tcGlsZXJGYWNhZGU7XG4gIH1cblxuICBpZiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSB7XG4gICAgLy8gTG9nIHRoZSB0eXBlIGFzIGFuIGVycm9yIHNvIHRoYXQgYSBkZXZlbG9wZXIgY2FuIGVhc2lseSBuYXZpZ2F0ZSB0byB0aGUgdHlwZSBmcm9tIHRoZVxuICAgIC8vIGNvbnNvbGUuXG4gICAgY29uc29sZS5lcnJvcihgSklUIGNvbXBpbGF0aW9uIGZhaWxlZCBmb3IgJHtyZXF1ZXN0LmtpbmR9YCwgcmVxdWVzdC50eXBlKTtcblxuICAgIGxldCBtZXNzYWdlID0gYFRoZSAke3JlcXVlc3Qua2luZH0gJyR7cmVxdWVzdC50eXBlLm5hbWV9JyBuZWVkcyB0byBiZSBjb21waWxlZCB1c2luZyB0aGUgSklUIGNvbXBpbGVyLCBidXQgJ0Bhbmd1bGFyL2NvbXBpbGVyJyBpcyBub3QgYXZhaWxhYmxlLlxcblxcbmA7XG4gICAgaWYgKHJlcXVlc3QudXNhZ2UgPT09IEppdENvbXBpbGVyVXNhZ2UuUGFydGlhbERlY2xhcmF0aW9uKSB7XG4gICAgICBtZXNzYWdlICs9IGBUaGUgJHtyZXF1ZXN0LmtpbmR9IGlzIHBhcnQgb2YgYSBsaWJyYXJ5IHRoYXQgaGFzIGJlZW4gcGFydGlhbGx5IGNvbXBpbGVkLlxcbmA7XG4gICAgICBtZXNzYWdlICs9IGBIb3dldmVyLCB0aGUgQW5ndWxhciBMaW5rZXIgaGFzIG5vdCBwcm9jZXNzZWQgdGhlIGxpYnJhcnkgc3VjaCB0aGF0IEpJVCBjb21waWxhdGlvbiBpcyB1c2VkIGFzIGZhbGxiYWNrLlxcbmA7XG4gICAgICBtZXNzYWdlICs9ICdcXG4nO1xuICAgICAgbWVzc2FnZSArPSBgSWRlYWxseSwgdGhlIGxpYnJhcnkgaXMgcHJvY2Vzc2VkIHVzaW5nIHRoZSBBbmd1bGFyIExpbmtlciB0byBiZWNvbWUgZnVsbHkgQU9UIGNvbXBpbGVkLlxcbmA7XG4gICAgfSBlbHNlIHtcbiAgICAgIG1lc3NhZ2UgKz0gYEpJVCBjb21waWxhdGlvbiBpcyBkaXNjb3VyYWdlZCBmb3IgcHJvZHVjdGlvbiB1c2UtY2FzZXMhIENvbnNpZGVyIHVzaW5nIEFPVCBtb2RlIGluc3RlYWQuXFxuYDtcbiAgICB9XG4gICAgbWVzc2FnZSArPSBgQWx0ZXJuYXRpdmVseSwgdGhlIEpJVCBjb21waWxlciBzaG91bGQgYmUgbG9hZGVkIGJ5IGJvb3RzdHJhcHBpbmcgdXNpbmcgJ0Bhbmd1bGFyL3BsYXRmb3JtLWJyb3dzZXItZHluYW1pYycgb3IgJ0Bhbmd1bGFyL3BsYXRmb3JtLXNlcnZlcicsXFxuYDtcbiAgICBtZXNzYWdlICs9IGBvciBtYW51YWxseSBwcm92aWRlIHRoZSBjb21waWxlciB3aXRoICdpbXBvcnQgXCJAYW5ndWxhci9jb21waWxlclwiOycgYmVmb3JlIGJvb3RzdHJhcHBpbmcuYDtcbiAgICB0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSk7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdKSVQgY29tcGlsZXIgdW5hdmFpbGFibGUnKTtcbiAgfVxufVxuIl19