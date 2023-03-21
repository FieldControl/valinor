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
exports.serveWebpackBrowser = void 0;
const architect_1 = require("@angular-devkit/architect");
const build_webpack_1 = require("@angular-devkit/build-webpack");
const core_1 = require("@angular-devkit/core");
const path = __importStar(require("path"));
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const url = __importStar(require("url"));
const utils_1 = require("../../utils");
const check_port_1 = require("../../utils/check-port");
const color_1 = require("../../utils/color");
const i18n_options_1 = require("../../utils/i18n-options");
const load_translations_1 = require("../../utils/load-translations");
const normalize_cache_1 = require("../../utils/normalize-cache");
const package_chunk_sort_1 = require("../../utils/package-chunk-sort");
const purge_cache_1 = require("../../utils/purge-cache");
const version_1 = require("../../utils/version");
const webpack_browser_config_1 = require("../../utils/webpack-browser-config");
const webpack_diagnostics_1 = require("../../utils/webpack-diagnostics");
const configs_1 = require("../../webpack/configs");
const index_html_webpack_plugin_1 = require("../../webpack/plugins/index-html-webpack-plugin");
const service_worker_plugin_1 = require("../../webpack/plugins/service-worker-plugin");
const stats_1 = require("../../webpack/utils/stats");
const schema_1 = require("../browser/schema");
/**
 * Reusable implementation of the Angular Webpack development server builder.
 * @param options Dev Server options.
 * @param context The build context.
 * @param transforms A map of transforms that can be used to hook into some logic (such as
 *     transforming webpack configuration before passing it to webpack).
 *
 * @experimental Direct usage of this function is considered experimental.
 */
