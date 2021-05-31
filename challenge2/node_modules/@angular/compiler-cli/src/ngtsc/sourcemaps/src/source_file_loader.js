(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/ngtsc/sourcemaps/src/source_file_loader", ["require", "exports", "tslib", "convert-source-map", "@angular/compiler-cli/src/ngtsc/sourcemaps/src/content_origin", "@angular/compiler-cli/src/ngtsc/sourcemaps/src/source_file"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SourceFileLoader = void 0;
    var tslib_1 = require("tslib");
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var convert_source_map_1 = require("convert-source-map");
    var content_origin_1 = require("@angular/compiler-cli/src/ngtsc/sourcemaps/src/content_origin");
    var source_file_1 = require("@angular/compiler-cli/src/ngtsc/sourcemaps/src/source_file");
    var SCHEME_MATCHER = /^([a-z][a-z0-9.-]*):\/\//i;
    /**
     * This class can be used to load a source file, its associated source map and any upstream sources.
     *
     * Since a source file might reference (or include) a source map, this class can load those too.
     * Since a source map might reference other source files, these are also loaded as needed.
     *
     * This is done recursively. The result is a "tree" of `SourceFile` objects, each containing
     * mappings to other `SourceFile` objects as necessary.
     */
    var SourceFileLoader = /** @class */ (function () {
        function SourceFileLoader(fs, logger, 
        /** A map of URL schemes to base paths. The scheme name should be lowercase. */
        schemeMap) {
            this.fs = fs;
            this.logger = logger;
            this.schemeMap = schemeMap;
            this.currentPaths = [];
        }
        SourceFileLoader.prototype.loadSourceFile = function (sourcePath, contents, mapAndPath) {
            if (contents === void 0) { contents = null; }
            if (mapAndPath === void 0) { mapAndPath = null; }
            var contentsOrigin = contents !== null ? content_origin_1.ContentOrigin.Provided : content_origin_1.ContentOrigin.FileSystem;
            var sourceMapInfo = mapAndPath && tslib_1.__assign({ origin: content_origin_1.ContentOrigin.Provided }, mapAndPath);
            return this.loadSourceFileInternal(sourcePath, contents, contentsOrigin, sourceMapInfo);
        };
        /**
         * The overload used internally to load source files referenced in a source-map.
         *
         * In this case there is no guarantee that it will return a non-null SourceMap.
         *
         * @param sourcePath The path to the source file to load.
         * @param contents The contents of the source file to load, if provided inline. If `null`,
         *     the contents will be read from the file at the `sourcePath`.
         * @param sourceOrigin Describes where the source content came from.
         * @param sourceMapInfo The raw contents and path of the source-map file. If `null` the
         *     source-map will be computed from the contents of the source file, either inline or loaded
         *     from the file-system.
         *
         * @returns a SourceFile if the content for one was provided or was able to be loaded from disk,
         * `null` otherwise.
         */
        SourceFileLoader.prototype.loadSourceFileInternal = function (sourcePath, contents, sourceOrigin, sourceMapInfo) {
            var previousPaths = this.currentPaths.slice();
            try {
                if (contents === null) {
                    if (!this.fs.exists(sourcePath)) {
                        return null;
                    }
                    contents = this.readSourceFile(sourcePath);
                }
                // If not provided try to load the source map based on the source itself
                if (sourceMapInfo === null) {
                    sourceMapInfo = this.loadSourceMap(sourcePath, contents, sourceOrigin);
                }
                var sources = [];
                if (sourceMapInfo !== null) {
                    var basePath = sourceMapInfo.mapPath || sourcePath;
                    sources = this.processSources(basePath, sourceMapInfo);
                }
                return new source_file_1.SourceFile(sourcePath, contents, sourceMapInfo, sources, this.fs);
            }
            catch (e) {
                this.logger.warn("Unable to fully load " + sourcePath + " for source-map flattening: " + e.message);
                return null;
            }
            finally {
                // We are finished with this recursion so revert the paths being tracked
                this.currentPaths = previousPaths;
            }
        };
        /**
         * Find the source map associated with the source file whose `sourcePath` and `contents` are
         * provided.
         *
         * Source maps can be inline, as part of a base64 encoded comment, or external as a separate file
         * whose path is indicated in a comment or implied from the name of the source file itself.
         *
         * @param sourcePath the path to the source file.
         * @param sourceContents the contents of the source file.
         * @param sourceOrigin where the content of the source file came from.
         * @returns the parsed contents and path of the source-map, if loading was successful, null
         *     otherwise.
         */
        SourceFileLoader.prototype.loadSourceMap = function (sourcePath, sourceContents, sourceOrigin) {
            // Only consider a source-map comment from the last non-empty line of the file, in case there
            // are embedded source-map comments elsewhere in the file (as can be the case with bundlers like
            // webpack).
            var lastLine = this.getLastNonEmptyLine(sourceContents);
            var inline = convert_source_map_1.commentRegex.exec(lastLine);
            if (inline !== null) {
                return {
                    map: convert_source_map_1.fromComment(inline.pop()).sourcemap,
                    mapPath: null,
                    origin: content_origin_1.ContentOrigin.Inline,
                };
            }
            if (sourceOrigin === content_origin_1.ContentOrigin.Inline) {
                // The source file was provided inline and its contents did not include an inline source-map.
                // So we don't try to load an external source-map from the file-system, since this can lead to
                // invalid circular dependencies.
                return null;
            }
            var external = convert_source_map_1.mapFileCommentRegex.exec(lastLine);
            if (external) {
                try {
                    var fileName = external[1] || external[2];
                    var externalMapPath = this.fs.resolve(this.fs.dirname(sourcePath), fileName);
                    return {
                        map: this.readRawSourceMap(externalMapPath),
                        mapPath: externalMapPath,
                        origin: content_origin_1.ContentOrigin.FileSystem,
                    };
                }
                catch (e) {
                    this.logger.warn("Unable to fully load " + sourcePath + " for source-map flattening: " + e.message);
                    return null;
                }
            }
            var impliedMapPath = this.fs.resolve(sourcePath + '.map');
            if (this.fs.exists(impliedMapPath)) {
                return {
                    map: this.readRawSourceMap(impliedMapPath),
                    mapPath: impliedMapPath,
                    origin: content_origin_1.ContentOrigin.FileSystem,
                };
            }
            return null;
        };
        /**
         * Iterate over each of the "sources" for this source file's source map, recursively loading each
         * source file and its associated source map.
         */
        SourceFileLoader.prototype.processSources = function (basePath, _a) {
            var _this = this;
            var map = _a.map, sourceMapOrigin = _a.origin;
            var sourceRoot = this.fs.resolve(this.fs.dirname(basePath), this.replaceSchemeWithPath(map.sourceRoot || ''));
            return map.sources.map(function (source, index) {
                var path = _this.fs.resolve(sourceRoot, _this.replaceSchemeWithPath(source));
                var content = map.sourcesContent && map.sourcesContent[index] || null;
                // The origin of this source file is "inline" if we extracted it from the source-map's
                // `sourcesContent`, except when the source-map itself was "provided" in-memory.
                // An inline source file is treated as if it were from the file-system if the source-map that
                // contains it was provided in-memory. The first call to `loadSourceFile()` is special in that
                // if you "provide" the contents of the source-map in-memory then we don't want to block
                // loading sources from the file-system just because this source-map had an inline source.
                var sourceOrigin = content !== null && sourceMapOrigin !== content_origin_1.ContentOrigin.Provided ?
                    content_origin_1.ContentOrigin.Inline :
                    content_origin_1.ContentOrigin.FileSystem;
                return _this.loadSourceFileInternal(path, content, sourceOrigin, null);
            });
        };
        /**
         * Load the contents of the source file from disk.
         *
         * @param sourcePath The path to the source file.
         */
        SourceFileLoader.prototype.readSourceFile = function (sourcePath) {
            this.trackPath(sourcePath);
            return this.fs.readFile(sourcePath);
        };
        /**
         * Load the source map from the file at `mapPath`, parsing its JSON contents into a `RawSourceMap`
         * object.
         *
         * @param mapPath The path to the source-map file.
         */
        SourceFileLoader.prototype.readRawSourceMap = function (mapPath) {
            this.trackPath(mapPath);
            return JSON.parse(this.fs.readFile(mapPath));
        };
        /**
         * Track source file paths if we have loaded them from disk so that we don't get into an infinite
         * recursion.
         */
        SourceFileLoader.prototype.trackPath = function (path) {
            if (this.currentPaths.includes(path)) {
                throw new Error("Circular source file mapping dependency: " + this.currentPaths.join(' -> ') + " -> " + path);
            }
            this.currentPaths.push(path);
        };
        SourceFileLoader.prototype.getLastNonEmptyLine = function (contents) {
            var trailingWhitespaceIndex = contents.length - 1;
            while (trailingWhitespaceIndex > 0 &&
                (contents[trailingWhitespaceIndex] === '\n' ||
                    contents[trailingWhitespaceIndex] === '\r')) {
                trailingWhitespaceIndex--;
            }
            var lastRealLineIndex = contents.lastIndexOf('\n', trailingWhitespaceIndex - 1);
            if (lastRealLineIndex === -1) {
                lastRealLineIndex = 0;
            }
            return contents.substr(lastRealLineIndex + 1);
        };
        /**
         * Replace any matched URL schemes with their corresponding path held in the schemeMap.
         *
         * Some build tools replace real file paths with scheme prefixed paths - e.g. `webpack://`.
         * We use the `schemeMap` passed to this class to convert such paths to "real" file paths.
         * In some cases, this is not possible, since the file was actually synthesized by the build tool.
         * But the end result is better than prefixing the sourceRoot in front of the scheme.
         */
        SourceFileLoader.prototype.replaceSchemeWithPath = function (path) {
            var _this = this;
            return path.replace(SCHEME_MATCHER, function (_, scheme) { return _this.schemeMap[scheme.toLowerCase()] || ''; });
        };
        return SourceFileLoader;
    }());
    exports.SourceFileLoader = SourceFileLoader;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic291cmNlX2ZpbGVfbG9hZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy9uZ3RzYy9zb3VyY2VtYXBzL3NyYy9zb3VyY2VfZmlsZV9sb2FkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztJQUFBOzs7Ozs7T0FNRztJQUNILHlEQUFrRjtJQUtsRixnR0FBK0M7SUFFL0MsMEZBQXlDO0lBRXpDLElBQU0sY0FBYyxHQUFHLDJCQUEyQixDQUFDO0lBRW5EOzs7Ozs7OztPQVFHO0lBQ0g7UUFHRSwwQkFDWSxFQUFzQixFQUFVLE1BQWM7UUFDdEQsK0VBQStFO1FBQ3ZFLFNBQXlDO1lBRnpDLE9BQUUsR0FBRixFQUFFLENBQW9CO1lBQVUsV0FBTSxHQUFOLE1BQU0sQ0FBUTtZQUU5QyxjQUFTLEdBQVQsU0FBUyxDQUFnQztZQUw3QyxpQkFBWSxHQUFxQixFQUFFLENBQUM7UUFLWSxDQUFDO1FBNkJ6RCx5Q0FBYyxHQUFkLFVBQ0ksVUFBMEIsRUFBRSxRQUE0QixFQUN4RCxVQUFrQztZQUROLHlCQUFBLEVBQUEsZUFBNEI7WUFDeEQsMkJBQUEsRUFBQSxpQkFBa0M7WUFDcEMsSUFBTSxjQUFjLEdBQUcsUUFBUSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsOEJBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLDhCQUFhLENBQUMsVUFBVSxDQUFDO1lBQzdGLElBQU0sYUFBYSxHQUNmLFVBQVUsdUJBQUssTUFBTSxFQUFFLDhCQUFhLENBQUMsUUFBUSxJQUFLLFVBQVUsQ0FBQyxDQUFDO1lBQ2xFLE9BQU8sSUFBSSxDQUFDLHNCQUFzQixDQUFDLFVBQVUsRUFBRSxRQUFRLEVBQUUsY0FBYyxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBQzFGLENBQUM7UUFFRDs7Ozs7Ozs7Ozs7Ozs7O1dBZUc7UUFDSyxpREFBc0IsR0FBOUIsVUFDSSxV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QUNELElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQy9CLENBQUM7UUFFTyw4Q0FBbUIsR0FBM0IsVUFBNEIsUUFBZ0I7WUFDMUMsSUFBSSx1QkFBdUIsR0FBRyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztZQUNsRCxPQUFPLHVCQUF1QixHQUFHLENBQUM7Z0JBQzNCLENBQUMsUUFBUSxDQUFDLHVCQUF1QixDQUFDLEtBQUssSUFBSTtvQkFDMUMsUUFBUSxDQUFDLHVCQUF1QixDQUFDLEtBQUssSUFBSSxDQUFDLEVBQUU7Z0JBQ25ELHVCQUF1QixFQUFFLENBQUM7YUFDM0I7WUFDRCxJQUFJLGlCQUFpQixHQUFHLFFBQVEsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLHVCQUF1QixHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ2hGLElBQUksaUJBQWlCLEtBQUssQ0FBQyxDQUFDLEVBQUU7Z0JBQzVCLGlCQUFpQixHQUFHLENBQUMsQ0FBQzthQUN2QjtZQUNELE9BQU8sUUFBUSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNoRCxDQUFDO1FBRUQ7Ozs7Ozs7V0FPRztRQUNLLGdEQUFxQixHQUE3QixVQUE4QixJQUFZO1lBQTFDLGlCQUdDO1lBRkMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUNmLGNBQWMsRUFBRSxVQUFDLENBQVMsRUFBRSxNQUFjLElBQUssT0FBQSxLQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBMUMsQ0FBMEMsQ0FBQyxDQUFDO1FBQ2pHLENBQUM7UUFDSCx1QkFBQztJQUFELENBQUMsQUFsUEQsSUFrUEM7SUFsUFksNENBQWdCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge2NvbW1lbnRSZWdleCwgZnJvbUNvbW1lbnQsIG1hcEZpbGVDb21tZW50UmVnZXh9IGZyb20gJ2NvbnZlcnQtc291cmNlLW1hcCc7XG5cbmltcG9ydCB7QWJzb2x1dGVGc1BhdGgsIFJlYWRvbmx5RmlsZVN5c3RlbX0gZnJvbSAnLi4vLi4vZmlsZV9zeXN0ZW0nO1xuaW1wb3J0IHtMb2dnZXJ9IGZyb20gJy4uLy4uL2xvZ2dpbmcnO1xuXG5pbXBvcnQge0NvbnRlbnRPcmlnaW59IGZyb20gJy4vY29udGVudF9vcmlnaW4nO1xuaW1wb3J0IHtNYXBBbmRQYXRoLCBSYXdTb3VyY2VNYXAsIFNvdXJjZU1hcEluZm99IGZyb20gJy4vcmF3X3NvdXJjZV9tYXAnO1xuaW1wb3J0IHtTb3VyY2VGaWxlfSBmcm9tICcuL3NvdXJjZV9maWxlJztcblxuY29uc3QgU0NIRU1FX01BVENIRVIgPSAvXihbYS16XVthLXowLTkuLV0qKTpcXC9cXC8vaTtcblxuLyoqXG4gKiBUaGlzIGNsYXNzIGNhbiBiZSB1c2VkIHRvIGxvYWQgYSBzb3VyY2UgZmlsZSwgaXRzIGFzc29jaWF0ZWQgc291cmNlIG1hcCBhbmQgYW55IHVwc3RyZWFtIHNvdXJjZXMuXG4gKlxuICogU2luY2UgYSBzb3VyY2UgZmlsZSBtaWdodCByZWZlcmVuY2UgKG9yIGluY2x1ZGUpIGEgc291cmNlIG1hcCwgdGhpcyBjbGFzcyBjYW4gbG9hZCB0aG9zZSB0b28uXG4gKiBTaW5jZSBhIHNvdXJjZSBtYXAgbWlnaHQgcmVmZXJlbmNlIG90aGVyIHNvdXJjZSBmaWxlcywgdGhlc2UgYXJlIGFsc28gbG9hZGVkIGFzIG5lZWRlZC5cbiAqXG4gKiBUaGlzIGlzIGRvbmUgcmVjdXJzaXZlbHkuIFRoZSByZXN1bHQgaXMgYSBcInRyZWVcIiBvZiBgU291cmNlRmlsZWAgb2JqZWN0cywgZWFjaCBjb250YWluaW5nXG4gKiBtYXBwaW5ncyB0byBvdGhlciBgU291cmNlRmlsZWAgb2JqZWN0cyBhcyBuZWNlc3NhcnkuXG4gKi9cbmV4cG9ydCBjbGFzcyBTb3VyY2VGaWxlTG9hZGVyIHtcbiAgcHJpdmF0ZSBjdXJyZW50UGF0aHM6IEFic29sdXRlRnNQYXRoW10gPSBbXTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgZnM6IFJlYWRvbmx5RmlsZVN5c3RlbSwgcHJpdmF0ZSBsb2dnZXI6IExvZ2dlcixcbiAgICAgIC8qKiBBIG1hcCBvZiBVUkwgc2NoZW1lcyB0byBiYXNlIHBhdGhzLiBUaGUgc2NoZW1lIG5hbWUgc2hvdWxkIGJlIGxvd2VyY2FzZS4gKi9cbiAgICAgIHByaXZhdGUgc2NoZW1lTWFwOiBSZWNvcmQ8c3RyaW5nLCBBYnNvbHV0ZUZzUGF0aD4pIHt9XG5cbiAgLyoqXG4gICAqIExvYWQgYSBzb3VyY2UgZmlsZSBmcm9tIHRoZSBwcm92aWRlZCBjb250ZW50IGFuZCBzb3VyY2UgbWFwLCBhbmQgcmVjdXJzaXZlbHkgbG9hZCBhbnlcbiAgICogcmVmZXJlbmNlZCBzb3VyY2UgZmlsZXMuXG4gICAqXG4gICAqIEBwYXJhbSBzb3VyY2VQYXRoIFRoZSBwYXRoIHRvIHRoZSBzb3VyY2UgZmlsZSB0byBsb2FkLlxuICAgKiBAcGFyYW0gY29udGVudHMgVGhlIGNvbnRlbnRzIG9mIHRoZSBzb3VyY2UgZmlsZSB0byBsb2FkLlxuICAgKiBAcGFyYW0gbWFwQW5kUGF0aCBUaGUgcmF3IHNvdXJjZS1tYXAgYW5kIHRoZSBwYXRoIHRvIHRoZSBzb3VyY2UtbWFwIGZpbGUuXG4gICAqIEByZXR1cm5zIGEgU291cmNlRmlsZSBvYmplY3QgY3JlYXRlZCBmcm9tIHRoZSBgY29udGVudHNgIGFuZCBwcm92aWRlZCBzb3VyY2UtbWFwIGluZm8uXG4gICAqL1xuICBsb2FkU291cmNlRmlsZShzb3VyY2VQYXRoOiBBYnNvbHV0ZUZzUGF0aCwgY29udGVudHM6IHN0cmluZywgbWFwQW5kUGF0aDogTWFwQW5kUGF0aCk6IFNvdXJjZUZpbGU7XG4gIC8qKlxuICAgKiBMb2FkIGEgc291cmNlIGZpbGUgZnJvbSB0aGUgcHJvdmlkZWQgY29udGVudCwgY29tcHV0ZSBpdHMgc291cmNlIG1hcCwgYW5kIHJlY3Vyc2l2ZWx5IGxvYWQgYW55XG4gICAqIHJlZmVyZW5jZWQgc291cmNlIGZpbGVzLlxuICAgKlxuICAgKiBAcGFyYW0gc291cmNlUGF0aCBUaGUgcGF0aCB0byB0aGUgc291cmNlIGZpbGUgdG8gbG9hZC5cbiAgICogQHBhcmFtIGNvbnRlbnRzIFRoZSBjb250ZW50cyBvZiB0aGUgc291cmNlIGZpbGUgdG8gbG9hZC5cbiAgICogQHJldHVybnMgYSBTb3VyY2VGaWxlIG9iamVjdCBjcmVhdGVkIGZyb20gdGhlIGBjb250ZW50c2AgYW5kIGNvbXB1dGVkIHNvdXJjZS1tYXAgaW5mby5cbiAgICovXG4gIGxvYWRTb3VyY2VGaWxlKHNvdXJjZVBhdGg6IEFic29sdXRlRnNQYXRoLCBjb250ZW50czogc3RyaW5nKTogU291cmNlRmlsZTtcbiAgLyoqXG4gICAqIExvYWQgYSBzb3VyY2UgZmlsZSBmcm9tIHRoZSBmaWxlLXN5c3RlbSwgY29tcHV0ZSBpdHMgc291cmNlIG1hcCwgYW5kIHJlY3Vyc2l2ZWx5IGxvYWQgYW55XG4gICAqIHJlZmVyZW5jZWQgc291cmNlIGZpbGVzLlxuICAgKlxuICAgKiBAcGFyYW0gc291cmNlUGF0aCBUaGUgcGF0aCB0byB0aGUgc291cmNlIGZpbGUgdG8gbG9hZC5cbiAgICogQHJldHVybnMgYSBTb3VyY2VGaWxlIG9iamVjdCBpZiBpdHMgY29udGVudHMgY291bGQgYmUgbG9hZGVkIGZyb20gZGlzaywgb3IgbnVsbCBvdGhlcndpc2UuXG4gICAqL1xuICBsb2FkU291cmNlRmlsZShzb3VyY2VQYXRoOiBBYnNvbHV0ZUZzUGF0aCk6IFNvdXJjZUZpbGV8bnVsbDtcbiAgbG9hZFNvdXJjZUZpbGUoXG4gICAgICBzb3VyY2VQYXRoOiBBYnNvbHV0ZUZzUGF0aCwgY29udGVudHM6IHN0cmluZ3xudWxsID0gbnVsbCxcbiAgICAgIG1hcEFuZFBhdGg6IE1hcEFuZFBhdGh8bnVsbCA9IG51bGwpOiBTb3VyY2VGaWxlfG51bGwge1xuICAgIGNvbnN0IGNvbnRlbnRzT3JpZ2luID0gY29udGVudHMgIT09IG51bGwgPyBDb250ZW50T3JpZ2luLlByb3ZpZGVkIDogQ29udGVudE9yaWdpbi5GaWxlU3lzdGVtO1xuICAgIGNvbnN0IHNvdXJjZU1hcEluZm86IFNvdXJjZU1hcEluZm98bnVsbCA9XG4gICAgICAgIG1hcEFuZFBhdGggJiYge29yaWdpbjogQ29udGVudE9yaWdpbi5Qcm92aWRlZCwgLi4ubWFwQW5kUGF0aH07XG4gICAgcmV0dXJuIHRoaXMubG9hZFNvdXJjZUZpbGVJbnRlcm5hbChzb3VyY2VQYXRoLCBjb250ZW50cywgY29udGVudHNPcmlnaW4sIHNvdXJjZU1hcEluZm8pO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBvdmVybG9hZCB1c2VkIGludGVybmFsbHkgdG8gbG9hZCBzb3VyY2UgZmlsZXMgcmVmZXJlbmNlZCBpbiBhIHNvdXJjZS1tYXAuXG4gICAqXG4gICAqIEluIHRoaXMgY2FzZSB0aGVyZSBpcyBubyBndWFyYW50ZWUgdGhhdCBpdCB3aWxsIHJldHVybiBhIG5vbi1udWxsIFNvdXJjZU1hcC5cbiAgICpcbiAgICogQHBhcmFtIHNvdXJjZVBhdGggVGhlIHBhdGggdG8gdGhlIHNvdXJjZSBmaWxlIHRvIGxvYWQuXG4gICAqIEBwYXJhbSBjb250ZW50cyBUaGUgY29udGVudHMgb2YgdGhlIHNvdXJjZSBmaWxlIHRvIGxvYWQsIGlmIHByb3ZpZGVkIGlubGluZS4gSWYgYG51bGxgLFxuICAgKiAgICAgdGhlIGNvbnRlbnRzIHdpbGwgYmUgcmVhZCBmcm9tIHRoZSBmaWxlIGF0IHRoZSBgc291cmNlUGF0aGAuXG4gICAqIEBwYXJhbSBzb3VyY2VPcmlnaW4gRGVzY3JpYmVzIHdoZXJlIHRoZSBzb3VyY2UgY29udGVudCBjYW1lIGZyb20uXG4gICAqIEBwYXJhbSBzb3VyY2VNYXBJbmZvIFRoZSByYXcgY29udGVudHMgYW5kIHBhdGggb2YgdGhlIHNvdXJjZS1tYXAgZmlsZS4gSWYgYG51bGxgIHRoZVxuICAgKiAgICAgc291cmNlLW1hcCB3aWxsIGJlIGNvbXB1dGVkIGZyb20gdGhlIGNvbnRlbnRzIG9mIHRoZSBzb3VyY2UgZmlsZSwgZWl0aGVyIGlubGluZSBvciBsb2FkZWRcbiAgICogICAgIGZyb20gdGhlIGZpbGUtc3lzdGVtLlxuICAgKlxuICAgKiBAcmV0dXJucyBhIFNvdXJjZUZpbGUgaWYgdGhlIGNvbnRlbnQgZm9yIG9uZSB3YXMgcHJvdmlkZWQgb3Igd2FzIGFibGUgdG8gYmUgbG9hZGVkIGZyb20gZGlzayxcbiAgICogYG51bGxgIG90aGVyd2lzZS5cbiAgICovXG4gIHByaXZhdGUgbG9hZFNvdXJjZUZpbGVJbnRlcm5hbChcbiAgICAgIHNvdXJjZVBhdGg6IEFic29sdXRlRnNQYXRoLCBjb250ZW50czogc3RyaW5nfG51bGwsIHNvdXJjZU9yaWdpbjogQ29udGVudE9yaWdpbixcbiAgICAgIHNvdXJjZU1hcEluZm86IFNvdXJjZU1hcEluZm98bnVsbCk6IFNvdXJjZUZpbGV8bnVsbCB7XG4gICAgY29uc3QgcHJldmlvdXNQYXRocyA9IHRoaXMuY3VycmVudFBhdGhzLnNsaWNlKCk7XG4gICAgdHJ5IHtcbiAgICAgIGlmIChjb250ZW50cyA9PT0gbnVsbCkge1xuICAgICAgICBpZiAoIXRoaXMuZnMuZXhpc3RzKHNvdXJjZVBhdGgpKSB7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgY29udGVudHMgPSB0aGlzLnJlYWRTb3VyY2VGaWxlKHNvdXJjZVBhdGgpO1xuICAgICAgfVxuXG4gICAgICAvLyBJZiBub3QgcHJvdmlkZWQgdHJ5IHRvIGxvYWQgdGhlIHNvdXJjZSBtYXAgYmFzZWQgb24gdGhlIHNvdXJjZSBpdHNlbGZcbiAgICAgIGlmIChzb3VyY2VNYXBJbmZvID09PSBudWxsKSB7XG4gICAgICAgIHNvdXJjZU1hcEluZm8gPSB0aGlzLmxvYWRTb3VyY2VNYXAoc291cmNlUGF0aCwgY29udGVudHMsIHNvdXJjZU9yaWdpbik7XG4gICAgICB9XG5cbiAgICAgIGxldCBzb3VyY2VzOiAoU291cmNlRmlsZXxudWxsKVtdID0gW107XG4gICAgICBpZiAoc291cmNlTWFwSW5mbyAhPT0gbnVsbCkge1xuICAgICAgICBjb25zdCBiYXNlUGF0aCA9IHNvdXJjZU1hcEluZm8ubWFwUGF0aCB8fCBzb3VyY2VQYXRoO1xuICAgICAgICBzb3VyY2VzID0gdGhpcy5wcm9jZXNzU291cmNlcyhiYXNlUGF0aCwgc291cmNlTWFwSW5mbyk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBuZXcgU291cmNlRmlsZShzb3VyY2VQYXRoLCBjb250ZW50cywgc291cmNlTWFwSW5mbywgc291cmNlcywgdGhpcy5mcyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhpcy5sb2dnZXIud2FybihcbiAgICAgICAgICBgVW5hYmxlIHRvIGZ1bGx5IGxvYWQgJHtzb3VyY2VQYXRofSBmb3Igc291cmNlLW1hcCBmbGF0dGVuaW5nOiAke2UubWVzc2FnZX1gKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0gZmluYWxseSB7XG4gICAgICAvLyBXZSBhcmUgZmluaXNoZWQgd2l0aCB0aGlzIHJlY3Vyc2lvbiBzbyByZXZlcnQgdGhlIHBhdGhzIGJlaW5nIHRyYWNrZWRcbiAgICAgIHRoaXMuY3VycmVudFBhdGhzID0gcHJldmlvdXNQYXRocztcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRmluZCB0aGUgc291cmNlIG1hcCBhc3NvY2lhdGVkIHdpdGggdGhlIHNvdXJjZSBmaWxlIHdob3NlIGBzb3VyY2VQYXRoYCBhbmQgYGNvbnRlbnRzYCBhcmVcbiAgICogcHJvdmlkZWQuXG4gICAqXG4gICAqIFNvdXJjZSBtYXBzIGNhbiBiZSBpbmxpbmUsIGFzIHBhcnQgb2YgYSBiYXNlNjQgZW5jb2RlZCBjb21tZW50LCBvciBleHRlcm5hbCBhcyBhIHNlcGFyYXRlIGZpbGVcbiAgICogd2hvc2UgcGF0aCBpcyBpbmRpY2F0ZWQgaW4gYSBjb21tZW50IG9yIGltcGxpZWQgZnJvbSB0aGUgbmFtZSBvZiB0aGUgc291cmNlIGZpbGUgaXRzZWxmLlxuICAgKlxuICAgKiBAcGFyYW0gc291cmNlUGF0aCB0aGUgcGF0aCB0byB0aGUgc291cmNlIGZpbGUuXG4gICAqIEBwYXJhbSBzb3VyY2VDb250ZW50cyB0aGUgY29udGVudHMgb2YgdGhlIHNvdXJjZSBmaWxlLlxuICAgKiBAcGFyYW0gc291cmNlT3JpZ2luIHdoZXJlIHRoZSBjb250ZW50IG9mIHRoZSBzb3VyY2UgZmlsZSBjYW1lIGZyb20uXG4gICAqIEByZXR1cm5zIHRoZSBwYXJzZWQgY29udGVudHMgYW5kIHBhdGggb2YgdGhlIHNvdXJjZS1tYXAsIGlmIGxvYWRpbmcgd2FzIHN1Y2Nlc3NmdWwsIG51bGxcbiAgICogICAgIG90aGVyd2lzZS5cbiAgICovXG4gIHByaXZhdGUgbG9hZFNvdXJjZU1hcChcbiAgICAgIHNvdXJjZVBhdGg6IEFic29sdXRlRnNQYXRoLCBzb3VyY2VDb250ZW50czogc3RyaW5nLFxuICAgICAgc291cmNlT3JpZ2luOiBDb250ZW50T3JpZ2luKTogU291cmNlTWFwSW5mb3xudWxsIHtcbiAgICAvLyBPbmx5IGNvbnNpZGVyIGEgc291cmNlLW1hcCBjb21tZW50IGZyb20gdGhlIGxhc3Qgbm9uLWVtcHR5IGxpbmUgb2YgdGhlIGZpbGUsIGluIGNhc2UgdGhlcmVcbiAgICAvLyBhcmUgZW1iZWRkZWQgc291cmNlLW1hcCBjb21tZW50cyBlbHNld2hlcmUgaW4gdGhlIGZpbGUgKGFzIGNhbiBiZSB0aGUgY2FzZSB3aXRoIGJ1bmRsZXJzIGxpa2VcbiAgICAvLyB3ZWJwYWNrKS5cbiAgICBjb25zdCBsYXN0TGluZSA9IHRoaXMuZ2V0TGFzdE5vbkVtcHR5TGluZShzb3VyY2VDb250ZW50cyk7XG4gICAgY29uc3QgaW5saW5lID0gY29tbWVudFJlZ2V4LmV4ZWMobGFzdExpbmUpO1xuICAgIGlmIChpbmxpbmUgIT09IG51bGwpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG1hcDogZnJvbUNvbW1lbnQoaW5saW5lLnBvcCgpISkuc291cmNlbWFwLFxuICAgICAgICBtYXBQYXRoOiBudWxsLFxuICAgICAgICBvcmlnaW46IENvbnRlbnRPcmlnaW4uSW5saW5lLFxuICAgICAgfTtcbiAgICB9XG5cbiAgICBpZiAoc291cmNlT3JpZ2luID09PSBDb250ZW50T3JpZ2luLklubGluZSkge1xuICAgICAgLy8gVGhlIHNvdXJjZSBmaWxlIHdhcyBwcm92aWRlZCBpbmxpbmUgYW5kIGl0cyBjb250ZW50cyBkaWQgbm90IGluY2x1ZGUgYW4gaW5saW5lIHNvdXJjZS1tYXAuXG4gICAgICAvLyBTbyB3ZSBkb24ndCB0cnkgdG8gbG9hZCBhbiBleHRlcm5hbCBzb3VyY2UtbWFwIGZyb20gdGhlIGZpbGUtc3lzdGVtLCBzaW5jZSB0aGlzIGNhbiBsZWFkIHRvXG4gICAgICAvLyBpbnZhbGlkIGNpcmN1bGFyIGRlcGVuZGVuY2llcy5cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IGV4dGVybmFsID0gbWFwRmlsZUNvbW1lbnRSZWdleC5leGVjKGxhc3RMaW5lKTtcbiAgICBpZiAoZXh0ZXJuYWwpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGZpbGVOYW1lID0gZXh0ZXJuYWxbMV0gfHwgZXh0ZXJuYWxbMl07XG4gICAgICAgIGNvbnN0IGV4dGVybmFsTWFwUGF0aCA9IHRoaXMuZnMucmVzb2x2ZSh0aGlzLmZzLmRpcm5hbWUoc291cmNlUGF0aCksIGZpbGVOYW1lKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBtYXA6IHRoaXMucmVhZFJhd1NvdXJjZU1hcChleHRlcm5hbE1hcFBhdGgpLFxuICAgICAgICAgIG1hcFBhdGg6IGV4dGVybmFsTWFwUGF0aCxcbiAgICAgICAgICBvcmlnaW46IENvbnRlbnRPcmlnaW4uRmlsZVN5c3RlbSxcbiAgICAgICAgfTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgdGhpcy5sb2dnZXIud2FybihcbiAgICAgICAgICAgIGBVbmFibGUgdG8gZnVsbHkgbG9hZCAke3NvdXJjZVBhdGh9IGZvciBzb3VyY2UtbWFwIGZsYXR0ZW5pbmc6ICR7ZS5tZXNzYWdlfWApO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBpbXBsaWVkTWFwUGF0aCA9IHRoaXMuZnMucmVzb2x2ZShzb3VyY2VQYXRoICsgJy5tYXAnKTtcbiAgICBpZiAodGhpcy5mcy5leGlzdHMoaW1wbGllZE1hcFBhdGgpKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBtYXA6IHRoaXMucmVhZFJhd1NvdXJjZU1hcChpbXBsaWVkTWFwUGF0aCksXG4gICAgICAgIG1hcFBhdGg6IGltcGxpZWRNYXBQYXRoLFxuICAgICAgICBvcmlnaW46IENvbnRlbnRPcmlnaW4uRmlsZVN5c3RlbSxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKipcbiAgICogSXRlcmF0ZSBvdmVyIGVhY2ggb2YgdGhlIFwic291cmNlc1wiIGZvciB0aGlzIHNvdXJjZSBmaWxlJ3Mgc291cmNlIG1hcCwgcmVjdXJzaXZlbHkgbG9hZGluZyBlYWNoXG4gICAqIHNvdXJjZSBmaWxlIGFuZCBpdHMgYXNzb2NpYXRlZCBzb3VyY2UgbWFwLlxuICAgKi9cbiAgcHJpdmF0ZSBwcm9jZXNzU291cmNlcyhiYXNlUGF0aDogQWJzb2x1dGVGc1BhdGgsIHttYXAsIG9yaWdpbjogc291cmNlTWFwT3JpZ2lufTogU291cmNlTWFwSW5mbyk6XG4gICAgICAoU291cmNlRmlsZXxudWxsKVtdIHtcbiAgICBjb25zdCBzb3VyY2VSb290ID0gdGhpcy5mcy5yZXNvbHZlKFxuICAgICAgICB0aGlzLmZzLmRpcm5hbWUoYmFzZVBhdGgpLCB0aGlzLnJlcGxhY2VTY2hlbWVXaXRoUGF0aChtYXAuc291cmNlUm9vdCB8fCAnJykpO1xuICAgIHJldHVybiBtYXAuc291cmNlcy5tYXAoKHNvdXJjZSwgaW5kZXgpID0+IHtcbiAgICAgIGNvbnN0IHBhdGggPSB0aGlzLmZzLnJlc29sdmUoc291cmNlUm9vdCwgdGhpcy5yZXBsYWNlU2NoZW1lV2l0aFBhdGgoc291cmNlKSk7XG4gICAgICBjb25zdCBjb250ZW50ID0gbWFwLnNvdXJjZXNDb250ZW50ICYmIG1hcC5zb3VyY2VzQ29udGVudFtpbmRleF0gfHwgbnVsbDtcbiAgICAgIC8vIFRoZSBvcmlnaW4gb2YgdGhpcyBzb3VyY2UgZmlsZSBpcyBcImlubGluZVwiIGlmIHdlIGV4dHJhY3RlZCBpdCBmcm9tIHRoZSBzb3VyY2UtbWFwJ3NcbiAgICAgIC8vIGBzb3VyY2VzQ29udGVudGAsIGV4Y2VwdCB3aGVuIHRoZSBzb3VyY2UtbWFwIGl0c2VsZiB3YXMgXCJwcm92aWRlZFwiIGluLW1lbW9yeS5cbiAgICAgIC8vIEFuIGlubGluZSBzb3VyY2UgZmlsZSBpcyB0cmVhdGVkIGFzIGlmIGl0IHdlcmUgZnJvbSB0aGUgZmlsZS1zeXN0ZW0gaWYgdGhlIHNvdXJjZS1tYXAgdGhhdFxuICAgICAgLy8gY29udGFpbnMgaXQgd2FzIHByb3ZpZGVkIGluLW1lbW9yeS4gVGhlIGZpcnN0IGNhbGwgdG8gYGxvYWRTb3VyY2VGaWxlKClgIGlzIHNwZWNpYWwgaW4gdGhhdFxuICAgICAgLy8gaWYgeW91IFwicHJvdmlkZVwiIHRoZSBjb250ZW50cyBvZiB0aGUgc291cmNlLW1hcCBpbi1tZW1vcnkgdGhlbiB3ZSBkb24ndCB3YW50IHRvIGJsb2NrXG4gICAgICAvLyBsb2FkaW5nIHNvdXJjZXMgZnJvbSB0aGUgZmlsZS1zeXN0ZW0ganVzdCBiZWNhdXNlIHRoaXMgc291cmNlLW1hcCBoYWQgYW4gaW5saW5lIHNvdXJjZS5cbiAgICAgIGNvbnN0IHNvdXJjZU9yaWdpbiA9IGNvbnRlbnQgIT09IG51bGwgJiYgc291cmNlTWFwT3JpZ2luICE9PSBDb250ZW50T3JpZ2luLlByb3ZpZGVkID9cbiAgICAgICAgICBDb250ZW50T3JpZ2luLklubGluZSA6XG4gICAgICAgICAgQ29udGVudE9yaWdpbi5GaWxlU3lzdGVtO1xuICAgICAgcmV0dXJuIHRoaXMubG9hZFNvdXJjZUZpbGVJbnRlcm5hbChwYXRoLCBjb250ZW50LCBzb3VyY2VPcmlnaW4sIG51bGwpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIExvYWQgdGhlIGNvbnRlbnRzIG9mIHRoZSBzb3VyY2UgZmlsZSBmcm9tIGRpc2suXG4gICAqXG4gICAqIEBwYXJhbSBzb3VyY2VQYXRoIFRoZSBwYXRoIHRvIHRoZSBzb3VyY2UgZmlsZS5cbiAgICovXG4gIHByaXZhdGUgcmVhZFNvdXJjZUZpbGUoc291cmNlUGF0aDogQWJzb2x1dGVGc1BhdGgpOiBzdHJpbmcge1xuICAgIHRoaXMudHJhY2tQYXRoKHNvdXJjZVBhdGgpO1xuICAgIHJldHVybiB0aGlzLmZzLnJlYWRGaWxlKHNvdXJjZVBhdGgpO1xuICB9XG5cbiAgLyoqXG4gICAqIExvYWQgdGhlIHNvdXJjZSBtYXAgZnJvbSB0aGUgZmlsZSBhdCBgbWFwUGF0aGAsIHBhcnNpbmcgaXRzIEpTT04gY29udGVudHMgaW50byBhIGBSYXdTb3VyY2VNYXBgXG4gICAqIG9iamVjdC5cbiAgICpcbiAgICogQHBhcmFtIG1hcFBhdGggVGhlIHBhdGggdG8gdGhlIHNvdXJjZS1tYXAgZmlsZS5cbiAgICovXG4gIHByaXZhdGUgcmVhZFJhd1NvdXJjZU1hcChtYXBQYXRoOiBBYnNvbHV0ZUZzUGF0aCk6IFJhd1NvdXJjZU1hcCB7XG4gICAgdGhpcy50cmFja1BhdGgobWFwUGF0aCk7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UodGhpcy5mcy5yZWFkRmlsZShtYXBQYXRoKSkgYXMgUmF3U291cmNlTWFwO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyYWNrIHNvdXJjZSBmaWxlIHBhdGhzIGlmIHdlIGhhdmUgbG9hZGVkIHRoZW0gZnJvbSBkaXNrIHNvIHRoYXQgd2UgZG9uJ3QgZ2V0IGludG8gYW4gaW5maW5pdGVcbiAgICogcmVjdXJzaW9uLlxuICAgKi9cbiAgcHJpdmF0ZSB0cmFja1BhdGgocGF0aDogQWJzb2x1dGVGc1BhdGgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5jdXJyZW50UGF0aHMuaW5jbHVkZXMocGF0aCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgQ2lyY3VsYXIgc291cmNlIGZpbGUgbWFwcGluZyBkZXBlbmRlbmN5OiAke3RoaXMuY3VycmVudFBhdGhzLmpvaW4oJyAtPiAnKX0gLT4gJHtwYXRofWApO1xuICAgIH1cbiAgICB0aGlzLmN1cnJlbnRQYXRocy5wdXNoKHBhdGgpO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRMYXN0Tm9uRW1wdHlMaW5lKGNvbnRlbnRzOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGxldCB0cmFpbGluZ1doaXRlc3BhY2VJbmRleCA9IGNvbnRlbnRzLmxlbmd0aCAtIDE7XG4gICAgd2hpbGUgKHRyYWlsaW5nV2hpdGVzcGFjZUluZGV4ID4gMCAmJlxuICAgICAgICAgICAoY29udGVudHNbdHJhaWxpbmdXaGl0ZXNwYWNlSW5kZXhdID09PSAnXFxuJyB8fFxuICAgICAgICAgICAgY29udGVudHNbdHJhaWxpbmdXaGl0ZXNwYWNlSW5kZXhdID09PSAnXFxyJykpIHtcbiAgICAgIHRyYWlsaW5nV2hpdGVzcGFjZUluZGV4LS07XG4gICAgfVxuICAgIGxldCBsYXN0UmVhbExpbmVJbmRleCA9IGNvbnRlbnRzLmxhc3RJbmRleE9mKCdcXG4nLCB0cmFpbGluZ1doaXRlc3BhY2VJbmRleCAtIDEpO1xuICAgIGlmIChsYXN0UmVhbExpbmVJbmRleCA9PT0gLTEpIHtcbiAgICAgIGxhc3RSZWFsTGluZUluZGV4ID0gMDtcbiAgICB9XG4gICAgcmV0dXJuIGNvbnRlbnRzLnN1YnN0cihsYXN0UmVhbExpbmVJbmRleCArIDEpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlcGxhY2UgYW55IG1hdGNoZWQgVVJMIHNjaGVtZXMgd2l0aCB0aGVpciBjb3JyZXNwb25kaW5nIHBhdGggaGVsZCBpbiB0aGUgc2NoZW1lTWFwLlxuICAgKlxuICAgKiBTb21lIGJ1aWxkIHRvb2xzIHJlcGxhY2UgcmVhbCBmaWxlIHBhdGhzIHdpdGggc2NoZW1lIHByZWZpeGVkIHBhdGhzIC0gZS5nLiBgd2VicGFjazovL2AuXG4gICAqIFdlIHVzZSB0aGUgYHNjaGVtZU1hcGAgcGFzc2VkIHRvIHRoaXMgY2xhc3MgdG8gY29udmVydCBzdWNoIHBhdGhzIHRvIFwicmVhbFwiIGZpbGUgcGF0aHMuXG4gICAqIEluIHNvbWUgY2FzZXMsIHRoaXMgaXMgbm90IHBvc3NpYmxlLCBzaW5jZSB0aGUgZmlsZSB3YXMgYWN0dWFsbHkgc3ludGhlc2l6ZWQgYnkgdGhlIGJ1aWxkIHRvb2wuXG4gICAqIEJ1dCB0aGUgZW5kIHJlc3VsdCBpcyBiZXR0ZXIgdGhhbiBwcmVmaXhpbmcgdGhlIHNvdXJjZVJvb3QgaW4gZnJvbnQgb2YgdGhlIHNjaGVtZS5cbiAgICovXG4gIHByaXZhdGUgcmVwbGFjZVNjaGVtZVdpdGhQYXRoKHBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHBhdGgucmVwbGFjZShcbiAgICAgICAgU0NIRU1FX01BVENIRVIsIChfOiBzdHJpbmcsIHNjaGVtZTogc3RyaW5nKSA9PiB0aGlzLnNjaGVtZU1hcFtzY2hlbWUudG9Mb3dlckNhc2UoKV0gfHwgJycpO1xuICB9XG59XG4iXX0=