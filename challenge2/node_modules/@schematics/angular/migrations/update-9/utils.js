"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.forwardSlashPath = exports.isIvyEnabled = void 0;
const core_1 = require("@angular-devkit/core");
const json_file_1 = require("../../utility/json-file");
function isIvyEnabled(tree, tsConfigPath) {
    // In version 9, Ivy is turned on by default
    // Ivy is opted out only when 'enableIvy' is set to false.
    let tsconfigJson;
    try {
        tsconfigJson = new json_file_1.JSONFile(tree, tsConfigPath);
    }
    catch {
        return true;
    }
    const enableIvy = tsconfigJson.get(['angularCompilerOptions', 'enableIvy']);
    if (enableIvy !== undefined) {
        return !!enableIvy;
    }
    const configExtends = tsconfigJson.get(['extends']);
    if (configExtends && typeof configExtends === 'string') {
        const extendedTsConfigPath = core_1.resolve(core_1.dirname(core_1.normalize(tsConfigPath)), core_1.normalize(configExtends));
        return isIvyEnabled(tree, extendedTsConfigPath);
    }
    return true;
}
exports.isIvyEnabled = isIvyEnabled;
// TS represents paths internally with '/' and expects paths to be in this format.
// angular.json expects paths with '/', but doesn't enforce them.
function forwardSlashPath(path) {
    return path.replace(/\\/g, '/');
}
exports.forwardSlashPath = forwardSlashPath;
