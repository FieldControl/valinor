(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/dependencies/module_resolver", ["require", "exports", "tslib", "@angular/compiler-cli/ngcc/src/utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ResolvedDeepImport = exports.ResolvedRelativeModule = exports.ResolvedExternalModule = exports.ModuleResolver = void 0;
    var tslib_1 = require("tslib");
    var utils_1 = require("@angular/compiler-cli/ngcc/src/utils");
    /**
     * This is a very cut-down implementation of the TypeScript module resolution strategy.
     *
     * It is specific to the needs of ngcc and is not intended to be a drop-in replacement
     * for the TS module resolver. It is used to compute the dependencies between entry-points
     * that may be compiled by ngcc.
     *
     * The algorithm only finds `.js` files for internal/relative imports and paths to
     * the folder containing the `package.json` of the entry-point for external imports.
     *
     * It can cope with nested `node_modules` folders and also supports `paths`/`baseUrl`
     * configuration properties, as provided in a `ts.CompilerOptions` object.
     */
    var ModuleResolver = /** @class */ (function () {
        function ModuleResolver(fs, pathMappings, relativeExtensions) {
            if (relativeExtensions === void 0) { relativeExtensions = ['', '.js', '/index.js']; }
            this.fs = fs;
            this.relativeExtensions = relativeExtensions;
            this.pathMappings = pathMappings ? this.processPathMappings(pathMappings) : [];
        }
        /**
         * Resolve an absolute path for the `moduleName` imported into a file at `fromPath`.
         * @param moduleName The name of the import to resolve.
         * @param fromPath The path to the file containing the import.
         * @returns A path to the resolved module or null if missing.
         * Specifically:
         *  * the absolute path to the package.json of an external module
         *  * a JavaScript file of an internal module
         *  * null if none exists.
         */
        ModuleResolver.prototype.resolveModuleImport = function (moduleName, fromPath) {
            if (utils_1.isRelativePath(moduleName)) {
                return this.resolveAsRelativePath(moduleName, fromPath);
            }
            else {
                return this.pathMappings.length && this.resolveByPathMappings(moduleName, fromPath) ||
                    this.resolveAsEntryPoint(moduleName, fromPath);
            }
        };
        /**
         * Convert the `pathMappings` into a collection of `PathMapper` functions.
         */
        ModuleResolver.prototype.processPathMappings = function (pathMappings) {
            var baseUrl = this.fs.resolve(pathMappings.baseUrl);
            return Object.keys(pathMappings.paths).map(function (pathPattern) {
                var matcher = splitOnStar(pathPattern);
                var templates = pathMappings.paths[pathPattern].map(splitOnStar);
                return { matcher: matcher, templates: templates, baseUrl: baseUrl };
            });
        };
        /**
         * Try to resolve a module name, as a relative path, from the `fromPath`.
         *
         * As it is relative, it only looks for files that end in one of the `relativeExtensions`.
         * For example: `${moduleName}.js` or `${moduleName}/index.js`.
         * If neither of these files exist then the method returns `null`.
         */
        ModuleResolver.prototype.resolveAsRelativePath = function (moduleName, fromPath) {
            var resolvedPath = utils_1.resolveFileWithPostfixes(this.fs, this.fs.resolve(this.fs.dirname(fromPath), moduleName), this.relativeExtensions);
            return resolvedPath && new ResolvedRelativeModule(resolvedPath);
        };
        /**
         * Try to resolve the `moduleName`, by applying the computed `pathMappings` and
         * then trying to resolve the mapped path as a relative or external import.
         *
         * Whether the mapped path is relative is defined as it being "below the `fromPath`" and not
         * containing `node_modules`.
         *
         * If the mapped path is not relative but does not resolve to an external entry-point, then we
         * check whether it would have resolved to a relative path, in which case it is marked as a
         * "deep-import".
         */
        ModuleResolver.prototype.resolveByPathMappings = function (moduleName, fromPath) {
            var e_1, _a;
            var mappedPaths = this.findMappedPaths(moduleName);
            if (mappedPaths.length > 0) {
                var packagePath = this.findPackagePath(fromPath);
                if (packagePath !== null) {
                    try {
                        for (var mappedPaths_1 = tslib_1.__values(mappedPaths), mappedPaths_1_1 = mappedPaths_1.next(); !mappedPaths_1_1.done; mappedPaths_1_1 = mappedPaths_1.next()) {
                            var mappedPath = mappedPaths_1_1.value;
                            if (this.isEntryPoint(mappedPath)) {
                                return new ResolvedExternalModule(mappedPath);
                            }
                            var nonEntryPointImport = this.resolveAsRelativePath(mappedPath, fromPath);
                            if (nonEntryPointImport !== null) {
                                return isRelativeImport(packagePath, mappedPath) ? nonEntryPointImport :
                                    new ResolvedDeepImport(mappedPath);
                            }
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (mappedPaths_1_1 && !mappedPaths_1_1.done && (_a = mappedPaths_1.return)) _a.call(mappedPaths_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                }
            }
            return null;
        };
        /**
         * Try to resolve the `moduleName` as an external entry-point by searching the `node_modules`
         * folders up the tree for a matching `.../node_modules/${moduleName}`.
         *
         * If a folder is found but the path does not contain a `package.json` then it is marked as a
         * "deep-import".
         */
        ModuleResolver.prototype.resolveAsEntryPoint = function (moduleName, fromPath) {
            var folder = fromPath;
            while (!this.fs.isRoot(folder)) {
                folder = this.fs.dirname(folder);
                if (folder.endsWith('node_modules')) {
                    // Skip up if the folder already ends in node_modules
                    folder = this.fs.dirname(folder);
                }
                var modulePath = this.fs.resolve(folder, 'node_modules', moduleName);
                if (this.isEntryPoint(modulePath)) {
                    return new ResolvedExternalModule(modulePath);
                }
                else if (this.resolveAsRelativePath(modulePath, fromPath)) {
                    return new ResolvedDeepImport(modulePath);
                }
            }
            return null;
        };
        /**
         * Can we consider the given path as an entry-point to a package?
         *
         * This is achieved by checking for the existence of `${modulePath}/package.json`.
         */
        ModuleResolver.prototype.isEntryPoint = function (modulePath) {
            return this.fs.exists(this.fs.join(modulePath, 'package.json'));
        };
        /**
         * Apply the `pathMappers` to the `moduleName` and return all the possible
         * paths that match.
         *
         * The mapped path is computed for each template in `mapping.templates` by
         * replacing the `matcher.prefix` and `matcher.postfix` strings in `path with the
         * `template.prefix` and `template.postfix` strings.
         */
        ModuleResolver.prototype.findMappedPaths = function (moduleName) {
            var _this = this;
            var matches = this.pathMappings.map(function (mapping) { return _this.matchMapping(moduleName, mapping); });
            var bestMapping;
            var bestMatch;
            for (var index = 0; index < this.pathMappings.length; index++) {
                var mapping = this.pathMappings[index];
                var match = matches[index];
                if (match !== null) {
                    // If this mapping had no wildcard then this must be a complete match.
                    if (!mapping.matcher.hasWildcard) {
                        bestMatch = match;
                        bestMapping = mapping;
                        break;
                    }
                    // The best matched mapping is the one with the longest prefix.
                    if (!bestMapping || mapping.matcher.prefix > bestMapping.matcher.prefix) {
                        bestMatch = match;
                        bestMapping = mapping;
                    }
                }
            }
            return (bestMapping !== undefined && bestMatch !== undefined) ?
                this.computeMappedTemplates(bestMapping, bestMatch) :
                [];
        };
        /**
         * Attempt to find a mapped path for the given `path` and a `mapping`.
         *
         * The `path` matches the `mapping` if if it starts with `matcher.prefix` and ends with
         * `matcher.postfix`.
         *
         * @returns the wildcard segment of a matched `path`, or `null` if no match.
         */
        ModuleResolver.prototype.matchMapping = function (path, mapping) {
            var _a = mapping.matcher, prefix = _a.prefix, postfix = _a.postfix, hasWildcard = _a.hasWildcard;
            if (hasWildcard) {
                return (path.startsWith(prefix) && path.endsWith(postfix)) ?
                    path.substring(prefix.length, path.length - postfix.length) :
                    null;
            }
            else {
                return (path === prefix) ? '' : null;
            }
        };
        /**
         * Compute the candidate paths from the given mapping's templates using the matched
         * string.
         */
        ModuleResolver.prototype.computeMappedTemplates = function (mapping, match) {
            var _this = this;
            return mapping.templates.map(function (template) { return _this.fs.resolve(mapping.baseUrl, template.prefix + match + template.postfix); });
        };
        /**
         * Search up the folder tree for the first folder that contains `package.json`
         * or `null` if none is found.
         */
        ModuleResolver.prototype.findPackagePath = function (path) {
            var folder = path;
            while (!this.fs.isRoot(folder)) {
                folder = this.fs.dirname(folder);
                if (this.fs.exists(this.fs.join(folder, 'package.json'))) {
                    return folder;
                }
            }
            return null;
        };
        return ModuleResolver;
    }());
    exports.ModuleResolver = ModuleResolver;
    /**
     * A module that is external to the package doing the importing.
     * In this case we capture the folder containing the entry-point.
     */
    var ResolvedExternalModule = /** @class */ (function () {
        function ResolvedExternalModule(entryPointPath) {
            this.entryPointPath = entryPointPath;
        }
        return ResolvedExternalModule;
    }());
    exports.ResolvedExternalModule = ResolvedExternalModule;
    /**
     * A module that is relative to the module doing the importing, and so internal to the
     * source module's package.
     */
    var ResolvedRelativeModule = /** @class */ (function () {
        function ResolvedRelativeModule(modulePath) {
            this.modulePath = modulePath;
        }
        return ResolvedRelativeModule;
    }());
    exports.ResolvedRelativeModule = ResolvedRelativeModule;
    /**
     * A module that is external to the package doing the importing but pointing to a
     * module that is deep inside a package, rather than to an entry-point of the package.
     */
    var ResolvedDeepImport = /** @class */ (function () {
        function ResolvedDeepImport(importPath) {
            this.importPath = importPath;
        }
        return ResolvedDeepImport;
    }());
    exports.ResolvedDeepImport = ResolvedDeepImport;
    function splitOnStar(str) {
        var _a = tslib_1.__read(str.split('*', 2), 2), prefix = _a[0], postfix = _a[1];
        return { prefix: prefix, postfix: postfix || '', hasWildcard: postfix !== undefined };
    }
    function isRelativeImport(from, to) {
        return to.startsWith(from) && !to.includes('node_modules');
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kdWxlX3Jlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL25nY2Mvc3JjL2RlcGVuZGVuY2llcy9tb2R1bGVfcmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztJQVNBLDhEQUFrRTtJQUVsRTs7Ozs7Ozs7Ozs7O09BWUc7SUFDSDtRQUdFLHdCQUNZLEVBQXNCLEVBQUUsWUFBMkIsRUFDbEQsa0JBQTZDO1lBQTdDLG1DQUFBLEVBQUEsc0JBQXNCLEVBQUUsRUFBRSxLQUFLLEVBQUUsV0FBVyxDQUFDO1lBRDlDLE9BQUUsR0FBRixFQUFFLENBQW9CO1lBQ3JCLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBMkI7WUFDeEQsSUFBSSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ2pGLENBQUM7UUFFRDs7Ozs7Ozs7O1dBU0c7UUFDSCw0Q0FBbUIsR0FBbkIsVUFBb0IsVUFBa0IsRUFBRSxRQUF3QjtZQUM5RCxJQUFJLHNCQUFjLENBQUMsVUFBVSxDQUFDLEVBQUU7Z0JBQzlCLE9BQU8sSUFBSSxDQUFDLHFCQUFxQixDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQzthQUN6RDtpQkFBTTtnQkFDTCxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDO29CQUMvRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFDO2FBQ3BEO1FBQ0gsQ0FBQztRQUVEOztXQUVHO1FBQ0ssNENBQW1CLEdBQTNCLFVBQTRCLFlBQTBCO1lBQ3BELElBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxFQUFFLENB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QUFWLFVBQVUsQ0FBZ0I7UUFBRyxDQUFDO1FBQ25ELHlCQUFDO0lBQUQsQ0FBQyxBQUZELElBRUM7SUFGWSxnREFBa0I7SUFJL0IsU0FBUyxXQUFXLENBQUMsR0FBVztRQUN4QixJQUFBLEtBQUEsZUFBb0IsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLElBQUEsRUFBcEMsTUFBTSxRQUFBLEVBQUUsT0FBTyxRQUFxQixDQUFDO1FBQzVDLE9BQU8sRUFBQyxNQUFNLFFBQUEsRUFBRSxPQUFPLEVBQUUsT0FBTyxJQUFJLEVBQUUsRUFBRSxXQUFXLEVBQUUsT0FBTyxLQUFLLFNBQVMsRUFBQyxDQUFDO0lBQzlFLENBQUM7SUFjRCxTQUFTLGdCQUFnQixDQUFDLElBQW9CLEVBQUUsRUFBa0I7UUFDaEUsT0FBTyxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUM3RCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0Fic29sdXRlRnNQYXRoLCBSZWFkb25seUZpbGVTeXN0ZW19IGZyb20gJy4uLy4uLy4uL3NyYy9uZ3RzYy9maWxlX3N5c3RlbSc7XG5pbXBvcnQge1BhdGhNYXBwaW5nc30gZnJvbSAnLi4vcGF0aF9tYXBwaW5ncyc7XG5pbXBvcnQge2lzUmVsYXRpdmVQYXRoLCByZXNvbHZlRmlsZVdpdGhQb3N0Zml4ZXN9IGZyb20gJy4uL3V0aWxzJztcblxuLyoqXG4gKiBUaGlzIGlzIGEgdmVyeSBjdXQtZG93biBpbXBsZW1lbnRhdGlvbiBvZiB0aGUgVHlwZVNjcmlwdCBtb2R1bGUgcmVzb2x1dGlvbiBzdHJhdGVneS5cbiAqXG4gKiBJdCBpcyBzcGVjaWZpYyB0byB0aGUgbmVlZHMgb2YgbmdjYyBhbmQgaXMgbm90IGludGVuZGVkIHRvIGJlIGEgZHJvcC1pbiByZXBsYWNlbWVudFxuICogZm9yIHRoZSBUUyBtb2R1bGUgcmVzb2x2ZXIuIEl0IGlzIHVzZWQgdG8gY29tcHV0ZSB0aGUgZGVwZW5kZW5jaWVzIGJldHdlZW4gZW50cnktcG9pbnRzXG4gKiB0aGF0IG1heSBiZSBjb21waWxlZCBieSBuZ2NjLlxuICpcbiAqIFRoZSBhbGdvcml0aG0gb25seSBmaW5kcyBgLmpzYCBmaWxlcyBmb3IgaW50ZXJuYWwvcmVsYXRpdmUgaW1wb3J0cyBhbmQgcGF0aHMgdG9cbiAqIHRoZSBmb2xkZXIgY29udGFpbmluZyB0aGUgYHBhY2thZ2UuanNvbmAgb2YgdGhlIGVudHJ5LXBvaW50IGZvciBleHRlcm5hbCBpbXBvcnRzLlxuICpcbiAqIEl0IGNhbiBjb3BlIHdpdGggbmVzdGVkIGBub2RlX21vZHVsZXNgIGZvbGRlcnMgYW5kIGFsc28gc3VwcG9ydHMgYHBhdGhzYC9gYmFzZVVybGBcbiAqIGNvbmZpZ3VyYXRpb24gcHJvcGVydGllcywgYXMgcHJvdmlkZWQgaW4gYSBgdHMuQ29tcGlsZXJPcHRpb25zYCBvYmplY3QuXG4gKi9cbmV4cG9ydCBjbGFzcyBNb2R1bGVSZXNvbHZlciB7XG4gIHByaXZhdGUgcGF0aE1hcHBpbmdzOiBQcm9jZXNzZWRQYXRoTWFwcGluZ1tdO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBmczogUmVhZG9ubHlGaWxlU3lzdGVtLCBwYXRoTWFwcGluZ3M/OiBQYXRoTWFwcGluZ3MsXG4gICAgICByZWFkb25seSByZWxhdGl2ZUV4dGVuc2lvbnMgPSBbJycsICcuanMnLCAnL2luZGV4LmpzJ10pIHtcbiAgICB0aGlzLnBhdGhNYXBwaW5ncyA9IHBhdGhNYXBwaW5ncyA/IHRoaXMucHJvY2Vzc1BhdGhNYXBwaW5ncyhwYXRoTWFwcGluZ3MpIDogW107XG4gIH1cblxuICAvKipcbiAgICogUmVzb2x2ZSBhbiBhYnNvbHV0ZSBwYXRoIGZvciB0aGUgYG1vZHVsZU5hbWVgIGltcG9ydGVkIGludG8gYSBmaWxlIGF0IGBmcm9tUGF0aGAuXG4gICAqIEBwYXJhbSBtb2R1bGVOYW1lIFRoZSBuYW1lIG9mIHRoZSBpbXBvcnQgdG8gcmVzb2x2ZS5cbiAgICogQHBhcmFtIGZyb21QYXRoIFRoZSBwYXRoIHRvIHRoZSBmaWxlIGNvbnRhaW5pbmcgdGhlIGltcG9ydC5cbiAgICogQHJldHVybnMgQSBwYXRoIHRvIHRoZSByZXNvbHZlZCBtb2R1bGUgb3IgbnVsbCBpZiBtaXNzaW5nLlxuICAgKiBTcGVjaWZpY2FsbHk6XG4gICAqICAqIHRoZSBhYnNvbHV0ZSBwYXRoIHRvIHRoZSBwYWNrYWdlLmpzb24gb2YgYW4gZXh0ZXJuYWwgbW9kdWxlXG4gICAqICAqIGEgSmF2YVNjcmlwdCBmaWxlIG9mIGFuIGludGVybmFsIG1vZHVsZVxuICAgKiAgKiBudWxsIGlmIG5vbmUgZXhpc3RzLlxuICAgKi9cbiAgcmVzb2x2ZU1vZHVsZUltcG9ydChtb2R1bGVOYW1lOiBzdHJpbmcsIGZyb21QYXRoOiBBYnNvbHV0ZUZzUGF0aCk6IFJlc29sdmVkTW9kdWxlfG51bGwge1xuICAgIGlmIChpc1JlbGF0aXZlUGF0aChtb2R1bGVOYW1lKSkge1xuICAgICAgcmV0dXJuIHRoaXMucmVzb2x2ZUFzUmVsYXRpdmVQYXRoKG1vZHVsZU5hbWUsIGZyb21QYXRoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMucGF0aE1hcHBpbmdzLmxlbmd0aCAmJiB0aGlzLnJlc29sdmVCeVBhdGhNYXBwaW5ncyhtb2R1bGVOYW1lLCBmcm9tUGF0aCkgfHxcbiAgICAgICAgICB0aGlzLnJlc29sdmVBc0VudHJ5UG9pbnQobW9kdWxlTmFtZSwgZnJvbVBhdGgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0IHRoZSBgcGF0aE1hcHBpbmdzYCBpbnRvIGEgY29sbGVjdGlvbiBvZiBgUGF0aE1hcHBlcmAgZnVuY3Rpb25zLlxuICAgKi9cbiAgcHJpdmF0ZSBwcm9jZXNzUGF0aE1hcHBpbmdzKHBhdGhNYXBwaW5nczogUGF0aE1hcHBpbmdzKTogUHJvY2Vzc2VkUGF0aE1hcHBpbmdbXSB7XG4gICAgY29uc3QgYmFzZVVybCA9IHRoaXMuZnMucmVzb2x2ZShwYXRoTWFwcGluZ3MuYmFzZVVybCk7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHBhdGhNYXBwaW5ncy5wYXRocykubWFwKHBhdGhQYXR0ZXJuID0+IHtcbiAgICAgIGNvbnN0IG1hdGNoZXIgPSBzcGxpdE9uU3RhcihwYXRoUGF0dGVybik7XG4gICAgICBjb25zdCB0ZW1wbGF0ZXMgPSBwYXRoTWFwcGluZ3MucGF0aHNbcGF0aFBhdHRlcm5dLm1hcChzcGxpdE9uU3Rhcik7XG4gICAgICByZXR1cm4ge21hdGNoZXIsIHRlbXBsYXRlcywgYmFzZVVybH07XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogVHJ5IHRvIHJlc29sdmUgYSBtb2R1bGUgbmFtZSwgYXMgYSByZWxhdGl2ZSBwYXRoLCBmcm9tIHRoZSBgZnJvbVBhdGhgLlxuICAgKlxuICAgKiBBcyBpdCBpcyByZWxhdGl2ZSwgaXQgb25seSBsb29rcyBmb3IgZmlsZXMgdGhhdCBlbmQgaW4gb25lIG9mIHRoZSBgcmVsYXRpdmVFeHRlbnNpb25zYC5cbiAgICogRm9yIGV4YW1wbGU6IGAke21vZHVsZU5hbWV9LmpzYCBvciBgJHttb2R1bGVOYW1lfS9pbmRleC5qc2AuXG4gICAqIElmIG5laXRoZXIgb2YgdGhlc2UgZmlsZXMgZXhpc3QgdGhlbiB0aGUgbWV0aG9kIHJldHVybnMgYG51bGxgLlxuICAgKi9cbiAgcHJpdmF0ZSByZXNvbHZlQXNSZWxhdGl2ZVBhdGgobW9kdWxlTmFtZTogc3RyaW5nLCBmcm9tUGF0aDogQWJzb2x1dGVGc1BhdGgpOiBSZXNvbHZlZE1vZHVsZXxudWxsIHtcbiAgICBjb25zdCByZXNvbHZlZFBhdGggPSByZXNvbHZlRmlsZVdpdGhQb3N0Zml4ZXMoXG4gICAgICAgIHRoaXMuZnMsIHRoaXMuZnMucmVzb2x2ZSh0aGlzLmZzLmRpcm5hbWUoZnJvbVBhdGgpLCBtb2R1bGVOYW1lKSwgdGhpcy5yZWxhdGl2ZUV4dGVuc2lvbnMpO1xuICAgIHJldHVybiByZXNvbHZlZFBhdGggJiYgbmV3IFJlc29sdmVkUmVsYXRpdmVNb2R1bGUocmVzb2x2ZWRQYXRoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUcnkgdG8gcmVzb2x2ZSB0aGUgYG1vZHVsZU5hbWVgLCBieSBhcHBseWluZyB0aGUgY29tcHV0ZWQgYHBhdGhNYXBwaW5nc2AgYW5kXG4gICAqIHRoZW4gdHJ5aW5nIHRvIHJlc29sdmUgdGhlIG1hcHBlZCBwYXRoIGFzIGEgcmVsYXRpdmUgb3IgZXh0ZXJuYWwgaW1wb3J0LlxuICAgKlxuICAgKiBXaGV0aGVyIHRoZSBtYXBwZWQgcGF0aCBpcyByZWxhdGl2ZSBpcyBkZWZpbmVkIGFzIGl0IGJlaW5nIFwiYmVsb3cgdGhlIGBmcm9tUGF0aGBcIiBhbmQgbm90XG4gICAqIGNvbnRhaW5pbmcgYG5vZGVfbW9kdWxlc2AuXG4gICAqXG4gICAqIElmIHRoZSBtYXBwZWQgcGF0aCBpcyBub3QgcmVsYXRpdmUgYnV0IGRvZXMgbm90IHJlc29sdmUgdG8gYW4gZXh0ZXJuYWwgZW50cnktcG9pbnQsIHRoZW4gd2VcbiAgICogY2hlY2sgd2hldGhlciBpdCB3b3VsZCBoYXZlIHJlc29sdmVkIHRvIGEgcmVsYXRpdmUgcGF0aCwgaW4gd2hpY2ggY2FzZSBpdCBpcyBtYXJrZWQgYXMgYVxuICAgKiBcImRlZXAtaW1wb3J0XCIuXG4gICAqL1xuICBwcml2YXRlIHJlc29sdmVCeVBhdGhNYXBwaW5ncyhtb2R1bGVOYW1lOiBzdHJpbmcsIGZyb21QYXRoOiBBYnNvbHV0ZUZzUGF0aCk6IFJlc29sdmVkTW9kdWxlfG51bGwge1xuICAgIGNvbnN0IG1hcHBlZFBhdGhzID0gdGhpcy5maW5kTWFwcGVkUGF0aHMobW9kdWxlTmFtZSk7XG4gICAgaWYgKG1hcHBlZFBhdGhzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IHBhY2thZ2VQYXRoID0gdGhpcy5maW5kUGFja2FnZVBhdGgoZnJvbVBhdGgpO1xuICAgICAgaWYgKHBhY2thZ2VQYXRoICE9PSBudWxsKSB7XG4gICAgICAgIGZvciAoY29uc3QgbWFwcGVkUGF0aCBvZiBtYXBwZWRQYXRocykge1xuICAgICAgICAgIGlmICh0aGlzLmlzRW50cnlQb2ludChtYXBwZWRQYXRoKSkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBSZXNvbHZlZEV4dGVybmFsTW9kdWxlKG1hcHBlZFBhdGgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBub25FbnRyeVBvaW50SW1wb3J0ID0gdGhpcy5yZXNvbHZlQXNSZWxhdGl2ZVBhdGgobWFwcGVkUGF0aCwgZnJvbVBhdGgpO1xuICAgICAgICAgIGlmIChub25FbnRyeVBvaW50SW1wb3J0ICE9PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gaXNSZWxhdGl2ZUltcG9ydChwYWNrYWdlUGF0aCwgbWFwcGVkUGF0aCkgPyBub25FbnRyeVBvaW50SW1wb3J0IDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBSZXNvbHZlZERlZXBJbXBvcnQobWFwcGVkUGF0aCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyeSB0byByZXNvbHZlIHRoZSBgbW9kdWxlTmFtZWAgYXMgYW4gZXh0ZXJuYWwgZW50cnktcG9pbnQgYnkgc2VhcmNoaW5nIHRoZSBgbm9kZV9tb2R1bGVzYFxuICAgKiBmb2xkZXJzIHVwIHRoZSB0cmVlIGZvciBhIG1hdGNoaW5nIGAuLi4vbm9kZV9tb2R1bGVzLyR7bW9kdWxlTmFtZX1gLlxuICAgKlxuICAgKiBJZiBhIGZvbGRlciBpcyBmb3VuZCBidXQgdGhlIHBhdGggZG9lcyBub3QgY29udGFpbiBhIGBwYWNrYWdlLmpzb25gIHRoZW4gaXQgaXMgbWFya2VkIGFzIGFcbiAgICogXCJkZWVwLWltcG9ydFwiLlxuICAgKi9cbiAgcHJpdmF0ZSByZXNvbHZlQXNFbnRyeVBvaW50KG1vZHVsZU5hbWU6IHN0cmluZywgZnJvbVBhdGg6IEFic29sdXRlRnNQYXRoKTogUmVzb2x2ZWRNb2R1bGV8bnVsbCB7XG4gICAgbGV0IGZvbGRlciA9IGZyb21QYXRoO1xuICAgIHdoaWxlICghdGhpcy5mcy5pc1Jvb3QoZm9sZGVyKSkge1xuICAgICAgZm9sZGVyID0gdGhpcy5mcy5kaXJuYW1lKGZvbGRlcik7XG4gICAgICBpZiAoZm9sZGVyLmVuZHNXaXRoKCdub2RlX21vZHVsZXMnKSkge1xuICAgICAgICAvLyBTa2lwIHVwIGlmIHRoZSBmb2xkZXIgYWxyZWFkeSBlbmRzIGluIG5vZGVfbW9kdWxlc1xuICAgICAgICBmb2xkZXIgPSB0aGlzLmZzLmRpcm5hbWUoZm9sZGVyKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IG1vZHVsZVBhdGggPSB0aGlzLmZzLnJlc29sdmUoZm9sZGVyLCAnbm9kZV9tb2R1bGVzJywgbW9kdWxlTmFtZSk7XG4gICAgICBpZiAodGhpcy5pc0VudHJ5UG9pbnQobW9kdWxlUGF0aCkpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBSZXNvbHZlZEV4dGVybmFsTW9kdWxlKG1vZHVsZVBhdGgpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLnJlc29sdmVBc1JlbGF0aXZlUGF0aChtb2R1bGVQYXRoLCBmcm9tUGF0aCkpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBSZXNvbHZlZERlZXBJbXBvcnQobW9kdWxlUGF0aCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cblxuICAvKipcbiAgICogQ2FuIHdlIGNvbnNpZGVyIHRoZSBnaXZlbiBwYXRoIGFzIGFuIGVudHJ5LXBvaW50IHRvIGEgcGFja2FnZT9cbiAgICpcbiAgICogVGhpcyBpcyBhY2hpZXZlZCBieSBjaGVja2luZyBmb3IgdGhlIGV4aXN0ZW5jZSBvZiBgJHttb2R1bGVQYXRofS9wYWNrYWdlLmpzb25gLlxuICAgKi9cbiAgcHJpdmF0ZSBpc0VudHJ5UG9pbnQobW9kdWxlUGF0aDogQWJzb2x1dGVGc1BhdGgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5mcy5leGlzdHModGhpcy5mcy5qb2luKG1vZHVsZVBhdGgsICdwYWNrYWdlLmpzb24nKSk7XG4gIH1cblxuICAvKipcbiAgICogQXBwbHkgdGhlIGBwYXRoTWFwcGVyc2AgdG8gdGhlIGBtb2R1bGVOYW1lYCBhbmQgcmV0dXJuIGFsbCB0aGUgcG9zc2libGVcbiAgICogcGF0aHMgdGhhdCBtYXRjaC5cbiAgICpcbiAgICogVGhlIG1hcHBlZCBwYXRoIGlzIGNvbXB1dGVkIGZvciBlYWNoIHRlbXBsYXRlIGluIGBtYXBwaW5nLnRlbXBsYXRlc2AgYnlcbiAgICogcmVwbGFjaW5nIHRoZSBgbWF0Y2hlci5wcmVmaXhgIGFuZCBgbWF0Y2hlci5wb3N0Zml4YCBzdHJpbmdzIGluIGBwYXRoIHdpdGggdGhlXG4gICAqIGB0ZW1wbGF0ZS5wcmVmaXhgIGFuZCBgdGVtcGxhdGUucG9zdGZpeGAgc3RyaW5ncy5cbiAgICovXG4gIHByaXZhdGUgZmluZE1hcHBlZFBhdGhzKG1vZHVsZU5hbWU6IHN0cmluZyk6IEFic29sdXRlRnNQYXRoW10ge1xuICAgIGNvbnN0IG1hdGNoZXMgPSB0aGlzLnBhdGhNYXBwaW5ncy5tYXAobWFwcGluZyA9PiB0aGlzLm1hdGNoTWFwcGluZyhtb2R1bGVOYW1lLCBtYXBwaW5nKSk7XG5cbiAgICBsZXQgYmVzdE1hcHBpbmc6IFByb2Nlc3NlZFBhdGhNYXBwaW5nfHVuZGVmaW5lZDtcbiAgICBsZXQgYmVzdE1hdGNoOiBzdHJpbmd8dW5kZWZpbmVkO1xuXG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHRoaXMucGF0aE1hcHBpbmdzLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgY29uc3QgbWFwcGluZyA9IHRoaXMucGF0aE1hcHBpbmdzW2luZGV4XTtcbiAgICAgIGNvbnN0IG1hdGNoID0gbWF0Y2hlc1tpbmRleF07XG4gICAgICBpZiAobWF0Y2ggIT09IG51bGwpIHtcbiAgICAgICAgLy8gSWYgdGhpcyBtYXBwaW5nIGhhZCBubyB3aWxkY2FyZCB0aGVuIHRoaXMgbXVzdCBiZSBhIGNvbXBsZXRlIG1hdGNoLlxuICAgICAgICBpZiAoIW1hcHBpbmcubWF0Y2hlci5oYXNXaWxkY2FyZCkge1xuICAgICAgICAgIGJlc3RNYXRjaCA9IG1hdGNoO1xuICAgICAgICAgIGJlc3RNYXBwaW5nID0gbWFwcGluZztcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICAvLyBUaGUgYmVzdCBtYXRjaGVkIG1hcHBpbmcgaXMgdGhlIG9uZSB3aXRoIHRoZSBsb25nZXN0IHByZWZpeC5cbiAgICAgICAgaWYgKCFiZXN0TWFwcGluZyB8fCBtYXBwaW5nLm1hdGNoZXIucHJlZml4ID4gYmVzdE1hcHBpbmcubWF0Y2hlci5wcmVmaXgpIHtcbiAgICAgICAgICBiZXN0TWF0Y2ggPSBtYXRjaDtcbiAgICAgICAgICBiZXN0TWFwcGluZyA9IG1hcHBpbmc7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gKGJlc3RNYXBwaW5nICE9PSB1bmRlZmluZWQgJiYgYmVzdE1hdGNoICE9PSB1bmRlZmluZWQpID9cbiAgICAgICAgdGhpcy5jb21wdXRlTWFwcGVkVGVtcGxhdGVzKGJlc3RNYXBwaW5nLCBiZXN0TWF0Y2gpIDpcbiAgICAgICAgW107XG4gIH1cblxuICAvKipcbiAgICogQXR0ZW1wdCB0byBmaW5kIGEgbWFwcGVkIHBhdGggZm9yIHRoZSBnaXZlbiBgcGF0aGAgYW5kIGEgYG1hcHBpbmdgLlxuICAgKlxuICAgKiBUaGUgYHBhdGhgIG1hdGNoZXMgdGhlIGBtYXBwaW5nYCBpZiBpZiBpdCBzdGFydHMgd2l0aCBgbWF0Y2hlci5wcmVmaXhgIGFuZCBlbmRzIHdpdGhcbiAgICogYG1hdGNoZXIucG9zdGZpeGAuXG4gICAqXG4gICAqIEByZXR1cm5zIHRoZSB3aWxkY2FyZCBzZWdtZW50IG9mIGEgbWF0Y2hlZCBgcGF0aGAsIG9yIGBudWxsYCBpZiBubyBtYXRjaC5cbiAgICovXG4gIHByaXZhdGUgbWF0Y2hNYXBwaW5nKHBhdGg6IHN0cmluZywgbWFwcGluZzogUHJvY2Vzc2VkUGF0aE1hcHBpbmcpOiBzdHJpbmd8bnVsbCB7XG4gICAgY29uc3Qge3ByZWZpeCwgcG9zdGZpeCwgaGFzV2lsZGNhcmR9ID0gbWFwcGluZy5tYXRjaGVyO1xuICAgIGlmIChoYXNXaWxkY2FyZCkge1xuICAgICAgcmV0dXJuIChwYXRoLnN0YXJ0c1dpdGgocHJlZml4KSAmJiBwYXRoLmVuZHNXaXRoKHBvc3RmaXgpKSA/XG4gICAgICAgICAgcGF0aC5zdWJzdHJpbmcocHJlZml4Lmxlbmd0aCwgcGF0aC5sZW5ndGggLSBwb3N0Zml4Lmxlbmd0aCkgOlxuICAgICAgICAgIG51bGw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAocGF0aCA9PT0gcHJlZml4KSA/ICcnIDogbnVsbDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ29tcHV0ZSB0aGUgY2FuZGlkYXRlIHBhdGhzIGZyb20gdGhlIGdpdmVuIG1hcHBpbmcncyB0ZW1wbGF0ZXMgdXNpbmcgdGhlIG1hdGNoZWRcbiAgICogc3RyaW5nLlxuICAgKi9cbiAgcHJpdmF0ZSBjb21wdXRlTWFwcGVkVGVtcGxhdGVzKG1hcHBpbmc6IFByb2Nlc3NlZFBhdGhNYXBwaW5nLCBtYXRjaDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIG1hcHBpbmcudGVtcGxhdGVzLm1hcChcbiAgICAgICAgdGVtcGxhdGUgPT4gdGhpcy5mcy5yZXNvbHZlKG1hcHBpbmcuYmFzZVVybCwgdGVtcGxhdGUucHJlZml4ICsgbWF0Y2ggKyB0ZW1wbGF0ZS5wb3N0Zml4KSk7XG4gIH1cblxuICAvKipcbiAgICogU2VhcmNoIHVwIHRoZSBmb2xkZXIgdHJlZSBmb3IgdGhlIGZpcnN0IGZvbGRlciB0aGF0IGNvbnRhaW5zIGBwYWNrYWdlLmpzb25gXG4gICAqIG9yIGBudWxsYCBpZiBub25lIGlzIGZvdW5kLlxuICAgKi9cbiAgcHJpdmF0ZSBmaW5kUGFja2FnZVBhdGgocGF0aDogQWJzb2x1dGVGc1BhdGgpOiBBYnNvbHV0ZUZzUGF0aHxudWxsIHtcbiAgICBsZXQgZm9sZGVyID0gcGF0aDtcbiAgICB3aGlsZSAoIXRoaXMuZnMuaXNSb290KGZvbGRlcikpIHtcbiAgICAgIGZvbGRlciA9IHRoaXMuZnMuZGlybmFtZShmb2xkZXIpO1xuICAgICAgaWYgKHRoaXMuZnMuZXhpc3RzKHRoaXMuZnMuam9pbihmb2xkZXIsICdwYWNrYWdlLmpzb24nKSkpIHtcbiAgICAgICAgcmV0dXJuIGZvbGRlcjtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuLyoqIFRoZSByZXN1bHQgb2YgcmVzb2x2aW5nIGFuIGltcG9ydCB0byBhIG1vZHVsZS4gKi9cbmV4cG9ydCB0eXBlIFJlc29sdmVkTW9kdWxlID0gUmVzb2x2ZWRFeHRlcm5hbE1vZHVsZXxSZXNvbHZlZFJlbGF0aXZlTW9kdWxlfFJlc29sdmVkRGVlcEltcG9ydDtcblxuLyoqXG4gKiBBIG1vZHVsZSB0aGF0IGlzIGV4dGVybmFsIHRvIHRoZSBwYWNrYWdlIGRvaW5nIHRoZSBpbXBvcnRpbmcuXG4gKiBJbiB0aGlzIGNhc2Ugd2UgY2FwdHVyZSB0aGUgZm9sZGVyIGNvbnRhaW5pbmcgdGhlIGVudHJ5LXBvaW50LlxuICovXG5leHBvcnQgY2xhc3MgUmVzb2x2ZWRFeHRlcm5hbE1vZHVsZSB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBlbnRyeVBvaW50UGF0aDogQWJzb2x1dGVGc1BhdGgpIHt9XG59XG5cbi8qKlxuICogQSBtb2R1bGUgdGhhdCBpcyByZWxhdGl2ZSB0byB0aGUgbW9kdWxlIGRvaW5nIHRoZSBpbXBvcnRpbmcsIGFuZCBzbyBpbnRlcm5hbCB0byB0aGVcbiAqIHNvdXJjZSBtb2R1bGUncyBwYWNrYWdlLlxuICovXG5leHBvcnQgY2xhc3MgUmVzb2x2ZWRSZWxhdGl2ZU1vZHVsZSB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBtb2R1bGVQYXRoOiBBYnNvbHV0ZUZzUGF0aCkge31cbn1cblxuLyoqXG4gKiBBIG1vZHVsZSB0aGF0IGlzIGV4dGVybmFsIHRvIHRoZSBwYWNrYWdlIGRvaW5nIHRoZSBpbXBvcnRpbmcgYnV0IHBvaW50aW5nIHRvIGFcbiAqIG1vZHVsZSB0aGF0IGlzIGRlZXAgaW5zaWRlIGEgcGFja2FnZSwgcmF0aGVyIHRoYW4gdG8gYW4gZW50cnktcG9pbnQgb2YgdGhlIHBhY2thZ2UuXG4gKi9cbmV4cG9ydCBjbGFzcyBSZXNvbHZlZERlZXBJbXBvcnQge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgaW1wb3J0UGF0aDogQWJzb2x1dGVGc1BhdGgpIHt9XG59XG5cbmZ1bmN0aW9uIHNwbGl0T25TdGFyKHN0cjogc3RyaW5nKTogUGF0aE1hcHBpbmdQYXR0ZXJuIHtcbiAgY29uc3QgW3ByZWZpeCwgcG9zdGZpeF0gPSBzdHIuc3BsaXQoJyonLCAyKTtcbiAgcmV0dXJuIHtwcmVmaXgsIHBvc3RmaXg6IHBvc3RmaXggfHwgJycsIGhhc1dpbGRjYXJkOiBwb3N0Zml4ICE9PSB1bmRlZmluZWR9O1xufVxuXG5pbnRlcmZhY2UgUHJvY2Vzc2VkUGF0aE1hcHBpbmcge1xuICBiYXNlVXJsOiBBYnNvbHV0ZUZzUGF0aDtcbiAgbWF0Y2hlcjogUGF0aE1hcHBpbmdQYXR0ZXJuO1xuICB0ZW1wbGF0ZXM6IFBhdGhNYXBwaW5nUGF0dGVybltdO1xufVxuXG5pbnRlcmZhY2UgUGF0aE1hcHBpbmdQYXR0ZXJuIHtcbiAgcHJlZml4OiBzdHJpbmc7XG4gIHBvc3RmaXg6IHN0cmluZztcbiAgaGFzV2lsZGNhcmQ6IGJvb2xlYW47XG59XG5cbmZ1bmN0aW9uIGlzUmVsYXRpdmVJbXBvcnQoZnJvbTogQWJzb2x1dGVGc1BhdGgsIHRvOiBBYnNvbHV0ZUZzUGF0aCkge1xuICByZXR1cm4gdG8uc3RhcnRzV2l0aChmcm9tKSAmJiAhdG8uaW5jbHVkZXMoJ25vZGVfbW9kdWxlcycpO1xufVxuIl19