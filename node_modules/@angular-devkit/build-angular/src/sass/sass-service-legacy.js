"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SassLegacyWorkerImplementation = void 0;
const path_1 = require("path");
const worker_threads_1 = require("worker_threads");
const environment_options_1 = require("../utils/environment-options");
/**
 * The maximum number of Workers that will be created to execute render requests.
 */
const MAX_RENDER_WORKERS = environment_options_1.maxWorkers;
/**
 * A Sass renderer implementation that provides an interface that can be used by Webpack's
 * `sass-loader`. The implementation uses a Worker thread to perform the Sass rendering
 * with the `dart-sass` package.  The `dart-sass` synchronous render function is used within
 * the worker which can be up to two times faster than the asynchronous variant.
 */
class SassLegacyWorkerImplementation {
    constructor() {
        this.workers = [];
        this.availableWorkers = [];
        this.requests = new Map();
        this.workerPath = (0, path_1.join)(__dirname, './worker-legacy.js');
        this.idCounter = 1;
        this.nextWorkerIndex = 0;
    }
    /**
     * Provides information about the Sass implementation.
     * This mimics enough of the `dart-sass` value to be used with the `sass-loader`.
     */
    get info() {
        return 'dart-sass\tworker';
    }
    /**
     * The synchronous render function is not used by the `sass-loader`.
     */
    renderSync() {
        throw new Error('Sass renderSync is not supported.');
    }
    /**
     * Asynchronously request a Sass stylesheet to be renderered.
     *
     * @param options The `dart-sass` options to use when rendering the stylesheet.
     * @param callback The function to execute when the rendering is complete.
     */
    render(options, callback) {
        // The `functions`, `logger` and `importer` options are JavaScript functions that cannot be transferred.
        // If any additional function options are added in the future, they must be excluded as well.
        const { functions, importer, logger, ...serializableOptions } = options;
        // The CLI's configuration does not use or expose the ability to defined custom Sass functions
        if (functions && Object.keys(functions).length > 0) {
            throw new Error('Sass custom functions are not supported.');
        }
        let workerIndex = this.availableWorkers.pop();
        if (workerIndex === undefined) {
            if (this.workers.length < MAX_RENDER_WORKERS) {
                workerIndex = this.workers.length;
                this.workers.push(this.createWorker());
            }
            else {
                workerIndex = this.nextWorkerIndex++;
                if (this.nextWorkerIndex >= this.workers.length) {
                    this.nextWorkerIndex = 0;
                }
            }
        }
        const request = this.createRequest(workerIndex, callback, importer);
        this.requests.set(request.id, request);
        this.workers[workerIndex].postMessage({
            id: request.id,
            hasImporter: !!importer,
            options: serializableOptions,
        });
    }
    /**
     * Shutdown the Sass render worker.
     * Executing this method will stop any pending render requests.
     */
    close() {
        for (const worker of this.workers) {
            try {
                void worker.terminate();
            }
            catch (_a) { }
        }
        this.requests.clear();
    }
    createWorker() {
        const { port1: mainImporterPort, port2: workerImporterPort } = new worker_threads_1.MessageChannel();
        const importerSignal = new Int32Array(new SharedArrayBuffer(4));
        const worker = new worker_threads_1.Worker(this.workerPath, {
            workerData: { workerImporterPort, importerSignal },
            transferList: [workerImporterPort],
        });
        worker.on('message', (response) => {
            const request = this.requests.get(response.id);
            if (!request) {
                return;
            }
            this.requests.delete(response.id);
            this.availableWorkers.push(request.workerIndex);
            if (response.result) {
                // The results are expected to be Node.js `Buffer` objects but will each be transferred as
                // a Uint8Array that does not have the expected `toString` behavior of a `Buffer`.
                const { css, map, stats } = response.result;
                const result = {
                    // This `Buffer.from` override will use the memory directly and avoid making a copy
                    css: Buffer.from(css.buffer, css.byteOffset, css.byteLength),
                    stats,
                };
                if (map) {
                    // This `Buffer.from` override will use the memory directly and avoid making a copy
                    result.map = Buffer.from(map.buffer, map.byteOffset, map.byteLength);
                }
                request.callback(undefined, result);
            }
            else {
                request.callback(response.error);
            }
        });
        mainImporterPort.on('message', ({ id, url, prev, fromImport, }) => {
            const request = this.requests.get(id);
            if (!(request === null || request === void 0 ? void 0 : request.importers)) {
                mainImporterPort.postMessage(null);
                Atomics.store(importerSignal, 0, 1);
                Atomics.notify(importerSignal, 0);
                return;
            }
            this.processImporters(request.importers, url, prev, fromImport)
                .then((result) => {
                mainImporterPort.postMessage(result);
            })
                .catch((error) => {
                mainImporterPort.postMessage(error);
            })
                .finally(() => {
                Atomics.store(importerSignal, 0, 1);
                Atomics.notify(importerSignal, 0);
            });
        });
        mainImporterPort.unref();
        return worker;
    }
    async processImporters(importers, url, prev, fromImport) {
        let result = null;
        for (const importer of importers) {
            result = await new Promise((resolve) => {
                // Importers can be both sync and async
                const innerResult = importer.call({ fromImport }, url, prev, resolve);
                if (innerResult !== undefined) {
                    resolve(innerResult);
                }
            });
            if (result) {
                break;
            }
        }
        return result;
    }
    createRequest(workerIndex, callback, importer) {
        return {
            id: this.idCounter++,
            workerIndex,
            callback,
            importers: !importer || Array.isArray(importer) ? importer : [importer],
        };
    }
}
exports.SassLegacyWorkerImplementation = SassLegacyWorkerImplementation;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2Fzcy1zZXJ2aWNlLWxlZ2FjeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuZ3VsYXJfZGV2a2l0L2J1aWxkX2FuZ3VsYXIvc3JjL3Nhc3Mvc2Fzcy1zZXJ2aWNlLWxlZ2FjeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCwrQkFBNEI7QUFVNUIsbURBQXdEO0FBQ3hELHNFQUEwRDtBQUUxRDs7R0FFRztBQUNILE1BQU0sa0JBQWtCLEdBQUcsZ0NBQVUsQ0FBQztBQTBCdEM7Ozs7O0dBS0c7QUFDSCxNQUFhLDhCQUE4QjtJQUEzQztRQUNtQixZQUFPLEdBQWEsRUFBRSxDQUFDO1FBQ3ZCLHFCQUFnQixHQUFhLEVBQUUsQ0FBQztRQUNoQyxhQUFRLEdBQUcsSUFBSSxHQUFHLEVBQXlCLENBQUM7UUFDNUMsZUFBVSxHQUFHLElBQUEsV0FBSSxFQUFDLFNBQVMsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1FBQzVELGNBQVMsR0FBRyxDQUFDLENBQUM7UUFDZCxvQkFBZSxHQUFHLENBQUMsQ0FBQztJQTRMOUIsQ0FBQztJQTFMQzs7O09BR0c7SUFDSCxJQUFJLElBQUk7UUFDTixPQUFPLG1CQUFtQixDQUFDO0lBQzdCLENBQUM7SUFFRDs7T0FFRztJQUNILFVBQVU7UUFDUixNQUFNLElBQUksS0FBSyxDQUFDLG1DQUFtQyxDQUFDLENBQUM7SUFDdkQsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsTUFBTSxDQUFDLE9BQXlCLEVBQUUsUUFBd0I7UUFDeEQsd0dBQXdHO1FBQ3hHLDZGQUE2RjtRQUM3RixNQUFNLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsR0FBRyxtQkFBbUIsRUFBRSxHQUFHLE9BQU8sQ0FBQztRQUV4RSw4RkFBOEY7UUFDOUYsSUFBSSxTQUFTLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxN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QXdCLEVBQ3hCLFFBQXFGO1FBRXJGLE9BQU87WUFDTCxFQUFFLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUNwQixXQUFXO1lBQ1gsUUFBUTtZQUNSLFNBQVMsRUFBRSxDQUFDLFFBQVEsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDO1NBQ3hFLENBQUM7SUFDSixDQUFDO0NBQ0Y7QUFsTUQsd0VBa01DIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7IGpvaW4gfSBmcm9tICdwYXRoJztcbmltcG9ydCB7XG4gIExlZ2FjeUFzeW5jSW1wb3J0ZXIgYXMgQXN5bmNJbXBvcnRlcixcbiAgTGVnYWN5UmVzdWx0IGFzIENvbXBpbGVSZXN1bHQsXG4gIExlZ2FjeUV4Y2VwdGlvbiBhcyBFeGNlcHRpb24sXG4gIExlZ2FjeUltcG9ydGVyUmVzdWx0IGFzIEltcG9ydGVyUmVzdWx0LFxuICBMZWdhY3lJbXBvcnRlclRoaXMgYXMgSW1wb3J0ZXJUaGlzLFxuICBMZWdhY3lPcHRpb25zIGFzIE9wdGlvbnMsXG4gIExlZ2FjeVN5bmNJbXBvcnRlciBhcyBTeW5jSW1wb3J0ZXIsXG59IGZyb20gJ3Nhc3MnO1xuaW1wb3J0IHsgTWVzc2FnZUNoYW5uZWwsIFdvcmtlciB9IGZyb20gJ3dvcmtlcl90aHJlYWRzJztcbmltcG9ydCB7IG1heFdvcmtlcnMgfSBmcm9tICcuLi91dGlscy9lbnZpcm9ubWVudC1vcHRpb25zJztcblxuLyoqXG4gKiBUaGUgbWF4aW11bSBudW1iZXIgb2YgV29ya2VycyB0aGF0IHdpbGwgYmUgY3JlYXRlZCB0byBleGVjdXRlIHJlbmRlciByZXF1ZXN0cy5cbiAqL1xuY29uc3QgTUFYX1JFTkRFUl9XT1JLRVJTID0gbWF4V29ya2VycztcblxuLyoqXG4gKiBUaGUgY2FsbGJhY2sgdHlwZSBmb3IgdGhlIGBkYXJ0LXNhc3NgIGFzeW5jaHJvbm91cyByZW5kZXIgZnVuY3Rpb24uXG4gKi9cbnR5cGUgUmVuZGVyQ2FsbGJhY2sgPSAoZXJyb3I/OiBFeGNlcHRpb24sIHJlc3VsdD86IENvbXBpbGVSZXN1bHQpID0+IHZvaWQ7XG5cbi8qKlxuICogQW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIGNvbnRleHR1YWwgaW5mb3JtYXRpb24gZm9yIGEgc3BlY2lmaWMgcmVuZGVyIHJlcXVlc3QuXG4gKi9cbmludGVyZmFjZSBSZW5kZXJSZXF1ZXN0IHtcbiAgaWQ6IG51bWJlcjtcbiAgd29ya2VySW5kZXg6IG51bWJlcjtcbiAgY2FsbGJhY2s6IFJlbmRlckNhbGxiYWNrO1xuICBpbXBvcnRlcnM/OiAoU3luY0ltcG9ydGVyIHwgQXN5bmNJbXBvcnRlcilbXTtcbn1cblxuLyoqXG4gKiBBIHJlc3BvbnNlIGZyb20gdGhlIFNhc3MgcmVuZGVyIFdvcmtlciBjb250YWluaW5nIHRoZSByZXN1bHQgb2YgdGhlIG9wZXJhdGlvbi5cbiAqL1xuaW50ZXJmYWNlIFJlbmRlclJlc3BvbnNlTWVzc2FnZSB7XG4gIGlkOiBudW1iZXI7XG4gIGVycm9yPzogRXhjZXB0aW9uO1xuICByZXN1bHQ/OiBDb21waWxlUmVzdWx0O1xufVxuXG4vKipcbiAqIEEgU2FzcyByZW5kZXJlciBpbXBsZW1lbnRhdGlvbiB0aGF0IHByb3ZpZGVzIGFuIGludGVyZmFjZSB0aGF0IGNhbiBiZSB1c2VkIGJ5IFdlYnBhY2snc1xuICogYHNhc3MtbG9hZGVyYC4gVGhlIGltcGxlbWVudGF0aW9uIHVzZXMgYSBXb3JrZXIgdGhyZWFkIHRvIHBlcmZvcm0gdGhlIFNhc3MgcmVuZGVyaW5nXG4gKiB3aXRoIHRoZSBgZGFydC1zYXNzYCBwYWNrYWdlLiAgVGhlIGBkYXJ0LXNhc3NgIHN5bmNocm9ub3VzIHJlbmRlciBmdW5jdGlvbiBpcyB1c2VkIHdpdGhpblxuICogdGhlIHdvcmtlciB3aGljaCBjYW4gYmUgdXAgdG8gdHdvIHRpbWVzIGZhc3RlciB0aGFuIHRoZSBhc3luY2hyb25vdXMgdmFyaWFudC5cbiAqL1xuZXhwb3J0IGNsYXNzIFNhc3NMZWdhY3lXb3JrZXJJbXBsZW1lbnRhdGlvbiB7XG4gIHByaXZhdGUgcmVhZG9ubHkgd29ya2VyczogV29ya2VyW10gPSBbXTtcbiAgcHJpdmF0ZSByZWFkb25seSBhdmFpbGFibGVXb3JrZXJzOiBudW1iZXJbXSA9IFtdO1xuICBwcml2YXRlIHJlYWRvbmx5IHJlcXVlc3RzID0gbmV3IE1hcDxudW1iZXIsIFJlbmRlclJlcXVlc3Q+KCk7XG4gIHByaXZhdGUgcmVhZG9ubHkgd29ya2VyUGF0aCA9IGpvaW4oX19kaXJuYW1lLCAnLi93b3JrZXItbGVnYWN5LmpzJyk7XG4gIHByaXZhdGUgaWRDb3VudGVyID0gMTtcbiAgcHJpdmF0ZSBuZXh0V29ya2VySW5kZXggPSAwO1xuXG4gIC8qKlxuICAgKiBQcm92aWRlcyBpbmZvcm1hdGlvbiBhYm91dCB0aGUgU2FzcyBpbXBsZW1lbnRhdGlvbi5cbiAgICogVGhpcyBtaW1pY3MgZW5vdWdoIG9mIHRoZSBgZGFydC1zYXNzYCB2YWx1ZSB0byBiZSB1c2VkIHdpdGggdGhlIGBzYXNzLWxvYWRlcmAuXG4gICAqL1xuICBnZXQgaW5mbygpOiBzdHJpbmcge1xuICAgIHJldHVybiAnZGFydC1zYXNzXFx0d29ya2VyJztcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgc3luY2hyb25vdXMgcmVuZGVyIGZ1bmN0aW9uIGlzIG5vdCB1c2VkIGJ5IHRoZSBgc2Fzcy1sb2FkZXJgLlxuICAgKi9cbiAgcmVuZGVyU3luYygpOiBuZXZlciB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdTYXNzIHJlbmRlclN5bmMgaXMgbm90IHN1cHBvcnRlZC4nKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBc3luY2hyb25vdXNseSByZXF1ZXN0IGEgU2FzcyBzdHlsZXNoZWV0IHRvIGJlIHJlbmRlcmVyZWQuXG4gICAqXG4gICAqIEBwYXJhbSBvcHRpb25zIFRoZSBgZGFydC1zYXNzYCBvcHRpb25zIHRvIHVzZSB3aGVuIHJlbmRlcmluZyB0aGUgc3R5bGVzaGVldC5cbiAgICogQHBhcmFtIGNhbGxiYWNrIFRoZSBmdW5jdGlvbiB0byBleGVjdXRlIHdoZW4gdGhlIHJlbmRlcmluZyBpcyBjb21wbGV0ZS5cbiAgICovXG4gIHJlbmRlcihvcHRpb25zOiBPcHRpb25zPCdhc3luYyc+LCBjYWxsYmFjazogUmVuZGVyQ2FsbGJhY2spOiB2b2lkIHtcbiAgICAvLyBUaGUgYGZ1bmN0aW9uc2AsIGBsb2dnZXJgIGFuZCBgaW1wb3J0ZXJgIG9wdGlvbnMgYXJlIEphdmFTY3JpcHQgZnVuY3Rpb25zIHRoYXQgY2Fubm90IGJlIHRyYW5zZmVycmVkLlxuICAgIC8vIElmIGFueSBhZGRpdGlvbmFsIGZ1bmN0aW9uIG9wdGlvbnMgYXJlIGFkZGVkIGluIHRoZSBmdXR1cmUsIHRoZXkgbXVzdCBiZSBleGNsdWRlZCBhcyB3ZWxsLlxuICAgIGNvbnN0IHsgZnVuY3Rpb25zLCBpbXBvcnRlciwgbG9nZ2VyLCAuLi5zZXJpYWxpemFibGVPcHRpb25zIH0gPSBvcHRpb25zO1xuXG4gICAgLy8gVGhlIENMSSdzIGNvbmZpZ3VyYXRpb24gZG9lcyBub3QgdXNlIG9yIGV4cG9zZSB0aGUgYWJpbGl0eSB0byBkZWZpbmVkIGN1c3RvbSBTYXNzIGZ1bmN0aW9uc1xuICAgIGlmIChmdW5jdGlvbnMgJiYgT2JqZWN0LmtleXMoZnVuY3Rpb25zKS5sZW5ndGggPiAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Nhc3MgY3VzdG9tIGZ1bmN0aW9ucyBhcmUgbm90IHN1cHBvcnRlZC4nKTtcbiAgICB9XG5cbiAgICBsZXQgd29ya2VySW5kZXggPSB0aGlzLmF2YWlsYWJsZVdvcmtlcnMucG9wKCk7XG4gICAgaWYgKHdvcmtlckluZGV4ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmICh0aGlzLndvcmtlcnMubGVuZ3RoIDwgTUFYX1JFTkRFUl9XT1JLRVJTKSB7XG4gICAgICAgIHdvcmtlckluZGV4ID0gdGhpcy53b3JrZXJzLmxlbmd0aDtcbiAgICAgICAgdGhpcy53b3JrZXJzLnB1c2godGhpcy5jcmVhdGVXb3JrZXIoKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB3b3JrZXJJbmRleCA9IHRoaXMubmV4dFdvcmtlckluZGV4Kys7XG4gICAgICAgIGlmICh0aGlzLm5leHRXb3JrZXJJbmRleCA+PSB0aGlzLndvcmtlcnMubGVuZ3RoKSB7XG4gICAgICAgICAgdGhpcy5uZXh0V29ya2VySW5kZXggPSAwO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgcmVxdWVzdCA9IHRoaXMuY3JlYXRlUmVxdWVzdCh3b3JrZXJJbmRleCwgY2FsbGJhY2ssIGltcG9ydGVyKTtcbiAgICB0aGlzLnJlcXVlc3RzLnNldChyZXF1ZXN0LmlkLCByZXF1ZXN0KTtcblxuICAgIHRoaXMud29ya2Vyc1t3b3JrZXJJbmRleF0ucG9zdE1lc3NhZ2Uoe1xuICAgICAgaWQ6IHJlcXVlc3QuaWQsXG4gICAgICBoYXNJbXBvcnRlcjogISFpbXBvcnRlcixcbiAgICAgIG9wdGlvbnM6IHNlcmlhbGl6YWJsZU9wdGlvbnMsXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogU2h1dGRvd24gdGhlIFNhc3MgcmVuZGVyIHdvcmtlci5cbiAgICogRXhlY3V0aW5nIHRoaXMgbWV0aG9kIHdpbGwgc3RvcCBhbnkgcGVuZGluZyByZW5kZXIgcmVxdWVzdHMuXG4gICAqL1xuICBjbG9zZSgpOiB2b2lkIHtcbiAgICBmb3IgKGNvbnN0IHdvcmtlciBvZiB0aGlzLndvcmtlcnMpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHZvaWQgd29ya2VyLnRlcm1pbmF0ZSgpO1xuICAgICAgfSBjYXRjaCB7fVxuICAgIH1cbiAgICB0aGlzLnJlcXVlc3RzLmNsZWFyKCk7XG4gIH1cblxuICBwcml2YXRlIGNyZWF0ZVdvcmtlcigpOiBXb3JrZXIge1xuICAgIGNvbnN0IHsgcG9ydDE6IG1haW5JbXBvcnRlclBvcnQsIHBvcnQyOiB3b3JrZXJJbXBvcnRlclBvcnQgfSA9IG5ldyBNZXNzYWdlQ2hhbm5lbCgpO1xuICAgIGNvbnN0IGltcG9ydGVyU2lnbmFsID0gbmV3IEludDMyQXJyYXkobmV3IFNoYXJlZEFycmF5QnVmZmVyKDQpKTtcblxuICAgIGNvbnN0IHdvcmtlciA9IG5ldyBXb3JrZXIodGhpcy53b3JrZXJQYXRoLCB7XG4gICAgICB3b3JrZXJEYXRhOiB7IHdvcmtlckltcG9ydGVyUG9ydCwgaW1wb3J0ZXJTaWduYWwgfSxcbiAgICAgIHRyYW5zZmVyTGlzdDogW3dvcmtlckltcG9ydGVyUG9ydF0sXG4gICAgfSk7XG5cbiAgICB3b3JrZXIub24oJ21lc3NhZ2UnLCAocmVzcG9uc2U6IFJlbmRlclJlc3BvbnNlTWVzc2FnZSkgPT4ge1xuICAgICAgY29uc3QgcmVxdWVzdCA9IHRoaXMucmVxdWVzdHMuZ2V0KHJlc3BvbnNlLmlkKTtcbiAgICAgIGlmICghcmVxdWVzdCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHRoaXMucmVxdWVzdHMuZGVsZXRlKHJlc3BvbnNlLmlkKTtcbiAgICAgIHRoaXMuYXZhaWxhYmxlV29ya2Vycy5wdXNoKHJlcXVlc3Qud29ya2VySW5kZXgpO1xuXG4gICAgICBpZiAocmVzcG9uc2UucmVzdWx0KSB7XG4gICAgICAgIC8vIFRoZSByZXN1bHRzIGFyZSBleHBlY3RlZCB0byBiZSBOb2RlLmpzIGBCdWZmZXJgIG9iamVjdHMgYnV0IHdpbGwgZWFjaCBiZSB0cmFuc2ZlcnJlZCBhc1xuICAgICAgICAvLyBhIFVpbnQ4QXJyYXkgdGhhdCBkb2VzIG5vdCBoYXZlIHRoZSBleHBlY3RlZCBgdG9TdHJpbmdgIGJlaGF2aW9yIG9mIGEgYEJ1ZmZlcmAuXG4gICAgICAgIGNvbnN0IHsgY3NzLCBtYXAsIHN0YXRzIH0gPSByZXNwb25zZS5yZXN1bHQ7XG4gICAgICAgIGNvbnN0IHJlc3VsdDogQ29tcGlsZVJlc3VsdCA9IHtcbiAgICAgICAgICAvLyBUaGlzIGBCdWZmZXIuZnJvbWAgb3ZlcnJpZGUgd2lsbCB1c2UgdGhlIG1lbW9yeSBkaXJlY3RseSBhbmQgYXZvaWQgbWFraW5nIGEgY29weVxuICAgICAgICAgIGNzczogQnVmZmVyLmZyb20oY3NzLmJ1ZmZlciwgY3NzLmJ5dGVPZmZzZXQsIGNzcy5ieXRlTGVuZ3RoKSxcbiAgICAgICAgICBzdGF0cyxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKG1hcCkge1xuICAgICAgICAgIC8vIFRoaXMgYEJ1ZmZlci5mcm9tYCBvdmVycmlkZSB3aWxsIHVzZSB0aGUgbWVtb3J5IGRpcmVjdGx5IGFuZCBhdm9pZCBtYWtpbmcgYSBjb3B5XG4gICAgICAgICAgcmVzdWx0Lm1hcCA9IEJ1ZmZlci5mcm9tKG1hcC5idWZmZXIsIG1hcC5ieXRlT2Zmc2V0LCBtYXAuYnl0ZUxlbmd0aCk7XG4gICAgICAgIH1cbiAgICAgICAgcmVxdWVzdC5jYWxsYmFjayh1bmRlZmluZWQsIHJlc3VsdCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXF1ZXN0LmNhbGxiYWNrKHJlc3BvbnNlLmVycm9yKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIG1haW5JbXBvcnRlclBvcnQub24oXG4gICAgICAnbWVzc2FnZScsXG4gICAgICAoe1xuICAgICAgICBpZCxcbiAgICAgICAgdXJsLFxuICAgICAgICBwcmV2LFxuICAgICAgICBmcm9tSW1wb3J0LFxuICAgICAgfToge1xuICAgICAgICBpZDogbnVtYmVyO1xuICAgICAgICB1cmw6IHN0cmluZztcbiAgICAgICAgcHJldjogc3RyaW5nO1xuICAgICAgICBmcm9tSW1wb3J0OiBib29sZWFuO1xuICAgICAgfSkgPT4ge1xuICAgICAgICBjb25zdCByZXF1ZXN0ID0gdGhpcy5yZXF1ZXN0cy5nZXQoaWQpO1xuICAgICAgICBpZiAoIXJlcXVlc3Q/LmltcG9ydGVycykge1xuICAgICAgICAgIG1haW5JbXBvcnRlclBvcnQucG9zdE1lc3NhZ2UobnVsbCk7XG4gICAgICAgICAgQXRvbWljcy5zdG9yZShpbXBvcnRlclNpZ25hbCwgMCwgMSk7XG4gICAgICAgICAgQXRvbWljcy5ub3RpZnkoaW1wb3J0ZXJTaWduYWwsIDApO1xuXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5wcm9jZXNzSW1wb3J0ZXJzKHJlcXVlc3QuaW1wb3J0ZXJzLCB1cmwsIHByZXYsIGZyb21JbXBvcnQpXG4gICAgICAgICAgLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgbWFpbkltcG9ydGVyUG9ydC5wb3N0TWVzc2FnZShyZXN1bHQpO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgbWFpbkltcG9ydGVyUG9ydC5wb3N0TWVzc2FnZShlcnJvcik7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuZmluYWxseSgoKSA9PiB7XG4gICAgICAgICAgICBBdG9taWNzLnN0b3JlKGltcG9ydGVyU2lnbmFsLCAwLCAxKTtcbiAgICAgICAgICAgIEF0b21pY3Mubm90aWZ5KGltcG9ydGVyU2lnbmFsLCAwKTtcbiAgICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgKTtcblxuICAgIG1haW5JbXBvcnRlclBvcnQudW5yZWYoKTtcblxuICAgIHJldHVybiB3b3JrZXI7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIHByb2Nlc3NJbXBvcnRlcnMoXG4gICAgaW1wb3J0ZXJzOiBJdGVyYWJsZTxTeW5jSW1wb3J0ZXIgfCBBc3luY0ltcG9ydGVyPixcbiAgICB1cmw6IHN0cmluZyxcbiAgICBwcmV2OiBzdHJpbmcsXG4gICAgZnJvbUltcG9ydDogYm9vbGVhbixcbiAgKTogUHJvbWlzZTxJbXBvcnRlclJlc3VsdD4ge1xuICAgIGxldCByZXN1bHQgPSBudWxsO1xuICAgIGZvciAoY29uc3QgaW1wb3J0ZXIgb2YgaW1wb3J0ZXJzKSB7XG4gICAgICByZXN1bHQgPSBhd2FpdCBuZXcgUHJvbWlzZTxJbXBvcnRlclJlc3VsdD4oKHJlc29sdmUpID0+IHtcbiAgICAgICAgLy8gSW1wb3J0ZXJzIGNhbiBiZSBib3RoIHN5bmMgYW5kIGFzeW5jXG4gICAgICAgIGNvbnN0IGlubmVyUmVzdWx0ID0gKGltcG9ydGVyIGFzIEFzeW5jSW1wb3J0ZXIpLmNhbGwoXG4gICAgICAgICAgeyBmcm9tSW1wb3J0IH0gYXMgSW1wb3J0ZXJUaGlzLFxuICAgICAgICAgIHVybCxcbiAgICAgICAgICBwcmV2LFxuICAgICAgICAgIHJlc29sdmUsXG4gICAgICAgICk7XG4gICAgICAgIGlmIChpbm5lclJlc3VsdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgcmVzb2x2ZShpbm5lclJlc3VsdCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBwcml2YXRlIGNyZWF0ZVJlcXVlc3QoXG4gICAgd29ya2VySW5kZXg6IG51bWJlcixcbiAgICBjYWxsYmFjazogUmVuZGVyQ2FsbGJhY2ssXG4gICAgaW1wb3J0ZXI6IFN5bmNJbXBvcnRlciB8IEFzeW5jSW1wb3J0ZXIgfCAoU3luY0ltcG9ydGVyIHwgQXN5bmNJbXBvcnRlcilbXSB8IHVuZGVmaW5lZCxcbiAgKTogUmVuZGVyUmVxdWVzdCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGlkOiB0aGlzLmlkQ291bnRlcisrLFxuICAgICAgd29ya2VySW5kZXgsXG4gICAgICBjYWxsYmFjayxcbiAgICAgIGltcG9ydGVyczogIWltcG9ydGVyIHx8IEFycmF5LmlzQXJyYXkoaW1wb3J0ZXIpID8gaW1wb3J0ZXIgOiBbaW1wb3J0ZXJdLFxuICAgIH07XG4gIH1cbn1cbiJdfQ==