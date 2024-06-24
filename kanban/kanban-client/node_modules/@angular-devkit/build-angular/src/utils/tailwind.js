"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.findTailwindConfigurationFile = void 0;
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
const tailwindConfigFiles = [
    'tailwind.config.js',
    'tailwind.config.cjs',
    'tailwind.config.mjs',
    'tailwind.config.ts',
];
async function findTailwindConfigurationFile(workspaceRoot, projectRoot) {
    const dirEntries = [projectRoot, workspaceRoot].map((root) => (0, promises_1.readdir)(root, { withFileTypes: false }).then((entries) => ({
        root,
        files: new Set(entries),
    })));
    // A configuration file can exist in the project or workspace root
    for await (const { root, files } of dirEntries) {
        for (const potentialConfig of tailwindConfigFiles) {
            if (files.has(potentialConfig)) {
                return (0, node_path_1.join)(root, potentialConfig);
            }
        }
    }
    return undefined;
}
exports.findTailwindConfigurationFile = findTailwindConfigurationFile;
