(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/entry_point_finder/directory_walker_entry_point_finder", ["require", "exports", "tslib", "@angular/compiler-cli/ngcc/src/entry_point_finder/utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DirectoryWalkerEntryPointFinder = void 0;
    var tslib_1 = require("tslib");
    var utils_1 = require("@angular/compiler-cli/ngcc/src/entry_point_finder/utils");
    /**
     * An EntryPointFinder that searches for all entry-points that can be found given a `basePath` and
     * `pathMappings`.
     */
    var DirectoryWalkerEntryPointFinder = /** @class */ (function () {
        function DirectoryWalkerEntryPointFinder(logger, resolver, entryPointCollector, entryPointManifest, sourceDirectory, pathMappings) {
            this.logger = logger;
            this.resolver = resolver;
            this.entryPointCollector = entryPointCollector;
            this.entryPointManifest = entryPointManifest;
            this.sourceDirectory = sourceDirectory;
            this.pathMappings = pathMappings;
            this.basePaths = utils_1.getBasePaths(this.logger, this.sourceDirectory, this.pathMappings);
        }
        /**
         * Search the `sourceDirectory`, and sub-directories, using `pathMappings` as necessary, to find
         * all package entry-points.
         */
        DirectoryWalkerEntryPointFinder.prototype.findEntryPoints = function () {
            var e_1, _a;
            var unsortedEntryPoints = [];
            try {
                for (var _b = tslib_1.__values(this.basePaths), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var basePath = _c.value;
                    var entryPoints = this.entryPointManifest.readEntryPointsUsingManifest(basePath) ||
                        this.walkBasePathForPackages(basePath);
                    entryPoints.forEach(function (e) { return unsortedEntryPoints.push(e); });
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return this.resolver.sortEntryPointsByDependency(unsortedEntryPoints);
        };
        /**
         * Search the `basePath` for possible Angular packages and entry-points.
         *
         * @param basePath The path at which to start the search.
         * @returns an array of `EntryPoint`s that were found within `basePath`.
         */
        DirectoryWalkerEntryPointFinder.prototype.walkBasePathForPackages = function (basePath) {
            var _this = this;
            this.logger.debug("No manifest found for " + basePath + " so walking the directories for entry-points.");
            var entryPoints = utils_1.trackDuration(function () { return _this.entryPointCollector.walkDirectoryForPackages(basePath); }, function (duration) { return _this.logger.debug("Walking " + basePath + " for entry-points took " + duration + "s."); });
            this.entryPointManifest.writeEntryPointManifest(basePath, entryPoints);
            return entryPoints;
        };
        return DirectoryWalkerEntryPointFinder;
    }());
    exports.DirectoryWalkerEntryPointFinder = DirectoryWalkerEntryPointFinder;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlyZWN0b3J5X3dhbGtlcl9lbnRyeV9wb2ludF9maW5kZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvbmdjYy9zcmMvZW50cnlfcG9pbnRfZmluZGVyL2RpcmVjdG9yeV93YWxrZXJfZW50cnlfcG9pbnRfZmluZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7SUFnQkEsaUZBQW9EO0lBRXBEOzs7T0FHRztJQUNIO1FBRUUseUNBQ1ksTUFBYyxFQUFVLFFBQTRCLEVBQ3BELG1CQUF3QyxFQUN4QyxrQkFBc0MsRUFBVSxlQUErQixFQUMvRSxZQUFvQztZQUhwQyxXQUFNLEdBQU4sTUFBTSxDQUFRO1lBQVUsYUFBUSxHQUFSLFFBQVEsQ0FBb0I7WUFDcEQsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFxQjtZQUN4Qyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW9CO1lBQVUsb0JBQWUsR0FBZixlQUFlLENBQWdCO1lBQy9FLGlCQUFZLEdBQVosWUFBWSxDQUF3QjtZQUx4QyxjQUFTLEdBQUcsb0JBQVksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBS3BDLENBQUM7UUFFcEQ7OztXQUdHO1FBQ0gseURBQWUsR0FBZjs7WUFDRSxJQUFNLG1CQUFtQixHQUFpQyxFQUFFLENBQUM7O2dCQUM3RCxLQUF1QixJQUFBLEtBQUEsaUJBQUEsSUFBSSxDQUFDLFNBQVMsQ0FBQSxnQkFBQSw0QkFBRTtvQkFBbEMsSUFBTSxRQUFRLFdBQUE7b0JBQ2pCLElBQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyw0QkFBNEIsQ0FBQyxRQUFRLENBQUM7d0JBQzlFLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDM0MsV0FBVyxDQUFDLE9BQU8sQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBM0IsQ0FBMkIsQ0FBQyxDQUFDO2lCQUN2RDs7Ozs7Ozs7O1lBQ0QsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLDJCQUEyQixDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFDeEUsQ0FBQztRQUVEOzs7OztXQUtHO1FBQ0gsaUVBQXVCLEdBQXZCLFVBQXdCLFFBQXdCO1lBQWhELGlCQVFDO1lBUEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQ2IsMkJBQXlCLFFBQVEsa0RBQStDLENBQUMsQ0FBQztZQUN0RixJQUFNLFdBQVcsR0FBRyxxQkFBYSxDQUM3QixjQUFNLE9BQUEsS0FBSSxDQUFDLG1CQUFtQixDQUFDLHdCQUF3QixDQUFDLFFBQVEsQ0FBQyxFQUEzRCxDQUEyRCxFQUNqRSxVQUFBLFFBQVEsSUFBSSxPQUFBLEtBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGFBQVcsUUFBUSwrQkFBMEIsUUFBUSxPQUFJLENBQUMsRUFBNUUsQ0FBNEUsQ0FBQyxDQUFDO1lBQzlGLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyx1QkFBdUIsQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFDdkUsT0FBTyxXQUFXLENBQUM7UUFDckIsQ0FBQztRQUNILHNDQUFDO0lBQUQsQ0FBQyxBQXJDRCxJQXFDQztJQXJDWSwwRUFBK0IiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7QWJzb2x1dGVGc1BhdGh9IGZyb20gJy4uLy4uLy4uL3NyYy9uZ3RzYy9maWxlX3N5c3RlbSc7XG5pbXBvcnQge0xvZ2dlcn0gZnJvbSAnLi4vLi4vLi4vc3JjL25ndHNjL2xvZ2dpbmcnO1xuaW1wb3J0IHtFbnRyeVBvaW50V2l0aERlcGVuZGVuY2llc30gZnJvbSAnLi4vZGVwZW5kZW5jaWVzL2RlcGVuZGVuY3lfaG9zdCc7XG5pbXBvcnQge0RlcGVuZGVuY3lSZXNvbHZlciwgU29ydGVkRW50cnlQb2ludHNJbmZvfSBmcm9tICcuLi9kZXBlbmRlbmNpZXMvZGVwZW5kZW5jeV9yZXNvbHZlcic7XG5pbXBvcnQge0VudHJ5UG9pbnRNYW5pZmVzdH0gZnJvbSAnLi4vcGFja2FnZXMvZW50cnlfcG9pbnRfbWFuaWZlc3QnO1xuaW1wb3J0IHtQYXRoTWFwcGluZ3N9IGZyb20gJy4uL3BhdGhfbWFwcGluZ3MnO1xuXG5pbXBvcnQge0VudHJ5UG9pbnRDb2xsZWN0b3J9IGZyb20gJy4vZW50cnlfcG9pbnRfY29sbGVjdG9yJztcbmltcG9ydCB7RW50cnlQb2ludEZpbmRlcn0gZnJvbSAnLi9pbnRlcmZhY2UnO1xuaW1wb3J0IHtnZXRCYXNlUGF0aHMsIHRyYWNrRHVyYXRpb259IGZyb20gJy4vdXRpbHMnO1xuXG4vKipcbiAqIEFuIEVudHJ5UG9pbnRGaW5kZXIgdGhhdCBzZWFyY2hlcyBmb3IgYWxsIGVudHJ5LXBvaW50cyB0aGF0IGNhbiBiZSBmb3VuZCBnaXZlbiBhIGBiYXNlUGF0aGAgYW5kXG4gKiBgcGF0aE1hcHBpbmdzYC5cbiAqL1xuZXhwb3J0IGNsYXNzIERpcmVjdG9yeVdhbGtlckVudHJ5UG9pbnRGaW5kZXIgaW1wbGVtZW50cyBFbnRyeVBvaW50RmluZGVyIHtcbiAgcHJpdmF0ZSBiYXNlUGF0aHMgPSBnZXRCYXNlUGF0aHModGhpcy5sb2dnZXIsIHRoaXMuc291cmNlRGlyZWN0b3J5LCB0aGlzLnBhdGhNYXBwaW5ncyk7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBsb2dnZXI6IExvZ2dlciwgcHJpdmF0ZSByZXNvbHZlcjogRGVwZW5kZW5jeVJlc29sdmVyLFxuICAgICAgcHJpdmF0ZSBlbnRyeVBvaW50Q29sbGVjdG9yOiBFbnRyeVBvaW50Q29sbGVjdG9yLFxuICAgICAgcHJpdmF0ZSBlbnRyeVBvaW50TWFuaWZlc3Q6IEVudHJ5UG9pbnRNYW5pZmVzdCwgcHJpdmF0ZSBzb3VyY2VEaXJlY3Rvcnk6IEFic29sdXRlRnNQYXRoLFxuICAgICAgcHJpdmF0ZSBwYXRoTWFwcGluZ3M6IFBhdGhNYXBwaW5nc3x1bmRlZmluZWQpIHt9XG5cbiAgLyoqXG4gICAqIFNlYXJjaCB0aGUgYHNvdXJjZURpcmVjdG9yeWAsIGFuZCBzdWItZGlyZWN0b3JpZXMsIHVzaW5nIGBwYXRoTWFwcGluZ3NgIGFzIG5lY2Vzc2FyeSwgdG8gZmluZFxuICAgKiBhbGwgcGFja2FnZSBlbnRyeS1wb2ludHMuXG4gICAqL1xuICBmaW5kRW50cnlQb2ludHMoKTogU29ydGVkRW50cnlQb2ludHNJbmZvIHtcbiAgICBjb25zdCB1bnNvcnRlZEVudHJ5UG9pbnRzOiBFbnRyeVBvaW50V2l0aERlcGVuZGVuY2llc1tdID0gW107XG4gICAgZm9yIChjb25zdCBiYXNlUGF0aCBvZiB0aGlzLmJhc2VQYXRocykge1xuICAgICAgY29uc3QgZW50cnlQb2ludHMgPSB0aGlzLmVudHJ5UG9pbnRNYW5pZmVzdC5yZWFkRW50cnlQb2ludHNVc2luZ01hbmlmZXN0KGJhc2VQYXRoKSB8fFxuICAgICAgICAgIHRoaXMud2Fsa0Jhc2VQYXRoRm9yUGFja2FnZXMoYmFzZVBhdGgpO1xuICAgICAgZW50cnlQb2ludHMuZm9yRWFjaChlID0+IHVuc29ydGVkRW50cnlQb2ludHMucHVzaChlKSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnJlc29sdmVyLnNvcnRFbnRyeVBvaW50c0J5RGVwZW5kZW5jeSh1bnNvcnRlZEVudHJ5UG9pbnRzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWFyY2ggdGhlIGBiYXNlUGF0aGAgZm9yIHBvc3NpYmxlIEFuZ3VsYXIgcGFja2FnZXMgYW5kIGVudHJ5LXBvaW50cy5cbiAgICpcbiAgICogQHBhcmFtIGJhc2VQYXRoIFRoZSBwYXRoIGF0IHdoaWNoIHRvIHN0YXJ0IHRoZSBzZWFyY2guXG4gICAqIEByZXR1cm5zIGFuIGFycmF5IG9mIGBFbnRyeVBvaW50YHMgdGhhdCB3ZXJlIGZvdW5kIHdpdGhpbiBgYmFzZVBhdGhgLlxuICAgKi9cbiAgd2Fsa0Jhc2VQYXRoRm9yUGFja2FnZXMoYmFzZVBhdGg6IEFic29sdXRlRnNQYXRoKTogRW50cnlQb2ludFdpdGhEZXBlbmRlbmNpZXNbXSB7XG4gICAgdGhpcy5sb2dnZXIuZGVidWcoXG4gICAgICAgIGBObyBtYW5pZmVzdCBmb3VuZCBmb3IgJHtiYXNlUGF0aH0gc28gd2Fsa2luZyB0aGUgZGlyZWN0b3JpZXMgZm9yIGVudHJ5LXBvaW50cy5gKTtcbiAgICBjb25zdCBlbnRyeVBvaW50cyA9IHRyYWNrRHVyYXRpb24oXG4gICAgICAgICgpID0+IHRoaXMuZW50cnlQb2ludENvbGxlY3Rvci53YWxrRGlyZWN0b3J5Rm9yUGFja2FnZXMoYmFzZVBhdGgpLFxuICAgICAgICBkdXJhdGlvbiA9PiB0aGlzLmxvZ2dlci5kZWJ1ZyhgV2Fsa2luZyAke2Jhc2VQYXRofSBmb3IgZW50cnktcG9pbnRzIHRvb2sgJHtkdXJhdGlvbn1zLmApKTtcbiAgICB0aGlzLmVudHJ5UG9pbnRNYW5pZmVzdC53cml0ZUVudHJ5UG9pbnRNYW5pZmVzdChiYXNlUGF0aCwgZW50cnlQb2ludHMpO1xuICAgIHJldHVybiBlbnRyeVBvaW50cztcbiAgfVxufVxuIl19