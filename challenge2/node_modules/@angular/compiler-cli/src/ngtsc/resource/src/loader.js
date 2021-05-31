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
        define("@angular/compiler-cli/src/ngtsc/resource/src/loader", ["require", "exports", "tslib", "typescript", "@angular/compiler-cli/src/ngtsc/file_system"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AdapterResourceLoader = void 0;
    var tslib_1 = require("tslib");
    var ts = require("typescript");
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    var CSS_PREPROCESSOR_EXT = /(\.scss|\.sass|\.less|\.styl)$/;
    var RESOURCE_MARKER = '.$ngresource$';
    var RESOURCE_MARKER_TS = RESOURCE_MARKER + '.ts';
    /**
     * `ResourceLoader` which delegates to an `NgCompilerAdapter`'s resource loading methods.
     */
    var AdapterResourceLoader = /** @class */ (function () {
        function AdapterResourceLoader(adapter, options) {
            this.adapter = adapter;
            this.options = options;
            this.cache = new Map();
            this.fetching = new Map();
            this.lookupResolutionHost = createLookupResolutionHost(this.adapter);
            this.canPreload = !!this.adapter.readResource;
            this.canPreprocess = !!this.adapter.transformResource;
        }
        /**
         * Resolve the url of a resource relative to the file that contains the reference to it.
         * The return value of this method can be used in the `load()` and `preload()` methods.
         *
         * Uses the provided CompilerHost if it supports mapping resources to filenames.
         * Otherwise, uses a fallback mechanism that searches the module resolution candidates.
         *
         * @param url The, possibly relative, url of the resource.
         * @param fromFile The path to the file that contains the URL of the resource.
         * @returns A resolved url of resource.
         * @throws An error if the resource cannot be resolved.
         */
        AdapterResourceLoader.prototype.resolve = function (url, fromFile) {
            var _this = this;
            var resolvedUrl = null;
            if (this.adapter.resourceNameToFileName) {
                resolvedUrl = this.adapter.resourceNameToFileName(url, fromFile, function (url, fromFile) { return _this.fallbackResolve(url, fromFile); });
            }
            else {
                resolvedUrl = this.fallbackResolve(url, fromFile);
            }
            if (resolvedUrl === null) {
                throw new Error("HostResourceResolver: could not resolve " + url + " in context of " + fromFile + ")");
            }
            return resolvedUrl;
        };
        /**
         * Preload the specified resource, asynchronously.
         *
         * Once the resource is loaded, its value is cached so it can be accessed synchronously via the
         * `load()` method.
         *
         * @param resolvedUrl The url (resolved by a call to `resolve()`) of the resource to preload.
         * @param context Information about the resource such as the type and containing file.
         * @returns A Promise that is resolved once the resource has been loaded or `undefined` if the
         * file has already been loaded.
         * @throws An Error if pre-loading is not available.
         */
        AdapterResourceLoader.prototype.preload = function (resolvedUrl, context) {
            var _this = this;
            if (!this.adapter.readResource) {
                throw new Error('HostResourceLoader: the CompilerHost provided does not support pre-loading resources.');
            }
            if (this.cache.has(resolvedUrl)) {
                return undefined;
            }
            else if (this.fetching.has(resolvedUrl)) {
                return this.fetching.get(resolvedUrl);
            }
            var result = this.adapter.readResource(resolvedUrl);
            if (this.adapter.transformResource && context.type === 'style') {
                var resourceContext_1 = {
                    type: 'style',
                    containingFile: context.containingFile,
                    resourceFile: resolvedUrl,
                };
                result = Promise.resolve(result).then(function (str) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                    var transformResult;
                    return tslib_1.__generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, this.adapter.transformResource(str, resourceContext_1)];
                            case 1:
                                transformResult = _a.sent();
                                return [2 /*return*/, transformResult === null ? str : transformResult.content];
                        }
                    });
                }); });
            }
            if (typeof result === 'string') {
                this.cache.set(resolvedUrl, result);
                return undefined;
            }
            else {
                var fetchCompletion = result.then(function (str) {
                    _this.fetching.delete(resolvedUrl);
                    _this.cache.set(resolvedUrl, str);
                });
                this.fetching.set(resolvedUrl, fetchCompletion);
                return fetchCompletion;
            }
        };
        /**
         * Preprocess the content data of an inline resource, asynchronously.
         *
         * @param data The existing content data from the inline resource.
         * @param context Information regarding the resource such as the type and containing file.
         * @returns A Promise that resolves to the processed data. If no processing occurs, the
         * same data string that was passed to the function will be resolved.
         */
        AdapterResourceLoader.prototype.preprocessInline = function (data, context) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var transformResult;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.adapter.transformResource || context.type !== 'style') {
                                return [2 /*return*/, data];
                            }
                            return [4 /*yield*/, this.adapter.transformResource(data, { type: 'style', containingFile: context.containingFile, resourceFile: null })];
                        case 1:
                            transformResult = _a.sent();
                            if (transformResult === null) {
                                return [2 /*return*/, data];
                            }
                            return [2 /*return*/, transformResult.content];
                    }
                });
            });
        };
        /**
         * Load the resource at the given url, synchronously.
         *
         * The contents of the resource may have been cached by a previous call to `preload()`.
         *
         * @param resolvedUrl The url (resolved by a call to `resolve()`) of the resource to load.
         * @returns The contents of the resource.
         */
        AdapterResourceLoader.prototype.load = function (resolvedUrl) {
            if (this.cache.has(resolvedUrl)) {
                return this.cache.get(resolvedUrl);
            }
            var result = this.adapter.readResource ? this.adapter.readResource(resolvedUrl) :
                this.adapter.readFile(resolvedUrl);
            if (typeof result !== 'string') {
                throw new Error("HostResourceLoader: loader(" + resolvedUrl + ") returned a Promise");
            }
            this.cache.set(resolvedUrl, result);
            return result;
        };
        /**
         * Invalidate the entire resource cache.
         */
        AdapterResourceLoader.prototype.invalidate = function () {
            this.cache.clear();
        };
        /**
         * Attempt to resolve `url` in the context of `fromFile`, while respecting the rootDirs
         * option from the tsconfig. First, normalize the file name.
         */
        AdapterResourceLoader.prototype.fallbackResolve = function (url, fromFile) {
            var e_1, _a;
            var candidateLocations;
            if (url.startsWith('/')) {
                // This path is not really an absolute path, but instead the leading '/' means that it's
                // rooted in the project rootDirs. So look for it according to the rootDirs.
                candidateLocations = this.getRootedCandidateLocations(url);
            }
            else {
                // This path is a "relative" path and can be resolved as such. To make this easier on the
                // downstream resolver, the './' prefix is added if missing to distinguish these paths from
                // absolute node_modules paths.
                if (!url.startsWith('.')) {
                    url = "./" + url;
                }
                candidateLocations = this.getResolvedCandidateLocations(url, fromFile);
            }
            try {
                for (var candidateLocations_1 = tslib_1.__values(candidateLocations), candidateLocations_1_1 = candidateLocations_1.next(); !candidateLocations_1_1.done; candidateLocations_1_1 = candidateLocations_1.next()) {
                    var candidate = candidateLocations_1_1.value;
                    if (this.adapter.fileExists(candidate)) {
                        return candidate;
                    }
                    else if (CSS_PREPROCESSOR_EXT.test(candidate)) {
                        /**
                         * If the user specified styleUrl points to *.scss, but the Sass compiler was run before
                         * Angular, then the resource may have been generated as *.css. Simply try the resolution
                         * again.
                         */
                        var cssFallbackUrl = candidate.replace(CSS_PREPROCESSOR_EXT, '.css');
                        if (this.adapter.fileExists(cssFallbackUrl)) {
                            return cssFallbackUrl;
                        }
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (candidateLocations_1_1 && !candidateLocations_1_1.done && (_a = candidateLocations_1.return)) _a.call(candidateLocations_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return null;
        };
        AdapterResourceLoader.prototype.getRootedCandidateLocations = function (url) {
            // The path already starts with '/', so add a '.' to make it relative.
            var segment = ('.' + url);
            return this.adapter.rootDirs.map(function (rootDir) { return file_system_1.join(rootDir, segment); });
        };
        /**
         * TypeScript provides utilities to resolve module names, but not resource files (which aren't
         * a part of the ts.Program). However, TypeScript's module resolution can be used creatively
         * to locate where resource files should be expected to exist. Since module resolution returns
         * a list of file names that were considered, the loader can enumerate the possible locations
         * for the file by setting up a module resolution for it that will fail.
         */
        AdapterResourceLoader.prototype.getResolvedCandidateLocations = function (url, fromFile) {
            // clang-format off
            var failedLookup = ts.resolveModuleName(url + RESOURCE_MARKER, fromFile, this.options, this.lookupResolutionHost);
            // clang-format on
            if (failedLookup.failedLookupLocations === undefined) {
                throw new Error("Internal error: expected to find failedLookupLocations during resolution of resource '" + url + "' in context of " + fromFile);
            }
            return failedLookup.failedLookupLocations
                .filter(function (candidate) { return candidate.endsWith(RESOURCE_MARKER_TS); })
                .map(function (candidate) { return candidate.slice(0, -RESOURCE_MARKER_TS.length); });
        };
        return AdapterResourceLoader;
    }());
    exports.AdapterResourceLoader = AdapterResourceLoader;
    /**
     * Derives a `ts.ModuleResolutionHost` from a compiler adapter that recognizes the special resource
     * marker and does not go to the filesystem for these requests, as they are known not to exist.
     */
    function createLookupResolutionHost(adapter) {
        var _a, _b, _c;
        return {
            directoryExists: function (directoryName) {
                if (directoryName.includes(RESOURCE_MARKER)) {
                    return false;
                }
                else if (adapter.directoryExists !== undefined) {
                    return adapter.directoryExists(directoryName);
                }
                else {
                    // TypeScript's module resolution logic assumes that the directory exists when no host
                    // implementation is available.
                    return true;
                }
            },
            fileExists: function (fileName) {
                if (fileName.includes(RESOURCE_MARKER)) {
                    return false;
                }
                else {
                    return adapter.fileExists(fileName);
                }
            },
            readFile: adapter.readFile.bind(adapter),
            getCurrentDirectory: adapter.getCurrentDirectory.bind(adapter),
            getDirectories: (_a = adapter.getDirectories) === null || _a === void 0 ? void 0 : _a.bind(adapter),
            realpath: (_b = adapter.realpath) === null || _b === void 0 ? void 0 : _b.bind(adapter),
            trace: (_c = adapter.trace) === null || _c === void 0 ? void 0 : _c.bind(adapter),
        };
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9hZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy9uZ3RzYy9yZXNvdXJjZS9zcmMvbG9hZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCwrQkFBaUM7SUFJakMsMkVBQW9FO0lBR3BFLElBQU0sb0JBQW9CLEdBQUcsZ0NBQWdDLENBQUM7SUFFOUQsSUFBTSxlQUFlLEdBQUcsZUFBZSxDQUFDO0lBQ3hDLElBQU0sa0JBQWtCLEdBQUcsZUFBZSxHQUFHLEtBQUssQ0FBQztJQUVuRDs7T0FFRztJQUNIO1FBUUUsK0JBQW9CLE9BQTBCLEVBQVUsT0FBMkI7WUFBL0QsWUFBTyxHQUFQLE9BQU8sQ0FBbUI7WUFBVSxZQUFPLEdBQVAsT0FBTyxDQUFvQjtZQVAzRSxVQUFLLEdBQUcsSUFBSSxHQUFHLEVBQWtCLENBQUM7WUFDbEMsYUFBUSxHQUFHLElBQUksR0FBRyxFQUF5QixDQUFDO1lBQzVDLHlCQUFvQixHQUFHLDBCQUEwQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUV4RSxlQUFVLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDO1lBQ3pDLGtCQUFhLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUM7UUFFcUMsQ0FBQztRQUV2Rjs7Ozs7Ozs7Ozs7V0FXRztRQUNILHVDQUFPLEdBQVAsVUFBUSxHQUFXLEVBQUUsUUFBZ0I7WUFBckMsaUJBWUM7WUFYQyxJQUFJLFdBQVcsR0FBZ0IsSUFBSSxDQUFDO1lBQ3BDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsRUFBRTtnQkFDdkMsV0FBVyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsc0JBQXNCLENBQzdDLEdBQUcsRUFBRSxRQUFRLEVBQUUsVUFB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LEtBQUssU0FBUyxFQUFFO29CQUNoRCxPQUFPLE9BQU8sQ0FBQyxlQUFlLENBQUMsYUFBYSxDQUFDLENBQUM7aUJBQy9DO3FCQUFNO29CQUNMLHNGQUFzRjtvQkFDdEYsK0JBQStCO29CQUMvQixPQUFPLElBQUksQ0FBQztpQkFDYjtZQUNILENBQUM7WUFDRCxVQUFVLEVBQVYsVUFBVyxRQUFnQjtnQkFDekIsSUFBSSxRQUFRLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxFQUFFO29CQUN0QyxPQUFPLEtBQUssQ0FBQztpQkFDZDtxQkFBTTtvQkFDTCxPQUFPLE9BQU8sQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7aUJBQ3JDO1lBQ0gsQ0FBQztZQUNELFFBQVEsRUFBRSxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7WUFDeEMsbUJBQW1CLEVBQUUsT0FBTyxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7WUFDOUQsY0FBYyxFQUFFLE1BQUEsT0FBTyxDQUFDLGNBQWMsMENBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQztZQUNyRCxRQUFRLEVBQUUsTUFBQSxPQUFPLENBQUMsUUFBUSwwQ0FBRSxJQUFJLENBQUMsT0FBTyxDQUFDO1lBQ3pDLEtBQUssRUFBRSxNQUFBLE9BQU8sQ0FBQyxLQUFLLDBDQUFFLElBQUksQ0FBQyxPQUFPLENBQUM7U0FDcEMsQ0FBQztJQUNKLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7UmVzb3VyY2VMb2FkZXIsIFJlc291cmNlTG9hZGVyQ29udGV4dH0gZnJvbSAnLi4vLi4vYW5ub3RhdGlvbnMnO1xuaW1wb3J0IHtOZ0NvbXBpbGVyQWRhcHRlciwgUmVzb3VyY2VIb3N0Q29udGV4dH0gZnJvbSAnLi4vLi4vY29yZS9hcGknO1xuaW1wb3J0IHtBYnNvbHV0ZUZzUGF0aCwgam9pbiwgUGF0aFNlZ21lbnR9IGZyb20gJy4uLy4uL2ZpbGVfc3lzdGVtJztcbmltcG9ydCB7UmVxdWlyZWREZWxlZ2F0aW9uc30gZnJvbSAnLi4vLi4vdXRpbC9zcmMvdHlwZXNjcmlwdCc7XG5cbmNvbnN0IENTU19QUkVQUk9DRVNTT1JfRVhUID0gLyhcXC5zY3NzfFxcLnNhc3N8XFwubGVzc3xcXC5zdHlsKSQvO1xuXG5jb25zdCBSRVNPVVJDRV9NQVJLRVIgPSAnLiRuZ3Jlc291cmNlJCc7XG5jb25zdCBSRVNPVVJDRV9NQVJLRVJfVFMgPSBSRVNPVVJDRV9NQVJLRVIgKyAnLnRzJztcblxuLyoqXG4gKiBgUmVzb3VyY2VMb2FkZXJgIHdoaWNoIGRlbGVnYXRlcyB0byBhbiBgTmdDb21waWxlckFkYXB0ZXJgJ3MgcmVzb3VyY2UgbG9hZGluZyBtZXRob2RzLlxuICovXG5leHBvcnQgY2xhc3MgQWRhcHRlclJlc291cmNlTG9hZGVyIGltcGxlbWVudHMgUmVzb3VyY2VMb2FkZXIge1xuICBwcml2YXRlIGNhY2hlID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKTtcbiAgcHJpdmF0ZSBmZXRjaGluZyA9IG5ldyBNYXA8c3RyaW5nLCBQcm9taXNlPHZvaWQ+PigpO1xuICBwcml2YXRlIGxvb2t1cFJlc29sdXRpb25Ib3N0ID0gY3JlYXRlTG9va3VwUmVzb2x1dGlvbkhvc3QodGhpcy5hZGFwdGVyKTtcblxuICBjYW5QcmVsb2FkID0gISF0aGlzLmFkYXB0ZXIucmVhZFJlc291cmNlO1xuICBjYW5QcmVwcm9jZXNzID0gISF0aGlzLmFkYXB0ZXIudHJhbnNmb3JtUmVzb3VyY2U7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBhZGFwdGVyOiBOZ0NvbXBpbGVyQWRhcHRlciwgcHJpdmF0ZSBvcHRpb25zOiB0cy5Db21waWxlck9wdGlvbnMpIHt9XG5cbiAgLyoqXG4gICAqIFJlc29sdmUgdGhlIHVybCBvZiBhIHJlc291cmNlIHJlbGF0aXZlIHRvIHRoZSBmaWxlIHRoYXQgY29udGFpbnMgdGhlIHJlZmVyZW5jZSB0byBpdC5cbiAgICogVGhlIHJldHVybiB2YWx1ZSBvZiB0aGlzIG1ldGhvZCBjYW4gYmUgdXNlZCBpbiB0aGUgYGxvYWQoKWAgYW5kIGBwcmVsb2FkKClgIG1ldGhvZHMuXG4gICAqXG4gICAqIFVzZXMgdGhlIHByb3ZpZGVkIENvbXBpbGVySG9zdCBpZiBpdCBzdXBwb3J0cyBtYXBwaW5nIHJlc291cmNlcyB0byBmaWxlbmFtZXMuXG4gICAqIE90aGVyd2lzZSwgdXNlcyBhIGZhbGxiYWNrIG1lY2hhbmlzbSB0aGF0IHNlYXJjaGVzIHRoZSBtb2R1bGUgcmVzb2x1dGlvbiBjYW5kaWRhdGVzLlxuICAgKlxuICAgKiBAcGFyYW0gdXJsIFRoZSwgcG9zc2libHkgcmVsYXRpdmUsIHVybCBvZiB0aGUgcmVzb3VyY2UuXG4gICAqIEBwYXJhbSBmcm9tRmlsZSBUaGUgcGF0aCB0byB0aGUgZmlsZSB0aGF0IGNvbnRhaW5zIHRoZSBVUkwgb2YgdGhlIHJlc291cmNlLlxuICAgKiBAcmV0dXJucyBBIHJlc29sdmVkIHVybCBvZiByZXNvdXJjZS5cbiAgICogQHRocm93cyBBbiBlcnJvciBpZiB0aGUgcmVzb3VyY2UgY2Fubm90IGJlIHJlc29sdmVkLlxuICAgKi9cbiAgcmVzb2x2ZSh1cmw6IHN0cmluZywgZnJvbUZpbGU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgbGV0IHJlc29sdmVkVXJsOiBzdHJpbmd8bnVsbCA9IG51bGw7XG4gICAgaWYgKHRoaXMuYWRhcHRlci5yZXNvdXJjZU5hbWVUb0ZpbGVOYW1lKSB7XG4gICAgICByZXNvbHZlZFVybCA9IHRoaXMuYWRhcHRlci5yZXNvdXJjZU5hbWVUb0ZpbGVOYW1lKFxuICAgICAgICAgIHVybCwgZnJvbUZpbGUsICh1cmw6IHN0cmluZywgZnJvbUZpbGU6IHN0cmluZykgPT4gdGhpcy5mYWxsYmFja1Jlc29sdmUodXJsLCBmcm9tRmlsZSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXNvbHZlZFVybCA9IHRoaXMuZmFsbGJhY2tSZXNvbHZlKHVybCwgZnJvbUZpbGUpO1xuICAgIH1cbiAgICBpZiAocmVzb2x2ZWRVcmwgPT09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgSG9zdFJlc291cmNlUmVzb2x2ZXI6IGNvdWxkIG5vdCByZXNvbHZlICR7dXJsfSBpbiBjb250ZXh0IG9mICR7ZnJvbUZpbGV9KWApO1xuICAgIH1cbiAgICByZXR1cm4gcmVzb2x2ZWRVcmw7XG4gIH1cblxuICAvKipcbiAgICogUHJlbG9hZCB0aGUgc3BlY2lmaWVkIHJlc291cmNlLCBhc3luY2hyb25vdXNseS5cbiAgICpcbiAgICogT25jZSB0aGUgcmVzb3VyY2UgaXMgbG9hZGVkLCBpdHMgdmFsdWUgaXMgY2FjaGVkIHNvIGl0IGNhbiBiZSBhY2Nlc3NlZCBzeW5jaHJvbm91c2x5IHZpYSB0aGVcbiAgICogYGxvYWQoKWAgbWV0aG9kLlxuICAgKlxuICAgKiBAcGFyYW0gcmVzb2x2ZWRVcmwgVGhlIHVybCAocmVzb2x2ZWQgYnkgYSBjYWxsIHRvIGByZXNvbHZlKClgKSBvZiB0aGUgcmVzb3VyY2UgdG8gcHJlbG9hZC5cbiAgICogQHBhcmFtIGNvbnRleHQgSW5mb3JtYXRpb24gYWJvdXQgdGhlIHJlc291cmNlIHN1Y2ggYXMgdGhlIHR5cGUgYW5kIGNvbnRhaW5pbmcgZmlsZS5cbiAgICogQHJldHVybnMgQSBQcm9taXNlIHRoYXQgaXMgcmVzb2x2ZWQgb25jZSB0aGUgcmVzb3VyY2UgaGFzIGJlZW4gbG9hZGVkIG9yIGB1bmRlZmluZWRgIGlmIHRoZVxuICAgKiBmaWxlIGhhcyBhbHJlYWR5IGJlZW4gbG9hZGVkLlxuICAgKiBAdGhyb3dzIEFuIEVycm9yIGlmIHByZS1sb2FkaW5nIGlzIG5vdCBhdmFpbGFibGUuXG4gICAqL1xuICBwcmVsb2FkKHJlc29sdmVkVXJsOiBzdHJpbmcsIGNvbnRleHQ6IFJlc291cmNlTG9hZGVyQ29udGV4dCk6IFByb21pc2U8dm9pZD58dW5kZWZpbmVkIHtcbiAgICBpZiAoIXRoaXMuYWRhcHRlci5yZWFkUmVzb3VyY2UpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAnSG9zdFJlc291cmNlTG9hZGVyOiB0aGUgQ29tcGlsZXJIb3N0IHByb3ZpZGVkIGRvZXMgbm90IHN1cHBvcnQgcHJlLWxvYWRpbmcgcmVzb3VyY2VzLicpO1xuICAgIH1cbiAgICBpZiAodGhpcy5jYWNoZS5oYXMocmVzb2x2ZWRVcmwpKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH0gZWxzZSBpZiAodGhpcy5mZXRjaGluZy5oYXMocmVzb2x2ZWRVcmwpKSB7XG4gICAgICByZXR1cm4gdGhpcy5mZXRjaGluZy5nZXQocmVzb2x2ZWRVcmwpO1xuICAgIH1cblxuICAgIGxldCByZXN1bHQgPSB0aGlzLmFkYXB0ZXIucmVhZFJlc291cmNlKHJlc29sdmVkVXJsKTtcblxuICAgIGlmICh0aGlzLmFkYXB0ZXIudHJhbnNmb3JtUmVzb3VyY2UgJiYgY29udGV4dC50eXBlID09PSAnc3R5bGUnKSB7XG4gICAgICBjb25zdCByZXNvdXJjZUNvbnRleHQ6IFJlc291cmNlSG9zdENvbnRleHQgPSB7XG4gICAgICAgIHR5cGU6ICdzdHlsZScsXG4gICAgICAgIGNvbnRhaW5pbmdGaWxlOiBjb250ZXh0LmNvbnRhaW5pbmdGaWxlLFxuICAgICAgICByZXNvdXJjZUZpbGU6IHJlc29sdmVkVXJsLFxuICAgICAgfTtcbiAgICAgIHJlc3VsdCA9IFByb21pc2UucmVzb2x2ZShyZXN1bHQpLnRoZW4oYXN5bmMgKHN0cikgPT4ge1xuICAgICAgICBjb25zdCB0cmFuc2Zvcm1SZXN1bHQgPSBhd2FpdCB0aGlzLmFkYXB0ZXIudHJhbnNmb3JtUmVzb3VyY2UhKHN0ciwgcmVzb3VyY2VDb250ZXh0KTtcbiAgICAgICAgcmV0dXJuIHRyYW5zZm9ybVJlc3VsdCA9PT0gbnVsbCA/IHN0ciA6IHRyYW5zZm9ybVJlc3VsdC5jb250ZW50O1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiByZXN1bHQgPT09ICdzdHJpbmcnKSB7XG4gICAgICB0aGlzLmNhY2hlLnNldChyZXNvbHZlZFVybCwgcmVzdWx0KTtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGZldGNoQ29tcGxldGlvbiA9IHJlc3VsdC50aGVuKHN0ciA9PiB7XG4gICAgICAgIHRoaXMuZmV0Y2hpbmcuZGVsZXRlKHJlc29sdmVkVXJsKTtcbiAgICAgICAgdGhpcy5jYWNoZS5zZXQocmVzb2x2ZWRVcmwsIHN0cik7XG4gICAgICB9KTtcbiAgICAgIHRoaXMuZmV0Y2hpbmcuc2V0KHJlc29sdmVkVXJsLCBmZXRjaENvbXBsZXRpb24pO1xuICAgICAgcmV0dXJuIGZldGNoQ29tcGxldGlvbjtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUHJlcHJvY2VzcyB0aGUgY29udGVudCBkYXRhIG9mIGFuIGlubGluZSByZXNvdXJjZSwgYXN5bmNocm9ub3VzbHkuXG4gICAqXG4gICAqIEBwYXJhbSBkYXRhIFRoZSBleGlzdGluZyBjb250ZW50IGRhdGEgZnJvbSB0aGUgaW5saW5lIHJlc291cmNlLlxuICAgKiBAcGFyYW0gY29udGV4dCBJbmZvcm1hdGlvbiByZWdhcmRpbmcgdGhlIHJlc291cmNlIHN1Y2ggYXMgdGhlIHR5cGUgYW5kIGNvbnRhaW5pbmcgZmlsZS5cbiAgICogQHJldHVybnMgQSBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gdGhlIHByb2Nlc3NlZCBkYXRhLiBJZiBubyBwcm9jZXNzaW5nIG9jY3VycywgdGhlXG4gICAqIHNhbWUgZGF0YSBzdHJpbmcgdGhhdCB3YXMgcGFzc2VkIHRvIHRoZSBmdW5jdGlvbiB3aWxsIGJlIHJlc29sdmVkLlxuICAgKi9cbiAgYXN5bmMgcHJlcHJvY2Vzc0lubGluZShkYXRhOiBzdHJpbmcsIGNvbnRleHQ6IFJlc291cmNlTG9hZGVyQ29udGV4dCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgaWYgKCF0aGlzLmFkYXB0ZXIudHJhbnNmb3JtUmVzb3VyY2UgfHwgY29udGV4dC50eXBlICE9PSAnc3R5bGUnKSB7XG4gICAgICByZXR1cm4gZGF0YTtcbiAgICB9XG5cbiAgICBjb25zdCB0cmFuc2Zvcm1SZXN1bHQgPSBhd2FpdCB0aGlzLmFkYXB0ZXIudHJhbnNmb3JtUmVzb3VyY2UoXG4gICAgICAgIGRhdGEsIHt0eXBlOiAnc3R5bGUnLCBjb250YWluaW5nRmlsZTogY29udGV4dC5jb250YWluaW5nRmlsZSwgcmVzb3VyY2VGaWxlOiBudWxsfSk7XG4gICAgaWYgKHRyYW5zZm9ybVJlc3VsdCA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRyYW5zZm9ybVJlc3VsdC5jb250ZW50O1xuICB9XG5cbiAgLyoqXG4gICAqIExvYWQgdGhlIHJlc291cmNlIGF0IHRoZSBnaXZlbiB1cmwsIHN5bmNocm9ub3VzbHkuXG4gICAqXG4gICAqIFRoZSBjb250ZW50cyBvZiB0aGUgcmVzb3VyY2UgbWF5IGhhdmUgYmVlbiBjYWNoZWQgYnkgYSBwcmV2aW91cyBjYWxsIHRvIGBwcmVsb2FkKClgLlxuICAgKlxuICAgKiBAcGFyYW0gcmVzb2x2ZWRVcmwgVGhlIHVybCAocmVzb2x2ZWQgYnkgYSBjYWxsIHRvIGByZXNvbHZlKClgKSBvZiB0aGUgcmVzb3VyY2UgdG8gbG9hZC5cbiAgICogQHJldHVybnMgVGhlIGNvbnRlbnRzIG9mIHRoZSByZXNvdXJjZS5cbiAgICovXG4gIGxvYWQocmVzb2x2ZWRVcmw6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgaWYgKHRoaXMuY2FjaGUuaGFzKHJlc29sdmVkVXJsKSkge1xuICAgICAgcmV0dXJuIHRoaXMuY2FjaGUuZ2V0KHJlc29sdmVkVXJsKSE7XG4gICAgfVxuXG4gICAgY29uc3QgcmVzdWx0ID0gdGhpcy5hZGFwdGVyLnJlYWRSZXNvdXJjZSA/IHRoaXMuYWRhcHRlci5yZWFkUmVzb3VyY2UocmVzb2x2ZWRVcmwpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGFwdGVyLnJlYWRGaWxlKHJlc29sdmVkVXJsKTtcbiAgICBpZiAodHlwZW9mIHJlc3VsdCAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgSG9zdFJlc291cmNlTG9hZGVyOiBsb2FkZXIoJHtyZXNvbHZlZFVybH0pIHJldHVybmVkIGEgUHJvbWlzZWApO1xuICAgIH1cbiAgICB0aGlzLmNhY2hlLnNldChyZXNvbHZlZFVybCwgcmVzdWx0KTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyoqXG4gICAqIEludmFsaWRhdGUgdGhlIGVudGlyZSByZXNvdXJjZSBjYWNoZS5cbiAgICovXG4gIGludmFsaWRhdGUoKTogdm9pZCB7XG4gICAgdGhpcy5jYWNoZS5jbGVhcigpO1xuICB9XG5cbiAgLyoqXG4gICAqIEF0dGVtcHQgdG8gcmVzb2x2ZSBgdXJsYCBpbiB0aGUgY29udGV4dCBvZiBgZnJvbUZpbGVgLCB3aGlsZSByZXNwZWN0aW5nIHRoZSByb290RGlyc1xuICAgKiBvcHRpb24gZnJvbSB0aGUgdHNjb25maWcuIEZpcnN0LCBub3JtYWxpemUgdGhlIGZpbGUgbmFtZS5cbiAgICovXG4gIHByaXZhdGUgZmFsbGJhY2tSZXNvbHZlKHVybDogc3RyaW5nLCBmcm9tRmlsZTogc3RyaW5nKTogc3RyaW5nfG51bGwge1xuICAgIGxldCBjYW5kaWRhdGVMb2NhdGlvbnM6IHN0cmluZ1tdO1xuICAgIGlmICh1cmwuc3RhcnRzV2l0aCgnLycpKSB7XG4gICAgICAvLyBUaGlzIHBhdGggaXMgbm90IHJlYWxseSBhbiBhYnNvbHV0ZSBwYXRoLCBidXQgaW5zdGVhZCB0aGUgbGVhZGluZyAnLycgbWVhbnMgdGhhdCBpdCdzXG4gICAgICAvLyByb290ZWQgaW4gdGhlIHByb2plY3Qgcm9vdERpcnMuIFNvIGxvb2sgZm9yIGl0IGFjY29yZGluZyB0byB0aGUgcm9vdERpcnMuXG4gICAgICBjYW5kaWRhdGVMb2NhdGlvbnMgPSB0aGlzLmdldFJvb3RlZENhbmRpZGF0ZUxvY2F0aW9ucyh1cmwpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBUaGlzIHBhdGggaXMgYSBcInJlbGF0aXZlXCIgcGF0aCBhbmQgY2FuIGJlIHJlc29sdmVkIGFzIHN1Y2guIFRvIG1ha2UgdGhpcyBlYXNpZXIgb24gdGhlXG4gICAgICAvLyBkb3duc3RyZWFtIHJlc29sdmVyLCB0aGUgJy4vJyBwcmVmaXggaXMgYWRkZWQgaWYgbWlzc2luZyB0byBkaXN0aW5ndWlzaCB0aGVzZSBwYXRocyBmcm9tXG4gICAgICAvLyBhYnNvbHV0ZSBub2RlX21vZHVsZXMgcGF0aHMuXG4gICAgICBpZiAoIXVybC5zdGFydHNXaXRoKCcuJykpIHtcbiAgICAgICAgdXJsID0gYC4vJHt1cmx9YDtcbiAgICAgIH1cbiAgICAgIGNhbmRpZGF0ZUxvY2F0aW9ucyA9IHRoaXMuZ2V0UmVzb2x2ZWRDYW5kaWRhdGVMb2NhdGlvbnModXJsLCBmcm9tRmlsZSk7XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBjYW5kaWRhdGUgb2YgY2FuZGlkYXRlTG9jYXRpb25zKSB7XG4gICAgICBpZiAodGhpcy5hZGFwdGVyLmZpbGVFeGlzdHMoY2FuZGlkYXRlKSkge1xuICAgICAgICByZXR1cm4gY2FuZGlkYXRlO1xuICAgICAgfSBlbHNlIGlmIChDU1NfUFJFUFJPQ0VTU09SX0VYVC50ZXN0KGNhbmRpZGF0ZSkpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIElmIHRoZSB1c2VyIHNwZWNpZmllZCBzdHlsZVVybCBwb2ludHMgdG8gKi5zY3NzLCBidXQgdGhlIFNhc3MgY29tcGlsZXIgd2FzIHJ1biBiZWZvcmVcbiAgICAgICAgICogQW5ndWxhciwgdGhlbiB0aGUgcmVzb3VyY2UgbWF5IGhhdmUgYmVlbiBnZW5lcmF0ZWQgYXMgKi5jc3MuIFNpbXBseSB0cnkgdGhlIHJlc29sdXRpb25cbiAgICAgICAgICogYWdhaW4uXG4gICAgICAgICAqL1xuICAgICAgICBjb25zdCBjc3NGYWxsYmFja1VybCA9IGNhbmRpZGF0ZS5yZXBsYWNlKENTU19QUkVQUk9DRVNTT1JfRVhULCAnLmNzcycpO1xuICAgICAgICBpZiAodGhpcy5hZGFwdGVyLmZpbGVFeGlzdHMoY3NzRmFsbGJhY2tVcmwpKSB7XG4gICAgICAgICAgcmV0dXJuIGNzc0ZhbGxiYWNrVXJsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRSb290ZWRDYW5kaWRhdGVMb2NhdGlvbnModXJsOiBzdHJpbmcpOiBBYnNvbHV0ZUZzUGF0aFtdIHtcbiAgICAvLyBUaGUgcGF0aCBhbHJlYWR5IHN0YXJ0cyB3aXRoICcvJywgc28gYWRkIGEgJy4nIHRvIG1ha2UgaXQgcmVsYXRpdmUuXG4gICAgY29uc3Qgc2VnbWVudDogUGF0aFNlZ21lbnQgPSAoJy4nICsgdXJsKSBhcyBQYXRoU2VnbWVudDtcbiAgICByZXR1cm4gdGhpcy5hZGFwdGVyLnJvb3REaXJzLm1hcChyb290RGlyID0+IGpvaW4ocm9vdERpciwgc2VnbWVudCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFR5cGVTY3JpcHQgcHJvdmlkZXMgdXRpbGl0aWVzIHRvIHJlc29sdmUgbW9kdWxlIG5hbWVzLCBidXQgbm90IHJlc291cmNlIGZpbGVzICh3aGljaCBhcmVuJ3RcbiAgICogYSBwYXJ0IG9mIHRoZSB0cy5Qcm9ncmFtKS4gSG93ZXZlciwgVHlwZVNjcmlwdCdzIG1vZHVsZSByZXNvbHV0aW9uIGNhbiBiZSB1c2VkIGNyZWF0aXZlbHlcbiAgICogdG8gbG9jYXRlIHdoZXJlIHJlc291cmNlIGZpbGVzIHNob3VsZCBiZSBleHBlY3RlZCB0byBleGlzdC4gU2luY2UgbW9kdWxlIHJlc29sdXRpb24gcmV0dXJuc1xuICAgKiBhIGxpc3Qgb2YgZmlsZSBuYW1lcyB0aGF0IHdlcmUgY29uc2lkZXJlZCwgdGhlIGxvYWRlciBjYW4gZW51bWVyYXRlIHRoZSBwb3NzaWJsZSBsb2NhdGlvbnNcbiAgICogZm9yIHRoZSBmaWxlIGJ5IHNldHRpbmcgdXAgYSBtb2R1bGUgcmVzb2x1dGlvbiBmb3IgaXQgdGhhdCB3aWxsIGZhaWwuXG4gICAqL1xuICBwcml2YXRlIGdldFJlc29sdmVkQ2FuZGlkYXRlTG9jYXRpb25zKHVybDogc3RyaW5nLCBmcm9tRmlsZTogc3RyaW5nKTogc3RyaW5nW10ge1xuICAgIC8vIGBmYWlsZWRMb29rdXBMb2NhdGlvbnNgIGlzIGluIHRoZSBuYW1lIG9mIHRoZSB0eXBlIHRzLlJlc29sdmVkTW9kdWxlV2l0aEZhaWxlZExvb2t1cExvY2F0aW9uc1xuICAgIC8vIGJ1dCBpcyBtYXJrZWQgQGludGVybmFsIGluIFR5cGVTY3JpcHQuIFNlZVxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9NaWNyb3NvZnQvVHlwZVNjcmlwdC9pc3N1ZXMvMjg3NzAuXG4gICAgdHlwZSBSZXNvbHZlZE1vZHVsZVdpdGhGYWlsZWRMb29rdXBMb2NhdGlvbnMgPVxuICAgICAgICB0cy5SZXNvbHZlZE1vZHVsZVdpdGhGYWlsZWRMb29rdXBMb2NhdGlvbnMme2ZhaWxlZExvb2t1cExvY2F0aW9uczogUmVhZG9ubHlBcnJheTxzdHJpbmc+fTtcblxuICAgIC8vIGNsYW5nLWZvcm1hdCBvZmZcbiAgICBjb25zdCBmYWlsZWRMb29rdXAgPSB0cy5yZXNvbHZlTW9kdWxlTmFtZSh1cmwgKyBSRVNPVVJDRV9NQVJLRVIsIGZyb21GaWxlLCB0aGlzLm9wdGlvbnMsIHRoaXMubG9va3VwUmVzb2x1dGlvbkhvc3QpIGFzIFJlc29sdmVkTW9kdWxlV2l0aEZhaWxlZExvb2t1cExvY2F0aW9ucztcbiAgICAvLyBjbGFuZy1mb3JtYXQgb25cbiAgICBpZiAoZmFpbGVkTG9va3VwLmZhaWxlZExvb2t1cExvY2F0aW9ucyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYEludGVybmFsIGVycm9yOiBleHBlY3RlZCB0byBmaW5kIGZhaWxlZExvb2t1cExvY2F0aW9ucyBkdXJpbmcgcmVzb2x1dGlvbiBvZiByZXNvdXJjZSAnJHtcbiAgICAgICAgICAgICAgdXJsfScgaW4gY29udGV4dCBvZiAke2Zyb21GaWxlfWApO1xuICAgIH1cblxuICAgIHJldHVybiBmYWlsZWRMb29rdXAuZmFpbGVkTG9va3VwTG9jYXRpb25zXG4gICAgICAgIC5maWx0ZXIoY2FuZGlkYXRlID0+IGNhbmRpZGF0ZS5lbmRzV2l0aChSRVNPVVJDRV9NQVJLRVJfVFMpKVxuICAgICAgICAubWFwKGNhbmRpZGF0ZSA9PiBjYW5kaWRhdGUuc2xpY2UoMCwgLVJFU09VUkNFX01BUktFUl9UUy5sZW5ndGgpKTtcbiAgfVxufVxuXG4vKipcbiAqIERlcml2ZXMgYSBgdHMuTW9kdWxlUmVzb2x1dGlvbkhvc3RgIGZyb20gYSBjb21waWxlciBhZGFwdGVyIHRoYXQgcmVjb2duaXplcyB0aGUgc3BlY2lhbCByZXNvdXJjZVxuICogbWFya2VyIGFuZCBkb2VzIG5vdCBnbyB0byB0aGUgZmlsZXN5c3RlbSBmb3IgdGhlc2UgcmVxdWVzdHMsIGFzIHRoZXkgYXJlIGtub3duIG5vdCB0byBleGlzdC5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlTG9va3VwUmVzb2x1dGlvbkhvc3QoYWRhcHRlcjogTmdDb21waWxlckFkYXB0ZXIpOlxuICAgIFJlcXVpcmVkRGVsZWdhdGlvbnM8dHMuTW9kdWxlUmVzb2x1dGlvbkhvc3Q+IHtcbiAgcmV0dXJuIHtcbiAgICBkaXJlY3RvcnlFeGlzdHMoZGlyZWN0b3J5TmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICBpZiAoZGlyZWN0b3J5TmFtZS5pbmNsdWRlcyhSRVNPVVJDRV9NQVJLRVIpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0gZWxzZSBpZiAoYWRhcHRlci5kaXJlY3RvcnlFeGlzdHMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gYWRhcHRlci5kaXJlY3RvcnlFeGlzdHMoZGlyZWN0b3J5TmFtZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBUeXBlU2NyaXB0J3MgbW9kdWxlIHJlc29sdXRpb24gbG9naWMgYXNzdW1lcyB0aGF0IHRoZSBkaXJlY3RvcnkgZXhpc3RzIHdoZW4gbm8gaG9zdFxuICAgICAgICAvLyBpbXBsZW1lbnRhdGlvbiBpcyBhdmFpbGFibGUuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH0sXG4gICAgZmlsZUV4aXN0cyhmaWxlTmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICBpZiAoZmlsZU5hbWUuaW5jbHVkZXMoUkVTT1VSQ0VfTUFSS0VSKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gYWRhcHRlci5maWxlRXhpc3RzKGZpbGVOYW1lKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHJlYWRGaWxlOiBhZGFwdGVyLnJlYWRGaWxlLmJpbmQoYWRhcHRlciksXG4gICAgZ2V0Q3VycmVudERpcmVjdG9yeTogYWRhcHRlci5nZXRDdXJyZW50RGlyZWN0b3J5LmJpbmQoYWRhcHRlciksXG4gICAgZ2V0RGlyZWN0b3JpZXM6IGFkYXB0ZXIuZ2V0RGlyZWN0b3JpZXM/LmJpbmQoYWRhcHRlciksXG4gICAgcmVhbHBhdGg6IGFkYXB0ZXIucmVhbHBhdGg/LmJpbmQoYWRhcHRlciksXG4gICAgdHJhY2U6IGFkYXB0ZXIudHJhY2U/LmJpbmQoYWRhcHRlciksXG4gIH07XG59XG4iXX0=