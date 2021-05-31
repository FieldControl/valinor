(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/execution/tasks/utils", ["require", "exports", "tslib", "@angular/compiler-cli/ngcc/src/execution/tasks/api"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.sortTasksByPriority = exports.getBlockedTasks = exports.getDependentsSet = exports.computeTaskDependencies = exports.stringifyTask = void 0;
    var tslib_1 = require("tslib");
    var api_1 = require("@angular/compiler-cli/ngcc/src/execution/tasks/api");
    /** Stringify a task for debugging purposes. */
    var stringifyTask = function (task) {
        return "{entryPoint: " + task.entryPoint.name + ", formatProperty: " + task.formatProperty + ", " +
            ("processDts: " + api_1.DtsProcessing[task.processDts] + "}");
    };
    exports.stringifyTask = stringifyTask;
    /**
     * Compute a mapping of tasks to the tasks that are dependent on them (if any).
     *
     * Task A can depend upon task B, if either:
     *
     * * A and B have the same entry-point _and_ B is generating the typings for that entry-point
     *   (i.e. has `processDts: true`).
     * * A's entry-point depends on B's entry-point _and_ B is also generating typings.
     *
     * NOTE: If a task is not generating typings, then it cannot affect anything which depends on its
     *       entry-point, regardless of the dependency graph. To put this another way, only the task
     *       which produces the typings for a dependency needs to have been completed.
     *
     * As a performance optimization, we take into account the fact that `tasks` are sorted in such a
     * way that a task can only depend on earlier tasks (i.e. dependencies always come before
     * dependents in the list of tasks).
     *
     * @param tasks A (partially ordered) list of tasks.
     * @param graph The dependency graph between entry-points.
     * @return A map from each task to those tasks directly dependent upon it.
     */
    function computeTaskDependencies(tasks, graph) {
        var dependencies = new api_1.TaskDependencies();
        var candidateDependencies = new Map();
        tasks.forEach(function (task) {
            var e_1, _a;
            var entryPointPath = task.entryPoint.path;
            // Find the earlier tasks (`candidateDependencies`) that this task depends upon.
            var deps = graph.dependenciesOf(entryPointPath);
            var taskDependencies = deps.filter(function (dep) { return candidateDependencies.has(dep); })
                .map(function (dep) { return candidateDependencies.get(dep); });
            // If this task has dependencies, add it to the dependencies and dependents maps.
            if (taskDependencies.length > 0) {
                try {
                    for (var taskDependencies_1 = tslib_1.__values(taskDependencies), taskDependencies_1_1 = taskDependencies_1.next(); !taskDependencies_1_1.done; taskDependencies_1_1 = taskDependencies_1.next()) {
                        var dependency = taskDependencies_1_1.value;
                        var taskDependents = getDependentsSet(dependencies, dependency);
                        taskDependents.add(task);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (taskDependencies_1_1 && !taskDependencies_1_1.done && (_a = taskDependencies_1.return)) _a.call(taskDependencies_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
            if (task.processDts !== api_1.DtsProcessing.No) {
                // SANITY CHECK:
                // There should only be one task per entry-point that generates typings (and thus can be a
                // dependency of other tasks), so the following should theoretically never happen, but check
                // just in case.
                if (candidateDependencies.has(entryPointPath)) {
                    var otherTask = candidateDependencies.get(entryPointPath);
                    throw new Error('Invariant violated: Multiple tasks are assigned generating typings for ' +
                        ("'" + entryPointPath + "':\n  - " + exports.stringifyTask(otherTask) + "\n  - " + exports.stringifyTask(task)));
                }
                // This task can potentially be a dependency (i.e. it generates typings), so add it to the
                // list of candidate dependencies for subsequent tasks.
                candidateDependencies.set(entryPointPath, task);
            }
            else {
                // This task is not generating typings so we need to add it to the dependents of the task that
                // does generate typings, if that exists
                if (candidateDependencies.has(entryPointPath)) {
                    var typingsTask = candidateDependencies.get(entryPointPath);
                    var typingsTaskDependents = getDependentsSet(dependencies, typingsTask);
                    typingsTaskDependents.add(task);
                }
            }
        });
        return dependencies;
    }
    exports.computeTaskDependencies = computeTaskDependencies;
    function getDependentsSet(map, task) {
        if (!map.has(task)) {
            map.set(task, new Set());
        }
        return map.get(task);
    }
    exports.getDependentsSet = getDependentsSet;
    /**
     * Invert the given mapping of Task dependencies.
     *
     * @param dependencies The mapping of tasks to the tasks that depend upon them.
     * @returns A mapping of tasks to the tasks that they depend upon.
     */
    function getBlockedTasks(dependencies) {
        var e_2, _a, e_3, _b;
        var blockedTasks = new Map();
        try {
            for (var dependencies_1 = tslib_1.__values(dependencies), dependencies_1_1 = dependencies_1.next(); !dependencies_1_1.done; dependencies_1_1 = dependencies_1.next()) {
                var _c = tslib_1.__read(dependencies_1_1.value, 2), dependency = _c[0], dependents = _c[1];
                try {
                    for (var dependents_1 = (e_3 = void 0, tslib_1.__values(dependents)), dependents_1_1 = dependents_1.next(); !dependents_1_1.done; dependents_1_1 = dependents_1.next()) {
                        var dependent = dependents_1_1.value;
                        var dependentSet = getDependentsSet(blockedTasks, dependent);
                        dependentSet.add(dependency);
                    }
                }
                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                finally {
                    try {
                        if (dependents_1_1 && !dependents_1_1.done && (_b = dependents_1.return)) _b.call(dependents_1);
                    }
                    finally { if (e_3) throw e_3.error; }
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (dependencies_1_1 && !dependencies_1_1.done && (_a = dependencies_1.return)) _a.call(dependencies_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return blockedTasks;
    }
    exports.getBlockedTasks = getBlockedTasks;
    /**
     * Sort a list of tasks by priority.
     *
     * Priority is determined by the number of other tasks that a task is (transitively) blocking:
     * The more tasks a task is blocking the higher its priority is, because processing it will
     * potentially unblock more tasks.
     *
     * To keep the behavior predictable, if two tasks block the same number of other tasks, their
     * relative order in the original `tasks` lists is preserved.
     *
     * @param tasks A (partially ordered) list of tasks.
     * @param dependencies The mapping of tasks to the tasks that depend upon them.
     * @return The list of tasks sorted by priority.
     */
    function sortTasksByPriority(tasks, dependencies) {
        var priorityPerTask = new Map();
        var computePriority = function (task, idx) { return [dependencies.has(task) ? dependencies.get(task).size : 0, idx]; };
        tasks.forEach(function (task, i) { return priorityPerTask.set(task, computePriority(task, i)); });
        return tasks.slice().sort(function (task1, task2) {
            var _a = tslib_1.__read(priorityPerTask.get(task1), 2), p1 = _a[0], idx1 = _a[1];
            var _b = tslib_1.__read(priorityPerTask.get(task2), 2), p2 = _b[0], idx2 = _b[1];
            return (p2 - p1) || (idx1 - idx2);
        });
    }
    exports.sortTasksByPriority = sortTasksByPriority;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvbmdjYy9zcmMvZXhlY3V0aW9uL3Rhc2tzL3V0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7SUFTQSwwRUFBbUY7SUFFbkYsK0NBQStDO0lBQ3hDLElBQU0sYUFBYSxHQUFHLFVBQUMsSUFBVTtRQUNwQyxPQUFBLGtCQUFnQixJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksMEJBQXFCLElBQUksQ0FBQyxjQUFjLE9BQUk7YUFDaEYsaUJBQWUsbUJBQWEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQUcsQ0FBQTtJQURoRCxDQUNnRCxDQUFDO0lBRnhDLFFBQUEsYUFBYSxpQkFFMkI7SUFFckQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O09Bb0JHO0lBQ0gsU0FBZ0IsdUJBQXVCLENBQ25DLEtBQTRCLEVBQUUsS0FBMkI7UUFDM0QsSUFBTSxZQUFZLEdBQUcsSUFBSSxzQkFBZ0IsRUFBRSxDQUFDO1FBQzVDLElBQU0scUJBQXFCLEdBQUcsSUFBSSxHQUFHLEVBQWdCLENBQUM7UUFFdEQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFBLElBQUk7O1lBQ2hCLElBQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDO1lBRTVDLGdGQUFnRjtZQUNoRixJQUFNLElBQUksR0FBRyxLQUFLLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQ2xELElBQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFBLEdBQUcsSUFBSSxPQUFBLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBOUIsQ0FBOEIsQ0FBQztpQkFDN0MsR0FBRyxDQUFDLFVBQUEsR0FBRyxJQUFJLE9BQUEscUJBQXFCLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBRSxFQUEv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LElBQU0sZUFBZSxHQUFHLFVBQUMsSUFBVSxFQUFFLEdBQVcsSUFDeEIsT0FBQSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQWhFLENBQWdFLENBQUM7UUFFekYsS0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFDLElBQUksRUFBRSxDQUFDLElBQUssT0FBQSxlQUFlLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxlQUFlLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQW5ELENBQW1ELENBQUMsQ0FBQztRQUVoRixPQUFPLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBQyxLQUFLLEVBQUUsS0FBSztZQUMvQixJQUFBLEtBQUEsZUFBYSxlQUFlLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBRSxJQUFBLEVBQXZDLEVBQUUsUUFBQSxFQUFFLElBQUksUUFBK0IsQ0FBQztZQUN6QyxJQUFBLEtBQUEsZUFBYSxlQUFlLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBRSxJQUFBLEVBQXZDLEVBQUUsUUFBQSxFQUFFLElBQUksUUFBK0IsQ0FBQztZQUUvQyxPQUFPLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQ3BDLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQWRELGtEQWNDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0RlcEdyYXBofSBmcm9tICdkZXBlbmRlbmN5LWdyYXBoJztcbmltcG9ydCB7RW50cnlQb2ludH0gZnJvbSAnLi4vLi4vcGFja2FnZXMvZW50cnlfcG9pbnQnO1xuaW1wb3J0IHtEdHNQcm9jZXNzaW5nLCBQYXJ0aWFsbHlPcmRlcmVkVGFza3MsIFRhc2ssIFRhc2tEZXBlbmRlbmNpZXN9IGZyb20gJy4vYXBpJztcblxuLyoqIFN0cmluZ2lmeSBhIHRhc2sgZm9yIGRlYnVnZ2luZyBwdXJwb3Nlcy4gKi9cbmV4cG9ydCBjb25zdCBzdHJpbmdpZnlUYXNrID0gKHRhc2s6IFRhc2spOiBzdHJpbmcgPT5cbiAgICBge2VudHJ5UG9pbnQ6ICR7dGFzay5lbnRyeVBvaW50Lm5hbWV9LCBmb3JtYXRQcm9wZXJ0eTogJHt0YXNrLmZvcm1hdFByb3BlcnR5fSwgYCArXG4gICAgYHByb2Nlc3NEdHM6ICR7RHRzUHJvY2Vzc2luZ1t0YXNrLnByb2Nlc3NEdHNdfX1gO1xuXG4vKipcbiAqIENvbXB1dGUgYSBtYXBwaW5nIG9mIHRhc2tzIHRvIHRoZSB0YXNrcyB0aGF0IGFyZSBkZXBlbmRlbnQgb24gdGhlbSAoaWYgYW55KS5cbiAqXG4gKiBUYXNrIEEgY2FuIGRlcGVuZCB1cG9uIHRhc2sgQiwgaWYgZWl0aGVyOlxuICpcbiAqICogQSBhbmQgQiBoYXZlIHRoZSBzYW1lIGVudHJ5LXBvaW50IF9hbmRfIEIgaXMgZ2VuZXJhdGluZyB0aGUgdHlwaW5ncyBmb3IgdGhhdCBlbnRyeS1wb2ludFxuICogICAoaS5lLiBoYXMgYHByb2Nlc3NEdHM6IHRydWVgKS5cbiAqICogQSdzIGVudHJ5LXBvaW50IGRlcGVuZHMgb24gQidzIGVudHJ5LXBvaW50IF9hbmRfIEIgaXMgYWxzbyBnZW5lcmF0aW5nIHR5cGluZ3MuXG4gKlxuICogTk9URTogSWYgYSB0YXNrIGlzIG5vdCBnZW5lcmF0aW5nIHR5cGluZ3MsIHRoZW4gaXQgY2Fubm90IGFmZmVjdCBhbnl0aGluZyB3aGljaCBkZXBlbmRzIG9uIGl0c1xuICogICAgICAgZW50cnktcG9pbnQsIHJlZ2FyZGxlc3Mgb2YgdGhlIGRlcGVuZGVuY3kgZ3JhcGguIFRvIHB1dCB0aGlzIGFub3RoZXIgd2F5LCBvbmx5IHRoZSB0YXNrXG4gKiAgICAgICB3aGljaCBwcm9kdWNlcyB0aGUgdHlwaW5ncyBmb3IgYSBkZXBlbmRlbmN5IG5lZWRzIHRvIGhhdmUgYmVlbiBjb21wbGV0ZWQuXG4gKlxuICogQXMgYSBwZXJmb3JtYW5jZSBvcHRpbWl6YXRpb24sIHdlIHRha2UgaW50byBhY2NvdW50IHRoZSBmYWN0IHRoYXQgYHRhc2tzYCBhcmUgc29ydGVkIGluIHN1Y2ggYVxuICogd2F5IHRoYXQgYSB0YXNrIGNhbiBvbmx5IGRlcGVuZCBvbiBlYXJsaWVyIHRhc2tzIChpLmUuIGRlcGVuZGVuY2llcyBhbHdheXMgY29tZSBiZWZvcmVcbiAqIGRlcGVuZGVudHMgaW4gdGhlIGxpc3Qgb2YgdGFza3MpLlxuICpcbiAqIEBwYXJhbSB0YXNrcyBBIChwYXJ0aWFsbHkgb3JkZXJlZCkgbGlzdCBvZiB0YXNrcy5cbiAqIEBwYXJhbSBncmFwaCBUaGUgZGVwZW5kZW5jeSBncmFwaCBiZXR3ZWVuIGVudHJ5LXBvaW50cy5cbiAqIEByZXR1cm4gQSBtYXAgZnJvbSBlYWNoIHRhc2sgdG8gdGhvc2UgdGFza3MgZGlyZWN0bHkgZGVwZW5kZW50IHVwb24gaXQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb21wdXRlVGFza0RlcGVuZGVuY2llcyhcbiAgICB0YXNrczogUGFydGlhbGx5T3JkZXJlZFRhc2tzLCBncmFwaDogRGVwR3JhcGg8RW50cnlQb2ludD4pOiBUYXNrRGVwZW5kZW5jaWVzIHtcbiAgY29uc3QgZGVwZW5kZW5jaWVzID0gbmV3IFRhc2tEZXBlbmRlbmNpZXMoKTtcbiAgY29uc3QgY2FuZGlkYXRlRGVwZW5kZW5jaWVzID0gbmV3IE1hcDxzdHJpbmcsIFRhc2s+KCk7XG5cbiAgdGFza3MuZm9yRWFjaCh0YXNrID0+IHtcbiAgICBjb25zdCBlbnRyeVBvaW50UGF0aCA9IHRhc2suZW50cnlQb2ludC5wYXRoO1xuXG4gICAgLy8gRmluZCB0aGUgZWFybGllciB0YXNrcyAoYGNhbmRpZGF0ZURlcGVuZGVuY2llc2ApIHRoYXQgdGhpcyB0YXNrIGRlcGVuZHMgdXBvbi5cbiAgICBjb25zdCBkZXBzID0gZ3JhcGguZGVwZW5kZW5jaWVzT2YoZW50cnlQb2ludFBhdGgpO1xuICAgIGNvbnN0IHRhc2tEZXBlbmRlbmNpZXMgPSBkZXBzLmZpbHRlcihkZXAgPT4gY2FuZGlkYXRlRGVwZW5kZW5jaWVzLmhhcyhkZXApKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLm1hcChkZXAgPT4gY2FuZGlkYXRlRGVwZW5kZW5jaWVzLmdldChkZXApISk7XG5cbiAgICAvLyBJZiB0aGlzIHRhc2sgaGFzIGRlcGVuZGVuY2llcywgYWRkIGl0IHRvIHRoZSBkZXBlbmRlbmNpZXMgYW5kIGRlcGVuZGVudHMgbWFwcy5cbiAgICBpZiAodGFza0RlcGVuZGVuY2llcy5sZW5ndGggPiAwKSB7XG4gICAgICBmb3IgKGNvbnN0IGRlcGVuZGVuY3kgb2YgdGFza0RlcGVuZGVuY2llcykge1xuICAgICAgICBjb25zdCB0YXNrRGVwZW5kZW50cyA9IGdldERlcGVuZGVudHNTZXQoZGVwZW5kZW5jaWVzLCBkZXBlbmRlbmN5KTtcbiAgICAgICAgdGFza0RlcGVuZGVudHMuYWRkKHRhc2spO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0YXNrLnByb2Nlc3NEdHMgIT09IER0c1Byb2Nlc3NpbmcuTm8pIHtcbiAgICAgIC8vIFNBTklUWSBDSEVDSzpcbiAgICAgIC8vIFRoZXJlIHNob3VsZCBvbmx5IGJlIG9uZSB0YXNrIHBlciBlbnRyeS1wb2ludCB0aGF0IGdlbmVyYXRlcyB0eXBpbmdzIChhbmQgdGh1cyBjYW4gYmUgYVxuICAgICAgLy8gZGVwZW5kZW5jeSBvZiBvdGhlciB0YXNrcyksIHNvIHRoZSBmb2xsb3dpbmcgc2hvdWxkIHRoZW9yZXRpY2FsbHkgbmV2ZXIgaGFwcGVuLCBidXQgY2hlY2tcbiAgICAgIC8vIGp1c3QgaW4gY2FzZS5cbiAgICAgIGlmIChjYW5kaWRhdGVEZXBlbmRlbmNpZXMuaGFzKGVudHJ5UG9pbnRQYXRoKSkge1xuICAgICAgICBjb25zdCBvdGhlclRhc2sgPSBjYW5kaWRhdGVEZXBlbmRlbmNpZXMuZ2V0KGVudHJ5UG9pbnRQYXRoKSE7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICdJbnZhcmlhbnQgdmlvbGF0ZWQ6IE11bHRpcGxlIHRhc2tzIGFyZSBhc3NpZ25lZCBnZW5lcmF0aW5nIHR5cGluZ3MgZm9yICcgK1xuICAgICAgICAgICAgYCcke2VudHJ5UG9pbnRQYXRofSc6XFxuICAtICR7c3RyaW5naWZ5VGFzayhvdGhlclRhc2spfVxcbiAgLSAke3N0cmluZ2lmeVRhc2sodGFzayl9YCk7XG4gICAgICB9XG4gICAgICAvLyBUaGlzIHRhc2sgY2FuIHBvdGVudGlhbGx5IGJlIGEgZGVwZW5kZW5jeSAoaS5lLiBpdCBnZW5lcmF0ZXMgdHlwaW5ncyksIHNvIGFkZCBpdCB0byB0aGVcbiAgICAgIC8vIGxpc3Qgb2YgY2FuZGlkYXRlIGRlcGVuZGVuY2llcyBmb3Igc3Vic2VxdWVudCB0YXNrcy5cbiAgICAgIGNhbmRpZGF0ZURlcGVuZGVuY2llcy5zZXQoZW50cnlQb2ludFBhdGgsIHRhc2spO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBUaGlzIHRhc2sgaXMgbm90IGdlbmVyYXRpbmcgdHlwaW5ncyBzbyB3ZSBuZWVkIHRvIGFkZCBpdCB0byB0aGUgZGVwZW5kZW50cyBvZiB0aGUgdGFzayB0aGF0XG4gICAgICAvLyBkb2VzIGdlbmVyYXRlIHR5cGluZ3MsIGlmIHRoYXQgZXhpc3RzXG4gICAgICBpZiAoY2FuZGlkYXRlRGVwZW5kZW5jaWVzLmhhcyhlbnRyeVBvaW50UGF0aCkpIHtcbiAgICAgICAgY29uc3QgdHlwaW5nc1Rhc2sgPSBjYW5kaWRhdGVEZXBlbmRlbmNpZXMuZ2V0KGVudHJ5UG9pbnRQYXRoKSE7XG4gICAgICAgIGNvbnN0IHR5cGluZ3NUYXNrRGVwZW5kZW50cyA9IGdldERlcGVuZGVudHNTZXQoZGVwZW5kZW5jaWVzLCB0eXBpbmdzVGFzayk7XG4gICAgICAgIHR5cGluZ3NUYXNrRGVwZW5kZW50cy5hZGQodGFzayk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gZGVwZW5kZW5jaWVzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RGVwZW5kZW50c1NldChtYXA6IFRhc2tEZXBlbmRlbmNpZXMsIHRhc2s6IFRhc2spOiBTZXQ8VGFzaz4ge1xuICBpZiAoIW1hcC5oYXModGFzaykpIHtcbiAgICBtYXAuc2V0KHRhc2ssIG5ldyBTZXQoKSk7XG4gIH1cbiAgcmV0dXJuIG1hcC5nZXQodGFzaykhO1xufVxuXG4vKipcbiAqIEludmVydCB0aGUgZ2l2ZW4gbWFwcGluZyBvZiBUYXNrIGRlcGVuZGVuY2llcy5cbiAqXG4gKiBAcGFyYW0gZGVwZW5kZW5jaWVzIFRoZSBtYXBwaW5nIG9mIHRhc2tzIHRvIHRoZSB0YXNrcyB0aGF0IGRlcGVuZCB1cG9uIHRoZW0uXG4gKiBAcmV0dXJucyBBIG1hcHBpbmcgb2YgdGFza3MgdG8gdGhlIHRhc2tzIHRoYXQgdGhleSBkZXBlbmQgdXBvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEJsb2NrZWRUYXNrcyhkZXBlbmRlbmNpZXM6IFRhc2tEZXBlbmRlbmNpZXMpOiBNYXA8VGFzaywgU2V0PFRhc2s+PiB7XG4gIGNvbnN0IGJsb2NrZWRUYXNrcyA9IG5ldyBNYXA8VGFzaywgU2V0PFRhc2s+PigpO1xuICBmb3IgKGNvbnN0IFtkZXBlbmRlbmN5LCBkZXBlbmRlbnRzXSBvZiBkZXBlbmRlbmNpZXMpIHtcbiAgICBmb3IgKGNvbnN0IGRlcGVuZGVudCBvZiBkZXBlbmRlbnRzKSB7XG4gICAgICBjb25zdCBkZXBlbmRlbnRTZXQgPSBnZXREZXBlbmRlbnRzU2V0KGJsb2NrZWRUYXNrcywgZGVwZW5kZW50KTtcbiAgICAgIGRlcGVuZGVudFNldC5hZGQoZGVwZW5kZW5jeSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBibG9ja2VkVGFza3M7XG59XG5cbi8qKlxuICogU29ydCBhIGxpc3Qgb2YgdGFza3MgYnkgcHJpb3JpdHkuXG4gKlxuICogUHJpb3JpdHkgaXMgZGV0ZXJtaW5lZCBieSB0aGUgbnVtYmVyIG9mIG90aGVyIHRhc2tzIHRoYXQgYSB0YXNrIGlzICh0cmFuc2l0aXZlbHkpIGJsb2NraW5nOlxuICogVGhlIG1vcmUgdGFza3MgYSB0YXNrIGlzIGJsb2NraW5nIHRoZSBoaWdoZXIgaXRzIHByaW9yaXR5IGlzLCBiZWNhdXNlIHByb2Nlc3NpbmcgaXQgd2lsbFxuICogcG90ZW50aWFsbHkgdW5ibG9jayBtb3JlIHRhc2tzLlxuICpcbiAqIFRvIGtlZXAgdGhlIGJlaGF2aW9yIHByZWRpY3RhYmxlLCBpZiB0d28gdGFza3MgYmxvY2sgdGhlIHNhbWUgbnVtYmVyIG9mIG90aGVyIHRhc2tzLCB0aGVpclxuICogcmVsYXRpdmUgb3JkZXIgaW4gdGhlIG9yaWdpbmFsIGB0YXNrc2AgbGlzdHMgaXMgcHJlc2VydmVkLlxuICpcbiAqIEBwYXJhbSB0YXNrcyBBIChwYXJ0aWFsbHkgb3JkZXJlZCkgbGlzdCBvZiB0YXNrcy5cbiAqIEBwYXJhbSBkZXBlbmRlbmNpZXMgVGhlIG1hcHBpbmcgb2YgdGFza3MgdG8gdGhlIHRhc2tzIHRoYXQgZGVwZW5kIHVwb24gdGhlbS5cbiAqIEByZXR1cm4gVGhlIGxpc3Qgb2YgdGFza3Mgc29ydGVkIGJ5IHByaW9yaXR5LlxuICovXG5leHBvcnQgZnVuY3Rpb24gc29ydFRhc2tzQnlQcmlvcml0eShcbiAgICB0YXNrczogUGFydGlhbGx5T3JkZXJlZFRhc2tzLCBkZXBlbmRlbmNpZXM6IFRhc2tEZXBlbmRlbmNpZXMpOiBQYXJ0aWFsbHlPcmRlcmVkVGFza3Mge1xuICBjb25zdCBwcmlvcml0eVBlclRhc2sgPSBuZXcgTWFwPFRhc2ssIFtudW1iZXIsIG51bWJlcl0+KCk7XG4gIGNvbnN0IGNvbXB1dGVQcmlvcml0eSA9ICh0YXNrOiBUYXNrLCBpZHg6IG51bWJlcik6XG4gICAgICBbbnVtYmVyLCBudW1iZXJdID0+IFtkZXBlbmRlbmNpZXMuaGFzKHRhc2spID8gZGVwZW5kZW5jaWVzLmdldCh0YXNrKSEuc2l6ZSA6IDAsIGlkeF07XG5cbiAgdGFza3MuZm9yRWFjaCgodGFzaywgaSkgPT4gcHJpb3JpdHlQZXJUYXNrLnNldCh0YXNrLCBjb21wdXRlUHJpb3JpdHkodGFzaywgaSkpKTtcblxuICByZXR1cm4gdGFza3Muc2xpY2UoKS5zb3J0KCh0YXNrMSwgdGFzazIpID0+IHtcbiAgICBjb25zdCBbcDEsIGlkeDFdID0gcHJpb3JpdHlQZXJUYXNrLmdldCh0YXNrMSkhO1xuICAgIGNvbnN0IFtwMiwgaWR4Ml0gPSBwcmlvcml0eVBlclRhc2suZ2V0KHRhc2syKSE7XG5cbiAgICByZXR1cm4gKHAyIC0gcDEpIHx8IChpZHgxIC0gaWR4Mik7XG4gIH0pO1xufVxuIl19