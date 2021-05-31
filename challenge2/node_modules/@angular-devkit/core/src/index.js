"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.workspaces = exports.logging = exports.json = exports.experimental = exports.analytics = void 0;
const analytics = require("./analytics");
exports.analytics = analytics;
const experimental = require("./experimental");
exports.experimental = experimental;
const json = require("./json/index");
exports.json = json;
const logging = require("./logger/index");
exports.logging = logging;
const workspaces = require("./workspace");
exports.workspaces = workspaces;
__exportStar(require("./exception/exception"), exports);
__exportStar(require("./json/index"), exports);
__exportStar(require("./utils/index"), exports);
__exportStar(require("./virtual-fs/index"), exports);
