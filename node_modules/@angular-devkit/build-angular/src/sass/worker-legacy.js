"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
const sass_1 = require("sass");
const worker_threads_1 = require("worker_threads");
if (!worker_threads_1.parentPort || !worker_threads_1.workerData) {
    throw new Error('Sass worker must be executed as a Worker.');
}
// The importer variables are used to proxy import requests to the main thread
const { workerImporterPort, importerSignal } = worker_threads_1.workerData;
worker_threads_1.parentPort.on('message', ({ id, hasImporter, options }) => {
    try {
        if (hasImporter) {
            // When a custom importer function is present, the importer request must be proxied
            // back to the main thread where it can be executed.
            // This process must be synchronous from the perspective of dart-sass. The `Atomics`
            // functions combined with the shared memory `importSignal` and the Node.js
            // `receiveMessageOnPort` function are used to ensure synchronous behavior.
            options.importer = function (url, prev) {
                var _a;
                Atomics.store(importerSignal, 0, 0);
                const { fromImport } = this;
                workerImporterPort.postMessage({ id, url, prev, fromImport });
                Atomics.wait(importerSignal, 0, 0);
                return (_a = (0, worker_threads_1.receiveMessageOnPort)(workerImporterPort)) === null || _a === void 0 ? void 0 : _a.message;
            };
        }
        // The synchronous Sass render function can be up to two times faster than the async variant
        const result = (0, sass_1.renderSync)(options);
        worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.postMessage({ id, result });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }
    catch (error) {
        // Needed because V8 will only serialize the message and stack properties of an Error instance.
        const { formatted, file, line, column, message, stack } = error;
        worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.postMessage({ id, error: { formatted, file, line, column, message, stack } });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2VyLWxlZ2FjeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuZ3VsYXJfZGV2a2l0L2J1aWxkX2FuZ3VsYXIvc3JjL3Nhc3Mvd29ya2VyLWxlZ2FjeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOztBQUVILCtCQUE0RTtBQUM1RSxtREFBMkY7QUFxQjNGLElBQUksQ0FBQywyQkFBVSxJQUFJLENBQUMsMkJBQVUsRUFBRTtJQUM5QixNQUFNLElBQUksS0FBSyxDQUFDLDJDQUEyQyxDQUFDLENBQUM7Q0FDOUQ7QUFFRCw4RUFBOEU7QUFDOUUsTUFBTSxFQUFFLGtCQUFrQixFQUFFLGNBQWMsRUFBRSxHQUFHLDJCQUc5QyxDQUFDO0FBRUYsMkJBQVUsQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsV0FBVyxFQUFFLE9BQU8sRUFBd0IsRUFBRSxFQUFFO0lBQzlFLElBQUk7UUFDRixJQUFJLFdBQVcsRUFBRTtZQUNmLG1GQUFtRjtZQUNuRixvREFBb0Q7WUFDcEQsb0ZBQW9GO1lBQ3BGLDJFQUEyRTtZQUMzRSwyRUFBMkU7WUFDM0UsT0FBTyxDQUFDLFFBQVEsR0FBRyxVQUFVLEdBQUcsRUFBRSxJQUFJOztnQkFDcEMsT0FBTyxDQUFDLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUNwQyxNQUFNLEVBQUUsVUFBVSxFQUFFLEdBQUcsSUFBSSxDQUFDO2dCQUM1QixrQkFBa0IsQ0FBQyxXQUFXLENBQUMsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDO2dCQUM5RCxPQUFPLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBRW5DLE9BQU8sTUFBQSxJQUFBLHFDQUFvQixFQUFDLGtCQUFrQixDQUFDLDBDQUFFLE9BQXlCLENBQUM7WUFDN0UsQ0FBQyxDQUFDO1NBQ0g7UUFFRCw0RkFBNEY7UUFDNUYsTUFBTSxNQUFNLEdBQUcsSUFBQSxpQkFBVSxFQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRW5DLDJCQUFVLGFBQVYsMkJBQVUsdUJBQVYsMkJBQVUsQ0FBRSxXQUFXLENBQUMsRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQztRQUN4Qyw4REFBOEQ7S0FDL0Q7SUFBQyxPQUFPLEtBQVUsRUFBRTtRQUNuQiwrRkFBK0Y7UUFDL0YsTUFBTSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEdBQUcsS0FBSyxDQUFDO1FBQ2hFLDJCQUFVLGFBQVYsMkJBQVUsdUJBQVYsMkJBQVUsQ0FBRSxXQUFXLENBQUMsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7S0FDM0Y7QUFDSCxDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgeyBJbXBvcnRlclJlc3VsdCwgTGVnYWN5T3B0aW9ucyBhcyBPcHRpb25zLCByZW5kZXJTeW5jIH0gZnJvbSAnc2Fzcyc7XG5pbXBvcnQgeyBNZXNzYWdlUG9ydCwgcGFyZW50UG9ydCwgcmVjZWl2ZU1lc3NhZ2VPblBvcnQsIHdvcmtlckRhdGEgfSBmcm9tICd3b3JrZXJfdGhyZWFkcyc7XG5cbi8qKlxuICogQSByZXF1ZXN0IHRvIHJlbmRlciBhIFNhc3Mgc3R5bGVzaGVldCB1c2luZyB0aGUgc3VwcGxpZWQgb3B0aW9ucy5cbiAqL1xuaW50ZXJmYWNlIFJlbmRlclJlcXVlc3RNZXNzYWdlIHtcbiAgLyoqXG4gICAqIFRoZSB1bmlxdWUgcmVxdWVzdCBpZGVudGlmaWVyIHRoYXQgbGlua3MgdGhlIHJlbmRlciBhY3Rpb24gd2l0aCBhIGNhbGxiYWNrIGFuZCBvcHRpb25hbFxuICAgKiBpbXBvcnRlciBvbiB0aGUgbWFpbiB0aHJlYWQuXG4gICAqL1xuICBpZDogbnVtYmVyO1xuICAvKipcbiAgICogVGhlIFNhc3Mgb3B0aW9ucyB0byBwcm92aWRlIHRvIHRoZSBgZGFydC1zYXNzYCByZW5kZXIgZnVuY3Rpb24uXG4gICAqL1xuICBvcHRpb25zOiBPcHRpb25zPCdzeW5jJz47XG4gIC8qKlxuICAgKiBJbmRpY2F0ZXMgdGhlIHJlcXVlc3QgaGFzIGEgY3VzdG9tIGltcG9ydGVyIGZ1bmN0aW9uIG9uIHRoZSBtYWluIHRocmVhZC5cbiAgICovXG4gIGhhc0ltcG9ydGVyOiBib29sZWFuO1xufVxuXG5pZiAoIXBhcmVudFBvcnQgfHwgIXdvcmtlckRhdGEpIHtcbiAgdGhyb3cgbmV3IEVycm9yKCdTYXNzIHdvcmtlciBtdXN0IGJlIGV4ZWN1dGVkIGFzIGEgV29ya2VyLicpO1xufVxuXG4vLyBUaGUgaW1wb3J0ZXIgdmFyaWFibGVzIGFyZSB1c2VkIHRvIHByb3h5IGltcG9ydCByZXF1ZXN0cyB0byB0aGUgbWFpbiB0aHJlYWRcbmNvbnN0IHsgd29ya2VySW1wb3J0ZXJQb3J0LCBpbXBvcnRlclNpZ25hbCB9ID0gd29ya2VyRGF0YSBhcyB7XG4gIHdvcmtlckltcG9ydGVyUG9ydDogTWVzc2FnZVBvcnQ7XG4gIGltcG9ydGVyU2lnbmFsOiBJbnQzMkFycmF5O1xufTtcblxucGFyZW50UG9ydC5vbignbWVzc2FnZScsICh7IGlkLCBoYXNJbXBvcnRlciwgb3B0aW9ucyB9OiBSZW5kZXJSZXF1ZXN0TWVzc2FnZSkgPT4ge1xuICB0cnkge1xuICAgIGlmIChoYXNJbXBvcnRlcikge1xuICAgICAgLy8gV2hlbiBhIGN1c3RvbSBpbXBvcnRlciBmdW5jdGlvbiBpcyBwcmVzZW50LCB0aGUgaW1wb3J0ZXIgcmVxdWVzdCBtdXN0IGJlIHByb3hpZWRcbiAgICAgIC8vIGJhY2sgdG8gdGhlIG1haW4gdGhyZWFkIHdoZXJlIGl0IGNhbiBiZSBleGVjdXRlZC5cbiAgICAgIC8vIFRoaXMgcHJvY2VzcyBtdXN0IGJlIHN5bmNocm9ub3VzIGZyb20gdGhlIHBlcnNwZWN0aXZlIG9mIGRhcnQtc2Fzcy4gVGhlIGBBdG9taWNzYFxuICAgICAgLy8gZnVuY3Rpb25zIGNvbWJpbmVkIHdpdGggdGhlIHNoYXJlZCBtZW1vcnkgYGltcG9ydFNpZ25hbGAgYW5kIHRoZSBOb2RlLmpzXG4gICAgICAvLyBgcmVjZWl2ZU1lc3NhZ2VPblBvcnRgIGZ1bmN0aW9uIGFyZSB1c2VkIHRvIGVuc3VyZSBzeW5jaHJvbm91cyBiZWhhdmlvci5cbiAgICAgIG9wdGlvbnMuaW1wb3J0ZXIgPSBmdW5jdGlvbiAodXJsLCBwcmV2KSB7XG4gICAgICAgIEF0b21pY3Muc3RvcmUoaW1wb3J0ZXJTaWduYWwsIDAsIDApO1xuICAgICAgICBjb25zdCB7IGZyb21JbXBvcnQgfSA9IHRoaXM7XG4gICAgICAgIHdvcmtlckltcG9ydGVyUG9ydC5wb3N0TWVzc2FnZSh7IGlkLCB1cmwsIHByZXYsIGZyb21JbXBvcnQgfSk7XG4gICAgICAgIEF0b21pY3Mud2FpdChpbXBvcnRlclNpZ25hbCwgMCwgMCk7XG5cbiAgICAgICAgcmV0dXJuIHJlY2VpdmVNZXNzYWdlT25Qb3J0KHdvcmtlckltcG9ydGVyUG9ydCk/Lm1lc3NhZ2UgYXMgSW1wb3J0ZXJSZXN1bHQ7XG4gICAgICB9O1xuICAgIH1cblxuICAgIC8vIFRoZSBzeW5jaHJvbm91cyBTYXNzIHJlbmRlciBmdW5jdGlvbiBjYW4gYmUgdXAgdG8gdHdvIHRpbWVzIGZhc3RlciB0aGFuIHRoZSBhc3luYyB2YXJpYW50XG4gICAgY29uc3QgcmVzdWx0ID0gcmVuZGVyU3luYyhvcHRpb25zKTtcblxuICAgIHBhcmVudFBvcnQ/LnBvc3RNZXNzYWdlKHsgaWQsIHJlc3VsdCB9KTtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgLy8gTmVlZGVkIGJlY2F1c2UgVjggd2lsbCBvbmx5IHNlcmlhbGl6ZSB0aGUgbWVzc2FnZSBhbmQgc3RhY2sgcHJvcGVydGllcyBvZiBhbiBFcnJvciBpbnN0YW5jZS5cbiAgICBjb25zdCB7IGZvcm1hdHRlZCwgZmlsZSwgbGluZSwgY29sdW1uLCBtZXNzYWdlLCBzdGFjayB9ID0gZXJyb3I7XG4gICAgcGFyZW50UG9ydD8ucG9zdE1lc3NhZ2UoeyBpZCwgZXJyb3I6IHsgZm9ybWF0dGVkLCBmaWxlLCBsaW5lLCBjb2x1bW4sIG1lc3NhZ2UsIHN0YWNrIH0gfSk7XG4gIH1cbn0pO1xuIl19