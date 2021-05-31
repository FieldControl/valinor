"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LintCommand = void 0;
const architect_command_1 = require("../models/architect-command");
const MissingBuilder = `
Cannot find "lint" target for the specified project.

You should add a package that implements linting capabilities.

For example:
  ng add @angular-eslint/schematics
`;
class LintCommand extends architect_command_1.ArchitectCommand {
    constructor() {
        super(...arguments);
        this.target = 'lint';
        this.multiTarget = true;
        this.missingTargetError = MissingBuilder;
    }
    async initialize(options) {
        if (!options.help) {
            return super.initialize(options);
        }
    }
}
exports.LintCommand = LintCommand;
