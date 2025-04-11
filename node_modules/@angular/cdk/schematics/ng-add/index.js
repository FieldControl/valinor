"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const tasks_1 = require("@angular-devkit/schematics/tasks");
const package_config_1 = require("./package-config");
/**
 * Schematic factory entry-point for the `ng-add` schematic. The ng-add schematic will be
 * automatically executed if developers run `ng add @angular/cdk`.
 *
 * By default, the CLI already installs the package that has been specified with `ng add`.
 * We just store the version in the `package.json` in case the package manager didn't. Also
 * this ensures that there will be no error that says that the CDK does not support `ng add`.
 */
function default_1() {
    return (host, context) => {
        // The CLI inserts `@angular/cdk` into the `package.json` before this schematic runs. This
        // means that we do not need to insert the CDK into `package.json` files again. In some cases
        // though, it could happen that this schematic runs outside of the CLI `ng add` command, or
        // the CDK is only listed as a dev dependency. If that is the case, we insert a version based
        // on the current build version (substituted version placeholder).
        if ((0, package_config_1.getPackageVersionFromPackageJson)(host, '@angular/cdk') === null) {
            // In order to align the CDK version with other Angular dependencies that are setup by
            // `@schematics/angular`, we use tilde instead of caret. This is default for Angular
            // dependencies in new CLI projects.
            (0, package_config_1.addPackageToPackageJson)(host, '@angular/cdk', `~19.2.9`);
            // Add a task to run the package manager. This is necessary because we updated the
            // workspace "package.json" file and we want lock files to reflect the new version range.
            context.addTask(new tasks_1.NodePackageInstallTask());
        }
    };
}
//# sourceMappingURL=index.js.map