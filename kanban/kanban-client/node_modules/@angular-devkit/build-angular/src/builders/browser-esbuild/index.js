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
exports.buildEsbuildBrowser = void 0;
const private_1 = require("@angular/build/private");
const architect_1 = require("@angular-devkit/architect");
const promises_1 = __importDefault(require("node:fs/promises"));
const node_path_1 = __importDefault(require("node:path"));
const builder_status_warnings_1 = require("./builder-status-warnings");
/**
 * Main execution function for the esbuild-based application builder.
 * The options are compatible with the Webpack-based builder.
 * @param userOptions The browser builder options to use when setting up the application build
 * @param context The Architect builder context object
 * @returns An async iterable with the builder result output
 */
async function* buildEsbuildBrowser(userOptions, context, infrastructureSettings, plugins) {
    // Inform user of status of builder and options
    (0, builder_status_warnings_1.logBuilderStatusWarnings)(userOptions, context);
    const normalizedOptions = normalizeOptions(userOptions);
    const { deleteOutputPath, outputPath } = normalizedOptions;
    const fullOutputPath = node_path_1.default.join(context.workspaceRoot, outputPath.base);
    if (deleteOutputPath && infrastructureSettings?.write !== false) {
        await (0, private_1.deleteOutputDir)(context.workspaceRoot, outputPath.base);
    }
    for await (const result of (0, private_1.buildApplicationInternal)(normalizedOptions, context, {
        write: false,
    }, plugins && { codePlugins: plugins })) {
        if (infrastructureSettings?.write !== false && result.outputFiles) {
            // Write output files
            await writeResultFiles(result.outputFiles, result.assetFiles, fullOutputPath);
        }
        // The builder system (architect) currently attempts to treat all results as JSON and
        // attempts to validate the object with a JSON schema validator. This can lead to slow
        // build completion (even after the actual build is fully complete) or crashes if the
        // size and/or quantity of output files is large. Architect only requires a `success`
        // property so that is all that will be passed here if the infrastructure settings have
        // not been explicitly set to avoid writes. Writing is only disabled when used directly
        // by the dev server which bypasses the architect behavior.
        const builderResult = infrastructureSettings?.write === false ? result : { success: result.success };
        yield builderResult;
    }
}
exports.buildEsbuildBrowser = buildEsbuildBrowser;
function normalizeOptions(options) {
    const { main: browser, outputPath, ngswConfigPath, serviceWorker, polyfills, ...otherOptions } = options;
    return {
        browser,
        serviceWorker: serviceWorker ? ngswConfigPath : false,
        polyfills: typeof polyfills === 'string' ? [polyfills] : polyfills,
        outputPath: {
            base: outputPath,
            browser: '',
        },
        ...otherOptions,
    };
}
// We write the file directly from this builder to maintain webpack output compatibility
// and not output browser files into '/browser'.
async function writeResultFiles(outputFiles, assetFiles, outputPath) {
    const directoryExists = new Set();
    const ensureDirectoryExists = async (basePath) => {
        if (basePath && !directoryExists.has(basePath)) {
            await promises_1.default.mkdir(node_path_1.default.join(outputPath, basePath), { recursive: true });
            directoryExists.add(basePath);
        }
    };
    // Writes the output file to disk and ensures the containing directories are present
    await (0, private_1.emitFilesToDisk)(outputFiles, async (file) => {
        // Ensure output subdirectories exist
        const basePath = node_path_1.default.dirname(file.path);
        await ensureDirectoryExists(basePath);
        // Write file contents
        await promises_1.default.writeFile(node_path_1.default.join(outputPath, file.path), file.contents);
    });
    if (assetFiles?.length) {
        await (0, private_1.emitFilesToDisk)(assetFiles, async ({ source, destination }) => {
            const basePath = node_path_1.default.dirname(destination);
            // Ensure output subdirectories exist
            await ensureDirectoryExists(basePath);
            // Copy file contents
            await promises_1.default.copyFile(source, node_path_1.default.join(outputPath, destination), promises_1.default.constants.COPYFILE_FICLONE);
        });
    }
}
exports.default = (0, architect_1.createBuilder)(buildEsbuildBrowser);
