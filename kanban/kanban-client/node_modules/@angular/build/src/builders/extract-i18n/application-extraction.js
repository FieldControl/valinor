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
exports.extractMessages = void 0;
const node_assert_1 = __importDefault(require("node:assert"));
const node_path_1 = __importDefault(require("node:path"));
const application_1 = require("../application");
async function extractMessages(options, builderName, context, extractorConstructor, extensions) {
    const messages = [];
    // Setup the build options for the application based on the buildTarget option
    const buildOptions = (await context.validateOptions(await context.getTargetOptions(options.buildTarget), builderName));
    buildOptions.optimization = false;
    buildOptions.sourceMap = { scripts: true, vendor: true, styles: false };
    buildOptions.localize = false;
    buildOptions.budgets = undefined;
    buildOptions.index = false;
    buildOptions.serviceWorker = false;
    buildOptions.ssr = false;
    buildOptions.appShell = false;
    buildOptions.prerender = false;
    // Build the application with the build options
    let builderResult;
    try {
        for await (const result of (0, application_1.buildApplicationInternal)(buildOptions, context, { write: false }, extensions)) {
            builderResult = result;
            break;
        }
        (0, node_assert_1.default)(builderResult !== undefined, 'Application builder did not provide a result.');
    }
    catch (err) {
        builderResult = {
            success: false,
            error: err.message,
        };
    }
    // Extract messages from each output JavaScript file.
    // Output files are only present on a successful build.
    if (builderResult.outputFiles) {
        // Store the JS and JS map files for lookup during extraction
        const files = new Map();
        for (const outputFile of builderResult.outputFiles) {
            if (outputFile.path.endsWith('.js')) {
                files.set(outputFile.path, outputFile.text);
            }
            else if (outputFile.path.endsWith('.js.map')) {
                files.set(outputFile.path, outputFile.text);
            }
        }
        // Setup the localize message extractor based on the in-memory files
        const extractor = setupLocalizeExtractor(extractorConstructor, files, context);
        // Attempt extraction of all output JS files
        for (const filePath of files.keys()) {
            if (!filePath.endsWith('.js')) {
                continue;
            }
            const fileMessages = extractor.extractMessages(filePath);
            messages.push(...fileMessages);
        }
    }
    return {
        builderResult,
        basePath: context.workspaceRoot,
        messages,
        // Legacy i18n identifiers are not supported with the new application builder
        useLegacyIds: false,
    };
}
exports.extractMessages = extractMessages;
function setupLocalizeExtractor(extractorConstructor, files, context) {
    // Setup a virtual file system instance for the extractor
    // * MessageExtractor itself uses readFile, relative and resolve
    // * Internal SourceFileLoader (sourcemap support) uses dirname, exists, readFile, and resolve
    const filesystem = {
        readFile(path) {
            // Output files are stored as relative to the workspace root
            const requestedPath = node_path_1.default.relative(context.workspaceRoot, path);
            const content = files.get(requestedPath);
            if (content === undefined) {
                throw new Error('Unknown file requested: ' + requestedPath);
            }
            return content;
        },
        relative(from, to) {
            return node_path_1.default.relative(from, to);
        },
        resolve(...paths) {
            return node_path_1.default.resolve(...paths);
        },
        exists(path) {
            // Output files are stored as relative to the workspace root
            const requestedPath = node_path_1.default.relative(context.workspaceRoot, path);
            return files.has(requestedPath);
        },
        dirname(path) {
            return node_path_1.default.dirname(path);
        },
    };
    const logger = {
        // level 2 is warnings
        level: 2,
        debug(...args) {
            // eslint-disable-next-line no-console
            console.debug(...args);
        },
        info(...args) {
            context.logger.info(args.join(''));
        },
        warn(...args) {
            context.logger.warn(args.join(''));
        },
        error(...args) {
            context.logger.error(args.join(''));
        },
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const extractor = new extractorConstructor(filesystem, logger, {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        basePath: context.workspaceRoot,
        useSourceMaps: true,
    });
    return extractor;
}
