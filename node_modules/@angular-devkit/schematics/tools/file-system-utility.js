"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.readJsonFile = readJsonFile;
const schematics_1 = require("@angular-devkit/schematics");
const fs_1 = require("fs");
const jsonc_parser_1 = require("jsonc-parser");
function readJsonFile(path) {
    let data;
    try {
        data = (0, fs_1.readFileSync)(path, 'utf-8');
    }
    catch (e) {
        if (e && typeof e === 'object' && 'code' in e && e.code === 'ENOENT') {
            throw new schematics_1.FileDoesNotExistException(path);
        }
        throw e;
    }
    const errors = [];
    const content = (0, jsonc_parser_1.parse)(data, errors, { allowTrailingComma: true });
    if (errors.length) {
        const { error, offset } = errors[0];
        throw new Error(`Failed to parse "${path}" as JSON AST Object. ${(0, jsonc_parser_1.printParseErrorCode)(error)} at location: ${offset}.`);
    }
    return content;
}
