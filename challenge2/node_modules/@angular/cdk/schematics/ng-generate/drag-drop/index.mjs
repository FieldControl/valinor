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
const utils_1 = require("../../utils");
/** Scaffolds a new Angular component that uses the Drag and Drop module. */
function default_1(options) {
    return schematics_1.chain([
        utils_1.buildComponent(Object.assign({}, options), {
            template: './__path__/__name@dasherize@if-flat__/__name@dasherize__.component.html.template',
            stylesheet: './__path__/__name@dasherize@if-flat__/__name@dasherize__.component.__style__.template',
        }),
        options.skipImport ? schematics_1.noop() : addDragDropModulesToModule(options)
    ]);
}
exports.default = default_1;
/** Adds the required modules to the main module of the CLI project. */
function addDragDropModulesToModule(options) {
    return (host) => __awaiter(this, void 0, void 0, function* () {
        const modulePath = yield utils_1.findModuleFromOptions(host, options);
        utils_1.addModuleImportToModule(host, modulePath, 'DragDropModule', '@angular/cdk/drag-drop');
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL3NjaGVtYXRpY3MvbmctZ2VuZXJhdGUvZHJhZy1kcm9wL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7O0FBRUgsMkRBQW1FO0FBQ25FLHVDQUEyRjtBQUczRiw0RUFBNEU7QUFDNUUsbUJBQXdCLE9BQWU7SUFDckMsT0FBTyxrQkFBSyxDQUFDO1FBQ1gsc0JBQWMsbUJBQUssT0FBTyxHQUFHO1lBQzNCLFFBQVEsRUFBRSxrRkFBa0Y7WUFDNUYsVUFBVSxFQUNOLHVGQUF1RjtTQUM1RixDQUFDO1FBQ0YsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsaUJBQUksRUFBRSxDQUFDLENBQUMsQ0FBQywwQkFBMEIsQ0FBQyxPQUFPLENBQUM7S0FDbEUsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQVRELDRCQVNDO0FBRUQsdUVBQXVFO0FBQ3ZFLFNBQVMsMEJBQTBCLENBQUMsT0FBZTtJQUNqRCxPQUFPLENBQU8sSUFBVSxFQUFFLEVBQUU7UUFDMUIsTUFBTSxVQUFVLEdBQUcsTUFBTSw2QkFBcUIsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDOUQsK0JBQXVCLENBQUMsSUFBSSxFQUFFLFVBQVcsRUFBRSxnQkFBZ0IsRUFBRSx3QkFBd0IsQ0FBQyxDQUFDO0lBQ3pGLENBQUMsQ0FBQSxDQUFDO0FBQ0osQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2NoYWluLCBub29wLCBSdWxlLCBUcmVlfSBmcm9tICdAYW5ndWxhci1kZXZraXQvc2NoZW1hdGljcyc7XG5pbXBvcnQge2FkZE1vZHVsZUltcG9ydFRvTW9kdWxlLCBidWlsZENvbXBvbmVudCwgZmluZE1vZHVsZUZyb21PcHRpb25zfSBmcm9tICcuLi8uLi91dGlscyc7XG5pbXBvcnQge1NjaGVtYX0gZnJvbSAnLi9zY2hlbWEnO1xuXG4vKiogU2NhZmZvbGRzIGEgbmV3IEFuZ3VsYXIgY29tcG9uZW50IHRoYXQgdXNlcyB0aGUgRHJhZyBhbmQgRHJvcCBtb2R1bGUuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihvcHRpb25zOiBTY2hlbWEpOiBSdWxlIHtcbiAgcmV0dXJuIGNoYWluKFtcbiAgICBidWlsZENvbXBvbmVudCh7Li4ub3B0aW9uc30sIHtcbiAgICAgIHRlbXBsYXRlOiAnLi9fX3BhdGhfXy9fX25hbWVAZGFzaGVyaXplQGlmLWZsYXRfXy9fX25hbWVAZGFzaGVyaXplX18uY29tcG9uZW50Lmh0bWwudGVtcGxhdGUnLFxuICAgICAgc3R5bGVzaGVldDpcbiAgICAgICAgICAnLi9fX3BhdGhfXy9fX25hbWVAZGFzaGVyaXplQGlmLWZsYXRfXy9fX25hbWVAZGFzaGVyaXplX18uY29tcG9uZW50Ll9fc3R5bGVfXy50ZW1wbGF0ZScsXG4gICAgfSksXG4gICAgb3B0aW9ucy5za2lwSW1wb3J0ID8gbm9vcCgpIDogYWRkRHJhZ0Ryb3BNb2R1bGVzVG9Nb2R1bGUob3B0aW9ucylcbiAgXSk7XG59XG5cbi8qKiBBZGRzIHRoZSByZXF1aXJlZCBtb2R1bGVzIHRvIHRoZSBtYWluIG1vZHVsZSBvZiB0aGUgQ0xJIHByb2plY3QuICovXG5mdW5jdGlvbiBhZGREcmFnRHJvcE1vZHVsZXNUb01vZHVsZShvcHRpb25zOiBTY2hlbWEpIHtcbiAgcmV0dXJuIGFzeW5jIChob3N0OiBUcmVlKSA9PiB7XG4gICAgY29uc3QgbW9kdWxlUGF0aCA9IGF3YWl0IGZpbmRNb2R1bGVGcm9tT3B0aW9ucyhob3N0LCBvcHRpb25zKTtcbiAgICBhZGRNb2R1bGVJbXBvcnRUb01vZHVsZShob3N0LCBtb2R1bGVQYXRoISwgJ0RyYWdEcm9wTW9kdWxlJywgJ0Bhbmd1bGFyL2Nkay9kcmFnLWRyb3AnKTtcbiAgfTtcbn1cbiJdfQ==