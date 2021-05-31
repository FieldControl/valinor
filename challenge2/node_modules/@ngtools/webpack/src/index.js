"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ivy = exports.default = exports.AngularWebpackPlugin = exports.AngularWebpackLoaderPath = void 0;
const ivyInternal = require("./ivy");
var ivy_1 = require("./ivy");
Object.defineProperty(exports, "AngularWebpackLoaderPath", { enumerable: true, get: function () { return ivy_1.AngularWebpackLoaderPath; } });
Object.defineProperty(exports, "AngularWebpackPlugin", { enumerable: true, get: function () { return ivy_1.AngularWebpackPlugin; } });
Object.defineProperty(exports, "default", { enumerable: true, get: function () { return ivy_1.default; } });
/** @deprecated Deprecated as of v12, please use the direct exports
 * (`AngularWebpackPlugin` instead of `ivy.AngularWebpackPlugin`)
 */
// eslint-disable-next-line @typescript-eslint/no-namespace
var ivy;
(function (ivy) {
    ivy.AngularWebpackLoaderPath = ivyInternal.AngularWebpackLoaderPath;
    ivy.AngularWebpackPlugin = ivyInternal.AngularWebpackPlugin;
})(ivy = exports.ivy || (exports.ivy = {}));
