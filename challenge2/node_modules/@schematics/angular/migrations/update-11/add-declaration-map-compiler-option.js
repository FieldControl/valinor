"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
const json_file_1 = require("../../utility/json-file");
const workspace_1 = require("../../utility/workspace");
const workspace_models_1 = require("../../utility/workspace-models");
function default_1() {
    return async (host) => {
        var _a;
        const workspace = await workspace_1.getWorkspace(host);
        for (const [, project] of workspace.projects) {
            for (const [, target] of project.targets) {
                if (target.builder !== workspace_models_1.Builders.NgPackagr) {
                    continue;
                }
                if (!target.configurations) {
                    continue;
                }
                for (const options of Object.values(target.configurations)) {
                    addDeclarationMapValue(host, options === null || options === void 0 ? void 0 : options.tsConfig, false);
                }
                addDeclarationMapValue(host, (_a = target.options) === null || _a === void 0 ? void 0 : _a.tsConfig, true);
            }
        }
    };
}
exports.default = default_1;
function addDeclarationMapValue(host, tsConfigPath, value) {
    if (typeof tsConfigPath !== 'string') {
        return;
    }
    const declarationMapPath = ['compilerOptions', 'declarationMap'];
    const file = new json_file_1.JSONFile(host, tsConfigPath);
    if (file.get(declarationMapPath) === undefined) {
        file.modify(declarationMapPath, value);
    }
}
