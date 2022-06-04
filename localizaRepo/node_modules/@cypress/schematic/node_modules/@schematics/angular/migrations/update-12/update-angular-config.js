"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@angular-devkit/core");
const workspace_1 = require("../../utility/workspace");
const BrowserBuilderOptions = [
    ['aot', false, true],
    ['vendorChunk', true, false],
    ['extractLicenses', false, true],
    ['buildOptimizer', false, true],
    ['sourceMap', true, false],
    ['optimization', false, true],
    ['namedChunks', true, false],
];
const ServerBuilderOptions = [
    ['sourceMap', true, false],
    ['optimization', false, true],
];
function default_1() {
    return (_tree, context) => workspace_1.updateWorkspace((workspace) => {
        for (const [targetName, target, projectName] of workspace_1.allWorkspaceTargets(workspace)) {
            if (!target.builder.startsWith('@angular-devkit/') &&
                !target.builder.startsWith('@nguniversal/')) {
                context.logger.warn(core_1.tags.stripIndent `
            "${targetName}" target in "${projectName}" project is using a third-party builder.
            You may need to adjust the options to retain the existing behavior.
            For more information, see the breaking changes section within the release notes: https://github.com/angular/angular-cli/releases/tag/v12.0.0
          `);
                continue;
            }
            // Only interested in Angular Devkit browser and server builders
            switch (target.builder) {
                case '@angular-devkit/build-angular:server':
                    updateOptions(target, ServerBuilderOptions);
                    break;
                case '@angular-devkit/build-angular:browser':
                    updateOptions(target, BrowserBuilderOptions);
                    break;
            }
            for (const [, options] of workspace_1.allTargetOptions(target)) {
                delete options.experimentalRollupPass;
                delete options.lazyModules;
                delete options.forkTypeChecker;
            }
        }
    });
}
exports.default = default_1;
function updateOptions(target, optionsToUpdate) {
    // This is a hacky way to make this migration idempotent.
    // `defaultConfiguration` was only introduced in v12 projects and hence v11 projects do not have this property.
    // Setting it as an empty string will not cause any side-effect.
    if (typeof target.defaultConfiguration === 'string') {
        return;
    }
    target.defaultConfiguration = '';
    if (!target.options) {
        target.options = {};
    }
    const configurationOptions = target.configurations && Object.values(target.configurations);
    for (const [optionName, oldDefault, newDefault] of optionsToUpdate) {
        let value = target.options[optionName];
        if (value === newDefault) {
            // Value is same as new default
            delete target.options[optionName];
        }
        else if (value === undefined) {
            // Value is not defined, hence the default in the builder was used.
            target.options[optionName] = oldDefault;
            value = oldDefault;
        }
        // Remove overrides in configurations which are no longer needed.
        configurationOptions === null || configurationOptions === void 0 ? void 0 : configurationOptions.filter((o) => o && o[optionName] === value).forEach((o) => o && delete o[optionName]);
    }
}
