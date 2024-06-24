"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateBudgetStats = void 0;
const node_path_1 = require("node:path");
/**
 * Generates a bundle budget calculator compatible stats object that provides
 * the necessary information for the Webpack-based bundle budget code to
 * interoperate with the esbuild-based builders.
 * @param metafile The esbuild metafile of a build to use.
 * @param initialFiles The records of all initial files of a build.
 * @returns A bundle budget compatible stats object.
 */
function generateBudgetStats(metafile, initialFiles) {
    const stats = {
        chunks: [],
        assets: [],
    };
    for (const [file, entry] of Object.entries(metafile.outputs)) {
        if (!file.endsWith('.js') && !file.endsWith('.css')) {
            continue;
        }
        // Exclude server bundles
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (entry['ng-platform-server']) {
            continue;
        }
        const initialRecord = initialFiles.get(file);
        let name = initialRecord?.name;
        if (name === undefined && entry.entryPoint) {
            // For non-initial lazy modules, convert the entry point file into a Webpack compatible name
            name = (0, node_path_1.basename)(entry.entryPoint)
                .replace(/\.[cm]?[jt]s$/, '')
                .replace(/[\\/.]/g, '-');
        }
        stats.chunks.push({
            files: [file],
            initial: !!initialRecord,
            names: name ? [name] : undefined,
        });
        // 'ng-component' is set by the angular plugin's component stylesheet bundler
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const componentStyle = entry['ng-component'];
        stats.assets.push({
            // Component styles use the input file while all other outputs use the result file
            name: (componentStyle && Object.keys(entry.inputs)[0]) || file,
            size: entry.bytes,
            componentStyle,
        });
    }
    return stats;
}
exports.generateBudgetStats = generateBudgetStats;
