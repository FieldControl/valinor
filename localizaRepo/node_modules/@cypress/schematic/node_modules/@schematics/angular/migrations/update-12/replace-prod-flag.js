"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
const json_file_1 = require("../../utility/json-file");
function default_1() {
    return (tree) => {
        const file = new json_file_1.JSONFile(tree, 'package.json');
        const scripts = file.get(['scripts']);
        if (!scripts || typeof scripts !== 'object') {
            return;
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const updatedScripts = Object.entries(scripts).map(([key, value]) => [
            key,
            typeof value === 'string'
                ? value.replace(/ --prod(?!\w)/g, ' --configuration production')
                : value,
        ]);
        file.modify(['scripts'], Object.fromEntries(updatedScripts));
    };
}
exports.default = default_1;
