"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.externalizePath = exports.normalizePath = void 0;
const nodePath = require("path");
const normalizationCache = new Map();
function normalizePath(path) {
    let result = normalizationCache.get(path);
    if (result === undefined) {
        result = nodePath.win32.normalize(path).replace(/\\/g, nodePath.posix.sep);
        normalizationCache.set(path, result);
    }
    return result;
}
exports.normalizePath = normalizePath;
const externalizationCache = new Map();
function externalizeForWindows(path) {
    let result = externalizationCache.get(path);
    if (result === undefined) {
        result = nodePath.win32.normalize(path);
        externalizationCache.set(path, result);
    }
    return result;
}
exports.externalizePath = (() => {
    if (process.platform !== 'win32') {
        return (path) => path;
    }
    return externalizeForWindows;
})();
