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
const json_file_1 = require("../../utility/json-file");
const workspace_1 = require("../../utility/workspace");
const workspace_models_1 = require("../../utility/workspace-models");
function default_1() {
    return async (host, { logger }) => {
        var _a;
        // Workspace level tsconfig
        try {
            updateModuleAndTarget(host, 'tsconfig.json', {
                oldModule: 'esnext',
                newModule: 'es2020',
            });
        }
        catch (error) {
            logger.warn(`Unable to update 'tsconfig.json' module option from 'esnext' to 'es2020': ${error.message || error}`);
        }
        const workspace = await workspace_1.getWorkspace(host);
        // Find all tsconfig which are refereces used by builders
        for (const [, project] of workspace.projects) {
            for (const [, target] of project.targets) {
                // E2E builder doesn't reference a tsconfig but it uses one found in the root folder.
                if (target.builder === workspace_models_1.Builders.Protractor &&
                    typeof ((_a = target.options) === null || _a === void 0 ? void 0 : _a.protractorConfig) === 'string') {
                    const tsConfigPath = core_1.join(core_1.dirname(core_1.normalize(target.options.protractorConfig)), 'tsconfig.json');
                    try {
                        updateModuleAndTarget(host, tsConfigPath, {
                            oldTarget: 'es5',
                            newTarget: 'es2018',
                        });
                    }
                    catch (error) {
                        logger.warn(`Unable to update '${tsConfigPath}' target option from 'es5' to 'es2018': ${error.message || error}`);
                    }
                    continue;
                }
                // Update all other known CLI builders that use a tsconfig
                const tsConfigs = [target.options || {}, ...Object.values(target.configurations || {})]
                    .filter((opt) => typeof (opt === null || opt === void 0 ? void 0 : opt.tsConfig) === 'string')
                    .map((opt) => opt.tsConfig);
                const uniqueTsConfigs = [...new Set(tsConfigs)];
                if (uniqueTsConfigs.length < 1) {
                    continue;
                }
                switch (target.builder) {
                    case workspace_models_1.Builders.Server:
                        uniqueTsConfigs.forEach((p) => {
                            try {
                                updateModuleAndTarget(host, p, {
                                    oldModule: 'commonjs',
                                    // False will remove the module
                                    // NB: For server we no longer use commonjs because it is bundled using webpack which has it's own module system.
                                    // This ensures that lazy-loaded works on the server.
                                    newModule: false,
                                });
                            }
                            catch (error) {
                                logger.warn(`Unable to remove '${p}' module option (was 'commonjs'): ${error.message || error}`);
                            }
                            try {
                                updateModuleAndTarget(host, p, {
                                    newTarget: 'es2016',
                                });
                            }
                            catch (error) {
                                logger.warn(`Unable to update '${p}' target option to 'es2016': ${error.message || error}`);
                            }
                        });
                        break;
                    case workspace_models_1.Builders.Karma:
                    case workspace_models_1.Builders.Browser:
                    case workspace_models_1.Builders.DeprecatedNgPackagr:
                        uniqueTsConfigs.forEach((p) => {
                            try {
                                updateModuleAndTarget(host, p, {
                                    oldModule: 'esnext',
                                    newModule: 'es2020',
                                });
                            }
                            catch (error) {
                                logger.warn(`Unable to update '${p}' module option from 'esnext' to 'es2020': ${error.message || error}`);
                            }
                        });
                        break;
                }
            }
        }
    };
}
exports.default = default_1;
function updateModuleAndTarget(host, tsConfigPath, replacements) {
    const json = new json_file_1.JSONFile(host, tsConfigPath);
    const { oldTarget, newTarget, newModule, oldModule } = replacements;
    if (newTarget) {
        const target = json.get(['compilerOptions', 'target']);
        if ((typeof target === 'string' && (!oldTarget || oldTarget === target.toLowerCase())) ||
            !target) {
            json.modify(['compilerOptions', 'target'], newTarget);
        }
    }
    if (newModule === false) {
        json.remove(['compilerOptions', 'module']);
    }
    else if (newModule) {
        const module = json.get(['compilerOptions', 'module']);
        if (typeof module === 'string' && oldModule === module.toLowerCase()) {
            json.modify(['compilerOptions', 'module'], newModule);
        }
    }
}
