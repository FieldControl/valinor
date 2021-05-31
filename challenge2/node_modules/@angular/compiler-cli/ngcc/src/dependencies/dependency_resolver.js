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
        define("@angular/compiler-cli/ngcc/src/dependencies/dependency_resolver", ["require", "exports", "tslib", "dependency-graph", "@angular/compiler-cli/ngcc/src/packages/entry_point", "@angular/compiler-cli/ngcc/src/dependencies/dependency_host"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DependencyResolver = void 0;
    var tslib_1 = require("tslib");
    var dependency_graph_1 = require("dependency-graph");
    var entry_point_1 = require("@angular/compiler-cli/ngcc/src/packages/entry_point");
    var dependency_host_1 = require("@angular/compiler-cli/ngcc/src/dependencies/dependency_host");
    var builtinNodeJsModules = new Set(require('module').builtinModules);
    /**
     * A class that resolves dependencies between entry-points.
     */
    var DependencyResolver = /** @class */ (function () {
        function DependencyResolver(fs, logger, config, hosts, typingsHost) {
            this.fs = fs;
            this.logger = logger;
            this.config = config;
            this.hosts = hosts;
            this.typingsHost = typingsHost;
        }
        /**
         * Sort the array of entry points so that the dependant entry points always come later than
         * their dependencies in the array.
         * @param entryPoints An array entry points to sort.
         * @param target If provided, only return entry-points depended on by this entry-point.
         * @returns the result of sorting the entry points by dependency.
         */
        DependencyResolver.prototype.sortEntryPointsByDependency = function (entryPoints, target) {
            var _a = this.computeDependencyGraph(entryPoints), invalidEntryPoints = _a.invalidEntryPoints, ignoredDependencies = _a.ignoredDependencies, graph = _a.graph;
            var sortedEntryPointNodes;
            if (target) {
                if (target.compiledByAngular && graph.hasNode(target.path)) {
                    sortedEntryPointNodes = graph.dependenciesOf(target.path);
                    sortedEntryPointNodes.push(target.path);
                }
                else {
                    sortedEntryPointNodes = [];
                }
            }
            else {
                sortedEntryPointNodes = graph.overallOrder();
            }
            return {
                entryPoints: sortedEntryPointNodes
                    .map(function (path) { return graph.getNodeData(path); }),
                graph: graph,
                invalidEntryPoints: invalidEntryPoints,
                ignoredDependencies: ignoredDependencies,
            };
        };
        DependencyResolver.prototype.getEntryPointWithDependencies = function (entryPoint) {
            var dependencies = dependency_host_1.createDependencyInfo();
            if (entryPoint.compiledByAngular) {
                // Only bother to compute dependencies of entry-points that have been compiled by Angular
                var formatInfo = this.getEntryPointFormatInfo(entryPoint);
                var host = this.hosts[formatInfo.format];
                if (!host) {
                    throw new Error("Could not find a suitable format for computing dependencies of entry-point: '" + entryPoint.path + "'.");
                }
                host.collectDependencies(formatInfo.path, dependencies);
                this.typingsHost.collectDependencies(entryPoint.typings, dependencies);
            }
            return { entryPoint: entryPoint, depInfo: dependencies };
        };
        /**
         * Computes a dependency graph of the given entry-points.
         *
         * The graph only holds entry-points that ngcc cares about and whose dependencies
         * (direct and transitive) all exist.
         */
        DependencyResolver.prototype.computeDependencyGraph = function (entryPoints) {
            var _this = this;
            var invalidEntryPoints = [];
            var ignoredDependencies = [];
            var graph = new dependency_graph_1.DepGraph();
            var angularEntryPoints = entryPoints.filter(function (e) { return e.entryPoint.compiledByAngular; });
            // Add the Angular compiled entry points to the graph as nodes
            angularEntryPoints.forEach(function (e) { return graph.addNode(e.entryPoint.path, e.entryPoint); });
            // Now add the dependencies between them
            angularEntryPoints.forEach(function (_a) {
                var entryPoint = _a.entryPoint, _b = _a.depInfo, dependencies = _b.dependencies, missing = _b.missing, deepImports = _b.deepImports;
                var missingDependencies = Array.from(missing).filter(function (dep) { return !builtinNodeJsModules.has(dep); });
                if (missingDependencies.length > 0 && !entryPoint.ignoreMissingDependencies) {
                    // This entry point has dependencies that are missing
                    // so remove it from the graph.
                    removeNodes(entryPoint, missingDependencies);
                }
                else {
                    dependencies.forEach(function (dependencyPath) {
                        if (!graph.hasNode(entryPoint.path)) {
                            // The entry-point has already been identified as invalid so we don't need
                            // to do any further work on it.
                        }
                        else if (graph.hasNode(dependencyPath)) {
                            // The entry-point is still valid (i.e. has no missing dependencies) and
                            // the dependency maps to an entry point that exists in the graph so add it
                            graph.addDependency(entryPoint.path, dependencyPath);
                        }
                        else if (invalidEntryPoints.some(function (i) { return i.entryPoint.path === dependencyPath; })) {
                            // The dependency path maps to an entry-point that was previously removed
                            // from the graph, so remove this entry-point as well.
                            removeNodes(entryPoint, [dependencyPath]);
                        }
                        else {
                            // The dependency path points to a package that ngcc does not care about.
                            ignoredDependencies.push({ entryPoint: entryPoint, dependencyPath: dependencyPath });
                        }
                    });
                }
                if (deepImports.size > 0) {
                    var notableDeepImports = _this.filterIgnorableDeepImports(entryPoint, deepImports);
                    if (notableDeepImports.length > 0) {
                        var imports = notableDeepImports.map(function (i) { return "'" + i + "'"; }).join(', ');
                        _this.logger.warn("Entry point '" + entryPoint.name + "' contains deep imports into " + imports + ". " +
                            "This is probably not a problem, but may cause the compilation of entry points to be out of order.");
                    }
                }
            });
            return { invalidEntryPoints: invalidEntryPoints, ignoredDependencies: ignoredDependencies, graph: graph };
            function removeNodes(entryPoint, missingDependencies) {
                var nodesToRemove = tslib_1.__spreadArray([entryPoint.path], tslib_1.__read(graph.dependantsOf(entryPoint.path)));
                nodesToRemove.forEach(function (node) {
                    invalidEntryPoints.push({ entryPoint: graph.getNodeData(node), missingDependencies: missingDependencies });
                    graph.removeNode(node);
                });
            }
        };
        DependencyResolver.prototype.getEntryPointFormatInfo = function (entryPoint) {
            var e_1, _a;
            try {
                for (var SUPPORTED_FORMAT_PROPERTIES_1 = tslib_1.__values(entry_point_1.SUPPORTED_FORMAT_PROPERTIES), SUPPORTED_FORMAT_PROPERTIES_1_1 = SUPPORTED_FORMAT_PROPERTIES_1.next(); !SUPPORTED_FORMAT_PROPERTIES_1_1.done; SUPPORTED_FORMAT_PROPERTIES_1_1 = SUPPORTED_FORMAT_PROPERTIES_1.next()) {
                    var property = SUPPORTED_FORMAT_PROPERTIES_1_1.value;
                    var formatPath = entryPoint.packageJson[property];
                    if (formatPath === undefined)
                        continue;
                    var format = entry_point_1.getEntryPointFormat(this.fs, entryPoint, property);
                    if (format === undefined)
                        continue;
                    return { format: format, path: this.fs.resolve(entryPoint.path, formatPath) };
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (SUPPORTED_FORMAT_PROPERTIES_1_1 && !SUPPORTED_FORMAT_PROPERTIES_1_1.done && (_a = SUPPORTED_FORMAT_PROPERTIES_1.return)) _a.call(SUPPORTED_FORMAT_PROPERTIES_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            throw new Error("There is no appropriate source code format in '" + entryPoint.path + "' entry-point.");
        };
        /**
         * Filter out the deepImports that can be ignored, according to this entryPoint's config.
         */
        DependencyResolver.prototype.filterIgnorableDeepImports = function (entryPoint, deepImports) {
            var version = (entryPoint.packageJson.version || null);
            var packageConfig = this.config.getPackageConfig(entryPoint.packageName, entryPoint.packagePath, version);
            var matchers = packageConfig.ignorableDeepImportMatchers;
            return Array.from(deepImports)
                .filter(function (deepImport) { return !matchers.some(function (matcher) { return matcher.test(deepImport); }); });
        };
        return DependencyResolver;
    }());
    exports.DependencyResolver = DependencyResolver;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVwZW5kZW5jeV9yZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9uZ2NjL3NyYy9kZXBlbmRlbmNpZXMvZGVwZW5kZW5jeV9yZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgscURBQTBDO0lBSzFDLG1GQUF1SDtJQUd2SCwrRkFBbUc7SUFFbkcsSUFBTSxvQkFBb0IsR0FBRyxJQUFJLEdBQUcsQ0FBUyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUM7SUErRC9FOztPQUVHO0lBQ0g7UUFDRSw0QkFDWSxFQUFzQixFQUFVLE1BQWMsRUFBVSxNQUF5QixFQUNqRixLQUF3RCxFQUN4RCxXQUEyQjtZQUYzQixPQUFFLEdBQUYsRUFBRSxDQUFvQjtZQUFVLFdBQU0sR0FBTixNQUFNLENBQVE7WUFBVSxXQUFNLEdBQU4sTUFBTSxDQUFtQjtZQUNqRixVQUFLLEdBQUwsS0FBSyxDQUFtRDtZQUN4RCxnQkFBVyxHQUFYLFdBQVcsQ0FBZ0I7UUFBRyxDQUFDO1FBQzNDOzs7Ozs7V0FNRztRQUNILHdEQUEyQixHQUEzQixVQUE0QixXQUF5QyxFQUFFLE1BQW1CO1lBRWxGLElBQUEsS0FDRixJQUFJLENBQUMsc0JBQXNCLENBQUMsV0FBVyxDQUFDLEVBRHJDLGtCQUFrQix3QkFBQSxFQUFFLG1CQUFtQix5QkFBQSxFQUFFLEtBQUssV0FDVCxDQUFDO1lBRTdDLElBQUkscUJBQStCLENBQUM7WUFDcEMsSUFBSSxNQUFNLEVBQUU7Z0JBQ1YsSUFBSSxNQUFNLENBQUMsaUJBQWlCLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUU7b0JBQzFELHFCQUFxQixHQUFHLEtBQUssQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxD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T0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLEVBQUMsQ0FBQztpQkFDckU7Ozs7Ozs7OztZQUVELE1BQU0sSUFBSSxLQUFLLENBQ1gsb0RBQWtELFVBQVUsQ0FBQyxJQUFJLG1CQUFnQixDQUFDLENBQUM7UUFDekYsQ0FBQztRQUVEOztXQUVHO1FBQ0ssdURBQTBCLEdBQWxDLFVBQW1DLFVBQXNCLEVBQUUsV0FBZ0M7WUFFekYsSUFBTSxPQUFPLEdBQUcsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQWtCLENBQUM7WUFDMUUsSUFBTSxhQUFhLEdBQ2YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxXQUFXLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDMUYsSUFBTSxRQUFRLEdBQUcsYUFBYSxDQUFDLDJCQUEyQixDQUFDO1lBQzNELE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUM7aUJBQ3pCLE1BQU0sQ0FBQyxVQUFBLFVBQVUsSUFBSSxPQUFBLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFBLE9BQU8sSUFBSSxPQUFBLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQXhCLENBQXdCLENBQUMsRUFBbkQsQ0FBbUQsQ0FBQyxDQUFDO1FBQ2pGLENBQUM7UUFDSCx5QkFBQztJQUFELENBQUMsQUFySkQsSUFxSkM7SUFySlksZ0RBQWtCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGVwR3JhcGh9IGZyb20gJ2RlcGVuZGVuY3ktZ3JhcGgnO1xuXG5pbXBvcnQge0Fic29sdXRlRnNQYXRoLCBSZWFkb25seUZpbGVTeXN0ZW19IGZyb20gJy4uLy4uLy4uL3NyYy9uZ3RzYy9maWxlX3N5c3RlbSc7XG5pbXBvcnQge0xvZ2dlcn0gZnJvbSAnLi4vLi4vLi4vc3JjL25ndHNjL2xvZ2dpbmcnO1xuaW1wb3J0IHtOZ2NjQ29uZmlndXJhdGlvbn0gZnJvbSAnLi4vcGFja2FnZXMvY29uZmlndXJhdGlvbic7XG5pbXBvcnQge0VudHJ5UG9pbnQsIEVudHJ5UG9pbnRGb3JtYXQsIGdldEVudHJ5UG9pbnRGb3JtYXQsIFNVUFBPUlRFRF9GT1JNQVRfUFJPUEVSVElFU30gZnJvbSAnLi4vcGFja2FnZXMvZW50cnlfcG9pbnQnO1xuaW1wb3J0IHtQYXJ0aWFsbHlPcmRlcmVkTGlzdH0gZnJvbSAnLi4vdXRpbHMnO1xuXG5pbXBvcnQge2NyZWF0ZURlcGVuZGVuY3lJbmZvLCBEZXBlbmRlbmN5SG9zdCwgRW50cnlQb2ludFdpdGhEZXBlbmRlbmNpZXN9IGZyb20gJy4vZGVwZW5kZW5jeV9ob3N0JztcblxuY29uc3QgYnVpbHRpbk5vZGVKc01vZHVsZXMgPSBuZXcgU2V0PHN0cmluZz4ocmVxdWlyZSgnbW9kdWxlJykuYnVpbHRpbk1vZHVsZXMpO1xuXG4vKipcbiAqIEhvbGRzIGluZm9ybWF0aW9uIGFib3V0IGVudHJ5IHBvaW50cyB0aGF0IGFyZSByZW1vdmVkIGJlY2F1c2VcbiAqIHRoZXkgaGF2ZSBkZXBlbmRlbmNpZXMgdGhhdCBhcmUgbWlzc2luZyAoZGlyZWN0bHkgb3IgdHJhbnNpdGl2ZWx5KS5cbiAqXG4gKiBUaGlzIG1pZ2h0IG5vdCBiZSBhbiBlcnJvciwgYmVjYXVzZSBzdWNoIGFuIGVudHJ5IHBvaW50IG1pZ2h0IG5vdCBhY3R1YWxseSBiZSB1c2VkXG4gKiBpbiB0aGUgYXBwbGljYXRpb24uIElmIGl0IGlzIHVzZWQgdGhlbiB0aGUgYG5nY2AgYXBwbGljYXRpb24gY29tcGlsYXRpb24gd291bGRcbiAqIGZhaWwgYWxzbywgc28gd2UgZG9uJ3QgbmVlZCBuZ2NjIHRvIGNhdGNoIHRoaXMuXG4gKlxuICogRm9yIGV4YW1wbGUsIGNvbnNpZGVyIGFuIGFwcGxpY2F0aW9uIHRoYXQgdXNlcyB0aGUgYEBhbmd1bGFyL3JvdXRlcmAgcGFja2FnZS5cbiAqIFRoaXMgcGFja2FnZSBpbmNsdWRlcyBhbiBlbnRyeS1wb2ludCBjYWxsZWQgYEBhbmd1bGFyL3JvdXRlci91cGdyYWRlYCwgd2hpY2ggaGFzIGEgZGVwZW5kZW5jeVxuICogb24gdGhlIGBAYW5ndWxhci91cGdyYWRlYCBwYWNrYWdlLlxuICogSWYgdGhlIGFwcGxpY2F0aW9uIG5ldmVyIHVzZXMgY29kZSBmcm9tIGBAYW5ndWxhci9yb3V0ZXIvdXBncmFkZWAgdGhlbiB0aGVyZSBpcyBubyBuZWVkIGZvclxuICogYEBhbmd1bGFyL3VwZ3JhZGVgIHRvIGJlIGluc3RhbGxlZC5cbiAqIEluIHRoaXMgY2FzZSB0aGUgbmdjYyB0b29sIHNob3VsZCBqdXN0IGlnbm9yZSB0aGUgYEBhbmd1bGFyL3JvdXRlci91cGdyYWRlYCBlbmQtcG9pbnQuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSW52YWxpZEVudHJ5UG9pbnQge1xuICBlbnRyeVBvaW50OiBFbnRyeVBvaW50O1xuICBtaXNzaW5nRGVwZW5kZW5jaWVzOiBzdHJpbmdbXTtcbn1cblxuLyoqXG4gKiBIb2xkcyBpbmZvcm1hdGlvbiBhYm91dCBkZXBlbmRlbmNpZXMgb2YgYW4gZW50cnktcG9pbnQgdGhhdCBkbyBub3QgbmVlZCB0byBiZSBwcm9jZXNzZWRcbiAqIGJ5IHRoZSBuZ2NjIHRvb2wuXG4gKlxuICogRm9yIGV4YW1wbGUsIHRoZSBgcnhqc2AgcGFja2FnZSBkb2VzIG5vdCBjb250YWluIGFueSBBbmd1bGFyIGRlY29yYXRvcnMgdGhhdCBuZWVkIHRvIGJlXG4gKiBjb21waWxlZCBhbmQgc28gdGhpcyBjYW4gYmUgc2FmZWx5IGlnbm9yZWQgYnkgbmdjYy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBJZ25vcmVkRGVwZW5kZW5jeSB7XG4gIGVudHJ5UG9pbnQ6IEVudHJ5UG9pbnQ7XG4gIGRlcGVuZGVuY3lQYXRoOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGVwZW5kZW5jeURpYWdub3N0aWNzIHtcbiAgaW52YWxpZEVudHJ5UG9pbnRzOiBJbnZhbGlkRW50cnlQb2ludFtdO1xuICBpZ25vcmVkRGVwZW5kZW5jaWVzOiBJZ25vcmVkRGVwZW5kZW5jeVtdO1xufVxuXG4vKipcbiAqIFJlcHJlc2VudHMgYSBwYXJ0aWFsbHkgb3JkZXJlZCBsaXN0IG9mIGVudHJ5LXBvaW50cy5cbiAqXG4gKiBUaGUgZW50cnktcG9pbnRzJyBvcmRlci9wcmVjZWRlbmNlIGlzIHN1Y2ggdGhhdCBkZXBlbmRlbnQgZW50cnktcG9pbnRzIGFsd2F5cyBjb21lIGxhdGVyIHRoYW5cbiAqIHRoZWlyIGRlcGVuZGVuY2llcyBpbiB0aGUgbGlzdC5cbiAqXG4gKiBTZWUgYERlcGVuZGVuY3lSZXNvbHZlciNzb3J0RW50cnlQb2ludHNCeURlcGVuZGVuY3koKWAuXG4gKi9cbmV4cG9ydCB0eXBlIFBhcnRpYWxseU9yZGVyZWRFbnRyeVBvaW50cyA9IFBhcnRpYWxseU9yZGVyZWRMaXN0PEVudHJ5UG9pbnQ+O1xuXG4vKipcbiAqIEEgbGlzdCBvZiBlbnRyeS1wb2ludHMsIHNvcnRlZCBieSB0aGVpciBkZXBlbmRlbmNpZXMsIGFuZCB0aGUgZGVwZW5kZW5jeSBncmFwaC5cbiAqXG4gKiBUaGUgYGVudHJ5UG9pbnRzYCBhcnJheSB3aWxsIGJlIG9yZGVyZWQgc28gdGhhdCBubyBlbnRyeSBwb2ludCBkZXBlbmRzIHVwb24gYW4gZW50cnkgcG9pbnQgdGhhdFxuICogYXBwZWFycyBsYXRlciBpbiB0aGUgYXJyYXkuXG4gKlxuICogU29tZSBlbnRyeSBwb2ludHMgb3IgdGhlaXIgZGVwZW5kZW5jaWVzIG1heSBoYXZlIGJlZW4gaWdub3JlZC4gVGhlc2UgYXJlIGNhcHR1cmVkIGZvclxuICogZGlhZ25vc3RpYyBwdXJwb3NlcyBpbiBgaW52YWxpZEVudHJ5UG9pbnRzYCBhbmQgYGlnbm9yZWREZXBlbmRlbmNpZXNgIHJlc3BlY3RpdmVseS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTb3J0ZWRFbnRyeVBvaW50c0luZm8gZXh0ZW5kcyBEZXBlbmRlbmN5RGlhZ25vc3RpY3Mge1xuICBlbnRyeVBvaW50czogUGFydGlhbGx5T3JkZXJlZEVudHJ5UG9pbnRzO1xuICBncmFwaDogRGVwR3JhcGg8RW50cnlQb2ludD47XG59XG5cbi8qKlxuICogQSBjbGFzcyB0aGF0IHJlc29sdmVzIGRlcGVuZGVuY2llcyBiZXR3ZWVuIGVudHJ5LXBvaW50cy5cbiAqL1xuZXhwb3J0IGNsYXNzIERlcGVuZGVuY3lSZXNvbHZlciB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBmczogUmVhZG9ubHlGaWxlU3lzdGVtLCBwcml2YXRlIGxvZ2dlcjogTG9nZ2VyLCBwcml2YXRlIGNvbmZpZzogTmdjY0NvbmZpZ3VyYXRpb24sXG4gICAgICBwcml2YXRlIGhvc3RzOiBQYXJ0aWFsPFJlY29yZDxFbnRyeVBvaW50Rm9ybWF0LCBEZXBlbmRlbmN5SG9zdD4+LFxuICAgICAgcHJpdmF0ZSB0eXBpbmdzSG9zdDogRGVwZW5kZW5jeUhvc3QpIHt9XG4gIC8qKlxuICAgKiBTb3J0IHRoZSBhcnJheSBvZiBlbnRyeSBwb2ludHMgc28gdGhhdCB0aGUgZGVwZW5kYW50IGVudHJ5IHBvaW50cyBhbHdheXMgY29tZSBsYXRlciB0aGFuXG4gICAqIHRoZWlyIGRlcGVuZGVuY2llcyBpbiB0aGUgYXJyYXkuXG4gICAqIEBwYXJhbSBlbnRyeVBvaW50cyBBbiBhcnJheSBlbnRyeSBwb2ludHMgdG8gc29ydC5cbiAgICogQHBhcmFtIHRhcmdldCBJZiBwcm92aWRlZCwgb25seSByZXR1cm4gZW50cnktcG9pbnRzIGRlcGVuZGVkIG9uIGJ5IHRoaXMgZW50cnktcG9pbnQuXG4gICAqIEByZXR1cm5zIHRoZSByZXN1bHQgb2Ygc29ydGluZyB0aGUgZW50cnkgcG9pbnRzIGJ5IGRlcGVuZGVuY3kuXG4gICAqL1xuICBzb3J0RW50cnlQb2ludHNCeURlcGVuZGVuY3koZW50cnlQb2ludHM6IEVudHJ5UG9pbnRXaXRoRGVwZW5kZW5jaWVzW10sIHRhcmdldD86IEVudHJ5UG9pbnQpOlxuICAgICAgU29ydGVkRW50cnlQb2ludHNJbmZvIHtcbiAgICBjb25zdCB7aW52YWxpZEVudHJ5UG9pbnRzLCBpZ25vcmVkRGVwZW5kZW5jaWVzLCBncmFwaH0gPVxuICAgICAgICB0aGlzLmNvbXB1dGVEZXBlbmRlbmN5R3JhcGgoZW50cnlQb2ludHMpO1xuXG4gICAgbGV0IHNvcnRlZEVudHJ5UG9pbnROb2Rlczogc3RyaW5nW107XG4gICAgaWYgKHRhcmdldCkge1xuICAgICAgaWYgKHRhcmdldC5jb21waWxlZEJ5QW5ndWxhciAmJiBncmFwaC5oYXNOb2RlKHRhcmdldC5wYXRoKSkge1xuICAgICAgICBzb3J0ZWRFbnRyeVBvaW50Tm9kZXMgPSBncmFwaC5kZXBlbmRlbmNpZXNPZih0YXJnZXQucGF0aCk7XG4gICAgICAgIHNvcnRlZEVudHJ5UG9pbnROb2Rlcy5wdXNoKHRhcmdldC5wYXRoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNvcnRlZEVudHJ5UG9pbnROb2RlcyA9IFtdO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBzb3J0ZWRFbnRyeVBvaW50Tm9kZXMgPSBncmFwaC5vdmVyYWxsT3JkZXIoKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgZW50cnlQb2ludHM6IChzb3J0ZWRFbnRyeVBvaW50Tm9kZXMgYXMgUGFydGlhbGx5T3JkZXJlZExpc3Q8c3RyaW5nPilcbiAgICAgICAgICAgICAgICAgICAgICAgLm1hcChwYXRoID0+IGdyYXBoLmdldE5vZGVEYXRhKHBhdGgpKSxcbiAgICAgIGdyYXBoLFxuICAgICAgaW52YWxpZEVudHJ5UG9pbnRzLFxuICAgICAgaWdub3JlZERlcGVuZGVuY2llcyxcbiAgICB9O1xuICB9XG5cbiAgZ2V0RW50cnlQb2ludFdpdGhEZXBlbmRlbmNpZXMoZW50cnlQb2ludDogRW50cnlQb2ludCk6IEVudHJ5UG9pbnRXaXRoRGVwZW5kZW5jaWVzIHtcbiAgICBjb25zdCBkZXBlbmRlbmNpZXMgPSBjcmVhdGVEZXBlbmRlbmN5SW5mbygpO1xuICAgIGlmIChlbnRyeVBvaW50LmNvbXBpbGVkQnlBbmd1bGFyKSB7XG4gICAgICAvLyBPbmx5IGJvdGhlciB0byBjb21wdXRlIGRlcGVuZGVuY2llcyBvZiBlbnRyeS1wb2ludHMgdGhhdCBoYXZlIGJlZW4gY29tcGlsZWQgYnkgQW5ndWxhclxuICAgICAgY29uc3QgZm9ybWF0SW5mbyA9IHRoaXMuZ2V0RW50cnlQb2ludEZvcm1hdEluZm8oZW50cnlQb2ludCk7XG4gICAgICBjb25zdCBob3N0ID0gdGhpcy5ob3N0c1tmb3JtYXRJbmZvLmZvcm1hdF07XG4gICAgICBpZiAoIWhvc3QpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYENvdWxkIG5vdCBmaW5kIGEgc3VpdGFibGUgZm9ybWF0IGZvciBjb21wdXRpbmcgZGVwZW5kZW5jaWVzIG9mIGVudHJ5LXBvaW50OiAnJHtcbiAgICAgICAgICAgICAgICBlbnRyeVBvaW50LnBhdGh9Jy5gKTtcbiAgICAgIH1cbiAgICAgIGhvc3QuY29sbGVjdERlcGVuZGVuY2llcyhmb3JtYXRJbmZvLnBhdGgsIGRlcGVuZGVuY2llcyk7XG4gICAgICB0aGlzLnR5cGluZ3NIb3N0LmNvbGxlY3REZXBlbmRlbmNpZXMoZW50cnlQb2ludC50eXBpbmdzLCBkZXBlbmRlbmNpZXMpO1xuICAgIH1cbiAgICByZXR1cm4ge2VudHJ5UG9pbnQsIGRlcEluZm86IGRlcGVuZGVuY2llc307XG4gIH1cblxuICAvKipcbiAgICogQ29tcHV0ZXMgYSBkZXBlbmRlbmN5IGdyYXBoIG9mIHRoZSBnaXZlbiBlbnRyeS1wb2ludHMuXG4gICAqXG4gICAqIFRoZSBncmFwaCBvbmx5IGhvbGRzIGVudHJ5LXBvaW50cyB0aGF0IG5nY2MgY2FyZXMgYWJvdXQgYW5kIHdob3NlIGRlcGVuZGVuY2llc1xuICAgKiAoZGlyZWN0IGFuZCB0cmFuc2l0aXZlKSBhbGwgZXhpc3QuXG4gICAqL1xuICBwcml2YXRlIGNvbXB1dGVEZXBlbmRlbmN5R3JhcGgoZW50cnlQb2ludHM6IEVudHJ5UG9pbnRXaXRoRGVwZW5kZW5jaWVzW10pOiBEZXBlbmRlbmN5R3JhcGgge1xuICAgIGNvbnN0IGludmFsaWRFbnRyeVBvaW50czogSW52YWxpZEVudHJ5UG9pbnRbXSA9IFtdO1xuICAgIGNvbnN0IGlnbm9yZWREZXBlbmRlbmNpZXM6IElnbm9yZWREZXBlbmRlbmN5W10gPSBbXTtcbiAgICBjb25zdCBncmFwaCA9IG5ldyBEZXBHcmFwaDxFbnRyeVBvaW50PigpO1xuXG4gICAgY29uc3QgYW5ndWxhckVudHJ5UG9pbnRzID0gZW50cnlQb2ludHMuZmlsdGVyKGUgPT4gZS5lbnRyeVBvaW50LmNvbXBpbGVkQnlBbmd1bGFyKTtcblxuICAgIC8vIEFkZCB0aGUgQW5ndWxhciBjb21waWxlZCBlbnRyeSBwb2ludHMgdG8gdGhlIGdyYXBoIGFzIG5vZGVzXG4gICAgYW5ndWxhckVudHJ5UG9pbnRzLmZvckVhY2goZSA9PiBncmFwaC5hZGROb2RlKGUuZW50cnlQb2ludC5wYXRoLCBlLmVudHJ5UG9pbnQpKTtcblxuICAgIC8vIE5vdyBhZGQgdGhlIGRlcGVuZGVuY2llcyBiZXR3ZWVuIHRoZW1cbiAgICBhbmd1bGFyRW50cnlQb2ludHMuZm9yRWFjaCgoe2VudHJ5UG9pbnQsIGRlcEluZm86IHtkZXBlbmRlbmNpZXMsIG1pc3NpbmcsIGRlZXBJbXBvcnRzfX0pID0+IHtcbiAgICAgIGNvbnN0IG1pc3NpbmdEZXBlbmRlbmNpZXMgPSBBcnJheS5mcm9tKG1pc3NpbmcpLmZpbHRlcihkZXAgPT4gIWJ1aWx0aW5Ob2RlSnNNb2R1bGVzLmhhcyhkZXApKTtcblxuICAgICAgaWYgKG1pc3NpbmdEZXBlbmRlbmNpZXMubGVuZ3RoID4gMCAmJiAhZW50cnlQb2ludC5pZ25vcmVNaXNzaW5nRGVwZW5kZW5jaWVzKSB7XG4gICAgICAgIC8vIFRoaXMgZW50cnkgcG9pbnQgaGFzIGRlcGVuZGVuY2llcyB0aGF0IGFyZSBtaXNzaW5nXG4gICAgICAgIC8vIHNvIHJlbW92ZSBpdCBmcm9tIHRoZSBncmFwaC5cbiAgICAgICAgcmVtb3ZlTm9kZXMoZW50cnlQb2ludCwgbWlzc2luZ0RlcGVuZGVuY2llcyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkZXBlbmRlbmNpZXMuZm9yRWFjaChkZXBlbmRlbmN5UGF0aCA9PiB7XG4gICAgICAgICAgaWYgKCFncmFwaC5oYXNOb2RlKGVudHJ5UG9pbnQucGF0aCkpIHtcbiAgICAgICAgICAgIC8vIFRoZSBlbnRyeS1wb2ludCBoYXMgYWxyZWFkeSBiZWVuIGlkZW50aWZpZWQgYXMgaW52YWxpZCBzbyB3ZSBkb24ndCBuZWVkXG4gICAgICAgICAgICAvLyB0byBkbyBhbnkgZnVydGhlciB3b3JrIG9uIGl0LlxuICAgICAgICAgIH0gZWxzZSBpZiAoZ3JhcGguaGFzTm9kZShkZXBlbmRlbmN5UGF0aCkpIHtcbiAgICAgICAgICAgIC8vIFRoZSBlbnRyeS1wb2ludCBpcyBzdGlsbCB2YWxpZCAoaS5lLiBoYXMgbm8gbWlzc2luZyBkZXBlbmRlbmNpZXMpIGFuZFxuICAgICAgICAgICAgLy8gdGhlIGRlcGVuZGVuY3kgbWFwcyB0byBhbiBlbnRyeSBwb2ludCB0aGF0IGV4aXN0cyBpbiB0aGUgZ3JhcGggc28gYWRkIGl0XG4gICAgICAgICAgICBncmFwaC5hZGREZXBlbmRlbmN5KGVudHJ5UG9pbnQucGF0aCwgZGVwZW5kZW5jeVBhdGgpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoaW52YWxpZEVudHJ5UG9pbnRzLnNvbWUoaSA9PiBpLmVudHJ5UG9pbnQucGF0aCA9PT0gZGVwZW5kZW5jeVBhdGgpKSB7XG4gICAgICAgICAgICAvLyBUaGUgZGVwZW5kZW5jeSBwYXRoIG1hcHMgdG8gYW4gZW50cnktcG9pbnQgdGhhdCB3YXMgcHJldmlvdXNseSByZW1vdmVkXG4gICAgICAgICAgICAvLyBmcm9tIHRoZSBncmFwaCwgc28gcmVtb3ZlIHRoaXMgZW50cnktcG9pbnQgYXMgd2VsbC5cbiAgICAgICAgICAgIHJlbW92ZU5vZGVzKGVudHJ5UG9pbnQsIFtkZXBlbmRlbmN5UGF0aF0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBUaGUgZGVwZW5kZW5jeSBwYXRoIHBvaW50cyB0byBhIHBhY2thZ2UgdGhhdCBuZ2NjIGRvZXMgbm90IGNhcmUgYWJvdXQuXG4gICAgICAgICAgICBpZ25vcmVkRGVwZW5kZW5jaWVzLnB1c2goe2VudHJ5UG9pbnQsIGRlcGVuZGVuY3lQYXRofSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgaWYgKGRlZXBJbXBvcnRzLnNpemUgPiAwKSB7XG4gICAgICAgIGNvbnN0IG5vdGFibGVEZWVwSW1wb3J0cyA9IHRoaXMuZmlsdGVySWdub3JhYmxlRGVlcEltcG9ydHMoZW50cnlQb2ludCwgZGVlcEltcG9ydHMpO1xuICAgICAgICBpZiAobm90YWJsZURlZXBJbXBvcnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBjb25zdCBpbXBvcnRzID0gbm90YWJsZURlZXBJbXBvcnRzLm1hcChpID0+IGAnJHtpfSdgKS5qb2luKCcsICcpO1xuICAgICAgICAgIHRoaXMubG9nZ2VyLndhcm4oXG4gICAgICAgICAgICAgIGBFbnRyeSBwb2ludCAnJHtlbnRyeVBvaW50Lm5hbWV9JyBjb250YWlucyBkZWVwIGltcG9ydHMgaW50byAke2ltcG9ydHN9LiBgICtcbiAgICAgICAgICAgICAgYFRoaXMgaXMgcHJvYmFibHkgbm90IGEgcHJvYmxlbSwgYnV0IG1heSBjYXVzZSB0aGUgY29tcGlsYXRpb24gb2YgZW50cnkgcG9pbnRzIHRvIGJlIG91dCBvZiBvcmRlci5gKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHtpbnZhbGlkRW50cnlQb2ludHMsIGlnbm9yZWREZXBlbmRlbmNpZXMsIGdyYXBofTtcblxuICAgIGZ1bmN0aW9uIHJlbW92ZU5vZGVzKGVudHJ5UG9pbnQ6IEVudHJ5UG9pbnQsIG1pc3NpbmdEZXBlbmRlbmNpZXM6IHN0cmluZ1tdKSB7XG4gICAgICBjb25zdCBub2Rlc1RvUmVtb3ZlID0gW2VudHJ5UG9pbnQucGF0aCwgLi4uZ3JhcGguZGVwZW5kYW50c09mKGVudHJ5UG9pbnQucGF0aCldO1xuICAgICAgbm9kZXNUb1JlbW92ZS5mb3JFYWNoKG5vZGUgPT4ge1xuICAgICAgICBpbnZhbGlkRW50cnlQb2ludHMucHVzaCh7ZW50cnlQb2ludDogZ3JhcGguZ2V0Tm9kZURhdGEobm9kZSksIG1pc3NpbmdEZXBlbmRlbmNpZXN9KTtcbiAgICAgICAgZ3JhcGgucmVtb3ZlTm9kZShub2RlKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgZ2V0RW50cnlQb2ludEZvcm1hdEluZm8oZW50cnlQb2ludDogRW50cnlQb2ludCk6XG4gICAgICB7Zm9ybWF0OiBFbnRyeVBvaW50Rm9ybWF0LCBwYXRoOiBBYnNvbHV0ZUZzUGF0aH0ge1xuICAgIGZvciAoY29uc3QgcHJvcGVydHkgb2YgU1VQUE9SVEVEX0ZPUk1BVF9QUk9QRVJUSUVTKSB7XG4gICAgICBjb25zdCBmb3JtYXRQYXRoID0gZW50cnlQb2ludC5wYWNrYWdlSnNvbltwcm9wZXJ0eV07XG4gICAgICBpZiAoZm9ybWF0UGF0aCA9PT0gdW5kZWZpbmVkKSBjb250aW51ZTtcblxuICAgICAgY29uc3QgZm9ybWF0ID0gZ2V0RW50cnlQb2ludEZvcm1hdCh0aGlzLmZzLCBlbnRyeVBvaW50LCBwcm9wZXJ0eSk7XG4gICAgICBpZiAoZm9ybWF0ID09PSB1bmRlZmluZWQpIGNvbnRpbnVlO1xuXG4gICAgICByZXR1cm4ge2Zvcm1hdCwgcGF0aDogdGhpcy5mcy5yZXNvbHZlKGVudHJ5UG9pbnQucGF0aCwgZm9ybWF0UGF0aCl9O1xuICAgIH1cblxuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYFRoZXJlIGlzIG5vIGFwcHJvcHJpYXRlIHNvdXJjZSBjb2RlIGZvcm1hdCBpbiAnJHtlbnRyeVBvaW50LnBhdGh9JyBlbnRyeS1wb2ludC5gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGaWx0ZXIgb3V0IHRoZSBkZWVwSW1wb3J0cyB0aGF0IGNhbiBiZSBpZ25vcmVkLCBhY2NvcmRpbmcgdG8gdGhpcyBlbnRyeVBvaW50J3MgY29uZmlnLlxuICAgKi9cbiAgcHJpdmF0ZSBmaWx0ZXJJZ25vcmFibGVEZWVwSW1wb3J0cyhlbnRyeVBvaW50OiBFbnRyeVBvaW50LCBkZWVwSW1wb3J0czogU2V0PEFic29sdXRlRnNQYXRoPik6XG4gICAgICBBYnNvbHV0ZUZzUGF0aFtdIHtcbiAgICBjb25zdCB2ZXJzaW9uID0gKGVudHJ5UG9pbnQucGFja2FnZUpzb24udmVyc2lvbiB8fCBudWxsKSBhcyBzdHJpbmcgfCBudWxsO1xuICAgIGNvbnN0IHBhY2thZ2VDb25maWcgPVxuICAgICAgICB0aGlzLmNvbmZpZy5nZXRQYWNrYWdlQ29uZmlnKGVudHJ5UG9pbnQucGFja2FnZU5hbWUsIGVudHJ5UG9pbnQucGFja2FnZVBhdGgsIHZlcnNpb24pO1xuICAgIGNvbnN0IG1hdGNoZXJzID0gcGFja2FnZUNvbmZpZy5pZ25vcmFibGVEZWVwSW1wb3J0TWF0Y2hlcnM7XG4gICAgcmV0dXJuIEFycmF5LmZyb20oZGVlcEltcG9ydHMpXG4gICAgICAgIC5maWx0ZXIoZGVlcEltcG9ydCA9PiAhbWF0Y2hlcnMuc29tZShtYXRjaGVyID0+IG1hdGNoZXIudGVzdChkZWVwSW1wb3J0KSkpO1xuICB9XG59XG5cbmludGVyZmFjZSBEZXBlbmRlbmN5R3JhcGggZXh0ZW5kcyBEZXBlbmRlbmN5RGlhZ25vc3RpY3Mge1xuICBncmFwaDogRGVwR3JhcGg8RW50cnlQb2ludD47XG59XG4iXX0=