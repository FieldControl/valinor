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
const workspace_models_1 = require("../../utility/workspace-models");
function default_1() {
    return async (_host, context) => workspace_1.updateWorkspace((workspace) => {
        for (const [name, target] of workspace_1.allWorkspaceTargets(workspace)) {
            let defaultConfiguration;
            // Only interested in 1st party builders
            switch (target.builder) {
                case workspace_models_1.Builders.AppShell:
                case workspace_models_1.Builders.Browser:
                case workspace_models_1.Builders.Server:
                case workspace_models_1.Builders.NgPackagr:
                    defaultConfiguration = 'production';
                    break;
                case workspace_models_1.Builders.DevServer:
                case workspace_models_1.Builders.Protractor:
                case '@nguniversal/builders:ssr-dev-server':
                    defaultConfiguration = 'development';
                    break;
                case workspace_models_1.Builders.TsLint:
                case workspace_models_1.Builders.ExtractI18n:
                case workspace_models_1.Builders.Karma:
                    // Nothing to update
                    break;
                default:
                    context.logger
                        .warn(core_1.tags.stripIndents `Cannot update "${name}" target configuration as it's using "${target.builder}"
          which is a third-party builder. This target configuration will require manual review.`);
                    continue;
            }
            if (!defaultConfiguration) {
                continue;
            }
            updateTarget(name, target, context.logger, defaultConfiguration);
        }
    });
}
exports.default = default_1;
function getArchitectTargetWithConfig(currentTarget, overrideConfig) {
    const [project, target, config = 'development'] = currentTarget.split(':');
    return `${project}:${target}:${overrideConfig || config}`;
}
function updateTarget(targetName, target, logger, defaultConfiguration) {
    var _a, _b;
    if (!target.configurations) {
        target.configurations = {};
    }
    if ((_a = target.configurations) === null || _a === void 0 ? void 0 : _a.development) {
        logger.info(core_1.tags.stripIndents `Skipping updating "${targetName}" target configuration as a "development" configuration is already defined.`);
        return;
    }
    if (!((_b = target.configurations) === null || _b === void 0 ? void 0 : _b.production)) {
        logger.info(core_1.tags.stripIndents `Skipping updating "${targetName}" target configuration as a "production" configuration is not defined.`);
        return;
    }
    const developmentOptions = {};
    let serverTarget = true;
    let browserTarget = true;
    let devServerTarget = true;
    for (const [, options] of workspace_1.allTargetOptions(target)) {
        if (typeof options.serverTarget === 'string') {
            options.serverTarget = getArchitectTargetWithConfig(options.serverTarget);
            if (!developmentOptions.serverTarget) {
                developmentOptions.serverTarget = getArchitectTargetWithConfig(options.serverTarget, 'development');
            }
        }
        else {
            serverTarget = false;
        }
        if (typeof options.browserTarget === 'string') {
            options.browserTarget = getArchitectTargetWithConfig(options.browserTarget);
            if (!developmentOptions.browserTarget) {
                developmentOptions.browserTarget = getArchitectTargetWithConfig(options.browserTarget, 'development');
            }
        }
        else {
            browserTarget = false;
        }
        if (typeof options.devServerTarget === 'string') {
            options.devServerTarget = getArchitectTargetWithConfig(options.devServerTarget);
            if (!developmentOptions.devServerTarget) {
                developmentOptions.devServerTarget = getArchitectTargetWithConfig(options.devServerTarget, 'development');
            }
        }
        else {
            devServerTarget = false;
        }
    }
    // If all configurastions have a target defined delete the one in options.
    if (target.options) {
        if (serverTarget) {
            delete target.options.serverTarget;
        }
        if (browserTarget) {
            delete target.options.browserTarget;
        }
        if (devServerTarget) {
            delete target.options.devServerTarget;
        }
    }
    target.defaultConfiguration = defaultConfiguration;
    target.configurations.development = developmentOptions;
}
