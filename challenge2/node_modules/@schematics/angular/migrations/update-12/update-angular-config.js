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
    return workspace_1.updateWorkspace((workspace) => {
        for (const [, target] of workspace_1.allWorkspaceTargets(workspace)) {
            if (!(target === null || target === void 0 ? void 0 : target.builder.startsWith('@angular-devkit/build-angular'))) {
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
