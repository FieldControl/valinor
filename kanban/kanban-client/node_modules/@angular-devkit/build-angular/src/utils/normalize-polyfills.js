"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizePolyfills = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
function normalizePolyfills(polyfills, root) {
    if (!polyfills) {
        return [];
    }
    const polyfillsList = Array.isArray(polyfills) ? polyfills : [polyfills];
    return polyfillsList.map((p) => {
        const resolvedPath = (0, path_1.resolve)(root, p);
        // If file doesn't exist, let the bundle resolve it using node module resolution.
        return (0, fs_1.existsSync)(resolvedPath) ? resolvedPath : p;
    });
}
exports.normalizePolyfills = normalizePolyfills;
