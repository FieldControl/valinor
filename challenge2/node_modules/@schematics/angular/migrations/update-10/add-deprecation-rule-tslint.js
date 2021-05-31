"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
const dependencies_1 = require("../../utility/dependencies");
const json_file_1 = require("../../utility/json-file");
const TSLINT_CONFIG_PATH = '/tslint.json';
const RULES_TO_ADD = {
    deprecation: {
        severity: 'warning',
    },
};
function default_1() {
    return (tree, context) => {
        const logger = context.logger;
        // Update tslint dependency
        const current = dependencies_1.getPackageJsonDependency(tree, 'tslint');
        if (!current) {
            logger.info('Skipping: "tslint" in not a dependency of this workspace.');
            return;
        }
        // Update tslint config.
        let json;
        try {
            json = new json_file_1.JSONFile(tree, TSLINT_CONFIG_PATH);
        }
        catch {
            const config = ['tslint.js', 'tslint.yaml'].find((c) => tree.exists(c));
            if (config) {
                logger.warn(`Expected a JSON configuration file but found "${config}".`);
            }
            else {
                logger.warn('Cannot find "tslint.json" configuration file.');
            }
            return;
        }
        for (const [name, value] of Object.entries(RULES_TO_ADD)) {
            const ruleName = ['rules', name];
            if (json.get(ruleName) === undefined) {
                json.modify(ruleName, value);
            }
        }
    };
}
exports.default = default_1;
