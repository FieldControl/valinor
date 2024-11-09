"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
const workspace_1 = require("../../utility/workspace");
const workspace_models_1 = require("../../utility/workspace-models");
function default_1() {
    return (0, workspace_1.updateWorkspace)((workspace) => {
        for (const [, project] of workspace.projects) {
            if (project.extensions.projectType !== workspace_models_1.ProjectType.Application) {
                // Only interested in application projects since these changes only effects application builders
                continue;
            }
            for (const [, target] of project.targets) {
                if (target.builder === workspace_models_1.Builders.ExtractI18n || target.builder === workspace_models_1.Builders.DevServer) {
                    for (const [, options] of (0, workspace_1.allTargetOptions)(target, false)) {
                        if (options['browserTarget'] !== undefined) {
                            options['buildTarget'] = options['browserTarget'];
                            delete options['browserTarget'];
                        }
                    }
                }
            }
        }
    });
}
exports.default = default_1;
