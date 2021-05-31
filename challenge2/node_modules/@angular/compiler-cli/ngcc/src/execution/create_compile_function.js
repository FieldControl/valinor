(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/execution/create_compile_function", ["require", "exports", "typescript", "@angular/compiler-cli/src/ngtsc/diagnostics", "@angular/compiler-cli/ngcc/src/packages/entry_point", "@angular/compiler-cli/ngcc/src/packages/entry_point_bundle", "@angular/compiler-cli/ngcc/src/packages/source_file_cache"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getCreateCompileFn = void 0;
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var ts = require("typescript");
    var diagnostics_1 = require("@angular/compiler-cli/src/ngtsc/diagnostics");
    var entry_point_1 = require("@angular/compiler-cli/ngcc/src/packages/entry_point");
    var entry_point_bundle_1 = require("@angular/compiler-cli/ngcc/src/packages/entry_point_bundle");
    var source_file_cache_1 = require("@angular/compiler-cli/ngcc/src/packages/source_file_cache");
    /**
     * The function for creating the `compile()` function.
     */
    function getCreateCompileFn(fileSystem, logger, fileWriter, enableI18nLegacyMessageIdFormat, tsConfig, pathMappings) {
        return function (beforeWritingFiles, onTaskCompleted) {
            var Transformer = require('../packages/transformer').Transformer;
            var transformer = new Transformer(fileSystem, logger, tsConfig);
            var sharedFileCache = new source_file_cache_1.SharedFileCache(fileSystem);
            var moduleResolutionCache = source_file_cache_1.createModuleResolutionCache(fileSystem);
            return function (task) {
                var entryPoint = task.entryPoint, formatProperty = task.formatProperty, formatPropertiesToMarkAsProcessed = task.formatPropertiesToMarkAsProcessed, processDts = task.processDts;
                var isCore = entryPoint.name === '@angular/core'; // Are we compiling the Angular core?
                var packageJson = entryPoint.packageJson;
                var formatPath = packageJson[formatProperty];
                var format = entry_point_1.getEntryPointFormat(fileSystem, entryPoint, formatProperty);
                // All properties listed in `propertiesToProcess` are guaranteed to point to a format-path
                // (i.e. they are defined in `entryPoint.packageJson`). Furthermore, they are also guaranteed
                // to be among `SUPPORTED_FORMAT_PROPERTIES`.
                // Based on the above, `formatPath` should always be defined and `getEntryPointFormat()`
                // should always return a format here (and not `undefined`) unless `formatPath` points to a
                // missing or empty file.
                if (!formatPath || !format) {
                    onTaskCompleted(task, 1 /* Failed */, "property `" + formatProperty + "` pointing to a missing or empty file: " + formatPath);
                    return;
                }
                logger.info("Compiling " + entryPoint.name + " : " + formatProperty + " as " + format);
                var bundle = entry_point_bundle_1.makeEntryPointBundle(fileSystem, entryPoint, sharedFileCache, moduleResolutionCache, formatPath, isCore, format, processDts, pathMappings, true, enableI18nLegacyMessageIdFormat);
                var result = transformer.transform(bundle);
                if (result.success) {
                    if (result.diagnostics.length > 0) {
                        logger.warn(diagnostics_1.replaceTsWithNgInErrors(ts.formatDiagnosticsWithColorAndContext(result.diagnostics, bundle.src.host)));
                    }
                    var writeBundle = function () {
                        fileWriter.writeBundle(bundle, result.transformedFiles, formatPropertiesToMarkAsProcessed);
                        logger.debug("  Successfully compiled " + entryPoint.name + " : " + formatProperty);
                        onTaskCompleted(task, 0 /* Processed */, null);
                    };
                    var beforeWritingResult = beforeWritingFiles(result.transformedFiles);
                    return (beforeWritingResult instanceof Promise) ?
                        beforeWritingResult.then(writeBundle) :
                        writeBundle();
                }
                else {
                    var errors = diagnostics_1.replaceTsWithNgInErrors(ts.formatDiagnosticsWithColorAndContext(result.diagnostics, bundle.src.host));
                    onTaskCompleted(task, 1 /* Failed */, "compilation errors:\n" + errors);
                }
            };
        };
    }
    exports.getCreateCompileFn = getCreateCompileFn;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlX2NvbXBpbGVfZnVuY3Rpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvbmdjYy9zcmMvZXhlY3V0aW9uL2NyZWF0ZV9jb21waWxlX2Z1bmN0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztJQUNBOzs7Ozs7T0FNRztJQUNILCtCQUFpQztJQUVqQywyRUFBdUU7SUFJdkUsbUZBQTREO0lBQzVELGlHQUFvRTtJQUNwRSwrRkFBMkY7SUFPM0Y7O09BRUc7SUFDSCxTQUFnQixrQkFBa0IsQ0FDOUIsVUFBc0IsRUFBRSxNQUFjLEVBQUUsVUFBc0IsRUFDOUQsK0JBQXdDLEVBQUUsUUFBa0MsRUFDNUUsWUFBb0M7UUFDdEMsT0FBTyxVQUFDLGtCQUFrQixFQUFFLGVBQWU7WUFDbEMsSUFBQSxXQUFXLEdBQUksT0FBTyxDQUFDLHlCQUF5QixDQUFDLFlBQXRDLENBQXVDO1lBQ3pELElBQU0sV0FBVyxHQUFHLElBQUksV0FBVyxDQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDbEUsSUFBTSxlQUFlLEdBQUcsSUFBSSxtQ0FBZSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3hELElBQU0scUJBQXFCLEdBQUcsK0NBQTJCLENBQUMsVUFBVSxDQUFDLENBQUM7WUFFdEUsT0FBTyxVQUFDLElBQVU7Z0JBQ1QsSUFBQSxVQUFVLEdBQW1FLElBQUksV0FBdkUsRUFBRSxjQUFjLEdBQW1ELElBQUksZUFBdkQsRUFBRSxpQ0FBaUMsR0FBZ0IsSUFBSSxrQ0FBcEIsRUFBRSxVQUFVLEdBQUksSUFBSSxXQUFSLENBQVM7Z0JBRXpGLElBQU0sTUFBTSxHQUFHLFVBQVUsQ0FBQyxJQUFJLEtBQUssZUFBZSxDQUFDLENBQUUscUNBQXFDO2dCQUMxRixJQUFNLFdBQVcsR0FBRyxVQUFVLENBQUMsV0FBVyxDQUFDO2dCQUMzQyxJQUFNLFVBQVUsR0FBRyxXQUFXLENBQUMsY0FBYyxDQUFDLENBQUM7Z0JBQy9DLElBQU0sTUFBTSxHQUFHLGlDQUFtQixDQUFDLFVBQVUsRUFBRSxVQUFVLEVBQUUsY0FBYyxDQUFDLENBQUM7Z0JBRTNFLDBGQUEwRjtnQkFDMUYsNkZBQTZGO2dCQUM3Riw2Q0FBNkM7Z0JBQzdDLHdGQUF3RjtnQkFDeEYsMkZBQTJGO2dCQUMzRix5QkFBeUI7Z0JBQ3pCLElBQUksQ0FBQyxVQUFVLElBQUksQ0FBQyxNQUFNLEVBQUU7b0JBQzFCLGVBQWUsQ0FDWCxJQUFJLGtCQUNKLGVBQWMsY0FBYywrQ0FBMkMsVUFBWSxDQUFDLENBQUM7b0JBQ3pGLE9BQU87aUJBQ1I7Z0JBRUQsTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFhLFVBQVUsQ0FBQyxJQUFJLFdBQU0sY0FBYyxZQUFPLE1BQVEsQ0FBQyxDQUFDO2dCQUU3RSxJQUFNLE1BQU0sR0FBRyx5Q0FBb0IsQ0FDL0IsVUFBVSxFQUFFLFVBQVUsRUFBRSxlQUFlLEVBQUUscUJBQXFCLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFDbEYsTUFBTSxFQUFFLFVBQVUsRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLCtCQUErQixDQUFDLENBQUM7Z0JBRTdFLElBQU0sTUFBTSxHQUFHLFdBQVcsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQzdDLElBQUksTUFBTSxDQUFDLE9BQU8sRUFBRTtvQkFDbEIsSUFBSSxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7d0JBQ2pDLE1BQU0sQ0FBQyxJQUFJLENBQUMscUNBQXVCLENBQy9CLEVBQUUsQ0FBQyxvQ0FBb0MsQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO3FCQUNwRjtvQkFFRCxJQUFNLFdBQVcsR0FBRzt3QkFDbEIsVUFBVSxDQUFDLFdBQVcsQ0FDbEIsTUFBTSxFQUFFLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxpQ0FBaUMsQ0FBQyxDQUFDO3dCQUV4RSxNQUFNLENBQUMsS0FBSyxDQUFDLDZCQUEyQixVQUFVLENBQUMsSUFBSSxXQUFNLGNBQWdCLENBQUMsQ0FBQzt3QkFDL0UsZUFBZSxDQUFDLElBQUkscUJBQW1DLElBQUksQ0FBQyxDQUFDO29CQUMvRCxDQUFDLENBQUM7b0JBRUYsSUFBTSxtQkFBbUIsR0FBRyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztvQkFFeEUsT0FBTyxDQUFDLG1CQUFtQixZQUFZLE9BQU8sQ0FBQyxDQUFDLENBQUM7d0JBQzdDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxXQUFXLENBQTBDLENBQUEsQ0FBQzt3QkFDL0UsV0FBVyxFQUFFLENBQUM7aUJBQ25CO3FCQUFNO29CQUNMLElBQU0sTUFBTSxHQUFHLHFDQUF1QixDQUNsQyxFQUFFLENBQUMsb0NBQW9DLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7b0JBQ2xGLGVBQWUsQ0FBQyxJQUFJLGtCQUFnQywwQkFBd0IsTUFBUSxDQUFDLENBQUM7aUJBQ3ZGO1lBQ0gsQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQWhFRCxnREFnRUMiLCJzb3VyY2VzQ29udGVudCI6WyJcbi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7cmVwbGFjZVRzV2l0aE5nSW5FcnJvcnN9IGZyb20gJy4uLy4uLy4uL3NyYy9uZ3RzYy9kaWFnbm9zdGljcyc7XG5pbXBvcnQge0ZpbGVTeXN0ZW19IGZyb20gJy4uLy4uLy4uL3NyYy9uZ3RzYy9maWxlX3N5c3RlbSc7XG5pbXBvcnQge0xvZ2dlcn0gZnJvbSAnLi4vLi4vLi4vc3JjL25ndHNjL2xvZ2dpbmcnO1xuaW1wb3J0IHtQYXJzZWRDb25maWd1cmF0aW9ufSBmcm9tICcuLi8uLi8uLi9zcmMvcGVyZm9ybV9jb21waWxlJztcbmltcG9ydCB7Z2V0RW50cnlQb2ludEZvcm1hdH0gZnJvbSAnLi4vcGFja2FnZXMvZW50cnlfcG9pbnQnO1xuaW1wb3J0IHttYWtlRW50cnlQb2ludEJ1bmRsZX0gZnJvbSAnLi4vcGFja2FnZXMvZW50cnlfcG9pbnRfYnVuZGxlJztcbmltcG9ydCB7Y3JlYXRlTW9kdWxlUmVzb2x1dGlvbkNhY2hlLCBTaGFyZWRGaWxlQ2FjaGV9IGZyb20gJy4uL3BhY2thZ2VzL3NvdXJjZV9maWxlX2NhY2hlJztcbmltcG9ydCB7UGF0aE1hcHBpbmdzfSBmcm9tICcuLi9wYXRoX21hcHBpbmdzJztcbmltcG9ydCB7RmlsZVdyaXRlcn0gZnJvbSAnLi4vd3JpdGluZy9maWxlX3dyaXRlcic7XG5cbmltcG9ydCB7Q3JlYXRlQ29tcGlsZUZufSBmcm9tICcuL2FwaSc7XG5pbXBvcnQge1Rhc2ssIFRhc2tQcm9jZXNzaW5nT3V0Y29tZX0gZnJvbSAnLi90YXNrcy9hcGknO1xuXG4vKipcbiAqIFRoZSBmdW5jdGlvbiBmb3IgY3JlYXRpbmcgdGhlIGBjb21waWxlKClgIGZ1bmN0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q3JlYXRlQ29tcGlsZUZuKFxuICAgIGZpbGVTeXN0ZW06IEZpbGVTeXN0ZW0sIGxvZ2dlcjogTG9nZ2VyLCBmaWxlV3JpdGVyOiBGaWxlV3JpdGVyLFxuICAgIGVuYWJsZUkxOG5MZWdhY3lNZXNzYWdlSWRGb3JtYXQ6IGJvb2xlYW4sIHRzQ29uZmlnOiBQYXJzZWRDb25maWd1cmF0aW9ufG51bGwsXG4gICAgcGF0aE1hcHBpbmdzOiBQYXRoTWFwcGluZ3N8dW5kZWZpbmVkKTogQ3JlYXRlQ29tcGlsZUZuIHtcbiAgcmV0dXJuIChiZWZvcmVXcml0aW5nRmlsZXMsIG9uVGFza0NvbXBsZXRlZCkgPT4ge1xuICAgIGNvbnN0IHtUcmFuc2Zvcm1lcn0gPSByZXF1aXJlKCcuLi9wYWNrYWdlcy90cmFuc2Zvcm1lcicpO1xuICAgIGNvbnN0IHRyYW5zZm9ybWVyID0gbmV3IFRyYW5zZm9ybWVyKGZpbGVTeXN0ZW0sIGxvZ2dlciwgdHNDb25maWcpO1xuICAgIGNvbnN0IHNoYXJlZEZpbGVDYWNoZSA9IG5ldyBTaGFyZWRGaWxlQ2FjaGUoZmlsZVN5c3RlbSk7XG4gICAgY29uc3QgbW9kdWxlUmVzb2x1dGlvbkNhY2hlID0gY3JlYXRlTW9kdWxlUmVzb2x1dGlvbkNhY2hlKGZpbGVTeXN0ZW0pO1xuXG4gICAgcmV0dXJuICh0YXNrOiBUYXNrKSA9PiB7XG4gICAgICBjb25zdCB7ZW50cnlQb2ludCwgZm9ybWF0UHJvcGVydHksIGZvcm1hdFByb3BlcnRpZXNUb01hcmtBc1Byb2Nlc3NlZCwgcHJvY2Vzc0R0c30gPSB0YXNrO1xuXG4gICAgICBjb25zdCBpc0NvcmUgPSBlbnRyeVBvaW50Lm5hbWUgPT09ICdAYW5ndWxhci9jb3JlJzsgIC8vIEFyZSB3ZSBjb21waWxpbmcgdGhlIEFuZ3VsYXIgY29yZT9cbiAgICAgIGNvbnN0IHBhY2thZ2VKc29uID0gZW50cnlQb2ludC5wYWNrYWdlSnNvbjtcbiAgICAgIGNvbnN0IGZvcm1hdFBhdGggPSBwYWNrYWdlSnNvbltmb3JtYXRQcm9wZXJ0eV07XG4gICAgICBjb25zdCBmb3JtYXQgPSBnZXRFbnRyeVBvaW50Rm9ybWF0KGZpbGVTeXN0ZW0sIGVudHJ5UG9pbnQsIGZvcm1hdFByb3BlcnR5KTtcblxuICAgICAgLy8gQWxsIHByb3BlcnRpZXMgbGlzdGVkIGluIGBwcm9wZXJ0aWVzVG9Qcm9jZXNzYCBhcmUgZ3VhcmFudGVlZCB0byBwb2ludCB0byBhIGZvcm1hdC1wYXRoXG4gICAgICAvLyAoaS5lLiB0aGV5IGFyZSBkZWZpbmVkIGluIGBlbnRyeVBvaW50LnBhY2thZ2VKc29uYCkuIEZ1cnRoZXJtb3JlLCB0aGV5IGFyZSBhbHNvIGd1YXJhbnRlZWRcbiAgICAgIC8vIHRvIGJlIGFtb25nIGBTVVBQT1JURURfRk9STUFUX1BST1BFUlRJRVNgLlxuICAgICAgLy8gQmFzZWQgb24gdGhlIGFib3ZlLCBgZm9ybWF0UGF0aGAgc2hvdWxkIGFsd2F5cyBiZSBkZWZpbmVkIGFuZCBgZ2V0RW50cnlQb2ludEZvcm1hdCgpYFxuICAgICAgLy8gc2hvdWxkIGFsd2F5cyByZXR1cm4gYSBmb3JtYXQgaGVyZSAoYW5kIG5vdCBgdW5kZWZpbmVkYCkgdW5sZXNzIGBmb3JtYXRQYXRoYCBwb2ludHMgdG8gYVxuICAgICAgLy8gbWlzc2luZyBvciBlbXB0eSBmaWxlLlxuICAgICAgaWYgKCFmb3JtYXRQYXRoIHx8ICFmb3JtYXQpIHtcbiAgICAgICAgb25UYXNrQ29tcGxldGVkKFxuICAgICAgICAgICAgdGFzaywgVGFza1Byb2Nlc3NpbmdPdXRjb21lLkZhaWxlZCxcbiAgICAgICAgICAgIGBwcm9wZXJ0eSBcXGAke2Zvcm1hdFByb3BlcnR5fVxcYCBwb2ludGluZyB0byBhIG1pc3Npbmcgb3IgZW1wdHkgZmlsZTogJHtmb3JtYXRQYXRofWApO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGxvZ2dlci5pbmZvKGBDb21waWxpbmcgJHtlbnRyeVBvaW50Lm5hbWV9IDogJHtmb3JtYXRQcm9wZXJ0eX0gYXMgJHtmb3JtYXR9YCk7XG5cbiAgICAgIGNvbnN0IGJ1bmRsZSA9IG1ha2VFbnRyeVBvaW50QnVuZGxlKFxuICAgICAgICAgIGZpbGVTeXN0ZW0sIGVudHJ5UG9pbnQsIHNoYXJlZEZpbGVDYWNoZSwgbW9kdWxlUmVzb2x1dGlvbkNhY2hlLCBmb3JtYXRQYXRoLCBpc0NvcmUsXG4gICAgICAgICAgZm9ybWF0LCBwcm9jZXNzRHRzLCBwYXRoTWFwcGluZ3MsIHRydWUsIGVuYWJsZUkxOG5MZWdhY3lNZXNzYWdlSWRGb3JtYXQpO1xuXG4gICAgICBjb25zdCByZXN1bHQgPSB0cmFuc2Zvcm1lci50cmFuc2Zvcm0oYnVuZGxlKTtcbiAgICAgIGlmIChyZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICBpZiAocmVzdWx0LmRpYWdub3N0aWNzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBsb2dnZXIud2FybihyZXBsYWNlVHNXaXRoTmdJbkVycm9ycyhcbiAgICAgICAgICAgICAgdHMuZm9ybWF0RGlhZ25vc3RpY3NXaXRoQ29sb3JBbmRDb250ZXh0KHJlc3VsdC5kaWFnbm9zdGljcywgYnVuZGxlLnNyYy5ob3N0KSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgd3JpdGVCdW5kbGUgPSAoKSA9PiB7XG4gICAgICAgICAgZmlsZVdyaXRlci53cml0ZUJ1bmRsZShcbiAgICAgICAgICAgICAgYnVuZGxlLCByZXN1bHQudHJhbnNmb3JtZWRGaWxlcywgZm9ybWF0UHJvcGVydGllc1RvTWFya0FzUHJvY2Vzc2VkKTtcblxuICAgICAgICAgIGxvZ2dlci5kZWJ1ZyhgICBTdWNjZXNzZnVsbHkgY29tcGlsZWQgJHtlbnRyeVBvaW50Lm5hbWV9IDogJHtmb3JtYXRQcm9wZXJ0eX1gKTtcbiAgICAgICAgICBvblRhc2tDb21wbGV0ZWQodGFzaywgVGFza1Byb2Nlc3NpbmdPdXRjb21lLlByb2Nlc3NlZCwgbnVsbCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgYmVmb3JlV3JpdGluZ1Jlc3VsdCA9IGJlZm9yZVdyaXRpbmdGaWxlcyhyZXN1bHQudHJhbnNmb3JtZWRGaWxlcyk7XG5cbiAgICAgICAgcmV0dXJuIChiZWZvcmVXcml0aW5nUmVzdWx0IGluc3RhbmNlb2YgUHJvbWlzZSkgP1xuICAgICAgICAgICAgYmVmb3JlV3JpdGluZ1Jlc3VsdC50aGVuKHdyaXRlQnVuZGxlKSBhcyBSZXR1cm5UeXBlPHR5cGVvZiBiZWZvcmVXcml0aW5nRmlsZXM+OlxuICAgICAgICAgICAgd3JpdGVCdW5kbGUoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGVycm9ycyA9IHJlcGxhY2VUc1dpdGhOZ0luRXJyb3JzKFxuICAgICAgICAgICAgdHMuZm9ybWF0RGlhZ25vc3RpY3NXaXRoQ29sb3JBbmRDb250ZXh0KHJlc3VsdC5kaWFnbm9zdGljcywgYnVuZGxlLnNyYy5ob3N0KSk7XG4gICAgICAgIG9uVGFza0NvbXBsZXRlZCh0YXNrLCBUYXNrUHJvY2Vzc2luZ091dGNvbWUuRmFpbGVkLCBgY29tcGlsYXRpb24gZXJyb3JzOlxcbiR7ZXJyb3JzfWApO1xuICAgICAgfVxuICAgIH07XG4gIH07XG59XG4iXX0=