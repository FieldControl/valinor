"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeTsickle = void 0;
const dependencies_1 = require("../../utility/dependencies");
const json_file_1 = require("../../utility/json-file");
const workspace_1 = require("../../utility/workspace");
const workspace_models_1 = require("../../utility/workspace-models");
/**
 * Remove tsickle from libraries
 */
function removeTsickle() {
    return async (tree, { logger }) => {
        dependencies_1.removePackageJsonDependency(tree, 'tsickle');
        const workspace = await workspace_1.getWorkspace(tree);
        for (const [targetName, target] of workspace_1.allWorkspaceTargets(workspace)) {
            if (targetName !== 'build' || target.builder !== workspace_models_1.Builders.DeprecatedNgPackagr) {
                continue;
            }
            for (const [, options] of workspace_1.allTargetOptions(target)) {
                const tsConfigPath = options.tsConfig;
                if (!tsConfigPath || typeof tsConfigPath !== 'string') {
                    continue;
                }
                let tsConfigJson;
                try {
                    tsConfigJson = new json_file_1.JSONFile(tree, tsConfigPath);
                }
                catch {
                    logger.warn(`Cannot find file: ${tsConfigPath}`);
                    continue;
                }
                tsConfigJson.remove(['angularCompilerOptions', 'annotateForClosureCompiler']);
            }
        }
    };
}
exports.removeTsickle = removeTsickle;
