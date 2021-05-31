"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLibraries = void 0;
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
const json_file_1 = require("../../utility/json-file");
const workspace_1 = require("../../utility/workspace");
const workspace_models_1 = require("../../utility/workspace-models");
/**
 * Updates a pre version 9 library to version 9 Ivy library.
 *
 * The main things that this migrations does are:
 * - Creates a production configuration for VE compilations.
 * - Create a prod tsconfig for which disables Ivy and enables VE compilations.
 */
function updateLibraries() {
    return workspace_1.updateWorkspace((workspace) => {
        const followupRules = [];
        for (const [, project] of workspace.projects) {
            if (typeof project.root !== 'string') {
                continue;
            }
            for (const [, target] of project.targets) {
                if (target.builder !== workspace_models_1.Builders.DeprecatedNgPackagr) {
                    continue;
                }
                const tsConfig = core_1.join(core_1.normalize(project.root), 'tsconfig.lib.prod.json');
                if (!target.configurations || !target.configurations.production) {
                    // Production configuration does not exist
                    target.configurations = { ...target.configurations, production: { tsConfig } };
                    followupRules.push((tree) => createTsConfig(tree, tsConfig));
                    continue;
                }
                const existingTsconfig = target.configurations.production.tsConfig;
                if (!existingTsconfig || typeof existingTsconfig !== 'string') {
                    // Production configuration TS configuration does not exist or malformed
                    target.configurations.production.tsConfig = tsConfig;
                    followupRules.push((tree) => createTsConfig(tree, tsConfig));
                    continue;
                }
                followupRules.push(updateTsConfig(existingTsconfig));
            }
        }
        return schematics_1.chain(followupRules);
    });
}
exports.updateLibraries = updateLibraries;
function createTsConfig(tree, tsConfigPath) {
    const tsConfigContent = {
        extends: './tsconfig.lib.json',
        angularCompilerOptions: {
            enableIvy: false,
        },
    };
    if (!tree.exists(tsConfigPath)) {
        tree.create(tsConfigPath, JSON.stringify(tsConfigContent, undefined, 2));
    }
}
function updateTsConfig(tsConfigPath) {
    return (tree, { logger }) => {
        let json;
        try {
            json = new json_file_1.JSONFile(tree, tsConfigPath);
        }
        catch {
            logger.warn(`Cannot find file: ${tsConfigPath}`);
            return;
        }
        const enableIvyPath = ['angularCompilerOptions', 'enableIvy'];
        if (json.get(enableIvyPath) === false) {
            return;
        }
        json.modify(enableIvyPath, false);
    };
}
