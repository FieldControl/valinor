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
const load_esm_from_memory_1 = require("./load-esm-from-memory");
/**
 * This is passed as workerData when setting up the worker via the `piscina` package.
 */
const { document, verbose } = node_worker_threads_1.workerData;
/** Renders an application based on a provided options. */
async function extractRoutes() {
    const { extractRoutes } = await (0, load_esm_from_memory_1.loadEsmModuleFromMemory)('./render-utils.server.mjs');
    const { default: bootstrapAppFnOrModule } = await (0, load_esm_from_memory_1.loadEsmModuleFromMemory)('./main.server.mjs');
    const skippedRedirects = [];
    const skippedOthers = [];
    const routes = [];
    for await (const { route, success, redirect } of extractRoutes(bootstrapAppFnOrModule, document)) {
        if (success) {
            routes.push(route);
            continue;
        }
        if (redirect) {
            skippedRedirects.push(route);
        }
        else {
            skippedOthers.push(route);
        }
    }
    if (!verbose) {
        return { routes };
    }
    let warnings;
    if (skippedOthers.length) {
        (warnings ??= []).push('The following routes were skipped from prerendering because they contain routes with dynamic parameters:\n' +
            skippedOthers.join('\n'));
    }
    if (skippedRedirects.length) {
        (warnings ??= []).push('The following routes were skipped from prerendering because they contain redirects:\n', skippedRedirects.join('\n'));
    }
    return { routes, warnings };
}
function initialize() {
    (0, fetch_patch_1.patchFetchToLoadInMemoryAssets)();
    return extractRoutes;
}
exports.default = initialize();
