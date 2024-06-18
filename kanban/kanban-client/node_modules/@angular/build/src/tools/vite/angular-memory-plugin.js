"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAngularMemoryPlugin = void 0;
const remapping_1 = __importDefault(require("@ampproject/remapping"));
const mrmime_1 = require("mrmime");
const node_assert_1 = __importDefault(require("node:assert"));
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
const render_page_1 = require("../../utils/server-rendering/render-page");
// eslint-disable-next-line max-lines-per-function
function createAngularMemoryPlugin(options) {
    const { workspaceRoot, virtualProjectRoot, outputFiles, assets, external, ssr, extensionMiddleware, extraHeaders, indexHtmlTransformer, normalizePath, } = options;
    return {
        name: 'vite:angular-memory',
        // Ensures plugin hooks run before built-in Vite hooks
        enforce: 'pre',
        async resolveId(source, importer) {
            // Prevent vite from resolving an explicit external dependency (`externalDependencies` option)
            if (external?.includes(source)) {
                // This is still not ideal since Vite will still transform the import specifier to
                // `/@id/${source}` but is currently closer to a raw external than a resolved file path.
                return source;
            }
            if (importer && source[0] === '.' && importer.startsWith(virtualProjectRoot)) {
                // Remove query if present
                const [importerFile] = importer.split('?', 1);
                source =
                    '/' + normalizePath((0, node_path_1.join)((0, node_path_1.dirname)((0, node_path_1.relative)(virtualProjectRoot, importerFile)), source));
            }
            const [file] = source.split('?', 1);
            if (outputFiles.has(file)) {
                return (0, node_path_1.join)(virtualProjectRoot, source);
            }
        },
        async load(id) {
            const [file] = id.split('?', 1);
            const relativeFile = '/' + normalizePath((0, node_path_1.relative)(virtualProjectRoot, file));
            const codeContents = outputFiles.get(relativeFile)?.contents;
            if (codeContents === undefined) {
                if (relativeFile.endsWith('/node_modules/vite/dist/client/client.mjs')) {
                    return {
                        code: await loadViteClientCode(file),
                        map: await (0, promises_1.readFile)(file + '.map', 'utf-8'),
                    };
                }
                return;
            }
            const code = Buffer.from(codeContents).toString('utf-8');
            const mapContents = outputFiles.get(relativeFile + '.map')?.contents;
            return {
                // Remove source map URL comments from the code if a sourcemap is present.
                // Vite will inline and add an additional sourcemap URL for the sourcemap.
                code: mapContents ? code.replace(/^\/\/# sourceMappingURL=[^\r\n]*/gm, '') : code,
                map: mapContents && Buffer.from(mapContents).toString('utf-8'),
            };
        },
        // eslint-disable-next-line max-lines-per-function
        configureServer(server) {
            const originalssrTransform = server.ssrTransform;
            server.ssrTransform = async (code, map, url, originalCode) => {
                const result = await originalssrTransform(code, null, url, originalCode);
                if (!result || !result.map || !map) {
                    return result;
                }
                const remappedMap = (0, remapping_1.default)([result.map, map], () => null);
                // Set the sourcemap root to the workspace root. This is needed since we set a virtual path as root.
                remappedMap.sourceRoot = normalizePath(workspaceRoot) + '/';
                return {
                    ...result,
                    map: remappedMap,
                };
            };
            // Assets and resources get handled first
            server.middlewares.use(function angularAssetsMiddleware(req, res, next) {
                if (req.url === undefined || res.writableEnded) {
                    return;
                }
                // Parse the incoming request.
                // The base of the URL is unused but required to parse the URL.
                const pathname = pathnameWithoutBasePath(req.url, server.config.base);
                const extension = (0, node_path_1.extname)(pathname);
                // Rewrite all build assets to a vite raw fs URL
                const assetSourcePath = assets.get(pathname);
                if (assetSourcePath !== undefined) {
                    // Workaround to disable Vite transformer middleware.
                    // See: https://github.com/vitejs/vite/blob/746a1daab0395f98f0afbdee8f364cb6cf2f3b3f/packages/vite/src/node/server/middlewares/transform.ts#L201 and
                    // https://github.com/vitejs/vite/blob/746a1daab0395f98f0afbdee8f364cb6cf2f3b3f/packages/vite/src/node/server/transformRequest.ts#L204-L206
                    req.headers.accept = 'text/html';
                    // The encoding needs to match what happens in the vite static middleware.
                    // ref: https://github.com/vitejs/vite/blob/d4f13bd81468961c8c926438e815ab6b1c82735e/packages/vite/src/node/server/middlewares/static.ts#L163
                    req.url = `${server.config.base}@fs/${encodeURI(assetSourcePath)}`;
                    next();
                    return;
                }
                // HTML fallbacking
                // This matches what happens in the vite html fallback middleware.
                // ref: https://github.com/vitejs/vite/blob/main/packages/vite/src/node/server/middlewares/htmlFallback.ts#L9
                const htmlAssetSourcePath = pathname[pathname.length - 1] === '/'
                    ? // Trailing slash check for `index.html`.
                        assets.get(pathname + 'index.html')
                    : // Non-trailing slash check for fallback `.html`
                        assets.get(pathname + '.html');
                if (htmlAssetSourcePath) {
                    req.url = `${server.config.base}@fs/${encodeURI(htmlAssetSourcePath)}`;
                    next();
                    return;
                }
                // Resource files are handled directly.
                // Global stylesheets (CSS files) are currently considered resources to workaround
                // dev server sourcemap issues with stylesheets.
                if (extension !== '.js' && extension !== '.html') {
                    const outputFile = outputFiles.get(pathname);
                    if (outputFile?.servable) {
                        const mimeType = (0, mrmime_1.lookup)(extension);
                        if (mimeType) {
                            res.setHeader('Content-Type', mimeType);
                        }
                        res.setHeader('Cache-Control', 'no-cache');
                        if (extraHeaders) {
                            Object.entries(extraHeaders).forEach(([name, value]) => res.setHeader(name, value));
                        }
                        res.end(outputFile.contents);
                        return;
                    }
                }
                next();
            });
            if (extensionMiddleware?.length) {
                extensionMiddleware.forEach((middleware) => server.middlewares.use(middleware));
            }
            // Returning a function, installs middleware after the main transform middleware but
            // before the built-in HTML middleware
            return () => {
                server.middlewares.use(angularHtmlFallbackMiddleware);
                function angularSSRMiddleware(req, res, next) {
                    const url = req.originalUrl;
                    if (!req.url ||
                        // Skip if path is not defined.
                        !url ||
                        // Skip if path is like a file.
                        // NOTE: We use a mime type lookup to mitigate against matching requests like: /browse/pl.0ef59752c0cd457dbf1391f08cbd936f
                        lookupMimeTypeFromRequest(url)) {
                        next();
                        return;
                    }
                    const rawHtml = outputFiles.get('/index.server.html')?.contents;
                    if (!rawHtml) {
                        next();
                        return;
                    }
                    transformIndexHtmlAndAddHeaders(req.url, rawHtml, res, next, async (html) => {
                        const resolvedUrls = server.resolvedUrls;
                        const baseUrl = resolvedUrls?.local[0] ?? resolvedUrls?.network[0];
                        const { content } = await (0, render_page_1.renderPage)({
                            document: html,
                            route: new URL(req.originalUrl ?? '/', baseUrl).toString(),
                            serverContext: 'ssr',
                            loadBundle: (uri) => 
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            server.ssrLoadModule(uri.slice(1)),
                            // Files here are only needed for critical CSS inlining.
                            outputFiles: {},
                            // TODO: add support for critical css inlining.
                            inlineCriticalCss: false,
                        });
                        return indexHtmlTransformer && content ? await indexHtmlTransformer(content) : content;
                    });
                }
                if (ssr) {
                    server.middlewares.use(angularSSRMiddleware);
                }
                server.middlewares.use(function angularIndexMiddleware(req, res, next) {
                    if (!req.url) {
                        next();
                        return;
                    }
                    // Parse the incoming request.
                    // The base of the URL is unused but required to parse the URL.
                    const pathname = pathnameWithoutBasePath(req.url, server.config.base);
                    if (pathname === '/' || pathname === `/index.html`) {
                        const rawHtml = outputFiles.get('/index.html')?.contents;
                        if (rawHtml) {
                            transformIndexHtmlAndAddHeaders(req.url, rawHtml, res, next, indexHtmlTransformer);
                            return;
                        }
                    }
                    next();
                });
            };
            function transformIndexHtmlAndAddHeaders(url, rawHtml, res, next, additionalTransformer) {
                server
                    .transformIndexHtml(url, Buffer.from(rawHtml).toString('utf-8'))
                    .then(async (processedHtml) => {
                    if (additionalTransformer) {
                        const content = await additionalTransformer(processedHtml);
                        if (!content) {
                            next();
                            return;
                        }
                        processedHtml = content;
                    }
                    res.setHeader('Content-Type', 'text/html');
                    res.setHeader('Cache-Control', 'no-cache');
                    if (extraHeaders) {
                        Object.entries(extraHeaders).forEach(([name, value]) => res.setHeader(name, value));
                    }
                    res.end(processedHtml);
                })
                    .catch((error) => next(error));
            }
        },
    };
}
exports.createAngularMemoryPlugin = createAngularMemoryPlugin;
/**
 * Reads the resolved Vite client code from disk and updates the content to remove
 * an unactionable suggestion to update the Vite configuration file to disable the
 * error overlay. The Vite configuration file is not present when used in the Angular
 * CLI.
 * @param file The absolute path to the Vite client code.
 * @returns
 */
async function loadViteClientCode(file) {
    const originalContents = await (0, promises_1.readFile)(file, 'utf-8');
    const updatedContents = originalContents.replace(`h('br'), 'You can also disable this overlay by setting ', ` +
        `h('code', { part: 'config-option-name' }, 'server.hmr.overlay'), '` +
        ` to ', h('code', { part: 'config-option-value' }, 'false'), ' in ', h('code', { part: 'config-file-name' }, hmrConfigName), '.'`, '');
    (0, node_assert_1.default)(originalContents !== updatedContents, 'Failed to update Vite client error overlay text.');
    return updatedContents;
}
function pathnameWithoutBasePath(url, basePath) {
    const parsedUrl = new URL(url, 'http://localhost');
    const pathname = decodeURIComponent(parsedUrl.pathname);
    // slice(basePath.length - 1) to retain the trailing slash
    return basePath !== '/' && pathname.startsWith(basePath)
        ? pathname.slice(basePath.length - 1)
        : pathname;
}
function angularHtmlFallbackMiddleware(req, res, next) {
    // Similar to how it is handled in vite
    // https://github.com/vitejs/vite/blob/main/packages/vite/src/node/server/middlewares/htmlFallback.ts#L15C19-L15C45
    if ((req.method === 'GET' || req.method === 'HEAD') &&
        (!req.url || !lookupMimeTypeFromRequest(req.url)) &&
        (!req.headers.accept ||
            req.headers.accept.includes('text/html') ||
            req.headers.accept.includes('text/*') ||
            req.headers.accept.includes('*/*'))) {
        req.url = '/index.html';
    }
    next();
}
function lookupMimeTypeFromRequest(url) {
    const extension = (0, node_path_1.extname)(url.split('?')[0]);
    if (extension === '.ico') {
        return 'image/x-icon';
    }
    return extension && (0, mrmime_1.lookup)(extension);
}
