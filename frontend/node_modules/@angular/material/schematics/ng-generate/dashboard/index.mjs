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
 * Scaffolds a new dashboard component.
 * Internally it bootstraps the base component schematic
 */
function default_1(options) {
    return (0, schematics_1.chain)([
        (0, schematics_2.buildComponent)({ ...options }, {
            template: './__path__/__name@dasherize@if-flat__/__name@dasherize__.component.html.template',
            stylesheet: './__path__/__name@dasherize@if-flat__/__name@dasherize__.component.__style__.template',
        }),
        options.skipImport ? (0, schematics_1.noop)() : addNavModulesToModule(options),
    ]);
}
exports.default = default_1;
/**
 * Adds the required modules to the relative module.
 */
function addNavModulesToModule(options) {
    return async (host) => {
        const isStandalone = await (0, schematics_2.isStandaloneSchematic)(host, options);
        if (!isStandalone) {
            const modulePath = (await (0, schematics_2.findModuleFromOptions)(host, options));
            (0, schematics_2.addModuleImportToModule)(host, modulePath, 'MatGridListModule', '@angular/material/grid-list');
            (0, schematics_2.addModuleImportToModule)(host, modulePath, 'MatCardModule', '@angular/material/card');
            (0, schematics_2.addModuleImportToModule)(host, modulePath, 'MatMenuModule', '@angular/material/menu');
            (0, schematics_2.addModuleImportToModule)(host, modulePath, 'MatIconModule', '@angular/material/icon');
            (0, schematics_2.addModuleImportToModule)(host, modulePath, 'MatButtonModule', '@angular/material/button');
        }
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvc2NoZW1hdGljcy9uZy1nZW5lcmF0ZS9kYXNoYm9hcmQvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7QUFFSCwyREFBbUU7QUFDbkUsd0RBS2lDO0FBR2pDOzs7R0FHRztBQUNILG1CQUF5QixPQUFlO0lBQ3RDLE9BQU8sSUFBQSxrQkFBSyxFQUFDO1FBQ1gsSUFBQSwyQkFBYyxFQUNaLEVBQUMsR0FBRyxPQUFPLEVBQUMsRUFDWjtZQUNFLFFBQVEsRUFDTixrRkFBa0Y7WUFDcEYsVUFBVSxFQUNSLHVGQUF1RjtTQUMxRixDQUNGO1FBQ0QsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBQSxpQkFBSSxHQUFFLENBQUMsQ0FBQyxDQUFDLHFCQUFxQixDQUFDLE9BQU8sQ0FBQztLQUM3RCxDQUFDLENBQUM7QUFDTCxDQUFDO0FBYkQsNEJBYUM7QUFFRDs7R0FFRztBQUNILFNBQVMscUJBQXFCLENBQUMsT0FBZTtJQUM1QyxPQUFPLEtBQUssRUFBRSxJQUFVLEVBQUUsRUFBRTtRQUMxQixNQUFNLFlBQVksR0FBRyxNQUFNLElBQUEsa0NBQXFCLEVBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBRWhFLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUNsQixNQUFNLFVBQVUsR0FBRyxDQUFDLE1BQU0sSUFBQSxrQ0FBcUIsRUFBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUUsQ0FBQztZQUNqRSxJQUFBLG9DQUF1QixFQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsbUJBQW1CLEVBQUUsNkJBQTZCLENBQUMsQ0FBQztZQUM5RixJQUFBLG9DQUF1QixFQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsZUFBZSxFQUFFLHdCQUF3QixDQUFDLENBQUM7WUFDckYsSUFBQSxvQ0FBdUIsRUFBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLGVBQWUsRUFBRSx3QkFBd0IsQ0FBQyxDQUFDO1lBQ3JGLElBQUEsb0NBQXVCLEVBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxlQUFlLEVBQUUsd0JBQXdCLENBQUMsQ0FBQztZQUNyRixJQUFBLG9DQUF1QixFQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsaUJBQWlCLEVBQUUsMEJBQTBCLENBQUMsQ0FBQztRQUMzRixDQUFDO0lBQ0gsQ0FBQyxDQUFDO0FBQ0osQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2NoYWluLCBub29wLCBSdWxlLCBUcmVlfSBmcm9tICdAYW5ndWxhci1kZXZraXQvc2NoZW1hdGljcyc7XG5pbXBvcnQge1xuICBhZGRNb2R1bGVJbXBvcnRUb01vZHVsZSxcbiAgYnVpbGRDb21wb25lbnQsXG4gIGZpbmRNb2R1bGVGcm9tT3B0aW9ucyxcbiAgaXNTdGFuZGFsb25lU2NoZW1hdGljLFxufSBmcm9tICdAYW5ndWxhci9jZGsvc2NoZW1hdGljcyc7XG5pbXBvcnQge1NjaGVtYX0gZnJvbSAnLi9zY2hlbWEnO1xuXG4vKipcbiAqIFNjYWZmb2xkcyBhIG5ldyBkYXNoYm9hcmQgY29tcG9uZW50LlxuICogSW50ZXJuYWxseSBpdCBib290c3RyYXBzIHRoZSBiYXNlIGNvbXBvbmVudCBzY2hlbWF0aWNcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKG9wdGlvbnM6IFNjaGVtYSk6IFJ1bGUge1xuICByZXR1cm4gY2hhaW4oW1xuICAgIGJ1aWxkQ29tcG9uZW50KFxuICAgICAgey4uLm9wdGlvbnN9LFxuICAgICAge1xuICAgICAgICB0ZW1wbGF0ZTpcbiAgICAgICAgICAnLi9fX3BhdGhfXy9fX25hbWVAZGFzaGVyaXplQGlmLWZsYXRfXy9fX25hbWVAZGFzaGVyaXplX18uY29tcG9uZW50Lmh0bWwudGVtcGxhdGUnLFxuICAgICAgICBzdHlsZXNoZWV0OlxuICAgICAgICAgICcuL19fcGF0aF9fL19fbmFtZUBkYXNoZXJpemVAaWYtZmxhdF9fL19fbmFtZUBkYXNoZXJpemVfXy5jb21wb25lbnQuX19zdHlsZV9fLnRlbXBsYXRlJyxcbiAgICAgIH0sXG4gICAgKSxcbiAgICBvcHRpb25zLnNraXBJbXBvcnQgPyBub29wKCkgOiBhZGROYXZNb2R1bGVzVG9Nb2R1bGUob3B0aW9ucyksXG4gIF0pO1xufVxuXG4vKipcbiAqIEFkZHMgdGhlIHJlcXVpcmVkIG1vZHVsZXMgdG8gdGhlIHJlbGF0aXZlIG1vZHVsZS5cbiAqL1xuZnVuY3Rpb24gYWRkTmF2TW9kdWxlc1RvTW9kdWxlKG9wdGlvbnM6IFNjaGVtYSkge1xuICByZXR1cm4gYXN5bmMgKGhvc3Q6IFRyZWUpID0+IHtcbiAgICBjb25zdCBpc1N0YW5kYWxvbmUgPSBhd2FpdCBpc1N0YW5kYWxvbmVTY2hlbWF0aWMoaG9zdCwgb3B0aW9ucyk7XG5cbiAgICBpZiAoIWlzU3RhbmRhbG9uZSkge1xuICAgICAgY29uc3QgbW9kdWxlUGF0aCA9IChhd2FpdCBmaW5kTW9kdWxlRnJvbU9wdGlvbnMoaG9zdCwgb3B0aW9ucykpITtcbiAgICAgIGFkZE1vZHVsZUltcG9ydFRvTW9kdWxlKGhvc3QsIG1vZHVsZVBhdGgsICdNYXRHcmlkTGlzdE1vZHVsZScsICdAYW5ndWxhci9tYXRlcmlhbC9ncmlkLWxpc3QnKTtcbiAgICAgIGFkZE1vZHVsZUltcG9ydFRvTW9kdWxlKGhvc3QsIG1vZHVsZVBhdGgsICdNYXRDYXJkTW9kdWxlJywgJ0Bhbmd1bGFyL21hdGVyaWFsL2NhcmQnKTtcbiAgICAgIGFkZE1vZHVsZUltcG9ydFRvTW9kdWxlKGhvc3QsIG1vZHVsZVBhdGgsICdNYXRNZW51TW9kdWxlJywgJ0Bhbmd1bGFyL21hdGVyaWFsL21lbnUnKTtcbiAgICAgIGFkZE1vZHVsZUltcG9ydFRvTW9kdWxlKGhvc3QsIG1vZHVsZVBhdGgsICdNYXRJY29uTW9kdWxlJywgJ0Bhbmd1bGFyL21hdGVyaWFsL2ljb24nKTtcbiAgICAgIGFkZE1vZHVsZUltcG9ydFRvTW9kdWxlKGhvc3QsIG1vZHVsZVBhdGgsICdNYXRCdXR0b25Nb2R1bGUnLCAnQGFuZ3VsYXIvbWF0ZXJpYWwvYnV0dG9uJyk7XG4gICAgfVxuICB9O1xufVxuIl19