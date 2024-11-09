"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
const schematics_1 = require("@angular-devkit/schematics");
const schematics_2 = require("@angular/cdk/schematics");
/**
 * Scaffolds a new tree component.
 * Internally it bootstraps the base component schematic
 */
function default_1(options) {
    return (0, schematics_1.chain)([
        (0, schematics_2.buildComponent)({ ...options }, {
            template: './__path__/__name@dasherize@if-flat__/__name@dasherize__.component.html.template',
            stylesheet: './__path__/__name@dasherize@if-flat__/__name@dasherize__.component.__style__.template',
        }),
        options.skipImport ? (0, schematics_1.noop)() : addTreeModulesToModule(options),
    ]);
}
exports.default = default_1;
/**
 * Adds the required modules to the relative module.
 */
function addTreeModulesToModule(options) {
    return async (host) => {
        const isStandalone = await (0, schematics_2.isStandaloneSchematic)(host, options);
        if (!isStandalone) {
            const modulePath = (await (0, schematics_2.findModuleFromOptions)(host, options));
            (0, schematics_2.addModuleImportToModule)(host, modulePath, 'MatTreeModule', '@angular/material/tree');
            (0, schematics_2.addModuleImportToModule)(host, modulePath, 'MatIconModule', '@angular/material/icon');
            (0, schematics_2.addModuleImportToModule)(host, modulePath, 'MatButtonModule', '@angular/material/button');
        }
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvc2NoZW1hdGljcy9uZy1nZW5lcmF0ZS90cmVlL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7O0FBRUgsMkRBQW1FO0FBQ25FLHdEQUtpQztBQUdqQzs7O0dBR0c7QUFDSCxtQkFBeUIsT0FBZTtJQUN0QyxPQUFPLElBQUEsa0JBQUssRUFBQztRQUNYLElBQUEsMkJBQWMsRUFDWixFQUFDLEdBQUcsT0FBTyxFQUFDLEVBQ1o7WUFDRSxRQUFRLEVBQ04sa0ZBQWtGO1lBQ3BGLFVBQVUsRUFDUix1RkFBdUY7U0FDMUYsQ0FDRjtRQUNELE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLElBQUEsaUJBQUksR0FBRSxDQUFDLENBQUMsQ0FBQyxzQkFBc0IsQ0FBQyxPQUFPLENBQUM7S0FDOUQsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQWJELDRCQWFDO0FBRUQ7O0dBRUc7QUFDSCxTQUFTLHNCQUFzQixDQUFDLE9BQWU7SUFDN0MsT0FBTyxLQUFLLEVBQUUsSUFBVSxFQUFFLEVBQUU7UUFDMUIsTUFBTSxZQUFZLEdBQUcsTUFBTSxJQUFBLGtDQUFxQixFQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUVoRSxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDbEIsTUFBTSxVQUFVLEdBQUcsQ0FBQyxNQUFNLElBQUEsa0NBQXFCLEVBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFFLENBQUM7WUFDakUsSUFBQSxvQ0FBdUIsRUFBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLGVBQWUsRUFBRSx3QkFBd0IsQ0FBQyxDQUFDO1lBQ3JGLElBQUEsb0NBQXVCLEVBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxlQUFlLEVBQUUsd0JBQXdCLENBQUMsQ0FBQztZQUNyRixJQUFBLG9DQUF1QixFQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsaUJBQWlCLEVBQUUsMEJBQTBCLENBQUMsQ0FBQztRQUMzRixDQUFDO0lBQ0gsQ0FBQyxDQUFDO0FBQ0osQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2NoYWluLCBub29wLCBSdWxlLCBUcmVlfSBmcm9tICdAYW5ndWxhci1kZXZraXQvc2NoZW1hdGljcyc7XG5pbXBvcnQge1xuICBhZGRNb2R1bGVJbXBvcnRUb01vZHVsZSxcbiAgYnVpbGRDb21wb25lbnQsXG4gIGZpbmRNb2R1bGVGcm9tT3B0aW9ucyxcbiAgaXNTdGFuZGFsb25lU2NoZW1hdGljLFxufSBmcm9tICdAYW5ndWxhci9jZGsvc2NoZW1hdGljcyc7XG5pbXBvcnQge1NjaGVtYX0gZnJvbSAnLi9zY2hlbWEnO1xuXG4vKipcbiAqIFNjYWZmb2xkcyBhIG5ldyB0cmVlIGNvbXBvbmVudC5cbiAqIEludGVybmFsbHkgaXQgYm9vdHN0cmFwcyB0aGUgYmFzZSBjb21wb25lbnQgc2NoZW1hdGljXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIChvcHRpb25zOiBTY2hlbWEpOiBSdWxlIHtcbiAgcmV0dXJuIGNoYWluKFtcbiAgICBidWlsZENvbXBvbmVudChcbiAgICAgIHsuLi5vcHRpb25zfSxcbiAgICAgIHtcbiAgICAgICAgdGVtcGxhdGU6XG4gICAgICAgICAgJy4vX19wYXRoX18vX19uYW1lQGRhc2hlcml6ZUBpZi1mbGF0X18vX19uYW1lQGRhc2hlcml6ZV9fLmNvbXBvbmVudC5odG1sLnRlbXBsYXRlJyxcbiAgICAgICAgc3R5bGVzaGVldDpcbiAgICAgICAgICAnLi9fX3BhdGhfXy9fX25hbWVAZGFzaGVyaXplQGlmLWZsYXRfXy9fX25hbWVAZGFzaGVyaXplX18uY29tcG9uZW50Ll9fc3R5bGVfXy50ZW1wbGF0ZScsXG4gICAgICB9LFxuICAgICksXG4gICAgb3B0aW9ucy5za2lwSW1wb3J0ID8gbm9vcCgpIDogYWRkVHJlZU1vZHVsZXNUb01vZHVsZShvcHRpb25zKSxcbiAgXSk7XG59XG5cbi8qKlxuICogQWRkcyB0aGUgcmVxdWlyZWQgbW9kdWxlcyB0byB0aGUgcmVsYXRpdmUgbW9kdWxlLlxuICovXG5mdW5jdGlvbiBhZGRUcmVlTW9kdWxlc1RvTW9kdWxlKG9wdGlvbnM6IFNjaGVtYSkge1xuICByZXR1cm4gYXN5bmMgKGhvc3Q6IFRyZWUpID0+IHtcbiAgICBjb25zdCBpc1N0YW5kYWxvbmUgPSBhd2FpdCBpc1N0YW5kYWxvbmVTY2hlbWF0aWMoaG9zdCwgb3B0aW9ucyk7XG5cbiAgICBpZiAoIWlzU3RhbmRhbG9uZSkge1xuICAgICAgY29uc3QgbW9kdWxlUGF0aCA9IChhd2FpdCBmaW5kTW9kdWxlRnJvbU9wdGlvbnMoaG9zdCwgb3B0aW9ucykpITtcbiAgICAgIGFkZE1vZHVsZUltcG9ydFRvTW9kdWxlKGhvc3QsIG1vZHVsZVBhdGgsICdNYXRUcmVlTW9kdWxlJywgJ0Bhbmd1bGFyL21hdGVyaWFsL3RyZWUnKTtcbiAgICAgIGFkZE1vZHVsZUltcG9ydFRvTW9kdWxlKGhvc3QsIG1vZHVsZVBhdGgsICdNYXRJY29uTW9kdWxlJywgJ0Bhbmd1bGFyL21hdGVyaWFsL2ljb24nKTtcbiAgICAgIGFkZE1vZHVsZUltcG9ydFRvTW9kdWxlKGhvc3QsIG1vZHVsZVBhdGgsICdNYXRCdXR0b25Nb2R1bGUnLCAnQGFuZ3VsYXIvbWF0ZXJpYWwvYnV0dG9uJyk7XG4gICAgfVxuICB9O1xufVxuIl19