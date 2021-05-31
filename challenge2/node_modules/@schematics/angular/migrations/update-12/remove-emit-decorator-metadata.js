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
function* visitJsonFiles(directory) {
    for (const path of directory.subfiles) {
        if (!path.endsWith('.json')) {
            continue;
        }
        yield core_1.join(directory.path, path);
    }
    for (const path of directory.subdirs) {
        if (path === 'node_modules' || path.startsWith('.')) {
            continue;
        }
        yield* visitJsonFiles(directory.dir(path));
    }
}
function default_1() {
    return async (tree, { logger }) => {
        const workspace = await workspace_1.getWorkspace(tree);
        const hasThirdPartyBuilders = [...workspace_1.allWorkspaceTargets(workspace)].some(([, target]) => {
            const { builder } = target;
            return !(builder.startsWith('@angular-devkit/build-angular') ||
                builder.startsWith('@nguniversal/builders'));
        });
        if (hasThirdPartyBuilders) {
            logger.warn('Skipping migration as the workspace uses third-party builders which may ' +
                'require "emitDecoratorMetadata" TypeScript compiler option.');
            return;
        }
        for (const path of visitJsonFiles(tree.root)) {
            const content = tree.read(path);
            if (content === null || content === void 0 ? void 0 : content.toString().includes('"emitDecoratorMetadata"')) {
                const json = new json_file_1.JSONFile(tree, path);
                json.remove(['compilerOptions', 'emitDecoratorMetadata']);
            }
        }
    };
}
exports.default = default_1;
