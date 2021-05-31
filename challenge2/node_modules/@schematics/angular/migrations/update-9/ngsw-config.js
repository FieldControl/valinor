"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateNGSWConfig = void 0;
const json_file_1 = require("../../utility/json-file");
const workspace_1 = require("../../utility/workspace");
const workspace_models_1 = require("../../utility/workspace-models");
/**
 * Update ngsw-config.json to fix issue https://github.com/angular/angular-cli/pull/15277
 */
function updateNGSWConfig() {
    return async (tree, { logger }) => {
        const workspace = await workspace_1.getWorkspace(tree);
        for (const [targetName, target] of workspace_1.allWorkspaceTargets(workspace)) {
            if (targetName !== 'build' || target.builder !== workspace_models_1.Builders.Browser) {
                continue;
            }
            for (const [, options] of workspace_1.allTargetOptions(target)) {
                const ngswConfigPath = options.ngswConfigPath;
                if (!ngswConfigPath || typeof ngswConfigPath !== 'string') {
                    continue;
                }
                let ngswConfigJson;
                try {
                    ngswConfigJson = new json_file_1.JSONFile(tree, ngswConfigPath);
                }
                catch {
                    logger.warn(`Cannot find file: ${ngswConfigPath}`);
                    continue;
                }
                const assetGroups = ngswConfigJson.get(['assetGroups']);
                if (!assetGroups || !Array.isArray(assetGroups)) {
                    continue;
                }
                const prefetchElementIndex = assetGroups.findIndex((element) => (element === null || element === void 0 ? void 0 : element.installMode) === 'prefetch');
                if (prefetchElementIndex === -1) {
                    continue;
                }
                const filesPath = ['assetGroups', prefetchElementIndex, 'resources', 'files'];
                const files = ngswConfigJson.get(filesPath);
                if (!files || !Array.isArray(files)) {
                    continue;
                }
                const hasManifest = files.some((value) => typeof value === 'string' && value.endsWith('manifest.webmanifest'));
                if (hasManifest) {
                    continue;
                }
                // Append to files array
                ngswConfigJson.modify([...filesPath, -1], '/manifest.webmanifest');
            }
        }
    };
}
exports.updateNGSWConfig = updateNGSWConfig;
