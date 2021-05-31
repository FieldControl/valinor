/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { PlatformModule } from '@angular/cdk/platform';
import { NgModule } from '@angular/core';
import { DateAdapter } from './date-adapter';
import { MAT_DATE_FORMATS } from './date-formats';
import { NativeDateAdapter } from './native-date-adapter';
import { MAT_NATIVE_DATE_FORMATS } from './native-date-formats';
export * from './date-adapter';
export * from './date-formats';
export * from './native-date-adapter';
export * from './native-date-formats';
export class NativeDateModule {
}
NativeDateModule.decorators = [
    { type: NgModule, args: [{
                imports: [PlatformModule],
                providers: [
                    { provide: DateAdapter, useClass: NativeDateAdapter },
                ],
            },] }
];
const ɵ0 = MAT_NATIVE_DATE_FORMATS;
export class MatNativeDateModule {
}
MatNativeDateModule.decorators = [
    { type: NgModule, args: [{
                imports: [NativeDateModule],
                providers: [{ provide: MAT_DATE_FORMATS, useValue: ɵ0 }],
            },] }
];
export { ɵ0 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvY29yZS9kYXRldGltZS9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDckQsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN2QyxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDM0MsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDaEQsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDeEQsT0FBTyxFQUFDLHVCQUF1QixFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFFOUQsY0FBYyxnQkFBZ0IsQ0FBQztBQUMvQixjQUFjLGdCQUFnQixDQUFDO0FBQy9CLGNBQWMsdUJBQXVCLENBQUM7QUFDdEMsY0FBYyx1QkFBdUIsQ0FBQztBQVN0QyxNQUFNLE9BQU8sZ0JBQWdCOzs7WUFONUIsUUFBUSxTQUFDO2dCQUNSLE9BQU8sRUFBRSxDQUFDLGNBQWMsQ0FBQztnQkFDekIsU0FBUyxFQUFFO29CQUNULEVBQUMsT0FBTyxFQUFFLFdBQVcsRUFBRSxRQUFRLEVBQUUsaUJBQWlCLEVBQUM7aUJBQ3BEO2FBQ0Y7O1dBTW1ELHVCQUF1QjtBQUUzRSxNQUFNLE9BQU8sbUJBQW1COzs7WUFKL0IsUUFBUSxTQUFDO2dCQUNSLE9BQU8sRUFBRSxDQUFDLGdCQUFnQixDQUFDO2dCQUMzQixTQUFTLEVBQUUsQ0FBQyxFQUFDLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxRQUFRLElBQXlCLEVBQUMsQ0FBQzthQUM1RSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1BsYXRmb3JtTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jZGsvcGxhdGZvcm0nO1xuaW1wb3J0IHtOZ01vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0RhdGVBZGFwdGVyfSBmcm9tICcuL2RhdGUtYWRhcHRlcic7XG5pbXBvcnQge01BVF9EQVRFX0ZPUk1BVFN9IGZyb20gJy4vZGF0ZS1mb3JtYXRzJztcbmltcG9ydCB7TmF0aXZlRGF0ZUFkYXB0ZXJ9IGZyb20gJy4vbmF0aXZlLWRhdGUtYWRhcHRlcic7XG5pbXBvcnQge01BVF9OQVRJVkVfREFURV9GT1JNQVRTfSBmcm9tICcuL25hdGl2ZS1kYXRlLWZvcm1hdHMnO1xuXG5leHBvcnQgKiBmcm9tICcuL2RhdGUtYWRhcHRlcic7XG5leHBvcnQgKiBmcm9tICcuL2RhdGUtZm9ybWF0cyc7XG5leHBvcnQgKiBmcm9tICcuL25hdGl2ZS1kYXRlLWFkYXB0ZXInO1xuZXhwb3J0ICogZnJvbSAnLi9uYXRpdmUtZGF0ZS1mb3JtYXRzJztcblxuXG5ATmdNb2R1bGUoe1xuICBpbXBvcnRzOiBbUGxhdGZvcm1Nb2R1bGVdLFxuICBwcm92aWRlcnM6IFtcbiAgICB7cHJvdmlkZTogRGF0ZUFkYXB0ZXIsIHVzZUNsYXNzOiBOYXRpdmVEYXRlQWRhcHRlcn0sXG4gIF0sXG59KVxuZXhwb3J0IGNsYXNzIE5hdGl2ZURhdGVNb2R1bGUge31cblxuXG5ATmdNb2R1bGUoe1xuICBpbXBvcnRzOiBbTmF0aXZlRGF0ZU1vZHVsZV0sXG4gIHByb3ZpZGVyczogW3twcm92aWRlOiBNQVRfREFURV9GT1JNQVRTLCB1c2VWYWx1ZTogTUFUX05BVElWRV9EQVRFX0ZPUk1BVFN9XSxcbn0pXG5leHBvcnQgY2xhc3MgTWF0TmF0aXZlRGF0ZU1vZHVsZSB7fVxuIl19