(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/entry_point_finder/program_based_entry_point_finder", ["require", "exports", "tslib", "@angular/compiler-cli/ngcc/src/dependencies/dependency_host", "@angular/compiler-cli/ngcc/src/dependencies/esm_dependency_host", "@angular/compiler-cli/ngcc/src/dependencies/module_resolver", "@angular/compiler-cli/ngcc/src/path_mappings", "@angular/compiler-cli/ngcc/src/entry_point_finder/tracing_entry_point_finder", "@angular/compiler-cli/ngcc/src/entry_point_finder/utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ProgramBasedEntryPointFinder = void 0;
    var tslib_1 = require("tslib");
    var dependency_host_1 = require("@angular/compiler-cli/ngcc/src/dependencies/dependency_host");
    var esm_dependency_host_1 = require("@angular/compiler-cli/ngcc/src/dependencies/esm_dependency_host");
    var module_resolver_1 = require("@angular/compiler-cli/ngcc/src/dependencies/module_resolver");
    var path_mappings_1 = require("@angular/compiler-cli/ngcc/src/path_mappings");
    var tracing_entry_point_finder_1 = require("@angular/compiler-cli/ngcc/src/entry_point_finder/tracing_entry_point_finder");
    var utils_1 = require("@angular/compiler-cli/ngcc/src/entry_point_finder/utils");
    /**
     * An EntryPointFinder that starts from the files in the program defined by the given tsconfig.json
     * and only returns entry-points that are dependencies of these files.
     *
     * This is faster than searching the entire file-system for all the entry-points,
     * and is used primarily by the CLI integration.
     */
    var ProgramBasedEntryPointFinder = /** @class */ (function (_super) {
        tslib_1.__extends(ProgramBasedEntryPointFinder, _super);
        function ProgramBasedEntryPointFinder(fs, config, logger, resolver, entryPointCollector, entryPointManifest, basePath, tsConfig, projectPath) {
            var _this = _super.call(this, fs, config, logger, resolver, basePath, path_mappings_1.getPathMappingsFromTsConfig(fs, tsConfig, projectPath)) || this;
            _this.entryPointCollector = entryPointCollector;
            _this.entryPointManifest = entryPointManifest;
            _this.tsConfig = tsConfig;
            _this.entryPointsWithDependencies = null;
            return _this;
        }
        /**
         * Return an array containing the external import paths that were extracted from the source-files
         * of the program defined by the tsconfig.json.
         */
        ProgramBasedEntryPointFinder.prototype.getInitialEntryPointPaths = function () {
            var _this = this;
            var moduleResolver = new module_resolver_1.ModuleResolver(this.fs, this.pathMappings, ['', '.ts', '/index.ts']);
            var host = new esm_dependency_host_1.EsmDependencyHost(this.fs, moduleResolver);
            var dependencies = dependency_host_1.createDependencyInfo();
            var rootFiles = this.tsConfig.rootNames.map(function (rootName) { return _this.fs.resolve(rootName); });
            this.logger.debug("Using the program from " + this.tsConfig.project + " to seed the entry-point finding.");
            this.logger.debug("Collecting dependencies from the following files:" + rootFiles.map(function (file) { return "\n- " + file; }));
            host.collectDependenciesInFiles(rootFiles, dependencies);
            return Array.from(dependencies.dependencies);
        };
        /**
         * For the given `entryPointPath`, compute, or retrieve, the entry-point information, including
         * paths to other entry-points that this entry-point depends upon.
         *
         * In this entry-point finder, we use the `EntryPointManifest` to avoid computing each
         * entry-point's dependencies in the case that this had been done previously.
         *
         * @param entryPointPath the path to the entry-point whose information and dependencies are to be
         *     retrieved or computed.
         *
         * @returns the entry-point and its dependencies or `null` if the entry-point is not compiled by
         *     Angular or cannot be determined.
         */
        ProgramBasedEntryPointFinder.prototype.getEntryPointWithDeps = function (entryPointPath) {
            var entryPoints = this.findOrLoadEntryPoints();
            if (!entryPoints.has(entryPointPath)) {
                return null;
            }
            var entryPointWithDeps = entryPoints.get(entryPointPath);
            if (!entryPointWithDeps.entryPoint.compiledByAngular) {
                return null;
            }
            return entryPointWithDeps;
        };
        /**
         * Walk the base paths looking for entry-points or load this information from an entry-point
         * manifest, if available.
         */
        ProgramBasedEntryPointFinder.prototype.findOrLoadEntryPoints = function () {
            var e_1, _a, e_2, _b;
            if (this.entryPointsWithDependencies === null) {
                var entryPointsWithDependencies = this.entryPointsWithDependencies =
                    new Map();
                try {
                    for (var _c = tslib_1.__values(this.getBasePaths()), _d = _c.next(); !_d.done; _d = _c.next()) {
                        var basePath = _d.value;
                        var entryPoints = this.entryPointManifest.readEntryPointsUsingManifest(basePath) ||
                            this.walkBasePathForPackages(basePath);
                        try {
                            for (var entryPoints_1 = (e_2 = void 0, tslib_1.__values(entryPoints)), entryPoints_1_1 = entryPoints_1.next(); !entryPoints_1_1.done; entryPoints_1_1 = entryPoints_1.next()) {
                                var e = entryPoints_1_1.value;
                                entryPointsWithDependencies.set(e.entryPoint.path, e);
                            }
                        }
                        catch (e_2_1) { e_2 = { error: e_2_1 }; }
                        finally {
                            try {
                                if (entryPoints_1_1 && !entryPoints_1_1.done && (_b = entryPoints_1.return)) _b.call(entryPoints_1);
                            }
                            finally { if (e_2) throw e_2.error; }
                        }
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
            return this.entryPointsWithDependencies;
        };
        /**
         * Search the `basePath` for possible Angular packages and entry-points.
         *
         * @param basePath The path at which to start the search.
         * @returns an array of `EntryPoint`s that were found within `basePath`.
         */
        ProgramBasedEntryPointFinder.prototype.walkBasePathForPackages = function (basePath) {
            var _this = this;
            this.logger.debug("No manifest found for " + basePath + " so walking the directories for entry-points.");
            var entryPoints = utils_1.trackDuration(function () { return _this.entryPointCollector.walkDirectoryForPackages(basePath); }, function (duration) { return _this.logger.debug("Walking " + basePath + " for entry-points took " + duration + "s."); });
            this.entryPointManifest.writeEntryPointManifest(basePath, entryPoints);
            return entryPoints;
        };
        return ProgramBasedEntryPointFinder;
    }(tracing_entry_point_finder_1.TracingEntryPointFinder));
    exports.ProgramBasedEntryPointFinder = ProgramBasedEntryPointFinder;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZ3JhbV9iYXNlZF9lbnRyeV9wb2ludF9maW5kZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvbmdjYy9zcmMvZW50cnlfcG9pbnRfZmluZGVyL3Byb2dyYW1fYmFzZWRfZW50cnlfcG9pbnRfZmluZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7SUFXQSwrRkFBaUc7SUFFakcsdUdBQXNFO0lBQ3RFLCtGQUErRDtJQUcvRCw4RUFBNkQ7SUFHN0QsMkhBQXFFO0lBQ3JFLGlGQUFzQztJQUV0Qzs7Ozs7O09BTUc7SUFDSDtRQUFrRCx3REFBdUI7UUFHdkUsc0NBQ0ksRUFBc0IsRUFBRSxNQUF5QixFQUFFLE1BQWMsRUFDakUsUUFBNEIsRUFBVSxtQkFBd0MsRUFDdEUsa0JBQXNDLEVBQUUsUUFBd0IsRUFDaEUsUUFBNkIsRUFBRSxXQUEyQjtZQUp0RSxZQUtFLGtCQUNJLEVBQUUsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQ3RDLDJDQUEyQixDQUFDLEVBQUUsRUFBRSxRQUFRLEVBQUUsV0FBVyxDQUFDLENBQUMsU0FDNUQ7WUFOeUMseUJBQW1CLEdBQW5CLG1CQUFtQixDQUFxQjtZQUN0RSx3QkFBa0IsR0FBbEIsa0JBQWtCLENBQW9CO1lBQ3RDLGNBQVEsR0FBUixRQUFRLENBQXFCO1lBTmpDLGlDQUEyQixHQUF5RCxJQUFJLENBQUM7O1FBVWpHLENBQUM7UUFFRDs7O1dBR0c7UUFDTyxnRUFBeUIsR0FBbkM7WUFBQSxpQkFXQztZQVZDLElBQU0sY0FBYyxHQUFHLElBQUksZ0NBQWMsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxFQUFFLEVBQUUsS0FBSyxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDaEcsSUFBTSxJQUFJLEdBQUcsSUFBSSx1Q0FB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OUYsSUFBSSxDQUFDLGtCQUFrQixDQUFDLHVCQUF1QixDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsQ0FBQztZQUN2RSxPQUFPLFdBQVcsQ0FBQztRQUNyQixDQUFDO1FBQ0gsbUNBQUM7SUFBRCxDQUFDLEFBekZELENBQWtELG9EQUF1QixHQXlGeEU7SUF6Rlksb0VBQTRCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0Fic29sdXRlRnNQYXRoLCBSZWFkb25seUZpbGVTeXN0ZW19IGZyb20gJy4uLy4uLy4uL3NyYy9uZ3RzYy9maWxlX3N5c3RlbSc7XG5pbXBvcnQge0xvZ2dlcn0gZnJvbSAnLi4vLi4vLi4vc3JjL25ndHNjL2xvZ2dpbmcnO1xuaW1wb3J0IHtQYXJzZWRDb25maWd1cmF0aW9ufSBmcm9tICcuLi8uLi8uLi9zcmMvcGVyZm9ybV9jb21waWxlJztcblxuaW1wb3J0IHtjcmVhdGVEZXBlbmRlbmN5SW5mbywgRW50cnlQb2ludFdpdGhEZXBlbmRlbmNpZXN9IGZyb20gJy4uL2RlcGVuZGVuY2llcy9kZXBlbmRlbmN5X2hvc3QnO1xuaW1wb3J0IHtEZXBlbmRlbmN5UmVzb2x2ZXJ9IGZyb20gJy4uL2RlcGVuZGVuY2llcy9kZXBlbmRlbmN5X3Jlc29sdmVyJztcbmltcG9ydCB7RXNtRGVwZW5kZW5jeUhvc3R9IGZyb20gJy4uL2RlcGVuZGVuY2llcy9lc21fZGVwZW5kZW5jeV9ob3N0JztcbmltcG9ydCB7TW9kdWxlUmVzb2x2ZXJ9IGZyb20gJy4uL2RlcGVuZGVuY2llcy9tb2R1bGVfcmVzb2x2ZXInO1xuaW1wb3J0IHtOZ2NjQ29uZmlndXJhdGlvbn0gZnJvbSAnLi4vcGFja2FnZXMvY29uZmlndXJhdGlvbic7XG5pbXBvcnQge0VudHJ5UG9pbnRNYW5pZmVzdH0gZnJvbSAnLi4vcGFja2FnZXMvZW50cnlfcG9pbnRfbWFuaWZlc3QnO1xuaW1wb3J0IHtnZXRQYXRoTWFwcGluZ3NGcm9tVHNDb25maWd9IGZyb20gJy4uL3BhdGhfbWFwcGluZ3MnO1xuXG5pbXBvcnQge0VudHJ5UG9pbnRDb2xsZWN0b3J9IGZyb20gJy4vZW50cnlfcG9pbnRfY29sbGVjdG9yJztcbmltcG9ydCB7VHJhY2luZ0VudHJ5UG9pbnRGaW5kZXJ9IGZyb20gJy4vdHJhY2luZ19lbnRyeV9wb2ludF9maW5kZXInO1xuaW1wb3J0IHt0cmFja0R1cmF0aW9ufSBmcm9tICcuL3V0aWxzJztcblxuLyoqXG4gKiBBbiBFbnRyeVBvaW50RmluZGVyIHRoYXQgc3RhcnRzIGZyb20gdGhlIGZpbGVzIGluIHRoZSBwcm9ncmFtIGRlZmluZWQgYnkgdGhlIGdpdmVuIHRzY29uZmlnLmpzb25cbiAqIGFuZCBvbmx5IHJldHVybnMgZW50cnktcG9pbnRzIHRoYXQgYXJlIGRlcGVuZGVuY2llcyBvZiB0aGVzZSBmaWxlcy5cbiAqXG4gKiBUaGlzIGlzIGZhc3RlciB0aGFuIHNlYXJjaGluZyB0aGUgZW50aXJlIGZpbGUtc3lzdGVtIGZvciBhbGwgdGhlIGVudHJ5LXBvaW50cyxcbiAqIGFuZCBpcyB1c2VkIHByaW1hcmlseSBieSB0aGUgQ0xJIGludGVncmF0aW9uLlxuICovXG5leHBvcnQgY2xhc3MgUHJvZ3JhbUJhc2VkRW50cnlQb2ludEZpbmRlciBleHRlbmRzIFRyYWNpbmdFbnRyeVBvaW50RmluZGVyIHtcbiAgcHJpdmF0ZSBlbnRyeVBvaW50c1dpdGhEZXBlbmRlbmNpZXM6IE1hcDxBYnNvbHV0ZUZzUGF0aCwgRW50cnlQb2ludFdpdGhEZXBlbmRlbmNpZXM+fG51bGwgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgZnM6IFJlYWRvbmx5RmlsZVN5c3RlbSwgY29uZmlnOiBOZ2NjQ29uZmlndXJhdGlvbiwgbG9nZ2VyOiBMb2dnZXIsXG4gICAgICByZXNvbHZlcjogRGVwZW5kZW5jeVJlc29sdmVyLCBwcml2YXRlIGVudHJ5UG9pbnRDb2xsZWN0b3I6IEVudHJ5UG9pbnRDb2xsZWN0b3IsXG4gICAgICBwcml2YXRlIGVudHJ5UG9pbnRNYW5pZmVzdDogRW50cnlQb2ludE1hbmlmZXN0LCBiYXNlUGF0aDogQWJzb2x1dGVGc1BhdGgsXG4gICAgICBwcml2YXRlIHRzQ29uZmlnOiBQYXJzZWRDb25maWd1cmF0aW9uLCBwcm9qZWN0UGF0aDogQWJzb2x1dGVGc1BhdGgpIHtcbiAgICBzdXBlcihcbiAgICAgICAgZnMsIGNvbmZpZywgbG9nZ2VyLCByZXNvbHZlciwgYmFzZVBhdGgsXG4gICAgICAgIGdldFBhdGhNYXBwaW5nc0Zyb21Uc0NvbmZpZyhmcywgdHNDb25maWcsIHByb2plY3RQYXRoKSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIGFuIGFycmF5IGNvbnRhaW5pbmcgdGhlIGV4dGVybmFsIGltcG9ydCBwYXRocyB0aGF0IHdlcmUgZXh0cmFjdGVkIGZyb20gdGhlIHNvdXJjZS1maWxlc1xuICAgKiBvZiB0aGUgcHJvZ3JhbSBkZWZpbmVkIGJ5IHRoZSB0c2NvbmZpZy5qc29uLlxuICAgKi9cbiAgcHJvdGVjdGVkIGdldEluaXRpYWxFbnRyeVBvaW50UGF0aHMoKTogQWJzb2x1dGVGc1BhdGhbXSB7XG4gICAgY29uc3QgbW9kdWxlUmVzb2x2ZXIgPSBuZXcgTW9kdWxlUmVzb2x2ZXIodGhpcy5mcywgdGhpcy5wYXRoTWFwcGluZ3MsIFsnJywgJy50cycsICcvaW5kZXgudHMnXSk7XG4gICAgY29uc3QgaG9zdCA9IG5ldyBFc21EZXBlbmRlbmN5SG9zdCh0aGlzLmZzLCBtb2R1bGVSZXNvbHZlcik7XG4gICAgY29uc3QgZGVwZW5kZW5jaWVzID0gY3JlYXRlRGVwZW5kZW5jeUluZm8oKTtcbiAgICBjb25zdCByb290RmlsZXMgPSB0aGlzLnRzQ29uZmlnLnJvb3ROYW1lcy5tYXAocm9vdE5hbWUgPT4gdGhpcy5mcy5yZXNvbHZlKHJvb3ROYW1lKSk7XG4gICAgdGhpcy5sb2dnZXIuZGVidWcoXG4gICAgICAgIGBVc2luZyB0aGUgcHJvZ3JhbSBmcm9tICR7dGhpcy50c0NvbmZpZy5wcm9qZWN0fSB0byBzZWVkIHRoZSBlbnRyeS1wb2ludCBmaW5kaW5nLmApO1xuICAgIHRoaXMubG9nZ2VyLmRlYnVnKFxuICAgICAgICBgQ29sbGVjdGluZyBkZXBlbmRlbmNpZXMgZnJvbSB0aGUgZm9sbG93aW5nIGZpbGVzOmAgKyByb290RmlsZXMubWFwKGZpbGUgPT4gYFxcbi0gJHtmaWxlfWApKTtcbiAgICBob3N0LmNvbGxlY3REZXBlbmRlbmNpZXNJbkZpbGVzKHJvb3RGaWxlcywgZGVwZW5kZW5jaWVzKTtcbiAgICByZXR1cm4gQXJyYXkuZnJvbShkZXBlbmRlbmNpZXMuZGVwZW5kZW5jaWVzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGb3IgdGhlIGdpdmVuIGBlbnRyeVBvaW50UGF0aGAsIGNvbXB1dGUsIG9yIHJldHJpZXZlLCB0aGUgZW50cnktcG9pbnQgaW5mb3JtYXRpb24sIGluY2x1ZGluZ1xuICAgKiBwYXRocyB0byBvdGhlciBlbnRyeS1wb2ludHMgdGhhdCB0aGlzIGVudHJ5LXBvaW50IGRlcGVuZHMgdXBvbi5cbiAgICpcbiAgICogSW4gdGhpcyBlbnRyeS1wb2ludCBmaW5kZXIsIHdlIHVzZSB0aGUgYEVudHJ5UG9pbnRNYW5pZmVzdGAgdG8gYXZvaWQgY29tcHV0aW5nIGVhY2hcbiAgICogZW50cnktcG9pbnQncyBkZXBlbmRlbmNpZXMgaW4gdGhlIGNhc2UgdGhhdCB0aGlzIGhhZCBiZWVuIGRvbmUgcHJldmlvdXNseS5cbiAgICpcbiAgICogQHBhcmFtIGVudHJ5UG9pbnRQYXRoIHRoZSBwYXRoIHRvIHRoZSBlbnRyeS1wb2ludCB3aG9zZSBpbmZvcm1hdGlvbiBhbmQgZGVwZW5kZW5jaWVzIGFyZSB0byBiZVxuICAgKiAgICAgcmV0cmlldmVkIG9yIGNvbXB1dGVkLlxuICAgKlxuICAgKiBAcmV0dXJucyB0aGUgZW50cnktcG9pbnQgYW5kIGl0cyBkZXBlbmRlbmNpZXMgb3IgYG51bGxgIGlmIHRoZSBlbnRyeS1wb2ludCBpcyBub3QgY29tcGlsZWQgYnlcbiAgICogICAgIEFuZ3VsYXIgb3IgY2Fubm90IGJlIGRldGVybWluZWQuXG4gICAqL1xuICBwcm90ZWN0ZWQgZ2V0RW50cnlQb2ludFdpdGhEZXBzKGVudHJ5UG9pbnRQYXRoOiBBYnNvbHV0ZUZzUGF0aCk6IEVudHJ5UG9pbnRXaXRoRGVwZW5kZW5jaWVzfG51bGwge1xuICAgIGNvbnN0IGVudHJ5UG9pbnRzID0gdGhpcy5maW5kT3JMb2FkRW50cnlQb2ludHMoKTtcbiAgICBpZiAoIWVudHJ5UG9pbnRzLmhhcyhlbnRyeVBvaW50UGF0aCkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBlbnRyeVBvaW50V2l0aERlcHMgPSBlbnRyeVBvaW50cy5nZXQoZW50cnlQb2ludFBhdGgpITtcbiAgICBpZiAoIWVudHJ5UG9pbnRXaXRoRGVwcy5lbnRyeVBvaW50LmNvbXBpbGVkQnlBbmd1bGFyKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIGVudHJ5UG9pbnRXaXRoRGVwcztcbiAgfVxuXG4gIC8qKlxuICAgKiBXYWxrIHRoZSBiYXNlIHBhdGhzIGxvb2tpbmcgZm9yIGVudHJ5LXBvaW50cyBvciBsb2FkIHRoaXMgaW5mb3JtYXRpb24gZnJvbSBhbiBlbnRyeS1wb2ludFxuICAgKiBtYW5pZmVzdCwgaWYgYXZhaWxhYmxlLlxuICAgKi9cbiAgcHJpdmF0ZSBmaW5kT3JMb2FkRW50cnlQb2ludHMoKTogTWFwPEFic29sdXRlRnNQYXRoLCBFbnRyeVBvaW50V2l0aERlcGVuZGVuY2llcz4ge1xuICAgIGlmICh0aGlzLmVudHJ5UG9pbnRzV2l0aERlcGVuZGVuY2llcyA9PT0gbnVsbCkge1xuICAgICAgY29uc3QgZW50cnlQb2ludHNXaXRoRGVwZW5kZW5jaWVzID0gdGhpcy5lbnRyeVBvaW50c1dpdGhEZXBlbmRlbmNpZXMgPVxuICAgICAgICAgIG5ldyBNYXA8QWJzb2x1dGVGc1BhdGgsIEVudHJ5UG9pbnRXaXRoRGVwZW5kZW5jaWVzPigpO1xuICAgICAgZm9yIChjb25zdCBiYXNlUGF0aCBvZiB0aGlzLmdldEJhc2VQYXRocygpKSB7XG4gICAgICAgIGNvbnN0IGVudHJ5UG9pbnRzID0gdGhpcy5lbnRyeVBvaW50TWFuaWZlc3QucmVhZEVudHJ5UG9pbnRzVXNpbmdNYW5pZmVzdChiYXNlUGF0aCkgfHxcbiAgICAgICAgICAgIHRoaXMud2Fsa0Jhc2VQYXRoRm9yUGFja2FnZXMoYmFzZVBhdGgpO1xuICAgICAgICBmb3IgKGNvbnN0IGUgb2YgZW50cnlQb2ludHMpIHtcbiAgICAgICAgICBlbnRyeVBvaW50c1dpdGhEZXBlbmRlbmNpZXMuc2V0KGUuZW50cnlQb2ludC5wYXRoLCBlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5lbnRyeVBvaW50c1dpdGhEZXBlbmRlbmNpZXM7XG4gIH1cblxuICAvKipcbiAgICogU2VhcmNoIHRoZSBgYmFzZVBhdGhgIGZvciBwb3NzaWJsZSBBbmd1bGFyIHBhY2thZ2VzIGFuZCBlbnRyeS1wb2ludHMuXG4gICAqXG4gICAqIEBwYXJhbSBiYXNlUGF0aCBUaGUgcGF0aCBhdCB3aGljaCB0byBzdGFydCB0aGUgc2VhcmNoLlxuICAgKiBAcmV0dXJucyBhbiBhcnJheSBvZiBgRW50cnlQb2ludGBzIHRoYXQgd2VyZSBmb3VuZCB3aXRoaW4gYGJhc2VQYXRoYC5cbiAgICovXG4gIHdhbGtCYXNlUGF0aEZvclBhY2thZ2VzKGJhc2VQYXRoOiBBYnNvbHV0ZUZzUGF0aCk6IEVudHJ5UG9pbnRXaXRoRGVwZW5kZW5jaWVzW10ge1xuICAgIHRoaXMubG9nZ2VyLmRlYnVnKFxuICAgICAgICBgTm8gbWFuaWZlc3QgZm91bmQgZm9yICR7YmFzZVBhdGh9IHNvIHdhbGtpbmcgdGhlIGRpcmVjdG9yaWVzIGZvciBlbnRyeS1wb2ludHMuYCk7XG4gICAgY29uc3QgZW50cnlQb2ludHMgPSB0cmFja0R1cmF0aW9uKFxuICAgICAgICAoKSA9PiB0aGlzLmVudHJ5UG9pbnRDb2xsZWN0b3Iud2Fsa0RpcmVjdG9yeUZvclBhY2thZ2VzKGJhc2VQYXRoKSxcbiAgICAgICAgZHVyYXRpb24gPT4gdGhpcy5sb2dnZXIuZGVidWcoYFdhbGtpbmcgJHtiYXNlUGF0aH0gZm9yIGVudHJ5LXBvaW50cyB0b29rICR7ZHVyYXRpb259cy5gKSk7XG4gICAgdGhpcy5lbnRyeVBvaW50TWFuaWZlc3Qud3JpdGVFbnRyeVBvaW50TWFuaWZlc3QoYmFzZVBhdGgsIGVudHJ5UG9pbnRzKTtcbiAgICByZXR1cm4gZW50cnlQb2ludHM7XG4gIH1cbn1cbiJdfQ==