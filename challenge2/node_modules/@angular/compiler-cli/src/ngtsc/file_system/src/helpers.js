(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/ngtsc/file_system/src/helpers", ["require", "exports", "tslib", "@angular/compiler-cli/src/ngtsc/file_system/src/invalid_file_system", "@angular/compiler-cli/src/ngtsc/file_system/src/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.toRelativeImport = exports.isLocalRelativePath = exports.basename = exports.relative = exports.isRooted = exports.isRoot = exports.resolve = exports.join = exports.dirname = exports.relativeFrom = exports.absoluteFromSourceFile = exports.absoluteFrom = exports.setFileSystem = exports.getFileSystem = void 0;
    var tslib_1 = require("tslib");
    var invalid_file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system/src/invalid_file_system");
    var util_1 = require("@angular/compiler-cli/src/ngtsc/file_system/src/util");
    var fs = new invalid_file_system_1.InvalidFileSystem();
    function getFileSystem() {
        return fs;
    }
    exports.getFileSystem = getFileSystem;
    function setFileSystem(fileSystem) {
        fs = fileSystem;
    }
    exports.setFileSystem = setFileSystem;
    /**
     * Convert the path `path` to an `AbsoluteFsPath`, throwing an error if it's not an absolute path.
     */
    function absoluteFrom(path) {
        if (!fs.isRooted(path)) {
            throw new Error("Internal Error: absoluteFrom(" + path + "): path is not absolute");
        }
        return fs.resolve(path);
    }
    exports.absoluteFrom = absoluteFrom;
    var ABSOLUTE_PATH = Symbol('AbsolutePath');
    /**
     * Extract an `AbsoluteFsPath` from a `ts.SourceFile`-like object.
     */
    function absoluteFromSourceFile(sf) {
        var sfWithPatch = sf;
        if (sfWithPatch[ABSOLUTE_PATH] === undefined) {
            sfWithPatch[ABSOLUTE_PATH] = fs.resolve(sfWithPatch.fileName);
        }
        // Non-null assertion needed since TS doesn't narrow the type of fields that use a symbol as a key
        // apparently.
        return sfWithPatch[ABSOLUTE_PATH];
    }
    exports.absoluteFromSourceFile = absoluteFromSourceFile;
    /**
     * Convert the path `path` to a `PathSegment`, throwing an error if it's not a relative path.
     */
    function relativeFrom(path) {
        var normalized = util_1.normalizeSeparators(path);
        if (fs.isRooted(normalized)) {
            throw new Error("Internal Error: relativeFrom(" + path + "): path is not relative");
        }
        return normalized;
    }
    exports.relativeFrom = relativeFrom;
    /**
     * Static access to `dirname`.
     */
    function dirname(file) {
        return fs.dirname(file);
    }
    exports.dirname = dirname;
    /**
     * Static access to `join`.
     */
    function join(basePath) {
        var paths = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            paths[_i - 1] = arguments[_i];
        }
        return fs.join.apply(fs, tslib_1.__spreadArray([basePath], tslib_1.__read(paths)));
    }
    exports.join = join;
    /**
     * Static access to `resolve`s.
     */
    function resolve(basePath) {
        var paths = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            paths[_i - 1] = arguments[_i];
        }
        return fs.resolve.apply(fs, tslib_1.__spreadArray([basePath], tslib_1.__read(paths)));
    }
    exports.resolve = resolve;
    /** Returns true when the path provided is the root path. */
    function isRoot(path) {
        return fs.isRoot(path);
    }
    exports.isRoot = isRoot;
    /**
     * Static access to `isRooted`.
     */
    function isRooted(path) {
        return fs.isRooted(path);
    }
    exports.isRooted = isRooted;
    /**
     * Static access to `relative`.
     */
    function relative(from, to) {
        return fs.relative(from, to);
    }
    exports.relative = relative;
    /**
     * Static access to `basename`.
     */
    function basename(filePath, extension) {
        return fs.basename(filePath, extension);
    }
    exports.basename = basename;
    /**
     * Returns true if the given path is locally relative.
     *
     * This is used to work out if the given path is relative (i.e. not absolute) but also is not
     * escaping the current directory.
     */
    function isLocalRelativePath(relativePath) {
        return !isRooted(relativePath) && !relativePath.startsWith('..');
    }
    exports.isLocalRelativePath = isLocalRelativePath;
    /**
     * Converts a path to a form suitable for use as a relative module import specifier.
     *
     * In other words it adds the `./` to the path if it is locally relative.
     */
    function toRelativeImport(relativePath) {
        return isLocalRelativePath(relativePath) ? "./" + relativePath : relativePath;
    }
    exports.toRelativeImport = toRelativeImport;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVscGVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvZmlsZV9zeXN0ZW0vc3JjL2hlbHBlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztJQVNBLDJHQUF3RDtJQUV4RCw2RUFBMkM7SUFFM0MsSUFBSSxFQUFFLEdBQWUsSUFBSSx1Q0FBaUIsRUFBRSxDQUFDO0lBQzdDLFNBQWdCLGFBQWE7UUFDM0IsT0FBTyxFQUFFLENBQUM7SUFDWixDQUFDO0lBRkQsc0NBRUM7SUFDRCxTQUFnQixhQUFhLENBQUMsVUFBc0I7UUFDbEQsRUFBRSxHQUFHLFVBQVUsQ0FBQztJQUNsQixDQUFDO0lBRkQsc0NBRUM7SUFFRDs7T0FFRztJQUNILFNBQWdCLFlBQVksQ0FBQyxJQUFZO1FBQ3ZDLElBQUksQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ3RCLE1BQU0sSUFBSSxLQUFLLENBQUMsa0NBQWdDLElBQUksNEJBQXlCLENBQUMsQ0FBQztTQUNoRjtRQUNELE9BQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMxQixDQUFDO0lBTEQsb0NBS0M7SUFFRCxJQUFNLGFBQWEsR0FBRyxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUM7SUFFN0M7O09BRUc7SUFDSCxTQUFnQixzQkFBc0IsQ0FBQyxFQUFzQjtRQUMzRCxJQUFNLFdBQVcsR0FBRyxFQUEwRCxDQUFDO1FBRS9FLElBQUksV0FBVyxDQUFDLGFBQWEsQ0FBQyxLQUFLLFNBQVMsRUFBRTtZQUM1QyxXQUFXLENBQUMsYUFBYSxDQUFDLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDL0Q7UUFFRCxrR0FBa0c7UUFDbEcsY0FBYztRQUNkLE9BQU8sV0FBVyxDQUFDLGFBQWEsQ0FBRSxDQUFDO0lBQ3JDLENBQUM7SUFWRCx3REFVQztJQUVEOztPQUVHO0lBQ0gsU0FBZ0IsWUFBWSxDQUFDLElBQVk7UUFDdkMsSUFBTSxVQUFVLEdBQUcsMEJBQW1CLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDN0MsSUFBSSxFQUFFLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQzNCLE1BQU0sSUFBSSxLQUFLLENBQUMsa0NBQWdDLElBQUksNEJBQXlCLENBQUMsQ0FBQztTQUNoRjtRQUNELE9BQU8sVUFBeUIsQ0FBQztJQUNuQyxDQUFDO0lBTkQsb0NBTUM7SUFFRDs7T0FFRztJQUNILFNBQWdCLE9BQU8sQ0FBdUIsSUFBTztRQUNuRCxPQUFPLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDMUIsQ0FBQztJQUZELDBCQUVDO0lBRUQ7O09BRUc7SUFDSCxTQUFnQixJQUFJLENBQXVCLFFBQVc7UUFBRSxlQUFrQjthQUFsQixVQUFrQixFQUFsQixxQkFBa0IsRUFBbEIsSUFBa0I7WUFBbEIsOEJBQWtCOztRQUN4RSxPQUFPLEVBQUUsQ0FBQyxJQUFJLE9BQVAsRUFBRSx5QkFBTSxRQUFRLGtCQUFLLEtBQUssSUFBRTtJQUNyQyxDQUFDO0lBRkQsb0JBRUM7SUFFRDs7T0FFRztJQUNILFNBQWdCLE9BQU8sQ0FBQyxRQUFnQjtRQUFFLGVBQWtCO2FBQWxCLFVBQWtCLEVBQWxCLHFCQUFrQixFQUFsQixJQUFrQjtZQUFsQiw4QkFBa0I7O1FBQzFELE9BQU8sRUFBRSxDQUFDLE9BQU8sT0FBVixFQUFFLHlCQUFTLFFBQVEsa0JBQUssS0FBSyxJQUFFO0lBQ3hDLENBQUM7SUFGRCwwQkFFQztJQUVELDREQUE0RDtJQUM1RCxTQUFnQixNQUFNLENBQUMsSUFBb0I7UUFDekMsT0FBTyxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3pCLENBQUM7SUFGRCx3QkFFQztJQUVEOztPQUVHO0lBQ0gsU0FBZ0IsUUFBUSxDQUFDLElBQVk7UUFDbkMsT0FBTyxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFGRCw0QkFFQztJQUVEOztPQUVHO0lBQ0gsU0FBZ0IsUUFBUSxDQUF1QixJQUFPLEVBQUUsRUFBSztRQUMzRCxPQUFPLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQy9CLENBQUM7SUFGRCw0QkFFQztJQUVEOztPQUVHO0lBQ0gsU0FBZ0IsUUFBUSxDQUFDLFFBQW9CLEVBQUUsU0FBa0I7UUFDL0QsT0FBTyxFQUFFLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxTQUFTLENBQWdCLENBQUM7SUFDekQsQ0FBQztJQUZELDRCQUVDO0lBRUQ7Ozs7O09BS0c7SUFDSCxTQUFnQixtQkFBbUIsQ0FBQyxZQUFvQjtRQUN0RCxPQUFPLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNuRSxDQUFDO0lBRkQsa0RBRUM7SUFFRDs7OztPQUlHO0lBQ0gsU0FBZ0IsZ0JBQWdCLENBQUMsWUFBd0M7UUFFdkUsT0FBTyxtQkFBbUIsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBSyxZQUE2QixDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUM7SUFDL0YsQ0FBQztJQUhELDRDQUdDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0IHtJbnZhbGlkRmlsZVN5c3RlbX0gZnJvbSAnLi9pbnZhbGlkX2ZpbGVfc3lzdGVtJztcbmltcG9ydCB7QWJzb2x1dGVGc1BhdGgsIEZpbGVTeXN0ZW0sIFBhdGhTZWdtZW50LCBQYXRoU3RyaW5nfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB7bm9ybWFsaXplU2VwYXJhdG9yc30gZnJvbSAnLi91dGlsJztcblxubGV0IGZzOiBGaWxlU3lzdGVtID0gbmV3IEludmFsaWRGaWxlU3lzdGVtKCk7XG5leHBvcnQgZnVuY3Rpb24gZ2V0RmlsZVN5c3RlbSgpOiBGaWxlU3lzdGVtIHtcbiAgcmV0dXJuIGZzO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHNldEZpbGVTeXN0ZW0oZmlsZVN5c3RlbTogRmlsZVN5c3RlbSkge1xuICBmcyA9IGZpbGVTeXN0ZW07XG59XG5cbi8qKlxuICogQ29udmVydCB0aGUgcGF0aCBgcGF0aGAgdG8gYW4gYEFic29sdXRlRnNQYXRoYCwgdGhyb3dpbmcgYW4gZXJyb3IgaWYgaXQncyBub3QgYW4gYWJzb2x1dGUgcGF0aC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFic29sdXRlRnJvbShwYXRoOiBzdHJpbmcpOiBBYnNvbHV0ZUZzUGF0aCB7XG4gIGlmICghZnMuaXNSb290ZWQocGF0aCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEludGVybmFsIEVycm9yOiBhYnNvbHV0ZUZyb20oJHtwYXRofSk6IHBhdGggaXMgbm90IGFic29sdXRlYCk7XG4gIH1cbiAgcmV0dXJuIGZzLnJlc29sdmUocGF0aCk7XG59XG5cbmNvbnN0IEFCU09MVVRFX1BBVEggPSBTeW1ib2woJ0Fic29sdXRlUGF0aCcpO1xuXG4vKipcbiAqIEV4dHJhY3QgYW4gYEFic29sdXRlRnNQYXRoYCBmcm9tIGEgYHRzLlNvdXJjZUZpbGVgLWxpa2Ugb2JqZWN0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gYWJzb2x1dGVGcm9tU291cmNlRmlsZShzZjoge2ZpbGVOYW1lOiBzdHJpbmd9KTogQWJzb2x1dGVGc1BhdGgge1xuICBjb25zdCBzZldpdGhQYXRjaCA9IHNmIGFzIHtmaWxlTmFtZTogc3RyaW5nLCBbQUJTT0xVVEVfUEFUSF0/OiBBYnNvbHV0ZUZzUGF0aH07XG5cbiAgaWYgKHNmV2l0aFBhdGNoW0FCU09MVVRFX1BBVEhdID09PSB1bmRlZmluZWQpIHtcbiAgICBzZldpdGhQYXRjaFtBQlNPTFVURV9QQVRIXSA9IGZzLnJlc29sdmUoc2ZXaXRoUGF0Y2guZmlsZU5hbWUpO1xuICB9XG5cbiAgLy8gTm9uLW51bGwgYXNzZXJ0aW9uIG5lZWRlZCBzaW5jZSBUUyBkb2Vzbid0IG5hcnJvdyB0aGUgdHlwZSBvZiBmaWVsZHMgdGhhdCB1c2UgYSBzeW1ib2wgYXMgYSBrZXlcbiAgLy8gYXBwYXJlbnRseS5cbiAgcmV0dXJuIHNmV2l0aFBhdGNoW0FCU09MVVRFX1BBVEhdITtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IHRoZSBwYXRoIGBwYXRoYCB0byBhIGBQYXRoU2VnbWVudGAsIHRocm93aW5nIGFuIGVycm9yIGlmIGl0J3Mgbm90IGEgcmVsYXRpdmUgcGF0aC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlbGF0aXZlRnJvbShwYXRoOiBzdHJpbmcpOiBQYXRoU2VnbWVudCB7XG4gIGNvbnN0IG5vcm1hbGl6ZWQgPSBub3JtYWxpemVTZXBhcmF0b3JzKHBhdGgpO1xuICBpZiAoZnMuaXNSb290ZWQobm9ybWFsaXplZCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEludGVybmFsIEVycm9yOiByZWxhdGl2ZUZyb20oJHtwYXRofSk6IHBhdGggaXMgbm90IHJlbGF0aXZlYCk7XG4gIH1cbiAgcmV0dXJuIG5vcm1hbGl6ZWQgYXMgUGF0aFNlZ21lbnQ7XG59XG5cbi8qKlxuICogU3RhdGljIGFjY2VzcyB0byBgZGlybmFtZWAuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkaXJuYW1lPFQgZXh0ZW5kcyBQYXRoU3RyaW5nPihmaWxlOiBUKTogVCB7XG4gIHJldHVybiBmcy5kaXJuYW1lKGZpbGUpO1xufVxuXG4vKipcbiAqIFN0YXRpYyBhY2Nlc3MgdG8gYGpvaW5gLlxuICovXG5leHBvcnQgZnVuY3Rpb24gam9pbjxUIGV4dGVuZHMgUGF0aFN0cmluZz4oYmFzZVBhdGg6IFQsIC4uLnBhdGhzOiBzdHJpbmdbXSk6IFQge1xuICByZXR1cm4gZnMuam9pbihiYXNlUGF0aCwgLi4ucGF0aHMpO1xufVxuXG4vKipcbiAqIFN0YXRpYyBhY2Nlc3MgdG8gYHJlc29sdmVgcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmUoYmFzZVBhdGg6IHN0cmluZywgLi4ucGF0aHM6IHN0cmluZ1tdKTogQWJzb2x1dGVGc1BhdGgge1xuICByZXR1cm4gZnMucmVzb2x2ZShiYXNlUGF0aCwgLi4ucGF0aHMpO1xufVxuXG4vKiogUmV0dXJucyB0cnVlIHdoZW4gdGhlIHBhdGggcHJvdmlkZWQgaXMgdGhlIHJvb3QgcGF0aC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1Jvb3QocGF0aDogQWJzb2x1dGVGc1BhdGgpOiBib29sZWFuIHtcbiAgcmV0dXJuIGZzLmlzUm9vdChwYXRoKTtcbn1cblxuLyoqXG4gKiBTdGF0aWMgYWNjZXNzIHRvIGBpc1Jvb3RlZGAuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1Jvb3RlZChwYXRoOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIGZzLmlzUm9vdGVkKHBhdGgpO1xufVxuXG4vKipcbiAqIFN0YXRpYyBhY2Nlc3MgdG8gYHJlbGF0aXZlYC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlbGF0aXZlPFQgZXh0ZW5kcyBQYXRoU3RyaW5nPihmcm9tOiBULCB0bzogVCk6IFBhdGhTZWdtZW50fEFic29sdXRlRnNQYXRoIHtcbiAgcmV0dXJuIGZzLnJlbGF0aXZlKGZyb20sIHRvKTtcbn1cblxuLyoqXG4gKiBTdGF0aWMgYWNjZXNzIHRvIGBiYXNlbmFtZWAuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiYXNlbmFtZShmaWxlUGF0aDogUGF0aFN0cmluZywgZXh0ZW5zaW9uPzogc3RyaW5nKTogUGF0aFNlZ21lbnQge1xuICByZXR1cm4gZnMuYmFzZW5hbWUoZmlsZVBhdGgsIGV4dGVuc2lvbikgYXMgUGF0aFNlZ21lbnQ7XG59XG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHRoZSBnaXZlbiBwYXRoIGlzIGxvY2FsbHkgcmVsYXRpdmUuXG4gKlxuICogVGhpcyBpcyB1c2VkIHRvIHdvcmsgb3V0IGlmIHRoZSBnaXZlbiBwYXRoIGlzIHJlbGF0aXZlIChpLmUuIG5vdCBhYnNvbHV0ZSkgYnV0IGFsc28gaXMgbm90XG4gKiBlc2NhcGluZyB0aGUgY3VycmVudCBkaXJlY3RvcnkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0xvY2FsUmVsYXRpdmVQYXRoKHJlbGF0aXZlUGF0aDogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiAhaXNSb290ZWQocmVsYXRpdmVQYXRoKSAmJiAhcmVsYXRpdmVQYXRoLnN0YXJ0c1dpdGgoJy4uJyk7XG59XG5cbi8qKlxuICogQ29udmVydHMgYSBwYXRoIHRvIGEgZm9ybSBzdWl0YWJsZSBmb3IgdXNlIGFzIGEgcmVsYXRpdmUgbW9kdWxlIGltcG9ydCBzcGVjaWZpZXIuXG4gKlxuICogSW4gb3RoZXIgd29yZHMgaXQgYWRkcyB0aGUgYC4vYCB0byB0aGUgcGF0aCBpZiBpdCBpcyBsb2NhbGx5IHJlbGF0aXZlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdG9SZWxhdGl2ZUltcG9ydChyZWxhdGl2ZVBhdGg6IFBhdGhTZWdtZW50fEFic29sdXRlRnNQYXRoKTogUGF0aFNlZ21lbnR8XG4gICAgQWJzb2x1dGVGc1BhdGgge1xuICByZXR1cm4gaXNMb2NhbFJlbGF0aXZlUGF0aChyZWxhdGl2ZVBhdGgpID8gYC4vJHtyZWxhdGl2ZVBhdGh9YCBhcyBQYXRoU2VnbWVudCA6IHJlbGF0aXZlUGF0aDtcbn1cbiJdfQ==