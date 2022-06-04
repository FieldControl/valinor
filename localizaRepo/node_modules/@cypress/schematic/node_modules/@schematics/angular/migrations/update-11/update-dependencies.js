"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tasks_1 = require("@angular-devkit/schematics/tasks");
const dependencies_1 = require("../../utility/dependencies");
function default_1() {
    return (host, context) => {
        const dependenciesToUpdate = {
            '@types/jasmine': '~3.6.0',
            'codelyzer': '^6.0.0',
            'jasmine-core': '~3.6.0',
            'jasmine-spec-reporter': '~5.0.0',
            'karma-chrome-launcher': '~3.1.0',
            'karma-coverage': '~2.0.3',
            'karma-jasmine': '~4.0.0',
            'karma-jasmine-html-reporter': '^1.5.0',
            'tslib': '^2.0.0',
        };
        let hasChanges = false;
        for (const [name, version] of Object.entries(dependenciesToUpdate)) {
            const current = dependencies_1.getPackageJsonDependency(host, name);
            if (!current || current.version === version) {
                continue;
            }
            dependencies_1.addPackageJsonDependency(host, {
                type: current.type,
                name,
                version,
                overwrite: true,
            });
            hasChanges = true;
        }
        if (hasChanges) {
            context.addTask(new tasks_1.NodePackageInstallTask());
        }
    };
}
exports.default = default_1;
