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
const workspace_1 = require("../../utility/workspace");
const workspace_models_1 = require("../../utility/workspace-models");
function default_1() {
    return (0, schematics_1.chain)([
        (0, workspace_1.updateWorkspace)((workspace) => {
            for (const [, project] of workspace.projects) {
                if (project.extensions.projectType !== workspace_models_1.ProjectType.Application) {
                    // Only interested in application projects since these changes only effects application builders
                    continue;
                }
                for (const [, target] of project.targets) {
                    if (target.builder === '@nguniversal/builders:ssr-dev-server') {
                        target.builder = '@angular-devkit/build-angular:ssr-dev-server';
                    }
                    else if (target.builder === '@nguniversal/builders:prerender') {
                        target.builder = '@angular-devkit/build-angular:prerender';
                        for (const [, options] of (0, workspace_1.allTargetOptions)(target, false)) {
                            // Remove and replace builder options
                            if (options['guessRoutes'] !== undefined) {
                                options['discoverRoutes'] = options['guessRoutes'];
                                delete options['guessRoutes'];
                            }
                            if (options['numProcesses'] !== undefined) {
                                delete options['numProcesses'];
                            }
                        }
                    }
                }
            }
        }),
        (host) => {
            (0, dependencies_1.removePackageJsonDependency)(host, '@nguniversal/builders');
        },
    ]);
}
exports.default = default_1;
