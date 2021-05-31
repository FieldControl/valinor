(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/packages/source_file_cache", ["require", "exports", "typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createModuleResolutionCache = exports.EntryPointFileCache = exports.isAngularDts = exports.isDefaultLibrary = exports.SharedFileCache = void 0;
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var ts = require("typescript");
    /**
     * A cache that holds on to source files that can be shared for processing all entry-points in a
     * single invocation of ngcc. In particular, the following files are shared across all entry-points
     * through this cache:
     *
     * 1. Default library files such as `lib.dom.d.ts` and `lib.es5.d.ts`. These files don't change
     *    and some are very large, so parsing is expensive. Therefore, the parsed `ts.SourceFile`s for
     *    the default library files are cached.
     * 2. The typings of @angular scoped packages. The typing files for @angular packages are typically
     *    used in the entry-points that ngcc processes, so benefit from a single source file cache.
     *    Especially `@angular/core/core.d.ts` is large and expensive to parse repeatedly. In contrast
     *    to default library files, we have to account for these files to be invalidated during a single
     *    invocation of ngcc, as ngcc will overwrite the .d.ts files during its processing.
     *
     * The lifecycle of this cache corresponds with a single invocation of ngcc. Separate invocations,
     * e.g. the CLI's synchronous module resolution fallback will therefore all have their own cache.
     * This allows for the source file cache to be garbage collected once ngcc processing has completed.
     */
    var SharedFileCache = /** @class */ (function () {
        function SharedFileCache(fs) {
            this.fs = fs;
            this.sfCache = new Map();
        }
        /**
         * Loads a `ts.SourceFile` if the provided `fileName` is deemed appropriate to be cached. To
         * optimize for memory usage, only files that are generally used in all entry-points are cached.
         * If `fileName` is not considered to benefit from caching or the requested file does not exist,
         * then `undefined` is returned.
         */
        SharedFileCache.prototype.getCachedSourceFile = function (fileName) {
            var absPath = this.fs.resolve(fileName);
            if (isDefaultLibrary(absPath, this.fs)) {
                return this.getStableCachedFile(absPath);
            }
            else if (isAngularDts(absPath, this.fs)) {
                return this.getVolatileCachedFile(absPath);
            }
            else {
                return undefined;
            }
        };
        /**
         * Attempts to load the source file from the cache, or parses the file into a `ts.SourceFile` if
         * it's not yet cached. This method assumes that the file will not be modified for the duration
         * that this cache is valid for. If that assumption does not hold, the `getVolatileCachedFile`
         * method is to be used instead.
         */
        SharedFileCache.prototype.getStableCachedFile = function (absPath) {
            if (!this.sfCache.has(absPath)) {
                var content = readFile(absPath, this.fs);
                if (content === undefined) {
                    return undefined;
                }
                var sf = ts.createSourceFile(absPath, content, ts.ScriptTarget.ES2015);
                this.sfCache.set(absPath, sf);
            }
            return this.sfCache.get(absPath);
        };
        /**
         * In contrast to `getStableCachedFile`, this method always verifies that the cached source file
         * is the same as what's stored on disk. This is done for files that are expected to change during
         * ngcc's processing, such as @angular scoped packages for which the .d.ts files are overwritten
         * by ngcc. If the contents on disk have changed compared to a previously cached source file, the
         * content from disk is re-parsed and the cache entry is replaced.
         */
        SharedFileCache.prototype.getVolatileCachedFile = function (absPath) {
            var content = readFile(absPath, this.fs);
            if (content === undefined) {
                return undefined;
            }
            if (!this.sfCache.has(absPath) || this.sfCache.get(absPath).text !== content) {
                var sf = ts.createSourceFile(absPath, content, ts.ScriptTarget.ES2015);
                this.sfCache.set(absPath, sf);
            }
            return this.sfCache.get(absPath);
        };
        return SharedFileCache;
    }());
    exports.SharedFileCache = SharedFileCache;
    var DEFAULT_LIB_PATTERN = ['node_modules', 'typescript', 'lib', /^lib\..+\.d\.ts$/];
    /**
     * Determines whether the provided path corresponds with a default library file inside of the
     * typescript package.
     *
     * @param absPath The path for which to determine if it corresponds with a default library file.
     * @param fs The filesystem to use for inspecting the path.
     */
    function isDefaultLibrary(absPath, fs) {
        return isFile(absPath, DEFAULT_LIB_PATTERN, fs);
    }
    exports.isDefaultLibrary = isDefaultLibrary;
    var ANGULAR_DTS_PATTERN = ['node_modules', '@angular', /./, /\.d\.ts$/];
    /**
     * Determines whether the provided path corresponds with a .d.ts file inside of an @angular
     * scoped package. This logic only accounts for the .d.ts files in the root, which is sufficient
     * to find the large, flattened entry-point files that benefit from caching.
     *
     * @param absPath The path for which to determine if it corresponds with an @angular .d.ts file.
     * @param fs The filesystem to use for inspecting the path.
     */
    function isAngularDts(absPath, fs) {
        return isFile(absPath, ANGULAR_DTS_PATTERN, fs);
    }
    exports.isAngularDts = isAngularDts;
    /**
     * Helper function to determine whether a file corresponds with a given pattern of segments.
     *
     * @param path The path for which to determine if it corresponds with the provided segments.
     * @param segments Array of segments; the `path` must have ending segments that match the
     * patterns in this array.
     * @param fs The filesystem to use for inspecting the path.
     */
    function isFile(path, segments, fs) {
        for (var i = segments.length - 1; i >= 0; i--) {
            var pattern = segments[i];
            var segment = fs.basename(path);
            if (typeof pattern === 'string') {
                if (pattern !== segment) {
                    return false;
                }
            }
            else {
                if (!pattern.test(segment)) {
                    return false;
                }
            }
            path = fs.dirname(path);
        }
        return true;
    }
    /**
     * A cache for processing a single entry-point. This exists to share `ts.SourceFile`s between the
     * source and typing programs that are created for a single program.
     */
    var EntryPointFileCache = /** @class */ (function () {
        function EntryPointFileCache(fs, sharedFileCache) {
            this.fs = fs;
            this.sharedFileCache = sharedFileCache;
            this.sfCache = new Map();
        }
        /**
         * Returns and caches a parsed `ts.SourceFile` for the provided `fileName`. If the `fileName` is
         * cached in the shared file cache, that result is used. Otherwise, the source file is cached
         * internally. This method returns `undefined` if the requested file does not exist.
         *
         * @param fileName The path of the file to retrieve a source file for.
         * @param languageVersion The language version to use for parsing the file.
         */
        EntryPointFileCache.prototype.getCachedSourceFile = function (fileName, languageVersion) {
            var staticSf = this.sharedFileCache.getCachedSourceFile(fileName);
            if (staticSf !== undefined) {
                return staticSf;
            }
            var absPath = this.fs.resolve(fileName);
            if (this.sfCache.has(absPath)) {
                return this.sfCache.get(absPath);
            }
            var content = readFile(absPath, this.fs);
            if (content === undefined) {
                return undefined;
            }
            var sf = ts.createSourceFile(fileName, content, languageVersion);
            this.sfCache.set(absPath, sf);
            return sf;
        };
        return EntryPointFileCache;
    }());
    exports.EntryPointFileCache = EntryPointFileCache;
    function readFile(absPath, fs) {
        if (!fs.exists(absPath) || !fs.stat(absPath).isFile()) {
            return undefined;
        }
        return fs.readFile(absPath);
    }
    /**
     * Creates a `ts.ModuleResolutionCache` that uses the provided filesystem for path operations.
     *
     * @param fs The filesystem to use for path operations.
     */
    function createModuleResolutionCache(fs) {
        return ts.createModuleResolutionCache(fs.pwd(), function (fileName) {
            return fs.isCaseSensitive() ? fileName : fileName.toLowerCase();
        });
    }
    exports.createModuleResolutionCache = createModuleResolutionCache;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic291cmNlX2ZpbGVfY2FjaGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvbmdjYy9zcmMvcGFja2FnZXMvc291cmNlX2ZpbGVfY2FjaGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gsK0JBQWlDO0lBR2pDOzs7Ozs7Ozs7Ozs7Ozs7OztPQWlCRztJQUNIO1FBR0UseUJBQW9CLEVBQXNCO1lBQXRCLE9BQUUsR0FBRixFQUFFLENBQW9CO1lBRmxDLFlBQU8sR0FBRyxJQUFJLEdBQUcsRUFBaUMsQ0FBQztRQUVkLENBQUM7UUFFOUM7Ozs7O1dBS0c7UUFDSCw2Q0FBbUIsR0FBbkIsVUFBb0IsUUFBZ0I7WUFDbEMsSUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDMUMsSUFBSSxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFO2dCQUN0QyxPQUFPLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsQ0FBQzthQUMxQztpQkFBTSxJQUFJLFlBQVksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFO2dCQUN6QyxPQUFPLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxPQUFPLENBQUMsQ0FBQzthQUM1QztpQkFBTTtnQkFDTCxPQUFPLFNBQVMsQ0FBQzthQUNsQjtRQUNILENBQUM7UUFFRDs7Ozs7V0FLRztRQUNLLDZDQUFtQixHQUEzQixVQUE0QixPQUF1QjtZQUNqRCxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQzlCLElBQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUMz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QUUsRUFBc0I7UUFDL0QsSUFBSSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFO1lBQ3JELE9BQU8sU0FBUyxDQUFDO1NBQ2xCO1FBQ0QsT0FBTyxFQUFFLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzlCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsU0FBZ0IsMkJBQTJCLENBQUMsRUFBc0I7UUFDaEUsT0FBTyxFQUFFLENBQUMsMkJBQTJCLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLFVBQUEsUUFBUTtZQUN0RCxPQUFPLEVBQUUsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDbEUsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBSkQsa0VBSUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuaW1wb3J0IHtBYnNvbHV0ZUZzUGF0aCwgUmVhZG9ubHlGaWxlU3lzdGVtfSBmcm9tICcuLi8uLi8uLi9zcmMvbmd0c2MvZmlsZV9zeXN0ZW0nO1xuXG4vKipcbiAqIEEgY2FjaGUgdGhhdCBob2xkcyBvbiB0byBzb3VyY2UgZmlsZXMgdGhhdCBjYW4gYmUgc2hhcmVkIGZvciBwcm9jZXNzaW5nIGFsbCBlbnRyeS1wb2ludHMgaW4gYVxuICogc2luZ2xlIGludm9jYXRpb24gb2YgbmdjYy4gSW4gcGFydGljdWxhciwgdGhlIGZvbGxvd2luZyBmaWxlcyBhcmUgc2hhcmVkIGFjcm9zcyBhbGwgZW50cnktcG9pbnRzXG4gKiB0aHJvdWdoIHRoaXMgY2FjaGU6XG4gKlxuICogMS4gRGVmYXVsdCBsaWJyYXJ5IGZpbGVzIHN1Y2ggYXMgYGxpYi5kb20uZC50c2AgYW5kIGBsaWIuZXM1LmQudHNgLiBUaGVzZSBmaWxlcyBkb24ndCBjaGFuZ2VcbiAqICAgIGFuZCBzb21lIGFyZSB2ZXJ5IGxhcmdlLCBzbyBwYXJzaW5nIGlzIGV4cGVuc2l2ZS4gVGhlcmVmb3JlLCB0aGUgcGFyc2VkIGB0cy5Tb3VyY2VGaWxlYHMgZm9yXG4gKiAgICB0aGUgZGVmYXVsdCBsaWJyYXJ5IGZpbGVzIGFyZSBjYWNoZWQuXG4gKiAyLiBUaGUgdHlwaW5ncyBvZiBAYW5ndWxhciBzY29wZWQgcGFja2FnZXMuIFRoZSB0eXBpbmcgZmlsZXMgZm9yIEBhbmd1bGFyIHBhY2thZ2VzIGFyZSB0eXBpY2FsbHlcbiAqICAgIHVzZWQgaW4gdGhlIGVudHJ5LXBvaW50cyB0aGF0IG5nY2MgcHJvY2Vzc2VzLCBzbyBiZW5lZml0IGZyb20gYSBzaW5nbGUgc291cmNlIGZpbGUgY2FjaGUuXG4gKiAgICBFc3BlY2lhbGx5IGBAYW5ndWxhci9jb3JlL2NvcmUuZC50c2AgaXMgbGFyZ2UgYW5kIGV4cGVuc2l2ZSB0byBwYXJzZSByZXBlYXRlZGx5LiBJbiBjb250cmFzdFxuICogICAgdG8gZGVmYXVsdCBsaWJyYXJ5IGZpbGVzLCB3ZSBoYXZlIHRvIGFjY291bnQgZm9yIHRoZXNlIGZpbGVzIHRvIGJlIGludmFsaWRhdGVkIGR1cmluZyBhIHNpbmdsZVxuICogICAgaW52b2NhdGlvbiBvZiBuZ2NjLCBhcyBuZ2NjIHdpbGwgb3ZlcndyaXRlIHRoZSAuZC50cyBmaWxlcyBkdXJpbmcgaXRzIHByb2Nlc3NpbmcuXG4gKlxuICogVGhlIGxpZmVjeWNsZSBvZiB0aGlzIGNhY2hlIGNvcnJlc3BvbmRzIHdpdGggYSBzaW5nbGUgaW52b2NhdGlvbiBvZiBuZ2NjLiBTZXBhcmF0ZSBpbnZvY2F0aW9ucyxcbiAqIGUuZy4gdGhlIENMSSdzIHN5bmNocm9ub3VzIG1vZHVsZSByZXNvbHV0aW9uIGZhbGxiYWNrIHdpbGwgdGhlcmVmb3JlIGFsbCBoYXZlIHRoZWlyIG93biBjYWNoZS5cbiAqIFRoaXMgYWxsb3dzIGZvciB0aGUgc291cmNlIGZpbGUgY2FjaGUgdG8gYmUgZ2FyYmFnZSBjb2xsZWN0ZWQgb25jZSBuZ2NjIHByb2Nlc3NpbmcgaGFzIGNvbXBsZXRlZC5cbiAqL1xuZXhwb3J0IGNsYXNzIFNoYXJlZEZpbGVDYWNoZSB7XG4gIHByaXZhdGUgc2ZDYWNoZSA9IG5ldyBNYXA8QWJzb2x1dGVGc1BhdGgsIHRzLlNvdXJjZUZpbGU+KCk7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBmczogUmVhZG9ubHlGaWxlU3lzdGVtKSB7fVxuXG4gIC8qKlxuICAgKiBMb2FkcyBhIGB0cy5Tb3VyY2VGaWxlYCBpZiB0aGUgcHJvdmlkZWQgYGZpbGVOYW1lYCBpcyBkZWVtZWQgYXBwcm9wcmlhdGUgdG8gYmUgY2FjaGVkLiBUb1xuICAgKiBvcHRpbWl6ZSBmb3IgbWVtb3J5IHVzYWdlLCBvbmx5IGZpbGVzIHRoYXQgYXJlIGdlbmVyYWxseSB1c2VkIGluIGFsbCBlbnRyeS1wb2ludHMgYXJlIGNhY2hlZC5cbiAgICogSWYgYGZpbGVOYW1lYCBpcyBub3QgY29uc2lkZXJlZCB0byBiZW5lZml0IGZyb20gY2FjaGluZyBvciB0aGUgcmVxdWVzdGVkIGZpbGUgZG9lcyBub3QgZXhpc3QsXG4gICAqIHRoZW4gYHVuZGVmaW5lZGAgaXMgcmV0dXJuZWQuXG4gICAqL1xuICBnZXRDYWNoZWRTb3VyY2VGaWxlKGZpbGVOYW1lOiBzdHJpbmcpOiB0cy5Tb3VyY2VGaWxlfHVuZGVmaW5lZCB7XG4gICAgY29uc3QgYWJzUGF0aCA9IHRoaXMuZnMucmVzb2x2ZShmaWxlTmFtZSk7XG4gICAgaWYgKGlzRGVmYXVsdExpYnJhcnkoYWJzUGF0aCwgdGhpcy5mcykpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldFN0YWJsZUNhY2hlZEZpbGUoYWJzUGF0aCk7XG4gICAgfSBlbHNlIGlmIChpc0FuZ3VsYXJEdHMoYWJzUGF0aCwgdGhpcy5mcykpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldFZvbGF0aWxlQ2FjaGVkRmlsZShhYnNQYXRoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQXR0ZW1wdHMgdG8gbG9hZCB0aGUgc291cmNlIGZpbGUgZnJvbSB0aGUgY2FjaGUsIG9yIHBhcnNlcyB0aGUgZmlsZSBpbnRvIGEgYHRzLlNvdXJjZUZpbGVgIGlmXG4gICAqIGl0J3Mgbm90IHlldCBjYWNoZWQuIFRoaXMgbWV0aG9kIGFzc3VtZXMgdGhhdCB0aGUgZmlsZSB3aWxsIG5vdCBiZSBtb2RpZmllZCBmb3IgdGhlIGR1cmF0aW9uXG4gICAqIHRoYXQgdGhpcyBjYWNoZSBpcyB2YWxpZCBmb3IuIElmIHRoYXQgYXNzdW1wdGlvbiBkb2VzIG5vdCBob2xkLCB0aGUgYGdldFZvbGF0aWxlQ2FjaGVkRmlsZWBcbiAgICogbWV0aG9kIGlzIHRvIGJlIHVzZWQgaW5zdGVhZC5cbiAgICovXG4gIHByaXZhdGUgZ2V0U3RhYmxlQ2FjaGVkRmlsZShhYnNQYXRoOiBBYnNvbHV0ZUZzUGF0aCk6IHRzLlNvdXJjZUZpbGV8dW5kZWZpbmVkIHtcbiAgICBpZiAoIXRoaXMuc2ZDYWNoZS5oYXMoYWJzUGF0aCkpIHtcbiAgICAgIGNvbnN0IGNvbnRlbnQgPSByZWFkRmlsZShhYnNQYXRoLCB0aGlzLmZzKTtcbiAgICAgIGlmIChjb250ZW50ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHNmID0gdHMuY3JlYXRlU291cmNlRmlsZShhYnNQYXRoLCBjb250ZW50LCB0cy5TY3JpcHRUYXJnZXQuRVMyMDE1KTtcbiAgICAgIHRoaXMuc2ZDYWNoZS5zZXQoYWJzUGF0aCwgc2YpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5zZkNhY2hlLmdldChhYnNQYXRoKSE7XG4gIH1cblxuICAvKipcbiAgICogSW4gY29udHJhc3QgdG8gYGdldFN0YWJsZUNhY2hlZEZpbGVgLCB0aGlzIG1ldGhvZCBhbHdheXMgdmVyaWZpZXMgdGhhdCB0aGUgY2FjaGVkIHNvdXJjZSBmaWxlXG4gICAqIGlzIHRoZSBzYW1lIGFzIHdoYXQncyBzdG9yZWQgb24gZGlzay4gVGhpcyBpcyBkb25lIGZvciBmaWxlcyB0aGF0IGFyZSBleHBlY3RlZCB0byBjaGFuZ2UgZHVyaW5nXG4gICAqIG5nY2MncyBwcm9jZXNzaW5nLCBzdWNoIGFzIEBhbmd1bGFyIHNjb3BlZCBwYWNrYWdlcyBmb3Igd2hpY2ggdGhlIC5kLnRzIGZpbGVzIGFyZSBvdmVyd3JpdHRlblxuICAgKiBieSBuZ2NjLiBJZiB0aGUgY29udGVudHMgb24gZGlzayBoYXZlIGNoYW5nZWQgY29tcGFyZWQgdG8gYSBwcmV2aW91c2x5IGNhY2hlZCBzb3VyY2UgZmlsZSwgdGhlXG4gICAqIGNvbnRlbnQgZnJvbSBkaXNrIGlzIHJlLXBhcnNlZCBhbmQgdGhlIGNhY2hlIGVudHJ5IGlzIHJlcGxhY2VkLlxuICAgKi9cbiAgcHJpdmF0ZSBnZXRWb2xhdGlsZUNhY2hlZEZpbGUoYWJzUGF0aDogQWJzb2x1dGVGc1BhdGgpOiB0cy5Tb3VyY2VGaWxlfHVuZGVmaW5lZCB7XG4gICAgY29uc3QgY29udGVudCA9IHJlYWRGaWxlKGFic1BhdGgsIHRoaXMuZnMpO1xuICAgIGlmIChjb250ZW50ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGlmICghdGhpcy5zZkNhY2hlLmhhcyhhYnNQYXRoKSB8fCB0aGlzLnNmQ2FjaGUuZ2V0KGFic1BhdGgpIS50ZXh0ICE9PSBjb250ZW50KSB7XG4gICAgICBjb25zdCBzZiA9IHRzLmNyZWF0ZVNvdXJjZUZpbGUoYWJzUGF0aCwgY29udGVudCwgdHMuU2NyaXB0VGFyZ2V0LkVTMjAxNSk7XG4gICAgICB0aGlzLnNmQ2FjaGUuc2V0KGFic1BhdGgsIHNmKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuc2ZDYWNoZS5nZXQoYWJzUGF0aCkhO1xuICB9XG59XG5cbmNvbnN0IERFRkFVTFRfTElCX1BBVFRFUk4gPSBbJ25vZGVfbW9kdWxlcycsICd0eXBlc2NyaXB0JywgJ2xpYicsIC9ebGliXFwuLitcXC5kXFwudHMkL107XG5cbi8qKlxuICogRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBwcm92aWRlZCBwYXRoIGNvcnJlc3BvbmRzIHdpdGggYSBkZWZhdWx0IGxpYnJhcnkgZmlsZSBpbnNpZGUgb2YgdGhlXG4gKiB0eXBlc2NyaXB0IHBhY2thZ2UuXG4gKlxuICogQHBhcmFtIGFic1BhdGggVGhlIHBhdGggZm9yIHdoaWNoIHRvIGRldGVybWluZSBpZiBpdCBjb3JyZXNwb25kcyB3aXRoIGEgZGVmYXVsdCBsaWJyYXJ5IGZpbGUuXG4gKiBAcGFyYW0gZnMgVGhlIGZpbGVzeXN0ZW0gdG8gdXNlIGZvciBpbnNwZWN0aW5nIHRoZSBwYXRoLlxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNEZWZhdWx0TGlicmFyeShhYnNQYXRoOiBBYnNvbHV0ZUZzUGF0aCwgZnM6IFJlYWRvbmx5RmlsZVN5c3RlbSk6IGJvb2xlYW4ge1xuICByZXR1cm4gaXNGaWxlKGFic1BhdGgsIERFRkFVTFRfTElCX1BBVFRFUk4sIGZzKTtcbn1cblxuY29uc3QgQU5HVUxBUl9EVFNfUEFUVEVSTiA9IFsnbm9kZV9tb2R1bGVzJywgJ0Bhbmd1bGFyJywgLy4vLCAvXFwuZFxcLnRzJC9dO1xuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciB0aGUgcHJvdmlkZWQgcGF0aCBjb3JyZXNwb25kcyB3aXRoIGEgLmQudHMgZmlsZSBpbnNpZGUgb2YgYW4gQGFuZ3VsYXJcbiAqIHNjb3BlZCBwYWNrYWdlLiBUaGlzIGxvZ2ljIG9ubHkgYWNjb3VudHMgZm9yIHRoZSAuZC50cyBmaWxlcyBpbiB0aGUgcm9vdCwgd2hpY2ggaXMgc3VmZmljaWVudFxuICogdG8gZmluZCB0aGUgbGFyZ2UsIGZsYXR0ZW5lZCBlbnRyeS1wb2ludCBmaWxlcyB0aGF0IGJlbmVmaXQgZnJvbSBjYWNoaW5nLlxuICpcbiAqIEBwYXJhbSBhYnNQYXRoIFRoZSBwYXRoIGZvciB3aGljaCB0byBkZXRlcm1pbmUgaWYgaXQgY29ycmVzcG9uZHMgd2l0aCBhbiBAYW5ndWxhciAuZC50cyBmaWxlLlxuICogQHBhcmFtIGZzIFRoZSBmaWxlc3lzdGVtIHRvIHVzZSBmb3IgaW5zcGVjdGluZyB0aGUgcGF0aC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzQW5ndWxhckR0cyhhYnNQYXRoOiBBYnNvbHV0ZUZzUGF0aCwgZnM6IFJlYWRvbmx5RmlsZVN5c3RlbSk6IGJvb2xlYW4ge1xuICByZXR1cm4gaXNGaWxlKGFic1BhdGgsIEFOR1VMQVJfRFRTX1BBVFRFUk4sIGZzKTtcbn1cblxuLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb24gdG8gZGV0ZXJtaW5lIHdoZXRoZXIgYSBmaWxlIGNvcnJlc3BvbmRzIHdpdGggYSBnaXZlbiBwYXR0ZXJuIG9mIHNlZ21lbnRzLlxuICpcbiAqIEBwYXJhbSBwYXRoIFRoZSBwYXRoIGZvciB3aGljaCB0byBkZXRlcm1pbmUgaWYgaXQgY29ycmVzcG9uZHMgd2l0aCB0aGUgcHJvdmlkZWQgc2VnbWVudHMuXG4gKiBAcGFyYW0gc2VnbWVudHMgQXJyYXkgb2Ygc2VnbWVudHM7IHRoZSBgcGF0aGAgbXVzdCBoYXZlIGVuZGluZyBzZWdtZW50cyB0aGF0IG1hdGNoIHRoZVxuICogcGF0dGVybnMgaW4gdGhpcyBhcnJheS5cbiAqIEBwYXJhbSBmcyBUaGUgZmlsZXN5c3RlbSB0byB1c2UgZm9yIGluc3BlY3RpbmcgdGhlIHBhdGguXG4gKi9cbmZ1bmN0aW9uIGlzRmlsZShcbiAgICBwYXRoOiBBYnNvbHV0ZUZzUGF0aCwgc2VnbWVudHM6IFJlYWRvbmx5QXJyYXk8c3RyaW5nfFJlZ0V4cD4sIGZzOiBSZWFkb25seUZpbGVTeXN0ZW0pOiBib29sZWFuIHtcbiAgZm9yIChsZXQgaSA9IHNlZ21lbnRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgY29uc3QgcGF0dGVybiA9IHNlZ21lbnRzW2ldO1xuICAgIGNvbnN0IHNlZ21lbnQgPSBmcy5iYXNlbmFtZShwYXRoKTtcbiAgICBpZiAodHlwZW9mIHBhdHRlcm4gPT09ICdzdHJpbmcnKSB7XG4gICAgICBpZiAocGF0dGVybiAhPT0gc2VnbWVudCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICghcGF0dGVybi50ZXN0KHNlZ21lbnQpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcGF0aCA9IGZzLmRpcm5hbWUocGF0aCk7XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5cbi8qKlxuICogQSBjYWNoZSBmb3IgcHJvY2Vzc2luZyBhIHNpbmdsZSBlbnRyeS1wb2ludC4gVGhpcyBleGlzdHMgdG8gc2hhcmUgYHRzLlNvdXJjZUZpbGVgcyBiZXR3ZWVuIHRoZVxuICogc291cmNlIGFuZCB0eXBpbmcgcHJvZ3JhbXMgdGhhdCBhcmUgY3JlYXRlZCBmb3IgYSBzaW5nbGUgcHJvZ3JhbS5cbiAqL1xuZXhwb3J0IGNsYXNzIEVudHJ5UG9pbnRGaWxlQ2FjaGUge1xuICBwcml2YXRlIHJlYWRvbmx5IHNmQ2FjaGUgPSBuZXcgTWFwPEFic29sdXRlRnNQYXRoLCB0cy5Tb3VyY2VGaWxlPigpO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgZnM6IFJlYWRvbmx5RmlsZVN5c3RlbSwgcHJpdmF0ZSBzaGFyZWRGaWxlQ2FjaGU6IFNoYXJlZEZpbGVDYWNoZSkge31cblxuICAvKipcbiAgICogUmV0dXJucyBhbmQgY2FjaGVzIGEgcGFyc2VkIGB0cy5Tb3VyY2VGaWxlYCBmb3IgdGhlIHByb3ZpZGVkIGBmaWxlTmFtZWAuIElmIHRoZSBgZmlsZU5hbWVgIGlzXG4gICAqIGNhY2hlZCBpbiB0aGUgc2hhcmVkIGZpbGUgY2FjaGUsIHRoYXQgcmVzdWx0IGlzIHVzZWQuIE90aGVyd2lzZSwgdGhlIHNvdXJjZSBmaWxlIGlzIGNhY2hlZFxuICAgKiBpbnRlcm5hbGx5LiBUaGlzIG1ldGhvZCByZXR1cm5zIGB1bmRlZmluZWRgIGlmIHRoZSByZXF1ZXN0ZWQgZmlsZSBkb2VzIG5vdCBleGlzdC5cbiAgICpcbiAgICogQHBhcmFtIGZpbGVOYW1lIFRoZSBwYXRoIG9mIHRoZSBmaWxlIHRvIHJldHJpZXZlIGEgc291cmNlIGZpbGUgZm9yLlxuICAgKiBAcGFyYW0gbGFuZ3VhZ2VWZXJzaW9uIFRoZSBsYW5ndWFnZSB2ZXJzaW9uIHRvIHVzZSBmb3IgcGFyc2luZyB0aGUgZmlsZS5cbiAgICovXG4gIGdldENhY2hlZFNvdXJjZUZpbGUoZmlsZU5hbWU6IHN0cmluZywgbGFuZ3VhZ2VWZXJzaW9uOiB0cy5TY3JpcHRUYXJnZXQpOiB0cy5Tb3VyY2VGaWxlfHVuZGVmaW5lZCB7XG4gICAgY29uc3Qgc3RhdGljU2YgPSB0aGlzLnNoYXJlZEZpbGVDYWNoZS5nZXRDYWNoZWRTb3VyY2VGaWxlKGZpbGVOYW1lKTtcbiAgICBpZiAoc3RhdGljU2YgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHN0YXRpY1NmO1xuICAgIH1cblxuICAgIGNvbnN0IGFic1BhdGggPSB0aGlzLmZzLnJlc29sdmUoZmlsZU5hbWUpO1xuICAgIGlmICh0aGlzLnNmQ2FjaGUuaGFzKGFic1BhdGgpKSB7XG4gICAgICByZXR1cm4gdGhpcy5zZkNhY2hlLmdldChhYnNQYXRoKTtcbiAgICB9XG5cbiAgICBjb25zdCBjb250ZW50ID0gcmVhZEZpbGUoYWJzUGF0aCwgdGhpcy5mcyk7XG4gICAgaWYgKGNvbnRlbnQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgY29uc3Qgc2YgPSB0cy5jcmVhdGVTb3VyY2VGaWxlKGZpbGVOYW1lLCBjb250ZW50LCBsYW5ndWFnZVZlcnNpb24pO1xuICAgIHRoaXMuc2ZDYWNoZS5zZXQoYWJzUGF0aCwgc2YpO1xuICAgIHJldHVybiBzZjtcbiAgfVxufVxuXG5mdW5jdGlvbiByZWFkRmlsZShhYnNQYXRoOiBBYnNvbHV0ZUZzUGF0aCwgZnM6IFJlYWRvbmx5RmlsZVN5c3RlbSk6IHN0cmluZ3x1bmRlZmluZWQge1xuICBpZiAoIWZzLmV4aXN0cyhhYnNQYXRoKSB8fCAhZnMuc3RhdChhYnNQYXRoKS5pc0ZpbGUoKSkge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbiAgcmV0dXJuIGZzLnJlYWRGaWxlKGFic1BhdGgpO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBgdHMuTW9kdWxlUmVzb2x1dGlvbkNhY2hlYCB0aGF0IHVzZXMgdGhlIHByb3ZpZGVkIGZpbGVzeXN0ZW0gZm9yIHBhdGggb3BlcmF0aW9ucy5cbiAqXG4gKiBAcGFyYW0gZnMgVGhlIGZpbGVzeXN0ZW0gdG8gdXNlIGZvciBwYXRoIG9wZXJhdGlvbnMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVNb2R1bGVSZXNvbHV0aW9uQ2FjaGUoZnM6IFJlYWRvbmx5RmlsZVN5c3RlbSk6IHRzLk1vZHVsZVJlc29sdXRpb25DYWNoZSB7XG4gIHJldHVybiB0cy5jcmVhdGVNb2R1bGVSZXNvbHV0aW9uQ2FjaGUoZnMucHdkKCksIGZpbGVOYW1lID0+IHtcbiAgICByZXR1cm4gZnMuaXNDYXNlU2Vuc2l0aXZlKCkgPyBmaWxlTmFtZSA6IGZpbGVOYW1lLnRvTG93ZXJDYXNlKCk7XG4gIH0pO1xufVxuIl19