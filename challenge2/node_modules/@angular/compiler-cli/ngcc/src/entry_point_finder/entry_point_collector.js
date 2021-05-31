(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/entry_point_finder/entry_point_collector", ["require", "exports", "tslib", "@angular/compiler-cli/ngcc/src/packages/entry_point", "@angular/compiler-cli/ngcc/src/writing/new_entry_point_file_writer"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EntryPointCollector = void 0;
    var tslib_1 = require("tslib");
    var entry_point_1 = require("@angular/compiler-cli/ngcc/src/packages/entry_point");
    var new_entry_point_file_writer_1 = require("@angular/compiler-cli/ngcc/src/writing/new_entry_point_file_writer");
    /**
     * A class that traverses a file-tree, starting at a given path, looking for all entry-points,
     * also capturing the dependencies of each entry-point that is found.
     */
    var EntryPointCollector = /** @class */ (function () {
        function EntryPointCollector(fs, config, logger, resolver) {
            this.fs = fs;
            this.config = config;
            this.logger = logger;
            this.resolver = resolver;
        }
        /**
         * Look for Angular packages that need to be compiled, starting at the source directory.
         * The function will recurse into directories that start with `@...`, e.g. `@angular/...`.
         *
         * @param sourceDirectory An absolute path to the root directory where searching begins.
         * @returns an array of `EntryPoint`s that were found within `sourceDirectory`.
         */
        EntryPointCollector.prototype.walkDirectoryForPackages = function (sourceDirectory) {
            var e_1, _a;
            // Try to get a primary entry point from this directory
            var primaryEntryPoint = entry_point_1.getEntryPointInfo(this.fs, this.config, this.logger, sourceDirectory, sourceDirectory);
            // If there is an entry-point but it is not compatible with ngcc (it has a bad package.json or
            // invalid typings) then exit. It is unlikely that such an entry point has a dependency on an
            // Angular library.
            if (primaryEntryPoint === entry_point_1.INCOMPATIBLE_ENTRY_POINT) {
                return [];
            }
            var entryPoints = [];
            if (primaryEntryPoint !== entry_point_1.NO_ENTRY_POINT) {
                if (primaryEntryPoint !== entry_point_1.IGNORED_ENTRY_POINT) {
                    entryPoints.push(this.resolver.getEntryPointWithDependencies(primaryEntryPoint));
                }
                this.collectSecondaryEntryPoints(entryPoints, sourceDirectory, sourceDirectory, this.fs.readdir(sourceDirectory));
                // Also check for any nested node_modules in this package but only if at least one of the
                // entry-points was compiled by Angular.
                if (entryPoints.some(function (e) { return e.entryPoint.compiledByAngular; })) {
                    var nestedNodeModulesPath = this.fs.join(sourceDirectory, 'node_modules');
                    if (this.fs.exists(nestedNodeModulesPath)) {
                        entryPoints.push.apply(entryPoints, tslib_1.__spreadArray([], tslib_1.__read(this.walkDirectoryForPackages(nestedNodeModulesPath))));
                    }
                }
                return entryPoints;
            }
            try {
                // The `sourceDirectory` was not a package (i.e. there was no package.json)
                // So search its sub-directories for Angular packages and entry-points
                for (var _b = tslib_1.__values(this.fs.readdir(sourceDirectory)), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var path = _c.value;
                    if (isIgnorablePath(path)) {
                        // Ignore hidden files, node_modules and ngcc directory
                        continue;
                    }
                    var absolutePath = this.fs.resolve(sourceDirectory, path);
                    var stat = this.fs.lstat(absolutePath);
                    if (stat.isSymbolicLink() || !stat.isDirectory()) {
                        // Ignore symbolic links and non-directories
                        continue;
                    }
                    entryPoints.push.apply(entryPoints, tslib_1.__spreadArray([], tslib_1.__read(this.walkDirectoryForPackages(this.fs.join(sourceDirectory, path)))));
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return entryPoints;
        };
        /**
         * Search the `directory` looking for any secondary entry-points for a package, adding any that
         * are found to the `entryPoints` array.
         *
         * @param entryPoints An array where we will add any entry-points found in this directory.
         * @param packagePath The absolute path to the package that may contain entry-points.
         * @param directory The current directory being searched.
         * @param paths The paths contained in the current `directory`.
         */
        EntryPointCollector.prototype.collectSecondaryEntryPoints = function (entryPoints, packagePath, directory, paths) {
            var e_2, _a;
            var _this = this;
            var _loop_1 = function (path) {
                if (isIgnorablePath(path)) {
                    return "continue";
                }
                var absolutePath = this_1.fs.resolve(directory, path);
                var stat = this_1.fs.lstat(absolutePath);
                if (stat.isSymbolicLink()) {
                    return "continue";
                }
                var isDirectory = stat.isDirectory();
                if (!path.endsWith('.js') && !isDirectory) {
                    return "continue";
                }
                // If the path is a JS file then strip its extension and see if we can match an
                // entry-point (even if it is an ignored one).
                var possibleEntryPointPath = isDirectory ? absolutePath : stripJsExtension(absolutePath);
                var subEntryPoint = entry_point_1.getEntryPointInfo(this_1.fs, this_1.config, this_1.logger, packagePath, possibleEntryPointPath);
                if (entry_point_1.isEntryPoint(subEntryPoint)) {
                    entryPoints.push(this_1.resolver.getEntryPointWithDependencies(subEntryPoint));
                }
                if (!isDirectory) {
                    return "continue";
                }
                // If not an entry-point itself, this directory may contain entry-points of its own.
                var canContainEntryPoints = subEntryPoint === entry_point_1.NO_ENTRY_POINT || subEntryPoint === entry_point_1.INCOMPATIBLE_ENTRY_POINT;
                var childPaths = this_1.fs.readdir(absolutePath);
                if (canContainEntryPoints &&
                    childPaths.some(function (childPath) { return childPath.endsWith('.js') &&
                        _this.fs.stat(_this.fs.resolve(absolutePath, childPath)).isFile(); })) {
                    return "continue";
                }
                this_1.collectSecondaryEntryPoints(entryPoints, packagePath, absolutePath, childPaths);
            };
            var this_1 = this;
            try {
                for (var paths_1 = tslib_1.__values(paths), paths_1_1 = paths_1.next(); !paths_1_1.done; paths_1_1 = paths_1.next()) {
                    var path = paths_1_1.value;
                    _loop_1(path);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (paths_1_1 && !paths_1_1.done && (_a = paths_1.return)) _a.call(paths_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
        };
        return EntryPointCollector;
    }());
    exports.EntryPointCollector = EntryPointCollector;
    function stripJsExtension(filePath) {
        return filePath.replace(/\.js$/, '');
    }
    function isIgnorablePath(path) {
        return path.startsWith('.') || path === 'node_modules' || path === new_entry_point_file_writer_1.NGCC_DIRECTORY;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50cnlfcG9pbnRfY29sbGVjdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL25nY2Mvc3JjL2VudHJ5X3BvaW50X2ZpbmRlci9lbnRyeV9wb2ludF9jb2xsZWN0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztJQVlBLG1GQUF1STtJQUN2SSxrSEFBc0U7SUFFdEU7OztPQUdHO0lBQ0g7UUFDRSw2QkFDWSxFQUFzQixFQUFVLE1BQXlCLEVBQVUsTUFBYyxFQUNqRixRQUE0QjtZQUQ1QixPQUFFLEdBQUYsRUFBRSxDQUFvQjtZQUFVLFdBQU0sR0FBTixNQUFNLENBQW1CO1lBQVUsV0FBTSxHQUFOLE1BQU0sQ0FBUTtZQUNqRixhQUFRLEdBQVIsUUFBUSxDQUFvQjtRQUFHLENBQUM7UUFFNUM7Ozs7OztXQU1HO1FBQ0gsc0RBQXdCLEdBQXhCLFVBQXlCLGVBQStCOztZQUN0RCx1REFBdUQ7WUFDdkQsSUFBTSxpQkFBaUIsR0FDbkIsK0JBQWlCLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsZUFBZSxFQUFFLGVBQWUsQ0FBQyxDQUFDO1lBRTNGLDhGQUE4RjtZQUM5Riw2RkFBNkY7WUFDN0YsbUJBQW1CO1lBQ25CLElBQUksaUJBQWlCLEtBQUssc0NBQXdCLEVBQUU7Z0JBQ2xELE9BQU8sRUFBRSxDQUFDO2FBQ1g7WUFFRCxJQUFNLFdBQVcsR0FBaUMsRUFBRSxDQUFDO1lBQ3JELElBQUksaUJBQWlCLEtBQUssNEJBQWMsRUFBRTtnQkFDeEMsSUFBSSxpQkFBaUIsS0FBSyxpQ0FBbUIsRUFBRTtvQkFDN0MsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLDZCQUE2QixDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQztpQkFDbEY7Z0JBQ0QsSUFB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Y0FBYyxJQUFJLElBQUksS0FBSyw0Q0FBYyxDQUFDO0lBQ3BGLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7QWJzb2x1dGVGc1BhdGgsIFBhdGhTZWdtZW50LCBSZWFkb25seUZpbGVTeXN0ZW19IGZyb20gJy4uLy4uLy4uL3NyYy9uZ3RzYy9maWxlX3N5c3RlbSc7XG5pbXBvcnQge0xvZ2dlcn0gZnJvbSAnLi4vLi4vLi4vc3JjL25ndHNjL2xvZ2dpbmcnO1xuaW1wb3J0IHtFbnRyeVBvaW50V2l0aERlcGVuZGVuY2llc30gZnJvbSAnLi4vZGVwZW5kZW5jaWVzL2RlcGVuZGVuY3lfaG9zdCc7XG5pbXBvcnQge0RlcGVuZGVuY3lSZXNvbHZlcn0gZnJvbSAnLi4vZGVwZW5kZW5jaWVzL2RlcGVuZGVuY3lfcmVzb2x2ZXInO1xuaW1wb3J0IHtOZ2NjQ29uZmlndXJhdGlvbn0gZnJvbSAnLi4vcGFja2FnZXMvY29uZmlndXJhdGlvbic7XG5pbXBvcnQge2dldEVudHJ5UG9pbnRJbmZvLCBJR05PUkVEX0VOVFJZX1BPSU5ULCBJTkNPTVBBVElCTEVfRU5UUllfUE9JTlQsIGlzRW50cnlQb2ludCwgTk9fRU5UUllfUE9JTlR9IGZyb20gJy4uL3BhY2thZ2VzL2VudHJ5X3BvaW50JztcbmltcG9ydCB7TkdDQ19ESVJFQ1RPUll9IGZyb20gJy4uL3dyaXRpbmcvbmV3X2VudHJ5X3BvaW50X2ZpbGVfd3JpdGVyJztcblxuLyoqXG4gKiBBIGNsYXNzIHRoYXQgdHJhdmVyc2VzIGEgZmlsZS10cmVlLCBzdGFydGluZyBhdCBhIGdpdmVuIHBhdGgsIGxvb2tpbmcgZm9yIGFsbCBlbnRyeS1wb2ludHMsXG4gKiBhbHNvIGNhcHR1cmluZyB0aGUgZGVwZW5kZW5jaWVzIG9mIGVhY2ggZW50cnktcG9pbnQgdGhhdCBpcyBmb3VuZC5cbiAqL1xuZXhwb3J0IGNsYXNzIEVudHJ5UG9pbnRDb2xsZWN0b3Ige1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgZnM6IFJlYWRvbmx5RmlsZVN5c3RlbSwgcHJpdmF0ZSBjb25maWc6IE5nY2NDb25maWd1cmF0aW9uLCBwcml2YXRlIGxvZ2dlcjogTG9nZ2VyLFxuICAgICAgcHJpdmF0ZSByZXNvbHZlcjogRGVwZW5kZW5jeVJlc29sdmVyKSB7fVxuXG4gIC8qKlxuICAgKiBMb29rIGZvciBBbmd1bGFyIHBhY2thZ2VzIHRoYXQgbmVlZCB0byBiZSBjb21waWxlZCwgc3RhcnRpbmcgYXQgdGhlIHNvdXJjZSBkaXJlY3RvcnkuXG4gICAqIFRoZSBmdW5jdGlvbiB3aWxsIHJlY3Vyc2UgaW50byBkaXJlY3RvcmllcyB0aGF0IHN0YXJ0IHdpdGggYEAuLi5gLCBlLmcuIGBAYW5ndWxhci8uLi5gLlxuICAgKlxuICAgKiBAcGFyYW0gc291cmNlRGlyZWN0b3J5IEFuIGFic29sdXRlIHBhdGggdG8gdGhlIHJvb3QgZGlyZWN0b3J5IHdoZXJlIHNlYXJjaGluZyBiZWdpbnMuXG4gICAqIEByZXR1cm5zIGFuIGFycmF5IG9mIGBFbnRyeVBvaW50YHMgdGhhdCB3ZXJlIGZvdW5kIHdpdGhpbiBgc291cmNlRGlyZWN0b3J5YC5cbiAgICovXG4gIHdhbGtEaXJlY3RvcnlGb3JQYWNrYWdlcyhzb3VyY2VEaXJlY3Rvcnk6IEFic29sdXRlRnNQYXRoKTogRW50cnlQb2ludFdpdGhEZXBlbmRlbmNpZXNbXSB7XG4gICAgLy8gVHJ5IHRvIGdldCBhIHByaW1hcnkgZW50cnkgcG9pbnQgZnJvbSB0aGlzIGRpcmVjdG9yeVxuICAgIGNvbnN0IHByaW1hcnlFbnRyeVBvaW50ID1cbiAgICAgICAgZ2V0RW50cnlQb2ludEluZm8odGhpcy5mcywgdGhpcy5jb25maWcsIHRoaXMubG9nZ2VyLCBzb3VyY2VEaXJlY3RvcnksIHNvdXJjZURpcmVjdG9yeSk7XG5cbiAgICAvLyBJZiB0aGVyZSBpcyBhbiBlbnRyeS1wb2ludCBidXQgaXQgaXMgbm90IGNvbXBhdGlibGUgd2l0aCBuZ2NjIChpdCBoYXMgYSBiYWQgcGFja2FnZS5qc29uIG9yXG4gICAgLy8gaW52YWxpZCB0eXBpbmdzKSB0aGVuIGV4aXQuIEl0IGlzIHVubGlrZWx5IHRoYXQgc3VjaCBhbiBlbnRyeSBwb2ludCBoYXMgYSBkZXBlbmRlbmN5IG9uIGFuXG4gICAgLy8gQW5ndWxhciBsaWJyYXJ5LlxuICAgIGlmIChwcmltYXJ5RW50cnlQb2ludCA9PT0gSU5DT01QQVRJQkxFX0VOVFJZX1BPSU5UKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgY29uc3QgZW50cnlQb2ludHM6IEVudHJ5UG9pbnRXaXRoRGVwZW5kZW5jaWVzW10gPSBbXTtcbiAgICBpZiAocHJpbWFyeUVudHJ5UG9pbnQgIT09IE5PX0VOVFJZX1BPSU5UKSB7XG4gICAgICBpZiAocHJpbWFyeUVudHJ5UG9pbnQgIT09IElHTk9SRURfRU5UUllfUE9JTlQpIHtcbiAgICAgICAgZW50cnlQb2ludHMucHVzaCh0aGlzLnJlc29sdmVyLmdldEVudHJ5UG9pbnRXaXRoRGVwZW5kZW5jaWVzKHByaW1hcnlFbnRyeVBvaW50KSk7XG4gICAgICB9XG4gICAgICB0aGlzLmNvbGxlY3RTZWNvbmRhcnlFbnRyeVBvaW50cyhcbiAgICAgICAgICBlbnRyeVBvaW50cywgc291cmNlRGlyZWN0b3J5LCBzb3VyY2VEaXJlY3RvcnksIHRoaXMuZnMucmVhZGRpcihzb3VyY2VEaXJlY3RvcnkpKTtcblxuICAgICAgLy8gQWxzbyBjaGVjayBmb3IgYW55IG5lc3RlZCBub2RlX21vZHVsZXMgaW4gdGhpcyBwYWNrYWdlIGJ1dCBvbmx5IGlmIGF0IGxlYXN0IG9uZSBvZiB0aGVcbiAgICAgIC8vIGVudHJ5LXBvaW50cyB3YXMgY29tcGlsZWQgYnkgQW5ndWxhci5cbiAgICAgIGlmIChlbnRyeVBvaW50cy5zb21lKGUgPT4gZS5lbnRyeVBvaW50LmNvbXBpbGVkQnlBbmd1bGFyKSkge1xuICAgICAgICBjb25zdCBuZXN0ZWROb2RlTW9kdWxlc1BhdGggPSB0aGlzLmZzLmpvaW4oc291cmNlRGlyZWN0b3J5LCAnbm9kZV9tb2R1bGVzJyk7XG4gICAgICAgIGlmICh0aGlzLmZzLmV4aXN0cyhuZXN0ZWROb2RlTW9kdWxlc1BhdGgpKSB7XG4gICAgICAgICAgZW50cnlQb2ludHMucHVzaCguLi50aGlzLndhbGtEaXJlY3RvcnlGb3JQYWNrYWdlcyhuZXN0ZWROb2RlTW9kdWxlc1BhdGgpKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gZW50cnlQb2ludHM7XG4gICAgfVxuXG4gICAgLy8gVGhlIGBzb3VyY2VEaXJlY3RvcnlgIHdhcyBub3QgYSBwYWNrYWdlIChpLmUuIHRoZXJlIHdhcyBubyBwYWNrYWdlLmpzb24pXG4gICAgLy8gU28gc2VhcmNoIGl0cyBzdWItZGlyZWN0b3JpZXMgZm9yIEFuZ3VsYXIgcGFja2FnZXMgYW5kIGVudHJ5LXBvaW50c1xuICAgIGZvciAoY29uc3QgcGF0aCBvZiB0aGlzLmZzLnJlYWRkaXIoc291cmNlRGlyZWN0b3J5KSkge1xuICAgICAgaWYgKGlzSWdub3JhYmxlUGF0aChwYXRoKSkge1xuICAgICAgICAvLyBJZ25vcmUgaGlkZGVuIGZpbGVzLCBub2RlX21vZHVsZXMgYW5kIG5nY2MgZGlyZWN0b3J5XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBhYnNvbHV0ZVBhdGggPSB0aGlzLmZzLnJlc29sdmUoc291cmNlRGlyZWN0b3J5LCBwYXRoKTtcbiAgICAgIGNvbnN0IHN0YXQgPSB0aGlzLmZzLmxzdGF0KGFic29sdXRlUGF0aCk7XG4gICAgICBpZiAoc3RhdC5pc1N5bWJvbGljTGluaygpIHx8ICFzdGF0LmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgICAgLy8gSWdub3JlIHN5bWJvbGljIGxpbmtzIGFuZCBub24tZGlyZWN0b3JpZXNcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGVudHJ5UG9pbnRzLnB1c2goLi4udGhpcy53YWxrRGlyZWN0b3J5Rm9yUGFja2FnZXModGhpcy5mcy5qb2luKHNvdXJjZURpcmVjdG9yeSwgcGF0aCkpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZW50cnlQb2ludHM7XG4gIH1cblxuICAvKipcbiAgICogU2VhcmNoIHRoZSBgZGlyZWN0b3J5YCBsb29raW5nIGZvciBhbnkgc2Vjb25kYXJ5IGVudHJ5LXBvaW50cyBmb3IgYSBwYWNrYWdlLCBhZGRpbmcgYW55IHRoYXRcbiAgICogYXJlIGZvdW5kIHRvIHRoZSBgZW50cnlQb2ludHNgIGFycmF5LlxuICAgKlxuICAgKiBAcGFyYW0gZW50cnlQb2ludHMgQW4gYXJyYXkgd2hlcmUgd2Ugd2lsbCBhZGQgYW55IGVudHJ5LXBvaW50cyBmb3VuZCBpbiB0aGlzIGRpcmVjdG9yeS5cbiAgICogQHBhcmFtIHBhY2thZ2VQYXRoIFRoZSBhYnNvbHV0ZSBwYXRoIHRvIHRoZSBwYWNrYWdlIHRoYXQgbWF5IGNvbnRhaW4gZW50cnktcG9pbnRzLlxuICAgKiBAcGFyYW0gZGlyZWN0b3J5IFRoZSBjdXJyZW50IGRpcmVjdG9yeSBiZWluZyBzZWFyY2hlZC5cbiAgICogQHBhcmFtIHBhdGhzIFRoZSBwYXRocyBjb250YWluZWQgaW4gdGhlIGN1cnJlbnQgYGRpcmVjdG9yeWAuXG4gICAqL1xuICBwcml2YXRlIGNvbGxlY3RTZWNvbmRhcnlFbnRyeVBvaW50cyhcbiAgICAgIGVudHJ5UG9pbnRzOiBFbnRyeVBvaW50V2l0aERlcGVuZGVuY2llc1tdLCBwYWNrYWdlUGF0aDogQWJzb2x1dGVGc1BhdGgsXG4gICAgICBkaXJlY3Rvcnk6IEFic29sdXRlRnNQYXRoLCBwYXRoczogUGF0aFNlZ21lbnRbXSk6IHZvaWQge1xuICAgIGZvciAoY29uc3QgcGF0aCBvZiBwYXRocykge1xuICAgICAgaWYgKGlzSWdub3JhYmxlUGF0aChwYXRoKSkge1xuICAgICAgICAvLyBJZ25vcmUgaGlkZGVuIGZpbGVzLCBub2RlX21vZHVsZXMgYW5kIG5nY2MgZGlyZWN0b3J5XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBhYnNvbHV0ZVBhdGggPSB0aGlzLmZzLnJlc29sdmUoZGlyZWN0b3J5LCBwYXRoKTtcbiAgICAgIGNvbnN0IHN0YXQgPSB0aGlzLmZzLmxzdGF0KGFic29sdXRlUGF0aCk7XG4gICAgICBpZiAoc3RhdC5pc1N5bWJvbGljTGluaygpKSB7XG4gICAgICAgIC8vIElnbm9yZSBzeW1ib2xpYyBsaW5rc1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgaXNEaXJlY3RvcnkgPSBzdGF0LmlzRGlyZWN0b3J5KCk7XG4gICAgICBpZiAoIXBhdGguZW5kc1dpdGgoJy5qcycpICYmICFpc0RpcmVjdG9yeSkge1xuICAgICAgICAvLyBJZ25vcmUgZmlsZXMgdGhhdCBkbyBub3QgZW5kIGluIGAuanNgXG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBJZiB0aGUgcGF0aCBpcyBhIEpTIGZpbGUgdGhlbiBzdHJpcCBpdHMgZXh0ZW5zaW9uIGFuZCBzZWUgaWYgd2UgY2FuIG1hdGNoIGFuXG4gICAgICAvLyBlbnRyeS1wb2ludCAoZXZlbiBpZiBpdCBpcyBhbiBpZ25vcmVkIG9uZSkuXG4gICAgICBjb25zdCBwb3NzaWJsZUVudHJ5UG9pbnRQYXRoID0gaXNEaXJlY3RvcnkgPyBhYnNvbHV0ZVBhdGggOiBzdHJpcEpzRXh0ZW5zaW9uKGFic29sdXRlUGF0aCk7XG4gICAgICBjb25zdCBzdWJFbnRyeVBvaW50ID1cbiAgICAgICAgICBnZXRFbnRyeVBvaW50SW5mbyh0aGlzLmZzLCB0aGlzLmNvbmZpZywgdGhpcy5sb2dnZXIsIHBhY2thZ2VQYXRoLCBwb3NzaWJsZUVudHJ5UG9pbnRQYXRoKTtcbiAgICAgIGlmIChpc0VudHJ5UG9pbnQoc3ViRW50cnlQb2ludCkpIHtcbiAgICAgICAgZW50cnlQb2ludHMucHVzaCh0aGlzLnJlc29sdmVyLmdldEVudHJ5UG9pbnRXaXRoRGVwZW5kZW5jaWVzKHN1YkVudHJ5UG9pbnQpKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFpc0RpcmVjdG9yeSkge1xuICAgICAgICAvLyBUaGlzIHBhdGggaXMgbm90IGEgZGlyZWN0b3J5IHNvIHdlIGFyZSBkb25lLlxuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gSWYgbm90IGFuIGVudHJ5LXBvaW50IGl0c2VsZiwgdGhpcyBkaXJlY3RvcnkgbWF5IGNvbnRhaW4gZW50cnktcG9pbnRzIG9mIGl0cyBvd24uXG4gICAgICBjb25zdCBjYW5Db250YWluRW50cnlQb2ludHMgPVxuICAgICAgICAgIHN1YkVudHJ5UG9pbnQgPT09IE5PX0VOVFJZX1BPSU5UIHx8IHN1YkVudHJ5UG9pbnQgPT09IElOQ09NUEFUSUJMRV9FTlRSWV9QT0lOVDtcbiAgICAgIGNvbnN0IGNoaWxkUGF0aHMgPSB0aGlzLmZzLnJlYWRkaXIoYWJzb2x1dGVQYXRoKTtcbiAgICAgIGlmIChjYW5Db250YWluRW50cnlQb2ludHMgJiZcbiAgICAgICAgICBjaGlsZFBhdGhzLnNvbWUoXG4gICAgICAgICAgICAgIGNoaWxkUGF0aCA9PiBjaGlsZFBhdGguZW5kc1dpdGgoJy5qcycpICYmXG4gICAgICAgICAgICAgICAgICB0aGlzLmZzLnN0YXQodGhpcy5mcy5yZXNvbHZlKGFic29sdXRlUGF0aCwgY2hpbGRQYXRoKSkuaXNGaWxlKCkpKSB7XG4gICAgICAgIC8vIFdlIGRvIG5vdCBjb25zaWRlciBub24tZW50cnktcG9pbnQgZGlyZWN0b3JpZXMgdGhhdCBjb250YWluIEpTIGZpbGVzIGFzIHRoZXkgYXJlIHZlcnlcbiAgICAgICAgLy8gdW5saWtlbHkgdG8gYmUgY29udGFpbmVycyBmb3Igc3ViLWVudHJ5LXBvaW50cy5cbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICB0aGlzLmNvbGxlY3RTZWNvbmRhcnlFbnRyeVBvaW50cyhlbnRyeVBvaW50cywgcGFja2FnZVBhdGgsIGFic29sdXRlUGF0aCwgY2hpbGRQYXRocyk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHN0cmlwSnNFeHRlbnNpb248VCBleHRlbmRzIHN0cmluZz4oZmlsZVBhdGg6IFQpOiBUIHtcbiAgcmV0dXJuIGZpbGVQYXRoLnJlcGxhY2UoL1xcLmpzJC8sICcnKSBhcyBUO1xufVxuXG5mdW5jdGlvbiBpc0lnbm9yYWJsZVBhdGgocGF0aDogUGF0aFNlZ21lbnQpOiBib29sZWFuIHtcbiAgcmV0dXJuIHBhdGguc3RhcnRzV2l0aCgnLicpIHx8IHBhdGggPT09ICdub2RlX21vZHVsZXMnIHx8IHBhdGggPT09IE5HQ0NfRElSRUNUT1JZO1xufVxuIl19