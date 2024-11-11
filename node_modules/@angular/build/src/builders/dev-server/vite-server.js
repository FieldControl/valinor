"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
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
exports.serveWithVite = serveWithVite;
exports.setupServer = setupServer;
const node_assert_1 = __importDefault(require("node:assert"));
const promises_1 = require("node:fs/promises");
const node_module_1 = require("node:module");
const node_path_1 = require("node:path");
const angular_memory_plugin_1 = require("../../tools/vite/angular-memory-plugin");
const i18n_locale_plugin_1 = require("../../tools/vite/i18n-locale-plugin");
const id_prefix_plugin_1 = require("../../tools/vite/id-prefix-plugin");
const utils_1 = require("../../utils");
const load_esm_1 = require("../../utils/load-esm");
const results_1 = require("../application/results");
const internal_1 = require("./internal");
/**
 * Build options that are also present on the dev server but are only passed
 * to the build.
 */
const CONVENIENCE_BUILD_OPTIONS = ['watch', 'poll', 'verbose'];
// eslint-disable-next-line max-lines-per-function
async function* serveWithVite(serverOptions, builderName, builderAction, context, transformers, extensions) {
    // Get the browser configuration from the target name.
    const rawBrowserOptions = await context.getTargetOptions(serverOptions.buildTarget);
    // Deploy url is not used in the dev-server.
    delete rawBrowserOptions.deployUrl;
    // Copy convenience options to build
    for (const optionName of CONVENIENCE_BUILD_OPTIONS) {
        const optionValue = serverOptions[optionName];
        if (optionValue !== undefined) {
            rawBrowserOptions[optionName] = optionValue;
        }
    }
    // TODO: Adjust architect to not force a JsonObject derived return type
    const browserOptions = (await context.validateOptions(rawBrowserOptions, builderName));
    if (browserOptions.prerender || browserOptions.ssr) {
        // Disable prerendering if enabled and force SSR.
        // This is so instead of prerendering all the routes for every change, the page is "prerendered" when it is requested.
        browserOptions.prerender = false;
        // Avoid bundling and processing the ssr entry-point as this is not used by the dev-server.
        browserOptions.ssr = true;
        // https://nodejs.org/api/process.html#processsetsourcemapsenabledval
        process.setSourceMapsEnabled(true);
    }
    // Set all packages as external to support Vite's prebundle caching
    browserOptions.externalPackages = serverOptions.prebundle;
    // The development server currently only supports a single locale when localizing.
    // This matches the behavior of the Webpack-based development server but could be expanded in the future.
    if (browserOptions.localize === true ||
        (Array.isArray(browserOptions.localize) && browserOptions.localize.length > 1)) {
        context.logger.warn('Localization (`localize` option) has been disabled. The development server only supports localizing a single locale per build.');
        browserOptions.localize = false;
    }
    else if (browserOptions.localize) {
        // When localization is enabled with a single locale, force a flat path to maintain behavior with the existing Webpack-based dev server.
        browserOptions.forceI18nFlatOutput = true;
    }
    const { vendor: thirdPartySourcemaps } = (0, utils_1.normalizeSourceMaps)(browserOptions.sourceMap ?? false);
    // Setup the prebundling transformer that will be shared across Vite prebundling requests
    const prebundleTransformer = new internal_1.JavaScriptTransformer(
    // Always enable JIT linking to support applications built with and without AOT.
    // In a development environment the additional scope information does not
    // have a negative effect unlike production where final output size is relevant.
    { sourcemap: true, jit: true, thirdPartySourcemaps }, 1);
    // The index HTML path will be updated from the build results if provided by the builder
    let htmlIndexPath = 'index.html';
    // dynamically import Vite for ESM compatibility
    const { createServer, normalizePath } = await (0, load_esm_1.loadEsmModule)('vite');
    let server;
    let serverUrl;
    let hadError = false;
    const generatedFiles = new Map();
    const assetFiles = new Map();
    const externalMetadata = {
        implicitBrowser: [],
        implicitServer: [],
        explicitBrowser: [],
        explicitServer: [],
    };
    // Add cleanup logic via a builder teardown.
    let deferred;
    context.addTeardown(async () => {
        await server?.close();
        await prebundleTransformer.close();
        deferred?.();
    });
    // TODO: Switch this to an architect schedule call when infrastructure settings are supported
    for await (const result of builderAction(browserOptions, context, extensions?.buildPlugins)) {
        switch (result.kind) {
            case results_1.ResultKind.Failure:
                if (result.errors.length && server) {
                    hadError = true;
                    server.hot.send({
                        type: 'error',
                        err: {
                            message: result.errors[0].text,
                            stack: '',
                            loc: result.errors[0].location ?? undefined,
                        },
                    });
                }
                continue;
            case results_1.ResultKind.Full:
                if (result.detail?.['htmlIndexPath']) {
                    htmlIndexPath = result.detail['htmlIndexPath'];
                }
                if (serverOptions.servePath === undefined && result.detail?.['htmlBaseHref']) {
                    const baseHref = result.detail['htmlBaseHref'];
                    // Remove trailing slash
                    serverOptions.servePath =
                        baseHref !== './' && baseHref[baseHref.length - 1] === '/'
                            ? baseHref.slice(0, -1)
                            : baseHref;
                }
                assetFiles.clear();
                for (const [outputPath, file] of Object.entries(result.files)) {
                    if (file.origin === 'disk') {
                        assetFiles.set('/' + normalizePath(outputPath), normalizePath(file.inputPath));
                    }
                }
                // Analyze result files for changes
                analyzeResultFiles(normalizePath, htmlIndexPath, result.files, generatedFiles);
                break;
            case results_1.ResultKind.Incremental:
                (0, node_assert_1.default)(server, 'Builder must provide an initial full build before incremental results.');
                // TODO: Implement support -- application builder currently does not use
                break;
            case results_1.ResultKind.ComponentUpdate:
                (0, node_assert_1.default)(serverOptions.hmr, 'Component updates are only supported with HMR enabled.');
                // TODO: Implement support -- application builder currently does not use
                break;
            default:
                context.logger.warn(`Unknown result kind [${result.kind}] provided by build.`);
                continue;
        }
        // Clear existing error overlay on successful result
        if (hadError && server) {
            hadError = false;
            // Send an empty update to clear the error overlay
            server.hot.send({
                'type': 'update',
                updates: [],
            });
        }
        // To avoid disconnecting the array objects from the option, these arrays need to be mutated instead of replaced.
        let requiresServerRestart = false;
        if (result.detail?.['externalMetadata']) {
            const { implicitBrowser, implicitServer, explicit } = result.detail['externalMetadata'];
            const implicitServerFiltered = implicitServer.filter((m) => removeNodeJsBuiltinModules(m) && removeAbsoluteUrls(m));
            const implicitBrowserFiltered = implicitBrowser.filter(removeAbsoluteUrls);
            if (browserOptions.ssr && serverOptions.prebundle !== false) {
                const previousImplicitServer = new Set(externalMetadata.implicitServer);
                // Restart the server to force SSR dep re-optimization when a dependency has been added.
                // This is a workaround for: https://github.com/vitejs/vite/issues/14896
                requiresServerRestart = implicitServerFiltered.some((dep) => !previousImplicitServer.has(dep));
            }
            // Empty Arrays to avoid growing unlimited with every re-build.
            externalMetadata.explicitBrowser.length = 0;
            externalMetadata.explicitServer.length = 0;
            externalMetadata.implicitServer.length = 0;
            externalMetadata.implicitBrowser.length = 0;
            externalMetadata.explicitBrowser.push(...explicit);
            externalMetadata.explicitServer.push(...explicit, ...nodeJsBuiltinModules);
            externalMetadata.implicitServer.push(...implicitServerFiltered);
            externalMetadata.implicitBrowser.push(...implicitBrowserFiltered);
            // The below needs to be sorted as Vite uses these options are part of the hashing invalidation algorithm.
            // See: https://github.com/vitejs/vite/blob/0873bae0cfe0f0718ad2f5743dd34a17e4ab563d/packages/vite/src/node/optimizer/index.ts#L1203-L1239
            externalMetadata.explicitBrowser.sort();
            externalMetadata.explicitServer.sort();
            externalMetadata.implicitServer.sort();
            externalMetadata.implicitBrowser.sort();
        }
        if (server) {
            // Update fs allow list to include any new assets from the build option.
            server.config.server.fs.allow = [
                ...new Set([...server.config.server.fs.allow, ...assetFiles.values()]),
            ];
            handleUpdate(normalizePath, generatedFiles, server, serverOptions, context.logger);
            if (requiresServerRestart) {
                // Restart the server to force SSR dep re-optimization when a dependency has been added.
                // This is a workaround for: https://github.com/vitejs/vite/issues/14896
                await server.restart();
            }
        }
        else {
            const projectName = context.target?.project;
            if (!projectName) {
                throw new Error('The builder requires a target.');
            }
            context.logger.info('NOTE: Raw file sizes do not reflect development server per-request transformations.');
            if (browserOptions.ssr && serverOptions.inspect) {
                const { host, port } = serverOptions.inspect;
                const { default: inspector } = await Promise.resolve().then(() => __importStar(require('node:inspector')));
                inspector.open(port, host, true);
                context.addTeardown(() => inspector.close());
            }
            const { root = '' } = await context.getProjectMetadata(projectName);
            const projectRoot = (0, node_path_1.join)(context.workspaceRoot, root);
            const browsers = (0, internal_1.getSupportedBrowsers)(projectRoot, context.logger);
            const target = (0, internal_1.transformSupportedBrowsersToTargets)(browsers);
            // Needed for browser-esbuild as polyfills can be a string.
            const polyfills = Array.isArray((browserOptions.polyfills ??= []))
                ? browserOptions.polyfills
                : [browserOptions.polyfills];
            // Setup server and start listening
            const serverConfiguration = await setupServer(serverOptions, generatedFiles, assetFiles, browserOptions.preserveSymlinks, externalMetadata, !!browserOptions.ssr, prebundleTransformer, target, (0, internal_1.isZonelessApp)(polyfills), browserOptions.loader, extensions?.middleware, transformers?.indexHtml, thirdPartySourcemaps);
            server = await createServer(serverConfiguration);
            await server.listen();
            if (browserOptions.ssr && serverOptions.prebundle !== false) {
                // Warm up the SSR request and begin optimizing dependencies.
                // Without this, Vite will only start optimizing SSR modules when the first request is made.
                void server.warmupRequest('./main.server.mjs', { ssr: true });
            }
            const urls = server.resolvedUrls;
            if (urls && (urls.local.length || urls.network.length)) {
                serverUrl = new URL(urls.local[0] ?? urls.network[0]);
            }
            // log connection information
            server.printUrls();
            server.bindCLIShortcuts({
                print: true,
                customShortcuts: [
                    {
                        key: 'r',
                        description: 'force reload browser',
                        action(server) {
                            server.hot.send({
                                type: 'full-reload',
                                path: '*',
                            });
                        },
                    },
                ],
            });
        }
        // TODO: adjust output typings to reflect both development servers
        yield {
            success: true,
            port: serverUrl?.port,
            baseUrl: serverUrl?.href,
        };
    }
    await new Promise((resolve) => (deferred = resolve));
}
function handleUpdate(normalizePath, generatedFiles, server, serverOptions, logger) {
    const updatedFiles = [];
    // Invalidate any updated files
    for (const [file, record] of generatedFiles) {
        if (record.updated) {
            updatedFiles.push(file);
            const updatedModules = server.moduleGraph.getModulesByFile(normalizePath((0, node_path_1.join)(server.config.root, file)));
            updatedModules?.forEach((m) => server?.moduleGraph.invalidateModule(m));
        }
    }
    if (!updatedFiles.length) {
        return;
    }
    if (serverOptions.liveReload || serverOptions.hmr) {
        if (updatedFiles.every((f) => f.endsWith('.css'))) {
            const timestamp = Date.now();
            server.hot.send({
                type: 'update',
                updates: updatedFiles.map((filePath) => {
                    return {
                        type: 'css-update',
                        timestamp,
                        path: filePath,
                        acceptedPath: filePath,
                    };
                }),
            });
            logger.info('HMR update sent to client(s).');
            return;
        }
    }
    // Send reload command to clients
    if (serverOptions.liveReload) {
        server.hot.send({
            type: 'full-reload',
            path: '*',
        });
        logger.info('Page reload sent to client(s).');
    }
}
function analyzeResultFiles(normalizePath, htmlIndexPath, resultFiles, generatedFiles) {
    const seen = new Set(['/index.html']);
    for (const [outputPath, file] of Object.entries(resultFiles)) {
        if (file.origin === 'disk') {
            continue;
        }
        let filePath;
        if (outputPath === htmlIndexPath) {
            // Convert custom index output path to standard index path for dev-server usage.
            // This mimics the Webpack dev-server behavior.
            filePath = '/index.html';
        }
        else {
            filePath = '/' + normalizePath(outputPath);
        }
        seen.add(filePath);
        const servable = file.type === internal_1.BuildOutputFileType.Browser || file.type === internal_1.BuildOutputFileType.Media;
        // Skip analysis of sourcemaps
        if (filePath.endsWith('.map')) {
            generatedFiles.set(filePath, {
                contents: file.contents,
                servable,
                size: file.contents.byteLength,
                updated: false,
            });
            continue;
        }
        const existingRecord = generatedFiles.get(filePath);
        if (existingRecord &&
            existingRecord.size === file.contents.byteLength &&
            existingRecord.hash === file.hash) {
            // Same file
            existingRecord.updated = false;
            continue;
        }
        // New or updated file
        generatedFiles.set(filePath, {
            contents: file.contents,
            size: file.contents.byteLength,
            hash: file.hash,
            updated: true,
            servable,
        });
    }
    // Clear stale output files
    for (const file of generatedFiles.keys()) {
        if (!seen.has(file)) {
            generatedFiles.delete(file);
        }
    }
}
async function setupServer(serverOptions, outputFiles, assets, preserveSymlinks, externalMetadata, ssr, prebundleTransformer, target, zoneless, prebundleLoaderExtensions, extensionMiddleware, indexHtmlTransformer, thirdPartySourcemaps = false) {
    const proxy = await (0, utils_1.loadProxyConfiguration)(serverOptions.workspaceRoot, serverOptions.proxyConfig);
    // dynamically import Vite for ESM compatibility
    const { normalizePath } = await (0, load_esm_1.loadEsmModule)('vite');
    // Path will not exist on disk and only used to provide separate path for Vite requests
    const virtualProjectRoot = normalizePath((0, node_path_1.join)(serverOptions.workspaceRoot, `.angular/vite-root`, serverOptions.buildTarget.project));
    const cacheDir = (0, node_path_1.join)(serverOptions.cacheOptions.path, serverOptions.buildTarget.project, 'vite');
    const configuration = {
        configFile: false,
        envFile: false,
        cacheDir,
        root: virtualProjectRoot,
        publicDir: false,
        esbuild: false,
        mode: 'development',
        // We use custom as we do not rely on Vite's htmlFallbackMiddleware and indexHtmlMiddleware.
        appType: 'custom',
        css: {
            devSourcemap: true,
        },
        // Ensure custom 'file' loader build option entries are handled by Vite in application code that
        // reference third-party libraries. Relative usage is handled directly by the build and not Vite.
        // Only 'file' loader entries are currently supported directly by Vite.
        assetsInclude: prebundleLoaderExtensions &&
            Object.entries(prebundleLoaderExtensions)
                .filter(([, value]) => value === 'file')
                // Create a file extension glob for each key
                .map(([key]) => '*' + key),
        // Vite will normalize the `base` option by adding a leading slash.
        base: serverOptions.servePath,
        resolve: {
            mainFields: ['es2020', 'browser', 'module', 'main'],
            preserveSymlinks,
        },
        server: {
            port: serverOptions.port,
            strictPort: true,
            host: serverOptions.host,
            open: serverOptions.open,
            headers: serverOptions.headers,
            proxy,
            cors: {
                // Allow preflight requests to be proxied.
                preflightContinue: true,
            },
            // File watching is handled by the build directly. `null` disables file watching for Vite.
            watch: null,
            fs: {
                // Ensure cache directory, node modules, and all assets are accessible by the client.
                // The first two are required for Vite to function in prebundling mode (the default) and to load
                // the Vite client-side code for browser reloading. These would be available by default but when
                // the `allow` option is explicitly configured, they must be included manually.
                allow: [cacheDir, (0, node_path_1.join)(serverOptions.workspaceRoot, 'node_modules'), ...assets.values()],
                // Temporary disable cached FS checks.
                // This is because we configure `config.base` to a virtual directory which causes `getRealPath` to fail.
                // See: https://github.com/vitejs/vite/blob/b2873ac3936de25ca8784327cb9ef16bd4881805/packages/vite/src/node/fsUtils.ts#L45-L67
                cachedChecks: false,
            },
            // This is needed when `externalDependencies` is used to prevent Vite load errors.
            // NOTE: If Vite adds direct support for externals, this can be removed.
            preTransformRequests: externalMetadata.explicitBrowser.length === 0,
        },
        ssr: {
            // Note: `true` and `/.*/` have different sematics. When true, the `external` option is ignored.
            noExternal: /.*/,
            // Exclude any Node.js built in module and provided dependencies (currently build defined externals)
            external: externalMetadata.explicitServer,
            optimizeDeps: getDepOptimizationConfig({
                // Only enable with caching since it causes prebundle dependencies to be cached
                disabled: serverOptions.prebundle === false,
                // Exclude any explicitly defined dependencies (currently build defined externals and node.js built-ins)
                exclude: externalMetadata.explicitServer,
                // Include all implict dependencies from the external packages internal option
                include: externalMetadata.implicitServer,
                ssr: true,
                prebundleTransformer,
                zoneless,
                target,
                loader: prebundleLoaderExtensions,
                thirdPartySourcemaps,
            }),
        },
        plugins: [
            (0, i18n_locale_plugin_1.createAngularLocaleDataPlugin)(),
            (0, angular_memory_plugin_1.createAngularMemoryPlugin)({
                workspaceRoot: serverOptions.workspaceRoot,
                virtualProjectRoot,
                outputFiles,
                assets,
                ssr,
                external: externalMetadata.explicitBrowser,
                indexHtmlTransformer,
                extensionMiddleware,
                normalizePath,
            }),
            (0, id_prefix_plugin_1.createRemoveIdPrefixPlugin)(externalMetadata.explicitBrowser),
        ],
        // Browser only optimizeDeps. (This does not run for SSR dependencies).
        optimizeDeps: getDepOptimizationConfig({
            // Only enable with caching since it causes prebundle dependencies to be cached
            disabled: serverOptions.prebundle === false,
            // Exclude any explicitly defined dependencies (currently build defined externals)
            exclude: externalMetadata.explicitBrowser,
            // Include all implict dependencies from the external packages internal option
            include: externalMetadata.implicitBrowser,
            ssr: false,
            prebundleTransformer,
            target,
            zoneless,
            loader: prebundleLoaderExtensions,
            thirdPartySourcemaps,
        }),
    };
    if (serverOptions.ssl) {
        if (serverOptions.sslCert && serverOptions.sslKey) {
            // server configuration is defined above
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            configuration.server.https = {
                cert: await (0, promises_1.readFile)(serverOptions.sslCert),
                key: await (0, promises_1.readFile)(serverOptions.sslKey),
            };
        }
        else {
            const { default: basicSslPlugin } = await Promise.resolve().then(() => __importStar(require('@vitejs/plugin-basic-ssl')));
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            configuration.plugins ??= [];
            configuration.plugins.push(basicSslPlugin());
        }
    }
    return configuration;
}
function getDepOptimizationConfig({ disabled, exclude, include, target, zoneless, prebundleTransformer, ssr, loader, thirdPartySourcemaps, }) {
    const plugins = [
        {
            name: `angular-vite-optimize-deps${ssr ? '-ssr' : ''}${thirdPartySourcemaps ? '-vendor-sourcemap' : ''}`,
            setup(build) {
                build.onLoad({ filter: /\.[cm]?js$/ }, async (args) => {
                    return {
                        contents: await prebundleTransformer.transformFile(args.path),
                        loader: 'js',
                    };
                });
            },
        },
    ];
    return {
        // Exclude any explicitly defined dependencies (currently build defined externals)
        exclude,
        // NB: to disable the deps optimizer, set optimizeDeps.noDiscovery to true and optimizeDeps.include as undefined.
        // Include all implict dependencies from the external packages internal option
        include: disabled ? undefined : include,
        noDiscovery: disabled,
        // Add an esbuild plugin to run the Angular linker on dependencies
        esbuildOptions: {
            // Set esbuild supported targets.
            target,
            supported: (0, internal_1.getFeatureSupport)(target, zoneless),
            plugins,
            loader,
            resolveExtensions: ['.mjs', '.js', '.cjs'],
        },
    };
}
const nodeJsBuiltinModules = new Set(node_module_1.builtinModules);
/** Remove any Node.js builtin modules to avoid Vite's prebundling from processing them as files. */
function removeNodeJsBuiltinModules(value) {
    return !nodeJsBuiltinModules.has(value);
}
/** Remove any absolute URLs (http://, https://, //) to avoid Vite's prebundling from processing them as files. */
function removeAbsoluteUrls(value) {
    return !/^(?:https?:)?\/\//.test(value);
}
