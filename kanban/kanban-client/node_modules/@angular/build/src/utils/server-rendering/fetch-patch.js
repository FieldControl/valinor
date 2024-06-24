"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.patchFetchToLoadInMemoryAssets = void 0;
const mrmime_1 = require("mrmime");
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
const node_worker_threads_1 = require("node:worker_threads");
const undici_1 = require("undici");
/**
 * This is passed as workerData when setting up the worker via the `piscina` package.
 */
const { assetFiles } = node_worker_threads_1.workerData;
const assetsCache = new Map();
const RESOLVE_PROTOCOL = 'resolve:';
function patchFetchToLoadInMemoryAssets() {
    const global = globalThis;
    const originalFetch = global.fetch;
    const patchedFetch = async (input, init) => {
        let url;
        if (input instanceof URL) {
            url = input;
        }
        else if (typeof input === 'string') {
            url = new URL(input, RESOLVE_PROTOCOL + '//');
        }
        else if (typeof input === 'object' && 'url' in input) {
            url = new URL(input.url, RESOLVE_PROTOCOL + '//');
        }
        else {
            return originalFetch(input, init);
        }
        const { protocol } = url;
        const pathname = decodeURIComponent(url.pathname);
        if (protocol !== RESOLVE_PROTOCOL || !assetFiles[pathname]) {
            // Only handle relative requests or files that are in assets.
            return originalFetch(input, init);
        }
        const cachedAsset = assetsCache.get(pathname);
        if (cachedAsset) {
            const { content, headers } = cachedAsset;
            return new undici_1.Response(content, {
                headers,
            });
        }
        const extension = (0, node_path_1.extname)(pathname);
        const mimeType = (0, mrmime_1.lookup)(extension);
        const content = await (0, promises_1.readFile)(assetFiles[pathname]);
        const headers = mimeType
            ? {
                'Content-Type': mimeType,
            }
            : undefined;
        assetsCache.set(pathname, { headers, content });
        return new undici_1.Response(content, {
            headers,
        });
    };
    global.fetch = patchedFetch;
}
exports.patchFetchToLoadInMemoryAssets = patchFetchToLoadInMemoryAssets;
