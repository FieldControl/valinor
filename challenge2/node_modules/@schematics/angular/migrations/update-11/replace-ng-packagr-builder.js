"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
const schematics_1 = require("@angular-devkit/schematics");
const dependencies_1 = require("../../utility/dependencies");
const latest_versions_1 = require("../../utility/latest-versions");
const workspace_1 = require("../../utility/workspace");
const workspace_models_1 = require("../../utility/workspace-models");
function default_1() {
    return schematics_1.chain([
        workspace_1.updateWorkspace((workspace) => {
            for (const [, project] of workspace.projects) {
                for (const [, target] of project.targets) {
                    if (target.builder === workspace_models_1.Builders.DeprecatedNgPackagr) {
                        target.builder = workspace_models_1.Builders.NgPackagr;
                    }
                }
            }
        }),
        (host) => {
            dependencies_1.removePackageJsonDependency(host, '@angular-devkit/build-ng-packagr');
            dependencies_1.addPackageJsonDependency(host, {
                type: dependencies_1.NodeDependencyType.Dev,
                name: '@angular-devkit/build-angular',
                version: latest_versions_1.latestVersions.DevkitBuildAngular,
                overwrite: false,
            });
        },
    ]);
}
exports.default = default_1;
