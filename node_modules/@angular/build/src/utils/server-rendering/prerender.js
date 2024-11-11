"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prerenderPages = prerenderPages;
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
const node_url_1 = require("node:url");
const piscina_1 = __importDefault(require("piscina"));
const bundler_context_1 = require("../../tools/esbuild/bundler-context");
async function prerenderPages(workspaceRoot, appShellOptions = {}, prerenderOptions = {}, outputFiles, assets, document, sourcemap = false, inlineCriticalCss = false, maxThreads = 1, verbose = false) {
    const outputFilesForWorker = {};
    const serverBundlesSourceMaps = new Map();
    const warnings = [];
    const errors = [];
    for (const { text, path, type } of outputFiles) {
        const fileExt = (0, node_path_1.extname)(path);
        if (type === bundler_context_1.BuildOutputFileType.Server && fileExt === '.map') {
            serverBundlesSourceMaps.set(path.slice(0, -4), text);
        }
        else if (type === bundler_context_1.BuildOutputFileType.Server || // Contains the server runnable application code
            (type === bundler_context_1.BuildOutputFileType.Browser && fileExt === '.css') // Global styles for critical CSS inlining.
        ) {
            outputFilesForWorker[path] = text;
        }
    }
    // Inline sourcemap into JS file. This is needed to make Node.js resolve sourcemaps
    // when using `--enable-source-maps` when using in memory files.
    for (const [filePath, map] of serverBundlesSourceMaps) {
        const jsContent = outputFilesForWorker[filePath];
        if (jsContent) {
            outputFilesForWorker[filePath] =
                jsContent +
                    `\n//# sourceMappingURL=` +
                    `data:application/json;base64,${Buffer.from(map).toString('base64')}`;
        }
    }
    serverBundlesSourceMaps.clear();
    const assetsReversed = {};
    for (const { source, destination } of assets) {
        assetsReversed[addLeadingSlash(destination.replace(/\\/g, node_path_1.posix.sep))] = source;
    }
    // Get routes to prerender
    const { routes: allRoutes, warnings: routesWarnings, errors: routesErrors, } = await getAllRoutes(workspaceRoot, outputFilesForWorker, assetsReversed, document, appShellOptions, prerenderOptions, sourcemap, verbose);
    if (routesErrors?.length) {
        errors.push(...routesErrors);
    }
    if (routesWarnings?.length) {
        warnings.push(...routesWarnings);
    }
    if (allRoutes.size < 1 || errors.length > 0) {
        return {
            errors,
            warnings,
            output: {},
            prerenderedRoutes: allRoutes,
        };
    }
    // Render routes
    const { warnings: renderingWarnings, errors: renderingErrors, output, } = await renderPages(sourcemap, allRoutes, maxThreads, workspaceRoot, outputFilesForWorker, assetsReversed, inlineCriticalCss, document, appShellOptions);
    errors.push(...renderingErrors);
    warnings.push(...renderingWarnings);
    return {
        errors,
        warnings,
        output,
        prerenderedRoutes: allRoutes,
    };
}
class RoutesSet extends Set {
    add(value) {
        return super.add(addLeadingSlash(value));
    }
}
async function renderPages(sourcemap, allRoutes, maxThreads, workspaceRoot, outputFilesForWorker, assetFilesForWorker, inlineCriticalCss, document, appShellOptions) {
    const output = {};
    const warnings = [];
    const errors = [];
    const workerExecArgv = [
        '--import',
        // Loader cannot be an absolute path on Windows.
        (0, node_url_1.pathToFileURL)((0, node_path_1.join)(__dirname, 'esm-in-memory-loader/register-hooks.js')).href,
    ];
    if (sourcemap) {
        workerExecArgv.push('--enable-source-maps');
    }
    const renderWorker = new piscina_1.default({
        filename: require.resolve('./render-worker'),
        maxThreads: Math.min(allRoutes.size, maxThreads),
        workerData: {
            workspaceRoot,
            outputFiles: outputFilesForWorker,
            assetFiles: assetFilesForWorker,
            inlineCriticalCss,
            document,
        },
        execArgv: workerExecArgv,
        recordTiming: false,
    });
    try {
        const renderingPromises = [];
        const appShellRoute = appShellOptions.route && addLeadingSlash(appShellOptions.route);
        for (const route of allRoutes) {
            const isAppShellRoute = appShellRoute === route;
            const serverContext = isAppShellRoute ? 'app-shell' : 'ssg';
            const render = renderWorker.run({ route, serverContext });
            const renderResult = render
                .then(({ content, warnings, errors }) => {
                if (content !== undefined) {
                    const outPath = isAppShellRoute
                        ? 'index.html'
                        : node_path_1.posix.join(removeLeadingSlash(route), 'index.html');
                    output[outPath] = content;
                }
                if (warnings) {
                    warnings.push(...warnings);
                }
                if (errors) {
                    errors.push(...errors);
                }
            })
                .catch((err) => {
                errors.push(`An error occurred while prerendering route '${route}'.\n\n${err.stack}`);
                void renderWorker.destroy();
            });
            renderingPromises.push(renderResult);
        }
        await Promise.all(renderingPromises);
    }
    finally {
        void renderWorker.destroy();
    }
    return {
        errors,
        warnings,
        output,
    };
}
async function getAllRoutes(workspaceRoot, outputFilesForWorker, assetFilesForWorker, document, appShellOptions, prerenderOptions, sourcemap, verbose) {
    const { routesFile, discoverRoutes } = prerenderOptions;
    const routes = new RoutesSet();
    const { route: appShellRoute } = appShellOptions;
    if (appShellRoute !== undefined) {
        routes.add(appShellRoute);
    }
    if (routesFile) {
        const routesFromFile = (await (0, promises_1.readFile)(routesFile, 'utf8')).split(/\r?\n/);
        for (const route of routesFromFile) {
            routes.add(route.trim());
        }
    }
    if (!discoverRoutes) {
        return { routes };
    }
    const workerExecArgv = [
        '--import',
        // Loader cannot be an absolute path on Windows.
        (0, node_url_1.pathToFileURL)((0, node_path_1.join)(__dirname, 'esm-in-memory-loader/register-hooks.js')).href,
    ];
    if (sourcemap) {
        workerExecArgv.push('--enable-source-maps');
    }
    const renderWorker = new piscina_1.default({
        filename: require.resolve('./routes-extractor-worker'),
        maxThreads: 1,
        workerData: {
            workspaceRoot,
            outputFiles: outputFilesForWorker,
            assetFiles: assetFilesForWorker,
            document,
            verbose,
        },
        execArgv: workerExecArgv,
        recordTiming: false,
    });
    const errors = [];
    const { routes: extractedRoutes, warnings } = await renderWorker
        .run({})
        .catch((err) => {
        errors.push(`An error occurred while extracting routes.\n\n${err.stack}`);
    })
        .finally(() => {
        void renderWorker.destroy();
    });
    for (const route of extractedRoutes) {
        routes.add(route);
    }
    return { routes, warnings, errors };
}
function addLeadingSlash(value) {
    return value.charAt(0) === '/' ? value : '/' + value;
}
function removeLeadingSlash(value) {
    return value.charAt(0) === '/' ? value.slice(1) : value;
}
