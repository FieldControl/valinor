"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAngularSSRMiddleware = createAngularSSRMiddleware;
const render_page_1 = require("../../../utils/server-rendering/render-page");
const utils_1 = require("../utils");
function createAngularSSRMiddleware(server, outputFiles, indexHtmlTransformer) {
    return function (req, res, next) {
        const url = req.originalUrl;
        if (!req.url ||
            // Skip if path is not defined.
            !url ||
            // Skip if path is like a file.
            // NOTE: We use a mime type lookup to mitigate against matching requests like: /browse/pl.0ef59752c0cd457dbf1391f08cbd936f
            (0, utils_1.lookupMimeTypeFromRequest)(url)) {
            next();
            return;
        }
        const rawHtml = outputFiles.get('/index.server.html')?.contents;
        if (!rawHtml) {
            next();
            return;
        }
        server
            .transformIndexHtml(req.url, Buffer.from(rawHtml).toString('utf-8'))
            .then(async (processedHtml) => {
            const resolvedUrls = server.resolvedUrls;
            const baseUrl = resolvedUrls?.local[0] ?? resolvedUrls?.network[0];
            if (indexHtmlTransformer) {
                processedHtml = await indexHtmlTransformer(processedHtml);
            }
            const { content: ssrContent } = await (0, render_page_1.renderPage)({
                document: processedHtml,
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
            res.setHeader('Content-Type', 'text/html');
            res.setHeader('Cache-Control', 'no-cache');
            (0, utils_1.appendServerConfiguredHeaders)(server, res);
            res.end(ssrContent);
        })
            .catch((error) => next(error));
    };
}
