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
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildWebpackBrowser = exports.BUILD_TIMEOUT = void 0;
const architect_1 = require("@angular-devkit/architect");
const build_webpack_1 = require("@angular-devkit/build-webpack");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const utils_1 = require("../../utils");
const bundle_calculator_1 = require("../../utils/bundle-calculator");
const color_1 = require("../../utils/color");
const copy_assets_1 = require("../../utils/copy-assets");
const error_1 = require("../../utils/error");
const i18n_inlining_1 = require("../../utils/i18n-inlining");
const index_html_generator_1 = require("../../utils/index-file/index-html-generator");
const normalize_cache_1 = require("../../utils/normalize-cache");
const output_paths_1 = require("../../utils/output-paths");
const package_chunk_sort_1 = require("../../utils/package-chunk-sort");
const purge_cache_1 = require("../../utils/purge-cache");
const service_worker_1 = require("../../utils/service-worker");
const spinner_1 = require("../../utils/spinner");
const version_1 = require("../../utils/version");
const webpack_browser_config_1 = require("../../utils/webpack-browser-config");
const configs_1 = require("../../webpack/configs");
const async_chunks_1 = require("../../webpack/utils/async-chunks");
const helpers_1 = require("../../webpack/utils/helpers");
const stats_1 = require("../../webpack/utils/stats");
/**
 * Maximum time in milliseconds for single build/rebuild
 * This accounts for CI variability.
 */
exports.BUILD_TIMEOUT = 30000;
async function initialize(options, context, webpackConfigurationTransform) {
    const originalOutputPath = options.outputPath;
    // Assets are processed directly by the builder except when watching
    const adjustedOptions = options.watch ? options : { ...options, assets: [] };
    const { config, projectRoot, projectSourceRoot, i18n } = await (0, webpack_browser_config_1.generateI18nBrowserWebpackConfigFromContext)(adjustedOptions, context, (wco) => [
        (0, configs_1.getCommonConfig)(wco),
        (0, configs_1.getStylesConfig)(wco),
    ]);
    let transformedConfig;
    if (webpackConfigurationTransform) {
        transformedConfig = await webpackConfigurationTransform(config);
    }
    if (options.deleteOutputPath) {
        (0, utils_1.deleteOutputDir)(context.workspaceRoot, originalOutputPath);
    }
    return { config: transformedConfig || config, projectRoot, projectSourceRoot, i18n };
}
/**
 * @experimental Direct usage of this function is considered experimental.
 */
