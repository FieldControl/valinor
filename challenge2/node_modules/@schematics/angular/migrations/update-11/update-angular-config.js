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
function default_1() {
    return workspace_1.updateWorkspace((workspace) => {
        const optionsToRemove = {
            environment: undefined,
            extractCss: undefined,
            tsconfigFileName: undefined,
            rebaseRootRelativeCssUrls: undefined,
        };
        for (const [, project] of workspace.projects) {
            for (const [, target] of project.targets) {
                // Only interested in Angular Devkit builders
                if (!(target === null || target === void 0 ? void 0 : target.builder.startsWith('@angular-devkit/build-angular'))) {
                    continue;
                }
                // Check options
                if (target.options) {
                    target.options = {
                        ...updateLazyScriptsStyleOption(target.options),
                        ...optionsToRemove,
                    };
                }
                // Go through each configuration entry
                if (!target.configurations) {
                    continue;
                }
                for (const configurationName of Object.keys(target.configurations)) {
                    target.configurations[configurationName] = {
                        ...updateLazyScriptsStyleOption(target.configurations[configurationName]),
                        ...optionsToRemove,
                    };
                }
            }
        }
    });
}
exports.default = default_1;
function updateLazyScriptsStyleOption(options) {
    function visitor(options, type) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        if (!options[type] || !core_1.isJsonArray(options[type])) {
            return undefined;
        }
        const entries = [];
        for (const entry of options[type]) {
            if (core_1.isJsonObject(entry) && 'lazy' in entry) {
                entries.push({
                    ...entry,
                    inject: !entry.lazy,
                    lazy: undefined,
                });
            }
            else {
                entries.push(entry);
            }
        }
        return entries;
    }
    if (!options) {
        return undefined;
    }
    return {
        ...options,
        styles: visitor(options, 'styles'),
        scripts: visitor(options, 'scripts'),
    };
}
