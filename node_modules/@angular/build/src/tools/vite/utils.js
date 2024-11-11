"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.pathnameWithoutBasePath = pathnameWithoutBasePath;
exports.lookupMimeTypeFromRequest = lookupMimeTypeFromRequest;
exports.appendServerConfiguredHeaders = appendServerConfiguredHeaders;
const mrmime_1 = require("mrmime");
const node_path_1 = require("node:path");
function pathnameWithoutBasePath(url, basePath) {
    const parsedUrl = new URL(url, 'http://localhost');
    const pathname = decodeURIComponent(parsedUrl.pathname);
    // slice(basePath.length - 1) to retain the trailing slash
    return basePath !== '/' && pathname.startsWith(basePath)
        ? pathname.slice(basePath.length - 1)
        : pathname;
}
function lookupMimeTypeFromRequest(url) {
    const extension = (0, node_path_1.extname)(url.split('?')[0]);
    if (extension === '.ico') {
        return 'image/x-icon';
    }
    return extension && (0, mrmime_1.lookup)(extension);
}
function appendServerConfiguredHeaders(server, res) {
    const headers = server.config.server.headers;
    if (!headers) {
        return;
    }
    for (const [name, value] of Object.entries(headers)) {
        if (value !== undefined) {
            res.setHeader(name, value);
        }
    }
}
