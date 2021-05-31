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
 * Scaffolds a new navigation component.
 * Internally it bootstraps the base component schematic
 */
function default_1(options) {
    return schematics_1.chain([
        schematics_2.buildComponent(Object.assign({}, options), {
            template: './__path__/__name@dasherize@if-flat__/__name@dasherize__.component.html.template',
            stylesheet: './__path__/__name@dasherize@if-flat__/__name@dasherize__.component.__style__.template',
        }),
        options.skipImport ? schematics_1.noop() : addNavModulesToModule(options)
    ]);
}
exports.default = default_1;
/**
 * Adds the required modules to the relative module.
 */
function addNavModulesToModule(options) {
    return (host) => __awaiter(this, void 0, void 0, function* () {
        const modulePath = (yield schematics_2.findModuleFromOptions(host, options));
        schematics_2.addModuleImportToModule(host, modulePath, 'LayoutModule', '@angular/cdk/layout');
        schematics_2.addModuleImportToModule(host, modulePath, 'MatToolbarModule', '@angular/material/toolbar');
        schematics_2.addModuleImportToModule(host, modulePath, 'MatButtonModule', '@angular/material/button');
        schematics_2.addModuleImportToModule(host, modulePath, 'MatSidenavModule', '@angular/material/sidenav');
        schematics_2.addModuleImportToModule(host, modulePath, 'MatIconModule', '@angular/material/icon');
        schematics_2.addModuleImportToModule(host, modulePath, 'MatListModule', '@angular/material/list');
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvc2NoZW1hdGljcy9uZy1nZW5lcmF0ZS9uYXZpZ2F0aW9uL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7O0FBRUgsMkRBQW1FO0FBQ25FLHdEQUlpQztBQUdqQzs7O0dBR0c7QUFDSCxtQkFBd0IsT0FBZTtJQUNyQyxPQUFPLGtCQUFLLENBQUM7UUFDWCwyQkFBYyxtQkFBSyxPQUFPLEdBQUc7WUFDM0IsUUFBUSxFQUFFLGtGQUFrRjtZQUM1RixVQUFVLEVBQ04sdUZBQXVGO1NBQzVGLENBQUM7UUFDRixPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxpQkFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLHFCQUFxQixDQUFDLE9BQU8sQ0FBQztLQUM3RCxDQUFDLENBQUM7QUFDTCxDQUFDO0FBVEQsNEJBU0M7QUFFRDs7R0FFRztBQUNILFNBQVMscUJBQXFCLENBQUMsT0FBZTtJQUM1QyxPQUFPLENBQU8sSUFBVSxFQUFFLEVBQUU7UUFDMUIsTUFBTSxVQUFVLEdBQUcsQ0FBQyxNQUFNLGtDQUFxQixDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBRSxDQUFDO1FBQ2pFLG9DQUF1QixDQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsY0FBYyxFQUFFLHFCQUFxQixDQUFDLENBQUM7UUFDakYsb0NBQXVCLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxrQkFBa0IsRUFBRSwyQkFBMkIsQ0FBQyxDQUFDO1FBQzNGLG9DQUF1QixDQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsaUJBQWlCLEVBQUUsMEJBQTBCLENBQUMsQ0FBQztRQUN6RixvQ0FBdUIsQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLGtCQUFrQixFQUFFLDJCQUEyQixDQUFDLENBQUM7UUFDM0Ysb0NBQXVCLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxlQUFlLEVBQUUsd0JBQXdCLENBQUMsQ0FBQztRQUNyRixvQ0FBdUIsQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLGVBQWUsRUFBRSx3QkFBd0IsQ0FBQyxDQUFDO0lBQ3ZGLENBQUMsQ0FBQSxDQUFDO0FBQ0osQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2NoYWluLCBub29wLCBSdWxlLCBUcmVlfSBmcm9tICdAYW5ndWxhci1kZXZraXQvc2NoZW1hdGljcyc7XG5pbXBvcnQge1xuICBhZGRNb2R1bGVJbXBvcnRUb01vZHVsZSxcbiAgYnVpbGRDb21wb25lbnQsXG4gIGZpbmRNb2R1bGVGcm9tT3B0aW9ucyxcbn0gZnJvbSAnQGFuZ3VsYXIvY2RrL3NjaGVtYXRpY3MnO1xuaW1wb3J0IHtTY2hlbWF9IGZyb20gJy4vc2NoZW1hJztcblxuLyoqXG4gKiBTY2FmZm9sZHMgYSBuZXcgbmF2aWdhdGlvbiBjb21wb25lbnQuXG4gKiBJbnRlcm5hbGx5IGl0IGJvb3RzdHJhcHMgdGhlIGJhc2UgY29tcG9uZW50IHNjaGVtYXRpY1xuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihvcHRpb25zOiBTY2hlbWEpOiBSdWxlIHtcbiAgcmV0dXJuIGNoYWluKFtcbiAgICBidWlsZENvbXBvbmVudCh7Li4ub3B0aW9uc30sIHtcbiAgICAgIHRlbXBsYXRlOiAnLi9fX3BhdGhfXy9fX25hbWVAZGFzaGVyaXplQGlmLWZsYXRfXy9fX25hbWVAZGFzaGVyaXplX18uY29tcG9uZW50Lmh0bWwudGVtcGxhdGUnLFxuICAgICAgc3R5bGVzaGVldDpcbiAgICAgICAgICAnLi9fX3BhdGhfXy9fX25hbWVAZGFzaGVyaXplQGlmLWZsYXRfXy9fX25hbWVAZGFzaGVyaXplX18uY29tcG9uZW50Ll9fc3R5bGVfXy50ZW1wbGF0ZScsXG4gICAgfSksXG4gICAgb3B0aW9ucy5za2lwSW1wb3J0ID8gbm9vcCgpIDogYWRkTmF2TW9kdWxlc1RvTW9kdWxlKG9wdGlvbnMpXG4gIF0pO1xufVxuXG4vKipcbiAqIEFkZHMgdGhlIHJlcXVpcmVkIG1vZHVsZXMgdG8gdGhlIHJlbGF0aXZlIG1vZHVsZS5cbiAqL1xuZnVuY3Rpb24gYWRkTmF2TW9kdWxlc1RvTW9kdWxlKG9wdGlvbnM6IFNjaGVtYSkge1xuICByZXR1cm4gYXN5bmMgKGhvc3Q6IFRyZWUpID0+IHtcbiAgICBjb25zdCBtb2R1bGVQYXRoID0gKGF3YWl0IGZpbmRNb2R1bGVGcm9tT3B0aW9ucyhob3N0LCBvcHRpb25zKSkhO1xuICAgIGFkZE1vZHVsZUltcG9ydFRvTW9kdWxlKGhvc3QsIG1vZHVsZVBhdGgsICdMYXlvdXRNb2R1bGUnLCAnQGFuZ3VsYXIvY2RrL2xheW91dCcpO1xuICAgIGFkZE1vZHVsZUltcG9ydFRvTW9kdWxlKGhvc3QsIG1vZHVsZVBhdGgsICdNYXRUb29sYmFyTW9kdWxlJywgJ0Bhbmd1bGFyL21hdGVyaWFsL3Rvb2xiYXInKTtcbiAgICBhZGRNb2R1bGVJbXBvcnRUb01vZHVsZShob3N0LCBtb2R1bGVQYXRoLCAnTWF0QnV0dG9uTW9kdWxlJywgJ0Bhbmd1bGFyL21hdGVyaWFsL2J1dHRvbicpO1xuICAgIGFkZE1vZHVsZUltcG9ydFRvTW9kdWxlKGhvc3QsIG1vZHVsZVBhdGgsICdNYXRTaWRlbmF2TW9kdWxlJywgJ0Bhbmd1bGFyL21hdGVyaWFsL3NpZGVuYXYnKTtcbiAgICBhZGRNb2R1bGVJbXBvcnRUb01vZHVsZShob3N0LCBtb2R1bGVQYXRoLCAnTWF0SWNvbk1vZHVsZScsICdAYW5ndWxhci9tYXRlcmlhbC9pY29uJyk7XG4gICAgYWRkTW9kdWxlSW1wb3J0VG9Nb2R1bGUoaG9zdCwgbW9kdWxlUGF0aCwgJ01hdExpc3RNb2R1bGUnLCAnQGFuZ3VsYXIvbWF0ZXJpYWwvbGlzdCcpO1xuICB9O1xufVxuIl19