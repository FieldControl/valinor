"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateWorkspaceConfig = exports.ANY_COMPONENT_STYLE_BUDGET = void 0;
const workspace_1 = require("../../utility/workspace");
const workspace_models_1 = require("../../utility/workspace-models");
const utils_1 = require("./utils");
exports.ANY_COMPONENT_STYLE_BUDGET = {
    type: 'anyComponentStyle',
    maximumWarning: '6kb',
};
function updateWorkspaceConfig() {
    return (tree) => workspace_1.updateWorkspace((workspace) => {
        for (const [targetName, target] of workspace_1.allWorkspaceTargets(workspace)) {
            switch (targetName) {
                case 'build':
                    if (target.builder !== workspace_models_1.Builders.Browser) {
                        break;
                    }
                    updateStyleOrScriptOption('styles', target);
                    updateStyleOrScriptOption('scripts', target);
                    addAnyComponentStyleBudget(target);
                    updateAotOption(tree, target);
                    break;
                case 'test':
                    if (target.builder !== workspace_models_1.Builders.Karma) {
                        break;
                    }
                    updateStyleOrScriptOption('styles', target);
                    updateStyleOrScriptOption('scripts', target);
                    break;
                case 'server':
                    if (target.builder !== workspace_models_1.Builders.Server) {
                        break;
                    }
                    updateOptimizationOption(target);
                    break;
            }
        }
    });
}
exports.updateWorkspaceConfig = updateWorkspaceConfig;
function updateAotOption(tree, builderConfig) {
    if (!builderConfig.options) {
        return;
    }
    const tsConfig = builderConfig.options.tsConfig;
    // Do not add aot option if the users already opted out from Ivy
    if (tsConfig && typeof tsConfig === 'string' && !utils_1.isIvyEnabled(tree, tsConfig)) {
        return;
    }
    // Add aot to options
    const aotOption = builderConfig.options.aot;
    if (aotOption === undefined || aotOption === false) {
        builderConfig.options.aot = true;
    }
    if (!builderConfig.configurations) {
        return;
    }
    for (const configurationOptions of Object.values(builderConfig.configurations)) {
        configurationOptions === null || configurationOptions === void 0 ? true : delete configurationOptions.aot;
    }
}
function updateStyleOrScriptOption(property, builderConfig) {
    for (const [, options] of workspace_1.allTargetOptions(builderConfig)) {
        const propertyOption = options[property];
        if (!propertyOption || !Array.isArray(propertyOption)) {
            continue;
        }
        for (const node of propertyOption) {
            if (!node || typeof node !== 'object' || Array.isArray(node)) {
                // skip non complex objects
                continue;
            }
            const lazy = node.lazy;
            if (lazy !== undefined) {
                delete node.lazy;
                // if lazy was not true, it is redundant hence, don't add it
                if (lazy) {
                    node.inject = false;
                }
            }
        }
    }
}
function addAnyComponentStyleBudget(builderConfig) {
    for (const [, options] of workspace_1.allTargetOptions(builderConfig, /* skipBaseOptions */ true)) {
        if (options.budgets === undefined) {
            options.budgets = [exports.ANY_COMPONENT_STYLE_BUDGET];
            continue;
        }
        if (!Array.isArray(options.budgets)) {
            continue;
        }
        // If 'anyComponentStyle' budget already exists, don't add
        const hasAnyComponentStyle = options.budgets.some((node) => {
            if (!node || typeof node !== 'object' || Array.isArray(node)) {
                // skip non complex objects
                return false;
            }
            return node.type === 'anyComponentStyle';
        });
        if (!hasAnyComponentStyle) {
            options.budgets.push(exports.ANY_COMPONENT_STYLE_BUDGET);
        }
    }
}
function updateOptimizationOption(builderConfig) {
    for (const [, options] of workspace_1.allTargetOptions(builderConfig, /* skipBaseOptions */ true)) {
        if (options.optimization !== true) {
            options.optimization = true;
        }
    }
}
