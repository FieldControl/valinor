"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
const utility_1 = require("../../utility");
const dependencies_1 = require("../../utility/dependencies");
const latest_versions_1 = require("../../utility/latest-versions");
const workspace_1 = require("../../utility/workspace");
const workspace_models_1 = require("../../utility/workspace-models");
const BROWSER_SYNC_VERSION = latest_versions_1.latestVersions['browser-sync'];
function default_1() {
    return async (tree) => {
        if ((0, dependencies_1.getPackageJsonDependency)(tree, 'browser-sync')?.version === BROWSER_SYNC_VERSION) {
            return;
        }
        const workspace = await (0, workspace_1.getWorkspace)(tree);
        for (const project of workspace.projects.values()) {
            if (project.extensions.projectType !== workspace_models_1.ProjectType.Application) {
                continue;
            }
            for (const target of project.targets.values()) {
                if (target.builder === workspace_models_1.Builders.SsrDevServer) {
                    return (0, utility_1.addDependency)('browser-sync', BROWSER_SYNC_VERSION, {
                        type: utility_1.DependencyType.Dev,
                    });
                }
            }
        }
    };
}
exports.default = default_1;
