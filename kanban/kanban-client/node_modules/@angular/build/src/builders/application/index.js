"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildApplication = exports.buildApplicationInternal = void 0;
const architect_1 = require("@angular-devkit/architect");
const bundler_context_1 = require("../../tools/esbuild/bundler-context");
const utils_1 = require("../../tools/esbuild/utils");
const color_1 = require("../../utils/color");
const purge_cache_1 = require("../../utils/purge-cache");
const version_1 = require("../../utils/version");
const build_action_1 = require("./build-action");
const execute_build_1 = require("./execute-build");
const options_1 = require("./options");
async function* buildApplicationInternal(options, 
// TODO: Integrate abort signal support into builder system
context, infrastructureSettings, extensions) {
    const { workspaceRoot, logger, target } = context;
    // Check Angular version.
    (0, version_1.assertCompatibleAngularVersion)(workspaceRoot);
    // Purge old build disk cache.
    await (0, purge_cache_1.purgeStaleBuildCache)(context);
    // Determine project name from builder context target
    const projectName = target?.project;
    if (!projectName) {
        yield { success: false, error: `The 'application' builder requires a target to be specified.` };
        return;
    }
    const normalizedOptions = await (0, options_1.normalizeOptions)(context, projectName, options, extensions);
    const writeToFileSystem = infrastructureSettings?.write ?? true;
    const writeServerBundles = writeToFileSystem && !!(normalizedOptions.ssrOptions && normalizedOptions.serverEntryPoint);
    if (writeServerBundles) {
        const { browser, server } = normalizedOptions.outputOptions;
        if (browser === '') {
            yield {
                success: false,
                error: `'outputPath.browser' cannot be configured to an empty string when SSR is enabled.`,
            };
            return;
        }
        if (browser === server) {
            yield {
                success: false,
                error: `'outputPath.browser' and 'outputPath.server' cannot be configured to the same value.`,
            };
            return;
        }
    }
    // Setup an abort controller with a builder teardown if no signal is present
    let signal = context.signal;
    if (!signal) {
        const controller = new AbortController();
        signal = controller.signal;
        context.addTeardown(() => controller.abort('builder-teardown'));
    }
    yield* (0, build_action_1.runEsBuildBuildAction)(async (rebuildState) => {
        const { prerenderOptions, outputOptions, jsonLogs } = normalizedOptions;
        const startTime = process.hrtime.bigint();
        const result = await (0, execute_build_1.executeBuild)(normalizedOptions, context, rebuildState);
        if (jsonLogs) {
            result.addLog(await (0, utils_1.createJsonBuildManifest)(result, normalizedOptions));
        }
        else {
            if (prerenderOptions) {
                const prerenderedRoutesLength = result.prerenderedRoutes.length;
                let prerenderMsg = `Prerendered ${prerenderedRoutesLength} static route`;
                prerenderMsg += prerenderedRoutesLength !== 1 ? 's.' : '.';
                result.addLog(color_1.colors.magenta(prerenderMsg));
            }
            const buildTime = Number(process.hrtime.bigint() - startTime) / 10 ** 9;
            const hasError = result.errors.length > 0;
            if (writeToFileSystem && !hasError) {
                result.addLog(`Output location: ${outputOptions.base}\n`);
            }
            result.addLog(`Application bundle generation ${hasError ? 'failed' : 'complete'}. [${buildTime.toFixed(3)} seconds]\n`);
        }
        return result;
    }, {
        watch: normalizedOptions.watch,
        preserveSymlinks: normalizedOptions.preserveSymlinks,
        poll: normalizedOptions.poll,
        deleteOutputPath: normalizedOptions.deleteOutputPath,
        cacheOptions: normalizedOptions.cacheOptions,
        outputOptions: normalizedOptions.outputOptions,
        verbose: normalizedOptions.verbose,
        projectRoot: normalizedOptions.projectRoot,
        workspaceRoot: normalizedOptions.workspaceRoot,
        progress: normalizedOptions.progress,
        clearScreen: normalizedOptions.clearScreen,
        colors: normalizedOptions.colors,
        jsonLogs: normalizedOptions.jsonLogs,
        writeToFileSystem,
        // For app-shell and SSG server files are not required by users.
        // Omit these when SSR is not enabled.
        writeToFileSystemFilter: writeServerBundles
            ? undefined
            : (file) => file.type !== bundler_context_1.BuildOutputFileType.Server,
        logger,
        signal,
    });
}
exports.buildApplicationInternal = buildApplicationInternal;
function buildApplication(options, context, pluginsOrExtensions) {
    let extensions;
    if (pluginsOrExtensions && Array.isArray(pluginsOrExtensions)) {
        extensions = {
            codePlugins: pluginsOrExtensions,
        };
    }
    else {
        extensions = pluginsOrExtensions;
    }
    return buildApplicationInternal(options, context, undefined, extensions);
}
exports.buildApplication = buildApplication;
exports.default = (0, architect_1.createBuilder)(buildApplication);
