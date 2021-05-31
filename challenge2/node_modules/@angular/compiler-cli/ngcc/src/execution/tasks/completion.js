(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/execution/tasks/completion", ["require", "exports", "tslib", "@angular/compiler-cli/ngcc/src/packages/build_marker", "@angular/compiler-cli/ngcc/src/packages/entry_point", "@angular/compiler-cli/ngcc/src/execution/tasks/api"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createLogErrorHandler = exports.createThrowErrorHandler = exports.createMarkAsProcessedHandler = exports.composeTaskCompletedCallbacks = void 0;
    var tslib_1 = require("tslib");
    var build_marker_1 = require("@angular/compiler-cli/ngcc/src/packages/build_marker");
    var entry_point_1 = require("@angular/compiler-cli/ngcc/src/packages/entry_point");
    var api_1 = require("@angular/compiler-cli/ngcc/src/execution/tasks/api");
    /**
     * Compose a group of TaskCompletedHandlers into a single TaskCompletedCallback.
     *
     * The compose callback will receive an outcome and will delegate to the appropriate handler based
     * on this outcome.
     *
     * @param callbacks a map of outcomes to handlers.
     */
    function composeTaskCompletedCallbacks(callbacks) {
        return function (task, outcome, message) {
            var callback = callbacks[outcome];
            if (callback === undefined) {
                throw new Error("Unknown task outcome: \"" + outcome + "\" - supported outcomes: " + JSON.stringify(Object.keys(callbacks)));
            }
            callback(task, message);
        };
    }
    exports.composeTaskCompletedCallbacks = composeTaskCompletedCallbacks;
    /**
     * Create a handler that will mark the entry-points in a package as being processed.
     *
     * @param pkgJsonUpdater The service used to update the package.json
     */
    function createMarkAsProcessedHandler(fs, pkgJsonUpdater) {
        return function (task) {
            var entryPoint = task.entryPoint, formatPropertiesToMarkAsProcessed = task.formatPropertiesToMarkAsProcessed, processDts = task.processDts;
            var packageJsonPath = fs.resolve(entryPoint.path, 'package.json');
            var propsToMarkAsProcessed = tslib_1.__spreadArray([], tslib_1.__read(formatPropertiesToMarkAsProcessed));
            if (processDts !== api_1.DtsProcessing.No) {
                propsToMarkAsProcessed.push('typings');
            }
            build_marker_1.markAsProcessed(pkgJsonUpdater, entryPoint.packageJson, packageJsonPath, propsToMarkAsProcessed);
        };
    }
    exports.createMarkAsProcessedHandler = createMarkAsProcessedHandler;
    /**
     * Create a handler that will throw an error.
     */
    function createThrowErrorHandler(fs) {
        return function (task, message) {
            throw new Error(createErrorMessage(fs, task, message));
        };
    }
    exports.createThrowErrorHandler = createThrowErrorHandler;
    /**
     * Create a handler that logs an error and marks the task as failed.
     */
    function createLogErrorHandler(logger, fs, taskQueue) {
        return function (task, message) {
            taskQueue.markAsFailed(task);
            logger.error(createErrorMessage(fs, task, message));
        };
    }
    exports.createLogErrorHandler = createLogErrorHandler;
    function createErrorMessage(fs, task, message) {
        var _a;
        var jsFormat = "`" + task.formatProperty + "` as " + ((_a = entry_point_1.getEntryPointFormat(fs, task.entryPoint, task.formatProperty)) !== null && _a !== void 0 ? _a : 'unknown format');
        var format = task.typingsOnly ? "typings only using " + jsFormat : jsFormat;
        message = message !== null ? " due to " + message : '';
        return "Failed to compile entry-point " + task.entryPoint.name + " (" + format + ")" + message;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGxldGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9uZ2NjL3NyYy9leGVjdXRpb24vdGFza3MvY29tcGxldGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0lBU0EscUZBQTREO0lBQzVELG1GQUE0RjtJQUc1RiwwRUFBbUc7SUFVbkc7Ozs7Ozs7T0FPRztJQUNILFNBQWdCLDZCQUE2QixDQUN6QyxTQUE4RDtRQUNoRSxPQUFPLFVBQUMsSUFBVSxFQUFFLE9BQThCLEVBQUUsT0FBb0I7WUFDdEUsSUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3BDLElBQUksUUFBUSxLQUFLLFNBQVMsRUFBRTtnQkFDMUIsTUFBTSxJQUFJLEtBQUssQ0FBQyw2QkFBMEIsT0FBTyxpQ0FDN0MsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFHLENBQUMsQ0FBQzthQUMvQztZQUNELFFBQVEsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDMUIsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQVZELHNFQVVDO0lBRUQ7Ozs7T0FJRztJQUNILFNBQWdCLDRCQUE0QixDQUN4QyxFQUFvQixFQUFFLGNBQWtDO1FBQzFELE9BQU8sVUFBQyxJQUFVO1lBQ1QsSUFBQSxVQUFVLEdBQW1ELElBQUksV0FBdkQsRUFBRSxpQ0FBaUMsR0FBZ0IsSUFBSSxrQ0FBcEIsRUFBRSxVQUFVLEdBQUksSUFBSSxXQUFSLENBQVM7WUFDekUsSUFBTSxlQUFlLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQ3BFLElBQU0sc0JBQXNCLDRDQUNwQixpQ0FBaUMsRUFBQyxDQUFDO1lBQzNDLElBQUksVUFBVSxLQUFLLG1CQUFhLENBQUMsRUFBRSxFQUFFO2dCQUNuQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7YUFDeEM7WUFDRCw4QkFBZSxDQUNYLGNBQWMsRUFBRSxVQUFVLENBQUMsV0FBVyxFQUFFLGVBQWUsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO1FBQ3ZGLENBQUMsQ0FBQztJQUNKLENBQUM7SUFiRCxvRUFhQztJQUVEOztPQUVHO0lBQ0gsU0FBZ0IsdUJBQXVCLENBQUMsRUFBc0I7UUFDNUQsT0FBTyxVQUFDLElBQVUsRUFBRSxPQUFvQjtZQUN0QyxNQUFNLElBQUksS0FBSyxDQUFDLGtCQUFrQixDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUN6RCxDQUFDLENBQUM7SUFDSixDQUFDO0lBSkQsMERBSUM7SUFFRDs7T0FFRztJQUNILFNBQWdCLHFCQUFxQixDQUNqQyxNQUFjLEVBQUUsRUFBc0IsRUFBRSxTQUFvQjtRQUM5RCxPQUFPLFVBQUMsSUFBVSxFQUFFLE9BQW9CO1lBQ3RDLFNBQVMsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDN0IsTUFBTSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDdEQsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQU5ELHNEQU1DO0lBRUQsU0FBUyxrQkFBa0IsQ0FBQyxFQUFzQixFQUFFLElBQVUsRUFBRSxPQUFvQjs7UUFDbEYsSUFBTSxRQUFRLEdBQUcsTUFBSyxJQUFJLENBQUMsY0FBYyxjQUNyQyxNQUFBLGlDQUFtQixDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsbUNBQUksZ0JBQWdCLENBQUUsQ0FBQztRQUN4RixJQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyx3QkFBc0IsUUFBVSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUM7UUFDOUUsT0FBTyxHQUFHLE9BQU8sS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLGFBQVcsT0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDdkQsT0FBTyxtQ0FBaUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLFVBQUssTUFBTSxNQUFHLEdBQUcsT0FBTyxDQUFDO0lBQ3ZGLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7UGF0aE1hbmlwdWxhdGlvbiwgUmVhZG9ubHlGaWxlU3lzdGVtfSBmcm9tICcuLi8uLi8uLi8uLi9zcmMvbmd0c2MvZmlsZV9zeXN0ZW0nO1xuaW1wb3J0IHtMb2dnZXJ9IGZyb20gJy4uLy4uLy4uLy4uL3NyYy9uZ3RzYy9sb2dnaW5nJztcbmltcG9ydCB7bWFya0FzUHJvY2Vzc2VkfSBmcm9tICcuLi8uLi9wYWNrYWdlcy9idWlsZF9tYXJrZXInO1xuaW1wb3J0IHtnZXRFbnRyeVBvaW50Rm9ybWF0LCBQYWNrYWdlSnNvbkZvcm1hdFByb3BlcnRpZXN9IGZyb20gJy4uLy4uL3BhY2thZ2VzL2VudHJ5X3BvaW50JztcbmltcG9ydCB7UGFja2FnZUpzb25VcGRhdGVyfSBmcm9tICcuLi8uLi93cml0aW5nL3BhY2thZ2VfanNvbl91cGRhdGVyJztcblxuaW1wb3J0IHtEdHNQcm9jZXNzaW5nLCBUYXNrLCBUYXNrQ29tcGxldGVkQ2FsbGJhY2ssIFRhc2tQcm9jZXNzaW5nT3V0Y29tZSwgVGFza1F1ZXVlfSBmcm9tICcuL2FwaSc7XG5cbi8qKlxuICogQSBmdW5jdGlvbiB0aGF0IGNhbiBoYW5kbGUgYSBzcGVjaWZpYyBvdXRjb21lIG9mIGEgdGFzayBjb21wbGV0aW9uLlxuICpcbiAqIFRoZXNlIGZ1bmN0aW9ucyBjYW4gYmUgY29tcG9zZWQgdXNpbmcgdGhlIGBjb21wb3NlVGFza0NvbXBsZXRlZENhbGxiYWNrcygpYFxuICogdG8gY3JlYXRlIGEgYFRhc2tDb21wbGV0ZWRDYWxsYmFja2AgZnVuY3Rpb24gdGhhdCBjYW4gYmUgcGFzc2VkIHRvIGFuIGBFeGVjdXRvcmAuXG4gKi9cbmV4cG9ydCB0eXBlIFRhc2tDb21wbGV0ZWRIYW5kbGVyID0gKHRhc2s6IFRhc2ssIG1lc3NhZ2U6IHN0cmluZ3xudWxsKSA9PiB2b2lkO1xuXG4vKipcbiAqIENvbXBvc2UgYSBncm91cCBvZiBUYXNrQ29tcGxldGVkSGFuZGxlcnMgaW50byBhIHNpbmdsZSBUYXNrQ29tcGxldGVkQ2FsbGJhY2suXG4gKlxuICogVGhlIGNvbXBvc2UgY2FsbGJhY2sgd2lsbCByZWNlaXZlIGFuIG91dGNvbWUgYW5kIHdpbGwgZGVsZWdhdGUgdG8gdGhlIGFwcHJvcHJpYXRlIGhhbmRsZXIgYmFzZWRcbiAqIG9uIHRoaXMgb3V0Y29tZS5cbiAqXG4gKiBAcGFyYW0gY2FsbGJhY2tzIGEgbWFwIG9mIG91dGNvbWVzIHRvIGhhbmRsZXJzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY29tcG9zZVRhc2tDb21wbGV0ZWRDYWxsYmFja3MoXG4gICAgY2FsbGJhY2tzOiBSZWNvcmQ8VGFza1Byb2Nlc3NpbmdPdXRjb21lLCBUYXNrQ29tcGxldGVkSGFuZGxlcj4pOiBUYXNrQ29tcGxldGVkQ2FsbGJhY2sge1xuICByZXR1cm4gKHRhc2s6IFRhc2ssIG91dGNvbWU6IFRhc2tQcm9jZXNzaW5nT3V0Y29tZSwgbWVzc2FnZTogc3RyaW5nfG51bGwpOiB2b2lkID0+IHtcbiAgICBjb25zdCBjYWxsYmFjayA9IGNhbGxiYWNrc1tvdXRjb21lXTtcbiAgICBpZiAoY2FsbGJhY2sgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIHRhc2sgb3V0Y29tZTogXCIke291dGNvbWV9XCIgLSBzdXBwb3J0ZWQgb3V0Y29tZXM6ICR7XG4gICAgICAgICAgSlNPTi5zdHJpbmdpZnkoT2JqZWN0LmtleXMoY2FsbGJhY2tzKSl9YCk7XG4gICAgfVxuICAgIGNhbGxiYWNrKHRhc2ssIG1lc3NhZ2UpO1xuICB9O1xufVxuXG4vKipcbiAqIENyZWF0ZSBhIGhhbmRsZXIgdGhhdCB3aWxsIG1hcmsgdGhlIGVudHJ5LXBvaW50cyBpbiBhIHBhY2thZ2UgYXMgYmVpbmcgcHJvY2Vzc2VkLlxuICpcbiAqIEBwYXJhbSBwa2dKc29uVXBkYXRlciBUaGUgc2VydmljZSB1c2VkIHRvIHVwZGF0ZSB0aGUgcGFja2FnZS5qc29uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVNYXJrQXNQcm9jZXNzZWRIYW5kbGVyKFxuICAgIGZzOiBQYXRoTWFuaXB1bGF0aW9uLCBwa2dKc29uVXBkYXRlcjogUGFja2FnZUpzb25VcGRhdGVyKTogVGFza0NvbXBsZXRlZEhhbmRsZXIge1xuICByZXR1cm4gKHRhc2s6IFRhc2spOiB2b2lkID0+IHtcbiAgICBjb25zdCB7ZW50cnlQb2ludCwgZm9ybWF0UHJvcGVydGllc1RvTWFya0FzUHJvY2Vzc2VkLCBwcm9jZXNzRHRzfSA9IHRhc2s7XG4gICAgY29uc3QgcGFja2FnZUpzb25QYXRoID0gZnMucmVzb2x2ZShlbnRyeVBvaW50LnBhdGgsICdwYWNrYWdlLmpzb24nKTtcbiAgICBjb25zdCBwcm9wc1RvTWFya0FzUHJvY2Vzc2VkOiBQYWNrYWdlSnNvbkZvcm1hdFByb3BlcnRpZXNbXSA9XG4gICAgICAgIFsuLi5mb3JtYXRQcm9wZXJ0aWVzVG9NYXJrQXNQcm9jZXNzZWRdO1xuICAgIGlmIChwcm9jZXNzRHRzICE9PSBEdHNQcm9jZXNzaW5nLk5vKSB7XG4gICAgICBwcm9wc1RvTWFya0FzUHJvY2Vzc2VkLnB1c2goJ3R5cGluZ3MnKTtcbiAgICB9XG4gICAgbWFya0FzUHJvY2Vzc2VkKFxuICAgICAgICBwa2dKc29uVXBkYXRlciwgZW50cnlQb2ludC5wYWNrYWdlSnNvbiwgcGFja2FnZUpzb25QYXRoLCBwcm9wc1RvTWFya0FzUHJvY2Vzc2VkKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBoYW5kbGVyIHRoYXQgd2lsbCB0aHJvdyBhbiBlcnJvci5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVRocm93RXJyb3JIYW5kbGVyKGZzOiBSZWFkb25seUZpbGVTeXN0ZW0pOiBUYXNrQ29tcGxldGVkSGFuZGxlciB7XG4gIHJldHVybiAodGFzazogVGFzaywgbWVzc2FnZTogc3RyaW5nfG51bGwpOiB2b2lkID0+IHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoY3JlYXRlRXJyb3JNZXNzYWdlKGZzLCB0YXNrLCBtZXNzYWdlKSk7XG4gIH07XG59XG5cbi8qKlxuICogQ3JlYXRlIGEgaGFuZGxlciB0aGF0IGxvZ3MgYW4gZXJyb3IgYW5kIG1hcmtzIHRoZSB0YXNrIGFzIGZhaWxlZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUxvZ0Vycm9ySGFuZGxlcihcbiAgICBsb2dnZXI6IExvZ2dlciwgZnM6IFJlYWRvbmx5RmlsZVN5c3RlbSwgdGFza1F1ZXVlOiBUYXNrUXVldWUpOiBUYXNrQ29tcGxldGVkSGFuZGxlciB7XG4gIHJldHVybiAodGFzazogVGFzaywgbWVzc2FnZTogc3RyaW5nfG51bGwpOiB2b2lkID0+IHtcbiAgICB0YXNrUXVldWUubWFya0FzRmFpbGVkKHRhc2spO1xuICAgIGxvZ2dlci5lcnJvcihjcmVhdGVFcnJvck1lc3NhZ2UoZnMsIHRhc2ssIG1lc3NhZ2UpKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlRXJyb3JNZXNzYWdlKGZzOiBSZWFkb25seUZpbGVTeXN0ZW0sIHRhc2s6IFRhc2ssIG1lc3NhZ2U6IHN0cmluZ3xudWxsKTogc3RyaW5nIHtcbiAgY29uc3QganNGb3JtYXQgPSBgXFxgJHt0YXNrLmZvcm1hdFByb3BlcnR5fVxcYCBhcyAke1xuICAgICAgZ2V0RW50cnlQb2ludEZvcm1hdChmcywgdGFzay5lbnRyeVBvaW50LCB0YXNrLmZvcm1hdFByb3BlcnR5KSA/PyAndW5rbm93biBmb3JtYXQnfWA7XG4gIGNvbnN0IGZvcm1hdCA9IHRhc2sudHlwaW5nc09ubHkgPyBgdHlwaW5ncyBvbmx5IHVzaW5nICR7anNGb3JtYXR9YCA6IGpzRm9ybWF0O1xuICBtZXNzYWdlID0gbWVzc2FnZSAhPT0gbnVsbCA/IGAgZHVlIHRvICR7bWVzc2FnZX1gIDogJyc7XG4gIHJldHVybiBgRmFpbGVkIHRvIGNvbXBpbGUgZW50cnktcG9pbnQgJHt0YXNrLmVudHJ5UG9pbnQubmFtZX0gKCR7Zm9ybWF0fSlgICsgbWVzc2FnZTtcbn1cbiJdfQ==