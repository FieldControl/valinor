(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/packages/bundle_program", ["require", "exports", "tslib", "typescript", "@angular/compiler-cli/ngcc/src/packages/patch_ts_expando_initializer"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.findR3SymbolsPath = exports.makeBundleProgram = void 0;
    var tslib_1 = require("tslib");
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var ts = require("typescript");
    var patch_ts_expando_initializer_1 = require("@angular/compiler-cli/ngcc/src/packages/patch_ts_expando_initializer");
    /**
     * Create a bundle program.
     */
    function makeBundleProgram(fs, isCore, pkg, path, r3FileName, options, host, additionalFiles) {
        if (additionalFiles === void 0) { additionalFiles = []; }
        var r3SymbolsPath = isCore ? findR3SymbolsPath(fs, fs.dirname(path), r3FileName) : null;
        var rootPaths = r3SymbolsPath ? tslib_1.__spreadArray([path, r3SymbolsPath], tslib_1.__read(additionalFiles)) : tslib_1.__spreadArray([path], tslib_1.__read(additionalFiles));
        var originalGetExpandoInitializer = patch_ts_expando_initializer_1.patchTsGetExpandoInitializer();
        var program = ts.createProgram(rootPaths, options, host);
        // Ask for the typeChecker to trigger the binding phase of the compilation.
        // This will then exercise the patched function.
        program.getTypeChecker();
        patch_ts_expando_initializer_1.restoreGetExpandoInitializer(originalGetExpandoInitializer);
        var file = program.getSourceFile(path);
        var r3SymbolsFile = r3SymbolsPath && program.getSourceFile(r3SymbolsPath) || null;
        return { program: program, options: options, host: host, package: pkg, path: path, file: file, r3SymbolsPath: r3SymbolsPath, r3SymbolsFile: r3SymbolsFile };
    }
    exports.makeBundleProgram = makeBundleProgram;
    /**
     * Search the given directory hierarchy to find the path to the `r3_symbols` file.
     */
    function findR3SymbolsPath(fs, directory, filename) {
        var e_1, _a;
        var r3SymbolsFilePath = fs.resolve(directory, filename);
        if (fs.exists(r3SymbolsFilePath)) {
            return r3SymbolsFilePath;
        }
        var subDirectories = fs.readdir(directory)
            // Not interested in hidden files
            .filter(function (p) { return !p.startsWith('.'); })
            // Ignore node_modules
            .filter(function (p) { return p !== 'node_modules'; })
            // Only interested in directories (and only those that are not symlinks)
            .filter(function (p) {
            var stat = fs.lstat(fs.resolve(directory, p));
            return stat.isDirectory() && !stat.isSymbolicLink();
        });
        try {
            for (var subDirectories_1 = tslib_1.__values(subDirectories), subDirectories_1_1 = subDirectories_1.next(); !subDirectories_1_1.done; subDirectories_1_1 = subDirectories_1.next()) {
                var subDirectory = subDirectories_1_1.value;
                var r3SymbolsFilePath_1 = findR3SymbolsPath(fs, fs.resolve(directory, subDirectory), filename);
                if (r3SymbolsFilePath_1) {
                    return r3SymbolsFilePath_1;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (subDirectories_1_1 && !subDirectories_1_1.done && (_a = subDirectories_1.return)) _a.call(subDirectories_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return null;
    }
    exports.findR3SymbolsPath = findR3SymbolsPath;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlX3Byb2dyYW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvbmdjYy9zcmMvcGFja2FnZXMvYnVuZGxlX3Byb2dyYW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztJQUFBOzs7Ozs7T0FNRztJQUNILCtCQUFpQztJQUlqQyxxSEFBMEc7SUFxQjFHOztPQUVHO0lBQ0gsU0FBZ0IsaUJBQWlCLENBQzdCLEVBQXNCLEVBQUUsTUFBZSxFQUFFLEdBQW1CLEVBQUUsSUFBb0IsRUFDbEYsVUFBa0IsRUFBRSxPQUEyQixFQUFFLElBQXFCLEVBQ3RFLGVBQXNDO1FBQXRDLGdDQUFBLEVBQUEsb0JBQXNDO1FBQ3hDLElBQU0sYUFBYSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUMxRixJQUFJLFNBQVMsR0FDVCxhQUFhLENBQUMsQ0FBQyx3QkFBRSxJQUFJLEVBQUUsYUFBYSxrQkFBSyxlQUFlLEdBQUUsQ0FBQyx3QkFBRSxJQUFJLGtCQUFLLGVBQWUsRUFBQyxDQUFDO1FBRTNGLElBQU0sNkJBQTZCLEdBQUcsMkRBQTRCLEVBQUUsQ0FBQztRQUNyRSxJQUFNLE9BQU8sR0FBRyxFQUFFLENBQUMsYUFBYSxDQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDM0QsMkVBQTJFO1FBQzNFLGdEQUFnRDtRQUNoRCxPQUFPLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDekIsMkRBQTRCLENBQUMsNkJBQTZCLENBQUMsQ0FBQztRQUU1RCxJQUFNLElBQUksR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBRSxDQUFDO1FBQzFDLElBQU0sYUFBYSxHQUFHLGFBQWEsSUFBSSxPQUFPLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxJQUFJLElBQUksQ0FBQztRQUVwRixPQUFPLEVBQUMsT0FBTyxTQUFBLEVBQUUsT0FBTyxTQUFBLEVBQUUsSUFBSSxNQUFBLEVBQUUsT0FBTyxFQUFFLEdBQUcsRUFBRSxJQUFJLE1BQUEsRUFBRSxJQUFJLE1BQUEsRUFBRSxhQUFhLGVBQUEsRUFBRSxhQUFhLGVBQUEsRUFBQyxDQUFDO0lBQzFGLENBQUM7SUFuQkQsOENBbUJDO0lBRUQ7O09BRUc7SUFDSCxTQUFnQixpQkFBaUIsQ0FDN0IsRUFBc0IsRUFBRSxTQUF5QixFQUFFLFFBQWdCOztRQUNyRSxJQUFNLGlCQUFpQixHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQzFELElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFO1lBQ2hDLE9BQU8saUJBQWlCLENBQUM7U0FDMUI7UUFFRCxJQUFNLGNBQWMsR0FDaEIsRUFBRSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUM7WUFDakIsaUNBQWlDO2FBQ2hDLE1BQU0sQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsRUFBbEIsQ0FBa0IsQ0FBQztZQUNoQyxzQkFBc0I7YUFDckIsTUFBTSxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxLQUFLLGNBQWMsRUFBcEIsQ0FBb0IsQ0FBQztZQUNsQyx3RUFBd0U7YUFDdkUsTUFBTSxDQUFDLFVBQUEsQ0FBQztZQUNQLElBQU0sSUFBSSxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNoRCxPQUFPLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUN0RCxDQUFDLENBQUMsQ0FBQzs7WUFFWCxLQUEyQixJQUFBLG1CQUFBLGlCQUFBLGNBQWMsQ0FBQSw4Q0FBQSwwRUFBRTtnQkFBdEMsSUFBTSxZQUFZLDJCQUFBO2dCQUNyQixJQUFNLG1CQUFpQixHQUFHLGlCQUFpQixDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxZQUFZLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFDL0YsSUFBSSxtQkFBaUIsRUFBRTtvQkFDckIsT0FBTyxtQkFBaUIsQ0FBQztpQkFDMUI7YUFDRjs7Ozs7Ozs7O1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBM0JELDhDQTJCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7QWJzb2x1dGVGc1BhdGgsIFJlYWRvbmx5RmlsZVN5c3RlbX0gZnJvbSAnLi4vLi4vLi4vc3JjL25ndHNjL2ZpbGVfc3lzdGVtJztcblxuaW1wb3J0IHtwYXRjaFRzR2V0RXhwYW5kb0luaXRpYWxpemVyLCByZXN0b3JlR2V0RXhwYW5kb0luaXRpYWxpemVyfSBmcm9tICcuL3BhdGNoX3RzX2V4cGFuZG9faW5pdGlhbGl6ZXInO1xuXG4vKipcbiAqIEFuIGVudHJ5IHBvaW50IGJ1bmRsZSBjb250YWlucyBvbmUgb3IgdHdvIHByb2dyYW1zLCBlLmcuIGBzcmNgIGFuZCBgZHRzYCxcbiAqIHRoYXQgYXJlIGNvbXBpbGVkIHZpYSBUeXBlU2NyaXB0LlxuICpcbiAqIFRvIGFpZCB3aXRoIHByb2Nlc3NpbmcgdGhlIHByb2dyYW0sIHRoaXMgaW50ZXJmYWNlIGV4cG9zZXMgdGhlIHByb2dyYW0gaXRzZWxmLFxuICogYXMgd2VsbCBhcyBwYXRoIGFuZCBUUyBmaWxlIG9mIHRoZSBlbnRyeS1wb2ludCB0byB0aGUgcHJvZ3JhbSBhbmQgdGhlIHIzU3ltYm9sc1xuICogZmlsZSwgaWYgYXBwcm9wcmlhdGUuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQnVuZGxlUHJvZ3JhbSB7XG4gIHByb2dyYW06IHRzLlByb2dyYW07XG4gIG9wdGlvbnM6IHRzLkNvbXBpbGVyT3B0aW9ucztcbiAgaG9zdDogdHMuQ29tcGlsZXJIb3N0O1xuICBwYXRoOiBBYnNvbHV0ZUZzUGF0aDtcbiAgZmlsZTogdHMuU291cmNlRmlsZTtcbiAgcGFja2FnZTogQWJzb2x1dGVGc1BhdGg7XG4gIHIzU3ltYm9sc1BhdGg6IEFic29sdXRlRnNQYXRofG51bGw7XG4gIHIzU3ltYm9sc0ZpbGU6IHRzLlNvdXJjZUZpbGV8bnVsbDtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBidW5kbGUgcHJvZ3JhbS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1ha2VCdW5kbGVQcm9ncmFtKFxuICAgIGZzOiBSZWFkb25seUZpbGVTeXN0ZW0sIGlzQ29yZTogYm9vbGVhbiwgcGtnOiBBYnNvbHV0ZUZzUGF0aCwgcGF0aDogQWJzb2x1dGVGc1BhdGgsXG4gICAgcjNGaWxlTmFtZTogc3RyaW5nLCBvcHRpb25zOiB0cy5Db21waWxlck9wdGlvbnMsIGhvc3Q6IHRzLkNvbXBpbGVySG9zdCxcbiAgICBhZGRpdGlvbmFsRmlsZXM6IEFic29sdXRlRnNQYXRoW10gPSBbXSk6IEJ1bmRsZVByb2dyYW0ge1xuICBjb25zdCByM1N5bWJvbHNQYXRoID0gaXNDb3JlID8gZmluZFIzU3ltYm9sc1BhdGgoZnMsIGZzLmRpcm5hbWUocGF0aCksIHIzRmlsZU5hbWUpIDogbnVsbDtcbiAgbGV0IHJvb3RQYXRocyA9XG4gICAgICByM1N5bWJvbHNQYXRoID8gW3BhdGgsIHIzU3ltYm9sc1BhdGgsIC4uLmFkZGl0aW9uYWxGaWxlc10gOiBbcGF0aCwgLi4uYWRkaXRpb25hbEZpbGVzXTtcblxuICBjb25zdCBvcmlnaW5hbEdldEV4cGFuZG9Jbml0aWFsaXplciA9IHBhdGNoVHNHZXRFeHBhbmRvSW5pdGlhbGl6ZXIoKTtcbiAgY29uc3QgcHJvZ3JhbSA9IHRzLmNyZWF0ZVByb2dyYW0ocm9vdFBhdGhzLCBvcHRpb25zLCBob3N0KTtcbiAgLy8gQXNrIGZvciB0aGUgdHlwZUNoZWNrZXIgdG8gdHJpZ2dlciB0aGUgYmluZGluZyBwaGFzZSBvZiB0aGUgY29tcGlsYXRpb24uXG4gIC8vIFRoaXMgd2lsbCB0aGVuIGV4ZXJjaXNlIHRoZSBwYXRjaGVkIGZ1bmN0aW9uLlxuICBwcm9ncmFtLmdldFR5cGVDaGVja2VyKCk7XG4gIHJlc3RvcmVHZXRFeHBhbmRvSW5pdGlhbGl6ZXIob3JpZ2luYWxHZXRFeHBhbmRvSW5pdGlhbGl6ZXIpO1xuXG4gIGNvbnN0IGZpbGUgPSBwcm9ncmFtLmdldFNvdXJjZUZpbGUocGF0aCkhO1xuICBjb25zdCByM1N5bWJvbHNGaWxlID0gcjNTeW1ib2xzUGF0aCAmJiBwcm9ncmFtLmdldFNvdXJjZUZpbGUocjNTeW1ib2xzUGF0aCkgfHwgbnVsbDtcblxuICByZXR1cm4ge3Byb2dyYW0sIG9wdGlvbnMsIGhvc3QsIHBhY2thZ2U6IHBrZywgcGF0aCwgZmlsZSwgcjNTeW1ib2xzUGF0aCwgcjNTeW1ib2xzRmlsZX07XG59XG5cbi8qKlxuICogU2VhcmNoIHRoZSBnaXZlbiBkaXJlY3RvcnkgaGllcmFyY2h5IHRvIGZpbmQgdGhlIHBhdGggdG8gdGhlIGByM19zeW1ib2xzYCBmaWxlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZmluZFIzU3ltYm9sc1BhdGgoXG4gICAgZnM6IFJlYWRvbmx5RmlsZVN5c3RlbSwgZGlyZWN0b3J5OiBBYnNvbHV0ZUZzUGF0aCwgZmlsZW5hbWU6IHN0cmluZyk6IEFic29sdXRlRnNQYXRofG51bGwge1xuICBjb25zdCByM1N5bWJvbHNGaWxlUGF0aCA9IGZzLnJlc29sdmUoZGlyZWN0b3J5LCBmaWxlbmFtZSk7XG4gIGlmIChmcy5leGlzdHMocjNTeW1ib2xzRmlsZVBhdGgpKSB7XG4gICAgcmV0dXJuIHIzU3ltYm9sc0ZpbGVQYXRoO1xuICB9XG5cbiAgY29uc3Qgc3ViRGlyZWN0b3JpZXMgPVxuICAgICAgZnMucmVhZGRpcihkaXJlY3RvcnkpXG4gICAgICAgICAgLy8gTm90IGludGVyZXN0ZWQgaW4gaGlkZGVuIGZpbGVzXG4gICAgICAgICAgLmZpbHRlcihwID0+ICFwLnN0YXJ0c1dpdGgoJy4nKSlcbiAgICAgICAgICAvLyBJZ25vcmUgbm9kZV9tb2R1bGVzXG4gICAgICAgICAgLmZpbHRlcihwID0+IHAgIT09ICdub2RlX21vZHVsZXMnKVxuICAgICAgICAgIC8vIE9ubHkgaW50ZXJlc3RlZCBpbiBkaXJlY3RvcmllcyAoYW5kIG9ubHkgdGhvc2UgdGhhdCBhcmUgbm90IHN5bWxpbmtzKVxuICAgICAgICAgIC5maWx0ZXIocCA9PiB7XG4gICAgICAgICAgICBjb25zdCBzdGF0ID0gZnMubHN0YXQoZnMucmVzb2x2ZShkaXJlY3RvcnksIHApKTtcbiAgICAgICAgICAgIHJldHVybiBzdGF0LmlzRGlyZWN0b3J5KCkgJiYgIXN0YXQuaXNTeW1ib2xpY0xpbmsoKTtcbiAgICAgICAgICB9KTtcblxuICBmb3IgKGNvbnN0IHN1YkRpcmVjdG9yeSBvZiBzdWJEaXJlY3Rvcmllcykge1xuICAgIGNvbnN0IHIzU3ltYm9sc0ZpbGVQYXRoID0gZmluZFIzU3ltYm9sc1BhdGgoZnMsIGZzLnJlc29sdmUoZGlyZWN0b3J5LCBzdWJEaXJlY3RvcnkpLCBmaWxlbmFtZSk7XG4gICAgaWYgKHIzU3ltYm9sc0ZpbGVQYXRoKSB7XG4gICAgICByZXR1cm4gcjNTeW1ib2xzRmlsZVBhdGg7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59XG4iXX0=