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
            stylesheet: './__path__/__name@dasherize@if-flat__/__name@dasherize__.component.__style__.template'
        }),
        options.skipImport ? schematics_1.noop() : addTableModulesToModule(options)
    ]);
}
exports.default = default_1;
/**
 * Adds the required modules to the relative module.
 */
function addTableModulesToModule(options) {
    return (host) => __awaiter(this, void 0, void 0, function* () {
        const modulePath = (yield schematics_2.findModuleFromOptions(host, options));
        schematics_2.addModuleImportToModule(host, modulePath, 'MatTableModule', '@angular/material/table');
        schematics_2.addModuleImportToModule(host, modulePath, 'MatPaginatorModule', '@angular/material/paginator');
        schematics_2.addModuleImportToModule(host, modulePath, 'MatSortModule', '@angular/material/sort');
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvc2NoZW1hdGljcy9uZy1nZW5lcmF0ZS90YWJsZS9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7OztBQUVILDJEQUFtRTtBQUNuRSx3REFJaUM7QUFHakM7OztHQUdHO0FBQ0gsbUJBQXdCLE9BQWU7SUFDckMsT0FBTyxrQkFBSyxDQUFDO1FBQ1gsMkJBQWMsbUJBQUssT0FBTyxHQUFHO1lBQzNCLFFBQVEsRUFBRSxrRkFBa0Y7WUFDNUYsVUFBVSxFQUNOLHVGQUF1RjtTQUM1RixDQUFDO1FBQ0YsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsaUJBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyx1QkFBdUIsQ0FBQyxPQUFPLENBQUM7S0FDL0QsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQVRELDRCQVNDO0FBRUQ7O0dBRUc7QUFDSCxTQUFTLHVCQUF1QixDQUFDLE9BQWU7SUFDOUMsT0FBTyxDQUFPLElBQVUsRUFBRSxFQUFFO1FBQzFCLE1BQU0sVUFBVSxHQUFHLENBQUMsTUFBTSxrQ0FBcUIsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUUsQ0FBQztRQUNqRSxvQ0FBdUIsQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLGdCQUFnQixFQUFFLHlCQUF5QixDQUFDLENBQUM7UUFDdkYsb0NBQXVCLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxvQkFBb0IsRUFBRSw2QkFBNkIsQ0FBQyxDQUFDO1FBQy9GLG9DQUF1QixDQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsZUFBZSxFQUFFLHdCQUF3QixDQUFDLENBQUM7SUFDdkYsQ0FBQyxDQUFBLENBQUM7QUFDSixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Y2hhaW4sIG5vb3AsIFJ1bGUsIFRyZWV9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9zY2hlbWF0aWNzJztcbmltcG9ydCB7XG4gIGFkZE1vZHVsZUltcG9ydFRvTW9kdWxlLFxuICBidWlsZENvbXBvbmVudCxcbiAgZmluZE1vZHVsZUZyb21PcHRpb25zLFxufSBmcm9tICdAYW5ndWxhci9jZGsvc2NoZW1hdGljcyc7XG5pbXBvcnQge1NjaGVtYX0gZnJvbSAnLi9zY2hlbWEnO1xuXG4vKipcbiAqIFNjYWZmb2xkcyBhIG5ldyB0YWJsZSBjb21wb25lbnQuXG4gKiBJbnRlcm5hbGx5IGl0IGJvb3RzdHJhcHMgdGhlIGJhc2UgY29tcG9uZW50IHNjaGVtYXRpY1xuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihvcHRpb25zOiBTY2hlbWEpOiBSdWxlIHtcbiAgcmV0dXJuIGNoYWluKFtcbiAgICBidWlsZENvbXBvbmVudCh7Li4ub3B0aW9uc30sIHtcbiAgICAgIHRlbXBsYXRlOiAnLi9fX3BhdGhfXy9fX25hbWVAZGFzaGVyaXplQGlmLWZsYXRfXy9fX25hbWVAZGFzaGVyaXplX18uY29tcG9uZW50Lmh0bWwudGVtcGxhdGUnLFxuICAgICAgc3R5bGVzaGVldDpcbiAgICAgICAgICAnLi9fX3BhdGhfXy9fX25hbWVAZGFzaGVyaXplQGlmLWZsYXRfXy9fX25hbWVAZGFzaGVyaXplX18uY29tcG9uZW50Ll9fc3R5bGVfXy50ZW1wbGF0ZSdcbiAgICB9KSxcbiAgICBvcHRpb25zLnNraXBJbXBvcnQgPyBub29wKCkgOiBhZGRUYWJsZU1vZHVsZXNUb01vZHVsZShvcHRpb25zKVxuICBdKTtcbn1cblxuLyoqXG4gKiBBZGRzIHRoZSByZXF1aXJlZCBtb2R1bGVzIHRvIHRoZSByZWxhdGl2ZSBtb2R1bGUuXG4gKi9cbmZ1bmN0aW9uIGFkZFRhYmxlTW9kdWxlc1RvTW9kdWxlKG9wdGlvbnM6IFNjaGVtYSkge1xuICByZXR1cm4gYXN5bmMgKGhvc3Q6IFRyZWUpID0+IHtcbiAgICBjb25zdCBtb2R1bGVQYXRoID0gKGF3YWl0IGZpbmRNb2R1bGVGcm9tT3B0aW9ucyhob3N0LCBvcHRpb25zKSkhO1xuICAgIGFkZE1vZHVsZUltcG9ydFRvTW9kdWxlKGhvc3QsIG1vZHVsZVBhdGgsICdNYXRUYWJsZU1vZHVsZScsICdAYW5ndWxhci9tYXRlcmlhbC90YWJsZScpO1xuICAgIGFkZE1vZHVsZUltcG9ydFRvTW9kdWxlKGhvc3QsIG1vZHVsZVBhdGgsICdNYXRQYWdpbmF0b3JNb2R1bGUnLCAnQGFuZ3VsYXIvbWF0ZXJpYWwvcGFnaW5hdG9yJyk7XG4gICAgYWRkTW9kdWxlSW1wb3J0VG9Nb2R1bGUoaG9zdCwgbW9kdWxlUGF0aCwgJ01hdFNvcnRNb2R1bGUnLCAnQGFuZ3VsYXIvbWF0ZXJpYWwvc29ydCcpO1xuICB9O1xufVxuIl19