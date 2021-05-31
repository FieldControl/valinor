(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/core/schematics/utils/typescript/compiler_host", ["require", "exports", "path", "typescript", "@angular/core/schematics/utils/typescript/parse_tsconfig"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.canMigrateFile = exports.createMigrationCompilerHost = exports.createMigrationProgram = void 0;
    const path_1 = require("path");
    const ts = require("typescript");
    const parse_tsconfig_1 = require("@angular/core/schematics/utils/typescript/parse_tsconfig");
    /**
     * Creates a TypeScript program instance for a TypeScript project within
     * the virtual file system tree.
     * @param tree Virtual file system tree that contains the source files.
     * @param tsconfigPath Virtual file system path that resolves to the TypeScript project.
     * @param basePath Base path for the virtual file system tree.
     * @param fakeFileRead Optional file reader function. Can be used to overwrite files in
     *   the TypeScript program, or to add in-memory files (e.g. to add global types).
     * @param additionalFiles Additional file paths that should be added to the program.
     */
    function createMigrationProgram(tree, tsconfigPath, basePath, fakeFileRead, additionalFiles) {
        // Resolve the tsconfig path to an absolute path. This is needed as TypeScript otherwise
        // is not able to resolve root directories in the given tsconfig. More details can be found
        // in the following issue: https://github.com/microsoft/TypeScript/issues/37731.
        tsconfigPath = path_1.resolve(basePath, tsconfigPath);
        const parsed = parse_tsconfig_1.parseTsconfigFile(tsconfigPath, path_1.dirname(tsconfigPath));
        const host = createMigrationCompilerHost(tree, parsed.options, basePath, fakeFileRead);
        const program = ts.createProgram(parsed.fileNames.concat(additionalFiles || []), parsed.options, host);
        return { parsed, host, program };
    }
    exports.createMigrationProgram = createMigrationProgram;
    function createMigrationCompilerHost(tree, options, basePath, fakeRead) {
        const host = ts.createCompilerHost(options, true);
        const defaultReadFile = host.readFile;
        // We need to overwrite the host "readFile" method, as we want the TypeScript
        // program to be based on the file contents in the virtual file tree. Otherwise
        // if we run multiple migrations we might have intersecting changes and
        // source files.
        host.readFile = fileName => {
            var _a;
            const treeRelativePath = path_1.relative(basePath, fileName);
            let result = fakeRead === null || fakeRead === void 0 ? void 0 : fakeRead(treeRelativePath);
            if (result === undefined) {
                // If the relative path resolved to somewhere outside of the tree, fall back to
                // TypeScript's default file reading function since the `tree` will throw an error.
                result = treeRelativePath.startsWith('..') ? defaultReadFile.call(host, fileName) :
                    (_a = tree.read(treeRelativePath)) === null || _a === void 0 ? void 0 : _a.toString();
            }
            // Strip BOM as otherwise TSC methods (Ex: getWidth) will return an offset,
            // which breaks the CLI UpdateRecorder.
            // See: https://github.com/angular/angular/pull/30719
            return result ? result.replace(/^\uFEFF/, '') : undefined;
        };
        return host;
    }
    exports.createMigrationCompilerHost = createMigrationCompilerHost;
    /**
     * Checks whether a file can be migrate by our automated migrations.
     * @param basePath Absolute path to the project.
     * @param sourceFile File being checked.
     * @param program Program that includes the source file.
     */
    function canMigrateFile(basePath, sourceFile, program) {
        // We shouldn't migrate .d.ts files or files from an external library.
        if (sourceFile.isDeclarationFile || program.isSourceFileFromExternalLibrary(sourceFile)) {
            return false;
        }
        // Our migrations are set up to create a `Program` from the project's tsconfig and to migrate all
        // the files within the program. This can include files that are outside of the Angular CLI
        // project. We can't migrate files outside of the project, because our file system interactions
        // go through the CLI's `Tree` which assumes that all files are within the project. See:
        // https://github.com/angular/angular-cli/blob/0b0961c9c233a825b6e4bb59ab7f0790f9b14676/packages/angular_devkit/schematics/src/tree/host-tree.ts#L131
        return !path_1.relative(basePath, sourceFile.fileName).startsWith('..');
    }
    exports.canMigrateFile = canMigrateFile;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGlsZXJfaG9zdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc2NoZW1hdGljcy91dGlscy90eXBlc2NyaXB0L2NvbXBpbGVyX2hvc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBUUEsK0JBQWdEO0lBQ2hELGlDQUFpQztJQUNqQyw2RkFBbUQ7SUFJbkQ7Ozs7Ozs7OztPQVNHO0lBQ0gsU0FBZ0Isc0JBQXNCLENBQ2xDLElBQVUsRUFBRSxZQUFvQixFQUFFLFFBQWdCLEVBQUUsWUFBNkIsRUFDakYsZUFBMEI7UUFDNUIsd0ZBQXdGO1FBQ3hGLDJGQUEyRjtRQUMzRixnRkFBZ0Y7UUFDaEYsWUFBWSxHQUFHLGNBQU8sQ0FBQyxRQUFRLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDL0MsTUFBTSxNQUFNLEdBQUcsa0NBQWlCLENBQUMsWUFBWSxFQUFFLGNBQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1FBQ3RFLE1BQU0sSUFBSSxHQUFHLDJCQUEyQixDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxZQUFZLENBQUMsQ0FBQztRQUN2RixNQUFNLE9BQU8sR0FDVCxFQUFFLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLGVBQWUsSUFBSSxFQUFFLENBQUMsRUFBRSxNQUFNLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzNGLE9BQU8sRUFBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBQyxDQUFDO0lBQ2pDLENBQUM7SUFaRCx3REFZQztJQUVELFNBQWdCLDJCQUEyQixDQUN2QyxJQUFVLEVBQUUsT0FBMkIsRUFBRSxRQUFnQixFQUN6RCxRQUF5QjtRQUMzQixNQUFNLElBQUksR0FBRyxFQUFFLENBQUMsa0JBQWtCLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ2xELE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7UUFFdEMsNkVBQTZFO1FBQzdFLCtFQUErRTtRQUMvRSx1RUFBdUU7UUFDdkUsZ0JBQWdCO1FBQ2hCLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDLEVBQUU7O1lBQ3pCLE1BQU0sZ0JBQWdCLEdBQUcsZUFBUSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUN0RCxJQUFJLE1BQU0sR0FBcUIsUUFBUSxhQUFSLFFBQVEsdUJBQVIsUUFBUSxDQUFHLGdCQUFnQixDQUFDLENBQUM7WUFFNUQsSUFBSSxNQUFNLEtBQUssU0FBUyxFQUFFO2dCQUN4QiwrRUFBK0U7Z0JBQy9FLG1GQUFtRjtnQkFDbkYsTUFBTSxHQUFHLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztvQkFDdEMsTUFBQSxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLDBDQUFFLFFBQVEsRUFBRSxDQUFDO2FBQ3RGO1lBRUQsMkVBQTJFO1lBQzNFLHVDQUF1QztZQUN2QyxxREFBcUQ7WUFDckQsT0FBTyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFDNUQsQ0FBQyxDQUFDO1FBRUYsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBNUJELGtFQTRCQztJQUVEOzs7OztPQUtHO0lBQ0gsU0FBZ0IsY0FBYyxDQUMxQixRQUFnQixFQUFFLFVBQXlCLEVBQUUsT0FBbUI7UUFDbEUsc0VBQXNFO1FBQ3RFLElBQUksVUFBVSxDQUFDLGlCQUFpQixJQUFJLE9BQU8sQ0FBQywrQkFBK0IsQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUN2RixPQUFPLEtBQUssQ0FBQztTQUNkO1FBRUQsaUdBQWlHO1FBQ2pHLDJGQUEyRjtRQUMzRiwrRkFBK0Y7UUFDL0Ysd0ZBQXdGO1FBQ3hGLHFKQUFxSjtRQUNySixPQUFPLENBQUMsZUFBUSxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ25FLENBQUM7SUFiRCx3Q0FhQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtUcmVlfSBmcm9tICdAYW5ndWxhci1kZXZraXQvc2NoZW1hdGljcyc7XG5pbXBvcnQge2Rpcm5hbWUsIHJlbGF0aXZlLCByZXNvbHZlfSBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuaW1wb3J0IHtwYXJzZVRzY29uZmlnRmlsZX0gZnJvbSAnLi9wYXJzZV90c2NvbmZpZyc7XG5cbmV4cG9ydCB0eXBlIEZha2VSZWFkRmlsZUZuID0gKGZpbGVOYW1lOiBzdHJpbmcpID0+IHN0cmluZ3x1bmRlZmluZWQ7XG5cbi8qKlxuICogQ3JlYXRlcyBhIFR5cGVTY3JpcHQgcHJvZ3JhbSBpbnN0YW5jZSBmb3IgYSBUeXBlU2NyaXB0IHByb2plY3Qgd2l0aGluXG4gKiB0aGUgdmlydHVhbCBmaWxlIHN5c3RlbSB0cmVlLlxuICogQHBhcmFtIHRyZWUgVmlydHVhbCBmaWxlIHN5c3RlbSB0cmVlIHRoYXQgY29udGFpbnMgdGhlIHNvdXJjZSBmaWxlcy5cbiAqIEBwYXJhbSB0c2NvbmZpZ1BhdGggVmlydHVhbCBmaWxlIHN5c3RlbSBwYXRoIHRoYXQgcmVzb2x2ZXMgdG8gdGhlIFR5cGVTY3JpcHQgcHJvamVjdC5cbiAqIEBwYXJhbSBiYXNlUGF0aCBCYXNlIHBhdGggZm9yIHRoZSB2aXJ0dWFsIGZpbGUgc3lzdGVtIHRyZWUuXG4gKiBAcGFyYW0gZmFrZUZpbGVSZWFkIE9wdGlvbmFsIGZpbGUgcmVhZGVyIGZ1bmN0aW9uLiBDYW4gYmUgdXNlZCB0byBvdmVyd3JpdGUgZmlsZXMgaW5cbiAqICAgdGhlIFR5cGVTY3JpcHQgcHJvZ3JhbSwgb3IgdG8gYWRkIGluLW1lbW9yeSBmaWxlcyAoZS5nLiB0byBhZGQgZ2xvYmFsIHR5cGVzKS5cbiAqIEBwYXJhbSBhZGRpdGlvbmFsRmlsZXMgQWRkaXRpb25hbCBmaWxlIHBhdGhzIHRoYXQgc2hvdWxkIGJlIGFkZGVkIHRvIHRoZSBwcm9ncmFtLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlTWlncmF0aW9uUHJvZ3JhbShcbiAgICB0cmVlOiBUcmVlLCB0c2NvbmZpZ1BhdGg6IHN0cmluZywgYmFzZVBhdGg6IHN0cmluZywgZmFrZUZpbGVSZWFkPzogRmFrZVJlYWRGaWxlRm4sXG4gICAgYWRkaXRpb25hbEZpbGVzPzogc3RyaW5nW10pIHtcbiAgLy8gUmVzb2x2ZSB0aGUgdHNjb25maWcgcGF0aCB0byBhbiBhYnNvbHV0ZSBwYXRoLiBUaGlzIGlzIG5lZWRlZCBhcyBUeXBlU2NyaXB0IG90aGVyd2lzZVxuICAvLyBpcyBub3QgYWJsZSB0byByZXNvbHZlIHJvb3QgZGlyZWN0b3JpZXMgaW4gdGhlIGdpdmVuIHRzY29uZmlnLiBNb3JlIGRldGFpbHMgY2FuIGJlIGZvdW5kXG4gIC8vIGluIHRoZSBmb2xsb3dpbmcgaXNzdWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9taWNyb3NvZnQvVHlwZVNjcmlwdC9pc3N1ZXMvMzc3MzEuXG4gIHRzY29uZmlnUGF0aCA9IHJlc29sdmUoYmFzZVBhdGgsIHRzY29uZmlnUGF0aCk7XG4gIGNvbnN0IHBhcnNlZCA9IHBhcnNlVHNjb25maWdGaWxlKHRzY29uZmlnUGF0aCwgZGlybmFtZSh0c2NvbmZpZ1BhdGgpKTtcbiAgY29uc3QgaG9zdCA9IGNyZWF0ZU1pZ3JhdGlvbkNvbXBpbGVySG9zdCh0cmVlLCBwYXJzZWQub3B0aW9ucywgYmFzZVBhdGgsIGZha2VGaWxlUmVhZCk7XG4gIGNvbnN0IHByb2dyYW0gPVxuICAgICAgdHMuY3JlYXRlUHJvZ3JhbShwYXJzZWQuZmlsZU5hbWVzLmNvbmNhdChhZGRpdGlvbmFsRmlsZXMgfHwgW10pLCBwYXJzZWQub3B0aW9ucywgaG9zdCk7XG4gIHJldHVybiB7cGFyc2VkLCBob3N0LCBwcm9ncmFtfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZU1pZ3JhdGlvbkNvbXBpbGVySG9zdChcbiAgICB0cmVlOiBUcmVlLCBvcHRpb25zOiB0cy5Db21waWxlck9wdGlvbnMsIGJhc2VQYXRoOiBzdHJpbmcsXG4gICAgZmFrZVJlYWQ/OiBGYWtlUmVhZEZpbGVGbik6IHRzLkNvbXBpbGVySG9zdCB7XG4gIGNvbnN0IGhvc3QgPSB0cy5jcmVhdGVDb21waWxlckhvc3Qob3B0aW9ucywgdHJ1ZSk7XG4gIGNvbnN0IGRlZmF1bHRSZWFkRmlsZSA9IGhvc3QucmVhZEZpbGU7XG5cbiAgLy8gV2UgbmVlZCB0byBvdmVyd3JpdGUgdGhlIGhvc3QgXCJyZWFkRmlsZVwiIG1ldGhvZCwgYXMgd2Ugd2FudCB0aGUgVHlwZVNjcmlwdFxuICAvLyBwcm9ncmFtIHRvIGJlIGJhc2VkIG9uIHRoZSBmaWxlIGNvbnRlbnRzIGluIHRoZSB2aXJ0dWFsIGZpbGUgdHJlZS4gT3RoZXJ3aXNlXG4gIC8vIGlmIHdlIHJ1biBtdWx0aXBsZSBtaWdyYXRpb25zIHdlIG1pZ2h0IGhhdmUgaW50ZXJzZWN0aW5nIGNoYW5nZXMgYW5kXG4gIC8vIHNvdXJjZSBmaWxlcy5cbiAgaG9zdC5yZWFkRmlsZSA9IGZpbGVOYW1lID0+IHtcbiAgICBjb25zdCB0cmVlUmVsYXRpdmVQYXRoID0gcmVsYXRpdmUoYmFzZVBhdGgsIGZpbGVOYW1lKTtcbiAgICBsZXQgcmVzdWx0OiBzdHJpbmd8dW5kZWZpbmVkID0gZmFrZVJlYWQ/Lih0cmVlUmVsYXRpdmVQYXRoKTtcblxuICAgIGlmIChyZXN1bHQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgLy8gSWYgdGhlIHJlbGF0aXZlIHBhdGggcmVzb2x2ZWQgdG8gc29tZXdoZXJlIG91dHNpZGUgb2YgdGhlIHRyZWUsIGZhbGwgYmFjayB0b1xuICAgICAgLy8gVHlwZVNjcmlwdCdzIGRlZmF1bHQgZmlsZSByZWFkaW5nIGZ1bmN0aW9uIHNpbmNlIHRoZSBgdHJlZWAgd2lsbCB0aHJvdyBhbiBlcnJvci5cbiAgICAgIHJlc3VsdCA9IHRyZWVSZWxhdGl2ZVBhdGguc3RhcnRzV2l0aCgnLi4nKSA/IGRlZmF1bHRSZWFkRmlsZS5jYWxsKGhvc3QsIGZpbGVOYW1lKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmVlLnJlYWQodHJlZVJlbGF0aXZlUGF0aCk/LnRvU3RyaW5nKCk7XG4gICAgfVxuXG4gICAgLy8gU3RyaXAgQk9NIGFzIG90aGVyd2lzZSBUU0MgbWV0aG9kcyAoRXg6IGdldFdpZHRoKSB3aWxsIHJldHVybiBhbiBvZmZzZXQsXG4gICAgLy8gd2hpY2ggYnJlYWtzIHRoZSBDTEkgVXBkYXRlUmVjb3JkZXIuXG4gICAgLy8gU2VlOiBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyL3B1bGwvMzA3MTlcbiAgICByZXR1cm4gcmVzdWx0ID8gcmVzdWx0LnJlcGxhY2UoL15cXHVGRUZGLywgJycpIDogdW5kZWZpbmVkO1xuICB9O1xuXG4gIHJldHVybiBob3N0O1xufVxuXG4vKipcbiAqIENoZWNrcyB3aGV0aGVyIGEgZmlsZSBjYW4gYmUgbWlncmF0ZSBieSBvdXIgYXV0b21hdGVkIG1pZ3JhdGlvbnMuXG4gKiBAcGFyYW0gYmFzZVBhdGggQWJzb2x1dGUgcGF0aCB0byB0aGUgcHJvamVjdC5cbiAqIEBwYXJhbSBzb3VyY2VGaWxlIEZpbGUgYmVpbmcgY2hlY2tlZC5cbiAqIEBwYXJhbSBwcm9ncmFtIFByb2dyYW0gdGhhdCBpbmNsdWRlcyB0aGUgc291cmNlIGZpbGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjYW5NaWdyYXRlRmlsZShcbiAgICBiYXNlUGF0aDogc3RyaW5nLCBzb3VyY2VGaWxlOiB0cy5Tb3VyY2VGaWxlLCBwcm9ncmFtOiB0cy5Qcm9ncmFtKTogYm9vbGVhbiB7XG4gIC8vIFdlIHNob3VsZG4ndCBtaWdyYXRlIC5kLnRzIGZpbGVzIG9yIGZpbGVzIGZyb20gYW4gZXh0ZXJuYWwgbGlicmFyeS5cbiAgaWYgKHNvdXJjZUZpbGUuaXNEZWNsYXJhdGlvbkZpbGUgfHwgcHJvZ3JhbS5pc1NvdXJjZUZpbGVGcm9tRXh0ZXJuYWxMaWJyYXJ5KHNvdXJjZUZpbGUpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gT3VyIG1pZ3JhdGlvbnMgYXJlIHNldCB1cCB0byBjcmVhdGUgYSBgUHJvZ3JhbWAgZnJvbSB0aGUgcHJvamVjdCdzIHRzY29uZmlnIGFuZCB0byBtaWdyYXRlIGFsbFxuICAvLyB0aGUgZmlsZXMgd2l0aGluIHRoZSBwcm9ncmFtLiBUaGlzIGNhbiBpbmNsdWRlIGZpbGVzIHRoYXQgYXJlIG91dHNpZGUgb2YgdGhlIEFuZ3VsYXIgQ0xJXG4gIC8vIHByb2plY3QuIFdlIGNhbid0IG1pZ3JhdGUgZmlsZXMgb3V0c2lkZSBvZiB0aGUgcHJvamVjdCwgYmVjYXVzZSBvdXIgZmlsZSBzeXN0ZW0gaW50ZXJhY3Rpb25zXG4gIC8vIGdvIHRocm91Z2ggdGhlIENMSSdzIGBUcmVlYCB3aGljaCBhc3N1bWVzIHRoYXQgYWxsIGZpbGVzIGFyZSB3aXRoaW4gdGhlIHByb2plY3QuIFNlZTpcbiAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci1jbGkvYmxvYi8wYjA5NjFjOWMyMzNhODI1YjZlNGJiNTlhYjdmMDc5MGY5YjE0Njc2L3BhY2thZ2VzL2FuZ3VsYXJfZGV2a2l0L3NjaGVtYXRpY3Mvc3JjL3RyZWUvaG9zdC10cmVlLnRzI0wxMzFcbiAgcmV0dXJuICFyZWxhdGl2ZShiYXNlUGF0aCwgc291cmNlRmlsZS5maWxlTmFtZSkuc3RhcnRzV2l0aCgnLi4nKTtcbn1cbiJdfQ==