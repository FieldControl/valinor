"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SassWorkerImplementation = void 0;
const node_path_1 = require("node:path");
const node_url_1 = require("node:url");
const node_worker_threads_1 = require("node:worker_threads");
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
class SassWorkerImplementation {
    constructor(rebase = false) {
        this.rebase = rebase;
        this.workers = [];
        this.availableWorkers = [];
        this.requests = new Map();
        this.workerPath = (0, node_path_1.join)(__dirname, './worker.js');
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
    compileString() {
        throw new Error('Sass compileString is not supported.');
    }
    /**
     * Asynchronously request a Sass stylesheet to be renderered.
     *
     * @param source The contents to compile.
     * @param options The `dart-sass` options to use when rendering the stylesheet.
     */
    compileStringAsync(source, options) {
        // The `functions`, `logger` and `importer` options are JavaScript functions that cannot be transferred.
        // If any additional function options are added in the future, they must be excluded as well.
        const { functions, importers, url, logger, ...serializableOptions } = options;
        // The CLI's configuration does not use or expose the ability to defined custom Sass functions
        if (functions && Object.keys(functions).length > 0) {
            throw new Error('Sass custom functions are not supported.');
        }
        return new Promise((resolve, reject) => {
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
            const callback = (error, result) => {
                var _a;
                if (error) {
                    const url = (_a = error.span) === null || _a === void 0 ? void 0 : _a.url;
                    if (url) {
                        error.span.url = (0, node_url_1.pathToFileURL)(url);
                    }
                    reject(error);
                    return;
                }
                if (!result) {
                    reject(new Error('No result.'));
                    return;
                }
                resolve(result);
            };
            const request = this.createRequest(workerIndex, callback, logger, importers);
            this.requests.set(request.id, request);
            this.workers[workerIndex].postMessage({
                id: request.id,
                source,
                hasImporter: !!(importers === null || importers === void 0 ? void 0 : importers.length),
                hasLogger: !!logger,
                rebase: this.rebase,
                options: {
                    ...serializableOptions,
                    // URL is not serializable so to convert to string here and back to URL in the worker.
                    url: url ? (0, node_url_1.fileURLToPath)(url) : undefined,
                },
            });
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
        const { port1: mainImporterPort, port2: workerImporterPort } = new node_worker_threads_1.MessageChannel();
        const importerSignal = new Int32Array(new SharedArrayBuffer(4));
        const worker = new node_worker_threads_1.Worker(this.workerPath, {
            workerData: { workerImporterPort, importerSignal },
            transferList: [workerImporterPort],
        });
        worker.on('message', (response) => {
            var _a;
            const request = this.requests.get(response.id);
            if (!request) {
                return;
            }
            this.requests.delete(response.id);
            this.availableWorkers.push(request.workerIndex);
            if (response.warnings && ((_a = request.logger) === null || _a === void 0 ? void 0 : _a.warn)) {
                for (const { message, span, ...options } of response.warnings) {
                    request.logger.warn(message, {
                        ...options,
                        span: span && {
                            ...span,
                            url: span.url ? (0, node_url_1.pathToFileURL)(span.url) : undefined,
                        },
                    });
                }
            }
            if (response.result) {
                request.callback(undefined, {
                    ...response.result,
                    // URL is not serializable so in the worker we convert to string and here back to URL.
                    loadedUrls: response.result.loadedUrls.map((p) => (0, node_url_1.pathToFileURL)(p)),
                });
            }
            else {
                request.callback(response.error);
            }
        });
        mainImporterPort.on('message', ({ id, url, options }) => {
            const request = this.requests.get(id);
            if (!(request === null || request === void 0 ? void 0 : request.importers)) {
                mainImporterPort.postMessage(null);
                Atomics.store(importerSignal, 0, 1);
                Atomics.notify(importerSignal, 0);
                return;
            }
            this.processImporters(request.importers, url, {
                ...options,
                previousResolvedModules: request.previousResolvedModules,
            })
                .then((result) => {
                var _a;
                if (result) {
                    (_a = request.previousResolvedModules) !== null && _a !== void 0 ? _a : (request.previousResolvedModules = new Set());
                    request.previousResolvedModules.add((0, node_path_1.dirname)(result));
                }
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
    async processImporters(importers, url, options) {
        for (const importer of importers) {
            if (this.isImporter(importer)) {
                // Importer
                throw new Error('Only File Importers are supported.');
            }
            // File importer (Can be sync or aync).
            const result = await importer.findFileUrl(url, options);
            if (result) {
                return (0, node_url_1.fileURLToPath)(result);
            }
        }
        return null;
    }
    createRequest(workerIndex, callback, logger, importers) {
        return {
            id: this.idCounter++,
            workerIndex,
            callback,
            logger,
            importers,
        };
    }
    isImporter(value) {
        return 'canonicalize' in value && 'load' in value;
    }
}
exports.SassWorkerImplementation = SassWorkerImplementation;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2Fzcy1zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5ndWxhcl9kZXZraXQvYnVpbGRfYW5ndWxhci9zcmMvc2Fzcy9zYXNzLXNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgseUNBQTBDO0FBQzFDLHVDQUF3RDtBQUN4RCw2REFBNkQ7QUFXN0Qsc0VBQTBEO0FBRTFEOztHQUVHO0FBQ0gsTUFBTSxrQkFBa0IsR0FBRyxnQ0FBVSxDQUFDO0FBdUR0Qzs7Ozs7R0FLRztBQUNILE1BQWEsd0JBQXdCO0lBUW5DLFlBQW9CLFNBQVMsS0FBSztRQUFkLFdBQU0sR0FBTixNQUFNLENBQVE7UUFQakIsWUFBTyxHQUFhLEVBQUUsQ0FBQztRQUN2QixxQkFBZ0IsR0FBYSxFQUFFLENBQUM7UUFDaEMsYUFBUSxHQUFHLElBQUksR0FBRyxFQUF5QixDQUFDO1FBQzVDLGVBQVUsR0FBRyxJQUFBLGdCQUFJLEVBQUMsU0FBUyxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBQ3JELGNBQVMsR0FBRyxDQUFDLENBQUM7UUFDZCxvQkFBZSxHQUFHLENBQUMsQ0FBQztJQUVTLENBQUM7SUFFdEM7OztPQUdHO0lBQ0gsSUFBSSxJQUFJO1FBQ04sT0FBTyxtQkFBbUIsQ0FBQztJQUM3QixDQUFDO0lBRUQ7O09BRUc7SUFDSCxhQUFhO1FBQ1gsTUFBTSxJQUFJLEtBQUssQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO0lBQzFELENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILGtCQUFrQixDQUNoQixNQUFjLEVBQ2QsT0FBbUY7UUFFbkYsd0dBQXdHO1FBQ3hHLDZGQUE2RjtRQUM3RixNQUFNLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLEdBQUcsbUJBQW1CLEVBQUUsR0FBRyxPQUFPLENBQUM7UUFFOUUsOEZBQThGO1FBQzlGLElBQUksU0FBUyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUNsRCxNQUFNLElBQUksS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7U0FDN0Q7UUFFRCxPQUFPLElBQUksT0FBTyxDQUFnQixDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUNwRCxJQUFJLFdBQVcsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDOUMsSUFBSSxXQUFXLEtBQUssU0FBUyxFQUFFO2dCQUM3QixJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLGtCQUFrQixFQUFFO29CQUM1QyxXQUFXLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7b0JBQ2xDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDO2lCQUN4QztxQkFBTTtvQkFDTCxXQUFXLEdBQUcsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO29CQUNyQyxJQUFJLElBQUksQ0FBQyxlQUFlLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUU7d0JBQy9DLElBQUksQ0FBQyxlQUFlLEdBQUcsQ0FBQyxDQUFDO3FCQUMxQjtpQkFDRjthQUNGO1lBRUQsTUFBTSxRQUFRLEdBQW1CLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxFQUFFOztnQkFDakQsSUFBSSxLQUFLLEVBQUU7b0JBQ1QsTUFBTSxHQUFHLEdBQUcsTUFBQSxLQUFLLENBQUMsSUFBSSwwQ0FBRSxHQUF5QixDQUFDO29CQUNsRCxJQUFJLEdBQUcsRUFBRTt3QkFDUCxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFBLHdCQUFhLEVBQUMsR0FBRyxDQUFDLENBQUM7cUJBQ3JDO29CQUVELE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFFZCxPQUFPO2lCQUNSO2dCQUVELElBQUksQ0FBQyxNQUFNLEVBQUU7b0JBQ1gsTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7b0JBRWhDLE9BQU87aUJBQ1I7Z0JBRUQsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2xCLENBQUMsQ0FBQztZQUVGLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDN0UsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUV2QyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDLFdBQVcsQ0FBQztnQkFDcEMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxFQUFFO2dCQUNkLE1BQU07Z0JBQ04sV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFBLFNBQVMsYUFBVCxTQUFTLHVCQUFULFNBQVMsQ0FBRSxNQUFNLENBQUE7Z0JBQ2hDLFNBQVMsRUFBRSxDQUFDLENBQUMsTUFBTTtnQkFDbkIsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNO2dCQUNuQixPQUFPLEVBQUU7b0JBQ1AsR0FBRyxtQkFBbUI7b0JBQ3RCLHNGQUFzRjtvQkFDdEYsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBQSx3QkFBYSxFQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTO2lCQUMxQzthQUNGLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVEOzs7T0FHRztJQUNILEtBQUs7UUFDSCxLQUFLLE1BQU0sTUFBTSxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDakMsSUFBSTtnQkFDRixLQUFLLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQzthQUN6QjtZQUFDLFdBQU0sR0FBRTtTQUNYO1FBQ0QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUN4QixDQUFDO0lBRU8sWUFBWTtRQUNsQixNQUFNLEVBQUUsS0FBSyxFQUFFLGdCQUFnQixFQUFFLEtBQUssRUFBRSxrQkFBa0IsRUFBRSxHQUFHLElBQUksb0NBQWMsRUFBRSxDQUFDO1FBQ3BGLE1BQU0sY0FBYyxHQUFHLElBQUksVUFBVSxDQUFDLElBQUksaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVoRSxNQUFNLE1BQU0sR0FBRyxJQUFJLDRCQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUN6QyxVQUFVLEVBQUUsRUFBRSxrQkFBa0IsRUFBRSxjQUFjLEVBQUU7WUFDbEQsWUFBWSxFQUFFLENBQUMsa0JBQWtCLENBQUM7U0FDbkMsQ0FBQyxDQUFDO1FBRUgsTUFBTSxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxRQUErQixFQUFFLEVBQUU7O1lBQ3ZELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUMvQyxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUNaLE9BQU87YUFDUjtZQUVELElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNsQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUVoRCxJQUFJLFFBQVEsQ0FBQyxRQUFRLEtBQUksTUFBQSxPQUFPLENBQUMsTUFBTSwwQ0FBRSxJQUFJLENBQUEsRUFBRTtnQkFDN0MsS0FBSyxNQUFNLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLE9BQU8sRUFBRSxJQUFJLFFBQVEsQ0FBQyxRQUFRLEVBQUU7b0JBQzdELE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRTt3QkFDM0IsR0FBRyxPQUFPO3dCQUNWLElBQUksRUFBRSxJQUFJLElBQUk7NEJBQ1osR0FBRyxJQUFJOzRCQUNQLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFBLHdCQUFhLEVBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTO3lCQUNwRDtxQkFDRixDQUFDLENBQUM7aUJBQ0o7YUFDRjtZQUVELElBQUksUUFBUSxDQUFDLE1BQU0sRUFBRTtnQkFDbkIsT0FBTyxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUU7b0JBQzFCLEdBQUcsUUFBUSxDQUFDLE1BQU07b0JBQ2xCLHNGQUFzRjtvQkFDdEYsVUFBVSxFQUFFLFFBQVEsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBQSx3QkFBYSxFQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUNwRSxDQUFDLENBQUM7YUFDSjtpQkFBTTtnQkFDTCxPQUFPLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUNsQztRQUNILENBQUMsQ0FBQyxDQUFDO1FBRUgsZ0JBQWdCLENBQUMsRUFBRSxDQUNqQixTQUFTLEVBQ1QsQ0FBQyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUE2RCxFQUFFLEVBQUU7WUFDbEYsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDdEMsSUFBSSxDQUFDLENBQUEsT0FBTyxhQUFQLE9BQU8sdUJBQVAsT0FBTyxDQUFFLFNBQVMsQ0FBQSxFQUFFO2dCQUN2QixnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ25DLE9BQU8sQ0FBQyxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDcEMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBRWxDLE9BQU87YUFDUjtZQUVELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLEdBQUcsRUFBRTtnQkFDNUMsR0FBRyxPQUFPO2dCQUNWLHVCQUF1QixFQUFFLE9BQU8sQ0FBQyx1QkFBdUI7YUFDekQsQ0FBQztpQkFDQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRTs7Z0JBQ2YsSUFBSSxNQUFNLEVBQUU7b0JBQ1YsTUFBQSxPQUFPLENBQUMsdUJBQXVCLG9DQUEvQixPQUFPLENBQUMsdUJBQXVCLEdBQUssSUFBSSxHQUFHLEVBQUUsRUFBQztvQkFDOUMsT0FBTyxDQUFDLHVCQUF1QixDQUFDLEdBQUcsQ0FBQyxJQUFBLG1CQUFPLEVBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztpQkFDdEQ7Z0JBRUQsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3ZDLENBQUMsQ0FBQztpQkFDRCxLQUFLLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtnQkFDZixnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDdEMsQ0FBQyxDQUFDO2lCQUNELE9BQU8sQ0FBQyxHQUFHLEVBQUU7Z0JBQ1osT0FBTyxDQUFDLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUNwQyxPQUFPLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNwQyxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FDRixDQUFDO1FBRUYsZ0JBQWdCLENBQUMsS0FBSyxFQUFFLENBQUM7UUFFekIsT0FBTyxNQUFNLENBQUM7SUFDaEIsQ0FBQztJQUVPLEtBQUssQ0FBQyxnQkFBZ0IsQ0FDNUIsU0FBOEIsRUFDOUIsR0FBVyxFQUNYLE9BQThDO1FBRTlDLEtBQUssTUFBTSxRQUFRLElBQUksU0FBUyxFQUFFO1lBQ2hDLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsRUFBRTtnQkFDN0IsV0FBVztnQkFDWCxNQUFNLElBQUksS0FBSyxDQUFDLG9DQUFvQyxDQUFDLENBQUM7YUFDdkQ7WUFFRCx1Q0FBdUM7WUFDdkMsTUFBTSxNQUFNLEdBQUcsTUFBTSxRQUFRLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUN4RCxJQUFJLE1BQU0sRUFBRTtnQkFDVixPQUFPLElBQUEsd0JBQWEsRUFBQyxNQUFNLENBQUMsQ0FBQzthQUM5QjtTQUNGO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRU8sYUFBYSxDQUNuQixXQUFtQixFQUNuQixRQUF3QixFQUN4QixNQUEwQixFQUMxQixTQUFrQztRQUVsQyxPQUFPO1lBQ0wsRUFBRSxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDcEIsV0FBVztZQUNYLFFBQVE7WUFDUixNQUFNO1lBQ04sU0FBUztTQUNWLENBQUM7SUFDSixDQUFDO0lBRU8sVUFBVSxDQUFDLEtBQWdCO1FBQ2pDLE9BQU8sY0FBYyxJQUFJLEtBQUssSUFBSSxNQUFNLElBQUksS0FBSyxDQUFDO0lBQ3BELENBQUM7Q0FDRjtBQXJPRCw0REFxT0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHsgZGlybmFtZSwgam9pbiB9IGZyb20gJ25vZGU6cGF0aCc7XG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoLCBwYXRoVG9GaWxlVVJMIH0gZnJvbSAnbm9kZTp1cmwnO1xuaW1wb3J0IHsgTWVzc2FnZUNoYW5uZWwsIFdvcmtlciB9IGZyb20gJ25vZGU6d29ya2VyX3RocmVhZHMnO1xuaW1wb3J0IHtcbiAgQ29tcGlsZVJlc3VsdCxcbiAgRXhjZXB0aW9uLFxuICBGaWxlSW1wb3J0ZXIsXG4gIEltcG9ydGVyLFxuICBMb2dnZXIsXG4gIFNvdXJjZVNwYW4sXG4gIFN0cmluZ09wdGlvbnNXaXRoSW1wb3J0ZXIsXG4gIFN0cmluZ09wdGlvbnNXaXRob3V0SW1wb3J0ZXIsXG59IGZyb20gJ3Nhc3MnO1xuaW1wb3J0IHsgbWF4V29ya2VycyB9IGZyb20gJy4uL3V0aWxzL2Vudmlyb25tZW50LW9wdGlvbnMnO1xuXG4vKipcbiAqIFRoZSBtYXhpbXVtIG51bWJlciBvZiBXb3JrZXJzIHRoYXQgd2lsbCBiZSBjcmVhdGVkIHRvIGV4ZWN1dGUgcmVuZGVyIHJlcXVlc3RzLlxuICovXG5jb25zdCBNQVhfUkVOREVSX1dPUktFUlMgPSBtYXhXb3JrZXJzO1xuXG4vKipcbiAqIFRoZSBjYWxsYmFjayB0eXBlIGZvciB0aGUgYGRhcnQtc2Fzc2AgYXN5bmNocm9ub3VzIHJlbmRlciBmdW5jdGlvbi5cbiAqL1xudHlwZSBSZW5kZXJDYWxsYmFjayA9IChlcnJvcj86IEV4Y2VwdGlvbiwgcmVzdWx0PzogQ29tcGlsZVJlc3VsdCkgPT4gdm9pZDtcblxudHlwZSBGaWxlSW1wb3J0ZXJPcHRpb25zID0gUGFyYW1ldGVyczxGaWxlSW1wb3J0ZXJbJ2ZpbmRGaWxlVXJsJ10+WzFdO1xuXG5leHBvcnQgaW50ZXJmYWNlIEZpbGVJbXBvcnRlcldpdGhSZXF1ZXN0Q29udGV4dE9wdGlvbnMgZXh0ZW5kcyBGaWxlSW1wb3J0ZXJPcHRpb25zIHtcbiAgLyoqXG4gICAqIFRoaXMgaXMgYSBjdXN0b20gb3B0aW9uIGFuZCBpcyByZXF1aXJlZCBhcyBTQVNTIGRvZXMgbm90IHByb3ZpZGUgY29udGV4dCBmcm9tIHdoaWNoIHRoZSBmaWxlIGlzIGJlaW5nIHJlc29sdmVkLlxuICAgKiBUaGlzIGJyZWFrcyBZYXJuIFBOUCBhcyB0cmFuc2l0aXZlIGRlcHMgY2Fubm90IGJlIHJlc29sdmVkIGZyb20gdGhlIHdvcmtzcGFjZSByb290LlxuICAgKlxuICAgKiBXb3JrYXJvdW5kIHVudGlsIGh0dHBzOi8vZ2l0aHViLmNvbS9zYXNzL3Nhc3MvaXNzdWVzLzMyNDcgaXMgYWRkcmVzc2VkLlxuICAgKi9cbiAgcHJldmlvdXNSZXNvbHZlZE1vZHVsZXM/OiBTZXQ8c3RyaW5nPjtcbn1cblxuLyoqXG4gKiBBbiBvYmplY3QgY29udGFpbmluZyB0aGUgY29udGV4dHVhbCBpbmZvcm1hdGlvbiBmb3IgYSBzcGVjaWZpYyByZW5kZXIgcmVxdWVzdC5cbiAqL1xuaW50ZXJmYWNlIFJlbmRlclJlcXVlc3Qge1xuICBpZDogbnVtYmVyO1xuICB3b3JrZXJJbmRleDogbnVtYmVyO1xuICBjYWxsYmFjazogUmVuZGVyQ2FsbGJhY2s7XG4gIGxvZ2dlcj86IExvZ2dlcjtcbiAgaW1wb3J0ZXJzPzogSW1wb3J0ZXJzW107XG4gIHByZXZpb3VzUmVzb2x2ZWRNb2R1bGVzPzogU2V0PHN0cmluZz47XG59XG5cbi8qKlxuICogQWxsIGF2YWlsYWJsZSBpbXBvcnRlciB0eXBlcy5cbiAqL1xudHlwZSBJbXBvcnRlcnMgPVxuICB8IEltcG9ydGVyPCdzeW5jJz5cbiAgfCBJbXBvcnRlcjwnYXN5bmMnPlxuICB8IEZpbGVJbXBvcnRlcjwnc3luYyc+XG4gIHwgRmlsZUltcG9ydGVyPCdhc3luYyc+O1xuXG4vKipcbiAqIEEgcmVzcG9uc2UgZnJvbSB0aGUgU2FzcyByZW5kZXIgV29ya2VyIGNvbnRhaW5pbmcgdGhlIHJlc3VsdCBvZiB0aGUgb3BlcmF0aW9uLlxuICovXG5pbnRlcmZhY2UgUmVuZGVyUmVzcG9uc2VNZXNzYWdlIHtcbiAgaWQ6IG51bWJlcjtcbiAgZXJyb3I/OiBFeGNlcHRpb247XG4gIHJlc3VsdD86IE9taXQ8Q29tcGlsZVJlc3VsdCwgJ2xvYWRlZFVybHMnPiAmIHsgbG9hZGVkVXJsczogc3RyaW5nW10gfTtcbiAgd2FybmluZ3M/OiB7XG4gICAgbWVzc2FnZTogc3RyaW5nO1xuICAgIGRlcHJlY2F0aW9uOiBib29sZWFuO1xuICAgIHN0YWNrPzogc3RyaW5nO1xuICAgIHNwYW4/OiBPbWl0PFNvdXJjZVNwYW4sICd1cmwnPiAmIHsgdXJsPzogc3RyaW5nIH07XG4gIH1bXTtcbn1cblxuLyoqXG4gKiBBIFNhc3MgcmVuZGVyZXIgaW1wbGVtZW50YXRpb24gdGhhdCBwcm92aWRlcyBhbiBpbnRlcmZhY2UgdGhhdCBjYW4gYmUgdXNlZCBieSBXZWJwYWNrJ3NcbiAqIGBzYXNzLWxvYWRlcmAuIFRoZSBpbXBsZW1lbnRhdGlvbiB1c2VzIGEgV29ya2VyIHRocmVhZCB0byBwZXJmb3JtIHRoZSBTYXNzIHJlbmRlcmluZ1xuICogd2l0aCB0aGUgYGRhcnQtc2Fzc2AgcGFja2FnZS4gIFRoZSBgZGFydC1zYXNzYCBzeW5jaHJvbm91cyByZW5kZXIgZnVuY3Rpb24gaXMgdXNlZCB3aXRoaW5cbiAqIHRoZSB3b3JrZXIgd2hpY2ggY2FuIGJlIHVwIHRvIHR3byB0aW1lcyBmYXN0ZXIgdGhhbiB0aGUgYXN5bmNocm9ub3VzIHZhcmlhbnQuXG4gKi9cbmV4cG9ydCBjbGFzcyBTYXNzV29ya2VySW1wbGVtZW50YXRpb24ge1xuICBwcml2YXRlIHJlYWRvbmx5IHdvcmtlcnM6IFdvcmtlcltdID0gW107XG4gIHByaXZhdGUgcmVhZG9ubHkgYXZhaWxhYmxlV29ya2VyczogbnVtYmVyW10gPSBbXTtcbiAgcHJpdmF0ZSByZWFkb25seSByZXF1ZXN0cyA9IG5ldyBNYXA8bnVtYmVyLCBSZW5kZXJSZXF1ZXN0PigpO1xuICBwcml2YXRlIHJlYWRvbmx5IHdvcmtlclBhdGggPSBqb2luKF9fZGlybmFtZSwgJy4vd29ya2VyLmpzJyk7XG4gIHByaXZhdGUgaWRDb3VudGVyID0gMTtcbiAgcHJpdmF0ZSBuZXh0V29ya2VySW5kZXggPSAwO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcmViYXNlID0gZmFsc2UpIHt9XG5cbiAgLyoqXG4gICAqIFByb3ZpZGVzIGluZm9ybWF0aW9uIGFib3V0IHRoZSBTYXNzIGltcGxlbWVudGF0aW9uLlxuICAgKiBUaGlzIG1pbWljcyBlbm91Z2ggb2YgdGhlIGBkYXJ0LXNhc3NgIHZhbHVlIHRvIGJlIHVzZWQgd2l0aCB0aGUgYHNhc3MtbG9hZGVyYC5cbiAgICovXG4gIGdldCBpbmZvKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuICdkYXJ0LXNhc3NcXHR3b3JrZXInO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBzeW5jaHJvbm91cyByZW5kZXIgZnVuY3Rpb24gaXMgbm90IHVzZWQgYnkgdGhlIGBzYXNzLWxvYWRlcmAuXG4gICAqL1xuICBjb21waWxlU3RyaW5nKCk6IG5ldmVyIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1Nhc3MgY29tcGlsZVN0cmluZyBpcyBub3Qgc3VwcG9ydGVkLicpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFzeW5jaHJvbm91c2x5IHJlcXVlc3QgYSBTYXNzIHN0eWxlc2hlZXQgdG8gYmUgcmVuZGVyZXJlZC5cbiAgICpcbiAgICogQHBhcmFtIHNvdXJjZSBUaGUgY29udGVudHMgdG8gY29tcGlsZS5cbiAgICogQHBhcmFtIG9wdGlvbnMgVGhlIGBkYXJ0LXNhc3NgIG9wdGlvbnMgdG8gdXNlIHdoZW4gcmVuZGVyaW5nIHRoZSBzdHlsZXNoZWV0LlxuICAgKi9cbiAgY29tcGlsZVN0cmluZ0FzeW5jKFxuICAgIHNvdXJjZTogc3RyaW5nLFxuICAgIG9wdGlvbnM6IFN0cmluZ09wdGlvbnNXaXRoSW1wb3J0ZXI8J2FzeW5jJz4gfCBTdHJpbmdPcHRpb25zV2l0aG91dEltcG9ydGVyPCdhc3luYyc+LFxuICApOiBQcm9taXNlPENvbXBpbGVSZXN1bHQ+IHtcbiAgICAvLyBUaGUgYGZ1bmN0aW9uc2AsIGBsb2dnZXJgIGFuZCBgaW1wb3J0ZXJgIG9wdGlvbnMgYXJlIEphdmFTY3JpcHQgZnVuY3Rpb25zIHRoYXQgY2Fubm90IGJlIHRyYW5zZmVycmVkLlxuICAgIC8vIElmIGFueSBhZGRpdGlvbmFsIGZ1bmN0aW9uIG9wdGlvbnMgYXJlIGFkZGVkIGluIHRoZSBmdXR1cmUsIHRoZXkgbXVzdCBiZSBleGNsdWRlZCBhcyB3ZWxsLlxuICAgIGNvbnN0IHsgZnVuY3Rpb25zLCBpbXBvcnRlcnMsIHVybCwgbG9nZ2VyLCAuLi5zZXJpYWxpemFibGVPcHRpb25zIH0gPSBvcHRpb25zO1xuXG4gICAgLy8gVGhlIENMSSdzIGNvbmZpZ3VyYXRpb24gZG9lcyBub3QgdXNlIG9yIGV4cG9zZSB0aGUgYWJpbGl0eSB0byBkZWZpbmVkIGN1c3RvbSBTYXNzIGZ1bmN0aW9uc1xuICAgIGlmIChmdW5jdGlvbnMgJiYgT2JqZWN0LmtleXMoZnVuY3Rpb25zKS5sZW5ndGggPiAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Nhc3MgY3VzdG9tIGZ1bmN0aW9ucyBhcmUgbm90IHN1cHBvcnRlZC4nKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2U8Q29tcGlsZVJlc3VsdD4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgbGV0IHdvcmtlckluZGV4ID0gdGhpcy5hdmFpbGFibGVXb3JrZXJzLnBvcCgpO1xuICAgICAgaWYgKHdvcmtlckluZGV4ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaWYgKHRoaXMud29ya2Vycy5sZW5ndGggPCBNQVhfUkVOREVSX1dPUktFUlMpIHtcbiAgICAgICAgICB3b3JrZXJJbmRleCA9IHRoaXMud29ya2Vycy5sZW5ndGg7XG4gICAgICAgICAgdGhpcy53b3JrZXJzLnB1c2godGhpcy5jcmVhdGVXb3JrZXIoKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgd29ya2VySW5kZXggPSB0aGlzLm5leHRXb3JrZXJJbmRleCsrO1xuICAgICAgICAgIGlmICh0aGlzLm5leHRXb3JrZXJJbmRleCA+PSB0aGlzLndvcmtlcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLm5leHRXb3JrZXJJbmRleCA9IDA7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGNhbGxiYWNrOiBSZW5kZXJDYWxsYmFjayA9IChlcnJvciwgcmVzdWx0KSA9PiB7XG4gICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgIGNvbnN0IHVybCA9IGVycm9yLnNwYW4/LnVybCBhcyBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgICAgICAgaWYgKHVybCkge1xuICAgICAgICAgICAgZXJyb3Iuc3Bhbi51cmwgPSBwYXRoVG9GaWxlVVJMKHVybCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmVqZWN0KGVycm9yKTtcblxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghcmVzdWx0KSB7XG4gICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignTm8gcmVzdWx0LicpKTtcblxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IHJlcXVlc3QgPSB0aGlzLmNyZWF0ZVJlcXVlc3Qod29ya2VySW5kZXgsIGNhbGxiYWNrLCBsb2dnZXIsIGltcG9ydGVycyk7XG4gICAgICB0aGlzLnJlcXVlc3RzLnNldChyZXF1ZXN0LmlkLCByZXF1ZXN0KTtcblxuICAgICAgdGhpcy53b3JrZXJzW3dvcmtlckluZGV4XS5wb3N0TWVzc2FnZSh7XG4gICAgICAgIGlkOiByZXF1ZXN0LmlkLFxuICAgICAgICBzb3VyY2UsXG4gICAgICAgIGhhc0ltcG9ydGVyOiAhIWltcG9ydGVycz8ubGVuZ3RoLFxuICAgICAgICBoYXNMb2dnZXI6ICEhbG9nZ2VyLFxuICAgICAgICByZWJhc2U6IHRoaXMucmViYXNlLFxuICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgLi4uc2VyaWFsaXphYmxlT3B0aW9ucyxcbiAgICAgICAgICAvLyBVUkwgaXMgbm90IHNlcmlhbGl6YWJsZSBzbyB0byBjb252ZXJ0IHRvIHN0cmluZyBoZXJlIGFuZCBiYWNrIHRvIFVSTCBpbiB0aGUgd29ya2VyLlxuICAgICAgICAgIHVybDogdXJsID8gZmlsZVVSTFRvUGF0aCh1cmwpIDogdW5kZWZpbmVkLFxuICAgICAgICB9LFxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogU2h1dGRvd24gdGhlIFNhc3MgcmVuZGVyIHdvcmtlci5cbiAgICogRXhlY3V0aW5nIHRoaXMgbWV0aG9kIHdpbGwgc3RvcCBhbnkgcGVuZGluZyByZW5kZXIgcmVxdWVzdHMuXG4gICAqL1xuICBjbG9zZSgpOiB2b2lkIHtcbiAgICBmb3IgKGNvbnN0IHdvcmtlciBvZiB0aGlzLndvcmtlcnMpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHZvaWQgd29ya2VyLnRlcm1pbmF0ZSgpO1xuICAgICAgfSBjYXRjaCB7fVxuICAgIH1cbiAgICB0aGlzLnJlcXVlc3RzLmNsZWFyKCk7XG4gIH1cblxuICBwcml2YXRlIGNyZWF0ZVdvcmtlcigpOiBXb3JrZXIge1xuICAgIGNvbnN0IHsgcG9ydDE6IG1haW5JbXBvcnRlclBvcnQsIHBvcnQyOiB3b3JrZXJJbXBvcnRlclBvcnQgfSA9IG5ldyBNZXNzYWdlQ2hhbm5lbCgpO1xuICAgIGNvbnN0IGltcG9ydGVyU2lnbmFsID0gbmV3IEludDMyQXJyYXkobmV3IFNoYXJlZEFycmF5QnVmZmVyKDQpKTtcblxuICAgIGNvbnN0IHdvcmtlciA9IG5ldyBXb3JrZXIodGhpcy53b3JrZXJQYXRoLCB7XG4gICAgICB3b3JrZXJEYXRhOiB7IHdvcmtlckltcG9ydGVyUG9ydCwgaW1wb3J0ZXJTaWduYWwgfSxcbiAgICAgIHRyYW5zZmVyTGlzdDogW3dvcmtlckltcG9ydGVyUG9ydF0sXG4gICAgfSk7XG5cbiAgICB3b3JrZXIub24oJ21lc3NhZ2UnLCAocmVzcG9uc2U6IFJlbmRlclJlc3BvbnNlTWVzc2FnZSkgPT4ge1xuICAgICAgY29uc3QgcmVxdWVzdCA9IHRoaXMucmVxdWVzdHMuZ2V0KHJlc3BvbnNlLmlkKTtcbiAgICAgIGlmICghcmVxdWVzdCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHRoaXMucmVxdWVzdHMuZGVsZXRlKHJlc3BvbnNlLmlkKTtcbiAgICAgIHRoaXMuYXZhaWxhYmxlV29ya2Vycy5wdXNoKHJlcXVlc3Qud29ya2VySW5kZXgpO1xuXG4gICAgICBpZiAocmVzcG9uc2Uud2FybmluZ3MgJiYgcmVxdWVzdC5sb2dnZXI/Lndhcm4pIHtcbiAgICAgICAgZm9yIChjb25zdCB7IG1lc3NhZ2UsIHNwYW4sIC4uLm9wdGlvbnMgfSBvZiByZXNwb25zZS53YXJuaW5ncykge1xuICAgICAgICAgIHJlcXVlc3QubG9nZ2VyLndhcm4obWVzc2FnZSwge1xuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgIHNwYW46IHNwYW4gJiYge1xuICAgICAgICAgICAgICAuLi5zcGFuLFxuICAgICAgICAgICAgICB1cmw6IHNwYW4udXJsID8gcGF0aFRvRmlsZVVSTChzcGFuLnVybCkgOiB1bmRlZmluZWQsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChyZXNwb25zZS5yZXN1bHQpIHtcbiAgICAgICAgcmVxdWVzdC5jYWxsYmFjayh1bmRlZmluZWQsIHtcbiAgICAgICAgICAuLi5yZXNwb25zZS5yZXN1bHQsXG4gICAgICAgICAgLy8gVVJMIGlzIG5vdCBzZXJpYWxpemFibGUgc28gaW4gdGhlIHdvcmtlciB3ZSBjb252ZXJ0IHRvIHN0cmluZyBhbmQgaGVyZSBiYWNrIHRvIFVSTC5cbiAgICAgICAgICBsb2FkZWRVcmxzOiByZXNwb25zZS5yZXN1bHQubG9hZGVkVXJscy5tYXAoKHApID0+IHBhdGhUb0ZpbGVVUkwocCkpLFxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlcXVlc3QuY2FsbGJhY2socmVzcG9uc2UuZXJyb3IpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgbWFpbkltcG9ydGVyUG9ydC5vbihcbiAgICAgICdtZXNzYWdlJyxcbiAgICAgICh7IGlkLCB1cmwsIG9wdGlvbnMgfTogeyBpZDogbnVtYmVyOyB1cmw6IHN0cmluZzsgb3B0aW9uczogRmlsZUltcG9ydGVyT3B0aW9ucyB9KSA9PiB7XG4gICAgICAgIGNvbnN0IHJlcXVlc3QgPSB0aGlzLnJlcXVlc3RzLmdldChpZCk7XG4gICAgICAgIGlmICghcmVxdWVzdD8uaW1wb3J0ZXJzKSB7XG4gICAgICAgICAgbWFpbkltcG9ydGVyUG9ydC5wb3N0TWVzc2FnZShudWxsKTtcbiAgICAgICAgICBBdG9taWNzLnN0b3JlKGltcG9ydGVyU2lnbmFsLCAwLCAxKTtcbiAgICAgICAgICBBdG9taWNzLm5vdGlmeShpbXBvcnRlclNpZ25hbCwgMCk7XG5cbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnByb2Nlc3NJbXBvcnRlcnMocmVxdWVzdC5pbXBvcnRlcnMsIHVybCwge1xuICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgcHJldmlvdXNSZXNvbHZlZE1vZHVsZXM6IHJlcXVlc3QucHJldmlvdXNSZXNvbHZlZE1vZHVsZXMsXG4gICAgICAgIH0pXG4gICAgICAgICAgLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAgICAgICByZXF1ZXN0LnByZXZpb3VzUmVzb2x2ZWRNb2R1bGVzID8/PSBuZXcgU2V0KCk7XG4gICAgICAgICAgICAgIHJlcXVlc3QucHJldmlvdXNSZXNvbHZlZE1vZHVsZXMuYWRkKGRpcm5hbWUocmVzdWx0KSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG1haW5JbXBvcnRlclBvcnQucG9zdE1lc3NhZ2UocmVzdWx0KTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgICAgIG1haW5JbXBvcnRlclBvcnQucG9zdE1lc3NhZ2UoZXJyb3IpO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmZpbmFsbHkoKCkgPT4ge1xuICAgICAgICAgICAgQXRvbWljcy5zdG9yZShpbXBvcnRlclNpZ25hbCwgMCwgMSk7XG4gICAgICAgICAgICBBdG9taWNzLm5vdGlmeShpbXBvcnRlclNpZ25hbCwgMCk7XG4gICAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICk7XG5cbiAgICBtYWluSW1wb3J0ZXJQb3J0LnVucmVmKCk7XG5cbiAgICByZXR1cm4gd29ya2VyO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBwcm9jZXNzSW1wb3J0ZXJzKFxuICAgIGltcG9ydGVyczogSXRlcmFibGU8SW1wb3J0ZXJzPixcbiAgICB1cmw6IHN0cmluZyxcbiAgICBvcHRpb25zOiBGaWxlSW1wb3J0ZXJXaXRoUmVxdWVzdENvbnRleHRPcHRpb25zLFxuICApOiBQcm9taXNlPHN0cmluZyB8IG51bGw+IHtcbiAgICBmb3IgKGNvbnN0IGltcG9ydGVyIG9mIGltcG9ydGVycykge1xuICAgICAgaWYgKHRoaXMuaXNJbXBvcnRlcihpbXBvcnRlcikpIHtcbiAgICAgICAgLy8gSW1wb3J0ZXJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdPbmx5IEZpbGUgSW1wb3J0ZXJzIGFyZSBzdXBwb3J0ZWQuJyk7XG4gICAgICB9XG5cbiAgICAgIC8vIEZpbGUgaW1wb3J0ZXIgKENhbiBiZSBzeW5jIG9yIGF5bmMpLlxuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgaW1wb3J0ZXIuZmluZEZpbGVVcmwodXJsLCBvcHRpb25zKTtcbiAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgcmV0dXJuIGZpbGVVUkxUb1BhdGgocmVzdWx0KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRlUmVxdWVzdChcbiAgICB3b3JrZXJJbmRleDogbnVtYmVyLFxuICAgIGNhbGxiYWNrOiBSZW5kZXJDYWxsYmFjayxcbiAgICBsb2dnZXI6IExvZ2dlciB8IHVuZGVmaW5lZCxcbiAgICBpbXBvcnRlcnM6IEltcG9ydGVyc1tdIHwgdW5kZWZpbmVkLFxuICApOiBSZW5kZXJSZXF1ZXN0IHtcbiAgICByZXR1cm4ge1xuICAgICAgaWQ6IHRoaXMuaWRDb3VudGVyKyssXG4gICAgICB3b3JrZXJJbmRleCxcbiAgICAgIGNhbGxiYWNrLFxuICAgICAgbG9nZ2VyLFxuICAgICAgaW1wb3J0ZXJzLFxuICAgIH07XG4gIH1cblxuICBwcml2YXRlIGlzSW1wb3J0ZXIodmFsdWU6IEltcG9ydGVycyk6IHZhbHVlIGlzIEltcG9ydGVyIHtcbiAgICByZXR1cm4gJ2Nhbm9uaWNhbGl6ZScgaW4gdmFsdWUgJiYgJ2xvYWQnIGluIHZhbHVlO1xuICB9XG59XG4iXX0=