"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.I18nInliner = void 0;
const node_assert_1 = __importDefault(require("node:assert"));
const piscina_1 = __importDefault(require("piscina"));
const bundler_context_1 = require("./bundler-context");
const utils_1 = require("./utils");
/**
 * A keyword used to indicate if a JavaScript file may require inlining of translations.
 * This keyword is used to avoid processing files that would not otherwise need i18n processing.
 */
const LOCALIZE_KEYWORD = '$localize';
/**
 * A class that performs i18n translation inlining of JavaScript code.
 * A worker pool is used to distribute the transformation actions and allow
 * parallel processing. Inlining is only performed on code that contains the
 * localize function (`$localize`).
 */
class I18nInliner {
    #workerPool;
    #localizeFiles;
    #unmodifiedFiles;
    #fileToType = new Map();
    constructor(options, maxThreads) {
        this.#unmodifiedFiles = [];
        const files = new Map();
        const pendingMaps = [];
        for (const file of options.outputFiles) {
            if (file.type === bundler_context_1.BuildOutputFileType.Root) {
                // Skip stats and similar files.
                continue;
            }
            this.#fileToType.set(file.path, file.type);
            if (file.path.endsWith('.js') || file.path.endsWith('.mjs')) {
                // Check if localizations are present
                const contentBuffer = Buffer.isBuffer(file.contents)
                    ? file.contents
                    : Buffer.from(file.contents.buffer, file.contents.byteOffset, file.contents.byteLength);
                const hasLocalize = contentBuffer.includes(LOCALIZE_KEYWORD);
                if (hasLocalize) {
                    // A Blob is an immutable data structure that allows sharing the data between workers
                    // without copying until the data is actually used within a Worker. This is useful here
                    // since each file may not actually be processed in each Worker and the Blob avoids
                    // unneeded repeat copying of potentially large JavaScript files.
                    files.set(file.path, new Blob([file.contents]));
                    continue;
                }
            }
            else if (file.path.endsWith('.js.map')) {
                // The related JS file may not have been checked yet. To ensure that map files are not
                // missed, store any pending map files and check them after all output files.
                pendingMaps.push(file);
                continue;
            }
            this.#unmodifiedFiles.push(file);
        }
        // Check if any pending map files should be processed by checking if the parent JS file is present
        for (const file of pendingMaps) {
            if (files.has(file.path.slice(0, -4))) {
                files.set(file.path, new Blob([file.contents]));
            }
            else {
                this.#unmodifiedFiles.push(file);
            }
        }
        this.#localizeFiles = files;
        this.#workerPool = new piscina_1.default({
            filename: require.resolve('./i18n-inliner-worker'),
            maxThreads,
            // Extract options to ensure only the named options are serialized and sent to the worker
            workerData: {
                missingTranslation: options.missingTranslation,
                shouldOptimize: options.shouldOptimize,
                files,
            },
            recordTiming: false,
        });
    }
    /**
     * Performs inlining of translations for the provided locale and translations. The files that
     * are processed originate from the files passed to the class constructor and filter by presence
     * of the localize function keyword.
     * @param locale The string representing the locale to inline.
     * @param translation The translation messages to use when inlining.
     * @returns A promise that resolves to an array of OutputFiles representing a translated result.
     */
    async inlineForLocale(locale, translation) {
        // Request inlining for each file that contains localize calls
        const requests = [];
        for (const filename of this.#localizeFiles.keys()) {
            if (filename.endsWith('.map')) {
                continue;
            }
            const fileRequest = this.#workerPool.run({
                filename,
                locale,
                translation,
            });
            requests.push(fileRequest);
        }
        // Wait for all file requests to complete
        const rawResults = await Promise.all(requests);
        // Convert raw results to output file objects and include all unmodified files
        const errors = [];
        const warnings = [];
        const outputFiles = [
            ...rawResults.flatMap(({ file, code, map, messages }) => {
                const type = this.#fileToType.get(file);
                (0, node_assert_1.default)(type !== undefined, 'localized file should always have a type' + file);
                const resultFiles = [(0, utils_1.createOutputFileFromText)(file, code, type)];
                if (map) {
                    resultFiles.push((0, utils_1.createOutputFileFromText)(file + '.map', map, type));
                }
                for (const message of messages) {
                    if (message.type === 'error') {
                        errors.push(message.message);
                    }
                    else {
                        warnings.push(message.message);
                    }
                }
                return resultFiles;
            }),
            ...this.#unmodifiedFiles.map((file) => file.clone()),
        ];
        return {
            outputFiles,
            errors,
            warnings,
        };
    }
    /**
     * Stops all active transformation tasks and shuts down all workers.
     * @returns A void promise that resolves when closing is complete.
     */
    close() {
        return this.#workerPool.destroy();
    }
}
exports.I18nInliner = I18nInliner;
