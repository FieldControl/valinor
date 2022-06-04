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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuiltinTaskExecutor = void 0;
const options_1 = require("../package-manager/options");
const options_2 = require("../repo-init/options");
const options_3 = require("../run-schematic/options");
const options_4 = require("../tslint-fix/options");
class BuiltinTaskExecutor {
}
exports.BuiltinTaskExecutor = BuiltinTaskExecutor;
BuiltinTaskExecutor.NodePackage = {
    name: options_1.NodePackageName,
    create: (options) => Promise.resolve().then(() => __importStar(require('../package-manager/executor'))).then((mod) => mod.default(options)),
};
BuiltinTaskExecutor.RepositoryInitializer = {
    name: options_2.RepositoryInitializerName,
    create: (options) => Promise.resolve().then(() => __importStar(require('../repo-init/executor'))).then((mod) => mod.default(options)),
};
BuiltinTaskExecutor.RunSchematic = {
    name: options_3.RunSchematicName,
    create: () => Promise.resolve().then(() => __importStar(require('../run-schematic/executor'))).then((mod) => mod.default()),
};
/** @deprecated since version 11. Use `ng lint --fix` directly instead. */
BuiltinTaskExecutor.TslintFix = {
    name: options_4.TslintFixName,
    create: () => Promise.resolve().then(() => __importStar(require('../tslint-fix/executor'))).then((mod) => mod.default()),
};
