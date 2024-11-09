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
const environment_options_1 = require("../../utils/environment-options");
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
    rebase;
    workers = [];
    availableWorkers = [];
    requests = new Map();
    workerPath = (0, node_path_1.join)(__dirname, './worker.js');
    idCounter = 1;
    nextWorkerIndex = 0;
    constructor(rebase = false) {
        this.rebase = rebase;
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
                if (error) {
                    const url = error.span?.url;
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
                hasImporter: !!importers?.length,
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
            catch { }
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
            const request = this.requests.get(response.id);
            if (!request) {
                return;
            }
            this.requests.delete(response.id);
            this.availableWorkers.push(request.workerIndex);
            if (response.warnings && request.logger?.warn) {
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
            if (!request?.importers) {
                mainImporterPort.postMessage(null);
                Atomics.store(importerSignal, 0, 1);
                Atomics.notify(importerSignal, 0);
                return;
            }
            this.processImporters(request.importers, url, {
                ...options,
                // URL is not serializable so in the worker we convert to string and here back to URL.
                containingUrl: options.containingUrl
                    ? (0, node_url_1.pathToFileURL)(options.containingUrl)
                    : null,
            })
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
    async processImporters(importers, url, options) {
        for (const importer of importers) {
            if (!this.isFileImporter(importer)) {
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
    isFileImporter(value) {
        return 'findFileUrl' in value;
    }
}
exports.SassWorkerImplementation = SassWorkerImplementation;
