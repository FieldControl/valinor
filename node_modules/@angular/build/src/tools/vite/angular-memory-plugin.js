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
exports.createAngularMemoryPlugin = createAngularMemoryPlugin;
const remapping_1 = __importDefault(require("@ampproject/remapping"));
const node_assert_1 = __importDefault(require("node:assert"));
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
const middlewares_1 = require("./middlewares");
function createAngularMemoryPlugin(options) {
    const { workspaceRoot, virtualProjectRoot, outputFiles, assets, external, ssr, extensionMiddleware, indexHtmlTransformer, normalizePath, } = options;
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
            if (importer && source[0] === '.' && normalizePath(importer).startsWith(virtualProjectRoot)) {
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
        load(id) {
            const [file] = id.split('?', 1);
            const relativeFile = '/' + normalizePath((0, node_path_1.relative)(virtualProjectRoot, file));
            const codeContents = outputFiles.get(relativeFile)?.contents;
            if (codeContents === undefined) {
                return relativeFile.endsWith('/node_modules/vite/dist/client/client.mjs')
                    ? loadViteClientCode(file)
                    : undefined;
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
            server.middlewares.use((0, middlewares_1.createAngularAssetsMiddleware)(server, assets, outputFiles));
            if (extensionMiddleware?.length) {
                extensionMiddleware.forEach((middleware) => server.middlewares.use(middleware));
            }
            // Returning a function, installs middleware after the main transform middleware but
            // before the built-in HTML middleware
            return () => {
                server.middlewares.use(middlewares_1.angularHtmlFallbackMiddleware);
                if (ssr) {
                    server.middlewares.use((0, middlewares_1.createAngularSSRMiddleware)(server, outputFiles, indexHtmlTransformer));
                }
                server.middlewares.use((0, middlewares_1.createAngularIndexHtmlMiddleware)(server, outputFiles, indexHtmlTransformer));
            };
        },
    };
}
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
    const updatedContents = originalContents.replace(`"You can also disable this overlay by setting ",
      h("code", { part: "config-option-name" }, "server.hmr.overlay"),
      " to ",
      h("code", { part: "config-option-value" }, "false"),
      " in ",
      h("code", { part: "config-file-name" }, hmrConfigName),
      "."`, '');
    (0, node_assert_1.default)(originalContents !== updatedContents, 'Failed to update Vite client error overlay text.');
    return updatedContents;
}
