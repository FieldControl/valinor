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
exports.execute = void 0;
const architect_1 = require("@angular-devkit/architect");
const build_webpack_1 = require("@angular-devkit/build-webpack");
const path = __importStar(require("path"));
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const utils_1 = require("../../utils");
const color_1 = require("../../utils/color");
const copy_assets_1 = require("../../utils/copy-assets");
const error_1 = require("../../utils/error");
const i18n_inlining_1 = require("../../utils/i18n-inlining");
const output_paths_1 = require("../../utils/output-paths");
const purge_cache_1 = require("../../utils/purge-cache");
const spinner_1 = require("../../utils/spinner");
const version_1 = require("../../utils/version");
const webpack_browser_config_1 = require("../../utils/webpack-browser-config");
const configs_1 = require("../../webpack/configs");
const helpers_1 = require("../../webpack/utils/helpers");
const stats_1 = require("../../webpack/utils/stats");
/**
 * @experimental Direct usage of this function is considered experimental.
 */
function execute(options, context, transforms = {}) {
    const root = context.workspaceRoot;
    // Check Angular version.
    (0, version_1.assertCompatibleAngularVersion)(root);
    const baseOutputPath = path.resolve(root, options.outputPath);
    let outputPaths;
    return (0, rxjs_1.from)(initialize(options, context, transforms.webpackConfiguration)).pipe((0, operators_1.concatMap)(({ config, i18n, projectRoot, projectSourceRoot }) => {
        return (0, build_webpack_1.runWebpack)(config, context, {
            webpackFactory: require('webpack'),
            logging: (stats, config) => {
                if (options.verbose) {
                    context.logger.info(stats.toString(config.stats));
                }
            },
        }).pipe((0, operators_1.concatMap)(async (output) => {
            var _a;
            const { emittedFiles = [], outputPath, webpackStats, success } = output;
            if (!webpackStats) {
                throw new Error('Webpack stats build result is required.');
            }
            if (!success) {
                if ((0, stats_1.statsHasWarnings)(webpackStats)) {
                    context.logger.warn((0, stats_1.statsWarningsToString)(webpackStats, { colors: true }));
                }
                if ((0, stats_1.statsHasErrors)(webpackStats)) {
                    context.logger.error((0, stats_1.statsErrorsToString)(webpackStats, { colors: true }));
                }
                return output;
            }
            const spinner = new spinner_1.Spinner();
            spinner.enabled = options.progress !== false;
            outputPaths = (0, output_paths_1.ensureOutputPaths)(baseOutputPath, i18n);
            // Copy assets
            if (!options.watch && ((_a = options.assets) === null || _a === void 0 ? void 0 : _a.length)) {
                spinner.start('Copying assets...');
                try {
                    await (0, copy_assets_1.copyAssets)((0, utils_1.normalizeAssetPatterns)(options.assets, context.workspaceRoot, projectRoot, projectSourceRoot), Array.from(outputPaths.values()), context.workspaceRoot);
                    spinner.succeed('Copying assets complete.');
                }
                catch (err) {
                    spinner.fail(color_1.colors.redBright('Copying of assets failed.'));
                    (0, error_1.assertIsError)(err);
                    return {
                        ...output,
                        success: false,
                        error: 'Unable to copy assets: ' + err.message,
                    };
                }
            }
            if (i18n.shouldInline) {
                const success = await (0, i18n_inlining_1.i18nInlineEmittedFiles)(context, emittedFiles, i18n, baseOutputPath, Array.from(outputPaths.values()), [], outputPath, options.i18nMissingTranslation);
                if (!success) {
                    return {
                        ...output,
                        success: false,
                    };
                }
            }
            (0, stats_1.webpackStatsLogger)(context.logger, webpackStats, config);
            return output;
        }));
    }), (0, operators_1.concatMap)(async (output) => {
        if (!output.success) {
            return output;
        }
        return {
            ...output,
            baseOutputPath,
            outputPath: baseOutputPath,
            outputPaths: outputPaths || [baseOutputPath],
            outputs: (outputPaths &&
                [...outputPaths.entries()].map(([locale, path]) => ({
                    locale,
                    path,
                }))) || {
                path: baseOutputPath,
            },
        };
    }));
}
exports.execute = execute;
exports.default = (0, architect_1.createBuilder)(execute);
async function initialize(options, context, webpackConfigurationTransform) {
    var _a;
    // Purge old build disk cache.
    await (0, purge_cache_1.purgeStaleBuildCache)(context);
    const browserslist = (await Promise.resolve().then(() => __importStar(require('browserslist')))).default;
    const originalOutputPath = options.outputPath;
    // Assets are processed directly by the builder except when watching
    const adjustedOptions = options.watch ? options : { ...options, assets: [] };
    const { config, projectRoot, projectSourceRoot, i18n } = await (0, webpack_browser_config_1.generateI18nBrowserWebpackConfigFromContext)({
        ...adjustedOptions,
        buildOptimizer: false,
        aot: true,
        platform: 'server',
    }, context, (wco) => {
        var _a;
        var _b;
        // We use the platform to determine the JavaScript syntax output.
        (_a = (_b = wco.buildOptions).supportedBrowsers) !== null && _a !== void 0 ? _a : (_b.supportedBrowsers = []);
        wco.buildOptions.supportedBrowsers.push(...browserslist('maintained node versions'));
        return [getPlatformServerExportsConfig(wco), (0, configs_1.getCommonConfig)(wco), (0, configs_1.getStylesConfig)(wco)];
    });
    if (options.deleteOutputPath) {
        (0, utils_1.deleteOutputDir)(context.workspaceRoot, originalOutputPath);
    }
    const transformedConfig = (_a = (await (webpackConfigurationTransform === null || webpackConfigurationTransform === void 0 ? void 0 : webpackConfigurationTransform(config)))) !== null && _a !== void 0 ? _a : config;
    return { config: transformedConfig, i18n, projectRoot, projectSourceRoot };
}
/**
 * Add `@angular/platform-server` exports.
 * This is needed so that DI tokens can be referenced and set at runtime outside of the bundle.
 */
