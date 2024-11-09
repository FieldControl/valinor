"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getESMLoaderArgs = exports.callInitializeIfNeeded = void 0;
const node_path_1 = require("node:path");
const node_url_1 = require("node:url");
const node_worker_threads_1 = require("node:worker_threads");
const semver_1 = require("semver");
let SUPPORTS_IMPORT_FLAG;
function supportsImportFlag() {
    return (SUPPORTS_IMPORT_FLAG ??= (0, semver_1.satisfies)(process.versions.node, '>= 18.19'));
}
/** Call the initialize hook when running on Node.js 18 */
function callInitializeIfNeeded(initialize) {
    if (!supportsImportFlag()) {
        initialize(node_worker_threads_1.workerData);
    }
}
exports.callInitializeIfNeeded = callInitializeIfNeeded;
function getESMLoaderArgs() {
    if (!supportsImportFlag()) {
        return [
            '--no-warnings', // Suppress `ExperimentalWarning: Custom ESM Loaders is an experimental feature...`.
            '--loader',
            (0, node_url_1.pathToFileURL)((0, node_path_1.join)(__dirname, 'loader-hooks.js')).href, // Loader cannot be an absolute path on Windows.
        ];
    }
    return [
        '--import',
        (0, node_url_1.pathToFileURL)((0, node_path_1.join)(__dirname, 'register-hooks.js')).href, // Loader cannot be an absolute path on Windows.
    ];
}
exports.getESMLoaderArgs = getESMLoaderArgs;
