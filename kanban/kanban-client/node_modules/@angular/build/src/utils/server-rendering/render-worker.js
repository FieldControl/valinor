"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
const node_worker_threads_1 = require("node:worker_threads");
const fetch_patch_1 = require("./fetch-patch");
const render_page_1 = require("./render-page");
/**
 * This is passed as workerData when setting up the worker via the `piscina` package.
 */
const { outputFiles, document, inlineCriticalCss } = node_worker_threads_1.workerData;
/** Renders an application based on a provided options. */
function render(options) {
    return (0, render_page_1.renderPage)({
        ...options,
        outputFiles,
        document,
        inlineCriticalCss,
    });
}
function initialize() {
    (0, fetch_patch_1.patchFetchToLoadInMemoryAssets)();
    return render;
}
exports.default = initialize();
