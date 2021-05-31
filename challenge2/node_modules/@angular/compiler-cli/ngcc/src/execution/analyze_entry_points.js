(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/execution/analyze_entry_points", ["require", "exports", "tslib", "@angular/compiler-cli/ngcc/src/execution/tasks/queues/parallel_task_queue", "@angular/compiler-cli/ngcc/src/execution/tasks/queues/serial_task_queue", "@angular/compiler-cli/ngcc/src/execution/tasks/utils", "@angular/compiler-cli/ngcc/src/packages/build_marker", "@angular/compiler-cli/ngcc/src/packages/entry_point", "@angular/compiler-cli/ngcc/src/writing/cleaning/package_cleaner", "@angular/compiler-cli/ngcc/src/execution/tasks/api"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getAnalyzeEntryPointsFn = void 0;
    var tslib_1 = require("tslib");
    var parallel_task_queue_1 = require("@angular/compiler-cli/ngcc/src/execution/tasks/queues/parallel_task_queue");
    var serial_task_queue_1 = require("@angular/compiler-cli/ngcc/src/execution/tasks/queues/serial_task_queue");
    var utils_1 = require("@angular/compiler-cli/ngcc/src/execution/tasks/utils");
    var build_marker_1 = require("@angular/compiler-cli/ngcc/src/packages/build_marker");
    var entry_point_1 = require("@angular/compiler-cli/ngcc/src/packages/entry_point");
    var package_cleaner_1 = require("@angular/compiler-cli/ngcc/src/writing/cleaning/package_cleaner");
    var api_1 = require("@angular/compiler-cli/ngcc/src/execution/tasks/api");
    /**
     * Create the function for performing the analysis of the entry-points.
     */
    function getAnalyzeEntryPointsFn(logger, finder, fileSystem, supportedPropertiesToConsider, typingsOnly, compileAllFormats, propertiesToConsider, inParallel) {
        return function () {
            var e_1, _a, e_2, _b;
            logger.debug('Analyzing entry-points...');
            var startTime = Date.now();
            var entryPointInfo = finder.findEntryPoints();
            var cleaned = package_cleaner_1.cleanOutdatedPackages(fileSystem, entryPointInfo.entryPoints);
            if (cleaned) {
                // If we had to clean up one or more packages then we must read in the entry-points again.
                entryPointInfo = finder.findEntryPoints();
            }
            var entryPoints = entryPointInfo.entryPoints, invalidEntryPoints = entryPointInfo.invalidEntryPoints, graph = entryPointInfo.graph;
            logInvalidEntryPoints(logger, invalidEntryPoints);
            var unprocessableEntryPointPaths = [];
            // The tasks are partially ordered by virtue of the entry-points being partially ordered too.
            var tasks = [];
            try {
                for (var entryPoints_1 = tslib_1.__values(entryPoints), entryPoints_1_1 = entryPoints_1.next(); !entryPoints_1_1.done; entryPoints_1_1 = entryPoints_1.next()) {
                    var entryPoint = entryPoints_1_1.value;
                    var packageJson = entryPoint.packageJson;
                    var _c = getPropertiesToProcess(packageJson, supportedPropertiesToConsider, compileAllFormats, typingsOnly), propertiesToProcess = _c.propertiesToProcess, equivalentPropertiesMap = _c.equivalentPropertiesMap;
                    if (propertiesToProcess.length === 0) {
                        // This entry-point is unprocessable (i.e. there is no format property that is of interest
                        // and can be processed). This will result in an error, but continue looping over
                        // entry-points in order to collect all unprocessable ones and display a more informative
                        // error.
                        unprocessableEntryPointPaths.push(entryPoint.path);
                        continue;
                    }
                    var hasProcessedTypings = build_marker_1.hasBeenProcessed(packageJson, 'typings');
                    if (hasProcessedTypings && typingsOnly) {
                        // Typings for this entry-point have already been processed and we're in typings-only mode,
                        // so no task has to be created for this entry-point.
                        logger.debug("Skipping " + entryPoint.name + " : typings have already been processed.");
                        continue;
                    }
                    var processDts = hasProcessedTypings ? api_1.DtsProcessing.No :
                        typingsOnly ? api_1.DtsProcessing.Only : api_1.DtsProcessing.Yes;
                    try {
                        for (var propertiesToProcess_1 = (e_2 = void 0, tslib_1.__values(propertiesToProcess)), propertiesToProcess_1_1 = propertiesToProcess_1.next(); !propertiesToProcess_1_1.done; propertiesToProcess_1_1 = propertiesToProcess_1.next()) {
                            var formatProperty = propertiesToProcess_1_1.value;
                            if (build_marker_1.hasBeenProcessed(entryPoint.packageJson, formatProperty)) {
                                // The format-path which the property maps to is already processed - nothing to do.
                                logger.debug("Skipping " + entryPoint.name + " : " + formatProperty + " (already compiled).");
                                continue;
                            }
                            var formatPropertiesToMarkAsProcessed = equivalentPropertiesMap.get(formatProperty);
                            tasks.push({ entryPoint: entryPoint, formatProperty: formatProperty, formatPropertiesToMarkAsProcessed: formatPropertiesToMarkAsProcessed, processDts: processDts });
                            // Only process typings for the first property (if not already processed).
                            processDts = api_1.DtsProcessing.No;
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (propertiesToProcess_1_1 && !propertiesToProcess_1_1.done && (_b = propertiesToProcess_1.return)) _b.call(propertiesToProcess_1);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (entryPoints_1_1 && !entryPoints_1_1.done && (_a = entryPoints_1.return)) _a.call(entryPoints_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            // Check for entry-points for which we could not process any format at all.
            if (unprocessableEntryPointPaths.length > 0) {
                throw new Error('Unable to process any formats for the following entry-points (tried ' +
                    (propertiesToConsider.join(', ') + "): ") +
                    unprocessableEntryPointPaths.map(function (path) { return "\n  - " + path; }).join(''));
            }
            var duration = Math.round((Date.now() - startTime) / 100) / 10;
            logger.debug("Analyzed " + entryPoints.length + " entry-points in " + duration + "s. " +
                ("(Total tasks: " + tasks.length + ")"));
            return getTaskQueue(logger, inParallel, tasks, graph);
        };
    }
    exports.getAnalyzeEntryPointsFn = getAnalyzeEntryPointsFn;
    function logInvalidEntryPoints(logger, invalidEntryPoints) {
        invalidEntryPoints.forEach(function (invalidEntryPoint) {
            logger.debug("Invalid entry-point " + invalidEntryPoint.entryPoint.path + ".", "It is missing required dependencies:\n" +
                invalidEntryPoint.missingDependencies.map(function (dep) { return " - " + dep; }).join('\n'));
        });
    }
    /**
     * This function computes and returns the following:
     * - `propertiesToProcess`: An (ordered) list of properties that exist and need to be processed,
     *   based on the provided `propertiesToConsider`, the properties in `package.json` and their
     *   corresponding format-paths. NOTE: Only one property per format-path needs to be processed.
     * - `equivalentPropertiesMap`: A mapping from each property in `propertiesToProcess` to the list of
     *   other format properties in `package.json` that need to be marked as processed as soon as the
     *   former has been processed.
     */
    function getPropertiesToProcess(packageJson, propertiesToConsider, compileAllFormats, typingsOnly) {
        var e_3, _a, e_4, _b, e_5, _c;
        var formatPathsToConsider = new Set();
        var propertiesToProcess = [];
        try {
            for (var propertiesToConsider_1 = tslib_1.__values(propertiesToConsider), propertiesToConsider_1_1 = propertiesToConsider_1.next(); !propertiesToConsider_1_1.done; propertiesToConsider_1_1 = propertiesToConsider_1.next()) {
                var prop = propertiesToConsider_1_1.value;
                var formatPath = packageJson[prop];
                // Ignore properties that are not defined in `package.json`.
                if (typeof formatPath !== 'string')
                    continue;
                // Ignore properties that map to the same format-path as a preceding property.
                if (formatPathsToConsider.has(formatPath))
                    continue;
                // Process this property, because it is the first one to map to this format-path.
                formatPathsToConsider.add(formatPath);
                propertiesToProcess.push(prop);
                // If we only need one format processed, there is no need to process any more properties.
                if (!compileAllFormats)
                    break;
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (propertiesToConsider_1_1 && !propertiesToConsider_1_1.done && (_a = propertiesToConsider_1.return)) _a.call(propertiesToConsider_1);
            }
            finally { if (e_3) throw e_3.error; }
        }
        var formatPathToProperties = {};
        try {
            for (var SUPPORTED_FORMAT_PROPERTIES_1 = tslib_1.__values(entry_point_1.SUPPORTED_FORMAT_PROPERTIES), SUPPORTED_FORMAT_PROPERTIES_1_1 = SUPPORTED_FORMAT_PROPERTIES_1.next(); !SUPPORTED_FORMAT_PROPERTIES_1_1.done; SUPPORTED_FORMAT_PROPERTIES_1_1 = SUPPORTED_FORMAT_PROPERTIES_1.next()) {
                var prop = SUPPORTED_FORMAT_PROPERTIES_1_1.value;
                var formatPath = packageJson[prop];
                // Ignore properties that are not defined in `package.json`.
                if (typeof formatPath !== 'string')
                    continue;
                // Ignore properties that do not map to a format-path that will be considered.
                if (!formatPathsToConsider.has(formatPath))
                    continue;
                // Add this property to the map.
                var list = formatPathToProperties[formatPath] || (formatPathToProperties[formatPath] = []);
                list.push(prop);
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (SUPPORTED_FORMAT_PROPERTIES_1_1 && !SUPPORTED_FORMAT_PROPERTIES_1_1.done && (_b = SUPPORTED_FORMAT_PROPERTIES_1.return)) _b.call(SUPPORTED_FORMAT_PROPERTIES_1);
            }
            finally { if (e_4) throw e_4.error; }
        }
        var equivalentPropertiesMap = new Map();
        try {
            for (var propertiesToConsider_2 = tslib_1.__values(propertiesToConsider), propertiesToConsider_2_1 = propertiesToConsider_2.next(); !propertiesToConsider_2_1.done; propertiesToConsider_2_1 = propertiesToConsider_2.next()) {
                var prop = propertiesToConsider_2_1.value;
                var formatPath = packageJson[prop];
                // If we are only processing typings then there should be no format properties to mark
                var equivalentProperties = typingsOnly ? [] : formatPathToProperties[formatPath];
                equivalentPropertiesMap.set(prop, equivalentProperties);
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (propertiesToConsider_2_1 && !propertiesToConsider_2_1.done && (_c = propertiesToConsider_2.return)) _c.call(propertiesToConsider_2);
            }
            finally { if (e_5) throw e_5.error; }
        }
        return { propertiesToProcess: propertiesToProcess, equivalentPropertiesMap: equivalentPropertiesMap };
    }
    function getTaskQueue(logger, inParallel, tasks, graph) {
        var dependencies = utils_1.computeTaskDependencies(tasks, graph);
        return inParallel ? new parallel_task_queue_1.ParallelTaskQueue(logger, tasks, dependencies) :
            new serial_task_queue_1.SerialTaskQueue(logger, tasks, dependencies);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5hbHl6ZV9lbnRyeV9wb2ludHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvbmdjYy9zcmMvZXhlY3V0aW9uL2FuYWx5emVfZW50cnlfcG9pbnRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7SUFhQSxpSEFBZ0Y7SUFDaEYsNkdBQTRFO0lBQzVFLDhFQUFpRTtJQUNqRSxxRkFBMEQ7SUFDMUQsbUZBQStIO0lBQy9ILG1HQUEwRTtJQUcxRSwwRUFBNEU7SUFFNUU7O09BRUc7SUFDSCxTQUFnQix1QkFBdUIsQ0FDbkMsTUFBYyxFQUFFLE1BQXdCLEVBQUUsVUFBc0IsRUFDaEUsNkJBQXVELEVBQUUsV0FBb0IsRUFDN0UsaUJBQTBCLEVBQUUsb0JBQThCLEVBQzFELFVBQW1CO1FBQ3JCLE9BQU87O1lBQ0wsTUFBTSxDQUFDLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO1lBQzFDLElBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUU3QixJQUFJLGNBQWMsR0FBRyxNQUFNLENBQUMsZUFBZSxFQUFFLENBQUM7WUFDOUMsSUFBTSxPQUFPLEdBQUcsdUNBQXFCLENBQUMsVUFBVSxFQUFFLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUM5RSxJQUFJLE9BQU8sRUFBRTtnQkFDWCwwRkFBMEY7Z0JBQzFGLGNBQWMsR0FBRyxNQUFNLENBQUMsZUFBZSxFQUFFLENBQUM7YUFDM0M7WUFFTSxJQUFBLFdBQVcsR0FBK0IsY0FBYyxZQUE3QyxFQUFFLGtCQUFrQixHQUFXLGNBQWMsbUJBQXpCLEVBQUUsS0FBSyxHQUFJLGNBQWMsTUFBbEIsQ0FBbUI7WUFDaEUscUJBQXFCLENBQUMsTUFBTSxFQUFFLGtCQUFrQixDQUFDLENBQUM7WUFFbEQsSUFBTSw0QkFBNEIsR0FBYSxFQUFFLENBQUM7WUFDbEQsNkZBQTZGO1lBQzdG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QUM7SUFFRCxTQUFTLFlBQVksQ0FDakIsTUFBYyxFQUFFLFVBQW1CLEVBQUUsS0FBNEIsRUFDakUsS0FBMkI7UUFDN0IsSUFBTSxZQUFZLEdBQUcsK0JBQXVCLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzNELE9BQU8sVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLHVDQUFpQixDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQztZQUNwRCxJQUFJLG1DQUFlLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxZQUFZLENBQUMsQ0FBQztJQUN2RSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0RlcEdyYXBofSBmcm9tICdkZXBlbmRlbmN5LWdyYXBoJztcblxuaW1wb3J0IHtGaWxlU3lzdGVtfSBmcm9tICcuLi8uLi8uLi9zcmMvbmd0c2MvZmlsZV9zeXN0ZW0nO1xuaW1wb3J0IHtMb2dnZXJ9IGZyb20gJy4uLy4uLy4uL3NyYy9uZ3RzYy9sb2dnaW5nJztcbmltcG9ydCB7SW52YWxpZEVudHJ5UG9pbnR9IGZyb20gJy4uL2RlcGVuZGVuY2llcy9kZXBlbmRlbmN5X3Jlc29sdmVyJztcbmltcG9ydCB7RW50cnlQb2ludEZpbmRlcn0gZnJvbSAnLi4vZW50cnlfcG9pbnRfZmluZGVyL2ludGVyZmFjZSc7XG5pbXBvcnQge1BhcmFsbGVsVGFza1F1ZXVlfSBmcm9tICcuLi9leGVjdXRpb24vdGFza3MvcXVldWVzL3BhcmFsbGVsX3Rhc2tfcXVldWUnO1xuaW1wb3J0IHtTZXJpYWxUYXNrUXVldWV9IGZyb20gJy4uL2V4ZWN1dGlvbi90YXNrcy9xdWV1ZXMvc2VyaWFsX3Rhc2tfcXVldWUnO1xuaW1wb3J0IHtjb21wdXRlVGFza0RlcGVuZGVuY2llc30gZnJvbSAnLi4vZXhlY3V0aW9uL3Rhc2tzL3V0aWxzJztcbmltcG9ydCB7aGFzQmVlblByb2Nlc3NlZH0gZnJvbSAnLi4vcGFja2FnZXMvYnVpbGRfbWFya2VyJztcbmltcG9ydCB7RW50cnlQb2ludCwgRW50cnlQb2ludEpzb25Qcm9wZXJ0eSwgRW50cnlQb2ludFBhY2thZ2VKc29uLCBTVVBQT1JURURfRk9STUFUX1BST1BFUlRJRVN9IGZyb20gJy4uL3BhY2thZ2VzL2VudHJ5X3BvaW50JztcbmltcG9ydCB7Y2xlYW5PdXRkYXRlZFBhY2thZ2VzfSBmcm9tICcuLi93cml0aW5nL2NsZWFuaW5nL3BhY2thZ2VfY2xlYW5lcic7XG5cbmltcG9ydCB7QW5hbHl6ZUVudHJ5UG9pbnRzRm59IGZyb20gJy4vYXBpJztcbmltcG9ydCB7RHRzUHJvY2Vzc2luZywgUGFydGlhbGx5T3JkZXJlZFRhc2tzLCBUYXNrUXVldWV9IGZyb20gJy4vdGFza3MvYXBpJztcblxuLyoqXG4gKiBDcmVhdGUgdGhlIGZ1bmN0aW9uIGZvciBwZXJmb3JtaW5nIHRoZSBhbmFseXNpcyBvZiB0aGUgZW50cnktcG9pbnRzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QW5hbHl6ZUVudHJ5UG9pbnRzRm4oXG4gICAgbG9nZ2VyOiBMb2dnZXIsIGZpbmRlcjogRW50cnlQb2ludEZpbmRlciwgZmlsZVN5c3RlbTogRmlsZVN5c3RlbSxcbiAgICBzdXBwb3J0ZWRQcm9wZXJ0aWVzVG9Db25zaWRlcjogRW50cnlQb2ludEpzb25Qcm9wZXJ0eVtdLCB0eXBpbmdzT25seTogYm9vbGVhbixcbiAgICBjb21waWxlQWxsRm9ybWF0czogYm9vbGVhbiwgcHJvcGVydGllc1RvQ29uc2lkZXI6IHN0cmluZ1tdLFxuICAgIGluUGFyYWxsZWw6IGJvb2xlYW4pOiBBbmFseXplRW50cnlQb2ludHNGbiB7XG4gIHJldHVybiAoKSA9PiB7XG4gICAgbG9nZ2VyLmRlYnVnKCdBbmFseXppbmcgZW50cnktcG9pbnRzLi4uJyk7XG4gICAgY29uc3Qgc3RhcnRUaW1lID0gRGF0ZS5ub3coKTtcblxuICAgIGxldCBlbnRyeVBvaW50SW5mbyA9IGZpbmRlci5maW5kRW50cnlQb2ludHMoKTtcbiAgICBjb25zdCBjbGVhbmVkID0gY2xlYW5PdXRkYXRlZFBhY2thZ2VzKGZpbGVTeXN0ZW0sIGVudHJ5UG9pbnRJbmZvLmVudHJ5UG9pbnRzKTtcbiAgICBpZiAoY2xlYW5lZCkge1xuICAgICAgLy8gSWYgd2UgaGFkIHRvIGNsZWFuIHVwIG9uZSBvciBtb3JlIHBhY2thZ2VzIHRoZW4gd2UgbXVzdCByZWFkIGluIHRoZSBlbnRyeS1wb2ludHMgYWdhaW4uXG4gICAgICBlbnRyeVBvaW50SW5mbyA9IGZpbmRlci5maW5kRW50cnlQb2ludHMoKTtcbiAgICB9XG5cbiAgICBjb25zdCB7ZW50cnlQb2ludHMsIGludmFsaWRFbnRyeVBvaW50cywgZ3JhcGh9ID0gZW50cnlQb2ludEluZm87XG4gICAgbG9nSW52YWxpZEVudHJ5UG9pbnRzKGxvZ2dlciwgaW52YWxpZEVudHJ5UG9pbnRzKTtcblxuICAgIGNvbnN0IHVucHJvY2Vzc2FibGVFbnRyeVBvaW50UGF0aHM6IHN0cmluZ1tdID0gW107XG4gICAgLy8gVGhlIHRhc2tzIGFyZSBwYXJ0aWFsbHkgb3JkZXJlZCBieSB2aXJ0dWUgb2YgdGhlIGVudHJ5LXBvaW50cyBiZWluZyBwYXJ0aWFsbHkgb3JkZXJlZCB0b28uXG4gICAgY29uc3QgdGFza3M6IFBhcnRpYWxseU9yZGVyZWRUYXNrcyA9IFtdIGFzIGFueTtcblxuICAgIGZvciAoY29uc3QgZW50cnlQb2ludCBvZiBlbnRyeVBvaW50cykge1xuICAgICAgY29uc3QgcGFja2FnZUpzb24gPSBlbnRyeVBvaW50LnBhY2thZ2VKc29uO1xuICAgICAgY29uc3Qge3Byb3BlcnRpZXNUb1Byb2Nlc3MsIGVxdWl2YWxlbnRQcm9wZXJ0aWVzTWFwfSA9IGdldFByb3BlcnRpZXNUb1Byb2Nlc3MoXG4gICAgICAgICAgcGFja2FnZUpzb24sIHN1cHBvcnRlZFByb3BlcnRpZXNUb0NvbnNpZGVyLCBjb21waWxlQWxsRm9ybWF0cywgdHlwaW5nc09ubHkpO1xuXG4gICAgICBpZiAocHJvcGVydGllc1RvUHJvY2Vzcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgLy8gVGhpcyBlbnRyeS1wb2ludCBpcyB1bnByb2Nlc3NhYmxlIChpLmUuIHRoZXJlIGlzIG5vIGZvcm1hdCBwcm9wZXJ0eSB0aGF0IGlzIG9mIGludGVyZXN0XG4gICAgICAgIC8vIGFuZCBjYW4gYmUgcHJvY2Vzc2VkKS4gVGhpcyB3aWxsIHJlc3VsdCBpbiBhbiBlcnJvciwgYnV0IGNvbnRpbnVlIGxvb3Bpbmcgb3ZlclxuICAgICAgICAvLyBlbnRyeS1wb2ludHMgaW4gb3JkZXIgdG8gY29sbGVjdCBhbGwgdW5wcm9jZXNzYWJsZSBvbmVzIGFuZCBkaXNwbGF5IGEgbW9yZSBpbmZvcm1hdGl2ZVxuICAgICAgICAvLyBlcnJvci5cbiAgICAgICAgdW5wcm9jZXNzYWJsZUVudHJ5UG9pbnRQYXRocy5wdXNoKGVudHJ5UG9pbnQucGF0aCk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBoYXNQcm9jZXNzZWRUeXBpbmdzID0gaGFzQmVlblByb2Nlc3NlZChwYWNrYWdlSnNvbiwgJ3R5cGluZ3MnKTtcbiAgICAgIGlmIChoYXNQcm9jZXNzZWRUeXBpbmdzICYmIHR5cGluZ3NPbmx5KSB7XG4gICAgICAgIC8vIFR5cGluZ3MgZm9yIHRoaXMgZW50cnktcG9pbnQgaGF2ZSBhbHJlYWR5IGJlZW4gcHJvY2Vzc2VkIGFuZCB3ZSdyZSBpbiB0eXBpbmdzLW9ubHkgbW9kZSxcbiAgICAgICAgLy8gc28gbm8gdGFzayBoYXMgdG8gYmUgY3JlYXRlZCBmb3IgdGhpcyBlbnRyeS1wb2ludC5cbiAgICAgICAgbG9nZ2VyLmRlYnVnKGBTa2lwcGluZyAke2VudHJ5UG9pbnQubmFtZX0gOiB0eXBpbmdzIGhhdmUgYWxyZWFkeSBiZWVuIHByb2Nlc3NlZC5gKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBsZXQgcHJvY2Vzc0R0cyA9IGhhc1Byb2Nlc3NlZFR5cGluZ3MgPyBEdHNQcm9jZXNzaW5nLk5vIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGluZ3NPbmx5ID8gRHRzUHJvY2Vzc2luZy5Pbmx5IDogRHRzUHJvY2Vzc2luZy5ZZXM7XG5cbiAgICAgIGZvciAoY29uc3QgZm9ybWF0UHJvcGVydHkgb2YgcHJvcGVydGllc1RvUHJvY2Vzcykge1xuICAgICAgICBpZiAoaGFzQmVlblByb2Nlc3NlZChlbnRyeVBvaW50LnBhY2thZ2VKc29uLCBmb3JtYXRQcm9wZXJ0eSkpIHtcbiAgICAgICAgICAvLyBUaGUgZm9ybWF0LXBhdGggd2hpY2ggdGhlIHByb3BlcnR5IG1hcHMgdG8gaXMgYWxyZWFkeSBwcm9jZXNzZWQgLSBub3RoaW5nIHRvIGRvLlxuICAgICAgICAgIGxvZ2dlci5kZWJ1ZyhgU2tpcHBpbmcgJHtlbnRyeVBvaW50Lm5hbWV9IDogJHtmb3JtYXRQcm9wZXJ0eX0gKGFscmVhZHkgY29tcGlsZWQpLmApO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZm9ybWF0UHJvcGVydGllc1RvTWFya0FzUHJvY2Vzc2VkID0gZXF1aXZhbGVudFByb3BlcnRpZXNNYXAuZ2V0KGZvcm1hdFByb3BlcnR5KSE7XG4gICAgICAgIHRhc2tzLnB1c2goe2VudHJ5UG9pbnQsIGZvcm1hdFByb3BlcnR5LCBmb3JtYXRQcm9wZXJ0aWVzVG9NYXJrQXNQcm9jZXNzZWQsIHByb2Nlc3NEdHN9KTtcblxuICAgICAgICAvLyBPbmx5IHByb2Nlc3MgdHlwaW5ncyBmb3IgdGhlIGZpcnN0IHByb3BlcnR5IChpZiBub3QgYWxyZWFkeSBwcm9jZXNzZWQpLlxuICAgICAgICBwcm9jZXNzRHRzID0gRHRzUHJvY2Vzc2luZy5ObztcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBDaGVjayBmb3IgZW50cnktcG9pbnRzIGZvciB3aGljaCB3ZSBjb3VsZCBub3QgcHJvY2VzcyBhbnkgZm9ybWF0IGF0IGFsbC5cbiAgICBpZiAodW5wcm9jZXNzYWJsZUVudHJ5UG9pbnRQYXRocy5sZW5ndGggPiAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgJ1VuYWJsZSB0byBwcm9jZXNzIGFueSBmb3JtYXRzIGZvciB0aGUgZm9sbG93aW5nIGVudHJ5LXBvaW50cyAodHJpZWQgJyArXG4gICAgICAgICAgYCR7cHJvcGVydGllc1RvQ29uc2lkZXIuam9pbignLCAnKX0pOiBgICtcbiAgICAgICAgICB1bnByb2Nlc3NhYmxlRW50cnlQb2ludFBhdGhzLm1hcChwYXRoID0+IGBcXG4gIC0gJHtwYXRofWApLmpvaW4oJycpKTtcbiAgICB9XG5cbiAgICBjb25zdCBkdXJhdGlvbiA9IE1hdGgucm91bmQoKERhdGUubm93KCkgLSBzdGFydFRpbWUpIC8gMTAwKSAvIDEwO1xuICAgIGxvZ2dlci5kZWJ1ZyhcbiAgICAgICAgYEFuYWx5emVkICR7ZW50cnlQb2ludHMubGVuZ3RofSBlbnRyeS1wb2ludHMgaW4gJHtkdXJhdGlvbn1zLiBgICtcbiAgICAgICAgYChUb3RhbCB0YXNrczogJHt0YXNrcy5sZW5ndGh9KWApO1xuXG4gICAgcmV0dXJuIGdldFRhc2tRdWV1ZShsb2dnZXIsIGluUGFyYWxsZWwsIHRhc2tzLCBncmFwaCk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGxvZ0ludmFsaWRFbnRyeVBvaW50cyhsb2dnZXI6IExvZ2dlciwgaW52YWxpZEVudHJ5UG9pbnRzOiBJbnZhbGlkRW50cnlQb2ludFtdKTogdm9pZCB7XG4gIGludmFsaWRFbnRyeVBvaW50cy5mb3JFYWNoKGludmFsaWRFbnRyeVBvaW50ID0+IHtcbiAgICBsb2dnZXIuZGVidWcoXG4gICAgICAgIGBJbnZhbGlkIGVudHJ5LXBvaW50ICR7aW52YWxpZEVudHJ5UG9pbnQuZW50cnlQb2ludC5wYXRofS5gLFxuICAgICAgICBgSXQgaXMgbWlzc2luZyByZXF1aXJlZCBkZXBlbmRlbmNpZXM6XFxuYCArXG4gICAgICAgICAgICBpbnZhbGlkRW50cnlQb2ludC5taXNzaW5nRGVwZW5kZW5jaWVzLm1hcChkZXAgPT4gYCAtICR7ZGVwfWApLmpvaW4oJ1xcbicpKTtcbiAgfSk7XG59XG5cbi8qKlxuICogVGhpcyBmdW5jdGlvbiBjb21wdXRlcyBhbmQgcmV0dXJucyB0aGUgZm9sbG93aW5nOlxuICogLSBgcHJvcGVydGllc1RvUHJvY2Vzc2A6IEFuIChvcmRlcmVkKSBsaXN0IG9mIHByb3BlcnRpZXMgdGhhdCBleGlzdCBhbmQgbmVlZCB0byBiZSBwcm9jZXNzZWQsXG4gKiAgIGJhc2VkIG9uIHRoZSBwcm92aWRlZCBgcHJvcGVydGllc1RvQ29uc2lkZXJgLCB0aGUgcHJvcGVydGllcyBpbiBgcGFja2FnZS5qc29uYCBhbmQgdGhlaXJcbiAqICAgY29ycmVzcG9uZGluZyBmb3JtYXQtcGF0aHMuIE5PVEU6IE9ubHkgb25lIHByb3BlcnR5IHBlciBmb3JtYXQtcGF0aCBuZWVkcyB0byBiZSBwcm9jZXNzZWQuXG4gKiAtIGBlcXVpdmFsZW50UHJvcGVydGllc01hcGA6IEEgbWFwcGluZyBmcm9tIGVhY2ggcHJvcGVydHkgaW4gYHByb3BlcnRpZXNUb1Byb2Nlc3NgIHRvIHRoZSBsaXN0IG9mXG4gKiAgIG90aGVyIGZvcm1hdCBwcm9wZXJ0aWVzIGluIGBwYWNrYWdlLmpzb25gIHRoYXQgbmVlZCB0byBiZSBtYXJrZWQgYXMgcHJvY2Vzc2VkIGFzIHNvb24gYXMgdGhlXG4gKiAgIGZvcm1lciBoYXMgYmVlbiBwcm9jZXNzZWQuXG4gKi9cbmZ1bmN0aW9uIGdldFByb3BlcnRpZXNUb1Byb2Nlc3MoXG4gICAgcGFja2FnZUpzb246IEVudHJ5UG9pbnRQYWNrYWdlSnNvbiwgcHJvcGVydGllc1RvQ29uc2lkZXI6IEVudHJ5UG9pbnRKc29uUHJvcGVydHlbXSxcbiAgICBjb21waWxlQWxsRm9ybWF0czogYm9vbGVhbiwgdHlwaW5nc09ubHk6IGJvb2xlYW4pOiB7XG4gIHByb3BlcnRpZXNUb1Byb2Nlc3M6IEVudHJ5UG9pbnRKc29uUHJvcGVydHlbXTtcbiAgZXF1aXZhbGVudFByb3BlcnRpZXNNYXA6IE1hcDxFbnRyeVBvaW50SnNvblByb3BlcnR5LCBFbnRyeVBvaW50SnNvblByb3BlcnR5W10+O1xufSB7XG4gIGNvbnN0IGZvcm1hdFBhdGhzVG9Db25zaWRlciA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuXG4gIGNvbnN0IHByb3BlcnRpZXNUb1Byb2Nlc3M6IEVudHJ5UG9pbnRKc29uUHJvcGVydHlbXSA9IFtdO1xuICBmb3IgKGNvbnN0IHByb3Agb2YgcHJvcGVydGllc1RvQ29uc2lkZXIpIHtcbiAgICBjb25zdCBmb3JtYXRQYXRoID0gcGFja2FnZUpzb25bcHJvcF07XG5cbiAgICAvLyBJZ25vcmUgcHJvcGVydGllcyB0aGF0IGFyZSBub3QgZGVmaW5lZCBpbiBgcGFja2FnZS5qc29uYC5cbiAgICBpZiAodHlwZW9mIGZvcm1hdFBhdGggIT09ICdzdHJpbmcnKSBjb250aW51ZTtcblxuICAgIC8vIElnbm9yZSBwcm9wZXJ0aWVzIHRoYXQgbWFwIHRvIHRoZSBzYW1lIGZvcm1hdC1wYXRoIGFzIGEgcHJlY2VkaW5nIHByb3BlcnR5LlxuICAgIGlmIChmb3JtYXRQYXRoc1RvQ29uc2lkZXIuaGFzKGZvcm1hdFBhdGgpKSBjb250aW51ZTtcblxuICAgIC8vIFByb2Nlc3MgdGhpcyBwcm9wZXJ0eSwgYmVjYXVzZSBpdCBpcyB0aGUgZmlyc3Qgb25lIHRvIG1hcCB0byB0aGlzIGZvcm1hdC1wYXRoLlxuICAgIGZvcm1hdFBhdGhzVG9Db25zaWRlci5hZGQoZm9ybWF0UGF0aCk7XG4gICAgcHJvcGVydGllc1RvUHJvY2Vzcy5wdXNoKHByb3ApO1xuXG4gICAgLy8gSWYgd2Ugb25seSBuZWVkIG9uZSBmb3JtYXQgcHJvY2Vzc2VkLCB0aGVyZSBpcyBubyBuZWVkIHRvIHByb2Nlc3MgYW55IG1vcmUgcHJvcGVydGllcy5cbiAgICBpZiAoIWNvbXBpbGVBbGxGb3JtYXRzKSBicmVhaztcbiAgfVxuXG4gIGNvbnN0IGZvcm1hdFBhdGhUb1Byb3BlcnRpZXM6IHtbZm9ybWF0UGF0aDogc3RyaW5nXTogRW50cnlQb2ludEpzb25Qcm9wZXJ0eVtdfSA9IHt9O1xuICBmb3IgKGNvbnN0IHByb3Agb2YgU1VQUE9SVEVEX0ZPUk1BVF9QUk9QRVJUSUVTKSB7XG4gICAgY29uc3QgZm9ybWF0UGF0aCA9IHBhY2thZ2VKc29uW3Byb3BdO1xuXG4gICAgLy8gSWdub3JlIHByb3BlcnRpZXMgdGhhdCBhcmUgbm90IGRlZmluZWQgaW4gYHBhY2thZ2UuanNvbmAuXG4gICAgaWYgKHR5cGVvZiBmb3JtYXRQYXRoICE9PSAnc3RyaW5nJykgY29udGludWU7XG5cbiAgICAvLyBJZ25vcmUgcHJvcGVydGllcyB0aGF0IGRvIG5vdCBtYXAgdG8gYSBmb3JtYXQtcGF0aCB0aGF0IHdpbGwgYmUgY29uc2lkZXJlZC5cbiAgICBpZiAoIWZvcm1hdFBhdGhzVG9Db25zaWRlci5oYXMoZm9ybWF0UGF0aCkpIGNvbnRpbnVlO1xuXG4gICAgLy8gQWRkIHRoaXMgcHJvcGVydHkgdG8gdGhlIG1hcC5cbiAgICBjb25zdCBsaXN0ID0gZm9ybWF0UGF0aFRvUHJvcGVydGllc1tmb3JtYXRQYXRoXSB8fCAoZm9ybWF0UGF0aFRvUHJvcGVydGllc1tmb3JtYXRQYXRoXSA9IFtdKTtcbiAgICBsaXN0LnB1c2gocHJvcCk7XG4gIH1cblxuICBjb25zdCBlcXVpdmFsZW50UHJvcGVydGllc01hcCA9IG5ldyBNYXA8RW50cnlQb2ludEpzb25Qcm9wZXJ0eSwgRW50cnlQb2ludEpzb25Qcm9wZXJ0eVtdPigpO1xuICBmb3IgKGNvbnN0IHByb3Agb2YgcHJvcGVydGllc1RvQ29uc2lkZXIpIHtcbiAgICBjb25zdCBmb3JtYXRQYXRoID0gcGFja2FnZUpzb25bcHJvcF0hO1xuICAgIC8vIElmIHdlIGFyZSBvbmx5IHByb2Nlc3NpbmcgdHlwaW5ncyB0aGVuIHRoZXJlIHNob3VsZCBiZSBubyBmb3JtYXQgcHJvcGVydGllcyB0byBtYXJrXG4gICAgY29uc3QgZXF1aXZhbGVudFByb3BlcnRpZXMgPSB0eXBpbmdzT25seSA/IFtdIDogZm9ybWF0UGF0aFRvUHJvcGVydGllc1tmb3JtYXRQYXRoXTtcbiAgICBlcXVpdmFsZW50UHJvcGVydGllc01hcC5zZXQocHJvcCwgZXF1aXZhbGVudFByb3BlcnRpZXMpO1xuICB9XG5cbiAgcmV0dXJuIHtwcm9wZXJ0aWVzVG9Qcm9jZXNzLCBlcXVpdmFsZW50UHJvcGVydGllc01hcH07XG59XG5cbmZ1bmN0aW9uIGdldFRhc2tRdWV1ZShcbiAgICBsb2dnZXI6IExvZ2dlciwgaW5QYXJhbGxlbDogYm9vbGVhbiwgdGFza3M6IFBhcnRpYWxseU9yZGVyZWRUYXNrcyxcbiAgICBncmFwaDogRGVwR3JhcGg8RW50cnlQb2ludD4pOiBUYXNrUXVldWUge1xuICBjb25zdCBkZXBlbmRlbmNpZXMgPSBjb21wdXRlVGFza0RlcGVuZGVuY2llcyh0YXNrcywgZ3JhcGgpO1xuICByZXR1cm4gaW5QYXJhbGxlbCA/IG5ldyBQYXJhbGxlbFRhc2tRdWV1ZShsb2dnZXIsIHRhc2tzLCBkZXBlbmRlbmNpZXMpIDpcbiAgICAgICAgICAgICAgICAgICAgICBuZXcgU2VyaWFsVGFza1F1ZXVlKGxvZ2dlciwgdGFza3MsIGRlcGVuZGVuY2llcyk7XG59XG4iXX0=