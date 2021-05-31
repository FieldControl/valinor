(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/packages/entry_point_bundle", ["require", "exports", "tslib", "@angular/compiler-cli/ngcc/src/execution/tasks/api", "@angular/compiler-cli/ngcc/src/packages/bundle_program", "@angular/compiler-cli/ngcc/src/packages/ngcc_compiler_host", "@angular/compiler-cli/ngcc/src/packages/source_file_cache"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.makeEntryPointBundle = void 0;
    var tslib_1 = require("tslib");
    var api_1 = require("@angular/compiler-cli/ngcc/src/execution/tasks/api");
    var bundle_program_1 = require("@angular/compiler-cli/ngcc/src/packages/bundle_program");
    var ngcc_compiler_host_1 = require("@angular/compiler-cli/ngcc/src/packages/ngcc_compiler_host");
    var source_file_cache_1 = require("@angular/compiler-cli/ngcc/src/packages/source_file_cache");
    /**
     * Get an object that describes a formatted bundle for an entry-point.
     * @param fs The current file-system being used.
     * @param entryPoint The entry-point that contains the bundle.
     * @param sharedFileCache The cache to use for source files that are shared across all entry-points.
     * @param moduleResolutionCache The module resolution cache to use.
     * @param formatPath The path to the source files for this bundle.
     * @param isCore This entry point is the Angular core package.
     * @param format The underlying format of the bundle.
     * @param dtsProcessing Whether to transform the typings along with this bundle.
     * @param pathMappings An optional set of mappings to use when compiling files.
     * @param mirrorDtsFromSrc If true then the `dts` program will contain additional files that
     * were guessed by mapping the `src` files to `dts` files.
     * @param enableI18nLegacyMessageIdFormat Whether to render legacy message ids for i18n messages in
     * component templates.
     */
    function makeEntryPointBundle(fs, entryPoint, sharedFileCache, moduleResolutionCache, formatPath, isCore, format, dtsProcessing, pathMappings, mirrorDtsFromSrc, enableI18nLegacyMessageIdFormat) {
        if (mirrorDtsFromSrc === void 0) { mirrorDtsFromSrc = false; }
        if (enableI18nLegacyMessageIdFormat === void 0) { enableI18nLegacyMessageIdFormat = true; }
        // Create the TS program and necessary helpers.
        var rootDir = entryPoint.packagePath;
        var options = tslib_1.__assign({ allowJs: true, maxNodeModuleJsDepth: Infinity, rootDir: rootDir }, pathMappings);
        var entryPointCache = new source_file_cache_1.EntryPointFileCache(fs, sharedFileCache);
        var dtsHost = new ngcc_compiler_host_1.NgccDtsCompilerHost(fs, options, entryPointCache, moduleResolutionCache);
        var srcHost = new ngcc_compiler_host_1.NgccSourcesCompilerHost(fs, options, entryPointCache, moduleResolutionCache, entryPoint.packagePath);
        // Create the bundle programs, as necessary.
        var absFormatPath = fs.resolve(entryPoint.path, formatPath);
        var typingsPath = fs.resolve(entryPoint.path, entryPoint.typings);
        var src = bundle_program_1.makeBundleProgram(fs, isCore, entryPoint.packagePath, absFormatPath, 'r3_symbols.js', options, srcHost);
        var additionalDtsFiles = dtsProcessing !== api_1.DtsProcessing.No && mirrorDtsFromSrc ?
            computePotentialDtsFilesFromJsFiles(fs, src.program, absFormatPath, typingsPath) :
            [];
        var dts = dtsProcessing !== api_1.DtsProcessing.No ?
            bundle_program_1.makeBundleProgram(fs, isCore, entryPoint.packagePath, typingsPath, 'r3_symbols.d.ts', tslib_1.__assign(tslib_1.__assign({}, options), { allowJs: false }), dtsHost, additionalDtsFiles) :
            null;
        var isFlatCore = isCore && src.r3SymbolsFile === null;
        return {
            entryPoint: entryPoint,
            format: format,
            rootDirs: [rootDir],
            isCore: isCore,
            isFlatCore: isFlatCore,
            src: src,
            dts: dts,
            dtsProcessing: dtsProcessing,
            enableI18nLegacyMessageIdFormat: enableI18nLegacyMessageIdFormat
        };
    }
    exports.makeEntryPointBundle = makeEntryPointBundle;
    function computePotentialDtsFilesFromJsFiles(fs, srcProgram, formatPath, typingsPath) {
        var e_1, _a;
        var formatRoot = fs.dirname(formatPath);
        var typingsRoot = fs.dirname(typingsPath);
        var additionalFiles = [];
        try {
            for (var _b = tslib_1.__values(srcProgram.getSourceFiles()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var sf = _c.value;
                if (!sf.fileName.endsWith('.js')) {
                    continue;
                }
                // Given a source file at e.g. `esm2015/src/some/nested/index.js`, try to resolve the
                // declaration file under the typings root in `src/some/nested/index.d.ts`.
                var mirroredDtsPath = fs.resolve(typingsRoot, fs.relative(formatRoot, sf.fileName.replace(/\.js$/, '.d.ts')));
                if (fs.exists(mirroredDtsPath)) {
                    additionalFiles.push(mirroredDtsPath);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return additionalFiles;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50cnlfcG9pbnRfYnVuZGxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL25nY2Mvc3JjL3BhY2thZ2VzL2VudHJ5X3BvaW50X2J1bmRsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0lBU0EsMEVBQXFEO0lBRXJELHlGQUFrRTtJQUVsRSxpR0FBa0Y7SUFDbEYsK0ZBQXlFO0lBa0J6RTs7Ozs7Ozs7Ozs7Ozs7O09BZUc7SUFDSCxTQUFnQixvQkFBb0IsQ0FDaEMsRUFBYyxFQUFFLFVBQXNCLEVBQUUsZUFBZ0MsRUFDeEUscUJBQStDLEVBQUUsVUFBa0IsRUFBRSxNQUFlLEVBQ3BGLE1BQXdCLEVBQUUsYUFBNEIsRUFBRSxZQUEyQixFQUNuRixnQkFBaUMsRUFDakMsK0JBQStDO1FBRC9DLGlDQUFBLEVBQUEsd0JBQWlDO1FBQ2pDLGdEQUFBLEVBQUEsc0NBQStDO1FBQ2pELCtDQUErQztRQUMvQyxJQUFNLE9BQU8sR0FBRyxVQUFVLENBQUMsV0FBVyxDQUFDO1FBQ3ZDLElBQU0sT0FBTyxzQkFDVyxPQUFPLEVBQUUsSUFBSSxFQUFFLG9CQUFvQixFQUFFLFFBQVEsRUFBRSxPQUFPLFNBQUEsSUFBSyxZQUFZLENBQUMsQ0FBQztRQUNqRyxJQUFNLGVBQWUsR0FBRyxJQUFJLHVDQUFtQixDQUFDLEVBQUUsRUFBRSxlQUFlLENBQUMsQ0FBQztRQUNyRSxJQUFNLE9BQU8sR0FBRyxJQUFJLHdDQUFtQixDQUFDLEVBQUUsRUFBRSxPQUFPLEVBQUUsZUFBZSxFQUFFLHFCQUFxQixDQUFDLENBQUM7UUFDN0YsSUFBTSxPQUFPLEdBQUcsSUFBSSw0Q0FBdUIsQ0FDdkMsRUFBRSxFQUFFLE9BQU8sRUFBRSxlQUFlLEVBQUUscUJBQXFCLEVBQUUsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBRWpGLDRDQUE0QztRQUM1QyxJQUFNLGFBQWEsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDOUQsSUFBTSxXQUFXLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNwRSxJQUFNLEdBQUcsR0FBRyxrQ0FBaUIsQ0FDekIsRUFBRSxFQUFFLE1BQU0sRUFBRSxVQUFVLENBQUMsV0FBVyxFQUFFLGFBQWEsRUFBRSxlQUFlLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzFGLElBQU0sa0JBQWtCLEdBQUcsYUFBYSxLQUFLLG1CQUFhLENBQUMsRUFBRSxJQUFJLGdCQUFnQixDQUFDLENBQUM7WUFDL0UsbUNBQW1DLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxPQUFPLEVBQUUsYUFBYSxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDbEYsRUFBRSxDQUFDO1FBQ1AsSUFBTSxHQUFHLEdBQUcsYUFBYSxLQUFLLG1CQUFhLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDNUMsa0NBQWlCLENBQ2IsRUFBRSxFQUFFLE1BQU0sRUFBRSxVQUFVLENBQUMsV0FBVyxFQUFFLFdBQVcsRUFBRSxpQkFBaUIsd0NBQzlELE9BQU8sS0FBRSxPQUFPLEVBQUUsS0FBSyxLQUFHLE9BQU8sRUFBRSxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7WUFDaEUsSUFBSSxDQUFDO1FBQ1QsSUFBTSxVQUFVLEdBQUcsTUFBTSxJQUFJLEdBQUcsQ0FBQyxhQUFhLEtBQUssSUFBSSxDQUFDO1FBRXhELE9BQU87WUFDTCxVQUFVLFlBQUE7WUFDVixNQUFNLFFBQUE7WUFDTixRQUFRLEVBQUUsQ0FBQyxPQUFPLENBQUM7WUFDbkIsTUFBTSxRQUFBO1lBQ04sVUFBVSxZQUFBO1lBQ1YsR0FBRyxLQUFBO1lBQ0gsR0FBRyxLQUFBO1lBQ0gsYUFBYSxlQUFBO1lBQ2IsK0JBQStCLGlDQUFBO1NBQ2hDLENBQUM7SUFDSixDQUFDO0lBekNELG9EQXlDQztJQUVELFNBQVMsbUNBQW1DLENBQ3hDLEVBQXNCLEVBQUUsVUFBc0IsRUFBRSxVQUEwQixFQUMxRSxXQUEyQjs7UUFDN0IsSUFBTSxVQUFVLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUMxQyxJQUFNLFdBQVcsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzVDLElBQU0sZUFBZSxHQUFxQixFQUFFLENBQUM7O1lBQzdDLEtBQWlCLElBQUEsS0FBQSxpQkFBQSxVQUFVLENBQUMsY0FBYyxFQUFFLENBQUEsZ0JBQUEsNEJBQUU7Z0JBQXpDLElBQU0sRUFBRSxXQUFBO2dCQUNYLElBQUksQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFBRTtvQkFDaEMsU0FBUztpQkFDVjtnQkFFRCxxRkFBcUY7Z0JBQ3JGLDJFQUEyRTtnQkFDM0UsSUFBTSxlQUFlLEdBQ2pCLEVBQUUsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzVGLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsRUFBRTtvQkFDOUIsZUFBZSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztpQkFDdkM7YUFDRjs7Ozs7Ozs7O1FBQ0QsT0FBTyxlQUFlLENBQUM7SUFDekIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5pbXBvcnQge0Fic29sdXRlRnNQYXRoLCBGaWxlU3lzdGVtLCBSZWFkb25seUZpbGVTeXN0ZW19IGZyb20gJy4uLy4uLy4uL3NyYy9uZ3RzYy9maWxlX3N5c3RlbSc7XG5pbXBvcnQge0R0c1Byb2Nlc3Npbmd9IGZyb20gJy4uL2V4ZWN1dGlvbi90YXNrcy9hcGknO1xuaW1wb3J0IHtQYXRoTWFwcGluZ3N9IGZyb20gJy4uL3BhdGhfbWFwcGluZ3MnO1xuaW1wb3J0IHtCdW5kbGVQcm9ncmFtLCBtYWtlQnVuZGxlUHJvZ3JhbX0gZnJvbSAnLi9idW5kbGVfcHJvZ3JhbSc7XG5pbXBvcnQge0VudHJ5UG9pbnQsIEVudHJ5UG9pbnRGb3JtYXR9IGZyb20gJy4vZW50cnlfcG9pbnQnO1xuaW1wb3J0IHtOZ2NjRHRzQ29tcGlsZXJIb3N0LCBOZ2NjU291cmNlc0NvbXBpbGVySG9zdH0gZnJvbSAnLi9uZ2NjX2NvbXBpbGVyX2hvc3QnO1xuaW1wb3J0IHtFbnRyeVBvaW50RmlsZUNhY2hlLCBTaGFyZWRGaWxlQ2FjaGV9IGZyb20gJy4vc291cmNlX2ZpbGVfY2FjaGUnO1xuXG4vKipcbiAqIEEgYnVuZGxlIG9mIGZpbGVzIGFuZCBwYXRocyAoYW5kIFRTIHByb2dyYW1zKSB0aGF0IGNvcnJlc3BvbmQgdG8gYSBwYXJ0aWN1bGFyXG4gKiBmb3JtYXQgb2YgYSBwYWNrYWdlIGVudHJ5LXBvaW50LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEVudHJ5UG9pbnRCdW5kbGUge1xuICBlbnRyeVBvaW50OiBFbnRyeVBvaW50O1xuICBmb3JtYXQ6IEVudHJ5UG9pbnRGb3JtYXQ7XG4gIGlzQ29yZTogYm9vbGVhbjtcbiAgaXNGbGF0Q29yZTogYm9vbGVhbjtcbiAgcm9vdERpcnM6IEFic29sdXRlRnNQYXRoW107XG4gIHNyYzogQnVuZGxlUHJvZ3JhbTtcbiAgZHRzOiBCdW5kbGVQcm9ncmFtfG51bGw7XG4gIGR0c1Byb2Nlc3Npbmc6IER0c1Byb2Nlc3Npbmc7XG4gIGVuYWJsZUkxOG5MZWdhY3lNZXNzYWdlSWRGb3JtYXQ6IGJvb2xlYW47XG59XG5cbi8qKlxuICogR2V0IGFuIG9iamVjdCB0aGF0IGRlc2NyaWJlcyBhIGZvcm1hdHRlZCBidW5kbGUgZm9yIGFuIGVudHJ5LXBvaW50LlxuICogQHBhcmFtIGZzIFRoZSBjdXJyZW50IGZpbGUtc3lzdGVtIGJlaW5nIHVzZWQuXG4gKiBAcGFyYW0gZW50cnlQb2ludCBUaGUgZW50cnktcG9pbnQgdGhhdCBjb250YWlucyB0aGUgYnVuZGxlLlxuICogQHBhcmFtIHNoYXJlZEZpbGVDYWNoZSBUaGUgY2FjaGUgdG8gdXNlIGZvciBzb3VyY2UgZmlsZXMgdGhhdCBhcmUgc2hhcmVkIGFjcm9zcyBhbGwgZW50cnktcG9pbnRzLlxuICogQHBhcmFtIG1vZHVsZVJlc29sdXRpb25DYWNoZSBUaGUgbW9kdWxlIHJlc29sdXRpb24gY2FjaGUgdG8gdXNlLlxuICogQHBhcmFtIGZvcm1hdFBhdGggVGhlIHBhdGggdG8gdGhlIHNvdXJjZSBmaWxlcyBmb3IgdGhpcyBidW5kbGUuXG4gKiBAcGFyYW0gaXNDb3JlIFRoaXMgZW50cnkgcG9pbnQgaXMgdGhlIEFuZ3VsYXIgY29yZSBwYWNrYWdlLlxuICogQHBhcmFtIGZvcm1hdCBUaGUgdW5kZXJseWluZyBmb3JtYXQgb2YgdGhlIGJ1bmRsZS5cbiAqIEBwYXJhbSBkdHNQcm9jZXNzaW5nIFdoZXRoZXIgdG8gdHJhbnNmb3JtIHRoZSB0eXBpbmdzIGFsb25nIHdpdGggdGhpcyBidW5kbGUuXG4gKiBAcGFyYW0gcGF0aE1hcHBpbmdzIEFuIG9wdGlvbmFsIHNldCBvZiBtYXBwaW5ncyB0byB1c2Ugd2hlbiBjb21waWxpbmcgZmlsZXMuXG4gKiBAcGFyYW0gbWlycm9yRHRzRnJvbVNyYyBJZiB0cnVlIHRoZW4gdGhlIGBkdHNgIHByb2dyYW0gd2lsbCBjb250YWluIGFkZGl0aW9uYWwgZmlsZXMgdGhhdFxuICogd2VyZSBndWVzc2VkIGJ5IG1hcHBpbmcgdGhlIGBzcmNgIGZpbGVzIHRvIGBkdHNgIGZpbGVzLlxuICogQHBhcmFtIGVuYWJsZUkxOG5MZWdhY3lNZXNzYWdlSWRGb3JtYXQgV2hldGhlciB0byByZW5kZXIgbGVnYWN5IG1lc3NhZ2UgaWRzIGZvciBpMThuIG1lc3NhZ2VzIGluXG4gKiBjb21wb25lbnQgdGVtcGxhdGVzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbWFrZUVudHJ5UG9pbnRCdW5kbGUoXG4gICAgZnM6IEZpbGVTeXN0ZW0sIGVudHJ5UG9pbnQ6IEVudHJ5UG9pbnQsIHNoYXJlZEZpbGVDYWNoZTogU2hhcmVkRmlsZUNhY2hlLFxuICAgIG1vZHVsZVJlc29sdXRpb25DYWNoZTogdHMuTW9kdWxlUmVzb2x1dGlvbkNhY2hlLCBmb3JtYXRQYXRoOiBzdHJpbmcsIGlzQ29yZTogYm9vbGVhbixcbiAgICBmb3JtYXQ6IEVudHJ5UG9pbnRGb3JtYXQsIGR0c1Byb2Nlc3Npbmc6IER0c1Byb2Nlc3NpbmcsIHBhdGhNYXBwaW5ncz86IFBhdGhNYXBwaW5ncyxcbiAgICBtaXJyb3JEdHNGcm9tU3JjOiBib29sZWFuID0gZmFsc2UsXG4gICAgZW5hYmxlSTE4bkxlZ2FjeU1lc3NhZ2VJZEZvcm1hdDogYm9vbGVhbiA9IHRydWUpOiBFbnRyeVBvaW50QnVuZGxlIHtcbiAgLy8gQ3JlYXRlIHRoZSBUUyBwcm9ncmFtIGFuZCBuZWNlc3NhcnkgaGVscGVycy5cbiAgY29uc3Qgcm9vdERpciA9IGVudHJ5UG9pbnQucGFja2FnZVBhdGg7XG4gIGNvbnN0IG9wdGlvbnM6IHRzXG4gICAgICAuQ29tcGlsZXJPcHRpb25zID0ge2FsbG93SnM6IHRydWUsIG1heE5vZGVNb2R1bGVKc0RlcHRoOiBJbmZpbml0eSwgcm9vdERpciwgLi4ucGF0aE1hcHBpbmdzfTtcbiAgY29uc3QgZW50cnlQb2ludENhY2hlID0gbmV3IEVudHJ5UG9pbnRGaWxlQ2FjaGUoZnMsIHNoYXJlZEZpbGVDYWNoZSk7XG4gIGNvbnN0IGR0c0hvc3QgPSBuZXcgTmdjY0R0c0NvbXBpbGVySG9zdChmcywgb3B0aW9ucywgZW50cnlQb2ludENhY2hlLCBtb2R1bGVSZXNvbHV0aW9uQ2FjaGUpO1xuICBjb25zdCBzcmNIb3N0ID0gbmV3IE5nY2NTb3VyY2VzQ29tcGlsZXJIb3N0KFxuICAgICAgZnMsIG9wdGlvbnMsIGVudHJ5UG9pbnRDYWNoZSwgbW9kdWxlUmVzb2x1dGlvbkNhY2hlLCBlbnRyeVBvaW50LnBhY2thZ2VQYXRoKTtcblxuICAvLyBDcmVhdGUgdGhlIGJ1bmRsZSBwcm9ncmFtcywgYXMgbmVjZXNzYXJ5LlxuICBjb25zdCBhYnNGb3JtYXRQYXRoID0gZnMucmVzb2x2ZShlbnRyeVBvaW50LnBhdGgsIGZvcm1hdFBhdGgpO1xuICBjb25zdCB0eXBpbmdzUGF0aCA9IGZzLnJlc29sdmUoZW50cnlQb2ludC5wYXRoLCBlbnRyeVBvaW50LnR5cGluZ3MpO1xuICBjb25zdCBzcmMgPSBtYWtlQnVuZGxlUHJvZ3JhbShcbiAgICAgIGZzLCBpc0NvcmUsIGVudHJ5UG9pbnQucGFja2FnZVBhdGgsIGFic0Zvcm1hdFBhdGgsICdyM19zeW1ib2xzLmpzJywgb3B0aW9ucywgc3JjSG9zdCk7XG4gIGNvbnN0IGFkZGl0aW9uYWxEdHNGaWxlcyA9IGR0c1Byb2Nlc3NpbmcgIT09IER0c1Byb2Nlc3NpbmcuTm8gJiYgbWlycm9yRHRzRnJvbVNyYyA/XG4gICAgICBjb21wdXRlUG90ZW50aWFsRHRzRmlsZXNGcm9tSnNGaWxlcyhmcywgc3JjLnByb2dyYW0sIGFic0Zvcm1hdFBhdGgsIHR5cGluZ3NQYXRoKSA6XG4gICAgICBbXTtcbiAgY29uc3QgZHRzID0gZHRzUHJvY2Vzc2luZyAhPT0gRHRzUHJvY2Vzc2luZy5ObyA/XG4gICAgICBtYWtlQnVuZGxlUHJvZ3JhbShcbiAgICAgICAgICBmcywgaXNDb3JlLCBlbnRyeVBvaW50LnBhY2thZ2VQYXRoLCB0eXBpbmdzUGF0aCwgJ3IzX3N5bWJvbHMuZC50cycsXG4gICAgICAgICAgey4uLm9wdGlvbnMsIGFsbG93SnM6IGZhbHNlfSwgZHRzSG9zdCwgYWRkaXRpb25hbER0c0ZpbGVzKSA6XG4gICAgICBudWxsO1xuICBjb25zdCBpc0ZsYXRDb3JlID0gaXNDb3JlICYmIHNyYy5yM1N5bWJvbHNGaWxlID09PSBudWxsO1xuXG4gIHJldHVybiB7XG4gICAgZW50cnlQb2ludCxcbiAgICBmb3JtYXQsXG4gICAgcm9vdERpcnM6IFtyb290RGlyXSxcbiAgICBpc0NvcmUsXG4gICAgaXNGbGF0Q29yZSxcbiAgICBzcmMsXG4gICAgZHRzLFxuICAgIGR0c1Byb2Nlc3NpbmcsXG4gICAgZW5hYmxlSTE4bkxlZ2FjeU1lc3NhZ2VJZEZvcm1hdFxuICB9O1xufVxuXG5mdW5jdGlvbiBjb21wdXRlUG90ZW50aWFsRHRzRmlsZXNGcm9tSnNGaWxlcyhcbiAgICBmczogUmVhZG9ubHlGaWxlU3lzdGVtLCBzcmNQcm9ncmFtOiB0cy5Qcm9ncmFtLCBmb3JtYXRQYXRoOiBBYnNvbHV0ZUZzUGF0aCxcbiAgICB0eXBpbmdzUGF0aDogQWJzb2x1dGVGc1BhdGgpIHtcbiAgY29uc3QgZm9ybWF0Um9vdCA9IGZzLmRpcm5hbWUoZm9ybWF0UGF0aCk7XG4gIGNvbnN0IHR5cGluZ3NSb290ID0gZnMuZGlybmFtZSh0eXBpbmdzUGF0aCk7XG4gIGNvbnN0IGFkZGl0aW9uYWxGaWxlczogQWJzb2x1dGVGc1BhdGhbXSA9IFtdO1xuICBmb3IgKGNvbnN0IHNmIG9mIHNyY1Byb2dyYW0uZ2V0U291cmNlRmlsZXMoKSkge1xuICAgIGlmICghc2YuZmlsZU5hbWUuZW5kc1dpdGgoJy5qcycpKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBHaXZlbiBhIHNvdXJjZSBmaWxlIGF0IGUuZy4gYGVzbTIwMTUvc3JjL3NvbWUvbmVzdGVkL2luZGV4LmpzYCwgdHJ5IHRvIHJlc29sdmUgdGhlXG4gICAgLy8gZGVjbGFyYXRpb24gZmlsZSB1bmRlciB0aGUgdHlwaW5ncyByb290IGluIGBzcmMvc29tZS9uZXN0ZWQvaW5kZXguZC50c2AuXG4gICAgY29uc3QgbWlycm9yZWREdHNQYXRoID1cbiAgICAgICAgZnMucmVzb2x2ZSh0eXBpbmdzUm9vdCwgZnMucmVsYXRpdmUoZm9ybWF0Um9vdCwgc2YuZmlsZU5hbWUucmVwbGFjZSgvXFwuanMkLywgJy5kLnRzJykpKTtcbiAgICBpZiAoZnMuZXhpc3RzKG1pcnJvcmVkRHRzUGF0aCkpIHtcbiAgICAgIGFkZGl0aW9uYWxGaWxlcy5wdXNoKG1pcnJvcmVkRHRzUGF0aCk7XG4gICAgfVxuICB9XG4gIHJldHVybiBhZGRpdGlvbmFsRmlsZXM7XG59XG4iXX0=