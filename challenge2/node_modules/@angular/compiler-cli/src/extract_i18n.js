#!/usr/bin/env node
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/extract_i18n", ["require", "exports", "tslib", "reflect-metadata", "@angular/compiler-cli/src/transformers/api", "@angular/compiler-cli/src/main", "@angular/compiler-cli/src/ngtsc/file_system"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.mainXi18n = void 0;
    var tslib_1 = require("tslib");
    /**
     * Extract i18n messages from source code
     */
    // Must be imported first, because Angular decorators throw on load.
    require("reflect-metadata");
    var api = require("@angular/compiler-cli/src/transformers/api");
    var main_1 = require("@angular/compiler-cli/src/main");
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    function mainXi18n(args, consoleError) {
        if (consoleError === void 0) { consoleError = console.error; }
        var config = readXi18nCommandLineAndConfiguration(args);
        return main_1.main(args, consoleError, config, undefined, undefined, undefined);
    }
    exports.mainXi18n = mainXi18n;
    function readXi18nCommandLineAndConfiguration(args) {
        var options = {};
        var parsedArgs = require('minimist')(args);
        if (parsedArgs.outFile)
            options.i18nOutFile = parsedArgs.outFile;
        if (parsedArgs.i18nFormat)
            options.i18nOutFormat = parsedArgs.i18nFormat;
        if (parsedArgs.locale)
            options.i18nOutLocale = parsedArgs.locale;
        var config = main_1.readCommandLineAndConfiguration(args, options, [
            'outFile',
            'i18nFormat',
            'locale',
        ]);
        // only emit the i18nBundle but nothing else.
        return tslib_1.__assign(tslib_1.__assign({}, config), { emitFlags: api.EmitFlags.I18nBundle });
    }
    // Entry point
    if (require.main === module) {
        process.title = 'Angular i18n Message Extractor (ng-xi18n)';
        var args = process.argv.slice(2);
        // We are running the real compiler so run against the real file-system
        file_system_1.setFileSystem(new file_system_1.NodeJSFileSystem());
        process.exitCode = mainXi18n(args);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0cmFjdF9pMThuLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy9leHRyYWN0X2kxOG4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUNBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSDs7T0FFRztJQUNILG9FQUFvRTtJQUNwRSw0QkFBMEI7SUFDMUIsZ0VBQTBDO0lBRTFDLHVEQUE2RDtJQUM3RCwyRUFBb0U7SUFFcEUsU0FBZ0IsU0FBUyxDQUNyQixJQUFjLEVBQUUsWUFBbUQ7UUFBbkQsNkJBQUEsRUFBQSxlQUFzQyxPQUFPLENBQUMsS0FBSztRQUNyRSxJQUFNLE1BQU0sR0FBRyxvQ0FBb0MsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMxRCxPQUFPLFdBQUksQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQzNFLENBQUM7SUFKRCw4QkFJQztJQUVELFNBQVMsb0NBQW9DLENBQUMsSUFBYztRQUMxRCxJQUFNLE9BQU8sR0FBd0IsRUFBRSxDQUFDO1FBQ3hDLElBQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM3QyxJQUFJLFVBQVUsQ0FBQyxPQUFPO1lBQUUsT0FBTyxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDO1FBQ2pFLElBQUksVUFBVSxDQUFDLFVBQVU7WUFBRSxPQUFPLENBQUMsYUFBYSxHQUFHLFVBQVUsQ0FBQyxVQUFVLENBQUM7UUFDekUsSUFBSSxVQUFVLENBQUMsTUFBTTtZQUFFLE9BQU8sQ0FBQyxhQUFhLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQztRQUVqRSxJQUFNLE1BQU0sR0FBRyxzQ0FBK0IsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFO1lBQzVELFNBQVM7WUFDVCxZQUFZO1lBQ1osUUFBUTtTQUNULENBQUMsQ0FBQztRQUNILDZDQUE2QztRQUM3Qyw2Q0FBVyxNQUFNLEtBQUUsU0FBUyxFQUFFLEdBQUcsQ0FBQyxTQUFTLENBQUMsVUFBVSxJQUFFO0lBQzFELENBQUM7SUFFRCxjQUFjO0lBQ2QsSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLE1BQU0sRUFBRTtRQUMzQixPQUFPLENBQUMsS0FBSyxHQUFHLDJDQUEyQyxDQUFDO1FBQzVELElBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ25DLHVFQUF1RTtRQUN2RSwyQkFBYSxDQUFDLElBQUksOEJBQWdCLEVBQUUsQ0FBQyxDQUFDO1FBQ3RDLE9BQU8sQ0FBQyxRQUFRLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ3BDIiwic291cmNlc0NvbnRlbnQiOlsiIyEvdXNyL2Jpbi9lbnYgbm9kZVxuLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbi8qKlxuICogRXh0cmFjdCBpMThuIG1lc3NhZ2VzIGZyb20gc291cmNlIGNvZGVcbiAqL1xuLy8gTXVzdCBiZSBpbXBvcnRlZCBmaXJzdCwgYmVjYXVzZSBBbmd1bGFyIGRlY29yYXRvcnMgdGhyb3cgb24gbG9hZC5cbmltcG9ydCAncmVmbGVjdC1tZXRhZGF0YSc7XG5pbXBvcnQgKiBhcyBhcGkgZnJvbSAnLi90cmFuc2Zvcm1lcnMvYXBpJztcbmltcG9ydCB7UGFyc2VkQ29uZmlndXJhdGlvbn0gZnJvbSAnLi9wZXJmb3JtX2NvbXBpbGUnO1xuaW1wb3J0IHttYWluLCByZWFkQ29tbWFuZExpbmVBbmRDb25maWd1cmF0aW9ufSBmcm9tICcuL21haW4nO1xuaW1wb3J0IHtzZXRGaWxlU3lzdGVtLCBOb2RlSlNGaWxlU3lzdGVtfSBmcm9tICcuL25ndHNjL2ZpbGVfc3lzdGVtJztcblxuZXhwb3J0IGZ1bmN0aW9uIG1haW5YaTE4bihcbiAgICBhcmdzOiBzdHJpbmdbXSwgY29uc29sZUVycm9yOiAobXNnOiBzdHJpbmcpID0+IHZvaWQgPSBjb25zb2xlLmVycm9yKTogbnVtYmVyIHtcbiAgY29uc3QgY29uZmlnID0gcmVhZFhpMThuQ29tbWFuZExpbmVBbmRDb25maWd1cmF0aW9uKGFyZ3MpO1xuICByZXR1cm4gbWFpbihhcmdzLCBjb25zb2xlRXJyb3IsIGNvbmZpZywgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHVuZGVmaW5lZCk7XG59XG5cbmZ1bmN0aW9uIHJlYWRYaTE4bkNvbW1hbmRMaW5lQW5kQ29uZmlndXJhdGlvbihhcmdzOiBzdHJpbmdbXSk6IFBhcnNlZENvbmZpZ3VyYXRpb24ge1xuICBjb25zdCBvcHRpb25zOiBhcGkuQ29tcGlsZXJPcHRpb25zID0ge307XG4gIGNvbnN0IHBhcnNlZEFyZ3MgPSByZXF1aXJlKCdtaW5pbWlzdCcpKGFyZ3MpO1xuICBpZiAocGFyc2VkQXJncy5vdXRGaWxlKSBvcHRpb25zLmkxOG5PdXRGaWxlID0gcGFyc2VkQXJncy5vdXRGaWxlO1xuICBpZiAocGFyc2VkQXJncy5pMThuRm9ybWF0KSBvcHRpb25zLmkxOG5PdXRGb3JtYXQgPSBwYXJzZWRBcmdzLmkxOG5Gb3JtYXQ7XG4gIGlmIChwYXJzZWRBcmdzLmxvY2FsZSkgb3B0aW9ucy5pMThuT3V0TG9jYWxlID0gcGFyc2VkQXJncy5sb2NhbGU7XG5cbiAgY29uc3QgY29uZmlnID0gcmVhZENvbW1hbmRMaW5lQW5kQ29uZmlndXJhdGlvbihhcmdzLCBvcHRpb25zLCBbXG4gICAgJ291dEZpbGUnLFxuICAgICdpMThuRm9ybWF0JyxcbiAgICAnbG9jYWxlJyxcbiAgXSk7XG4gIC8vIG9ubHkgZW1pdCB0aGUgaTE4bkJ1bmRsZSBidXQgbm90aGluZyBlbHNlLlxuICByZXR1cm4gey4uLmNvbmZpZywgZW1pdEZsYWdzOiBhcGkuRW1pdEZsYWdzLkkxOG5CdW5kbGV9O1xufVxuXG4vLyBFbnRyeSBwb2ludFxuaWYgKHJlcXVpcmUubWFpbiA9PT0gbW9kdWxlKSB7XG4gIHByb2Nlc3MudGl0bGUgPSAnQW5ndWxhciBpMThuIE1lc3NhZ2UgRXh0cmFjdG9yIChuZy14aTE4biknO1xuICBjb25zdCBhcmdzID0gcHJvY2Vzcy5hcmd2LnNsaWNlKDIpO1xuICAvLyBXZSBhcmUgcnVubmluZyB0aGUgcmVhbCBjb21waWxlciBzbyBydW4gYWdhaW5zdCB0aGUgcmVhbCBmaWxlLXN5c3RlbVxuICBzZXRGaWxlU3lzdGVtKG5ldyBOb2RlSlNGaWxlU3lzdGVtKCkpO1xuICBwcm9jZXNzLmV4aXRDb2RlID0gbWFpblhpMThuKGFyZ3MpO1xufVxuIl19