// eslint-disable-next-line max-lines-per-function
function serveWebpackBrowser(options, context, transforms = {}) {
    // Check Angular version.
    const { logger, workspaceRoot } = context;
    (0, version_1.assertCompatibleAngularVersion)(workspaceRoot);
    const browserTarget = (0, architect_1.targetFromTargetString)(options.browserTarget);
    async function setup() {
        var _a, _b, _c, _d;
        const projectName = (_a = context.target) === null || _a === void 0 ? void 0 : _a.project;
        if (!projectName) {
            throw new Error('The builder requires a target.');
        }
        // Purge old build disk cache.
        await (0, purge_cache_1.purgeStaleBuildCache)(context);
        options.port = await (0, check_port_1.checkPort)((_b = options.port) !== null && _b !== void 0 ? _b : 4200, options.host || 'localhost');
        if (options.hmr) {
            logger.warn(core_1.tags.stripIndents `NOTICE: Hot Module Replacement (HMR) is enabled for the dev server.
      See https://webpack.js.org/guides/hot-module-replacement for information on working with HMR for Webpack.`);
        }
        if (!options.disableHostCheck &&
            options.host &&
            !/^127\.\d+\.\d+\.\d+/g.test(options.host) &&
            options.host !== 'localhost') {
            logger.warn(core_1.tags.stripIndent `
        Warning: This is a simple server for use in testing or debugging Angular applications
        locally. It hasn't been reviewed for security issues.

        Binding this server to an open connection can result in compromising your application or
        computer. Using a different host than the one passed to the "--host" flag might result in
        websocket connection issues. You might need to use "--disable-host-check" if that's the
        case.
      `);
        }
        if (options.disableHostCheck) {
            logger.warn(core_1.tags.oneLine `
        Warning: Running a server with --disable-host-check is a security risk.
        See https://medium.com/webpack/webpack-dev-server-middleware-security-issues-1489d950874a
        for more information.
      `);
        }
        // Get the browser configuration from the target name.
        const rawBrowserOptions = (await context.getTargetOptions(browserTarget));
        if (rawBrowserOptions.outputHashing && rawBrowserOptions.outputHashing !== schema_1.OutputHashing.None) {
            // Disable output hashing for dev build as this can cause memory leaks
            // See: https://github.com/webpack/webpack-dev-server/issues/377#issuecomment-241258405
            rawBrowserOptions.outputHashing = schema_1.OutputHashing.None;
            logger.warn(`Warning: 'outputHashing' option is disabled when using the dev-server.`);
        }
        const metadata = await context.getProjectMetadata(projectName);
        const cacheOptions = (0, normalize_cache_1.normalizeCacheOptions)(metadata, context.workspaceRoot);
        const browserName = await context.getBuilderNameForTarget(browserTarget);
        // Issue a warning that the dev-server does not currently support the experimental esbuild-
        // based builder and will use Webpack.
        if (browserName === '@angular-devkit/build-angular:browser-esbuild') {
            logger.warn('WARNING: The experimental esbuild-based builder is not currently supported ' +
                'by the dev-server. The stable Webpack-based builder will be used instead.');
        }
        const browserOptions = (await context.validateOptions({
            ...rawBrowserOptions,
            watch: options.watch,
            verbose: options.verbose,
            // In dev server we should not have budgets because of extra libs such as socks-js
            budgets: undefined,
        }, browserName));
        const { styles, scripts } = (0, utils_1.normalizeOptimization)(browserOptions.optimization);
        if (scripts || styles.minify) {
            logger.error(core_1.tags.stripIndents `
        ****************************************************************************************
        This is a simple server for use in testing or debugging Angular applications locally.
        It hasn't been reviewed for security issues.

        DON'T USE IT FOR PRODUCTION!
        ****************************************************************************************
      `);
        }
        const { config, projectRoot, i18n } = await (0, webpack_browser_config_1.generateI18nBrowserWebpackConfigFromContext)(browserOptions, context, (wco) => [(0, configs_1.getDevServerConfig)(wco), (0, configs_1.getCommonConfig)(wco), (0, configs_1.getStylesConfig)(wco)], options);
        if (!config.devServer) {
            throw new Error('Webpack Dev Server configuration was not set.');
        }
        let locale;
        if (i18n.shouldInline) {
            // Dev-server only supports one locale
            locale = [...i18n.inlineLocales][0];
        }
        else if (i18n.hasDefinedSourceLocale) {
            // use source locale if not localizing
            locale = i18n.sourceLocale;
        }
        let webpackConfig = config;
        // If a locale is defined, setup localization
        if (locale) {
            if (i18n.inlineLocales.size > 1) {
                throw new Error('The development server only supports localizing a single locale per build.');
            }
            await setupLocalize(locale, i18n, browserOptions, webpackConfig, cacheOptions, context);
        }
        if (transforms.webpackConfiguration) {
            webpackConfig = await transforms.webpackConfiguration(webpackConfig);
        }
        (_c = webpackConfig.plugins) !== null && _c !== void 0 ? _c : (webpackConfig.plugins = []);
        if (browserOptions.index) {
            const { scripts = [], styles = [], baseHref } = browserOptions;
            const entrypoints = (0, package_chunk_sort_1.generateEntryPoints)({
                scripts,
                styles,
                // The below is needed as otherwise HMR for CSS will break.
                // styles.js and runtime.js needs to be loaded as a non-module scripts as otherwise `document.currentScript` will be null.
                // https://github.com/webpack-contrib/mini-css-extract-plugin/blob/90445dd1d81da0c10b9b0e8a17b417d0651816b8/src/hmr/hotModuleReplacement.js#L39
                isHMREnabled: !!((_d = webpackConfig.devServer) === null || _d === void 0 ? void 0 : _d.hot),
            });
            webpackConfig.plugins.push(new index_html_webpack_plugin_1.IndexHtmlWebpackPlugin({
                indexPath: path.resolve(workspaceRoot, (0, webpack_browser_config_1.getIndexInputFile)(browserOptions.index)),
                outputPath: (0, webpack_browser_config_1.getIndexOutputFile)(browserOptions.index),
                baseHref,
                entrypoints,
                deployUrl: browserOptions.deployUrl,
                sri: browserOptions.subresourceIntegrity,
                cache: cacheOptions,
                postTransform: transforms.indexHtml,
                optimization: (0, utils_1.normalizeOptimization)(browserOptions.optimization),
                crossOrigin: browserOptions.crossOrigin,
                lang: locale,
            }));
        }
        if (browserOptions.serviceWorker) {
            webpackConfig.plugins.push(new service_worker_plugin_1.ServiceWorkerPlugin({
                baseHref: browserOptions.baseHref,
                root: context.workspaceRoot,
                projectRoot,
                ngswConfigPath: browserOptions.ngswConfigPath,
            }));
        }
        return {
            browserOptions,
            webpackConfig,
            projectRoot,
        };
    }
    return (0, rxjs_1.from)(setup()).pipe((0, operators_1.switchMap)(({ browserOptions, webpackConfig }) => {
        return (0, build_webpack_1.runWebpackDevServer)(webpackConfig, context, {
            logging: transforms.logging || (0, stats_1.createWebpackLoggingCallback)(browserOptions, logger),
            webpackFactory: require('webpack'),
            webpackDevServerFactory: require('webpack-dev-server'),
        }).pipe((0, operators_1.concatMap)(async (buildEvent, index) => {
            var _a, _b;
            const webpackRawStats = buildEvent.webpackStats;
            if (!webpackRawStats) {
                throw new Error('Webpack stats build result is required.');
            }
            // Resolve serve address.
            const publicPath = (_b = (_a = webpackConfig.devServer) === null || _a === void 0 ? void 0 : _a.devMiddleware) === null || _b === void 0 ? void 0 : _b.publicPath;
            const serverAddress = url.format({
                protocol: options.ssl ? 'https' : 'http',
                hostname: options.host === '0.0.0.0' ? 'localhost' : options.host,
                port: buildEvent.port,
                pathname: typeof publicPath === 'string' ? publicPath : undefined,
            });
            if (index === 0) {
                logger.info('\n' +
                    core_1.tags.oneLine `
              **
              Angular Live Development Server is listening on ${options.host}:${buildEvent.port},
              open your browser on ${serverAddress}
              **
            ` +
                    '\n');
                if (options.open) {
                    const open = (await Promise.resolve().then(() => __importStar(require('open')))).default;
                    await open(serverAddress);
                }
            }
            if (buildEvent.success) {
                logger.info(`\n${color_1.colors.greenBright(color_1.colors.symbols.check)} Compiled successfully.`);
            }
            else {
                logger.info(`\n${color_1.colors.redBright(color_1.colors.symbols.cross)} Failed to compile.`);
            }
            return {
                ...buildEvent,
                baseUrl: serverAddress,
                stats: (0, stats_1.generateBuildEventStats)(webpackRawStats, browserOptions),
            };
        }));
    }));
}
exports.serveWebpackBrowser = serveWebpackBrowser;
async function setupLocalize(locale, i18n, browserOptions, webpackConfig, cacheOptions, context) {
    var _a;
    const localeDescription = i18n.locales[locale];
    // Modify main entrypoint to include locale data
    if ((localeDescription === null || localeDescription === void 0 ? void 0 : localeDescription.dataPath) &&
        typeof webpackConfig.entry === 'object' &&
        !Array.isArray(webpackConfig.entry) &&
        webpackConfig.entry['main']) {
        if (Array.isArray(webpackConfig.entry['main'])) {
            webpackConfig.entry['main'].unshift(localeDescription.dataPath);
        }
        else {
            webpackConfig.entry['main'] = [
                localeDescription.dataPath,
                webpackConfig.entry['main'],
            ];
        }
    }
    let missingTranslationBehavior = browserOptions.i18nMissingTranslation || 'ignore';
    let translation = (localeDescription === null || localeDescription === void 0 ? void 0 : localeDescription.translation) || {};
    if (locale === i18n.sourceLocale) {
        missingTranslationBehavior = 'ignore';
        translation = {};
    }
    const i18nLoaderOptions = {
        locale,
        missingTranslationBehavior,
        translation: i18n.shouldInline ? translation : undefined,
        translationFiles: localeDescription === null || localeDescription === void 0 ? void 0 : localeDescription.files.map((file) => path.resolve(context.workspaceRoot, file.path)),
    };
    const i18nRule = {
        test: /\.[cm]?[tj]sx?$/,
        enforce: 'post',
        use: [
            {
                loader: require.resolve('../../babel/webpack-loader'),
                options: {
                    cacheDirectory: (cacheOptions.enabled && path.join(cacheOptions.path, 'babel-dev-server-i18n')) ||
                        false,
                    cacheIdentifier: JSON.stringify({
                        locale,
                        translationIntegrity: localeDescription === null || localeDescription === void 0 ? void 0 : localeDescription.files.map((file) => file.integrity),
                    }),
                    i18n: i18nLoaderOptions,
                },
            },
        ],
    };
    // Get the rules and ensure the Webpack configuration is setup properly
    const rules = ((_a = webpackConfig.module) === null || _a === void 0 ? void 0 : _a.rules) || [];
    if (!webpackConfig.module) {
        webpackConfig.module = { rules };
    }
    else if (!webpackConfig.module.rules) {
        webpackConfig.module.rules = rules;
    }
    rules.push(i18nRule);
    // Add a plugin to reload translation files on rebuilds
    const loader = await (0, load_translations_1.createTranslationLoader)();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    webpackConfig.plugins.push({
        apply: (compiler) => {
            compiler.hooks.thisCompilation.tap('build-angular', (compilation) => {
                var _a;
                if (i18n.shouldInline && i18nLoaderOptions.translation === undefined) {
                    // Reload translations
                    (0, i18n_options_1.loadTranslations)(locale, localeDescription, context.workspaceRoot, loader, {
                        warn(message) {
                            (0, webpack_diagnostics_1.addWarning)(compilation, message);
                        },
                        error(message) {
                            (0, webpack_diagnostics_1.addError)(compilation, message);
                        },
                    }, undefined, browserOptions.i18nDuplicateTranslation);
                    i18nLoaderOptions.translation = (_a = localeDescription.translation) !== null && _a !== void 0 ? _a : {};
                }
                compilation.hooks.finishModules.tap('build-angular', () => {
                    // After loaders are finished, clear out the now unneeded translations
                    i18nLoaderOptions.translation = undefined;
                });
            });
        },
    });
}
exports.default = (0, architect_1.createBuilder)(serveWebpackBrowser);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9hbmd1bGFyX2RldmtpdC9idWlsZF9hbmd1bGFyL3NyYy9idWlsZGVycy9kZXYtc2VydmVyL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUgseURBQWtHO0FBQ2xHLGlFQUl1QztBQUN2QywrQ0FBa0Q7QUFDbEQsMkNBQTZCO0FBQzdCLCtCQUF3QztBQUN4Qyw4Q0FBc0Q7QUFDdEQseUNBQTJCO0FBSTNCLHVDQUFvRDtBQUNwRCx1REFBbUQ7QUFDbkQsNkNBQTJDO0FBQzNDLDJEQUF5RTtBQUV6RSxxRUFBd0U7QUFDeEUsaUVBQTZGO0FBQzdGLHVFQUFxRTtBQUNyRSx5REFBK0Q7QUFDL0QsaURBQXFFO0FBQ3JFLCtFQUk0QztBQUM1Qyx5RUFBdUU7QUFDdkUsbURBQTZGO0FBQzdGLCtGQUF5RjtBQUN6Rix1RkFBa0Y7QUFDbEYscURBSW1DO0FBQ25DLDhDQUFrRjtBQWFsRjs7Ozs7Ozs7R0FRRztBQUNILGtEQUFrRDtBQUNsRCxTQUFnQixtQkFBbUIsQ0FDakMsT0FBZ0MsRUFDaEMsT0FBdUIsRUFDdkIsYUFJSSxFQUFFO0lBRU4seUJBQXlCO0lBQ3pCLE1BQU0sRUFBRSxNQUFNLEVBQUUsYUFBYSxFQUFFLEdBQUcsT0FBTyxDQUFDO0lBQzFDLElBQUEsd0NBQThCLEVBQUMsYUFBYSxDQUFDLENBQUM7SUFFOUMsTUFBTSxhQUFhLEdBQUcsSUFBQSxrQ0FBc0IsRUFBQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7SUFFcEUsS0FBSyxVQUFVLEtBQUs7O1FBS2xCLE1BQU0sV0FBVyxHQUFHLE1BQUEsT0FBTyxDQUFDLE1BQU0sMENBQUUsT0FBTyxDQUFDO1FBQzVDLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDaEIsTUFBTSxJQUFJLEtBQUss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Q0FBQztBQUNMLENBQUM7QUFFRCxrQkFBZSxJQUFBLHlCQUFhLEVBQWtELG1CQUFtQixDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHsgQnVpbGRlckNvbnRleHQsIGNyZWF0ZUJ1aWxkZXIsIHRhcmdldEZyb21UYXJnZXRTdHJpbmcgfSBmcm9tICdAYW5ndWxhci1kZXZraXQvYXJjaGl0ZWN0JztcbmltcG9ydCB7XG4gIERldlNlcnZlckJ1aWxkT3V0cHV0LFxuICBXZWJwYWNrTG9nZ2luZ0NhbGxiYWNrLFxuICBydW5XZWJwYWNrRGV2U2VydmVyLFxufSBmcm9tICdAYW5ndWxhci1kZXZraXQvYnVpbGQtd2VicGFjayc7XG5pbXBvcnQgeyBqc29uLCB0YWdzIH0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L2NvcmUnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IE9ic2VydmFibGUsIGZyb20gfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IGNvbmNhdE1hcCwgc3dpdGNoTWFwIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0ICogYXMgdXJsIGZyb20gJ3VybCc7XG5pbXBvcnQgd2VicGFjayBmcm9tICd3ZWJwYWNrJztcbmltcG9ydCB3ZWJwYWNrRGV2U2VydmVyIGZyb20gJ3dlYnBhY2stZGV2LXNlcnZlcic7XG5pbXBvcnQgeyBFeGVjdXRpb25UcmFuc2Zvcm1lciB9IGZyb20gJy4uLy4uL3RyYW5zZm9ybXMnO1xuaW1wb3J0IHsgbm9ybWFsaXplT3B0aW1pemF0aW9uIH0gZnJvbSAnLi4vLi4vdXRpbHMnO1xuaW1wb3J0IHsgY2hlY2tQb3J0IH0gZnJvbSAnLi4vLi4vdXRpbHMvY2hlY2stcG9ydCc7XG5pbXBvcnQgeyBjb2xvcnMgfSBmcm9tICcuLi8uLi91dGlscy9jb2xvcic7XG5pbXBvcnQgeyBJMThuT3B0aW9ucywgbG9hZFRyYW5zbGF0aW9ucyB9IGZyb20gJy4uLy4uL3V0aWxzL2kxOG4tb3B0aW9ucyc7XG5pbXBvcnQgeyBJbmRleEh0bWxUcmFuc2Zvcm0gfSBmcm9tICcuLi8uLi91dGlscy9pbmRleC1maWxlL2luZGV4LWh0bWwtZ2VuZXJhdG9yJztcbmltcG9ydCB7IGNyZWF0ZVRyYW5zbGF0aW9uTG9hZGVyIH0gZnJvbSAnLi4vLi4vdXRpbHMvbG9hZC10cmFuc2xhdGlvbnMnO1xuaW1wb3J0IHsgTm9ybWFsaXplZENhY2hlZE9wdGlvbnMsIG5vcm1hbGl6ZUNhY2hlT3B0aW9ucyB9IGZyb20gJy4uLy4uL3V0aWxzL25vcm1hbGl6ZS1jYWNoZSc7XG5pbXBvcnQgeyBnZW5lcmF0ZUVudHJ5UG9pbnRzIH0gZnJvbSAnLi4vLi4vdXRpbHMvcGFja2FnZS1jaHVuay1zb3J0JztcbmltcG9ydCB7IHB1cmdlU3RhbGVCdWlsZENhY2hlIH0gZnJvbSAnLi4vLi4vdXRpbHMvcHVyZ2UtY2FjaGUnO1xuaW1wb3J0IHsgYXNzZXJ0Q29tcGF0aWJsZUFuZ3VsYXJWZXJzaW9uIH0gZnJvbSAnLi4vLi4vdXRpbHMvdmVyc2lvbic7XG5pbXBvcnQge1xuICBnZW5lcmF0ZUkxOG5Ccm93c2VyV2VicGFja0NvbmZpZ0Zyb21Db250ZXh0LFxuICBnZXRJbmRleElucHV0RmlsZSxcbiAgZ2V0SW5kZXhPdXRwdXRGaWxlLFxufSBmcm9tICcuLi8uLi91dGlscy93ZWJwYWNrLWJyb3dzZXItY29uZmlnJztcbmltcG9ydCB7IGFkZEVycm9yLCBhZGRXYXJuaW5nIH0gZnJvbSAnLi4vLi4vdXRpbHMvd2VicGFjay1kaWFnbm9zdGljcyc7XG5pbXBvcnQgeyBnZXRDb21tb25Db25maWcsIGdldERldlNlcnZlckNvbmZpZywgZ2V0U3R5bGVzQ29uZmlnIH0gZnJvbSAnLi4vLi4vd2VicGFjay9jb25maWdzJztcbmltcG9ydCB7IEluZGV4SHRtbFdlYnBhY2tQbHVnaW4gfSBmcm9tICcuLi8uLi93ZWJwYWNrL3BsdWdpbnMvaW5kZXgtaHRtbC13ZWJwYWNrLXBsdWdpbic7XG5pbXBvcnQgeyBTZXJ2aWNlV29ya2VyUGx1Z2luIH0gZnJvbSAnLi4vLi4vd2VicGFjay9wbHVnaW5zL3NlcnZpY2Utd29ya2VyLXBsdWdpbic7XG5pbXBvcnQge1xuICBCdWlsZEV2ZW50U3RhdHMsXG4gIGNyZWF0ZVdlYnBhY2tMb2dnaW5nQ2FsbGJhY2ssXG4gIGdlbmVyYXRlQnVpbGRFdmVudFN0YXRzLFxufSBmcm9tICcuLi8uLi93ZWJwYWNrL3V0aWxzL3N0YXRzJztcbmltcG9ydCB7IFNjaGVtYSBhcyBCcm93c2VyQnVpbGRlclNjaGVtYSwgT3V0cHV0SGFzaGluZyB9IGZyb20gJy4uL2Jyb3dzZXIvc2NoZW1hJztcbmltcG9ydCB7IFNjaGVtYSB9IGZyb20gJy4vc2NoZW1hJztcblxuZXhwb3J0IHR5cGUgRGV2U2VydmVyQnVpbGRlck9wdGlvbnMgPSBTY2hlbWE7XG5cbi8qKlxuICogQGV4cGVyaW1lbnRhbCBEaXJlY3QgdXNhZ2Ugb2YgdGhpcyB0eXBlIGlzIGNvbnNpZGVyZWQgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgdHlwZSBEZXZTZXJ2ZXJCdWlsZGVyT3V0cHV0ID0gRGV2U2VydmVyQnVpbGRPdXRwdXQgJiB7XG4gIGJhc2VVcmw6IHN0cmluZztcbiAgc3RhdHM6IEJ1aWxkRXZlbnRTdGF0cztcbn07XG5cbi8qKlxuICogUmV1c2FibGUgaW1wbGVtZW50YXRpb24gb2YgdGhlIEFuZ3VsYXIgV2VicGFjayBkZXZlbG9wbWVudCBzZXJ2ZXIgYnVpbGRlci5cbiAqIEBwYXJhbSBvcHRpb25zIERldiBTZXJ2ZXIgb3B0aW9ucy5cbiAqIEBwYXJhbSBjb250ZXh0IFRoZSBidWlsZCBjb250ZXh0LlxuICogQHBhcmFtIHRyYW5zZm9ybXMgQSBtYXAgb2YgdHJhbnNmb3JtcyB0aGF0IGNhbiBiZSB1c2VkIHRvIGhvb2sgaW50byBzb21lIGxvZ2ljIChzdWNoIGFzXG4gKiAgICAgdHJhbnNmb3JtaW5nIHdlYnBhY2sgY29uZmlndXJhdGlvbiBiZWZvcmUgcGFzc2luZyBpdCB0byB3ZWJwYWNrKS5cbiAqXG4gKiBAZXhwZXJpbWVudGFsIERpcmVjdCB1c2FnZSBvZiB0aGlzIGZ1bmN0aW9uIGlzIGNvbnNpZGVyZWQgZXhwZXJpbWVudGFsLlxuICovXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbWF4LWxpbmVzLXBlci1mdW5jdGlvblxuZXhwb3J0IGZ1bmN0aW9uIHNlcnZlV2VicGFja0Jyb3dzZXIoXG4gIG9wdGlvbnM6IERldlNlcnZlckJ1aWxkZXJPcHRpb25zLFxuICBjb250ZXh0OiBCdWlsZGVyQ29udGV4dCxcbiAgdHJhbnNmb3Jtczoge1xuICAgIHdlYnBhY2tDb25maWd1cmF0aW9uPzogRXhlY3V0aW9uVHJhbnNmb3JtZXI8d2VicGFjay5Db25maWd1cmF0aW9uPjtcbiAgICBsb2dnaW5nPzogV2VicGFja0xvZ2dpbmdDYWxsYmFjaztcbiAgICBpbmRleEh0bWw/OiBJbmRleEh0bWxUcmFuc2Zvcm07XG4gIH0gPSB7fSxcbik6IE9ic2VydmFibGU8RGV2U2VydmVyQnVpbGRlck91dHB1dD4ge1xuICAvLyBDaGVjayBBbmd1bGFyIHZlcnNpb24uXG4gIGNvbnN0IHsgbG9nZ2VyLCB3b3Jrc3BhY2VSb290IH0gPSBjb250ZXh0O1xuICBhc3NlcnRDb21wYXRpYmxlQW5ndWxhclZlcnNpb24od29ya3NwYWNlUm9vdCk7XG5cbiAgY29uc3QgYnJvd3NlclRhcmdldCA9IHRhcmdldEZyb21UYXJnZXRTdHJpbmcob3B0aW9ucy5icm93c2VyVGFyZ2V0KTtcblxuICBhc3luYyBmdW5jdGlvbiBzZXR1cCgpOiBQcm9taXNlPHtcbiAgICBicm93c2VyT3B0aW9uczogQnJvd3NlckJ1aWxkZXJTY2hlbWE7XG4gICAgd2VicGFja0NvbmZpZzogd2VicGFjay5Db25maWd1cmF0aW9uO1xuICAgIHByb2plY3RSb290OiBzdHJpbmc7XG4gIH0+IHtcbiAgICBjb25zdCBwcm9qZWN0TmFtZSA9IGNvbnRleHQudGFyZ2V0Py5wcm9qZWN0O1xuICAgIGlmICghcHJvamVjdE5hbWUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVGhlIGJ1aWxkZXIgcmVxdWlyZXMgYSB0YXJnZXQuJyk7XG4gICAgfVxuXG4gICAgLy8gUHVyZ2Ugb2xkIGJ1aWxkIGRpc2sgY2FjaGUuXG4gICAgYXdhaXQgcHVyZ2VTdGFsZUJ1aWxkQ2FjaGUoY29udGV4dCk7XG5cbiAgICBvcHRpb25zLnBvcnQgPSBhd2FpdCBjaGVja1BvcnQob3B0aW9ucy5wb3J0ID8/IDQyMDAsIG9wdGlvbnMuaG9zdCB8fCAnbG9jYWxob3N0Jyk7XG5cbiAgICBpZiAob3B0aW9ucy5obXIpIHtcbiAgICAgIGxvZ2dlci53YXJuKHRhZ3Muc3RyaXBJbmRlbnRzYE5PVElDRTogSG90IE1vZHVsZSBSZXBsYWNlbWVudCAoSE1SKSBpcyBlbmFibGVkIGZvciB0aGUgZGV2IHNlcnZlci5cbiAgICAgIFNlZSBodHRwczovL3dlYnBhY2suanMub3JnL2d1aWRlcy9ob3QtbW9kdWxlLXJlcGxhY2VtZW50IGZvciBpbmZvcm1hdGlvbiBvbiB3b3JraW5nIHdpdGggSE1SIGZvciBXZWJwYWNrLmApO1xuICAgIH1cblxuICAgIGlmIChcbiAgICAgICFvcHRpb25zLmRpc2FibGVIb3N0Q2hlY2sgJiZcbiAgICAgIG9wdGlvbnMuaG9zdCAmJlxuICAgICAgIS9eMTI3XFwuXFxkK1xcLlxcZCtcXC5cXGQrL2cudGVzdChvcHRpb25zLmhvc3QpICYmXG4gICAgICBvcHRpb25zLmhvc3QgIT09ICdsb2NhbGhvc3QnXG4gICAgKSB7XG4gICAgICBsb2dnZXIud2Fybih0YWdzLnN0cmlwSW5kZW50YFxuICAgICAgICBXYXJuaW5nOiBUaGlzIGlzIGEgc2ltcGxlIHNlcnZlciBmb3IgdXNlIGluIHRlc3Rpbmcgb3IgZGVidWdnaW5nIEFuZ3VsYXIgYXBwbGljYXRpb25zXG4gICAgICAgIGxvY2FsbHkuIEl0IGhhc24ndCBiZWVuIHJldmlld2VkIGZvciBzZWN1cml0eSBpc3N1ZXMuXG5cbiAgICAgICAgQmluZGluZyB0aGlzIHNlcnZlciB0byBhbiBvcGVuIGNvbm5lY3Rpb24gY2FuIHJlc3VsdCBpbiBjb21wcm9taXNpbmcgeW91ciBhcHBsaWNhdGlvbiBvclxuICAgICAgICBjb21wdXRlci4gVXNpbmcgYSBkaWZmZXJlbnQgaG9zdCB0aGFuIHRoZSBvbmUgcGFzc2VkIHRvIHRoZSBcIi0taG9zdFwiIGZsYWcgbWlnaHQgcmVzdWx0IGluXG4gICAgICAgIHdlYnNvY2tldCBjb25uZWN0aW9uIGlzc3Vlcy4gWW91IG1pZ2h0IG5lZWQgdG8gdXNlIFwiLS1kaXNhYmxlLWhvc3QtY2hlY2tcIiBpZiB0aGF0J3MgdGhlXG4gICAgICAgIGNhc2UuXG4gICAgICBgKTtcbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucy5kaXNhYmxlSG9zdENoZWNrKSB7XG4gICAgICBsb2dnZXIud2Fybih0YWdzLm9uZUxpbmVgXG4gICAgICAgIFdhcm5pbmc6IFJ1bm5pbmcgYSBzZXJ2ZXIgd2l0aCAtLWRpc2FibGUtaG9zdC1jaGVjayBpcyBhIHNlY3VyaXR5IHJpc2suXG4gICAgICAgIFNlZSBodHRwczovL21lZGl1bS5jb20vd2VicGFjay93ZWJwYWNrLWRldi1zZXJ2ZXItbWlkZGxld2FyZS1zZWN1cml0eS1pc3N1ZXMtMTQ4OWQ5NTA4NzRhXG4gICAgICAgIGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICAgICAgYCk7XG4gICAgfVxuICAgIC8vIEdldCB0aGUgYnJvd3NlciBjb25maWd1cmF0aW9uIGZyb20gdGhlIHRhcmdldCBuYW1lLlxuICAgIGNvbnN0IHJhd0Jyb3dzZXJPcHRpb25zID0gKGF3YWl0IGNvbnRleHQuZ2V0VGFyZ2V0T3B0aW9ucyhicm93c2VyVGFyZ2V0KSkgYXMganNvbi5Kc29uT2JqZWN0ICZcbiAgICAgIEJyb3dzZXJCdWlsZGVyU2NoZW1hO1xuXG4gICAgaWYgKHJhd0Jyb3dzZXJPcHRpb25zLm91dHB1dEhhc2hpbmcgJiYgcmF3QnJvd3Nlck9wdGlvbnMub3V0cHV0SGFzaGluZyAhPT0gT3V0cHV0SGFzaGluZy5Ob25lKSB7XG4gICAgICAvLyBEaXNhYmxlIG91dHB1dCBoYXNoaW5nIGZvciBkZXYgYnVpbGQgYXMgdGhpcyBjYW4gY2F1c2UgbWVtb3J5IGxlYWtzXG4gICAgICAvLyBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS93ZWJwYWNrL3dlYnBhY2stZGV2LXNlcnZlci9pc3N1ZXMvMzc3I2lzc3VlY29tbWVudC0yNDEyNTg0MDVcbiAgICAgIHJhd0Jyb3dzZXJPcHRpb25zLm91dHB1dEhhc2hpbmcgPSBPdXRwdXRIYXNoaW5nLk5vbmU7XG4gICAgICBsb2dnZXIud2FybihgV2FybmluZzogJ291dHB1dEhhc2hpbmcnIG9wdGlvbiBpcyBkaXNhYmxlZCB3aGVuIHVzaW5nIHRoZSBkZXYtc2VydmVyLmApO1xuICAgIH1cblxuICAgIGNvbnN0IG1ldGFkYXRhID0gYXdhaXQgY29udGV4dC5nZXRQcm9qZWN0TWV0YWRhdGEocHJvamVjdE5hbWUpO1xuICAgIGNvbnN0IGNhY2hlT3B0aW9ucyA9IG5vcm1hbGl6ZUNhY2hlT3B0aW9ucyhtZXRhZGF0YSwgY29udGV4dC53b3Jrc3BhY2VSb290KTtcblxuICAgIGNvbnN0IGJyb3dzZXJOYW1lID0gYXdhaXQgY29udGV4dC5nZXRCdWlsZGVyTmFtZUZvclRhcmdldChicm93c2VyVGFyZ2V0KTtcblxuICAgIC8vIElzc3VlIGEgd2FybmluZyB0aGF0IHRoZSBkZXYtc2VydmVyIGRvZXMgbm90IGN1cnJlbnRseSBzdXBwb3J0IHRoZSBleHBlcmltZW50YWwgZXNidWlsZC1cbiAgICAvLyBiYXNlZCBidWlsZGVyIGFuZCB3aWxsIHVzZSBXZWJwYWNrLlxuICAgIGlmIChicm93c2VyTmFtZSA9PT0gJ0Bhbmd1bGFyLWRldmtpdC9idWlsZC1hbmd1bGFyOmJyb3dzZXItZXNidWlsZCcpIHtcbiAgICAgIGxvZ2dlci53YXJuKFxuICAgICAgICAnV0FSTklORzogVGhlIGV4cGVyaW1lbnRhbCBlc2J1aWxkLWJhc2VkIGJ1aWxkZXIgaXMgbm90IGN1cnJlbnRseSBzdXBwb3J0ZWQgJyArXG4gICAgICAgICAgJ2J5IHRoZSBkZXYtc2VydmVyLiBUaGUgc3RhYmxlIFdlYnBhY2stYmFzZWQgYnVpbGRlciB3aWxsIGJlIHVzZWQgaW5zdGVhZC4nLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICBjb25zdCBicm93c2VyT3B0aW9ucyA9IChhd2FpdCBjb250ZXh0LnZhbGlkYXRlT3B0aW9ucyhcbiAgICAgIHtcbiAgICAgICAgLi4ucmF3QnJvd3Nlck9wdGlvbnMsXG4gICAgICAgIHdhdGNoOiBvcHRpb25zLndhdGNoLFxuICAgICAgICB2ZXJib3NlOiBvcHRpb25zLnZlcmJvc2UsXG4gICAgICAgIC8vIEluIGRldiBzZXJ2ZXIgd2Ugc2hvdWxkIG5vdCBoYXZlIGJ1ZGdldHMgYmVjYXVzZSBvZiBleHRyYSBsaWJzIHN1Y2ggYXMgc29ja3MtanNcbiAgICAgICAgYnVkZ2V0czogdW5kZWZpbmVkLFxuICAgICAgfSBhcyBqc29uLkpzb25PYmplY3QgJiBCcm93c2VyQnVpbGRlclNjaGVtYSxcbiAgICAgIGJyb3dzZXJOYW1lLFxuICAgICkpIGFzIGpzb24uSnNvbk9iamVjdCAmIEJyb3dzZXJCdWlsZGVyU2NoZW1hO1xuXG4gICAgY29uc3QgeyBzdHlsZXMsIHNjcmlwdHMgfSA9IG5vcm1hbGl6ZU9wdGltaXphdGlvbihicm93c2VyT3B0aW9ucy5vcHRpbWl6YXRpb24pO1xuICAgIGlmIChzY3JpcHRzIHx8IHN0eWxlcy5taW5pZnkpIHtcbiAgICAgIGxvZ2dlci5lcnJvcih0YWdzLnN0cmlwSW5kZW50c2BcbiAgICAgICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgICBUaGlzIGlzIGEgc2ltcGxlIHNlcnZlciBmb3IgdXNlIGluIHRlc3Rpbmcgb3IgZGVidWdnaW5nIEFuZ3VsYXIgYXBwbGljYXRpb25zIGxvY2FsbHkuXG4gICAgICAgIEl0IGhhc24ndCBiZWVuIHJldmlld2VkIGZvciBzZWN1cml0eSBpc3N1ZXMuXG5cbiAgICAgICAgRE9OJ1QgVVNFIElUIEZPUiBQUk9EVUNUSU9OIVxuICAgICAgICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICBgKTtcbiAgICB9XG5cbiAgICBjb25zdCB7IGNvbmZpZywgcHJvamVjdFJvb3QsIGkxOG4gfSA9IGF3YWl0IGdlbmVyYXRlSTE4bkJyb3dzZXJXZWJwYWNrQ29uZmlnRnJvbUNvbnRleHQoXG4gICAgICBicm93c2VyT3B0aW9ucyxcbiAgICAgIGNvbnRleHQsXG4gICAgICAod2NvKSA9PiBbZ2V0RGV2U2VydmVyQ29uZmlnKHdjbyksIGdldENvbW1vbkNvbmZpZyh3Y28pLCBnZXRTdHlsZXNDb25maWcod2NvKV0sXG4gICAgICBvcHRpb25zLFxuICAgICk7XG5cbiAgICBpZiAoIWNvbmZpZy5kZXZTZXJ2ZXIpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignV2VicGFjayBEZXYgU2VydmVyIGNvbmZpZ3VyYXRpb24gd2FzIG5vdCBzZXQuJyk7XG4gICAgfVxuXG4gICAgbGV0IGxvY2FsZTogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIGlmIChpMThuLnNob3VsZElubGluZSkge1xuICAgICAgLy8gRGV2LXNlcnZlciBvbmx5IHN1cHBvcnRzIG9uZSBsb2NhbGVcbiAgICAgIGxvY2FsZSA9IFsuLi5pMThuLmlubGluZUxvY2FsZXNdWzBdO1xuICAgIH0gZWxzZSBpZiAoaTE4bi5oYXNEZWZpbmVkU291cmNlTG9jYWxlKSB7XG4gICAgICAvLyB1c2Ugc291cmNlIGxvY2FsZSBpZiBub3QgbG9jYWxpemluZ1xuICAgICAgbG9jYWxlID0gaTE4bi5zb3VyY2VMb2NhbGU7XG4gICAgfVxuXG4gICAgbGV0IHdlYnBhY2tDb25maWcgPSBjb25maWc7XG5cbiAgICAvLyBJZiBhIGxvY2FsZSBpcyBkZWZpbmVkLCBzZXR1cCBsb2NhbGl6YXRpb25cbiAgICBpZiAobG9jYWxlKSB7XG4gICAgICBpZiAoaTE4bi5pbmxpbmVMb2NhbGVzLnNpemUgPiAxKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAnVGhlIGRldmVsb3BtZW50IHNlcnZlciBvbmx5IHN1cHBvcnRzIGxvY2FsaXppbmcgYSBzaW5nbGUgbG9jYWxlIHBlciBidWlsZC4nLFxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICBhd2FpdCBzZXR1cExvY2FsaXplKGxvY2FsZSwgaTE4biwgYnJvd3Nlck9wdGlvbnMsIHdlYnBhY2tDb25maWcsIGNhY2hlT3B0aW9ucywgY29udGV4dCk7XG4gICAgfVxuXG4gICAgaWYgKHRyYW5zZm9ybXMud2VicGFja0NvbmZpZ3VyYXRpb24pIHtcbiAgICAgIHdlYnBhY2tDb25maWcgPSBhd2FpdCB0cmFuc2Zvcm1zLndlYnBhY2tDb25maWd1cmF0aW9uKHdlYnBhY2tDb25maWcpO1xuICAgIH1cblxuICAgIHdlYnBhY2tDb25maWcucGx1Z2lucyA/Pz0gW107XG5cbiAgICBpZiAoYnJvd3Nlck9wdGlvbnMuaW5kZXgpIHtcbiAgICAgIGNvbnN0IHsgc2NyaXB0cyA9IFtdLCBzdHlsZXMgPSBbXSwgYmFzZUhyZWYgfSA9IGJyb3dzZXJPcHRpb25zO1xuICAgICAgY29uc3QgZW50cnlwb2ludHMgPSBnZW5lcmF0ZUVudHJ5UG9pbnRzKHtcbiAgICAgICAgc2NyaXB0cyxcbiAgICAgICAgc3R5bGVzLFxuICAgICAgICAvLyBUaGUgYmVsb3cgaXMgbmVlZGVkIGFzIG90aGVyd2lzZSBITVIgZm9yIENTUyB3aWxsIGJyZWFrLlxuICAgICAgICAvLyBzdHlsZXMuanMgYW5kIHJ1bnRpbWUuanMgbmVlZHMgdG8gYmUgbG9hZGVkIGFzIGEgbm9uLW1vZHVsZSBzY3JpcHRzIGFzIG90aGVyd2lzZSBgZG9jdW1lbnQuY3VycmVudFNjcmlwdGAgd2lsbCBiZSBudWxsLlxuICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vd2VicGFjay1jb250cmliL21pbmktY3NzLWV4dHJhY3QtcGx1Z2luL2Jsb2IvOTA0NDVkZDFkODFkYTBjMTBiOWIwZThhMTdiNDE3ZDA2NTE4MTZiOC9zcmMvaG1yL2hvdE1vZHVsZVJlcGxhY2VtZW50LmpzI0wzOVxuICAgICAgICBpc0hNUkVuYWJsZWQ6ICEhd2VicGFja0NvbmZpZy5kZXZTZXJ2ZXI/LmhvdCxcbiAgICAgIH0pO1xuXG4gICAgICB3ZWJwYWNrQ29uZmlnLnBsdWdpbnMucHVzaChcbiAgICAgICAgbmV3IEluZGV4SHRtbFdlYnBhY2tQbHVnaW4oe1xuICAgICAgICAgIGluZGV4UGF0aDogcGF0aC5yZXNvbHZlKHdvcmtzcGFjZVJvb3QsIGdldEluZGV4SW5wdXRGaWxlKGJyb3dzZXJPcHRpb25zLmluZGV4KSksXG4gICAgICAgICAgb3V0cHV0UGF0aDogZ2V0SW5kZXhPdXRwdXRGaWxlKGJyb3dzZXJPcHRpb25zLmluZGV4KSxcbiAgICAgICAgICBiYXNlSHJlZixcbiAgICAgICAgICBlbnRyeXBvaW50cyxcbiAgICAgICAgICBkZXBsb3lVcmw6IGJyb3dzZXJPcHRpb25zLmRlcGxveVVybCxcbiAgICAgICAgICBzcmk6IGJyb3dzZXJPcHRpb25zLnN1YnJlc291cmNlSW50ZWdyaXR5LFxuICAgICAgICAgIGNhY2hlOiBjYWNoZU9wdGlvbnMsXG4gICAgICAgICAgcG9zdFRyYW5zZm9ybTogdHJhbnNmb3Jtcy5pbmRleEh0bWwsXG4gICAgICAgICAgb3B0aW1pemF0aW9uOiBub3JtYWxpemVPcHRpbWl6YXRpb24oYnJvd3Nlck9wdGlvbnMub3B0aW1pemF0aW9uKSxcbiAgICAgICAgICBjcm9zc09yaWdpbjogYnJvd3Nlck9wdGlvbnMuY3Jvc3NPcmlnaW4sXG4gICAgICAgICAgbGFuZzogbG9jYWxlLFxuICAgICAgICB9KSxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKGJyb3dzZXJPcHRpb25zLnNlcnZpY2VXb3JrZXIpIHtcbiAgICAgIHdlYnBhY2tDb25maWcucGx1Z2lucy5wdXNoKFxuICAgICAgICBuZXcgU2VydmljZVdvcmtlclBsdWdpbih7XG4gICAgICAgICAgYmFzZUhyZWY6IGJyb3dzZXJPcHRpb25zLmJhc2VIcmVmLFxuICAgICAgICAgIHJvb3Q6IGNvbnRleHQud29ya3NwYWNlUm9vdCxcbiAgICAgICAgICBwcm9qZWN0Um9vdCxcbiAgICAgICAgICBuZ3N3Q29uZmlnUGF0aDogYnJvd3Nlck9wdGlvbnMubmdzd0NvbmZpZ1BhdGgsXG4gICAgICAgIH0pLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgYnJvd3Nlck9wdGlvbnMsXG4gICAgICB3ZWJwYWNrQ29uZmlnLFxuICAgICAgcHJvamVjdFJvb3QsXG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiBmcm9tKHNldHVwKCkpLnBpcGUoXG4gICAgc3dpdGNoTWFwKCh7IGJyb3dzZXJPcHRpb25zLCB3ZWJwYWNrQ29uZmlnIH0pID0+IHtcbiAgICAgIHJldHVybiBydW5XZWJwYWNrRGV2U2VydmVyKHdlYnBhY2tDb25maWcsIGNvbnRleHQsIHtcbiAgICAgICAgbG9nZ2luZzogdHJhbnNmb3Jtcy5sb2dnaW5nIHx8IGNyZWF0ZVdlYnBhY2tMb2dnaW5nQ2FsbGJhY2soYnJvd3Nlck9wdGlvbnMsIGxvZ2dlciksXG4gICAgICAgIHdlYnBhY2tGYWN0b3J5OiByZXF1aXJlKCd3ZWJwYWNrJykgYXMgdHlwZW9mIHdlYnBhY2ssXG4gICAgICAgIHdlYnBhY2tEZXZTZXJ2ZXJGYWN0b3J5OiByZXF1aXJlKCd3ZWJwYWNrLWRldi1zZXJ2ZXInKSBhcyB0eXBlb2Ygd2VicGFja0RldlNlcnZlcixcbiAgICAgIH0pLnBpcGUoXG4gICAgICAgIGNvbmNhdE1hcChhc3luYyAoYnVpbGRFdmVudCwgaW5kZXgpID0+IHtcbiAgICAgICAgICBjb25zdCB3ZWJwYWNrUmF3U3RhdHMgPSBidWlsZEV2ZW50LndlYnBhY2tTdGF0cztcbiAgICAgICAgICBpZiAoIXdlYnBhY2tSYXdTdGF0cykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdXZWJwYWNrIHN0YXRzIGJ1aWxkIHJlc3VsdCBpcyByZXF1aXJlZC4nKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBSZXNvbHZlIHNlcnZlIGFkZHJlc3MuXG4gICAgICAgICAgY29uc3QgcHVibGljUGF0aCA9IHdlYnBhY2tDb25maWcuZGV2U2VydmVyPy5kZXZNaWRkbGV3YXJlPy5wdWJsaWNQYXRoO1xuXG4gICAgICAgICAgY29uc3Qgc2VydmVyQWRkcmVzcyA9IHVybC5mb3JtYXQoe1xuICAgICAgICAgICAgcHJvdG9jb2w6IG9wdGlvbnMuc3NsID8gJ2h0dHBzJyA6ICdodHRwJyxcbiAgICAgICAgICAgIGhvc3RuYW1lOiBvcHRpb25zLmhvc3QgPT09ICcwLjAuMC4wJyA/ICdsb2NhbGhvc3QnIDogb3B0aW9ucy5ob3N0LFxuICAgICAgICAgICAgcG9ydDogYnVpbGRFdmVudC5wb3J0LFxuICAgICAgICAgICAgcGF0aG5hbWU6IHR5cGVvZiBwdWJsaWNQYXRoID09PSAnc3RyaW5nJyA/IHB1YmxpY1BhdGggOiB1bmRlZmluZWQsXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBpZiAoaW5kZXggPT09IDApIHtcbiAgICAgICAgICAgIGxvZ2dlci5pbmZvKFxuICAgICAgICAgICAgICAnXFxuJyArXG4gICAgICAgICAgICAgICAgdGFncy5vbmVMaW5lYFxuICAgICAgICAgICAgICAqKlxuICAgICAgICAgICAgICBBbmd1bGFyIExpdmUgRGV2ZWxvcG1lbnQgU2VydmVyIGlzIGxpc3RlbmluZyBvbiAke29wdGlvbnMuaG9zdH06JHtidWlsZEV2ZW50LnBvcnR9LFxuICAgICAgICAgICAgICBvcGVuIHlvdXIgYnJvd3NlciBvbiAke3NlcnZlckFkZHJlc3N9XG4gICAgICAgICAgICAgICoqXG4gICAgICAgICAgICBgICtcbiAgICAgICAgICAgICAgICAnXFxuJyxcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIGlmIChvcHRpb25zLm9wZW4pIHtcbiAgICAgICAgICAgICAgY29uc3Qgb3BlbiA9IChhd2FpdCBpbXBvcnQoJ29wZW4nKSkuZGVmYXVsdDtcbiAgICAgICAgICAgICAgYXdhaXQgb3BlbihzZXJ2ZXJBZGRyZXNzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoYnVpbGRFdmVudC5zdWNjZXNzKSB7XG4gICAgICAgICAgICBsb2dnZXIuaW5mbyhgXFxuJHtjb2xvcnMuZ3JlZW5CcmlnaHQoY29sb3JzLnN5bWJvbHMuY2hlY2spfSBDb21waWxlZCBzdWNjZXNzZnVsbHkuYCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxvZ2dlci5pbmZvKGBcXG4ke2NvbG9ycy5yZWRCcmlnaHQoY29sb3JzLnN5bWJvbHMuY3Jvc3MpfSBGYWlsZWQgdG8gY29tcGlsZS5gKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgLi4uYnVpbGRFdmVudCxcbiAgICAgICAgICAgIGJhc2VVcmw6IHNlcnZlckFkZHJlc3MsXG4gICAgICAgICAgICBzdGF0czogZ2VuZXJhdGVCdWlsZEV2ZW50U3RhdHMod2VicGFja1Jhd1N0YXRzLCBicm93c2VyT3B0aW9ucyksXG4gICAgICAgICAgfSBhcyBEZXZTZXJ2ZXJCdWlsZGVyT3V0cHV0O1xuICAgICAgICB9KSxcbiAgICAgICk7XG4gICAgfSksXG4gICk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHNldHVwTG9jYWxpemUoXG4gIGxvY2FsZTogc3RyaW5nLFxuICBpMThuOiBJMThuT3B0aW9ucyxcbiAgYnJvd3Nlck9wdGlvbnM6IEJyb3dzZXJCdWlsZGVyU2NoZW1hLFxuICB3ZWJwYWNrQ29uZmlnOiB3ZWJwYWNrLkNvbmZpZ3VyYXRpb24sXG4gIGNhY2hlT3B0aW9uczogTm9ybWFsaXplZENhY2hlZE9wdGlvbnMsXG4gIGNvbnRleHQ6IEJ1aWxkZXJDb250ZXh0LFxuKSB7XG4gIGNvbnN0IGxvY2FsZURlc2NyaXB0aW9uID0gaTE4bi5sb2NhbGVzW2xvY2FsZV07XG5cbiAgLy8gTW9kaWZ5IG1haW4gZW50cnlwb2ludCB0byBpbmNsdWRlIGxvY2FsZSBkYXRhXG4gIGlmIChcbiAgICBsb2NhbGVEZXNjcmlwdGlvbj8uZGF0YVBhdGggJiZcbiAgICB0eXBlb2Ygd2VicGFja0NvbmZpZy5lbnRyeSA9PT0gJ29iamVjdCcgJiZcbiAgICAhQXJyYXkuaXNBcnJheSh3ZWJwYWNrQ29uZmlnLmVudHJ5KSAmJlxuICAgIHdlYnBhY2tDb25maWcuZW50cnlbJ21haW4nXVxuICApIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh3ZWJwYWNrQ29uZmlnLmVudHJ5WydtYWluJ10pKSB7XG4gICAgICB3ZWJwYWNrQ29uZmlnLmVudHJ5WydtYWluJ10udW5zaGlmdChsb2NhbGVEZXNjcmlwdGlvbi5kYXRhUGF0aCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHdlYnBhY2tDb25maWcuZW50cnlbJ21haW4nXSA9IFtcbiAgICAgICAgbG9jYWxlRGVzY3JpcHRpb24uZGF0YVBhdGgsXG4gICAgICAgIHdlYnBhY2tDb25maWcuZW50cnlbJ21haW4nXSBhcyBzdHJpbmcsXG4gICAgICBdO1xuICAgIH1cbiAgfVxuXG4gIGxldCBtaXNzaW5nVHJhbnNsYXRpb25CZWhhdmlvciA9IGJyb3dzZXJPcHRpb25zLmkxOG5NaXNzaW5nVHJhbnNsYXRpb24gfHwgJ2lnbm9yZSc7XG4gIGxldCB0cmFuc2xhdGlvbiA9IGxvY2FsZURlc2NyaXB0aW9uPy50cmFuc2xhdGlvbiB8fCB7fTtcblxuICBpZiAobG9jYWxlID09PSBpMThuLnNvdXJjZUxvY2FsZSkge1xuICAgIG1pc3NpbmdUcmFuc2xhdGlvbkJlaGF2aW9yID0gJ2lnbm9yZSc7XG4gICAgdHJhbnNsYXRpb24gPSB7fTtcbiAgfVxuXG4gIGNvbnN0IGkxOG5Mb2FkZXJPcHRpb25zID0ge1xuICAgIGxvY2FsZSxcbiAgICBtaXNzaW5nVHJhbnNsYXRpb25CZWhhdmlvcixcbiAgICB0cmFuc2xhdGlvbjogaTE4bi5zaG91bGRJbmxpbmUgPyB0cmFuc2xhdGlvbiA6IHVuZGVmaW5lZCxcbiAgICB0cmFuc2xhdGlvbkZpbGVzOiBsb2NhbGVEZXNjcmlwdGlvbj8uZmlsZXMubWFwKChmaWxlKSA9PlxuICAgICAgcGF0aC5yZXNvbHZlKGNvbnRleHQud29ya3NwYWNlUm9vdCwgZmlsZS5wYXRoKSxcbiAgICApLFxuICB9O1xuXG4gIGNvbnN0IGkxOG5SdWxlOiB3ZWJwYWNrLlJ1bGVTZXRSdWxlID0ge1xuICAgIHRlc3Q6IC9cXC5bY21dP1t0al1zeD8kLyxcbiAgICBlbmZvcmNlOiAncG9zdCcsXG4gICAgdXNlOiBbXG4gICAgICB7XG4gICAgICAgIGxvYWRlcjogcmVxdWlyZS5yZXNvbHZlKCcuLi8uLi9iYWJlbC93ZWJwYWNrLWxvYWRlcicpLFxuICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgY2FjaGVEaXJlY3Rvcnk6XG4gICAgICAgICAgICAoY2FjaGVPcHRpb25zLmVuYWJsZWQgJiYgcGF0aC5qb2luKGNhY2hlT3B0aW9ucy5wYXRoLCAnYmFiZWwtZGV2LXNlcnZlci1pMThuJykpIHx8XG4gICAgICAgICAgICBmYWxzZSxcbiAgICAgICAgICBjYWNoZUlkZW50aWZpZXI6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgIGxvY2FsZSxcbiAgICAgICAgICAgIHRyYW5zbGF0aW9uSW50ZWdyaXR5OiBsb2NhbGVEZXNjcmlwdGlvbj8uZmlsZXMubWFwKChmaWxlKSA9PiBmaWxlLmludGVncml0eSksXG4gICAgICAgICAgfSksXG4gICAgICAgICAgaTE4bjogaTE4bkxvYWRlck9wdGlvbnMsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIF0sXG4gIH07XG5cbiAgLy8gR2V0IHRoZSBydWxlcyBhbmQgZW5zdXJlIHRoZSBXZWJwYWNrIGNvbmZpZ3VyYXRpb24gaXMgc2V0dXAgcHJvcGVybHlcbiAgY29uc3QgcnVsZXMgPSB3ZWJwYWNrQ29uZmlnLm1vZHVsZT8ucnVsZXMgfHwgW107XG4gIGlmICghd2VicGFja0NvbmZpZy5tb2R1bGUpIHtcbiAgICB3ZWJwYWNrQ29uZmlnLm1vZHVsZSA9IHsgcnVsZXMgfTtcbiAgfSBlbHNlIGlmICghd2VicGFja0NvbmZpZy5tb2R1bGUucnVsZXMpIHtcbiAgICB3ZWJwYWNrQ29uZmlnLm1vZHVsZS5ydWxlcyA9IHJ1bGVzO1xuICB9XG5cbiAgcnVsZXMucHVzaChpMThuUnVsZSk7XG5cbiAgLy8gQWRkIGEgcGx1Z2luIHRvIHJlbG9hZCB0cmFuc2xhdGlvbiBmaWxlcyBvbiByZWJ1aWxkc1xuICBjb25zdCBsb2FkZXIgPSBhd2FpdCBjcmVhdGVUcmFuc2xhdGlvbkxvYWRlcigpO1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLW5vbi1udWxsLWFzc2VydGlvblxuICB3ZWJwYWNrQ29uZmlnLnBsdWdpbnMhLnB1c2goe1xuICAgIGFwcGx5OiAoY29tcGlsZXI6IHdlYnBhY2suQ29tcGlsZXIpID0+IHtcbiAgICAgIGNvbXBpbGVyLmhvb2tzLnRoaXNDb21waWxhdGlvbi50YXAoJ2J1aWxkLWFuZ3VsYXInLCAoY29tcGlsYXRpb24pID0+IHtcbiAgICAgICAgaWYgKGkxOG4uc2hvdWxkSW5saW5lICYmIGkxOG5Mb2FkZXJPcHRpb25zLnRyYW5zbGF0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAvLyBSZWxvYWQgdHJhbnNsYXRpb25zXG4gICAgICAgICAgbG9hZFRyYW5zbGF0aW9ucyhcbiAgICAgICAgICAgIGxvY2FsZSxcbiAgICAgICAgICAgIGxvY2FsZURlc2NyaXB0aW9uLFxuICAgICAgICAgICAgY29udGV4dC53b3Jrc3BhY2VSb290LFxuICAgICAgICAgICAgbG9hZGVyLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB3YXJuKG1lc3NhZ2UpIHtcbiAgICAgICAgICAgICAgICBhZGRXYXJuaW5nKGNvbXBpbGF0aW9uLCBtZXNzYWdlKTtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgZXJyb3IobWVzc2FnZSkge1xuICAgICAgICAgICAgICAgIGFkZEVycm9yKGNvbXBpbGF0aW9uLCBtZXNzYWdlKTtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB1bmRlZmluZWQsXG4gICAgICAgICAgICBicm93c2VyT3B0aW9ucy5pMThuRHVwbGljYXRlVHJhbnNsYXRpb24sXG4gICAgICAgICAgKTtcblxuICAgICAgICAgIGkxOG5Mb2FkZXJPcHRpb25zLnRyYW5zbGF0aW9uID0gbG9jYWxlRGVzY3JpcHRpb24udHJhbnNsYXRpb24gPz8ge307XG4gICAgICAgIH1cblxuICAgICAgICBjb21waWxhdGlvbi5ob29rcy5maW5pc2hNb2R1bGVzLnRhcCgnYnVpbGQtYW5ndWxhcicsICgpID0+IHtcbiAgICAgICAgICAvLyBBZnRlciBsb2FkZXJzIGFyZSBmaW5pc2hlZCwgY2xlYXIgb3V0IHRoZSBub3cgdW5uZWVkZWQgdHJhbnNsYXRpb25zXG4gICAgICAgICAgaTE4bkxvYWRlck9wdGlvbnMudHJhbnNsYXRpb24gPSB1bmRlZmluZWQ7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSxcbiAgfSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNyZWF0ZUJ1aWxkZXI8RGV2U2VydmVyQnVpbGRlck9wdGlvbnMsIERldlNlcnZlckJ1aWxkZXJPdXRwdXQ+KHNlcnZlV2VicGFja0Jyb3dzZXIpO1xuIl19