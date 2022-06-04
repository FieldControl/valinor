"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateApplicationTsConfigs = void 0;
const core_1 = require("@angular-devkit/core");
const path_1 = require("path");
const json_file_1 = require("../../utility/json-file");
const workspace_1 = require("../../utility/workspace");
const workspace_models_1 = require("../../utility/workspace-models");
const utils_1 = require("./utils");
/**
 * Update the tsconfig files for applications
 * - Removes enableIvy: true
 * - Sets stricter file inclusions
 * - Sets module compiler option to esnext or commonjs
 */
function updateApplicationTsConfigs() {
    return async (tree, { logger }) => {
        const workspace = await workspace_1.getWorkspace(tree);
        // Add `module` option in the workspace tsconfig
        updateModuleCompilerOption(tree, '/tsconfig.json');
        for (const [targetName, target, , project] of workspace_1.allWorkspaceTargets(workspace)) {
            switch (targetName) {
                case 'build':
                    if (target.builder !== workspace_models_1.Builders.Browser) {
                        continue;
                    }
                    break;
                case 'server':
                    if (target.builder !== workspace_models_1.Builders.Server) {
                        continue;
                    }
                    break;
                case 'test':
                    if (target.builder !== workspace_models_1.Builders.Karma) {
                        continue;
                    }
                    break;
                default:
                    continue;
            }
            updateTsConfig(tree, target, project.sourceRoot, logger);
        }
    };
}
exports.updateApplicationTsConfigs = updateApplicationTsConfigs;
function updateTsConfig(tree, builderConfig, projectSourceRoot, logger) {
    for (const [, options] of workspace_1.allTargetOptions(builderConfig)) {
        const tsConfigPath = options.tsConfig;
        if (!tsConfigPath || typeof tsConfigPath !== 'string') {
            continue;
        }
        // Update 'module' compilerOption
        updateModuleCompilerOption(tree, tsConfigPath, builderConfig.builder);
        let tsConfigJson;
        try {
            tsConfigJson = new json_file_1.JSONFile(tree, tsConfigPath);
        }
        catch {
            logger.warn(`Cannot find file: ${tsConfigPath}`);
            continue;
        }
        // Remove 'enableIvy: true' since this is the default in version 9.
        if (tsConfigJson.get(['angularCompilerOptions', 'enableIvy']) === true) {
            const angularCompilerOptions = tsConfigJson.get(['angularCompilerOptions']);
            const keys = Object.keys(angularCompilerOptions);
            if (keys.length === 1) {
                // remove entire 'angularCompilerOptions'
                tsConfigJson.remove(['angularCompilerOptions']);
            }
            else {
                // leave other options
                tsConfigJson.remove(['angularCompilerOptions', 'enableIvy']);
            }
        }
        // Add stricter file inclusions to avoid unused file warning during compilation
        if (builderConfig.builder !== workspace_models_1.Builders.Karma) {
            const include = tsConfigJson.get(['include']);
            if (include && Array.isArray(include)) {
                const tsInclude = include.findIndex((value) => typeof value === 'string' && value.endsWith('**/*.ts'));
                if (tsInclude !== -1) {
                    // Replace ts includes with d.ts
                    tsConfigJson.modify(['include', tsInclude], include[tsInclude].replace('.ts', '.d.ts'));
                }
            }
            else {
                // Includes are not present, add includes to dts files
                // By default when 'include' nor 'files' fields are used TypeScript
                // will include all ts files.
                const include = projectSourceRoot !== undefined
                    ? core_1.join(core_1.normalize(projectSourceRoot), '**/*.d.ts')
                    : '**/*.d.ts';
                tsConfigJson.modify(['include'], [include]);
            }
            const files = tsConfigJson.get(['files']);
            if (files === undefined) {
                const newFiles = [];
                const tsConfigDir = path_1.dirname(utils_1.forwardSlashPath(tsConfigPath));
                const mainOption = options.main;
                if (mainOption && typeof mainOption === 'string') {
                    newFiles.push(utils_1.forwardSlashPath(path_1.relative(tsConfigDir, utils_1.forwardSlashPath(mainOption))));
                }
                const polyfillsOption = options.polyfills;
                if (polyfillsOption && typeof polyfillsOption === 'string') {
                    newFiles.push(utils_1.forwardSlashPath(path_1.relative(tsConfigDir, utils_1.forwardSlashPath(polyfillsOption))));
                }
                if (newFiles.length) {
                    tsConfigJson.modify(['files'], newFiles);
                }
                tsConfigJson.remove(['exclude']);
            }
        }
    }
}
function updateModuleCompilerOption(tree, tsConfigPath, builderName) {
    let tsConfigJson;
    try {
        tsConfigJson = new json_file_1.JSONFile(tree, tsConfigPath);
    }
    catch {
        return;
    }
    const compilerOptions = tsConfigJson.get(['compilerOptions']);
    if (!compilerOptions || typeof compilerOptions !== 'object') {
        return;
    }
    const configExtends = tsConfigJson.get(['extends']);
    const isExtended = configExtends && typeof configExtends === 'string';
    // Server tsconfig should have a module of commonjs
    const moduleType = builderName === workspace_models_1.Builders.Server ? 'commonjs' : 'esnext';
    if (isExtended && builderName !== workspace_models_1.Builders.Server) {
        tsConfigJson.remove(['compilerOptions', 'module']);
    }
    else {
        tsConfigJson.modify(['compilerOptions', 'module'], moduleType);
    }
}
