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
 * Scaffolds a new tree component.
 * Internally it bootstraps the base component schematic
 */
function default_1(options) {
    return schematics_1.chain([
        schematics_2.buildComponent(Object.assign({}, options), {
            template: './__path__/__name@dasherize@if-flat__/__name@dasherize__.component.html.template',
            stylesheet: './__path__/__name@dasherize@if-flat__/__name@dasherize__.component.__style__.template',
        }),
        options.skipImport ? schematics_1.noop() : addTreeModulesToModule(options)
    ]);
}
exports.default = default_1;
/**
 * Adds the required modules to the relative module.
 */
function addTreeModulesToModule(options) {
    return (host) => __awaiter(this, void 0, void 0, function* () {
        const modulePath = (yield schematics_2.findModuleFromOptions(host, options));
        schematics_2.addModuleImportToModule(host, modulePath, 'MatTreeModule', '@angular/material/tree');
        schematics_2.addModuleImportToModule(host, modulePath, 'MatIconModule', '@angular/material/icon');
        schematics_2.addModuleImportToModule(host, modulePath, 'MatButtonModule', '@angular/material/button');
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvc2NoZW1hdGljcy9uZy1nZW5lcmF0ZS90cmVlL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7O0FBRUgsMkRBQW1FO0FBQ25FLHdEQUlpQztBQUdqQzs7O0dBR0c7QUFDSCxtQkFBd0IsT0FBZTtJQUNyQyxPQUFPLGtCQUFLLENBQUM7UUFDWCwyQkFBYyxtQkFBSyxPQUFPLEdBQUc7WUFDM0IsUUFBUSxFQUFFLGtGQUFrRjtZQUM1RixVQUFVLEVBQ04sdUZBQXVGO1NBQzVGLENBQUM7UUFDRixPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxpQkFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLHNCQUFzQixDQUFDLE9BQU8sQ0FBQztLQUM5RCxDQUFDLENBQUM7QUFDTCxDQUFDO0FBVEQsNEJBU0M7QUFFRDs7R0FFRztBQUNILFNBQVMsc0JBQXNCLENBQUMsT0FBZTtJQUM3QyxPQUFPLENBQU8sSUFBVSxFQUFFLEVBQUU7UUFDMUIsTUFBTSxVQUFVLEdBQUcsQ0FBQyxNQUFNLGtDQUFxQixDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBRSxDQUFDO1FBQ2pFLG9DQUF1QixDQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsZUFBZSxFQUFFLHdCQUF3QixDQUFDLENBQUM7UUFDckYsb0NBQXVCLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxlQUFlLEVBQUUsd0JBQXdCLENBQUMsQ0FBQztRQUNyRixvQ0FBdUIsQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLGlCQUFpQixFQUFFLDBCQUEwQixDQUFDLENBQUM7SUFDM0YsQ0FBQyxDQUFBLENBQUM7QUFDSixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Y2hhaW4sIG5vb3AsIFJ1bGUsIFRyZWV9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9zY2hlbWF0aWNzJztcbmltcG9ydCB7XG4gIGFkZE1vZHVsZUltcG9ydFRvTW9kdWxlLFxuICBidWlsZENvbXBvbmVudCxcbiAgZmluZE1vZHVsZUZyb21PcHRpb25zLFxufSBmcm9tICdAYW5ndWxhci9jZGsvc2NoZW1hdGljcyc7XG5pbXBvcnQge1NjaGVtYX0gZnJvbSAnLi9zY2hlbWEnO1xuXG4vKipcbiAqIFNjYWZmb2xkcyBhIG5ldyB0cmVlIGNvbXBvbmVudC5cbiAqIEludGVybmFsbHkgaXQgYm9vdHN0cmFwcyB0aGUgYmFzZSBjb21wb25lbnQgc2NoZW1hdGljXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG9wdGlvbnM6IFNjaGVtYSk6IFJ1bGUge1xuICByZXR1cm4gY2hhaW4oW1xuICAgIGJ1aWxkQ29tcG9uZW50KHsuLi5vcHRpb25zfSwge1xuICAgICAgdGVtcGxhdGU6ICcuL19fcGF0aF9fL19fbmFtZUBkYXNoZXJpemVAaWYtZmxhdF9fL19fbmFtZUBkYXNoZXJpemVfXy5jb21wb25lbnQuaHRtbC50ZW1wbGF0ZScsXG4gICAgICBzdHlsZXNoZWV0OlxuICAgICAgICAgICcuL19fcGF0aF9fL19fbmFtZUBkYXNoZXJpemVAaWYtZmxhdF9fL19fbmFtZUBkYXNoZXJpemVfXy5jb21wb25lbnQuX19zdHlsZV9fLnRlbXBsYXRlJyxcbiAgICB9KSxcbiAgICBvcHRpb25zLnNraXBJbXBvcnQgPyBub29wKCkgOiBhZGRUcmVlTW9kdWxlc1RvTW9kdWxlKG9wdGlvbnMpXG4gIF0pO1xufVxuXG4vKipcbiAqIEFkZHMgdGhlIHJlcXVpcmVkIG1vZHVsZXMgdG8gdGhlIHJlbGF0aXZlIG1vZHVsZS5cbiAqL1xuZnVuY3Rpb24gYWRkVHJlZU1vZHVsZXNUb01vZHVsZShvcHRpb25zOiBTY2hlbWEpIHtcbiAgcmV0dXJuIGFzeW5jIChob3N0OiBUcmVlKSA9PiB7XG4gICAgY29uc3QgbW9kdWxlUGF0aCA9IChhd2FpdCBmaW5kTW9kdWxlRnJvbU9wdGlvbnMoaG9zdCwgb3B0aW9ucykpITtcbiAgICBhZGRNb2R1bGVJbXBvcnRUb01vZHVsZShob3N0LCBtb2R1bGVQYXRoLCAnTWF0VHJlZU1vZHVsZScsICdAYW5ndWxhci9tYXRlcmlhbC90cmVlJyk7XG4gICAgYWRkTW9kdWxlSW1wb3J0VG9Nb2R1bGUoaG9zdCwgbW9kdWxlUGF0aCwgJ01hdEljb25Nb2R1bGUnLCAnQGFuZ3VsYXIvbWF0ZXJpYWwvaWNvbicpO1xuICAgIGFkZE1vZHVsZUltcG9ydFRvTW9kdWxlKGhvc3QsIG1vZHVsZVBhdGgsICdNYXRCdXR0b25Nb2R1bGUnLCAnQGFuZ3VsYXIvbWF0ZXJpYWwvYnV0dG9uJyk7XG4gIH07XG59XG4iXX0=