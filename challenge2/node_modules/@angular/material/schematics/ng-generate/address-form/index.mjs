"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const schematics_1 = require("@angular-devkit/schematics");
const schematics_2 = require("@angular/cdk/schematics");
/**
 * Scaffolds a new table component.
 * Internally it bootstraps the base component schematic
 */
function default_1(options) {
    return schematics_1.chain([
        schematics_2.buildComponent(Object.assign({}, options), {
            template: './__path__/__name@dasherize@if-flat__/__name@dasherize__.component.html.template',
            stylesheet: './__path__/__name@dasherize@if-flat__/__name@dasherize__.component.__style__.template',
        }),
        options.skipImport ? schematics_1.noop() : addFormModulesToModule(options)
    ]);
}
exports.default = default_1;
/**
 * Adds the required modules to the relative module.
 */
function addFormModulesToModule(options) {
    return (host) => __awaiter(this, void 0, void 0, function* () {
        const modulePath = (yield schematics_2.findModuleFromOptions(host, options));
        schematics_2.addModuleImportToModule(host, modulePath, 'MatInputModule', '@angular/material/input');
        schematics_2.addModuleImportToModule(host, modulePath, 'MatButtonModule', '@angular/material/button');
        schematics_2.addModuleImportToModule(host, modulePath, 'MatSelectModule', '@angular/material/select');
        schematics_2.addModuleImportToModule(host, modulePath, 'MatRadioModule', '@angular/material/radio');
        schematics_2.addModuleImportToModule(host, modulePath, 'MatCardModule', '@angular/material/card');
        schematics_2.addModuleImportToModule(host, modulePath, 'ReactiveFormsModule', '@angular/forms');
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvc2NoZW1hdGljcy9uZy1nZW5lcmF0ZS9hZGRyZXNzLWZvcm0vaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7QUFFSCwyREFBbUU7QUFDbkUsd0RBSWlDO0FBR2pDOzs7R0FHRztBQUNILG1CQUF3QixPQUFlO0lBQ3JDLE9BQU8sa0JBQUssQ0FBQztRQUNYLDJCQUFjLG1CQUFLLE9BQU8sR0FBRztZQUMzQixRQUFRLEVBQUUsa0ZBQWtGO1lBQzVGLFVBQVUsRUFDTix1RkFBdUY7U0FDNUYsQ0FBQztRQUNGLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLGlCQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsc0JBQXNCLENBQUMsT0FBTyxDQUFDO0tBQzlELENBQUMsQ0FBQztBQUNMLENBQUM7QUFURCw0QkFTQztBQUVEOztHQUVHO0FBQ0gsU0FBUyxzQkFBc0IsQ0FBQyxPQUFlO0lBQzdDLE9BQU8sQ0FBTyxJQUFVLEVBQUUsRUFBRTtRQUMxQixNQUFNLFVBQVUsR0FBRyxDQUFDLE1BQU0sa0NBQXFCLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFFLENBQUM7UUFDakUsb0NBQXVCLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxnQkFBZ0IsRUFBRSx5QkFBeUIsQ0FBQyxDQUFDO1FBQ3ZGLG9DQUF1QixDQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsaUJBQWlCLEVBQUUsMEJBQTBCLENBQUMsQ0FBQztRQUN6RixvQ0FBdUIsQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLGlCQUFpQixFQUFFLDBCQUEwQixDQUFDLENBQUM7UUFDekYsb0NBQXVCLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxnQkFBZ0IsRUFBRSx5QkFBeUIsQ0FBQyxDQUFDO1FBQ3ZGLG9DQUF1QixDQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsZUFBZSxFQUFFLHdCQUF3QixDQUFDLENBQUM7UUFDckYsb0NBQXVCLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxxQkFBcUIsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ3JGLENBQUMsQ0FBQSxDQUFDO0FBQ0osQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2NoYWluLCBub29wLCBSdWxlLCBUcmVlfSBmcm9tICdAYW5ndWxhci1kZXZraXQvc2NoZW1hdGljcyc7XG5pbXBvcnQge1xuICBhZGRNb2R1bGVJbXBvcnRUb01vZHVsZSxcbiAgYnVpbGRDb21wb25lbnQsXG4gIGZpbmRNb2R1bGVGcm9tT3B0aW9ucyxcbn0gZnJvbSAnQGFuZ3VsYXIvY2RrL3NjaGVtYXRpY3MnO1xuaW1wb3J0IHtTY2hlbWF9IGZyb20gJy4vc2NoZW1hJztcblxuLyoqXG4gKiBTY2FmZm9sZHMgYSBuZXcgdGFibGUgY29tcG9uZW50LlxuICogSW50ZXJuYWxseSBpdCBib290c3RyYXBzIHRoZSBiYXNlIGNvbXBvbmVudCBzY2hlbWF0aWNcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24ob3B0aW9uczogU2NoZW1hKTogUnVsZSB7XG4gIHJldHVybiBjaGFpbihbXG4gICAgYnVpbGRDb21wb25lbnQoey4uLm9wdGlvbnN9LCB7XG4gICAgICB0ZW1wbGF0ZTogJy4vX19wYXRoX18vX19uYW1lQGRhc2hlcml6ZUBpZi1mbGF0X18vX19uYW1lQGRhc2hlcml6ZV9fLmNvbXBvbmVudC5odG1sLnRlbXBsYXRlJyxcbiAgICAgIHN0eWxlc2hlZXQ6XG4gICAgICAgICAgJy4vX19wYXRoX18vX19uYW1lQGRhc2hlcml6ZUBpZi1mbGF0X18vX19uYW1lQGRhc2hlcml6ZV9fLmNvbXBvbmVudC5fX3N0eWxlX18udGVtcGxhdGUnLFxuICAgIH0pLFxuICAgIG9wdGlvbnMuc2tpcEltcG9ydCA/IG5vb3AoKSA6IGFkZEZvcm1Nb2R1bGVzVG9Nb2R1bGUob3B0aW9ucylcbiAgXSk7XG59XG5cbi8qKlxuICogQWRkcyB0aGUgcmVxdWlyZWQgbW9kdWxlcyB0byB0aGUgcmVsYXRpdmUgbW9kdWxlLlxuICovXG5mdW5jdGlvbiBhZGRGb3JtTW9kdWxlc1RvTW9kdWxlKG9wdGlvbnM6IFNjaGVtYSkge1xuICByZXR1cm4gYXN5bmMgKGhvc3Q6IFRyZWUpID0+IHtcbiAgICBjb25zdCBtb2R1bGVQYXRoID0gKGF3YWl0IGZpbmRNb2R1bGVGcm9tT3B0aW9ucyhob3N0LCBvcHRpb25zKSkhO1xuICAgIGFkZE1vZHVsZUltcG9ydFRvTW9kdWxlKGhvc3QsIG1vZHVsZVBhdGgsICdNYXRJbnB1dE1vZHVsZScsICdAYW5ndWxhci9tYXRlcmlhbC9pbnB1dCcpO1xuICAgIGFkZE1vZHVsZUltcG9ydFRvTW9kdWxlKGhvc3QsIG1vZHVsZVBhdGgsICdNYXRCdXR0b25Nb2R1bGUnLCAnQGFuZ3VsYXIvbWF0ZXJpYWwvYnV0dG9uJyk7XG4gICAgYWRkTW9kdWxlSW1wb3J0VG9Nb2R1bGUoaG9zdCwgbW9kdWxlUGF0aCwgJ01hdFNlbGVjdE1vZHVsZScsICdAYW5ndWxhci9tYXRlcmlhbC9zZWxlY3QnKTtcbiAgICBhZGRNb2R1bGVJbXBvcnRUb01vZHVsZShob3N0LCBtb2R1bGVQYXRoLCAnTWF0UmFkaW9Nb2R1bGUnLCAnQGFuZ3VsYXIvbWF0ZXJpYWwvcmFkaW8nKTtcbiAgICBhZGRNb2R1bGVJbXBvcnRUb01vZHVsZShob3N0LCBtb2R1bGVQYXRoLCAnTWF0Q2FyZE1vZHVsZScsICdAYW5ndWxhci9tYXRlcmlhbC9jYXJkJyk7XG4gICAgYWRkTW9kdWxlSW1wb3J0VG9Nb2R1bGUoaG9zdCwgbW9kdWxlUGF0aCwgJ1JlYWN0aXZlRm9ybXNNb2R1bGUnLCAnQGFuZ3VsYXIvZm9ybXMnKTtcbiAgfTtcbn1cbiJdfQ==