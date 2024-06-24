"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runEsBuildBuildAction = void 0;
const node_fs_1 = require("node:fs");
const node_path_1 = __importDefault(require("node:path"));
const sass_language_1 = require("../../tools/esbuild/stylesheets/sass-language");
const utils_1 = require("../../tools/esbuild/utils");
const delete_output_dir_1 = require("../../utils/delete-output-dir");
const environment_options_1 = require("../../utils/environment-options");
// Watch workspace for package manager changes
const packageWatchFiles = [
    // manifest can affect module resolution
    'package.json',
    // npm lock file
    'package-lock.json',
    // pnpm lock file
    'pnpm-lock.yaml',
    // yarn lock file including Yarn PnP manifest files (https://yarnpkg.com/advanced/pnp-spec/)
    'yarn.lock',
    '.pnp.cjs',
    '.pnp.data.json',
];
async function* runEsBuildBuildAction(action, options) {
    const { writeToFileSystemFilter, writeToFileSystem, watch, poll, clearScreen, logger, deleteOutputPath, cacheOptions, outputOptions, verbose, projectRoot, workspaceRoot, progress, preserveSymlinks, colors, jsonLogs, } = options;
    if (deleteOutputPath && writeToFileSystem) {
        await (0, delete_output_dir_1.deleteOutputDir)(workspaceRoot, outputOptions.base, [
            outputOptions.browser,
            outputOptions.server,
        ]);
    }
    const withProgress = progress ? utils_1.withSpinner : utils_1.withNoProgress;
    // Initial build
    let result;
    try {
        // Perform the build action
        result = await withProgress('Building...', () => action());
        // Log all diagnostic (error/warning/logs) messages
        await (0, utils_1.logMessages)(logger, result, colors, jsonLogs);
    }
    finally {
        // Ensure Sass workers are shutdown if not watching
        if (!watch) {
            (0, sass_language_1.shutdownSassWorkerPool)();
        }
    }
    // Setup watcher if watch mode enabled
    let watcher;
    if (watch) {
        if (progress) {
            logger.info('Watch mode enabled. Watching for file changes...');
        }
        const ignored = [
            // Ignore the output and cache paths to avoid infinite rebuild cycles
            outputOptions.base,
            cacheOptions.basePath,
            `${workspaceRoot.replace(/\\/g, '/')}/**/.*/**`,
        ];
        if (!preserveSymlinks) {
            // Ignore all node modules directories to avoid excessive file watchers.
            // Package changes are handled below by watching manifest and lock files.
            // NOTE: this is not enable when preserveSymlinks is true as this would break `npm link` usages.
            ignored.push('**/node_modules/**');
        }
        // Setup a watcher
        const { createWatcher } = await Promise.resolve().then(() => __importStar(require('../../tools/esbuild/watcher')));
        watcher = createWatcher({
            polling: typeof poll === 'number',
            interval: poll,
            followSymlinks: preserveSymlinks,
            ignored,
        });
        // Setup abort support
        options.signal?.addEventListener('abort', () => void watcher?.close());
        // Watch the entire project root if 'NG_BUILD_WATCH_ROOT' environment variable is set
        if (environment_options_1.shouldWatchRoot) {
            watcher.add(projectRoot);
        }
        watcher.add(packageWatchFiles
            .map((file) => node_path_1.default.join(workspaceRoot, file))
            .filter((file) => (0, node_fs_1.existsSync)(file)));
        // Watch locations provided by the initial build result
        watcher.add(result.watchFiles);
    }
    // Output the first build results after setting up the watcher to ensure that any code executed
    // higher in the iterator call stack will trigger the watcher. This is particularly relevant for
    // unit tests which execute the builder and modify the file system programmatically.
    yield await writeAndEmitOutput(writeToFileSystem, result, outputOptions, writeToFileSystemFilter);
    // Finish if watch mode is not enabled
    if (!watcher) {
        return;
    }
    // Wait for changes and rebuild as needed
    const currentWatchFiles = new Set(result.watchFiles);
    try {
        for await (const changes of watcher) {
            if (options.signal?.aborted) {
                break;
            }
            if (clearScreen) {
                // eslint-disable-next-line no-console
                console.clear();
            }
            if (verbose) {
                logger.info(changes.toDebugString());
            }
            // Clear removed files from current watch files
            changes.removed.forEach((removedPath) => currentWatchFiles.delete(removedPath));
            result = await withProgress('Changes detected. Rebuilding...', () => action(result.createRebuildState(changes)));
            // Log all diagnostic (error/warning/logs) messages
            await (0, utils_1.logMessages)(logger, result, colors, jsonLogs);
            // Update watched locations provided by the new build result.
            // Keep watching all previous files if there are any errors; otherwise consider all
            // files stale until confirmed present in the new result's watch files.
            const staleWatchFiles = result.errors.length > 0 ? undefined : new Set(currentWatchFiles);
            for (const watchFile of result.watchFiles) {
                if (!currentWatchFiles.has(watchFile)) {
                    // Add new watch location
                    watcher.add(watchFile);
                    currentWatchFiles.add(watchFile);
                }
                // Present so remove from stale locations
                staleWatchFiles?.delete(watchFile);
            }
            // Remove any stale locations if the build was successful
            if (staleWatchFiles?.size) {
                watcher.remove([...staleWatchFiles]);
            }
            yield await writeAndEmitOutput(writeToFileSystem, result, outputOptions, writeToFileSystemFilter);
        }
    }
    finally {
        // Stop the watcher and cleanup incremental rebuild state
        await Promise.allSettled([watcher.close(), result.dispose()]);
        (0, sass_language_1.shutdownSassWorkerPool)();
    }
}
exports.runEsBuildBuildAction = runEsBuildBuildAction;
async function writeAndEmitOutput(writeToFileSystem, { outputFiles, output, outputWithFiles, assetFiles }, outputOptions, writeToFileSystemFilter) {
    if (writeToFileSystem) {
        // Write output files
        const outputFilesToWrite = writeToFileSystemFilter
            ? outputFiles.filter(writeToFileSystemFilter)
            : outputFiles;
        await (0, utils_1.writeResultFiles)(outputFilesToWrite, assetFiles, outputOptions);
        return output;
    }
    else {
        // Requires casting due to unneeded `JsonObject` requirement. Remove once fixed.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return outputWithFiles;
    }
}
