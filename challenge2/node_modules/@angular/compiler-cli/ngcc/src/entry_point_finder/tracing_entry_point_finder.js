(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/entry_point_finder/tracing_entry_point_finder", ["require", "exports", "@angular/compiler-cli/ngcc/src/entry_point_finder/utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TracingEntryPointFinder = void 0;
    var utils_1 = require("@angular/compiler-cli/ngcc/src/entry_point_finder/utils");
    /**
     * An EntryPointFinder that starts from a set of initial files and only returns entry-points that
     * are dependencies of these files.
     *
     * This is faster than processing all entry-points in the entire file-system, and is used primarily
     * by the CLI integration.
     *
     * There are two concrete implementations of this class.
     *
     * * `TargetEntryPointFinder` - is given a single entry-point as the initial entry-point. This can
     *   be used in the synchronous CLI integration where the build tool has identified an external
     *   import to one of the source files being built.
     * * `ProgramBasedEntryPointFinder` - computes the initial entry-points from the source files
     *   computed from a `tsconfig.json` file. This can be used in the asynchronous CLI integration
     *   where the `tsconfig.json` to be used to do the build is known.
     */
    var TracingEntryPointFinder = /** @class */ (function () {
        function TracingEntryPointFinder(fs, config, logger, resolver, basePath, pathMappings) {
            this.fs = fs;
            this.config = config;
            this.logger = logger;
            this.resolver = resolver;
            this.basePath = basePath;
            this.pathMappings = pathMappings;
            this.basePaths = null;
        }
        /**
         * Search for Angular package entry-points.
         */
        TracingEntryPointFinder.prototype.findEntryPoints = function () {
            var unsortedEntryPoints = new Map();
            var unprocessedPaths = this.getInitialEntryPointPaths();
            while (unprocessedPaths.length > 0) {
                var path = unprocessedPaths.shift();
                var entryPointWithDeps = this.getEntryPointWithDeps(path);
                if (entryPointWithDeps === null) {
                    continue;
                }
                unsortedEntryPoints.set(entryPointWithDeps.entryPoint.path, entryPointWithDeps);
                entryPointWithDeps.depInfo.dependencies.forEach(function (dep) {
                    if (!unsortedEntryPoints.has(dep)) {
                        unprocessedPaths.push(dep);
                    }
                });
            }
            return this.resolver.sortEntryPointsByDependency(Array.from(unsortedEntryPoints.values()));
        };
        /**
         * Parse the path-mappings to compute the base-paths that need to be considered when finding
         * entry-points.
         *
         * This processing can be time-consuming if the path-mappings are complex or extensive.
         * So the result is cached locally once computed.
         */
        TracingEntryPointFinder.prototype.getBasePaths = function () {
            if (this.basePaths === null) {
                this.basePaths = utils_1.getBasePaths(this.logger, this.basePath, this.pathMappings);
            }
            return this.basePaths;
        };
        return TracingEntryPointFinder;
    }());
    exports.TracingEntryPointFinder = TracingEntryPointFinder;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhY2luZ19lbnRyeV9wb2ludF9maW5kZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvbmdjYy9zcmMvZW50cnlfcG9pbnRfZmluZGVyL3RyYWNpbmdfZW50cnlfcG9pbnRfZmluZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztJQWVBLGlGQUFxQztJQUVyQzs7Ozs7Ozs7Ozs7Ozs7O09BZUc7SUFDSDtRQUdFLGlDQUNjLEVBQXNCLEVBQVksTUFBeUIsRUFDM0QsTUFBYyxFQUFZLFFBQTRCLEVBQ3RELFFBQXdCLEVBQVksWUFBb0M7WUFGeEUsT0FBRSxHQUFGLEVBQUUsQ0FBb0I7WUFBWSxXQUFNLEdBQU4sTUFBTSxDQUFtQjtZQUMzRCxXQUFNLEdBQU4sTUFBTSxDQUFRO1lBQVksYUFBUSxHQUFSLFFBQVEsQ0FBb0I7WUFDdEQsYUFBUSxHQUFSLFFBQVEsQ0FBZ0I7WUFBWSxpQkFBWSxHQUFaLFlBQVksQ0FBd0I7WUFMOUUsY0FBUyxHQUEwQixJQUFJLENBQUM7UUFLeUMsQ0FBQztRQUUxRjs7V0FFRztRQUNILGlEQUFlLEdBQWY7WUFDRSxJQUFNLG1CQUFtQixHQUFHLElBQUksR0FBRyxFQUE4QyxDQUFDO1lBQ2xGLElBQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixFQUFFLENBQUM7WUFDMUQsT0FBTyxnQkFBZ0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUNsQyxJQUFNLElBQUksR0FBRyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUcsQ0FBQztnQkFDdkMsSUFBTSxrQkFBa0IsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzVELElBQUksa0JBQWtCLEtBQUssSUFBSSxFQUFFO29CQUMvQixTQUFTO2lCQUNWO2dCQUNELG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLGtCQUFrQixDQUFDLENBQUM7Z0JBQ2hGLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLFVBQUEsR0FBRztvQkFDakQsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRTt3QkFDakMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO3FCQUM1QjtnQkFDSCxDQUFDLENBQUMsQ0FBQzthQUNKO1lBQ0QsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLDJCQUEyQixDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzdGLENBQUM7UUFzQkQ7Ozs7OztXQU1HO1FBQ08sOENBQVksR0FBdEI7WUFDRSxJQUFJLElBQUksQ0FBQyxTQUFTLEtBQUssSUFBSSxFQUFFO2dCQUMzQixJQUFJLENBQUMsU0FBUyxHQUFHLG9CQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQzthQUM5RTtZQUNELE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUN4QixDQUFDO1FBQ0gsOEJBQUM7SUFBRCxDQUFDLEFBL0RELElBK0RDO0lBL0RxQiwwREFBdUIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7QWJzb2x1dGVGc1BhdGgsIFBhdGhNYW5pcHVsYXRpb24sIFJlYWRvbmx5RmlsZVN5c3RlbX0gZnJvbSAnLi4vLi4vLi4vc3JjL25ndHNjL2ZpbGVfc3lzdGVtJztcbmltcG9ydCB7TG9nZ2VyfSBmcm9tICcuLi8uLi8uLi9zcmMvbmd0c2MvbG9nZ2luZyc7XG5pbXBvcnQge0VudHJ5UG9pbnRXaXRoRGVwZW5kZW5jaWVzfSBmcm9tICcuLi9kZXBlbmRlbmNpZXMvZGVwZW5kZW5jeV9ob3N0JztcbmltcG9ydCB7RGVwZW5kZW5jeVJlc29sdmVyLCBTb3J0ZWRFbnRyeVBvaW50c0luZm99IGZyb20gJy4uL2RlcGVuZGVuY2llcy9kZXBlbmRlbmN5X3Jlc29sdmVyJztcbmltcG9ydCB7TmdjY0NvbmZpZ3VyYXRpb259IGZyb20gJy4uL3BhY2thZ2VzL2NvbmZpZ3VyYXRpb24nO1xuaW1wb3J0IHtQYXRoTWFwcGluZ3N9IGZyb20gJy4uL3BhdGhfbWFwcGluZ3MnO1xuXG5pbXBvcnQge0VudHJ5UG9pbnRGaW5kZXJ9IGZyb20gJy4vaW50ZXJmYWNlJztcbmltcG9ydCB7Z2V0QmFzZVBhdGhzfSBmcm9tICcuL3V0aWxzJztcblxuLyoqXG4gKiBBbiBFbnRyeVBvaW50RmluZGVyIHRoYXQgc3RhcnRzIGZyb20gYSBzZXQgb2YgaW5pdGlhbCBmaWxlcyBhbmQgb25seSByZXR1cm5zIGVudHJ5LXBvaW50cyB0aGF0XG4gKiBhcmUgZGVwZW5kZW5jaWVzIG9mIHRoZXNlIGZpbGVzLlxuICpcbiAqIFRoaXMgaXMgZmFzdGVyIHRoYW4gcHJvY2Vzc2luZyBhbGwgZW50cnktcG9pbnRzIGluIHRoZSBlbnRpcmUgZmlsZS1zeXN0ZW0sIGFuZCBpcyB1c2VkIHByaW1hcmlseVxuICogYnkgdGhlIENMSSBpbnRlZ3JhdGlvbi5cbiAqXG4gKiBUaGVyZSBhcmUgdHdvIGNvbmNyZXRlIGltcGxlbWVudGF0aW9ucyBvZiB0aGlzIGNsYXNzLlxuICpcbiAqICogYFRhcmdldEVudHJ5UG9pbnRGaW5kZXJgIC0gaXMgZ2l2ZW4gYSBzaW5nbGUgZW50cnktcG9pbnQgYXMgdGhlIGluaXRpYWwgZW50cnktcG9pbnQuIFRoaXMgY2FuXG4gKiAgIGJlIHVzZWQgaW4gdGhlIHN5bmNocm9ub3VzIENMSSBpbnRlZ3JhdGlvbiB3aGVyZSB0aGUgYnVpbGQgdG9vbCBoYXMgaWRlbnRpZmllZCBhbiBleHRlcm5hbFxuICogICBpbXBvcnQgdG8gb25lIG9mIHRoZSBzb3VyY2UgZmlsZXMgYmVpbmcgYnVpbHQuXG4gKiAqIGBQcm9ncmFtQmFzZWRFbnRyeVBvaW50RmluZGVyYCAtIGNvbXB1dGVzIHRoZSBpbml0aWFsIGVudHJ5LXBvaW50cyBmcm9tIHRoZSBzb3VyY2UgZmlsZXNcbiAqICAgY29tcHV0ZWQgZnJvbSBhIGB0c2NvbmZpZy5qc29uYCBmaWxlLiBUaGlzIGNhbiBiZSB1c2VkIGluIHRoZSBhc3luY2hyb25vdXMgQ0xJIGludGVncmF0aW9uXG4gKiAgIHdoZXJlIHRoZSBgdHNjb25maWcuanNvbmAgdG8gYmUgdXNlZCB0byBkbyB0aGUgYnVpbGQgaXMga25vd24uXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBUcmFjaW5nRW50cnlQb2ludEZpbmRlciBpbXBsZW1lbnRzIEVudHJ5UG9pbnRGaW5kZXIge1xuICBwcml2YXRlIGJhc2VQYXRoczogQWJzb2x1dGVGc1BhdGhbXXxudWxsID0gbnVsbDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByb3RlY3RlZCBmczogUmVhZG9ubHlGaWxlU3lzdGVtLCBwcm90ZWN0ZWQgY29uZmlnOiBOZ2NjQ29uZmlndXJhdGlvbixcbiAgICAgIHByb3RlY3RlZCBsb2dnZXI6IExvZ2dlciwgcHJvdGVjdGVkIHJlc29sdmVyOiBEZXBlbmRlbmN5UmVzb2x2ZXIsXG4gICAgICBwcm90ZWN0ZWQgYmFzZVBhdGg6IEFic29sdXRlRnNQYXRoLCBwcm90ZWN0ZWQgcGF0aE1hcHBpbmdzOiBQYXRoTWFwcGluZ3N8dW5kZWZpbmVkKSB7fVxuXG4gIC8qKlxuICAgKiBTZWFyY2ggZm9yIEFuZ3VsYXIgcGFja2FnZSBlbnRyeS1wb2ludHMuXG4gICAqL1xuICBmaW5kRW50cnlQb2ludHMoKTogU29ydGVkRW50cnlQb2ludHNJbmZvIHtcbiAgICBjb25zdCB1bnNvcnRlZEVudHJ5UG9pbnRzID0gbmV3IE1hcDxBYnNvbHV0ZUZzUGF0aCwgRW50cnlQb2ludFdpdGhEZXBlbmRlbmNpZXM+KCk7XG4gICAgY29uc3QgdW5wcm9jZXNzZWRQYXRocyA9IHRoaXMuZ2V0SW5pdGlhbEVudHJ5UG9pbnRQYXRocygpO1xuICAgIHdoaWxlICh1bnByb2Nlc3NlZFBhdGhzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IHBhdGggPSB1bnByb2Nlc3NlZFBhdGhzLnNoaWZ0KCkhO1xuICAgICAgY29uc3QgZW50cnlQb2ludFdpdGhEZXBzID0gdGhpcy5nZXRFbnRyeVBvaW50V2l0aERlcHMocGF0aCk7XG4gICAgICBpZiAoZW50cnlQb2ludFdpdGhEZXBzID09PSBudWxsKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgdW5zb3J0ZWRFbnRyeVBvaW50cy5zZXQoZW50cnlQb2ludFdpdGhEZXBzLmVudHJ5UG9pbnQucGF0aCwgZW50cnlQb2ludFdpdGhEZXBzKTtcbiAgICAgIGVudHJ5UG9pbnRXaXRoRGVwcy5kZXBJbmZvLmRlcGVuZGVuY2llcy5mb3JFYWNoKGRlcCA9PiB7XG4gICAgICAgIGlmICghdW5zb3J0ZWRFbnRyeVBvaW50cy5oYXMoZGVwKSkge1xuICAgICAgICAgIHVucHJvY2Vzc2VkUGF0aHMucHVzaChkZXApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucmVzb2x2ZXIuc29ydEVudHJ5UG9pbnRzQnlEZXBlbmRlbmN5KEFycmF5LmZyb20odW5zb3J0ZWRFbnRyeVBvaW50cy52YWx1ZXMoKSkpO1xuICB9XG5cblxuICAvKipcbiAgICogUmV0dXJuIGFuIGFycmF5IG9mIGVudHJ5LXBvaW50IHBhdGhzIGZyb20gd2hpY2ggdG8gc3RhcnQgdGhlIHRyYWNlLlxuICAgKi9cbiAgcHJvdGVjdGVkIGFic3RyYWN0IGdldEluaXRpYWxFbnRyeVBvaW50UGF0aHMoKTogQWJzb2x1dGVGc1BhdGhbXTtcblxuICAvKipcbiAgICogRm9yIHRoZSBnaXZlbiBgZW50cnlQb2ludFBhdGhgLCBjb21wdXRlLCBvciByZXRyaWV2ZSwgdGhlIGVudHJ5LXBvaW50IGluZm9ybWF0aW9uLCBpbmNsdWRpbmdcbiAgICogcGF0aHMgdG8gb3RoZXIgZW50cnktcG9pbnRzIHRoYXQgdGhpcyBlbnRyeS1wb2ludCBkZXBlbmRzIHVwb24uXG4gICAqXG4gICAqIEBwYXJhbSBlbnRyeVBvaW50UGF0aCB0aGUgcGF0aCB0byB0aGUgZW50cnktcG9pbnQgd2hvc2UgaW5mb3JtYXRpb24gYW5kIGRlcGVuZGVuY2llcyBhcmUgdG8gYmVcbiAgICogICAgIHJldHJpZXZlZCBvciBjb21wdXRlZC5cbiAgICpcbiAgICogQHJldHVybnMgdGhlIGVudHJ5LXBvaW50IGFuZCBpdHMgZGVwZW5kZW5jaWVzIG9yIGBudWxsYCBpZiB0aGUgZW50cnktcG9pbnQgaXMgbm90IGNvbXBpbGVkIGJ5XG4gICAqICAgICBBbmd1bGFyIG9yIGNhbm5vdCBiZSBkZXRlcm1pbmVkLlxuICAgKi9cbiAgcHJvdGVjdGVkIGFic3RyYWN0IGdldEVudHJ5UG9pbnRXaXRoRGVwcyhlbnRyeVBvaW50UGF0aDogQWJzb2x1dGVGc1BhdGgpOlxuICAgICAgRW50cnlQb2ludFdpdGhEZXBlbmRlbmNpZXN8bnVsbDtcblxuXG4gIC8qKlxuICAgKiBQYXJzZSB0aGUgcGF0aC1tYXBwaW5ncyB0byBjb21wdXRlIHRoZSBiYXNlLXBhdGhzIHRoYXQgbmVlZCB0byBiZSBjb25zaWRlcmVkIHdoZW4gZmluZGluZ1xuICAgKiBlbnRyeS1wb2ludHMuXG4gICAqXG4gICAqIFRoaXMgcHJvY2Vzc2luZyBjYW4gYmUgdGltZS1jb25zdW1pbmcgaWYgdGhlIHBhdGgtbWFwcGluZ3MgYXJlIGNvbXBsZXggb3IgZXh0ZW5zaXZlLlxuICAgKiBTbyB0aGUgcmVzdWx0IGlzIGNhY2hlZCBsb2NhbGx5IG9uY2UgY29tcHV0ZWQuXG4gICAqL1xuICBwcm90ZWN0ZWQgZ2V0QmFzZVBhdGhzKCkge1xuICAgIGlmICh0aGlzLmJhc2VQYXRocyA9PT0gbnVsbCkge1xuICAgICAgdGhpcy5iYXNlUGF0aHMgPSBnZXRCYXNlUGF0aHModGhpcy5sb2dnZXIsIHRoaXMuYmFzZVBhdGgsIHRoaXMucGF0aE1hcHBpbmdzKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuYmFzZVBhdGhzO1xuICB9XG59XG4iXX0=