// eslint-disable-next-line max-lines-per-function
function buildWebpackBrowser(options, context, transforms = {}) {
    var _a;
    const projectName = (_a = context.target) === null || _a === void 0 ? void 0 : _a.project;
    if (!projectName) {
        throw new Error('The builder requires a target.');
    }
    const baseOutputPath = path.resolve(context.workspaceRoot, options.outputPath);
    let outputPaths;
    // Check Angular version.
    (0, version_1.assertCompatibleAngularVersion)(context.workspaceRoot);
    return (0, rxjs_1.from)(context.getProjectMetadata(projectName)).pipe((0, operators_1.switchMap)(async (projectMetadata) => {
        var _a;
        var _b;
        // Purge old build disk cache.
        await (0, purge_cache_1.purgeStaleBuildCache)(context);
        // Initialize builder
        const initialization = await initialize(options, context, transforms.webpackConfiguration);
        // Add index file to watched files.
        if (options.watch) {
            const indexInputFile = path.join(context.workspaceRoot, (0, webpack_browser_config_1.getIndexInputFile)(options.index));
            (_a = (_b = initialization.config).plugins) !== null && _a !== void 0 ? _a : (_b.plugins = []);
            initialization.config.plugins.push({
                apply: (compiler) => {
                    compiler.hooks.thisCompilation.tap('build-angular', (compilation) => {
                        compilation.fileDependencies.add(indexInputFile);
                    });
                },
            });
        }
        return {
            ...initialization,
            cacheOptions: (0, normalize_cache_1.normalizeCacheOptions)(projectMetadata, context.workspaceRoot),
        };
    }), (0, operators_1.switchMap)(
    // eslint-disable-next-line max-lines-per-function
    ({ config, projectRoot, projectSourceRoot, i18n, cacheOptions }) => {
        const normalizedOptimization = (0, utils_1.normalizeOptimization)(options.optimization);
        return (0, build_webpack_1.runWebpack)(config, context, {
            webpackFactory: require('webpack'),
            logging: transforms.logging ||
                ((stats, config) => {
                    if (options.verbose) {
                        context.logger.info(stats.toString(config.stats));
                    }
                }),
        }).pipe((0, operators_1.concatMap)(
        // eslint-disable-next-line max-lines-per-function
        async (buildEvent) => {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            const spinner = new spinner_1.Spinner();
            spinner.enabled = options.progress !== false;
            const { success, emittedFiles = [], outputPath: webpackOutputPath } = buildEvent;
            const webpackRawStats = buildEvent.webpackStats;
            if (!webpackRawStats) {
                throw new Error('Webpack stats build result is required.');
            }
            // Fix incorrectly set `initial` value on chunks.
            const extraEntryPoints = [
                ...(0, helpers_1.normalizeExtraEntryPoints)(options.styles || [], 'styles'),
                ...(0, helpers_1.normalizeExtraEntryPoints)(options.scripts || [], 'scripts'),
            ];
            const webpackStats = {
                ...webpackRawStats,
                chunks: (0, async_chunks_1.markAsyncChunksNonInitial)(webpackRawStats, extraEntryPoints),
            };
            if (!success) {
                // If using bundle downleveling then there is only one build
                // If it fails show any diagnostic messages and bail
                if ((0, stats_1.statsHasWarnings)(webpackStats)) {
                    context.logger.warn((0, stats_1.statsWarningsToString)(webpackStats, { colors: true }));
                }
                if ((0, stats_1.statsHasErrors)(webpackStats)) {
                    context.logger.error((0, stats_1.statsErrorsToString)(webpackStats, { colors: true }));
                }
                return {
                    webpackStats: webpackRawStats,
                    output: { success: false },
                };
            }
            else {
                outputPaths = (0, output_paths_1.ensureOutputPaths)(baseOutputPath, i18n);
                const scriptsEntryPointName = (0, helpers_1.normalizeExtraEntryPoints)(options.scripts || [], 'scripts').map((x) => x.bundleName);
                if (i18n.shouldInline) {
                    const success = await (0, i18n_inlining_1.i18nInlineEmittedFiles)(context, emittedFiles, i18n, baseOutputPath, Array.from(outputPaths.values()), scriptsEntryPointName, webpackOutputPath, options.i18nMissingTranslation);
                    if (!success) {
                        return {
                            webpackStats: webpackRawStats,
                            output: { success: false },
                        };
                    }
                }
                // Check for budget errors and display them to the user.
                const budgets = options.budgets;
                let budgetFailures;
                if (budgets === null || budgets === void 0 ? void 0 : budgets.length) {
                    budgetFailures = [...(0, bundle_calculator_1.checkBudgets)(budgets, webpackStats)];
                    for (const { severity, message } of budgetFailures) {
                        switch (severity) {
                            case bundle_calculator_1.ThresholdSeverity.Warning:
                                (_a = webpackStats.warnings) === null || _a === void 0 ? void 0 : _a.push({ message });
                                break;
                            case bundle_calculator_1.ThresholdSeverity.Error:
                                (_b = webpackStats.errors) === null || _b === void 0 ? void 0 : _b.push({ message });
                                break;
                            default:
                                assertNever(severity);
                        }
                    }
                }
                const buildSuccess = success && !(0, stats_1.statsHasErrors)(webpackStats);
                if (buildSuccess) {
                    // Copy assets
                    if (!options.watch && ((_c = options.assets) === null || _c === void 0 ? void 0 : _c.length)) {
                        spinner.start('Copying assets...');
                        try {
                            await (0, copy_assets_1.copyAssets)((0, utils_1.normalizeAssetPatterns)(options.assets, context.workspaceRoot, projectRoot, projectSourceRoot), Array.from(outputPaths.values()), context.workspaceRoot);
                            spinner.succeed('Copying assets complete.');
                        }
                        catch (err) {
                            spinner.fail(color_1.colors.redBright('Copying of assets failed.'));
                            (0, error_1.assertIsError)(err);
                            return {
                                output: {
                                    success: false,
                                    error: 'Unable to copy assets: ' + err.message,
                                },
                                webpackStats: webpackRawStats,
                            };
                        }
                    }
                    if (options.index) {
                        spinner.start('Generating index html...');
                        const entrypoints = (0, package_chunk_sort_1.generateEntryPoints)({
                            scripts: (_d = options.scripts) !== null && _d !== void 0 ? _d : [],
                            styles: (_e = options.styles) !== null && _e !== void 0 ? _e : [],
                        });
                        const indexHtmlGenerator = new index_html_generator_1.IndexHtmlGenerator({
                            cache: cacheOptions,
                            indexPath: path.join(context.workspaceRoot, (0, webpack_browser_config_1.getIndexInputFile)(options.index)),
                            entrypoints,
                            deployUrl: options.deployUrl,
                            sri: options.subresourceIntegrity,
                            optimization: normalizedOptimization,
                            crossOrigin: options.crossOrigin,
                            postTransform: transforms.indexHtml,
                        });
                        let hasErrors = false;
                        for (const [locale, outputPath] of outputPaths.entries()) {
                            try {
                                const { content, warnings, errors } = await indexHtmlGenerator.process({
                                    baseHref: (_f = getLocaleBaseHref(i18n, locale)) !== null && _f !== void 0 ? _f : options.baseHref,
                                    // i18nLocale is used when Ivy is disabled
                                    lang: locale || undefined,
                                    outputPath,
                                    files: mapEmittedFilesToFileInfo(emittedFiles),
                                });
                                if (warnings.length || errors.length) {
                                    spinner.stop();
                                    warnings.forEach((m) => context.logger.warn(m));
                                    errors.forEach((m) => {
                                        context.logger.error(m);
                                        hasErrors = true;
                                    });
                                    spinner.start();
                                }
                                const indexOutput = path.join(outputPath, (0, webpack_browser_config_1.getIndexOutputFile)(options.index));
                                await fs.promises.mkdir(path.dirname(indexOutput), { recursive: true });
                                await fs.promises.writeFile(indexOutput, content);
                            }
                            catch (error) {
                                spinner.fail('Index html generation failed.');
                                (0, error_1.assertIsError)(error);
                                return {
                                    webpackStats: webpackRawStats,
                                    output: { success: false, error: error.message },
                                };
                            }
                        }
                        if (hasErrors) {
                            spinner.fail('Index html generation failed.');
                            return {
                                webpackStats: webpackRawStats,
                                output: { success: false },
                            };
                        }
                        else {
                            spinner.succeed('Index html generation complete.');
                        }
                    }
                    if (options.serviceWorker) {
                        spinner.start('Generating service worker...');
                        for (const [locale, outputPath] of outputPaths.entries()) {
                            try {
                                await (0, service_worker_1.augmentAppWithServiceWorker)(projectRoot, context.workspaceRoot, outputPath, (_h = (_g = getLocaleBaseHref(i18n, locale)) !== null && _g !== void 0 ? _g : options.baseHref) !== null && _h !== void 0 ? _h : '/', options.ngswConfigPath);
                            }
                            catch (error) {
                                spinner.fail('Service worker generation failed.');
                                (0, error_1.assertIsError)(error);
                                return {
                                    webpackStats: webpackRawStats,
                                    output: { success: false, error: error.message },
                                };
                            }
                        }
                        spinner.succeed('Service worker generation complete.');
                    }
                }
                (0, stats_1.webpackStatsLogger)(context.logger, webpackStats, config, budgetFailures);
                return {
                    webpackStats: webpackRawStats,
                    output: { success: buildSuccess },
                };
            }
        }), (0, operators_1.map)(({ output: event, webpackStats }) => ({
            ...event,
            stats: (0, stats_1.generateBuildEventStats)(webpackStats, options),
            baseOutputPath,
            outputPath: baseOutputPath,
            outputPaths: (outputPaths && Array.from(outputPaths.values())) || [baseOutputPath],
            outputs: (outputPaths &&
                [...outputPaths.entries()].map(([locale, path]) => {
                    var _a;
                    return ({
                        locale,
                        path,
                        baseHref: (_a = getLocaleBaseHref(i18n, locale)) !== null && _a !== void 0 ? _a : options.baseHref,
                    });
                })) || {
                path: baseOutputPath,
                baseHref: options.baseHref,
            },
        })));
    }));
    function getLocaleBaseHref(i18n, locale) {
        var _a, _b;
        if (i18n.locales[locale] && ((_a = i18n.locales[locale]) === null || _a === void 0 ? void 0 : _a.baseHref) !== '') {
            return (0, utils_1.urlJoin)(options.baseHref || '', (_b = i18n.locales[locale].baseHref) !== null && _b !== void 0 ? _b : `/${locale}/`);
        }
        return undefined;
    }
}
exports.buildWebpackBrowser = buildWebpackBrowser;
function assertNever(input) {
    throw new Error(`Unexpected call to assertNever() with input: ${JSON.stringify(input, null /* replacer */, 4 /* tabSize */)}`);
}
function mapEmittedFilesToFileInfo(files = []) {
    const filteredFiles = [];
    for (const { file, name, extension, initial } of files) {
        if (name && initial) {
            filteredFiles.push({ file, extension, name });
        }
    }
    return filteredFiles;
}
exports.default = (0, architect_1.createBuilder)(buildWebpackBrowser);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9hbmd1bGFyX2RldmtpdC9idWlsZF9hbmd1bGFyL3NyYy9idWlsZGVycy9icm93c2VyL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUgseURBQXlGO0FBQ3pGLGlFQUFpRztBQUNqRyx1Q0FBeUI7QUFDekIsMkNBQTZCO0FBQzdCLCtCQUF3QztBQUN4Qyw4Q0FBMkQ7QUFHM0QsdUNBS3FCO0FBQ3JCLHFFQUl1QztBQUN2Qyw2Q0FBMkM7QUFDM0MseURBQXFEO0FBQ3JELDZDQUFrRDtBQUNsRCw2REFBbUU7QUFHbkUsc0ZBR3FEO0FBQ3JELGlFQUFvRTtBQUNwRSwyREFBNkQ7QUFDN0QsdUVBQXFFO0FBQ3JFLHlEQUErRDtBQUMvRCwrREFBeUU7QUFDekUsaURBQThDO0FBQzlDLGlEQUFxRTtBQUNyRSwrRUFJNEM7QUFDNUMsbURBQXlFO0FBQ3pFLG1FQUE2RTtBQUM3RSx5REFBd0U7QUFDeEUscURBUW1DO0FBMEJuQzs7O0dBR0c7QUFDVSxRQUFBLGFBQWEsR0FBRyxLQUFNLENBQUM7QUFFcEMsS0FBSyxVQUFVLFVBQVUsQ0FDdkIsT0FBNkIsRUFDN0IsT0FBdUIsRUFDdkIsNkJBQTJFO0lBTzNFLE1BQU0sa0JBQWtCLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQztJQUU5QyxvRUFBb0U7SUFDcEUsTUFBTSxlQUFlLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsQ0FBQztJQUU3RSxNQUFNLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxpQkFBaUIsRUFBRSxJQUFJLEVBQUUsR0FDcEQsTUFBTSxJQUFBLG9FQUEyQyxF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QUFFRCxTQUFTLFdBQVcsQ0FBQyxLQUFZO0lBQy9CLE1BQU0sSUFBSSxLQUFLLENBQ2IsZ0RBQWdELElBQUksQ0FBQyxTQUFTLENBQzVELEtBQUssRUFDTCxJQUFJLENBQUMsY0FBYyxFQUNuQixDQUFDLENBQUMsYUFBYSxDQUNoQixFQUFFLENBQ0osQ0FBQztBQUNKLENBQUM7QUFFRCxTQUFTLHlCQUF5QixDQUFDLFFBQXdCLEVBQUU7SUFDM0QsTUFBTSxhQUFhLEdBQWUsRUFBRSxDQUFDO0lBQ3JDLEtBQUssTUFBTSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxJQUFJLEtBQUssRUFBRTtRQUN0RCxJQUFJLElBQUksSUFBSSxPQUFPLEVBQUU7WUFDbkIsYUFBYSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztTQUMvQztLQUNGO0lBRUQsT0FBTyxhQUFhLENBQUM7QUFDdkIsQ0FBQztBQUVELGtCQUFlLElBQUEseUJBQWEsRUFBdUIsbUJBQW1CLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgeyBCdWlsZGVyQ29udGV4dCwgQnVpbGRlck91dHB1dCwgY3JlYXRlQnVpbGRlciB9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9hcmNoaXRlY3QnO1xuaW1wb3J0IHsgRW1pdHRlZEZpbGVzLCBXZWJwYWNrTG9nZ2luZ0NhbGxiYWNrLCBydW5XZWJwYWNrIH0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L2J1aWxkLXdlYnBhY2snO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IE9ic2VydmFibGUsIGZyb20gfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IGNvbmNhdE1hcCwgbWFwLCBzd2l0Y2hNYXAgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQgd2VicGFjaywgeyBTdGF0c0NvbXBpbGF0aW9uIH0gZnJvbSAnd2VicGFjayc7XG5pbXBvcnQgeyBFeGVjdXRpb25UcmFuc2Zvcm1lciB9IGZyb20gJy4uLy4uL3RyYW5zZm9ybXMnO1xuaW1wb3J0IHtcbiAgZGVsZXRlT3V0cHV0RGlyLFxuICBub3JtYWxpemVBc3NldFBhdHRlcm5zLFxuICBub3JtYWxpemVPcHRpbWl6YXRpb24sXG4gIHVybEpvaW4sXG59IGZyb20gJy4uLy4uL3V0aWxzJztcbmltcG9ydCB7XG4gIEJ1ZGdldENhbGN1bGF0b3JSZXN1bHQsXG4gIFRocmVzaG9sZFNldmVyaXR5LFxuICBjaGVja0J1ZGdldHMsXG59IGZyb20gJy4uLy4uL3V0aWxzL2J1bmRsZS1jYWxjdWxhdG9yJztcbmltcG9ydCB7IGNvbG9ycyB9IGZyb20gJy4uLy4uL3V0aWxzL2NvbG9yJztcbmltcG9ydCB7IGNvcHlBc3NldHMgfSBmcm9tICcuLi8uLi91dGlscy9jb3B5LWFzc2V0cyc7XG5pbXBvcnQgeyBhc3NlcnRJc0Vycm9yIH0gZnJvbSAnLi4vLi4vdXRpbHMvZXJyb3InO1xuaW1wb3J0IHsgaTE4bklubGluZUVtaXR0ZWRGaWxlcyB9IGZyb20gJy4uLy4uL3V0aWxzL2kxOG4taW5saW5pbmcnO1xuaW1wb3J0IHsgSTE4bk9wdGlvbnMgfSBmcm9tICcuLi8uLi91dGlscy9pMThuLW9wdGlvbnMnO1xuaW1wb3J0IHsgRmlsZUluZm8gfSBmcm9tICcuLi8uLi91dGlscy9pbmRleC1maWxlL2F1Z21lbnQtaW5kZXgtaHRtbCc7XG5pbXBvcnQge1xuICBJbmRleEh0bWxHZW5lcmF0b3IsXG4gIEluZGV4SHRtbFRyYW5zZm9ybSxcbn0gZnJvbSAnLi4vLi4vdXRpbHMvaW5kZXgtZmlsZS9pbmRleC1odG1sLWdlbmVyYXRvcic7XG5pbXBvcnQgeyBub3JtYWxpemVDYWNoZU9wdGlvbnMgfSBmcm9tICcuLi8uLi91dGlscy9ub3JtYWxpemUtY2FjaGUnO1xuaW1wb3J0IHsgZW5zdXJlT3V0cHV0UGF0aHMgfSBmcm9tICcuLi8uLi91dGlscy9vdXRwdXQtcGF0aHMnO1xuaW1wb3J0IHsgZ2VuZXJhdGVFbnRyeVBvaW50cyB9IGZyb20gJy4uLy4uL3V0aWxzL3BhY2thZ2UtY2h1bmstc29ydCc7XG5pbXBvcnQgeyBwdXJnZVN0YWxlQnVpbGRDYWNoZSB9IGZyb20gJy4uLy4uL3V0aWxzL3B1cmdlLWNhY2hlJztcbmltcG9ydCB7IGF1Z21lbnRBcHBXaXRoU2VydmljZVdvcmtlciB9IGZyb20gJy4uLy4uL3V0aWxzL3NlcnZpY2Utd29ya2VyJztcbmltcG9ydCB7IFNwaW5uZXIgfSBmcm9tICcuLi8uLi91dGlscy9zcGlubmVyJztcbmltcG9ydCB7IGFzc2VydENvbXBhdGlibGVBbmd1bGFyVmVyc2lvbiB9IGZyb20gJy4uLy4uL3V0aWxzL3ZlcnNpb24nO1xuaW1wb3J0IHtcbiAgZ2VuZXJhdGVJMThuQnJvd3NlcldlYnBhY2tDb25maWdGcm9tQ29udGV4dCxcbiAgZ2V0SW5kZXhJbnB1dEZpbGUsXG4gIGdldEluZGV4T3V0cHV0RmlsZSxcbn0gZnJvbSAnLi4vLi4vdXRpbHMvd2VicGFjay1icm93c2VyLWNvbmZpZyc7XG5pbXBvcnQgeyBnZXRDb21tb25Db25maWcsIGdldFN0eWxlc0NvbmZpZyB9IGZyb20gJy4uLy4uL3dlYnBhY2svY29uZmlncyc7XG5pbXBvcnQgeyBtYXJrQXN5bmNDaHVua3NOb25Jbml0aWFsIH0gZnJvbSAnLi4vLi4vd2VicGFjay91dGlscy9hc3luYy1jaHVua3MnO1xuaW1wb3J0IHsgbm9ybWFsaXplRXh0cmFFbnRyeVBvaW50cyB9IGZyb20gJy4uLy4uL3dlYnBhY2svdXRpbHMvaGVscGVycyc7XG5pbXBvcnQge1xuICBCdWlsZEV2ZW50U3RhdHMsXG4gIGdlbmVyYXRlQnVpbGRFdmVudFN0YXRzLFxuICBzdGF0c0Vycm9yc1RvU3RyaW5nLFxuICBzdGF0c0hhc0Vycm9ycyxcbiAgc3RhdHNIYXNXYXJuaW5ncyxcbiAgc3RhdHNXYXJuaW5nc1RvU3RyaW5nLFxuICB3ZWJwYWNrU3RhdHNMb2dnZXIsXG59IGZyb20gJy4uLy4uL3dlYnBhY2svdXRpbHMvc3RhdHMnO1xuaW1wb3J0IHsgU2NoZW1hIGFzIEJyb3dzZXJCdWlsZGVyU2NoZW1hIH0gZnJvbSAnLi9zY2hlbWEnO1xuXG4vKipcbiAqIEBleHBlcmltZW50YWwgRGlyZWN0IHVzYWdlIG9mIHRoaXMgdHlwZSBpcyBjb25zaWRlcmVkIGV4cGVyaW1lbnRhbC5cbiAqL1xuZXhwb3J0IHR5cGUgQnJvd3NlckJ1aWxkZXJPdXRwdXQgPSBCdWlsZGVyT3V0cHV0ICYge1xuICBzdGF0czogQnVpbGRFdmVudFN0YXRzO1xuXG4gIGJhc2VPdXRwdXRQYXRoOiBzdHJpbmc7XG4gIC8qKlxuICAgKiBAZGVwcmVjYXRlZCBpbiB2ZXJzaW9uIDE0LiBVc2UgJ291dHB1dHMnIGluc3RlYWQuXG4gICAqL1xuICBvdXRwdXRQYXRoczogc3RyaW5nW107XG4gIC8qKlxuICAgKiBAZGVwcmVjYXRlZCBpbiB2ZXJzaW9uIDkuIFVzZSAnb3V0cHV0cycgaW5zdGVhZC5cbiAgICovXG4gIG91dHB1dFBhdGg6IHN0cmluZztcblxuICBvdXRwdXRzOiB7XG4gICAgbG9jYWxlPzogc3RyaW5nO1xuICAgIHBhdGg6IHN0cmluZztcbiAgICBiYXNlSHJlZj86IHN0cmluZztcbiAgfVtdO1xufTtcblxuLyoqXG4gKiBNYXhpbXVtIHRpbWUgaW4gbWlsbGlzZWNvbmRzIGZvciBzaW5nbGUgYnVpbGQvcmVidWlsZFxuICogVGhpcyBhY2NvdW50cyBmb3IgQ0kgdmFyaWFiaWxpdHkuXG4gKi9cbmV4cG9ydCBjb25zdCBCVUlMRF9USU1FT1VUID0gMzBfMDAwO1xuXG5hc3luYyBmdW5jdGlvbiBpbml0aWFsaXplKFxuICBvcHRpb25zOiBCcm93c2VyQnVpbGRlclNjaGVtYSxcbiAgY29udGV4dDogQnVpbGRlckNvbnRleHQsXG4gIHdlYnBhY2tDb25maWd1cmF0aW9uVHJhbnNmb3JtPzogRXhlY3V0aW9uVHJhbnNmb3JtZXI8d2VicGFjay5Db25maWd1cmF0aW9uPixcbik6IFByb21pc2U8e1xuICBjb25maWc6IHdlYnBhY2suQ29uZmlndXJhdGlvbjtcbiAgcHJvamVjdFJvb3Q6IHN0cmluZztcbiAgcHJvamVjdFNvdXJjZVJvb3Q/OiBzdHJpbmc7XG4gIGkxOG46IEkxOG5PcHRpb25zO1xufT4ge1xuICBjb25zdCBvcmlnaW5hbE91dHB1dFBhdGggPSBvcHRpb25zLm91dHB1dFBhdGg7XG5cbiAgLy8gQXNzZXRzIGFyZSBwcm9jZXNzZWQgZGlyZWN0bHkgYnkgdGhlIGJ1aWxkZXIgZXhjZXB0IHdoZW4gd2F0Y2hpbmdcbiAgY29uc3QgYWRqdXN0ZWRPcHRpb25zID0gb3B0aW9ucy53YXRjaCA/IG9wdGlvbnMgOiB7IC4uLm9wdGlvbnMsIGFzc2V0czogW10gfTtcblxuICBjb25zdCB7IGNvbmZpZywgcHJvamVjdFJvb3QsIHByb2plY3RTb3VyY2VSb290LCBpMThuIH0gPVxuICAgIGF3YWl0IGdlbmVyYXRlSTE4bkJyb3dzZXJXZWJwYWNrQ29uZmlnRnJvbUNvbnRleHQoYWRqdXN0ZWRPcHRpb25zLCBjb250ZXh0LCAod2NvKSA9PiBbXG4gICAgICBnZXRDb21tb25Db25maWcod2NvKSxcbiAgICAgIGdldFN0eWxlc0NvbmZpZyh3Y28pLFxuICAgIF0pO1xuXG4gIGxldCB0cmFuc2Zvcm1lZENvbmZpZztcbiAgaWYgKHdlYnBhY2tDb25maWd1cmF0aW9uVHJhbnNmb3JtKSB7XG4gICAgdHJhbnNmb3JtZWRDb25maWcgPSBhd2FpdCB3ZWJwYWNrQ29uZmlndXJhdGlvblRyYW5zZm9ybShjb25maWcpO1xuICB9XG5cbiAgaWYgKG9wdGlvbnMuZGVsZXRlT3V0cHV0UGF0aCkge1xuICAgIGRlbGV0ZU91dHB1dERpcihjb250ZXh0LndvcmtzcGFjZVJvb3QsIG9yaWdpbmFsT3V0cHV0UGF0aCk7XG4gIH1cblxuICByZXR1cm4geyBjb25maWc6IHRyYW5zZm9ybWVkQ29uZmlnIHx8IGNvbmZpZywgcHJvamVjdFJvb3QsIHByb2plY3RTb3VyY2VSb290LCBpMThuIH07XG59XG5cbi8qKlxuICogQGV4cGVyaW1lbnRhbCBEaXJlY3QgdXNhZ2Ugb2YgdGhpcyBmdW5jdGlvbiBpcyBjb25zaWRlcmVkIGV4cGVyaW1lbnRhbC5cbiAqL1xuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG1heC1saW5lcy1wZXItZnVuY3Rpb25cbmV4cG9ydCBmdW5jdGlvbiBidWlsZFdlYnBhY2tCcm93c2VyKFxuICBvcHRpb25zOiBCcm93c2VyQnVpbGRlclNjaGVtYSxcbiAgY29udGV4dDogQnVpbGRlckNvbnRleHQsXG4gIHRyYW5zZm9ybXM6IHtcbiAgICB3ZWJwYWNrQ29uZmlndXJhdGlvbj86IEV4ZWN1dGlvblRyYW5zZm9ybWVyPHdlYnBhY2suQ29uZmlndXJhdGlvbj47XG4gICAgbG9nZ2luZz86IFdlYnBhY2tMb2dnaW5nQ2FsbGJhY2s7XG4gICAgaW5kZXhIdG1sPzogSW5kZXhIdG1sVHJhbnNmb3JtO1xuICB9ID0ge30sXG4pOiBPYnNlcnZhYmxlPEJyb3dzZXJCdWlsZGVyT3V0cHV0PiB7XG4gIGNvbnN0IHByb2plY3ROYW1lID0gY29udGV4dC50YXJnZXQ/LnByb2plY3Q7XG4gIGlmICghcHJvamVjdE5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSBidWlsZGVyIHJlcXVpcmVzIGEgdGFyZ2V0LicpO1xuICB9XG5cbiAgY29uc3QgYmFzZU91dHB1dFBhdGggPSBwYXRoLnJlc29sdmUoY29udGV4dC53b3Jrc3BhY2VSb290LCBvcHRpb25zLm91dHB1dFBhdGgpO1xuICBsZXQgb3V0cHV0UGF0aHM6IHVuZGVmaW5lZCB8IE1hcDxzdHJpbmcsIHN0cmluZz47XG5cbiAgLy8gQ2hlY2sgQW5ndWxhciB2ZXJzaW9uLlxuICBhc3NlcnRDb21wYXRpYmxlQW5ndWxhclZlcnNpb24oY29udGV4dC53b3Jrc3BhY2VSb290KTtcblxuICByZXR1cm4gZnJvbShjb250ZXh0LmdldFByb2plY3RNZXRhZGF0YShwcm9qZWN0TmFtZSkpLnBpcGUoXG4gICAgc3dpdGNoTWFwKGFzeW5jIChwcm9qZWN0TWV0YWRhdGEpID0+IHtcbiAgICAgIC8vIFB1cmdlIG9sZCBidWlsZCBkaXNrIGNhY2hlLlxuICAgICAgYXdhaXQgcHVyZ2VTdGFsZUJ1aWxkQ2FjaGUoY29udGV4dCk7XG5cbiAgICAgIC8vIEluaXRpYWxpemUgYnVpbGRlclxuICAgICAgY29uc3QgaW5pdGlhbGl6YXRpb24gPSBhd2FpdCBpbml0aWFsaXplKG9wdGlvbnMsIGNvbnRleHQsIHRyYW5zZm9ybXMud2VicGFja0NvbmZpZ3VyYXRpb24pO1xuXG4gICAgICAvLyBBZGQgaW5kZXggZmlsZSB0byB3YXRjaGVkIGZpbGVzLlxuICAgICAgaWYgKG9wdGlvbnMud2F0Y2gpIHtcbiAgICAgICAgY29uc3QgaW5kZXhJbnB1dEZpbGUgPSBwYXRoLmpvaW4oY29udGV4dC53b3Jrc3BhY2VSb290LCBnZXRJbmRleElucHV0RmlsZShvcHRpb25zLmluZGV4KSk7XG4gICAgICAgIGluaXRpYWxpemF0aW9uLmNvbmZpZy5wbHVnaW5zID8/PSBbXTtcbiAgICAgICAgaW5pdGlhbGl6YXRpb24uY29uZmlnLnBsdWdpbnMucHVzaCh7XG4gICAgICAgICAgYXBwbHk6IChjb21waWxlcjogd2VicGFjay5Db21waWxlcikgPT4ge1xuICAgICAgICAgICAgY29tcGlsZXIuaG9va3MudGhpc0NvbXBpbGF0aW9uLnRhcCgnYnVpbGQtYW5ndWxhcicsIChjb21waWxhdGlvbikgPT4ge1xuICAgICAgICAgICAgICBjb21waWxhdGlvbi5maWxlRGVwZW5kZW5jaWVzLmFkZChpbmRleElucHV0RmlsZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4uaW5pdGlhbGl6YXRpb24sXG4gICAgICAgIGNhY2hlT3B0aW9uczogbm9ybWFsaXplQ2FjaGVPcHRpb25zKHByb2plY3RNZXRhZGF0YSwgY29udGV4dC53b3Jrc3BhY2VSb290KSxcbiAgICAgIH07XG4gICAgfSksXG4gICAgc3dpdGNoTWFwKFxuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG1heC1saW5lcy1wZXItZnVuY3Rpb25cbiAgICAgICh7IGNvbmZpZywgcHJvamVjdFJvb3QsIHByb2plY3RTb3VyY2VSb290LCBpMThuLCBjYWNoZU9wdGlvbnMgfSkgPT4ge1xuICAgICAgICBjb25zdCBub3JtYWxpemVkT3B0aW1pemF0aW9uID0gbm9ybWFsaXplT3B0aW1pemF0aW9uKG9wdGlvbnMub3B0aW1pemF0aW9uKTtcblxuICAgICAgICByZXR1cm4gcnVuV2VicGFjayhjb25maWcsIGNvbnRleHQsIHtcbiAgICAgICAgICB3ZWJwYWNrRmFjdG9yeTogcmVxdWlyZSgnd2VicGFjaycpIGFzIHR5cGVvZiB3ZWJwYWNrLFxuICAgICAgICAgIGxvZ2dpbmc6XG4gICAgICAgICAgICB0cmFuc2Zvcm1zLmxvZ2dpbmcgfHxcbiAgICAgICAgICAgICgoc3RhdHMsIGNvbmZpZykgPT4ge1xuICAgICAgICAgICAgICBpZiAob3B0aW9ucy52ZXJib3NlKSB7XG4gICAgICAgICAgICAgICAgY29udGV4dC5sb2dnZXIuaW5mbyhzdGF0cy50b1N0cmluZyhjb25maWcuc3RhdHMpKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSksXG4gICAgICAgIH0pLnBpcGUoXG4gICAgICAgICAgY29uY2F0TWFwKFxuICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG1heC1saW5lcy1wZXItZnVuY3Rpb25cbiAgICAgICAgICAgIGFzeW5jIChcbiAgICAgICAgICAgICAgYnVpbGRFdmVudCxcbiAgICAgICAgICAgICk6IFByb21pc2U8eyBvdXRwdXQ6IEJ1aWxkZXJPdXRwdXQ7IHdlYnBhY2tTdGF0czogU3RhdHNDb21waWxhdGlvbiB9PiA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IHNwaW5uZXIgPSBuZXcgU3Bpbm5lcigpO1xuICAgICAgICAgICAgICBzcGlubmVyLmVuYWJsZWQgPSBvcHRpb25zLnByb2dyZXNzICE9PSBmYWxzZTtcblxuICAgICAgICAgICAgICBjb25zdCB7IHN1Y2Nlc3MsIGVtaXR0ZWRGaWxlcyA9IFtdLCBvdXRwdXRQYXRoOiB3ZWJwYWNrT3V0cHV0UGF0aCB9ID0gYnVpbGRFdmVudDtcbiAgICAgICAgICAgICAgY29uc3Qgd2VicGFja1Jhd1N0YXRzID0gYnVpbGRFdmVudC53ZWJwYWNrU3RhdHM7XG4gICAgICAgICAgICAgIGlmICghd2VicGFja1Jhd1N0YXRzKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdXZWJwYWNrIHN0YXRzIGJ1aWxkIHJlc3VsdCBpcyByZXF1aXJlZC4nKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIC8vIEZpeCBpbmNvcnJlY3RseSBzZXQgYGluaXRpYWxgIHZhbHVlIG9uIGNodW5rcy5cbiAgICAgICAgICAgICAgY29uc3QgZXh0cmFFbnRyeVBvaW50cyA9IFtcbiAgICAgICAgICAgICAgICAuLi5ub3JtYWxpemVFeHRyYUVudHJ5UG9pbnRzKG9wdGlvbnMuc3R5bGVzIHx8IFtdLCAnc3R5bGVzJyksXG4gICAgICAgICAgICAgICAgLi4ubm9ybWFsaXplRXh0cmFFbnRyeVBvaW50cyhvcHRpb25zLnNjcmlwdHMgfHwgW10sICdzY3JpcHRzJyksXG4gICAgICAgICAgICAgIF07XG5cbiAgICAgICAgICAgICAgY29uc3Qgd2VicGFja1N0YXRzID0ge1xuICAgICAgICAgICAgICAgIC4uLndlYnBhY2tSYXdTdGF0cyxcbiAgICAgICAgICAgICAgICBjaHVua3M6IG1hcmtBc3luY0NodW5rc05vbkluaXRpYWwod2VicGFja1Jhd1N0YXRzLCBleHRyYUVudHJ5UG9pbnRzKSxcbiAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICBpZiAoIXN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAvLyBJZiB1c2luZyBidW5kbGUgZG93bmxldmVsaW5nIHRoZW4gdGhlcmUgaXMgb25seSBvbmUgYnVpbGRcbiAgICAgICAgICAgICAgICAvLyBJZiBpdCBmYWlscyBzaG93IGFueSBkaWFnbm9zdGljIG1lc3NhZ2VzIGFuZCBiYWlsXG4gICAgICAgICAgICAgICAgaWYgKHN0YXRzSGFzV2FybmluZ3Mod2VicGFja1N0YXRzKSkge1xuICAgICAgICAgICAgICAgICAgY29udGV4dC5sb2dnZXIud2FybihzdGF0c1dhcm5pbmdzVG9TdHJpbmcod2VicGFja1N0YXRzLCB7IGNvbG9yczogdHJ1ZSB9KSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChzdGF0c0hhc0Vycm9ycyh3ZWJwYWNrU3RhdHMpKSB7XG4gICAgICAgICAgICAgICAgICBjb250ZXh0LmxvZ2dlci5lcnJvcihzdGF0c0Vycm9yc1RvU3RyaW5nKHdlYnBhY2tTdGF0cywgeyBjb2xvcnM6IHRydWUgfSkpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICB3ZWJwYWNrU3RhdHM6IHdlYnBhY2tSYXdTdGF0cyxcbiAgICAgICAgICAgICAgICAgIG91dHB1dDogeyBzdWNjZXNzOiBmYWxzZSB9LFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgb3V0cHV0UGF0aHMgPSBlbnN1cmVPdXRwdXRQYXRocyhiYXNlT3V0cHV0UGF0aCwgaTE4bik7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBzY3JpcHRzRW50cnlQb2ludE5hbWUgPSBub3JtYWxpemVFeHRyYUVudHJ5UG9pbnRzKFxuICAgICAgICAgICAgICAgICAgb3B0aW9ucy5zY3JpcHRzIHx8IFtdLFxuICAgICAgICAgICAgICAgICAgJ3NjcmlwdHMnLFxuICAgICAgICAgICAgICAgICkubWFwKCh4KSA9PiB4LmJ1bmRsZU5hbWUpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGkxOG4uc2hvdWxkSW5saW5lKSB7XG4gICAgICAgICAgICAgICAgICBjb25zdCBzdWNjZXNzID0gYXdhaXQgaTE4bklubGluZUVtaXR0ZWRGaWxlcyhcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dCxcbiAgICAgICAgICAgICAgICAgICAgZW1pdHRlZEZpbGVzLFxuICAgICAgICAgICAgICAgICAgICBpMThuLFxuICAgICAgICAgICAgICAgICAgICBiYXNlT3V0cHV0UGF0aCxcbiAgICAgICAgICAgICAgICAgICAgQXJyYXkuZnJvbShvdXRwdXRQYXRocy52YWx1ZXMoKSksXG4gICAgICAgICAgICAgICAgICAgIHNjcmlwdHNFbnRyeVBvaW50TmFtZSxcbiAgICAgICAgICAgICAgICAgICAgd2VicGFja091dHB1dFBhdGgsXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMuaTE4bk1pc3NpbmdUcmFuc2xhdGlvbixcbiAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICBpZiAoIXN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICB3ZWJwYWNrU3RhdHM6IHdlYnBhY2tSYXdTdGF0cyxcbiAgICAgICAgICAgICAgICAgICAgICBvdXRwdXQ6IHsgc3VjY2VzczogZmFsc2UgfSxcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBDaGVjayBmb3IgYnVkZ2V0IGVycm9ycyBhbmQgZGlzcGxheSB0aGVtIHRvIHRoZSB1c2VyLlxuICAgICAgICAgICAgICAgIGNvbnN0IGJ1ZGdldHMgPSBvcHRpb25zLmJ1ZGdldHM7XG4gICAgICAgICAgICAgICAgbGV0IGJ1ZGdldEZhaWx1cmVzOiBCdWRnZXRDYWxjdWxhdG9yUmVzdWx0W10gfCB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgaWYgKGJ1ZGdldHM/Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgYnVkZ2V0RmFpbHVyZXMgPSBbLi4uY2hlY2tCdWRnZXRzKGJ1ZGdldHMsIHdlYnBhY2tTdGF0cyldO1xuICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCB7IHNldmVyaXR5LCBtZXNzYWdlIH0gb2YgYnVkZ2V0RmFpbHVyZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChzZXZlcml0eSkge1xuICAgICAgICAgICAgICAgICAgICAgIGNhc2UgVGhyZXNob2xkU2V2ZXJpdHkuV2FybmluZzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHdlYnBhY2tTdGF0cy53YXJuaW5ncz8ucHVzaCh7IG1lc3NhZ2UgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICBjYXNlIFRocmVzaG9sZFNldmVyaXR5LkVycm9yOlxuICAgICAgICAgICAgICAgICAgICAgICAgd2VicGFja1N0YXRzLmVycm9ycz8ucHVzaCh7IG1lc3NhZ2UgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXJ0TmV2ZXIoc2V2ZXJpdHkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29uc3QgYnVpbGRTdWNjZXNzID0gc3VjY2VzcyAmJiAhc3RhdHNIYXNFcnJvcnMod2VicGFja1N0YXRzKTtcbiAgICAgICAgICAgICAgICBpZiAoYnVpbGRTdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAvLyBDb3B5IGFzc2V0c1xuICAgICAgICAgICAgICAgICAgaWYgKCFvcHRpb25zLndhdGNoICYmIG9wdGlvbnMuYXNzZXRzPy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgc3Bpbm5lci5zdGFydCgnQ29weWluZyBhc3NldHMuLi4nKTtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBjb3B5QXNzZXRzKFxuICAgICAgICAgICAgICAgICAgICAgICAgbm9ybWFsaXplQXNzZXRQYXR0ZXJucyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5hc3NldHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQud29ya3NwYWNlUm9vdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdFJvb3QsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3RTb3VyY2VSb290LFxuICAgICAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIEFycmF5LmZyb20ob3V0cHV0UGF0aHMudmFsdWVzKCkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dC53b3Jrc3BhY2VSb290LFxuICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgc3Bpbm5lci5zdWNjZWVkKCdDb3B5aW5nIGFzc2V0cyBjb21wbGV0ZS4nKTtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgc3Bpbm5lci5mYWlsKGNvbG9ycy5yZWRCcmlnaHQoJ0NvcHlpbmcgb2YgYXNzZXRzIGZhaWxlZC4nKSk7XG4gICAgICAgICAgICAgICAgICAgICAgYXNzZXJ0SXNFcnJvcihlcnIpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6ICdVbmFibGUgdG8gY29weSBhc3NldHM6ICcgKyBlcnIubWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB3ZWJwYWNrU3RhdHM6IHdlYnBhY2tSYXdTdGF0cyxcbiAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLmluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgIHNwaW5uZXIuc3RhcnQoJ0dlbmVyYXRpbmcgaW5kZXggaHRtbC4uLicpO1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVudHJ5cG9pbnRzID0gZ2VuZXJhdGVFbnRyeVBvaW50cyh7XG4gICAgICAgICAgICAgICAgICAgICAgc2NyaXB0czogb3B0aW9ucy5zY3JpcHRzID8/IFtdLFxuICAgICAgICAgICAgICAgICAgICAgIHN0eWxlczogb3B0aW9ucy5zdHlsZXMgPz8gW10sXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGluZGV4SHRtbEdlbmVyYXRvciA9IG5ldyBJbmRleEh0bWxHZW5lcmF0b3Ioe1xuICAgICAgICAgICAgICAgICAgICAgIGNhY2hlOiBjYWNoZU9wdGlvbnMsXG4gICAgICAgICAgICAgICAgICAgICAgaW5kZXhQYXRoOiBwYXRoLmpvaW4oY29udGV4dC53b3Jrc3BhY2VSb290LCBnZXRJbmRleElucHV0RmlsZShvcHRpb25zLmluZGV4KSksXG4gICAgICAgICAgICAgICAgICAgICAgZW50cnlwb2ludHMsXG4gICAgICAgICAgICAgICAgICAgICAgZGVwbG95VXJsOiBvcHRpb25zLmRlcGxveVVybCxcbiAgICAgICAgICAgICAgICAgICAgICBzcmk6IG9wdGlvbnMuc3VicmVzb3VyY2VJbnRlZ3JpdHksXG4gICAgICAgICAgICAgICAgICAgICAgb3B0aW1pemF0aW9uOiBub3JtYWxpemVkT3B0aW1pemF0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgIGNyb3NzT3JpZ2luOiBvcHRpb25zLmNyb3NzT3JpZ2luLFxuICAgICAgICAgICAgICAgICAgICAgIHBvc3RUcmFuc2Zvcm06IHRyYW5zZm9ybXMuaW5kZXhIdG1sLFxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICBsZXQgaGFzRXJyb3JzID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgW2xvY2FsZSwgb3V0cHV0UGF0aF0gb2Ygb3V0cHV0UGF0aHMuZW50cmllcygpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHsgY29udGVudCwgd2FybmluZ3MsIGVycm9ycyB9ID0gYXdhaXQgaW5kZXhIdG1sR2VuZXJhdG9yLnByb2Nlc3Moe1xuICAgICAgICAgICAgICAgICAgICAgICAgICBiYXNlSHJlZjogZ2V0TG9jYWxlQmFzZUhyZWYoaTE4biwgbG9jYWxlKSA/PyBvcHRpb25zLmJhc2VIcmVmLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpMThuTG9jYWxlIGlzIHVzZWQgd2hlbiBJdnkgaXMgZGlzYWJsZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbGFuZzogbG9jYWxlIHx8IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0UGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZXM6IG1hcEVtaXR0ZWRGaWxlc1RvRmlsZUluZm8oZW1pdHRlZEZpbGVzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAod2FybmluZ3MubGVuZ3RoIHx8IGVycm9ycy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgc3Bpbm5lci5zdG9wKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHdhcm5pbmdzLmZvckVhY2goKG0pID0+IGNvbnRleHQubG9nZ2VyLndhcm4obSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcnMuZm9yRWFjaCgobSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQubG9nZ2VyLmVycm9yKG0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhc0Vycm9ycyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICBzcGlubmVyLnN0YXJ0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGluZGV4T3V0cHV0ID0gcGF0aC5qb2luKFxuICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXRQYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBnZXRJbmRleE91dHB1dEZpbGUob3B0aW9ucy5pbmRleCksXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgZnMucHJvbWlzZXMubWtkaXIocGF0aC5kaXJuYW1lKGluZGV4T3V0cHV0KSwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBmcy5wcm9taXNlcy53cml0ZUZpbGUoaW5kZXhPdXRwdXQsIGNvbnRlbnQpO1xuICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzcGlubmVyLmZhaWwoJ0luZGV4IGh0bWwgZ2VuZXJhdGlvbiBmYWlsZWQuJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBhc3NlcnRJc0Vycm9yKGVycm9yKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgd2VicGFja1N0YXRzOiB3ZWJwYWNrUmF3U3RhdHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dDogeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGhhc0Vycm9ycykge1xuICAgICAgICAgICAgICAgICAgICAgIHNwaW5uZXIuZmFpbCgnSW5kZXggaHRtbCBnZW5lcmF0aW9uIGZhaWxlZC4nKTtcblxuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3ZWJwYWNrU3RhdHM6IHdlYnBhY2tSYXdTdGF0cyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dDogeyBzdWNjZXNzOiBmYWxzZSB9LFxuICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgc3Bpbm5lci5zdWNjZWVkKCdJbmRleCBodG1sIGdlbmVyYXRpb24gY29tcGxldGUuJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuc2VydmljZVdvcmtlcikge1xuICAgICAgICAgICAgICAgICAgICBzcGlubmVyLnN0YXJ0KCdHZW5lcmF0aW5nIHNlcnZpY2Ugd29ya2VyLi4uJyk7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgW2xvY2FsZSwgb3V0cHV0UGF0aF0gb2Ygb3V0cHV0UGF0aHMuZW50cmllcygpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IGF1Z21lbnRBcHBXaXRoU2VydmljZVdvcmtlcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdFJvb3QsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQud29ya3NwYWNlUm9vdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0UGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZ2V0TG9jYWxlQmFzZUhyZWYoaTE4biwgbG9jYWxlKSA/PyBvcHRpb25zLmJhc2VIcmVmID8/ICcvJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5uZ3N3Q29uZmlnUGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNwaW5uZXIuZmFpbCgnU2VydmljZSB3b3JrZXIgZ2VuZXJhdGlvbiBmYWlsZWQuJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBhc3NlcnRJc0Vycm9yKGVycm9yKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgd2VicGFja1N0YXRzOiB3ZWJwYWNrUmF3U3RhdHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dDogeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgc3Bpbm5lci5zdWNjZWVkKCdTZXJ2aWNlIHdvcmtlciBnZW5lcmF0aW9uIGNvbXBsZXRlLicpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHdlYnBhY2tTdGF0c0xvZ2dlcihjb250ZXh0LmxvZ2dlciwgd2VicGFja1N0YXRzLCBjb25maWcsIGJ1ZGdldEZhaWx1cmVzKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICB3ZWJwYWNrU3RhdHM6IHdlYnBhY2tSYXdTdGF0cyxcbiAgICAgICAgICAgICAgICAgIG91dHB1dDogeyBzdWNjZXNzOiBidWlsZFN1Y2Nlc3MgfSxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICksXG4gICAgICAgICAgbWFwKFxuICAgICAgICAgICAgKHsgb3V0cHV0OiBldmVudCwgd2VicGFja1N0YXRzIH0pID0+XG4gICAgICAgICAgICAgICh7XG4gICAgICAgICAgICAgICAgLi4uZXZlbnQsXG4gICAgICAgICAgICAgICAgc3RhdHM6IGdlbmVyYXRlQnVpbGRFdmVudFN0YXRzKHdlYnBhY2tTdGF0cywgb3B0aW9ucyksXG4gICAgICAgICAgICAgICAgYmFzZU91dHB1dFBhdGgsXG4gICAgICAgICAgICAgICAgb3V0cHV0UGF0aDogYmFzZU91dHB1dFBhdGgsXG4gICAgICAgICAgICAgICAgb3V0cHV0UGF0aHM6IChvdXRwdXRQYXRocyAmJiBBcnJheS5mcm9tKG91dHB1dFBhdGhzLnZhbHVlcygpKSkgfHwgW2Jhc2VPdXRwdXRQYXRoXSxcbiAgICAgICAgICAgICAgICBvdXRwdXRzOiAob3V0cHV0UGF0aHMgJiZcbiAgICAgICAgICAgICAgICAgIFsuLi5vdXRwdXRQYXRocy5lbnRyaWVzKCldLm1hcCgoW2xvY2FsZSwgcGF0aF0pID0+ICh7XG4gICAgICAgICAgICAgICAgICAgIGxvY2FsZSxcbiAgICAgICAgICAgICAgICAgICAgcGF0aCxcbiAgICAgICAgICAgICAgICAgICAgYmFzZUhyZWY6IGdldExvY2FsZUJhc2VIcmVmKGkxOG4sIGxvY2FsZSkgPz8gb3B0aW9ucy5iYXNlSHJlZixcbiAgICAgICAgICAgICAgICAgIH0pKSkgfHwge1xuICAgICAgICAgICAgICAgICAgcGF0aDogYmFzZU91dHB1dFBhdGgsXG4gICAgICAgICAgICAgICAgICBiYXNlSHJlZjogb3B0aW9ucy5iYXNlSHJlZixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB9IGFzIEJyb3dzZXJCdWlsZGVyT3V0cHV0KSxcbiAgICAgICAgICApLFxuICAgICAgICApO1xuICAgICAgfSxcbiAgICApLFxuICApO1xuXG4gIGZ1bmN0aW9uIGdldExvY2FsZUJhc2VIcmVmKGkxOG46IEkxOG5PcHRpb25zLCBsb2NhbGU6IHN0cmluZyk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gICAgaWYgKGkxOG4ubG9jYWxlc1tsb2NhbGVdICYmIGkxOG4ubG9jYWxlc1tsb2NhbGVdPy5iYXNlSHJlZiAhPT0gJycpIHtcbiAgICAgIHJldHVybiB1cmxKb2luKG9wdGlvbnMuYmFzZUhyZWYgfHwgJycsIGkxOG4ubG9jYWxlc1tsb2NhbGVdLmJhc2VIcmVmID8/IGAvJHtsb2NhbGV9L2ApO1xuICAgIH1cblxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbn1cblxuZnVuY3Rpb24gYXNzZXJ0TmV2ZXIoaW5wdXQ6IG5ldmVyKTogbmV2ZXIge1xuICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgYFVuZXhwZWN0ZWQgY2FsbCB0byBhc3NlcnROZXZlcigpIHdpdGggaW5wdXQ6ICR7SlNPTi5zdHJpbmdpZnkoXG4gICAgICBpbnB1dCxcbiAgICAgIG51bGwgLyogcmVwbGFjZXIgKi8sXG4gICAgICA0IC8qIHRhYlNpemUgKi8sXG4gICAgKX1gLFxuICApO1xufVxuXG5mdW5jdGlvbiBtYXBFbWl0dGVkRmlsZXNUb0ZpbGVJbmZvKGZpbGVzOiBFbWl0dGVkRmlsZXNbXSA9IFtdKTogRmlsZUluZm9bXSB7XG4gIGNvbnN0IGZpbHRlcmVkRmlsZXM6IEZpbGVJbmZvW10gPSBbXTtcbiAgZm9yIChjb25zdCB7IGZpbGUsIG5hbWUsIGV4dGVuc2lvbiwgaW5pdGlhbCB9IG9mIGZpbGVzKSB7XG4gICAgaWYgKG5hbWUgJiYgaW5pdGlhbCkge1xuICAgICAgZmlsdGVyZWRGaWxlcy5wdXNoKHsgZmlsZSwgZXh0ZW5zaW9uLCBuYW1lIH0pO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmaWx0ZXJlZEZpbGVzO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjcmVhdGVCdWlsZGVyPEJyb3dzZXJCdWlsZGVyU2NoZW1hPihidWlsZFdlYnBhY2tCcm93c2VyKTtcbiJdfQ==