function getPlatformServerExportsConfig(wco) {
    // Add `@angular/platform-server` exports.
    // This is needed so that DI tokens can be referenced and set at runtime outside of the bundle.
    // Only add `@angular/platform-server` exports when it is installed.
    // In some cases this builder is used when `@angular/platform-server` is not installed.
    // Example: when using `@nguniversal/common/clover` which does not need `@angular/platform-server`.
    return (0, helpers_1.isPlatformServerInstalled)(wco.root)
        ? {
            module: {
                rules: [
                    {
                        loader: require.resolve('./platform-server-exports-loader'),
                        include: [path.resolve(wco.root, wco.buildOptions.main)],
                    },
                ],
            },
        }
        : {};
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9hbmd1bGFyX2RldmtpdC9idWlsZF9hbmd1bGFyL3NyYy9idWlsZGVycy9zZXJ2ZXIvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFSCx5REFBeUY7QUFDekYsaUVBQTJEO0FBQzNELDJDQUE2QjtBQUM3QiwrQkFBd0M7QUFDeEMsOENBQTJDO0FBRzNDLHVDQUlxQjtBQUNyQiw2Q0FBMkM7QUFDM0MseURBQXFEO0FBQ3JELDZDQUFrRDtBQUNsRCw2REFBbUU7QUFFbkUsMkRBQTZEO0FBQzdELHlEQUErRDtBQUMvRCxpREFBOEM7QUFDOUMsaURBQXFFO0FBQ3JFLCtFQUc0QztBQUM1QyxtREFBeUU7QUFDekUseURBQXdFO0FBQ3hFLHFEQU1tQztBQXlCbkM7O0dBRUc7QUFDSCxTQUFnQixPQUFPLENBQ3JCLE9BQTZCLEVBQzdCLE9BQXVCLEVBQ3ZCLGFBRUksRUFBRTtJQUVOLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUM7SUFFbkMseUJBQXlCO0lBQ3pCLElBQUEsd0NBQThCLEVBQUMsSUFBSSxDQUFDLENBQUM7SUFFckMsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQzlELElBQUksV0FBNEMsQ0FBQztJQUVqRCxPQUFPLElBQUEsV0FBSSxFQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUM3RSxJQUFBLHFCQUFTLEVBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLGlCQUFpQixFQUFFLEVBQUUsRUFBRTtRQUM3RCxPQUFPLElB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RyxNQUFNLENBQUMsQ0FBQSxDQUFDLG1DQUFJLE1BQU0sQ0FBQztJQUVwRixPQUFPLEVBQUUsTUFBTSxFQUFFLGlCQUFpQixFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsaUJBQWlCLEVBQUUsQ0FBQztBQUM3RSxDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBUyw4QkFBOEIsQ0FBQyxHQUFnQztJQUN0RSwwQ0FBMEM7SUFDMUMsK0ZBQStGO0lBRS9GLG9FQUFvRTtJQUNwRSx1RkFBdUY7SUFDdkYsbUdBQW1HO0lBRW5HLE9BQU8sSUFBQSxtQ0FBeUIsRUFBQyxHQUFHLENBQUMsSUFBSSxDQUFDO1FBQ3hDLENBQUMsQ0FBQztZQUNFLE1BQU0sRUFBRTtnQkFDTixLQUFLLEVBQUU7b0JBQ0w7d0JBQ0UsTUFBTSxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsa0NBQWtDLENBQUM7d0JBQzNELE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUN6RDtpQkFDRjthQUNGO1NBQ0Y7UUFDSCxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQ1QsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgeyBCdWlsZGVyQ29udGV4dCwgQnVpbGRlck91dHB1dCwgY3JlYXRlQnVpbGRlciB9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9hcmNoaXRlY3QnO1xuaW1wb3J0IHsgcnVuV2VicGFjayB9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9idWlsZC13ZWJwYWNrJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBPYnNlcnZhYmxlLCBmcm9tIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBjb25jYXRNYXAgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQgd2VicGFjaywgeyBDb25maWd1cmF0aW9uIH0gZnJvbSAnd2VicGFjayc7XG5pbXBvcnQgeyBFeGVjdXRpb25UcmFuc2Zvcm1lciB9IGZyb20gJy4uLy4uL3RyYW5zZm9ybXMnO1xuaW1wb3J0IHtcbiAgTm9ybWFsaXplZEJyb3dzZXJCdWlsZGVyU2NoZW1hLFxuICBkZWxldGVPdXRwdXREaXIsXG4gIG5vcm1hbGl6ZUFzc2V0UGF0dGVybnMsXG59IGZyb20gJy4uLy4uL3V0aWxzJztcbmltcG9ydCB7IGNvbG9ycyB9IGZyb20gJy4uLy4uL3V0aWxzL2NvbG9yJztcbmltcG9ydCB7IGNvcHlBc3NldHMgfSBmcm9tICcuLi8uLi91dGlscy9jb3B5LWFzc2V0cyc7XG5pbXBvcnQgeyBhc3NlcnRJc0Vycm9yIH0gZnJvbSAnLi4vLi4vdXRpbHMvZXJyb3InO1xuaW1wb3J0IHsgaTE4bklubGluZUVtaXR0ZWRGaWxlcyB9IGZyb20gJy4uLy4uL3V0aWxzL2kxOG4taW5saW5pbmcnO1xuaW1wb3J0IHsgSTE4bk9wdGlvbnMgfSBmcm9tICcuLi8uLi91dGlscy9pMThuLW9wdGlvbnMnO1xuaW1wb3J0IHsgZW5zdXJlT3V0cHV0UGF0aHMgfSBmcm9tICcuLi8uLi91dGlscy9vdXRwdXQtcGF0aHMnO1xuaW1wb3J0IHsgcHVyZ2VTdGFsZUJ1aWxkQ2FjaGUgfSBmcm9tICcuLi8uLi91dGlscy9wdXJnZS1jYWNoZSc7XG5pbXBvcnQgeyBTcGlubmVyIH0gZnJvbSAnLi4vLi4vdXRpbHMvc3Bpbm5lcic7XG5pbXBvcnQgeyBhc3NlcnRDb21wYXRpYmxlQW5ndWxhclZlcnNpb24gfSBmcm9tICcuLi8uLi91dGlscy92ZXJzaW9uJztcbmltcG9ydCB7XG4gIEJyb3dzZXJXZWJwYWNrQ29uZmlnT3B0aW9ucyxcbiAgZ2VuZXJhdGVJMThuQnJvd3NlcldlYnBhY2tDb25maWdGcm9tQ29udGV4dCxcbn0gZnJvbSAnLi4vLi4vdXRpbHMvd2VicGFjay1icm93c2VyLWNvbmZpZyc7XG5pbXBvcnQgeyBnZXRDb21tb25Db25maWcsIGdldFN0eWxlc0NvbmZpZyB9IGZyb20gJy4uLy4uL3dlYnBhY2svY29uZmlncyc7XG5pbXBvcnQgeyBpc1BsYXRmb3JtU2VydmVySW5zdGFsbGVkIH0gZnJvbSAnLi4vLi4vd2VicGFjay91dGlscy9oZWxwZXJzJztcbmltcG9ydCB7XG4gIHN0YXRzRXJyb3JzVG9TdHJpbmcsXG4gIHN0YXRzSGFzRXJyb3JzLFxuICBzdGF0c0hhc1dhcm5pbmdzLFxuICBzdGF0c1dhcm5pbmdzVG9TdHJpbmcsXG4gIHdlYnBhY2tTdGF0c0xvZ2dlcixcbn0gZnJvbSAnLi4vLi4vd2VicGFjay91dGlscy9zdGF0cyc7XG5pbXBvcnQgeyBTY2hlbWEgYXMgU2VydmVyQnVpbGRlck9wdGlvbnMgfSBmcm9tICcuL3NjaGVtYSc7XG5cbi8qKlxuICogQGV4cGVyaW1lbnRhbCBEaXJlY3QgdXNhZ2Ugb2YgdGhpcyB0eXBlIGlzIGNvbnNpZGVyZWQgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgdHlwZSBTZXJ2ZXJCdWlsZGVyT3V0cHV0ID0gQnVpbGRlck91dHB1dCAmIHtcbiAgYmFzZU91dHB1dFBhdGg6IHN0cmluZztcbiAgLyoqXG4gICAqIEBkZXByZWNhdGVkIGluIHZlcnNpb24gMTQuIFVzZSAnb3V0cHV0cycgaW5zdGVhZC5cbiAgICovXG4gIG91dHB1dFBhdGhzOiBzdHJpbmdbXTtcbiAgLyoqXG4gICAqIEBkZXByZWNhdGVkIGluIHZlcnNpb24gOS4gVXNlICdvdXRwdXRzJyBpbnN0ZWFkLlxuICAgKi9cbiAgb3V0cHV0UGF0aDogc3RyaW5nO1xuXG4gIG91dHB1dHM6IHtcbiAgICBsb2NhbGU/OiBzdHJpbmc7XG4gICAgcGF0aDogc3RyaW5nO1xuICB9W107XG59O1xuXG5leHBvcnQgeyBTZXJ2ZXJCdWlsZGVyT3B0aW9ucyB9O1xuXG4vKipcbiAqIEBleHBlcmltZW50YWwgRGlyZWN0IHVzYWdlIG9mIHRoaXMgZnVuY3Rpb24gaXMgY29uc2lkZXJlZCBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBleGVjdXRlKFxuICBvcHRpb25zOiBTZXJ2ZXJCdWlsZGVyT3B0aW9ucyxcbiAgY29udGV4dDogQnVpbGRlckNvbnRleHQsXG4gIHRyYW5zZm9ybXM6IHtcbiAgICB3ZWJwYWNrQ29uZmlndXJhdGlvbj86IEV4ZWN1dGlvblRyYW5zZm9ybWVyPHdlYnBhY2suQ29uZmlndXJhdGlvbj47XG4gIH0gPSB7fSxcbik6IE9ic2VydmFibGU8U2VydmVyQnVpbGRlck91dHB1dD4ge1xuICBjb25zdCByb290ID0gY29udGV4dC53b3Jrc3BhY2VSb290O1xuXG4gIC8vIENoZWNrIEFuZ3VsYXIgdmVyc2lvbi5cbiAgYXNzZXJ0Q29tcGF0aWJsZUFuZ3VsYXJWZXJzaW9uKHJvb3QpO1xuXG4gIGNvbnN0IGJhc2VPdXRwdXRQYXRoID0gcGF0aC5yZXNvbHZlKHJvb3QsIG9wdGlvbnMub3V0cHV0UGF0aCk7XG4gIGxldCBvdXRwdXRQYXRoczogdW5kZWZpbmVkIHwgTWFwPHN0cmluZywgc3RyaW5nPjtcblxuICByZXR1cm4gZnJvbShpbml0aWFsaXplKG9wdGlvbnMsIGNvbnRleHQsIHRyYW5zZm9ybXMud2VicGFja0NvbmZpZ3VyYXRpb24pKS5waXBlKFxuICAgIGNvbmNhdE1hcCgoeyBjb25maWcsIGkxOG4sIHByb2plY3RSb290LCBwcm9qZWN0U291cmNlUm9vdCB9KSA9PiB7XG4gICAgICByZXR1cm4gcnVuV2VicGFjayhjb25maWcsIGNvbnRleHQsIHtcbiAgICAgICAgd2VicGFja0ZhY3Rvcnk6IHJlcXVpcmUoJ3dlYnBhY2snKSBhcyB0eXBlb2Ygd2VicGFjayxcbiAgICAgICAgbG9nZ2luZzogKHN0YXRzLCBjb25maWcpID0+IHtcbiAgICAgICAgICBpZiAob3B0aW9ucy52ZXJib3NlKSB7XG4gICAgICAgICAgICBjb250ZXh0LmxvZ2dlci5pbmZvKHN0YXRzLnRvU3RyaW5nKGNvbmZpZy5zdGF0cykpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgIH0pLnBpcGUoXG4gICAgICAgIGNvbmNhdE1hcChhc3luYyAob3V0cHV0KSA9PiB7XG4gICAgICAgICAgY29uc3QgeyBlbWl0dGVkRmlsZXMgPSBbXSwgb3V0cHV0UGF0aCwgd2VicGFja1N0YXRzLCBzdWNjZXNzIH0gPSBvdXRwdXQ7XG4gICAgICAgICAgaWYgKCF3ZWJwYWNrU3RhdHMpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignV2VicGFjayBzdGF0cyBidWlsZCByZXN1bHQgaXMgcmVxdWlyZWQuJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKCFzdWNjZXNzKSB7XG4gICAgICAgICAgICBpZiAoc3RhdHNIYXNXYXJuaW5ncyh3ZWJwYWNrU3RhdHMpKSB7XG4gICAgICAgICAgICAgIGNvbnRleHQubG9nZ2VyLndhcm4oc3RhdHNXYXJuaW5nc1RvU3RyaW5nKHdlYnBhY2tTdGF0cywgeyBjb2xvcnM6IHRydWUgfSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHN0YXRzSGFzRXJyb3JzKHdlYnBhY2tTdGF0cykpIHtcbiAgICAgICAgICAgICAgY29udGV4dC5sb2dnZXIuZXJyb3Ioc3RhdHNFcnJvcnNUb1N0cmluZyh3ZWJwYWNrU3RhdHMsIHsgY29sb3JzOiB0cnVlIH0pKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCBzcGlubmVyID0gbmV3IFNwaW5uZXIoKTtcbiAgICAgICAgICBzcGlubmVyLmVuYWJsZWQgPSBvcHRpb25zLnByb2dyZXNzICE9PSBmYWxzZTtcbiAgICAgICAgICBvdXRwdXRQYXRocyA9IGVuc3VyZU91dHB1dFBhdGhzKGJhc2VPdXRwdXRQYXRoLCBpMThuKTtcblxuICAgICAgICAgIC8vIENvcHkgYXNzZXRzXG4gICAgICAgICAgaWYgKCFvcHRpb25zLndhdGNoICYmIG9wdGlvbnMuYXNzZXRzPy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHNwaW5uZXIuc3RhcnQoJ0NvcHlpbmcgYXNzZXRzLi4uJyk7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBhd2FpdCBjb3B5QXNzZXRzKFxuICAgICAgICAgICAgICAgIG5vcm1hbGl6ZUFzc2V0UGF0dGVybnMoXG4gICAgICAgICAgICAgICAgICBvcHRpb25zLmFzc2V0cyxcbiAgICAgICAgICAgICAgICAgIGNvbnRleHQud29ya3NwYWNlUm9vdCxcbiAgICAgICAgICAgICAgICAgIHByb2plY3RSb290LFxuICAgICAgICAgICAgICAgICAgcHJvamVjdFNvdXJjZVJvb3QsXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBBcnJheS5mcm9tKG91dHB1dFBhdGhzLnZhbHVlcygpKSxcbiAgICAgICAgICAgICAgICBjb250ZXh0LndvcmtzcGFjZVJvb3QsXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIHNwaW5uZXIuc3VjY2VlZCgnQ29weWluZyBhc3NldHMgY29tcGxldGUuJyk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgc3Bpbm5lci5mYWlsKGNvbG9ycy5yZWRCcmlnaHQoJ0NvcHlpbmcgb2YgYXNzZXRzIGZhaWxlZC4nKSk7XG4gICAgICAgICAgICAgIGFzc2VydElzRXJyb3IoZXJyKTtcblxuICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIC4uLm91dHB1dCxcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBlcnJvcjogJ1VuYWJsZSB0byBjb3B5IGFzc2V0czogJyArIGVyci5tZXNzYWdlLFxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChpMThuLnNob3VsZElubGluZSkge1xuICAgICAgICAgICAgY29uc3Qgc3VjY2VzcyA9IGF3YWl0IGkxOG5JbmxpbmVFbWl0dGVkRmlsZXMoXG4gICAgICAgICAgICAgIGNvbnRleHQsXG4gICAgICAgICAgICAgIGVtaXR0ZWRGaWxlcyxcbiAgICAgICAgICAgICAgaTE4bixcbiAgICAgICAgICAgICAgYmFzZU91dHB1dFBhdGgsXG4gICAgICAgICAgICAgIEFycmF5LmZyb20ob3V0cHV0UGF0aHMudmFsdWVzKCkpLFxuICAgICAgICAgICAgICBbXSxcbiAgICAgICAgICAgICAgb3V0cHV0UGF0aCxcbiAgICAgICAgICAgICAgb3B0aW9ucy5pMThuTWlzc2luZ1RyYW5zbGF0aW9uLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGlmICghc3VjY2Vzcykge1xuICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIC4uLm91dHB1dCxcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICB3ZWJwYWNrU3RhdHNMb2dnZXIoY29udGV4dC5sb2dnZXIsIHdlYnBhY2tTdGF0cywgY29uZmlnKTtcblxuICAgICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgICAgIH0pLFxuICAgICAgKTtcbiAgICB9KSxcbiAgICBjb25jYXRNYXAoYXN5bmMgKG91dHB1dCkgPT4ge1xuICAgICAgaWYgKCFvdXRwdXQuc3VjY2Vzcykge1xuICAgICAgICByZXR1cm4gb3V0cHV0IGFzIFNlcnZlckJ1aWxkZXJPdXRwdXQ7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLm91dHB1dCxcbiAgICAgICAgYmFzZU91dHB1dFBhdGgsXG4gICAgICAgIG91dHB1dFBhdGg6IGJhc2VPdXRwdXRQYXRoLFxuICAgICAgICBvdXRwdXRQYXRoczogb3V0cHV0UGF0aHMgfHwgW2Jhc2VPdXRwdXRQYXRoXSxcbiAgICAgICAgb3V0cHV0czogKG91dHB1dFBhdGhzICYmXG4gICAgICAgICAgWy4uLm91dHB1dFBhdGhzLmVudHJpZXMoKV0ubWFwKChbbG9jYWxlLCBwYXRoXSkgPT4gKHtcbiAgICAgICAgICAgIGxvY2FsZSxcbiAgICAgICAgICAgIHBhdGgsXG4gICAgICAgICAgfSkpKSB8fCB7XG4gICAgICAgICAgcGF0aDogYmFzZU91dHB1dFBhdGgsXG4gICAgICAgIH0sXG4gICAgICB9IGFzIFNlcnZlckJ1aWxkZXJPdXRwdXQ7XG4gICAgfSksXG4gICk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNyZWF0ZUJ1aWxkZXI8U2VydmVyQnVpbGRlck9wdGlvbnMsIFNlcnZlckJ1aWxkZXJPdXRwdXQ+KGV4ZWN1dGUpO1xuXG5hc3luYyBmdW5jdGlvbiBpbml0aWFsaXplKFxuICBvcHRpb25zOiBTZXJ2ZXJCdWlsZGVyT3B0aW9ucyxcbiAgY29udGV4dDogQnVpbGRlckNvbnRleHQsXG4gIHdlYnBhY2tDb25maWd1cmF0aW9uVHJhbnNmb3JtPzogRXhlY3V0aW9uVHJhbnNmb3JtZXI8d2VicGFjay5Db25maWd1cmF0aW9uPixcbik6IFByb21pc2U8e1xuICBjb25maWc6IHdlYnBhY2suQ29uZmlndXJhdGlvbjtcbiAgaTE4bjogSTE4bk9wdGlvbnM7XG4gIHByb2plY3RSb290OiBzdHJpbmc7XG4gIHByb2plY3RTb3VyY2VSb290Pzogc3RyaW5nO1xufT4ge1xuICAvLyBQdXJnZSBvbGQgYnVpbGQgZGlzayBjYWNoZS5cbiAgYXdhaXQgcHVyZ2VTdGFsZUJ1aWxkQ2FjaGUoY29udGV4dCk7XG5cbiAgY29uc3QgYnJvd3NlcnNsaXN0ID0gKGF3YWl0IGltcG9ydCgnYnJvd3NlcnNsaXN0JykpLmRlZmF1bHQ7XG4gIGNvbnN0IG9yaWdpbmFsT3V0cHV0UGF0aCA9IG9wdGlvbnMub3V0cHV0UGF0aDtcbiAgLy8gQXNzZXRzIGFyZSBwcm9jZXNzZWQgZGlyZWN0bHkgYnkgdGhlIGJ1aWxkZXIgZXhjZXB0IHdoZW4gd2F0Y2hpbmdcbiAgY29uc3QgYWRqdXN0ZWRPcHRpb25zID0gb3B0aW9ucy53YXRjaCA/IG9wdGlvbnMgOiB7IC4uLm9wdGlvbnMsIGFzc2V0czogW10gfTtcblxuICBjb25zdCB7IGNvbmZpZywgcHJvamVjdFJvb3QsIHByb2plY3RTb3VyY2VSb290LCBpMThuIH0gPVxuICAgIGF3YWl0IGdlbmVyYXRlSTE4bkJyb3dzZXJXZWJwYWNrQ29uZmlnRnJvbUNvbnRleHQoXG4gICAgICB7XG4gICAgICAgIC4uLmFkanVzdGVkT3B0aW9ucyxcbiAgICAgICAgYnVpbGRPcHRpbWl6ZXI6IGZhbHNlLFxuICAgICAgICBhb3Q6IHRydWUsXG4gICAgICAgIHBsYXRmb3JtOiAnc2VydmVyJyxcbiAgICAgIH0gYXMgTm9ybWFsaXplZEJyb3dzZXJCdWlsZGVyU2NoZW1hLFxuICAgICAgY29udGV4dCxcbiAgICAgICh3Y28pID0+IHtcbiAgICAgICAgLy8gV2UgdXNlIHRoZSBwbGF0Zm9ybSB0byBkZXRlcm1pbmUgdGhlIEphdmFTY3JpcHQgc3ludGF4IG91dHB1dC5cbiAgICAgICAgd2NvLmJ1aWxkT3B0aW9ucy5zdXBwb3J0ZWRCcm93c2VycyA/Pz0gW107XG4gICAgICAgIHdjby5idWlsZE9wdGlvbnMuc3VwcG9ydGVkQnJvd3NlcnMucHVzaCguLi5icm93c2Vyc2xpc3QoJ21haW50YWluZWQgbm9kZSB2ZXJzaW9ucycpKTtcblxuICAgICAgICByZXR1cm4gW2dldFBsYXRmb3JtU2VydmVyRXhwb3J0c0NvbmZpZyh3Y28pLCBnZXRDb21tb25Db25maWcod2NvKSwgZ2V0U3R5bGVzQ29uZmlnKHdjbyldO1xuICAgICAgfSxcbiAgICApO1xuXG4gIGlmIChvcHRpb25zLmRlbGV0ZU91dHB1dFBhdGgpIHtcbiAgICBkZWxldGVPdXRwdXREaXIoY29udGV4dC53b3Jrc3BhY2VSb290LCBvcmlnaW5hbE91dHB1dFBhdGgpO1xuICB9XG5cbiAgY29uc3QgdHJhbnNmb3JtZWRDb25maWcgPSAoYXdhaXQgd2VicGFja0NvbmZpZ3VyYXRpb25UcmFuc2Zvcm0/Lihjb25maWcpKSA/PyBjb25maWc7XG5cbiAgcmV0dXJuIHsgY29uZmlnOiB0cmFuc2Zvcm1lZENvbmZpZywgaTE4biwgcHJvamVjdFJvb3QsIHByb2plY3RTb3VyY2VSb290IH07XG59XG5cbi8qKlxuICogQWRkIGBAYW5ndWxhci9wbGF0Zm9ybS1zZXJ2ZXJgIGV4cG9ydHMuXG4gKiBUaGlzIGlzIG5lZWRlZCBzbyB0aGF0IERJIHRva2VucyBjYW4gYmUgcmVmZXJlbmNlZCBhbmQgc2V0IGF0IHJ1bnRpbWUgb3V0c2lkZSBvZiB0aGUgYnVuZGxlLlxuICovXG5mdW5jdGlvbiBnZXRQbGF0Zm9ybVNlcnZlckV4cG9ydHNDb25maWcod2NvOiBCcm93c2VyV2VicGFja0NvbmZpZ09wdGlvbnMpOiBQYXJ0aWFsPENvbmZpZ3VyYXRpb24+IHtcbiAgLy8gQWRkIGBAYW5ndWxhci9wbGF0Zm9ybS1zZXJ2ZXJgIGV4cG9ydHMuXG4gIC8vIFRoaXMgaXMgbmVlZGVkIHNvIHRoYXQgREkgdG9rZW5zIGNhbiBiZSByZWZlcmVuY2VkIGFuZCBzZXQgYXQgcnVudGltZSBvdXRzaWRlIG9mIHRoZSBidW5kbGUuXG5cbiAgLy8gT25seSBhZGQgYEBhbmd1bGFyL3BsYXRmb3JtLXNlcnZlcmAgZXhwb3J0cyB3aGVuIGl0IGlzIGluc3RhbGxlZC5cbiAgLy8gSW4gc29tZSBjYXNlcyB0aGlzIGJ1aWxkZXIgaXMgdXNlZCB3aGVuIGBAYW5ndWxhci9wbGF0Zm9ybS1zZXJ2ZXJgIGlzIG5vdCBpbnN0YWxsZWQuXG4gIC8vIEV4YW1wbGU6IHdoZW4gdXNpbmcgYEBuZ3VuaXZlcnNhbC9jb21tb24vY2xvdmVyYCB3aGljaCBkb2VzIG5vdCBuZWVkIGBAYW5ndWxhci9wbGF0Zm9ybS1zZXJ2ZXJgLlxuXG4gIHJldHVybiBpc1BsYXRmb3JtU2VydmVySW5zdGFsbGVkKHdjby5yb290KVxuICAgID8ge1xuICAgICAgICBtb2R1bGU6IHtcbiAgICAgICAgICBydWxlczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBsb2FkZXI6IHJlcXVpcmUucmVzb2x2ZSgnLi9wbGF0Zm9ybS1zZXJ2ZXItZXhwb3J0cy1sb2FkZXInKSxcbiAgICAgICAgICAgICAgaW5jbHVkZTogW3BhdGgucmVzb2x2ZSh3Y28ucm9vdCwgd2NvLmJ1aWxkT3B0aW9ucy5tYWluKV0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICB9XG4gICAgOiB7fTtcbn1cbiJdfQ==